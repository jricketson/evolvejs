CORE.data = function() {
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
      saveSpecies : function saveSpecies(species) {
         var postData = {
            "code" : CORE.assembler.convertCodeToString(species.code),
            "name" : species.name,
            "count" : species.count-species.sentCount
         };
         if (species.getParent()!==null) {
            postData.parentRef= species.getParent().pk;
         }
         $.post(this.SPECIES_URL, postData, function saveSpeciesCallback(data){
            species.pk=data[0].pk;
         });
      },
      putScore : function(species,score,callback) {
         $.get(this.SPECIES_URL + "addScore/" + species.pk+"/?score="+score, callback);
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
      }

   };
}();
