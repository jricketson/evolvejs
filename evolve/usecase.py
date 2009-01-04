import datetime, os

from django.forms import ModelForm
from django.forms.util import ErrorList
from django.core.paginator import Paginator

from google.appengine.api import users

from models import *

class UseCases (object):
    def __init__(self, request):
        self.request = request

class RestfulUseCase(object):
    def create(self):
        form = self.formClass(self.request.POST)
        if form.is_valid():
            modelObj=form.save(commit=False)
            modelObj.owner=users.get_current_user()
            modelObj.version=os.environ['CURRENT_VERSION_ID']
            modelObj.put()
            return [modelObj]
        else:
            return form

    def update(self, key):
        modelObj = self.modelClass.get(key)
        form = self.formClass(self.request.POST, instance=modelObj)
        if form.is_valid():
            form.save()
            return [modelObj]
        else:
            return form
        
    def list (self, offset, limit):
        return self.modelClass.all().filter("owner =", users.get_current_user()).order("created").fetch(int(limit), int(offset))

    def id(self, key):
        return [self.modelClass.get(key)]
    
    def delete(self, key):
        self.modelClass.get(key).delete()
        return []
        
class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile

class UserProfileUseCases(UseCases, RestfulUseCase):
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

