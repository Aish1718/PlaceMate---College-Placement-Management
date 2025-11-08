from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('placement_coordinator', 'Placement Coordinator'),
        ('college_management', 'College Management'),
        ('company', 'Company/Recruiter'),
    ]
    
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


