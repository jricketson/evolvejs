CORE.species = function() {
	return {
		Species : function(memory, hashCode) {
			this.memory = memory.slice(); // shallow copy
			this.processes = []; // list of process ids
			this.hashCode = hashCode;
			this.colour = 0;
			this.id = "";
			this.count = 0; // the count of processes with the same initial code
		},

		/**
		 * The SpeciesStore stores species much like a Java HashMap.
		 */
		SpeciesStore : function() {
			this.store = {};
		}
	};
}();

CORE.species.SpeciesStore.prototype.addSpecies = function(species) {
	if (!this.store.hasOwnProperty(species.hashCode)) {
		this.store[species.hashCode] = [];
	}
	this.store[species.hashCode].push(species);
};
CORE.species.SpeciesStore.prototype.findSpecies = function(memory, hashCode) {
	if (!this.store.hasOwnProperty(hashCode)) {
		return null;
	}
	var speciesArray = this.store[hashCode];
	for (var ii = 0; ii < speciesArray.length; ii += 1) {
		var equal = true;
		if (memory.length === speciesArray[ii].memory.length) {
			for (var jj = 0; jj < memory.length; jj += 1) {
				if (memory[jj][0] === 0 && speciesArray[ii].memory[jj][0] !== 0) {
					equal = false;
					break;
				} else if (memory[jj][0] != speciesArray[ii].memory[jj][0]) {
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
	var hashArray = this.store[species.hashCode];
	CORE.removeElementFromArray(hashArray, species);
};
