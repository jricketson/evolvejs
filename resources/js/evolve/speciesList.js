CORE.speciesList = function () {

   return {
      initialise: function() {
         $("tr.species").click(CORE.speciesList.displaySpeciesDetail);
      },
      displaySpeciesDetail: function(){
         CORE.data.getSingleSpecies($(this).attr("data-key"), function(species){
            CORE.speciesList.displayCode(species[0].fields.code);
            $("#ancestry").empty().html("<div class='thisSpecies species'>{name}</div>".supplant({name:species[0].fields.name}));
            CORE.speciesList.displayAncestor(species[0]);
         });
      },
      displayCode: function(code){
         var codeArray = CORE.data.convertStringToCode(code);
         jQuery('#speciesCode').html(CORE.assembler.makeDisplayableHtml(codeArray));
      },
      ancestorTemplate:"<div class='ancestor species' data-key='{pk}'>{name}</div><div class='divider'></div>",
      displayAncestor: function(species) {
         if (species.fields.parentRef !== null) {
            CORE.data.getSingleSpecies(species.fields.parentRef, function(parent){
               $("#ancestry").prepend(CORE.speciesList.ancestorTemplate.supplant({pk:parent[0].pk,name:parent[0].fields.name}));
               CORE.speciesList.displayAncestor(parent[0]);
            });
         }
      }
   };
}();


jQuery(document).ready(CORE.speciesList.initialise);
