//Load this before all javascript files to monitor things that are being added to the page

if (!console) {
   console={log:function(){}};
}

var TEST= function() {
   function removeItems (list, itemsToRemove) {
      var j;
      for (var i = 0; i < itemsToRemove.length; i+=1) {
         j = 0;
         while (j < list.length) {
            if (list[j] == itemsToRemove[i]) {
               list.splice(j, 1);
            } else {
               j+=1;
            }
         }
      }
      return list;
   }
   
   return {
      allowedProps : ["__scope__", "constructor", "EVO", "$", "jQuery", "onerror", "YAHOO"],
      props : [],
      getCurrentProps : function() {
         var result=[];
         for (var obj in window) {
            result.push(obj);
         }
         return result;
      },
      checkCurrentPropsAgainstList : function(list) {
         var currentList = TEST.getCurrentProps();
         currentList = removeItems(currentList,list);
         currentList = removeItems(currentList,TEST.allowedProps);
         return currentList;
      }
   };
   
}();

TEST.props = TEST.getCurrentProps();