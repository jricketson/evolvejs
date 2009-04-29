CORE.ancestor = function() {
   return {

      /**
       * startThread at T3
       * T5 //Reproduction thread
       * while (true) {
       *    move readPtr to start of animal
       *    allocate memory at the end of the animal of the same size as the animal
       *    move writePtr to start of new animal
       *    while(writePtr < memoryLength) {
       *       copy from readPtr to writePtr
       *       increment readPtr
       *       increment writePtr
       *    }
       *    T6
       *    if (!divide) {
       *       turnRight
       *       goto T6
       *    }
       *    turnRight
       *    sleep 405
       * }
       * T3 //Movement thread
       * while (true) {
       *    move
       *    sleep 20
       * }
       */
      blindAnimal : function() {
         return CORE.assembler.compile([
               // START
               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], //T4

               // initialise threads
               ["jmpReadPtrF", 3], 
               ["runThread", 0], // 5

               // repro cell
               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], //T5 // 10
               ["jmpReadPtrB", 4], // jmp to template 4
               ["jmpWritePtrF", 2], // jmp to template 2
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["incWritePtr", 0], // inc write pointer to start of new animal

               ["nop", 0], //T1 // start copy loop //15
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], // 20
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 1], 
               ["jmpB", 1], // jmp to template 1

               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], //T6

               ["divide", 0], 
               ["ifDo", 3], // if division successful
               ["turnR", 0], 
               ["sleep", 405], 
               ["jmpB", 5], // 25

               ["turnR", 0], // turn around and try again
               ["jmpB", 6],

               // move cell
               ["nop", 0], ["nop", 0], ["nop", 0], //T3
               ["move", 0], 
               ["sleep", 20], 
               ["jmpB", 3],

               // END
               ["nop", 0], ["nop", 0] //T2

         ]);
      },

      /**
       * startThread at T3
       * T5 //Reproduction thread
       * while (true) {
       *    while (me.cputime > 1000) {
       *       sleep 100
       *    }
       *    move readPtr to start of animal
       *    allocate memory at the end of the animal of the same size as the animal
       *    move writePtr to start of new animal
       *    while(writePtr < memoryLength) {
       *       copy from readPtr to writePtr
       *       increment readPtr
       *       increment writePtr
       *    }
       *    T6
       *    if (!divide) {
       *       turnRight
       *       goto T6
       *    }
       *    turnRight
       * }
       * T3 //Movement thread
       * while (true) {
       *    look
       *    targetSpaces = target.distance
       *    if (target && target.cputime < me.cputime && target.memoryLength *5 > target.cputime) {
       *       for (i=0;i<targetSpaces;i++) {
       *          move
       *       }
       *    } else {
       *       turnRight
       *    }
       * }
       */
      seeingAnimal : function() {
         return CORE.assembler.compile([
               // START
               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0],["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],  //T10
               ["turnR",0],
               ["move",0],
               ["move",0],
               ["move",0],
               ["move",0],
               ["move",0],
               ["move",0],
               ["move",0],
               ["turnR",0],
               ["move",0],
               ["move",0],

               // initialise threads
               ["jmpReadPtrF", 3], 
               ["runThread", 0], // 5

               // repro cell
               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], //T5 
               ["pushCpuTime",0],
               ["push", 3000],
               ["lt",0],
               ["ifDo",2],
               ["sleep",100],
               ["jmpB",5],
               ["jmpReadPtrB", 10], // jmp to template 10
               ["jmpWritePtrF", 2], // jmp to template 2
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["incWritePtr", 0], // inc write pointer to start of new animal

               ["nop", 0],["nop", 0],["nop", 0],["nop", 0], //T4 // start copy loop
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], 
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 1], 
               ["jmpB", 4], // jmp to template 4

               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], //T6

               ["divide", 0], 
               ["ifDo", 3], // if division successful
               ["turnR", 0], 
               ["jmpB", 5], 

               ["turnR", 0], // turn around and try again
               ["jmpB", 6],

       /* while (true) {
       *    look
       *    targetSpaces = target.distance
       *    if (target.distance < 0 && target.cputime < me.cputime && target.cputime < target.memoryLength *5) {
       *       for (i=0;i<targetSpaces;i++) {
       *          move
       *       }
       *    } else {
       *       turnRight
       *       turns+=1
       *       if (turns=4) {
       *       move
       *       turns=0
       *       }
       *       
       *    }
       * }
       */
               ["nop", 0], ["nop", 0], ["nop", 0], //T3
               ["resetCounter", 3], //var turn counter
               ["jmpF", 7],
               ["nop", 0], ["nop", 0], ["nop", 0],["nop", 0], ["nop", 0], ["nop", 0],["nop", 0], //T7
               ["look", 0], 
               ["popM",0],//var targetSpaces
               ["popM",1],//var cpuTime
               ["popM",2],//var size
               ["pushM",0],//var targetSpaces
               ["push", 0],
               ["lt",0],
               ["ifDo", 1], 
               ["jmpF", 8], //goto else

               ["pushM",1], //var target.cputime
               ["pushCpuTime",0],
               ["lt",0],
               ["ifNotDo",2],
               ["pop",1],
               ["jmpF", 8], //goto else

/*               ["mult", 5],
               ["pushM", 1], //target.cputime
               ["gte",0],
               ["ifDo", 1],*/
               ["jmpF",9],
               
               //["jmpF",8],
               //else
               ["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],["nop", 0], ["nop", 0], //T8
               ["turnR", 0], 
               ["incCounter",3],
               ["pushCounter",3],
               ["push",4],
               ["gte",0],
               ["ifDo",2],
               ["move",0],
               ["resetCounter",3],
               //["sleep", 10], 
               ["jmpB", 7],
               
               //moveToTarget function
               ["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],["nop", 0], ["nop", 0],["nop", 0], //T9
               ["resetCounter",2],//var loop counter
               ["jmpF", 1],
               ["nop", 0], //T1
               ["pushM",0],
               ["pushCounter",2],
               ["lt",0],
               ["ifDo",1],
               ["jmpB",7],
               ["incCounter",2],
               ["move",0],
               ["jmpB",1],

               // END
               ["nop", 0], ["nop", 0] //T2
         ]);
      },
      tree : function() {
         return CORE.assembler.compile([
               // START
               // repro cell
               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], // 5
               ["jmpReadPtrB", 5], // jmp to template 5
               ["jmpWritePtrF", 2], // jmp to template 2
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["incWritePtr", 0], // inc write pointer to start of new animal, 10

               ["nop", 0], // start copy loop
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], // 15
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 1], 
               ["jmpB", 1], // jmp to template 3

               ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], ["nop", 0], // template
                                                                                       // 6, 25

               ["divide", 0], 
               ["ifDo", 1], // if division successful
               ["jmpB", 5],

               // count the number of times that this has happened
               ["pushM", 0], // 30
               ["add", 1], 
               ["popM", 0], 
               ["pushM", 0], 
               ["push", 4], 
               ["gte", 0], // 35
               ["ifDo", 3], 
               ["sleep", 450], 
               ["push", 0], 
               ["popM", 0],

               ["turnR", 0], // turn around and try again //40
               ["jmpB", 6],

               // END
               ["nop", 0], ["nop", 0] // 43

               ]);
      }

   };
}();