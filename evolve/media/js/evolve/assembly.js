CORE.assembler = function() {

   return {
      /**
       * takes an array of arrays [[operator, operand],...] and converts to compiled code in an
       * internal representation
       */
      compile : function compile(code) {
         var compiledCode = [];
         var operatorCode;
         for (var ii = 0; ii < code.length; ii += 1) {
            operatorCode = CORE.vm.codeInstructions[code[ii][0]];
            if (operatorCode !== undefined) {
               compiledCode.push([operatorCode, code[ii][1]]);
            } else {
               $.debug("code not found: " + code[ii][0], "error");
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
         var operatorName, operator;
         for (var ii = 0; ii < code.length; ii += 1) {
            operator = CORE.vm.instructionCodes[code[ii][0]];
            if (operator !== undefined) {
               operatorName = CORE.getFunctionName(operator);
            }
            if (operatorName === undefined) {
               operatorName = "nop";
            }
            compiledCode.push([operatorName, code[ii][1]]);
         }
         return compiledCode;
      },

      makeDisplayableHtml : function makeDisplayableHtml(codeArray) {
         var humanReadable = CORE.assembler.deCompile(codeArray);
         var codeHtml = "";
         for (var ii = 0; ii < humanReadable.length; ii += 1) {
            codeHtml += '["' + humanReadable[ii][0] + '", ' + humanReadable[ii][1] + '],<br/>';
         }
         return codeHtml;
      }
   };

}();
