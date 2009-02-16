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
            "fragments.sidebar.sidebar"
         ];
var about=[
            "jquery.jquery-1-3-1",
            "jquery.jquery-log",
            "evolve.core",
            "jquery.jquery-depends"
];
var foreign = [
            "dojo.parser",
            "dijit.layout.ContentPane",
            "dijit.layout.BorderContainer",
            "dijit.layout.AccordionContainer",
            "jquery.jquery-1-3",
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
      [ "evolve", myroot+"/evolve/media/js/evolve",  myroot+"/evolve/media/copyright.txt"],
      [ "fragments", myroot+"/evolve/media/fragments",  myroot+"/evolve/media/copyright.txt" ],
      [ "jquery", myroot+"/evolve/media/js/jquery",  myroot+"/evolve/media/copyright.txt" ],
      [ "external", myroot+"/evolve/media/js/external",  myroot+"/evolve/media/copyright.txt" ],
      [ "image", myroot+"/evolve/media/image",  myroot+"/evolve/media/copyright.txt" ],
      [ "style", myroot+"/evolve/media/style",  myroot+"/evolve/media/copyright.txt" ],
      [ "dijit", "../dijit"]
      
   ]
};
