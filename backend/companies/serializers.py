from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'user', 'user_email', 'company_name', 'industry', 'website', 'description',
            'address', 'phone', 'logo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'company_name', 'industry', 'website', 'description',
            'address', 'phone', 'logo'
        ]


