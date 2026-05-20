from celery import shared_task
from .services import update_finished_internships

@shared_task
def update_internship_statuses_task():
    """
    Celery task that invokes the business logic to update internship statuses.
    Scheduled to run periodically by Celery Beat.
    """
    update_finished_internships()
    return "Internship statuses updated successfully"
