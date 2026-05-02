from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username or kwargs.get(User.USERNAME_FIELD)
        print(f"DEBUG: Authenticating email: {email}")
        
        if not email:
            return None

        try:
            user = User.objects.get(email__iexact=email)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            print(f"DEBUG: User not found for email: {email}")
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            print(f"DEBUG: Authentication successful for: {email}")
            return user
        
        print(f"DEBUG: Authentication failed for: {email}")
        return None

