from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.shortcuts import get_object_or_404

from .models import AdminAction, SystemSettings
from .serializers import (
    UserManagementSerializer, UserToggleSerializer,
    AdminActionSerializer, EventManagementSerializer,
    SystemSettingsSerializer, DashboardStatsSerializer
)
from events.models import Event, Order

User = get_user_model()


class AdminDashboardView(generics.GenericAPIView):
    """
    Get admin dashboard statistics
    """
    permission_classes = []  # No authentication required
    serializer_class = DashboardStatsSerializer
    
    def get(self, request):
        # User statistics
        total_users = User.objects.count()
        total_organizers = User.objects.filter(role='organizer').count()
        total_viewers = User.objects.filter(role='viewer').count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        # Event statistics
        total_events = Event.objects.count()
        published_events = Event.objects.filter(is_published=True).count()
        unpublished_events = Event.objects.filter(is_published=False).count()
        
        # Order statistics
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Recent admin actions
        recent_actions = AdminAction.objects.all()[:10]
        
        data = {
            'total_users': total_users,
            'total_organizers': total_organizers,
            'total_viewers': total_viewers,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'total_events': total_events,
            'published_events': published_events,
            'unpublished_events': unpublished_events,
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'recent_actions': recent_actions,
        }
        
        serializer = self.get_serializer(data)
        return Response(serializer.data)


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (No authentication required)
    """
    serializer_class = UserManagementSerializer
    permission_classes = []  # No authentication required
    queryset = User.objects.all()
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by username or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """Prevent deletion via this endpoint"""
        return Response(
            {"detail": "Use the delete_user action instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle user active status
        """
        user = self.get_object()
        
        serializer = UserToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reason = serializer.validated_data.get('reason', '')
        
        with transaction.atomic():
            # Toggle active status
            user.is_active = not user.is_active
            user.save()
            
            # Log action without admin user
            AdminAction.objects.create(
                action_type='user_toggle',
                target_user=user,
                description=f"User {user.username} set to {'active' if user.is_active else 'inactive'}",
                metadata={
                    'previous_status': not user.is_active,
                    'new_status': user.is_active,
                    'reason': reason
                }
            )
        
        return Response({
            "detail": f"User {user.username} is now {'active' if user.is_active else 'inactive'}.",
            "user": UserManagementSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """
        Change user role
        """
        user = self.get_object()
        
        new_role = request.data.get('role')
        if new_role not in ['organizer', 'viewer']:
            return Response(
                {"detail": "Invalid role. Must be 'organizer' or 'viewer'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_role = user.role
        
        with transaction.atomic():
            user.role = new_role
            user.save()
            
            # Log action without admin user
            AdminAction.objects.create(
                action_type='user_role_change',
                target_user=user,
                description=f"User {user.username} role changed from {old_role} to {new_role}",
                metadata={
                    'previous_role': old_role,
                    'new_role': new_role
                }
            )
        
        return Response({
            "detail": f"User role changed to {new_role}.",
            "user": UserManagementSerializer(user).data
        })
    
    @action(detail=True, methods=['delete'])
    def delete_user(self, request, pk=None):
        """
        Delete a user permanently
        """
        user = self.get_object()
        
        username = user.username
        user_id = user.id
        
        with transaction.atomic():
            # Log action without admin user
            AdminAction.objects.create(
                action_type='user_delete',
                description=f"User {username} (ID: {user_id}) deleted permanently",
                metadata={
                    'deleted_user_id': str(user_id),
                    'deleted_username': username,
                    'deleted_email': user.email,
                    'deleted_role': user.role
                }
            )
            
            # Delete user
            user.delete()
        
        return Response(
            {"detail": f"User {username} deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class EventManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events (No authentication required)
    """
    serializer_class = EventManagementSerializer
    permission_classes = []  # No authentication required
    queryset = Event.objects.all()
    
    def get_queryset(self):
        queryset = Event.objects.all().select_related('organizer').order_by('-created_at')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by published status
        is_published = self.request.query_params.get('is_published', None)
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
        # Search by title
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        # Filter by organizer
        organizer_id = self.request.query_params.get('organizer', None)
        if organizer_id:
            queryset = queryset.filter(organizer_id=organizer_id)
        
        return queryset
    
    def update(self, request, *args, **kwargs):
        """Prevent full updates via this endpoint"""
        return Response(
            {"detail": "Event updates should be done by organizers."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def partial_update(self, request, *args, **kwargs):
        """Prevent partial updates via this endpoint"""
        return Response(
            {"detail": "Event updates should be done by organizers."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=True, methods=['delete'])
    def delete_event(self, request, pk=None):
        """
        Delete an event permanently
        """
        event = self.get_object()
        
        event_title = event.title
        event_id = event.id
        organizer = event.organizer
        
        with transaction.atomic():
            # FIXED: Assign 'admin=request.user' so the log is linked to you
            AdminAction.objects.create(
                admin=request.user,  # <--- THIS WAS MISSING
                action_type='event_delete',
                description=f"Event '{event_title}' deleted",
                metadata={
                    'event_id': str(event_id),
                    'event_title': event_title,
                    'organizer_id': str(organizer.id),
                    'organizer_username': organizer.username,
                    'event_date': str(event.date)
                }
            )
            
            # Delete event (cascade will handle related objects)
            event.delete()
        
        return Response(
            {"detail": f"Event '{event_title}' deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to use custom delete_event"""
        return self.delete_event(request, pk=kwargs.get('pk'))


class AdminActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing admin action logs (read-only, no authentication)
    """
    serializer_class = AdminActionSerializer
    permission_classes = []  # No authentication required
    queryset = AdminAction.objects.all()
    
    def get_queryset(self):
        queryset = AdminAction.objects.all().select_related('target_user')
        
        # Filter by action type
        action_type = self.request.query_params.get('action_type', None)
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        return queryset


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system settings (No authentication required)
    """
    serializer_class = SystemSettingsSerializer
    permission_classes = []  # No authentication required
    queryset = SystemSettings.objects.all()
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        serializer.save()