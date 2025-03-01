"""
WSGI config for api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
import pathlib

import dotenv
from django.core.wsgi import get_wsgi_application

ENV_FILE_PATH = pathlib.Path(__file__).resolve().parent.parent / ".env"

dotenv.read_dotenv(str(ENV_FILE_PATH))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = get_wsgi_application()
