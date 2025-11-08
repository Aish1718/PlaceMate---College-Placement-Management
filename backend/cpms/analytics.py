from django.db.models import Count, Avg, Q
from students.models import StudentProfile
from jobs.models import JobPosting
from applications.models import Application
from companies.models import Company


def get_dashboard_stats(user):
    """Get dashboard statistics based on user role"""
    stats = {}
    
    if user.role == 'student':
        try:
            student = StudentProfile.objects.get(user=user)
            stats = {
                'total_applications': Application.objects.filter(student=student).count(),
                'pending_applications': Application.objects.filter(student=student, status='applied').count(),
                'shortlisted': Application.objects.filter(student=student, status='shortlisted').count(),
                'offers': Application.objects.filter(student=student, status='offer').count(),
            }
        except StudentProfile.DoesNotExist:
            stats = {}
    
    elif user.role == 'company':
        try:
            company = Company.objects.get(user=user)
            jobs = JobPosting.objects.filter(company=company)
            stats = {
                'total_jobs': jobs.count(),
                'active_jobs': jobs.filter(is_active=True).count(),
                'total_applications': Application.objects.filter(job__in=jobs).count(),
                'pending_review': Application.objects.filter(job__in=jobs, status='applied').count(),
            }
        except Company.DoesNotExist:
            stats = {}
    
    elif user.role == 'placement_coordinator':
        stats = {
            'total_students': StudentProfile.objects.count(),
            'total_companies': Company.objects.count(),
            'total_jobs': JobPosting.objects.count(),
            'active_jobs': JobPosting.objects.filter(is_active=True).count(),
            'total_applications': Application.objects.count(),
            'pending_approvals': JobPosting.objects.filter(is_approved=False).count(),
        }
    
    elif user.role == 'college_management':
        total_students = StudentProfile.objects.count()
        placed_students = Application.objects.filter(status__in=['offer', 'accepted']).values('student').distinct().count()
        
        stats = {
            'total_students': total_students,
            'placed_students': placed_students,
            'placement_rate': round((placed_students / total_students * 100) if total_students > 0 else 0, 2),
            'total_companies': Company.objects.count(),
            'total_jobs': JobPosting.objects.count(),
            'total_applications': Application.objects.count(),
            'avg_salary': Application.objects.filter(
                status__in=['offer', 'accepted'],
                job__salary_min__isnull=False
            ).aggregate(avg=Avg('job__salary_min'))['avg'] or 0,
        }
        
        # Department-wise stats
        dept_stats = StudentProfile.objects.values('department').annotate(
            total=Count('id'),
            placed=Count('applications', filter=Q(applications__status__in=['offer', 'accepted']))
        )
        stats['department_stats'] = list(dept_stats)
    
    return stats

