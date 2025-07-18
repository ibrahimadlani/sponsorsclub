"""  Utility functions for the API. """
from django.core.mail import send_mail
from django.conf import settings


def send_verification_email(user):
    """Send an account activation email with a verification token."""
    subject = "Activate Your Account 🚀"
    activation_link = f"http://127.0.0.1:3000/verify-email/{user.verification_token}"
    message = f"""
    Bonjour {user.first_name},

    Merci de vous être inscrit. Pour activer votre compte, cliquez sur le lien ci-dessous:

    {activation_link}

    Ce lien expirera dans 24 heures.

    L'équipe Support
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
