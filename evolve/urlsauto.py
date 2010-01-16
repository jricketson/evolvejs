# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('django.views.generic.simple',
                       (r'^$', 'direct_to_template', {'template': 'application.html'}),
)
urlpatterns += patterns('evolve.views',
                       (r'^admin/clearCache$', 'clearCache'),
                       (r'^speciesList.html$', 'speciesList'),
)
