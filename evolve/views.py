# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.template import Context, loader
from django.views.decorators.cache import cache_page

from appenginepatcher import on_production_server
if on_production_server:
    LONG_TERM = 60 * 60 * 1
else:
    LONG_TERM = 1

@cache_page(LONG_TERM)
def application(request):
    c = Context({
        'on_production_server': on_production_server
    })
    return __renderTemplateToResponse("application.html", c)
    
def about(request):    
    c = Context({
        'on_production_server': on_production_server
    })
    return __renderTemplateToResponse("about.html", c)
    
def __renderTemplateToResponse(templateName, context):
    t = loader.get_template(templateName)
    return HttpResponse(t.render(context))
