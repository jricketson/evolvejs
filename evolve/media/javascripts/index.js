EVO.extend("indexHtml", function () {
   function hideTitle() {
      jQuery("div#hd").animate({opacity:0.3}, "slow");
      jQuery("div#ft").animate({opacity:0.3}, "slow");
   }
   
   return {
      EVENT_PAGE_READY: "page_ready",
      initialise: function() {
         //initialise the environment
         EVO.environment.initialise();
         
         //hide the title after 10 secs, or the user clicks
         setTimeout(hideTitle, 10000);
         jQuery("div#hd").click(hideTitle);
         jQuery("div#ft").click(hideTitle);
         
         //links for the user to start the simulation. These swap themselves
         jQuery("div#play").click(function(){
            EVO.environment.start();
            jQuery(this).hide();
            jQuery("div#pause").show();
         });
         jQuery("div#pause").click(function(){
            EVO.environment.stop();
            jQuery(this).hide();
            jQuery("div#play").show();
         });
         jQuery("div#pause").hide();

         jQuery("button#createProcess").click(function(){
            var process = new EVO.Process(EVO.assembler.compile(jQuery("createProcessCode").value()));
            process.species.colour=jQuery("createProcessColour").value()
            process.species.id=jQuery("createProcessColour").value()
            EVO.environment.addProcess(process);
         });

         
         var tabview = new YAHOO.widget.TabView('sidebar'); 

         var myLogReader = new YAHOO.widget.LogReader("logDisplay"); 

         //render YUI layout
         EVO.indexHtml.LAYOUT_HOLDER = new YAHOO.widget.Layout("panelLayout",{
            units: [
                { position: 'left', header: 'Sidebar', width: 300, resize: true, gutter: '5px', collapse: true, scroll: true, body: 'sidebar', animate: true },
                { position: 'center', body: 'gridContainer' },
                { position: 'right', header: 'Ads', width: 170, resize: true, gutter: '5px', collapse: true, scroll: false, body: 'ads', animate: true }
            ]
         });
         EVO.indexHtml.LAYOUT_HOLDER.on('render', function() {
            EVO.indexHtml.getUnitByPosition('left').on('close', function() {
                closeLeft();
            });
         });
         EVO.indexHtml.LAYOUT_HOLDER.render();
         jQuery(document).trigger(this.EVENT_PAGE_READY);
      }
   };

}());

jQuery(document).ready(function(){
   EVO.indexHtml.initialise();
});
