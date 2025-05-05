from django.db import models

from accounts.models import SystemUser

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Thesis(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey(
        SystemUser,
        on_delete=models.CASCADE,
        limit_choices_to={'is_supervisor': True},
        related_name='owned_theses'
    )
    producers = models.ManyToManyField(
        SystemUser,
        limit_choices_to={'is_student': True},
        related_name='producing_theses'
    )
    producer_limit = models.PositiveIntegerField(default=1)
    tags = models.ManyToManyField(Tag)
