from google.appengine.api.labs import taskqueue
from google.appengine.runtime import apiproxy_errors
from google.appengine.ext import db

import logging
from django.http import HttpResponse

MAIL_QUEUE = 'mail-queue'
BACKGROUND_QUEUE = 'background-processing'
FETCH_LIMIT=50

def addTask(url, params={}, queueName='default', **kw):
    try:
        logging.info("add task to %s [%s]" % (queueName, (url,params)))
        task = taskqueue.Task(url=url, params=params, **kw)
        task.add(queueName)
    except taskqueue.TransientError, e:
        logging.exception("adding Task failed with a TransientError")
        addTask(url, params, queueName)
    except taskqueue.TaskAlreadyExistsError, e:
        logging.info("task not added: already existed")
        # this is expected behaviour if the client has specified a taskname
    except apiproxy_errors.OverQuotaError, e:
        #but keep going
        logging.exception("adding Task failed with a TransientError")
        
def executeByPage(request, query, fn, workerUrl):
    if 'startKey' in request.REQUEST:
        query.filter('__key__ >', db.Key(request.REQUEST['startKey']))
    
    lastKey=None
    count=0
    listToBeSaved = []
    for i in query.fetch(FETCH_LIMIT):
        listToBeSaved.append(fn(i))
        lastKey=i.key()
        count+=1
    db.put(listToBeSaved)
    if lastKey:
        logging.info("enqueue task starting at %s for %s" % (lastKey, workerUrl))
        addTask(url=workerUrl, params=dict(startKey=lastKey))
    logging.info("completed processing %s for %s" % (count, workerUrl))
    return HttpResponse("completed processing %s websites" % count)
