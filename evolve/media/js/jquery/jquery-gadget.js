/*
 * The structure of a gadget can follow the following format:
 * (function() {
 *  $.gadget.register("gadgetName", {
 *     events:{GADGET_SELECTED : "gadgetname_selected"},
 *     defaultSettings : {},
 *     initialiseGadget : function() {},
 *     destroy : function(){$.gadget.destroy(this);}
 */

(function($) {
   var templates = {};
   /**
    * @arg gadgetId: the gadget to load
    * @arg callback: callback called for each gadget created
    * @arg settings: settings that control the way that the gadget is created and managed
    * @arg options: passed to the initialiseGadget method
    */
   $.fn.createGadget = function(gadgetId, callback, settings, options) {
      var gadgetPrototype=$.gadget[gadgetId];
      if(!gadgetPrototype) {
         console.error("Error: No gadget registered as '" + gadgetId + "'");
         return;
      }
      settings = $.extend({
         cache : true,
         method : "html",
         path : "/fragments/" + gadgetId + "/" + gadgetId + ".html",
         data : {},
         queryParameters : {},
         wrapInDiv: false
      }, gadgetPrototype.defaultSettings, settings);
      if (typeof callback != 'function') {
         callback = function() {
         };
      }

      var matchedElements = this;
      matchedElements.each(function() {
         var element = $(this);
 	     var gadget = Object.create(gadgetPrototype);
         
         gadget.boundEvents=[];
         gadget.reload = function(callback) {
            loadHtml(gadgetId, gadget, settings, options, element, callback);
         };
         gadget.reload(callback);
      });
   };

   var registerGadget = function(gadgetId, object) {
      var gadget = $.extend({
         dependsOn : [],
         defaultSettings : {},
         events:{},
         referenceData:{},
         initialiseGadget : function() {}
      }, object);
      $.gadget[gadgetId] = gadget;
      console.info("Registered Gadget '" + gadgetId);
      return gadget;
   };
   
   $.gadget={register:registerGadget, bind:bindToDocument, destroy:destroyGadget};

   /*-------PRIVATE METHODS ------ */

   function destroyGadget(gadget, callback) {
      for (var i=0;i<gadget.boundEvents.length;i++) {
         var e = gadget.boundEvents[i];
         $(document).unbind(e.type, e.fn);
      }
      gadget.element.slideUp("fast", function() {
         if (callback) {
            callback();
         }
        gadget.element.remove();
      });
   }
   
   function bindToDocument(gadget, event, callback) {
      $(document).bind(event, callback);
      gadget.boundEvents.push({type:event,fn:callback});
   }
   
   function loadHtml(gadgetId, gadget, settings, options, element, callback) {
     getTemplate(settings.path, settings.cache, function(template) {
        var newElement = insertIntoDom(template, $.extend({},settings.data,{referenceData:gadget.referenceData}), settings.method, element, settings.wrapInDiv);
        gadget.element = $(newElement);
	    gadget.element[0].gadget=gadget;
        gadget.data = settings.data;
        console.info("initialise gadget " + gadgetId);
        gadget.initialiseGadget(options);
        callback(gadget);
     });
   }
   
   function getTemplate(path, cache, callback) {
      if (templates[path] === undefined) {
         $.dependsOnHtml(path, function(fragment) {
            if (window.TrimPath) {
	            var template = TrimPath.parseTemplate(fragment, path);
	            templates[path] = template;
	            callback(template);
            } else {
               callback(fragment);
            }
         }, {
            cache : cache
         });
      } else {
         callback(templates[path]);
      }
   }
   
   function insertIntoDom(template, data, method, element, wrapInDiv) {
      var domElement, html;
      if(template.process) {
         html = template.process(data);
      } else {
         html=template;
      }
      if (wrapInDiv) {
         html="<div>"+html+"</div>";
      }
      domElement = $(html);
      element[method](domElement);
      return domElement;
   }

}(jQuery));
