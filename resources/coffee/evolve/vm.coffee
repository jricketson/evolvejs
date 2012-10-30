CORE.vm =
  
  # *****************************************
  # these are PRIVATE functions and variables
  # *****************************************
  _maxOpCode: 27
  _maxOperand: 10000
  _OPERAND_MASK: 16777215
  _indexOf: (arr, elt, from) ->
    len = arr.length
    while from < len
      return from  if arr[from][0] is 0 and arr[from][1] is elt
      from++
    -1

  _lastIndexOf: (arr, elt, from) ->
    len = arr.length
    while from > -1
      return from  if arr[from][0] is 0 and arr[from][1] is elt
      from--
    -1

  _searchArray: (arr, startPt, dirForward, label) ->
    if dirForward
      arr.indexOf label, startPt
    else
      arr.lastIndexOf label, startPt

  
  ###
  the search wraps around the end of memory back to the start
  ###
  _jmpPtr: (thread, start, dirForward, label, ptrName) ->
    pos = CORE.vm._searchArray(thread.process.memory, start, dirForward, label)
    pos = CORE.vm._searchArray(thread.process.memory, ((if dirForward then 0 else thread.process.memory.length - 1)), dirForward, label)  if pos is -1
    if pos > -1
      thread[ptrName] = pos
    else
      thread[ptrName] = start + 1

  _calculateXYForward: (curX, curY, direction) ->
    newX = undefined
    newY = undefined
    wrap = false
    switch direction
      when CORE.environment.NORTH
        newX = curX
        newY = curY - 1
        if newY < 0
          newY = CORE.environment.getGridY() - 1
          wrap = true
      when CORE.environment.EAST
        newX = curX + 1
        newY = curY
        if newX > (CORE.environment.getGridX() - 1)
          newX = 0
          wrap = true
      when CORE.environment.SOUTH
        newX = curX
        newY = curY + 1
        if newY > (CORE.environment.getGridY() - 1)
          newY = 0
          wrap = true
      when CORE.environment.WEST
        newX = curX - 1
        newY = curY
        if newX < 0
          newX = CORE.environment.getGridX() - 1
          wrap = true
      else
        throw "Direction shouldn't be this value: " + direction
    [newX, newY, wrap]

  
  ###
  standard behaviour of this function is to return a single element from the memory ptr,
  occasionally this function will misbehave (intentionally) and return either: 0 elements
  (remove an element from the copy) 1 element that is a random replacement of the original
  instruction 2 elements, the original plus a random instruction
  ###
  _elementsToCopy: (memory, ptr) ->
    val = Math.random() * CORE.environment.mutationRate
    
    #var val = 2;
    # console.log(val);
    if val < 1
      
      # mutate
      # $.debug("Mutate!");
      choice = val * 30 #just use the same random number, it is guaranteed to be just as random, and is always under 1
      if choice <= 10
        
        # remove element
        # $.debug("Mutate: remove operation");
        []
      else if choice <= 20
        
        # return random element
        # $.debug("Mutate: change operation");
        [CORE.vm._constructRandomOperation()]
      else
        
        # insert new random element
        # $.debug("Mutate: new operation");
        [memory[ptr], CORE.vm._constructRandomOperation()]
    else
      [memory[ptr]]

  _constructRandomOperation: ->
    @encode Math.round(Math.random() * @_maxOpCode), Math.round(Math.random() * @_maxOperand)

  
  # *****************************************
  # these are PUBLIC functions and variables
  # *****************************************
  decode: (instruction) ->
    [instruction >> 24, instruction & @_OPERAND_MASK]

  encode: (operator, operand) ->
    (operator << 24) + operand

  execute: execute = (thread) -> # executes a function on a thread
    opcode = thread.process.memory[thread.executionPtr] >> 24
    operand = thread.process.memory[thread.executionPtr] & @_OPERAND_MASK
    operator = @instructionCodes[opcode]
    if operator
      operator thread, operand
      if thread.process.debug
        logtemplate = "{operator} {operand} stack[{stack}], counters[{counters}], shortMem[{shortMem}], ePtr: {ePtr}, rPtr:{rPtr}, wPtr:{wPtr}"
        $(document).trigger CORE.EVENT_LOG_MESSAGE, logtemplate.supplant(
          operator: operator.name
          operand: operand
          stack: thread.stack.toString()
          counters: thread.counter.toString()
          shortMem: thread.shortTermMemory.toString()
          ePtr: thread.executionPtr
          rPtr: thread.readPtr
          wPtr: thread.writePtr
        )
    else if thread.process.debug
      invalidinstructionLogtemplate = "invalid instruction: [{instruction}], stack[{stack}]"
      $(document).trigger CORE.EVENT_LOG_MESSAGE, invalidinstructionLogtemplate.supplant(
        instruction: instrCode.toString()
        stack: thread.stack.toString()
      )

CORE.vm.instructionSet =
  nop: nop = (thread, operand) ->
    thread.executionPtr += 1

  add: add = (thread, operand) ->
    a = thread.stack.pop()
    if a isnt `undefined`
      thread.stack.push a + operand
    else
      thread.stack.push operand
    thread.executionPtr += 1

  mult: mult = (thread, operand) ->
    a = thread.stack.pop()
    if a isnt `undefined`
      thread.stack.push a * operand
    else
      thread.stack.push 0
    thread.executionPtr += 1

  dupTop: dupTop = (thread, operand) ->
    a = thread.stack.pop()
    if a isnt `undefined`
      thread.stack.push a
      thread.stack.push a
    thread.executionPtr += 1

  push: push = (thread, operand) ->
    thread.stack.push operand
    thread.executionPtr += 1

  pop: pop = (thread, operand) ->
    i = 0

    while i < operand
      thread.stack.pop()
      i++
    thread.executionPtr += 1

  pushM: pushM = (thread, operand) -> # pushes operand from mem[operand] to stack
    if thread.shortTermMemory[operand] is `undefined`
      thread.stack.push 0
    else
      thread.stack.push thread.shortTermMemory[operand]
    thread.executionPtr += 1

  popM: popM = (thread, operand) -> # pops stack to operand at memPtr(+operand)
    if thread.stack.length > 0
      thread.shortTermMemory[operand] = thread.stack.pop()
    else
      thread.shortTermMemory[operand] = 0
    thread.executionPtr += 1

  incCounter: incCounter = (thread, operand) ->
    if thread.counter[operand] is `undefined`
      thread.counter[operand] = 1
    else
      thread.counter[operand] += 1
    thread.executionPtr += 1

  resetCounter: resetCounter = (thread, operand) ->
    thread.counter[operand] = 0
    thread.executionPtr += 1

  pushCounter: pushCounter = (thread, operand) ->
    if thread.counter[operand] is `undefined`
      thread.stack.push 0
    else
      thread.stack.push thread.counter[operand]
    thread.executionPtr += 1

  pushMemSize: pushMemSize = (thread, operand) ->
    thread.stack.push thread.process.memory.length
    thread.executionPtr += 1

  pushCpuTime: pushCpuTime = (thread, operand) ->
    thread.stack.push thread.process.cputime
    thread.executionPtr += 1

  pushSpeciesHashcode: pushSpeciesHashcode = (thread, operand) ->
    thread.stack.push thread.process.species.hashcode
    thread.executionPtr += 1

  pushReadPtr: pushReadPtr = (thread, operand) ->
    thread.stack.push thread.readPtr
    thread.executionPtr += 1

  pushWritePtr: pushWritePtr = (thread, operand) ->
    thread.stack.push thread.writePtr
    thread.executionPtr += 1

  jmpReadPtrB: jmpReadPtrB = (thread, operand) -> # moves to a template
    CORE.vm._jmpPtr thread, thread.executionPtr, false, operand, "readPtr"
    thread.executionPtr += 1

  jmpReadPtrF: jmpReadPtrF = (thread, operand) -> # moves to a template
    CORE.vm._jmpPtr thread, thread.executionPtr, true, operand, "readPtr"
    thread.executionPtr += 1

  jmpWritePtrF: jmpWritePtrF = (thread, operand) -> # moves to a template
    CORE.vm._jmpPtr thread, thread.executionPtr, true, operand, "writePtr"
    thread.executionPtr += 1

  jmpB: jmpB = (thread, operand) -> # jmps to a template
    CORE.vm._jmpPtr thread, thread.executionPtr, false, operand, "executionPtr"

  jmpF: jmpF = (thread, operand) -> # jmps to a template
    CORE.vm._jmpPtr thread, thread.executionPtr, true, operand, "executionPtr"

  incReadPtr: incReadPtr = (thread) ->
    thread.readPtr += 1
    thread.executionPtr += 1

  incWritePtr: incWritePtr = (thread) ->
    thread.writePtr += 1
    thread.executionPtr += 1

  copy: copy = (thread) -> # copies memory from readPtr to writePtr
    eleToCopy = CORE.vm._elementsToCopy(thread.process.memory, thread.readPtr)
    memoryLength = thread.process.memory.length
    throw "writeptr or readptr points past the allocated space"  if thread.writePtr > memoryLength or thread.readPtr > memoryLength
    if eleToCopy.length is 1
      thread.process.spliceMemory thread.writePtr, 1, eleToCopy[0]
    else if eleToCopy.length is 0
      thread.process.spliceMemory thread.writePtr, 1
      thread.writePtr -= 1
    else # multiple elements
      thread.process.spliceMemory thread.writePtr, 1, eleToCopy[0]
      ii = 1

      while ii < eleToCopy.length
        thread.process.spliceMemory thread.writePtr, 0, eleToCopy[ii]
        thread.writePtr += 1
        ii += 1
    thread.executionPtr += 1

  lt: lt = (thread) ->
    a = thread.stack.pop()
    b = thread.stack.pop()
    if a is `undefined` or b is `undefined`
      thread.stack.push 0
    else
      thread.stack.push (b < a) / 1
    thread.executionPtr += 1

  gte: gte = (thread) ->
    a = thread.stack.pop()
    b = thread.stack.pop()
    if a is `undefined` or b is `undefined`
      thread.stack.push 0
    else
      thread.stack.push (b >= a) / 1
    thread.executionPtr += 1

  eq: eq = (thread) ->
    a = thread.stack.pop()
    b = thread.stack.pop()
    if a is `undefined` or b is `undefined`
      thread.stack.push 0
    else
      thread.stack.push (b is a) / 1
    thread.executionPtr += 1

  ifDo: ifDo = (thread, operand) ->
    a = thread.stack.pop()
    if a
      thread.executionPtr += 1
    else
      CORE.vm._jmpPtr thread, thread.executionPtr, true, operand, "executionPtr"

  ifNotDo: ifNotDo = (thread, operand) ->
    a = thread.stack.pop()
    if a
      CORE.vm._jmpPtr thread, thread.executionPtr, true, operand, "executionPtr"
    else
      thread.executionPtr += 1

  runThread: runThread = (thread) -> # runs a separate thread in this process, the
    # execution ptr is set to readPtr in this thread
    newThread = new CORE.Thread(thread.process, "" + thread.process.threads.length)
    newThread.executionPtr = thread.readPtr
    thread.process.threads.push newThread
    CORE.environment.addThread newThread
    thread.executionPtr += 1

  
  #
  #    * The original organism keeps the state of its memory up until the read-head. The
  #    * offspring's memory is initialized to everything between the read-head and the
  #    * write-head.
  #    * 
  #    * the offspring is attempted to be placed in front of the current process (in the
  #    * direction that it is facing) pushes result (successful division) to stack
  #    
  divide: divide = (thread) ->
    
    #$.debug(thread.readPtr, thread.writePtr);
    coords = CORE.vm._calculateXYForward(thread.process.gridX, thread.process.gridY, thread.process.facing)
    if CORE.environment.checkCanBirth(coords[0], coords[1])
      newProcessMemory = thread.process.memory.splice(thread.readPtr, thread.writePtr - thread.readPtr)
      newProcess = new CORE.Process(newProcessMemory, thread.process.name)
      newProcess.facing = thread.process.facing
      CORE.environment.addProcess newProcess, thread.process, coords[0], coords[1]
      thread.process.cputime = Math.round(thread.process.cputime / 2)
      newProcess.cputime = thread.process.cputime
      success = 1
    else
      success = 0
    thread.stack.push success
    thread.executionPtr += 1
    newProcess

  alloc: alloc = (thread, operand) ->
    a = thread.stack.pop()
    success = true
    if a isnt `undefined`
      cost = CORE.environment.embodiedEnergy * a
      if thread.process.cputime > cost
        thread.process.decrCpuTime cost
        finalLength = thread.process.memory.length + a
        ii = thread.process.memory.length

        while ii < finalLength
          thread.process.memory[ii] = 0
          ii += 1
      else
        success = false
    thread.stack.push success
    thread.executionPtr += 1

  
  ###
  looks forward and puts a structure on the stack
  
  the structure on the stack is distance to next target, or -1 if none seen
  
  cputime budget of target, (only if target seen)
  
  memory size of budget (only if target seen)
  ###
  look: look = (thread) ->
    horizon = CORE.environment.horizon
    coords = [thread.process.gridX, thread.process.gridY]
    found = false
    i = 0

    while i < horizon
      coords = CORE.vm._calculateXYForward(coords[0], coords[1], thread.process.facing)
      otherProcess = CORE.environment.getProcessAtPosition(coords[0], coords[1])
      if otherProcess isnt null
        thread.stack.push otherProcess.species.hashCode
        thread.stack.push otherProcess.memory.length
        thread.stack.push otherProcess.cputime
        thread.stack.push i + 1
        found = true
        break
      i++
    unless found
      thread.stack.push 0
      thread.stack.push 0
      thread.stack.push 0
      thread.stack.push -1
    thread.executionPtr += 1

  turnR: turnR = (thread) ->
    facing = thread.process.facing
    facing += 1
    facing = 0  if facing > 3
    thread.process.facing = facing
    thread.executionPtr += 1

  turnL: turnR = (thread) ->
    facing = thread.process.facing
    facing -= 1
    facing = 3  if facing < 0
    thread.process.facing = facing
    thread.executionPtr += 1

  
  ###
  moves one space straight ahead, if the path is not blocked.
  ###
  move: move = (thread) ->
    coords = CORE.vm._calculateXYForward(thread.process.gridX, thread.process.gridY, thread.process.facing)
    CORE.environment.moveProcess thread.process, coords[0], coords[1], coords[2]
    thread.executionPtr += 1

  sleep: sleep = (thread, operand) ->
    thread.sleepCycles = operand
    thread.executionPtr += 1

  setSpeed: setSpeed = (thread, operand) ->
    thread.speed = operand
    thread.executionPtr += 1


# This contains a code -> method mapping
CORE.vm.instructionCodes =
  0: CORE.vm.instructionSet.nop
  1: CORE.vm.instructionSet.add
  29: CORE.vm.instructionSet.mult
  2: CORE.vm.instructionSet.push
  30: CORE.vm.instructionSet.pop
  34: CORE.vm.instructionSet.dupTop
  3: CORE.vm.instructionSet.pushM
  4: CORE.vm.instructionSet.popM
  31: CORE.vm.instructionSet.incCounter
  32: CORE.vm.instructionSet.resetCounter
  33: CORE.vm.instructionSet.pushCounter
  5: CORE.vm.instructionSet.pushMemSize
  27: CORE.vm.instructionSet.pushCpuTime
  37: CORE.vm.instructionSet.pushSpeciesHashcode
  6: CORE.vm.instructionSet.pushWritePtr
  7: CORE.vm.instructionSet.pushReadPtr
  8: CORE.vm.instructionSet.jmpReadPtrB
  9: CORE.vm.instructionSet.jmpReadPtrF
  10: CORE.vm.instructionSet.incReadPtr
  
  #      11:CORE.vm.instructionSet.jmpMemPtrB,
  12: CORE.vm.instructionSet.jmpWritePtrF
  13: CORE.vm.instructionSet.incWritePtr
  14: CORE.vm.instructionSet.jmpB
  28: CORE.vm.instructionSet.jmpF
  15: CORE.vm.instructionSet.copy
  16: CORE.vm.instructionSet.lt
  17: CORE.vm.instructionSet.gte
  18: CORE.vm.instructionSet.ifDo
  26: CORE.vm.instructionSet.ifNotDo
  19: CORE.vm.instructionSet.runThread
  20: CORE.vm.instructionSet.alloc
  21: CORE.vm.instructionSet.divide
  22: CORE.vm.instructionSet.look
  23: CORE.vm.instructionSet.turnR
  36: CORE.vm.instructionSet.turnL
  24: CORE.vm.instructionSet.move
  25: CORE.vm.instructionSet.sleep
  35: CORE.vm.instructionSet.setSpeed
  36: CORE.vm.instructionSet.eq


CORE.vm.getOperatorName= (operator) ->
  for own name, fn of CORE.vm.instructionSet
    return name if operator is fn

# This contains a methodName -> code mapping
CORE.vm.codeInstructions = (->
  nameToCode = {}
  for own code, instruction of CORE.vm.instructionCodes
    name = CORE.vm.getOperatorName(instruction)
    nameToCode[name] = Number(code)
  nameToCode
)()
