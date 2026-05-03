import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apis.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@stag.io',
        password='admin123',
        role='ADMIN'
    )
    print("Admin user created successfully!")
else:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.role = 'ADMIN'
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
    print("Admin user already exists, password updated to 'admin123'")
