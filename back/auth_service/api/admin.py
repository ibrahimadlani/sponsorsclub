"""  Admin panel configuration for the User and Address models """
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin panel configuration for the User model"""

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_verified",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("is_verified", "is_active", "is_staff", "subscription_plan")
    search_fields = ("email", "first_name", "last_name", "phone_number")

    fieldsets = (
        (
            "🔹 User Info",
            {
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "phone_country_code",
                    "phone_number",
                )
            },
        ),
        (
            "📷 Profile",
            {
                "fields": (
                    "profile_picture_url",
                    "cover_photo_url",
                    "bio",
                    "date_of_birth",
                    "gender",
                )
            },
        ),
        ("🌍 Location", {"fields": ("address", "country", "language", "timezone")}),
        (
            "💳 Subscription & Status",
            {
                "fields": (
                    "subscription_plan",
                    "is_verified",
                    "is_active",
                    "is_banned",
                    "is_staff",
                )
            },
        ),
        (
            "🔑 Security & Authentication",
            {"fields": ("password",)},
        ),  # ✅ Editable password field
        (
            "📜 Read-Only Fields",
            {
                "fields": (
                    "verification_token",  # ✅ Read-Only
                    "verification_token_expiry",
                    "reset_password_token",  # ✅ Read-Only
                    "reset_token_expiry",
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )

    readonly_fields = (
        "verification_token",
        "verification_token_expiry",
        "reset_password_token",
        "reset_token_expiry",
        "last_login",
        "date_joined",
    )

    add_fieldsets = (
        (
            "➕ New User",
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    ordering = ("-date_joined",)
    filter_horizontal = ()


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin panel configuration for the Address model"""

    list_display = (
        "formatted_address",
        "locality",
        "country",
        "postal_code",
        "latitude",
        "longitude",
    )
    search_fields = (
        "formatted_address",
        "locality",
        "country",
        "postal_code",
        "place_id",
    )
    list_filter = ("country",)
    ordering = ("-created_at",)

    fieldsets = (
        (
            "🏡 Address Details",
            {
                "fields": (
                    "formatted_address",
                    "street_number",
                    "route",
                    "locality",
                    "administrative_area_level_1",
                    "administrative_area_level_2",
                    "country",
                    "postal_code",
                )
            },
        ),
        ("📍 Coordinates", {"fields": ("latitude", "longitude", "place_id")}),
        ("📜 Metadata", {"fields": ("types",)}),
        ("⏳ Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    readonly_fields = ("created_at", "updated_at")
