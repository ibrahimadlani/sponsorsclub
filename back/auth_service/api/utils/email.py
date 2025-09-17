from typing import Any, Dict, Optional

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def send_html_email(
    subject: str,
    to_email: str,
    template_name: str,
    context: Optional[Dict[str, Any]] = None,
    from_email: Optional[str] = None,
) -> None:
    """Send an HTML email with a text alternative.

    Args:
        subject (str): Subject line for the email.
        to_email (str): Recipient address.
        template_name (str): Django template to render.
        context (Optional[Dict[str, Any]]): Template context overrides.
        from_email (Optional[str]): Sender override; defaults to ``DEFAULT_FROM_EMAIL``.
    """

    context = context or {}
    context.setdefault("brand_name", getattr(settings, "BRAND_NAME", "SponsorsClub"))
    context.setdefault(
        "brand_logo_url",
        getattr(
            settings,
            "BRAND_LOGO_URL",
            "https://via.placeholder.com/120x32?text=SponsorsClub",
        ),
    )
    context.setdefault(
        "brand_site_url",
        getattr(settings, "BRAND_SITE_URL", "https://localhost:3000"),
    )

    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)

    from_addr = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None)
    msg = EmailMultiAlternatives(subject, text_content, from_addr, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)
