dojo.require("dijit.layout.AccordionContainer");
(function() {
	function expand(self) {
		self.element.parent().css({
					height : "12em"
				});
		self.element.find(".titleBar .showTutorial").show();
		self.element.find(".titleBar .questionBox").show();
		self.element.find(".titleBar .closeIcon").show();
		dijit.byId("viewport").resize();
		self.expanded = true;
	}

	function collapse(self) {
		self.element.parent().css({
					height : "2em"
				});
		self.element.find(".titleBar .showTutorial").hide();
		self.element.find(".titleBar .questionBox").hide();
		self.element.find(".titleBar .closeIcon").hide();
		dijit.byId("viewport").resize();
		self.expanded = false;
	}
	return $.gadget.register("sidebar", {
				initialiseGadget : function(options) {
					var self = this
					dojo.parser.parse(self.element[0]);
					self.element.find(".titleBar .closeIcon").click(function() {
								collapse(self);
							});
					self.element.height($("#contentDisplay").innerHeight());
					setTimeout(function() {
								var dij = dijit.getEnclosingWidget($(
										".options", self.element)[0]);
								dij.resize();
							}, 1000);
					self.expanded = true;
                    self.element.fadeTo(0,0.5);
					CORE.trackEvent('core', 'helpPanel', 'initialise');
				}
			});
}());