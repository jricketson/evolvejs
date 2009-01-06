CORE.test.vm = new YAHOO.tool.TestCase(function() {
 
    function standardAsserts(data) {
      var Assert = YAHOO.util.Assert;
      Assert.areEqual(data.executionPtr+1,data.firstThread.executionPtr, "executionPtr should increment");
      Assert.areEqual(0,data.firstThread.stack.length, "stack should be empty");
   
   }
 
   return {
   name: "test-vm",
   
   //---------------------------------------------
   // Setup and tear down
   //---------------------------------------------
   
   setUp : function () {
      this.data={};
      this.data.process = new CORE.Process(CORE.ancestor.tree);
      this.data.process.initialise();
      this.data.firstThread=this.data.process.threads[0];
      this.data.executionPtr = this.data.firstThread.executionPtr;
   },
   
   tearDown : function () {
      this.data.process.killMe();
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
   testNop: function () {
      CORE.vm.instructionSet.nop(this.data.firstThread);
      standardAsserts(this.data);
   },
   
   testPushMemSize: function () {
      var Assert = YAHOO.util.Assert;
      CORE.vm.instructionSet.pushMemSize(this.data.firstThread);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(this.data.firstThread.process.memory.length,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },

   testPushReadPtr: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.readPtr=3;
      CORE.vm.instructionSet.pushReadPtr(this.data.firstThread);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(this.data.firstThread.readPtr,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },

   testPushWritePtr: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.writePtr=3;
      CORE.vm.instructionSet.pushWritePtr(this.data.firstThread);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(this.data.firstThread.writePtr,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },

   testJmpReadPtrB: function () {
      var Assert = YAHOO.util.Assert;
      this.data.executionPtr=12;
      this.data.firstThread.executionPtr=12;
      this.data.firstThread.readPtr=12;
      CORE.vm.instructionSet.jmpReadPtrB(this.data.firstThread,5);
      Assert.areEqual(0,this.data.firstThread.readPtr);
      standardAsserts(this.data);
   },

   testJmpReadPtrF: function () {
      var Assert = YAHOO.util.Assert;
      this.data.executionPtr=12;
      this.data.firstThread.executionPtr=12;
      this.data.firstThread.readPtr=12;
      CORE.vm.instructionSet.jmpReadPtrF(this.data.firstThread,6);
      Assert.areEqual(24,this.data.firstThread.readPtr);
      standardAsserts(this.data);
   },

//   testJmpWritePtrB: function () {
//      var Assert = YAHOO.util.Assert;
//      this.data.executionPtr=12;
//      this.data.firstThread.executionPtr=12;
//      this.data.firstThread.writePtr=12;
//      CORE.vm.instructionSet.jmpWritePtrB(this.data.firstThread,4);
//      Assert.areEqual(0,this.data.firstThread.writePtr);
//      standardAsserts(this.data);
//   },
//
   testJmpWritePtrF: function () {
      var Assert = YAHOO.util.Assert;
      this.data.executionPtr=12;
      this.data.firstThread.executionPtr=12;
      this.data.firstThread.writePtr=12;
      CORE.vm.instructionSet.jmpWritePtrF(this.data.firstThread,6);
      Assert.areEqual(24,this.data.firstThread.writePtr);
      standardAsserts(this.data);
   },

   testIncReadPtr: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.readPtr=12;
      CORE.vm.instructionSet.incReadPtr(this.data.firstThread,0);
      Assert.areEqual(13,this.data.firstThread.readPtr);
      standardAsserts(this.data);
   },

   testIncWritePtr: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.writePtr=12;
      CORE.vm.instructionSet.incWritePtr(this.data.firstThread,0);
      Assert.areEqual(13,this.data.firstThread.writePtr);
      standardAsserts(this.data);
   },
   
   testCopy: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.readPtr=11;
      this.data.firstThread.writePtr=12;
      CORE.vm.instructionSet.copy(this.data.firstThread,0);
      Assert.areEqual(this.data.firstThread.process.memory[this.data.firstThread.readPtr],this.data.firstThread.process.memory[this.data.firstThread.writePtr]);
      standardAsserts(this.data);
   },

   testLt: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.stack.push(3);
      this.data.firstThread.stack.push(4);
      CORE.vm.instructionSet.lt(this.data.firstThread,0);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(1,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },
   
   testGte: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.stack.push(5);
      this.data.firstThread.stack.push(4);
      CORE.vm.instructionSet.gte(this.data.firstThread,0);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(1,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },
   testGteEqual: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.stack.push(4);
      this.data.firstThread.stack.push(4);
      CORE.vm.instructionSet.gte(this.data.firstThread,0);
      Assert.areEqual(1,this.data.firstThread.stack.length);
      Assert.areEqual(1,this.data.firstThread.stack.pop());
      standardAsserts(this.data);
   },
   
   testIfdo: function () {
      this.data.firstThread.stack.push(1);
      CORE.vm.instructionSet.ifdo(this.data.firstThread,0);
      standardAsserts(this.data);
   },
   testIfdont: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.stack.push(0);
      CORE.vm.instructionSet.ifdo(this.data.firstThread,1);
      Assert.areEqual(this.data.executionPtr+2,this.data.firstThread.executionPtr, "executionPtr should increment by 2");
      Assert.areEqual(0,this.data.firstThread.stack.length, "stack should be empty");
   },
//   testJmpF: function () {
//      var Assert = YAHOO.util.Assert;
//      this.data.firstThread.executionPtr=12;
//      CORE.vm.instructionSet.jmpF(this.data.firstThread,3);
//      Assert.areEqual(28,this.data.firstThread.executionPtr);
//      Assert.areEqual(0,this.data.firstThread.stack.length, "stack should be empty");
//   },
   testJmpB: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.executionPtr=12;
      CORE.vm.instructionSet.jmpB(this.data.firstThread,5);
      Assert.areEqual(0,this.data.firstThread.executionPtr);
      Assert.areEqual(0,this.data.firstThread.stack.length, "stack should be empty");
   },
//   testJmpFWrap: function () {
//      var Assert = YAHOO.util.Assert;
//      this.data.firstThread.executionPtr=12;
//      CORE.vm.instructionSet.jmpF(this.data.firstThread,5);
//      Assert.areEqual(10,this.data.firstThread.executionPtr);
//      Assert.areEqual(0,this.data.firstThread.stack.length, "stack should be empty");
//   },
   testJmpBWrap: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.executionPtr=12;
      CORE.vm.instructionSet.jmpB(this.data.firstThread,6);
      Assert.areEqual(19,this.data.firstThread.executionPtr);
      Assert.areEqual(0,this.data.firstThread.stack.length, "stack should be empty");
   },
   
   testRunThread: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.readPtr=12;
      CORE.vm.instructionSet.runThread(this.data.firstThread);
      Assert.areEqual(2,this.data.firstThread.process.threads.length);
      Assert.areEqual(12,this.data.firstThread.process.threads[1].executionPtr);
   },
   
   testDivideProcess: function () {
      var Assert = YAHOO.util.Assert;
      this.data.firstThread.readPtr=12;
      this.data.firstThread.writePtr=26;
      var numProcesses = CORE.environment.getProcessCount();
      var newProcess = CORE.vm.instructionSet.divideProcess(this.data.firstThread);
      Assert.areEqual(12, this.data.firstThread.process.memory.length);
      Assert.areEqual(14, newProcess.memory.length);
      Assert.areEqual(numProcesses+1, CORE.environment.getProcessCount());
   },
   testAlloc: function () {
      var Assert = YAHOO.util.Assert;
      
   },
   testTurnR: function () {
      var Assert = YAHOO.util.Assert;
   },
   testLook: function () {
      var Assert = YAHOO.util.Assert;
   },
   testMove: function () {
      var Assert = YAHOO.util.Assert;
   }
 };  
   
   
}());

YAHOO.tool.TestRunner.add(CORE.test.vm);