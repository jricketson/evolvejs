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
               background : process.species.colour
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
      divMarker.css({
               background : species.colour
            });
      updateSpeciesDiv(divMarker, species);
      speciesDivStore[species.id] = {
         div : divMarker,
         species : species
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
