from django.contrib import admin
from .models import Thesis

@admin.register(Thesis)
class ThesisAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'owner', 'date_of_creation')
    search_fields = ('name', 'owner__last_name')
    list_filter = ('status',)