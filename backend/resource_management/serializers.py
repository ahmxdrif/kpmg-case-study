from rest_framework import serializers
from .models import Client, ProjectManager, Consultant, Project, Task, Timesheet


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class ProjectManagerSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = ProjectManager
        fields = ['id', 'user', 'username', 'created_at']

    def get_username(self, obj):
        return obj.user.username


class ConsultantSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()

    class Meta:
        model = Consultant
        fields = ['id', 'user', 'username', 'email', 'weekly_hours_capacity', 'project', 'project_title', 'created_at']

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_project_title(self, obj):
        return obj.project.title if obj.project else None


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_industry = serializers.SerializerMethodField()
    project_manager_username = serializers.SerializerMethodField()
    consultants_detail = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'client', 'client_name', 'client_industry',
            'project_manager', 'project_manager_username', 'consultants_detail', 'created_at'
        ]
        read_only_fields = ['project_manager']

    def get_client_name(self, obj):
        return obj.client.name

    def get_client_industry(self, obj):
        return obj.client.get_industry_display()

    def get_project_manager_username(self, obj):
        return obj.project_manager.user.username

    def get_consultants_detail(self, obj):
        return [
            {"id": c.id, "username": c.user.username, "assigned_at": c.created_at}
            for c in obj.consultants.all()
        ]

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class TimesheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timesheet
        fields = '__all__'
        read_only_fields = ['status', 'approved_by']