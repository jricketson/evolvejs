# -*- coding: utf-8 -*-
import random

from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound
from django.template import RequestContext, loader, TemplateDoesNotExist
from django.views.decorators.cache import cache_page
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
from django.views.generic.simple import direct_to_template

from google.appengine.api import memcache
from google.appengine.api import users

from models import Species, User
import taskqueue
import blog.views as blog_views
import logging

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

#The randomFloat field automatically randomises on a put
def randomiseSpecies(request):
    def fn(p):
        return p
    query = Species.all()
    return taskqueue.executeByPage(request, query, fn, reverse(randomiseSpecies))

def calculateCommunityScore(request):
    def fn(u):
        pass
        #add up all cputime
        #add up all species created
        #add up all species descended from created ones
    query = User.all()
    return taskqueue.executeByPage(request, query, fn, reverse(calculateCommunityScore))

def index(request):
    return render_to_response("index.html",
                              {"blog_content":blog_views.index(request).content},
                              context_instance=RequestContext(request))

def static(request, template_name):
    logging.debug(template_name)
    try:
        return direct_to_template(request, template_name)
    except TemplateDoesNotExist:
        return HttpResponseNotFound()