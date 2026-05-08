from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Main router for events
router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'all_events', views.AllEventsView, basename='all_events')

urlpatterns = [
    # Router URLs (only included ONCE)
    path('', include(router.urls)),

    # Public event detail via explicit UUID route
    path('public/events/<uuid:pk>/', views.AllEventsView.as_view({'get': 'retrieve'}), name='public-event-detail'),

    # Events by category
    path('events/category/<str:category>/', views.EventsByCategoryView.as_view(), name='events-by-category'),

    # Event-specific nested ticket endpoints
    path('events/<uuid:event_pk>/tickets/', views.TicketCategoryViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='event-tickets-list'),

    path('events/<uuid:event_pk>/tickets/<uuid:pk>/', views.TicketCategoryViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='event-tickets-detail'),

    # Organizer endpoints
    path('organizer/events/', views.EventViewSet.as_view({'get': 'my_events'}), name='my-events'),

    # Orders
    path('orders/', views.OrderViewSet.as_view({'post': 'create'}), name='create-order'),
]