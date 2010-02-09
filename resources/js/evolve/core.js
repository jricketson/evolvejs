// if no firebug installed
if (!window.console) {
   var console = {
      log : function() {
      },
      debug : function() {
      },
      info : function() {
      }
   };
}
var CORE = CORE || {};
CORE.NET_RETRY_TIMEOUT = 2000;
CORE.EVENT_LOG_MESSAGE = "log_message";
CORE.asyncWhen = function(whenFn, execFn, timeout, timesLeft) {
   timeout = timeout || 500;
   timesLeft = timesLeft || 20;
   if (timesLeft === 0) {
      throw "this asychronous event never happened\n" + whenFn.toString();
   }
   if (whenFn()) {
      execFn();
   } else {
      setTimeout( function() {
         CORE.asyncWhen(whenFn, execFn, timeout, timesLeft - 1);
      }, timeout);
   }
};
CORE.trackEvent = function(category, action, label, value) {
   this.asyncWhen( function() {
      return CORE.pageTracker !== undefined;
   }, function() {
      CORE.pageTracker._trackEvent(category, action, label, value);
   }, 1000);
};
CORE.throttle = function(fn, delay) {
   var t = new CORE.Throttle(fn, delay);
   return function() {
      t.execute.apply(t, arguments);
   };
};
CORE.getFunctionName = function getFunctionName(fn) {
   var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
   return m ? m[1] : "";
};
CORE.removeElementFromArray = function(array, element) {
   var ii = 0;
   for (; ii < array.length; ii += 1) {
      if (array[ii] == element) {
         break;
      }
   }
   array.splice(ii, 1);
};
CORE.convertJsonListToObject = function(list, ObjectConstructor) {
   var retList = [];
   for ( var i = 0; i < list.length; i++) {
      retList.push(new ObjectConstructor(list[i]));
   }
   return retList;
};
CORE.logToBase = function(x, base) {
   // Created 1997 by Brian Risk. http://members.aol.com/brianrisk
   return (Math.log(x)) / (Math.log(base));
};
CORE.handleErrorAsError = function handleError(msg, url, l) {
   console.error("ERROR", msg, url, l);
   CORE.logError( {
      msg : msg,
      url : url,
      lineNumber : l
   });
   return false;
};
CORE.handleErrorAsWarning = function handleError(msg, url, l) {
   console.warn("ERROR", msg, url, l);
   CORE.logError( {
      msg : msg,
      url : url,
      lineNumber : l
   });
   return true;
};
CORE.logError = function(error) {
   $.post("/data/errorLog/", error);
};
CORE.messageTemplate='<div class="msg">{msg}</div>';
CORE.displayMessage = function(msg, timeout) {
   timeout = timeout || 10000;
   var msgDiv = $(CORE.messageTemplate.supplant({msg:msg})).hide();
   var close=function(){
      msgDiv.slideUp("normal", function() {
         msgDiv.remove();
      });
   };
   $("#messages").append(msgDiv);
   msgDiv.slideDown("normal").click(close);
   setTimeout(close, timeout);
};

CORE.sizeProcesses = function sp() {
   var size;
   for (var i=0;i<CORE.environment._currentProcesses.length;i++){
      size=CORE.sizeInMemory(CORE.environment._currentProcesses[i]);
      if (size>2000) {
         $.debug(i,size,CORE.environment._currentProcesses[i]);
      }
   }   
}

CORE.sizeInMemory = function(obj) {
   var alreadySeenObjects=[]
   function sim (obj, recurseLevel) {
      var size = 0;
      if (alreadySeenObjects.indexOf(obj) > -1 || recurseLevel > 8) {
         return 0;
      }
      if (obj === null || obj === undefined) {
         return 1; //assume 1 byte. I am sure that this is wrong.
      } else if ($.isArray(obj)) {
         alreadySeenObjects.push(obj);
         for (var i=0;i < obj.length;i++) {
            size += sim(obj[i], recurseLevel+1);
         }
      } else if ($.isPlainObject(obj) || (obj.constructor!== undefined && ["Process","Thread","Species"].indexOf(obj.constructor.name) != -1)) { //keep the jquery objects out
         alreadySeenObjects.push(obj);
         for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                size += sim(obj[i],recurseLevel+1);
            }
         }
      } else if (typeof obj == "object") {
         return 1; //completely wrong
      } else if (typeof obj == "string") {
         return obj.length; //assume each char is one byte
      } else if (typeof obj == "number") {
         return 4; //assume 32 bit
      } else if (typeof obj == "boolean") {
         return 1; //assume 1 byte
      } else if (typeof obj == "function") {
         return 1; //assume 1 byte. I am sure that this is wrong.
      } else {
         //$.debug("not one of the expected types",obj.toString(), typeof obj, obj.context);
         return 0;
      }
      return size;
   }
   return sim(obj,0);
}

$.ajaxSetup( {
   cache : false
});
$("#loadingMessage").ajaxStart( function(e) {
   $(this).show();
}).ajaxStop( function(e) {
   $(this).hide();
});
$("#ajaxErrorMessage").ajaxError( function(e) {
   var self = this;
   $(self).stop(true, true).fadeIn(500);
   setTimeout(function(){
      $(self).stop(true, true).fadeOut(500);
   },5000);
});

CORE.Throttle = function(fn, delay) {
      this.fn = fn;
      this.delay = delay || 50; /* milliseconds - vary as desired */
      this.executionTimer = null;
   };
CORE.Throttle.prototype.execute = function() {
      if (this.executionTimer) {
         clearTimeout(this.executionTimer);
      }
      var args = arguments;
      var fn = this.fn;
      this.executionTimer = setTimeout( function() {
         fn.apply(null, args);
      }, this.delay);
   };

if (typeof Object.create !== 'function') {
   Object.create = function(o) {
      function F() {
      }
      F.prototype = o;
      return new F();
   };
}

Function.prototype.curry = function() {
   var args = Array.prototype.slice.call(arguments);
   var fn = this;
   return function() {
      var innerArgs = Array.prototype.slice.call(arguments);
      var finalArgs = args.concat(innerArgs);
      return fn.apply(null, finalArgs);
   };
};

//From http://javascript.crockford.com/
String.prototype.supplant = function(o) {
   if (o=== null) {
      $.debug("o is null", this);
   }
   return this.replace(/\{([^\{\}]*)\}/g, function(a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
   });
};
