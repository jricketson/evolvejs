# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from ragendja.urlsauto import urlpatterns

urlpatterns = patterns('',
    (r'^$', 'django.views.generic.simple.direct_to_template', {'template': 'main.html'}),
) + urlpatterns
