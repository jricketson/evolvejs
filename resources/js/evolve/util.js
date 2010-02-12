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
   },
   getUserProfile : function() {
      CORE.data.getUserProfile( function(userProfile) {
         CORE.userProfile = userProfile;
         if (CORE.userProfile === null) {
            $('#logoutLink').hide();
            $('#loginLink').show();
         } else {
            $("#username").html(CORE.userProfile.username);
            $('#logoutLink').show();
            $('#loginLink').hide();
         }
      });
   }

};
