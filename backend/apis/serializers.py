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
    department = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'profile_picture', 'password',
            'first_name', 'last_name', 'university_id', 'wilaya', 'phone',
            'name', 'logo', 'description', 'location', 'website', 'department'
        ]
        read_only_fields = ['id', 'username']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add role-specific profile fields to the output
        profile_map = {
            User.Role.STUDENT: ('student', ['university_id', 'wilaya', 'phone']),
            User.Role.COMPANY: ('company', ['name', 'logo', 'description', 'location', 'website']),
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
                    
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', User.Role.STUDENT)
        password = validated_data.pop('password')
        
        # Auto-generate username based on role
        if role == User.Role.STUDENT:
            username = f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()
        elif role == User.Role.COMPANY:
            username = validated_data.get('name', validated_data.get('email'))
        else:
            username = validated_data.get('email')
        
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

# internship serializers

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipOffer
        fields = [
            'id',
            'title',
            'description',
            'company',
            'interbship_location',
            'status',
            'internship_type',
            'internship_structure',
            'offer_start_date',
            'offer_end_date',
            'number_of_places',
            'internship_duration',
        ]
        read_only_fields = ['id', 'internship_duration', 'company']

    def create(self, validated_data):
        return InternshipOffer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.internship_location = validated_data.get('internship_location', instance.internship_location)
        instance.status = validated_data.get('status', instance.status)
        instance.internship_type = validated_data.get('internship_type', instance.internship_type)
        instance.internship_structure = validated_data.get('internship_structure', instance.internship_structure)
        instance.offer_start_date = validated_data.get('offer_start_date', instance.offer_start_date)
        instance.offer_end_date = validated_data.get('offer_end_date', instance.offer_end_date)
        instance.number_of_places = validated_data.get('number_of_places', instance.number_of_places)
        instance.internship_duration = validated_data.get('internship_duration', instance.internship_duration)
        instance.save()
        return instance

    def validate(self, attrs):
        if attrs['offer_start_date'] > attrs['offer_end_date']:
            raise serializers.ValidationError("offer start date must be before the offer end date ")
        if attrs['number_of_places'] <= 0:
            raise serializers.ValidationError("there has to be at least one intern")
        if attrs['internship_duration'] <= timedelta(days=1):
            raise serializers.ValidationError("the internship duration has to be at least one day")
        return attrs

# application serializers

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'student', 'internship', 'status', 'application_date']
        read_only_fields = ['id', 'student', 'internship', 'status', 'application_date']

    def create(self, validated_data):
        return Application.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance

    def validate(self, attrs):
        request = self.context.get('request')
        internship = self.context.get('internship')
        
        if request and internship:
            if Application.objects.filter(student=request.user, internship=internship).exists():
                raise serializers.ValidationError("You have already applied for this internship")
        
        return attrs
