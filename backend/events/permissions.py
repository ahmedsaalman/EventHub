from rest_framework import permissions

class IsEventOrganizer(permissions.BasePermission):
    """
    Object-level permission to only allow organizers to edit events.
    """
    def has_permission(self, request, view):
        # Allow read-only for safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only organizers can create/modify events
        return request.user.is_authenticated and request.user.role == 'organizer'
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the organizer of the event
        return obj.organizer == request.user

class IsOrganizer(permissions.BasePermission):
    """
    Permission to only allow organizers to access certain endpoints.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'organizer'

class IsTicketOrganizer(permissions.BasePermission):
    """
    Permission to only allow event organizers to manage ticket categories.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'organizer'
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.event.organizer == request.user

