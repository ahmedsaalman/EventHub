from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Main router for events
router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')

router.register(r'all_events', views.AllEventsView, basename='all_events')




urlpatterns = [
    # Organizer endpoints (protected)
    path('', include(router.urls)),
    
    path('events/category/<str:category>/', views.EventsByCategoryView.as_view(), name='events-by-category'),
    
    # Event-specific nested endpoints
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
    
 
  
    # Additional organizer endpoints
    path('organizer/events/', views.EventViewSet.as_view({'get': 'my_events'}), name='my-events'),
    


    path('orders/', views.OrderViewSet.as_view({'post': 'create'}), name='create-order'),
    
]