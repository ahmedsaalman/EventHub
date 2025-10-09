from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from your_app_name.models import Event
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seeds the database with test events'

    def handle(self, *args, **kwargs):
        user = User.objects.first()
        if not user:
            self.stdout.write('Please create a user first')
            return
        
        events = [
            {
                'title': 'Tech Conference 2025',
                'description': 'Annual technology conference',
                'cost': 99.99,
                'date': date.today() + timedelta(days=30),
                'location': 'Convention Center, NYC'
            },
            {
                'title': 'Music Festival',
                'description': 'Three days of live music',
                'cost': 150.00,
                'date': date.today() + timedelta(days=60),
                'location': 'Central Park, NYC'
            }
        ]
        
        for event_data in events:
            Event.objects.create(organizer=user, **event_data)
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded events'))