import os

class RestfulController(object):
    def __init__(self, request):
        self.request = request
    def create(self):
        form = self.formClass(self.request.POST)
        if form.is_valid():
            modelObj=form.save(commit=False)
            modelObj.owner=self.request.user
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
        return self.modelClass.all().filter("owner =", self.request.user).order("created").fetch(int(limit), int(offset))

    def id(self, key):
        return [self.modelClass.get(key)]
    
    def delete(self, key):
        self.modelClass.get(key).delete()
        return []
        
