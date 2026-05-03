import os
import django
import random
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apis.models import User, Student, Company, InternshipOffer, Application

def seed_data():
    print("Starting data seeding...")

    # 1. Create or get a Company
    email_company = "test_company@intership.com"
    company_user = User.objects.filter(email=email_company).first()
    if not company_user:
        company_user = User.objects.create(
            email=email_company,
            username="TestCompany",
            role=User.Role.COMPANY,
            is_active=True
        )
        company_user.set_password("password123")
        company_user.save()
    
    company = Company.objects.filter(user_ptr=company_user).first()
    if not company:
        # Create company profile for existing user
        company = Company(user_ptr=company_user)
        company.name = "Global Tech Solutions"
        company.description = "A leading provider of innovative software products."
        company.location = "Algiers, Algeria"
        company.company_field = "Technology"
        # We need to copy user fields to company instance for Django's inheritance
        for field in company_user._meta.fields:
            setattr(company, field.name, getattr(company_user, field.name))
        company.save()

    # 2. Create or get a Student
    email_student = "test_student@university.edu"
    student_user = User.objects.filter(email=email_student).first()
    if not student_user:
        student_user = User.objects.create(
            email=email_student,
            username="AliceSmith",
            role=User.Role.STUDENT,
            is_active=True
        )
        student_user.set_password("password123")
        student_user.save()

    student = Student.objects.filter(user_ptr=student_user).first()
    if not student:
        student = Student(user_ptr=student_user)
        student.university_id = "STU2024001"
        student.phone = "0550123456"
        student.wilaya = "Algiers"
        for field in student_user._meta.fields:
            setattr(student, field.name, getattr(student_user, field.name))
        student.save()

    # 3. Create an Internship Offer
    internship = InternshipOffer.objects.filter(title="Frontend Development Intern", company=company).first()
    if not internship:
        internship = InternshipOffer.objects.create(
            title="Frontend Development Intern",
            company=company,
            description="Join our team to build amazing user interfaces with React.",
            internship_location="Remote",
            internship_type="Full-time",
            status=InternshipOffer.Status.OPEN_FOR_APPLICATION,
            offer_start_date=date.today() + timedelta(days=7),
            offer_end_date=date.today() + timedelta(days=90),
            number_of_places=3
        )

    # 4. Create an Accepted Application
    application = Application.objects.filter(student=student, internship=internship).first()
    if not application:
        application = Application.objects.create(
            student=student,
            internship=internship,
            status=Application.Status.ACCEPTED
        )
    else:
        application.status = Application.Status.ACCEPTED
        application.save()

    # 5. Create another one for variety
    email_student2 = "bob_intern@university.edu"
    student_user2 = User.objects.filter(email=email_student2).first()
    if not student_user2:
        student_user2 = User.objects.create(
            email=email_student2,
            username="BobIntern",
            role=User.Role.STUDENT,
            is_active=True
        )
        student_user2.set_password("password123")
        student_user2.save()

    student2 = Student.objects.filter(user_ptr=student_user2).first()
    if not student2:
        student2 = Student(user_ptr=student_user2)
        student2.university_id = "STU2024002"
        student2.phone = "0550987654"
        student2.wilaya = "Oran"
        for field in student_user2._meta.fields:
            setattr(student2, field.name, getattr(student_user2, field.name))
        student2.save()

    Application.objects.get_or_create(
        student=student2,
        internship=internship,
        defaults={
            "status": Application.Status.ACCEPTED
        }
    )

    print("Successfully seeded test data!")
    print(f"Company: {company.name}")
    print(f"Student 1: {student.username} - ACCEPTED")
    print(f"Student 2: {student2.username} - ACCEPTED")
    print("These should now appear in the Admin Validations page.")

if __name__ == "__main__":
    seed_data()
