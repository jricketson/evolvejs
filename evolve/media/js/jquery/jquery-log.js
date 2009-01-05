jQuery.isDebug = true;
jQuery.debug = function() {
   if (jQuery.isDebug) {
      var caller = jQuery.debug.caller;
      var args = Array.prototype.slice.call(arguments);
      if (jQuery.debug.caller != null) {
         var str;
         if (caller.name.length !== 0) {
            str = caller.name;
         } else {
            str = caller.toString();
         }
         args.unshift("(" + str + ") ");
      }
      console.debug.apply(this, args);
   }
};

jQuery.fn.log = function(msg) {
   console.log("%s: %o", msg, this);
   return this;
};

// if no firebug installed
if (!window.console || !console.firebug) {
   var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group",
         "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

   window.console = {};
   for (var i = 0; i < names.length; ++i) {
      window.console[names[i]] = function() {
      };
   }
}