CORE.display = {   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   _processStore : {},
   _speciesDivStore : {},
   _gridDisplay : null,
   _timeDelay : 1000, // time to delay between simulation cycles

   _currentlyDisplayedProcess : null,
   _markerWidth : 0,
   _markerHeight : 0,

   _colours : [ "#000000", "#000033", "#000066", "#000099", "#0000CC",
         "#0000FF", "#003300", "#003333", "#003366", "#003399", "#0033CC",
         "#0033FF", "#006600", "#006633", "#006666", "#006699", "#0066CC",
         "#0066FF", "#009900", "#009933", "#009966", "#009999", "#0099CC",
         "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC",
         "#00CCFF", "#00FF00", "#00FF33", "#00FF66", "#00FF99", "#00FFCC",
         "#00FFFF", "#330000", "#330033", "#330066", "#330099", "#3300CC",
         "#3300FF", "#333300", "#333333", "#333366", "#333399", "#3333CC",
         "#3333FF", "#336600", "#336633", "#336666", "#336699", "#3366CC",
         "#3366FF", "#339900", "#339933", "#339966", "#339999", "#3399CC",
         "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC",
         "#33CCFF", "#33FF00", "#33FF33", "#33FF66", "#33FF99", "#33FFCC",
         "#33FFFF", "#660000", "#660033", "#660066", "#660099", "#6600CC",
         "#6600FF", "#663300", "#663333", "#663366", "#663399", "#6633CC",
         "#6633FF", "#666600", "#666633", "#666666", "#666699", "#6666CC",
         "#6666FF", "#669900", "#669933", "#669966", "#669999", "#6699CC",
         "#6699FF", "#66CC00", "#66CC33", "#66CC66", "#66CC99", "#66CCCC",
         "#66CCFF", "#66FF00", "#66FF33", "#66FF66", "#66FF99", "#66FFCC",
         "#66FFFF", "#990000", "#990033", "#990066", "#990099", "#9900CC",
         "#9900FF", "#993300", "#993333", "#993366", "#993399", "#9933CC",
         "#9933FF", "#996600", "#996633", "#996666", "#996699", "#9966CC",
         "#9966FF", "#999900", "#999933", "#999966", "#999999", "#9999CC",
         "#9999FF", "#99CC00", "#99CC33", "#99CC66", "#99CC99", "#99CCCC",
         "#99CCFF", "#99FF00", "#99FF33", "#99FF66", "#99FF99", "#99FFCC",
         "#99FFFF", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC",
         "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC",
         "#CC33FF", "#CC6600", "#CC6633", "#CC6666", "#CC6699", "#CC66CC",
         "#CC66FF", "#CC9900", "#CC9933", "#CC9966", "#CC9999", "#CC99CC",
         "#CC99FF", "#CCCC00", "#CCCC33", "#CCCC66", "#CCCC99", "#CCCCCC",
         "#CCCCFF", "#CCFF00", "#CCFF33", "#CCFF66", "#CCFF99", "#CCFFCC",
         "#CCFFFF", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC",
         "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC",
         "#FF33FF", "#FF6600", "#FF6633", "#FF6666", "#FF6699", "#FF66CC",
         "#FF66FF", "#FF9900", "#FF9933", "#FF9966", "#FF9999", "#FF99CC",
         "#FF99FF", "#FFCC00", "#FFCC33", "#FFCC66", "#FFCC99", "#FFCCCC",
         "#FFCCFF", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC"],

   _calculateMarkerSize : function() {
      $("#layoutCenter").height(($("#viewport").innerHeight()-$("#layoutTop").outerHeight()-2)+"px");
      var screenwidth = this._gridDisplay.width();
      var screenheight = this._gridDisplay.height();
      this._markerWidth = Math.round(screenwidth / CORE.environment.getGridX());
      this._markerHeight = Math.round(screenheight / CORE.environment.getGridY());

      var marker, process;
      var markers = this._gridDisplay.find(".process");
      var len = markers.length;
      for ( var i =0;i< len;i++) {
         marker = $(markers[i]);
         process = this._processStore[markers[i].id];
         if (process !== undefined) {
            marker.css( {
               top : this._markerHeight * process.gridY,
               left : (this._markerWidth * process.gridX),
               height : this._markerHeight - 1,
               width : this._markerWidth - 1
            });
         }
      }
   },

   _processCreateHandler : function(e, process) {
      e.stopImmediatePropagation();
      // $.debug(e, process.id, process.gridX, process.gridY);
      CORE.display._processStore[process.id] = process;
      var divMarker = $('<div class="process species{speciesId}" id="{processId}">&nbsp;</div>'.supplant({speciesId:process.species.id,processId:process.id}))
            .appendTo(this._gridDisplay)
            .css( {
         top : CORE.display._markerHeight * process.gridY,
         left : (CORE.display._markerWidth * process.gridX),
         height : CORE.display._markerHeight - 1,
         width : CORE.display._markerWidth - 1,
         background : this._speciesDivStore[process.species.id].colour
      });

   },

   _processMoveHandler : function(e, process, wrapped) {
      e.stopImmediatePropagation();
      // console.log(e, process.id, process.gridX, process.gridY);
      //CORE.display._processDivStore[process.id].stop(); 
      // removes all current animations
      // todo: change this to .animate to have nice animations
      if (wrapped) {
         this._gridDisplay.find('#'+process.id).stop().css( {
            top : this._markerHeight * process.gridY, 
            left : this._markerWidth * process.gridX
         });
         
      } else {
         this._gridDisplay.find('#'+process.id).stop().animate( {
            top : this._markerHeight * process.gridY, 
            left : this._markerWidth * process.gridX
         },"fast");
      }
   },

   _removeThisElement : function() {
      $(this).remove();
   },

   _processKillHandler : function(e, process) {
      e.stopImmediatePropagation();
      // console.log(e);
      var processDiv = this._gridDisplay.find('#'+process.id);
      if (processDiv) {
         processDiv.fadeOut("normal", this._removeThisElement);
      }
      delete this._processStore[process.id];
   },

   _speciesDivTemplate : '<div class="species" id="{speciesId}"><span class="id"></span>'+
   '<span class="totalCount"></span><span class="currentCount"></span><div style="clear:both;"></div></div>',
   _speciesCreateHandler : function(e, species) {
      //$.debug(e, species);
      e.stopImmediatePropagation();
      var colour = CORE.display._colours.shift();
      var contrast = Contrast.match(colour, CORE.display._colours);
      var divMarker = $(this._speciesDivTemplate.supplant({speciesId:species.id}))
         .appendTo(this._speciesList)
         .css( {
            background : colour,
            color : contrast !== false ? contrast[1] : "white"
         });
      CORE.display._updateSpeciesDiv(divMarker, species);
      CORE.display._speciesDivStore[species.id] = {
         div : divMarker,
         species : species,
         colour : colour
      };
   },
   _speciesClickedHandler : function(e) {
      e.stopImmediatePropagation();
      var divClicked = $(e.target).closest(".species")[0];

      if (divClicked !== undefined) {
         this._gridDisplay.find('.species'+divClicked.id).fadeOut().fadeIn();
      }
   },

   _updateSpeciesDiv : function updateSpeciesDiv(div, species) {
      var name = species.displayName === undefined ? species.name : species.displayName;
      if (species.count>1 || species.saved) {
         div.find(".id").html("{name} ({scoreList})".supplant({name:name,scoreList:species.scoreList.slice(-5).toString()}));
         div.find(".totalCount").html(species.count);
         div.find(".currentCount").html(species.processes.length);
         div.show();
      } else {
         div.hide();
      }
   },
   _updateSpeciesDisplay : function() {
      for ( var speciesId in CORE.display._speciesDivStore) {
         if (CORE.display._speciesDivStore.hasOwnProperty(speciesId)) {
            CORE.display._updateSpeciesDiv(
                  CORE.display._speciesDivStore[speciesId].div,
                  CORE.display._speciesDivStore[speciesId].species);
         }
      }
   },

   _speciesExtinctHandler : function(e, species) {
      //$.debug(e, species);
      e.stopImmediatePropagation();
      CORE.display._speciesDivStore[species.id].div.fadeOut("normal",
            CORE.display._removeThisElement);
      CORE.display._colours
            .push(CORE.display._speciesDivStore[species.id].colour);
      delete CORE.display._speciesDivStore[species.id];
   },

   _processClickedHandler : function(e) {
      e.stopImmediatePropagation();
      var divClicked = $(e.target).closest(".process")[0];
      if (divClicked !== undefined) {
         CORE.display.setCurrentlyDisplayedProcess(CORE.display._processStore[divClicked.id]);
      }
   },
   _logMessageHandler : function(e, message) {
      e.stopPropagation();
      $("#sidebar .log").append("<div>" + message + "</div>");
   },

   
   _threadHtml :'<div class="pane collapsed thread{threadNumber}">' +
   '<div class="title">thread {threadNumber}</div>'+
   '<table class="content">'+
      '<tr><td>stack</td><td><div class="stack"></div></td></tr>'+
      '<tr><td>counters</td><td><div class="counter"></div></td></tr>'+
      '<tr><td>short term memory</td><td><div class="shortTermMemory"></div></td></tr>'+
      '<tr><td>execution pointer</td><td><div class="executionPointer"></div></td></tr>'+
      '<tr><td>read pointer</td><td><div class="readPointer"></div></td></tr>'+
      '<tr><td>write pointer</td><td><div class="writePointer"></div></td></tr>'+
      '<tr><td>speed</td><td><div class="speed"></div></td></tr>'+
   '</table>'+
'</div>',

   
   _updateProcessDisplay : function updateProcessDisplay() {
      
      var tab = $("div.processTab");
      if (!tab.hasClass("expanded")) {
         return;
      }
      var process = CORE.display._currentlyDisplayedProcess;
      if (process !== null) {
         tab.find("div.id").html(process.id);
         tab.find("div.cputime").html(process.cputime);
         tab.find("div.activeThreadCount").html(process.threads.length);
         tab.find("div.name").html(process.name);
         tab.find("div.age").html(process.age);
         tab.find("div.facing").html(process.facing);
         var displayableCode = CORE.assembler.makeDisplayableHtml(process.memory);
         if (tab.find("div.code").html() != displayableCode) {
            //don't update it with the same content. Makes it hard to select the text if it keeps getting updated
            tab.find("div.code").html(displayableCode);
         }
         tab.find(".code .current").removeClass("current");
         for (var i=0;i<process.threads.length;i++) {
            var threadDom = tab.find(".thread"+i);
            if (threadDom.length ===0) {
               threadDom=$(CORE.display._threadHtml.supplant({threadNumber:i}));
               tab.find("#threads").append(threadDom);
            }
            var thread = process.threads[i];
            threadDom.find("div.stack").html(thread.stack.toString());
            threadDom.find("div.counter").html(thread.counter.toString());
            threadDom.find("div.shortTermMemory").html(thread.shortTermMemory.toString());
            threadDom.find("div.executionPointer").html(thread.executionPtr.toString());
            threadDom.find("div.readPointer").html(thread.readPtr.toString());
            threadDom.find("div.writePointer").html(thread.writePtr.toString());
            threadDom.find("div.sleepCycles").html(thread.sleepCycles.toString());
            threadDom.find("div.speed").html(thread.speed.toString());
            tab.find(".code .line"+thread.executionPtr.toString()).addClass("current");
            tab.find(".code .line"+thread.writePtr.toString()).before("<div class='pointers'>w</div>");
            tab.find(".code .line"+thread.readPtr.toString()).before("<div class='pointers'>r</div>");
         }
      } else {
         tab.find("div.id").html("");
         tab.find("div.cputime").html("");
         tab.find("div.activeThreadCount").html("");
         tab.find("div.name").html("");
         tab.find("div.age").html("");
         tab.find("div.code").html("");
      }
   },

   // *****************************************
   // these are Lifecycle Events
   // *****************************************
   initialise : function() {
  
       $(document).bind(CORE.environment.EVENT_PROCESS_CREATED,
             $.proxy(this._processCreateHandler,this));
      $(document).bind(CORE.environment.EVENT_PROCESS_MOVED,
            $.proxy(this._processMoveHandler,this));
      $(document).bind(CORE.environment.EVENT_PROCESS_KILLED,
            $.proxy(this._processKillHandler,this));
      $(document).bind(CORE.environment.EVENT_SPECIES_CREATED,
            $.proxy(this._speciesCreateHandler,this));
      $(document).bind(CORE.environment.EVENT_SPECIES_EXTINCT,
            $.proxy(this._speciesExtinctHandler,this));
      $(document).bind(CORE.EVENT_LOG_MESSAGE, CORE.display._logMessageHandler);
      this._gridDisplay = $("div#gridDisplay").click($.proxy(this._processClickedHandler,this)); 

      CORE.display._speciesList = $(".speciesList").bind("click", $.proxy(this._speciesClickedHandler,this));
      $(document).ready($.proxy(this._calculateMarkerSize,this));
      $(window).resize($.proxy(this._calculateMarkerSize,this));
      setInterval($.proxy(this.updateDisplay,this), CORE.display._timeDelay);
      //setInterval($.proxy(this.logDebugInfo,this), this._timeDelay);
   },
   _getObjectLength : function(obj) {
      if (obj.__count__ !== undefined) {
         return obj.__count__;
      } else {
         var count=0;
         for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
               count+=1;
            }
         }
         return count;
      }
   },
   logDebugInfo : function logDebugInfo() {
      $.debug("speciesDivs: {sd}, processes: {p}".supplant({sd: this._getObjectLength(this._speciesDivStore),p: this._getObjectLength(this._processStore)}));
   },

   // *****************************************
   // these are PUBLIC functions and variables
   // *****************************************

   updateDisplay : function updateDisplay() {
      $("div#loopCount").html("" + CORE.environment.getLoopCount());
      $("div#processCount").html("" + CORE.environment.getProcessCount());
      $("div#speciesEvolved").html(CORE.species.count);
      $("div#instrRate").html(CORE.environment.current_rate);

      CORE.display._updateProcessDisplay();
      CORE.display._updateSpeciesDisplay();
   },
   setCurrentlyDisplayedProcess: function(process) {
      if (CORE.display._currentlyDisplayedProcess !== null) {
         CORE.display._currentlyDisplayedProcess.debug = false;
      }
      if (process !== undefined) {
         CORE.display._currentlyDisplayedProcess = process;
      } else {
         CORE.display._currentlyDisplayedProcess.debug = true;
      }
      CORE.display._updateProcessDisplay();
   },
   setColourForSpecies: function(species, colour) {
      var speciesEntry = CORE.display._speciesDivStore[species.id];
      speciesEntry.colour = colour;
      speciesEntry.div.css( {
         background : colour
      });
      this._gridDisplay.find('.process.species'+divClicked.id).css( {
            background : colour
      });
   }
};
