from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentProfileViewSet

router = DefaultRouter()
router.register(r'profiles', StudentProfileViewSet, basename='studentprofile')

urlpatterns = [
    path('', include(router.urls)),
]


