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

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# gemini ai
from google import genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_INSTRUCTION = """
    You are a helpful AI assistant for a University-Enterprise internship matching platform. 
    You answer students' questions politely and concisely based on typical platform fonctionality. 
    and companies' questions You must answer like a highly professional corporate recruiter.
    Keep answers short and simple
    Use a friendly and enthusiastic tone.
    For example, if asked about 'Finding internships', just say: 'You can find offers by navigating to the Internships section'.
    The platform automates the internship process, connects students with companies, handles digital CVs,
    allows companies to post offers, and automates the creation of the 'Convention de Stage' (Internship Agreement) after university validation.
    IMPORTANT RULE: Students MUST register using their university email address ending in '@univ.dz'. Non-university emails are not accepted for student accounts.
"""

@csrf_exempt       # to allow POST requests from any origin
def chatbot(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    try:
        data = json.loads(request.body)
        user_question = data.get('question', '').strip()
        chat_history = data.get('chat_history', [])

        if not user_question:
            return JsonResponse({'error': 'No question provided'}, status=400)

        # Prepare history for Gemini
        # The new SDK uses 'role' and 'parts' [ { 'text': ... } ]
        history = []
        for msg in chat_history:
            history.append({
                "role": "user" if msg.get("role") == "user" else "model",
                "parts": [{"text": msg.get("text", "")}]
            })

        # Generate response using the new client structure
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            config={
                'system_instruction': SYSTEM_INSTRUCTION,
            },
            contents=history + [{"role": "user", "parts": [{"text": user_question}]}]
        )

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
    serializer_class = UserSerializer
    permission_classes = [IsAdmin | IsCompany | IsStudent]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username']

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

class UserAdminUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    ordering_fields = ['id', 'username']

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.filter(role=User.Role.COMPANY)
    serializer_class = CompanySerializer
    permission_classes = [AllowAny] # Allow all users to see companies
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'company_field']

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        recipient_id = self.request.query_params.get('recipient_id')
        if recipient_id:
            # Get conversation between user and recipient
            messages = Message.objects.filter(
                (Q(sender=user) & Q(recipient_id=recipient_id)) |
                (Q(sender_id=recipient_id) & Q(recipient=user))
            )
            # Mark received messages as read
            messages.filter(recipient=user).update(is_read=True)
            return messages
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))

class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# internship views

class InternshipCreateView(generics.CreateAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [IsCompany, IsAuthenticated]

    def perform_create(self, serializer):
        company = self.request.user.company
        internship = serializer.save(company=company)

        # Notify all followers of this company about the new open internship
        if internship.status == InternshipOffer.Status.OPEN_FOR_APPLICATION:
            followers = CompanyFollow.objects.filter(company=company).select_related('student')
            for follow in followers:
                Notification.objects.create(
                    recipient=follow.student,
                    notification_type=Notification.NotificationType.NEW_INTERNSHIP_FROM_FOLLOWED,
                    message=f"{company.name} posted a new internship: '{internship.title}'",
                )

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
        user = self.request.user
        
        if not user.is_authenticated:
            if obj.status in [InternshipOffer.Status.DRAFT, InternshipOffer.Status.ARCHIVED, InternshipOffer.Status.HIDDEN]:
                raise PermissionDenied("You do not have permission to view this internship.")
            return obj

        if user.role not in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
            if obj.status == InternshipOffer.Status.HIDDEN:
                raise PermissionDenied("You do not have permission to view this internship.")
            
            # Use .id comparison to handle base User vs Subclass (Company)
            if obj.status in [InternshipOffer.Status.DRAFT, InternshipOffer.Status.ARCHIVED] and user.id != obj.company_id:
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
        if self.request.user.is_authenticated and self.request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
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

        # Create notification for the company (Status management is handled by the model)
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
        internship = application.internship
        
        # Notify candidate on status change (The model now handles the internship status)
        if old_status != application.status:
            # First, remove any previous status notifications for this specific application to avoid duplicates
            Notification.objects.filter(
                application=application,
                notification_type__in=[
                    Notification.NotificationType.APPLICATION_ACCEPTED,
                    Notification.NotificationType.APPLICATION_REJECTED
                ]
            ).delete()

            if application.status == Application.Status.ACCEPTED:
                Notification.objects.create(
                    recipient=application.student,
                    notification_type=Notification.NotificationType.APPLICATION_ACCEPTED,
                    message=f"Your application for '{application.internship.title}' has been accepted!",
                    application=application
                )
                
                # Notify all Admins that validation is required
                admins = User.objects.filter(role__in=[User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV])
                for admin in admins:
                    Notification.objects.create(
                        recipient=admin,
                        notification_type=Notification.NotificationType.VALIDATION_REQUIRED,
                        message=f"New internship validation required: {application.student.get_full_name()} at {application.internship.company.name}",
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
        
        # Check if we should reopen
        internship = instance.internship
        application_count = Application.objects.filter(
            internship=internship
        ).exclude(status=Application.Status.REJECTED).count()
        
        if application_count < internship.number_of_places and internship.status == InternshipOffer.Status.CLOSED_FOR_APPLICATION:
            internship.status = InternshipOffer.Status.OPEN_FOR_APPLICATION
            internship.save()

class StudentApplicationCancelView(generics.DestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_object(self):
        internship_id = self.kwargs['internship_id']
        obj = get_object_or_404(Application, internship_id=internship_id, student_id=self.request.user.id)
        return obj

    def perform_destroy(self, instance):
        internship = instance.internship
        instance.delete()
        
        # Reopen if a spot became available
        application_count = Application.objects.filter(
            internship=internship
        ).exclude(status=Application.Status.REJECTED).count()
        
        if application_count < internship.number_of_places and internship.status == InternshipOffer.Status.CLOSED_FOR_APPLICATION:
            internship.status = InternshipOffer.Status.OPEN_FOR_APPLICATION
            internship.save()

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
    search_fields = [
        'student__first_name', 'student__last_name', 'student__email',
        'internship__title', 'internship__company__name', 'status'
    ]
    ordering_fields = ['id', 'application_date']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
            return queryset
            
        if user.role == User.Role.COMPANY:
            return queryset.filter(internship__company__id=user.id)
            
        if user.role == User.Role.STUDENT:
            return queryset.filter(student__id=user.id)
            
        return queryset.none()

    @property
    def pagination_class(self):
        # Disable pagination for this view as the frontend expects a direct array
        return None

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
        if self.request.user.role not in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
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
            "acceptedApplications": applications.filter(status=Application.Status.ACCEPTED, is_validated_by_admin=True).count(),
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
            "acceptedApplications": applications.filter(status=Application.Status.ACCEPTED, is_validated_by_admin=True).count(),
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
            if hasattr(student, 'digital_cv') and student.digital_cv and student.digital_cv.cv_file:
                cv_url = request.build_absolute_uri(student.digital_cv.cv_file.url)

            recent_apps_data.append({
                "id": app.id,
                "studentId": student.id,
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


class AdminUnivDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN_UNIV:
            raise PermissionDenied("Only Admin Univ can access this dashboard.")

        applications = Application.objects.all()

        stats = {
            "totalStudents": User.objects.filter(role=User.Role.STUDENT).count(),
            "totalCompanies": User.objects.filter(role=User.Role.COMPANY).count(),
            "pendingValidations": applications.filter(status=Application.Status.ACCEPTED, is_validated_by_admin=False).count(),
            "validatedInternships": applications.filter(status=Application.Status.ACCEPTED, is_validated_by_admin=True).count(),
        }

        # Recent applications pending validation
        recent_apps = applications.filter(
            status=Application.Status.ACCEPTED, 
            is_validated_by_admin=False
        ).select_related('student', 'internship', 'internship__company').order_by('-application_date')[:5]

        recent_apps_data = []
        for app in recent_apps:
            student = app.student
            candidate_name = f"{student.first_name} {student.last_name}".strip() or student.username or student.email

            recent_apps_data.append({
                "id": app.id,
                "studentId": student.id,
                "candidate": candidate_name,
                "internshipTitle": app.internship.title,
                "companyName": app.internship.company.name,
                "appliedDate": app.application_date.strftime("%Y-%m-%d"),
                "status": "Pending Validation"
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

class NotificationClearAllView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        Notification.objects.filter(recipient=request.user).delete()
        return Response({"status": "ok"})

# Admin Views
class AdminPendingValidationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(
            status=Application.Status.ACCEPTED,
            is_validated_by_admin=False
        )

class AdminValidateApplicationView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        application = get_object_or_404(Application, pk=pk, status=Application.Status.ACCEPTED)
        application.is_validated_by_admin = True
        application.admin_validation_date = timezone.now()
        application.save()
        
        # Notify student
        Notification.objects.get_or_create(
            recipient=application.student,
            notification_type=Notification.NotificationType.APPLICATION_ACCEPTED,
            application=application,
            defaults={
                "message": f"Your internship at {application.internship.company.name} has been validated by the administration! You can now download your agreement."
            }
        )

        # Notify company
        Notification.objects.get_or_create(
            recipient=application.internship.company,
            notification_type=Notification.NotificationType.APPLICATION_ACCEPTED,
            application=application,
            defaults={
                "message": f"The internship for {application.student.first_name} {application.student.last_name} has been validated by the administration."
            }
        )
        
        return Response({"status": "validated"})

class AdminRejectApplicationView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        application = get_object_or_404(Application, pk=pk, status=Application.Status.ACCEPTED)
        application.status = Application.Status.REJECTED
        application.is_validated_by_admin = False
        application.save()
        
        # Notify student
        Notification.objects.create(
            recipient=application.student,
            notification_type=Notification.NotificationType.APPLICATION_REJECTED,
            message=f"Your internship validation for '{application.internship.title}' has been rejected by the administration.",
            application=application
        )

        # Notify company
        Notification.objects.create(
            recipient=application.internship.company,
            notification_type=Notification.NotificationType.APPLICATION_REJECTED,
            message=f"The internship validation for {application.student.get_full_name()} has been rejected by the administration.",
            application=application
        )
        
        return Response({"status": "rejected"})

class AdminStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Use User model to count by role to be more reliable
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        placed_students = Application.objects.filter(
            status=Application.Status.ACCEPTED,
            is_validated_by_admin=True
        ).values('student').distinct().count()
        
        unplaced_students = total_students - placed_students
        
        # Prepare chart data with proper month names
        import calendar
        month_counts = Application.objects.filter(
            application_date__year=timezone.now().year
        ).values('application_date__month').annotate(count=Count('id')).order_by('application_date__month')

        apps_by_month = []
        for m in month_counts:
            month_idx = m['application_date__month']
            apps_by_month.append({
                "month": calendar.month_name[month_idx][:3],
                "count": m['count']
            })

        # Fill in missing months if needed for a better chart
        all_months = [calendar.month_name[i][:3] for i in range(1, 13)]
        final_chart_data = []
        for month in all_months:
            match = next((item for item in apps_by_month if item["month"] == month), None)
            final_chart_data.append(match if match else {"month": month, "count": 0})

        return Response({
            "total_students": total_students,
            "placed_students": placed_students,
            "unplaced_students": unplaced_students,
            "placement_rate": (placed_students / total_students * 100) if total_students > 0 else 0,
            "apps_by_month": final_chart_data
        })

from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, TableStyle

class GenerateInternshipAgreementView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        
        # Check permissions: Student, Company, or Admin
        if not (request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV] or 
                request.user.id == application.student.id or 
                request.user.id == application.internship.company.id):
            raise PermissionDenied("You do not have permission to view this document.")

        if not application.is_validated_by_admin:
            return Response({"error": "This internship has not been validated by the administration yet."}, status=400)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph("CONVENTION DE STAGE", styles['Title']))
        elements.append(Spacer(1, 20))

        # Participants
        student = application.student
        student_name = f"{student.first_name} {student.last_name}".strip()
        if not student_name:
            student_name = student.username or student.email

        data = [
            ["STUDENT:", student_name],
            ["COMPANY:", application.internship.company.name],
            ["INTERNSHIP:", application.internship.title],
            ["DURATION:", f"{application.internship.internship_duration}"],
            ["START DATE:", f"{application.internship.offer_start_date}"],
            ["VALIDATED ON:", f"{application.admin_validation_date.strftime('%Y-%m-%d')}"],
        ]
        
        t = RLTable(data, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 40))

        # Terms
        terms = """
        This agreement defines the relationship between the student, the host company, and the university.
        The student commits to following the company's internal rules and completing the assigned tasks.
        The company commits to providing a learning environment and supervising the student.
        """
        elements.append(Paragraph("Terms and Conditions", styles['Heading2']))
        elements.append(Paragraph(terms, styles['Normal']))
        elements.append(Spacer(1, 60))

        # Signatures
        sig_data = [
            ["Student Signature", "Company Signature", "University Signature"],
            ["\n\n\n________________", "\n\n\n________________", "\n\n\n________________"]
        ]
        sig_table = RLTable(sig_data, colWidths=[160, 160, 160])
        elements.append(sig_table)

        doc.build(elements)
        buffer.seek(0)
        
        return FileResponse(buffer, as_attachment=True, filename=f"Convention_{application.student.first_name}.pdf")

class GenerateCVView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        student = get_object_or_404(Student, pk=student_id)
        
        user = request.user
        if user.role == User.Role.STUDENT and user.id != student.id:
            raise PermissionDenied("You can only download your own CV.")
        elif user.role == User.Role.COMPANY:
            has_applied = Application.objects.filter(student=student, internship__company_id=user.id).exists()
            if not has_applied:
                raise PermissionDenied("You can only download CVs of students who applied to your internships.")
        
        try:
            cv = student.digital_cv
        except Exception:
            return Response({"error": "This student has not created a digital CV yet."}, status=404)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
        
        styles = getSampleStyleSheet()
        
        name_style = ParagraphStyle(
            'NameStyle', 
            parent=styles['Normal'], 
            fontName='Helvetica-Bold', 
            fontSize=16, 
            alignment=TA_CENTER, 
            spaceAfter=5
        )
        contact_style = ParagraphStyle(
            'ContactStyle', 
            parent=styles['Normal'], 
            fontName='Helvetica', 
            fontSize=10, 
            alignment=TA_CENTER, 
            spaceAfter=2
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=10
        )
        
        elements = []

        # Header - Name
        elements.append(Paragraph(f"{cv.first_name} {cv.last_name}".upper(), name_style))
        
        # Contact Info Styles
        contact_style_left = ParagraphStyle('ContactLeft', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=0) # TA_LEFT
        contact_style_right = ParagraphStyle('ContactRight', parent=styles['Normal'], fontName='Helvetica', fontSize=9, alignment=2) # TA_RIGHT

        # Contact Info Table Data
        left_data = []
        if cv.email: left_data.append(f"<b>Email:</b> {cv.email}")
        if cv.phone: left_data.append(f"<b>Phone:</b> {cv.phone}")
        
        right_data = []
        loc = cv.address or cv.wilaya
        if loc: right_data.append(f"<b>Location:</b> {loc}")
        uid = cv.university_id or student.university_id
        if uid: right_data.append(f"<b>Student ID:</b> {uid}")

        # Construct table rows
        table_rows = []
        for i in range(max(len(left_data), len(right_data))):
            l = left_data[i] if i < len(left_data) else ""
            r = right_data[i] if i < len(right_data) else ""
            table_rows.append([Paragraph(l, contact_style_left), Paragraph(r, contact_style_right)])

        if table_rows:
            t = RLTable(table_rows, colWidths=['50%', '50%'])
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ]))
            elements.append(t)
            
        elements.append(Spacer(1, 15))

        def add_section(title, content):
            if not content: return
            
            # Section Header with line below
            t = RLTable([[title.upper()]], colWidths=['100%'])
            t.setStyle(TableStyle([
                ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 11),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#4c1d95")), # Purple-900
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('LINEBELOW', (0,0), (-1,-1), 1.5, colors.HexColor("#7c3aed")), # Purple-600
            ]))
            elements.append(t)
            elements.append(Spacer(1, 8))
            
            # Content
            import json
            try:
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    # For list-like content, use bullet points
                    for item in parsed:
                        if item.strip():
                            elements.append(Paragraph(f"• {item.strip()}", body_style))
                    return
            except Exception:
                pass
                
            elements.append(Paragraph(content.replace('\n', '<br/>'), body_style))

        add_section("Summary", cv.profile_summary)
        add_section("Education", cv.education)
        add_section("Professional Experience", cv.experience)
        add_section("Skills", cv.skills)
        add_section("Languages", cv.languages)

        # Move links to the bottom in a nice "Links & Portfolio" section
        links_content = []
        if cv.linkedin: links_content.append(f"<b>LinkedIn:</b> {cv.linkedin}")
        if cv.github: links_content.append(f"<b>GitHub:</b> {cv.github}")
        if cv.portfolio_link: links_content.append(f"<b>Portfolio:</b> {cv.portfolio_link}")
        
        if links_content:
            add_section("Links & Portfolio", "<br/>".join(links_content))

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"{cv.first_name}_{cv.last_name}_CV.pdf")


# forgot password and reset password
import random
from rest_framework.views import APIView

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Generate a random 6-digit OTP
            otp = str(random.randint(100000, 999999))
            PasswordReset.objects.create(user=user, code=otp)
            
            # Print to console so you can see the code during development
            print(f"\n[OTP] Code for {email}: {otp}\n")
            
            return Response({"status": "code_sent"})
        except User.DoesNotExist:
            return Response({"error": "No account found with this email."}, status=404)

class VerifyResetCodeView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = str(request.data.get('code', '')).strip()
        
        try:
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                return Response({"error": "User not found."}, status=404)
            
            reset_request = PasswordReset.objects.filter(user=user, code=code, is_used=False).last()
            if reset_request:
                return Response({"status": "code_verified"})
            else:
                return Response({"error": "Invalid code."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = str(request.data.get('code', '')).strip()
        new_password = request.data.get('new_password')
        
        try:
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                return Response({"error": "User not found."}, status=404)

            reset_request = PasswordReset.objects.filter(user=user, code=code, is_used=False).last()
            
            if reset_request:
                user.set_password(new_password)
                user.save()
                reset_request.is_used = True
                reset_request.save()
                return Response({"status": "password_reset_success"})
            else:
                return Response({"error": "Invalid or expired code."}, status=400)
        except Exception as e:
            return Response({"error": f"Server Error: {str(e)}"}, status=500)


# ─── Company Follow Views ────────────────────────────────────────────────────

class FollowCompanyView(generics.GenericAPIView):
    """POST /companies/<company_id>/follow/ — student follows a company."""
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, company_id, *args, **kwargs):
        company = get_object_or_404(Company, pk=company_id)
        student = request.user.student
        follow, created = CompanyFollow.objects.get_or_create(student=student, company=company)
        if created:
            return Response({"status": "followed", "followers_count": company.followers.count()}, status=status.HTTP_201_CREATED)
        return Response({"status": "already_following", "followers_count": company.followers.count()}, status=status.HTTP_200_OK)


class UnfollowCompanyView(generics.GenericAPIView):
    """DELETE /companies/<company_id>/follow/ — student unfollows a company."""
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request, company_id, *args, **kwargs):
        company = get_object_or_404(Company, pk=company_id)
        student = request.user.student
        deleted, _ = CompanyFollow.objects.filter(student=student, company=company).delete()
        return Response(
            {"status": "unfollowed" if deleted else "not_following", "followers_count": company.followers.count()},
            status=status.HTTP_200_OK
        )


class FollowStatusView(generics.GenericAPIView):
    """GET /companies/<company_id>/follow/ — check if the current student follows this company."""
    permission_classes = [IsAuthenticated]

    def get(self, request, company_id, *args, **kwargs):
        company = get_object_or_404(Company, pk=company_id)
        is_following = False
        if request.user.role == User.Role.STUDENT:
            is_following = CompanyFollow.objects.filter(student=request.user.student, company=company).exists()
        return Response({
            "is_following": is_following,
            "followers_count": company.followers.count(),
        })


class CompanyFollowersCountView(generics.GenericAPIView):
    """GET /company/followers/ — returns the follower count for the logged-in company."""
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request, *args, **kwargs):
        try:
            # Multi-table inheritance: request.user is a User, but has a 'company' attribute
            # Or we can query Company directly using the same ID
            company_id = request.user.id
            count = CompanyFollow.objects.filter(company_id=company_id).count()
            return Response({"followers_count": count})
        except Exception as e:
            return Response({"followers_count": 0, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FollowedCompaniesInternshipsView(generics.ListAPIView):
    """GET /internships/followed/ — internships from companies the student follows."""
    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        student = self.request.user.student
        followed_companies = CompanyFollow.objects.filter(student=student).values_list('company_id', flat=True)
        return InternshipOffer.objects.filter(
            company_id__in=followed_companies,
            status=InternshipOffer.Status.OPEN_FOR_APPLICATION
        ).order_by('-id')

