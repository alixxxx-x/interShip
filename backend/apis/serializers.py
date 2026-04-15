from rest_framework import serializers
from .models import *

# user serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile_picture', 'password']
        read_only_fields = ['id', 'role']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Compact role-specific field mapping
        role_fields = {
            User.Role.STUDENT: ['university_id', 'wilaya', 'phone'],
            User.Role.COMPANY: ['name', 'logo', 'description', 'location', 'website'],
            User.Role.ADMIN: ['department'],
        }
        
        related_name = instance.role.lower() if instance.role != User.Role.ADMIN else 'administrator'
        profile = getattr(instance, related_name, None)
        
        if profile and instance.role in role_fields:
            for field in role_fields[instance.role]:
                data[field] = getattr(profile, field, None)
                
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data) #drna b create_user() ou mach .create() to hash the password 

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

        def update(self,instance,validated_data):
            instance.title = validated_data.get('title', instance.data)
            instance.description = validated_data.get('description', instance.data)
            instance.internship_location = validated_data.get('internship_location', instance.data)
            instance.status = validated_data.get('status', instance.data)
            instance.internship_type = validated_data.get('internship_type', instance.data)
            instance.internship_structure = validated_data.get('internship_structure', instance.data)
            instance.offer_start_date = validated_data.get('offer_start_date', instance.data)
            instance.offer_end_date = validated_data.get('offer_end_date', instance.data)
            instance.number_of_places = validated_data.get('number_of_places', instance.data)
            instance.internship_duration = validated_data.get('internship_duration', instance.data)
            instance.save()
            return instance

        def validate(self, attrs):
            if attrs['offer_start_date'] > attrs['offer_end_date']:
                raise serializers.ValidationError("offer start date must be before the offer end date ")
            if attrs['number_of_places'] <= 0:
                raise serializers.ValidationError("there has to be at least one intern")
            if attrs['internship_duration'] <= timedelta(days=1):
                raise serializers.ValidationError("the internship duration has to be at least one day")

# application serializers

class ApplicationSerializer(serializers.ModelsSerializer):
    class Meta:
        model = Application
        fields = ['id', 'student', 'internship', 'status', 'application_date']
        read_only_fields = ['id', 'student',  'internship', 'application_date']

        def create(self, validated_data):
            return Application.objects.create(**validated_data)

        def update(self,instance,validated_data):
            instance.status = validated_data.get('status', instance.data)
            instance.save()
            return instance

        def validate(self,attrs):
            if attrs['status'] not in [Application.Status.PENDING, Application.Status.ACCEPTED, Application.Status.REJECTED]:
                raise serializers.ValidationError("invalid status")
            if Application.objects.filter(student=self.context['request'].user, internship=attrs['internship']).exists(): #filer filters RECORDS based 3la a condition lhna the condition is exists(), hna tchouf ida kayn record fih the current user t7tou fi student ida ymatchi the internship li 7ab ydirlha application
                raise serializers.ValidationError("you have already applied for this internship")
