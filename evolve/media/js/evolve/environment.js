CORE.environment = function() {
   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   var gridX = 60; // these are default values
   var gridY = 30;
   var timeDelay = 0; // time to delay between simulation cycles
   var instructionsPerCycle = 30;
   var running = false; // if the simulation should keep running
   var INITIAL_POPULATION_SIZE_FROM_SERVER = 10;

   var currentProcesses = []; // all the currently alive processes.
   var grid = []; // the grid that the processes move about on. They are not actually stored here.

   var loopCount = 0; // number of instructions executed

   var embodiedEnergy = 5;

   var startTime = 0;

   var serialProcessIdSeries = Number(new Date()); // initialise to an essentially random number

   function initialiseEnvironment() {
      resizeGrid();
      // inject the first Process(s)
      CORE.dataAccess.getSpecies(INITIAL_POPULATION_SIZE_FROM_SERVER, function(species) {
               var population = [];
               if (species.length !== 0) {
                  // construct a process from each species
                  for (var ii = 0; ii < species.length; ii += 1) {
                     var code = CORE.dataAccess.convertStringToCode(species[ii].fields.code);
                     species[ii].code = code;
                     var specie = new CORE.species.Species(species[ii]);
                     CORE.speciesLibrary.addSpeciesFromServer(specie);
                     population.push(new CORE.Process(code, specie.name));
                  }
               } else {
                  population = [new CORE.Process(CORE.ancestor.tree, "tree"),
                        new CORE.Process(CORE.ancestor.blindAnimal, "blindAnimal")];
               }
               initialisePopulation(population);
            });
   }

   function initialisePopulation(population) {
      for (var ii = 0; ii < population.length; ii += 1) {
         birthProcess(population[ii], null);
      }

   }

   /**
    * adds a process to the queue, also places it in the grid x and y are optional, if not supplied
    * will be placed randomly
    */
   function birthProcess(process, parent, x, y) {
      if (x !== undefined && y !== undefined) {
         if (!grid[x][y]) {
            initialiseProcess(process, parent, x, y);
            return true;
         } else {
            return false;
         }
      } else {
         while (true) {
            var xx = Math.round(Math.random() * (gridX - 1));
            var yy = Math.round(Math.random() * (gridY - 1));
            if (!grid[xx][yy]) {
               initialiseProcess(process, parent, xx, yy);
               return true;
            }
         }
      }
      return false;
   }

   function initialiseProcess(process, parent, x, y) {
      grid[x][y] = process;
      process.gridX = x;
      process.gridY = y;
      currentProcesses.push(process);
      var species = CORE.speciesLibrary.placeProcess(process, parent);

      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_CREATED, [process]);
      return species;
   }

   function move(process, x, y) {
      if (CORE.environment.getGrid()[x][y] !== 0) {
         attack(process, x, y);
      }
      if (grid[x][y] === 0) {
         grid[process.gridX][process.gridY] = 0;
         process.gridX = x;
         process.gridY = y;
         grid[x][y] = process;
         jQuery(document).trigger(CORE.environment.EVENT_PROCESS_MOVED, [process]);
      }
   }

   function kill(process) {
      process.killMe();
      for (var ii = 0; ii < currentProcesses.length; ii += 1) {
         if (currentProcesses[ii] == process) {
            currentProcesses.splice(ii, 1); // remove the killed process
         }
      }
      CORE.speciesLibrary.removeProcess(process);
      grid[process.gridX][process.gridY] = 0;
      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_KILLED, [process]);
   }

   /**
    * the way that this should work: the attack costs both of the assailants energy: the defender
    * loses min(attacker.cpu, defender.cpu), the attacker loses min(attacker.cpu, defender.cpu)*.9
    * 
    * this means that if the attacker loses, it doesn't die
    */
   function attack(attacker, x, y) {
      var defender = grid[x][y];
      var lowCpu = Math.min(attacker.cputime, defender.cputime);
      attacker.cputime -= (lowCpu * 0.8);
      defender.cputime -= lowCpu;
      if (defender.cputime <= 0) {
         attacker.cputime += (defender.memory.length * embodiedEnergy); // give the attacker cputime
         // and the embodied energy
         // in the body size
         kill(defender);
      }
   }

   function resizeGrid() {

      var xx;
      var yy;
      for (xx = 0; xx < gridX; xx += 1) {
         for (yy = 0; yy < gridY; yy += 1) {
            if (!grid[xx]) {
               grid[xx] = [];
            }
            if (!grid[xx][yy]) {
               grid[xx][yy] = 0;
            }
         }
      }
   }

   function shineSun() {
      for (var ii = 0; ii < currentProcesses.length; ii += 1) {
         currentProcesses[ii].incrCpuTime(1);
      }
   }

   function runSimulationLoop(ii) {
      var jj;
      for (jj = 0; jj <= instructionsPerCycle; jj += 1) {
         if (ii >= currentProcesses.length) {
            // do this first, the length of currentProcesses may have changed (one killed)
            ii = 0;
            loopCount += 1;
            shineSun();
         }
         // $.debug(currentProcesses[ii].id, currentProcesses[ii].getState());
         currentProcesses[ii].step();
         ii += 1;
      }
      // TODO: ii should not increment if the most recent process was killed.
      if (running) {
         setTimeout(function() {
                  runSimulationLoop(ii);
               }, timeDelay);
      }

   }
   // *****************************************
   // these are Lifecycle Events
   // *****************************************
   jQuery(document).ready(function() {
            CORE.speciesLibrary.checkForExtinctSpeciesRegularly();
         });
   // *****************************************
   // these are PUBLIC functions and variables
   // *****************************************
   return {
      NORTH : 0,
      EAST : 1,
      SOUTH : 2,
      WEST : 3,

      EVENT_PROCESS_CREATED : "processCreated",
      EVENT_PROCESS_MOVED : "processMoved",
      EVENT_PROCESS_KILLED : "processKilled",
      EVENT_SPECIES_CREATED : "speciesCreated",
      EVENT_SPECIES_EXTINCT : "speciesExtinct",

      mutationRate : 1000, // approximate chance of mutation (1 in x copy operations)
      startTime : 0,

      /**
       * starts the environment and runs the simulation
       */
      initialise : function() {
         initialiseEnvironment();
      },
      resetStartTime : function() {
         startTime = Number(new Date());
      },
      start : function() {
         running = true;
         runSimulationLoop(0);
         CORE.environment.resetStartTime();
         CORE.vm.resetInstrCount();
      },
      stop : function() {
         running = false;
      },

      addProcess : function(process, parent, x, y) {
         return birthProcess(process, parent, x, y);
      },
      moveProcess : function(process, x, y) {
         move(process, x, y);
      },
      killProcess : function(process) {
         kill(process);
      },
      getProcessCount : function() {
         return currentProcesses.length;
      },
      getLoopCount : function() {
         return loopCount;
      },
      getGridX : function() {
         return gridX;
      },
      getGridY : function() {
         return gridY;
      },
      isRunning : function() {
         return running;
      },
      getGrid : function() {
         return grid;
      },
      getStartTime : function() {
         return startTime;
      },
      initialiseGrid : function() {
         resizeGrid();
      },
      getCurrentProcesses : function() {
         return currentProcesses;
      },
      getSerialCode : function() {
         serialProcessIdSeries++;
         return serialProcessIdSeries;
      }
   };
}();
