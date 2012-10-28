
from django.contrib import admin

from models import *

class SpeciesAdmin(admin.ModelAdmin):
    list_display = ("name", "count", "hashCode")
admin.site.register(Species, SpeciesAdmin)

class CpuTimeAdmin(admin.ModelAdmin):
    list_display = ("time", "ownerName","created")
    ordering = ("-created",)
admin.site.register(CpuTime, CpuTimeAdmin)
