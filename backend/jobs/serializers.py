from rest_framework import serializers
from .models import JobPosting
from companies.serializers import CompanySerializer
from companies.models import Company


class JobPostingSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False
    )
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'company', 'company_id', 'title', 'description', 'job_type',
            'department', 'required_skills', 'min_cgpa', 'salary_min', 'salary_max',
            'location', 'application_deadline', 'is_active', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.context.get('request') and hasattr(self.context['request'], 'user'):
            user = self.context['request'].user
            if user.role == 'company':
                self.fields['company_id'].queryset = Company.objects.filter(user=user)


class JobPostingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            'title', 'description', 'job_type', 'department', 'required_skills',
            'min_cgpa', 'salary_min', 'salary_max', 'location', 'application_deadline'
        ]

