from google.appengine.ext import db
from google.appengine.api import datastore_errors

from django.http import HttpResponse, HttpResponseServerError, HttpResponseNotFound
from django.conf import settings
from django.utils.http import http_date
from django.utils.dateformat import DateFormat
from django.utils.functional import Promise
from django.utils.translation import force_unicode
from django.utils.simplejson import JSONEncoder
from django.shortcuts import render_to_response
from django.template import RequestContext

import models
import logging

def index(request):
    posts = models.BlogPost.all().order("-published").fetch(10)
    return HttpResponse(render_to_response("blog_index.html",
                                           {"posts":posts},
                                           context_instance=RequestContext(request)))

def post(request, path):
    post = models.BlogPost.all().filter("path = ",path).fetch(1)
    if len(post)==0:
        return HttpResponseNotFound()
    return HttpResponse(render_to_response("post.html",
                                           {"post":post[0]},
                                           context_instance=RequestContext(request)))

def atomFeed(request):
    posts = models.BlogPost.all().order("-updated").fetch(10)
    return HttpResponse(render_to_response("atom.xml",
                                           {"posts":posts},
                                           context_instance=RequestContext(request)))
    