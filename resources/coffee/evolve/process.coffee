class Process 
  constructor: (@memory, @name) ->
    @threads = []
    @cputime = 3000
    @gridX = 0
    @gridY = 0
    @facing = 0 # (0=N,1=E,2=S,3=W)
    @dead = false
    @species = ""
    @age = 0
    @threads.push new CORE.Thread(this, "0")
    @id = CORE.environment().getSerialCode()

  spliceMemory: (position, elementCount, element) ->
    @memory.splice position, elementCount, element

  ###
  decrements the processes cputime, if the available cputime ever drops below
  0, the process is killed
  ###
  decrCpuTime: (decrement) ->
    @cputime -= decrement
    CORE.environment().killProcess this  if @cputime < 0

  killMe: ->
    thread.killMe() for thread in @threads
    @dead = true

  incrCpuTime: (increment) -> @cputime += increment
  getHashCode: -> CORE.util.getHashCode @memory
  getState: -> (thread.getState() for thread in @threads)

window.CORE.Process = Process
class SparseArray
  toString: -> (k + "[" + v + "]" for own k,v of this).join(',')

window.CORE.SparseArray = SparseArray

class Thread
  @_maxStackSize= 8
  constructor: (@process, @name) ->
    @stack = []
    @counter = new CORE.SparseArray()
    @shortTermMemory = new CORE.SparseArray()
    @executionPtr = 0
    @readPtr = 0
    @writePtr = 0
    @speed = 1 
    # speed of execution, how many instructions to
    # execute per
    # cycle, also cost of execution is speed*speed
    @sleepCycles = 0

  step: ->
    @process.age += 1 if this is @process.threads[0]
    if @sleepCycles > 0
      @sleepCycles -= 1
      return not @process.dead

    for ii in [0...@speed]
      if @executionPtr > @process.memory.length - 1
        CORE.environment().killProcess @process
        return false
      try
        CORE.vm.execute this
      catch err
        $.debug "(" + @process.name + ") process threw an error: ", @process if @process?
        $.debug err
        CORE.environment().killProcess @process
      unless @process.dead
        @process.decrCpuTime @speed * @speed
        if @stack.length > CORE.Thread._maxStackSize and not @process.dead
          @stack.splice CORE.Thread._maxStackSize, @stack.length - CORE.Thread._maxStackSize
          
          # extra decrement if it does not control stack  size
          @process.decrCpuTime @speed * @speed #decrement can result in the process being killed
      return not @process.dead #TODO: this seems to mean that it only ever executes one loop

  getState: ->
    [@stack, @process.memory.length, @executionPtr, @readPtr, @writePtr]

  killMe: ->
    #   this.process = null;
    #   this.shortTermMemory = null;
    #   this.stack = null;
    #   this.counter = null;

window.CORE.Thread = Thread
