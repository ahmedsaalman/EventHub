from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class AdminAction(models.Model):
    """Track all admin actions for audit purposes"""
    ACTION_CHOICES = [
        ('user_toggle', 'User Toggle Active'),
        ('user_delete', 'User Delete'),
        ('event_delete', 'Event Delete'),
        ('user_role_change', 'User Role Change'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,  # Set to NULL if user is deleted
        null=True,                  # Allow NULL in database
        blank=True,                 # Allow blank in forms
        related_name='admin_actions'
    )
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='actions_received'
    )
    target_event_id = models.UUIDField(null=True, blank=True)
    target_event_title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store additional info
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Admin Action'
        verbose_name_plural = 'Admin Actions'
    
    def __str__(self):
        admin_name = self.admin.username if self.admin else "System"
        return f"{admin_name} - {self.action_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class SystemSettings(models.Model):
    """Global system settings managed by admin"""
    key = models.CharField(max_length=100, unique=True, primary_key=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True  # Also make this optional
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
    
    def __str__(self):
        return self.key