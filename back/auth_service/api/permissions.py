"""Custom permission classes used across the API views."""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAthleteOwnerOrReadOnly(BasePermission):
    """Allow safe methods for everyone and restrict writes to the athlete owner."""

    def has_permission(self, request, view):
        """Return True when the request method is safe or the user is authenticated.

        Args:
            request (Request): Incoming request instance.
            view (APIView): View that triggered the permission check.

        Returns:
            bool: ``True`` when access should be granted.
        """

        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        """Return True when the user owns the athlete or is staff.

        Args:
            request (Request): Incoming request instance.
            view (APIView): View that triggered the permission check.
            obj (Athlete): Athlete model instance under evaluation.

        Returns:
            bool: ``True`` when access should be granted.
        """

        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "user_id", None) == getattr(request.user, "id", None)


class IsCompanyOwnerOrReadOnly(BasePermission):
    """Allow safe methods for everyone and restrict writes to the company owner."""

    def has_permission(self, request, view):
        """Return True when the request method is safe or the user is authenticated.

        Args:
            request (Request): Incoming request instance.
            view (APIView): View that triggered the permission check.

        Returns:
            bool: ``True`` when access should be granted.
        """

        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        """Return True when the user owns the company profile or is staff.

        Args:
            request (Request): Incoming request instance.
            view (APIView): View that triggered the permission check.
            obj (CompanyProfile): Company profile instance under evaluation.

        Returns:
            bool: ``True`` when access should be granted.
        """

        if request.method in SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "user_id", None) == getattr(request.user, "id", None)


class IsSelfOrAdmin(BasePermission):
    """Allow access to a user resource only to itself or staff members."""

    def has_object_permission(self, request, view, obj):
        """Return True when the request targets the authenticated user or staff.

        Args:
            request (Request): Incoming request instance.
            view (APIView): View that triggered the permission check.
            obj (User): User instance under evaluation.

        Returns:
            bool: ``True`` when access should be granted.
        """

        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "id", None) == getattr(request.user, "id", None)
