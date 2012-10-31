CORE.environment =
  
  # *****************************************
  # these are PRIVATE functions and variables
  # *****************************************
  _gridX: 80 # these are default values
  _gridY: 40
  _timeDelay: 50 # time to delay between simulation cycles
  _executeMillisecondsPerCycle: 50
  _running: false # if the simulation should keep running
  _INITIAL_POPULATION_SIZE_FROM_SERVER: 15
  _attackerBonus: 0.5
  _allProcesses: [] # all the alive processes.
  _runningThreads: [] # all the alive threads.
  _currentThreadExecuteIndex: 0
  _grid: [] # the grid that the processes move about on.
  _loopCount: 0 # number of instructions executed
  stepCount: 0
  unsentStepCount: 0
  embodiedEnergy: 5
  _startTime: 0
  _stepping: false
  _slow: false
  _serialProcessIdSeries: Number(new Date()) # initialise to an essentially random number
  NORTH: 0
  EAST: 1
  SOUTH: 2
  WEST: 3
  EVENT_PROCESS_CREATED: "processCreated"
  EVENT_PROCESS_MOVED: "processMoved"
  EVENT_PROCESS_KILLED: "processKilled"
  EVENT_SPECIES_CREATED: "speciesCreated"
  EVENT_SPECIES_EXTINCT: "speciesExtinct"
  VALID_SPECIES: 10
  SUCCESS_PROXY: 75
  mutationRate: 1000 # approximate chance of mutation (1 in x copy operations)
  startTime: 0
  horizon: 10

  _getSpeciesCallback: (species) ->
    if species.length isnt 0
      # construct a process from each species
      population = (
        for specieCode in species
          code = CORE.assembler.convertStringToCode(specieCode.fields.code)
          specieCode.code = code
          specie = new CORE.species.Species(specieCode)
          specie.saved = true
          CORE.speciesLibrary().addSpeciesFromServer specie
          process = new CORE.Process(code.slice(), specie.name)
          process.facing = Math.round(Math.random() * 3)
          process
      )
    else
      population = [
        new CORE.Process(CORE.ancestor.tree(), "tree"), 
        new CORE.Process(CORE.ancestor.blindAnimal(), "blindAnimal"), 
        new CORE.Process(CORE.ancestor.seeingAnimal(), "seeingAnimal")
      ]
    @_initialisePopulation population

  _initialiseEnvironment: ->
    @_resizeGrid()
    
    # inject the first Process(s)
    CORE.data.getSpecies @_INITIAL_POPULATION_SIZE_FROM_SERVER, $.proxy(@_getSpeciesCallback, this)
    setInterval $.proxy(@_resetCpuRate, this), 500
    setInterval $.proxy(@_sendCpuTimeUsed, this), 60000

  _initialisePopulation: (population) ->
    @_birthProcess(p, null) for p in population
  
  ###
  adds a process to the queue, also places it in the grid x and y are optional, if not supplied
  will be placed randomly
  ###
  _birthProcess: (process, parentProcess, x, y) ->
    if x? and y?
      unless @_grid[x][y]
        @_initialiseProcess process, parentProcess, x, y
        return true
      else
        return false
    else
      loop
        xx = Math.round(Math.random() * (@_gridX - 1))
        yy = Math.round(Math.random() * (@_gridY - 1))
        unless @_grid[xx][yy]
          @_initialiseProcess process, parentProcess, xx, yy
          return true
    false

  _initialiseProcess: (process, parentProcess, x, y) ->
    @_grid[x][y] = process
    process.gridX = x
    process.gridY = y
    process.facing = parentProcess.facing  if parentProcess isnt null
    @_runningThreads.push process.threads[0]
    @_allProcesses.push process
    species = CORE.speciesLibrary().placeProcess(process, parentProcess)
    jQuery(document).trigger @EVENT_PROCESS_CREATED, [process]
    species

  _move: (process, x, y, wrapped) ->
    attackerWon = false
    attackerWon = @_attack(process, x, y)  if @_grid[x][y] isnt 0
    if @_grid[x][y] is 0 or attackerWon
      @_grid[process.gridX][process.gridY] = 0
      process.gridX = x
      process.gridY = y
      @_grid[x][y] = process
      jQuery(document).trigger @EVENT_PROCESS_MOVED, [process, wrapped]

  _removeProcessFromArrays: (process) ->
    for thread in process.threads
      threadIndex = @_runningThreads.indexOf(thread)
      @_runningThreads.splice threadIndex, 1  if threadIndex > -1 # remove the killed thread
    procIndex = @_allProcesses.indexOf(process)
    @_allProcesses.splice procIndex, 1  if procIndex > -1 # remove the killed process

  _kill: (process) ->
    process.killMe()
    @_removeProcessFromArrays process
    CORE.speciesLibrary().removeProcess process
    @_grid[process.gridX][process.gridY] = 0
    jQuery(document).trigger @EVENT_PROCESS_KILLED, [process]

  
  #
  #    * the way that this should work: the attack costs both of the assailants energy: the defender
  #    * loses min(attacker.cpu, defender.cpu), the attacker loses min(attacker.cpu, defender.cpu)*.9
  #    * 
  #    * this means that if the attacker loses, it doesn't die
  #    
  _attack: (attacker, x, y) ->
    defender = @_grid[x][y]
    lowCpu = Math.min(attacker.cputime, defender.cputime)
    
    # $.debug(attacker.cputime, defender.cputime, defender.memory.length,
    # this._embodiedEnergy);
    if defender.cputime - lowCpu <= 0
      attackerChange = (defender.memory.length * @embodiedEnergy) - (lowCpu * @_attackerBonus)
      attacker.cputime += attackerChange
      
      #$.debug("defender killed, attacker gained ", attackerChange);
      # give the attacker cputime and the embodied energy in the body size
      # $.debug("KILLED: process {defender} was attacked by {attacker} and
      # lost. Attacker gained {gain} and ended up with
      # {cputime}".supplant({attacker:attacker.name,defender:defender.name,gain:gain,cputime:attacker.cputime
      # }));
      @_kill defender
      true
    else
      defender.cputime -= lowCpu
      attacker.cputime -= (lowCpu * @_attackerBonus)
      false

  _resizeGrid: ->
    for xx in [0...@_gridX]
      for yy in [0...@_gridY]
        @_grid[xx] = []  unless @_grid[xx]
        @_grid[xx][yy] = 0  unless @_grid[xx][yy]

  _shineSun: ->
    p.incrCpuTime(1) for p in @_allProcesses

  _endLoop: ->
    @_currentThreadExecuteIndex = 0
    @_loopCount += 1
    @_shineSun()

  _runSimulationLoop: ->
    start = (new Date()).getTime()
    while (new Date()).getTime() - start < @_executeMillisecondsPerCycle
      @stepCount++
      if @_currentThreadExecuteIndex >= @_runningThreads.length
        @_endLoop()
        break  if @_stepping or @_slow
      thread = @_runningThreads[@_currentThreadExecuteIndex]
      if thread.process.dead
        @_removeProcessFromArrays thread.process
      else
        @_currentThreadExecuteIndex += 1  if thread.step()
    setTimeout $.proxy(@_runSimulationLoop, this), @_timeDelay  if @_running

  _sendCpuTimeUsed: ->
    if @unsentStepCount > 0
      CORE.data.putCpuTime @unsentStepCount
      CORE.displayMessage "{cpucycles}k cpu cycles sent to server".supplant(cpucycles: Math.round(@unsentStepCount / 1000))
      @unsentStepCount = 0

  _resetCpuRate: ->
    secsSinceStart = (Number(new Date()) - @getStartTime()) / 1000
    @current_rate = Math.round(@stepCount / secsSinceStart)
    @resetStartTime()
    @unsentStepCount += @stepCount
    @stepCount = 0

  # *****************************************
  # these are PUBLIC functions and variables
  # *****************************************
  ###
  starts the environment and runs the simulation
  ###
  initialise: -> @_initialiseEnvironment()
  resetStartTime: -> @_startTime = Number(new Date())

  start: ->
    @_running = true
    @_stepping = false
    @_slow = false
    setTimeout((=> @_runSimulationLoop()),10)
    @_resetCpuRate()

  slow: ->
    @_running = true
    @_stepping = false
    @_slow = true
    setTimeout((=> @_runSimulationLoop()),10)
    @_resetCpuRate()

  step: ->
    @_stepping = true
    setTimeout((=> @_runSimulationLoop()),10)

  stop: -> @_running = false
  addProcess: (process, parentProcess, x, y) -> @_birthProcess process, parentProcess, x, y
  moveProcess: (process, x, y, wrapped) -> @_move process, x, y, wrapped
  killProcess: (process) -> @_kill process
  getProcessCount: -> @_allProcesses.length
  getLoopCount: -> @_loopCount
  getGridX: -> @_gridX
  getGridY: -> @_gridY
  isRunning: -> @_running
  getGrid: -> @_grid
  getStartTime: -> @_startTime
  initialiseGrid: -> @_resizeGrid()
  getCurrentProcesses: -> @_allProcesses
  setInstructionsPerCycle: (value) -> @_executeMillisecondsPerCycle = Math.round(value)
  checkCanBirth: (x, y) -> not Boolean(@_grid[x][y])
  addThread: (thread) -> @_runningThreads.push thread
  getSerialCode: -> @_serialProcessIdSeries++

  getProcessAtPosition: (x, y) ->
    if @_grid[x][y] isnt 0
      @_grid[x][y]
    else
      null
