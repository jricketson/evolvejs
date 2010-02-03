CORE.assembler = {
   /**
    * takes an array of arrays [[operator, operand],...] and converts to compiled code in an
    * internal representation
    */
   compile : function compile(code) {
      var compiledCode = [];
      var operatorCode;
      for ( var ii = 0; ii < code.length; ii += 1) {
         operatorCode = CORE.vm.codeInstructions[code[ii][0]];
         if (operatorCode !== undefined) {
            compiledCode.push(CORE.vm.encode(operatorCode, code[ii][1]));
         } else {
            $.debug(new Error("code not found: " + code[ii][0] + ", instr: " + ii));
            $.debug(code);
         }
      }
      return compiledCode;
   },
   /**
    * takes an array of operations in internal representation and converts to an array of arrays
    * that is somewhat readable
    */
   deCompile : function deCompile(code) {
      var compiledCode = [];
      var operatorName, operatorFn, operation;
      for ( var ii = 0; ii < code.length; ii += 1) {
         operation = CORE.vm.decode(code[ii]);
         operatorFn = CORE.vm.instructionCodes[operation[0]];
         if (operatorFn !== undefined) {
            operatorName = CORE.getFunctionName(operatorFn);
         }
         if (operatorName === undefined) {
            operatorName = "nop";
         }
         compiledCode.push( [ operatorName, operation[1] ]);
      }
      return compiledCode;
   },

   makeDisplayableHtml : function makeDisplayableHtml(codeArray) {
      return CORE.assembler._makeDisplayable(codeArray,
            '<div class="line line{lineNumber}">["{operator}", {operand}],</div>');
   },
   makeDisplayableText : function makeDisplayableHtml(codeArray) {
      return CORE.assembler._makeDisplayable(codeArray, '["{operator}", {operand}],\n');
   },
   _makeDisplayable : function(codeArray, template) {
      var humanReadable = CORE.assembler.deCompile(codeArray);
      var codeHtml = "";
      var data;
      for ( var ii = 0; ii < humanReadable.length; ii += 1) {
         if (humanReadable[ii][0] !== undefined) {
            data = {
               lineNumber : ii,
               operator : humanReadable[ii][0],
               operand : humanReadable[ii][1]
            };
         } else {
            data = {
               lineNumber : ii,
               operator : "",
               operand : ""
            };
         }
         codeHtml += template.supplant(data);
      }
      return codeHtml;

   },
   convertStringToCode : function convertStringToCode(codeString) {
      if (codeString === null) {
         return [];
      }
      var codeStringArray = codeString.split(",");
      var codeArray = [];
      var operation;
      for ( var ii = 0; ii < codeStringArray.length; ii += 1) {
         codeArray.push(Number(codeStringArray[ii]) >>> 0);
      }
      return codeArray;
   },
   /*
    * This converts the array of [operator, operand] pairs to a string of 32bit integers. The
    * operator is shifted left 24 bits and the operand is added. All the integers are then
    * concatenated into a comma delimited string.
    */
   convertCodeToString : function(codeArray) {
      return codeArray.join(",");
   }

};
