from ragendja.settings_post import settings

settings.REST_CONTROLLERS["species"]="evolve.restfulControllers.SpeciesRestfulController"
settings.REST_CONTROLLERS["user"]="evolve.restfulControllers.UserRestfulController"

settings.TEMPLATE_CONTEXT_PROCESSORS += (
     'django.core.context_processors.request',
     'evolve.context_processors.core'
) 

settings.AUTH_USER_MODULE="evolve.models"
settings.AUTH_ADMIN_MODULE = 'evolve.userAdmin'
settings.APPLICATION_NAME="evolvethefuture"

settings.DEFAULT_FROM_EMAIL="jricketson@redredred.com.au"

