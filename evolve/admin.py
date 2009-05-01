
from django.contrib import admin

from models import *

class SpeciesAdmin(admin.ModelAdmin):
    list_display = ("name", "count")
admin.site.register(Species, SpeciesAdmin)
