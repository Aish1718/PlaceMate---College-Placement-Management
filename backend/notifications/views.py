from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if notification.recipient != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def send_announcement(self, request):
        """Send announcement to all students - only for coordinators and management"""
        if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        title = request.data.get('title')
        message = request.data.get('message')
        target_role = request.data.get('target_role', 'student')  # student, company, or all
        
        if not title or not message:
            return Response({'error': 'Title and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if target_role == 'all':
            recipients = User.objects.filter(is_approved=True)
        elif target_role == 'student':
            recipients = User.objects.filter(role='student', is_approved=True)
        elif target_role == 'company':
            recipients = User.objects.filter(role='company', is_approved=True)
        else:
            recipients = User.objects.filter(role=target_role, is_approved=True)
        
        notifications = []
        for recipient in recipients:
            notifications.append(Notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='announcement',
                link=request.data.get('link', '')
            ))
        
        Notification.objects.bulk_create(notifications)
        return Response({
            'message': f'Announcement sent to {len(notifications)} users',
            'sent_count': len(notifications)
        }, status=status.HTTP_201_CREATED)


