CORE.assembler =
  
  ###
  takes an array of arrays [[operator, operand],...] and converts to compiled code in an
  internal representation
  ###
  compile: (code) ->
    compiledCode = []
    for operation, ii in code
      operatorCode = CORE.vm.codeInstructions[operation[0]]
      if operatorCode?
        compiledCode.push CORE.vm.encode(operatorCode, operation[1])
      else
        $.debug new Error("code not found: #{code[ii][0]}, instr: #{ii}")
        $.debug code
    compiledCode
  
  ###
  takes an array of operations in internal representation and converts to an array of arrays
  that is somewhat readable
  ###
  deCompile: (code) ->
    compiledCode = []
    for item in code
      operation = CORE.vm.decode(item)
      operatorFn = CORE.vm.instructionCodes[operation[0]]
      if operator?
        operatorName = CORE.getFunctionName(operatorFn)
      else
        operatorName = "nop"
      compiledCode.push [operatorName, operation[1]]
    compiledCode

  makeDisplayableHtml: (codeArray) ->
    CORE.assembler._makeDisplayable codeArray, "<div class=\"line line{lineNumber}\">[\"{operator}\", {operand}],</div>"

  makeDisplayableText: (codeArray) ->
    CORE.assembler._makeDisplayable codeArray, "[\"{operator}\", {operand}],\n"

  _makeDisplayable: (codeArray, template) ->
    codeHtml = ""
    for line, ii in CORE.assembler.deCompile(codeArray) 
      if line?
        data =
          lineNumber: ii
          operator: line[0]
          operand: line[1]
      else
        data =
          lineNumber: ii
          operator: ""
          operand: ""
      codeHtml += template.supplant(data)
    codeHtml

  convertStringToCode: (codeString) ->
    return [] unless codeString?
    ((Number(codeStringArray[ii]) >>> 0) for code in codeString.split(","))
  
  #
  #    * This converts the array of [operator, operand] pairs to a string of 32bit integers. The
  #    * operator is shifted left 24 bits and the operand is added. All the integers are then
  #    * concatenated into a comma delimited string.
  #    
  convertCodeToString: (codeArray) ->
    codeArray.join ","
