from rest_framework import permissions
from .models import User, Student

def ensure_student_profile(user):
    if user and user.is_authenticated and user.role == User.Role.STUDENT:
        if not hasattr(user, 'student'):
            try:
                s = Student(user_ptr_id=user.id)
                for field in user._meta.fields:
                    setattr(s, field.name, getattr(user, field.name))
                s.save()
                # Clear Django cached descriptor if present
                if 'student' in user.__dict__:
                    del user.__dict__['student']
            except Exception:
                pass
    return user

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV, 'ADMIN'] or request.user.is_superuser)
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
        if request.user and request.user.is_authenticated:
            ensure_student_profile(request.user)
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.STUDENT
        )
