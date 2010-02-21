import datetime
import logging

from google.appengine.ext import db

class BlogPost(db.Model):
    path = db.StringProperty(required=True)
    title = db.StringProperty(required=True, indexed=False)
    body = db.TextProperty(required=True)
    published = db.DateTimeProperty()
    updated = db.DateTimeProperty(auto_now=True)

    