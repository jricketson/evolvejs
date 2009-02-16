# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.views.decorators.cache import cache_page

from google.appengine.api import memcache
from google.appengine.api import users

from appenginepatcher import on_production_server
if on_production_server:
    LONG_TERM = 60 * 60 * 1
else:
    LONG_TERM = 1

@cache_page(LONG_TERM)
def application(request):
    c = RequestContext(request,{})
    return __renderTemplateToResponse("application.html", c)
    
def about(request):    
    c = RequestContext(request,{})
    return __renderTemplateToResponse("about.html", c)

def clearCache(request):
    return HttpResponse(memcache.flush_all())

def __renderTemplateToResponse(templateName, context):
    t = loader.get_template(templateName)
    return HttpResponse(t.render(context))
