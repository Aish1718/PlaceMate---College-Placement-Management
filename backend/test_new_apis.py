#!/usr/bin/env python
"""
Test script for Recruitment Drives and Campus Events APIs
"""
import os
import sys
import django
import requests

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cpms.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company
from jobs.models import JobPosting
from recruitment_drives.models import RecruitmentDrive
from events.models import CampusEvent

User = get_user_model()
BASE_URL = 'http://localhost:8000/api'

def get_jwt_token(username, password):
    """Get JWT token for authentication"""
    response = requests.post(
        f'{BASE_URL}/auth/login/',
        json={'username': username, 'password': password}
    )
    if response.status_code == 200:
        return response.json().get('access')
    return None

def test_recruitment_drives():
    """Test Recruitment Drive APIs"""
    print("\n" + "="*60)
    print("TESTING RECRUITMENT DRIVES API")
    print("="*60)
    
    # Create test users
    company_user = User.objects.filter(username='test_company').first()
    if not company_user:
        company_user = User.objects.create_user(
            username='test_company',
            email='company@test.com',
            password='testpass123',
            role='company',
            is_approved=True
        )
    
    coordinator_user = User.objects.filter(username='test_coordinator').first()
    if not coordinator_user:
        coordinator_user = User.objects.create_user(
            username='test_coordinator',
            email='coordinator@test.com',
            password='testpass123',
            role='placement_coordinator',
            is_approved=True
        )
    
    # Get or create company
    company, _ = Company.objects.get_or_create(
        user=company_user,
        defaults={
            'company_name': 'Test Company',
            'address': '123 Test St',
            'phone': '1234567890',
        }
    )
    
    # Login as company user
    company_token = get_jwt_token('test_company', 'testpass123')
    print(f"\n1. Company Login: {'✓' if company_token else '✗'}")
    
    headers = {'Authorization': f'Bearer {company_token}'} if company_token else {}
    
    # Test CREATE recruitment drive (company)
    print("\n2. Creating Recruitment Drive (Company User)...")
    drive_data = {
        'title': 'Test Recruitment Drive',
        'description': 'This is a test recruitment drive',
        'drive_date': '2024-12-15T10:00:00Z',
        'location': 'Main Campus',
        'venue': 'Auditorium A',
        'coordinator_notes': 'Test notes',
    }
    response = requests.post(f'{BASE_URL}/recruitment-drives/drives/', json=drive_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        print("   ✓ Drive created successfully")
        drive_id = response.json().get('id')
    else:
        print(f"   ✗ Error: {response.json()}")
        drive_id = None
    
    # Test LIST drives (company)
    print("\n3. Listing Recruitment Drives (Company User)...")
    response = requests.get(f'{BASE_URL}/recruitment-drives/drives/', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        drives = response.json()
        count = len(drives.get('results', drives))
        print(f"   ✓ Found {count} drive(s)")
    else:
        print(f"   ✗ Error: {response.json()}")
    
    # Login as coordinator
    coord_token = get_jwt_token('test_coordinator', 'testpass123')
    print(f"\n4. Coordinator Login: {'✓' if coord_token else '✗'}")
    coord_headers = {'Authorization': f'Bearer {coord_token}'} if coord_token else {}
    
    # Test CREATE recruitment drive (coordinator - auto-approved)
    print("\n5. Creating Recruitment Drive (Coordinator - Auto-approved)...")
    drive_data_coord = {
        'company': company.id,
        'title': 'Coordinator Created Drive',
        'description': 'Created by coordinator',
        'drive_date': '2024-12-20T14:00:00Z',
        'location': 'Campus Hall',
        'venue': 'Room 101',
    }
    response = requests.post(f'{BASE_URL}/recruitment-drives/drives/', json=drive_data_coord, headers=coord_headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print("   ✓ Drive created successfully")
        print(f"   ✓ Auto-approved: {data.get('is_approved', False)}")
        coord_drive_id = data.get('id')
    else:
        print(f"   ✗ Error: {response.json()}")
        coord_drive_id = None
    
    # Test APPROVE drive
    if drive_id:
        print(f"\n6. Approving Drive {drive_id}...")
        response = requests.post(f'{BASE_URL}/recruitment-drives/drives/{drive_id}/approve/', headers=coord_headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Drive approved successfully")
        else:
            print(f"   ✗ Error: {response.json()}")
    
    # Test LIST all drives (coordinator)
    print("\n7. Listing All Drives (Coordinator)...")
    response = requests.get(f'{BASE_URL}/recruitment-drives/drives/', headers=coord_headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        drives = response.json()
        count = len(drives.get('results', drives))
        print(f"   ✓ Found {count} drive(s)")
    else:
        print(f"   ✗ Error: {response.json()}")
    
    print("\n" + "="*60)


def test_campus_events():
    """Test Campus Event APIs"""
    print("\n" + "="*60)
    print("TESTING CAMPUS EVENTS API")
    print("="*60)
    
    # Get test users
    company_user = User.objects.filter(username='test_company').first()
    coordinator_user = User.objects.filter(username='test_coordinator').first()
    company, _ = Company.objects.get_or_create(
        user=company_user,
        defaults={
            'company_name': 'Test Company',
            'address': '123 Test St',
            'phone': '1234567890',
        }
    )
    
    # Login as company user
    company_token = get_jwt_token('test_company', 'testpass123')
    print(f"\n1. Company Login: {'✓' if company_token else '✗'}")
    headers = {'Authorization': f'Bearer {company_token}'} if company_token else {}
    
    # Test CREATE event (company)
    print("\n2. Creating Campus Event (Company User)...")
    event_data = {
        'title': 'Tech Workshop',
        'description': 'Learn about new technologies',
        'event_type': 'workshop',
        'event_date': '2024-12-10T15:00:00Z',
        'location': 'Tech Building',
        'venue': 'Lab 201',
        'organizer': 'Tech Department',
        'max_participants': 50,
        'registration_required': True,
    }
    response = requests.post(f'{BASE_URL}/events/events/', json=event_data, headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        print("   ✓ Event created successfully")
        event_id = response.json().get('id')
    else:
        print(f"   ✗ Error: {response.json()}")
        event_id = None
    
    # Test LIST events (company)
    print("\n3. Listing Events (Company User)...")
    response = requests.get(f'{BASE_URL}/events/events/', headers=headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        events = response.json()
        count = len(events.get('results', events))
        print(f"   ✓ Found {count} event(s)")
    else:
        print(f"   ✗ Error: {response.json()}")
    
    # Login as coordinator
    coord_token = get_jwt_token('test_coordinator', 'testpass123')
    print(f"\n4. Coordinator Login: {'✓' if coord_token else '✗'}")
    coord_headers = {'Authorization': f'Bearer {coord_token}'} if coord_token else {}
    
    # Test CREATE event (coordinator - auto-approved)
    print("\n5. Creating Event (Coordinator - Auto-approved)...")
    event_data_coord = {
        'title': 'Career Fair 2024',
        'description': 'Annual career fair',
        'event_type': 'career_fair',
        'event_date': '2024-12-25T09:00:00Z',
        'location': 'Main Hall',
        'venue': 'Exhibition Center',
        'organizer': 'Placement Cell',
        'max_participants': 200,
        'registration_required': True,
    }
    response = requests.post(f'{BASE_URL}/events/events/', json=event_data_coord, headers=coord_headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print("   ✓ Event created successfully")
        print(f"   ✓ Auto-approved: {data.get('is_approved', False)}")
        coord_event_id = data.get('id')
    else:
        print(f"   ✗ Error: {response.json()}")
        coord_event_id = None
    
    # Test APPROVE event
    if event_id:
        print(f"\n6. Approving Event {event_id}...")
        response = requests.post(f'{BASE_URL}/events/events/{event_id}/approve/', headers=coord_headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Event approved successfully")
        else:
            print(f"   ✗ Error: {response.json()}")
    
    # Test LIST all events (coordinator)
    print("\n7. Listing All Events (Coordinator)...")
    response = requests.get(f'{BASE_URL}/events/events/', headers=coord_headers)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        events = response.json()
        count = len(events.get('results', events))
        print(f"   ✓ Found {count} event(s)")
    else:
        print(f"   ✗ Error: {response.json()}")
    
    print("\n" + "="*60)


if __name__ == '__main__':
    print("\n" + "="*60)
    print("TESTING NEW APIs - Recruitment Drives & Campus Events")
    print("="*60)
    
    try:
        test_recruitment_drives()
        test_campus_events()
        print("\n✓ All API tests completed!")
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()

