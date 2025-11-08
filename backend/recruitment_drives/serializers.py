from rest_framework import serializers
from .models import RecruitmentDrive
from companies.serializers import CompanySerializer
from jobs.serializers import JobPostingSerializer
from companies.models import Company
from jobs.models import JobPosting


class RecruitmentDriveSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    job = JobPostingSerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False
    )
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=JobPosting.objects.all(), source='job', write_only=True, required=False
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = RecruitmentDrive
        fields = [
            'id', 'company', 'company_id', 'job', 'job_id', 'title', 'description',
            'drive_date', 'location', 'venue', 'coordinator_notes', 'status',
            'is_approved', 'created_by', 'created_by_name', 'created_at', 'updated_at'
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
        self.fields['job_id'].queryset = JobPosting.objects.all()


class RecruitmentDriveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentDrive
        fields = [
            'company', 'job', 'title', 'description', 'drive_date',
            'location', 'venue', 'coordinator_notes', 'status'
        ]
        extra_kwargs = {
            'company': {'required': False},
            'job': {'required': False},
        }

