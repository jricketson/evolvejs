CORE.util = {
   MAXHASHCHECK : 50,

   getHashCode : function(memory) {
      // returns a hashcode for the memory
      var hash = 0;
      var maxcheck = CORE.util.MAXHASHCHECK;
      for (var ii = 0; ii < memory.length && ii < maxcheck; ii += 1) {
         hash += memory[ii] * ii;
      }
      return hash;
   }

};
