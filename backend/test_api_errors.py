#!/usr/bin/env python
"""
Test API endpoints with invalid data to find 400 errors
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cpms.settings')
django.setup()

from django.test import Client

client = Client()

def get_token(username, password):
    response = client.post(
        '/api/auth/login/',
        data=json.dumps({"username": username, "password": password}),
        content_type='application/json'
    )
    if response.status_code == 200:
        return json.loads(response.content).get('access')
    return None

print("\n" + "="*60)
print("TESTING API ENDPOINTS FOR 400 ERRORS")
print("="*60)

# Test with student token
token = get_token("student1", "student123")
headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

print("\n1. Testing POST /api/applications/ with invalid job ID")
response = client.post(
    '/api/applications/',
    data=json.dumps({"job": 99999, "cover_letter": "Test"}),
    content_type='application/json',
    **headers
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n2. Testing POST /api/applications/ with missing job")
response = client.post(
    '/api/applications/',
    data=json.dumps({"cover_letter": "Test"}),
    content_type='application/json',
    **headers
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n3. Testing POST /api/jobs/ with missing required fields")
company_token = get_token("company1", "company123")
company_headers = {"HTTP_AUTHORIZATION": f"Bearer {company_token}"}
response = client.post(
    '/api/jobs/',
    data=json.dumps({"title": "Test"}),
    content_type='application/json',
    **company_headers
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n4. Testing POST /api/students/profiles/ with invalid data")
response = client.post(
    '/api/students/profiles/',
    data=json.dumps({"enrollment_number": ""}),
    content_type='application/json',
    **headers
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n5. Testing POST /api/companies/ with missing required fields")
response = client.post(
    '/api/companies/',
    data=json.dumps({"company_name": "Test"}),
    content_type='application/json',
    **company_headers
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n6. Testing POST /api/auth/register/ with invalid data")
response = client.post(
    '/api/auth/register/',
    data=json.dumps({
        "username": "test",
        "email": "invalid-email",
        "password": "123",
        "password2": "456"
    }),
    content_type='application/json'
)
print(f"   Status: {response.status_code}")
if response.status_code == 400:
    print(f"   Error: {response.content.decode()[:200]}")

print("\n" + "="*60)
print("TESTING COMPLETE")
print("="*60)

