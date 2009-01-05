/* global CORE */
(function($) {
   var fragments = {};
   var CHECK_FOR_RESOURCE_LOAD_TIMEOUT = 200;
   var CHECK_FOR_RESOURCE_LOAD_MAX_TIMES = 20;

   function loadResources(listOfResources, callback) {
      var unloadedResources = [],i;
      for (i = 0; i < listOfResources.length; i += 1) {
         var gotten = $.includedResources[listOfResources[i].url];
         if (gotten === undefined || gotten === false) {
            unloadedResources.push(listOfResources[i]);
         }
      }
      if (unloadedResources.length === 0) {
         callback();
         return;
      }
      if ($.isDebug) {
         var logLine = "";
         for (i = 0; i < unloadedResources.length; i += 1) {
           logLine += unloadedResources[i].url + ", ";
         }
      }
      var resource = unloadedResources.shift();
      if (resource.type == 'js') {
         includeResource(resource.url, resource.type, function() {
            loadResources(unloadedResources, callback);
         });
      } else if (resource.type == 'css') {
         includeResource(resource.url, resource.type, function() {
            loadResources(unloadedResources, callback);
         });
      }
   }
   function createScriptElement(url, onload) {
      var element = document.createElement('script');
      element.type = 'text/javascript';
      element.onload = onload;
      var localurl = url;
      if ($.isDebug) {
         // localurl = url+"?"+Math.round(Math.random()*1000000);
      }
      element.src = localurl;
      document.getElementsByTagName('head')[0].appendChild(element);
   }

   function createCssElement(url, onload) {
      var element = document.createElement('link');
      element.rel = 'stylesheet';
      element.type = 'text/css';
      var localurl = url;
      if (CORE.isDebug) {
         // localurl = url+"?"+Math.round(Math.random()*1000000);
      }
      element.href = localurl;
      document.getElementsByTagName('head')[0].appendChild(element);
      onload();
   }

   $.includedResources = {};
   $.includeTimer = null;

   function waitForResourceToLoad(url, callback, maxTimes) {
      if ($.includedResources[url] === true || maxTimes ===0) {
         // no lifecyle methods if it has already been loaded
         callback();
         return true;
      } else if ($.includedResources[url] === false) {
         setTimeout(function() {
            waitForResourceToLoad(url, callback, maxTimes -1);
         }, CHECK_FOR_RESOURCE_LOAD_TIMEOUT);
         return true;
      }
      return false;
   }
   
   function includeResource(url, type, callback) {
      if (waitForResourceToLoad(url, callback, CHECK_FOR_RESOURCE_LOAD_MAX_TIMES)) {
         return;
      }

      $.isReady = false;
      $.readyList = $.readyList || [];

      if (type == 'js') {
         var onload = function() {
            $.debug("loaded: " + url);
            $.includedResources[url] = true;
         };
         createScriptElement(url, onload);
         $.includedResources[url] = false;
      } else if (type == 'css') {
         createCssElement(url, callback);
         $.includedResources[url] = true;
      }
   }

   function waitForHtmlToLoad(url, maxTimes, settings, callback) {
      if (fragments[url] === undefined) {
         $.debug("not loaded " + url);
		 if (settings.cache) {
		    fragments[url] = false;
		 }
		 $.get(url, function(data) {
		    if (settings.cache) {
		       fragments[url] = data;
		    }
		    callback(data);
		 });
      } else if (fragments[url] === false && maxTimes > 0) {
         setTimeout(function() {
            waitForHtmlToLoad(url, maxTimes -1, settings, callback);
         }, CHECK_FOR_RESOURCE_LOAD_TIMEOUT);
      } else {
         callback(fragments[url]);
      }
   }

   /*
    * retrieves a html fragment and it's calculated dependencies and calls a callback on completion
    * with the fragment as first argument
    * 
    * @arg path: path to a html source @arg callback: function pointer
    */
   $.dependsOnHtml = function(path, callback, settings) {
      settings = $.extend({
         cache : true
      }, settings);
      if (typeof callback != 'function') {
         callback = function() {
         };
      }
      waitForHtmlToLoad(path, CHECK_FOR_RESOURCE_LOAD_MAX_TIMES, settings, function(data) {
           callback(data);
      });
   };
   /*
    * retrieves a list of dependencies and calls the callback on completion
    * 
    * @arg dependencies: a list of paths @arg callback: function pointer
    */
   $.dependsOnScripts = function(paths, callback) {
      if (typeof callback != 'function') {
         callback = function() {
         };
      }
      var dependencies = [];
      for (var ii = 0; ii < paths.length; ii += 1) {
         dependencies.push({
            type : "js",
            url : paths[ii]
         });
      }
      loadResources(dependencies, callback);
   };
   
}(jQuery));
