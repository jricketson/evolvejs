CORE.display = {};
CORE.display._ProcessDivStore = function() {
};
CORE.display._ProcessStore = function() {
};
CORE.display._SpeciesDivStore = function() {
};
// *****************************************
// these are PRIVATE functions and variables
// *****************************************
CORE.display._timeDelay = 1000; // time to delay between simulation cycles

CORE.display._processDivStore = new CORE.display._ProcessDivStore();
CORE.display._processStore = new CORE.display._ProcessStore();
CORE.display._speciesDivStore = new CORE.display._SpeciesDivStore();

CORE.display._currentlyDisplayedProcess = null;
CORE.display._markerWidth = 0;
CORE.display._markerHeight = 0;

CORE.display._colours = [ "#000000", "#000033", "#000066", "#000099",
      "#0000CC", "#0000FF", "#003300", "#003333", "#003366", "#003399",
      "#0033CC", "#0033FF", "#006600", "#006633", "#006666", "#006699",
      "#0066CC", "#0066FF", "#009900", "#009933", "#009966", "#009999",
      "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99",
      "#00CCCC", "#00CCFF", "#00FF00", "#00FF33", "#00FF66", "#00FF99",
      "#00FFCC", "#00FFFF", "#330000", "#330033", "#330066", "#330099",
      "#3300CC", "#3300FF", "#333300", "#333333", "#333366", "#333399",
      "#3333CC", "#3333FF", "#336600", "#336633", "#336666", "#336699",
      "#3366CC", "#3366FF", "#339900", "#339933", "#339966", "#339999",
      "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99",
      "#33CCCC", "#33CCFF", "#33FF00", "#33FF33", "#33FF66", "#33FF99",
      "#33FFCC", "#33FFFF", "#660000", "#660033", "#660066", "#660099",
      "#6600CC", "#6600FF", "#663300", "#663333", "#663366", "#663399",
      "#6633CC", "#6633FF", "#666600", "#666633", "#666666", "#666699",
      "#6666CC", "#6666FF", "#669900", "#669933", "#669966", "#669999",
      "#6699CC", "#6699FF", "#66CC00", "#66CC33", "#66CC66", "#66CC99",
      "#66CCCC", "#66CCFF", "#66FF00", "#66FF33", "#66FF66", "#66FF99",
      "#66FFCC", "#66FFFF", "#990000", "#990033", "#990066", "#990099",
      "#9900CC", "#9900FF", "#993300", "#993333", "#993366", "#993399",
      "#9933CC", "#9933FF", "#996600", "#996633", "#996666", "#996699",
      "#9966CC", "#9966FF", "#999900", "#999933", "#999966", "#999999",
      "#9999CC", "#9999FF", "#99CC00", "#99CC33", "#99CC66", "#99CC99",
      "#99CCCC", "#99CCFF", "#99FF00", "#99FF33", "#99FF66", "#99FF99",
      "#99FFCC", "#99FFFF", "#CC0000", "#CC0033", "#CC0066", "#CC0099",
      "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399",
      "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC6666", "#CC6699",
      "#CC66CC", "#CC66FF", "#CC9900", "#CC9933", "#CC9966", "#CC9999",
      "#CC99CC", "#CC99FF", "#CCCC00", "#CCCC33", "#CCCC66", "#CCCC99",
      "#CCCCCC", "#CCCCFF", "#CCFF00", "#CCFF33", "#CCFF66", "#CCFF99",
      "#CCFFCC", "#CCFFFF", "#FF0000", "#FF0033", "#FF0066", "#FF0099",
      "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399",
      "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF6666", "#FF6699",
      "#FF66CC", "#FF66FF", "#FF9900", "#FF9933", "#FF9966", "#FF9999",
      "#FF99CC", "#FF99FF", "#FFCC00", "#FFCC33", "#FFCC66", "#FFCC99",
      "#FFCCCC", "#FFCCFF", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99",
      "#FFFFCC", "#FFFFFF" ];

CORE.display._calculateMarkerSize = function() {
   var screenwidth = $("div#gridDisplay").width();
   var screenheight = $("div#gridDisplay").height();
   CORE.display._markerWidth = Math.round(screenwidth / CORE.environment.getGridX());
   CORE.display._markerHeight = Math.round(screenheight / CORE.environment.getGridY());

   var processes = CORE.environment.getCurrentProcesses();
   var marker, process;
   for ( var ii = 0; ii < processes.length; ii += 1) {
      process = processes[ii];
      marker = CORE.display._processDivStore[process.id];
      marker.css( {
         top : CORE.display._markerHeight * process.gridY,
         left : (CORE.display._markerWidth * process.gridX),
         height : CORE.display._markerHeight - 1,
         width : CORE.display._markerWidth - 1
      });
   }
};

CORE.display._processCreateHandler = function(e, process) {
   e.stopPropagation();
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

};

CORE.display._processMoveHandler = function(e, process) {
   e.stopPropagation();
   // console.log(e, process.id, process.gridX, process.gridY);
   CORE.display._processDivStore[process.id].stop(); // removes all current
   // animations
   CORE.display._processDivStore[process.id].css( {
      top : CORE.display._markerHeight * process.gridY, // todo: change this to .animate to have nice
      // animations
      left : CORE.display._markerWidth * process.gridX
   });
};

CORE.display._removeThisElement = function() {
   $(this).remove();
};

CORE.display._processKillHandler = function(e, process) {
   e.stopPropagation();
   // console.log(e);
   var processDiv = CORE.display._processDivStore[process.id];
   if (processDiv) {
      processDiv.fadeOut("normal", CORE.display._removeThisElement);
   }
   delete CORE.display._processDivStore[process.id];
   delete CORE.display._processStore[process.id];
};

CORE.display._speciesCreateHandler = function(e, species) {
   //$.debug(e, species);
   e.stopPropagation();
   var sidebar = $("#sidebar div.speciesList");
   sidebar.append('<div class="species" id="' + species.id + '"></div>');
   var divMarker = $("#sidebar div.speciesList div.species:last");
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
};
CORE.display._speciesClickedHandler = function(e) {
   e.stopPropagation();
   var divClicked = e.originalTarget;

   var species = CORE.display._speciesDivStore[divClicked.id];
   if (species !== undefined) {
      species = species.species;
      for ( var i = 0; i < species.processes.length; i++) {
         CORE.display._processDivStore[species.processes[i]].fadeOut().fadeIn();
      }
   }
};

CORE.display._updateSpeciesDiv = function(div, species) {
   var name = species.name === undefined ? species.id : species.name;
   div.html('<span class="id">' + name + '</span><span class="totalCount">' + 
         species.count + '</span><span class="currentCount">' +
         species.processes.length + '</span><div style="clear:both;"></div>');
};

CORE.display._speciesExtinctHandler = function(e, species) {
   //$.debug(e, species);
   e.stopPropagation();
   CORE.display._speciesDivStore[species.id].div.fadeOut("normal",
         CORE.display._removeThisElement);
   CORE.display._colours.push(CORE.display._speciesDivStore[species.id].colour);
   delete CORE.display._speciesDivStore[species.id];
};

CORE.display._processClickedHandler = function(e) {
   e.stopPropagation();
   // console.log(e, e.originalTarget);
   if (CORE.display._currentlyDisplayedProcess !== null) {
      CORE.display._currentlyDisplayedProcess.debug = false;
   }
   var divClicked = e.originalTarget;

   CORE.display._currentlyDisplayedProcess = CORE.display._processStore[divClicked.id];
   if (CORE.display._currentlyDisplayedProcess === undefined) {
      CORE.display._currentlyDisplayedProcess = null;
   } else {
      CORE.display._currentlyDisplayedProcess.debug = true;
   }
   CORE.display._updateProcessDisplay();
};
CORE.display._logMessageHandler = function(e, message) {
   e.stopPropagation();
   $("#sidebar .log").append("<div>" + message + "</div>");
};

CORE.display._updateProcessDisplay = function() {
   var tab = $("div.processTab");
   if (CORE.display._currentlyDisplayedProcess !== null) {
      tab.find("div.id").html(CORE.display._currentlyDisplayedProcess.id);
      tab.find("div.cputime").html(
            CORE.display._currentlyDisplayedProcess.cputime);
      tab.find("div.activeThreadCount").html(
            CORE.display._currentlyDisplayedProcess.threads.length);
      tab.find("div.name").html(CORE.display._currentlyDisplayedProcess.name);
      tab.find("div.age").html(CORE.display._currentlyDisplayedProcess.age);
      var displayableCode = CORE.assembler
            .makeDisplayableHtml(CORE.display._currentlyDisplayedProcess.memory);
      tab.find("div.code").html(displayableCode);
   } else {
      tab.find("div.id").html("");
      tab.find("div.cputime").html("");
      tab.find("div.activeThreadCount").html("");
      tab.find("div.name").html("");
      tab.find("div.age").html("");
      tab.find("div.code").html("");
   }
};
CORE.display._updateSpeciesDisplay = function() {
   for ( var speciesId in CORE.display._speciesDivStore) {
      if (CORE.display._speciesDivStore.hasOwnProperty(speciesId)) {
         CORE.display._updateSpeciesDiv(
               CORE.display._speciesDivStore[speciesId].div,
               CORE.display._speciesDivStore[speciesId].species);
      }
   }
};

// *****************************************
// these are Lifecycle Events
// *****************************************
CORE.display._initialise = function() {
   $(document).bind(CORE.environment.EVENT_PROCESS_CREATED,
         CORE.display._processCreateHandler);
   $(document).bind(CORE.environment.EVENT_PROCESS_MOVED,
         CORE.display._processMoveHandler);
   $(document).bind(CORE.environment.EVENT_PROCESS_KILLED,
         CORE.display._processKillHandler);
   $(document).bind(CORE.environment.EVENT_SPECIES_CREATED,
         CORE.display._speciesCreateHandler);
   $(document).bind(CORE.environment.EVENT_SPECIES_EXTINCT,
         CORE.display._speciesExtinctHandler);
   $(document).bind(CORE.EVENT_LOG_MESSAGE, CORE.display._logMessageHandler);
   $("#gridDisplay").bind("click", CORE.display._processClickedHandler);

   $(document).ready(CORE.display._calculateMarkerSize);
   $(window).resize(CORE.display._calculateMarkerSize);
   setTimeout(CORE.display.updateDisplay, CORE.display._timeDelay);
   // TODO: fix this terrible hack. The specieslist hasn't been created
   // yet
   setTimeout( function() {
      $(".speciesList").bind("click", CORE.display._speciesClickedHandler);
   }, 1000);
};

// *****************************************
// these are PUBLIC functions and variables
// *****************************************

CORE.display.updateDisplay = function updateDisplay() {
   $("div#loopCount").html("" + CORE.environment.getLoopCount());
   $("div#processCount").html("" + CORE.environment.getProcessCount());
   var secsSinceStart = (Number(new Date()) - CORE.environment.getStartTime()) / 1000;
   var instrsPerSec = CORE.vm.getInstrCount() / secsSinceStart;
   $("div#instrRate").html("" + Math.round(instrsPerSec * 100) / 100);

   CORE.display._updateProcessDisplay();
   CORE.display._updateSpeciesDisplay();
   setTimeout(CORE.display.updateDisplay, CORE.display._timeDelay);
};

$(document).ready(CORE.display._initialise);
