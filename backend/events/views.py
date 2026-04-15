from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Event, TicketCategory, EventAnalytics, Order, OrderItem
from .serializers import (
    EventSerializer, EventCreateSerializer, 
    TicketCategorySerializer, TicketCategoryCreateSerializer,
    OrderSerializer
)
from .permissions import IsEventOrganizer, IsTicketOrganizer


# ==========================================
# QUERY BUILDERS (Single Responsibility)
# ==========================================

class EventQueryBuilder:
    """Builds queries for events based on different criteria"""
    
    @staticmethod
    def get_by_category(category):
        """Get published events by category"""
        valid_categories = [choice[0] for choice in Event.CATEGORY_CHOICES]
        
        if category and category.lower() in valid_categories:
            return Event.objects.filter(
                category=category.lower(),
                is_published=True
            ).order_by('-created_at')
        
        return Event.objects.none()
    
    @staticmethod
    def get_by_organizer(user):
        """Get events created by specific organizer"""
        return Event.objects.filter(organizer=user)
    
    @staticmethod
    def get_all_published():
        """Get all published events"""
        return Event.objects.filter(is_published=True).order_by('-created_at')


class TicketCategoryQueryBuilder:
    """Builds queries for ticket categories"""
    
    @staticmethod
    def get_by_event_and_organizer(event_id, organizer):
        """Get ticket categories for an event owned by organizer"""
        return TicketCategory.objects.filter(
            event_id=event_id,
            event__organizer=organizer
        )


class OrderQueryBuilder:
    """Builds queries for orders"""
    
    @staticmethod
    def get_by_user(user):
        """Get orders for specific user"""
        return Order.objects.filter(user=user).select_related(
            'event', 'user'
        ).prefetch_related('items__ticket_category')


# ==========================================
# PERMISSION CHECKERS (Single Responsibility)
# ==========================================

class OrganizerPermissionChecker:
    """Checks organizer-specific permissions"""
    
    @staticmethod
    def is_organizer(user):
        """Check if user is an organizer"""
        return hasattr(user, 'role') and user.role == 'organizer'
    
    @staticmethod
    def can_create_event(user):
        """Check if user can create events"""
        return OrganizerPermissionChecker.is_organizer(user)
    
    @staticmethod
    def can_manage_event(user, event):
        """Check if user can manage specific event"""
        return event.organizer == user
    
    @staticmethod
    def get_permission_error():
        """Get standard permission error response"""
        return Response(
            {"detail": "Only organizers can perform this action."},
            status=status.HTTP_403_FORBIDDEN
        )


# ==========================================
# EVENT ACTIONS (Single Responsibility)
# ==========================================

class EventActionHandler:
    """Handles event-specific actions"""
    
    @staticmethod
    def toggle_publish_status(event):
        """Toggle event published status"""
        event.is_published = not event.is_published
        event.save()
        return event


# ==========================================
# SERIALIZER CONTEXT BUILDER (Single Responsibility)
# ==========================================

class SerializerContextBuilder:
    """Builds context for serializers"""
    
    @staticmethod
    def build_ticket_category_context(base_context, event_id):
        """Build context for ticket category serializers"""
        context = base_context.copy()
        context['event_id'] = event_id
        return context


# ==========================================
# BASE VIEW MIXINS (Open/Closed Principle)
# ==========================================

class OrganizerRequiredMixin:
    """Mixin to enforce organizer role requirement"""
    
    def check_organizer_permission(self):
        """Check if user is organizer, return error response if not"""
        if not OrganizerPermissionChecker.is_organizer(self.request.user):
            return OrganizerPermissionChecker.get_permission_error()
        return None


class QueryBuilderMixin:
    """Mixin to provide query builder"""
    query_builder_class = None
    
    def get_query_builder(self):
        """Get the query builder instance"""
        if self.query_builder_class is None:
            raise NotImplementedError("query_builder_class must be set")
        return self.query_builder_class()


# ==========================================
# VIEWS (Interface Segregation)
# ==========================================

class EventsByCategoryView(generics.ListAPIView):
    """
    View to get all published events filtered by category.
    Follows Single Responsibility: Only handles category-based listing
    """
    permission_classes = [AllowAny]
    serializer_class = EventSerializer
    
    def get_queryset(self):
        category = self.kwargs.get('category')
        return EventQueryBuilder.get_by_category(category)


class AllEventsView(viewsets.ModelViewSet):
    """
    Public view for all events.
    Follows Single Responsibility: Only handles public event access
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


class EventViewSet(OrganizerRequiredMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing and manipulating events.
    Follows Open/Closed Principle: Extended via mixins
    """
    permission_classes = [IsAuthenticated, IsEventOrganizer]
    permission_classes = [AllowAny]  # Override for public access

    def get_queryset(self):
        """Get appropriate queryset based on action"""
        if self.action == 'list':
            return EventQueryBuilder.get_by_organizer(self.request.user)
        return Event.objects.all()
    
    def get_serializer_class(self):
        """Select serializer based on action"""
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateSerializer
        return EventSerializer
    
    def perform_create(self, serializer):
        """Set organizer when creating event"""
        serializer.save(organizer=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create event with permission check"""
        permission_error = self.check_organizer_permission()
        if permission_error:
            return permission_error
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """
        Get current user's events.
        Follows Single Responsibility: Only retrieves user's events
        """
        permission_error = self.check_organizer_permission()
        if permission_error:
            return permission_error
        
        events = EventQueryBuilder.get_by_organizer(request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_publish(self, request, pk=None):
        """
        Toggle event published status.
        Follows Single Responsibility: Only handles publish toggle
        """
        event = self.get_object()
        updated_event = EventActionHandler.toggle_publish_status(event)
        serializer = self.get_serializer(updated_event)
        return Response(serializer.data)


class TicketCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and manipulating ticket categories.
    Follows Single Responsibility: Only manages ticket categories
    """
    permission_classes = [IsAuthenticated, IsTicketOrganizer]
    
    def get_queryset(self):
        """Get ticket categories for event owned by current user"""
        event_pk = self.kwargs.get('event_pk')
        if event_pk:
            return TicketCategoryQueryBuilder.get_by_event_and_organizer(
                event_pk, 
                self.request.user
            )
        return TicketCategory.objects.none()
    
    def get_serializer_class(self):
        """Select serializer based on action"""
        if self.action in ['create', 'update', 'partial_update']:
            return TicketCategoryCreateSerializer
        return TicketCategorySerializer
    
    def get_serializer_context(self):
        """Build serializer context with event ID"""
        base_context = super().get_serializer_context()
        event_id = self.kwargs.get('event_pk')
        return SerializerContextBuilder.build_ticket_category_context(
            base_context, 
            event_id
        )
    
    def perform_create(self, serializer):
        """Create ticket category for specific event"""
        event_pk = self.kwargs.get('event_pk')
        event = get_object_or_404(Event, pk=event_pk, organizer=self.request.user)
        serializer.save(event=event)


# ==========================================
# ORDER VIEWS (Single Responsibility)
# ==========================================

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and creating orders.
    Follows Single Responsibility: Only manages orders
    Follows Dependency Inversion: Depends on OrderQueryBuilder abstraction
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        """Get orders for current user"""
        return OrderQueryBuilder.get_by_user(self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create new order.
        Delegates to parent class - follows Open/Closed Principle
        """
        return super().create(request, *args, **kwargs)