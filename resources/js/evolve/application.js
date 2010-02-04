CORE.indexHtml = {
   _hideTitle : function() {
      $("div#ft").animate( {
         opacity : 0.3
      }, "slow");
   },

   initialise : function() {
      // hide the title after 10 secs, or the user clicks
      setTimeout(this._hideTitle, 10000);
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
      $("div#ft").click(this._hideTitle);
   
      // links for the user to start the simulation. These swap themselves
      $("#play").click( function() {
         CORE.environment.start();
         $(this).hide();
         $("#pause").show();
         $("#step").hide();
      });
      $("#step").click( function() {
         CORE.environment.step();
      });
      $("#pause").click( function() {
         CORE.environment.stop();
         $(this).hide();
         $("#play").show();
         $("#step").show();
      });
      // initialise the environment
      $("#layoutCenter").createGadget("sidebar", function(gadget) {
         self.sidebar = gadget;
         CORE.environment.initialise();
         CORE.display.initialise();
      }, {
         method : "append"
      });
   }
};

$(document).ready($.proxy(CORE.indexHtml.initialise, CORE.indexHtml));
