"""
This file is used to define the views of the api app.

"""

import uuid

from rest_framework import generics, permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils.timezone import now, timedelta
from django.core.mail import send_mail
from django.conf import settings

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    UserSerializer,
    ResetPasswordConfirmSerializer,
)
class ResetPasswordView(APIView):
    """This class allows a user to reset their password by requesting a reset token."""

    def post(self, request):
        """POST method to send a password reset token via email."""
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Generate a password reset token
            reset_token = str(uuid.uuid4())
            user.reset_password_token = reset_token
            user.reset_token_expiry = now() + timedelta(hours=1)  # Token valid for 1 hour
            user.save()

            # Construct the reset link
            reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

            # Send email
            send_mail(
                subject="SponsorsClub · Reset Your Password",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        except User.DoesNotExist:
            # Prevents email enumeration attacks
            pass  

        return Response({"detail": "If the email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

class ResetPasswordConfirmView(APIView):
    """This class allows a user to confirm the password reset using a token."""
    
    def post(self, request):
        """POST method to validate token and set a new password."""
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  

class RetrieveAPIView(APIView):
    """This class retrieves the current user's information."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """GET method to retrieve the current user's information."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListAPIView(generics.ListAPIView):
    """This class retrieves a list of users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserCreateAPIView(generics.CreateAPIView):
    """This class creates a new user."""

    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserRUDAPIView(generics.RetrieveUpdateDestroyAPIView):
    """This class retrieves, updates, and deletes a user."""

    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ChangePasswordView(APIView):
    """This class allows a user to change their password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """POST method to change the user's password."""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"old_password": "Ancien mot de passe incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response(
                {"status": "success", "message": "Mot de passe changé avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordConfirmView(APIView):
    """This class allows a user to confirm the password reset using a token."""

    def post(self, request):
        """POST method to validate token and set a new password."""
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom TokenObtainPairSerializer to include additional user data in the response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["email"] = user.email

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    """Custom TokenObtainPairView to use the custom serializer."""

    serializer_class = MyTokenObtainPairSerializer

class VerifyEmailView(APIView):
    """Activate user account using a verification token."""

    def post(self, request, token):
        """POST method to verify email and activate the account."""
        try:
            user = User.objects.get(verification_token=token)
        except User.DoesNotExist:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        if user.token_expiry < now():
            return Response({"error": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.is_verified = True
        user.verification_token = None  # Remove the token after verification
        user.token_expiry = None
        user.save()

        return Response({"message": "Your account has been activated successfully!"}, status=status.HTTP_200_OK)