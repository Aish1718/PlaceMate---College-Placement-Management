from django.contrib import admin
from .models import CampusEvent, EventRegistration

@admin.register(CampusEvent)
class CampusEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'event_date', 'location', 'organizer', 'status', 'is_approved']
    list_filter = ['event_type', 'status', 'is_approved', 'event_date']
    search_fields = ['title', 'organizer', 'location']
    date_hierarchy = 'event_date'

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['student', 'event', 'registered_at', 'attended']
    list_filter = ['attended', 'registered_at']
    search_fields = ['student__user__username', 'event__title']
