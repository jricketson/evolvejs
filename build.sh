#!/bin/bash

RD=compiled
WD=`pwd`

rm $RD/evolve/util
rm $RD/evolve/dojox
rm $RD/evolve/test
rm $RD/evolve/evolve
rm $RD/evolve/fragments
rm $RD/evolve/devStyle
cd common/.dojo-js/util/buildscripts
./build.sh profileFile=$WD/evolve/media/js/moolah.profile.js action=release \
releaseDir=$WD/$RD/ releaseName=moolah mini=true internStrings=true \
cssOptimize=comments.keepLines cssImportIgnore=../dijit.css localeList="en-us" \
optimize= layerOptimize=shrinksafe stripConsole=normal

# we can also [in theory] remove all but the themeName.css file in themes/*.css
for t in 'tundra' 'soria' 'nihilo'
do
  cd $WD/$RD/moolah/dijit/themes/$t/
  mv $t.css $t.tmp
  find . -name *.cs\? -exec rm '{}' ';'
  mv $t.tmp $t.css
done

cd $WD
cp resources/robots.txt $RD/moolah
java -jar ../util/yuicompressor-2.4.1.jar $RD/moolah/dojo/dojo.js.uncompressed.js > $RD/moolah/dojo/dojo.min.js
mv $RD/moolah/dojo/application.js.uncompressed.js $RD/moolah/dojo/application.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/moolah/dojo/application.js > $RD/moolah/dojo/application.min.js
mv $RD/moolah/dojo/faq.js.uncompressed.js $RD/moolah/dojo/faq.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/moolah/dojo/faq.js > $RD/moolah/dojo/faq.min.js
mv $RD/moolah/dojo/about.js.uncompressed.js $RD/moolah/dojo/about.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/moolah/dojo/about.js > $RD/moolah/dojo/about.min.js
mv $RD/moolah/dojo/foreign.js.uncompressed.js $RD/moolah/dojo/foreign.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/moolah/dojo/foreign.js > $RD/moolah/dojo/foreign.min.js
ln -s $WD/common/.dojo-js/util/ $RD/moolah/util
ln -s $WD/common/.dojo-js/dojox $RD/moolah/dojox
ln -s $WD/test/ $RD/moolah/test

#if dev mode
cp $WD/resources/js/moolah.profile.js $RD/moolah/moolah-profile.js
rm $RD/moolah/moolah -r
rm $RD/moolah/fragments -r
ln -s $WD/resources/fragments $RD/moolah/fragments
ln -s $WD/resources/js/moolah $RD/moolah/moolah
ln -s $WD/resources/style $RD/moolah/devStyle
