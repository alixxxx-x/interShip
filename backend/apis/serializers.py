from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        fields = ['id', 'date_joined', 'username', 'email', 'biography', 'profile_picture', 'role']
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'biography', 'profile_picture']
        read_only_fields = ['id', 'role']