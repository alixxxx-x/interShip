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
    interbship_location = models.CharField(choices=InternshipLocation.choices, default=InternshipLocation.ONSITE)
    status = models.CharField(choices=Status.choices, default=Status.DRAFT)
    internship_type = models.CharField(choices=InternshipType.choices, default=InternshipType.FULL_TIME)
    internship_structure = models.CharField(choices=InternshipStructure.choices, default=InternshipStructure.FOR_CREDIT)
    offer_start_date = models.DateField()
    offer_end_date = models.DateField()
    number_of_places = models.IntegerField()
    internship_duration = models.DurationField(default=timedelta(days=0))


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
    


    


