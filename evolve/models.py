# -*- coding: utf-8 -*-
from google.appengine.ext import db
from ragendja.auth.models import EmailUser

class User(EmailUser):
    receiveAdminEmail = db.BooleanProperty(default=True)
    receiveNotifications = db.BooleanProperty(default=True)
    referralSource = db.StringProperty()

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
    
class Error(AbstractModel):
    msg = db.StringProperty()
    url= db.StringProperty()
    lineNumber=db.StringProperty()
    lastOccurred = db.DateTimeProperty(auto_now=True)

    def __unicode__(self):
        return unicode("%s (from %s to %s)" % (self.msg, self.created.strftime("%d/%m/%Y"), self.lastOccurred.strftime("%d/%m/%Y")))
    
