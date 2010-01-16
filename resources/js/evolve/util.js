CORE.util = {
   MAXHASHCHECK : 50,

   getHashCode : function(memory) {
      // returns a hashcode for the memory
      var hash = 0;
      var maxcheck = CORE.util.MAXHASHCHECK;
      for (var ii = 0; ii < memory.length && ii < maxcheck; ii += 1) {
         if (memory[ii][0] !== 0) {
            hash += (memory[ii][0] + 1 + memory[ii][1]) * ii;
         } else {
            hash += 1;
         }
      }
      return hash;
   }

};
