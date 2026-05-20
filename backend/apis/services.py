from django.utils import timezone
from .models import InternshipOffer
import re
import math

WILAYA_COORDS = {
    "adrar": (27.87, -0.29), "chlef": (36.16, 1.33), "laghouat": (33.80, 2.87),
    "oum el bouaghi": (35.87, 7.11), "batna": (35.55, 6.17), "béjaïa": (36.75, 5.08),
    "bejaia": (36.75, 5.08), "biskra": (34.85, 5.73), "béchar": (31.62, -2.22),
    "bechar": (31.62, -2.22), "blida": (36.47, 2.83), "bouira": (36.38, 3.90),
    "tamanrasset": (22.78, 5.52), "tébessa": (35.40, 8.12), "tebessa": (35.40, 8.12),
    "tlemcen": (34.88, -1.32), "tiaret": (35.37, 1.32), "tizi ouzou": (36.72, 4.05),
    "alger": (36.75, 3.06), "algiers": (36.75, 3.06), "djelfa": (34.67, 3.25),
    "jijel": (36.82, 5.77), "sétif": (36.19, 5.41), "setif": (36.19, 5.41),
    "saïda": (34.83, 0.15), "saida": (34.83, 0.15), "skikda": (36.88, 6.90),
    "sidi bel abbès": (35.20, -0.63), "sidi bel abbes": (35.20, -0.63),
    "annaba": (36.90, 7.76), "guelma": (36.46, 7.43), "constantine": (36.36, 6.61),
    "médéa": (36.26, 2.75), "medea": (36.26, 2.75), "mostaganem": (35.93, 0.09),
    "m'sila": (35.70, 4.54), "msila": (35.70, 4.54), "mascara": (35.40, 0.14),
    "ouargla": (31.95, 5.33), "oran": (35.70, -0.63), "el bayadh": (33.68, 1.02),
    "illizi": (26.48, 8.48), "bordj bou arréridj": (36.07, 4.76), "bordj bou arreridj": (36.07, 4.76),
    "boumerdès": (36.76, 3.47), "boumerdes": (36.76, 3.47), "el tarf": (36.76, 8.31),
    "tindouf": (27.67, -8.13), "tissemsilt": (35.60, 1.81), "el oued": (33.37, 6.87),
    "khenchela": (35.42, 7.14), "souk ahras": (36.29, 7.95), "tipaza": (36.59, 2.44),
    "mila": (36.45, 6.26), "aïn defla": (36.26, 1.97), "ain defla": (36.26, 1.97),
    "naâma": (33.27, -0.31), "naama": (33.27, -0.31), "aïn témouchent": (35.30, -1.14),
    "ain temouchent": (35.30, -1.14), "ghardaïa": (32.48, 3.67), "ghardaia": (32.48, 3.67),
    "relizane": (35.74, 0.55), "el m'ghair": (33.95, 6.07), "el mghair": (33.95, 6.07),
    "el meniaa": (30.58, 2.88), "ouled djellal": (34.42, 5.07), "bordj baji mokhtar": (21.33, 0.95),
    "béni abbès": (30.08, -2.17), "beni abbes": (30.08, -2.17), "timimoun": (29.26, 0.23),
    "touggourt": (33.10, 6.07), "djanet": (24.55, 9.48), "in salah": (27.19, 2.49),
    "in guezzam": (19.57, 5.77)
}

def clean_wilaya_name(name):
    if not name:
        return ""
    # Remove digits (like "16 - Alger" -> "Alger") and lower
    name = re.sub(r'^\d+\s*-\s*', '', str(name))
    name = re.sub(r'^\d+\s*', '', name)
    return name.strip().lower()

def haversine_distance(coord1, coord2):
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
        
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    R = 6371.0  # Earth's radius in kilometers
    return R * c

def calculate_skills_match(student_skills_str, internship_skills_str):
    if not internship_skills_str:
        return 40.0
    if not student_skills_str:
        return 0.0
    
    # Split skills by comma, semicolon, or newline and clean them
    student_skills = set(s.strip().lower() for s in re.split(r'[,;\n]', student_skills_str) if s.strip())
    internship_skills = [s.strip().lower() for s in re.split(r'[,;\n]', internship_skills_str) if s.strip()]
    
    if not internship_skills:
        return 40.0
        
    matched = 0
    for req_skill in internship_skills:
        if req_skill in student_skills:
            matched += 1
        else:
            # Check for substring matches, e.g. "python" in "python programming" or "react" in "react.js"
            for stud_skill in student_skills:
                if stud_skill in req_skill or req_skill in stud_skill:
                    matched += 1
                    break
                    
    return (matched / len(internship_skills)) * 40.0

def calculate_location_score(student_wilaya, internship_wilaya, internship_location=None):
    if internship_location == 'REMOTE':
        return 30.0
        
    w1 = clean_wilaya_name(student_wilaya)
    w2 = clean_wilaya_name(internship_wilaya)
    
    if not w1 or not w2:
        return 15.0  # Default average score if location is unknown
        
    if w1 == w2:
        return 30.0
        
    coord1 = WILAYA_COORDS.get(w1)
    coord2 = WILAYA_COORDS.get(w2)
    
    if coord1 and coord2:
        distance = haversine_distance(coord1, coord2)
        if distance <= 50.0:
            return 25.0
        elif distance <= 150.0:
            return 20.0
        elif distance <= 300.0:
            return 15.0
        elif distance <= 600.0:
            return 10.0
        else:
            return 5.0
            
    return 15.0  # Fallback average score

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
