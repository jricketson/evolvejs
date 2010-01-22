(function() {
   function expand(self) {
      self.element.css({
               width : "300px"
            });
      self.element.find(".options").show();
      self.element.find(".opener").hide();
      self.element.find(".closer").show();
      self.expanded = true;
   }

   function collapse(self) {
      self.element.css({
               width : "30px"
            });
      self.element.find(".options").hide();
      self.element.find(".opener").show();
      self.element.find(".closer").hide();
      self.expanded = false;
   }

   function setupInstructionsPerCycle(self) {
      $("input#instructionsPerCycle").change(function() {
         CORE.environment.setInstructionsPerCycle(this.val());
      });
   }

   return $.gadget.register("sidebar", {
            templatePath: dojo.moduleUrl("fragments.sidebar", "sidebar.html"),     
            initialiseGadget : function(options) {
               var self = this;
               dojo.parser.parse(self.element[0]);
               self.element.find(".closer").click(function() {
                        collapse(self);
                     });
               self.element.find(".opener").click(function() {
                        expand(self);
                     });
               setTimeout(function() {
                        setupInstructionsPerCycle(self);
                     }, 1000);
            
               self.element.find("button.createProcess").click(function() {
                        try {
                           var array = JSON.parse("["+self.element.find(".createProcessCode").val()+"]");
                        } catch (e) {
                           CORE.displayMessage("Something went wrong. If you aren't sure if it was your fault, try asking in the forums.<br/>" + e);
                           return;
                        }
                        var process = new CORE.Process(CORE.assembler.compile(array), self.element.find(".createProcessId").val());
                        process.colour = self.element.find(".createProcessColour").val();
                        CORE.environment.addProcess(process, null);
                        CORE.display.setCurrentlyDisplayedProcess(process);
                     });

               self.element.find(".pane .title").click(function() {
                  $(this).parent().toggleClass("expanded");
                  $(this).parent().toggleClass("collapsed");
               });
               self.expanded = true;
               self.element.fadeTo(0, 0.8);
               CORE.trackEvent('core', 'helpPanel', 'initialise');
            }
         });
}());
