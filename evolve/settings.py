from ragendja.settings_post import *
from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS

REST_CONTROLLERS["species"]="evolve.restfulControllers.SpeciesRestfulController"
REST_CONTROLLERS["user"]="evolve.restfulControllers.UserRestfulController"

TEMPLATE_CONTEXT_PROCESSORS += (
     'django.core.context_processors.request',
     'evolve.context_processors.core'
) 

AUTH_USER_MODULE="evolve.models"
AUTH_ADMIN_MODULE = 'admin.userAdmin'
APPLICATION_NAME="evolve"

DEFAULT_FROM_EMAIL="jricketson@redredred.com.au"

