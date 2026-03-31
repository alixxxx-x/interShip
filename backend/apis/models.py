from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        COMPANY = 'COMPANY', 'Company'
        ADMIN = 'ADMIN', 'Admin'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Student(User):
    university_id = models.CharField(max_length=50)
    wilaya = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)

    class Meta:
        verbose_name_plural = "Students"

class Company(User):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Companies"

class Administrator(User):
    department = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Administrators"

