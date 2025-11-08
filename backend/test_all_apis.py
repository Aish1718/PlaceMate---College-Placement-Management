#!/usr/bin/env python
"""
Comprehensive API Testing Script using Django Test Client
Tests all API endpoints and reports errors
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cpms.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from users.models import User
from students.models import StudentProfile
from companies.models import Company
from jobs.models import JobPosting
from applications.models import Application

User = get_user_model()

# Test results
results = {
    'passed': [],
    'failed': [],
    'errors': []
}

def print_result(test_name, success, message=""):
    if success:
        results['passed'].append(test_name)
        print(f"✅ {test_name}")
    else:
        results['failed'].append(test_name)
        print(f"❌ {test_name}: {message}")
        if message:
            results['errors'].append(f"{test_name}: {message}")

def get_auth_token(client, username, password):
    """Get JWT token for a user"""
    try:
        response = client.post(
            '/api/auth/login/',
            data=json.dumps({"username": username, "password": password}),
            content_type='application/json'
        )
        if response.status_code == 200:
            data = json.loads(response.content)
            return data.get('access')
        return None
    except Exception as e:
        return None

def test_authentication(client):
    print("\n" + "="*60)
    print("TESTING AUTHENTICATION ENDPOINTS")
    print("="*60)
    
    # Test Login
    try:
        response = client.post(
            '/api/auth/login/',
            data=json.dumps({"username": "student1", "password": "student123"}),
            content_type='application/json'
        )
        status_ok = response.status_code == 200
        print_result("POST /api/auth/login/", status_ok, 
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("POST /api/auth/login/", False, str(e))
    
    # Test Register
    try:
        response = client.post(
            '/api/auth/register/',
            data=json.dumps({
                "username": "testuser",
                "email": "test@test.com",
                "password": "testpass123",
                "password2": "testpass123",
                "role": "student",
                "first_name": "Test",
                "last_name": "User"
            }),
            content_type='application/json'
        )
        print_result("POST /api/auth/register/", response.status_code in [200, 201], 
                    f"Status: {response.status_code}")
        # Clean up test user
        User.objects.filter(username='testuser').delete()
    except Exception as e:
        print_result("POST /api/auth/register/", False, str(e))

def test_student_endpoints(client):
    print("\n" + "="*60)
    print("TESTING STUDENT ENDPOINTS")
    print("="*60)
    
    token = get_auth_token(client, "student1", "student123")
    if not token:
        print("❌ Cannot get auth token for student1")
        return
    
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
    
    # Test Get Profile
    try:
        response = client.get('/api/students/profiles/me/', **headers)
        print_result("GET /api/students/profiles/me/", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/students/profiles/me/", False, str(e))
    
    # Test Get All Profiles
    try:
        response = client.get('/api/students/profiles/', **headers)
        print_result("GET /api/students/profiles/", response.status_code in [200, 403],
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/students/profiles/", False, str(e))
    
    # Test Recommendations
    try:
        response = client.get('/api/students/profiles/recommendations/', **headers)
        print_result("GET /api/students/profiles/recommendations/", response.status_code in [200, 400, 404],
                    f"Status: {response.status_code}, Content: {response.content[:100]}")
    except Exception as e:
        print_result("GET /api/students/profiles/recommendations/", False, str(e))

def test_company_endpoints(client):
    print("\n" + "="*60)
    print("TESTING COMPANY ENDPOINTS")
    print("="*60)
    
    token = get_auth_token(client, "company1", "company123")
    if not token:
        print("❌ Cannot get auth token for company1")
        return
    
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
    
    # Test Get Company
    try:
        response = client.get('/api/companies/me/', **headers)
        print_result("GET /api/companies/me/", response.status_code in [200, 404],
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/companies/me/", False, str(e))
    
    # Test Get All Companies
    try:
        response = client.get('/api/companies/', **headers)
        print_result("GET /api/companies/", response.status_code in [200, 403],
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/companies/", False, str(e))

def test_job_endpoints(client):
    print("\n" + "="*60)
    print("TESTING JOB ENDPOINTS")
    print("="*60)
    
    # Test as Student
    token = get_auth_token(client, "student1", "student123")
    if token:
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        try:
            response = client.get('/api/jobs/', **headers)
            print_result("GET /api/jobs/ (as student)", response.status_code == 200,
                        f"Status: {response.status_code}")
        except Exception as e:
            print_result("GET /api/jobs/ (as student)", False, str(e))
    
    # Test as Company
    token = get_auth_token(client, "company1", "company123")
    if token:
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        try:
            response = client.get('/api/jobs/', **headers)
            print_result("GET /api/jobs/ (as company)", response.status_code == 200,
                        f"Status: {response.status_code}")
        except Exception as e:
            print_result("GET /api/jobs/ (as company)", False, str(e))
        
        # Test Create Job
        try:
            response = client.post(
                '/api/jobs/',
                data=json.dumps({
                    "title": "Test Software Engineer",
                    "description": "Test job description",
                    "job_type": "full_time",
                    "department": "Computer Science",
                    "required_skills": "Python, JavaScript",
                    "min_cgpa": "7.0",
                    "salary_min": "500000",
                    "salary_max": "800000",
                    "location": "Bangalore",
                    "application_deadline": "2025-12-31T23:59:59Z"
                }),
                content_type='application/json',
                **headers
            )
            print_result("POST /api/jobs/", response.status_code in [200, 201],
                        f"Status: {response.status_code}, Response: {response.content[:200]}")
        except Exception as e:
            print_result("POST /api/jobs/", False, str(e))

def test_application_endpoints(client):
    print("\n" + "="*60)
    print("TESTING APPLICATION ENDPOINTS")
    print("="*60)
    
    token = get_auth_token(client, "student1", "student123")
    if not token:
        print("❌ Cannot get auth token for student1")
        return
    
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
    
    # Get a job to apply to
    try:
        jobs_response = client.get('/api/jobs/', **headers)
        if jobs_response.status_code == 200:
            jobs_data = json.loads(jobs_response.content)
            jobs = jobs_data.get('results', jobs_data) if isinstance(jobs_data, dict) else jobs_data
            job_id = None
            
            if isinstance(jobs, list):
                for job in jobs:
                    if job.get('is_active') and job.get('is_approved'):
                        job_id = job.get('id')
                        break
            
            if job_id:
                # Test Create Application
                try:
                    response = client.post(
                        '/api/applications/',
                        data=json.dumps({
                            "job": job_id,
                            "cover_letter": "I am interested in this position."
                        }),
                        content_type='application/json',
                        **headers
                    )
                    error_msg = ""
                    if response.status_code == 400:
                        try:
                            error_data = json.loads(response.content)
                            error_msg = f"Status: {response.status_code}, Error: {error_data}"
                        except:
                            error_msg = f"Status: {response.status_code}, Content: {response.content[:200]}"
                    print_result("POST /api/applications/", response.status_code in [200, 201],
                                error_msg if response.status_code == 400 else f"Status: {response.status_code}")
                except Exception as e:
                    print_result("POST /api/applications/", False, str(e))
            else:
                print_result("POST /api/applications/", False, "No approved jobs available to test")
        else:
            print_result("GET /api/jobs/ (for application test)", False, 
                        f"Status: {jobs_response.status_code}")
    except Exception as e:
        print_result("POST /api/applications/", False, f"Error getting jobs: {str(e)}")
    
    # Test Get Applications
    try:
        response = client.get('/api/applications/', **headers)
        print_result("GET /api/applications/", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/applications/", False, str(e))

def test_notification_endpoints(client):
    print("\n" + "="*60)
    print("TESTING NOTIFICATION ENDPOINTS")
    print("="*60)
    
    token = get_auth_token(client, "student1", "student123")
    if not token:
        print("❌ Cannot get auth token for student1")
        return
    
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
    
    # Test Get Notifications
    try:
        response = client.get('/api/notifications/', **headers)
        print_result("GET /api/notifications/", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/notifications/", False, str(e))
    
    # Test Unread Count
    try:
        response = client.get('/api/notifications/unread_count/', **headers)
        print_result("GET /api/notifications/unread_count/", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/notifications/unread_count/", False, str(e))

def test_dashboard_endpoints(client):
    print("\n" + "="*60)
    print("TESTING DASHBOARD ENDPOINTS")
    print("="*60)
    
    # Test as Student
    token = get_auth_token(client, "student1", "student123")
    if token:
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        try:
            response = client.get('/api/dashboard/stats/', **headers)
            print_result("GET /api/dashboard/stats/ (as student)", response.status_code == 200,
                        f"Status: {response.status_code}")
        except Exception as e:
            print_result("GET /api/dashboard/stats/ (as student)", False, str(e))
    
    # Test as Coordinator
    token = get_auth_token(client, "coordinator1", "coordinator123")
    if token:
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        try:
            response = client.get('/api/dashboard/stats/', **headers)
            print_result("GET /api/dashboard/stats/ (as coordinator)", response.status_code == 200,
                        f"Status: {response.status_code}")
        except Exception as e:
            print_result("GET /api/dashboard/stats/ (as coordinator)", False, str(e))
        
        # Test Pending Users
        try:
            response = client.get('/api/auth/pending/', **headers)
            print_result("GET /api/auth/pending/", response.status_code == 200,
                        f"Status: {response.status_code}")
        except Exception as e:
            print_result("GET /api/auth/pending/", False, str(e))

def test_admin_endpoints(client):
    print("\n" + "="*60)
    print("TESTING ADMIN ENDPOINTS")
    print("="*60)
    
    token = get_auth_token(client, "admin", "admin123")
    if not token:
        print("❌ Cannot get auth token for admin")
        return
    
    headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
    
    # Test All Students
    try:
        response = client.get('/api/students/profiles/', **headers)
        print_result("GET /api/students/profiles/ (as admin)", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/students/profiles/ (as admin)", False, str(e))
    
    # Test All Companies
    try:
        response = client.get('/api/companies/', **headers)
        print_result("GET /api/companies/ (as admin)", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/companies/ (as admin)", False, str(e))
    
    # Test All Jobs
    try:
        response = client.get('/api/jobs/', **headers)
        print_result("GET /api/jobs/ (as admin)", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/jobs/ (as admin)", False, str(e))
    
    # Test All Applications
    try:
        response = client.get('/api/applications/', **headers)
        print_result("GET /api/applications/ (as admin)", response.status_code == 200,
                    f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /api/applications/ (as admin)", False, str(e))

def main():
    print("\n" + "="*60)
    print("COMPREHENSIVE API TESTING")
    print("="*60)
    print("\nTesting all API endpoints...")
    
    client = Client()
    
    test_authentication(client)
    test_student_endpoints(client)
    test_company_endpoints(client)
    test_job_endpoints(client)
    test_application_endpoints(client)
    test_notification_endpoints(client)
    test_dashboard_endpoints(client)
    test_admin_endpoints(client)
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {len(results['passed'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    print(f"📊 Total: {len(results['passed']) + len(results['failed'])}")
    
    if results['failed']:
        print("\n" + "="*60)
        print("FAILED TESTS:")
        print("="*60)
        for test in results['failed']:
            print(f"  ❌ {test}")
        
        print("\n" + "="*60)
        print("ERROR DETAILS:")
        print("="*60)
        for error in results['errors']:
            print(f"  • {error}")

if __name__ == "__main__":
    main()
