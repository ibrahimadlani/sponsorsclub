"""API view definitions for the authentication and athlete services."""

from __future__ import annotations

import logging
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import DataError
from django.utils.timezone import now
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .utils.email import send_html_email

from .models import (
    ActivityEvent,
    Athlete,
    AthleteFollow,
    AthleteImage,
    CompanyProfile,
    Conversation,
    ConversationParticipant,
    MediaAsset,
    Message,
    SocialStat,
    SportCategory,
    User,
)
from .permissions import IsAthleteOwnerOrReadOnly, IsCompanyOwnerOrReadOnly, IsSelfOrAdmin
from .serializers import (
    ActivityEventSerializer,
    AthleteFollowSerializer,
    AthleteImageSerializer,
    AthleteSerializer,
    ChangePasswordSerializer,
    CompanyProfileSerializer,
    ConversationParticipantSerializer,
    ConversationSerializer,
    MediaAssetSerializer,
    MessageSerializer,
    ResetPasswordConfirmSerializer,
    SocialStatSerializer,
    SportCategorySerializer,
    UserSerializer,
)

LOGGER = logging.getLogger(__name__)


class ResetPasswordView(APIView):
    """Issue password reset tokens so users can recover their accounts."""

    def post(self, request):
        """Send a password reset link when the email is recognised.

        Args:
            request (Request): Incoming request containing the ``email`` field.

        Returns:
            Response: ``200`` message when the flow succeeds, ``400`` if the
                email payload is missing.
        """

        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Avoid leaking whether the address exists in the database.
            return Response(
                {"detail": "If the email exists, a reset link has been sent."},
                status=status.HTTP_200_OK,
            )

        user.reset_password_token = uuid.uuid4()
        user.reset_token_expiry = now() + timedelta(hours=1)
        user.save(update_fields=["reset_password_token", "reset_token_expiry"])

        base_site = getattr(settings, "BRAND_SITE_URL", "http://127.0.0.1:3000")
        reset_link = f"{base_site}/reset-password/confirm?token={user.reset_password_token}"

        send_html_email(
            subject="SponsorsClub · Réinitialisez votre mot de passe",
            to_email=email,
            template_name="email/reset_password.html",
            context={"reset_link": reset_link},
        )

        return Response(
            {"detail": "If the email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordConfirmView(APIView):
    """Validate reset tokens and apply the new password."""

    def post(self, request):
        """Confirm a password reset request.

        Args:
            request (Request): Incoming request containing ``token`` and ``new_password``.

        Returns:
            Response: ``200`` when the password is updated, ``400`` on validation failures.
        """

        serializer = ResetPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RetrieveAPIView(APIView):
    """Expose the authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the authenticated user's details.

        Args:
            request (Request): Incoming request containing the authenticated user.

        Returns:
            Response: Serialised user payload.
        """

        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListAPIView(generics.ListAPIView):
    """List all users (restricted to admin staff)."""

    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserCreateAPIView(generics.CreateAPIView):
    """Create new user accounts."""

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserRUDAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete users with ownership restrictions."""

    permission_classes = [IsSelfOrAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ChangePasswordView(APIView):
    """Allow authenticated users to change their password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Update the user's password when the old password matches.

        Args:
            request (Request): Incoming request containing password fields.

        Returns:
            Response: ``200`` on success or ``400`` when the old password is invalid.
        """

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": "Ancien mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response(
            {"status": "success", "message": "Mot de passe changé avec succès."},
            status=status.HTTP_200_OK,
        )


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Attach additional user information to the JWT payload."""

    @classmethod
    def get_token(cls, user):
        """Return a token enriched with profile metadata.

        Args:
            user (User): Authenticated user requesting a token.

        Returns:
            Token: Refresh/access token pair containing custom claims.
        """

        token = super().get_token(user)
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["subscription_plan"] = user.subscription_plan
        token["email"] = user.email
        token["is_verified"] = user.is_verified
        token["is_staff"] = user.is_staff
        token["language"] = getattr(user, "language", None)
        token["currency"] = getattr(user, "currency", None)
        token["timezone"] = getattr(user, "timezone", None)
        return token

    def create(self, validated_data):
        """Return validated data to satisfy serializer interface."""

        return validated_data

    def update(self, instance, validated_data):
        """Leave update logic to Simple JWT internals."""

        return instance


class MyTokenObtainPairView(TokenObtainPairView):
    """Issue JWT tokens using the customised serializer."""

    serializer_class = MyTokenObtainPairSerializer


class VerifyEmailView(APIView):
    """Activate user accounts using a verification token sent via email."""

    def post(self, _request, token):
        """Mark the user's account as verified.

        Args:
            request (Request): Incoming request (unused, required by DRF).
            token (str): Verification token provided in the URL.

        Returns:
            Response: ``200`` on success or ``400`` if the token is invalid.
        """

        try:
            user = User.objects.get(verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not user.verification_token_expiry
            or user.verification_token_expiry < now()
        ):
            return Response(
                {"error": "Token has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        user.save(update_fields=[
            "is_active",
            "is_verified",
            "verification_token",
            "verification_token_expiry",
        ])

        return Response(
            {"message": "Your account has been activated successfully!"},
            status=status.HTTP_200_OK,
        )


# --- Athlete CRUD Views ---


class AthleteListCreateAPIView(generics.ListCreateAPIView):
    """List existing athletes or create new ones for the authenticated user."""
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    permission_classes = [IsAthleteOwnerOrReadOnly]

    def perform_create(self, serializer):
        """Persist the athlete while assigning ownership to the requester."""

        serializer.save(user=self.request.user)


class AthleteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific athlete profile."""
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    permission_classes = [IsAthleteOwnerOrReadOnly]

    def perform_update(self, serializer):
        """Prevent ownership changes unless the actor is staff."""

        instance = self.get_object()
        if self.request.user and self.request.user.is_staff:
            serializer.save()
        else:
            serializer.save(user=instance.user or self.request.user)


# --- ViewSets for MVP models ---


class DefaultReadWritePermissions:
    """Mixin that grants read-only access to anonymous users."""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class SportCategoryViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """CRUD operations for sport categories."""

    queryset = SportCategory.objects.all()
    serializer_class = SportCategorySerializer


class MediaAssetViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """CRUD operations for media assets."""

    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer


class AthleteImageViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """CRUD operations for athlete image associations."""

    queryset = AthleteImage.objects.all()
    serializer_class = AthleteImageSerializer


class SocialStatViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """CRUD operations for social statistics."""

    queryset = SocialStat.objects.all()
    serializer_class = SocialStatSerializer


class CompanyProfileViewSet(viewsets.ModelViewSet):
    """Manage company profiles tied to authenticated users."""

    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsCompanyOwnerOrReadOnly]

    def perform_create(self, serializer):
        """Tie the new company profile to the requesting user."""

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Prevent ownership from changing unless a staff user performs the update."""

        instance = self.get_object()
        if self.request.user and self.request.user.is_staff:
            serializer.save()
        else:
            # Lock ownership to existing user
            serializer.save(user=instance.user or self.request.user)


class AthleteFollowViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """Allow users to follow or unfollow athlete profiles."""

    serializer_class = AthleteFollowSerializer

    def get_queryset(self):
        """Limit results to the requesting user unless they are staff."""

        user = self.request.user
        if user and user.is_authenticated and not user.is_staff:
            return AthleteFollow.objects.filter(user=user)
        return AthleteFollow.objects.all()

    def perform_create(self, serializer):
        """Ensure the follow relationship is attached to the requester."""

        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a follow relationship idempotently.

        Args:
            request (Request): Incoming request containing the athlete identifier.
            *args: Positional arguments passed by DRF.
            **kwargs: Keyword arguments passed by DRF.

        Returns:
            Response: Existing or newly created follow serialised to JSON.
        """

        athlete_id = request.data.get("athlete")
        if not athlete_id:
            return Response(
                {"athlete": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            athlete = Athlete.objects.get(pk=athlete_id)
        except Athlete.DoesNotExist:
            return Response(
                {"athlete": ["Athlete not found."]},
                status=status.HTTP_404_NOT_FOUND,
            )

        follow, created = AthleteFollow.objects.get_or_create(
            user=request.user,
            athlete=athlete,
        )
        serializer = self.get_serializer(follow)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    @action(
        detail=False,
        methods=["delete"],
        url_path=r"by-athlete/(?P<athlete_id>[0-9a-fA-F\-]{36})",
        permission_classes=[permissions.IsAuthenticated],
    )
    def delete_by_athlete(self, request, athlete_id=None):
        """Remove a follow using the athlete UUID instead of the follow ID.

        Args:
            request (Request): Incoming request containing the authenticated user.
            athlete_id (str): UUID of the athlete to unfollow.

        Returns:
            Response: Empty body with ``204`` when a follow was removed, ``200`` otherwise.
        """

        deleted, _ = AthleteFollow.objects.filter(user=request.user, athlete_id=athlete_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT if deleted else status.HTTP_200_OK)


class ActivityEventViewSet(DefaultReadWritePermissions, viewsets.ModelViewSet):
    """Expose the activity feed for athlete profiles."""

    queryset = ActivityEvent.objects.all()
    serializer_class = ActivityEventSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """Allow users to list and create conversations they participate in."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return conversations the authenticated user participates in."""

        return Conversation.objects.filter(participants__user=self.request.user).distinct()


class ConversationParticipantViewSet(viewsets.ModelViewSet):
    """Manage conversation membership records."""

    serializer_class = ConversationParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return the participant list, scoped to the requester unless staff."""

        user = self.request.user
        if user and user.is_staff:
            return ConversationParticipant.objects.all()
        return ConversationParticipant.objects.filter(user=user)


class MessageViewSet(viewsets.ModelViewSet):
    """CRUD operations for messages within conversations."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return messages from conversations that include the requester."""

        return (
            Message.objects.filter(conversation__participants__user=self.request.user)
            .order_by('created_at')
            .distinct()
        )


class RegisterUserAPIView(generics.CreateAPIView):
    """Register new users and send them a verification email."""

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        """Create an inactive user and dispatch a verification email.

        Args:
            request (Request): Incoming request containing user fields.
            *args: Positional arguments passed by DRF.
            **kwargs: Keyword arguments passed by DRF.

        Returns:
            Response: Confirmation message prompting the user to verify their email.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(is_active=False)
        user.verification_token = uuid.uuid4()
        user.verification_token_expiry = now() + timedelta(hours=24)
        user.save(update_fields=["is_active", "verification_token", "verification_token_expiry"])

        base_site = getattr(settings, "BRAND_SITE_URL", "http://127.0.0.1:3000")
        verification_link = f"{base_site}/verify-email?token={user.verification_token}"

        send_html_email(
            subject=f"Bienvenue sur SponsorsClub, {user.first_name} — Vérifiez votre email",
            to_email=user.email,
            template_name="email/verify_email.html",
            context={
                "first_name": user.first_name,
                "verification_link": verification_link,
            },
        )

        return Response(
            {"message": "Account created successfully. Check your email to verify."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailAPIView(APIView):
    """Verify email addresses supplied via tokens."""

    def post(self, request):
        """Activate a user account when the verification token is valid.

        Args:
            request (Request): Incoming request containing the verification token.

        Returns:
            Response: ``200`` when the account is activated, ``400`` otherwise.
        """

        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Verification token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(verification_token=token)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not user.verification_token_expiry
            or user.verification_token_expiry < now()
        ):
            return Response(
                {"error": "Token has expired or is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expiry = None
        user.save(update_fields=[
            "is_active",
            "is_verified",
            "verification_token",
            "verification_token_expiry",
        ])

        return Response(
            {"message": "Your account has been activated successfully!"},
            status=status.HTTP_200_OK,
        )


class RightToErasureAPIView(APIView):
    """Allow an authenticated user to erase or anonymise their personal data."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Anonymise related profiles and delete the user account.

        Args:
            request (Request): Incoming request carrying the authenticated user.

        Returns:
            Response: Confirmation that the erasure process completed.
        """

        user = request.user

        athlete = getattr(user, "athlete_profile", None)
        if athlete:
            try:
                athlete.user = None
                athlete.name = "Profil supprimé"
                athlete.bio = ""
                athlete.certified = False
                athlete.profile_url = f"/athletes/deleted-{uuid.uuid4().hex[:8]}"
                athlete.save(
                    update_fields=["user", "name", "bio", "certified", "profile_url"]
                )
            except (
                ValidationError,
                DataError,
                AttributeError,
            ) as exc:  # pragma: no cover - safeguard path
                LOGGER.warning(
                    "Failed to anonymise athlete %s: %s",
                    athlete.pk,
                    exc,
                )

        company = getattr(user, "company_profile", None)
        if company:
            try:
                company.delete()
            except (
                ValidationError,
                DataError,
                AttributeError,
            ) as exc:  # pragma: no cover - safeguard path
                LOGGER.warning(
                    "Failed to delete company profile %s: %s",
                    company.pk,
                    exc,
                )

        email = user.email
        user.delete()

        return Response({"message": f"Account for {email} erased."}, status=status.HTTP_200_OK)


class FollowedAthletesAPIView(APIView):
    """Return the list of athletes followed by the authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the athlete list for the current user.

        Args:
            request (Request): Incoming request containing the authenticated user.

        Returns:
            Response: Serialised athlete collection with a count.
        """

        queryset = (
            Athlete.objects.filter(followers__user=request.user)
            .distinct()
            .order_by("name")
        )
        serializer_context = {"request": request}
        data = AthleteSerializer(queryset, many=True, context=serializer_context).data
        return Response({"results": data, "count": len(data)})


class UpdatePreferencesAPIView(APIView):
    """Allow an authenticated user to update language, currency, and timezone preferences."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Update preferences using a POST request."""

        return self._update(request)

    def patch(self, request):
        """Update preferences using a PATCH request."""

        return self._update(request)

    def _update(self, request):
        """Apply user preference updates shared across HTTP verbs.

        Args:
            request (Request): Incoming request containing the payload.

        Returns:
            Response: Updated user profile data.
        """

        user = request.user
        allowed = {"language", "currency", "timezone"}
        changed_fields = []
        for key in allowed:
            if key in request.data:
                setattr(user, key, request.data.get(key) or None)
                changed_fields.append(key)

        if changed_fields:
            user.save(update_fields=changed_fields)

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
