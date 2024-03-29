import logging
import datetime
import calendar

from django.http import HttpResponse

from google.appengine.api import datastore
from google.appengine.ext import db

from evolve import taskqueue
import decimal
from evolve import models

#General Migration 
def migrateModel(request, model_name):
    #create the worker class and tell it to work
    workerName = '%sWorker' % model_name
    if not workerName in globals():
        logging.info("no worker for %s" % model_name)
        Worker = generateWorker(model_name)
    else:
        Worker =  globals()[workerName]
    if "start" in request.REQUEST:
        Worker(request.REQUEST['start']).work()
    else:
        Worker().work()
    return HttpResponse("ok")

class Worker(object):
    ITEMS_TO_FETCH=50
    worker_url="/worker/migrate/%s"
    def __init__(self, startKey=None):
        self.startKey=startKey
    
    def work(self):
        query = datastore.Query(self.kind)
        if self.startKey:
            query['__key__ >'] = db.Key(self.startKey)
        items = query.Get(self.ITEMS_TO_FETCH)
        if not items:
            logging.info('Finished migrating %s' % self.kind)
            return
        
        last_key = items[-1].key()
        [self.processItem(x) for x in items]

        taskqueue.addTask(
            url=self.worker_url % self.kind, params=dict(start=last_key), queueName=taskqueue.BACKGROUND_QUEUE)
        logging.info('Added another task to queue for %s starting at %s' % (self.kind, last_key))
    
    def processItem(self, item):
        self.processItemAsEntity(item)
        logging.info("processing %s %s" % (item.kind(), item.key()))
        modelClass = db.class_for_kind(item.kind()).from_entity(item)
        self.processItemAsClass(modelClass)
        modelClass.put()
    """Override this method to do some work for each item
    """
    def processItemAsEntity(self, item):
        pass
    def processItemAsClass(self, item):
        pass

def generateWorker(kind_name):
    class DynamicClass(MigrationWorker):
        kind=kind_name
    return DynamicClass

class MigrationWorker(Worker):
    pass


def _print_detail(item):
    return "\n".join([item.kind()]+["%s:%s" % (i,item[i]) for i in item.keys() ])
#                     if item.fields()[i].data_type != Blob

"""removeAllDynamicData on staging"""
def resetStagingDb(request):
    if request.META['APPLICATION_ID']=="evolvethefuture":
        return HttpResponse("I can't")
    modelsToReset = ["evolve_species"]
    for m in modelsToReset:
        query = datastore.Query(m, keys_only=True)
        result = query.Get(500)
        datastore.Delete(result)
    return HttpResponse("all removed")


"""migrate from version x to version y"""
def migrate(request):
    modelsToMigrate = ["evolve_species"]
    [taskqueue.addTask(url=Worker.worker_url % i, queueName=taskqueue.BACKGROUND_QUEUE) for i in modelsToMigrate]
    return HttpResponse("created all tasks for processing")

class evolve_speciesWorker(MigrationWorker):
    kind="evolve_species"
    operand_mask=16777215
    def decode (self, instruction):
        return [instruction >> 24, instruction & self.operand_mask];
    def encode (self, operator, operand):
        return (operator << 24) + operand
    def processItemAsClass(self, item):
        replace = [str(self.encode(i,j)) for i,j in [[0,201],[5,0],[20,0],[26,200],[25,450],[14,201],[0,200]]]
        
        code=item.code.split(",")
        #need to look for a series of operations, ([5,*],[20,*]), 
        #replace with ([0,201],[5,0],[20,0],[26,200],[25,450],[14,201],[0,200])
        for i in range(len(code)-1):
            a=self.decode(int(code[i]))
            b=self.decode(int(code[i+1]))
            #logging.info((a,b))
            if a[0]==5 and b[0]==20:
                logging.info("found")
                #remove i and i+1, and insert replace
                code[i:i+2]=replace
                item.code=",".join(code)
                return