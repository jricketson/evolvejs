CORE.evolve =
  _processStore: {}
  _speciesDivStore: {}
  _gridDisplay: null
  _timeDelay: 1000 # time to delay between simulation cycles
  _currentlyDisplayedProcess: null
  _markerWidth: 0
  _markerHeight: 0
  _colours: (->
    result=[]
    for red in [0x00..0xFF] by 0x33
      for green in [0x00..0xFF] by 0x33
        for blue in [0x00..0xFF] by 0x33
          result.push "##{red.toString(16).lpad('00')}#{green.toString(16).lpad('00')}#{blue.toString(16).lpad('00')}"
    result
  )()

  _hideTitle: ->
    $("div#ft").animate
      opacity: 0.3
    , "slow"

  initialise: ->
    # hide the title after 10 secs, or the user clicks
    setTimeout @_hideTitle, 10000
    CORE.data.getUserProfile $.proxy((userProfile) ->
      CORE.userProfile = userProfile
      if CORE.userProfile is null
        $("#logoutLink").hide()
        $("#loginLink").show()
        @_showEncourageLogin()
      else
        $("#username").html CORE.userProfile.username
        $("#logoutLink").show()
        $("#loginLink").hide()
    , this)
    $("div#ft").click @_hideTitle
    
    # links for the user to start the simulation. These swap themselves
    $("#play").click ->
      CORE.environment.start()
      $(this).hide()
      $("#pause").show()
      $("#step").hide()
      $("#slow").hide()

    $("#slow").click ->
      CORE.environment.slow()
      $(this).hide()
      $("#pause").show()
      $("#play").hide()
      $("#step").hide()

    $("#step").click ->
      CORE.environment.step()

    $("#pause").click ->
      CORE.environment.stop()
      $(this).hide()
      $("#play").show()
      $("#step").show()
      $("#slow").show()
    
    # initialise the environment
    $("#layoutCenter").createGadget "sidebar", $.proxy(@_sidebarCreatedCallback, this),
      method: "append"

  _showEncourageLogin: ->
    $("div#encourageLogin").show()
    close = ->
      $("div#encourageLogin").hide()

    setTimeout close, 10000
    $("div#encourageLogin button.close").click close
    $("div#encourageLogin button.login").click ->
      location.href = "/account/login/"

  _sidebarCreatedCallback: (gadget) ->
    @sidebar = gadget
    CORE.environment.initialise()
    $(document).bind CORE.environment.EVENT_PROCESS_CREATED, $.proxy(@_processCreateHandler, this)
    $(document).bind CORE.environment.EVENT_PROCESS_MOVED, $.proxy(@_processMoveHandler, this)
    $(document).bind CORE.environment.EVENT_PROCESS_KILLED, $.proxy(@_processKillHandler, this)
    $(document).bind CORE.environment.EVENT_SPECIES_CREATED, $.proxy(@_speciesCreateHandler, this)
    $(document).bind CORE.environment.EVENT_SPECIES_EXTINCT, $.proxy(@_speciesExtinctHandler, this)
    $(document).bind CORE.EVENT_LOG_MESSAGE, @_logMessageHandler
    @_gridDisplay = $("div#gridDisplay").click($.proxy(@_processClickedHandler, this))
    @_speciesList = $(".speciesList").bind("click", $.proxy(@_speciesClickedHandler, this))
    @_calculateMarkerSize()
    $(window).resize $.proxy(@_calculateMarkerSize, this)
    setInterval $.proxy(@updateDisplay, this), @_timeDelay

  _calculateMarkerSize: ->
    $("#layoutCenter").height ($("#viewport").innerHeight() - $("#layoutTop").outerHeight() - 3) + "px"
    @_markerWidth = Math.floor(@_gridDisplay.innerWidth() / CORE.environment.getGridX())
    @_markerHeight = Math.floor(@_gridDisplay.innerHeight() / CORE.environment.getGridY())
    markers = @_gridDisplay.find(".process")

    for marker in markers
      process = @_processStore[marker.id]
      if process?
        $(marker).css
          top: @_markerHeight * process.gridY
          left: @_markerWidth * process.gridX
          height: @_markerHeight - 1
          width: @_markerWidth - 1

  _processCreateHandler: (e, process) ->
    e.stopImmediatePropagation()
    
    # $.debug(e, process.id, process.gridX, process.gridY);
    @_processStore[process.id] = process
    divMarker = $("<div class='process species#{process.species.id}' id='#{process.id}'>&nbsp;</div>")
      .appendTo(@_gridDisplay)
      .css(
        top: @_markerHeight * process.gridY
        left: (@_markerWidth * process.gridX)
        height: @_markerHeight - 1
        width: @_markerWidth - 1
        background: @_speciesDivStore[process.species.id].colour
      )

  _processMoveHandler: (e, process, wrapped) ->
    e.stopImmediatePropagation()
    
    # console.log(e, process.id, process.gridX, process.gridY);
    # this._processDivStore[process.id].stop();
    # removes all current animations
    # todo: change this to .animate to have nice animations
    if wrapped
      @_gridDisplay.find("#" + process.id).stop().css
        top: @_markerHeight * process.gridY
        left: @_markerWidth * process.gridX

    else
      @_gridDisplay.find("#" + process.id).stop().animate
        top: @_markerHeight * process.gridY
        left: @_markerWidth * process.gridX
      , "fast"

  _removeThisElement: -> $(this).remove()

  _processKillHandler: (e, process) ->
    e.stopImmediatePropagation()
    
    # console.log(e);
    processDiv = @_gridDisplay.find("#" + process.id)
    processDiv.fadeOut "normal", @_removeThisElement  if processDiv
    delete @_processStore[process.id]

  _speciesDivTemplate: "<div class=\"species\" id=\"{speciesId}\"><span class=\"id\"></span>" + "<span class=\"totalCount\"></span><span class=\"currentCount\"></span><div style=\"clear:both;\"></div></div>"
  _speciesCreateHandler: (e, species) ->
    
    #$.debug(e, species);
    e.stopImmediatePropagation()
    colour = @_colours.shift()
    contrast = Contrast.match(colour, @_colours)
    divMarker = $(@_speciesDivTemplate.supplant(speciesId: species.id))
      .appendTo(@_speciesList)
      .css(
        background: colour
        color: (if contrast isnt false then contrast[1] else "white")
      )
    @_updateSpeciesDiv divMarker, species
    @_speciesDivStore[species.id] =
      div: divMarker
      species: species
      colour: colour

  _speciesClickedHandler: (e) ->
    e.stopImmediatePropagation()
    divClicked = $(e.target).closest(".species")[0]
    @_gridDisplay.find(".species" + divClicked.id).fadeOut().fadeIn() if divClicked?

  _updateSpeciesDiv: (div, species) ->
    name = (if species.displayName? then species.displayName else species.name)
    if species.count > 1 or species.saved
      div.find(".id").html "{name} ({scoreList})".supplant(
        name: name
        scoreList: species.scoreList.slice(-5).toString()
      )
      div.find(".totalCount").html species.count
      div.find(".currentCount").html species.processes.length
      div.show()
    else
      div.hide()

  _updateSpeciesDisplay: ->
    for own speciesId, speciesDiv of @_speciesDivStore
      @_updateSpeciesDiv speciesDiv.div, speciesDiv.species

  _speciesExtinctHandler: (e, species) ->
    #$.debug(e, species);
    e.stopImmediatePropagation()
    @_speciesDivStore[species.id].div.fadeOut "normal", @_removeThisElement
    @_colours.push @_speciesDivStore[species.id].colour
    delete @_speciesDivStore[species.id]

  _processClickedHandler: (e) ->
    e.stopImmediatePropagation()
    divClicked = $(e.target).closest(".process")[0]
    @setCurrentlyDisplayedProcess @_processStore[divClicked.id] if divClicked?

  _logMessageHandler: (e, message) ->
    e.stopPropagation()
    $("#sidebar .log").append "<div>" + message + "</div>"

  _threadHtml: "<div class=\"pane collapsed thread{threadNumber}\">" + "<div class=\"title\">thread {threadNumber}</div>" + "<table class=\"content\">" + "<tr><td>stack</td><td><div class=\"stack\"></div></td></tr>" + "<tr><td>counters</td><td><div class=\"counter\"></div></td></tr>" + "<tr><td>short term memory</td><td><div class=\"shortTermMemory\"></div></td></tr>" + "<tr><td>execution pointer</td><td><div class=\"executionPointer\"></div></td></tr>" + "<tr><td>read pointer</td><td><div class=\"readPointer\"></div></td></tr>" + "<tr><td>write pointer</td><td><div class=\"writePointer\"></div></td></tr>" + "<tr><td>sleep</td><td><div class=\"sleepCycles\"></div></td></tr>" + "<tr><td>speed</td><td><div class=\"speed\"></div></td></tr>" + "</table>" + "</div>"
  _updateProcessDisplay: updateProcessDisplay = ->
    tab = $("div.processTab")
    return  unless tab.hasClass("expanded")
    process = @_currentlyDisplayedProcess
    if process?
      tab.find("div.id").html process.id
      tab.find("div.cputime").html process.cputime
      tab.find("div.activeThreadCount").html process.threads.length
      tab.find("div.name").html process.name
      tab.find("div.age").html process.age
      tab.find("div.facing").html process.facing
      tab.find("div.memoryLength").html process.memory.length
      displayableCode = CORE.assembler.makeDisplayableHtml(process.memory)
      
      #don't update it with the same content. Makes it hard to select the text if it keeps getting updated
      tab.find("div.code").html displayableCode  unless tab.find("div.code").html() is displayableCode
      tab.find(".code .current").removeClass "current"

      for thread, i in process.threads 
        threadDom = tab.find(".thread" + i)
        if threadDom.length is 0
          threadDom = $(@_threadHtml.supplant(threadNumber: i))
          tab.find("#threads").append threadDom
        threadDom.find("div.stack").html thread.stack.toString()
        threadDom.find("div.counter").html thread.counter.toString()
        threadDom.find("div.shortTermMemory").html thread.shortTermMemory.toString()
        threadDom.find("div.executionPointer").html thread.executionPtr.toString()
        threadDom.find("div.readPointer").html thread.readPtr.toString()
        threadDom.find("div.writePointer").html thread.writePtr.toString()
        threadDom.find("div.sleepCycles").html thread.sleepCycles.toString()
        threadDom.find("div.speed").html thread.speed.toString()
        tab.find(".code .line" + thread.executionPtr.toString()).addClass "current"
        tab.find(".code .line" + thread.writePtr.toString()).before "<div class='pointers'>w</div>"
        tab.find(".code .line" + thread.readPtr.toString()).before "<div class='pointers'>r</div>"
    else
      tab.find("div.id").html ""
      tab.find("div.cputime").html ""
      tab.find("div.activeThreadCount").html ""
      tab.find("div.name").html ""
      tab.find("div.age").html ""
      tab.find("div.code").html ""

  
  # *****************************************
  # these are PUBLIC functions and variables
  # *****************************************
  updateDisplay: updateDisplay = ->
    $("div#loopCount").html "" + CORE.environment.getLoopCount()
    $("div#processCount").html "" + CORE.environment.getProcessCount()
    $("div#speciesEvolved").html CORE.species.count
    $("div#instrRate").html CORE.environment.current_rate
    @_updateProcessDisplay()
    @_updateSpeciesDisplay()

  setCurrentlyDisplayedProcess: (process) ->
    @_currentlyDisplayedProcess.debug = false if @_currentlyDisplayedProcess?
    if process?
      @_currentlyDisplayedProcess = process
    else
      @_currentlyDisplayedProcess.debug = true
    @_updateProcessDisplay()

  setColourForSpecies: (species, colour) ->
    speciesEntry = @_speciesDivStore[species.id]
    speciesEntry.colour = colour
    speciesEntry.div.css background: colour
    @_gridDisplay.find(".process.species" + species.id).css background: colour

$(document).ready $.proxy(CORE.evolve.initialise, CORE.evolve)