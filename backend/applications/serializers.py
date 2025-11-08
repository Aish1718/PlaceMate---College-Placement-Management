from rest_framework import serializers
from .models import Application
from jobs.serializers import JobPostingSerializer
from jobs.models import JobPosting
from students.serializers import StudentProfileSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobPostingSerializer(read_only=True)
    student = StudentProfileSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=JobPosting.objects.all(), source='job', write_only=True, required=False
    )
    
    class Meta:
        model = Application
        fields = [
            'id', 'student', 'job', 'job_id', 'status', 'cover_letter',
            'applied_at', 'updated_at', 'interview_date', 'interview_location', 'notes'
        ]
        read_only_fields = ['id', 'applied_at', 'updated_at']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(queryset=JobPosting.objects.all())
    
    class Meta:
        model = Application
        fields = ['job', 'cover_letter']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow all jobs in queryset, but validate in the view
        self.fields['job'].queryset = JobPosting.objects.all()
    
    def validate_job(self, value):
        """Validate that the job is active and approved"""
        if value is None:
            raise serializers.ValidationError("Job is required.")
        if not value.is_active:
            raise serializers.ValidationError("This job is no longer active.")
        if not value.is_approved:
            raise serializers.ValidationError("This job is pending approval and cannot accept applications yet.")
        return value


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'interview_date', 'interview_location', 'notes']

