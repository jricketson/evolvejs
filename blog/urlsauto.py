from django.conf.urls.defaults import *

rootpatterns = patterns('blog.views',
                       (r'^blog/$', 'index'),
                       (r'^blog/feeds/atom.xml$', 'atomFeed'),
                       (r'^blog/(?P<path>.*)$', 'post'),
)

