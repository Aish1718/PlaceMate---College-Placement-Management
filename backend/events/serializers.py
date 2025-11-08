from rest_framework import serializers
from .models import CampusEvent, EventRegistration
from companies.serializers import CompanySerializer
from students.serializers import StudentProfileSerializer
from companies.models import Company


class CampusEventSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    registered_count = serializers.IntegerField(source='registrations.count', read_only=True)
    
    class Meta:
        model = CampusEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'event_date', 'location',
            'venue', 'organizer', 'company', 'company_id', 'max_participants',
            'registration_required', 'status', 'is_approved', 'created_by',
            'created_by_name', 'registered_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.context.get('request') and hasattr(self.context['request'], 'user'):
            user = self.context['request'].user
            if user.role == 'company':
                self.fields['company_id'].queryset = Company.objects.filter(user=user)
            else:
                self.fields['company_id'].queryset = Company.objects.all()
        else:
            self.fields['company_id'].queryset = Company.objects.all()


class CampusEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusEvent
        fields = [
            'title', 'description', 'event_type', 'event_date', 'location',
            'venue', 'organizer', 'company', 'max_participants', 'registration_required', 'status'
        ]


class EventRegistrationSerializer(serializers.ModelSerializer):
    event = CampusEventSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=CampusEvent.objects.filter(registration_required=True, is_approved=True), 
        source='event', write_only=True, required=False
    )
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'event_id', 'student', 'registered_at', 'attended', 'notes'
        ]
        read_only_fields = ['id', 'registered_at', 'student']
    


class EventRegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['event']

