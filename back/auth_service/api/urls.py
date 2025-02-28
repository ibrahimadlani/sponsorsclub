"""
This file is used to define the urls of the api app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


from .views import (
    ChangePasswordView,
    UserCreateAPIView,
    UserRUDAPIView,
    UserListAPIView,
    RetrieveAPIView,
    ResetPasswordView,
    ResetPasswordConfirmView,
    MyTokenObtainPairView,
)

urlpatterns = [
    # User Endpoints
    path("users/", UserListAPIView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserRUDAPIView.as_view(), name="user-rud"),
    path(
        "users/change-password/", ChangePasswordView.as_view(), name="change-password"
    ),

    # Auth Endpoints
    path("auth/login/", MyTokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/register/", UserCreateAPIView.as_view(), name="auth-register"),
    path("auth/me/", RetrieveAPIView.as_view(), name="auth-me"),
    path("auth/auth/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("auth/reset-password/confirm/", ResetPasswordConfirmView.as_view(), name="auth-reset-password-confirm"), # /!\ check this line

]