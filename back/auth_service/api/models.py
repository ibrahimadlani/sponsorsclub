"""
Models for User and Address objects
"""

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
