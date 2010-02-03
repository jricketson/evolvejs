CORE.display = {   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   _processDivStore : {},
   _processStore : {},
   _speciesDivStore : {},
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
         "#FFCCFF", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC",
         "#FFFFFF" ],

   _calculateMarkerSize : function() {
      $("#layoutCenter").height(($("#viewport").innerHeight()-$("#layoutTop").outerHeight()-2)+"px");
      var screenwidth = $("div#gridDisplay").width();
      var screenheight = $("div#gridDisplay").height();
      this._markerWidth = Math.round(screenwidth / CORE.environment.getGridX());
      this._markerHeight = Math.round(screenheight / CORE.environment.getGridY());

      var marker, process;
      for ( var processId in this._processStore) {
         if (this._processStore.hasOwnProperty(processId)) {
            process = this._processStore[processId];
            marker = this._processDivStore[process.id];
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
      $("div#gridDisplay").append(
            '<div class="process" id="' + process.id + '">&nbsp;</div>');
      var divMarker = $("div#gridDisplay div.process:last");
      CORE.display._processStore[process.id] = process;
      divMarker.css( {
         top : CORE.display._markerHeight * process.gridY,
         left : (CORE.display._markerWidth * process.gridX),
         height : CORE.display._markerHeight - 1,
         width : CORE.display._markerWidth - 1,
         background : CORE.display._speciesDivStore[process.species.id].colour
      });
      CORE.display._processDivStore[process.id] = divMarker;

   },

   _processMoveHandler : function(e, process) {
      e.stopImmediatePropagation();
      // console.log(e, process.id, process.gridX, process.gridY);
      //CORE.display._processDivStore[process.id].stop(); 
      // removes all current animations
      // todo: change this to .animate to have nice animations
      CORE.display._processDivStore[process.id].css( {
         top : CORE.display._markerHeight * process.gridY, 
         left : CORE.display._markerWidth * process.gridX
      });
   },

   _removeThisElement : function() {
      $(this).remove();
   },

   _processKillHandler : function(e, process) {
      e.stopImmediatePropagation();
      // console.log(e);
      var processDiv = CORE.display._processDivStore[process.id];
      if (processDiv) {
         processDiv.fadeOut("normal", CORE.display._removeThisElement);
      }
      delete CORE.display._processDivStore[process.id];
      delete CORE.display._processStore[process.id];
   },

   _speciesCreateHandler : function(e, species) {
      //$.debug(e, species);
      e.stopImmediatePropagation();
      if (CORE.display._speciesList === undefined) {
         CORE.display._speciesList = $("#sidebar div.speciesList");
      }
      CORE.display._speciesList.append('<div class="species" id="' + species.id + '"></div>');
      var divMarker = CORE.display._speciesList.find("div.species:last");
      var colour = CORE.display._colours.shift();
      var contrast = Contrast.match(colour, CORE.display._colours);
      divMarker.css( {
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

      var speciesEntry = CORE.display._speciesDivStore[divClicked.id];
      if (speciesEntry !== undefined) {
         var species = speciesEntry.species;
         for ( var i = 0; i < species.processes.length; i++) {
            CORE.display._processDivStore[species.processes[i]].fadeOut().fadeIn();
         }
      }
   },

   _updateSpeciesDiv : function updateSpeciesDiv(div, species) {
     //if (species === null) {
     //   $.debug("using name");
     //}
      var name = species.name === undefined ? species.id : species.name;
      div.html('<span class="id">' + name + '</span><span class="totalCount">' + 
            species.count + '</span><span class="currentCount">' +
            species.processes.length +
            '</span><div style="clear:both;"></div>');
      if (species.count>1 || species.saved) {
         div.show();
      } else {
         div.hide();
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
      var process = CORE.display._currentlyDisplayedProcess;
      if (process !== null && tab.hasClass("expanded")) {
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
   _updateSpeciesDisplay : function() {
      for ( var speciesId in CORE.display._speciesDivStore) {
         if (CORE.display._speciesDivStore.hasOwnProperty(speciesId)) {
            CORE.display._updateSpeciesDiv(
                  CORE.display._speciesDivStore[speciesId].div,
                  CORE.display._speciesDivStore[speciesId].species);
         }
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
      $("#gridDisplay").click($.proxy(this._processClickedHandler,this)); 

      setTimeout( function() {
         $(".speciesList").bind("click", $.proxy(CORE.display._speciesClickedHandler,CORE.display));
      }, 1000);
      $(document).ready($.proxy(this._calculateMarkerSize,this));
      $(window).resize($.proxy(this._calculateMarkerSize,this));
      setInterval($.proxy(this.updateDisplay,this), CORE.display._timeDelay);
      // TODO: fix this terrible hack. The specieslist hasn't been created
      // yet
      setInterval($.proxy(this.logDebugInfo,this), this._timeDelay);
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
      $.debug("speciesDivs: {sd}, processDivs: {pd}, processes: {p}".supplant({sd: this._getObjectLength(this._speciesDivStore),pd: this._getObjectLength(this._processDivStore),p: this._getObjectLength(this._processStore)}));
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
      for ( var i = 0; i < species.processes.length; i++) {
         CORE.display._processDivStore[species.processes[i]].css( {
            background : colour
         });
      }
   }
};
