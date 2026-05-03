from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import timedelta

# user model

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        COMPANY = 'COMPANY', 'Company'
        ADMIN = 'ADMIN', 'Admin'

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, null=True, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

class Student(User):
    university_id = models.CharField(max_length=50, blank=True, null=True)
    wilaya = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        verbose_name_plural = "Students"

class Company(User):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    company_field = models.CharField(max_length=255, blank=True, null=True)
    founded_year = models.IntegerField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Companies"

class Administrator(User):
    department = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Administrators"


# internship model

class InternshipOffer(models.Model):

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN_FOR_APPLICATION = 'OPEN_FOR_APPLICATION', 'Open for Application'
        CLOSED_FOR_APPLICATION = 'CLOSED_FOR_APPLICATION', 'Closed for Application'
        ONGOING = 'ONGOING', 'Ongoing'
        FINISHED = 'FINISHED', 'Finished'
        CANCELLED = 'CANCELLED', 'Cancelled'
        ARCHIVED = 'ARCHIVED', 'Archived'
        HIDDEN = 'HIDDEN', 'Hidden'

    class InternshipLocation(models.TextChoices):
        REMOTE = 'REMOTE', 'Remote'
        ONSITE = 'ONSITE', 'Onsite'
        HYBRID = 'HYBRID', 'Hybrid'
    
    class InternshipStructure(models.TextChoices):
        FOR_CREDIT = 'FOR_CREDIT', 'For Credit'
        CO_OP = 'CO_OP', 'Co-op'
        FELLOWSHIP = 'FELLOWSHIP', 'Fellowship'

    class InternshipType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'

    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    internship_location = models.CharField(choices=InternshipLocation.choices, default=InternshipLocation.ONSITE)
    status = models.CharField(choices=Status.choices, default=Status.DRAFT)
    internship_type = models.CharField(choices=InternshipType.choices, default=InternshipType.FULL_TIME)
    internship_structure = models.CharField(choices=InternshipStructure.choices, default=InternshipStructure.FOR_CREDIT)
    offer_start_date = models.DateField()
    offer_end_date = models.DateField()
    number_of_places = models.IntegerField()
    internship_duration = models.DurationField(default=timedelta(days=0))
    internship_salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    internship_skills = models.TextField(blank=True, null=True)
    internship_image = models.ImageField(upload_to='internship_images/', blank=True, null=True)
    wilaya = models.CharField(max_length=100, blank=True, null=True)


# application model
    
class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    internship = models.ForeignKey(InternshipOffer, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    application_date = models.DateField(auto_now_add=True)
    is_validated_by_admin = models.BooleanField(default=False)
    admin_validation_date = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_internship_status()

    def delete(self, *args, **kwargs):
        internship = self.internship
        super().delete(*args, **kwargs)
        self.update_internship_status(internship)

    def update_internship_status(self, internship=None):
        if not internship:
            internship = self.internship
        
        # Count ONLY applications that have been validated by the ADMIN
        accepted_count = self.__class__.objects.filter(
            internship_id=internship.id,
            status='ACCEPTED',
            is_validated_by_admin=True
        ).count()
        
        # If accepted count reaches the limit, close internship and reject the rest
        if accepted_count >= internship.number_of_places:
            if internship.status == 'OPEN_FOR_APPLICATION':
                internship.status = 'CLOSED_FOR_APPLICATION'
                internship.save()
                
            # 1. Get all other unvalidated applications
            other_apps = self.__class__.objects.filter(
                internship_id=internship.id,
                is_validated_by_admin=False
            ).exclude(id=self.id)
            
            # 2. Extract student IDs for notifications before updating
            student_ids = list(other_apps.values_list('student_id', flat=True))
            
            # 3. Bulk update status to REJECTED (more efficient and avoids recursion)
            other_apps.update(status='REJECTED')
            
            # 4. Send notifications
            from .models import Student
            for student_id in student_ids:
                Notification.objects.create(
                    recipient_id=student_id,
                    notification_type=Notification.NotificationType.APPLICATION_REJECTED,
                    message=f"The internship '{internship.title}' is now full. Your application has been automatically rejected.",
                    application_id=None # Since we can't easily link bulk rejected ones to a single notification app object here safely
                )
        # If it falls below limit (e.g. admin rejected one), reopen it
        elif internship.status == 'CLOSED_FOR_APPLICATION':
            internship.status = 'OPEN_FOR_APPLICATION'
            internship.save()


 # skills model

class Skills(models.Model):
    class SkillLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
    name = models.CharField(max_length=100)
    skill_level = models.CharField(max_length=20, choices=SkillLevel.choices, default=SkillLevel.BEGINNER)
    internship = models.ForeignKey(InternshipOffer, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.name   


# digital cv model

class DigitalCV(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='digital_cv')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio_link = models.URLField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    image = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)    
    wilaya = models.CharField(max_length=100, blank=True, null=True)
    university_id = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)    
    cv_file = models.FileField(upload_to='cvs/', blank=True, null=True)
    

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# notification model

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_APPLICATION = 'NEW_APPLICATION', 'New Application'
        APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED', 'Application Accepted'
        APPLICATION_REJECTED = 'APPLICATION_REJECTED', 'Application Rejected'
        VALIDATION_REQUIRED = 'VALIDATION_REQUIRED', 'Validation Required'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.message[:50]}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"From {self.sender.email} to {self.recipient.email} at {self.created_at}"

class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Temporarily simple check for testing
        return not self.is_used
