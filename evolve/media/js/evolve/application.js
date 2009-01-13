CORE.indexHtml = function() {
	var rpcCount = 0;
	function hideTitle() {
		$("div#ft").animate({
					opacity : 0.3
				}, "slow");
	}

	function rpcStart() {
		if (rpcCount === 0) {
			$("#loadingMessage").fadeIn(500);
		}
		rpcCount += 1;
	}
	function rpcEnd() {
		rpcCount -= 1;
		if (rpcCount === 0) {
			$("#loadingMessage").fadeOut(500);
		}
	}
	return {
		EVENT_PAGE_READY : "page_ready",
		initialise : function() {
			$.ajaxSetup({
						beforeSend : rpcStart,
						complete : rpcEnd
					});

			// hide the title after 10 secs, or the user clicks
			setTimeout(hideTitle, 10000);
			CORE.dataAccess.getUserProfile(function(userProfile) {
						CORE.userProfile = userProfile;
						$.get("/rpc/logoutLink", function(data) {
									$("#logoutLink").attr("href", data);
								});
					});
			$("div#ft").click(hideTitle);

			// links for the user to start the simulation. These swap themselves
			$("#play").click(function() {
						CORE.environment.start();
						$(this).hide();
						$("#pause").show();
					});
			$("#pause").click(function() {
						CORE.environment.stop();
						$(this).hide();
						$("#play").show();
					});
			$("#contentDisplay").createGadget("sidebar", function(gadget) {
						self.sidebar = gadget;
					}, {
						method : "append"
					});
			// initialise the environment
			CORE.environment.initialise();
			$(document).trigger(this.EVENT_PAGE_READY);
		}
	};

}();

$(document).ready(function() {
			CORE.indexHtml.initialise();
		});
