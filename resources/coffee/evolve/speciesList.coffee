class SpeciesList
  constructor: ->
    CORE.util.getUserProfile()
    
    #$(window).scroll(function(e){
    #            $('div.box').each(function(){
    #               $(this).css({position:'absolute','top':$(document).scrollTop()});
    #            });
    #            $.dropManage();
    #         });
    @_windowResized()
    $(window).resize $.proxy(@_windowResized, this)
    $("div.box").each ->
      pos = $(this).position()
      $(this).css "left", pos.left

    CORE.speciesList._makeDraggable $(".species")
    $("div.dropTarget").bind("dropstart", ->
      $(this).addClass "active"
    ).bind "dropend", (event) ->
      $(this).removeClass "active"

    $("div.dropTarget.code").bind "drop", (event) ->
      target = this
      $(target).find(".display").empty()
      CORE.data.getSingleSpecies $(event.dragProxy).attr("data-key"), (species) ->
        CORE.speciesList._displayCode species[0], target

      $(event.dragProxy).fadeOut().remove()

    $("div.dropTarget.ancestry").bind "drop", (event) ->
      $(this).find(".display").empty()
      CORE.data.getSingleSpecies $(event.dragProxy).attr("data-key"), $.proxy(CORE.speciesList._displayAncestorCallback, CORE.speciesList)
      $(event.dragProxy).fadeOut().remove()

  _windowResized: ->
    $("#layoutCenter").height ($("#viewport").innerHeight() - $("#layoutTop").outerHeight() - 21) + "px"
    $("#speciesList").height ($("#layoutCenter").innerHeight() - 20) + "px"
    $("#boxContainer").height ($("#layoutCenter").innerHeight() - 20) + "px"

  _documentScrolled: (e) ->
    $.debug e
    $("div.dropTarget").css "top", $(document).scrollTop()

  _displayAncestorCallback: (species) ->
    speciesDiv = $(@_generateSpecieDiv(species[0]))
    $("div.dropTarget.ancestry .display").prepend speciesDiv
    if $("div.dropTarget.ancestry .display .ancestor").length is 1
      speciesDiv.addClass "thisSpecies"
      $("div.dropTarget.ancestry .display").append "<hr /><div>First generation children</div>"
      CORE.speciesList.displayChildren species[0]
    CORE.speciesList._makeDraggable speciesDiv
    CORE.speciesList.displayAncestor species[0]

  _ancestorTemplate: "<div class='ancestor species' data-key='{pk}'>{name} ({scoreList})</div><div class='divider' />"
  _generateSpecieDiv: (specie) ->
    @_ancestorTemplate.supplant
      pk: specie.pk
      name: specie.fields.uniqueName
      scoreList: specie.fields.scoreList.slice(-5).toString()

  _displayChildrenCallback: (species) ->
    for specie in species
      speciesDiv = $(@_generateSpecieDiv(specie))
      $("div.dropTarget.ancestry .display").append speciesDiv
      speciesDiv.addClass "child"
      CORE.speciesList._makeDraggable speciesDiv

  _makeDraggable: (element) ->
    $(element).bind("dragstart", (event) ->
      proxy = $("<div class='dragging' />")
      proxy.appendTo($("body")).attr("data-key", $(this).attr("data-key")).css
        top: event.clientY + $(document).scrollTop()
        left: event.clientX + $(document).scrollLeft()
      proxy
    ).bind("drag", (event) ->
      $(event.dragProxy).css
        top: event.clientY + $(document).scrollTop()
        left: event.clientX + $(document).scrollLeft()
    ).bind "dragend", (event) ->
      $(event.dragProxy).fadeOut().remove()

  _displayCode: (specie, target) ->
    codeArray = CORE.assembler.convertStringToCode(specie.fields.code)
    $(target).find(".display")
      .html(CORE.assembler.makeDisplayableHtml(codeArray))
      .attr("data-codeText", CORE.assembler.makeDisplayableText(codeArray))
      .prepend($(@_generateSpecieDiv(specie)))
      .addClass("thisSpecies")
    CORE.speciesList._displayDiffIfTwoCodesAreDisplayed()

  _displayDiffIfTwoCodesAreDisplayed: ->
    diff = new diff_match_patch()
    code1 = $("#code1").attr("data-codeText")
    code2 = $("#code2").attr("data-codeText")
    if code1? and code2?
      diffs = diff.diff_main(code1, code2)
      diff.diff_cleanupSemantic diffs
      $(".differences .display").html diff.diff_prettyHtml(diffs)

  displayAncestor: (species) ->
    CORE.data.getSingleSpecies species.fields.parentRef, $.proxy(CORE.speciesList._displayAncestorCallback, CORE.speciesList)  if species.fields.parentRef isnt null

  displayChildren: (species) ->
    CORE.data.getChildrenOfSpecies species.pk, $.proxy(CORE.speciesList._displayChildrenCallback, CORE.speciesList)

CORE.speciesList = -> @_speciesList ||= new SpeciesList()

jQuery(document).ready -> CORE.speciesList()
