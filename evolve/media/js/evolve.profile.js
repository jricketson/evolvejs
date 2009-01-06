var myroot = "/home/jon/data/workspace3.3/evolveJsgoogle";
var local=[
            "evolve.core",
            "jquery.jquery-depends",
            "jquery.jquery-gadget",
            "evolve.environment",
            "evolve.process",
            "evolve.vm",
            "evolve.dataAccess",
            "evolve.species",
            "evolve.speciesLibrary",
            "evolve.display",
            "evolve.assembly",
            "evolve.index",
            "evolve.ancestor",
            "fragments.sidebar.sidebar"
         ];
var foreign = [
            "dojo.parser",
            "dijit.layout.ContentPane",
            "dijit.layout.BorderContainer",
            "jquery.jquery-1-2-6",
            "jquery.jquery-log",
            "external.json2"
         ];
dependencies = {
   layers: [
      {
         name: "local.js",
         dependencies: local
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
