from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationUpdateSerializer
)
from jobs.models import JobPosting
from students.models import StudentProfile
from notifications.models import Notification


class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'job']
    ordering_fields = ['applied_at', 'updated_at']
    ordering = ['-applied_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'student':
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return Application.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return Application.objects.none()
        
        elif user.role == 'company':
            from companies.models import Company
            try:
                company = Company.objects.get(user=user)
                jobs = JobPosting.objects.filter(company=company)
                return Application.objects.filter(job__in=jobs)
            except Company.DoesNotExist:
                return Application.objects.none()
        
        elif user.is_superuser or user.role in ['placement_coordinator', 'college_management']:
            return Application.objects.all()
        
        return Application.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ApplicationUpdateSerializer
        return ApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'Only students can create applications'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        job = serializer.validated_data['job']
        
        # Check if already applied
        if Application.objects.filter(student=student_profile, job=job).exists():
            return Response({'error': 'Already applied to this job'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        application = serializer.save(student=student_profile)
        
        # Create notification for company
        Notification.objects.create(
            recipient=job.company.user,
            title=f"New Application: {job.title}",
            message=f"{student_profile.user.get_full_name()} has applied for {job.title}",
            notification_type='application_received'
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        if request.user.role not in ['company', 'placement_coordinator']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application = self.get_object()
        old_status = application.status
        
        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Create notification if status changed
        if 'status' in request.data and request.data['status'] != old_status:
            if request.data['status'] == 'interview_scheduled':
                Notification.objects.create(
                    recipient=application.student.user,
                    title=f"Interview Scheduled: {application.job.title}",
                    message=f"Your interview has been scheduled for {application.job.title} at {application.job.company.company_name}",
                    notification_type='interview_scheduled',
                    link=f"/dashboard"
                )
            else:
                Notification.objects.create(
                    recipient=application.student.user,
                    title=f"Application Status Updated: {application.job.title}",
                    message=f"Your application status has been updated to {application.get_status_display()}",
                    notification_type='application_status_changed'
                )
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download_resume(self, request, pk=None):
        application = self.get_object()
        if application.student.resume:
            from django.http import FileResponse
            return FileResponse(application.student.resume.open(), as_attachment=True)
        return Response({'error': 'No resume available'}, status=status.HTTP_404_NOT_FOUND)

