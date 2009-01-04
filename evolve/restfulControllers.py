from django.forms import ModelForm
from django.forms.util import ErrorList
from django.core.paginator import Paginator

from google.appengine.api import users

from restful.restfulController import RestfulController

from models import *

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
