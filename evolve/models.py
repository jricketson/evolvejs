# -*- coding: utf-8 -*-
from google.appengine.ext import db
from ragendja.auth.models import EmailUser

class Species(db.Model):
    name = db.StringProperty()
    count = db.IntegerProperty()
    code = db.TextProperty()
    hashCode=db.StringProperty()
    parentRef=db.SelfReferenceProperty(collection_name="children_set")
    
    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    owner = db.UserProperty()

class User(EmailUser):
    username = db.StringProperty()
    first_name = db.StringProperty()
    last_name = db.StringProperty()

    version = db.StringProperty()

