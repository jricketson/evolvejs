# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader
from django.views.decorators.cache import cache_page

from google.appengine.api import memcache
from google.appengine.api import users

from decorators import authorised

from appenginepatcher import on_production_server
if on_production_server:
    LONG_TERM = 60 * 60 * 1
else:
    LONG_TERM = 1

@cache_page(LONG_TERM)
def application(request):
    c = Context({
        'on_production_server': on_production_server,
        'user' : users.get_current_user()
    })
    return __renderTemplateToResponse("application.html", c)
    
def about(request):    
    c = Context({
        'on_production_server': on_production_server,
        'user' : users.get_current_user()
    })
    return __renderTemplateToResponse("about.html", c)

#@authorised("admin")
def clearCache(request):
    return HttpResponse(memcache.flush_all())

@cache_page(LONG_TERM)
def logoutLink(request):
    return HttpResponse(users.create_logout_url("/evolve/"))
    
def login(request):
    return HttpResponseRedirect(users.create_login_url(request.GET['q']))

def __renderTemplateToResponse(templateName, context):
    t = loader.get_template(templateName)
    return HttpResponse(t.render(context))
