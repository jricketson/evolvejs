CORE.speciesList = function () {
   return {
      initialise: function() {
         CORE.util.getUserProfile();
         /*$(window).scroll(function(e){
            $('div.box').each(function(){
               $(this).css({position:'absolute','top':$(document).scrollTop()});
            });
            $.dropManage();
         });*/
         this._windowResized();
         $(window).resize($.proxy(this._windowResized, this));

         $('div.box').each(function(){
            var pos = $(this).position();
            $(this).css('left',pos.left);
         });
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
               CORE.speciesList._displayCode(species[0], target);
            });
            $(event.dragProxy).fadeOut().remove();
         });
         $('div.dropTarget.ancestry').bind('drop',function(event){
            $(this).find(".display").empty();
            CORE.data.getSingleSpecies($(event.dragProxy).attr("data-key"), $.proxy(CORE.speciesList._displayAncestorCallback,CORE.speciesList));
            $(event.dragProxy).fadeOut().remove();
         });
      },
      _windowResized: function() {
         $("#layoutCenter").height(
               ($("#viewport").innerHeight() - $("#layoutTop").outerHeight() - 21) + "px");
         $("#speciesList").height(($("#layoutCenter").innerHeight()-20) + "px");
         $("#boxContainer").height(($("#layoutCenter").innerHeight()-20) + "px");
      },
      _documentScrolled: function(e) {
         $.debug(e);
         $('div.dropTarget').css('top',$(document).scrollTop());
      },
      _displayAncestorCallback : function(species){
         var speciesDiv = $(this._generateSpecieDiv(species[0]));
         $('div.dropTarget.ancestry .display').prepend(speciesDiv);
         if ($('div.dropTarget.ancestry .display .ancestor').length ===1) {
            speciesDiv.addClass("thisSpecies");
            $('div.dropTarget.ancestry .display').append("<hr /><div>First generation children</div>");
            CORE.speciesList.displayChildren(species[0]);
         }
         CORE.speciesList._makeDraggable(speciesDiv);
         CORE.speciesList.displayAncestor(species[0]);
      },
      _ancestorTemplate:"<div class='ancestor species' data-key='{pk}'>{name} ({scoreList})</div><div class='divider' />",
      _generateSpecieDiv:function(specie) {
         return this._ancestorTemplate.supplant({pk:specie.pk,name:specie.fields.uniqueName,scoreList:specie.fields.scoreList.slice(-5).toString()});         
      },
      _displayChildrenCallback : function(species){
         for (var i = 0;i<species.length;i++) {
            var speciesDiv = $(this._generateSpecieDiv(species[i]));
            $('div.dropTarget.ancestry .display').append(speciesDiv);
            speciesDiv.addClass("child");
            CORE.speciesList._makeDraggable(speciesDiv);
         }
      },
      _makeDraggable: function(element) {
         $(element).bind('dragstart',function(event){
            var proxy = $("<div class='dragging' />");
            proxy.appendTo($("body"))
                  .attr("data-key",$(this).attr("data-key"))
                  .css({top:event.clientY+$(document).scrollTop(),left:event.clientX+$(document).scrollLeft()});
            return proxy;
         }).bind('drag',function(event){
            $(event.dragProxy).css({top:event.clientY+$(document).scrollTop(),left:event.clientX+$(document).scrollLeft()});
         }).bind('dragend',function(event){
            $(event.dragProxy).fadeOut().remove();
         });
      },
      _displayCode: function(specie, target){
         var codeArray = CORE.assembler.convertStringToCode(specie.fields.code);
         $(target).find(".display")
            .html(CORE.assembler.makeDisplayableHtml(codeArray))
            .attr("data-codeText",CORE.assembler.makeDisplayableText(codeArray))
            .prepend($(this._generateSpecieDiv(specie)).addClass("thisSpecies"));
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
      displayAncestor: function(species) {
         if (species.fields.parentRef !== null) {
            CORE.data.getSingleSpecies(species.fields.parentRef, $.proxy(CORE.speciesList._displayAncestorCallback,CORE.speciesList));
         }
      },
      displayChildren: function(species) {
         CORE.data.getChildrenOfSpecies(species.pk, $.proxy(CORE.speciesList._displayChildrenCallback,CORE.speciesList));
      }
   };
}();


jQuery(document).ready($.proxy(CORE.speciesList.initialise,CORE.speciesList));
