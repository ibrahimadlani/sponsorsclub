"""Seed the database with realistic mock data for the MVP.

Usage:
  python manage.py seed --athletes 30 --companies 10 --events 120 --messages 200

If counts are omitted, sensible defaults are used.
"""

import random
from datetime import timedelta

try:  # pragma: no cover - dependency check for development utilities
    from faker import Faker
except ImportError:  # pragma: no cover - avoid hard failure when Faker missing
    Faker = None  # type: ignore[misc]

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from api.models import (
    User,
    Athlete,
    CompanyProfile,
    SportCategory,
    MediaAsset,
    AthleteImage,
    SocialStat,
    AthleteFollow,
    ActivityEvent,
    Conversation,
    ConversationParticipant,
    Message,
)


CATEGORIES = [
    ("Football", "football", "⚽"),
    ("Judo", "judo", "🥋"),
    ("Basket", "basketball", "🏀"),
    ("Natation", "swimming", "🏊"),
    ("Rugby", "rugby", "🏉"),
    ("Tennis", "tennis", "🎾"),
    ("Cyclisme", "cycling", "🚴"),
    ("Biathlon", "biathlon", "🎯"),
]

IMAGE_POOLS = [
    ["/images/teddy-1.jpg", "/images/teddy-2.jpg", "/images/teddy-3.jpg"],
    ["/images/wemby-1.jpg", "/images/wemby-2.jpg", "/images/wemby-3.jpg"],
    ["/images/mbappe-1.jpg", "/images/mbappe-2.jpg", "/images/mbappe-3.jpg"],
    ["/images/leon-1.jpg", "/images/leon-2.jpg", "/images/leon-3.jpg"],
    ["/images/dupont-1.jpg", "/images/dupont-2.jpg", "/images/dupont-3.jpg"],
    ["/images/clarisse-1.jpg", "/images/clarisse-2.jpg", "/images/clarisse-3.jpg"],
    ["/images/alize-1.jpg", "/images/alize-2.jpg", "/images/alize-3.jpg"],
    ["/images/romain-1.jpg", "/images/romain-2.jpg", "/images/romain-3.jpg"],
    ["/images/justine-1.jpg", "/images/justine-2.jpg", "/images/justine-3.jpg"],
    ["/images/garcia-1.jpg", "/images/garcia-2.jpg", "/images/garcia-3.jpg"],
    ["/images/yoka-1.jpg", "/images/yoka-2.jpg", "/images/yoka-3.jpg"],
]


def ensure_categories():
    """Ensure the reference sport categories exist with the right emoji."""

    for label, slug, emoji in CATEGORIES:
        obj, created = SportCategory.objects.get_or_create(
            name=label, slug=slug, defaults={"emoji": emoji}
        )
        # Ensure emoji is set/updated if category already exists
        if not created and (not getattr(obj, "emoji", None) or obj.emoji != emoji):
            obj.emoji = emoji
            obj.save(update_fields=["emoji"])


def create_company_users(n, fake: Faker):
    """Create or retrieve company users complete with profile data."""

    created = []
    for _ in range(n):
        name = fake.company()
        slug = slugify(name)
        email = fake.unique.company_email()
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "phone_number": f"06{random.randint(10000000, 99999999)}",
                "phone_country_code": "+33",
                "language": "fr",
                "currency": "EUR",
                "timezone": "Europe/Paris",
                "is_active": True,
                "is_verified": True,
            },
        )
        if not user.has_usable_password():
            user.set_password("password123")
            user.save()
        CompanyProfile.objects.get_or_create(
            user=user,
            defaults={
                "name": name,
                "slug": slug,
                "website": fake.url(),
                "bio": fake.catch_phrase(),
                "verified": random.choice([True, False, False]),
                "logo_url": "/images/logo.png",
            },
        )
        created.append(user)
    return created


def create_athletes(n, fake: Faker):  # pylint: disable=too-many-locals
    """Populate the database with athlete fixtures."""

    if Faker is None:  # pragma: no cover - safety check for runtime usage
        raise RuntimeError("Faker is required to seed athletes. Please install faker.")

    created = []
    for _ in range(n):
        name = fake.name()
        city = fake.city()
        current_country_fn = getattr(fake, "current_country", None)
        country_name = current_country_fn() if callable(current_country_fn) else "France"
        location = f"{city}, {country_name}"
        images = random.choice(IMAGE_POOLS)
        category = random.choice(CATEGORIES)[0]
        slug = slugify(name)
        # Random birth date between 16 and 40 years ago
        age_years = random.randint(16, 40)
        offset_days = age_years * 365 + random.randint(0, 364)
        dob = timezone.now().date() - timedelta(days=offset_days)

        # Try to use country from faker if available
        nat = country_name
        try:
            nat = fake.current_country()
        except AttributeError:
            try:
                nat = fake.country()
            except AttributeError:
                nat = "France"

        athlete, _ = Athlete.objects.get_or_create(
            profile_url=f"/athletes/{slug}",
            defaults={
                "name": name,
                "location": location,
                "category": category,
                "price": random.choice([950, 5500, 10000, 15000, 20000, 50000]),
                "is_carousel": True,
                "certified": random.choice([True, False, True]),
                "bio": fake.sentence(nb_words=8)[:50],
                "level": random.choice(["PRO", "ELITE", "AMATEUR"]),
                "nationality": nat,
                "date_of_birth": dob,
                "subscribers_facebook": random.randint(5_000, 1_000_000),
                "subscribers_instagram": random.randint(10_000, 5_000_000),
                "subscribers_youtube": random.randint(1_000, 2_000_000),
                "image1": images[0],
                "image2": images[1],
                "image3": images[2],
            },
        )
        # Link an auth user account for the athlete
        athlete_email = f"{slug.replace('-', '')}@athletes.example.com"
        a_user, _ = User.objects.get_or_create(
            email=athlete_email,
            defaults={
                "first_name": name.split()[0],
                "last_name": name.split()[-1] if len(name.split()) > 1 else "",
                "phone_number": f"06{random.randint(10000000, 99999999)}",
                "phone_country_code": "+33",
                "language": "fr",
                "currency": "EUR",
                "timezone": "Europe/Paris",
                "is_active": True,
                "is_verified": True,
            },
        )
        if not a_user.has_usable_password():
            a_user.set_password("password123")
            a_user.save()
        if not athlete.user:
            athlete.user = a_user
            athlete.save()
        # Media assets + ordered gallery
        for order, url in enumerate(images):
            media, _ = MediaAsset.objects.get_or_create(url=url)
            AthleteImage.objects.get_or_create(
                athlete=athlete,
                media=media,
                defaults={"order": order},
            )

        # Social stats
        for platform in ["instagram", "facebook", "youtube"]:
            SocialStat.objects.get_or_create(
                athlete=athlete,
                platform=platform,
                defaults={
                    "followers": random.randint(5_000, 3_000_000),
                    "username": f"{slug}_{platform}",
                    "profile_url": f"https://{platform}.com/{slug}",
                },
            )

        created.append(athlete)
    return created


def create_follows(users, athletes):
    """Create follow relations between users and athletes."""

    for user in users:
        followed = random.sample(athletes, k=min(5, len(athletes)))
        for a in followed:
            AthleteFollow.objects.get_or_create(user=user, athlete=a)


def create_activity_events(athletes, count):
    """Populate recent activity events for the provided athletes."""

    events = []
    fake = Faker("fr_FR")
    for _ in range(count):
        athlete = random.choice(athletes)
        typ = random.choice(["post", "competition", "followers", "trophy", "photo"])
        happened_at = timezone.now() - timedelta(
            days=random.randint(0, 60),
            hours=random.randint(0, 23),
        )

        data = {"athlete": athlete, "type": typ, "happened_at": happened_at}
        if typ == "post":
            data.update({
                "text": fake.sentence(nb_words=10),
                "platform": random.choice(["instagram", "facebook", "youtube"]),
            })
        elif typ == "competition":
            data.update({
                "competition_title": fake.catch_phrase(),
                "competition_location": fake.city(),
                "competition_date": happened_at.date(),
                "competition_result": random.choice(
                    ["Qualification", "Finale", "Victoire", "Record personnel"]
                ),
            })
        elif typ == "followers":
            data.update({
                "followers_delta": random.randint(-1500, 25000),
                "followers_note": fake.sentence(nb_words=6),
                "platform": random.choice(["instagram", "facebook", "youtube"]),
            })
        elif typ == "trophy":
            data.update({
                "trophy_title": fake.word().title(),
                "trophy_award": random.choice(
                    ["Médaille d'or", "Médaille d'argent", "Médaille de bronze"]
                ),
            })

        ev = ActivityEvent.objects.create(**data)
        # Attach up to 3 images
        imgs = list(athlete.media.all())
        random.shuffle(imgs)
        for ai in imgs[: random.randint(0, min(3, len(imgs)))]:
            ev.images.add(ai.media)
        events.append(ev)
    return events


def create_conversations(users, count_messages):
    """Create sample conversations between provided users."""

    conversations = []
    users_copy = users.copy()
    random.shuffle(users_copy)

    for i in range(0, len(users_copy), 2):
        if i + 1 >= len(users_copy):
            break
        u1, u2 = users_copy[i], users_copy[i + 1]
        conv = Conversation.objects.create(
            topic=random.choice(["Sponsoring", "Collaboration", "Invitations"])
        )
        ConversationParticipant.objects.create(conversation=conv, user=u1)
        ConversationParticipant.objects.create(conversation=conv, user=u2)

        # Seed messages
        for _ in range(random.randint(3, 12)):
            sender = random.choice([u1, u2])
            Message.objects.create(
                conversation=conv,
                sender=sender,
                text=random.choice([
                    "Bonjour, intéressé par une collaboration ?",
                    "Oui, quel budget envisagez-vous ?",
                    "Nous pouvons proposer une story et un post.",
                    "Parfait, envoyez une proposition.",
                ]),
            )
        conversations.append(conv)

    # Extra messages sprinkled around
    for _ in range(count_messages):
        if not conversations:
            break
        conv = random.choice(conversations)
        sender = random.choice([p.user for p in conv.participants.all()])
        Message.objects.create(
            conversation=conv,
            sender=sender,
            text=random.choice([
                "Super, merci !",
                "On valide.",
                "Je reviens vers vous.",
                "Parfait pour moi.",
            ]),
        )


class Command(BaseCommand):
    """Django management command used to seed demo data."""

    help = "Seed the database with realistic demo data."

    def add_arguments(self, parser):
        parser.add_argument("--athletes", type=int, default=24)
        parser.add_argument("--companies", type=int, default=10)
        parser.add_argument("--events", type=int, default=120)
        parser.add_argument("--messages", type=int, default=200)

    def handle(self, *args, **options):
        random.seed(42)
        fake = Faker("fr_FR")
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding data..."))  # pylint: disable=no-member

        ensure_categories()
        self.stdout.write("Categories ensured.")

        companies = create_company_users(options["companies"], fake)
        self.stdout.write(f"Companies created: {len(companies)}")

        athletes = create_athletes(options["athletes"], fake)
        self.stdout.write(f"Athletes created: {len(athletes)}")

        create_follows(companies, athletes)
        self.stdout.write("Follows created.")

        create_activity_events(athletes, options["events"])
        self.stdout.write("Activity events created.")

        create_conversations(companies, options["messages"])
        self.stdout.write("Conversations and messages created.")

        self.stdout.write(self.style.SUCCESS("Seeding completed."))  # pylint: disable=no-member
