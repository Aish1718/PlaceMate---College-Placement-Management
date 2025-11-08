from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    get_current_user,
    change_password,
    list_pending_users,
    approve_user,
    reject_user,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', get_current_user, name='get_current_user'),
    path('change-password/', change_password, name='change_password'),
    path('pending/', list_pending_users, name='list_pending_users'),
    path('<int:user_id>/approve/', approve_user, name='approve_user'),
    path('<int:user_id>/reject/', reject_user, name='reject_user'),
]

