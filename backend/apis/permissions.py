from rest_framework import permissions
from .models import User

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]
        )
class IsCompany(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.COMPANY
        )
class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.STUDENT
        )