from django.db import models

from accounts import models as account_models
from django.utils import timezone

class Thesis(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey(
        account_models.SystemUser,
        on_delete=models.CASCADE,
        limit_choices_to={'is_supervisor': True},
        related_name='owned_theses'
    )
    producers = models.ManyToManyField(
        account_models.SystemUser,
        limit_choices_to={'is_student': True},
        related_name='producing_theses'
    )
    field_of_study = models.ForeignKey(account_models.FieldOfStudy, on_delete=models.CASCADE)
    producer_limit = models.PositiveIntegerField(default=1)
    tags = models.ManyToManyField(account_models.Tag)
    date_of_creation = models.DateTimeField(default=timezone.now)
