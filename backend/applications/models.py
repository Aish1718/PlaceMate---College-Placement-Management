from django.db import models
from django.contrib.auth import get_user_model
from jobs.models import JobPosting
from students.models import StudentProfile

User = get_user_model()


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('rejected', 'Rejected'),
        ('offer', 'Offer Extended'),
        ('accepted', 'Offer Accepted'),
        ('declined', 'Offer Declined'),
    ]
    
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    cover_letter = models.TextField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_location = models.CharField(max_length=200, null=True, blank=True)
    notes = models.TextField(null=True, blank=True, help_text="Internal notes for recruiters")

    class Meta:
        unique_together = ['student', 'job']
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.job.title}"


