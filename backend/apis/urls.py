from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from .views import *

urlpatterns = [
    #chat gemini
    path('chat/', chatbot, name='chatbot'),

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserAdminUpdateView.as_view(), name='user-admin-update'),
    path('companies/', CompanyListView.as_view(), name='company-list'),

    # Internships
    path('internships/create/', InternshipCreateView.as_view(), name='create'),
    path('internships/', InternshipListView.as_view(), name='internship-list'),
    path('internships/company/', CompanyInternshipListView.as_view(), name='company-internship-list'),
    path('internships/<int:pk>/', InternshipRetrieveView.as_view(), name='internship-retrieve'),
    path('internships/<int:pk>/update/', InternshipUpdateDestroyView.as_view(), name='internship-update'),
    path('internships/<int:pk>/delete/', InternshipUpdateDestroyView.as_view(), name='internship-delete'),


    # Applications
    path('applications/apply/<int:pk>/', ApplicationCreateView.as_view(), name='apply'),
    path('applications/cancel/<int:internship_id>/', StudentApplicationCancelView.as_view(), name='application-cancel'),
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
    path('cv/generate/<int:student_id>/', GenerateCVView.as_view(), name='generate-cv'),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('company/dashboard/', CompanyDashboardView.as_view(), name='company-dashboard'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    path('notifications/clear-all/', NotificationClearAllView.as_view(), name='notification-clear-all'),

    # Admin Dashboard Functionalities
    path('admin/dashboard/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/applications/pending-validation/', AdminPendingValidationsView.as_view(), name='admin-pending-validations'),
    path('admin/applications/<int:pk>/validate/', AdminValidateApplicationView.as_view(), name='admin-validate-application'),
    path('admin/applications/<int:pk>/reject/', AdminRejectApplicationView.as_view(), name='admin-reject-application'),
    path('admin/applications/<int:pk>/agreement/', GenerateInternshipAgreementView.as_view(), name='admin-generate-agreement'),

    # Messaging
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/send/', MessageCreateView.as_view(), name='message-send'),

    # Password Reset
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/verify-reset-code/', VerifyResetCodeView.as_view(), name='verify_reset_code'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
]
   