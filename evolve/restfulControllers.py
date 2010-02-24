import random
import datetime

from django.forms import ModelForm
from django.forms.util import ErrorList
from django.core.paginator import Paginator
from django.core.urlresolvers import reverse

from google.appengine.api import users

from restful.restfulController import RestfulController

from models import *
import taskqueue

class CpuTimeForm(ModelForm):
    class Meta:
        model = CpuTime
        fields =('time',)

class CpuTimeRestfulController(RestfulController):
    modelClass = CpuTime
    formClass = CpuTimeForm
    
class SpeciesForm(ModelForm):
    class Meta:
        model = Species
        fields =('code', 'name', 'count',)
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
                species.timesEvolved+=1
                species.put()
                self.invalidateCache()
                return [species]
        return super(SpeciesRestfulController, self).create()  

    def list (self, offset, limit):
        #every time a list is requested, it attempts to add a task, this should fail, if it attempts to do it more than every minute
        taskqueue.addTask(url=reverse("evolve.views.randomiseSpecies"), queueName=taskqueue.BACKGROUND_QUEUE, name=datetime.datetime.now().strftime("%Y%m%d%H%M"))
        return self.modelClass.all().order("-score").order("randomFloat").fetch(int(limit),0)
    
    def children (self, key):
        species = db.get(key)
        return species.children_set.fetch(1000) #make this pageable
    def addScore(self,key):
        score = self.request.GET['score']
        species = db.get(key)
        species.scoreList.append(int(score))
        species.put()
    
    #def parent(self,key):
    #    species = db.get(key)
    #    return [species.parentRef]

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
            return None
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
