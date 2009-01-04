# -*- coding: utf-8 -*-
import restfulRouter

def restful(request, modelName, remainder):
    return restfulRouter.process(request, modelName, remainder)
