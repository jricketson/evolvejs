EVO.extend("assembler",function(){
   
   return {
      /**
         takes an array of arrays [[operator, operand],...] and converts to compiled code in an internal representation
      */
      compile: function(code) {
         var compiledCode=[];
         var operatorCode;
         for (var ii=0; ii< code.length;ii+=1) {
            operatorCode = EVO.vm.codeInstructions[code[ii][0]];
            if (operatorCode !== undefined) {
               compiledCode.push([operatorCode,code[ii][1]]);
            }
            else {
               YAHOO.log("code not found: " +code[ii], "error");
            }
         }
         return compiledCode;
      },
      /**
         takes an array of operations in internal representation and converts to an array of arrays that is somewhat readable
      */
      deCompile: function(code) {
         var compiledCode=[];
         var operatorName, operator;
         for (var ii=0; ii< code.length;ii+=1) {
            operator = EVO.vm.instructionCodes[code[ii][0]];
            operatorName = EVO.getFunctionName(operator);
            if (operatorName !== undefined) {
               compiledCode.push([operatorName,code[ii][1]]);
            }
            else {
               YAHOO.log("code not found: " +code[ii], "error");
            }
         }
         return compiledCode;
      },
      
      makeDisplayableHtml: function(codeArray) {
         var humanReadable = EVO.assembler.deCompile(codeArray);
         var codeHtml = "";
         for (var ii=0;ii<humanReadable.length;ii+=1) {
            codeHtml+='["' + humanReadable[ii][0]+'", '+ humanReadable[ii][1]+'],<br/>';
         }
         return codeHtml;
      }
   };

}());

