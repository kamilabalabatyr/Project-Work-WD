from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status, generics

from rest_framework.authtoken.models import Token

from .models import Property, Booking, UserProfile
from .serializers import (
    RegisterSerializer, LoginSerializer,
    PropertyModelSerializer, PropertyApprovalSerializer,
    BookingModelSerializer,
)
from .permissions import IsOwnerOrReadOnly, IsLandlord, IsAdmin
from .throttles import AuthRateThrottle


# ──────────────────────────────────────────
# FBV #1 — Register (with role selection)
# ──────────────────────────────────────────
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
        'role': user.profile.role,
    }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────
# FBV #2 — Login (returns role)
# ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)

    # Ensure profile exists (for users created before migration)
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'guest'})

    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
        'role': profile.role,
    })


# ──────────────────────────────────────────
# FBV — Logout
# ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────
# CBV #1 — Property List / Create
#   - GET: public sees only approved
#   - POST: only landlords can create (status=pending)
# ──────────────────────────────────────────
class PropertyListCreateView(generics.ListCreateAPIView):
    serializer_class = PropertyModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Property.objects.select_related('owner').all()

        # Admins see everything
        if user.is_authenticated:
            profile = getattr(user, 'profile', None)
            if profile and profile.role == 'admin' or user.is_superuser:
                return qs

        # Landlords see their own (any status) + all approved
        if user.is_authenticated:
            profile = getattr(user, 'profile', None)
            if profile and profile.role == 'landlord':
                from django.db.models import Q
                return qs.filter(Q(status='approved') | Q(owner=user))

        # Everyone else: only approved
        return qs.filter(status='approved')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsLandlord()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# ──────────────────────────────────────────
# CBV #2 — Property Detail / Update / Delete
# ──────────────────────────────────────────
class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertyModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = Property.objects.select_related('owner').all()

        if user.is_authenticated:
            profile = getattr(user, 'profile', None)
            if profile and profile.role == 'admin' or user.is_superuser:
                return qs
            if profile and profile.role == 'landlord':
                from django.db.models import Q
                return qs.filter(Q(status='approved') | Q(owner=user))

        return qs.filter(status='approved')


# ──────────────────────────────────────────
# FBV — Admin: list pending properties
# ──────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def pending_properties_view(request):
    pending = Property.objects.filter(status='pending').select_related('owner').order_by('-created_at')
    serializer = PropertyModelSerializer(pending, many=True)
    return Response(serializer.data)


# ──────────────────────────────────────────
# FBV — Admin: approve / reject a property
# ──────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def property_approval_view(request, pk):
    try:
        prop = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'detail': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PropertyApprovalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    action = serializer.validated_data['action']
    if action == 'approve':
        prop.status = 'approved'
        prop.rejection_reason = ''
    else:
        prop.status = 'rejected'
        prop.rejection_reason = serializer.validated_data.get('rejection_reason', '')
    prop.save()

    return Response(PropertyModelSerializer(prop).data)


# ──────────────────────────────────────────
# CBV #3 — Booking List / Create
# ──────────────────────────────────────────
class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.select_related('property', 'guest').filter(
            guest=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(guest=self.request.user)


# ──────────────────────────────────────────
# CBV #4 — Booking Detail / Delete
# ──────────────────────────────────────────
class BookingDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = BookingModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.select_related('property', 'guest').filter(
            guest=self.request.user
        )
