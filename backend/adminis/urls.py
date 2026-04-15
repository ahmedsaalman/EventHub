from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardView,
    UserManagementViewSet,
    EventManagementViewSet,
    AdminActionViewSet,
    SystemSettingsViewSet
)

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='admin-users')
router.register(r'events', EventManagementViewSet, basename='admin-events')
router.register(r'actions', AdminActionViewSet, basename='admin-actions')
router.register(r'settings', SystemSettingsViewSet, basename='admin-settings')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]