# requires species to be loaded before this
class SpeciesLibrary

  constructor: ->
    @_speciesStore = new CORE.species.SpeciesStore() # stored by memory hashcode

  placeProcess: (process, parentProcess) ->
    hashcode = process.getHashCode()
    species = @_speciesStore.findSpecies(process.memory, hashcode)
    if species is null
      species = @_createSpecie(process, parentProcess, hashcode)
    else
      species.processes.push process.id
      species.count += 1
    process.species = species
    @_saveToGeneBank(species)
    @_checkSpeciesSuccess(species)
    species

  _createSpecie: (process, parentProcess, hashcode) ->
    parentSpecies = parentProcess?.species || null
    species = new CORE.species.Species(
      code: process.memory.slice()
      hashCode: hashcode
      count: 1
      parent: parentSpecies
      id: process.id
      processes: [process.id]
      name: process.name
    )
    @_speciesStore.addSpecies species
    jQuery(document).trigger CORE.environment().EVENT_SPECIES_CREATED, [species]
    species

  _saveToGeneBank: (species) ->
    if species.processes.length >= CORE.environment().VALID_SPECIES and not (species.saved or species.beingSaved)
      CORE.displayMessage "New {name} species evolved and is being saved to the genebank".supplant(species)
      
      #$.debug("save it",species);
      CORE.data.saveSpecies(species).done ->
        console.info "species saved(", species.name, species.processes.length, ")"
        species.saved = true
        species.beingSaved = false

      species.beingSaved = true

  _checkSpeciesSuccess: (species) ->
    # check if the count of processes around now for this species greater is greater than success proxy value
    if species.processes.length >= CORE.environment().SUCCESS_PROXY and not (species.successScored or species.beingSuccessScored) and species.saved
      
      #$.debug("score it",species);
      CORE.displayMessage "{name} species successful".supplant(species)
      CORE.data.putScore(species, 1).done ->
        
        #console.info("species successful (", species.name, species.processes.length, ")");
        species.successScored = true
        species.beingSuccessScored = false

      species.beingSuccessScored = true

  removeProcess: (process) ->
    $.debug "species is undefined"  if process.species is `undefined`
    CORE.removeElementFromArray process.species.processes, process.id
    if process.species.processes.length is 0
      @_speciesStore.removeSpecies process.species
      if process.species.saved
        
        #$.debug("extinct it",process.species);
        CORE.displayMessage "{name} species extinct".supplant(process.species)
        CORE.data.putScore(process.species, -1)
    process.species = null

  addSpeciesFromServer: (species) ->
    species.hashCode = CORE.util.getHashCode(species.code)
    species.processes = []
    species.count = 0
    @_speciesStore.addSpecies species
    jQuery(document).trigger CORE.environment().EVENT_SPECIES_CREATED, [species]

  getStore: ->
    @_speciesStore

CORE.speciesLibrary = -> @_speciesLibrary ||= new SpeciesLibrary()
