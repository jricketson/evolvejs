CORE.data = function() {
   var EIGHT_BIT_MASK = 511;
   function stringToDate(key, value) {
      var a;
      if (typeof value === 'string') {
         a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
         if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3]));
         }
      }
      return value;
   }
   return {
      SPECIES_URL : "/data/species/",
      saveSpecies : function(species) {
         var postData = {
            "code" : this.convertCodeToString(species.code),
            "name" : species.name,
            "count" : species.count
         };
         if (species.getParent()!=null) {
            postData.parentRef= species.getParent().pk;
         }
         $.post(this.SPECIES_URL, postData, function(data){
            var speciesFromServer = JSON.parse(data, stringToDate)[0];
            species.pk=speciesFromServer.pk;
         });
      },
      getSingleSpecies : function(id, callback) {
         $.getJSON(this.SPECIES_URL + "id/" + id+"/", callback);

      },
      getSpecies : function(count, callback) {
         $.getJSON(this.SPECIES_URL + "list/0/" + count, callback);

      },
      getUserProfile : function(callback) {
         $.get("/data/user/id/0", function(data) {
                  callback(JSON.parse(data, stringToDate));
               });
      },
      convertStringToCode : function(codeString) {
         var codeStringArray = codeString.split(",");
         var codeArray = [];
         var operation;
         for (var ii = 0; ii < codeStringArray.length; ii += 1) {
            operation = [codeStringArray[ii] >> 24, codeStringArray[ii] & EIGHT_BIT_MASK];
            codeArray.push(operation);
         }
         return codeArray;
      },
      /*
       * This converts the array of [operator, operand] pairs to a string of 32bit integers. The
       * operator is shifted left 24 bits and the operand is added. All the integers are then
       * concatenated into a comma delimited string.
       */
      convertCodeToString : function(codeArray) {
         var codeString = "";
         var operation;
         for (var ii = 0; ii < codeArray.length; ii += 1) {
            if (codeString !== "") {
               codeString += ",";
            }
            operation = (codeArray[ii][0] << 24) + codeArray[ii][1];
            codeString += operation;
         }
         return codeString;
      }

   };
}();
