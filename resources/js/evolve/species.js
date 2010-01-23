CORE.species={};
CORE.species.Species = function(fromObject) {
   this.parent=null;
   dojo.mixin(this, fromObject);
   this.code = fromObject.code.slice(); // shallow copy
   if (this.fields) {
      this.name = this.fields.name;
      this.id = this.pk;
   }
   this.sentCount=0;
   this.successScored=false;
};
/**
 * gets the id of the next parent in the chain that has been saved
 */
CORE.species.Species.prototype.getParent = function() {
   var parent = this.parent;
   while (parent !== null && parent.pk === undefined) {
      parent = parent.parent;
   }
   return parent;
};

/**
 * The SpeciesStore stores species much like a Java HashMap.
 */
CORE.species.SpeciesStore = function() {
   this.store = {};
};
CORE.species.SpeciesStore.prototype.addSpecies = function(species) {
   if (!this.store.hasOwnProperty(species.hashCode)) {
      this.store[species.hashCode] = [];
   }
   this.store[species.hashCode].push(species);
};
CORE.species.SpeciesStore.prototype.findSpecies = function findSpecies(memory, hashCode) {
   if (!this.store.hasOwnProperty(hashCode)) {
      return null;
   }
   var speciesArray = this.store[hashCode];
   for ( var ii = 0; ii < speciesArray.length; ii += 1) {
      var equal = true;
      var storedMemory = speciesArray[ii].code;
      if (memory.length === storedMemory.length) {
         for ( var jj = 0; jj < memory.length; jj += 1) {
            if (memory[jj][0] != storedMemory[jj][0] || memory[jj][1] != storedMemory[jj][1]) {
               equal = false;
               break;
            }
         }
         if (equal) {
            return speciesArray[ii];
         }
      }
   }
   return null;
};
CORE.species.SpeciesStore.prototype.removeSpecies = function(species) {
   jQuery(document)
         .trigger(CORE.environment.EVENT_SPECIES_EXTINCT, [ species ]);
   var hashArray = this.store[species.hashCode];
   CORE.removeElementFromArray(hashArray, species);
   if (species.saved) {
      CORE.data.putScore(species,-1);
   }
};
CORE.species.SpeciesStore.prototype.checkForExtinctSpecies = function() {
   for (hashcode in this.store) {
      if (this.store.hasOwnProperty(hashcode)) {
         var speciesArray = this.store[hashcode];
         for ( var i = 0; i < speciesArray.length; i++) {
            var species = speciesArray[i];
            if (species.processes.length === 0) {
               this.removeSpecies(species);
            }
         }
      }
   }
};
