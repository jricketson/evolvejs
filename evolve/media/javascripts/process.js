EVO.Process = function(memory) {
   this.memory=memory;
   this.operands=[]; // this is kept as a copy of the operands in the main memory. It is purely used as a read optimisation
   var op;
   //assumption: this only works for operands that are two digit
   for (var ii=0;ii<this.memory.length;ii+=1) {
      op=""+this.memory[ii][0]; 
      this.operands[ii]= op.length==1 ? '0'+op : op;
   }
   this.threads=[];
   this.cputime=3000;
   this.gridX=0;
   this.gridY=0;
   this.facing=0; //(0=N,1=E,2=S,3=W)
   this.dead=false;
   this.id=0; //give this a serial number
   this.species="";
   
};

/**
 * steps the process through a single cycle, may be multiple instructions, each thread gets to execute
 */
EVO.Process.prototype.step = function() {
   for (var ii = 0; ii< this.threads.length; ii+=1) {
      this.threads[ii].step();
      if (this.dead) {
         break;
      }
   }
};

//keeps a copy of the operands in a separate list. This copy is used in vm.js - searchArray
EVO.Process.prototype.spliceMemory=function(position,elementCount,element) {
   this.memory.splice(position,elementCount,element);
   var op=""+element[0];
   this.operands.splice(position,elementCount,(op.length==1 ? '0'+op : op));
};
/**
* sets up the first thread
*/ 
EVO.Process.prototype.initialise = function() {
   this.threads.push(new EVO.Thread(this, "0"));
   this.id=Number(new Date());
};

/**
   decrements the processes cputime, if the available cputime ever drops below 0, the process is killed
*/
EVO.Process.prototype.decrCpuTime = function(decrement) {
   this.cputime-=decrement;
   if (this.cputime < 0) {
      EVO.environment.killProcess(this);
   }
};

EVO.Process.prototype.killMe = function() {
   this.threads=[];
   this.memory=[];
   this.dead=true;
};

EVO.Process.prototype.incrCpuTime = function(increment) {
   this.cputime+=increment;
};

EVO.Process.MAXHASHCHECK=20;

EVO.Process.prototype.getHashCode = function(){
   //returns a hashcode for the memory
   var hash=0;
   var maxcheck=EVO.Process.MAXHASHCHECK;
   for (var ii = 0; ii<this.memory.length && ii < maxcheck;ii+=1) {
      hash+=(this.memory[ii][0]+1+this.memory[ii][1])*ii;
   }
   return hash;
};

EVO.Thread = function(process, name) {
   this.process = process;
   this.stack=[];
   this.executionPtr=0;
   this.readPtr=0;
   this.writePtr=0;
   this.speed=1; //speed of execution, how many instructions to execute per cycle, also cost of execution
   this.sleepCycles=0;
   this.name=name;
};

EVO.Thread.prototype.step = function(){
   if (this.sleepCycles>0) {
      this.sleepCycles-=1;
      return;
   }
   for (var ii=0; ii<this.speed; ii+=1) {
      try {
         EVO.vm.execute(this);
         this.process.decrCpuTime(this.speed);
      }
      catch (err) {
         console.log(this.process.memory);
         console.log(err);
         EVO.environment.killProcess(this.process);
      }
   }
};