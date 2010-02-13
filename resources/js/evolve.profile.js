var myroot = "../../..";
var jquery="jquery.jquery-1-4-1";
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
            "evolve.assembly",
            "evolve.application",
            "evolve.ancestor",
            "evolve.util",
            "evolve.vm",
            "fragments.sidebar.sidebar"
         ];
var staticpage=[
            jquery,
            "jquery.jquery-log",
            "evolve.core",
            "evolve.static",
            "evolve.dataAccess",
            "evolve.util"
];
var foreign = [
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
         name: "static.js",
         dependencies: staticpage
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
                        "jquery.jquery-event-drag-1-5",
                        "jquery.jquery-event-drop-1-2",
                        "jquery.jquery-log",
                        "external.diff_match_patch",
                        "external.json2",
                        "evolve.core",
                        'evolve.speciesList',
                        "evolve.assembly",
                        "evolve.vm",
                        "evolve.util",
                        'evolve.dataAccess']
      }
   ],

   prefixes: [
      [ "evolve", myroot+"/resources/js/evolve"],
      [ "fragments", myroot+"/resources/fragments" ],
      [ "jquery", myroot+"/resources/js/jquery" ],
      [ "external", myroot+"/resources/js/external" ],
      [ "image", myroot+"/resources/image" ],
      [ "style", myroot+"/resources/style" ]
      
   ]
};
