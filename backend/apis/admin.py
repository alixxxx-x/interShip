from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Student, Company, AdminDept, AdminUniv

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'biography', 'profile_picture')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )
    list_display = ['username', 'email', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Student)
admin.site.register(Company)
admin.site.register(AdminDept)
admin.site.register(AdminUniv)


