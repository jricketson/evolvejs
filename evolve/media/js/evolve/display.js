CORE.display = function () {
   //*****************************************
   //these are PRIVATE functions and variables
   //*****************************************
   var timeDelay=1000; //time to delay between simulation cycles
   
   var processDivStore={}; //stored by process id
   var speciesDivStore={}; //stored by process id
   var currentlyDisplayedProcess=null;
   var markerWidth=0;
   var markerHeight=0;
   
   function calculateMarkerSize() {
      var screenwidth = jQuery("div#gridDisplay").width();
      var screenheight = jQuery("div#gridDisplay").height();
      markerWidth = Math.round(screenwidth/CORE.environment.getGridX());
      markerHeight = Math.round(screenheight/CORE.environment.getGridY());
      
      var processes = CORE.environment.getCurrentProcesses();
      var marker, process;
      for (var ii =0; ii < processes.length; ii+=1) {
         process = processes[ii];
         marker = processDivStore[process.id];
         marker.css({top:markerHeight*process.gridY,
                     left:(markerWidth*process.gridX),
                     height: markerHeight-1,
                     width: markerWidth-1});
      } 
   }
   
   function processCreateHandler(e,process) {
      e.stopPropagation();
      console.log(e, process.id, process.gridX, process.gridY);
      jQuery("div#gridDisplay").append('<div class="process" id="'+process.id+'">&nbsp;</div>');
      var divMarker=jQuery("div#gridDisplay div.process:last");
      divMarker.bind("click", process, divClickedHandler);
      divMarker.css({top:markerHeight*process.gridY,
                     left:(markerWidth*process.gridX),
                     height: markerHeight-1,
                     width: markerWidth-1,
                     background: process.species.colour});
      processDivStore[process.id]=divMarker;
      
   }
   
   function processMoveHandler(e,process) {
      e.stopPropagation();
      //console.log(e, process.id, process.gridX, process.gridY);
      processDivStore[process.id].stop(); //removes all current animations
      processDivStore[process.id].css({top:markerHeight*process.gridY, //todo: change this to .animate to have nice animations
                             left:markerWidth*process.gridX});
   }

   function processKillHandler(e,process) {
      e.stopPropagation();
      //console.log(e);
      processDivStore[process.id].fadeOut("normal",function(){jQuery(this).remove();});
      delete processDivStore[process.id];
   }

   function speciesCreateHandler(e,species) {
      console.log(e, species);
      e.stopPropagation();
      jQuery("div#speciesList").append('<div class="species" id="'+species.id+'">'+species.id+'</div>');
      var divMarker=jQuery("div#speciesList div.species:last");
      divMarker.css({background:species.colour});
      speciesDivStore[species.id]=divMarker;
   }

   function speciesExtinctHandler(e,species) {
      console.log(e, species);
      e.stopPropagation();
      speciesDivStore[species.id].fadeOut("normal",function(){jQuery(this).remove();});
      delete speciesDivStore[species.id];
   }

   function divClickedHandler(e) {
      e.stopPropagation();
      //console.log(e, e.data);
      currentlyDisplayedProcess = e.data;
      updateProcessDisplay();
   }

   function updateProcessDisplay() {
      if (currentlyDisplayedProcess) {
         jQuery("div#processTab div.id").html(currentlyDisplayedProcess.id);
         jQuery("div#processTab div.cputime").html(currentlyDisplayedProcess.cputime);
         jQuery("div#processTab div.activeThreadCount").html(currentlyDisplayedProcess.threads.length);
         jQuery("div#processTab div.code").html(CORE.assembler.makeDisplayableHtml(currentlyDisplayedProcess.memory));
      }
   
   }

   //*****************************************
   //these are Lifecycle Events
   //*****************************************
   jQuery(document).ready(function() {
      jQuery(document).bind(CORE.environment.EVENT_PROCESS_CREATED,processCreateHandler);
      jQuery(document).bind(CORE.environment.EVENT_PROCESS_MOVED,processMoveHandler);
      jQuery(document).bind(CORE.environment.EVENT_PROCESS_KILLED,processKillHandler);
      jQuery(document).bind(CORE.environment.EVENT_SPECIES_CREATED,speciesCreateHandler);
      jQuery(document).bind(CORE.environment.EVENT_SPECIES_EXTINCT,speciesExtinctHandler);
      
      jQuery(document).ready(calculateMarkerSize);
      jQuery(window).resize(calculateMarkerSize);
      jQuery(document).bind(CORE.indexHtml.EVENT_PAGE_READY, function(){
            //CORE.indexHtml.LAYOUT_HOLDER.on('resize', calculateMarkerSize);
      });      
   });

   //*****************************************
   //these are PUBLIC functions and variables
   //*****************************************

   return {
      updateDisplay: function() {
         jQuery("div#loopCount").html(""+CORE.environment.getLoopCount());
         jQuery("div#processCount").html(""+CORE.environment.getProcessCount());
         var instrsPerSec = CORE.vm.getInstrCount() / ((Number(new Date())-CORE.environment.getStartTime())/1000);
         jQuery("div#instrRate").html(""+Math.round(instrsPerSec*100)/100);

         updateProcessDisplay();

         if (CORE.environment.isRunning()) {
            setTimeout(function(){CORE.display.updateDisplay();},timeDelay);
         }
      }
   };
}();
