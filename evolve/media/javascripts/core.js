//*****************************************
//This defines the global namespace to be used by the entire application
//NO VARIABLES OR FUNCTIONS SHOULD BE DEFINED IN THE GLOBAL namespace
//This can be done via the standard 'module extension' method ie: 
//EVO.extend(function () {
//   var privateVariable = "somePrivateValue";
//   function somePrivateFunction() {}  
//   return {
//      put functions and constants here
//      examplePublicVariable: "someStringValue",
//      examplePublicFn1: function(arg1, arg2){
//      },
//      examplePublicFn2: function(arg1, arg2){
//      }
//   };
//}());
//The private variables and functions here are accessible throughout the module, but from nowhere else.
//
//Or via:
// EVO.examplePublicFn1 = function(arg1, arg2) {};
// EVO.examplePublicVariable = "someStringValue";
//
 
//*****************************************
/*extern jQuery, YAHOO, dwr, document */

var EVO=function () {
   //*****************************************
   //these are PRIVATE functions and variables
   //*****************************************
   var coreName = "EVO";
   
   
   //*****************************************
   //these are Lifecycle Events
   //*****************************************
   
   //this triggers the purging of all event handlers in the dom on document unload.
   //this is to overcome memory management issues in IE
   jQuery(document).ready(function(){
      jQuery(document).unload(function(){EVO.purge(document);});
   });
   //*****************************************
   //these are PUBLIC functions and variables
   //*****************************************
   return {
      /*
       *extends the specified namespace (or the base namespace if none specified) with new functions and variables
       * @param namespacename (optional)
       * @param extendWith, object to extend named namespace with
       */
      extend: function() {
         var namespaceName = (arguments.length>1 ? arguments[0] : null);
         var extendWith = (arguments.length>1 ? arguments[1] : arguments[0]);
         var target = this.namespace(namespaceName);
         for ( var i in extendWith ) 
         {
            if (extendWith.hasOwnProperty(i)) 
            {
               target[i] = extendWith[i];
            }
         }
         // Return the modified object
         return this;
      },

      /**
       * This is copied and slightly modified from the yahoo's YUI development library
       * 
       * Returns the namespace specified and creates it if it doesn't exist
       * <pre>
       * XYZ.namespace("property.package");
       * XYZ.namespace("TDS.property.package");
       * </pre>
       * Either of the above would create TDS.property, then
       * XYZ.property.package
       *
       * Be careful when naming packages. Reserved words may work in some browsers
       * and not others. For instance, the following will fail in Safari:
       * <pre>
       * XYZ.namespace("really.long.nested.namespace");
       * </pre>
       * This fails because "long" is a future reserved word in ECMAScript
       *
       * @method namespace
       * @static
       * @param  {String*} arguments 1-n namespaces to create 
       * @return {Object}  A reference to the last namespace object created
       */
      namespace: function() {
         var a=arguments, o=null;
         var i, j;
         var path;
         if (a[0] === null) {return window[coreName];}
         for (i=0; i<a.length; i=i+1) {
            path=a[i].split(".");
            o=window[coreName];
    
            // root namespace is implied, so it is ignored if it is included
            for (j=(path[0] == coreName) ? 1 : 0; j<path.length; j=j+1) {
               o[path[j]]=o[path[j]] || {};
               o=o[path[j]];
            }
         }
         return o;
      },
      /**
       * This is to fix memory leaks in IE, 
       * this should be run on any elements that are being removed from the DOM
       * and I think should also be run on unload. 
       */
      purge: function (element) {
         var attribs = element.attributes, i, l, n;
         if (attribs) {
            l = attribs.length;
            for (i = 0; i < l; i += 1) {
               n = attribs[i].name;
               if (typeof element[n] === 'function') {
                  element[n] = null;
               }
            }
         }
         var children = element.childNodes;
         if (children) {
            l = children.length;
            for (i = 0; i < l; i += 1) {
               this.purge(children[i]);
            }
         }
      },
      
      getFunctionName: function(fn) {
        var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
        return m ? m[1] : "";
      },
      
      removeElementFromArray: function(array, element) {
         var ii=0;
         for (;ii<array.length;ii+=1) {
            if (array[ii]==element) {
               break;
            }
         }
         array.splice(ii,1);
      },
      
      logToBase: function(x,base) {
         // Created 1997 by Brian Risk.  http://members.aol.com/brianrisk
         return (Math.log(x))/(Math.log(base));
      }
   };
}();
