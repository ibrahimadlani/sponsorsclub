"""
This file is used to define the urls of the api app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    RegisterUserAPIView,  # ✅ Replaces UserCreateAPIView
    UserRUDAPIView,
    UserListAPIView,
    RetrieveAPIView,
    ResetPasswordView,
    ResetPasswordConfirmView,
    MyTokenObtainPairView,
    VerifyEmailAPIView,  # ✅ New view for email verification
)

urlpatterns = [
    # User Endpoints
    path("users/", UserListAPIView.as_view(), name="user-list"),
    path("users/<str:pk>/", UserRUDAPIView.as_view(), name="user-rud"),
    # Auth Endpoints
    path("auth/login/", MyTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/register/", RegisterUserAPIView.as_view(), name="auth-register"),
    path("auth/verify-email/", VerifyEmailAPIView.as_view(), name="auth-verify-email"),
    path("auth/me/", RetrieveAPIView.as_view(), name="auth-me"),
    path(
        "auth/change-password/",
        ChangePasswordView.as_view(),
        name="auth-change-password",
    ),
    path(
        "auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"
    ),
    path(
        "auth/reset-password/confirm/",
        ResetPasswordConfirmView.as_view(),
        name="auth-reset-password-confirm",
    ),
]
