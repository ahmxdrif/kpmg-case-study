from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProjectManager(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'projectmanager')


class IsConsultant(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'consultant')


class IsProjectManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return hasattr(request.user, 'projectmanager')


class IsOwningProjectManagerOrReadOnly(BasePermission):
    """Any authenticated user can read. Only the PM who owns THIS specific
    project can modify it (e.g. assign/remove consultants)."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return hasattr(request.user, 'projectmanager')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if not hasattr(request.user, 'projectmanager'):
            return False
        return obj.project_manager.user == request.user


class TaskPermission(BasePermission):
    def has_permission(self, request, view):
        if hasattr(request.user, 'projectmanager'):
            return True
        if hasattr(request.user, 'consultant'):
            if request.method in SAFE_METHODS:
                return True
            if request.method == 'PATCH':
                return True
            return False
        return False

    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'projectmanager'):
            return True
        if hasattr(request.user, 'consultant'):
            if request.method in SAFE_METHODS:
                return True
            if request.method == 'PATCH':
                return obj.consultant.user == request.user
        return False


class TimesheetPermission(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'projectmanager') or hasattr(request.user, 'consultant')

    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'projectmanager'):
            return True
        if hasattr(request.user, 'consultant'):
            is_owner = obj.consultant.user == request.user
            if request.method in SAFE_METHODS:
                return is_owner
            if request.method in ('PUT', 'PATCH'):
                return is_owner and obj.status == 'pending_review'
            return False
        return False