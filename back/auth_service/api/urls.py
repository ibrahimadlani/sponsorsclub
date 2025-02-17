"""
This file is used to define the urls of the api app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


from .views import (
    ChangePasswordView,
    UserCreateAPIView,
    UserRUDAPIView,
    UserListAPIView,  # Import the UserListAPIView
)

urlpatterns = [

    path("users/create/", UserCreateAPIView.as_view(), name="user-create"),
    path("users/<int:pk>/", UserRUDAPIView.as_view(), name="user-rud"),
    path(
        "users/change-password/", ChangePasswordView.as_view(), name="change-password"
    ),
    path("token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("users/", UserListAPIView.as_view(), name="user-list"),  # Add this line
]