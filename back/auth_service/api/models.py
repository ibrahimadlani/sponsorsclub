import uuid
from django.db import models
from django.utils.timezone import now, timedelta
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)


class CustomUserManager(BaseUserManager):
    """Manager for custom user model"""

    def create_user(
        self, email, first_name=None, last_name=None, password=None, **extra_fields
    ):
        """Create a regular user"""
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_active", False)  # User must verify email first
        extra_fields.setdefault("is_verified", False)

        user = self.model(
            email=email, first_name=first_name, last_name=last_name, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password, **extra_fields):
        """Create a superuser with elevated permissions"""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)
        extra_fields.setdefault("is_active", True)  # Superusers are active immediately

        return self.create_user(email, first_name, last_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model where email is the unique identifier"""

    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)

    # Phone Information
    phone_country_code = models.CharField(max_length=5, default="+33")
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # Profile Information
    profile_picture_url = models.TextField(blank=True, null=True)
    cover_photo_url = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("non-binary", "Non-Binary"),
    ]
    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, blank=True, null=True
    )

    # Location & Preferences
    address = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=2, blank=True, null=True)
    language = models.CharField(max_length=2, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)

    # Account & Subscription
    SUBSCRIPTION_CHOICES = [("free", "Free"), ("premium", "Premium"), ("pro", "Pro")]
    subscription_plan = models.CharField(
        max_length=50, choices=SUBSCRIPTION_CHOICES, default="free"
    )

    # Status & Verification
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    # Email Verification Fields
    verification_token = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False, null=True
    )
    verification_token_expiry = models.DateTimeField(blank=True, null=True)
    reset_password_token = models.UUIDField(
        unique=False, editable=False, blank=True, null=True
    )
    reset_token_expiry = models.DateTimeField(blank=True, null=True)

    def get_token_expiry():
        """Generate a valid datetime object for token expiration"""
        return now() + timedelta(days=1)

    # Timestamps
    last_login = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # User Manager
    objects = CustomUserManager()

    # Authentication with Email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number", "phone_country_code"]

    def __str__(self):
        return f"{self.email} ({'Verified' if self.is_verified else 'Not Verified'})"

    def generate_verification_token(self):
        """Generate a unique token for email verification"""
        self.verification_token = uuid.uuid4()
        self.verification_token_expiry = now() + timedelta(hours=24)
        self.save()

    def clear_verification_token(self):
        """Clear the verification token after successful verification"""
        self.verification_token = None
        self.verification_token_expiry = None
        self.is_active = True
        self.is_verified = True
        self.save()


class Address(models.Model):
    """Address model perfectly compatible with Google Address API"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Raw address input from the user
    formatted_address = models.CharField(
        max_length=255, help_text="Full formatted address from Google API"
    )

    # Address components from Google API
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
        max_length=100, blank=True, null=True, help_text="State / Region"
    )
    administrative_area_level_2 = models.CharField(
        max_length=100, blank=True, null=True, help_text="County / District"
    )
    country = models.CharField(
        max_length=100, blank=True, null=True, help_text="Country name"
    )
    postal_code = models.CharField(
        max_length=20, blank=True, null=True, help_text="ZIP / Postal Code"
    )

    # Coordinates
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

    # Place ID from Google Maps API
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
        help_text="Google Address Types (e.g., street_address, route)",
    )

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.formatted_address} ({self.country_code})"
