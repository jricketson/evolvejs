# -*- coding: utf-8 -*-
from google.appengine.ext import db
from ragendja.auth.models import EmailUser
from aetycoon import DerivedProperty
import random

class User(EmailUser):
    receiveAdminEmail = db.BooleanProperty(default=True)
    receiveNotifications = db.BooleanProperty(default=True)
    referralSource = db.StringProperty()
    nickname = db.StringProperty()

    username = db.StringProperty()
    first_name = db.StringProperty()
    last_name = db.StringProperty()
    
    totalCpuTime = db.IntegerProperty(default=0)
    communityScore = db.IntegerProperty()

    version = db.StringProperty()

class CpuTime(db.Model):
    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    owner = db.ReferenceProperty(User)
    
    time = db.IntegerProperty(required=True)
    def ownerName(self):
        return self.owner.username


class Species(db.Model):
    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    owner = db.ReferenceProperty(User)
    
    name = db.StringProperty()
    count = db.IntegerProperty()
    code = db.TextProperty()
    hashCode=db.StringProperty()
    parentRef=db.SelfReferenceProperty(collection_name="children_set")
    ancestor = db.SelfReferenceProperty(collection_name="descendants_set")
    scoreList = db.ListProperty(int)
    timesEvolved = db.IntegerProperty(default=1)

    def ownerName(self):
        return self.owner.username
    @DerivedProperty
    def uniqueName(self):
        try:
            return "%s-%s" %(self.name,self.key().id_or_name())
        except db.NotSavedError:
            return self.name
    @DerivedProperty
    def randomFloat(self):
        return random.random()
    
    @DerivedProperty
    def score(self):
        return 5 - len(self.scoreList[-5:]) + sum(self.scoreList[-5:])
    
    @DerivedProperty
    def validScore(self):
        return len(self.scoreList) >= 5
    @DerivedProperty
    def scoreCount(self):
        return len(self.scoreList)
    
    def put(self):
        super(Species, self).put()
        if self.parentRef:
            self.ancestor = self.parentRef.ancestor
        else:
            self.ancestor = self
        super(Species, self).put()

    def __unicode__(self):
        return unicode("%s %s" % (self.name, self.hashCode))
        