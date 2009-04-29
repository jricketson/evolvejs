import os

from google.appengine.api import memcache

from ragendja.auth.models import AnonymousUser

class RestfulController(object):
    def __init__(self, request):
        self.request = request

    def create(self):
        form = self.formClass(self.request.POST)
        if form.is_valid():
            modelObj=form.save(commit=False)
            if self.request.user.is_authenticated():
                modelObj.owner=self.request.user
            modelObj.version=os.environ['CURRENT_VERSION_ID']
            modelObj.put()
            self.invalidateCache()
            return [modelObj]
        else:
            return form

    def update(self, key):
        modelObj = self.modelClass.get(key)
        form = self.formClass(self.request.POST, instance=modelObj)
        if form.is_valid():
            form.save()
            self.invalidateCache()
            return [modelObj]
        else:
            return form
        
    def list (self, offset, limit):
        def getDataFn(filter, page):
            return self.modelClass.all().order("created")
        return self.getFromCache(getDataFn, filter=self.request.user)

    def id(self, key):
        return [self.modelClass.get(key)]
    
    def delete(self, key):
        self.modelClass.get(key).delete()
        self.invalidateCache()
        return []

    def getFromCache(self, dataFn, filter="", page="", addCacheKey=True):
        key = "%s%s%s" % (self.modelClass.kind(), filter, page)
        data = memcache.get(key)
        if data is not None:
            return data
        data = dataFn(filter, page)
        memcache.set(key, data)
        if addCacheKey:
            self.addCacheKey(key)
        return data
        
    def invalidateCache(self, filter=""):
        filterKey = "%s%s" % (self.modelClass.kind(), filter)
        allKeys=self.getFromCache(lambda x, y: [])
        filteredKeys=[]
        for k in allKeys:
            if k.startswith(filterKey):
                filteredKeys.append(k)
        memcache.delete_multi(filteredKeys)
    
    def addCacheKey(self, cacheKey):
        allKeys=self.getFromCache(lambda x, y: [], addCacheKey=False)
        allKeys.append(cacheKey)
        memcache.set(self.modelClass.kind(), allKeys)

class RestfulForThisUserController(RestfulController):
    def invalidateCache(self, filter=""):
        if filter != "":
            filter = self.request.user.email
        super(RestfulForThisUserController, self).invalidateCache(filter)
        
    def list (self, offset, limit):
        def getDataFn(filter, page):
            return self.modelClass.all().filter("owner =", self.request.user).order("created")
        return self.getFromCache(getDataFn, filter=self.request.user)
        