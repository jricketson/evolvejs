CORE.Process = Process = (memory, name) ->
  @memory = memory
  @threads = []
  @cputime = 3000
  @gridX = 0
  @gridY = 0
  @facing = 0 # (0=N,1=E,2=S,3=W)
  @dead = false
  @name = name
  @species = ""
  @age = 0
  @threads.push new CORE.Thread(this, "0")
  @id = CORE.environment.getSerialCode()

CORE.Process::spliceMemory = (position, elementCount, element) ->
  @memory.splice position, elementCount, element


###
decrements the processes cputime, if the available cputime ever drops below
0, the process is killed
###
CORE.Process::decrCpuTime = decrCpuTime = (decrement) ->
  @cputime -= decrement
  
  #$.debug("KILLED: {name} process ran out of cputime".supplant(this));
  CORE.environment.killProcess this  if @cputime < 0

CORE.Process::killMe = ->
  i = 0

  while i < @threads.length
    @threads[i].killMe()
    i++
  
  #this.threads = [];
  #this.memory = [];
  @dead = true

CORE.Process::incrCpuTime = (increment) ->
  @cputime += increment

CORE.Process::getHashCode = ->
  CORE.util.getHashCode @memory

CORE.Process::getState = getState = ->
  state = []
  i = 0

  while i < @threads.length
    state.push @threads[i].getState()
    i++
  state

CORE.SparseArray = ->

CORE.SparseArray::toString = ->
  result = []
  for i of this
    result.push i + "[" + this[i] + "]"  if @hasOwnProperty(i)
  result.join ","

CORE.Thread = Thread = (process, name) ->
  @process = process
  @stack = []
  @counter = new CORE.SparseArray()
  @shortTermMemory = new CORE.SparseArray()
  @executionPtr = 0
  @readPtr = 0
  @writePtr = 0
  @speed = 1 # speed of execution, how many instructions to
  # execute per
  # cycle, also cost of execution is speed*speed
  @sleepCycles = 0
  @name = name

CORE.Thread._maxStackSize = 8
CORE.Thread::step = threadStep = ->
  @process.age += 1  if this is @process.threads[0]
  if @sleepCycles > 0
    @sleepCycles -= 1
    return not @process.dead
  ii = 0

  while ii < @speed
    if @executionPtr > @process.memory.length - 1
      
      #$.debug("Attempted to execute beyond memory limits (executed : " +
      #         this.executionPtr + ", thread.process.memory.length: " +
      #         this.process.memory.length + ")");
      CORE.environment.killProcess @process
      return not @process.dead
    try
      CORE.vm.execute this
    catch err
      
      #if (this.process.debug) {
      #   $(document).trigger(
      #         CORE.EVENT_LOG_MESSAGE,
      #         "process threw an error: {err}".supplant({err:err.toString}));
      # }
      
      #$.debug("KILLED: {name} process made a mistake".supplant(this.process));
      $.debug "(" + @process.name + ") process threw an error: ", @process  if @process isnt null
      $.debug err
      CORE.environment.killProcess @process
    unless @process.dead
      @process.decrCpuTime @speed * @speed
      if @stack.length > CORE.Thread._maxStackSize and not @process.dead
        @stack.splice CORE.Thread._maxStackSize, @stack.length - CORE.Thread._maxStackSize
        
        # extra decrement if it does not control stack  size
        @process.decrCpuTime @speed * @speed #decrement can result in the process being killed
    return not @process.dead
    ii += 1

CORE.Thread::getState = getState = ->
  [@stack, @process.memory.length, @executionPtr, @readPtr, @writePtr]

CORE.Thread::killMe = ->

#   this.process = null;
#   this.shortTermMemory = null;
#   this.stack = null;
#   this.counter = null;
