// requires species to be loaded before this

CORE.speciesLibrary = {
   _speciesStore : new CORE.species.SpeciesStore(), // stored by memory hashcode
   placeProcess : function placeProcess(process, parent) {
      var hashcode = process.getHashCode();
      var species = CORE.speciesLibrary._speciesStore.findSpecies(process.memory, hashcode);
      if (species === null) {
         var parentSpecies = parent === null ? null : parent.species;
         species = new CORE.species.Species( {
            code : process.memory,
            hashCode : hashcode,
            count : 1,
            parent : parentSpecies,
            id : process.id,
            processes : [ process.id ],
            name : process.name
         });
         CORE.speciesLibrary._speciesStore.addSpecies(species);
         jQuery(document).trigger(CORE.environment.EVENT_SPECIES_CREATED,
               [ species ]);
      } else {
         species.processes.push(process.id);
         species.count += 1;
      }
      process.species = species;

      if (species.processes.length > CORE.environment.VALID_SPECIES && ! species.saved) {
         CORE.data.saveSpecies(species);
         console.info("species saved(", species.name, species.count - species.sentCount, ")");
         species.saved = true;
      }
      // check if the count of processes around now for this species greater is greater than success proxy value
      if (species.processes.length > CORE.environment.SUCCESS_PROXY && ! species.successScored) {
         console.info("species successful(", species.processes.length, ")");
         CORE.data.putScore(species,1);
         species.successScored=true;
      }
      return species;
   },

   removeProcess : function(process) {
      CORE.removeElementFromArray(process.species.processes, process.id);
      if (process.species.processes.length === 0) {
         CORE.speciesLibrary._speciesStore.removeSpecies(process.species);
      }
      process.species = null;

   },
   addSpeciesFromServer : function(species) {
      species.hashCode = CORE.util.getHashCode(species.code);
      species.processes = [];
      species.count = 0;
      CORE.speciesLibrary._speciesStore.addSpecies(species);
      jQuery(document).trigger(CORE.environment.EVENT_SPECIES_CREATED,
            [ species ]);
   },
   getStore : function() {
      return CORE.speciesLibrary._speciesStore;
   },
   checkForExtinctSpeciesRegularly : function() {
      CORE.speciesLibrary._speciesStore.checkForExtinctSpecies();
      setTimeout(CORE.speciesLibrary.checkForExtinctSpeciesRegularly, 5000);
   }
};

jQuery(document).ready(CORE.speciesLibrary.checkForExtinctSpeciesRegularly);
