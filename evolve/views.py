# -*- coding: utf-8 -*-
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.views.decorators.cache import cache_page
from django.shortcuts import render_to_response

from google.appengine.api import memcache
from google.appengine.api import users

from models import Species

from appenginepatcher import on_production_server
if on_production_server:
    LONG_TERM = 60 * 60 * 1
else:
    LONG_TERM = 1

def clearCache(request):
    return HttpResponse(memcache.flush_all())

def speciesList(request):
    return render_to_response("speciesList.html",
                              {"speciesList":Species.all().order("-score").order("-scoreCount")},
                              context_instance=RequestContext(request))
def randomiseSpecies(request):
    def fn(p):
        p.randomFloat=random.random()
        p.put()
    query = Species.all()
    return taskqueue.executeByPage(request, query, fn, reverse(randomiseSpecies))
    