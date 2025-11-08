from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['is_approved'] = user.is_approved
        token['is_superuser'] = user.is_superuser
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully. Please wait for approval.'
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.data['old_password']):
            return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pending_users(request):
    """List users pending approval - only for coordinators, management, and admins"""
    if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    pending_users = User.objects.filter(is_approved=False)
    serializer = UserSerializer(pending_users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """Approve a user - only for coordinators, management, and admins"""
    if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return Response({'message': f'User {user.username} has been approved.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_user(request, user_id):
    """Reject a user - only for coordinators, management, and admins"""
    if request.user.role not in ['placement_coordinator', 'college_management'] and not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()  # Or you could set is_active=False instead
        return Response({'message': f'User {user.username} has been rejected and removed.'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

