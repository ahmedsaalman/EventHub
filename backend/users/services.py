from django.contrib.auth import get_user_model

User = get_user_model()


class UserCreationService:
    """Service responsible for user creation logic (SRP)."""
    
    @staticmethod
    def create_user(email: str, username: str, password: str, role: str = "viewer"):
        """
        Creates a new user with the provided credentials.
        
        Args:
            email: User's email address
            username: User's username
            password: User's password
            role: User's role (default: "viewer")
            
        Returns:
            User: The created user instance
        """
        return User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=role,
        )


class AuthenticationService:
    """Service responsible for user authentication logic (SRP)."""
    
    @staticmethod
    def authenticate_user(email: str, password: str, request=None):
        """
        Authenticates a user with email and password.
        
        Args:
            email: User's email address
            password: User's password
            request: HTTP request object (optional)
            
        Returns:
            User: Authenticated user instance or None
        """
        from django.contrib.auth import authenticate
        return authenticate(request, email=email, password=password)


class TokenService:
    """Service responsible for JWT token generation (SRP)."""
    
    @staticmethod
    def generate_tokens_for_user(user):
        """
        Generates access and refresh tokens for a user.
        
        Args:
            user: User instance
            
        Returns:
            dict: Dictionary containing 'access' and 'refresh' tokens
        """
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
