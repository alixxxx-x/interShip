from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from .views import *

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserListView.as_view(), name='user-list'),

    # Internships
    path('internships/create/', InternshipCreateView.as_view(), name='create'),
    path('internships/', InternshipListView.as_view(), name='internship-list'),
    path('internships/company/', CompanyInternshipListView.as_view(), name='company-internship-list'),
    path('internships/<int:pk>/', InternshipRetrieveView.as_view(), name='internship-retrieve'),
    path('internships/<int:pk>/update/', InternshipUpdateDestroyView.as_view(), name='internship-update'),
    path('internships/<int:pk>/delete/', InternshipUpdateDestroyView.as_view(), name='internship-delete'),


    # Applications
    path('applications/apply/', ApplicationCreateView.as_view(), name='apply'),
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationRetrieveView.as_view(), name='application-retrieve'),
    path('applications/<int:pk>/update/', ApplicationUpdateDestroyView.as_view(), name='application-update'),

    # Skills
    path('skills/create/', SkillsCreateView.as_view(), name='create'),
    path('skills/', SkillsListView.as_view(), name='skill-list'),
    path('skills/<int:pk>/', SkillsRetrieveView.as_view(), name='skill-retrieve'),
    path('skills/<int:pk>/update/', SkillsUpdateDestroyView.as_view(), name='skill-update'),
    path('skills/<int:pk>/delete/', SkillsUpdateDestroyView.as_view(), name='skill-delete'),

    # CV
    path('cv/create/', DigitalCVCreateView.as_view(), name='cv-create'),
    path('cv/', DigitalCVRetrieveUpdateView.as_view(), name='cv-detail'),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
]
   