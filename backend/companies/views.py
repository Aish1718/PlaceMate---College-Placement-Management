from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Company.objects.all()
        if self.request.user.role == 'company':
            return Company.objects.filter(user=self.request.user)
        elif self.request.user.role in ['placement_coordinator', 'college_management']:
            return Company.objects.all()
        return Company.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        company = get_object_or_404(Company, user=request.user)
        serializer = self.get_serializer(company)
        return Response(serializer.data)


