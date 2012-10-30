CORE.ancestor =
  
  ###
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
  ###
  blindAnimal: ->
    
    # START
    #T4
    
    # initialise threads
    # 5
    
    # repro cell
    #T5 // 10
    # jmp to template 4
    # jmp to template 2
    # inc write pointer to start of new animal
    #T1 // start copy loop //15
    # 20
    # if writeptr < memSize
    # jmp to template 1
    #T6
    # if division successful
    # 25
    # turn around and try again
    
    # move cell
    #T3
    
    # END
    CORE.assembler.compile [["nop", 4], ["jmpReadPtrF", 3], ["runThread", 0], ["nop", 5], ["jmpReadPtrB", 4], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 1], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 1], ["nop", 6], ["divide", 0], ["ifDo", 7], ["turnR", 0], ["sleep", 405], ["jmpB", 5], ["nop", 7], ["turnR", 0], ["jmpB", 6], ["nop", 3], ["move", 0], ["sleep", 20], ["jmpB", 3], ["nop", 2]] #T2

  
  ###
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
  ###
  seeingAnimal: ->
    
    # START
    #T10
    
    #["move",0],
    #["move",0],
    #["move",0],
    #["move",0],
    #["move",0],
    #["move",0],
    #["turnR",0],
    #["move",0],
    
    # initialise threads
    # 5
    
    # repro cell
    #T5 
    #["pushCpuTime",0],
    #["push", 3000],
    #["lt",0],
    #["ifDo",11],
    #["sleep",100],
    #["jmpB",5],
    #["nop", 11],
    # jmp to template 10
    # jmp to template 2
    # inc write pointer to start of new animal
    #T4 // start copy loop
    # if writeptr < memSize
    # jmp to template 4
    #T6
    # if division successful
    # turn around and try again
    
    # while (true) {
    #       *    look
    #       *    targetSpaces = target.distance
    #       *    if (target.distance < 0 && target.cputime < me.cputime && target.cputime < target.memoryLength *5) {
    #       *       for (i=0;i<targetSpaces;i++) {
    #       *          move
    #       *       }
    #       *    } else {
    #       *       turnRight
    #       *       turns+=1
    #       *       if (turns=4) {
    #       *       move
    #       *       turns=0
    #       *       }
    #       *       
    #       *    }
    #       * }
    #       
    #T3
    #var targetSpaces
    #var cpuTime
    #var size
    #var targetSpaces
    #was there an animal?
    #goto else
    #var target.cputime
    #var target.cputime
    
    #               ["mult", 5],
    #               ["pushM", 1], //target.cputime
    #               ["gte",0],
    #               ["ifDo", 1],
    
    #["jmpF",8],
    #else
    #T8
    
    #["sleep", 10], 
    
    #moveToTarget function
    #T9
    #var loop counter
    
    # END
    CORE.assembler.compile [["nop", 10], ["move", 0], ["turnR", 0], ["move", 0], ["move", 0], ["jmpReadPtrF", 3], ["runThread", 0], ["nop", 5], ["sleep", 1000], ["jmpReadPtrB", 10], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 4], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 4], ["nop", 6], ["divide", 0], ["ifDo", 12], ["jmpB", 5], ["nop", 12], ["turnR", 0], ["jmpB", 6], ["nop", 3], ["look", 0], ["popM", 0], ["popM", 1], ["popM", 2], ["pushM", 0], ["push", 0], ["lt", 0], ["ifDo", 13], ["jmpF", 8], ["nop", 13], ["pushM", 1], ["pushCpuTime", 0], ["lt", 0], ["ifDo", 8], ["pushM", 2], ["pushMemSize", 0], ["lt", 0], ["ifDo", 8], ["jmpF", 9], ["nop", 8], ["turnR", 0], ["incCounter", 3], ["pushCounter", 3], ["push", 4], ["gte", 0], ["ifDo", 14], ["move", 0], ["resetCounter", 3], ["nop", 14], ["jmpB", 3], ["nop", 9], ["resetCounter", 2], ["nop", 1], ["pushM", 0], ["pushCounter", 2], ["lt", 0], ["ifDo", 15], ["jmpB", 3], ["nop", 15], ["incCounter", 2], ["move", 0], ["jmpB", 1], ["nop", 2]] #T2

  tree: ->
    
    # START
    # repro cell
    # jmp to template 5
    # jmp to template 2
    # inc write pointer to start of new animal, 5
    # start copy loop
    # if writeptr < memSize
    # if division successful
    
    # count the number of times that this has happened
    # turn around and try again 
    
    # END
    CORE.assembler.compile [["nop", 5], ["jmpReadPtrB", 5], ["jmpWritePtrF", 2], ["nop", 201], ["pushMemSize", 0], ["alloc", 0], ["ifNotDo", 200], ["sleep", 450], ["jmpB", 201], ["nop", 200], ["incWritePtr", 0], ["nop", 1], ["copy", 0], ["incReadPtr", 0], ["incWritePtr", 0], ["pushWritePtr", 0], ["pushMemSize", 0], ["lt", 0], ["ifDo", 6], ["jmpB", 1], ["nop", 6], ["divide", 0], ["ifDo", 9], ["jmpB", 5], ["nop", 9], ["incCounter", 0], ["pushCounter", 0], ["push", 4], ["gte", 0], ["ifDo", 8], ["sleep", 450], ["resetCounter", 0], ["nop", 8], ["turnR", 0], ["jmpB", 6], ["nop", 2]]
