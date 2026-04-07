from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow edit/delete only to the object owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
