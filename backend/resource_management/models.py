from django.db import models
from django.contrib.auth.models import User

TASK_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("complete", "Complete"),
    ("ahead_of_deadline", "Ahead of Deadline")
]

TASK_PRIORITY_CHOICES = [
    ("low","Low"),
    ("medium","Medium"),
    ("high","High")
]

INDUSTRY_CHOICES = [
    ("oil_and_gas","Oil and Gas"),
    ("banking","Banking"),
    ("automotive","Automotive"),
    ("other", "Other")
]

TIMESHEET_STATUS_CHOICES = [
    ("pending_review", "Pending Review"),
    ("rejected", "Rejected"),
    ("approved", "Approved")
]
class Client(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProjectManager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Consultant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    weekly_hours_capacity = models.IntegerField(default=40)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Project(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    project_manager = models.ForeignKey(ProjectManager, on_delete=models.CASCADE, related_name='projects')
    consultants = models.ManyToManyField(Consultant, through='ProjectAssignment', related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ProjectAssignment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assignments')
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'consultant')

    def __str__(self):
        return f"{self.consultant} on {self.project}"

class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    consultant = models.ForeignKey(Consultant, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=TASK_PRIORITY_CHOICES, default='low')
    created_at = models.DateTimeField(auto_now_add=True)
    deadline_at = models.DateTimeField(null=True, blank=True)

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
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=TIMESHEET_STATUS_CHOICES, default='pending_review')
    notes = models.TextField(blank=True)
    approved_by = models.ForeignKey(ProjectManager, on_delete=models.SET_NULL, null=True, related_name='approved_timesheets')
    attachment = models.FileField(upload_to='timesheets/%Y/%m/%d/', blank=True, null=True)
    class Meta:
        unique_together = ('consultant', 'project', 'date')

    def __str__(self):
        return f"{self.consultant} - {self.project} - {self.date} ({self.hours_worked}h)"