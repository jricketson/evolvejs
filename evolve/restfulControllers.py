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
    
class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile

class UserProfileRestfulController(RestfulController):
    modelClass = UserProfile
    formClass = UserProfileForm
    
    def id(self, key):
        userProfile = self.modelClass.all().filter("owner =", users.get_current_user()).fetch(1)
        if len(userProfile)>0:
            return [userProfile[0]]
        else:
            userProfile = self.modelClass(owner=users.get_current_user())
            userProfile.put()
            return [userProfile]

    def update(self, key):
        modelObj = self.modelClass.all().filter("owner =", users.get_current_user()).fetch(1)
        form = self.formClass(self.request.POST, instance=modelObj)
        if form.is_valid():
            form.save()
            return [modelObj]
        else:
            return form

