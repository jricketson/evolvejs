
EVO.extend("dataAccess", function () {
   
   var EIGHT_BIT_MASK=511;
  
   
   return {
      SPECIES_SAVE_URL: "species/create",
      SPECIES_LIST_URL: "species/list",
      saveSpecies: function(species) {
         var postData={"species[code]":EVO.dataAccess.convertCodeToString(species.memory),
                       "species[name]":species.id,
                       "species[generations]":species.count};
         jQuery.post(EVO.dataAccess.SPECIES_SAVE_URL, postData);
      },
      getPopulationAsData: function(count, callback) {
         jQuery.getJSON(EVO.dataAccess.SPECIES_LIST_URL,{count:count}, callback);
      },
      getPopulation: function(count, callback) {
         jQuery.getJSON(EVO.dataAccess.SPECIES_LIST_URL,{count:count}, function(json) {
            //construct a process from each species
            var population=[];
            for (var ii=0;ii<json.population.length;ii+=1) {
               population.push(new EVO.Process(EVO.dataAccess.convertStringToCode(json.population[ii].attributes.code)));
            }
            callback(population);
         });
      },
      convertStringToCode: function(codeString) {
         var codeStringArray = codeString.split(",");
         var codeArray=[];
         var operation;
         for (var ii=0; ii<codeStringArray.length; ii+=1) {
            operation=[codeStringArray[ii] >> 24, codeStringArray[ii] & EIGHT_BIT_MASK];
            codeArray.push(operation);
         }
         return codeArray;
      },
      /*
         This converts the array of [operator, operand] pairs to a string of 32bit integers. 
         The operator is shifted left 24 bits and the operand is added. 
         All the integers are then concatenated into a comma delimited string.
      */
      convertCodeToString: function(codeArray) {
         var codeString="";
         var operation;
         for (var ii=0; ii<codeArray.length; ii+=1) {
            if (codeString !== "") {
               codeString+=",";
            }
            operation=(codeArray[ii][0] << 24) + codeArray[ii][1];
            codeString += operation; 
         }
         return codeString;
      }
      
   };
}());