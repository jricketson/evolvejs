# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

rootpatterns = patterns('django.views.generic.simple',
                       (r'^evolve.html$', 'direct_to_template', {'template': 'application.html'}),
)

migrationpatterns = patterns("evolve.migrate",
                       (r'^migrate/resetStagingDb$', 'resetStagingDb'),
                       (r'^migrate/migrate$', 'migrate'),
                       (r'^worker/migrate/(?P<model_name>[^/]+)$', 'migrateModel'),
)

rootpatterns += patterns('evolve.views',
                       (r'^admin/clearCache$', 'clearCache'),
                       (r'^speciesList.html$', 'speciesList'),
                       (r'^cron/randomiseSpecies$', 'randomiseSpecies'),
) + migrationpatterns
