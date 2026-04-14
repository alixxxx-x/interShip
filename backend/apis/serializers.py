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

class UserProfileSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields = ['id', 'username', 'role']

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
        model = Internship
        fields = ['id', 'title', 'description', 'company', 'start_date', 'end_date', 'number_of_places', 'location', 'status', 'duration']
        read_only_fields = ['id', 'duration']

        def create(self, validated_data):
            return Internship.objects.create(**validated_data)

        def update(self, instance, validated_data):
            instance.title = validated_data.get('title', instance.title)
            instance.description = validated_data.get('description', instance.description)
            instance.company = validated_data.get('company', instance.company)
            instance.start_date = validated_data.get('start_date', instance.start_date)
            instance.end_date = validated_data.get('end_date', instance.end_date)
            instance.number_of_places = validated_data.get('number_of_places', instance.number_of_places)
            instance.location = validated_data.get('location', instance.location)
            instance.status = validated_data.get('status', instance.status)
            instance.save()
            return instance