dojo.declare("CORE.Process", null, {
         constructor : function(memory, name) {
            var op;
            this.setMemory(memory);
            this.threads = [];
            this.cputime = 3000;
            this.gridX = 0;
            this.gridY = 0;
            this.facing = 0; // (0=N,1=E,2=S,3=W)
            this.dead = false;
            this.id = 0; // give this a serial number
            this.name = name;
            this.species = "";

            this.threads.push(new CORE.Thread(this, "0"));
            this.id = CORE.environment.getSerialCode();
         },
         setMemory : function(memory) {
            this.memory = memory.slice();
            this.operands = []; // this is kept as a copy of the operands in
            // the main
            // memory. It is purely used as a read optimisation for
            // searching for operator patterns

            // assumption: this only works for operands that are two digit
            for (var ii = 0; ii < this.memory.length; ii += 1) {
               op = "" + this.memory[ii][0];
               this.operands[ii] = op.length == 1 ? '0' + op : op;
            }
         },
         /**
          * steps the process through a single cycle, may be multiple instructions, each thread gets
          * to execute
          */
         step : function() {
            for (var ii = 0; ii < this.threads.length; ii += 1) {
               this.threads[ii].step();
               if (this.dead) {
                  break;
               }
            }
         },
         /**
          * keeps a copy of the operands in a separate list. This copy is used in vm.js -
          * searchArray
          */
         spliceMemory : function(position, elementCount, element) {
            this.memory.splice(position, elementCount, element);
            var op = "" + element[0];
            this.operands.splice(position, elementCount, (op.length == 1 ? '0' + op : op));
         },
         /**
          * decrements the processes cputime, if the available cputime ever drops below 0, the
          * process is killed
          */
         decrCpuTime : function(decrement) {
            this.cputime -= decrement;
            if (this.cputime < 0) {
               CORE.environment.killProcess(this);
            }
         },

         killMe : function() {
            this.threads = [];
            this.memory = [];
            this.dead = true;
         },

         incrCpuTime : function(increment) {
            this.cputime += increment;
         },
         getHashCode : function() {
            return CORE.util.getHashCode(this.memory);
         },
         getState : function getState() {
            var state = [];
            for (var i = 0; i < this.threads.length; i++) {
               state.push(this.threads[i].getState());
            }
            return state;
         }
      });

dojo.declare("CORE.Thread", null, {
         constructor : function(process, name) {
            this.process = process;
            this.stack = [];
            this.executionPtr = 0;
            this.readPtr = 0;
            this.writePtr = 0;
            this.speed = 1; // speed of execution, how many instructions to
            // execute per
            // cycle, also cost of execution
            this.sleepCycles = 0;
            this.name = name;
         },
         step : function step() {
            if (this.sleepCycles > 0) {
               this.sleepCycles -= 1;
               return;
            }
            for (var ii = 0; ii < this.speed; ii += 1) {
               try {
                  CORE.vm.execute(this);
                  this.process.decrCpuTime(this.speed);
               } catch (err) {
                  $.debug(this.process);
                  $.debug(err);
                  CORE.environment.killProcess(this.process);
               }
            }
         },
         getState : function getState() {
            return [this.stack, this.process.memory.length, this.executionPtr, this.readPtr,
                  this.writePtr];
         }
      });
