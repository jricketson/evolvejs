EVO.extend("species", function () {
   return {
      Species: function(memory, hashCode) {
         this.memory=memory;
         this.processes=[]; //list of process ids
         this.hashCode=hashCode;
         this.colour=0;
         this.id="";
         this.count=0; //the count of processes with the same initial code
      },
      
      /**
         The SpeciesStore stores species much like a Java HashMap.
      */
      SpeciesStore: function() {
         this.store={};
      }
   };
}());
   

EVO.species.SpeciesStore.prototype.addSpecies = function(species) {
   if (! this.store.hasOwnProperty(species.hashCode)) {
      this.store[species.hashCode]=[];
   }
   this.store[species.hashCode].push(species);
};
EVO.species.SpeciesStore.prototype.findSpecies = function(memory, hashCode) {
   if (! this.store.hasOwnProperty(hashCode)) {
      return null;
   }
   var speciesArray = this.store[hashCode];
   for (var ii=0; ii<speciesArray.length;ii+=1) {
      var equal=true;
      for (var jj=0;jj<memory.length;jj+=1) {
         if (memory[jj]!=speciesArray[ii].memory[jj]) {
            equal=false;
            break;
         }
      }
      if (equal) {
         return speciesArray[ii];
      }
   }
   return null;
   
   
};   

EVO.species.SpeciesStore.prototype.removeSpecies = function(species) {
   var hashArray = this.store[species.hashCode];
   EVO.removeElementFromArray(hashArray, species);
};
