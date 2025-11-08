from rest_framework import serializers
from .models import StudentProfile, AcademicDocument, ResumeAnalysis


class AcademicDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicDocument
        fields = ['id', 'document_type', 'document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = ['id', 'ats_score', 'feedback', 'keywords_found', 'keywords_missing', 'formatting_issues', 'analyzed_at']
        read_only_fields = ['id', 'analyzed_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    documents = AcademicDocumentSerializer(many=True, read_only=True)
    resume_analyses = ResumeAnalysisSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'enrollment_number', 'department', 'course', 'year',
            'cgpa', 'phone', 'address', 'skills', 'resume', 'profile_picture',
            'documents', 'resume_analyses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'enrollment_number', 'department', 'course', 'year',
            'cgpa', 'phone', 'address', 'skills', 'resume', 'profile_picture'
        ]


