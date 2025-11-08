from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('job_posted', 'New Job Posted'),
        ('application_received', 'Application Received'),
        ('application_status_changed', 'Application Status Changed'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('announcement', 'Announcement'),
        ('job_recommendation', 'Job Recommendation'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.URLField(null=True, blank=True, help_text="Optional link to related resource")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"


