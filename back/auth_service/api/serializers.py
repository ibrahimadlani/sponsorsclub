""" Serializers """

import time

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""

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
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def create(self, validated_data):
        """Create and return a new user."""
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Update and return an existing user."""
        validated_data.pop("password_hash", None)
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