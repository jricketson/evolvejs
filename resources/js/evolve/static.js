CORE.staticpage = {
   initialise: function() {
      CORE.util.getUserProfile();
   }
};
$(document).ready($.proxy(CORE.staticpage.initialise, CORE.staticpage));
