from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Property, Booking, Review



class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
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
                  'max_guests', 'owner', 'created_at']
        read_only_fields = ['owner', 'created_at']


class BookingModelSerializer(serializers.ModelSerializer):
    guest = serializers.ReadOnlyField(source='guest.username')
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'property', 'guest', 'check_in', 'check_out', 'guests_count', 'total_price', 'created_at']
        read_only_fields = ['guest', 'total_price', 'created_at']

    def validate(self, data):
        if data['check_out'] <= data['check_in']:
            raise serializers.ValidationError({'check_out': 'Check-out must be after check-in.'})
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
