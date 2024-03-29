// Generated by CoffeeScript 1.4.0
(function() {

  CORE.assembler = {
    /*
      takes an array of arrays [[operator, operand],...] and converts to compiled code in an
      internal representation
    */

    compile: function(code) {
      var compiledCode, ii, operation, operatorCode, _i, _len;
      compiledCode = [];
      for (ii = _i = 0, _len = code.length; _i < _len; ii = ++_i) {
        operation = code[ii];
        operatorCode = CORE.vm.codeInstructions[operation[0]];
        if (operatorCode != null) {
          compiledCode.push(CORE.vm.encode(operatorCode, operation[1]));
        } else {
          $.debug(new Error("code not found: " + code[ii][0] + ", instr: " + ii));
          $.debug(code);
        }
      }
      return compiledCode;
    },
    /*
      takes an array of operations in internal representation and converts to an array of arrays
      that is somewhat readable
    */

    deCompile: function(code) {
      var compiledCode, item, operation, operatorFn, operatorName, _i, _len;
      compiledCode = [];
      for (_i = 0, _len = code.length; _i < _len; _i++) {
        item = code[_i];
        operation = CORE.vm.decode(item);
        operatorFn = CORE.vm.instructionCodes[operation[0]];
        if (typeof operator !== "undefined" && operator !== null) {
          operatorName = CORE.getFunctionName(operatorFn);
        } else {
          operatorName = "nop";
        }
        compiledCode.push([operatorName, operation[1]]);
      }
      return compiledCode;
    },
    makeDisplayableHtml: function(codeArray) {
      return CORE.assembler._makeDisplayable(codeArray, "<div class=\"line line{lineNumber}\">[\"{operator}\", {operand}],</div>");
    },
    makeDisplayableText: function(codeArray) {
      return CORE.assembler._makeDisplayable(codeArray, "[\"{operator}\", {operand}],\n");
    },
    _makeDisplayable: function(codeArray, template) {
      var codeHtml, data, ii, line, _i, _len, _ref;
      codeHtml = "";
      _ref = CORE.assembler.deCompile(codeArray);
      for (ii = _i = 0, _len = _ref.length; _i < _len; ii = ++_i) {
        line = _ref[ii];
        if (line != null) {
          data = {
            lineNumber: ii,
            operator: line[0],
            operand: line[1]
          };
        } else {
          data = {
            lineNumber: ii,
            operator: "",
            operand: ""
          };
        }
        codeHtml += template.supplant(data);
      }
      return codeHtml;
    },
    convertStringToCode: function(codeString) {
      var code, _i, _len, _ref, _results;
      if (codeString == null) {
        return [];
      }
      _ref = codeString.split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        code = _ref[_i];
        _results.push(Number(code) >>> 0);
      }
      return _results;
    },
    convertCodeToString: function(codeArray) {
      return codeArray.join(",");
    }
  };

}).call(this);
