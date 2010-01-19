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

    version = db.StringProperty()

class AbstractModel(db.Model):
    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)

class AbstractOwnedModel(AbstractModel):
    owner = db.ReferenceProperty(User)

class Species(AbstractOwnedModel):
    name = db.StringProperty()
    count = db.IntegerProperty()
    code = db.TextProperty()
    hashCode=db.StringProperty()
    parentRef=db.SelfReferenceProperty(collection_name="children_set")
    ancestor = db.SelfReferenceProperty(collection_name="descendants-set")
    
    @DerivedProperty
    def randomFloat(self):
        return random.random()
    
    def put(self):
        super(Species, self).put()
        if self.parentRef:
            self.ancestor = self.parentRef.ancestor
        else:
            self.ancestor = self
        super(Species, self).put()

    def __unicode__(self):
        return unicode("%s %s" % (self.name, self.hashCode))
        