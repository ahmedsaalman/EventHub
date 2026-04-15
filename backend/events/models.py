from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import uuid
from django.utils import timezone
from datetime import date  # ADD THIS IMPORT

User = get_user_model()

class Event(models.Model):
    CATEGORY_CHOICES = [
        ('music', 'Music'),
        ('sports', 'Sports'),
        ('arts', 'Arts & Culture'),
        ('food', 'Food & Drink'),
        ('tech', 'Technology'),
        ('business', 'Business'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    date = models.DateField(default=date.today)  # FIXED: Added default
    time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=300)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def total_tickets_sold(self):
        return self.tickets.aggregate(total=models.Sum('quantity_sold'))['total'] or 0
    
    @property
    def is_sold_out(self):
        if not self.capacity:
            return False
        return self.total_tickets_sold >= self.capacity

class TicketCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    quantity_sold = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=7, default='#fbbf24')  # Hex color
    features = models.JSONField(default=list, blank=True)  # List of features
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Ticket categories"
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} - {self.event.title}"
    
    @property
    def available_quantity(self):
        return self.quantity - self.quantity_sold
    
    @property
    def is_sold_out(self):
        return self.available_quantity <= 0


class EventAnalytics(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='analytics')
    page_views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    ticket_views = models.PositiveIntegerField(default=0)
    conversion_rate = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Event analytics"
    
    def __str__(self):
        return f"Analytics - {self.event.title}"
    

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    ticket_category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
