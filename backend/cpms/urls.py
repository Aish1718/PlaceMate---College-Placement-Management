"""
URL configuration for cpms project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import dashboard_stats, export_placement_report, export_students_report

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/recruitment-drives/', include('recruitment_drives.urls')),
    path('api/events/', include('events.urls')),
    path('api/dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    path('api/dashboard/export/placement/', export_placement_report, name='export_placement_report'),
    path('api/dashboard/export/students/', export_students_report, name='export_students_report'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

