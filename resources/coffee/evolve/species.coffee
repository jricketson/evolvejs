class Species
  constructor: (fromObject) ->
    @hashCode = fromObject.hashCode
    @count = fromObject.count
    @parent = fromObject.parent
    @id = fromObject.id
    @processes = fromObject.processes
    @name = fromObject.name
    @code = fromObject.code # shallow copy
    @scoreList = []
    if fromObject.fields
      @displayName = fromObject.fields.uniqueName
      @name = fromObject.fields.name
      @id = fromObject.pk
      @pk = fromObject.pk
      @scoreList = fromObject.fields.scoreList
    @sentCount = 0
    @successScored = false

  ###
  gets the id of the next parent in the chain that has been saved
  ###
  getParent: ->
    parent = @parent
    parent = parent.parent while not (parent?.id)?
    parent

class SpeciesStore
  ###
  The SpeciesStore stores species much like a Java HashMap.
  ###
  constructor: ->
    @store = {}

  addSpecies: (species) ->
    CORE.species.count += 1
    
    #$.debug("species count:" + CORE.species.count);
    @store[species.hashCode] = []  unless @store.hasOwnProperty(species.hashCode)
    @store[species.hashCode].push species

  findSpecies: (memory, hashCode) ->
    return null unless @store.hasOwnProperty(hashCode)
    speciesArray = @store[hashCode]

    for species in speciesArray when memory.length is species.code.length
      equal = true
      storedMemory = species.code
      for item, jj in memory
        if item[0] isnt storedMemory[jj][0] or item[1] isnt storedMemory[jj][1]
          equal = false
          break
      return species if equal
    null

  removeSpecies: (species) ->
    jQuery(document).trigger CORE.environment.EVENT_SPECIES_EXTINCT, [species]
    hashArray = @store[species.hashCode]
    $.debug "hashArray is undefined" unless hashArray?
    CORE.removeElementFromArray hashArray, species

window.CORE.species = count:0, SpeciesStore: SpeciesStore, Species: Species
