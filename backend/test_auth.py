import os
import django
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apis.models import User
from django.contrib.auth import authenticate

email = 'login_test@test.com'
password = 'password123'
username = 'testuser123'

User.objects.filter(email=email).delete()
User.objects.create_user(email=email, password=password, username=username)

print(f"Testing Auth for {email}")
u1 = authenticate(username=email, password=password)
print(f"Auth with email: {u1}")

u2 = authenticate(username=username, password=password)
print(f"Auth with username: {u2}")
