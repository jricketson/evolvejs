CORE.ancestor = {

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
               ["nop", 4], //T4

               // initialise threads
               ["jmpReadPtrF", 3], 
               ["runThread", 0], // 5

               // repro cell
               ["nop", 5], //T5 // 10
               ["jmpReadPtrB", 4], // jmp to template 4
               ["jmpWritePtrF", 2], // jmp to template 2
               ["nop",201],
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["ifNotDo", 200],
               ["sleep", 450],
               ["jmpB", 201],
               ["nop",200],
               ["incWritePtr", 0], // inc write pointer to start of new animal

               ["nop", 1], //T1 // start copy loop //15
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], // 20
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 6], 
               ["jmpB", 1], // jmp to template 1

               ["nop", 6], //T6

               ["divide", 0], 
               ["ifDo", 7], // if division successful
               ["turnR", 0], 
               ["sleep", 405], 
               ["jmpB", 5], // 25

               ["nop", 7], 
               ["turnR", 0], // turn around and try again
               ["jmpB", 6],

               // move cell
               ["nop", 3], //T3
               ["move", 0], 
               ["sleep", 20], 
               ["jmpB", 3],

               // END
               ["nop", 2] //T2

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
               ["nop", 10],  //T10
               ["move",0],
               ["turnR",0],
               ["move",0],
               ["move",0],
               //["move",0],
               //["move",0],
               //["move",0],
               //["move",0],
               //["move",0],
               //["move",0],
               //["turnR",0],
               //["move",0],

               // initialise threads
               ["jmpReadPtrF", 3], 
               ["runThread", 0], // 5

               // repro cell
               ["nop", 5], //T5 
               //["pushCpuTime",0],
               //["push", 3000],
               //["lt",0],
               //["ifDo",11],
               //["sleep",100],
               //["jmpB",5],
               //["nop", 11],
               ["sleep",1000],

               ["jmpReadPtrB", 10], // jmp to template 10
               ["jmpWritePtrF", 2], // jmp to template 2
               ["nop",201],
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["ifNotDo", 200],
               ["sleep", 450],
               ["jmpB", 201],
               ["nop",200],
               ["incWritePtr", 0], // inc write pointer to start of new animal

               ["nop", 4], //T4 // start copy loop
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], 
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 6], 
               ["jmpB", 4], // jmp to template 4

               ["nop", 6], //T6

               ["divide", 0], 
               ["ifDo", 12], // if division successful
               ["jmpB", 5], 

               ["nop", 12],
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
               ["nop", 3], //T3
               ["look", 0], 
               ["popM",0],//var targetSpaces
               ["popM",1],//var cpuTime
               ["popM",2],//var size
               ["pushM",0],//var targetSpaces
               ["push", 0],
               ["lt",0],
               ["ifDo", 13], //was there an animal?
               ["jmpF", 8], //goto else

               ["nop", 13],
               ["pushM",1], //var target.cputime
               ["pushCpuTime",0],
               ["lt",0],
               ["ifDo",8],
               ["pushM",2], //var target.cputime
               ["pushMemSize",0],
               ["lt",0],
               ["ifDo",8],
               ["jmpF", 9], 

/*               ["mult", 5],
               ["pushM", 1], //target.cputime
               ["gte",0],
               ["ifDo", 1],*/
               
               //["jmpF",8],
               //else
               ["nop", 8], //T8
               ["turnR", 0], 
               ["incCounter",3],
               ["pushCounter",3],
               ["push",4],
               ["gte",0],
               ["ifDo",14],
               ["move",0],
               ["resetCounter",3],
               //["sleep", 10], 
               ["nop", 14],
               ["jmpB", 3],
               
               //moveToTarget function
               ["nop", 9], //T9
               ["resetCounter",2],//var loop counter
               ["nop", 1],
               ["pushM",0],
               ["pushCounter",2],
               ["lt",0],
               ["ifDo",15],
               ["jmpB",3],
               ["nop", 15],
               ["incCounter",2],
               ["move",0],
               ["jmpB",1],

               // END
               ["nop", 2]//T2
         ]);
      },
      tree : function() {
         return CORE.assembler.compile([
               // START
               // repro cell
               ["nop", 5],
               ["jmpReadPtrB", 5], // jmp to template 5
               ["jmpWritePtrF", 2], // jmp to template 2
               ["nop",201],
               ["pushMemSize", 0], 
               ["alloc", 0], 
               ["ifNotDo", 200],
               ["sleep", 450],
               ["jmpB", 201],
               ["nop",200],
               ["incWritePtr", 0], // inc write pointer to start of new animal, 5

               ["nop", 1], // start copy loop
               ["copy", 0], 
               ["incReadPtr", 0], 
               ["incWritePtr", 0],

               ["pushWritePtr", 0], 
               ["pushMemSize", 0], // if writeptr < memSize
               ["lt", 0], 
               ["ifDo", 6], 
               ["jmpB", 1],
               ["nop", 6], 

               ["divide", 0], 
               ["ifDo", 9], // if division successful
					["jmpB", 5],
					["nop", 9],
					 
               // count the number of times that this has happened
               ["incCounter", 0], 
               ["pushCounter", 0], 
               ["push", 4], 
               ["gte", 0],
               ["ifDo", 8],
               ["sleep", 450], 
               ["resetCounter", 0], 

               ["nop", 8], 
               ["turnR", 0], // turn around and try again 
               ["jmpB", 6],

               // END
               ["nop", 2] 

               ]);
      }

   };
