var myroot = "/home/jon/data/workspace3.3/evolveJsgoogle";
var local=[
            "evolve.core",
            "jquery.jquery-depends",
            "jquery.jquery-gadget",
            "jquery.jquery-log",
            "evolve.environment",
            "evolve.process",
            "evolve.dataAccess",
            "evolve.species",
            "evolve.speciesLibrary",
            "evolve.display",
            "evolve.assembly",
            "evolve.application",
            "evolve.ancestor",
            "evolve.util",
            "evolve.vm",
            "fragments.sidebar.sidebar"
         ];
var about=[
            "jquery.jquery-1-3-2",
            "jquery.jquery-log",
            "evolve.core",
            "jquery.jquery-depends"
];
var foreign = [
            "dojo.parser",
            "dijit.layout.ContentPane",
            "dijit.layout.BorderContainer",
            "dijit.layout.AccordionContainer",
            "jquery.jquery-1-3-2",
            "external.json2"
         ];
dependencies = {
   layers: [
      {
         name: "local.js",
         dependencies: local
      },
      {
         name: "about.js",
         dependencies: about
      },
      {
         name: "foreign.js",
         dependencies: foreign
      },
      {
         name: "application.js",
         dependencies: foreign.concat(local)
      }
   ],

   prefixes: [
      [ "evolve", myroot+"/resources/js/evolve",  myroot+"/resources/copyright.txt"],
      [ "fragments", myroot+"/resources/fragments",  myroot+"/resources/copyright.txt" ],
      [ "jquery", myroot+"/resources/js/jquery",  myroot+"/resources/copyright.txt" ],
      [ "external", myroot+"/resources/js/external",  myroot+"/resources/copyright.txt" ],
      [ "image", myroot+"/resources/image",  myroot+"/resources/copyright.txt" ],
      [ "style", myroot+"/resources/style",  myroot+"/resources/copyright.txt" ],
      [ "dijit", "../dijit"],
      [ "dojox", "../dojox"]
      
   ]
};
