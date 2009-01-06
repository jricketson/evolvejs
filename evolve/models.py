# -*- coding: utf-8 -*-
from google.appengine.ext import db

class Species(db.Model):
    name = db.StringProperty()
    generations = db.IntegerProperty()
    code = db.TextProperty()
    
    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    owner = db.UserProperty()
