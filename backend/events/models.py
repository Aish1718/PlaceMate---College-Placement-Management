from django.db import models
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()


class CampusEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('info_session', 'Information Session'),
        ('career_fair', 'Career Fair'),
        ('networking', 'Networking Event'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    event_date = models.DateTimeField(help_text="Date and time of the event")
    location = models.CharField(max_length=200)
    venue = models.CharField(max_length=200, help_text="Specific venue/room")
    organizer = models.CharField(max_length=200, help_text="Event organizer name")
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='events', help_text="Associated company (if any)")
    max_participants = models.IntegerField(null=True, blank=True, help_text="Maximum number of participants")
    registration_required = models.BooleanField(default=False, help_text="Whether registration is required")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    is_approved = models.BooleanField(default=False, help_text="Approved by coordinator")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date']
        verbose_name = "Campus Event"
        verbose_name_plural = "Campus Events"

    def __str__(self):
        return f"{self.title} ({self.event_date.strftime('%Y-%m-%d')})"


class EventRegistration(models.Model):
    event = models.ForeignKey(CampusEvent, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='event_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False, help_text="Whether the student attended the event")
    notes = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ['event', 'student']
        ordering = ['-registered_at']
        verbose_name = "Event Registration"
        verbose_name_plural = "Event Registrations"

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.event.title}"
