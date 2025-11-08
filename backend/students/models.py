from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_number = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100)  # B.Tech, M.Tech, etc.
    year = models.IntegerField()
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    skills = models.TextField(help_text="Comma-separated list of skills")
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.enrollment_number}"


class AcademicDocument(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50)  # Transcript, Certificate, etc.
    document = models.FileField(upload_to='academic_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.document_type}"


class ResumeAnalysis(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='resume_analyses')
    ats_score = models.IntegerField(help_text="ATS compatibility score (0-100)")
    feedback = models.TextField()
    keywords_found = models.TextField(help_text="Comma-separated list of keywords found")
    keywords_missing = models.TextField(help_text="Comma-separated list of recommended keywords")
    formatting_issues = models.TextField(null=True, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.get_full_name()} - Score: {self.ats_score}"


