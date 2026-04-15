"""
Business logic services for events module.
Follows Single Responsibility Principle - each service handles one domain concern.
"""

from django.db import transaction
from .models import Event, Order, TicketCategory


class EventService:
    """Service for event-related business logic"""
    
    @staticmethod
    def publish_event(event):
        """Publish an event"""
        event.is_published = True
        event.save()
        return event
    
    @staticmethod
    def unpublish_event(event):
        """Unpublish an event"""
        event.is_published = False
        event.save()
        return event
    
    @staticmethod
    @transaction.atomic
    def toggle_event_status(event):
        """Toggle event publication status"""
        event.is_published = not event.is_published
        event.save()
        return event


class TicketInventoryService:
    """Service for ticket inventory management"""
    
    @staticmethod
    def check_availability(ticket_category, quantity):
        """Check if tickets are available"""
        return ticket_category.available_quantity >= quantity
    
    @staticmethod
    @transaction.atomic
    def reserve_tickets(ticket_category, quantity):
        """Reserve tickets (update sold quantity)"""
        if not TicketInventoryService.check_availability(ticket_category, quantity):
            raise ValueError("Not enough tickets available")
        
        ticket_category.quantity_sold += quantity
        ticket_category.save()
        return ticket_category


class OrderService:
    """Service for order-related business logic"""
    
    @staticmethod
    @transaction.atomic
    def process_order(order):
        """Process order payment and fulfillment"""
        # Add payment processing logic here
        order.status = 'completed'
        order.save()
        return order
    
    @staticmethod
    @transaction.atomic
    def cancel_order(order):
        """Cancel order and restore ticket inventory"""
        # Restore ticket quantities
        for item in order.items.all():
            ticket_category = item.ticket_category
            ticket_category.quantity_sold -= item.quantity
            ticket_category.save()
        
        order.status = 'cancelled'
        order.save()
        return order
