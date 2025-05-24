
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            **extra_fields,
        )

        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, first_name, last_name, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, first_name, last_name, **extra_fields)

class FieldOfStudy(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()

class SystemUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, default="")
    last_name = models.CharField(max_length=255, default="")
    field_of_study = models.ManyToManyField(FieldOfStudy)
    expiration_date = models.DateTimeField(default=timezone.now() + relativedelta(years=10))

    is_student = models.BooleanField(default=False)
    is_supervisor = models.BooleanField(default=False)
    is_dean = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    description = models.TextField(null=True, blank=True)
    total_spots = models.PositiveIntegerField(default=0)

    title = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    objects = UserManager()
