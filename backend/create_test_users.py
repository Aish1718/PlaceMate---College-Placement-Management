#!/usr/bin/env python
"""
Script to create test users for all roles
This script only runs on first installation when there are no users in the database.
Run with: python manage.py shell < create_test_users.py
Or: python manage.py shell
Then copy-paste the code below
"""

import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cpms.settings')
django.setup()

from users.models import User
from students.models import StudentProfile
from companies.models import Company

# Check if any users exist in the database
user_count = User.objects.count()

if user_count > 0:
    print("=" * 60)
    print("SKIPPING TEST USER CREATION")
    print("=" * 60)
    print(f"Found {user_count} existing user(s) in the database.")
    print("This script only runs on first installation when there are no users.")
    print("If you want to recreate test users, please delete existing users first.")
    print()
    sys.exit(0)

print("=" * 60)
print("FIRST INSTALLATION DETECTED")
print("Creating test users for all roles...")
print("=" * 60)
print()

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
print(f"✅ Student created:")
print(f"   Username: student1")
print(f"   Email: student1@placemate.com")
print(f"   Password: student123")
print(f"   Enrollment: STU001")
print()

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
print(f"✅ Company created:")
print(f"   Username: company1")
print(f"   Email: company1@placemate.com")
print(f"   Password: company123")
print(f"   Company: Tech Solutions Inc.")
print()

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
print(f"✅ Placement Coordinator created:")
print(f"   Username: coordinator1")
print(f"   Email: coordinator1@placemate.com")
print(f"   Password: coordinator123")
print()

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
print(f"✅ College Management created:")
print(f"   Username: management1")
print(f"   Email: management1@placemate.com")
print(f"   Password: management123")
print()

# Create Admin User (Superuser)
admin_user = User.objects.create_user(
    username='admin',
    email='admin@placemate.com',
    password='admin123',
    role='placement_coordinator',  # Admin uses coordinator role but with is_superuser=True
    first_name='System',
    last_name='Administrator',
    is_approved=True,
    is_superuser=True,
    is_staff=True
)
print(f"✅ Admin (Superuser) created:")
print(f"   Username: admin")
print(f"   Email: admin@placemate.com")
print(f"   Password: admin123")
print(f"   ⚠️  This user has full system access!")
print()

print("=" * 60)
print("ALL TEST USERS CREATED SUCCESSFULLY!")
print("=" * 60)