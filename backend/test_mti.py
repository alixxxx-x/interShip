import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apis.models import User, Company, Student

u_company = Company.objects.first()
if u_company:
    print(f"Company Instance: {u_company.email}")
    print(f"Has company attr: {hasattr(u_company, 'company')}")
    try:
        print(f"Attr company: {u_company.company}")
    except Exception as e:
        print(f"Error accessing .company: {e}")

u_user = User.objects.get(id=u_company.id)
print(f"User Instance (of company): {u_user.email}")
print(f"Has company attr on User: {hasattr(u_user, 'company')}")
print(f"Attr company on User: {u_user.company}")
