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
                self.invalidateCache()
                return [species]
        return super(SpeciesRestfulController, self).create()  

    def list (self, offset, limit):
        return self.modelClass.all().order("-count").fetch(int(limit), int(offset))
    
class UserOptionsForm(ModelForm):
    class Meta:
        model = User
        fields = ('receiveAdminEmail','receiveNotifications')

class UserRestfulController(RestfulController):
    modelClass = User
    formClass = UserOptionsForm
    
    def id(self, key):
        user = self.request.user
        if not user.is_authenticated():
            return []
        return self._getUsefulFields(user)

    def update(self, key):
        modelObj = self.request.user
        form = self.formClass(self.request.POST, instance=modelObj)
        if form.is_valid():
            form.save()
            self.invalidateCache()
            return "user settings updated"
        else:
            return form

    def changePassword(self, key):
        form = PasswordChangeForm(self.request.user, self.request.POST)
        if form.is_valid():
            form.save()
            return "password updated successfully"
        else:
            return form
        
    def _getUsefulFields(self, user):
        return {"username":user.username,
                "receiveNotifications":user.receiveNotifications,
                "receiveAdminEmail":user.receiveAdminEmail
                }
