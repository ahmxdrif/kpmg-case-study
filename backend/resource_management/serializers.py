from rest_framework import serializers
from .models import Client, ProjectAssignment, ProjectManager, Consultant, Project, Task, Audit, Timesheet


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class ProjectManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectManager
        fields = '__all__'


class ConsultantSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    class Meta:
        model = Consultant
        fields = ['id', 'user', 'username', 'weekly_hours_capacity', 'created_at', 'projects']

    def get_username(self, obj):
        return obj.user.username

    def get_projects(self, obj):
        return [p.title for p in obj.projects.all()]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class ProjectAssignmentSerializer(serializers.ModelSerializer):
    consultant_username = serializers.SerializerMethodField()
    class Meta:
        model = ProjectAssignment
        fields = ['id', 'project', 'consultant', 'consultant_username', 'assigned_at']
    
    def get_consultant_username(self, obj):
        return obj.consultant.user.username


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'


class TimesheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timesheet
        fields = '__all__'
        read_only_fields = ['status', 'approved_by']