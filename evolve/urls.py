# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('evolve.views',
                       (r'^$', 'application'),
                       (r'^admin/clearCache$', 'clearCache'),
)
