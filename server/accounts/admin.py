from django.contrib import admin
from .models import SystemUser, FieldOfStudy, OneTimePasswordLink

@admin.register(SystemUser)
class SystemUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'is_student', 'is_supervisor', 'is_dean')

@admin.register(FieldOfStudy)
class FieldOfStudyAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(OneTimePasswordLink)
class OneTimePasswordLinkAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'expires_at', 'used')
    list_filter = ('used',)