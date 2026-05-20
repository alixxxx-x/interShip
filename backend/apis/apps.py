from django.apps import AppConfig


class ApisConfig(AppConfig):
    name = 'apis'

    def ready(self):
        import os
        import threading
        
        def run_startup_tasks():
            # Clean up extra companies, keeping only Google, Djezzy, and Ooredoo
            try:
                from .models import Company, User
                allowed_keys = ['google', 'djezzy', 'ooredoo']
                companies = Company.objects.all()
                for company in list(companies):
                    name_lower = company.name.lower()
                    if not any(key in name_lower for key in allowed_keys):
                        print(f"--- CLEANUP: Deleting company {company.name} ---")
                        user_id = company.id
                        company.delete()
                        User.objects.filter(id=user_id).delete()
                
                # Also clean up loose base User records with role=COMPANY that are not matched
                company_users = User.objects.filter(role=User.Role.COMPANY)
                for user in list(company_users):
                    email_or_username = (user.email or '').lower() + (user.username or '').lower()
                    if not any(key in email_or_username for key in allowed_keys):
                        print(f"--- CLEANUP: Deleting loose company user {user.email} ---")
                        user.delete()
            except Exception as e:
                print(f"Error during company cleanup startup task: {e}")

            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                admin_user = User.objects.filter(username='admin').first() or User.objects.filter(email='admin@stag.io').first()
                if not admin_user:
                    User.objects.create_superuser(
                        username='admin',
                        email='admin@stag.io',
                        password='admin123',
                        role='ADMIN'
                    )
                    print("--- ADMIN ACCOUNT CREATED: user='admin', pass='admin123' ---")
                else:
                    admin_user.email = 'admin@stag.io'
                    admin_user.username = 'admin'
                    admin_user.set_password('admin123')
                    admin_user.role = 'ADMIN'
                    admin_user.is_superuser = True
                    admin_user.is_staff = True
                    admin_user.is_active = True
                    admin_user.save()
                    print("--- ADMIN ACCOUNT UPDATED: user='admin', pass='admin123' ---")
            except Exception as e:
                print(f"Error creating/updating admin: {e}")
            
            try:
                from .models import InternshipOffer, Application
                from django.db.models import Count, Q
                
                closed_offers = InternshipOffer.objects.filter(status='CLOSED_FOR_APPLICATION')
                for offer in closed_offers:
                    validated_count = Application.objects.filter(
                        internship=offer,
                        status__in=['VALIDATED', 'COMPLETE'],
                        is_validated_by_admin=True
                    ).count()
                    
                    if validated_count < offer.number_of_places:
                        offer.status = 'OPEN_FOR_APPLICATION'
                        offer.save()
                        print(f"--- REOPENED INTERNSHIP: {offer.title} ({validated_count}/{offer.number_of_places}) ---")
                    else:
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

        if os.environ.get('RUN_MAIN') == 'true':
            # Run in a separate thread to bypass Django's AppConfig.ready() database access warning
            threading.Timer(1.5, run_startup_tasks).start()
