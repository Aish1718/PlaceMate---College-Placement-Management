from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecruitmentDriveViewSet

router = DefaultRouter()
router.register(r'drives', RecruitmentDriveViewSet, basename='recruitment-drive')

urlpatterns = router.urls

