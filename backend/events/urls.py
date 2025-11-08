from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampusEventViewSet, EventRegistrationViewSet

router = DefaultRouter()
router.register(r'events', CampusEventViewSet, basename='campus-event')
router.register(r'registrations', EventRegistrationViewSet, basename='event-registration')

urlpatterns = router.urls

