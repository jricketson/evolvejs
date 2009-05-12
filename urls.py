# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.contrib.auth.forms import AuthenticationForm

from ragendja.auth.urls import urlpatterns as auth_patterns
from ragendja.urlsauto import urlpatterns

from evolve.forms import UserRegistrationForm

admin.autodiscover()
#patch AuthenticationForm to be an email
AuthenticationForm.base_fields['username'].widget.attrs['maxlength'] = 75 
AuthenticationForm.base_fields['username'].label = "Email" 

handler500 = 'ragendja.views.server_error'

testPatterns = patterns('django.views.generic.simple',
                       (r'^test/run.html$', 'direct_to_template', {'template': 'tests/run-tests.html'}),
                       )
thesePatterns = patterns('django.views.generic.simple',
                       (r'^$', 'direct_to_template', {'template': 'home.html'}),
                       (r'^index.html$', 'direct_to_template', {'template': 'home.html'}),
                       (r'^about.html$', 'direct_to_template', {'template': 'about.html'}),
                       )

thesePatterns += patterns('',
                       ('^admin-app/(.*)', admin.site.root),
                       url(r'^account/register/$', 'registration.views.register',
                            kwargs={'form_class': UserRegistrationForm},
                            name='registration_register'),
                       url(r'^account/logout/$',
                           auth_views.logout,
                           {"next_page": "/"}, name='auth_logout'),
)

urlpatterns = thesePatterns + auth_patterns + urlpatterns + testPatterns