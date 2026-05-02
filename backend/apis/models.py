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
    class Meta:
        verbose_name_plural = "Students"

class Company(User):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    company_field = models.CharField(max_length=255, blank=True, null=True)

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
        
        # Count only accepted applications
        accepted_count = self.__class__.objects.filter(
            internship_id=internship.id,
            status='ACCEPTED'
        ).count()
        
        # If accepted count reaches the limit, close internship and reject the rest
        if accepted_count >= internship.number_of_places:
            if internship.status == 'OPEN_FOR_APPLICATION':
                internship.status = 'CLOSED_FOR_APPLICATION'
                internship.save()
                
            # Send manual notifications to automatically rejected students
            pending_apps = self.__class__.objects.filter(
                internship_id=internship.id,
                status='PENDING'
            )
            from django.apps import apps
            NotificationModel = apps.get_model('apis', 'Notification')
            for app in pending_apps:
                NotificationModel.objects.create(
                    recipient=app.student,
                    notification_type='APPLICATION_REJECTED',
                    message=f"Your application for '{internship.title}' has been rejected as the positions are now filled.",
                    application=app
                )
            
            # Bulk reject the remaining pending applications
            pending_apps.update(status='REJECTED')
        else:
            # If accepted count is below limit, reopen if it was closed
            if internship.status == 'CLOSED_FOR_APPLICATION':
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
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    education = models.TextField()
    skills = models.TextField()
    profile_summary = models.TextField()
    github_link = models.URLField(blank=True, null=True)
    experience = models.TextField()
    languages = models.TextField()  
    cv_pdf = models.FileField(upload_to='cv_pdfs/', blank=True, null=True)

    def __str__(self):
        return f"CV of {self.first_name} {self.last_name}"


# notification model

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_APPLICATION = 'NEW_APPLICATION', 'New Application'
        APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED', 'Application Accepted'
        APPLICATION_REJECTED = 'APPLICATION_REJECTED', 'Application Rejected'

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
