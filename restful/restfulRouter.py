from datetime import date

from django.core import serializers
from django.http import HttpResponse
from django.utils.functional import Promise
from django.utils.encoding import force_unicode
from django.utils import simplejson
from django.conf import settings

##
# Urls should be of the form:
# get /data/account/id/123 (get item with id 123
# get /data/account/search/123 (get items that contain 123
# get /data/account/list/0/10 (get a list from item 0 to item 10
# post /data/account/ (create a record)
# delete /data/account/id (delete a record)
#
###

def process(request, modelName, remainder):
    args = __parseURI(remainder)
    method = request.method
    if method == "POST":
        return __post(request, modelName, args)
    elif method =="GET":
        return __get(request, modelName, args)
    elif method =="DELETE":
        return __delete(request, modelName, args)
     
def __post(request, modelName, args):
    if len(args) >0:
        methodName="update"
    else:
        methodName="create"
    return __dispatch(request, modelName, methodName, args)
    
def __get(request, modelName, args):
    if len(args) > 0:
        methodName=args[0]
        args=args[1:]
    return __dispatch(request, modelName, methodName, args)
    
def __delete(request, modelName, args):
    methodName="delete"
    return __dispatch(request, modelName, methodName, args)

#the first element of the uri should be discarded
def __parseURI(remainder):
    return filter(lambda x: x!="", remainder.split('/'))
            
def __dispatch(request, modelName, methodName, args):
    #create controller object
    c = settings.REST_CONTROLLERS[modelName](request)
    #call the method on the controller
    result = getattr(c,methodName)(*args)
    #TODO: this should check the requested return type from the request that was received 
    if hasattr(result, 'errors'):
        return HttpResponse(simplejson.dumps({"errors":result.errors,"data":result.data}, cls=LazyEncoder), mimetype='application/json')
    else:
        return HttpResponse(serializers.serialize("json", result), mimetype='application/json') 
        
class LazyEncoder(simplejson.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Promise):
            return force_unicode(obj)
        if isinstance(obj, date):
            return force_unicode(obj)
        return obj
