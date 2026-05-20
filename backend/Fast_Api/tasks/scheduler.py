import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from Fast_Api.services.matricule_service import auto_refresh_expired_matriculations

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def scheduled_matriculation_refresh():
    try:
        logger.info("Running scheduled Job: Refreshing expired matriculations...")
        count = await auto_refresh_expired_matriculations()
        logger.info(f"Scheduled Job complete: Refreshed {count} matriculations.")
    except Exception as e:
        logger.error(f"Error in scheduled_matriculation_refresh: {e}")

def start_scheduler():
    # Schedule the job to run. 
    # For testing, you might use 'seconds=60', but the requirement states 3 months.
    # We will set it to run daily to check for expirations (since expired_at is stored).
    scheduler.add_job(
        scheduled_matriculation_refresh,
        trigger=IntervalTrigger(days=1), # Checks every day if any have expired
        id='refresh_matriculations',
        name='Refresh expired matriculations every 3 months',
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler started successfully.")