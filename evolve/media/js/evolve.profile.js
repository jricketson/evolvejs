var myroot = "/home/jon/data/workspace3.3/moolahgoogle";
var local=[
            "moolah.core",
            "jquery.jquery-depends",
            "jquery.jquery-gadget",
            "moolah.chartData",
            "moolah.data",
            "moolah.application",
            "moolah.tutorial",
            "moolah.util",
            "fragments.accountElement.accountElement",
            "fragments.accountForm.accountForm",
            "fragments.accountPanel.accountPanel",
            "fragments.accountElement.accountElement",
            "fragments.charts.charts",
            "fragments.futureTransactionElement.futureTransactionElement",
            "fragments.futureTransactionForm.futureTransactionForm",
            "fragments.futureTransactionPanel.futureTransactionPanel",
            "fragments.invitationForm.invitationForm",
            "fragments.helpPanel.helpPanel",
            "fragments.helpElement.helpElement"
         ];
var foreign = [
            "dojo.parser",
            "dijit.Dialog",
            "dijit.layout.ContentPane",
            "dijit.layout.BorderContainer",
            "dijit.form.CurrencyTextBox",
            "dijit.form.NumberTextBox",
            "dijit.form.DateTextBox",
            "dijit.form.Slider",
            "dijit.layout.AccordionContainer",
            "jquery.jquery-1-2-6",
            "jquery.jquery-log",
            "jquery.jquery-flot",
            "jquery.jquery-form",
            "jquery.jquery-hoverIntent",
            "external.dateFunctions",
            "external.json2",
            "external.template-1038"
         ];
var faq=[
            "jquery.jquery-1-2-6",
            "jquery.jquery-log",
            "moolah.core",
            "jquery.jquery-depends"
];
var about=[
            "jquery.jquery-1-2-6",
            "jquery.jquery-log",
            "moolah.core",
            "jquery.jquery-depends"
];
dependencies = {
   layers: [
      {
         name: "local.js",
         dependencies: local
      },
      {
         name: "faq.js",
         dependencies: faq
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
      } /*,
      {
         name: "testing.js",
         dependencies: [
            "dijit.dijit",
            "dijit.robotx"
         ]
      }*/
   ],

   prefixes: [
      [ "moolah", myroot+"/resources/js/moolah",  myroot+"/resources/copyright.txt"],
      [ "fragments", myroot+"/resources/fragments",  myroot+"/resources/copyright.txt" ],
      [ "jquery", myroot+"/resources/js/jquery",  myroot+"/resources/copyright.txt" ],
      [ "external", myroot+"/resources/js/external",  myroot+"/resources/copyright.txt" ],
      [ "image", myroot+"/resources/image",  myroot+"/resources/copyright.txt" ],
      [ "style", myroot+"/resources/style",  myroot+"/resources/copyright.txt" ] /*,
      [ "doh", "../util/doh"],
      [ "dojox", "../dojox"]*/
      
   ]
};
