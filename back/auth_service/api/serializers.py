"""Serializers"""

import os
import requests

from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, Address



# API Key Google stockée en variable d'environnement
GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def get_google_address(raw_address):
    """
    Convert a raw, unformatted address into a structured address
    using Google Places & Geocoding API.
    """
    if not GOOGLE_API_KEY:
        raise ValueError(
            "Google Maps API key is missing. Set GOOGLE_MAPS_API_KEY in your environment."
            )

    places_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    places_params = {
        "input": raw_address,
        "key": GOOGLE_API_KEY,
        "types": "address",
        "language": "fr",
    }
    places_response = requests.get(places_url, params=places_params, timeout=10)
    places_data = places_response.json()

    if not places_data.get("predictions"):
        return None  # Adresse non reconnue

    place_id = places_data["predictions"][0]["place_id"]

    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
    geocode_params = {
        "place_id": place_id,
        "key": GOOGLE_API_KEY,
    }
    geocode_response = requests.get(geocode_url, params=geocode_params, timeout=10)
    geocode_data = geocode_response.json()

    if not geocode_data.get("results"):
        return None  # Impossible de récupérer les détails

    address_data = geocode_data["results"][0]
    components = {
        comp["types"][0]: comp["long_name"] for comp in address_data["address_components"]
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
    """Serializer for the Address model."""

    class Meta:
        """Meta class for the AddressSerializer."""
        model = Address
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""

    raw_address = serializers.CharField(write_only=True, required=False)  # Input brut
    address_details = AddressSerializer(
        read_only=True, source="address"
    )  # Output formatée si reconnue
    password = serializers.CharField(
        write_only=True, required=True
    )  # ✅ Make password required and write-only

    class Meta:
        """Meta class for the UserSerializer."""

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
            "timezone",
            "subscription_plan",
            "is_verified",
            "is_active",
            "is_banned",
            "is_staff",
            "last_login",
            "date_joined",
            "raw_address",
            "address_details",
            "password",  # ✅ Include password explicitly
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """Créer un nouvel utilisateur avec une gestion correcte du mot de passe."""
        raw_address = validated_data.pop("raw_address", None)
        password = validated_data.pop(
            "password"
        )  # ✅ Extract password before user creation

        user = User(**validated_data)  # ✅ Create user instance without saving
        user.set_password(password)  # ✅ Hash password before saving
        user.save()  # ✅ Save after password is set

        if raw_address:
            formatted_address = get_google_address(raw_address)
            if formatted_address:
                address_instance, _ = Address.objects.get_or_create(
                    place_id=formatted_address["place_id"], defaults=formatted_address
                )
                user.address = address_instance
            else:
                user.raw_address = raw_address

        user.save()
        return user

    def update(self, instance, validated_data):
        """Mettre à jour un utilisateur avec gestion d'adresse améliorée."""
        raw_address = validated_data.pop("raw_address", None)

        if raw_address:
            formatted_address = get_google_address(raw_address)
            if formatted_address:
                # Si l'adresse est reconnue par Google, on l'enregistre dans Address
                address_instance, _ = Address.objects.get_or_create(
                    place_id=formatted_address["place_id"], defaults=formatted_address
                )
                instance.address = address_instance
                instance.raw_address = (
                    None  # On supprime l'ancienne adresse brute si elle existait
                )
            else:
                # Si Google ne reconnaît pas l'adresse, on ne touche pas
                # `address` et on stocke en brut
                instance.raw_address = raw_address

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


User = get_user_model()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for the ChangePasswordView."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        """Validate the new password."""
        validate_password(value)
        return value

    def validate(self, attrs):
        """Validate the serializer data."""
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": "Credentials do not match.",
                }
            )
        return attrs




class ResetPasswordConfirmSerializer(serializers.Serializer):
    """Serializer to validate the reset token and set a new password."""

    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate the reset token and update the password."""
        try:
            user = User.objects.get(reset_password_token=attrs["token"])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"token": "Invalid or expired token."}) from exc

        if user.reset_token_expiry < now():
            raise serializers.ValidationError({"token": "Token has expired."})

        user.set_password(attrs["new_password"])
        user.reset_password_token = None
        user.reset_token_expiry = None
        user.save()

        return {"message": "Password successfully reset."}
