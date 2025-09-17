#!/bin/bash

# Collect static files (for WhiteNoise to serve admin CSS/JS)
/py/bin/python manage.py collectstatic --noinput

# Run migrations
/py/bin/python manage.py wait_for_db
/py/bin/python manage.py makemigrations --noinput
/py/bin/python manage.py migrate --noinput

# Create superuser with email as the unique identifier
/py/bin/python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
email = "$DJANGO_SUPERUSER_EMAIL"
password = "$DJANGO_SUPERUSER_PASSWORD"
first_name = "$DJANGO_SUPERUSER_FIRST_NAME"
last_name = "$DJANGO_SUPERUSER_LAST_NAME"

# Check if user already exists before creating
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password, first_name=first_name, last_name=last_name)
    print("Superuser created.")
else:
    print("Superuser already exists. Updating password.")
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save()
EOF
