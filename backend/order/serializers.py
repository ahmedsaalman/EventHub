from rest_framework import serializers
from .models import Order, OrderItem, Ticket, TicketCategory
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    ticket_image_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    event_name = serializers.CharField(source='order_item.order.event.title', read_only=True)
    category_name = serializers.CharField(source='order_item.ticket_category.name', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'status', 'ticket_image_url', 
            'qr_code_url', 'event_name', 'category_name', 
            'created_at', 'scanned_at'  
        ]
    
    def get_ticket_image_url(self, obj):
        request = self.context.get('request')
        if obj.ticket_image and hasattr(obj.ticket_image, 'url'):
            return request.build_absolute_uri(obj.ticket_image.url) if request else obj.ticket_image.url
        return None
    
    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and hasattr(obj.qr_code, 'url'):
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None

class OrderItemSerializers(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='ticket_category.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'price', 'category_name', 'tickets']

class OrderSerializers(serializers.ModelSerializer):
    items = OrderItemSerializers(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    event_name = serializers.CharField(source='event.title', read_only=True)
    event_image = serializers.CharField(source='event.image_url', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'event', 'event_name', 'event_image', 
            'event_date', 'event_location', 'total_amount', 
            'payment_method', 'status', 'created_at', 'items'
        ]

class EventOrderItemSerializer(serializers.ModelSerializer):
    ticket_name = serializers.CharField(source='ticket_category.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'price', 'ticket_name']

class EventOrderSerializer(serializers.ModelSerializer):
    items = EventOrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user_name', 'user_email', 'total_amount', 
            'payment_method', 'status', 'created_at', 
            'updated_at', 'items'
        ]
        
class BulkEmailSerializer(serializers.Serializer):
    event_id = serializers.UUIDField(required=True)
    subject = serializers.CharField(required=True, max_length=255)
    body = serializers.CharField(required=True)
    
    def validate_event_id(self, value):
        """Validate that the event exists"""
        from events.models import Event  # Import your Event model
        if not Event.objects.filter(id=value).exists():
            raise serializers.ValidationError("Event does not exist")
        return value