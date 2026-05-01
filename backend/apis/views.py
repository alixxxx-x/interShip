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
# gemini ai
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)
SYSTEM_INSTRUCTION = """
    You are a helpful AI assistant for a University-Enterprise internship matching platform. 
    You answer students' questions politely and concisely based on typical platform fonctionality. 
    and companies' questions You must answer like a highly professional corporate recruiter.
    Keep answers short and simple
    Use a friendly and enthusiastic tone.
    For example, if asked about 'Finding internships', just say: 'You can find offers by navigating to the Internships section'.
    The platform automates the internship process, connects students with companies, handles digital CVs,
    allows companies to post offers, and automates the creation of the 'Convention de Stage' (Internship Agreement) after university validation.
"""

@csrf_exempt       # to allow POST requests from any origin
def chatbot(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    try:
        data = json.loads(request.body)
        user_question = data.get('question', '').strip()
        chat_history=data.get('chat_history', [])

        if not user_question:
            return JsonResponse({'error': 'No question provided'}, status=400)

        # Initialize Gemini model
        model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
            system_instruction=SYSTEM_INSTRUCTION
        )

        # Prepare history for Gemini
        formatted_history = []
        for msg in chat_history:
            formatted_history.append({
                "role": "user" if msg.get("role") == "user" else "model",
                "parts": [{"text": msg.get("text", "")}]
            })

        chat = model.start_chat(history=formatted_history)
        
        # Generate response
        response = chat.send_message(user_question)
        ai_response = response.text

        return JsonResponse({
            'success': True,
            'response': ai_response
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"Error in chatbot: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

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
        application = serializer.save(student=self.request.user.student, internship=internship)

        # Create notification for the company
        student = self.request.user.student
        student_name = f"{student.first_name} {student.last_name}".strip() or student.username or student.email
        Notification.objects.create(
            recipient=internship.company,
            notification_type=Notification.NotificationType.NEW_APPLICATION,
            message=f"{student_name} applied for '{internship.title}'",
            application=application,
        )

class ApplicationUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company_id != self.request.user.id:
            raise PermissionDenied("You do not have permission to update this application.")
        return obj

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        application = serializer.save()
        
        if old_status != application.status:
            if application.status == Application.Status.ACCEPTED:
                Notification.objects.create(
                    recipient=application.student,
                    notification_type=Notification.NotificationType.APPLICATION_ACCEPTED,
                    message=f"Your application for '{application.internship.title}' has been accepted!",
                    application=application
                )
            elif application.status == Application.Status.REJECTED:
                Notification.objects.create(
                    recipient=application.student,
                    notification_type=Notification.NotificationType.APPLICATION_REJECTED,
                    message=f"Your application for '{application.internship.title}' has been rejected.",
                    application=application
                )

    def perform_destroy(self, instance):
        instance.status = Application.Status.REJECTED
        instance.save()

class StudentApplicationCancelView(generics.DestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_object(self):
        internship_id = self.kwargs['internship_id']
        obj = get_object_or_404(Application, internship_id=internship_id, student_id=self.request.user.id)
        return obj

    def perform_destroy(self, instance):
        instance.delete()

class ApplicationRetrieveView(generics.RetrieveAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.internship.company_id != self.request.user.id and obj.student_id != self.request.user.id:
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


class CompanyDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request, *args, **kwargs):
        company = request.user.company

        # All internships belonging to this company
        internships = InternshipOffer.objects.filter(company=company)

        # All applications for this company's internships
        applications = Application.objects.filter(internship__company=company)

        stats = {
            "pendingApplications": applications.filter(status=Application.Status.PENDING).count(),
            "acceptedApplications": applications.filter(status=Application.Status.ACCEPTED).count(),
            "totalInternships": internships.count(),
        }

        # Recent applications (limit to 5)
        recent_apps = applications.select_related(
            'student', 'internship'
        ).order_by('-application_date')[:5]

        # Mapping statuses to frontend expectations
        status_map = {
            Application.Status.PENDING: "In progress",
            Application.Status.ACCEPTED: "Accepted",
            Application.Status.REJECTED: "Rejected",
        }

        recent_apps_data = []
        for app in recent_apps:
            # Try to get student name from first_name/last_name, fallback to username/email
            student = app.student
            candidate_name = f"{student.first_name} {student.last_name}".strip()
            if not candidate_name:
                candidate_name = student.username or student.email

            # Try to get CV pdf URL
            cv_url = None
            if hasattr(student, 'digital_cv') and student.digital_cv and student.digital_cv.cv_pdf:
                cv_url = request.build_absolute_uri(student.digital_cv.cv_pdf.url)

            recent_apps_data.append({
                "id": app.id,
                "candidate": candidate_name,
                "status": status_map.get(app.status, app.status),
                "appliedDate": app.application_date.strftime("%Y-%m-%d"),
                "email": student.email,
                "internshipTitle": app.internship.title,
                "cvUrl": cv_url,
            })

        return Response({
            "stats": stats,
            "applications": recent_apps_data
        })


# notification views

class NotificationListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(recipient=request.user)[:20]
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()

        data = [
            {
                "id": n.id,
                "type": n.notification_type,
                "message": n.message,
                "isRead": n.is_read,
                "createdAt": n.created_at.strftime("%Y-%m-%d %H:%M"),
                "applicationId": n.application_id,
            }
            for n in notifications
        ]

        return Response({
            "unreadCount": unread_count,
            "notifications": data,
        })


class NotificationMarkReadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({"status": "ok"})


class NotificationMarkAllReadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"status": "ok"})
