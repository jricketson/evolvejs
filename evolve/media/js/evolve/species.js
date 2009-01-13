dojo.declare("CORE.species.Species", null, {
         constructor : function(fromObject) {
            dojo.mixin(this, fromObject);
            this.code = fromObject.code.slice(); // shallow copy
            if (this.fields) {
               this.name = this.fields.name;
            }
         },
         /**
          * gets the id of the next parent in the chain that has been saved
          */
         getParent : function() {
            var parent = this.parent
            while (parent != null && parent.pk === undefined) {
               parent = parent.parent
            }
            return parent;
         }
      });

/**
 * The SpeciesStore stores species much like a Java HashMap.
 */
dojo.declare("CORE.species.SpeciesStore", null, {
         constructor : function() {
            this.store = {};
         },
         addSpecies : function(species) {
            if (!this.store.hasOwnProperty(species.hashCode)) {
               this.store[species.hashCode] = [];
            }
            this.store[species.hashCode].push(species);
         },
         findSpecies : function(memory, hashCode) {
            if (!this.store.hasOwnProperty(hashCode)) {
               return null;
            }
            var speciesArray = this.store[hashCode];
            for (var ii = 0; ii < speciesArray.length; ii += 1) {
               var equal = true;
               var storedMemory = speciesArray[ii].code;
               if (memory.length === storedMemory.length) {
                  for (var jj = 0; jj < memory.length; jj += 1) {
                     if (memory[jj][0] === 0 && storedMemory[jj][0] !== 0) {
                        equal = false;
                        break;
                     } else if (memory[jj][0] != storedMemory[jj][0]) {
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
         },
         removeSpecies : function(species) {
            var hashArray = this.store[species.hashCode];
            CORE.removeElementFromArray(hashArray, species);
         }
      });
