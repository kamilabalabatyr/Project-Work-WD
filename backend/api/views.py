from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.models import Token

from .models import Property, Booking
from .serializers import RegisterSerializer, LoginSerializer, PropertyModelSerializer, BookingModelSerializer
from .permissions import IsOwnerOrReadOnly
from .throttles import AuthRateThrottle


#  
# FBV #1 — Register
#  
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
    }, status=status.HTTP_201_CREATED)


#  
# FBV #2 — Login
#  
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
    })


#  
# FBV — Logout
#  
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


#  
# CBV #1 — Property List / Create
#  
class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = Property.objects.select_related('owner').all()
    serializer_class = PropertyModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


#
# CBV #2 — Property Detail / Update / Delete
#
class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertyModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


#
# CBV #3 — Booking List / Create
#
class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.select_related('property', 'guest').filter(
            guest=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(guest=self.request.user)


#
# CBV #4 — Booking Detail / Delete
#
class BookingDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = BookingModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.select_related('property', 'guest').filter(
            guest=self.request.user
        )
