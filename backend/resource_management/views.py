from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Client, ProjectManager, Consultant, Project, ProjectAssignment, Task, Audit, Timesheet
from .serializers import (
    ClientSerializer, ProjectManagerSerializer, ConsultantSerializer,
    ProjectSerializer, ProjectAssignmentSerializer, TaskSerializer,
    AuditSerializer, TimesheetSerializer
)
from .permissions import (
    IsProjectManagerOrReadOnly, TaskPermission, TimesheetPermission
)
from django.core.cache import cache
class HelloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hello, {request.user.username}! JWT auth works."})


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['industry']
    search_fields = ['name']
    ordering_fields = ['created_at']


class ProjectManagerViewSet(viewsets.ModelViewSet):
    queryset = ProjectManager.objects.all()
    serializer_class = ProjectManagerSerializer
    permission_classes = [IsAuthenticated]


class ConsultantViewSet(viewsets.ModelViewSet):
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['user__email', 'user__username']
    ordering_fields = ['created_at']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectManagerOrReadOnly]
    filterset_fields = ['client', 'project_manager']
    search_fields = ['title']
    ordering_fields = ['created_at']

class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ProjectAssignment.objects.all()
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsProjectManagerOrReadOnly]
    filterset_fields = ['project', 'consultant']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [TaskPermission]
    filterset_fields = ['project', 'consultant']
    search_fields = ['title', 'consultant__user__username', 'project__title']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consultant'):
            return Task.objects.filter(consultant=user.consultant)
        return Task.objects.all()


class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [IsProjectManagerOrReadOnly]
    filterset_fields = ['consultant', 'action']
    search_fields = ['action', 'project__title']
    ordering_fields = ['created_at']


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer
    permission_classes = [TimesheetPermission]
    filterset_fields = ['project', 'consultant']
    search_fields = ['consultant__user__username', 'project__title']
    ordering_fields = ['created_at', 'hours_worked']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consultant'):
            return Timesheet.objects.filter(consultant=user.consultant)
        return Timesheet.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(consultant=self.request.user.consultant)
    
    @action(detail=True, methods=['post'], permission_classes=[IsProjectManagerOrReadOnly])
    def approve(self, request, pk=None):
        timesheet = self.get_object()
        timesheet.status = 'approved'
        timesheet.approved_by = request.user.projectmanager
        timesheet.save()
        return Response(TimesheetSerializer(timesheet).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsProjectManagerOrReadOnly])
    def reject(self, request, pk=None):
        timesheet = self.get_object()
        timesheet.status = 'rejected'
        timesheet.approved_by = request.user.projectmanager
        timesheet.save()
        return Response(TimesheetSerializer(timesheet).data)
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        data = {
            "username": user.username,
            "is_project_manager": hasattr(user, 'projectmanager'),
            "is_consultant": hasattr(user, 'consultant'),
            "is_admin": user.is_staff,
        }
        if hasattr(user, 'projectmanager'):
            data['project_manager'] = user.projectmanager.id
        if hasattr(user, 'consultant'):
            data['consultant'] = user.consultant.id
        return Response(data)

class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cached_data = cache.get('dashboard_metrics')
        if cached_data:
            return Response({**cached_data, "cached": True}) #i added True for demo-ing purposes
        
        data = {
            "total_projects": Project.objects.count(),
            "total_consultants": Consultant.objects.count(),
            "total_tasks": Task.objects.count(),
            "tasks_completed": Task.objects.filter(status='completed').count(),
            "tasks_pending": Task.objects.filter(status='pending').count(),
            "tasks_ahead_of_deadline": Task.objects.filter(status='ahead_of_deadline').count(),
        }

        cache.set('dashboard_metrics', data, timeout=300)

        return Response({**data, "cached": False})