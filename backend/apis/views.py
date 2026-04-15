from backend.apis.serializers import InternshipSerializer
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.http import FileResponse
from .models import *
from .serializers import *
from .permissions import *

# Authentication Views

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username']

class ChangePasswordView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "success", "message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# internship views

class InternshipCreateView(generics.CreateAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [IsCompany, IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(company=self.request.user) # hadi t7ot l company (li hiya already logged in User) automatically fl field t3 company
    

class InternshipUpdateDestroyView(generics.UpdateDestroyAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [IsCompany, IsAuthenticated]

    def get_object(self): # hada ychouf ida l company li dayer login howa l company li dayer l internship
        obj = super().get_object()
        if obj.company != self.request.user:
            raise PermissionDenied("You do not have permission to edit this internship.")
        return obj

    def perform_destroy(self, instance):
        instance.status = InternshipOffer.Status.HIDDEN
        instance.save()


class InternshipRetrieveView(generics.RetrieveAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [AllowAny]

    def get_object(self): # hada y5li nas kaml ychoufou internship lakan machi draft wla archived 
        obj = super().get_object()
        if self.request.user.role != User.Role.ADMIN :
            if obj.status == InternshipOffer.Status.HIDDEN:
                raise PermissionDenied("You do not have permission to view this internship.")
        if obj.status in [InternshipOffer.Status.DRAFT, InternshipOffer.Status.ARCHIVED] and self.request.user != obj.company:
            raise PermissionDenied("You do not have permission to view this internship.")
        return obj


class InternshipListView(generics.ListAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description','company','internship_type','internship_location','internship_structure','status']
    ordering_fields = ['id', 'title', 'offer_start_date', 'offer_end_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role not in [User.Role.ADMIN]:
            if self.request.user.role == User.Role.COMPANY:
                queryset= queryset.filter(company=self.request.user or status not in [InternshipOffer.Status.DRAFT, InternshipOffer.Status.ARCHIVED]
                )
            else:
                queryset = queryset.filter(status not in [InternshipOffer.Status.DRAFT, InternshipOffer.Status.ARCHIVED])
        return queryset
