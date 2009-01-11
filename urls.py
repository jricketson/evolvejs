# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from ragendja.urlsauto import urlpatterns

urlpatterns = patterns('',
    (r'^$', "evolve.views.about"),
) + urlpatterns
