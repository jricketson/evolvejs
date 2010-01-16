CORE.speciesList = function () {

   return {
      initialise: function() {
         $("tr.species").click(function(){
            CORE.data.getSingleSpecies($(this).attr("data-key"), function(species){
               CORE.speciesList.displayCode(species[0].fields.code);
            });
         });
      },
      displayCode: function(code){
         var codeArray = CORE.data.convertStringToCode(code);
         jQuery('#speciesCode').html(CORE.assembler.makeDisplayableHtml(codeArray));
      }
      
   };
}();


jQuery(document).ready(CORE.speciesList.initialise);
