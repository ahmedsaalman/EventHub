from rest_framework import serializers
from .models import Event, TicketCategory, EventAnalytics, Order, OrderItem
from users.serializers import UserSerializer
from decimal import Decimal


# ==========================================
# BASE SERIALIZERS (Single Responsibility)
# ==========================================

class TicketCategorySerializer(serializers.ModelSerializer):
    """Read-only serializer for ticket categories"""
    available_quantity = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    
    class Meta:
        model = TicketCategory
        fields = [
            'id', 'name', 'description', 'price', 'quantity', 
            'quantity_sold', 'available_quantity', 'color', 'features',
            'is_active', 'is_sold_out', 'created_at'
        ]
        read_only_fields = ['quantity_sold', 'created_at']


class EventAnalyticsSerializer(serializers.ModelSerializer):
    """Read-only serializer for event analytics"""
    class Meta:
        model = EventAnalytics
        fields = [
            'page_views', 'unique_visitors', 'ticket_views', 
            'conversion_rate', 'last_updated'
        ]
        read_only_fields = fields


class EventSerializer(serializers.ModelSerializer):
    """Read-only serializer for events with nested data"""
    organizer = UserSerializer(read_only=True)
    ticket_categories = TicketCategorySerializer(many=True, read_only=True)
    analytics = EventAnalyticsSerializer(read_only=True)
    total_tickets_sold = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'title', 'description', 'category', 
            'date', 'time', 'location', 'cost', 'capacity', 'image_url',
            'is_published', 'ticket_categories', 'analytics',
            'total_tickets_sold', 'is_sold_out', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Read-only serializer for order items"""
    ticket_category_name = serializers.CharField(source='ticket_category.name', read_only=True)
    ticket_category_type = serializers.CharField(source='ticket_category.type', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'ticket_category', 'ticket_category_name', 'ticket_category_type',
            'quantity', 'price', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    """Read-only serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email', 'event', 'event_title', 'total_amount',
            'status', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


# ==========================================
# VALIDATORS (Single Responsibility)
# ==========================================

class TicketCategoryValidator:
    """Validates ticket category data"""
    
    @staticmethod
    def validate_quantity(quantity):
        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return quantity
    
    @staticmethod
    def validate_price(price):
        if price < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return price


class OrderValidator:
    """Validates order data and business rules"""
    
    def __init__(self, event, tickets_data, total_amount):
        self.event = event
        self.tickets_data = tickets_data
        self.total_amount = total_amount
    
    def validate(self):
        """Main validation method - Template Method Pattern"""
        self._validate_event()
        self._validate_tickets_structure()
        validated_tickets = self._validate_ticket_availability()
        self._validate_total_amount(validated_tickets)
        return validated_tickets
    
    def _validate_event(self):
        """Validate event exists and is published"""
        if not self.event.is_published:
            raise serializers.ValidationError("Event is not published")
    
    def _validate_tickets_structure(self):
        """Validate tickets data structure"""
        for ticket_data in self.tickets_data:
            required_fields = ['ticket_category_id', 'quantity', 'price']
            if not all(field in ticket_data for field in required_fields):
                raise serializers.ValidationError(
                    "Each ticket must have ticket_category_id, quantity, and price"
                )
    
    def _validate_ticket_availability(self):
        """Validate ticket categories and availability"""
        validated_tickets = []
        
        for ticket_data in self.tickets_data:
            ticket_category = self._get_ticket_category(ticket_data['ticket_category_id'])
            self._check_availability(ticket_category, ticket_data['quantity'])
            self._validate_price_match(ticket_category, ticket_data['price'])
            
            validated_tickets.append({
                'category': ticket_category,
                'quantity': ticket_data['quantity'],
                'price': ticket_data['price']
            })
        
        return validated_tickets
    
    def _get_ticket_category(self, category_id):
        """Get and validate ticket category"""
        try:
            return TicketCategory.objects.get(
                id=category_id,
                event=self.event,
                is_active=True
            )
        except TicketCategory.DoesNotExist:
            raise serializers.ValidationError(f"Invalid ticket category: {category_id}")
    
    def _check_availability(self, ticket_category, quantity):
        """Check if enough tickets are available"""
        if quantity > ticket_category.available_quantity:
            raise serializers.ValidationError(
                f"Not enough tickets available for {ticket_category.name}. "
                f"Available: {ticket_category.available_quantity}, Requested: {quantity}"
            )
    
    def _validate_price_match(self, ticket_category, provided_price):
        """Validate price matches ticket category price"""
        if Decimal(str(provided_price)) != ticket_category.price:
            raise serializers.ValidationError(
                f"Price mismatch for {ticket_category.name}. "
                f"Expected: {ticket_category.price}, Got: {provided_price}"
            )
    
    def _validate_total_amount(self, validated_tickets):
        """Validate total amount matches calculated total"""
        calculated_total = sum(
            ticket['category'].price * ticket['quantity']
            for ticket in validated_tickets
        )
        
        if calculated_total != Decimal(str(self.total_amount)):
            raise serializers.ValidationError(
                f"Total amount mismatch. Calculated: {calculated_total}, Provided: {self.total_amount}"
            )


# ==========================================
# ORDER CREATOR (Single Responsibility)
# ==========================================

class OrderCreator:
    """Handles order creation and ticket inventory management"""
    
    def __init__(self, user, event, total_amount):
        self.user = user
        self.event = event
        self.total_amount = total_amount
    
    def create_order(self, validated_tickets):
        """Create order with items and update inventory"""
        order = self._create_order_instance()
        self._create_order_items(order, validated_tickets)
        return order
    
    def _create_order_instance(self):
        """Create the main order object"""
        return Order.objects.create(
            user=self.user,
            event=self.event,
            total_amount=self.total_amount,
            status='pending'
        )
    
    def _create_order_items(self, order, validated_tickets):
        """Create order items and update ticket quantities"""
        for ticket_data in validated_tickets:
            self._create_order_item(order, ticket_data)
            self._update_ticket_inventory(ticket_data)
    
    def _create_order_item(self, order, ticket_data):
        """Create a single order item"""
        OrderItem.objects.create(
            order=order,
            ticket_category=ticket_data['category'],
            quantity=ticket_data['quantity'],
            price=ticket_data['price']
        )
    
    def _update_ticket_inventory(self, ticket_data):
        """Update ticket category sold quantity"""
        ticket_category = ticket_data['category']
        ticket_category.quantity_sold += ticket_data['quantity']
        ticket_category.save()


# ==========================================
# WRITE SERIALIZERS (Interface Segregation)
# ==========================================

class EventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating events"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'category', 'date', 'time', 
            'location', 'cost', 'capacity', 'image_url', 'is_published'
        ]
    
    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class TicketCategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ticket categories"""
    
    class Meta:
        model = TicketCategory
        fields = ['name', 'description', 'price', 'quantity', 'color', 'features']
    
    def validate_quantity(self, value):
        return TicketCategoryValidator.validate_quantity(value)
    
    def validate_price(self, value):
        return TicketCategoryValidator.validate_price(value)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders - follows Open/Closed Principle"""
    
    event_id = serializers.UUIDField()
    tickets = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of ticket categories with quantity and price"
    )
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField(max_length=50, required=False, default='card')

    def validate(self, data):
        """Validate order data using OrderValidator"""
        event = self._get_event(data['event_id'])
        
        validator = OrderValidator(
            event=event,
            tickets_data=data['tickets'],
            total_amount=data['total_amount']
        )
        
        validated_tickets = validator.validate()
        
        data['event'] = event
        data['validated_tickets'] = validated_tickets
        return data
    
    def _get_event(self, event_id):
        """Get event by ID"""
        try:
            return Event.objects.get(id=event_id, is_published=True)
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found or not published")
    
    def create(self, validated_data):
        """Create order using OrderCreator"""
        creator = OrderCreator(
            user=self.context['request'].user,
            event=validated_data['event'],
            total_amount=validated_data['total_amount']
        )
        
        return creator.create_order(validated_data['validated_tickets'])