from django.forms import ModelForm
from django.forms.util import ErrorList
from django.core.paginator import Paginator

from restful.restfulController import RestfulController

from models import *

class SpeciesForm(ModelForm):
    class Meta:
        model = Species

class SpeciesRestfulController(RestfulController):
    modelClass = Species
    formClass = SpeciesForm
    
