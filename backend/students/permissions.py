from rest_framework import permissions


class IsStudentOrCoordinator(permissions.BasePermission):
    """
    Custom permission to only allow students to access their own data,
    or coordinators/management to access all data.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the student owner or coordinators
        return obj.user == request.user or request.user.role in ['placement_coordinator', 'college_management']


