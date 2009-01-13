from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS

from restfulControllers import *

REST_CONTROLLERS = {
                    "species":SpeciesRestfulController,
                    "userProfile":UserProfileRestfulController,
                    }

TEMPLATE_CONTEXT_PROCESSORS += (
     'django.core.context_processors.request',
) 
