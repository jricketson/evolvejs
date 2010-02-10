// requires species to be loaded before this

CORE.speciesLibrary = {
   _speciesStore : new CORE.species.SpeciesStore(), // stored by memory hashcode
   placeProcess : function placeProcess(process, parentProcess) {
      var hashcode = process.getHashCode();
      var species = CORE.speciesLibrary._speciesStore.findSpecies(process.memory, hashcode);
      if (species === null) {
         var parentSpecies = parentProcess === null ? null : parentProcess.species;
         species = new CORE.species.Species( {
            code : process.memory.slice(),
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

      if (species.processes.length >= CORE.environment.VALID_SPECIES && ! (species.saved || species.beingSaved)) {
         CORE.displayMessage("New {name} species evolved and is being saved to the genebank".supplant(species));
         //$.debug("save it",species);
         CORE.data.saveSpecies(species, function(){
            console.info("species saved(", species.name, species.processes.length, ")");
            species.saved = true;
            species.beingSaved = false;
         });
         species.beingSaved = true;
      }
      // check if the count of processes around now for this species greater is greater than success proxy value
      if (species.processes.length >= CORE.environment.SUCCESS_PROXY && ! (species.successScored || species.beingSuccessScored) && species.saved) {
         //$.debug("score it",species);
         CORE.displayMessage("{name} species successful".supplant(species));
         CORE.data.putScore(species,1, function(){
            //console.info("species successful (", species.name, species.processes.length, ")");
            species.successScored = true;
            species.beingSuccessScored = false;
         });
         species.beingSuccessScored = true;
      }
      return species;
   },

   removeProcess : function removeProcess(process) {
      if (process.species === undefined) {
         $.debug("species is undefined");
      }
      CORE.removeElementFromArray(process.species.processes, process.id);
      if (process.species.processes.length === 0) {
         CORE.speciesLibrary._speciesStore.removeSpecies(process.species);
         if (process.species.saved) {
            //$.debug("extinct it",process.species);
            CORE.displayMessage("{name} species extinct".supplant(process.species));
            CORE.data.putScore(process.species,-1);
         }
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
   }
};
