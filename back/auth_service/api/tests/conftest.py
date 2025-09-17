"""Shared pytest fixtures for the API tests."""

from __future__ import annotations

import os
import sys
import types
import uuid
from pathlib import Path
from typing import Callable, Tuple

ROOT_DIR = Path(__file__).resolve().parents[4]
BACKEND_DIR = ROOT_DIR / "back" / "auth_service"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
os.environ.setdefault("EMAIL_BACKEND", "django.core.mail.backends.locmem.EmailBackend")
os.environ.setdefault("EMAIL_HOST", "localhost")
os.environ.setdefault("EMAIL_PORT", "1025")
os.environ.setdefault("EMAIL_HOST_USER", "test@example.com")
os.environ.setdefault("EMAIL_HOST_PASSWORD", "password")

import pytest
from rest_framework.test import APIClient

if "whitenoise" not in sys.modules:  # pragma: no cover - testing shim
    whitenoise_module = types.ModuleType("whitenoise")
    middleware_module = types.ModuleType("whitenoise.middleware")

    class WhiteNoiseMiddleware:  # pylint: disable=too-few-public-methods
        """Minimal stub middleware for tests."""

        def __init__(self, get_response):
            self.get_response = get_response

        def __call__(self, request):
            return self.get_response(request)

    middleware_module.WhiteNoiseMiddleware = WhiteNoiseMiddleware
    whitenoise_module.middleware = middleware_module
    sys.modules["whitenoise"] = whitenoise_module
    sys.modules["whitenoise.middleware"] = middleware_module

import django
from django.core.management import call_command

django.setup()

from api.models import User


@pytest.fixture(scope="session", autouse=True)
def _migrate_db() -> None:
    """Apply database migrations once for the test session."""

    call_command("migrate", run_syncdb=True, verbosity=0)


@pytest.fixture(autouse=True)
def _flush_db() -> None:
    """Ensure a clean database state after each test."""

    yield
    call_command("flush", verbosity=0, interactive=False)


@pytest.fixture
def api_client() -> APIClient:
    """Return a DRF APIClient for making HTTP requests in tests."""

    return APIClient()


@pytest.fixture
def user_factory() -> Callable[..., Tuple[User, str]]:
    """Factory fixture to create users with sensible defaults."""

    def factory(**kwargs) -> Tuple[User, str]:
        password = kwargs.pop("password", "Testpass123!")
        email = kwargs.pop("email", f"user-{uuid.uuid4()}@example.com")
        first_name = kwargs.pop("first_name", "Test")
        last_name = kwargs.pop("last_name", "User")

        extra_fields = {
            "phone_country_code": kwargs.pop("phone_country_code", "+33"),
            "phone_number": kwargs.pop(
                "phone_number", f"06{uuid.uuid4().int % 10**8:08d}"
            ),
            "language": kwargs.pop("language", "fr"),
            "currency": kwargs.pop("currency", "EUR"),
            "timezone": kwargs.pop("timezone", "Europe/Paris"),
            "is_active": kwargs.pop("is_active", True),
            "is_verified": kwargs.pop("is_verified", True),
        }
        extra_fields.update(kwargs)

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            **extra_fields,
        )

        return user, password

    return factory
