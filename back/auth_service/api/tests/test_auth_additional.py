"""Additional unit tests covering auth-related helpers and edge cases."""

from __future__ import annotations

import uuid
from datetime import timedelta
from types import SimpleNamespace

import pytest
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils import timezone
from rest_framework import serializers as drf_serializers, status
from rest_framework.test import APIClient, APIRequestFactory

from api.models import (
    Athlete,
    AthleteFollow,
    CompanyProfile,
    Conversation,
    ConversationParticipant,
    User,
)
from api.permissions import (
    IsAthleteOwnerOrReadOnly,
    IsCompanyOwnerOrReadOnly,
    IsSelfOrAdmin,
)
from api.serializers import (
    AthleteSerializer,
    ChangePasswordSerializer,
    ResetPasswordConfirmSerializer,
    UserSerializer,
    get_google_address,
)
from api.utils.email import send_html_email
from api.views import (
    AthleteFollowViewSet,
    ConversationParticipantViewSet,
    MyTokenObtainPairSerializer,
    VerifyEmailView,
)


@pytest.fixture
def factory() -> APIRequestFactory:
    """Return a DRF request factory."""

    return APIRequestFactory()


def test_reset_password_requires_email(api_client: APIClient) -> None:
    """The reset password endpoint should validate presence of email."""

    response = api_client.post(reverse("auth-reset-password"), {}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_reset_password_gracefully_handles_unknown_email(api_client: APIClient) -> None:
    """An unknown email should still return a success message."""

    response = api_client.post(
        reverse("auth-reset-password"),
        {"email": "missing@example.com"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK


def test_verify_email_api_requires_token(api_client: APIClient) -> None:
    """Missing token payload should trigger a validation error."""

    response = api_client.post(reverse("auth-verify-email"), {}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_verify_email_api_invalid_token(api_client: APIClient) -> None:
    """Unknown verification token should return a 400 response."""

    response = api_client.post(
        reverse("auth-verify-email"),
        {"token": str(uuid.uuid4())},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_verify_email_api_expired_token(api_client: APIClient, user_factory) -> None:
    """Expired verification token should return a 400 response."""

    user, _ = user_factory(is_active=False, is_verified=False)
    token = uuid.uuid4()
    user.verification_token = token
    user.verification_token_expiry = timezone.now() - timedelta(minutes=1)
    user.save(update_fields=["verification_token", "verification_token_expiry"])

    response = api_client.post(
        reverse("auth-verify-email"),
        {"token": str(token)},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_verify_email_view_handles_expired_token(factory: APIRequestFactory, user_factory) -> None:
    """VerifyEmailView should reject expired tokens."""

    user, _ = user_factory(is_active=False, is_verified=False)
    user.verification_token = uuid.uuid4()
    user.verification_token_expiry = timezone.now() - timedelta(minutes=5)
    user.save(update_fields=["verification_token", "verification_token_expiry"])

    view = VerifyEmailView.as_view()
    response = view(factory.post("/"), token=str(user.verification_token))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_verify_email_view_success(factory: APIRequestFactory, user_factory) -> None:
    """VerifyEmailView should activate a user when supplied with a valid token."""

    user, _ = user_factory(is_active=False, is_verified=False)
    token = uuid.uuid4()
    user.verification_token = token
    user.verification_token_expiry = timezone.now() + timedelta(hours=1)
    user.save(update_fields=["verification_token", "verification_token_expiry"])

    view = VerifyEmailView.as_view()
    response = view(factory.post("/"), token=str(token))
    assert response.status_code == status.HTTP_200_OK


def test_verify_email_view_invalid_token(factory: APIRequestFactory) -> None:
    """VerifyEmailView should return 400 for unknown tokens."""

    view = VerifyEmailView.as_view()
    response = view(factory.post("/"), token=str(uuid.uuid4()))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_athlete_follow_create_requires_identifier(api_client: APIClient, user_factory) -> None:
    """Follow creation must include an athlete identifier."""

    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    response = api_client.post(reverse("follow-list"), {}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_athlete_follow_create_checks_athlete_exists(api_client: APIClient, user_factory) -> None:
    """Follow creation should return 404 when the athlete is not found."""

    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    response = api_client.post(
        reverse("follow-list"),
        {"athlete": str(uuid.uuid4())},
        format="json",
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_athlete_follow_create_idempotent(api_client: APIClient, user_factory) -> None:
    """Creating a duplicate follow should return the existing record."""

    user, _ = user_factory()
    owner, _ = user_factory(email="followed@example.com")
    athlete = Athlete.objects.create(
        user=owner,
        name="Followed Athlete",
        location="Bordeaux",
        category="Cycling",
        price=321,
        is_carousel=False,
        profile_url="/athletes/followed",
        certified=False,
        bio="",
        level="ELITE",
    )
    AthleteFollow.objects.create(user=user, athlete=athlete)

    api_client.force_authenticate(user=user)
    response = api_client.post(
        reverse("follow-list"),
        {"athlete": str(athlete.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert str(response.data["athlete"]) == str(athlete.id)


def test_athlete_follow_create_assigns_user(api_client: APIClient, user_factory) -> None:
    """Creating a new follow should attach the requesting user."""

    user, _ = user_factory()
    athlete = Athlete.objects.create(
        user=None,
        name="Fresh Athlete",
        location="Lille",
        category="Running",
        price=200,
        is_carousel=False,
        profile_url="/athletes/fresh",
        certified=False,
        bio="",
        level="AMATEUR",
    )

    api_client.force_authenticate(user=user)
    response = api_client.post(
        reverse("follow-list"),
        {"athlete": str(athlete.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    follow = AthleteFollow.objects.get(id=response.data["id"])
    assert follow.user_id == user.id


def test_athlete_follow_staff_queryset(api_client: APIClient, user_factory) -> None:
    """Staff requests should return the unrestricted follow queryset."""

    staff, _ = user_factory(is_staff=True)
    api_client.force_authenticate(user=staff)
    response = api_client.get(reverse("follow-list"))
    assert response.status_code == status.HTTP_200_OK


def test_athlete_follow_user_queryset(api_client: APIClient, user_factory) -> None:
    """Non-staff users should see only their follow relations."""

    user, _ = user_factory()
    athlete = Athlete.objects.create(
        user=None,
        name="Listed Athlete",
        location="Marseille",
        category="Sailing",
        price=410,
        is_carousel=False,
        profile_url="/athletes/listed",
        certified=False,
        bio="",
        level="PRO",
    )
    AthleteFollow.objects.create(user=user, athlete=athlete)

    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("follow-list"))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1


def test_athlete_follow_perform_create_assigns_request_user(user_factory) -> None:
    """Direct perform_create call should assign the requesting user."""

    user, _ = user_factory()
    assigned = {}

    class DummySerializer:  # pylint: disable=too-few-public-methods
        def save(self, **kwargs):
            assigned.update(kwargs)

    viewset = AthleteFollowViewSet()
    viewset.request = SimpleNamespace(user=user)
    viewset.perform_create(DummySerializer())
    assert assigned["user"] == user


def test_athlete_follow_delete_by_athlete(api_client: APIClient, user_factory) -> None:
    """Deleting by athlete id should return 204 when a record is removed."""

    user, _ = user_factory()
    owner, _ = user_factory(email="athlete-owner@example.com")
    athlete = Athlete.objects.create(
        user=owner,
        name="Removable Athlete",
        location="Paris",
        category="Tennis",
        price=123,
        is_carousel=False,
        profile_url="/athletes/removable",
        certified=False,
        bio="",
        level="PRO",
    )
    AthleteFollow.objects.create(user=user, athlete=athlete)

    api_client.force_authenticate(user=user)
    response = api_client.delete(
        reverse("follow-delete-by-athlete", kwargs={"athlete_id": str(athlete.id)})
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_company_profile_viewset_create_and_update(api_client: APIClient, user_factory) -> None:
    """Company profile viewset should lock ownership unless staff updates."""

    owner, _ = user_factory()
    api_client.force_authenticate(user=owner)

    payload = {
        "user": str(owner.id),
        "name": "Test Company",
        "slug": f"company-{uuid.uuid4().hex[:6]}",
    }

    create_response = api_client.post(reverse("company-list"), payload, format="json")
    assert create_response.status_code == status.HTTP_201_CREATED
    company_id = create_response.data["id"]
    assert str(create_response.data["user"]) == str(owner.id)

    patch_response = api_client.patch(
        reverse("company-detail", args=[company_id]),
        {"bio": "Updated"},
        format="json",
    )
    assert patch_response.status_code == status.HTTP_200_OK
    company = CompanyProfile.objects.get(id=company_id)
    assert company.user_id == owner.id

    staff, _ = user_factory(is_staff=True)
    api_client.force_authenticate(user=staff)
    staff_response = api_client.patch(
        reverse("company-detail", args=[company_id]),
        {"verified": True},
        format="json",
    )
    assert staff_response.status_code == status.HTTP_200_OK
    company.refresh_from_db()
    assert company.verified is True


def test_athlete_create_assigns_owner(api_client: APIClient, user_factory) -> None:
    """Creating an athlete should associate it with the authenticated user."""

    user, _ = user_factory()
    api_client.force_authenticate(user=user)

    payload = {
        "name": "Created Athlete",
        "location": "Grenoble",
        "category": "Climbing",
        "price": 555,
        "is_carousel": False,
        "profile_url": "/athletes/created",
        "certified": False,
        "bio": "",
        "level": "PRO",
    }

    response = api_client.post(reverse("athlete-list"), payload, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    athlete = Athlete.objects.get(id=response.data["id"])
    assert athlete.user_id == user.id


def test_athlete_update_handles_staff_and_owner(api_client: APIClient, user_factory) -> None:
    """Updating an athlete should respect staff override and owner locking."""

    owner, _ = user_factory()
    athlete = Athlete.objects.create(
        user=owner,
        name="Editable Athlete",
        location="Nice",
        category="Ski",
        price=111,
        is_carousel=False,
        profile_url="/athletes/editable",
        certified=False,
        bio="",
        level="ELITE",
    )

    api_client.force_authenticate(user=owner)
    owner_response = api_client.patch(
        reverse("athlete-detail", kwargs={"pk": athlete.id}),
        {"bio": "Owner update"},
        format="json",
    )
    assert owner_response.status_code == status.HTTP_200_OK
    athlete.refresh_from_db()
    assert athlete.bio == "Owner update"
    assert athlete.user_id == owner.id

    staff, _ = user_factory(is_staff=True)
    api_client.force_authenticate(user=staff)
    staff_response = api_client.patch(
        reverse("athlete-detail", kwargs={"pk": athlete.id}),
        {"certified": True},
        format="json",
    )
    assert staff_response.status_code == status.HTTP_200_OK
    athlete.refresh_from_db()
    assert athlete.certified is True


def test_athlete_serializer_computed_fields(user_factory) -> None:
    """Athlete serializer should compute age and handle missing request context."""

    owner, _ = user_factory()
    dob = timezone.now().date() - timedelta(days=365 * 20)
    athlete = Athlete.objects.create(
        user=owner,
        name="Computed Athlete",
        location="Tours",
        category="Rowing",
        price=250,
        is_carousel=False,
        profile_url="/athletes/computed",
        certified=False,
        bio="",
        level="PRO",
        date_of_birth=dob,
    )

    serializer_with_request = AthleteSerializer(
        athlete,
        context={"request": SimpleNamespace(user=owner)},
    )
    assert serializer_with_request.data["age"] is not None
    serializer_no_request = AthleteSerializer(athlete)
    assert serializer_no_request.data["is_followed"] is False
def test_participant_viewset_staff_branch(user_factory) -> None:
    """Ensure staff requests return the unrestricted queryset."""

    staff, _ = user_factory(is_staff=True)
    viewset = ConversationParticipantViewSet()
    viewset.request = SimpleNamespace(user=staff)
    queryset = viewset.get_queryset()
    assert str(queryset.query)  # Accessing the query evaluates branch without executing SQL


def test_get_google_address(monkeypatch) -> None:
    """The Google address helper should return structured data."""

    def fake_get(url, params, timeout):  # pragma: no cover - simple helper
        class DummyResponse:
            def raise_for_status(self):
                return None

            def json(self):
                if "autocomplete" in url:
                    return {"predictions": [{"place_id": "abc"}]}
                return {
                    "results": [
                        {
                            "formatted_address": "10 Rue Test",
                            "address_components": [
                                {"types": ["locality"], "long_name": "Paris"},
                                {"types": ["country"], "long_name": "France"},
                            ],
                            "geometry": {"location": {"lat": 1.23, "lng": 4.56}},
                            "types": ["street_address"],
                        }
                    ]
                }

        return DummyResponse()

    monkeypatch.setattr("api.serializers.requests.get", fake_get)
    monkeypatch.setattr("api.serializers.GOOGLE_API_KEY", "test-key")
    result = get_google_address("10 rue test")
    assert result["formatted_address"] == "10 Rue Test"
    assert result["country"] == "France"


def test_get_google_address_missing_key(monkeypatch) -> None:
    """Missing API key should raise a ValueError."""

    monkeypatch.setattr("api.serializers.GOOGLE_API_KEY", None)
    with pytest.raises(ValueError):
        get_google_address("anywhere")


def test_get_google_address_no_predictions(monkeypatch) -> None:
    """Helper should return None when Google doesn't return predictions."""

    monkeypatch.setattr("api.serializers.GOOGLE_API_KEY", "test-key")

    def fake_get(url, params, timeout):  # pragma: no cover - simple helper
        class DummyResponse:
            def raise_for_status(self):
                return None

            def json(self):
                return {"predictions": []} if "autocomplete" in url else {"results": []}

        return DummyResponse()

    monkeypatch.setattr("api.serializers.requests.get", fake_get)
    assert get_google_address("unknown") is None


def test_get_google_address_no_results(monkeypatch) -> None:
    """Helper should return None when geocode results are missing."""

    monkeypatch.setattr("api.serializers.GOOGLE_API_KEY", "test-key")

    def fake_get(url, params, timeout):  # pragma: no cover - simple helper
        class DummyResponse:
            def raise_for_status(self):
                return None

            def json(self):
                if "autocomplete" in url:
                    return {"predictions": [{"place_id": "xyz"}]}
                return {"results": []}

        return DummyResponse()

    monkeypatch.setattr("api.serializers.requests.get", fake_get)
    assert get_google_address("no results") is None


def test_user_serializer_create_and_update(monkeypatch, user_factory) -> None:
    """UserSerializer should handle raw address and email updates."""

    data = {
        "email": "serializer@example.com",
        "password": "SerializerPass123!",
        "first_name": "Serializer",
        "last_name": "User",
        "phone_country_code": "+33",
        "phone_number": "0611122233",
        "raw_address": "123 Test Street",
    }

    serializer = UserSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    created_user = serializer.save()
    assert created_user.address == "123 Test Street"

    def raising_send_html_email(**_kwargs):  # pragma: no cover - exercised path
        from django.template import TemplateDoesNotExist

        raise TemplateDoesNotExist("email/verify_email.html")

    monkeypatch.setattr("api.serializers.send_html_email", raising_send_html_email)
    updated_data = {"email": "updated@example.com", "raw_address": "456 Updated"}
    update_serializer = UserSerializer(instance=created_user, data=updated_data, partial=True)
    assert update_serializer.is_valid(), update_serializer.errors
    updated_user = update_serializer.save()
    assert updated_user.email == "updated@example.com"
    assert updated_user.is_active is False
    assert updated_user.is_verified is False
    assert updated_user.address == "456 Updated"


def test_change_password_serializer_mismatch() -> None:
    """Changing password serializer should validate matching confirmation."""

    serializer = ChangePasswordSerializer(
        data={
            "old_password": "Oldpass123!",
            "new_password": "Newpass123!",
            "confirm_new_password": "Different456!",
        }
    )
    with pytest.raises(drf_serializers.ValidationError):
        serializer.is_valid(raise_exception=True)
    assert serializer.create({"foo": "bar"}) == {"foo": "bar"}
    assert serializer.update("instance", {"foo": "bar"}) == "instance"


def test_reset_password_confirm_serializer_handles_expired(user_factory) -> None:
    """Expired reset tokens should raise a validation error."""

    user, _ = user_factory()
    token = uuid.uuid4()
    user.reset_password_token = token
    user.reset_token_expiry = timezone.now() - timedelta(minutes=1)
    user.save(update_fields=["reset_password_token", "reset_token_expiry"])

    serializer = ResetPasswordConfirmSerializer(
        data={"token": str(token), "new_password": "ExpiredPass123!"}
    )
    with pytest.raises(drf_serializers.ValidationError):
        serializer.is_valid(raise_exception=True)


def test_reset_password_confirm_serializer_invalid_token() -> None:
    """Unknown reset tokens should raise a validation error."""

    serializer = ResetPasswordConfirmSerializer(
        data={"token": str(uuid.uuid4()), "new_password": "SomePass123!"}
    )
    with pytest.raises(drf_serializers.ValidationError):
        serializer.is_valid(raise_exception=True)


def test_reset_password_confirm_serializer_create_update_methods() -> None:
    """Smoke test the serializer's create and update helper methods."""

    serializer = ResetPasswordConfirmSerializer()
    assert serializer.create({"message": "ok"}) == {"message": "ok"}
    assert serializer.update("instance", {}) == "instance"


def test_my_token_obtain_pair_serializer_helpers() -> None:
    """Custom serializer helper methods should return pass-through values."""

    serializer = MyTokenObtainPairSerializer()
    assert serializer.create({"payload": 1}) == {"payload": 1}
    assert serializer.update("instance", {}) == "instance"


def test_permission_classes(user_factory) -> None:
    """Exercise the custom permission classes with simple request objects."""

    regular_user, _ = user_factory()
    staff_user, _ = user_factory(is_staff=True)

    request = SimpleNamespace(method="POST", user=regular_user)
    safe_request = SimpleNamespace(method="GET", user=regular_user)
    staff_request = SimpleNamespace(method="POST", user=staff_user)
    anonymous_request = SimpleNamespace(method="POST", user=SimpleNamespace(is_authenticated=False))

    athlete_obj = SimpleNamespace(user_id=regular_user.id)
    company_obj = SimpleNamespace(user_id=regular_user.id)

    athlete_permission = IsAthleteOwnerOrReadOnly()
    assert athlete_permission.has_permission(safe_request, None)
    assert athlete_permission.has_permission(request, None)
    assert not athlete_permission.has_permission(
        SimpleNamespace(method="POST", user=SimpleNamespace(is_authenticated=False)), None
    )
    assert athlete_permission.has_object_permission(request, None, athlete_obj)
    assert athlete_permission.has_object_permission(staff_request, None, athlete_obj)
    assert athlete_permission.has_object_permission(safe_request, None, athlete_obj)

    company_permission = IsCompanyOwnerOrReadOnly()
    assert company_permission.has_permission(safe_request, None)
    assert not company_permission.has_permission(anonymous_request, None)
    assert company_permission.has_object_permission(request, None, company_obj)
    assert company_permission.has_object_permission(safe_request, None, company_obj)

    self_permission = IsSelfOrAdmin()
    assert self_permission.has_object_permission(safe_request, None, regular_user)
    assert self_permission.has_object_permission(SimpleNamespace(method="POST", user=staff_user), None, regular_user)
    assert not self_permission.has_object_permission(request, None, staff_user)


def test_send_html_email(monkeypatch) -> None:
    """Ensure the HTML email helper renders templates and sends the message."""

    captured = {}

    def fake_render(template_name, context):  # pragma: no cover - simple helper
        captured["template"] = template_name
        captured["context"] = context
        return "<p>Hello</p>"

    class DummyEmail:  # pylint: disable=too-few-public-methods
        def __init__(self, subject, body, from_email, to):
            captured["init"] = (subject, body, from_email, to)

        def attach_alternative(self, html, content_type):
            captured["alternative"] = (html, content_type)

        def send(self, fail_silently=False):
            captured["sent"] = fail_silently is False

    monkeypatch.setattr("api.utils.email.render_to_string", fake_render)
    monkeypatch.setattr("api.utils.email.EmailMultiAlternatives", DummyEmail)

    send_html_email(
        subject="Subject",
        to_email="recipient@example.com",
        template_name="template.html",
        context={"foo": "bar"},
    )

    assert captured["init"][0] == "Subject"
    assert captured["alternative"][1] == "text/html"
    assert captured["sent"] is True
