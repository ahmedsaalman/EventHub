from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, EventOrdersView, SendEventEmailView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
    path('orders/event/<uuid:event_id>/', EventOrdersView.as_view(), name='event-orders'),
    path('orders/event/email_all/', SendEventEmailView.as_view(), name='send-event-email'),  # ← Add this line
]
