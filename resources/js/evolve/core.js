// if no firebug installed
if (!window.console) {
   var console = {
      log : function() {
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
      msgDiv.slideUp("normal");
      msgDiv.remove();
   };
   $("#messages").append(msgDiv);
   msgDiv.slideDown("normal").click(close);
   setTimeout(close, timeout);
};
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
