from django.contrib import admin
from .models import Event, TicketCategory, EventAnalytics

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'category', 'date', 'location', 'is_published', 'created_at']
    list_filter = ['category', 'is_published', 'created_at']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'event', 'price', 'quantity', 'quantity_sold', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'event__title']



@admin.register(EventAnalytics)
class EventAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['event', 'page_views', 'unique_visitors', 'ticket_views', 'last_updated']
    readonly_fields = ['page_views', 'unique_visitors', 'ticket_views', 'conversion_rate', 'last_updated']
