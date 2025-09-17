"""Integration tests for the authentication-related API endpoints."""

from __future__ import annotations

import uuid
from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from api.models import (
    ActivityEvent,
    Athlete,
    AthleteFollow,
    CompanyProfile,
    Conversation,
    ConversationParticipant,
    Message,
    User,
)


def test_login_returns_tokens(api_client, user_factory):
    """Login should return a valid access/refresh token pair."""

    user, password = user_factory()

    response = api_client.post(
        reverse("auth-login"),
        {"email": user.email, "password": password},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


def test_register_creates_inactive_user(monkeypatch, api_client):
    """Register endpoint should create an inactive user and send verification email."""

    sent_email = {}

    def fake_send_html_email(**kwargs):  # pragma: no cover - simple recorder
        sent_email.update(kwargs)

    monkeypatch.setattr("api.views.send_html_email", fake_send_html_email)

    payload = {
        "email": "new-user@example.com",
        "password": "RegisterPass123!",
        "first_name": "New",
        "last_name": "User",
        "phone_country_code": "+33",
        "phone_number": "0612345678",
    }

    response = api_client.post(reverse("auth-register"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    created_user = User.objects.get(email=payload["email"])
    assert created_user.is_active is False
    assert created_user.is_verified is False
    assert created_user.verification_token is not None
    assert sent_email["to_email"] == payload["email"]


def test_verify_email_endpoint(api_client, user_factory):
    """Verify email endpoint should activate a user when the token is valid."""

    token = uuid.uuid4()
    user, _ = user_factory(is_active=False, is_verified=False)
    user.verification_token = token
    user.verification_token_expiry = timezone.now() + timedelta(hours=1)
    user.save(update_fields=["verification_token", "verification_token_expiry"])

    response = api_client.post(
        reverse("auth-verify-email"),
        {"token": str(token)},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.is_active is True
    assert user.is_verified is True


def test_me_endpoint_requires_authentication(api_client, user_factory):
    """The profile endpoint should require authentication."""

    response = api_client.get(reverse("auth-me"))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("auth-me"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["email"] == user.email


def test_change_password_success(api_client, user_factory):
    """Changing the password should succeed when the old password matches."""

    user, password = user_factory()
    api_client.force_authenticate(user=user)

    new_password = "NewPassword456!"
    response = api_client.post(
        reverse("auth-change-password"),
        {
            "old_password": password,
            "new_password": new_password,
            "confirm_new_password": new_password,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.check_password(new_password)


def test_change_password_rejects_bad_old_password(api_client, user_factory):
    """Changing the password should fail when the old password is incorrect."""

    user, password = user_factory()
    api_client.force_authenticate(user=user)

    response = api_client.post(
        reverse("auth-change-password"),
        {
            "old_password": "WrongPassword1!",
            "new_password": "NewPassword456!",
            "confirm_new_password": "NewPassword456!",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    user.refresh_from_db()
    assert user.check_password(password)


def test_reset_password_flow(monkeypatch, api_client, user_factory):
    """Reset password flow should generate a token and accept new credentials."""

    user, _ = user_factory()
    sent_email = {}

    def fake_send_html_email(**kwargs):  # pragma: no cover - simple recorder
        sent_email.update(kwargs)

    monkeypatch.setattr("api.views.send_html_email", fake_send_html_email)

    response = api_client.post(
        reverse("auth-reset-password"),
        {"email": user.email},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.reset_password_token is not None
    assert "reset_link" in sent_email["context"]

    new_password = "ResetPass789!"
    response = api_client.post(
        reverse("auth-reset-password-confirm"),
        {
            "token": str(user.reset_password_token),
            "new_password": new_password,
        },
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.check_password(new_password)
    assert user.reset_password_token is None
    assert user.reset_token_expiry is None


def test_update_preferences_allows_partial_updates(api_client, user_factory):
    """Authenticated users should be able to update their preferences."""

    user, _ = user_factory(language="fr", currency="EUR", timezone="Europe/Paris")
    api_client.force_authenticate(user=user)

    response = api_client.patch(
        reverse("auth-preferences"),
        {"language": "en", "timezone": "UTC"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.language == "en"
    assert user.timezone == "UTC"


def test_update_preferences_post(api_client, user_factory):
    """POST requests should reuse the shared update logic."""

    user, _ = user_factory(language="fr", currency="EUR", timezone="Europe/Paris")
    api_client.force_authenticate(user=user)

    response = api_client.post(
        reverse("auth-preferences"),
        {"currency": "USD"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.currency == "USD"


def test_user_list_requires_admin(api_client, user_factory):
    """Only admin users should access the user list endpoint."""

    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    assert api_client.get(reverse("user-list")).status_code == status.HTTP_403_FORBIDDEN

    admin, _ = user_factory(is_staff=True, is_superuser=True)
    api_client.force_authenticate(user=admin)
    response = api_client.get(reverse("user-list"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] >= 1


def test_followed_athletes_endpoint(api_client, user_factory):
    """Ensure followed athletes are returned for an authenticated user."""

    user, _ = user_factory()
    athlete_owner, _ = user_factory(email="athlete-owner@example.com")
    athlete = Athlete.objects.create(
        user=athlete_owner,
        name="Jane Doe",
        location="Paris, France",
        category="Tennis",
        price=1000,
        is_carousel=False,
        profile_url="/athletes/jane-doe",
        certified=True,
        bio="Top player",
        level="PRO",
    )
    AthleteFollow.objects.create(user=user, athlete=athlete)

    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("followed-athletes"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == str(athlete.id)


def test_right_to_erasure_anonymises_user(api_client, user_factory):
    """Right to erasure should anonymise athlete profile and delete the user."""

    user, _ = user_factory()
    athlete = Athlete.objects.create(
        user=user,
        name="Sensitive Athlete",
        location="Lyon, France",
        category="Running",
        price=2000,
        is_carousel=False,
        profile_url="/athletes/sensitive",
        certified=True,
        bio="Private bio",
        level="PRO",
    )
    CompanyProfile.objects.create(
        user=user,
        name="Sensitive Corp",
        slug=f"corp-{uuid.uuid4().hex[:8]}",
    )

    api_client.force_authenticate(user=user)
    response = api_client.post(reverse("privacy-erase"))

    assert response.status_code == status.HTTP_200_OK
    assert not User.objects.filter(id=user.id).exists()
    athlete.refresh_from_db()
    assert athlete.user is None
    assert athlete.name == "Profil supprimé"


def test_conversation_related_endpoints_require_authentication(api_client, user_factory):
    """Minimal smoke test for conversation related viewsets tied to auth."""

    user, _ = user_factory()
    other, _ = user_factory(email="second@example.com")
    conversation = Conversation.objects.create(topic="Demo")
    ConversationParticipant.objects.create(conversation=conversation, user=user)
    ConversationParticipant.objects.create(conversation=conversation, user=other)
    Message.objects.create(conversation=conversation, sender=user, text="Hello")
    ActivityEvent.objects.create(
        athlete=Athlete.objects.create(
            user=None,
            name="Feed Athlete",
            location="Nice, France",
            category="Surf",
            price=1500,
            is_carousel=False,
            profile_url="/athletes/feed",
            certified=False,
            bio="",
            level="AMATEUR",
        ),
        type="post",
        text="Great news!",
        happened_at=timezone.now(),
    )

    api_client.force_authenticate(user=user)
    conversations = api_client.get(reverse("conversation-list"))
    messages = api_client.get(reverse("message-list"))
    participants = api_client.get(reverse("participant-list"))
    activities = api_client.get(reverse("activity-list"))

    assert conversations.status_code == status.HTTP_200_OK
    assert messages.status_code == status.HTTP_200_OK
    assert participants.status_code == status.HTTP_200_OK
    assert activities.status_code == status.HTTP_200_OK
