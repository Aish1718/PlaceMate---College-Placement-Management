from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import CampusEvent, EventRegistration
from .serializers import (
    CampusEventSerializer, CampusEventCreateSerializer,
    EventRegistrationSerializer, EventRegistrationCreateSerializer
)
from students.models import StudentProfile
from notifications.models import Notification
from companies.models import Company


class CampusEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'status', 'is_approved']
    search_fields = ['title', 'description', 'location', 'venue', 'organizer']
    ordering_fields = ['event_date', 'created_at']
    ordering = ['-event_date']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser:
            return CampusEvent.objects.all()
        
        if user.role in ['placement_coordinator', 'college_management']:
            return CampusEvent.objects.all()
        
        elif user.role == 'company':
            from companies.models import Company
            try:
                company = Company.objects.get(user=user)
                return CampusEvent.objects.filter(company=company)
            except Company.DoesNotExist:
                return CampusEvent.objects.none()
        
        elif user.role == 'student':
            # Students can view approved events
            return CampusEvent.objects.filter(is_approved=True)
        
        return CampusEvent.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampusEventCreateSerializer
        return CampusEventSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        # Auto-set company for company users if not provided
        if user.role == 'company':
            try:
                company = Company.objects.get(user=user)
                # Company users need approval
                serializer.save(created_by=user, company=company)
            except Company.DoesNotExist:
                # If no company profile, save without company
                serializer.save(created_by=user)
        else:
            # Auto-approve if created by coordinator/management
            if user.role in ['placement_coordinator', 'college_management']:
                serializer.save(created_by=user, is_approved=True)
            else:
                serializer.save(created_by=user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a campus event - only for coordinators and management"""
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        event = self.get_object()
        event.is_approved = True
        event.save()
        
        # Notify students about the event if registration is required
        if event.registration_required:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            students = User.objects.filter(role='student', is_approved=True)
            notifications = []
            for student in students:
                notifications.append(Notification(
                    recipient=student,
                    title=f"New Event: {event.title}",
                    message=f"{event.organizer} is organizing {event.get_event_type_display()} on {event.event_date.strftime('%Y-%m-%d')} at {event.location}. Registration required.",
                    notification_type='announcement',
                    link=f"/dashboard"
                ))
            if notifications:
                Notification.objects.bulk_create(notifications)
        
        return Response({'message': 'Event approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a campus event - only for coordinators and management"""
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        event = self.get_object()
        event.is_approved = False
        event.status = 'cancelled'
        event.save()
        return Response({'message': 'Event rejected'})
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get all registrations for an event"""
        event = self.get_object()
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        registrations = EventRegistration.objects.filter(event=event)
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser or user.role in ['placement_coordinator', 'college_management']:
            return EventRegistration.objects.all()
        
        elif user.role == 'student':
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return EventRegistration.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return EventRegistration.objects.none()
        
        return EventRegistration.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventRegistrationCreateSerializer
        return EventRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'Only students can register for events'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = serializer.validated_data['event']
        
        # Check if already registered
        if EventRegistration.objects.filter(student=student_profile, event=event).exists():
            return Response({'error': 'Already registered for this event'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event has space
        if event.max_participants:
            current_registrations = EventRegistration.objects.filter(event=event).count()
            if current_registrations >= event.max_participants:
                return Response({'error': 'Event is full'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        
        registration = serializer.save(student=student_profile)
        
        return Response(EventRegistrationSerializer(registration).data, 
                      status=status.HTTP_201_CREATED)
