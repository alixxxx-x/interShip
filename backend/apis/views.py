from .permissions import IsAdmin
from django.shortcuts import get_object_or_404
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
        serializer.save(company=self.request.user.company) # Access the Company profile from the User
    

class InternshipUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [IsCompany, IsAuthenticated]

    def get_object(self): # hada ychouf ida l company li dayer login howa l company li dayer l internship
        obj = super().get_object()
        if obj.company_id != self.request.user.id:
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
        # Admins see all offers
        if self.request.user.is_authenticated and self.request.user.role == User.Role.ADMIN:
            return queryset
            
        # Everyone else (Students, unauthenticated users, and companies browsing the public feed)
        # sees ONLY open offers.
        return queryset.filter(
            status__in=[
                InternshipOffer.Status.OPEN_FOR_APPLICATION,
                InternshipOffer.Status.CLOSED_FOR_APPLICATION,
                InternshipOffer.Status.ONGOING,
                InternshipOffer.Status.FINISHED,
            ]
        )

class CompanyInternshipListView(generics.ListAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated, IsCompany]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'status']
    ordering_fields = ['id', 'title', 'offer_start_date', 'offer_end_date']
    
    def get_queryset(self):
        # Allow the company to see ALL of their own offers (including drafts, finished, hidden)
        return super().get_queryset().filter(company=self.request.user.company)


# application views

class ApplicationCreateView(generics.CreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['internship'] = get_object_or_404(InternshipOffer, pk=self.kwargs['pk'])
        return context

    def perform_create(self, serializer):
        internship = serializer.context['internship']
        serializer.save(student=self.request.user.student, internship=internship)

class ApplicationUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company != self.request.user:
            raise PermissionDenied("You do not have permission to update this application.")
        return obj

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.status = Application.Status.REJECTED
        instance.save()

class ApplicationRetrieveView(generics.RetrieveAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company != self.request.user and obj.student != self.request.user:
            raise PermissionDenied("You do not have permission to view this application.")
        return obj

class ApplicationListView(generics.ListAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student','internship','status']
    ordering_fields = ['id', 'application_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role not in [User.Role.ADMIN]:
            if self.request.user.role == User.Role.COMPANY:
                queryset = queryset.filter(internship__company=self.request.user)
            else:
                queryset = queryset.filter(student=self.request.user.student)
        return queryset

# skills views

class SkillsCreateView(generics.CreateAPIView):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['internship'] = get_object_or_404(InternshipOffer, pk=self.kwargs['pk'])
        return context

    def perform_create(self, serializer):
        internship = serializer.context['internship']
        # If it's an admin, we don't set a student profile
        serializer.save(internship=internship)

class SkillsUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company != self.request.user and obj.student != self.request.user:
            raise PermissionDenied("You do not have permission to update this skill.")
        return obj

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

class SkillsRetrieveView(generics.RetrieveAPIView):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company != self.request.user and obj.student != self.request.user:
            raise PermissionDenied("You do not have permission to view this skill.")
        return obj

class SkillsListView(generics.ListAPIView):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name','skill_level','internship']
    ordering_fields = ['id', 'name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role not in [User.Role.ADMIN]:
            if self.request.user.role == User.Role.COMPANY:
                queryset = queryset.filter(internship__company=self.request.user)
            else:
                queryset = queryset.filter(student=self.request.user.student)
        return queryset

# digital cv views

class DigitalCVCreateView(generics.CreateAPIView):
    queryset = DigitalCV.objects.all()
    serializer_class = DigitalCVSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student)

class DigitalCVRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = DigitalCV.objects.all()
    serializer_class = DigitalCVSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if hasattr(self.request.user, 'student'):
            return get_object_or_404(DigitalCV, student=self.request.user.student)
        return super().get_object()

class DigitalCVRetrieveView(generics.RetrieveAPIView):
    queryset = DigitalCV.objects.all()
    serializer_class = DigitalCVSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if hasattr(self.request.user, 'student'):
            return get_object_or_404(DigitalCV, student=self.request.user.student)
        return super().get_object()

class StudentDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        student = request.user.student
        applications = Application.objects.filter(student=student)
        
        stats = {
            "pendingAplications": applications.filter(status=Application.Status.PENDING).count(),
            "acceptedApplications": applications.filter(status=Application.Status.ACCEPTED).count(),
            "totalApplications": applications.count(),
        }
        
        # Recent applications (limit to 5)
        recent_apps = applications.order_by('-application_date')[:5]
        
        # Mapping statuses to frontend expectations
        status_map = {
            Application.Status.PENDING: "In progress",
            Application.Status.ACCEPTED: "Accepted",
            Application.Status.REJECTED: "Rejected",
        }
        
        recent_apps_data = [
            {
                "id": app.id,
                "offer": app.internship.title,
                "status": status_map.get(app.status, app.status),
                "appliedDate": app.application_date.strftime("%Y-%m-%d"),
            }
            for app in recent_apps
        ]
        
        return Response({
            "stats": stats,
            "applications": recent_apps_data
        })
