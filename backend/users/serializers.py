from rest_framework import serializers
from django.contrib.auth import get_user_model
from .services import UserCreationService

User = get_user_model()


class BaseUserSerializer(serializers.ModelSerializer):
    """Base serializer for common User fields (DRY principle)."""
    
    class Meta:
        model = User
        fields = ["id", "email", "username", "role"]


class UserSerializer(BaseUserSerializer):
    """Serializer for user representation."""
    pass


class RegisterSerializer(BaseUserSerializer):
    """Serializer for user registration (SRP - only handles validation and data transformation)."""
    
    password = serializers.CharField(write_only=True)

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + ["password"]

    def create(self, validated_data):
        """
        Delegates user creation to UserCreationService (DIP - depends on service abstraction).
        """
        return UserCreationService.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data.get("role", "viewer"),
        )


class LoginSerializer(serializers.Serializer):
    """Serializer for user login credentials (SRP - only validates login data)."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
