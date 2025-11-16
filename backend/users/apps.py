from django.apps import AppConfig
from django.db.models.signals import post_migrate


def create_test_users_on_first_install(sender, **kwargs):
    """
    Automatically create test users after migrations if no users exist.
    This only runs on first installation.
    """
    # Only run for the users app
    if sender.name != 'users':
        return

    from users.models import User
    from students.models import StudentProfile
    from companies.models import Company

    # Only run if no users exist (first installation)
    if User.objects.count() > 0:
        return

    # Create Student User
    student_user = User.objects.create_user(
        username='student1',
        email='student1@placemate.com',
        password='student123',
        role='student',
        first_name='John',
        last_name='Doe',
        is_approved=True
    )
    StudentProfile.objects.create(
        user=student_user,
        enrollment_number='STU001',
        department='Computer Science',
        course='B.Tech',
        year=4,
        cgpa=8.5,
        phone='9876543210',
        address='123 College Street',
        skills='Python, JavaScript, React, Django'
    )

    # Create Company User
    company_user = User.objects.create_user(
        username='company1',
        email='company1@placemate.com',
        password='company123',
        role='company',
        first_name='Tech',
        last_name='Corp',
        is_approved=True
    )
    Company.objects.create(
        user=company_user,
        company_name='Tech Solutions Inc.',
        industry='Information Technology',
        website='https://techsolutions.com',
        description='Leading IT solutions provider',
        address='123 Business Park, Bangalore, India',
        phone='080-12345678'
    )

    # Create Placement Coordinator User
    User.objects.create_user(
        username='coordinator1',
        email='coordinator1@placemate.com',
        password='coordinator123',
        role='placement_coordinator',
        first_name='Placement',
        last_name='Coordinator',
        is_approved=True
    )

    # Create College Management User
    User.objects.create_user(
        username='management1',
        email='management1@placemate.com',
        password='management123',
        role='college_management',
        first_name='College',
        last_name='Management',
        is_approved=True
    )

    # Create Admin User (Superuser)
    User.objects.create_user(
        username='admin',
        email='admin@placemate.com',
        password='admin123',
        role='placement_coordinator',
        first_name='System',
        last_name='Administrator',
        is_approved=True,
        is_superuser=True,
        is_staff=True
    )

    print("\n" + "=" * 60)
    print("FIRST INSTALLATION DETECTED")
    print("Test users created automatically!")
    print("=" * 60)
    print("Test credentials:")
    print("  Student: student1 / student123")
    print("  Company: company1 / company123")
    print("  Coordinator: coordinator1 / coordinator123")
    print("  Management: management1 / management123")
    print("  Admin: admin / admin123")
    print("=" * 60 + "\n")


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        # Connect the signal to run after migrations
        post_migrate.connect(create_test_users_on_first_install, sender=self)