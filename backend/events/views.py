from django.shortcuts import render


from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer
from .permissions import IsOrganizerOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    #queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    def __str__(self):
        return f"{self.title} (by {self.organizer.username})"
