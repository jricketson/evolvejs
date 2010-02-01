CORE.speciesList = function () {

   return {
      initialise: function() {
         $("tr.species").click(CORE.speciesList.displaySpeciesDetail);
         $('.species').bind('dragstart',function(event){
            return $(this).clone()
                        .appendTo(this.parentNode)
                        .css({position:"absolute",opacity:0.5,top:event.offsetY,left:event.offsetX});
         }).bind('drag',function(event){
            $(event.dragProxy).css({top:event.offsetY,left:event.offsetX});
         }).bind('dragend',function(event){
            $(event.dragProxy).fadeOut().remove();
         });
         $('div.dropTarget').bind('dropstart',function(){
            $(this).addClass('active');
         }).bind('drop',function(event){
            if ($(this).hasClass("code")) {
               var target= this;
               CORE.data.getSingleSpecies($(event.dragProxy).attr("data-key"), function(species){
                  CORE.speciesList.displayCode(species[0].fields.code, target);
               });
               
            }
         }).bind('dropend',function(event){
            $(this).removeClass('active');
         });
      },
      displaySpeciesDetail: function(){
         CORE.data.getSingleSpecies($(this).attr("data-key"), function(species){
            CORE.speciesList.displayCode(species[0].fields.code);
            $("#ancestry").empty().html("<div class='thisSpecies species'>{name}</div>".supplant({name:species[0].fields.name}));
            CORE.speciesList.displayAncestor(species[0]);
         });
      },
      displayCode: function(code, target){
         var codeArray = CORE.data.convertStringToCode(code);
         $(target).find(".display").html(CORE.assembler.makeDisplayableHtml(codeArray));
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
