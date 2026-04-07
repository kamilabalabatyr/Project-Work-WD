from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Property


# ─── Serializer #1: RegisterSerializer ───────────────────────────────
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


# ─── Serializer #2: LoginSerializer ──────────────────────────────────
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# ─── ModelSerializer #1: PropertyModelSerializer ─────────────────────
class PropertyModelSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'city', 'price_per_night',
                  'max_guests', 'owner', 'created_at']
        read_only_fields = ['owner', 'created_at']
