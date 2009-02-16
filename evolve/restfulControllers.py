from django.forms import ModelForm
from django.forms.util import ErrorList
from django.core.paginator import Paginator

from google.appengine.api import users

from restful.restfulController import RestfulController

from models import *

class SpeciesForm(ModelForm):
    class Meta:
        model = Species
    def clean(self):
        super(SpeciesForm, self).clean()

        code=self.cleaned_data.get("code")
        self.cleaned_data["hashCode"]=str(code.__hash__())
        return self.cleaned_data

class SpeciesRestfulController(RestfulController):
    modelClass = Species
    formClass = SpeciesForm
    
    def create(self):
        #check if this species already exists, if it does, update the existing one instead
        matching = self.modelClass.all().filter("hashCode =", str(self.request.POST['code'].__hash__()))
        for species in matching:
            if species.code==self.request.POST['code']:
                species.count+=int(self.request.POST['count'])
                species.put()
                return [species]
        return super(SpeciesRestfulController, self).create()  
    def list (self, offset, limit):
        return self.modelClass.all().order("-count").fetch(int(limit), int(offset))
    
class UserForm(ModelForm):
    class Meta:
        model = User

class UserRestfulController(RestfulController):
    modelClass = User
    formClass = UserForm
    
    def id(self, key):
        user = self.request.user
        if not user.is_authenticated():
            return []
        return [user]

    def update(self, key):
        pass

