from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'created_at', 'link'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['recipient', 'title', 'message', 'notification_type', 'link']


