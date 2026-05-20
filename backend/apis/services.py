from django.utils import timezone
from .models import InternshipOffer

def update_finished_internships():
    """
    Business logic to automatically update internship statuses based on their start and end dates.
    This function is timezone-safe and runs efficiently at the database level.
    """
    today = timezone.now().date()
    
    # Update to ONGOING
    InternshipOffer.objects.filter(
        status__in=[InternshipOffer.Status.OPEN_FOR_APPLICATION, InternshipOffer.Status.CLOSED_FOR_APPLICATION],
        offer_start_date__lte=today,
        offer_end_date__gte=today
    ).update(status=InternshipOffer.Status.ONGOING)
    
    # Update to FINISHED
    InternshipOffer.objects.filter(
        status__in=[
            InternshipOffer.Status.OPEN_FOR_APPLICATION, 
            InternshipOffer.Status.CLOSED_FOR_APPLICATION, 
            InternshipOffer.Status.ONGOING
        ],
        offer_end_date__lt=today
    ).update(status=InternshipOffer.Status.FINISHED)
    
    return True
