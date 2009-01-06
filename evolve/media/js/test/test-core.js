CORE.namespace("test");
CORE.test.core = new YAHOO.tool.TestCase({
 
   name: "test-core",
   
   //---------------------------------------------
   // Setup and tear down
   //---------------------------------------------
   
   setUp : function () {
   },
   
   tearDown : function () {
   },
   
   //---------------------------------------------
   // Tests
   //---------------------------------------------
   
   //core plumbing functionality
   testNamespace: function () {
      var Assert = YAHOO.util.Assert;    
      CORE.namespace("test1","test2","test3.child");
      Assert.isObject(CORE.test1);
      Assert.isObject(CORE.test2);
      Assert.isObject(CORE.test3);
      Assert.isObject(CORE.test3.child);
   },
   
   testExtendRootNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      CORE.namespace("test4.child");
      CORE.extend({newValue: 3, anotherValue: 5});
      Assert.isNumber(CORE.newValue);
      Assert.areSame(3, CORE.newValue);
      Assert.isNumber(CORE.anotherValue);
      Assert.areSame(5, CORE.anotherValue);
   
   },
   testExtendNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      CORE.extend("test6",{newValue: 3, anotherValue: 5});
      Assert.isNumber(CORE.test6.newValue);
      Assert.areSame(3, CORE.test6.newValue);
      Assert.isNumber(CORE.test6.anotherValue);
      Assert.areSame(5, CORE.test6.anotherValue);
   
   },
   testExtendChildNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      CORE.extend("test4.child", {newValue: 3, anotherValue: 5});
      Assert.isNumber(CORE.test4.child.newValue);
      Assert.areSame(3, CORE.test4.child.newValue);
      Assert.isNumber(CORE.test4.child.anotherValue);
      Assert.areSame(5, CORE.test4.child.anotherValue);
   
   },
   testExtendChildNameSpaceWithRedundantFirstName: function () {
      var Assert = YAHOO.util.Assert;    
      CORE.extend("CORE.test5.child", {newValue: 3, anotherValue: 5});
      Assert.isNumber(CORE.test5.child.newValue);
      Assert.areSame(3, CORE.test5.child.newValue);
      Assert.isNumber(CORE.test5.child.anotherValue);
      Assert.areSame(5, CORE.test5.child.anotherValue);
   
   }
   
   
   
});

YAHOO.tool.TestRunner.add(CORE.test.core);