CORE.ancestor = function() {
   return {
      blindAnimal: function() {return CORE.assembler.compile([
//START
["nop",0],["nop",0],["nop",0],["nop",0],

//initialise threads
["jmpReadPtrF",3], 
["runThread",0], //5

//repro cell
["nop",0],["nop",0],["nop",0],["nop",0],["nop",0], //10
["jmpReadPtrB",4], //jmp to template 4
["jmpWritePtrF",2], //jmp to template 2
["pushMemSize",0],
["alloc",0],
["incWritePtr",0], //inc write pointer to start of new animal

["nop",0], //start copy loop //15
["copy",0],
["incReadPtr",0],
["incWritePtr",0],

["pushWritePtr",0], //20
["pushMemSize",0], //if writeptr < memSize
["lt",0],
["ifdo",1],
["jmpB",1], //jmp to template 1

["nop",0],["nop",0],["nop",0],["nop",0],["nop",0],["nop",0], //template 6

["divide",0],
["ifdo",2], //if division successful
["turnR",0],
["sleep",405],
["jmpB",5], //25

["turnR",0], //turn around and try again
["jmpB",6], 

//move cell
["nop",0],["nop",0],["nop",0],
["move",0],
["sleep",20],
["jmpB",3],

//END
["nop",0],["nop",0]

])},

      tree: function() {CORE.assembler.compile([
//START
//repro cell
["nop",0],["nop",0],["nop",0],["nop",0],["nop",0], //5
["jmpReadPtrB",5], //jmp to template 5
["jmpWritePtrF",2], //jmp to template 2
["pushMemSize",0],
["alloc",0],
["incWritePtr",0], //inc write pointer to start of new animal, 10

["nop",0], //start copy loop 
["copy",0],
["incReadPtr",0],
["incWritePtr",0],

["pushWritePtr",0], //15
["pushMemSize",0], //if writeptr < memSize
["lt",0],
["ifdo",1],
["jmpB",1], //jmp to template 3

["nop",0],["nop",0],["nop",0],["nop",0],["nop",0],["nop",0], //template 6, 25

["divide",0],
["ifdo",1], //if division successful
["jmpB",5],

["jmpMemPtrB",6],// count the number of times that this has happened
["pushM",0], //30
["add",1],
["popM",0],
["pushM",0],
["push",4],
["gte",0], //35
["ifdo",3],
["sleep",450],
["push",0],
["popM",0],

["turnR",0], //turn around and try again //40
["jmpB",6], 

//END
["nop",0],["nop",0] //43

])}

};
}();