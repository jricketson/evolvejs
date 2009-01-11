dojo.require("dijit.layout.AccordionContainer");
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
							}, 1000);

					self.element.find("button.createProcess").click(function() {
                        var array=eval(self.element.find(".createProcessCode").val());
						var process = new CORE.Process(CORE.assembler.compile(array));
						process.species.colour = self.element.find(".createProcessColour").val();
						process.species.id = self.element.find(".createProcessColour").val();
						CORE.environment.addProcess(process);
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