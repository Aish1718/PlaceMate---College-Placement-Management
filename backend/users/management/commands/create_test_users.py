"""
Django management command to create test users.
This command only runs on first installation when there are no users in the database.
Usage: python manage.py create_test_users
"""

from django.core.management.base import BaseCommand
from users.models import User
from students.models import StudentProfile
from companies.models import Company


class Command(BaseCommand):
    help = 'Create test users for all roles (only runs if no users exist)'

    def handle(self, *args, **options):
        # Check if any users exist in the database
        user_count = User.objects.count()

        if user_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"Found {user_count} existing user(s) in the database. "
                    "Skipping test user creation. This command only runs on first installation."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS("First installation detected. Creating test users...")
        )

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
        student_profile = StudentProfile.objects.create(
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
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Student created: student1 / student123 (Enrollment: STU001)"
            )
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
        company = Company.objects.create(
            user=company_user,
            company_name='Tech Solutions Inc.',
            industry='Information Technology',
            website='https://techsolutions.com',
            description='Leading IT solutions provider',
            address='123 Business Park, Bangalore, India',
            phone='080-12345678'
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Company created: company1 / company123 (Tech Solutions Inc.)"
            )
        )

        # Create Placement Coordinator User
        coordinator_user = User.objects.create_user(
            username='coordinator1',
            email='coordinator1@placemate.com',
            password='coordinator123',
            role='placement_coordinator',
            first_name='Placement',
            last_name='Coordinator',
            is_approved=True
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Placement Coordinator created: coordinator1 / coordinator123"
            )
        )

        # Create College Management User
        management_user = User.objects.create_user(
            username='management1',
            email='management1@placemate.com',
            password='management123',
            role='college_management',
            first_name='College',
            last_name='Management',
            is_approved=True
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ College Management created: management1 / management123"
            )
        )

        # Create Admin User (Superuser)
        admin_user = User.objects.create_user(
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
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Admin (Superuser) created: admin / admin123"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "\n" + "=" * 60 + "\n"
                "ALL TEST USERS CREATED SUCCESSFULLY!\n"
                "=" * 60
            )
        )