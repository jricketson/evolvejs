# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^data/', include('restful.urls')),
)
