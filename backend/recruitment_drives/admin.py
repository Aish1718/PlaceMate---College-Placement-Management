from django.contrib import admin
from .models import RecruitmentDrive

@admin.register(RecruitmentDrive)
class RecruitmentDriveAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'drive_date', 'location', 'status', 'is_approved']
    list_filter = ['status', 'is_approved', 'drive_date']
    search_fields = ['title', 'company__company_name', 'location']
    date_hierarchy = 'drive_date'
