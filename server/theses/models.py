from django.db import models

from accounts import models as account_models
from django.utils import timezone

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Thesis(models.Model):
    name = models.CharField(
        max_length=255,
        unique=True,
        default=''
    )
    description = models.TextField(
        blank=True,
        null=True,
        default=''
    )
    prerequisites = models.TextField(
        blank=True,
        null=True,
        default=''
    )
    owner = models.ForeignKey(
        account_models.SystemUser,
        on_delete=models.CASCADE,
        limit_choices_to={'is_supervisor': True},
        related_name='owned_theses'
    )
    producer = models.OneToOneField(
        account_models.SystemUser,
        limit_choices_to={'is_student': True},
        related_name='thesis_producer',
        on_delete=models.SET_NULL,
        null=True,
        default=None
    )
    field_of_study = models.ForeignKey(
        account_models.FieldOfStudy,
        on_delete=models.CASCADE,
        default=None,
        null=True,
    )
    tags = models.ManyToManyField(Tag)
    date_of_creation = models.DateTimeField(default=timezone.now)
    status = models.CharField(default='Ukryty')
