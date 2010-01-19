CORE.environment = {
   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   _gridX : 80, // these are default values
   _gridY : 40,
   _timeDelay : 0, // time to delay between simulation cycles
   _instructionsPerCycle : 50,
   _running : false, // if the simulation should keep running
   _INITIAL_POPULATION_SIZE_FROM_SERVER : 10,

   _currentProcesses : [], // all the currently alive processes.
   _grid : [], // the grid that the processes move about on. They are not actually stored here.

   _loopCount : 0, // number of instructions executed

   _embodiedEnergy : 5,

   _startTime : 0,

   _serialProcessIdSeries : Number(new Date()), // initialise to an essentially random number

   _initialiseEnvironment : function() {
      CORE.environment._resizeGrid();
      // inject the first Process(s)
      CORE.data
            .getSpecies(CORE.environment._INITIAL_POPULATION_SIZE_FROM_SERVER,
                  function(species) {
                     var population = [];
                     if (species.length !== 0) {
                        // construct a process from each species
                  for ( var ii = 0; ii < species.length; ii += 1) {
                     var code = CORE.data
                           .convertStringToCode(species[ii].fields.code);
                     species[ii].code = code;
                     var specie = new CORE.species.Species(species[ii]);
                     CORE.speciesLibrary.addSpeciesFromServer(specie);
                     population.push(new CORE.Process(code, specie.name));
                  }
               } else {
                  population = [
                        new CORE.Process(CORE.ancestor.tree(), "tree"),
                        new CORE.Process(CORE.ancestor.blindAnimal(),
                              "blindAnimal"),
                        new CORE.Process(CORE.ancestor.seeingAnimal(),
                              "seeingAnimal") ];
               }
               CORE.environment._initialisePopulation(population);
            });
   },

   _initialisePopulation : function(population) {
      for ( var ii = 0; ii < population.length; ii += 1) {
         CORE.environment._birthProcess(population[ii], null);
      }

   },

   /**
    * adds a process to the queue, also places it in the grid x and y are optional, if not supplied
    * will be placed randomly
    */
   _birthProcess : function(process, parent, x, y) {
      if (x !== undefined && y !== undefined) {
         if (!CORE.environment._grid[x][y]) {
            CORE.environment._initialiseProcess(process, parent, x, y);
            return true;
         } else {
            return false;
         }
      } else {
         while (true) {
            var xx = Math.round(Math.random() * (CORE.environment._gridX - 1));
            var yy = Math.round(Math.random() * (CORE.environment._gridY - 1));
            if (!CORE.environment._grid[xx][yy]) {
               CORE.environment._initialiseProcess(process, parent, xx, yy);
               return true;
            }
         }
      }
      return false;
   },

   _initialiseProcess : function(process, parent, x, y) {
      CORE.environment._grid[x][y] = process;
      process.gridX = x;
      process.gridY = y;
      CORE.environment._currentProcesses.push(process);
      var species = CORE.speciesLibrary.placeProcess(process, parent);
      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_CREATED,
            [ process ]);
      return species;
   },

   _move : function(process, x, y) {
      if (CORE.environment._grid[x][y] !== 0) {
         CORE.environment._attack(process, x, y);
      }
      if (CORE.environment._grid[x][y] === 0) {
         CORE.environment._grid[process.gridX][process.gridY] = 0;
         process.gridX = x;
         process.gridY = y;
         CORE.environment._grid[x][y] = process;
         jQuery(document).trigger(CORE.environment.EVENT_PROCESS_MOVED,
               [ process ]);
      }
   },

   _kill : function(process) {
      process.killMe();
      for ( var ii = 0; ii < CORE.environment._currentProcesses.length; ii += 1) {
         if (CORE.environment._currentProcesses[ii] == process) {
            CORE.environment._currentProcesses.splice(ii, 1); // remove the
            // killed process
         }
      }
      CORE.speciesLibrary.removeProcess(process);
      CORE.environment._grid[process.gridX][process.gridY] = 0;
      jQuery(document).trigger(CORE.environment.EVENT_PROCESS_KILLED,
            [ process ]);
   },

   /*
    * the way that this should work: the attack costs both of the assailants energy: the defender
    * loses min(attacker.cpu, defender.cpu), the attacker loses min(attacker.cpu, defender.cpu)*.9
    * 
    * this means that if the attacker loses, it doesn't die
    */
   _attack : function(attacker, x, y) {
      var defender = CORE.environment._grid[x][y];
      var lowCpu = Math.min(attacker.cputime, defender.cputime);
      attacker.cputime -= (lowCpu * 0.8);
      defender.cputime -= lowCpu;
      if (defender.cputime <= 0) {
         attacker.cputime += (defender.memory.length * CORE.environment._embodiedEnergy);
         // give the attacker cputime and the embodied energy in the body size
         kill(defender);
      }
   },

   _resizeGrid : function() {

      var xx;
      var yy;
      for (xx = 0; xx < CORE.environment._gridX; xx += 1) {
         for (yy = 0; yy < CORE.environment._gridY; yy += 1) {
            if (!CORE.environment._grid[xx]) {
               CORE.environment._grid[xx] = [];
            }
            if (!CORE.environment._grid[xx][yy]) {
               CORE.environment._grid[xx][yy] = 0;
            }
         }
      }
   },

   _shineSun : function() {
      for ( var ii = 0; ii < CORE.environment._currentProcesses.length; ii += 1) {
         CORE.environment._currentProcesses[ii].incrCpuTime(1);
      }
   },

   _runSimulationLoop : function(ii) {
      var jj;
      var start = (new Date()).getTime();
      for (jj = 0; (new Date()).getTime() - start < CORE.environment._instructionsPerCycle; jj += 1) {
         if (ii >= CORE.environment._currentProcesses.length) {
            // do this first, the length of currentProcesses may have changed (one killed)
            ii = 0;
            CORE.environment._loopCount += 1;
            CORE.environment._shineSun();
         }
         // $.debug(currentProcesses[ii].id, currentProcesses[ii].getState());
         CORE.environment._currentProcesses[ii].step();
         ii += 1;
      }
      // TODO: ii should not increment if the most recent process was killed.
      if (CORE.environment._running) {
         setTimeout( function() {
            CORE.environment._runSimulationLoop(ii);
         }, CORE.environment._timeDelay);
      }

   },
   // *****************************************
   // these are PUBLIC functions and variables
   // *****************************************
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
   horizon : 10,

   /**
    * starts the environment and runs the simulation
    */
   initialise : function() {
      CORE.environment._initialiseEnvironment();
   },
   resetStartTime : function() {
      CORE.environment._startTime = Number(new Date());
   },
   start : function() {
      CORE.environment._running = true;
      CORE.environment._runSimulationLoop(0);
      CORE.environment.resetStartTime();
      CORE.vm.resetInstrCount();
   },
   stop : function() {
      CORE.environment._running = false;
   },

   addProcess : function(process, parent, x, y) {
      return CORE.environment._birthProcess(process, parent, x, y);
   },
   moveProcess : function(process, x, y) {
      CORE.environment._move(process, x, y);
   },
   killProcess : function(process) {
      CORE.environment._kill(process);
   },
   getProcessCount : function() {
      return CORE.environment._currentProcesses.length;
   },
   getLoopCount : function() {
      return CORE.environment._loopCount;
   },
   getGridX : function() {
      return CORE.environment._gridX;
   },
   getGridY : function() {
      return CORE.environment._gridY;
   },
   isRunning : function() {
      return CORE.environment._running;
   },
   getGrid : function() {
      return CORE.environment._grid;
   },
   getStartTime : function() {
      return CORE.environment._startTime;
   },
   initialiseGrid : function() {
      CORE.environment._resizeGrid();
   },
   getCurrentProcesses : function() {
      return CORE.environment._currentProcesses;
   },
   getSerialCode : function() {
      CORE.environment._serialProcessIdSeries++;
      return CORE.environment._serialProcessIdSeries;
   },
   setInstructionsPerCycle : function(value) {
      CORE.environment._instructionsPerCycle = Math.round(value);
   },
   getProcessAtPosition : function(x, y) {
      if (CORE.environment._grid[x][y] !== 0) {
         return CORE.environment._grid[x][y];
      } else {
         return null;
      }
   }
};

// *****************************************
// these are Lifecycle Events
// *****************************************
jQuery(document).ready( function() {
   CORE.speciesLibrary.checkForExtinctSpeciesRegularly();
});
