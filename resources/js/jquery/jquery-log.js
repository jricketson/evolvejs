jQuery.isDebug = true;
jQuery.debug = function() {
   if (jQuery.isDebug) {
      var caller = jQuery.debug.caller;
      var args = Array.prototype.slice.call(arguments);
      if (jQuery.debug.caller != null) {
         var callerStr;
         if (caller.name && caller.name.length !== 0) {
            callerStr = caller.name;
         } else {
            callerStr = caller.toString().slice(0,100)+"...";
         }
         args.unshift("(" + callerStr + ") ");
      }
      console.debug.apply(console, args);
   }
};

jQuery.fn.log = function(msg) {
   console.log("%s: %o", msg, this);
   return this;
};

