
from django.contrib import admin

from models import *

class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "path")
    ordering = ("-published",)
admin.site.register(BlogPost, BlogPostAdmin)
