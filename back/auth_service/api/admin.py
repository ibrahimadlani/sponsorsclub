from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address

class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""

    list_display = (
        "email",
        "first_name",
        "last_name",
        "phone_country_code",
        "phone_number",
        "date_of_birth",
        "gender",
        "country",
        "timezone",
        "subscription_plan",
        "is_verified",
        "is_active",
        "is_banned",
        "is_staff",
        "last_login",
        "date_joined",
    )
    search_fields = ("email", "first_name", "last_name")
    readonly_fields = ("last_login", "date_joined")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": (
            "first_name", "last_name", "phone_country_code", "phone_number", "date_of_birth", "gender",
            "profile_picture_url", "cover_photo_url", "bio", "country", "timezone"
        )}),
        ("Permissions", {"fields": ("is_verified", "is_active", "is_banned", "is_staff", "is_superuser")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
        ("Subscription", {"fields": ("subscription_plan",)}),
        ("Password Reset", {"fields": ("reset_password_token", "reset_token_expiry")}),
    )

admin.site.register(User, UserAdmin)

class AddressAdmin(admin.ModelAdmin):
    """Define the admin panel for managing addresses."""
    list_display = (
        "formatted_address",
        "street_number",
        "route",
        "locality",
        "administrative_area_level_1",
        "administrative_area_level_2",
        "country",
        "postal_code",
        "latitude",
        "longitude",
        "place_id",
        "types",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "formatted_address",
        "street_number",
        "route",
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1",
        "country",
        "postal_code",
        "place_id",
    )

admin.site.register(Address, AddressAdmin)
