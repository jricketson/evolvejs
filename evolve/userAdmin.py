from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib import admin

class UserAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {'fields': ('is_staff', 'is_active', 'is_superuser', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        (_('Groups'), {'fields': ('groups',)}),
        (_('Flags'), {'fields': ('receiveAdminEmail', 'receiveNotifications')}),
    )    
    list_display = ('email', 'username', 'is_staff', 'is_active', 'last_login', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    
