from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""
    list_display = (
        "email",
        "first_name",
        "last_name",
        "username",
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
    )
    search_fields = ("email", "first_name", "last_name", "username")
    readonly_fields = ("last_login", "date_joined")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password_hash")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "username", "phone_country_code", "phone_number", "date_of_birth", "gender", "profile_picture_url", "cover_photo_url", "bio", "country", "timezone")}),
        ("Permissions", {"fields": ("is_verified", "is_active", "is_banned", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Subscription", {"fields": ("subscription_plan",)}),
    )

admin.site.register(User, UserAdmin)
