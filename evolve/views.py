# -*- coding: utf-8 -*-
import random

from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader
from django.views.decorators.cache import cache_page
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse

from google.appengine.api import memcache
from google.appengine.api import users

from models import Species
import taskqueue

from appenginepatcher import on_production_server
if on_production_server:
    LONG_TERM = 60 * 60 * 1
else:
    LONG_TERM = 1

def clearCache(request):
    return HttpResponse(memcache.flush_all())

def speciesList(request):
    return render_to_response("speciesList.html",
                              {"speciesList":Species.all().order("-score").order("-scoreCount").order("randomFloat")},
                              context_instance=RequestContext(request))
    