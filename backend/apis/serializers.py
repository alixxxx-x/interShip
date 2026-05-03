from rest_framework import serializers
from .models import *

# user serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    # Registration fields (not on base User model)
    university_id = serializers.CharField(required=False, write_only=True)
    wilaya = serializers.CharField(required=False, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)
    name = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    logo = serializers.ImageField(required=False, write_only=True)
    description = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    location = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    website = serializers.URLField(required=False, write_only=True, allow_blank=True, allow_null=True)
    company_field = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    founded_year = serializers.IntegerField(required=False, write_only=True, allow_null=True)
    department = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)
    major = serializers.CharField(required=False, write_only=True, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'profile_picture', 'password',
            'first_name', 'last_name', 'is_active', 'university_id', 'wilaya', 'phone', 'major',
            'name', 'logo', 'description', 'location', 'website', 'company_field', 'founded_year', 'department'
        ]
        read_only_fields = ['id']
    # hdi hiya t3 email  
    def validate(self, attrs):
        # For updates, use instance values if not provided in attrs
        if self.instance:
            role = attrs.get('role', getattr(self.instance, 'role', User.Role.STUDENT))
            email = attrs.get('email', getattr(self.instance, 'email', ''))
        else:
            role = attrs.get('role', User.Role.STUDENT)
            email = attrs.get('email', '')

        if role == User.Role.STUDENT:
            if not email.endswith('@univ.dz'):
                raise serializers.ValidationError({
                    "email": "Students must use a university email address ending with @univ.dz"
                })
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add role-specific profile fields to the output
        profile_map = {
            User.Role.STUDENT: ('student', ['university_id', 'wilaya', 'phone', 'major']),
            User.Role.COMPANY: ('company', ['name', 'logo', 'description', 'location', 'website', 'company_field', 'founded_year']),
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
                        data['has_cv'] = hasattr(student, 'digital_cv')
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

    def update(self, instance, validated_data):
        # Update base User fields
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
        if 'profile_picture' in validated_data:
            pic = validated_data.get('profile_picture')
            instance.profile_picture = pic
            # If it's a company, also sync to logo
            if instance.role == User.Role.COMPANY and hasattr(instance, 'company'):
                instance.company.logo = pic
                instance.company.save()
            
        instance.save()

        # Update role-specific fields
        if instance.role == User.Role.STUDENT and hasattr(instance, 'student'):
            student = instance.student
            if 'university_id' in validated_data:
                student.university_id = validated_data.get('university_id')
            if 'wilaya' in validated_data:
                student.wilaya = validated_data.get('wilaya')
            if 'phone' in validated_data:
                student.phone = validated_data.get('phone')
            if 'major' in validated_data:
                student.major = validated_data.get('major')
            student.save()
            
        elif instance.role == User.Role.COMPANY and hasattr(instance, 'company'):
            company = instance.company
            if 'name' in validated_data:
                company.name = validated_data.get('name')
            if 'logo' in validated_data:
                company.logo = validated_data.get('logo')
            if 'description' in validated_data:
                company.description = validated_data.get('description')
            if 'location' in validated_data:
                company.location = validated_data.get('location')
            if 'website' in validated_data:
                company.website = validated_data.get('website')
            if 'company_field' in validated_data:
                company.company_field = validated_data.get('company_field')
            if 'founded_year' in validated_data:
                company.founded_year = validated_data.get('founded_year')
            company.save()
            
        elif instance.role == User.Role.ADMIN and hasattr(instance, 'administrator'):
            admin = instance.administrator
            if 'department' in validated_data:
                admin.department = validated_data.get('department')
            admin.save()

        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

class CompanySerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    open_positions_count = serializers.SerializerMethodField()
    total_internships_count = serializers.SerializerMethodField()
    internships = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'email', 'name', 'logo', 'description', 'location', 'website', 'company_field', 'founded_year', 'is_active', 'open_positions_count', 'total_internships_count', 'internships']
        read_only_fields = ['id']

    def get_logo(self, obj):
        # Fallback to profile_picture if logo is not set
        logo = obj.logo.url if obj.logo else None
        if not logo and obj.profile_picture:
            logo = obj.profile_picture.url
        
        # Ensure we return a full URL if possible
        request = self.context.get('request')
        if logo and request:
            return request.build_absolute_uri(logo)
        return logo

    def get_open_positions_count(self, obj):
        return InternshipOffer.objects.filter(
            company=obj,
            status=InternshipOffer.Status.OPEN_FOR_APPLICATION
        ).count()

    def get_total_internships_count(self, obj):
        return InternshipOffer.objects.filter(company=obj).count()

    def get_internships(self, obj):
        offers = InternshipOffer.objects.filter(company=obj)
        # Use simple mapping to avoid circular import and stay efficient
        return [{
            'id': offer.id,
            'title': offer.title,
            'location': offer.internship_location,
            'status': offer.status,
            'type': offer.internship_type,
            'image': self.context['request'].build_absolute_uri(offer.internship_image.url) if offer.internship_image else None
        } for offer in offers]

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
            'wilaya',
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
        instance.wilaya = validated_data.get('wilaya', instance.wilaya)
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
        if hasattr(student, 'digital_cv') and student.digital_cv and student.digital_cv.cv_file:
            if request:
                return request.build_absolute_uri(student.digital_cv.cv_file.url)
            return student.digital_cv.cv_file.url
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
            has_cv = hasattr(student, 'digital_cv')
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
    github_link = serializers.URLField(source='github', required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(source='phone', required=False, allow_blank=True)
    any_experience = serializers.CharField(source='experience', required=False, allow_blank=True)
    profile_summary = serializers.CharField(required=False, allow_blank=True, write_only=True)
    address = serializers.CharField(required=False, allow_blank=True, write_only=True)
    languages = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = DigitalCV
        fields = [
            'id', 'student', 'first_name', 'last_name', 'image', 'phone_number',
            'email', 'linkedin', 'github_link', 'portfolio_link', 'education', 'skills', 
            'any_experience', 'profile_summary', 'address', 'languages',
            'wilaya', 'university_id', 'date_of_birth', 
            'nationality', 'pdfFile'
        ]
        read_only_fields = ['id', 'student']

    # Fields that exist on frontend but not on the model - strip before saving
    NON_MODEL_FIELDS = ['profile_summary', 'address', 'languages']

    def _strip_non_model_fields(self, data):
        for field in self.NON_MODEL_FIELDS:
            data.pop(field, None)
        return data

    def validate(self, attrs):
        if self.instance is None:
            request = self.context.get('request')
            if request and hasattr(request.user, 'student'):
                if DigitalCV.objects.filter(student=request.user.student).exists():
                    raise serializers.ValidationError("You already have a digital CV")
        return attrs

    def create(self, validated_data):
        self._strip_non_model_fields(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._strip_non_model_fields(validated_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
