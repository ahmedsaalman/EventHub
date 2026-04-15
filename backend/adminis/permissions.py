from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access admin views.
    """
    message = "You must be an admin to perform this action."

    def has_permission(self, request, view):
        # User must be authenticated and a staff member
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission for super admin only actions.
    """
    message = "You must be a superuser to perform this action."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class CanManageUsers(permissions.BasePermission):
    """
    Permission to manage users (staff or superuser).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )
    
    def has_object_permission(self, request, view, obj):
        # Prevent admins from modifying superusers unless they are superuser themselves
        if obj.is_superuser and not request.user.is_superuser:
            return False
        # Prevent admins from modifying themselves
        if obj == request.user:
            return False
        return True