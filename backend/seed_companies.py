import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apis.models import User, Company

def seed_companies():
    print("Starting company seeding...")

    companies_data = [
        {"name": "Sonatrach", "field": "Energy & Oil", "location": "Algiers"},
        {"name": "Djezzy", "field": "Telecommunications", "location": "Algiers"},
        {"name": "Ooredoo", "field": "Telecommunications", "location": "Algiers"},
        {"name": "Mobilis", "field": "Telecommunications", "location": "Algiers"},
        {"name": "Cevital", "field": "Agro-industry", "location": "Bejaia"},
        {"name": "Sonelgaz", "field": "Energy & Electricity", "location": "Algiers"},
        {"name": "Yassir", "field": "Technology & Transport", "location": "Algiers"},
        {"name": "Heetch", "field": "Technology & Transport", "location": "Algiers"},
        {"name": "Condor", "field": "Electronics", "location": "Bordj Bou Arreridj"},
        {"name": "Sidi-Ali", "field": "Food Industry", "location": "Algiers"},
    ]

    for data in companies_data:
        # Format name for email (lowercase, no spaces)
        clean_name = data["name"].lower().replace(" ", "").replace("-", "")
        email = f"{clean_name}@gmail.com"
        password = clean_name
        username = data["name"].replace(" ", "")

        user = User.objects.filter(email=email).first()
        if not user:
            print(f"Creating user for {data['name']}...")
            user = User.objects.create(
                email=email,
                username=username,
                role=User.Role.COMPANY,
                is_active=True
            )
            user.set_password(password)
            user.save()
        
        company = Company.objects.filter(user_ptr=user).first()
        if not company:
            print(f"Creating company profile for {data['name']}...")
            company = Company(user_ptr=user)
            company.name = data["name"]
            company.company_field = data["field"]
            company.location = data["location"]
            company.description = f"Leading company in {data['field']} sector in Algeria."
            
            # Copy base user fields for MTI
            for field in user._meta.fields:
                setattr(company, field.name, getattr(user, field.name))
            company.save()
        else:
            print(f"Company {data['name']} already exists.")

    print("Successfully seeded companies!")

if __name__ == "__main__":
    seed_companies()
