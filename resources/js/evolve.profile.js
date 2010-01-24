var myroot = "../../..";
var jquery="jquery.jquery-1-3-2";
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
            jquery,
            "jquery.jquery-log",
            "evolve.core",
            "jquery.jquery-depends"
];
var foreign = [
            "dojo.parser",
            jquery,
            "external.json2",
            "external.contrast"
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
      },
      {
         name: "speciesList.js",
         dependencies: [jquery,
                        "jquery.jquery-log",
                        "external.json2",
                        "evolve.core",
                        'evolve.speciesList',
                        "evolve.assembly",
                        "evolve.vm",
                        'evolve.dataAccess']
      }
   ],

   prefixes: [
      [ "evolve", myroot+"/resources/js/evolve"],
      [ "fragments", myroot+"/resources/fragments" ],
      [ "jquery", myroot+"/resources/js/jquery" ],
      [ "external", myroot+"/resources/js/external" ],
      [ "image", myroot+"/resources/image" ],
      [ "style", myroot+"/resources/style" ],
      [ "dojox", "../dojox"]
      
   ]
};
