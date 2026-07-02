from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from examiner.models import UserProfile


class Command(BaseCommand):
    help = "Creates the demo user (id=1, 'Dev_User') the frontend defaults to, if missing."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='Dev_User',
            defaults={'first_name': 'Dev', 'last_name': 'User'},
        )
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'username_alt': 'Dev_User', 'rank': 1200, 'questions_solved': 0},
        )

        if created or profile_created:
            self.stdout.write(self.style.SUCCESS(f"Seeded demo user (id={user.id})."))
        else:
            self.stdout.write(f"Demo user already exists (id={user.id}).")
