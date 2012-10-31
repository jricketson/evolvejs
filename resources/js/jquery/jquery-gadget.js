/*
 * The structure of a gadget can follow the following format:
 * (function() {
 *  $.gadget.register("gadgetName", {
 *     templatePath : path to html file, or
 *     templateString : html template string,
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
      console.info("Registering Gadget '" + gadgetId);
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
   
   $.gadget={register:registerGadget, bind:bind, destroy:destroyGadget};

   /*-------PRIVATE METHODS ------ */

   function destroyGadget(gadget) {
      for (var i=0;i<gadget.boundEvents.length;i++) {
         var e = gadget.boundEvents[i];
         $(e.element).unbind(e.type, e.fn);
      }
   }
   
   function bind(gadget, element, event, callback) {
      $(element).bind(event, callback);
      gadget.boundEvents.push({type:event,fn:callback, element:element});
   }
   
   function loadHtml(gadgetId, gadget, settings, options, element, callback) {
     getTemplate(gadgetId, gadget, settings.cache, function(template) {
        var newElement = insertIntoDom(template, $.extend({},settings.data,{referenceData:gadget.referenceData, options: options}), settings.method, element, settings.wrapInDiv);
        gadget.element = $(newElement);
        gadget.element[0].gadget=gadget;
        gadget.data = settings.data;
        console.info("initialise gadget " + gadgetId);
        gadget.initialiseGadget(options);
        callback(gadget);
     });
   }
   
   function processTemplate(gadgetId, callback, fragment) {
      var template;
      if (window.dojox !== undefined && dojox.dtl !== undefined && dojox.dtl.Template !== undefined ) {
         template = new dojox.dtl.Template(fragment);
      } else {
         template = fragment;
      }
      templates[gadgetId] = template;
      callback(template);
    }
   
   function getTemplate(gadgetId, gadget, cache, callback) {
      if (templates[gadgetId] === undefined) {
    	 if (gadget.templatePath) {
	         $.dependsOnHtml(gadget.templatePath, processTemplate.curry(gadgetId, callback), {
	            cache : cache
	         });
    	 } else if (gadget.templateString) {
    		 processTemplate(gadgetId, callback, gadget.templateString);
    	 } else {
	        console.error("no template found for gadget:" + gadgetId);
    	 }
      } else {
         callback(templates[gadgetId]);
      }
   }
   
   function insertIntoDom(template, data, method, element, wrapInDiv) {
      var domElement, html;
      if (window.dojox !== undefined && dojox.dtl !== undefined && dojox.dtl.Template !== undefined ) {
      html = template.render(new dojox.dtl.Context($.extend({MEDIA_URL:CORE.mediaUrl},data)));
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
