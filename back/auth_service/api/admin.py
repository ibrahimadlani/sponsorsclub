"""  Admin panel configuration for core models """

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    Address,
    Athlete,
    CompanyProfile,
    SportCategory,
    MediaAsset,
    AthleteImage,
    SocialStat,
    AthleteFollow,
    ActivityEvent,
    Conversation,
    ConversationParticipant,
    Message,
)


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


@admin.register(Athlete)
class AthleteAdmin(admin.ModelAdmin):
    """Admin configuration for athlete profiles."""

    list_display = ("name", "location", "category", "price", "certified", "level", "user")
    search_fields = ("name", "location", "category", "user__email")
    list_filter = ("certified", "level")
    ordering = ("name",)


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    """Admin configuration for company profiles."""

    list_display = ("name", "slug", "verified", "website")
    search_fields = ("name", "slug")
    list_filter = ("verified",)


@admin.register(SportCategory)
class SportCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for sport category records."""

    list_display = ("name", "slug", "emoji")
    search_fields = ("name", "slug")


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    """Admin configuration for media asset objects."""

    list_display = ("url", "created_at")
    search_fields = ("url",)


@admin.register(AthleteImage)
class AthleteImageAdmin(admin.ModelAdmin):
    """Admin configuration for athlete-media relations."""

    list_display = ("athlete", "media", "order")
    list_editable = ("order",)
    search_fields = ("athlete__name",)


@admin.register(SocialStat)
class SocialStatAdmin(admin.ModelAdmin):
    """Admin configuration for social statistics."""

    list_display = ("athlete", "platform", "followers", "last_updated")
    list_filter = ("platform",)
    search_fields = ("athlete__name",)


@admin.register(AthleteFollow)
class AthleteFollowAdmin(admin.ModelAdmin):
    """Admin configuration for follow relationships."""

    list_display = ("user", "athlete", "created_at")
    search_fields = ("user__email", "athlete__name")


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    """Admin configuration for activity feed entries."""

    list_display = ("athlete", "type", "happened_at")
    list_filter = ("type",)
    search_fields = ("athlete__name", "text")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin configuration for conversations."""

    list_display = ("id", "topic", "created_at", "updated_at")
    search_fields = ("topic", "id")


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    """Admin configuration for conversation participants."""

    list_display = ("conversation", "user", "unread_count", "is_muted")
    search_fields = ("conversation__id", "user__email")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin configuration for conversation messages."""

    list_display = ("conversation", "sender", "created_at")
    search_fields = ("conversation__id", "sender__email", "text")
