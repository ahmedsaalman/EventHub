from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from .services import AuthenticationService, TokenService

class RegisterView(generics.CreateAPIView):
    """View for user registration (SRP - only handles HTTP request/response)."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(generics.GenericAPIView):
    """View for user login (SRP - delegates authentication and token generation to services)."""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")

        # Delegate authentication to service (DIP)
        user = AuthenticationService.authenticate_user(email, password, request)

        if user is not None:
            # Delegate token generation to service (DIP)
            tokens = TokenService.generate_tokens_for_user(user)
            
            return Response({
                **tokens,
                "user": UserSerializer(user).data
            })
        
        return Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
