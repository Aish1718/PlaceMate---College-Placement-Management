from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import StudentProfile, AcademicDocument, ResumeAnalysis
from .serializers import (
    StudentProfileSerializer,
    StudentProfileCreateSerializer,
    AcademicDocumentSerializer,
    ResumeAnalysisSerializer,
)
from jobs.models import JobPosting
from jobs.serializers import JobPostingSerializer


class StudentProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return StudentProfile.objects.all()
        if self.request.user.role == 'student':
            return StudentProfile.objects.filter(user=self.request.user)
        elif self.request.user.role in ['placement_coordinator', 'college_management']:
            return StudentProfile.objects.all()
        return StudentProfile.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentProfileCreateSerializer
        return StudentProfileSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        profile = self.get_object()
        serializer = AcademicDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def analyze_resume(self, request, pk=None):
        profile = self.get_object()
        if not profile.resume:
            return Response({'error': 'No resume uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Simple ATS analysis (can be enhanced with ML/NLP)
        ats_score, feedback, keywords_found, keywords_missing, formatting_issues = analyze_resume_ats(profile)
        
        analysis = ResumeAnalysis.objects.create(
            student=profile,
            ats_score=ats_score,
            feedback=feedback,
            keywords_found=keywords_found,
            keywords_missing=keywords_missing,
            formatting_issues=formatting_issues
        )
        
        serializer = ResumeAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Only students can access recommendations'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get job recommendations based on student profile
        skills = [s.strip().lower() for s in profile.skills.split(',') if s.strip()]
        department = profile.department.lower()
        
        # Find matching jobs
        jobs = JobPosting.objects.filter(is_active=True)
        recommended_jobs = []
        
        for job in jobs:
            score = 0
            job_skills = [s.strip().lower() for s in job.required_skills.split(',') if s.strip()]
            
            # Match skills
            matched_skills = set(skills) & set(job_skills)
            score += len(matched_skills) * 10
            
            # Match department
            if department in job.department.lower() or job.department.lower() in department:
                score += 20
            
            # CGPA match
            if profile.cgpa and job.min_cgpa:
                if profile.cgpa >= job.min_cgpa:
                    score += 15
            
            if score > 0:
                recommended_jobs.append((score, job))
        
        # Sort by score and return top 10
        recommended_jobs.sort(key=lambda x: x[0], reverse=True)
        recommended_jobs = [job for _, job in recommended_jobs[:10]]
        
        serializer = JobPostingSerializer(recommended_jobs, many=True)
        return Response(serializer.data)


def analyze_resume_ats(profile):
    """Simple ATS resume analyzer"""
    # This is a basic implementation - can be enhanced with NLP/ML
    common_keywords = [
        'python', 'java', 'javascript', 'react', 'django', 'sql', 'git',
        'communication', 'leadership', 'teamwork', 'problem solving',
        'project management', 'agile', 'scrum'
    ]
    
    if not profile.resume:
        return 0, "No resume uploaded", "", "", ""
    
    try:
        # Read resume content (assuming it's a text file or PDF)
        # For production, use libraries like PyPDF2 or pdfplumber for PDFs
        resume_text = ""
        if profile.resume.name.endswith('.txt'):
            resume_text = profile.resume.read().decode('utf-8').lower()
        else:
            # For PDFs, you'd need to extract text first
            resume_text = ""  # Placeholder
        
        found_keywords = []
        missing_keywords = []
        
        for keyword in common_keywords:
            if keyword in resume_text:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        # Calculate score
        score = int((len(found_keywords) / len(common_keywords)) * 100)
        
        feedback = f"Found {len(found_keywords)} out of {len(common_keywords)} common keywords. "
        if score < 50:
            feedback += "Consider adding more relevant keywords to improve ATS compatibility."
        elif score < 75:
            feedback += "Good keyword coverage. Consider adding a few more relevant terms."
        else:
            feedback += "Excellent keyword coverage!"
        
        formatting_issues = "Ensure consistent formatting, use standard fonts, and avoid complex layouts."
        
        return score, feedback, ", ".join(found_keywords), ", ".join(missing_keywords[:5]), formatting_issues
    
    except Exception as e:
        return 50, f"Analysis completed with limitations: {str(e)}", "", "", ""

