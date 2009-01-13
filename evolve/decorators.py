from google.appengine.api import users
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect

def authorised(role):
    def wrapper(handler_method):
        def check_login(request, *args, **kwargs):
            user = users.get_current_user()
            if not user:
                if request.method != 'GET':
                    return HttpResponseForbidden()
                else:
                    return HttpResponseRedirect(users.create_login_url(request.path))
            elif role == "user" or (role == "admin" and     
                                    users.is_current_user_admin()):
                return handler_method(request, *args, **kwargs)
            else:
                return HttpResponseForbidden()  # Some unauthorized feedback
        return check_login
    return wrapper
