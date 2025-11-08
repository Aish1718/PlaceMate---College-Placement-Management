from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import RecruitmentDrive
from .serializers import RecruitmentDriveSerializer, RecruitmentDriveCreateSerializer
from companies.models import Company
from notifications.models import Notification


class RecruitmentDriveViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_approved', 'company']
    search_fields = ['title', 'description', 'location', 'venue']
    ordering_fields = ['drive_date', 'created_at']
    ordering = ['-drive_date']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser:
            return RecruitmentDrive.objects.all()
        
        if user.role == 'company':
            try:
                company = Company.objects.get(user=user)
                return RecruitmentDrive.objects.filter(company=company)
            except Company.DoesNotExist:
                return RecruitmentDrive.objects.none()
        
        elif user.role in ['placement_coordinator', 'college_management']:
            return RecruitmentDrive.objects.all()
        
        elif user.role == 'student':
            # Students can view approved drives
            return RecruitmentDrive.objects.filter(is_approved=True)
        
        return RecruitmentDrive.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RecruitmentDriveCreateSerializer
        return RecruitmentDriveSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        # Auto-set company for company users
        if user.role == 'company':
            try:
                company = Company.objects.get(user=user)
                # Auto-approve if created by coordinator/management
                if user.role in ['placement_coordinator', 'college_management']:
                    serializer.save(created_by=user, company=company, is_approved=True)
                else:
                    serializer.save(created_by=user, company=company)
            except Company.DoesNotExist:
                raise serializers.ValidationError({'company': 'Company profile not found'})
        else:
            # Auto-approve if created by coordinator/management
            if user.role in ['placement_coordinator', 'college_management']:
                serializer.save(created_by=user, is_approved=True)
            else:
                serializer.save(created_by=user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a recruitment drive - only for coordinators and management"""
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        drive = self.get_object()
        drive.is_approved = True
        drive.save()
        
        # Notify students about the recruitment drive
        from django.contrib.auth import get_user_model
        User = get_user_model()
        students = User.objects.filter(role='student', is_approved=True)
        notifications = []
        for student in students:
            notifications.append(Notification(
                recipient=student,
                title=f"Recruitment Drive: {drive.title}",
                message=f"{drive.company.company_name} is conducting a recruitment drive on {drive.drive_date.strftime('%Y-%m-%d')} at {drive.location}",
                notification_type='announcement',
                link=f"/dashboard"
            ))
        if notifications:
            Notification.objects.bulk_create(notifications)
        
        return Response({'message': 'Recruitment drive approved and students notified'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a recruitment drive - only for coordinators and management"""
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        drive = self.get_object()
        drive.is_approved = False
        drive.status = 'cancelled'
        drive.save()
        return Response({'message': 'Recruitment drive rejected'})
