CORE.speciesList = function () {
   var code1Text="";
   var code2Text="";
   return {
      initialise: function() {
         CORE.speciesList._makeDraggable($('.species'));
         $('div.dropTarget').bind('dropstart',function(){
            $(this).addClass('active');
         }).bind('dropend',function(event){
            $(this).removeClass('active');
         });
         $('div.dropTarget.code').bind('drop',function(event){
            var target= this;
            $(target).find(".display").empty();
            CORE.data.getSingleSpecies($(event.dragProxy).attr("data-key"), function(species){
               CORE.speciesList.displayCode(species[0].fields.code, target);
            });
            $(event.dragProxy).fadeOut().remove();
         });
         $('div.dropTarget.ancestry').bind('drop',function(event){
            var target= this;
            $(target).find(".display").empty();
            CORE.data.getSingleSpecies($(event.dragProxy).attr("data-key"), function(species){
               var speciesDiv = $("<div class='thisSpecies species' data-key='{pk}'>{name}</div>".supplant({name:species[0].fields.name,pk:species[0].pk}));
               $(target).find(".display").append(speciesDiv);
               CORE.speciesList._makeDraggable(speciesDiv);
               CORE.speciesList.displayAncestor(species[0], target);
            });
            $(event.dragProxy).fadeOut().remove();
         });
      },
      _makeDraggable: function(element) {
         $(element).bind('dragstart',function(event){
            var proxy = $("<div class='dragging'>&nbsp;</div>");
            proxy.appendTo($("body"))
                  .attr("data-key",$(this).attr("data-key"))
                  .css({top:event.clientY,left:event.clientX});
            return proxy;
         }).bind('drag',function(event){
            $(event.dragProxy).css({top:event.clientY,left:event.clientX});
         });
      },
      displayCode: function(code, target){
         var codeArray = CORE.data.convertStringToCode(code);
         $(target).find(".display")
            .html(CORE.assembler.makeDisplayableHtml(codeArray))
            .attr("data-codeText",CORE.assembler.makeDisplayableText(codeArray));
         CORE.speciesList._displayDiffIfTwoCodesAreDisplayed();
      },
      _displayDiffIfTwoCodesAreDisplayed: function() {
         var diff = new diff_match_patch();
         var code1=$("#code1").attr("data-codeText");
         var code2=$("#code2").attr("data-codeText");
         if (code1 !== undefined && code2 !== undefined) {
            var diffs = diff.diff_main(code1,code2);
            diff.diff_cleanupSemantic(diffs);
            $(".differences .display").html(diff.diff_prettyHtml(diffs));
         }
      },
      ancestorTemplate:"<div class='ancestor species' data-key='{pk}'>{name}</div><div class='divider'></div>",
      displayAncestor: function(species, target) {
         if (species.fields.parentRef !== null) {
            CORE.data.getSingleSpecies(species.fields.parentRef, function(parent){
               var species = $(CORE.speciesList.ancestorTemplate.supplant({pk:parent[0].pk,name:parent[0].fields.name}));
               $(target).find(".display").prepend(species);
               CORE.speciesList._makeDraggable(species);
               CORE.speciesList.displayAncestor(parent[0], target);
            });
         }
      }
   };
}();


jQuery(document).ready(CORE.speciesList.initialise);
