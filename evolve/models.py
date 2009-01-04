# -*- coding: utf-8 -*-
from google.appengine.ext import db

class UserProfile(db.Model):
    showTutorial = db.BooleanProperty(default=True)
    validInvitation = db.BooleanProperty(default=False)

    version = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    owner = db.UserProperty()
