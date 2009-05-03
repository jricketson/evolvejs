dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Slider");
(function() {
   function expand(self) {
      self.element.css({
               width : "300px"
            });
      self.element.find(".options").show();
      self.element.find(".opener").hide();
      self.element.find(".closer").show();
      self.expanded = true;
      setHeight(self);
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

   function setHeight(self) {
      self.element.height($("#contentDisplay").innerHeight() - 50);
      var dij = dijit.getEnclosingWidget($(".options", self.element)[0]);
      dij.resize();
   }

   function setupInstructionsPerCycleSlider(self) {
      var dij = dijit.byId("instructionsPerCycleSlider");
      dij.onChange=function(value) {
         CORE.environment.setInstructionsPerCycle(value);
      };
   }

   return $.gadget.register("sidebar", {
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
                        var dij = dijit.getEnclosingWidget(self.element.find(".options")[0]);
                        dij.resize();
                        setupInstructionsPerCycleSlider(self);
                     }, 1000);
            
               self.element.find("button.createProcess").click(function() {
                        try {
                           var array = eval(self.element.find(".createProcessCode").val());
                        } catch (e) {
                           CORE.displayMessage("Something went wrong. If you aren't sure if it was your fault, try asking in the forums.<br/>" + e);
                           return;
                        }
                        var process = new CORE.Process(CORE.assembler.compile(array), self.element.find(".createProcessId").val());
                        process.colour = self.element.find(".createProcessColour").val();
                        CORE.environment.addProcess(process, null);
                     });

               self.expanded = true;
               self.element.fadeTo(0, 0.8);
               setHeight(self);
               $(window).resize(function(e) {
                        setHeight(self);
                     });
               CORE.trackEvent('core', 'helpPanel', 'initialise');
            }
         });
}());