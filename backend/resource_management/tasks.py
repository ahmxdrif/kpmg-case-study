from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Task


@shared_task
def check_overdue_tasks():
    now = timezone.now()
    overdue_tasks = Task.objects.filter(
        deadline_at__lt=now,
        status__in=['pending', 'ahead_of_deadline'],
    ).select_related('consultant__user', 'project__project_manager__user')

    for task in overdue_tasks:
        consultant_email = task.consultant.user.email
        project_manager_email = task.project.project_manager.user.email

        if consultant_email:
            send_mail(
                subject=f"Task overdue: {task.title} (Task ID: {task.id})",
                message=(
                    f"Task ID: {task.id}\n"
                    f"Status: {task.status}\n"
                    f"The task mentioned is overdue. Please check the deadline and update the status of the task."
                ),
                from_email=None,
                recipient_list=[consultant_email],
            )

        if project_manager_email:
            send_mail(
                subject=f"Task overdue: {task.title} (Task ID: {task.id})",
                message=(
                    f"PIC: {task.consultant.user.email}\n"
                    f"Task ID: {task.id}\n"
                    f"Status: {task.status}\n"
                    f"The task mentioned is overdue. Please follow-up with the consultant on the status of their task."
                ),
                from_email=None,
                recipient_list=[project_manager_email],
            )

    return f"Found {overdue_tasks.count()}. Email has been sent to Project Manager and Consultant involved."