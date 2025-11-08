from django.db import models
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()


class JobPosting(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=200)
    description = models.TextField()
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    department = models.CharField(max_length=100, help_text="Target department (e.g., Computer Science, Mechanical)")
    required_skills = models.TextField(help_text="Comma-separated list of skills")
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=200)
    application_deadline = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company.company_name}"


