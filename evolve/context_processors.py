from appenginepatcher import on_production_server
import os

def core(request):
    on_test_server = not('APPLICATION_ID' in os.environ and os.environ.get('APPLICATION_ID') =="igloohq")

    return {'on_production_server':on_production_server,
            'on_test_server':on_test_server}