from rest_framework import serializers
from .models import *

# user serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    # Registration fields (not on base User model)
    university_id = serializers.CharField(required=False, write_only=True)
    wilaya = serializers.CharField(required=False, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)
    name = serializers.CharField(required=False, write_only=True)
    logo = serializers.ImageField(required=False, write_only=True)
    description = serializers.CharField(required=False, write_only=True)
    location = serializers.CharField(required=False, write_only=True)
    website = serializers.URLField(required=False, write_only=True)
    company_field = serializers.CharField(required=False, write_only=True)
    department = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'profile_picture', 'password',
            'first_name', 'last_name', 'is_active', 'university_id', 'wilaya', 'phone',
            'name', 'logo', 'description', 'location', 'website', 'company_field', 'department'
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add role-specific profile fields to the output
        profile_map = {
            User.Role.STUDENT: ('student', ['university_id', 'wilaya', 'phone']),
            User.Role.COMPANY: ('company', ['name', 'logo', 'description', 'location', 'website', 'company_field']),
            User.Role.ADMIN: ('administrator', ['department']),
        }
        
        config = profile_map.get(instance.role)
        if config:
            related_name, fields = config
            profile = getattr(instance, related_name, None)
            if profile:
                for field in fields:
                    val = getattr(profile, field, None)
                    
                    # Safely handle ImageField/FileField serialization
                    # In Django, boolean check on a FieldFile returns False if no file is present
                    from django.db.models.fields.files import FieldFile
                    if isinstance(val, FieldFile):
                        data[field] = val.url if val else None
                    else:
                        data[field] = val
                    
                # Add has_cv check for students
                if instance.role == User.Role.STUDENT:
                    # Multi-table inheritance: instance is a User, but getattr(instance, 'student') returns the Student profile
                    student = getattr(instance, 'student', None)
                    if student:
                        data['has_cv'] = hasattr(student, 'digital_cv') and bool(student.digital_cv.cv_file)
                    else:
                        data['has_cv'] = False
                    
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', User.Role.STUDENT)
        password = validated_data.pop('password')
        
        # Use provided username if available, otherwise fallback to email
        username = validated_data.pop('username', None) or validated_data.get('email')
        
        # Create user instance using the correct model
        models_map = {
            User.Role.STUDENT: Student,
            User.Role.COMPANY: Company,
            User.Role.ADMIN: Administrator,
        }
        
        model_class = models_map.get(role, User)
        user = model_class.objects.create_user(
            username=username,
            password=password,
            role=role,
            **validated_data
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'email', 'name', 'logo', 'description', 'location', 'website', 'company_field', 'is_active']
        read_only_fields = ['id']

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'recipient', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

# internship serializers

class InternshipSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    required_skills = serializers.CharField(write_only=True, required=False)
    banner_image = serializers.ImageField(write_only=True, required=False)
    accepted_count = serializers.SerializerMethodField()

    class Meta:
        model = InternshipOffer
        fields = [
            'id',
            'title',
            'description',
            'company',
            'company_name',
            'internship_location',
            'status',
            'internship_type',
            'internship_structure',
            'offer_start_date',
            'offer_end_date',
            'number_of_places',
            'accepted_count',
            'internship_duration',
            'internship_salary',
            'internship_skills',
            'internship_image',
            'required_skills',
            'banner_image',
        ]
        read_only_fields = ['id', 'internship_duration', 'company']

    def get_accepted_count(self, obj):
        return obj.application_set.filter(status='ACCEPTED', is_validated_by_admin=True).count()

    def create(self, validated_data):
        # Map frontend fields to backend fields
        if 'required_skills' in validated_data:
            validated_data['internship_skills'] = validated_data.pop('required_skills')
        if 'banner_image' in validated_data:
            validated_data['internship_image'] = validated_data.pop('banner_image')
        return InternshipOffer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Map frontend fields to backend fields
        if 'required_skills' in validated_data:
            instance.internship_skills = validated_data.pop('required_skills')
        if 'banner_image' in validated_data:
            instance.internship_image = validated_data.pop('banner_image')
            
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.internship_location = validated_data.get('internship_location', instance.internship_location)
        instance.status = validated_data.get('status', instance.status)
        instance.internship_type = validated_data.get('internship_type', instance.internship_type)
        instance.internship_structure = validated_data.get('internship_structure', instance.internship_structure)
        instance.offer_start_date = validated_data.get('offer_start_date', instance.offer_start_date)
        instance.offer_end_date = validated_data.get('offer_end_date', instance.offer_end_date)
        instance.number_of_places = validated_data.get('number_of_places', instance.number_of_places)
        
        # Recalculate duration if dates changed
        if 'offer_start_date' in validated_data or 'offer_end_date' in validated_data:
            instance.internship_duration = instance.offer_end_date - instance.offer_start_date
            
        instance.internship_salary = validated_data.get('internship_salary', instance.internship_salary)
        instance.save()
        return instance

    def validate(self, attrs):
        if 'offer_start_date' in attrs and 'offer_end_date' in attrs:
            if attrs['offer_start_date'] > attrs['offer_end_date']:
                raise serializers.ValidationError("offer start date must be before the offer end date ")
            
            # Auto-calculate duration (even if it's read-only, we can set it here for create/update)
            attrs['internship_duration'] = attrs['offer_end_date'] - attrs['offer_start_date']
        
        if 'number_of_places' in attrs and attrs['number_of_places'] <= 0:
            raise serializers.ValidationError("there has to be at least one intern")
            
        return attrs

# application serializers

class ApplicationSerializer(serializers.ModelSerializer):
    candidate = serializers.SerializerMethodField()
    offer = serializers.CharField(source='internship.title', read_only=True)
    company_name = serializers.CharField(source='internship.company.name', read_only=True)
    email = serializers.EmailField(source='student.email', read_only=True)
    cv = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'internship', 'status', 'application_date', 
            'candidate', 'offer', 'company_name', 'email', 'cv', 
            'is_validated_by_admin', 'admin_validation_date'
        ]
        read_only_fields = [
            'id', 'student', 'internship', 'application_date', 
            'candidate', 'offer', 'company_name', 'email', 'cv',
            'is_validated_by_admin', 'admin_validation_date'
        ]

    def get_candidate(self, obj):
        student = obj.student
        candidate_name = f"{student.first_name} {student.last_name}".strip()
        if not candidate_name:
            candidate_name = student.username or student.email
        return candidate_name

    def get_cv(self, obj):
        request = self.context.get('request')
        student = obj.student
        if hasattr(student, 'digital_cv') and student.digital_cv and student.digital_cv.cv_pdf:
            if request:
                return request.build_absolute_uri(student.digital_cv.cv_pdf.url)
            return student.digital_cv.cv_pdf.url
        return None

    def create(self, validated_data):
        validated_data['status'] = Application.Status.PENDING
        return Application.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance

    def validate(self, attrs):
        request = self.context.get('request')
        internship = self.context.get('internship')
        
        if request and internship:
            # 1. Ensure user is a student
            student = getattr(request.user, 'student', None)
            if not student:
                 raise serializers.ValidationError("Only students can apply for internships.")

            # 2. Check if already applied
            if Application.objects.filter(student=student, internship=internship).exists():
                raise serializers.ValidationError("You have already applied for this internship")
            
            # 3. Check if internship is open
            from .models import InternshipOffer
            if internship.status != InternshipOffer.Status.OPEN_FOR_APPLICATION:
                raise serializers.ValidationError("This internship is no longer accepting applications.")
            
            # 4. Check if full (Double safety, only counting ACCEPTED)
            accepted_apps = Application.objects.filter(
                internship=internship,
                status='ACCEPTED'
            ).count()
            
            if accepted_apps >= internship.number_of_places:
                raise serializers.ValidationError("This internship has reached its maximum number of accepted interns.")
            
            # 5. Check if student has a CV
            has_cv = hasattr(student, 'digital_cv') and bool(student.digital_cv.cv_file)
            if not has_cv:
                raise serializers.ValidationError("You must upload a CV (PDF) to your profile before applying.")
        
        return attrs

# skills serializers

class SkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skills
        fields = ['id', 'name', 'skill_level', 'internship']

    def create(self, validated_data):
        return Skills.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.skill_level = validated_data.get('skill_level', instance.skill_level)
        instance.internship = validated_data.get('internship', instance.internship)
        instance.save()
        return instance

    def validate(self, attrs):
        request = self.context.get('request')
        internship = self.context.get('internship')
        
        if request and internship and hasattr(request.user, 'student'):
            if Skills.objects.filter(student=request.user.student, internship=internship, name=attrs.get('name')).exists():
                raise serializers.ValidationError("You have already added this skill to this internship")
        
        return attrs

# digital cv serializers

class DigitalCVSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    pdfFile = serializers.FileField(source='cv_file', required=False)

    class Meta:
        model = DigitalCV
        fields = [
            'id', 'student', 'first_name', 'last_name', 'image', 'phone',
            'email', 'linkedin', 'github', 'education', 'skills', 
            'experience', 'wilaya', 'university_id', 'date_of_birth', 
            'nationality', 'pdfFile'
        ]
        read_only_fields = ['id', 'student']

    def validate(self, attrs):
        if self.instance is None:
            request = self.context.get('request')
            if request and hasattr(request.user, 'student'):
                if DigitalCV.objects.filter(student=request.user.student).exists():
                    raise serializers.ValidationError("You already have a digital CV")
        return attrs

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    
