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

        # Refresh the profile to ensure file field is up to date
        profile.refresh_from_db()

        # Delete old analyses for this student to ensure fresh analysis
        ResumeAnalysis.objects.filter(student=profile).delete()

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


def extract_text_from_file(file_field):
    """Extract text from various file formats"""
    try:
        if not file_field:
            return ""

        file_name = file_field.name.lower() if hasattr(file_field, 'name') else str(file_field).lower()

        # Get file path if available (preferred for PDF libraries)
        file_path = None
        try:
            if hasattr(file_field, 'path'):
                file_path = file_field.path
                # Verify file exists
                import os
                if not os.path.exists(file_path):
                    file_path = None
        except (OSError, IOError, AttributeError, ValueError):
            file_path = None

        # Open the file properly - Django FileField needs to be opened
        file_obj = None
        try:
            if file_path:
                file_obj = open(file_path, 'rb')
            else:
                # Use the open() method which returns a file-like object
                file_obj = file_field.open('rb')
        except Exception as e:
            return f"Error opening file: {str(e)}. File may not exist or is inaccessible."

        try:
            if file_name.endswith('.txt'):
                content = file_obj.read()
                return content.decode('utf-8', errors='ignore')

            elif file_name.endswith('.pdf'):
                text = ""

                # Try pdfplumber first (better text extraction)
                # pdfplumber works better with file paths
                try:
                    import pdfplumber
                    if file_path:
                        # Use file path (preferred)
                        with pdfplumber.open(file_path) as pdf:
                            for page in pdf.pages:
                                page_text = page.extract_text()
                                if page_text and page_text.strip():
                                    text += page_text + "\n"
                    else:
                        # Use file object
                        file_obj.seek(0)
                        with pdfplumber.open(file_obj) as pdf:
                            for page in pdf.pages:
                                page_text = page.extract_text()
                                if page_text and page_text.strip():
                                    text += page_text + "\n"

                    if text.strip() and len(text.strip()) > 50:
                        return text
                except ImportError:
                    pass
                except Exception as e:
                    # If pdfplumber fails, try PyPDF2
                    pass

                # Fallback to PyPDF2
                try:
                    import PyPDF2
                    file_obj.seek(0)
                    pdf_reader = PyPDF2.PdfReader(file_obj)
                    text = ""
                    for page in pdf_reader.pages:
                        try:
                            page_text = page.extract_text()
                            if page_text and page_text.strip():
                                text += page_text + "\n"
                        except Exception:
                            continue

                    if text.strip() and len(text.strip()) > 50:
                        return text
                    elif text.strip():
                        return text  # Return even if short, let the analyzer decide
                    else:
                        return "PDF appears to be image-based or empty. Please ensure your PDF contains selectable text (not scanned images)."
                except ImportError:
                    return "PDF parsing libraries not installed. Please install PyPDF2 or pdfplumber."
                except Exception as e:
                    return f"Error reading PDF: {str(e)}. The PDF may be corrupted, password-protected, or image-based."

            elif file_name.endswith('.docx'):
                try:
                    from docx import Document
                    file_obj.seek(0)
                    doc = Document(file_obj)
                    text = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
                    return text
                except ImportError:
                    return ""
                except Exception as e:
                    return f"Error reading DOCX: {str(e)}"

            elif file_name.endswith('.doc'):
                # DOC files require additional libraries
                return ""

            return ""
        finally:
            file_obj.close()
    except Exception as e:
        return f"Error extracting text: {str(e)}"


def analyze_resume_ats(profile):
    """ATS resume analyzer with comprehensive keyword and structure analysis"""
    # Comprehensive keyword list covering technical and soft skills
    technical_keywords = [
        'python', 'java', 'javascript', 'react', 'django', 'sql', 'git', 'github',
        'html', 'css', 'node.js', 'express', 'mongodb', 'postgresql', 'mysql',
        'aws', 'docker', 'kubernetes', 'linux', 'rest api', 'graphql',
        'machine learning', 'data science', 'artificial intelligence', 'ai',
        'agile', 'scrum', 'devops', 'ci/cd', 'jenkins', 'terraform'
    ]

    soft_skills_keywords = [
        'communication', 'leadership', 'teamwork', 'problem solving',
        'project management', 'time management', 'critical thinking',
        'collaboration', 'adaptability', 'creativity', 'analytical'
    ]

    # Essential resume sections
    required_sections = [
        'education', 'experience', 'work experience', 'employment',
        'skills', 'technical skills', 'projects', 'achievements',
        'certifications', 'contact', 'email', 'phone'
    ]

    all_keywords = technical_keywords + soft_skills_keywords

    if not profile.resume:
        return 0, "No resume uploaded", "", "", ""

    try:
        # Extract text from resume file
        resume_text_raw = extract_text_from_file(profile.resume)

        # Check if extraction returned an error message
        if resume_text_raw.startswith("Error"):
            return 30, f"Resume extraction failed: {resume_text_raw}. Please ensure the file is in a supported format (PDF, DOCX, or TXT) and is not corrupted.", "", "", "Try re-uploading your resume in PDF or DOCX format."

        if not resume_text_raw or len(resume_text_raw.strip()) < 50:
            file_ext = profile.resume.name.split('.')[-1].lower() if profile.resume.name else 'unknown'
            return 30, f"Unable to extract sufficient text from resume ({file_ext} file). The file may be corrupted, password-protected, or in an unsupported format. Please try uploading a different file.", "", "", f"Supported formats: PDF, DOCX, TXT. Current file type: {file_ext}. Ensure the file is not password-protected and contains readable text."

        resume_text = resume_text_raw.lower()

        # Analyze keywords
        found_keywords = []
        missing_keywords = []

        for keyword in all_keywords:
            if keyword.lower() in resume_text:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)

        # Check for required sections
        found_sections = []
        missing_sections = []
        for section in required_sections:
            if section in resume_text:
                found_sections.append(section)
            else:
                missing_sections.append(section)

        # Calculate base score from keywords (70% weight)
        keyword_score = int((len(found_keywords) / len(all_keywords)) * 70)

        # Calculate section score (20% weight)
        section_score = int((len(found_sections) / len(required_sections)) * 20)

        # Check for formatting indicators (10% weight)
        formatting_score = 0
        formatting_issues_list = []

        # Check for proper structure
        if len(resume_text) < 500:
            formatting_issues_list.append("Resume appears too short. Consider adding more details.")
        elif len(resume_text) > 5000:
            formatting_issues_list.append("Resume may be too long. Keep it concise (1-2 pages).")
        else:
            formatting_score = 10

        # Check for contact information
        has_email = '@' in resume_text or 'email' in resume_text
        has_phone = any(char.isdigit() for char in resume_text) and ('phone' in resume_text or 'mobile' in resume_text or 'contact' in resume_text)

        if has_email and has_phone:
            formatting_score += 0  # Already included
        elif not has_email:
            formatting_issues_list.append("Email address not found. Ensure contact information is included.")
        elif not has_phone:
            formatting_issues_list.append("Phone number not found. Ensure contact information is included.")

        # Calculate total score
        total_score = min(100, keyword_score + section_score + formatting_score)

        # Generate feedback
        feedback_parts = []

        if len(found_keywords) > 0:
            feedback_parts.append(f"Found {len(found_keywords)} relevant keywords out of {len(all_keywords)} common terms.")

        if len(found_sections) >= len(required_sections) * 0.7:
            feedback_parts.append("Good section structure with all essential components.")
        elif len(found_sections) < len(required_sections) * 0.5:
            feedback_parts.append("Missing several important sections. Consider adding: " + ", ".join(missing_sections[:3]) + ".")

        if total_score >= 75:
            feedback_parts.append("Excellent ATS compatibility! Your resume is well-optimized.")
        elif total_score >= 50:
            feedback_parts.append("Good ATS compatibility. Consider adding more relevant keywords to improve further.")
        else:
            feedback_parts.append("Resume needs improvement for better ATS compatibility. Focus on adding relevant keywords and ensuring all sections are present.")

        feedback = " ".join(feedback_parts)

        # Formatting suggestions
        formatting_suggestions = []
        if formatting_issues_list:
            formatting_suggestions.extend(formatting_issues_list)
        else:
            formatting_suggestions.append("Formatting looks good!")

        formatting_suggestions.append("Use standard fonts (Arial, Calibri, Times New Roman).")
        formatting_suggestions.append("Avoid complex layouts, tables, and graphics that ATS systems may not parse correctly.")
        formatting_suggestions.append("Use simple bullet points and clear section headers.")
        formatting_suggestions.append("Save as PDF to preserve formatting while maintaining text readability.")

        formatting_issues = " ".join(formatting_suggestions)

        # Get top missing keywords (prioritize technical skills)
        top_missing = []
        for keyword in missing_keywords:
            if keyword in technical_keywords and len(top_missing) < 5:
                top_missing.append(keyword)
        # Fill remaining slots with soft skills if needed
        for keyword in missing_keywords:
            if keyword in soft_skills_keywords and len(top_missing) < 5:
                top_missing.append(keyword)

        return (
            total_score,
            feedback,
            ", ".join(found_keywords[:15]),  # Limit to top 15 found keywords
            ", ".join(top_missing[:5]),  # Top 5 missing keywords
            formatting_issues
        )

    except Exception as e:
        return 50, f"Analysis completed with limitations: {str(e)}", "", "", "Please ensure your resume file is in a supported format (PDF, DOCX, or TXT)."

