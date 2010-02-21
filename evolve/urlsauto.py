# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *

migrationpatterns = patterns("evolve.migrate",
                       (r'^migrate/resetStagingDb$', 'resetStagingDb'),
                       (r'^migrate/migrate$', 'migrate'),
                       (r'^worker/migrate/(?P<model_name>[^/]+)$', 'migrateModel'),
)

rootpatterns = migrationpatterns + patterns('evolve.views',
                       (r'^index.html$', 'index'),
                       (r'^$', 'index'),
                       (r'^speciesList.html$', 'speciesList'),
                       (r'^cron/randomiseSpecies$', 'randomiseSpecies'),
                       (r'^admin/clearCache$', 'clearCache'),
                       (r'^(?P<template_name>[^/]+)$', 'static'),
)
