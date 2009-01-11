CORE.environment = function () {
   //*****************************************
   //these are PRIVATE functions and variables
   //*****************************************
   var gridX=60; //these are default values
   var gridY=30;
   var timeDelay=0; //time to delay between simulation cycles
   var instructionsPerCycle=30;
   var running=false; //if the simulation should keep running
   var INITIAL_POPULATION_SIZE_FROM_SERVER = 10;
   
   var currentProcesses = []; //all the currently alive processes.
   var grid=[]; //the grid that the processes move about on. They are not actually stored here.
   
   var loopCount=0; //number of instructions executed
   
   var embodiedEnergy=5;
   
   var startTime=0;
   
   function initialiseEnvironment() {
      resizeGrid();
      //inject the first Process(s)
      CORE.dataAccess.getPopulation(INITIAL_POPULATION_SIZE_FROM_SERVER, function(population) {
         if (population.length===0) {
            population= [new CORE.Process(CORE.ancestor.tree)];
         }
         initialisePopulation(population);
      });
   }
   
   function initialisePopulation(population)
   {
      for (var ii=0;ii<population.length;ii+=1) {
         birthProcess(population[ii]);
      }
   
   }
   
   
   
   /**
   * adds a process to the queue, also places it in the grid
   * x and y are optional, if not supplied will be placed randomly
   */
   function birthProcess(process, x, y) {
      if (x !== undefined && y !== undefined) {
         if (! grid[x][y]) {
            initialiseProcess(process, x, y);
            return true;
         }
         else {
            return false;
         }
      }
      else {  
         while (true) {
            var xx=Math.round(Math.random()*(gridX-1));
            var yy=Math.round(Math.random()*(gridY-1));
            if (! grid[xx][yy]) {
               initialiseProcess(process, xx, yy);
               return true;
            }
         }
      }
      return false;
   }
   
   function initialiseProcess(process, x, y) {
      grid[x][y]=process;
      process.gridX=x;
      process.gridY=y;
      currentProcesses.push(process);
      var species = CORE.speciesLibrary.placeProcess(process);
      
      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_CREATED, [process]);
      return species;
   }
   
   function move(process, x, y) {
      if (CORE.environment.getGrid()[x][y]!==0) {
         attack(process, x, y);
      }
      if (grid[x][y]===0) {
         grid[process.gridX][process.gridY]=0;
         process.gridX = x;
         process.gridY = y;
         grid[x][y]=process;
         jQuery(document).trigger(CORE.environment.EVENT_PROCESS_MOVED, [process]);
      }
   }
   
   function kill(process) {
      process.killMe();
      for (var ii=0;ii<currentProcesses.length;ii+=1) {
         if (currentProcesses[ii]==process) {
            currentProcesses.splice(ii,1); //remove the killed process
         }
      }
      CORE.speciesLibrary.removeProcess(process);
      grid[process.gridX][process.gridY]=0;
      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_KILLED, [process]);
   }
   
   /**
      the way that this should work:
      the attack costs both of the assailants energy: 
      the defender loses min(attacker.cpu, defender.cpu), 
      the attacker loses min(attacker.cpu, defender.cpu)*.9
      
      this means that if the attacker loses, it doesn't die
   */
   function attack(attacker, x, y) {
      var defender = grid[x][y];
      var lowCpu=Math.min(attacker.cputime, defender.cputime);
      attacker.cputime-=(lowCpu*0.9 );
      defender.cputime-=lowCpu;
      if (defender.cputime===0) {
         attacker.cputime+=(defender.memory.length*embodiedEnergy); //give the attacker cputime and the embodied energy in the body size
         CORE.environment.killProcess(defender);
      }
   }
      
   function resizeGrid() {
   
      var xx; var yy;
      for (xx = 0; xx<gridX;xx+=1) {
         for (yy = 0; yy<gridY;yy+=1) {
            if (!grid[xx]) {
               grid[xx]=[];
            }
            if (! grid[xx][yy]) {
               grid[xx][yy]=0;
            }
         }
      }
   }
   
   function shineSun() {
      for (var ii = 0; ii<currentProcesses.length; ii+=1) {
         currentProcesses[ii].incrCpuTime(1);
      }
   }
   
   function runSimulationLoop(ii) {
      var jj;
      for (jj=0;jj<=instructionsPerCycle;jj+=1) {
         if (ii >= currentProcesses.length) {
            //do this first, the length of currentProcesses may have changed (one killed)
            ii=0;
            loopCount+=1;
            shineSun();
         }
         //$.debug(currentProcesses[ii].id, currentProcesses[ii].getState());
         currentProcesses[ii].step();
         ii+=1;
      }
      //TODO: ii should not increment if the most recent process was killed. 
      if (running) {
         setTimeout(function() {runSimulationLoop(ii);},timeDelay);
      }
   
   }
   //*****************************************
   //these are Lifecycle Events
   //*****************************************

   //*****************************************
   //these are PUBLIC functions and variables
   //*****************************************
   return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3,
      
      EVENT_PROCESS_CREATED: "processCreated",
      EVENT_PROCESS_MOVED: "processMoved",
      EVENT_PROCESS_KILLED: "processKilled",
      EVENT_SPECIES_CREATED: "speciesCreated",
      EVENT_SPECIES_EXTINCT: "speciesExtinct",
      
      mutationRate: 100000, //approximate chance of mutation (1 in x copy operations)
      startTime: 0,
   
      /**
       * starts the environment and runs the simulation
       */
      initialise: function() {
         initialiseEnvironment();
      },
      resetStartTime: function() {
         startTime = Number(new Date());
      },
      start: function(){
         running=true;
         runSimulationLoop(0);
         CORE.display.updateDisplay(currentProcesses);
         CORE.environment.resetStartTime();
         CORE.vm.resetInstrCount();
      },
      stop: function(){
         running=false;
      },
      
      addProcess: function(process, x, y) {
         return birthProcess(process,x,y);
      },
      moveProcess: function(process, x, y) {
         move(process,x,y);
      },
      killProcess: function(process) {
         kill(process);
      },
      getProcessCount: function() {
         return currentProcesses.length;
      },
      getLoopCount: function() {
         return loopCount;
      },
      getGridX: function() {
         return gridX;
      },
      getGridY: function() {
         return gridY;
      },
      isRunning: function() {
         return running;
      },
      getGrid: function() {
         return grid;
      },
      getStartTime: function() {
         return startTime;
      },
      initialiseGrid: function() {
         resizeGrid();
      },
      getCurrentProcesses: function() {
         return currentProcesses;
      }
   };
}();
