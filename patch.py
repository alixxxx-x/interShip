import re

with open('backend/apis/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 1: AdminStatsView changes
old1 = """        total_students = student_qs.count()

        applications_scoped = _scope_applications_for_admin(Application.objects.all(), request.user)"""
new1 = """        total_students = student_qs.count()
        active_companies_count = Company.objects.filter(is_active=True).count()
        total_users = total_students + active_companies_count

        applications_scoped = _scope_applications_for_admin(Application.objects.all(), request.user)"""
content = content.replace(old1, new1)

old2 = """        return Response({
            "total_students": total_students,"""
new2 = """        return Response({
            "total_users": total_users,
            "total_students": total_students,"""
content = content.replace(old2, new2)

# Replace 2: AdminAcceptCompanyView changes
old3 = """        if company.is_active:
            return Response({"error": "This company is already active."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a matricule for the company
        matricule = _generate_unique_matricule()
        expires = timezone.now() + timedelta(days=90)
        
        # Save it to the matriculation table
        Matriculation.objects.create(
            company_name=company.name,
            matricule=matricule,
            expires_at=expires
        )
        
        # Activate the company
        company.is_active = True
        company.save()
        
        return Response({
            "message": f"Company '{company.name}' has been accepted and activated.",
            "matricule": matricule
        }, status=status.HTTP_200_OK)"""
        
new3 = """        if company.is_active:
            return Response({"error": "This company is already active."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Activate the company
        company.is_active = True
        company.save()
        
        return Response({
            "message": f"Company '{company.name}' has been accepted and activated."
        }, status=status.HTTP_200_OK)"""
content = content.replace(old3, new3)

# Replace 3: Add AdminGenerateMatriculeView
old4 = """class AdminRejectCompanyView(APIView):
    \"\"\"
    Rejects a pending company. Deletes it from the database entirely.
    \"\"\""""

new4 = """class AdminRejectCompanyView(APIView):
    \"\"\"
    Rejects a pending company. Deletes it from the database entirely.
    \"\"\""""

content = content.replace("        }, status=status.HTTP_200_OK)\n\nclass AdminGenerateMatriculeView", "        }, status=status.HTTP_200_OK)") # in case it's already there

add_view = """        }, status=status.HTTP_200_OK)

class AdminGenerateMatriculeView(APIView):
    \"\"\"
    Generates a new matricule for a company and adds it to the whitelist.
    \"\"\"
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Allow only SUPER ADMIN or appropriate role. For now using IsAuthenticated as requested.
        company_name = request.data.get('company_name')
        if not company_name:
            return Response({"error": "Company name is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already exists in whitelist
        if Matriculation.objects.filter(company_name__iexact=company_name).exists():
            return Response({"error": f"A matricule for '{company_name}' already exists in the whitelist."}, status=status.HTTP_400_BAD_REQUEST)

        matricule = _generate_unique_matricule()
        
        from datetime import timedelta
        from django.utils import timezone
        
        # Valid for 90 days as an example
        expires = timezone.now() + timedelta(days=90)
        
        Matriculation.objects.create(
            company_name=company_name,
            matricule=matricule,
            expires_at=expires
        )
        
        return Response({
            "message": "Matricule generated successfully.",
            "company_name": company_name,
            "matricule": matricule
        }, status=status.HTTP_201_CREATED)"""

content = content.replace("        }, status=status.HTTP_200_OK)\n\nclass ReviewListCreateView", add_view + "\n\nclass ReviewListCreateView")

with open('backend/apis/views.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied.")
