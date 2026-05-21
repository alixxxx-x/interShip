from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework import response
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q, Count
from django.utils import timezone
from django.http import FileResponse
from .models import *
from .serializers import *
from .permissions import *
# gemini ai
from google import genai
from django.conf import settings
from rest_framework import status
import json
# forgot password and reset password
# forgot password and reset password
import random
from rest_framework.views import APIView
# cv generation to pdf
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, TableStyle
# Prepare chart data with proper month names
import calendar
# agreement generation
from django.template.loader import render_to_string
from django.http import HttpResponse

def _scope_applications_for_admin(queryset, user):
    if user.role == User.Role.ADMIN_DEPT:
        admin_dept = getattr(user, 'admindept', None)
        if admin_dept and admin_dept.department_id:
            return queryset.filter(student__department=admin_dept.department)
        return queryset.none()
    if user.role == User.Role.ADMIN_UNIV:
        admin_univ = getattr(user, 'adminuniv', None)
        university = getattr(admin_univ, 'university', None)
        if university:
            return queryset.filter(student__department__university=university)
        return queryset.none()
    return queryset

def _get_validation_admins_for_student(student):
    if not student or not student.department_id:
        return User.objects.none()

    university = student.department.university
    admin_univ_qs = User.objects.filter(
        role=User.Role.ADMIN_UNIV,
        adminuniv__university=university
    )
    admin_dept_qs = User.objects.filter(
        role=User.Role.ADMIN_DEPT,
        admindept__department=student.department
    )
    return admin_univ_qs | admin_dept_qs

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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

class ChatbotView(APIView):
    permission_classes = [AllowAny]  # anyone can ask questions, even without logging in

    def post(self, request):
        try:
            user_question = request.data.get('question', '').strip()
            chat_history = request.data.get('chat_history', [])

            if not user_question:
                return Response(
                    {'error': 'No question provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            #Prepare history for Gemini
            history = []
            for msg in chat_history:
                history.append({
                    "role": "user" if msg.get("role") == "user" else "model",
                    "parts": [{"text": msg.get("text", "")}]
                })

            #Gemini request
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                config={'system_instruction': SYSTEM_INSTRUCTION},
                contents=history + [{
                    "role": "user",
                    "parts": [{"text": user_question}]
                }]
            )

            return Response({
                'success': True,
                'response': response.text
            })

        except Exception as e:
            print(f"Error in chatbot: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Authentication Views

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        ensure_student_profile(self.request.user)
        return self.request.user


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin | IsCompany | IsStudent]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email']
    ordering_fields = ['id', 'username']

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all()
        
        if user.role == User.Role.ADMIN_DEPT:
            try:
                admin_dept = AdminDept.objects.get(pk=user.pk)
                student_ids = Student.objects.filter(department=admin_dept.department).values_list('id', flat=True)
                queryset = User.objects.filter(id__in=student_ids)
            except AdminDept.DoesNotExist:
                queryset = User.objects.none()
        elif user.role == User.Role.ADMIN_UNIV:
            try:
                university = University.objects.get(admin_id=user.pk)
                student_ids = Student.objects.filter(department__university=university).values_list('id', flat=True)
                dept_admin_ids = AdminDept.objects.filter(department__university=university).values_list('id', flat=True)
                allowed_ids = list(student_ids) + list(dept_admin_ids)
                queryset = User.objects.filter(id__in=allowed_ids)
            except University.DoesNotExist:
                queryset = User.objects.none()
                
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        department_id = self.request.query_params.get('department')
        if department_id:
            student_ids = Student.objects.filter(department_id=department_id).values_list('id', flat=True)
            queryset = queryset.filter(id__in=student_ids)

        return queryset

class UserAdminUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    ordering_fields = ['id', 'username']

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.filter(role=User.Role.COMPANY, is_active=True)
    serializer_class = CompanySerializer
    permission_classes = [AllowAny] # Allow all users to see companies
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'company_field']

# messaging views


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
            unread_messages = messages.filter(recipient=user, is_read=False)
            if unread_messages.exists():
                unread_messages.update(is_read=True)
                # Broadcast read receipt
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                channel_layer = get_channel_layer()
                id1, id2 = sorted([user.id, int(recipient_id)])
                room_group_name = f'chat_{id1}_{id2}'
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'read_receipt',
                        'reader_id': user.id
                    }
                )
            return messages
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))

class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can edit/delete messages they sent or received (to allow reactions)
        return Message.objects.filter(Q(sender=self.request.user) | Q(recipient=self.request.user))

    def perform_destroy(self, instance):
        # Before deleting, get room information to notify the other user via WebSocket
        recipient_id = instance.recipient.id
        sender_id = instance.sender.id
        message_id = instance.id
        
        # Call super to delete
        super().perform_destroy(instance)
        
        # Broadcast message deletion
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        id1, id2 = sorted([sender_id, recipient_id])
        room_group_name = f'chat_{id1}_{id2}'
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'message_deleted',
                'message_id': message_id
            }
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Broadcast message edit
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        id1, id2 = sorted([instance.sender.id, instance.recipient.id])
        room_group_name = f'chat_{id1}_{id2}'
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'message_edited',
                'message_id': instance.id,
                'content': instance.content
            }
        )

# password change view

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
        from .services import update_finished_internships
        update_finished_internships()
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

class InternshipSimilarView(generics.ListAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        internship_id = self.kwargs.get('pk')
        try:
            internship = InternshipOffer.objects.get(pk=internship_id)
        except InternshipOffer.DoesNotExist:
            return InternshipOffer.objects.none()

        base_qs = InternshipOffer.objects.exclude(pk=internship_id).filter(
            status=InternshipOffer.Status.OPEN_FOR_APPLICATION
        )
        
        similar_qs = base_qs.filter(internship_type=internship.internship_type)
        if not similar_qs.exists():
            similar_qs = base_qs.filter(company=internship.company)
        return similar_qs.order_by('-id')[:3]

class InternshipListView(generics.ListAPIView):
    queryset = InternshipOffer.objects.all()
    serializer_class = InternshipSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description','company','internship_type','internship_location','internship_structure','status']
    ordering_fields = ['id', 'title', 'offer_start_date', 'offer_end_date']
    
    def get_queryset(self):
        from .services import update_finished_internships
        update_finished_internships()
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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        user = request.user
        if user.is_authenticated and user.role == User.Role.STUDENT:
            student = getattr(user, 'student', None)
            if student:
                from .services import calculate_unified_relevance_score
                
                # Pre-fetch follows to optimize database queries
                followed_company_ids = set(
                    CompanyFollow.objects.filter(student=student)
                    .values_list('company_id', flat=True)
                )
                
                scored_internships = []
                for internship in queryset:
                    is_followed = internship.company_id in followed_company_ids
                    relevance_score = calculate_unified_relevance_score(student, internship, is_followed)
                    internship.relevance_score = relevance_score
                    scored_internships.append(internship)
                
                # Sort by relevance_score descending by default (only if no custom ordering is requested)
                if not request.query_params.get('ordering'):
                    scored_internships.sort(key=lambda x: (x.relevance_score, x.id), reverse=True)
                
                queryset = scored_internships

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
        new_status = serializer.validated_data.get("status", old_status)
        if new_status == Application.Status.VALIDATED:
            raise PermissionDenied("Only admins can validate applications.")
        if (
            new_status == Application.Status.COMPLETE
            and (
                serializer.instance.status != Application.Status.VALIDATED
                or not serializer.instance.is_validated_by_admin
            )
        ):
            raise PermissionDenied("Only admin-validated applications can be completed.")

        # Enforce 48h window for company to change mind from rejected to accepted
        if old_status == Application.Status.REJECTED and new_status == Application.Status.ACCEPTED:
            if not serializer.instance.company_rejection_date or (timezone.now() - serializer.instance.company_rejection_date).total_seconds() > 48 * 3600:
                raise PermissionDenied("Cannot change decision from rejected to accepted after 48 hours.")

        application = serializer.save()
        internship = application.internship
        
        # Track rejection date / clear it
        if old_status != application.status:
            if application.status == Application.Status.REJECTED:
                application.company_rejection_date = timezone.now()
                application.save(update_fields=['company_rejection_date'])
            elif old_status == Application.Status.REJECTED:
                application.company_rejection_date = None
                application.save(update_fields=['company_rejection_date'])

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
                
                # Notify relevant Admins that validation is required
                admins = _get_validation_admins_for_student(application.student)
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
        
        from django.utils import timezone
        # Auto-complete validated internships whose end date has passed
        completed_apps = queryset.filter(
            status=Application.Status.VALIDATED,
            internship__offer_end_date__lt=timezone.now().date()
        )
        if completed_apps.exists():
            completed_apps.update(status=Application.Status.COMPLETE)
            
        # Re-fetch after update
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
            return _scope_applications_for_admin(queryset, user)
            
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

# dashboard views

class StudentDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        student = getattr(request.user, 'student', None)
        applications = Application.objects.filter(student=student)
        
        # Calculate profile completion from CV fields
        profile_completion = 0
        try:
            cv = DigitalCV.objects.filter(student=student).first() if student else None
        except Exception:
            cv = None
        if cv:
            # Define fields and their weights (total = 100)
            field_checks = [
                (bool(cv.first_name and cv.first_name.strip()), 10),
                (bool(cv.last_name and cv.last_name.strip()), 10),
                (bool(cv.email and cv.email.strip()), 10),
                (bool(cv.phone and cv.phone.strip()), 5),
                (bool(cv.profile_summary and cv.profile_summary.strip()), 15),
                (bool(cv.education and cv.education.strip()), 15),
                (bool(cv.skills and cv.skills.strip() and cv.skills.strip() != '[]'), 15),
                (bool(cv.experience and cv.experience.strip()), 10),
                (bool(cv.languages and cv.languages.strip() and cv.languages.strip() != '[]'), 5),
                (bool(cv.address and cv.address.strip()), 5),
            ]
            profile_completion = sum(weight for filled, weight in field_checks if filled)

        stats = {
            "pendingAplications": applications.filter(status=Application.Status.PENDING).count(),
            "acceptedApplications": applications.filter(status__in=[Application.Status.VALIDATED, Application.Status.COMPLETE]).count(),
            "totalApplications": applications.count(),
            "profileCompletion": profile_completion,
        }
        
        # Recent applications (limit to 5)
        recent_apps = applications.order_by('-application_date')[:5]
        
        # Mapping statuses to frontend expectations
        status_map = {
            Application.Status.PENDING: "Pending",
            Application.Status.ACCEPTED: "Accepted",
            Application.Status.VALIDATED: "Validated",
            Application.Status.COMPLETE: "Completed",
            Application.Status.REJECTED: "Rejected",
            Application.Status.CANCELLED: "Cancelled",
        }
        
        recent_apps_data = [
            {
                "id": app.id,
                "internship": app.internship.id,
                "offer": app.internship.title,
                "company": app.internship.company.name,
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

        total_apps = applications.count()
        processed_apps = applications.exclude(status=Application.Status.PENDING).count()
        recruitment_score = int((processed_apps / total_apps) * 100) if total_apps > 0 else 100

        stats = {
            "pendingApplications": applications.filter(status=Application.Status.PENDING).count(),
            "acceptedApplications": applications.filter(status__in=[
                Application.Status.ACCEPTED,
                Application.Status.VALIDATED,
                Application.Status.COMPLETE
            ]).count(),
            "totalInternships": internships.count(),
            "recruitmentScore": recruitment_score,
        }

        # Recent applications (all applications for sorting/filtering)
        recent_apps = applications.select_related(
            'student', 'internship'
        ).order_by('-application_date')

        # Mapping statuses to frontend expectations
        status_map = {
            Application.Status.PENDING: "Pending",
            Application.Status.ACCEPTED: "Accepted",
            Application.Status.VALIDATED: "Validated",
            Application.Status.COMPLETE: "Completed",
            Application.Status.REJECTED: "Rejected",
            Application.Status.CANCELLED: "Cancelled",
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

        # List of postings for dropdown
        postings_data = [
            {"id": offer.id, "title": offer.title}
            for offer in internships
        ]

        # Application velocity trend data based on selected month and posting
        import calendar
        from django.utils import timezone
        
        now = timezone.now()
        year = now.year
        
        selected_month_param = request.query_params.get('month')
        selected_posting_param = request.query_params.get('internship_id')
        
        month_map = {
            "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
            "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
        }
        
        selected_month = now.month
        if selected_month_param:
            if selected_month_param.lower() in month_map:
                selected_month = month_map[selected_month_param.lower()]
            else:
                try:
                    selected_month = int(selected_month_param)
                except ValueError:
                    pass
        
        chart_apps = applications.filter(application_date__year=year, application_date__month=selected_month)
        if selected_posting_param and selected_posting_param != "all" and selected_posting_param != "":
            try:
                chart_apps = chart_apps.filter(internship_id=int(selected_posting_param))
            except ValueError:
                pass
        
        # Calculate daily counts for the selected month
        from django.db.models import Count
        daily_counts = chart_apps.values('application_date__day').annotate(count=Count('id'))
        daily_counts_map = {item['application_date__day']: item['count'] for item in daily_counts}
        
        num_days = calendar.monthrange(year, selected_month)[1]
        velocity_data = [
            {
                "name": str(day),
                "value": daily_counts_map.get(day, 0)
            }
            for day in range(1, num_days + 1)
        ]

        return Response({
            "stats": stats,
            "applications": recent_apps_data,
            "postings": postings_data,
            "velocity": velocity_data,
        })


class AdminUnivDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN_UNIV:
            raise PermissionDenied("Only Admin Univ can access this dashboard.")

        applications = _scope_applications_for_admin(Application.objects.all(), request.user)
        admin_univ = getattr(request.user, 'adminuniv', None)
        university = getattr(admin_univ, 'university', None)

        if university:
            total_students = User.objects.filter(
                role=User.Role.STUDENT,
                student__department__university=university
            ).count()
            total_departments = university.departments.count()
        else:
            total_students = 0
            total_departments = 0

        # Total active companies registered on the platform
        total_companies = Company.objects.filter(role=User.Role.COMPANY, is_active=True).count()

        stats = {
            "totalStudents": total_students,
            "totalCompanies": total_companies,
            "totalDepartments": total_departments,
        }

        # Partner companies (prioritize university-linked, fallback to platform-active to stay populated)
        companies = Company.objects.none()
        if university:
            companies = Company.objects.filter(
                internshipoffer__application__student__department__university=university
            ).distinct()[:5]
            
        if not companies.exists():
            companies = Company.objects.filter(role=User.Role.COMPANY, is_active=True)[:5]

        companies_data = []
        for comp in companies:
            companies_data.append({
                "id": comp.id,
                "name": comp.name,
                "field": comp.company_field or "Technology",
                "location": comp.location or "Algeria",
                "email": comp.email,
                "size": comp.size or "10-50 Employees"
            })

        return Response({
            "stats": stats,
            "companies": companies_data
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
        queryset = Application.objects.filter(
            status=Application.Status.ACCEPTED,
            is_validated_by_admin=False
        )
        return _scope_applications_for_admin(queryset, self.request.user)

class AdminValidateApplicationView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        application = get_object_or_404(Application, pk=pk, status__in=[Application.Status.ACCEPTED, Application.Status.REJECTED])
        if not _scope_applications_for_admin(Application.objects.filter(pk=application.pk), request.user).exists():
            raise PermissionDenied("You do not have permission to validate this application.")
        # Check if it can be validated
        if application.status not in [Application.Status.ACCEPTED, Application.Status.REJECTED]:
            raise PermissionDenied("Invalid status for validation.")
            
        if application.status == Application.Status.REJECTED:
            # Check 48h rule
            if not application.admin_rejection_date or (timezone.now() - application.admin_rejection_date).total_seconds() > 48 * 3600:
                return Response({"error": "Cannot validate a rejected application after 48 hours."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = Application.Status.VALIDATED
        application.is_validated_by_admin = True
        application.admin_validation_date = timezone.now()
        application.save()
        
        # Notify student
        Notification.objects.get_or_create(
            recipient=application.student,
            notification_type=Notification.NotificationType.APPLICATION_VALIDATED,
            application=application,
            defaults={
                "message": f"Your internship at {application.internship.company.name} has been validated by the administration! You can now download your agreement."
            }
        )

        # Notify company
        Notification.objects.get_or_create(
            recipient=application.internship.company,
            notification_type=Notification.NotificationType.APPLICATION_VALIDATED,
            application=application,
            defaults={
                "message": f"The internship for {application.student.first_name} {application.student.last_name} has been validated by the administration."
            }
        )
        
        serializer = ApplicationSerializer(application, context={'request': request})
        return Response({"status": "validated", "application": serializer.data})

class AdminRejectApplicationView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        application = get_object_or_404(Application, pk=pk, status=Application.Status.ACCEPTED)
        if not _scope_applications_for_admin(Application.objects.filter(pk=application.pk), request.user).exists():
            raise PermissionDenied("You do not have permission to reject this application.")
        application.status = Application.Status.REJECTED
        application.is_validated_by_admin = False
        application.admin_rejection_date = timezone.now()
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
        
        serializer = ApplicationSerializer(application, context={'request': request})
        return Response({"status": "rejected", "application": serializer.data})

class AdminStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Use User model to count by role to be more reliable
        student_qs = User.objects.filter(role=User.Role.STUDENT)
        if request.user.role == User.Role.ADMIN_DEPT:
            dept = getattr(request.user, 'admindept', None)
            if dept and dept.department_id:
                student_qs = student_qs.filter(student__department=dept.department)
            else:
                student_qs = student_qs.none()
        elif request.user.role == User.Role.ADMIN_UNIV:
            admin_univ = getattr(request.user, 'adminuniv', None)
            university = getattr(admin_univ, 'university', None)
            if university:
                student_qs = student_qs.filter(student__department__university=university)
            else:
                student_qs = student_qs.none()

        total_students = student_qs.count()

        applications_scoped = _scope_applications_for_admin(Application.objects.all(), request.user)
        placed_students = applications_scoped.filter(
            status__in=[Application.Status.VALIDATED, Application.Status.COMPLETE],
            is_validated_by_admin=True
        ).values('student').distinct().count()
        
        unplaced_students = total_students - placed_students
        
        month_counts = applications_scoped.filter(
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

# Document generation views
import io
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from xhtml2pdf import pisa

class GenerateInternshipAgreementView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

        # =========================
        # PERMISSIONS CHECK
        # =========================
        if request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
            if not _scope_applications_for_admin(
                Application.objects.filter(pk=application.pk),
                request.user
            ).exists():
                raise PermissionDenied("No permission to view this document.")

        elif request.user.id != application.student.id and request.user.id != application.internship.company.id:
            raise PermissionDenied("No permission to view this document.")

        application.refresh_from_db()

        is_admin_validated = (
            application.is_validated_by_admin or
            application.status in [
                Application.Status.VALIDATED,
                Application.Status.COMPLETE
            ]
        )

        if not is_admin_validated:
            return Response(
                {"error": "Not validated by administration yet."},
                status=status.HTTP_403_FORBIDDEN
            )

        if application.status not in [
            Application.Status.VALIDATED,
            Application.Status.COMPLETE
        ]:
            return Response(
                {"error": f"Invalid status: {application.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # =========================
        # HTML TEMPLATE CONTEXT
        # =========================
        html_string = render_to_string(
            'internship_agreement.html', 
            {
                'student_name': application.student.first_name,
                'student_email': application.student.email,

                'company_name': application.internship.company.name,
                'company_email': application.internship.company.email,
                'company_phone': '0555555555',
                'company_wilaya': 'wilaya',

                'internship_theme': application.internship.title,
                'start_date': application.internship.offer_start_date,
                'end_date': application.internship.offer_end_date,
                'duration': application.internship.duration,

                'university_name': application.student.department.university.name,
            }
        )

        # =========================
        # PDF GENERATION (xhtml2pdf)
        # =========================
        result = io.BytesIO()

        pdf = pisa.pisaDocument(
            io.BytesIO(html_string.encode("UTF-8")),
            result
        )

        if pdf.err:
            return Response(
                {"error": "PDF generation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # =========================
        # RESPONSE
        # =========================
        response = HttpResponse(result.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="Convention_{application.student.first_name}.pdf"'
        )

        return response

# Certificate Generation View (only for validated and completed internships)
class GenerateInternshipCertificateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)

        # Check permissions: Student, Company, or Admin
        if request.user.role in [User.Role.ADMIN_DEPT, User.Role.ADMIN_UNIV]:
            if not _scope_applications_for_admin(Application.objects.filter(pk=application.pk), request.user).exists():
                raise PermissionDenied("You do not have permission to view this document.")
        elif request.user.id != application.student.id and request.user.id != application.internship.company.id:
            raise PermissionDenied("You do not have permission to view this document.")

        # Refresh application from database to get latest state
        application.refresh_from_db()

        if application.status != Application.Status.COMPLETE:
            return Response(
                {"error": "Certificate is available only after internship completion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not application.is_validated_by_admin:
            return Response(
                {"error": "Certificate requires an admin-validated internship."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # =========================
        # PREMIUM PDF GENERATION WITH BACKGROUND
        # =========================
        import os
        import uuid
        from PIL import Image, ImageDraw, ImageFont

        student = application.student
        student_name = f"{student.first_name} {student.last_name}".strip() or student.username or student.email
        
        # Paths to template and custom calligraphy font inside media root
        template_path = os.path.join(settings.MEDIA_ROOT, 'internship_images', 'certificate_templates.png')
        font_path = os.path.join(settings.MEDIA_ROOT, 'internship_images', 'ITCEDSCR.TTF')
        
        use_pillow_flow = os.path.exists(template_path)
        temp_img_path = None
        result = io.BytesIO()

        if use_pillow_flow:
            try:
                # Open template image
                img = Image.open(template_path)
                width, height = img.size
                draw = ImageDraw.Draw(img)
                
                # Standard sans-serif font for sentence dates and bottom date
                sans_font_paths = [
                    r"C:\Windows\Fonts\arial.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "/usr/share/fonts/TTF/DejaVuSans.ttf",
                ]
                font_arial = None
                font_bottom = None
                for path in sans_font_paths:
                    if os.path.exists(path):
                        try:
                            font_arial = ImageFont.truetype(path, 45)
                            font_bottom = ImageFont.truetype(path, 55)
                            break
                        except Exception:
                            pass

                # Determine font (fallback to system Times Italic if custom font is missing)
                if os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, 250)
                else:
                    # Robust calligraphy fallback paths for server-side compatibility
                    calligraphy_font_paths = [
                        r"C:\Windows\Fonts\timesi.ttf",
                        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
                        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
                    ]
                    font = None
                    for path in calligraphy_font_paths:
                        if os.path.exists(path):
                            try:
                                font = ImageFont.truetype(path, 250)
                                break
                            except Exception:
                                pass
                    if not font:
                        font = ImageFont.load_default()

                if not font_arial:
                    font_arial = font_bottom = ImageFont.load_default()
                
                # Draw student name centered horizontally and vertically at y = 870
                draw.text((width / 2, 870), student_name.title(), fill="#1e293b", font=font, anchor="mm")
                
                # Get start and end dates and construct strings matching the user's reference style
                english_months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ]
                start_date = application.internship.offer_start_date
                end_date = application.internship.offer_end_date
                
                start_month = english_months[start_date.month - 1]
                end_month = english_months[end_date.month - 1]
                
                start_date_str = start_month
                end_date_str = f"{end_month} {end_date.year}."
                bottom_date_str = end_date.strftime("%d.%m.%y")
                
                # Draw end date above the Date line on bottom-left
                draw.text((585, 1410), bottom_date_str, fill="#1e293b", font=font_bottom, anchor="mm")
                
                # Draw start and end dates in the "from [blank] to [blank]" gaps
                draw.text((1385, 1165), start_date_str, fill="#1e293b", font=font_arial, anchor="mm")
                draw.text((1620, 1165), end_date_str, fill="#1e293b", font=font_arial, anchor="mm")
                
                # Save modified image to a unique temp file inside media/internship_images
                temp_filename = f"temp_cert_{uuid.uuid4().hex}.png"
                temp_img_dir = os.path.join(settings.MEDIA_ROOT, 'internship_images')
                os.makedirs(temp_img_dir, exist_ok=True)
                temp_img_path = os.path.join(temp_img_dir, temp_filename)
                img.save(temp_img_path)
                
                # HTML template containing only the dynamically generated image scaled to A4 landscape
                html_string = f"""
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                    @page {{
                        size: a4 landscape;
                        margin: 0;
                        @frame content_frame {{
                            left: 0pt;
                            top: 0pt;
                            width: 842pt;
                            height: 595pt;
                        }}
                    }}
                    body {{
                        margin: 0;
                        padding: 0;
                    }}
                    img {{
                        width: 842pt;
                        height: 595pt;
                    }}
                </style>
                </head>
                <body>
                    <img src="{temp_img_path}" />
                </body>
                </html>
                """
                
                pdf = pisa.pisaDocument(
                    io.BytesIO(html_string.encode("UTF-8")),
                    result
                )
                
            except Exception:
                use_pillow_flow = False

        if not use_pillow_flow:
            # Fallback to older HTML template context in case Pillow generation fails
            html_string = render_to_string(
                'internship_certificate.html', 
                {
                    'student_name': student_name,
                    'company_name': application.internship.company.name,
                    'internship_title': application.internship.title,
                    'start_date': application.internship.offer_start_date,
                    'end_date': application.internship.offer_end_date,
                    'university_name': application.student.department.university.name,
                    'certificate_date': timezone.now().date(),
                }
            )
            
            pdf = pisa.pisaDocument(
                io.BytesIO(html_string.encode("UTF-8")),
                result
            )

        # Cleanup temporary image file if it was created
        if temp_img_path and os.path.exists(temp_img_path):
            try:
                os.remove(temp_img_path)
            except Exception:
                pass

        if pdf.err:
            return Response(
                {"error": "PDF generation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # =========================
        # RESPONSE
        # =========================
        response = HttpResponse(result.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="Certificate_{application.student.first_name}.pdf"'
        )

        return response


# CV Generation View 

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

        from io import BytesIO
        from django.http import FileResponse
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, TableStyle
        from reportlab.lib import colors
        import json

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        
        styles = getSampleStyleSheet()
        
        name_style = ParagraphStyle(
            'NameStyle', 
            parent=styles['Normal'], 
            fontName='Times-Bold', 
            fontSize=16, 
            alignment=TA_CENTER, 
            spaceAfter=5,
            textColor=colors.black
        )
        
        contact_style = ParagraphStyle(
            'ContactStyle', 
            parent=styles['Normal'], 
            fontName='Times-Roman', 
            fontSize=10, 
            alignment=TA_CENTER, 
            spaceAfter=2,
            textColor=colors.black
        )
        
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Times-Roman',
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=10,
            textColor=colors.black
        )
        
        bullet_style = ParagraphStyle(
            'BulletStyle',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=0,
            spaceBefore=0,
            spaceAfter=2
        )
        
        elements = []

        # Header - Name
        elements.append(Paragraph(f"{cv.first_name} {cv.last_name}", name_style))
        
        # Contact Info
        contact_parts_1 = []
        if cv.email: contact_parts_1.append(cv.email)
        if cv.phone: contact_parts_1.append(cv.phone)
        loc = cv.address or cv.wilaya
        if loc: contact_parts_1.append(loc)
        
        if contact_parts_1:
            elements.append(Paragraph(" &nbsp;&nbsp;&nbsp;&nbsp; ".join(contact_parts_1), contact_style))
            
        contact_parts_2 = []
        if cv.linkedin: contact_parts_2.append(cv.linkedin)
        if cv.github: contact_parts_2.append(cv.github)
        if cv.portfolio_link: contact_parts_2.append(cv.portfolio_link)
        
        if contact_parts_2:
            elements.append(Paragraph(" &nbsp;&nbsp;&nbsp;&nbsp; ".join(contact_parts_2), contact_style))
            
        elements.append(Spacer(1, 15))

        def add_section(title, content):
            if not content: return
            
            # Section Header with black line below
            t = RLTable([[title]], colWidths=['100%'])
            t.setStyle(TableStyle([
                ('FONTNAME', (0,0), (-1,-1), 'Times-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 11),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('LINEBELOW', (0,0), (-1,-1), 1, colors.black),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 8))
            
            # Content
            try:
                parsed = json.loads(content)
                if isinstance(parsed, list):
                    # For list-like content, use bullet points
                    for item in parsed:
                        if item.strip():
                            elements.append(Paragraph(f"• {item.strip()}", bullet_style))
                    return
            except Exception:
                pass
                
            elements.append(Paragraph(content.replace('\n', '<br/>'), body_style))

        add_section("SUMMARY", cv.profile_summary)
        add_section("EDUCATION", cv.education)
        add_section("PROFESSIONAL EXPERIENCE", cv.experience)
        add_section("SKILLS", cv.skills)
        add_section("LANGUAGES", cv.languages)

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"{cv.first_name}_{cv.last_name}_CV.pdf")

# Forgot Password and Reset Password Views

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
            
            #code of forget password last 10 minutes
            valid_time = timezone.now() - timedelta(minutes=10)
            reset_request = PasswordReset.objects.filter(
                user=user, 
                code=code, 
                is_used=False,
                created_at__gte=valid_time,
            ).last()
            
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


# Company Follow Views 

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

# ------------------------------------------------------------------------------------------
# Super Admin: Pending Companies Approvals
# ------------------------------------------------------------------------------------------

import uuid
from datetime import timedelta
from django.utils import timezone

def _generate_unique_matricule():
    return f"MAT-{str(uuid.uuid4()).upper()[:8]}"

class AdminPendingCompaniesView(generics.ListAPIView):
    """
    Returns a list of companies that registered without a valid matricule and are waiting for approval.
    Accessible only to SUPER ADMIN (or users with specific role if super admin role exists, assuming ADMIN_UNIV or custom).
    For now, we just require IsAuthenticated, but you should restrict it to your super admin role.
    """
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Pending companies have is_active=False
        return Company.objects.filter(is_active=False).order_by('-date_joined')

class AdminAcceptCompanyView(APIView):
    """
    Accepts a pending company. Generates a matricule for it, adds it to the Matriculation table, 
    and sets the company to active.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        
        if company.is_active:
            return Response({"error": "This company is already active."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a matricule for the company
        matricule = _generate_unique_matricule()
        expires = timezone.now() + timedelta(days=90)
        
        # Save it to the matriculation table
        Matriculation.objects.create(
            company_name=company.name,
            matricule=matricule,
            expires_at=expires
        )
        
        # Activate the company
        company.is_active = True
        company.save()
        
        return Response({
            "message": f"Company '{company.name}' has been accepted and activated.",
            "matricule": matricule
        }, status=status.HTTP_200_OK)

class AdminRejectCompanyView(APIView):
    """
    Rejects a pending company. Deletes the company from the database.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        
        if company.is_active:
            return Response({"error": "Cannot reject an already active company."}, status=status.HTTP_400_BAD_REQUEST)

        company_name = company.name
        
        # Deleting the company will also delete the User because of multi-table inheritance
        company.delete()
        
        return Response({
            "message": f"Company '{company_name}' has been rejected and removed from the database."
        }, status=status.HTTP_200_OK)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        internship_id = self.kwargs.get('internship_id')
        queryset = Review.objects.filter(internship_id=internship_id)
        
        sort_by = self.request.query_params.get('sort_by', 'newest')
        if sort_by == 'highest':
            queryset = queryset.order_by('-rating', '-created_at')
        else:  # newest
            queryset = queryset.order_by('-created_at')
            
        return queryset

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.STUDENT:
            return Response(
                {"error": "Only students can write reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ensure_student_profile(request.user)
        try:
            student = request.user.student
        except Exception:
            student = Student.objects.filter(id=request.user.id).first()
            if not student:
                try:
                    s = Student(user_ptr=request.user)
                    for field in request.user._meta.fields:
                        if field.name not in ['id', 'user_ptr']:
                            setattr(s, field.name, getattr(request.user, field.name))
                    s.save()
                    student = s
                except Exception as e:
                    return Response(
                        {"error": f"Failed to access or auto-heal student profile: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
        internship_id = self.kwargs.get('internship_id')
        internship = get_object_or_404(InternshipOffer, pk=internship_id)
        
        if Review.objects.filter(student=student, internship=internship).exists():
            return Response(
                {"error": "You have already reviewed this internship."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        is_verified = Application.objects.filter(
            student=student,
            internship=internship,
            status__in=[Application.Status.VALIDATED, Application.Status.COMPLETE]
        ).exists()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student, internship=internship, is_verified=is_verified)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UniversityPublicListView(generics.ListAPIView):
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    queryset = University.objects.all().order_by('name') if hasattr(University, 'objects') else []

    def get_queryset(self):
        qs = University.objects.all().order_by('name')
        print(f"--- [DIAGNOSTIC] Universities requested. Count in DB: {qs.count()} ---")
        for u in qs:
            print(f"  - Univ ID: {u.id}, Name: {u.name}, Domain: {u.email_domain}")
        return qs

class DepartmentPublicListView(generics.ListAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        university_id = self.request.query_params.get('university_id')
        if university_id:
            qs = Department.objects.filter(university_id=university_id).order_by('name')
            print(f"--- [DIAGNOSTIC] Departments requested for Univ ID {university_id}. Count: {qs.count()} ---")
            return qs
        qs = Department.objects.all().order_by('name')
        print(f"--- [DIAGNOSTIC] All Departments requested. Count: {qs.count()} ---")
        return qs

class AdminUnivDepartmentListView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN_UNIV:
            raise PermissionDenied("Only Admin Univ can access this.")
        try:
            university = University.objects.get(admin_id=self.request.user.pk)
            return Department.objects.filter(university=university)
        except University.DoesNotExist:
            return Department.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.ADMIN_UNIV:
            raise PermissionDenied("Only Admin Univ can access this.")
        try:
            university = University.objects.get(admin_id=self.request.user.pk)
            serializer.save(university=university)
        except University.DoesNotExist:
            raise PermissionDenied("University does not exist.")

class AdminUnivDepartmentDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN_UNIV:
            raise PermissionDenied("Only Admin Univ can access this.")
        try:
            university = University.objects.get(admin_id=self.request.user.pk)
            return Department.objects.filter(university=university)
        except University.DoesNotExist:
            return Department.objects.none()
