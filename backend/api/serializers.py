from datetime import date

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Property, Booking, UserProfile, Payment


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['guest', 'landlord'], default='guest')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'guest')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, role=role)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        data['user'] = user
        return data


class PropertyModelSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'city', 'price_per_night',
                  'max_guests', 'owner', 'status', 'rejection_reason', 'images', 'created_at']
        read_only_fields = ['owner', 'status', 'rejection_reason', 'created_at']


class PropertyApprovalSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, default='')

    def validate(self, data):
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError(
                {'rejection_reason': 'Rejection reason is required when rejecting.'}
            )
        return data


class BookingModelSerializer(serializers.ModelSerializer):
    guest = serializers.ReadOnlyField(source='guest.username')
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    booking_status = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'property', 'guest', 'check_in', 'check_out', 'guests_count',
                  'total_price', 'status', 'booking_status', 'created_at']
        read_only_fields = ['guest', 'total_price', 'status', 'booking_status', 'created_at']

    def get_booking_status(self, obj) -> str:
        if obj.status == 'cancelled':
            return 'cancelled'
        today = date.today()
        if obj.check_in > today:
            return 'upcoming'
        if obj.check_out <= today:
            return 'completed'
        return 'current'

    def validate(self, data):
        check_in = data['check_in']
        check_out = data['check_out']
        prop = data['property']

        if check_out <= check_in:
            raise serializers.ValidationError({'check_out': 'Check-out must be after check-in.'})

        if check_in < date.today():
            raise serializers.ValidationError({'check_in': 'Check-in date cannot be in the past.'})

        if data['guests_count'] < 1:
            raise serializers.ValidationError({'guests_count': 'At least 1 guest is required.'})

        if data['guests_count'] > prop.max_guests:
            raise serializers.ValidationError({
                'guests_count': f'Maximum {prop.max_guests} guests allowed for this property.'
            })

        # Only allow booking approved properties
        if prop.status != 'approved':
            raise serializers.ValidationError('This property is not available for booking.')

        # Date collision check — exclude cancelled bookings
        overlapping = Booking.objects.filter(
            property=prop,
            check_in__lt=check_out,
            check_out__gt=check_in,
            status='active',
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError(
                'This property is already booked for the selected dates.'
            )

        return data

    def create(self, validated_data):
        nights = (validated_data['check_out'] - validated_data['check_in']).days
        validated_data['total_price'] = validated_data['property'].price_per_night * nights
        return super().create(validated_data)


class PaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    card_number = serializers.CharField(write_only=True, max_length=19)
    expiry = serializers.CharField(write_only=True, max_length=5)
    cvv = serializers.CharField(write_only=True, max_length=4)
    cardholder = serializers.CharField(write_only=True, max_length=100)

    # Read-only fields
    id = serializers.IntegerField(read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)
    card_last4 = serializers.CharField(read_only=True)

    def validate_card_number(self, value):
        digits = value.replace(' ', '')
        if not digits.isdigit() or len(digits) < 13:
            raise serializers.ValidationError('Неверный номер карты.')
        return digits

    def validate_expiry(self, value):
        import re
        if not re.match(r'^\d{2}/\d{2}$', value):
            raise serializers.ValidationError('Формат: MM/YY')
        return value

    def validate(self, data):
        booking_id = data.get('booking_id')
        request = self.context.get('request')
        try:
            booking = Booking.objects.get(pk=booking_id, guest=request.user)
        except Booking.DoesNotExist:
            raise serializers.ValidationError({'booking_id': 'Бронирование не найдено.'})
        if hasattr(booking, 'payment'):
            raise serializers.ValidationError({'booking_id': 'Оплата уже была произведена.'})
        data['booking'] = booking
        return data

    def create(self, validated_data):
        booking = validated_data['booking']
        digits = validated_data['card_number']
        card_last4 = digits[-4:]
        
        pay_status = 'failed' if card_last4 == '0000' else 'success'
        return Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            status=pay_status,
            card_last4=card_last4,
        )


class LandlordBookingSerializer(serializers.ModelSerializer):
    guest = serializers.ReadOnlyField(source='guest.username')
    property_title = serializers.ReadOnlyField(source='property.title')
    property_city = serializers.ReadOnlyField(source='property.city')
    booking_status = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'property', 'property_title', 'property_city',
                  'guest', 'check_in', 'check_out', 'guests_count', 'total_price',
                  'booking_status', 'created_at']

    def get_booking_status(self, obj) -> str:
        today = date.today()
        if obj.check_in > today:
            return 'upcoming'
        if obj.check_out <= today:
            return 'completed'
        return 'current'
