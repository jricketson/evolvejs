CORE.vm = {
   // *****************************************
   // these are PRIVATE functions and variables
   // *****************************************

   _maxOpCode : 27,
   _maxOperand : 10000,

   _instrCount : 0,
   _OPERAND_MASK : 16777215,
   
   _indexOf : function(arr, elt, from) {
      var len = arr.length;

      for (; from < len; from++) {
         if (arr[from][0] === 0 && arr[from][1] === elt) {
            return from;
         }
      }
      return -1;
   },
   _lastIndexOf : function(arr, elt, from) {
      var len = arr.length;

      for (; from > -1; from--) {
         if (arr[from][0] === 0 && arr[from][1] === elt) {
            return from;
         }
      }
      return -1;
   },
   _searchArray : function(arr, startPt, dirForward, label) {
      if (dirForward) {
         return arr.indexOf(label,startPt);
      } else {
         return arr.lastIndexOf(label,startPt);
      }
   },

   /**
   * the search wraps around the end of memory back to the start
   */
   _jmpPtr : function(thread, start, dirForward, label, ptrName) {
      var pos = CORE.vm._searchArray(thread.process.memory, start, dirForward, label);
      if (pos == -1) {
         pos = CORE.vm._searchArray(thread.process.memory, (dirForward ? 0 : thread.process.memory.length - 1), dirForward, label);
      }
      if (pos > -1) {
         thread[ptrName] = pos;
      }
   },

   _calculateXYForward : function(curX, curY, direction) {
      var newX, newY;
      switch (direction) {
      case CORE.environment.NORTH:
         newX = curX;
         newY = curY - 1;
         if (newY < 0) {
            newY = CORE.environment.getGridY() - 1;
         }
         break;
      case CORE.environment.EAST:
         newX = curX + 1;
         newY = curY;
         if (newX > (CORE.environment.getGridX() - 1)) {
            newX = 0;
         }
         break;
      case CORE.environment.SOUTH:
         newX = curX;
         newY = curY + 1;
         if (newY > (CORE.environment.getGridY() - 1)) {
            newY = 0;
         }
         break;
      case CORE.environment.WEST:
         newX = curX - 1;
         newY = curY;
         if (newX < 0) {
            newX = CORE.environment.getGridX() - 1;
         }
         break;
      default:
         throw "Direction shouldn't be this value: " + direction;
      }
      return [ newX, newY ];

   },

   /**
    * standard behaviour of this function is to return a single element from the memory ptr,
    * occasionally this function will misbehave (intentionally) and return either: 0 elements
    * (remove an element from the copy) 1 element that is a random replacement of the original
    * instruction 2 elements, the original plus a random instruction
    */
   _elementsToCopy : function(memory, ptr) {
      var val = Math.random() * CORE.environment.mutationRate;
      //var val = 2;
      // console.log(val);
      if (val < 1) {
         // mutate
         // $.debug("Mutate!");
         var choice = val * 30; //just use the same random number, it is guaranteed to be just as random, and is always under 1
         if (choice <= 10) {
            // remove element
            // $.debug("Mutate: remove operation");
            return [];
         } else if (choice <= 20) {
            // return random element
            // $.debug("Mutate: change operation");
            return [ CORE.vm._constructRandomOperation() ];
         } else {
            // insert new random element
            // $.debug("Mutate: new operation");
            return [ memory[ptr], CORE.vm._constructRandomOperation() ];
         }
      } else {
         return [ memory[ptr] ];
      }
   },

   _constructRandomOperation : function() {
      return this.encode(Math.round(Math.random() * this._maxOpCode),
            Math.round(Math.random() * this._maxOperand) );
   },

   // *****************************************
   // these are PUBLIC functions and variables
   // *****************************************
   decode : function(instruction) {
      return [instruction >> 24, instruction & this._OPERAND_MASK];
   },
   encode : function(operator, operand) {
      return (operator << 24) + operand;
   },
   resetInstrCount : function() {
      CORE.vm._instrCount = 0;
   },
   execute : function execute(thread) { // executes a function on a thread
      try {
      if (thread.executionPtr > thread.process.memory.length - 1) {
         throw new Error("Attempted to execute beyond memory limits (executed : " +
                     thread.executionPtr + ", thread.process.memory.length: " +
                     thread.process.memory.length + ")");
      }
      var opcode = thread.process.memory[thread.executionPtr] >> 24;
      var operand = thread.process.memory[thread.executionPtr] & this._OPERAND_MASK;
      var operator =this.instructionCodes[opcode];
      } catch (err) {
         $.debug("A",err);
         throw err;
      }
      if (operator) {
         try {
            operator(thread, operand);
         } catch (err) {
            $.debug("B",err);
            throw err;
         }
         if (thread.process.debug) {
            var logtemplate = "{operator} {operand} stack[{stack}], counters[{counters}], shortMem[{shortMem}], ePtr: {ePtr}, rPtr:{rPtr}, wPtr:{wPtr}";
            $(document).trigger(
                  CORE.EVENT_LOG_MESSAGE,
                  logtemplate.supplant({operator:operator.name,
                                        operand:operand,
                                        stack:thread.stack.toString(),
                                        counters:thread.counter.toString(),
                                        shortMem:thread.shortTermMemory.toString(),
                                        ePtr:thread.executionPtr, 
                                        rPtr: thread.readPtr,
                                        wPtr: thread.writePtr
                                       }));
         }
      } else if (thread.process.debug) {
         var invalidinstructionLogtemplate = "invalid instruction: [{instruction}], stack[{stack}]";
         $(document).trigger(
               CORE.EVENT_LOG_MESSAGE,
               invalidinstructionLogtemplate.supplant({instruction:instrCode.toString(),stack:thread.stack.toString()}));
      }
      CORE.vm._instrCount += 1;
   },
   getInstrCount : function() {
      return CORE.vm._instrCount;
   }
};
CORE.vm.instructionSet = {
   nop : function nop(thread, operand) {
      thread.executionPtr += 1;
   },
   add : function add(thread, operand) {
      var a = thread.stack.pop();
      if (a !== undefined) {
         thread.stack.push(a + operand);
      } else {
         thread.stack.push(operand);
      }
      thread.executionPtr += 1;
   },
   mult : function mult(thread, operand) {
      var a = thread.stack.pop();
      if (a !== undefined) {
         thread.stack.push(a + operand);
      } else {
         thread.stack.push(0);
      }
      thread.executionPtr += 1;
   },
   dupTop : function dupTop(thread, operand) {
      var a = thread.stack.pop();
      if (a !== undefined) {
         thread.stack.push(a);
         thread.stack.push(a);
      } 
      thread.executionPtr += 1;
   },
   push : function push(thread, operand) {
      thread.stack.push(operand);
      thread.executionPtr += 1;
   },
   pop : function pop(thread, operand) {
      for ( var i = 0; i < operand; i++) {
         thread.stack.pop();
      }
      thread.executionPtr += 1;
   },
   pushM : function pushM(thread, operand) { // pushes operand from mem[operand] to stack
      if (thread.shortTermMemory[operand]===undefined) {
         thread.stack.push(0);
      } else {
         thread.stack.push(thread.shortTermMemory[operand]);
      }
      thread.executionPtr += 1;
   },
   popM : function popM(thread, operand) { // pops stack to operand at memPtr(+operand)
      if (thread.stack.length >0) {
         thread.shortTermMemory[operand] = thread.stack.pop();
      } else {
         thread.shortTermMemory[operand] = 0;
      }
      thread.executionPtr += 1;
   },
   incCounter : function incCounter(thread, operand) {
      if (thread.counter[operand] ===undefined) {
         thread.counter[operand]=1;
      } else {
         thread.counter[operand] += 1;
      }
      thread.executionPtr += 1;
   },
   resetCounter : function resetCounter(thread, operand) {
      thread.counter[operand] = 0;
      thread.executionPtr += 1;
   },
   pushCounter : function pushCounter(thread, operand) {
      if (thread.counter[operand] === undefined) {
         thread.stack.push(0);
      } else {
         thread.stack.push(thread.counter[operand]);
      }
      thread.executionPtr += 1;
   },
   pushMemSize : function pushMemSize(thread, operand) {
      thread.stack.push(thread.process.memory.length);
      thread.executionPtr += 1;
   },
   pushCpuTime : function pushCpuTime(thread, operand) {
      thread.stack.push(thread.process.cputime);
      thread.executionPtr += 1;
   },
   pushReadPtr : function pushReadPtr(thread, operand) {
      thread.stack.push(thread.readPtr);
      thread.executionPtr += 1;
   },
   pushWritePtr : function pushWritePtr(thread, operand) {
      thread.stack.push(thread.writePtr);
      thread.executionPtr += 1;
   },
   jmpReadPtrB : function jmpReadPtrB(thread, operand) { // moves to a template
      CORE.vm._jmpPtr(thread, thread.executionPtr, false, operand, "readPtr");
      thread.executionPtr += 1;
   },
   jmpReadPtrF : function jmpReadPtrF(thread, operand) { // moves to a template
      CORE.vm._jmpPtr(thread, thread.executionPtr, true, operand, "readPtr");
      thread.executionPtr += 1;
   },
   jmpWritePtrF : function jmpWritePtrF(thread, operand) { // moves to a template
      CORE.vm._jmpPtr(thread, thread.executionPtr, true, operand, "writePtr");
      thread.executionPtr += 1;
   },
   jmpB : function jmpB(thread, operand) { // jmps to a template
      CORE.vm._jmpPtr(thread, thread.executionPtr, false, operand,
            "executionPtr");
   },
   jmpF : function jmpF(thread, operand) { // jmps to a template
      CORE.vm._jmpPtr(thread, thread.executionPtr, true, operand,
            "executionPtr");
   },
   incReadPtr : function incReadPtr(thread) {
      thread.readPtr += 1;
      thread.executionPtr += 1;
   },
   incWritePtr : function incWritePtr(thread) {
      thread.writePtr += 1;
      thread.executionPtr += 1;
   },
   copy : function copy(thread) { // copies memory from readPtr to writePtr
      var eleToCopy = CORE.vm._elementsToCopy(thread.process.memory,
            thread.readPtr);
      if (eleToCopy.length == 1) {
         thread.process.spliceMemory(thread.writePtr, 1, eleToCopy[0]);
      } else if (eleToCopy.length === 0) {
         thread.process.spliceMemory(thread.writePtr, 1);
         thread.writePtr-=1;
      } else { // multiple elements
         thread.process.spliceMemory(thread.writePtr, 1, eleToCopy[0]);
         for ( var ii = 1; ii < eleToCopy.length; ii += 1) {
            thread.process.spliceMemory(thread.writePtr, 0, eleToCopy[ii]);
            thread.writePtr+=1;
         }
      }
      thread.executionPtr += 1;
   },

   lt : function lt(thread) {
      var b = thread.stack.pop();
      var a = thread.stack.pop();
      thread.stack.push((a < b) / 1);
      thread.executionPtr += 1;
   },
   gte : function gte(thread) {
      var b = thread.stack.pop();
      var a = thread.stack.pop();
      thread.stack.push((a >= b) / 1);
      thread.executionPtr += 1;
   },
   ifDo : function ifDo(thread, operand) {
      var a = thread.stack.pop();
      if (a) {
         thread.executionPtr += 1;
      } else {
         CORE.vm._jmpPtr(thread, thread.executionPtr, true, operand,
         "executionPtr");
      }
   },
   ifNotDo : function ifNotDo(thread, operand) {
      var a = thread.stack.pop();
      if (a) {
         CORE.vm._jmpPtr(thread, thread.executionPtr, true, operand,
         "executionPtr");
      } else {
         thread.executionPtr += 1;
      }
   },

   runThread : function runThread(thread) { // runs a separate thread in this process, the
      // execution ptr is set to readPtr in this thread
      var newThread = new CORE.Thread(thread.process, "" + thread.process.threads.length);
      newThread.executionPtr = thread.readPtr;
      thread.process.threads.push(newThread);
      thread.executionPtr += 1;
   },
   /*
    * The original organism keeps the state of its memory up until the read-head. The
    * offspring's memory is initialized to everything between the read-head and the
    * write-head.
    * 
    * the offspring is attempted to be placed in front of the current process (in the
    * direction that it is facing) pushes result (successful division) to stack
    */
   divideProcess : function divide(thread) {
      //$.debug(thread.readPtr, thread.writePtr);
       var coords = CORE.vm._calculateXYForward(thread.process.gridX,
             thread.process.gridY, thread.process.facing);
      if (CORE.environment.checkCanBirth(coords[0],coords[1])) {
         var newProcessMemory = thread.process.memory.splice(thread.readPtr,
               thread.writePtr - thread.readPtr);
         var newProcess = new CORE.Process(newProcessMemory, thread.process.name);
         newProcess.facing = thread.process.facing;
         
         CORE.environment.addProcess(newProcess, thread.process,
               coords[0], coords[1]);
         
         thread.process.cputime = Math.round(thread.process.cputime / 2);
         newProcess.cputime = thread.process.cputime;
         success = 1;
      } else {
         success = 0;
      }
      thread.stack.push(success);
      thread.executionPtr += 1;
      return newProcess;
   },
   alloc : function alloc(thread, operand) {
      var a = thread.stack.pop();
      var finalLength = thread.process.memory.length + a;
      for ( var ii = thread.process.memory.length; ii < finalLength; ii += 1) {
         thread.process.memory[ii] = 0;
      }
      thread.executionPtr += 1;
   },
   /**
    * looks forward and puts a structure on the stack
    * 
    * the structure on the stack is distance to next target, or -1 if none seen
    * 
    * cputime budget of target, (only if target seen)
    * 
    * memory size of budget (only if target seen)
    */
   look : function look(thread) {
      var horizon = CORE.environment.horizon;
      var coords = [ thread.process.gridX, thread.process.gridY ];
      var found = false;
      for ( var i = 0; i < horizon; i++) {
         coords = CORE.vm._calculateXYForward(coords[0], coords[1],
               thread.process.facing);
         var otherProcess = CORE.environment.getProcessAtPosition(coords[0],
               coords[1]);
         if (otherProcess !== null) {
            thread.stack.push(otherProcess.memory.length);
            thread.stack.push(otherProcess.cputime);
            thread.stack.push(i + 1);
            found = true;
            break;
         }
      }
      if (!found) {
         thread.stack.push(-1);
      }
      thread.executionPtr += 1;
   },
   turnR : function turnR(thread) {
      var facing = thread.process.facing;
      facing += 1;
      if (facing > 3) {
         facing = 0;
      }
      thread.process.facing = facing;
      thread.executionPtr += 1;
   },
   /**
    * moves one space straight ahead, if the path is not blocked.
    */
   move : function move(thread) {
      var coords = CORE.vm._calculateXYForward(thread.process.gridX,
            thread.process.gridY, thread.process.facing);
      CORE.environment.moveProcess(thread.process, coords[0], coords[1]);
      thread.executionPtr += 1;
   },
   sleep : function sleep(thread, operand) {
      thread.sleepCycles = operand;
      thread.executionPtr += 1;
   },
   setSpeed : function setSpeed(thread, operand) {
      thread.speed = operand;
      thread.executionPtr += 1;
   }
};

// This contains a code -> method mapping
CORE.vm.instructionCodes = {
   0 : CORE.vm.instructionSet.nop,
   1 : CORE.vm.instructionSet.add,
   29 : CORE.vm.instructionSet.mult,
   2 : CORE.vm.instructionSet.push,
   30 : CORE.vm.instructionSet.pop,
   34 : CORE.vm.instructionSet.dupTop,
   3 : CORE.vm.instructionSet.pushM,
   4 : CORE.vm.instructionSet.popM,
   31 : CORE.vm.instructionSet.incCounter,
   32 : CORE.vm.instructionSet.resetCounter,
   33 : CORE.vm.instructionSet.pushCounter,
   5 : CORE.vm.instructionSet.pushMemSize,
   27 : CORE.vm.instructionSet.pushCpuTime,
   6 : CORE.vm.instructionSet.pushWritePtr,
   7 : CORE.vm.instructionSet.pushReadPtr,
   8 : CORE.vm.instructionSet.jmpReadPtrB,
   9 : CORE.vm.instructionSet.jmpReadPtrF,
   10 : CORE.vm.instructionSet.incReadPtr,
   //      11:CORE.vm.instructionSet.jmpMemPtrB,
   12 : CORE.vm.instructionSet.jmpWritePtrF,
   13 : CORE.vm.instructionSet.incWritePtr,
   14 : CORE.vm.instructionSet.jmpB,
   28 : CORE.vm.instructionSet.jmpF,
   15 : CORE.vm.instructionSet.copy,
   16 : CORE.vm.instructionSet.lt,
   17 : CORE.vm.instructionSet.gte,
   18 : CORE.vm.instructionSet.ifDo,
   26 : CORE.vm.instructionSet.ifNotDo,
   19 : CORE.vm.instructionSet.runThread,
   20 : CORE.vm.instructionSet.alloc,
   21 : CORE.vm.instructionSet.divideProcess,
   22 : CORE.vm.instructionSet.look,
   23 : CORE.vm.instructionSet.turnR,
   24 : CORE.vm.instructionSet.move,
   25 : CORE.vm.instructionSet.sleep,
   35 : CORE.vm.instructionSet.setSpeed
};

// This contains a methodName -> code mapping
CORE.vm.codeInstructions = function() {
   var instructionCodes = CORE.vm.instructionCodes;
   var nameToCode = {};
   var name;
   for ( var code in instructionCodes) {
      if (instructionCodes.hasOwnProperty(code)) {
         name = CORE.getFunctionName(instructionCodes[code]);
         nameToCode[name] = Number(code);
      }
   }
   return nameToCode;
}();
