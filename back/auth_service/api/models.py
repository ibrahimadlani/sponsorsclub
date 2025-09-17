""" Models for User and Address objects"""

import uuid
from django.db import models
from django.utils.timezone import now, timedelta
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class CustomUserManager(BaseUserManager):
    """
    Custom manager for the User model
    """

    def create_user(
        self, email, first_name=None, last_name=None, password=None, **extra_fields
    ):
        """
        Create a standard user
        """
        # Ensure email is provided
        if not email:
            raise ValueError("The Email field must be set")

        # Normalize the email address
        email = self.normalize_email(email)
        # Set default flags for new users
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault(
            "is_active", False
        )  # Email verification required
        extra_fields.setdefault("is_verified", False)

        # Create the user instance
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        # Set the user's password (hashed)
        user.set_password(password)
        # Save the user to the database
        user.save(using=self._db)
        return user

    def create_superuser(
        self, email, first_name, last_name, password, **extra_fields
    ):
        """
        Create a superuser with all permissions
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)
        extra_fields.setdefault("is_active", True)  # Superuser is active immediately

        return self.create_user(
            email, first_name, last_name, password, **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model where email is the unique identifier
    """

    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)

    # Phone information
    phone_country_code = models.CharField(max_length=5, default="+33")
    phone_number = models.CharField(
        max_length=20, unique=True, blank=True, null=True
    )

    # Profile information
    profile_picture_url = models.TextField(blank=True, null=True)
    cover_photo_url = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("non-binary", "Non-binary"),
    ]
    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, blank=True, null=True
    )

    # Location & preferences
    address = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=2, blank=True, null=True)
    language = models.CharField(max_length=2, blank=True, null=True)
    currency = models.CharField(max_length=3, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)

    # Subscription
    SUBSCRIPTION_CHOICES = [
        ("free", "Free"),
        ("premium", "Premium"),
        ("pro", "Pro"),
    ]
    subscription_plan = models.CharField(
        max_length=50,
        choices=SUBSCRIPTION_CHOICES,
        default="free"
    )

    # Status & verification
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    # Email verification fields
    verification_token = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, null=True
    )
    verification_token_expiry = models.DateTimeField(blank=True, null=True)

    # Password reset fields
    reset_password_token = models.UUIDField(
        unique=False, editable=False, blank=True, null=True
    )
    reset_token_expiry = models.DateTimeField(blank=True, null=True)

    def get_token_expiry(self):
        """
        Returns a token expiration datetime (default: 1 day)
        """
        return now() + timedelta(days=1)

    # Timestamps
    last_login = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Custom manager
    objects = CustomUserManager()

    # Email authentication
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = [
        "first_name",
        "last_name",
        "phone_number",
        "phone_country_code",
    ]

    def __str__(self):
        return (
            f"{self.email} ("
            f"{'Verified' if self.is_verified else 'Not verified'})"
        )

    def generate_verification_token(self):
        """
        Generate a unique token for email verification
        """
        self.verification_token = uuid.uuid4()
        self.verification_token_expiry = now() + timedelta(hours=24)
        self.save()

    def clear_verification_token(self):
        """
        Clear the verification token after successful verification
        """
        self.verification_token = None
        self.verification_token_expiry = None
        self.is_active = True
        self.is_verified = True
        self.save()


class Address(models.Model):
    """
    Address model compatible with Google Address API
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Full formatted address (Google API)
    formatted_address = models.CharField(
        max_length=255, help_text="Full formatted address from Google API"
    )

    # Address components (Google API)
    street_number = models.CharField(
        max_length=20, blank=True, null=True, help_text="Street number"
    )
    route = models.CharField(
        max_length=255, blank=True, null=True, help_text="Street name"
    )
    locality = models.CharField(
        max_length=100, blank=True, null=True, help_text="City / Locality"
    )
    administrative_area_level_1 = models.CharField(
        max_length=100, blank=True, null=True, help_text="Region / State"
    )
    administrative_area_level_2 = models.CharField(
        max_length=100, blank=True, null=True, help_text="Department / District"
    )
    country = models.CharField(
        max_length=100, blank=True, null=True, help_text="Country"
    )
    postal_code = models.CharField(
        max_length=20, blank=True, null=True, help_text="Postal code"
    )

    # Geographic coordinates
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        help_text="Latitude from Google API",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True,
        help_text="Longitude from Google API",
    )

    # Google Maps Place ID
    place_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        help_text="Google Maps Place ID",
    )

    # Additional metadata
    types = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Google address types (e.g., street_address, route)",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"{self.formatted_address} ("
            f"{self.country})"
        )


class Athlete(models.Model):
    """
    Athlete model representing public athlete profiles.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Link to a user account so athletes can log in and manage their profile
    user = models.OneToOneField(
        "api.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="athlete_profile",
    )
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_carousel = models.BooleanField(default=False)
    profile_url = models.CharField(max_length=255)
    certified = models.BooleanField(default=False)
    bio = models.TextField(max_length=50, blank=True, null=True)
    level = models.CharField(max_length=50, default="PRO")
    nationality = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    # Subscriber counts
    subscribers_facebook = models.PositiveIntegerField(default=0)
    subscribers_instagram = models.PositiveIntegerField(default=0)
    subscribers_youtube = models.PositiveIntegerField(default=0)

    # Images
    image1 = models.CharField(max_length=255, blank=True, null=True)
    image2 = models.CharField(max_length=255, blank=True, null=True)
    image3 = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.name)


# ========== MVP additions: Companies, Media, Social, Follow, Feed, Messaging ==========


class CompanyProfile(models.Model):
    """Company/Brand profile linked to a User account (1-1)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        "api.User",
        on_delete=models.CASCADE,
        related_name="company_profile",
    )
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    website = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    verified = models.BooleanField(default=False)
    logo_url = models.CharField(max_length=512, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Default ordering for company profiles."""

        ordering = ["name"]

    def __str__(self):
        return str(self.name)


class SportCategory(models.Model):
    """Sport category metadata used to classify athletes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    emoji = models.CharField(max_length=8, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Default ordering for sport categories."""

        ordering = ["name"]

    def __str__(self):
        return str(self.name)


class MediaAsset(models.Model):
    """Reusable media asset stored as an external URL."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.CharField(max_length=512)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.url)


class AthleteImage(models.Model):
    """Mapping between athletes and ordered media assets."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    athlete = models.ForeignKey("api.Athlete", on_delete=models.CASCADE, related_name="media")
    media = models.ForeignKey("api.MediaAsset", on_delete=models.CASCADE, related_name="+")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        """Order athlete media by configured display order."""

        ordering = ["order"]
        unique_together = [("athlete", "media")]


SOCIAL_PLATFORM_CHOICES = [
    ("instagram", "Instagram"),
    ("facebook", "Facebook"),
    ("youtube", "YouTube"),
    ("tiktok", "TikTok"),
]


class SocialStat(models.Model):
    """Follower statistics for an athlete on a given platform."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    athlete = models.ForeignKey(
        "api.Athlete",
        on_delete=models.CASCADE,
        related_name="social_stats",
    )
    platform = models.CharField(max_length=20, choices=SOCIAL_PLATFORM_CHOICES)
    followers = models.PositiveIntegerField(default=0)
    username = models.CharField(max_length=120, blank=True, null=True)
    profile_url = models.CharField(max_length=512, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        """Ensure one statistic per platform per athlete."""

        unique_together = [("athlete", "platform")]

    def __str__(self):
        return f"{self.athlete.name} - {self.platform}: {self.followers}"


class AthleteFollow(models.Model):
    """Relationship linking users with the athletes they follow."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("api.User", on_delete=models.CASCADE, related_name="follows")
    athlete = models.ForeignKey(
        "api.Athlete",
        on_delete=models.CASCADE,
        related_name="followers",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Prevent duplicate follow relationships and add indexes."""

        unique_together = [("user", "athlete")]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["athlete"]),
        ]

    def __str__(self):
        user_email = getattr(self.user, "email", "unknown")
        return f"{user_email} -> {self.athlete.name}"


ACTIVITY_TYPE_CHOICES = [
    ("post", "Post"),
    ("competition", "Competition"),
    ("followers", "Followers Growth"),
    ("trophy", "Trophy"),
    ("photo", "Photo"),
]


class ActivityEvent(models.Model):
    """Feed item describing an athlete activity or achievement."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    athlete = models.ForeignKey(
        "api.Athlete",
        on_delete=models.CASCADE,
        related_name="activities",
    )
    type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)

    # Generic
    text = models.TextField(blank=True, null=True)
    images = models.ManyToManyField(
        "api.MediaAsset",
        related_name="activity_events",
        blank=True,
    )
    platform = models.CharField(
        max_length=20,
        choices=SOCIAL_PLATFORM_CHOICES,
        blank=True,
        null=True,
    )
    happened_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Competition-specific
    competition_title = models.CharField(max_length=255, blank=True, null=True)
    competition_location = models.CharField(max_length=255, blank=True, null=True)
    competition_date = models.DateField(blank=True, null=True)
    competition_result = models.CharField(max_length=255, blank=True, null=True)

    # Followers growth
    followers_delta = models.IntegerField(blank=True, null=True)
    followers_note = models.CharField(max_length=255, blank=True, null=True)

    # Trophy
    trophy_title = models.CharField(max_length=255, blank=True, null=True)
    trophy_award = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        """Add indexes to optimise feed queries."""

        indexes = [
            models.Index(fields=["athlete", "happened_at"]),
            models.Index(fields=["type", "happened_at"]),
        ]
        ordering = ["-happened_at"]

    def __str__(self):
        return f"{self.athlete.name} - {self.type} @ {self.happened_at}"


class Conversation(models.Model):
    """Conversation thread between two or more users."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id}"


class ConversationParticipant(models.Model):
    """Participant metadata associated with a conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "api.Conversation",
        on_delete=models.CASCADE,
        related_name="participants",
    )
    user = models.ForeignKey(
        "api.User",
        on_delete=models.CASCADE,
        related_name="conversations",
    )
    unread_count = models.PositiveIntegerField(default=0)
    is_muted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Ensure participants are unique per conversation."""

        unique_together = [("conversation", "user")]


class Message(models.Model):
    """Message content exchanged within a conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "api.Conversation",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        "api.User",
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    text = models.TextField(blank=True, null=True)
    attachments = models.ManyToManyField(
        "api.MediaAsset",
        blank=True,
        related_name="message_attachments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    read_by = models.ManyToManyField(
        "api.User",
        blank=True,
        related_name="read_messages",
    )

    class Meta:
        """Index messages for faster chronological lookups."""

        indexes = [models.Index(fields=["conversation", "created_at"])]

    def __str__(self):
        return f"Message {self.pk}"
