CORE.environment = {
   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************
   _gridX : 80, // these are default values
   _gridY : 40,
   _timeDelay : 50, // time to delay between simulation cycles
   _instructionsPerCycle : 50,
   _running : false, // if the simulation should keep running
   _INITIAL_POPULATION_SIZE_FROM_SERVER : 15,
   _attackerBonus : 0.9,
   _allProcesses : [], // all the alive processes.
   _runningThreads : [], // all the alive threads.
   _currentThreadExecuteIndex : 0,
   _grid : [], // the grid that the processes move about on.

   _loopCount : 0, // number of instructions executed
   stepCount :0,
   unsentStepCount:0,
   embodiedEnergy : 5,

   _startTime : 0,
   _stepping : false,
   _slow: false,

   _serialProcessIdSeries : Number(new Date()), // initialise to an essentially random number
   NORTH : 0,
   EAST : 1,
   SOUTH : 2,
   WEST : 3,

   EVENT_PROCESS_CREATED : "processCreated",
   EVENT_PROCESS_MOVED : "processMoved",
   EVENT_PROCESS_KILLED : "processKilled",
   EVENT_SPECIES_CREATED : "speciesCreated",
   EVENT_SPECIES_EXTINCT : "speciesExtinct",

   VALID_SPECIES : 10,
   SUCCESS_PROXY : 75,
   mutationRate : 1000, // approximate chance of mutation (1 in x copy operations)
   startTime : 0,
   horizon : 10,


   _getSpeciesCallback : function getSpeciesCallback(species) {
      var population = [];
      if (species.length !== 0) {
         // construct a process from each species
         for ( var ii = 0; ii < species.length; ii += 1) {
            var code = CORE.assembler.convertStringToCode(species[ii].fields.code);
            species[ii].code = code;
            var specie = new CORE.species.Species(species[ii]);
            specie.saved = true;

            CORE.speciesLibrary.addSpeciesFromServer(specie);
            var process = new CORE.Process(code.slice(), specie.name);
            process.facing = Math.round(Math.random() * 3);
            population.push(process);
         }
      } else {
         population = [ new CORE.Process(CORE.ancestor.tree(), "tree"),
               new CORE.Process(CORE.ancestor.blindAnimal(), "blindAnimal"),
               new CORE.Process(CORE.ancestor.seeingAnimal(), "seeingAnimal") ];
      }
      this._initialisePopulation(population);
   },

   _initialiseEnvironment : function() {
      this._resizeGrid();
      // inject the first Process(s)
      CORE.data.getSpecies(this._INITIAL_POPULATION_SIZE_FROM_SERVER,
            $.proxy(this._getSpeciesCallback,this));
      setInterval($.proxy(this._resetCpuRate,this), 500);
      setInterval($.proxy(this._sendCpuTimeUsed,this), 60000);
   },

   _initialisePopulation : function(population) {
      for ( var ii = 0; ii < population.length; ii += 1) {
         this._birthProcess(population[ii], null);
      }

   },

   /**
    * adds a process to the queue, also places it in the grid x and y are optional, if not supplied
    * will be placed randomly
    */
   _birthProcess : function(process, parentProcess, x, y) {
      if (x !== undefined && y !== undefined) {
         if (!this._grid[x][y]) {
            this._initialiseProcess(process, parentProcess, x, y);
            return true;
         } else {
            return false;
         }
      } else {
         while (true) {
            var xx = Math.round(Math.random() * (this._gridX - 1));
            var yy = Math.round(Math.random() * (this._gridY - 1));
            if (!this._grid[xx][yy]) {
               this._initialiseProcess(process, parentProcess, xx, yy);
               return true;
            }
         }
      }
      return false;
   },

   _initialiseProcess : function(process, parentProcess, x, y) {
      this._grid[x][y] = process;
      process.gridX = x;
      process.gridY = y;
      if (parentProcess !== null) {
         process.facing = parentProcess.facing;
      }
      this._runningThreads.push(process.threads[0]);
      this._allProcesses.push(process);
      var species = CORE.speciesLibrary.placeProcess(process, parentProcess);
      jQuery(document).trigger(this.EVENT_PROCESS_CREATED, [ process ]);
      return species;
   },

   _move : function(process, x, y, wrapped) {
      var attackerWon=false;
      if (this._grid[x][y] !== 0) {
          attackerWon= this._attack(process, x, y);
      } 
      if (this._grid[x][y] === 0 || attackerWon) {
         this._grid[process.gridX][process.gridY] = 0;
         process.gridX = x;
         process.gridY = y;
         this._grid[x][y] = process;
         jQuery(document).trigger(this.EVENT_PROCESS_MOVED, [ process, wrapped ]);
      }
   },

   _removeProcessFromArrays: function(process) {
      for ( var jj = 0; jj < process.threads.length; jj += 1) {
         var thread=process.threads[jj];
         var threadIndex=this._runningThreads.indexOf(thread);
         if (threadIndex >-1) {
            this._runningThreads.splice(threadIndex, 1); // remove the killed thread
         }
      }
      var procIndex=this._allProcesses.indexOf(process);
      if (procIndex >-1) {
         this._allProcesses.splice(procIndex, 1); // remove the killed process
      }
   },
   
   _kill : function(process) {
      process.killMe();
      this._removeProcessFromArrays(process);
      CORE.speciesLibrary.removeProcess(process);
      this._grid[process.gridX][process.gridY] = 0;
      jQuery(document).trigger(this.EVENT_PROCESS_KILLED, [ process ]);
   },

   /*
    * the way that this should work: the attack costs both of the assailants energy: the defender
    * loses min(attacker.cpu, defender.cpu), the attacker loses min(attacker.cpu, defender.cpu)*.9
    * 
    * this means that if the attacker loses, it doesn't die
    */
   _attack : function attack(attacker, x, y) {
      var defender = this._grid[x][y];
      var lowCpu = Math.min(attacker.cputime, defender.cputime);
      // $.debug(attacker.cputime, defender.cputime, defender.memory.length,
      // this._embodiedEnergy);
      if (defender.cputime - lowCpu <= 0) {
         var attackerChange = (defender.memory.length * this.embodiedEnergy) - (lowCpu * this._attackerBonus);
         attacker.cputime += attackerChange;
         //$.debug("defender killed, attacker gained ", attackerChange);
         // give the attacker cputime and the embodied energy in the body size
         // $.debug("KILLED: process {defender} was attacked by {attacker} and
         // lost. Attacker gained {gain} and ended up with
         // {cputime}".supplant({attacker:attacker.name,defender:defender.name,gain:gain,cputime:attacker.cputime
         // }));
         this._kill(defender);
         return true;
      } else {
         defender.cputime -= lowCpu;
         attacker.cputime -= (lowCpu * this._attackerBonus);
         return false;
      }
   },

   _resizeGrid : function() {

      var xx;
      var yy;
      for (xx = 0; xx < this._gridX; xx += 1) {
         for (yy = 0; yy < this._gridY; yy += 1) {
            if (!this._grid[xx]) {
               this._grid[xx] = [];
            }
            if (!this._grid[xx][yy]) {
               this._grid[xx][yy] = 0;
            }
         }
      }
   },

   _shineSun : function() {
      for ( var ii = 0; ii < this._allProcesses.length; ii += 1) {
         this._allProcesses[ii].incrCpuTime(1);
      }
   },

   _endLoop: function() {
      this._currentThreadExecuteIndex = 0;
      this._loopCount += 1;
      this._shineSun();
   },
   
   _runSimulationLoop : function() {
      var start = (new Date()).getTime();
      while ((new Date()).getTime() - start < this._instructionsPerCycle) {
         this.stepCount++;
         if (this._currentThreadExecuteIndex >= this._runningThreads.length) {
            this._endLoop();
            if (this._stepping || this._slow) {
               break;
            }
         }
         var thread = this._runningThreads[this._currentThreadExecuteIndex];
         if (thread.process.dead) {
            this._removeProcessFromArrays(thread.process);
         } else {
            if (thread.step()) {
               this._currentThreadExecuteIndex += 1;
            }
         }
      }
      if (this._running) {
         setTimeout($.proxy(this._runSimulationLoop,this), this._timeDelay);
      }

   },
   _sendCpuTimeUsed : function() {
      if (this.unsentStepCount >0) {
         CORE.data.putCpuTime(this.unsentStepCount);
         CORE.displayMessage("{cpucycles}k cpu cycles sent to server".supplant({cpucycles:Math.round(this.unsentStepCount/1000)}));
         this.unsentStepCount=0;
      }
   },
   _resetCpuRate : function() {
      var secsSinceStart = (Number(new Date()) - this.getStartTime()) / 1000;
      this.current_rate = Math.round(this.stepCount / secsSinceStart);
      this.resetStartTime();
      this.unsentStepCount+=this.stepCount;
      this.stepCount=0;
   },
// *****************************************
   // these are PUBLIC functions and variables
   // *****************************************
   /**
    * starts the environment and runs the simulation
    */
   initialise : function() {
      this._initialiseEnvironment();
   },
   resetStartTime : function() {
      this._startTime = Number(new Date());
   },
   start : function() {
      this._running = true;
      this._stepping = false;
      this._slow = false;
      this._runSimulationLoop();
      this._resetCpuRate();
   },
   slow : function() {
      this._running = true;
      this._stepping = false;
      this._slow = true;
      this._runSimulationLoop();
      this._resetCpuRate();
   },
   step : function() {
      this._stepping = true;
      this._runSimulationLoop();
   },
   stop : function() {
      this._running = false;
   },

   addProcess : function(process, parentProcess, x, y) {
      return this._birthProcess(process, parentProcess, x, y);
   },
   moveProcess : function(process, x, y, wrapped) {
      this._move(process, x, y, wrapped);
   },
   killProcess : function(process) {
      this._kill(process);
   },
   getProcessCount : function() {
      return this._allProcesses.length;
   },
   getLoopCount : function() {
      return this._loopCount;
   },
   getGridX : function() {
      return this._gridX;
   },
   getGridY : function() {
      return this._gridY;
   },
   isRunning : function() {
      return this._running;
   },
   getGrid : function() {
      return this._grid;
   },
   getStartTime : function() {
      return this._startTime;
   },
   initialiseGrid : function() {
      this._resizeGrid();
   },
   getCurrentProcesses : function() {
      return this._allProcesses;
   },
   getSerialCode : function() {
      this._serialProcessIdSeries++;
      return this._serialProcessIdSeries;
   },
   setInstructionsPerCycle : function(value) {
      this._instructionsPerCycle = Math.round(value);
   },
   getProcessAtPosition : function(x, y) {
      if (this._grid[x][y] !== 0) {
         return this._grid[x][y];
      } else {
         return null;
      }
   },
   checkCanBirth : function(x, y) {
      return !Boolean(this._grid[x][y]);
   },
   addThread : function(thread) {
      this._runningThreads.push(thread);
   }

};
