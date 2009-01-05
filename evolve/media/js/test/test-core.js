EVO.namespace("test");
EVO.test.core = new YAHOO.tool.TestCase({
 
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
      EVO.namespace("test1","test2","test3.child");
      Assert.isObject(EVO.test1);
      Assert.isObject(EVO.test2);
      Assert.isObject(EVO.test3);
      Assert.isObject(EVO.test3.child);
   },
   
   testExtendRootNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      EVO.namespace("test4.child");
      EVO.extend({newValue: 3, anotherValue: 5});
      Assert.isNumber(EVO.newValue);
      Assert.areSame(3, EVO.newValue);
      Assert.isNumber(EVO.anotherValue);
      Assert.areSame(5, EVO.anotherValue);
   
   },
   testExtendNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      EVO.extend("test6",{newValue: 3, anotherValue: 5});
      Assert.isNumber(EVO.test6.newValue);
      Assert.areSame(3, EVO.test6.newValue);
      Assert.isNumber(EVO.test6.anotherValue);
      Assert.areSame(5, EVO.test6.anotherValue);
   
   },
   testExtendChildNameSpace: function () {
      var Assert = YAHOO.util.Assert;    
      EVO.extend("test4.child", {newValue: 3, anotherValue: 5});
      Assert.isNumber(EVO.test4.child.newValue);
      Assert.areSame(3, EVO.test4.child.newValue);
      Assert.isNumber(EVO.test4.child.anotherValue);
      Assert.areSame(5, EVO.test4.child.anotherValue);
   
   },
   testExtendChildNameSpaceWithRedundantFirstName: function () {
      var Assert = YAHOO.util.Assert;    
      EVO.extend("EVO.test5.child", {newValue: 3, anotherValue: 5});
      Assert.isNumber(EVO.test5.child.newValue);
      Assert.areSame(3, EVO.test5.child.newValue);
      Assert.isNumber(EVO.test5.child.anotherValue);
      Assert.areSame(5, EVO.test5.child.anotherValue);
   
   }
   
   
   
});

YAHOO.tool.TestRunner.add(EVO.test.core);