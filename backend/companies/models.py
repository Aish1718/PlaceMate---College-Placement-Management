from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Company(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    website = models.URLField(null=True, blank=True)
    description = models.TextField()
    address = models.TextField()
    phone = models.CharField(max_length=15)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.company_name


