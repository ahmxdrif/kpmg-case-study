from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.core.cache import cache
from rest_framework.exceptions import ValidationError

from .models import Client, ProjectManager, Consultant, Project, Task, Timesheet
from .serializers import (
    ClientSerializer, ProjectManagerSerializer, ConsultantSerializer,
    ProjectSerializer, TaskSerializer, TimesheetSerializer
)
from .permissions import (
    IsProjectManagerOrReadOnly, IsOwningProjectManagerOrReadOnly,
    TaskPermission, TimesheetPermission
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
    filterset_fields = ['project']
    search_fields = ['user__email', 'user__username']
    ordering_fields = ['created_at']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsOwningProjectManagerOrReadOnly]
    filterset_fields = ['client', 'project_manager']
    search_fields = ['title']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        serializer.save(project_manager=self.request.user.projectmanager)

    @action(detail=True, methods=['post'], permission_classes=[IsOwningProjectManagerOrReadOnly])
    def assign_consultant(self, request, pk=None):
        project = self.get_object()
        self.check_object_permissions(request, project)
        consultant_id = request.data.get('consultant')
        try:
            consultant = Consultant.objects.get(id=consultant_id)
        except Consultant.DoesNotExist:
            return Response({"detail": "Consultant not found."}, status=404)

        if consultant.project_id is not None:
            return Response({"detail": "Consultant is already assigned to a project."}, status=400)

        consultant.project = project
        consultant.save()
        return Response(ConsultantSerializer(consultant).data)

    @action(detail=True, methods=['post'], permission_classes=[IsOwningProjectManagerOrReadOnly])
    def remove_consultant(self, request, pk=None):
        project = self.get_object()
        self.check_object_permissions(request, project)
        consultant_id = request.data.get('consultant')
        try:
            consultant = Consultant.objects.get(id=consultant_id, project=project)
        except Consultant.DoesNotExist:
            return Response({"detail": "Consultant is not assigned to this project."}, status=404)

        consultant.project = None
        consultant.save()
        return Response({"detail": "Consultant removed."})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [TaskPermission]
    filterset_fields = ['project', 'consultant', 'status']
    search_fields = ['title', 'consultant__user__username', 'project__title']
    ordering_fields = ['created_at', 'deadline_at']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consultant'):
            return Task.objects.filter(consultant=user.consultant)
        return Task.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'projectmanager') and hasattr(user.projectmanager, 'project'):
            serializer.save(project=user.projectmanager.project)
        else:
            raise ValidationError("You must have a project assigned before creating tasks.")
class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer
    permission_classes = [TimesheetPermission]
    filterset_fields = ['project', 'consultant', 'status']
    search_fields = ['consultant__user__username', 'project__title']
    ordering_fields = ['created_at', 'date']

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consultant'):
            return Timesheet.objects.filter(consultant=user.consultant)
        return Timesheet.objects.all()

    def perform_create(self, serializer):
        consultant = self.request.user.consultant
        if not consultant.project:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must be assigned to a project before submitting a timesheet.")
        serializer.save(consultant=consultant, project=consultant.project)

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

    def get(self, request):
        user = request.user
        data = {
            "username": user.username,
            "is_project_manager": hasattr(user, 'projectmanager'),
            "is_consultant": hasattr(user, 'consultant'),
            "is_admin": user.is_staff,
        }
        if hasattr(user, 'projectmanager'):
            data['project_manager'] = user.projectmanager.id
            data['project_id'] = user.projectmanager.project.id if hasattr(user.projectmanager, 'project') else None
        if hasattr(user, 'consultant'):
            data['consultant'] = user.consultant.id
            data['title'] = user.consultant.get_title_display()
            data['status'] = user.consultant.get_status_display()
            data['project_id'] = user.consultant.project.id if user.consultant.project else None
        return Response(data)


class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if hasattr(user, 'projectmanager'):
            pm = user.projectmanager
            if not hasattr(pm, 'project'):
                return Response({"detail": "You have no project assigned yet."})
            project = pm.project
            tasks = Task.objects.filter(project=project)
            data = {
                "project_title": project.title,
                "client_name": project.client.name,
                "total_consultants": project.consultants.count(),
                "total_tasks": tasks.count(),
                "tasks_pending": tasks.filter(status='pending').count(),
                "tasks_completed": tasks.filter(status='complete').count(),
                "tasks_ahead_of_deadline": tasks.filter(status='ahead_of_deadline').count(),
            }
            return Response(data)

        if hasattr(user, 'consultant'):
            consultant = user.consultant
            tasks = Task.objects.filter(consultant=consultant)
            data = {
                "project_title": consultant.project.title if consultant.project else None,
                "project_manager_username": consultant.project.project_manager.user.username if consultant.project else None,
                "project_manager_email": consultant.project.project_manager.user.email if consultant.project else None,
                "total_tasks": tasks.count(),
                "tasks_pending": tasks.filter(status='pending').count(),
                "tasks_completed": tasks.filter(status='complete').count(),
                "tasks_ahead_of_deadline": tasks.filter(status='ahead_of_deadline').count(),
            }
            return Response(data)

        return Response({"detail": "No role assigned."})