import sys
import os
import uuid
import asgiref.sync
from datetime import timedelta
from django.utils import timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from apis.models import Company, Matriculation
from asgiref.sync import sync_to_async

def _generate_unique_matricule():
    # Example format: MAT-UUID
    return f"MAT-{str(uuid.uuid4()).upper()[:8]}"

@sync_to_async
def get_all_matriculations():
    # We use select_related to avoid N+1 queries when fetching the company name
    matriculations = Matriculation.objects.select_related('company').all()
    
    result = []
    for m in matriculations:
        result.append({
            "company_name": m.company.name,
            "matricule": m.matricule,
            "created_at": m.created_at.isoformat(),
            "expires_at": m.expires_at.isoformat() if m.expires_at else None
        })
    return result

@sync_to_async
def generate_matriculation_for_all_companies():
    """Generates matriculations for companies that don't have one."""
    companies_without_matricule = Company.objects.filter(matriculation__isnull=True)
    generated = []
    now = timezone.now()
    expires = now + timedelta(days=90)
    
    for company in companies_without_matricule:
        matricule = _generate_unique_matricule()
        m = Matriculation.objects.create(
            company=company,
            matricule=matricule,
            expires_at=expires
        )
        generated.append({
            "company_name": company.name,
            "matricule": m.matricule
        })
    return generated

@sync_to_async
def force_refresh_matriculations():
    """Forces the refresh of ALL matriculations."""
    all_matriculations = Matriculation.objects.all()
    refreshed = []
    now = timezone.now()
    expires = now + timedelta(days=90)
    
    for m in all_matriculations:
        m.matricule = _generate_unique_matricule()
        m.created_at = now
        m.expires_at = expires
        m.save()
        refreshed.append({
            "company_name": m.company.name,
            "matricule": m.matricule
        })
    return refreshed

@sync_to_async
def auto_refresh_expired_matriculations():
    """Scheduled task payload: refresh only the expired ones."""
    now = timezone.now()
    expired = Matriculation.objects.filter(expires_at__lte=now)
    expires_new = now + timedelta(days=90)
    
    refreshed_count = 0
    for m in expired:
        m.matricule = _generate_unique_matricule()
        m.created_at = now
        m.expires_at = expires_new
        m.save()
        refreshed_count += 1
        
    return refreshed_count