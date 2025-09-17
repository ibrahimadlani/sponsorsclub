"""Serializers for the backend API."""

from __future__ import annotations

import logging
import os
import uuid
from datetime import date, timedelta
from smtplib import SMTPException
from typing import Any, Dict, Optional

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.template import TemplateDoesNotExist
from django.utils.timezone import now
from rest_framework import serializers

from .models import (
    ActivityEvent,
    Address,
    Athlete,
    AthleteFollow,
    AthleteImage,
    CompanyProfile,
    Conversation,
    ConversationParticipant,
    MediaAsset,
    Message,
    SocialStat,
    SportCategory,
)
from .utils.email import send_html_email

# API key stored in the environment so it can be overridden per deployment.
GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
LOGGER = logging.getLogger(__name__)
User = get_user_model()


def get_google_address(raw_address: str) -> Optional[Dict[str, Any]]:
    """Return structured address details from Google APIs.

    Args:
        raw_address (str): Free-form address supplied by the client.

    Returns:
        Optional[Dict[str, Any]]: Structured address information or ``None``
        when the service cannot resolve the address.

    Raises:
        ValueError: If the Google Maps API key is missing.
    """

    if not GOOGLE_API_KEY:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable.")

    places_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    places_params = {
        "input": raw_address,
        "key": GOOGLE_API_KEY,
        "types": "address",
        "language": "fr",
    }
    places_response = requests.get(places_url, params=places_params, timeout=10)
    places_response.raise_for_status()
    places_data = places_response.json()

    if not places_data.get("predictions"):
        return None

    place_id = places_data["predictions"][0]["place_id"]

    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
    geocode_params = {"place_id": place_id, "key": GOOGLE_API_KEY}
    geocode_response = requests.get(geocode_url, params=geocode_params, timeout=10)
    geocode_response.raise_for_status()
    geocode_data = geocode_response.json()

    if not geocode_data.get("results"):
        return None

    address_data = geocode_data["results"][0]
    components = {
        component["types"][0]: component["long_name"]
        for component in address_data["address_components"]
    }

    return {
        "formatted_address": address_data["formatted_address"],
        "street_number": components.get("street_number"),
        "route": components.get("route"),
        "locality": components.get("locality", components.get("postal_town")),
        "administrative_area_level_1": components.get("administrative_area_level_1"),
        "administrative_area_level_2": components.get("administrative_area_level_2"),
        "country": components.get("country"),
        "postal_code": components.get("postal_code"),
        "latitude": address_data["geometry"]["location"]["lat"],
        "longitude": address_data["geometry"]["location"]["lng"],
        "place_id": place_id,
        "types": ",".join(address_data["types"]),
    }


class AddressSerializer(serializers.ModelSerializer):
    """Serialize addresses stored in the platform."""

    class Meta:
        """Serializer configuration for address fields."""

        model = Address
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    """Serialize user accounts and handle password hashing logic."""

    raw_address = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        """Serializer configuration for user instances."""

        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_country_code",
            "phone_number",
            "date_of_birth",
            "gender",
            "profile_picture_url",
            "cover_photo_url",
            "bio",
            "country",
            "language",
            "currency",
            "timezone",
            "subscription_plan",
            "is_verified",
            "is_active",
            "is_banned",
            "is_staff",
            "last_login",
            "date_joined",
            "address",
            "raw_address",
            "password",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """Create a new user while hashing the password.

        Args:
            validated_data (dict[str, Any]): Data that already passed validation.

        Returns:
            User: Newly created user instance.
        """

        raw_address = validated_data.pop("raw_address", None)
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        if raw_address:
            user.address = raw_address
        user.save()
        return user

    def update(self, instance, validated_data):
        """Update a user, resetting verification when the email changes.

        Args:
            instance (User): Persisted user instance being updated.
            validated_data (dict[str, Any]): Sanitised payload.

        Returns:
            User: Updated user instance.
        """

        raw_address = validated_data.pop("raw_address", None)
        new_email = validated_data.get("email")
        email_changed = new_email is not None and new_email != instance.email

        if raw_address is not None:
            instance.address = raw_address

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if email_changed:
            instance.is_verified = False
            instance.is_active = False
            instance.verification_token = uuid.uuid4()
            instance.verification_token_expiry = now() + timedelta(hours=24)

        instance.save()

        if email_changed:
            base_site = getattr(settings, "BRAND_SITE_URL", "http://127.0.0.1:3000")
            verification_link = f"{base_site}/verify-email?token={instance.verification_token}"
            try:
                send_html_email(
                    subject="Confirmez votre nouvelle adresse e-mail",
                    to_email=instance.email,
                    template_name="email/verify_email.html",
                    context={
                        "first_name": instance.first_name or "",
                        "verification_link": verification_link,
                    },
                )
            except (
                TemplateDoesNotExist,
                SMTPException,
                ConnectionError,
                TimeoutError,
            ) as exc:  # pragma: no cover - logging side effect only
                LOGGER.exception(
                    "Failed to send verification email for user %s: %s",
                    instance.pk,
                    exc,
                )

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Validate payloads used to change the authenticated user's password."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        """Ensure the new password complies with configured validators.

        Args:
            value (str): Candidate password provided by the user.

        Returns:
            str: The validated password value.
        """

        validate_password(value)
        return value

    def validate(self, attrs):
        """Raise an error when the confirmation does not match.

        Args:
            attrs (dict[str, Any]): Serialised data to validate.

        Returns:
            dict[str, Any]: The validated attributes.

        Raises:
            serializers.ValidationError: When passwords do not match.
        """

        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError({"new_password": "Credentials do not match."})
        return attrs

    def create(self, validated_data):
        """Return validated data when the serializer is used in forms."""

        return validated_data

    def update(self, instance, validated_data):
        """Pass through update hook for interface completeness."""

        return instance


class ResetPasswordConfirmSerializer(serializers.Serializer):
    """Validate a password reset token and apply the new password."""

    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Ensure the token is valid before updating the user's password.

        Args:
            attrs (dict[str, Any]): Serialised reset payload.

        Returns:
            dict[str, str]: A success message when the password is updated.

        Raises:
            serializers.ValidationError: When the token is invalid or expired.
        """

        try:
            user = User.objects.get(reset_password_token=attrs["token"])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"token": "Invalid or expired token."}) from exc

        if user.reset_token_expiry and user.reset_token_expiry < now():
            raise serializers.ValidationError({"token": "Token has expired."})

        user.set_password(attrs["new_password"])
        user.reset_password_token = None
        user.reset_token_expiry = None
        user.save(update_fields=["password", "reset_password_token", "reset_token_expiry"])

        return {"message": "Password successfully reset."}

    def create(self, validated_data):
        """Return the validated payload since no instance is created."""

        return validated_data

    def update(self, instance, validated_data):
        """No update behaviour is required for this serializer."""

        return instance


# --- Athlete Serializer ---
class AthleteSerializer(serializers.ModelSerializer):
    """Expose public athlete profile details with derived metrics."""

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )
    age = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    recent_activity_count = serializers.SerializerMethodField()
    has_recent_activity = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()

    class Meta:
        """Serializer configuration for athlete instances."""

        model = Athlete
        fields = [
            "id",
            "user",
            "name",
            "location",
            "category",
            "price",
            "is_carousel",
            "profile_url",
            "certified",
            "bio",
            "level",
            "nationality",
            "date_of_birth",
            "age",
            "followers_count",
            "is_followed",
            "recent_activity_count",
            "has_recent_activity",
            "subscribers_facebook",
            "subscribers_instagram",
            "subscribers_youtube",
            "image1",
            "image2",
            "image3",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_age(self, obj):
        """Return the athlete age in years when the birth date is known."""

        dob = getattr(obj, "date_of_birth", None)
        if not dob:
            return None
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def get_followers_count(self, obj):
        """Return the number of user follows for the athlete profile."""

        return AthleteFollow.objects.filter(athlete=obj).count()

    def get_is_followed(self, obj):
        """Return True when the requesting user follows the athlete."""

        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None
        if not user or not user.is_authenticated:
            return False
        return AthleteFollow.objects.filter(user=user, athlete=obj).exists()

    def get_recent_activity_count(self, obj):
        """Return the number of activity events recorded in the last week."""

        since = now() - timedelta(days=7)
        return ActivityEvent.objects.filter(athlete=obj, happened_at__gte=since).count()

    def get_has_recent_activity(self, obj):
        """Return True when the athlete has posted something recently."""

        return bool(self.get_recent_activity_count(obj))


# --- Additional Serializers for MVP models ---


class SportCategorySerializer(serializers.ModelSerializer):
    """Serialize sport category metadata."""

    class Meta:
        """Serializer configuration for sport categories."""

        model = SportCategory
        fields = ["id", "name", "slug", "emoji", "created_at"]
        read_only_fields = ["id", "created_at"]


class MediaAssetSerializer(serializers.ModelSerializer):
    """Serialize stored media assets."""

    class Meta:
        """Serializer configuration for media assets."""

        model = MediaAsset
        fields = ["id", "url", "alt_text", "created_at"]
        read_only_fields = ["id", "created_at"]


class AthleteImageSerializer(serializers.ModelSerializer):
    """Serialize ordered media references for an athlete."""

    class Meta:
        """Serializer configuration for athlete image resources."""

        model = AthleteImage
        fields = ["id", "athlete", "media", "order"]
        read_only_fields = ["id"]


class SocialStatSerializer(serializers.ModelSerializer):
    """Serialize per-platform follower metrics."""

    class Meta:
        """Serializer configuration for athlete social statistics."""

        model = SocialStat
        fields = [
            "id",
            "athlete",
            "platform",
            "followers",
            "username",
            "profile_url",
            "last_updated",
        ]
        read_only_fields = ["id", "last_updated"]


class CompanyProfileSerializer(serializers.ModelSerializer):
    """Serialize company profiles attached to user accounts."""

    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        """Serializer configuration for company profiles."""

        model = CompanyProfile
        fields = [
            "id",
            "user",
            "name",
            "slug",
            "website",
            "bio",
            "verified",
            "logo_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AthleteFollowSerializer(serializers.ModelSerializer):
    """Serialize follow relationships and include athlete detail."""

    athlete_obj = AthleteSerializer(source="athlete", read_only=True)

    class Meta:
        """Serializer configuration for follow relations."""

        model = AthleteFollow
        fields = ["id", "user", "athlete", "athlete_obj", "created_at"]
        read_only_fields = ["id", "created_at", "user", "athlete_obj"]


class ActivityEventSerializer(serializers.ModelSerializer):
    """Serialize athlete activity feed events."""

    class Meta:
        """Serializer configuration for activity events."""

        model = ActivityEvent
        fields = [
            "id",
            "athlete",
            "type",
            "text",
            "images",
            "platform",
            "happened_at",
            "created_at",
            "competition_title",
            "competition_location",
            "competition_date",
            "competition_result",
            "followers_delta",
            "followers_note",
            "trophy_title",
            "trophy_award",
        ]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    """Serialize conversation threads."""

    class Meta:
        """Serializer configuration for conversations."""

        model = Conversation
        fields = ["id", "topic", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ConversationParticipantSerializer(serializers.ModelSerializer):
    """Serialize conversation participant metadata."""

    class Meta:
        """Serializer configuration for conversation participants."""

        model = ConversationParticipant
        fields = [
            "id",
            "conversation",
            "user",
            "unread_count",
            "is_muted",
            "joined_at",
        ]
        read_only_fields = ["id", "joined_at"]


class MessageSerializer(serializers.ModelSerializer):
    """Serialize individual messages within a conversation."""

    class Meta:
        """Serializer configuration for conversation messages."""

        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "text",
            "attachments",
            "created_at",
            "read_by",
        ]
        read_only_fields = ["id", "created_at"]
