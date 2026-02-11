from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)
from .views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [

    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'), #[AllowAny]
    path('auth/login/', TokenObtainPairView.as_view(), name='login'), 
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),#[IsAuthenticated]
    path('users/', UserListView.as_view(), name='users'),#[IsAdmin]

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
   