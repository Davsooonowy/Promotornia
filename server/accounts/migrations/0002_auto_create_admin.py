# accounts/migrations/0002_auto_create_admin.py

from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_superuser(apps, schema_editor):
    User = apps.get_model('accounts', 'SystemUser')
    User.objects.create(
        email='admin@example.com',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True,
        password=make_password('admin'),
    )

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
