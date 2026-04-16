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
    path('internships/', InternshipListView.as_view(), name='internship-list'),
    path('internships/<int:pk>/', InternshipRetrieveView.as_view(), name='internship-retrieve'),
    path('internships/<int:pk>/update/', InternshipUpdateDestroyView.as_view(), name='internship-update'),
    path('internships/<int:pk>/delete/', InternshipUpdateDestroyView.as_view(), name='internship-delete'),
    path('internships/<int:pk>/apply/', ApplicationCreateView.as_view(), name='apply'),

    # Applications
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationRetrieveView.as_view(), name='application-retrieve'),
    path('applications/<int:pk>/update/', ApplicationUpdateDestroyView.as_view(), name='application-update'),
]
   