CORE.vm = function () {
   //*****************************************
   //these are PRIVATE functions and variables
   //*****************************************
   
   var maxOpCode=27;
   var maxOperand=10000;
   
   var instrCount=0;
   
   /**
      if going forward to return the index of the last element of the template
      if going backward return the index of the first instruction of the template
      the search wraps around the end of memory back to the start
   */
   /*
      options for making this more efficient:
      1. Cache the results: this has the problem that the cache should be invalidated if the processes memory changes... Might not be that useful
      2. Try using a string version of the operators to do a regex over.
      3. ...
   */
   function findTemplate(process, start, dirForward, size)
   {
      var ii;
      ii= searchArray(process, start, (dirForward ? process.memory.length : -1), dirForward, size);
      if (ii == -1) {
         return searchArray(process, (dirForward ? 0 : process.memory.length-1), start, dirForward, size);
      }
      else {
         return ii;
      }
   }
    
   function searchArray(process, startPt, endPt, dirForward, size) {
      //get the operands starting from 'start'
      var ops = dirForward ? process.operands.slice(startPt) : process.operands.slice(0,startPt).reverse();
      var strOps = ops.join("");
      var nopSearch = new RegExp("(00){"+size+",}","g");
      
      var ii=-1;
      var searchResult = nopSearch.exec(strOps);
      while (searchResult) {
         if (searchResult[0].length == size*2) {
            ii = searchResult.index / 2;
            return dirForward ? startPt + (ii + size -1) : startPt - (ii+size);
         }
         searchResult = nopSearch.exec(strOps);
      }
      return -1;

//      var ii;
//      var nopCount=0;
//      var nopCode=CORE.vm.codeInstructions.nop;
//      for (ii=startPt; ii!=endPt; ii=(dirForward ? ii+1 : ii-1)) {
//         if (process.memory[ii][0]==nopCode) {
//            nopCount+=1;
//         }
//         else if (nopCount==size){
//            return (dirForward ? ii-1 : ii+1); //step back a little
//         }      
//         else {
//            nopCount=0;
//         }
//      }
//      if (nopCount==size){
//         return (dirForward ? ii-1 : ii+1); //step back a little
//      }      
//      return -1;
   }
   
   function jmpPtr(thread, start, dirForward, size, ptrName) {
      var pos =findTemplate(thread.process, start, dirForward, size);
      if (pos>-1) {
         thread[ptrName]=pos;
      }
   
   }
   
   function calculateXYForward(curX,curY,direction) {
      var newX, newY;
      switch (direction) {
      case CORE.environment.NORTH:
         newX=curX;
         newY=curY-1;
         if (newY <0) {
            newY=CORE.environment.getGridY()-1;
         }
         break;
      case CORE.environment.EAST:
         newX=curX+1;
         newY=curY;
         if (newX >(CORE.environment.getGridX()-1)) {
            newX=0;
         }
         break;
      case CORE.environment.SOUTH:
         newX=curX;
         newY=curY+1;
         if (newY >(CORE.environment.getGridY()-1)) {
            newY=0;
         }
         break;
      case CORE.environment.WEST:
         newX=curX-1;
         newY=curY;
         if (newX <0) {
            newX=CORE.environment.getGridX()-1;
         }
         break;
      default:
         //TODO this shouldn't happen
      }
      return [newX,newY];
   
   }
   
   /**
    * standard behaviour of this function is to return a single element from the memory ptr, 
    * occasionally this function will misbehave (intentionally) and return either:
    * 0 elements (remove an element from the copy)
    * 1 element that is a random replacement of the original instruction
    * 2 elements, the original plus a random instruction
   */
   function elementsToCopy (memory, ptr) {
      var val=Math.random()*CORE.environment.mutationRate;
      //console.log(val);
      if (val<1) {
         //mutate
         $.debug("Mutate!");
         var choice = Math.random()*30;
         if (choice<=10) {
            //remove element
            $.debug("Mutate: remove operation");
            return [];
         }
         else if (choice<=20) {
            //return random element
            $.debug("Mutate: change operation");
            return [constructRandomOperation()];
         }
         else {
            //insert new random element
            $.debug("Mutate: new operation");
            return [memory[ptr],constructRandomOperation()];
         }
      }
      else {
         return [memory[ptr]];
      }
   }
   
   function constructRandomOperation() {
      return [Math.round(Math.random()*maxOpCode),Math.round(Math.random()*maxOperand)];
   }
   
  
   //*****************************************
   //these are Lifecycle Events
   //*****************************************

   //*****************************************
   //these are PUBLIC functions and variables
   //*****************************************
   return {
      resetInstrCount: function() {
         instrCount=0;
      },
      execute: function(thread) { //executes a function on a thread
         var instrCode = thread.process.memory[thread.executionPtr];
         var operator = this.instructionCodes[instrCode[0]];
         //console.log(thread.process.id, thread.name, thread.executionPtr, operator.name, instrCode);
         if (operator)
         {
            operator(thread, instrCode[1]);
         }
         instrCount+=1;
      },
      getInstrCount: function() {
         return instrCount;
      },
      instructionSet: {
         nop: function nop(thread, operand) {
            thread.executionPtr+=1;
         },
         add: function add(thread, operand){
            var a = thread.stack.pop();
            thread.stack.push(a+operand);
            thread.executionPtr+=1;
         },
         push: function push(thread, operand){
            thread.stack.push(operand);
            thread.executionPtr+=1;
         }, 
         pushM: function pushM(thread, operand) { //pushes operand from memPtr(+operand) to stack
            thread.stack.push(thread.process.memory[thread.memPtr+operand][1]);
            thread.executionPtr+=1;
         },
         popM: function popM(thread, operand) { //pops stack to operand at memPtr(+operand)
            thread.process.memory[thread.memPtr+operand][1] = thread.stack.pop();
            thread.executionPtr+=1;
         },
         pushMemSize: function pushMemSize(thread, operand){
            thread.stack.push(thread.process.memory.length);
            thread.executionPtr+=1;
         },
         pushReadPtr: function pushReadPtr(thread, operand){
            thread.stack.push(thread.readPtr);
            thread.executionPtr+=1;
         },
         pushWritePtr: function pushWritePtr(thread, operand){
            thread.stack.push(thread.writePtr);
            thread.executionPtr+=1;
         },
         jmpReadPtrB: function jmpReadPtrB(thread, operand){ //moves to a template
            jmpPtr(thread,thread.executionPtr,false, operand, "readPtr");
            thread.executionPtr+=1;
         }, 
         jmpReadPtrF: function jmpReadPtrF(thread, operand){ //moves to a template
            jmpPtr(thread,thread.executionPtr,true, operand, "readPtr");
            thread.executionPtr+=1;
         }, 
         jmpWritePtrF: function jmpWritePtrF(thread, operand){ //moves to a template
            jmpPtr(thread,thread.executionPtr,true, operand, "writePtr");
            thread.executionPtr+=1;
         }, 
         jmpMemPtrB: function jmpMemPtrB(thread, operand){ //moves to a template
            jmpPtr(thread,thread.executionPtr,false, operand, "memPtr");
            thread.executionPtr+=1;
         }, 
         jmpB: function jmpB(thread,operand){ //jmps to a template
            jmpPtr(thread,thread.executionPtr,false, operand, "executionPtr");
         },
         incReadPtr: function incReadPtr(thread){
            thread.readPtr+=1;
            thread.executionPtr+=1;
         },
         incWritePtr: function incWritePtr(thread){
            thread.writePtr+=1;
            thread.executionPtr+=1;
         },
         copy: function copy(thread){ // copies memory from readPtr to writePtr
            var eleToCopy = elementsToCopy(thread.process.memory,thread.readPtr);
            if (eleToCopy.length == 1) {
               thread.process.spliceMemory(thread.writePtr,1,eleToCopy[0]);
            }
            else if (eleToCopy.length===0) {
               thread.process.spliceMemory(thread.writePtr,1);
            }
            else { //multiple elements
               thread.process.spliceMemory(thread.writePtr,1,eleToCopy[0]);
               for (var ii=1;ii<eleToCopy.length;ii+=1) {
                  thread.process.spliceMemory(thread.writePtr,0,eleToCopy[ii]);
               }
            }
            thread.executionPtr+=1;
         }, 
   
         lt: function lt(thread){
            var b = thread.stack.pop();
            var a = thread.stack.pop();
            thread.stack.push((a<b)/1);
            thread.executionPtr+=1;
         },
         gte: function gte(thread){
            var b = thread.stack.pop();
            var a = thread.stack.pop();
            thread.stack.push((a>=b)/1);
            thread.executionPtr+=1;
         },
         ifdo: function ifdo(thread, operand){
            var a = thread.stack.pop();
            if (a) {
               thread.executionPtr+=1;
            }
            else {
               thread.executionPtr+=(1+operand);
            }
         }, 
         
         runThread: function runThread(thread){ //runs a separate thread in this process, the execution ptr is set to readPtr in this thread
            var newThread = new CORE.Thread(thread.process, ""+thread.process.threads.length);
            newThread.executionPtr=thread.readPtr;
            thread.process.threads.push(newThread);
            thread.executionPtr+=1;
         }, 
         /*
          *The original organism keeps the state of its memory up until the read-head. 
          *The offspring's memory is initialized to everything between the read-head and the write-head. 
          *All memory past the write-head is removed entirely.         
          *
          * the offspring is attempted to be placed in front of the current process (in the direction that it is facing)
          * pushes result (successful division) to stack
         */
         divideProcess: function divide(thread){
            var newProcessMemory=thread.process.memory.slice(thread.readPtr,thread.writePtr);
            var oldProcessMemory=thread.process.memory.slice(0,thread.readPtr);
            var newProcess = new CORE.Process(newProcessMemory);
            newProcess.facing = thread.process.facing;
            var coords = calculateXYForward(thread.process.gridX, thread.process.gridY,thread.process.facing);
            
            var success = CORE.environment.addProcess(newProcess,coords[0],coords[1]);
            if (success) {
               thread.process.memory=oldProcessMemory;
               thread.process.cputime=Math.round(thread.process.cputime/2);
               newProcess.cputime=thread.process.cputime;
            }
               
            thread.stack.push(success/1);
            thread.executionPtr+=1;
            return newProcess;
         }, 
         alloc: function alloc(thread, operand) {
            var a = thread.stack.pop();
            var finalLength=thread.process.memory.length+a;
            for (var ii=thread.process.memory.length;ii<finalLength;ii+=1) {
               thread.process.memory[ii]=0;
            }
            thread.executionPtr+=1;
         },
         look: function look(thread){ //looks in a set direction as a % of a full circle 0 = 0deg, 50 = 180deg
            //TODO
            thread.executionPtr+=1;
         }, 
         turnR: function turnR(thread){
            var facing = thread.process.facing;
            facing +=1;
            if (facing>3) {
               facing=0;
            }
            thread.process.facing=facing;
            thread.executionPtr+=1;
         },
         move: function move(thread) { //moves one space straight ahead, if the path is not blocked.
            var coords = calculateXYForward(thread.process.gridX, thread.process.gridY,thread.process.facing);
            CORE.environment.moveProcess(thread.process, coords[0],coords[1]);
            thread.executionPtr+=1;
         },
         sleep: function sleep(thread, operand){
            thread.sleepCycles=operand;
            thread.executionPtr+=1;
         }
      }
   };
}();

//This contains a code -> method mapping
CORE.vm.instructionCodes = {
      0:CORE.vm.instructionSet.nop,
      1:CORE.vm.instructionSet.add,
      2:CORE.vm.instructionSet.push,
      3:CORE.vm.instructionSet.pushM,
      4:CORE.vm.instructionSet.popM,
      5:CORE.vm.instructionSet.pushMemSize,
      6:CORE.vm.instructionSet.pushWritePtr,
      7:CORE.vm.instructionSet.pushReadPtr,
      8:CORE.vm.instructionSet.jmpReadPtrB,
      9:CORE.vm.instructionSet.jmpReadPtrF,
      10:CORE.vm.instructionSet.incReadPtr,
      11:CORE.vm.instructionSet.jmpMemPtrB,
      12:CORE.vm.instructionSet.jmpWritePtrF,
      13:CORE.vm.instructionSet.incWritePtr,
      14:CORE.vm.instructionSet.jmpB,
      15:CORE.vm.instructionSet.copy,
      16:CORE.vm.instructionSet.lt,
      17:CORE.vm.instructionSet.gte,
      18:CORE.vm.instructionSet.ifdo,
      19:CORE.vm.instructionSet.runThread,
      20:CORE.vm.instructionSet.alloc,
      21:CORE.vm.instructionSet.divideProcess,
      22:CORE.vm.instructionSet.look,
      23:CORE.vm.instructionSet.turnR,
      24:CORE.vm.instructionSet.move,
      25:CORE.vm.instructionSet.sleep
};

//This contains a methodName -> code mapping
CORE.vm.codeInstructions = function() {
   var instructionCodes = CORE.vm.instructionCodes;
   var nameToCode={};
   var name;
   for (var code in instructionCodes) {
      if (instructionCodes.hasOwnProperty(code)) {
         name = CORE.getFunctionName(instructionCodes[code]);
         nameToCode[name]=Number(code);
      }
   }
   return nameToCode;
}();
