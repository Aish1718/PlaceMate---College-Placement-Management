from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
import csv
import json
from .analytics import get_dashboard_stats
from students.models import StudentProfile
from applications.models import Application
from jobs.models import JobPosting
from companies.models import Company


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the current user"""
    stats = get_dashboard_stats(request.user)
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_placement_report(request):
    """Export placement report as CSV - only for management and coordinators"""
    if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=403)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="placement_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Student Name', 'Enrollment', 'Department', 'CGPA', 'Job Title',
        'Company', 'Status', 'Salary', 'Applied Date'
    ])
    
    applications = Application.objects.filter(status__in=['offer', 'accepted']).select_related('student', 'job', 'job__company')
    for app in applications:
        writer.writerow([
            app.student.user.get_full_name() or app.student.user.username,
            app.student.enrollment_number,
            app.student.department,
            app.student.cgpa or '',
            app.job.title,
            app.job.company.company_name,
            app.get_status_display(),
            app.job.salary_min or '',
            app.applied_at.strftime('%Y-%m-%d') if app.applied_at else ''
        ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_students_report(request):
    """Export all students report as CSV"""
    if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=403)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="students_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Name', 'Enrollment', 'Department', 'Course', 'Year', 'CGPA',
        'Skills', 'Phone', 'Total Applications', 'Status'
    ])
    
    students = StudentProfile.objects.all().select_related('user')
    for student in students:
        apps = Application.objects.filter(student=student)
        total_apps = apps.count()
        has_offer = apps.filter(status__in=['offer', 'accepted']).exists()
        status = 'Placed' if has_offer else 'Not Placed'
        
        writer.writerow([
            student.user.get_full_name() or student.user.username,
            student.enrollment_number,
            student.department,
            student.course,
            student.year,
            student.cgpa or '',
            student.skills or '',
            student.phone or '',
            total_apps,
            status
        ])
    
    return response


