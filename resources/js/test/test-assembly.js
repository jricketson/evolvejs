CORE.test=CORE.test || {};
CORE.test.assembly = new YAHOO.tool.TestCase({
 
   name: "test-assembly",
   
   //---------------------------------------------
   // Setup and tear down
   //---------------------------------------------
   
   setUp : function () {
      this.data={};
      this.data.code=CORE.ancestor.tree;
   },
   
   tearDown : function () {
      for (var value in this.data) {
         if (this.data.hasOwnProperty(value)) {
            delete this.data[value];
         }
      } 
      delete this.data;
   },
   
   //---------------------------------------------
   // Tests
   //---------------------------------------------
   testCompile: function () {
      var compiledCode = this.data.code;
      var Assert = YAHOO.util.Assert;
      Assert.areEqual(0,compiledCode[0][0]);
      Assert.areEqual(8,compiledCode[5][0]);
      Assert.areEqual(5,compiledCode[5][1]);
      
   }
   
   
   
   
});

YAHOO.tool.TestRunner.add(CORE.test.assembly);