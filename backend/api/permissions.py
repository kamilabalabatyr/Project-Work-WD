from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow edit/delete only to the object owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsLandlord(permissions.BasePermission):
    """Only users with landlord role can create properties."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'profile', None)
        if profile is None:
            return False
        return profile.role == 'landlord'


class IsAdmin(permissions.BasePermission):
    """Only admin-role users (or Django superusers)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if profile is None:
            return False
        return profile.role == 'admin'
