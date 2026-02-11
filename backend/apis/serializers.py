from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        fields = ['id', 'created_at', 'username', 'email', 'biography', 'profile_picture', 'role']
        read_only_fields = ['id', 'created_at']
        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user