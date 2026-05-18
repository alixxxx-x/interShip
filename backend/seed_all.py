import os
import django
import random
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apis.models import User, Student, Company, Administrator, InternshipOffer, Application, DigitalCV, Notification, Message

def seed_database():
    print("🚀 Starting full database seeding...")

    # 1. Create Admin
    admin_email = 'admin@stag.io'
    if not User.objects.filter(email=admin_email).exists():
        admin = Administrator.objects.create_superuser(
            email=admin_email,
            username='admin',
            password='admin123',
            role=User.Role.ADMIN,
            department='Information Technology'
        )
        print(f"✅ Admin created: {admin_email}")
    else:
        admin = User.objects.get(email=admin_email)
        print(f"ℹ️ Admin already exists: {admin_email}")

    # 2. Create Companies
    companies_data = [
        {"name": "Sonatrach", "field": "Energy & Oil", "location": "Algiers", "email": "sonatrach@gmail.com"},
        {"name": "Djezzy", "field": "Telecommunications", "location": "Algiers", "email": "djezzy@gmail.com"},
        {"name": "Ooredoo", "field": "Telecommunications", "location": "Algiers", "email": "ooredoo@gmail.com"},
        {"name": "Mobilis", "field": "Telecommunications", "location": "Algiers", "email": "mobilis@gmail.com"},
        {"name": "Cevital", "field": "Agro-industry", "location": "Bejaia", "email": "cevital@gmail.com"},
    ]

    companies = []
    for c_data in companies_data:
        if not User.objects.filter(email=c_data['email']).exists():
            company = Company.objects.create_user(
                email=c_data['email'],
                username=c_data['name'].lower(),
                password=c_data['name'].lower(), # Password is company name
                role=User.Role.COMPANY,
                name=c_data['name'],
                company_field=c_data['field'],
                location=c_data['location'],
                description=f"Leading company in {c_data['field']} sector in Algeria.",
                website=f"https://www.{c_data['name'].lower()}.dz"
            )
            companies.append(company)
            print(f"✅ Company created: {c_data['name']}")
        else:
            companies.append(Company.objects.get(email=c_data['email']))

    # 3. Create & Update Students
    from apis.models import AdminUniv
    admin_univs = list(AdminUniv.objects.all())
    
    univ_dept_pairs = []
    for au in admin_univs:
        univ_name = au.university_name
        depts = au.departments
        if depts and isinstance(depts, list):
            for dept in depts:
                univ_dept_pairs.append((univ_name, dept))
        elif depts and isinstance(depts, str):
            univ_dept_pairs.append((univ_name, depts))

    if not univ_dept_pairs:
        univ_dept_pairs = [
            ("Université Abdelhamid Mehri - Constantine 2", "Informatique (NTIC)"),
            ("Université Abdelhamid Mehri - Constantine 2", "Mathématiques"),
            ("Université des Frères Mentouri - Constantine 1", "Sciences de la Nature et de la Vie"),
            ("Université des Frères Mentouri - Constantine 1", "Droit"),
        ]

    students_data = [
        {"first": "Ahmed", "last": "Ziri", "email": "ahmed.ziri@univ.dz", "wilaya": "Algiers"},
        {"first": "Samy", "last": "Amir", "email": "samy.amir@univ.dz", "wilaya": "Oran"},
        {"first": "Lina", "last": "Kaced", "email": "lina.kaced@univ.dz", "wilaya": "Bejaia"},
        {"first": "Meriem", "last": "Belaid", "email": "meriem.belaid@univ.dz", "wilaya": "Tizi Ouzou"},
        {"first": "Omar", "last": "Fekir", "email": "omar.fekir@univ.dz", "wilaya": "Constantine"},
    ]

    students = []
    for i, s_data in enumerate(students_data):
        univ_name, dept = univ_dept_pairs[i % len(univ_dept_pairs)]
        if not User.objects.filter(email=s_data['email']).exists():
            student = Student.objects.create_user(
                email=s_data['email'],
                username=s_data['email'].split('@')[0],
                password='password123',
                role=User.Role.STUDENT,
                first_name=s_data['first'],
                last_name=s_data['last'],
                university_name=univ_name,
                department=dept,
                wilaya=s_data['wilaya'],
                university_id=f"2024{random.randint(1000, 9999)}",
                phone=f"0{random.randint(5, 7)}{random.randint(10000000, 99999999)}"
            )
            
            # Create Digital CV for student
            DigitalCV.objects.create(
                student=student,
                first_name=s_data['first'],
                last_name=s_data['last'],
                email=s_data['email'],
                phone=student.phone,
                profile_summary=f"Enthusiastic {dept} student looking for an internship opportunity.",
                skills="Python, React, Django, SQL",
                experience="Academic projects at University.",
                education=f"Bachelor in {dept} at {univ_name}",
                wilaya=s_data['wilaya'],
                university_id=student.university_id
            )
            
            students.append(student)
            print(f"✅ Student created: {s_data['first']} {s_data['last']} ({univ_name} - {dept})")
        else:
            student = Student.objects.get(email=s_data['email'])
            # Update university and department
            student.university_name = univ_name
            student.department = dept
            student.save()
            
            # Update or create digital CV
            cv, created = DigitalCV.objects.get_or_create(
                student=student,
                defaults={
                    "first_name": student.first_name or "",
                    "last_name": student.last_name or "",
                    "email": student.email,
                    "phone": student.phone or "",
                    "profile_summary": f"Enthusiastic {dept} student looking for an internship opportunity.",
                    "skills": "Python, React, Django, SQL",
                    "experience": "Academic projects at University.",
                    "education": f"Bachelor in {dept} at {univ_name}",
                    "wilaya": student.wilaya or "",
                    "university_id": student.university_id or ""
                }
            )
            if not created:
                cv.education = f"Bachelor in {dept} at {univ_name}"
                cv.save()
                
            students.append(student)
            print(f"ℹ️ Student updated: {student.first_name} {student.last_name} ({univ_name} - {dept})")

    # Update ANY other existing students in the database that are not in the predefined list
    all_db_students = Student.objects.exclude(email__in=[s['email'] for s in students_data])
    for i, student in enumerate(all_db_students):
        univ_name, dept = univ_dept_pairs[(len(students_data) + i) % len(univ_dept_pairs)]
        student.university_name = univ_name
        student.department = dept
        student.save()
        
        cv, created = DigitalCV.objects.get_or_create(
            student=student,
            defaults={
                "first_name": student.first_name or "",
                "last_name": student.last_name or "",
                "email": student.email,
                "phone": student.phone or "",
                "profile_summary": f"Enthusiastic {dept} student looking for an internship opportunity.",
                "skills": "Python, React, Django, SQL",
                "experience": "Academic projects at University.",
                "education": f"Bachelor in {dept} at {univ_name}",
                "wilaya": student.wilaya or "",
                "university_id": student.university_id or ""
            }
        )
        if not created:
            cv.education = f"Bachelor in {dept} at {univ_name}"
            cv.save()
        print(f"🔄 Existing DB Student updated: {student.first_name} {student.last_name} ({univ_name} - {dept})")

    # 4. Create Internship Offers
    titles = [
        "Web Developer Intern", "AI Research Intern", "Network Security Assistant", 
        "Data Analyst Intern", "Mobile App Developer", "Cloud Engineering Intern",
        "UI/UX Design Intern", "Embedded Systems Intern"
    ]
    
    internships = []
    for company in companies:
        for i in range(2):
            title = random.choice(titles)
            internship = InternshipOffer.objects.create(
                title=f"{title} at {company.name}",
                description=f"Join {company.name} as a {title}. You will work on real-world projects and gain valuable experience in the {company.company_field} industry.",
                company=company,
                internship_location=random.choice(InternshipOffer.InternshipLocation.choices)[0],
                status=InternshipOffer.Status.OPEN_FOR_APPLICATION,
                internship_type=random.choice(InternshipOffer.InternshipType.choices)[0],
                internship_structure=InternshipOffer.InternshipStructure.FOR_CREDIT,
                offer_start_date=date.today() + timedelta(days=7),
                offer_end_date=date.today() + timedelta(days=90),
                number_of_places=random.randint(2, 5),
                internship_duration=timedelta(days=random.randint(30, 120)),
                internship_salary=random.randint(5000, 20000),
                wilaya=company.location
            )
            internships.append(internship)
            print(f"✅ Internship created: {internship.title}")

    # 5. Create Applications
    for student in students:
        # Apply to 2 random internships
        chosen_internships = random.sample(internships, 2)
        for internship in chosen_internships:
            app = Application.objects.create(
                student=student,
                internship=internship,
                status=random.choice([Application.Status.PENDING, Application.Status.ACCEPTED, Application.Status.REJECTED]),
            )
            
            # If accepted, sometimes simulate admin validation
            if app.status == Application.Status.ACCEPTED and random.choice([True, False]):
                app.is_validated_by_admin = True
                app.admin_validation_date = django.utils.timezone.now()
                app.save()
            
            print(f"✅ Application created: {student.first_name} -> {internship.title}")

    # 6. Create some Notifications
    for user in User.objects.all():
        Notification.objects.create(
            recipient=user,
            notification_type=Notification.NotificationType.NEW_APPLICATION if user.role == User.Role.COMPANY else Notification.NotificationType.APPLICATION_ACCEPTED,
            message=f"Welcome to Stag.Io, {user.username}! This is your first notification."
        )

    # 7. Create some Messages
    if students and companies:
        Message.objects.create(
            sender=students[0],
            recipient=companies[0],
            content="Hello, I am interested in the internship offer. Can I have more details?"
        )
        Message.objects.create(
            sender=companies[0],
            recipient=students[0],
            content="Hello Ahmed! Sure, please check the description or visit our website for more info."
        )

    print("\n✨ Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
