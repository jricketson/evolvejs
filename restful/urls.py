# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('restful.views',
                       (r'^(?P<modelName>\w*)/(?P<remainder>.*)$', 'restful'),
#    (r'^$', 'list_people'),
#    (r'^create/$', 'add_person'),
##    (r'^show/(?P<key>.+)$', 'show_person'),
 #   (r'^edit/(?P<key>.+)$', 'edit_person'),
 #   (r'^delete/(?P<key>.+)$', 'delete_person'),
 #   (r'^download/(?P<key>.+)/(?P<name>.+)$', 'download_file'),
)
