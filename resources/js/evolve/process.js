CORE.Process = function Process(memory, name) {
   this.memory = memory;
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

CORE.Process.prototype.spliceMemory = function(position, elementCount, element) {
   this.memory.splice(position, elementCount, element);
};
/**
 * decrements the processes cputime, if the available cputime ever drops below
 * 0, the process is killed
 */
CORE.Process.prototype.decrCpuTime = function decrCpuTime(decrement) {
   this.cputime -= decrement;
   if (this.cputime < 0) {
      //$.debug("KILLED: {name} process ran out of cputime".supplant(this));
      CORE.environment.killProcess(this);
   }
};

CORE.Process.prototype.killMe = function() {
   for ( var i = 0; i < this.threads.length; i++) {
      this.threads[i].killMe();
   }
   //this.threads = [];
   //this.memory = [];
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

CORE.SparseArray = function() {
};
CORE.SparseArray.prototype.toString = function() {
   var result = [];
   for ( var i in this) {
      if (this.hasOwnProperty(i)) {
         result.push(i + "[" + this[i] + "]");
      }
   }
   return result.join(",");
};

CORE.Thread = function Thread(process, name) {
   this.process = process;
   this.stack = [];
   this.counter = new CORE.SparseArray();
   this.shortTermMemory = new CORE.SparseArray();
   this.executionPtr = 0;
   this.readPtr = 0;
   this.writePtr = 0;
   this.speed = 1; // speed of execution, how many instructions to
   // execute per
   // cycle, also cost of execution is speed*speed
   this.sleepCycles = 0;
   this.name = name;
};
CORE.Thread._maxStackSize = 8;
CORE.Thread.prototype.step = function threadStep() {
   if (this == this.process.threads[0]) {
      this.process.age+=1;
   }
   if (this.sleepCycles > 0) {
      this.sleepCycles -= 1;
      return ! this.process.dead;
   }
   for ( var ii = 0; ii < this.speed; ii += 1) {
      if (this.executionPtr > this.process.memory.length - 1) {
         //$.debug("Attempted to execute beyond memory limits (executed : " +
         //         this.executionPtr + ", thread.process.memory.length: " +
         //         this.process.memory.length + ")");
         CORE.environment.killProcess(this.process);
         return ! this.process.dead;
      }
      try {
         CORE.vm.execute(this);
      } catch (err) {
         //if (this.process.debug) {
         //   $(document).trigger(
         //         CORE.EVENT_LOG_MESSAGE,
         //         "process threw an error: {err}".supplant({err:err.toString}));
         // }
         if (this.process !== null) {
            //$.debug("KILLED: {name} process made a mistake".supplant(this.process));
            $.debug("(" + this.process.name + ") process threw an error: ", this.process);
         }
         $.debug(err);
         
         CORE.environment.killProcess(this.process);
      }
      if (! this.process.dead) {
         this.process.decrCpuTime(this.speed * this.speed);
         if (this.stack.length > CORE.Thread._maxStackSize && ! this.process.dead) {
            this.stack.splice(CORE.Thread._maxStackSize, this.stack.length - CORE.Thread._maxStackSize);
            // extra decrement if it does not control stack  size
            this.process.decrCpuTime(this.speed * this.speed); //decrement can result in the process being killed
         }
      }
      return ! this.process.dead;
   }
};
CORE.Thread.prototype.getState = function getState() {
   return [ this.stack, this.process.memory.length, this.executionPtr, this.readPtr, this.writePtr ];
};
CORE.Thread.prototype.killMe = function() {
//   this.process = null;
//   this.shortTermMemory = null;
//   this.stack = null;
//   this.counter = null;
};
