// requires species to be loaded before this

CORE.speciesLibrary = function() {
   var speciesStore = new CORE.species.SpeciesStore(); // stored by memory
   // hashcode
   return {
      placeProcess : function placeProcess(process, parent) {
         var hashcode = process.getHashCode();
         var species = speciesStore.findSpecies(process.memory, hashcode);
         if (!species) {
            var parentSpecies = parent == null ? null : parent.species;
            species = new CORE.species.Species({
                     code : process.memory,
                     hashCode : hashcode,
                     count : 1,
                     parent : parentSpecies,
                     id : process.id,
                     processes : [process.id],
                     name : process.name
                  });
            speciesStore.addSpecies(species);
            jQuery(document).trigger(CORE.environment.EVENT_SPECIES_CREATED, [species]);
         } else {
            species.processes.push(process.id);
            species.count += 1;
         }
         process.species = species;

         // check if the count of processes born for this species is a power
         // of 10
         var powersOfTen = CORE.logToBase(species.count, 10);
         if (species.count > 1) {
            if (powersOfTen == Math.round(powersOfTen)) {
               CORE.data.saveSpecies(species);
               species.saved = true;
            }
         }

         return species;

      },

      removeProcess : function(process) {
         CORE.removeElementFromArray(process.species.processes, process.id);
         if (process.species.processes.length === 0) {
            speciesStore.removeSpecies(process.species);
         }
         process.species = null;

      },
      addSpeciesFromServer : function(species) {
         species.hashCode = CORE.util.getHashCode(species.code);
         species.processes = [];
         species.count = 0;
         speciesStore.addSpecies(species);
         jQuery(document).trigger(CORE.environment.EVENT_SPECIES_CREATED, [species]);
      },
      getStore : function() {
         return speciesStore;
      },
      checkForExtinctSpeciesRegularly : function() {
         speciesStore.checkForExtinctSpecies();
         var self=this;
         setTimeout(function() {
                  self.checkForExtinctSpeciesRegularly();
               }, 5000);
      }
   };
}();
