from django.db import models
from django.contrib.auth.models import User


class Client(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProjectManager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Consultant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    weekly_hours_capacity = models.IntegerField(default=40)
    work_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Project(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='projects')
    project_manager = models.ForeignKey(ProjectManager, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=100, default='pending')
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status}) - {self.project.title}"


class Audit(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='audits')
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='audits', null=True, blank=True)
    action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.action


class Timesheet(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='timesheets')
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='timesheets')
    hours_worked = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.consultant} - {self.project} ({self.hours_worked}h)"