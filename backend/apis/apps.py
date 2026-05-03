from django.apps import AppConfig


class ApisConfig(AppConfig):
    name = 'apis'

    def ready(self):
        # This will run when the server starts
        import os
        if os.environ.get('RUN_MAIN') == 'true': # Ensure it only runs once in dev server
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                if not User.objects.filter(username='admin').exists():
                    User.objects.create_superuser(
                        username='admin',
                        email='admin@stag.io',
                        password='admin123',
                        role='ADMIN'
                    )
                    print("--- ADMIN ACCOUNT CREATED: user='admin', pass='admin123' ---")
            except Exception as e:
                print(f"Error creating admin: {e}")
            
            # Auto-fix internship statuses on startup
            try:
                from .models import InternshipOffer, Application
                from django.db.models import Count, Q
                
                # Find closed internships that should be open
                closed_offers = InternshipOffer.objects.filter(status='CLOSED_FOR_APPLICATION')
                for offer in closed_offers:
                    validated_count = Application.objects.filter(
                        internship=offer,
                        status='ACCEPTED',
                        is_validated_by_admin=True
                    ).count()
                    
                    if validated_count < offer.number_of_places:
                        offer.status = 'OPEN_FOR_APPLICATION'
                        offer.save()
                        print(f"--- REOPENED INTERNSHIP: {offer.title} ({validated_count}/{offer.number_of_places}) ---")
                    else:
                        # If full, ensure others are rejected
                        surplus_apps = Application.objects.filter(
                            internship=offer,
                            is_validated_by_admin=False
                        ).exclude(status='REJECTED')
                        
                        if surplus_apps.exists():
                            count = surplus_apps.count()
                            surplus_apps.update(status='REJECTED')
                            print(f"--- CLEANED UP: Rejected {count} surplus applications for {offer.title} ---")
            except Exception as e:
                print(f"Error fixing internship statuses: {e}")
