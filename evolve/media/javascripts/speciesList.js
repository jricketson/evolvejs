EVO.extend("speciesList", function () {

    function formatCodeLink(el, oRecord, oColumn, oData) {
           el.innerHTML = '<a href="#" onclick="EVO.speciesList.displayCode(\''+oRecord.getData('attributes.code')+'\');return false;" >'+oRecord.getData('attributes.name')+'</a>';
           //viewMetadata.html?anzlicId='+oRecord.getData('anzlicId')+'"><img src="'+appPath +'/images/info.gif"/></a>';
   }

   /**
     called as the callback from getting data
   */
   function doShowSpeciesTableCallback(jsonData) {
        var columnDefs = [
            {key:"attributes.name", label:"Name", formatter: formatCodeLink},
            {key:"attributes.created_on", label:"Created Date"},
            {key:"attributes.generations", label:"Generations"}
        ];
         var myConfigs = {
                 paginated:true, // Enables built-in client-side pagination
                 paginator:{ // Configurable options
                     containers: null, // Create container DIVs dynamically
                     currentPage: 1, // Show page 1
                     pageLinks: 5, 
                     rowsPerPage: EVO.speciesList.rowsPerPage // Show up to 50 rows per page
                 }
         };   
        var myDataSource = new YAHOO.util.DataSource(EVO.dataAccess.SPECIES_LIST_URL+"?");
        myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
        myDataSource.responseSchema = {resultsList: "population", 
                                       fields: ["attributes.name", "attributes.created_on", "attributes.generations", "attributes.code", "attributes.id"]};
      
        var table = new YAHOO.widget.DataTable("speciesList", columnDefs, myDataSource, myConfigs);
      
   }
                        
   return {
      rowsPerPage:50,
   
      showSpeciesTable: function() {
         doShowSpeciesTableCallback();
      },
      displayCode: function(code){
         var codeArray = EVO.dataAccess.convertStringToCode(code);
         jQuery('#speciesCode').html(EVO.assembler.makeDisplayableHtml(codeArray));
      }

      
   };
}());

jQuery(document).ready(function(){EVO.speciesList.showSpeciesTable();});
