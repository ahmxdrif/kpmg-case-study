from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HelloView, ClientViewSet, ProjectManagerViewSet, ConsultantViewSet,
    ProjectViewSet, TaskViewSet, AuditViewSet, TimesheetViewSet, MeView
)

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('project-managers', ProjectManagerViewSet)
router.register('consultants', ConsultantViewSet)
router.register('projects', ProjectViewSet)
router.register('tasks', TaskViewSet)
router.register('audits', AuditViewSet)
router.register('timesheets', TimesheetViewSet)

urlpatterns = [
    path('hello/', HelloView.as_view()),
    path('me/', MeView.as_view()),
    path('', include(router.urls)),
]