from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AdminAction, SystemSettings
from events.models import Event, Order
from django.db import models

User = get_user_model()


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for admin user management"""
    total_events = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'is_active', 
            'is_staff', 'date_joined', 'last_login',
            'total_events', 'total_orders'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_total_events(self, obj):
        if obj.role == 'organizer':
            return obj.events.count()
        return 0
    
    def get_total_orders(self, obj):
        return obj.orders.count()


class UserToggleSerializer(serializers.Serializer):
    """Serializer for toggling user active status"""
    is_active = serializers.BooleanField(read_only=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


class AdminActionSerializer(serializers.ModelSerializer):
    """Serializer for admin action logs"""
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    admin_email = serializers.CharField(source='admin.email', read_only=True)
    target_username = serializers.CharField(source='target_user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = AdminAction
        fields = [
            'id', 'admin', 'admin_username', 'admin_email',
            'action_type', 'target_user', 'target_username',
            'target_event_id', 'target_event_title', 
            'description', 'metadata', 'created_at'
        ]
        read_only_fields = fields


class EventManagementSerializer(serializers.ModelSerializer):
    """Serializer for admin event management"""
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    organizer_email = serializers.CharField(source='organizer.email', read_only=True)
    total_tickets_sold = serializers.IntegerField(read_only=True)
    total_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'date', 'time',
            'location', 'cost', 'capacity', 'is_published', 
            'organizer', 'organizer_username', 'organizer_email',
            'total_tickets_sold', 'total_revenue', 'created_at', 'updated_at'
        ]
    
    def get_total_revenue(self, obj):
        total = obj.orders.filter(status='completed').aggregate(
            total=models.Sum('total_amount')
        )['total']
        return float(total) if total else 0.0


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for system settings"""
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = SystemSettings
        fields = ['key', 'value', 'description', 'updated_by', 'updated_by_username', 'updated_at']
        read_only_fields = ['updated_by', 'updated_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard statistics"""
    total_users = serializers.IntegerField()
    total_organizers = serializers.IntegerField()
    total_viewers = serializers.IntegerField()
    active_users = serializers.IntegerField()
    inactive_users = serializers.IntegerField()
    total_events = serializers.IntegerField()
    published_events = serializers.IntegerField()
    unpublished_events = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    recent_actions = AdminActionSerializer(many=True, read_only=True)