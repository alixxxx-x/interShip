import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from apis.models import InternshipOffer, Company
from datetime import timedelta, date

c = Company.objects.first()

i1 = InternshipOffer.objects.create(
    title='Frontend Developer Intern',
    description='Join our team to build modern web applications using React and TypeScript.',
    company=c,
    internship_location='REMOTE',
    status='OPEN_FOR_APPLICATION',
    internship_type='FULL_TIME',
    internship_structure='FOR_CREDIT',
    offer_start_date=date(2026, 6, 1),
    offer_end_date=date(2026, 8, 31),
    number_of_places=5,
    internship_duration=timedelta(days=90),
    internship_skills='["React", "TypeScript", "HTML/CSS", "Figma"]',
    wilaya='Algiers'
)

i2 = InternshipOffer.objects.create(
    title='Data Science & AI Research',
    description='Work on cutting-edge machine learning models and data pipelines.',
    company=c,
    internship_location='HYBRID',
    status='OPEN_FOR_APPLICATION',
    internship_type='PART_TIME',
    internship_structure='CO_OP',
    offer_start_date=date(2026, 7, 1),
    offer_end_date=date(2026, 9, 30),
    number_of_places=3,
    internship_duration=timedelta(days=60),
    internship_skills='["Python", "Machine Learning", "SQL", "Data Science"]',
    wilaya='Oran'
)

print(f'Created: {i1.id} - {i1.title}')
print(f'Created: {i2.id} - {i2.title}')
