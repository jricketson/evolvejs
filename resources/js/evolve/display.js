CORE.display = function() {
   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   var timeDelay = 1000; // time to delay between simulation cycles

   var processDivStore = {}; // stored by process id
   var processStore={};
   var speciesDivStore = {}; // stored by process id
   var currentlyDisplayedProcess = null;
   var markerWidth = 0;
   var markerHeight = 0;

   var colours = ["#000000", "#000033", "#000066", "#000099", "#0000CC", "#0000FF", "#003300",
         "#003333", "#003366", "#003399", "#0033CC", "#0033FF", "#006600", "#006633", "#006666",
         "#006699", "#0066CC", "#0066FF", "#009900", "#009933", "#009966", "#009999", "#0099CC",
         "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#00FF00",
         "#00FF33", "#00FF66", "#00FF99", "#00FFCC", "#00FFFF", "#330000", "#330033", "#330066",
         "#330099", "#3300CC", "#3300FF", "#333300", "#333333", "#333366", "#333399", "#3333CC",
         "#3333FF", "#336600", "#336633", "#336666", "#336699", "#3366CC", "#3366FF", "#339900",
         "#339933", "#339966", "#339999", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66",
         "#33CC99", "#33CCCC", "#33CCFF", "#33FF00", "#33FF33", "#33FF66", "#33FF99", "#33FFCC",
         "#33FFFF", "#660000", "#660033", "#660066", "#660099", "#6600CC", "#6600FF", "#663300",
         "#663333", "#663366", "#663399", "#6633CC", "#6633FF", "#666600", "#666633", "#666666",
         "#666699", "#6666CC", "#6666FF", "#669900", "#669933", "#669966", "#669999", "#6699CC",
         "#6699FF", "#66CC00", "#66CC33", "#66CC66", "#66CC99", "#66CCCC", "#66CCFF", "#66FF00",
         "#66FF33", "#66FF66", "#66FF99", "#66FFCC", "#66FFFF", "#990000", "#990033", "#990066",
         "#990099", "#9900CC", "#9900FF", "#993300", "#993333", "#993366", "#993399", "#9933CC",
         "#9933FF", "#996600", "#996633", "#996666", "#996699", "#9966CC", "#9966FF", "#999900",
         "#999933", "#999966", "#999999", "#9999CC", "#9999FF", "#99CC00", "#99CC33", "#99CC66",
         "#99CC99", "#99CCCC", "#99CCFF", "#99FF00", "#99FF33", "#99FF66", "#99FF99", "#99FFCC",
         "#99FFFF", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300",
         "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC6666",
         "#CC6699", "#CC66CC", "#CC66FF", "#CC9900", "#CC9933", "#CC9966", "#CC9999", "#CC99CC",
         "#CC99FF", "#CCCC00", "#CCCC33", "#CCCC66", "#CCCC99", "#CCCCCC", "#CCCCFF", "#CCFF00",
         "#CCFF33", "#CCFF66", "#CCFF99", "#CCFFCC", "#CCFFFF", "#FF0000", "#FF0033", "#FF0066",
         "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC",
         "#FF33FF", "#FF6600", "#FF6633", "#FF6666", "#FF6699", "#FF66CC", "#FF66FF", "#FF9900",
         "#FF9933", "#FF9966", "#FF9999", "#FF99CC", "#FF99FF", "#FFCC00", "#FFCC33", "#FFCC66",
         "#FFCC99", "#FFCCCC", "#FFCCFF", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC",
         "#FFFFFF"];
   
   
   
   function calculateMarkerSize() {
      var screenwidth = $("div#gridDisplay").width();
      var screenheight = $("div#gridDisplay").height();
      markerWidth = Math.round(screenwidth / CORE.environment.getGridX());
      markerHeight = Math.round(screenheight / CORE.environment.getGridY());

      var processes = CORE.environment.getCurrentProcesses();
      var marker, process;
      for (var ii = 0; ii < processes.length; ii += 1) {
         process = processes[ii];
         marker = processDivStore[process.id];
         marker.css({
                  top : markerHeight * process.gridY,
                  left : (markerWidth * process.gridX),
                  height : markerHeight - 1,
                  width : markerWidth - 1
               });
      }
   }

   function processCreateHandler(e, process) {
      e.stopPropagation();
      // $.debug(e, process.id, process.gridX, process.gridY);
      $("div#gridDisplay").append('<div class="process" id="' + process.id + '">&nbsp;</div>');
      var divMarker = $("div#gridDisplay div.process:last");
      processStore[process.id]=process;
      divMarker.css({
               top : markerHeight * process.gridY,
               left : (markerWidth * process.gridX),
               height : markerHeight - 1,
               width : markerWidth - 1,
               background : speciesDivStore[process.species.id].colour
            });
      processDivStore[process.id] = divMarker;

   }

   function processMoveHandler(e, process) {
      e.stopPropagation();
      // console.log(e, process.id, process.gridX, process.gridY);
      processDivStore[process.id].stop(); // removes all current animations
      processDivStore[process.id].css({
               top : markerHeight * process.gridY, // todo: change this to .animate to have nice
               // animations
               left : markerWidth * process.gridX
            });
   }

   function processKillHandler(e, process) {
      e.stopPropagation();
      // console.log(e);
      var processDiv = processDivStore[process.id];
      if (processDiv) {
         processDiv.fadeOut("normal", function() {
                  $(this).remove();
               });
      }
      delete processDivStore[process.id];
   }

   function speciesCreateHandler(e, species) {
      //$.debug(e, species);
      e.stopPropagation();
      var sidebar = $("#sidebar div.speciesList");
      sidebar.append('<div class="species" id="' + species.id + '"></div>');
      var divMarker = $("#sidebar div.speciesList div.species:last");
      var colour = colours.shift();
      var contrast = Contrast.match(colour, colours);
      $.debug(colour, contrast);
      divMarker.css({
               background : colour,
               color:contrast !== false ? contrast[1]:"white"
            });
      updateSpeciesDiv(divMarker, species);
      speciesDivStore[species.id] = {
         div : divMarker,
         species : species,
         colour : colour
      };
   }
   function speciesClickedHandler(e) {
      e.stopPropagation();
      var divClicked=e.originalTarget;
      
      var species = speciesDivStore[divClicked.id];
      if (species !==undefined) {
         species=species.species;
         for (var i =0;i<species.processes.length;i++) {
            processDivStore[species.processes[i]].fadeOut().fadeIn();
         }
      }
   }

   function updateSpeciesDiv(div, species) {
      var name = species.name === undefined ? species.id : species.name;
      div.html('<span class="id">' + name + '</span><span class="totalCount">' + 
            species.count + '</span><span class="currentCount">' + species.processes.length + 
            '</span><div style="clear:both;"></div>');
   }

   function speciesExtinctHandler(e, species) {
      //$.debug(e, species);
      e.stopPropagation();
      speciesDivStore[species.id].div.fadeOut("normal", function() {
               $(this).remove();
            });
      colours.push(speciesDivStore[species.id].colour);
      delete speciesDivStore[species.id];
   }

   function processClickedHandler(e) {
      e.stopPropagation();
      //console.log(e, e.originalTarget);
      if (currentlyDisplayedProcess !== null) {
         currentlyDisplayedProcess.debug=false;
      }
      var divClicked=e.originalTarget;
      
      currentlyDisplayedProcess = processStore[divClicked.id];
      if (currentlyDisplayedProcess ===undefined) {
         currentlyDisplayedProcess =null;
      } else {
         currentlyDisplayedProcess.debug=true;
      }
      updateProcessDisplay();
   }
   function logMessageHandler(e, message) {
      e.stopPropagation();
      $("#sidebar .log").append("<div>"+message+"</div>");
   }

   function updateProcessDisplay() {
      var tab=$("div.processTab");
      if (currentlyDisplayedProcess !== null) {
         tab.find("div.id").html(currentlyDisplayedProcess.id);
         tab.find("div.cputime").html(currentlyDisplayedProcess.cputime);
         tab.find("div.activeThreadCount").html(currentlyDisplayedProcess.threads.length);
         tab.find("div.name").html(currentlyDisplayedProcess.name);
         tab.find("div.age").html(currentlyDisplayedProcess.age);
         var displayableCode=CORE.assembler.makeDisplayableHtml(currentlyDisplayedProcess.memory);
         tab.find("div.code").html(displayableCode);
      } else {
         tab.find("div.id").html("");
         tab.find("div.cputime").html("");
         tab.find("div.activeThreadCount").html("");
         tab.find("div.name").html("");
         tab.find("div.age").html("");
         tab.find("div.code").html("");
      }
   }
   function updateSpeciesDisplay() {
      for (var speciesId in speciesDivStore) {
         if (speciesDivStore.hasOwnProperty(speciesId)) {
         updateSpeciesDiv(speciesDivStore[speciesId].div, speciesDivStore[speciesId].species);
         }
      }
   }

   // *****************************************
   // these are Lifecycle Events
   // *****************************************
   $(document).ready(function() {
            $(document).bind(CORE.environment.EVENT_PROCESS_CREATED, processCreateHandler);
            $(document).bind(CORE.environment.EVENT_PROCESS_MOVED, processMoveHandler);
            $(document).bind(CORE.environment.EVENT_PROCESS_KILLED, processKillHandler);
            $(document).bind(CORE.environment.EVENT_SPECIES_CREATED, speciesCreateHandler);
            $(document).bind(CORE.environment.EVENT_SPECIES_EXTINCT, speciesExtinctHandler);
            $(document).bind(CORE.EVENT_LOG_MESSAGE, logMessageHandler);
            $("#gridDisplay").bind("click", processClickedHandler);
            
            $(document).ready(calculateMarkerSize);
            $(window).resize(calculateMarkerSize);
            setTimeout(function() {
                     CORE.display.updateDisplay();
                  }, timeDelay);
            //TODO: fix this terrible hack. The specieslist hasn't been created yet
            setTimeout(function() {
            $(".speciesList").bind("click", speciesClickedHandler); 
            }, 1000);
         });

   // *****************************************
   // these are PUBLIC functions and variables
   // *****************************************

   return {
      updateDisplay : function updateDisplay() {
         $("div#loopCount").html("" + CORE.environment.getLoopCount());
         $("div#processCount").html("" + CORE.environment.getProcessCount());
         var secsSinceStart = (Number(new Date()) - CORE.environment.getStartTime()) / 1000;
         var instrsPerSec = CORE.vm.getInstrCount() / secsSinceStart;
         $("div#instrRate").html("" + Math.round(instrsPerSec * 100) / 100);

         updateProcessDisplay();
         updateSpeciesDisplay();
         setTimeout(function() {
                  CORE.display.updateDisplay();
               }, timeDelay);
      }
   };
}();
