"""URL configuration for the API application."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    RegisterUserAPIView,
    UserRUDAPIView,
    UserListAPIView,
    RetrieveAPIView,
    ResetPasswordView,
    ResetPasswordConfirmView,
    MyTokenObtainPairView,
    VerifyEmailAPIView,
    RightToErasureAPIView,
    UpdatePreferencesAPIView,
    AthleteListCreateAPIView,
    AthleteRetrieveUpdateDestroyAPIView,
    SportCategoryViewSet,
    MediaAssetViewSet,
    AthleteImageViewSet,
    SocialStatViewSet,
    CompanyProfileViewSet,
    AthleteFollowViewSet,
    ActivityEventViewSet,
    ConversationViewSet,
    ConversationParticipantViewSet,
    MessageViewSet,
    FollowedAthletesAPIView,
)

router = DefaultRouter()
router.register(r"categories", SportCategoryViewSet, basename="category")
router.register(r"media", MediaAssetViewSet, basename="media")
router.register(r"athlete-images", AthleteImageViewSet, basename="athlete-image")
router.register(r"social-stats", SocialStatViewSet, basename="social-stat")
router.register(r"companies", CompanyProfileViewSet, basename="company")
router.register(r"follows", AthleteFollowViewSet, basename="follow")
router.register(r"activities", ActivityEventViewSet, basename="activity")
router.register(r"conversations", ConversationViewSet, basename="conversation")
router.register(r"participants", ConversationParticipantViewSet, basename="participant")
router.register(r"messages", MessageViewSet, basename="message")

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
    path("auth/preferences/", UpdatePreferencesAPIView.as_view(), name="auth-preferences"),
    path("privacy/erase/", RightToErasureAPIView.as_view(), name="privacy-erase"),
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
    path("athletes/", AthleteListCreateAPIView.as_view(), name="athlete-list"),
    path(
        "athletes/<uuid:pk>/",
        AthleteRetrieveUpdateDestroyAPIView.as_view(),
        name="athlete-detail",
    ),
    path(
        "followed/athletes/",
        FollowedAthletesAPIView.as_view(),
        name="followed-athletes",
    ),
    # Router endpoints for the rest of the models
    path("", include(router.urls)),
]
