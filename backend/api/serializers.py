from datetime import date

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Property, Booking, Review, UserProfile


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
    status = serializers.ReadOnlyField()

    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'city', 'price_per_night',
                  'max_guests', 'owner', 'status', 'rejection_reason', 'created_at']
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

    class Meta:
        model = Booking
        fields = ['id', 'property', 'guest', 'check_in', 'check_out', 'guests_count', 'total_price', 'created_at']
        read_only_fields = ['guest', 'total_price', 'created_at']

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

        # Date collision check — prevent overbooking
        overlapping = Booking.objects.filter(
            property=prop,
            check_in__lt=check_out,
            check_out__gt=check_in,
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


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']
