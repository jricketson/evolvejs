CORE.Process = function(memory, name) {
   this.setMemory(memory);
   this.threads = [];
   this.cputime = 3000;
   this.gridX = 0;
   this.gridY = 0;
   this.facing = 0; // (0=N,1=E,2=S,3=W)
   this.dead = false;
   this.name = name;
   this.species = "";
   this.age = 0;

   this.threads.push(new CORE.Thread(this, "0"));
   this.id = CORE.environment.getSerialCode();
};
CORE.Process.prototype.setMemory = function(memory) {
   this.memory = memory.slice(); //copies the memory passed in to a new array
   for ( var ii = 0; ii < this.memory.length; ii += 1) {
      "" + this.memory[ii][0]; // without this somewhere else throws
      // an error, and I don't understand
      // why...
   }
};
/**
 * steps the process through a single cycle, may be multiple instructions, each
 * thread gets to execute
 */
CORE.Process.prototype.step = function() {
   this.age += 1;
   for ( var ii = 0; ii < this.threads.length; ii += 1) {
      this.threads[ii].step();
      if (this.dead) {
         break;
      }
   }
};
/**
 * keeps a copy of the operands in a separate list. This copy is used in vm.js -
 * searchArray
 */
CORE.Process.prototype.spliceMemory = function(position, elementCount, element) {
   this.memory.splice(position, elementCount, element);
};
/**
 * decrements the processes cputime, if the available cputime ever drops below
 * 0, the process is killed
 */
CORE.Process.prototype.decrCpuTime = function(decrement) {
   this.cputime -= decrement;
   if (this.cputime < 0) {
      CORE.environment.killProcess(this);
   }
};

CORE.Process.prototype.killMe = function() {
   for (var i = 0;i<this.threads.length;i++) {
      this.threads[i].killMe();
   }
   this.threads = [];
   this.memory = [];
   this.dead = true;
};
CORE.Process.prototype.incrCpuTime = function(increment) {
   this.cputime += increment;
};
CORE.Process.prototype.getHashCode = function() {
   return CORE.util.getHashCode(this.memory);
};
CORE.Process.prototype.getState = function getState() {
   var state = [];
   for ( var i = 0; i < this.threads.length; i++) {
      state.push(this.threads[i].getState());
   }
   return state;
};

CORE.Thread = function(process, name) {
   this.process = process;
   this.stack = [];
   this.counter = [];
   this.shortTermMemory = [];
   this.executionPtr = 0;
   this.readPtr = 0;
   this.writePtr = 0;
   this.speed = 1; // speed of execution, how many instructions to
   // execute per
   // cycle, also cost of execution
   this.sleepCycles = 0;
   this.name = name;
};
CORE.Thread.prototype.step = function step() {
   if (this.sleepCycles > 0) {
      this.sleepCycles -= 1;
      return;
   }
   for ( var ii = 0; ii < this.speed; ii += 1) {
      try {
         CORE.vm.execute(this);
         this.process.decrCpuTime(this.speed);
      } catch (err) {
         $.debug("(" + this.process.name + ") process threw an error: ", this.process);
         $.debug(err);
         CORE.environment.killProcess(this.process);
      }
   }
};
CORE.Thread.prototype.getState = function getState() {
   return [ this.stack, this.process.memory.length, this.executionPtr,
         this.readPtr, this.writePtr ];
};
CORE.Thread.prototype.killMe = function() {
   this.process = null;
   this.shortTermMemory = null;
   this.stack = null;
   this.counter = null;
};

