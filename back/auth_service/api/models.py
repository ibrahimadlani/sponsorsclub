import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    """Manager for custom user model"""

    def create_user(self, email, first_name=None, last_name=None, password=None, **extra_fields):
        """Create a regular user"""
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        extra_fields.setdefault("is_staff", False)
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password, **extra_fields):
        """Create a superuser with elevated permissions"""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        return self.create_user(email, first_name, last_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model where email is the unique identifier"""

    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    password_hash = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    username = models.CharField(max_length=50, unique=True, blank=True, null=True)

    # Phone Information
    phone_country_code = models.CharField(max_length=5, default="+33")
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # Personal Information
    date_of_birth = models.DateField(blank=True, null=True)
    GENDER_CHOICES = [("male", "Male"), ("female", "Female"), ("non-binary", "Non-Binary")]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)

    # Profile Information
    profile_picture_url = models.TextField(blank=True, null=True)
    cover_photo_url = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Location & Preferences
    country = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)

    # Account & Subscription
    SUBSCRIPTION_CHOICES = [("free", "Free"), ("premium", "Premium"), ("pro", "Pro")]
    subscription_plan = models.CharField(max_length=50, choices=SUBSCRIPTION_CHOICES, default="free")

    # Status & Verification
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_banned = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    # Timestamps
    last_login = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # User Manager
    objects = CustomUserManager()

    # Authentication with Email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.email} ({self.subscription_plan})"
