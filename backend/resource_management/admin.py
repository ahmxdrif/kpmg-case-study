from django.contrib import admin
from .models import Client, ProjectManager, Consultant, Project, Task, Timesheet

admin.site.register(Client)
admin.site.register(ProjectManager)
admin.site.register(Consultant)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(Timesheet)