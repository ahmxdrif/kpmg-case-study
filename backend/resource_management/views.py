from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets

from .models import Client, ProjectManager, Consultant, Project, Task, Audit, Timesheet
from .serializers import (
    ClientSerializer, ProjectManagerSerializer, ConsultantSerializer,
    ProjectSerializer, TaskSerializer, AuditSerializer, TimesheetSerializer
)


class HelloView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hello, {request.user.username}! JWT auth works."})


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['industry']
    search_fields = ['name', 'contact_email']
    ordering_fields = ['created_at']


class ProjectManagerViewSet(viewsets.ModelViewSet):
    queryset = ProjectManager.objects.all()
    serializer_class = ProjectManagerSerializer
    permission_classes = [IsAuthenticated]


class ConsultantViewSet(viewsets.ModelViewSet):
    queryset = Consultant.objects.all()
    serializer_class = ConsultantSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['work_email', 'user__username']
    ordering_fields = ['created_at']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['client', 'project_manager', 'consultant']
    search_fields = ['title']
    ordering_fields = ['created_at']


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'consultant']
    search_fields = ['title', 'consultant__user__username', 'project__title']
    ordering_fields = ['created_at']


class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['consultant', 'action']
    search_fields = ['action', 'project__title']
    ordering_fields = ['created_at']


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'consultant']
    search_fields = ['consultant__user__username', 'project__title']
    ordering_fields = ['created_at', 'hours_worked']