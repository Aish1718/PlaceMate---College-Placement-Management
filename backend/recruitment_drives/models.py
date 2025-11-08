from django.db import models
from django.contrib.auth import get_user_model
from companies.models import Company
from jobs.models import JobPosting

User = get_user_model()


class RecruitmentDrive(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='recruitment_drives')
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='recruitment_drives', null=True, blank=True)
    title = models.CharField(max_length=200, help_text="Title of the recruitment drive")
    description = models.TextField(help_text="Description of the recruitment drive")
    drive_date = models.DateTimeField(help_text="Date and time of the recruitment drive")
    location = models.CharField(max_length=200, help_text="Location of the drive")
    venue = models.CharField(max_length=200, help_text="Specific venue/room")
    coordinator_notes = models.TextField(null=True, blank=True, help_text="Internal notes for coordinators")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    is_approved = models.BooleanField(default=False, help_text="Approved by coordinator")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_drives')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-drive_date']
        verbose_name = "Recruitment Drive"
        verbose_name_plural = "Recruitment Drives"

    def __str__(self):
        return f"{self.title} - {self.company.company_name} ({self.drive_date.strftime('%Y-%m-%d')})"
