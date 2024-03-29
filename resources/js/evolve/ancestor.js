// Generated by CoffeeScript 1.4.0
(function() {

  CORE.ancestor = {
    /*
      startThread at T3
      T5 //Reproduction thread
      while (true) {
      move readPtr to start of animal
      allocate memory at the end of the animal of the same size as the animal
      move writePtr to start of new animal
      while(writePtr < memoryLength) {
      copy from readPtr to writePtr
      increment readPtr
      increment writePtr
      }
      T6
      if (!divide) {
      turnRight
      goto T6
      }
      turnRight
      sleep 405
      }
      T3 //Movement thread
      while (true) {
      move
      sleep 20
      }
    */

    blindAnimal: function() {
      return CORE.assembler.compile([["nop", 4], ["jmpReadPtrF", 3], ["runThread", 0], ["nop", 5], ["jmpReadPtrB", 4], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 1], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 1], ["nop", 6], ["divide", 0], ["ifDo", 7], ["turnR", 0], ["sleep", 405], ["jmpB", 5], ["nop", 7], ["turnR", 0], ["jmpB", 6], ["nop", 3], ["move", 0], ["sleep", 20], ["jmpB", 3], ["nop", 2]]);
    },
    /*
      startThread at T3
      T5 //Reproduction thread
      while (true) {
      while (me.cputime > 1000) {
      sleep 100
      }
      move readPtr to start of animal
      allocate memory at the end of the animal of the same size as the animal
      move writePtr to start of new animal
      while(writePtr < memoryLength) {
      copy from readPtr to writePtr
      increment readPtr
      increment writePtr
      }
      T6
      if (!divide) {
      turnRight
      goto T6
      }
      turnRight
      }
      T3 //Movement thread
      while (true) {
      look
      targetSpaces = target.distance
      if (target && target.cputime < me.cputime && target.memoryLength *5 > target.cputime) {
      for (i=0;i<targetSpaces;i++) {
      move
      }
      } else {
      turnRight
      }
      }
    */

    seeingAnimal: function() {
      return CORE.assembler.compile([["nop", 10], ["move", 0], ["turnR", 0], ["move", 0], ["move", 0], ["jmpReadPtrF", 3], ["runThread", 0], ["nop", 5], ["sleep", 1000], ["jmpReadPtrB", 10], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 4], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 4], ["nop", 6], ["divide", 0], ["ifDo", 12], ["jmpB", 5], ["nop", 12], ["turnR", 0], ["jmpB", 6], ["nop", 3], ["look", 0], ["popM", 0], ["popM", 1], ["popM", 2], ["pushM", 0], ["push", 0], ["lt", 0], ["ifDo", 13], ["jmpF", 8], ["nop", 13], ["pushM", 1], ["pushCpuTime", 0], ["lt", 0], ["ifDo", 8], ["pushM", 2], ["pushMemSize", 0], ["lt", 0], ["ifDo", 8], ["jmpF", 9], ["nop", 8], ["turnR", 0], ["incCounter", 3], ["pushCounter", 3], ["push", 4], ["gte", 0], ["ifDo", 14], ["move", 0], ["resetCounter", 3], ["nop", 14], ["jmpB", 3], ["nop", 9], ["resetCounter", 2], ["nop", 1], ["pushM", 0], ["pushCounter", 2], ["lt", 0], ["ifDo", 15], ["jmpB", 3], ["nop", 15], ["incCounter", 2], ["move", 0], ["jmpB", 1], ["nop", 2]]);
    },
    tree: function() {
      return CORE.assembler.compile([["nop", 5], ["jmpReadPtrB", 5], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 1], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 1], ["nop", 6], ["divide", 0], ["ifDo", 9], ["jmpB", 5], ["nop", 9], ["incCounter", 0], ["pushCounter", 0], ["push", 4], ["gte", 0], ["ifDo", 8], ["sleep", 450], ["resetCounter", 0], ["nop", 8], ["turnR", 0], ["jmpB", 6], ["nop", 2]]);
    }
  };

}).call(this);
