from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobPosting
from .serializers import JobPostingSerializer, JobPostingCreateSerializer
from companies.models import Company


class JobPostingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'department', 'is_active', 'is_approved']
    search_fields = ['title', 'description', 'required_skills', 'department']
    ordering_fields = ['created_at', 'application_deadline', 'salary_min']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = JobPosting.objects.all()
        
        if user.is_superuser:
            # Admins see all jobs
            return queryset
        if user.role == 'student':
            # Students see only approved and active jobs
            queryset = queryset.filter(is_active=True, is_approved=True)
        elif user.role == 'company':
            # Companies see their own jobs
            try:
                company = Company.objects.get(user=user)
                queryset = queryset.filter(company=company)
            except Company.DoesNotExist:
                queryset = queryset.none()
        elif user.role in ['placement_coordinator', 'college_management']:
            # Coordinators and management see all jobs
            pass
        else:
            queryset = queryset.none()
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JobPostingCreateSerializer
        return JobPostingSerializer
    
    def perform_create(self, serializer):
        if self.request.user.role == 'company':
            company = Company.objects.get(user=self.request.user)
            serializer.save(company=company)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=403)
        
        job = self.get_object()
        was_approved = job.is_approved
        job.is_approved = True
        job.save()
        
        # Notify all students when job is approved (only if it wasn't already approved)
        if not was_approved:
            from django.contrib.auth import get_user_model
            from notifications.models import Notification
            User = get_user_model()
            students = User.objects.filter(role='student', is_approved=True)
            notifications = []
            for student in students:
                notifications.append(Notification(
                    recipient=student,
                    title=f"New Job Posted: {job.title}",
                    message=f"A new {job.job_type} position has been posted by {job.company.company_name}",
                    notification_type='job_posted',
                    link=f"/dashboard"
                ))
            Notification.objects.bulk_create(notifications)
        
        return Response({'message': 'Job posting approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=403)
        
        job = self.get_object()
        job.is_approved = False
        job.is_active = False
        job.save()
        return Response({'message': 'Job posting rejected'})


