#!/bin/bash

PROJECT=evolve
RD=compiled
WD=`pwd`

rm $RD/$PROJECT/util
rm $RD/$PROJECT/dojox
rm $RD/$PROJECT/test
rm $RD/$PROJECT/$PROJECT
rm $RD/$PROJECT/fragments
rm $RD/$PROJECT/devStyle
cd common/.dojo-js/util/buildscripts
./build.sh profileFile=$WD/$PROJECT/media/js/$PROJECT.profile.js action=release \
releaseDir=$WD/$RD/ releaseName=$PROJECT mini=true internStrings=true \
cssOptimize=comments.keepLines cssImportIgnore=../dijit.css localeList="en-us" \
optimize= layerOptimize=shrinksafe stripConsole=normal

# we can also [in theory] remove all but the themeName.css file in themes/*.css
for t in 'tundra' 'soria' 'nihilo'
do
  cd $WD/$RD/$PROJECT/dijit/themes/$t/
  mv $t.css $t.tmp
  find . -name *.cs\? -exec rm '{}' ';'
  mv $t.tmp $t.css
done

cd $WD
cp resources/robots.txt $RD/$PROJECT
java -jar ../util/yuicompressor-2.4.1.jar $RD/$PROJECT/dojo/dojo.js.uncompressed.js > $RD/$PROJECT/dojo/dojo.min.js
mv $RD/$PROJECT/dojo/application.js.uncompressed.js $RD/$PROJECT/dojo/application.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/$PROJECT/dojo/application.js > $RD/$PROJECT/dojo/application.min.js
mv $RD/$PROJECT/dojo/foreign.js.uncompressed.js $RD/$PROJECT/dojo/foreign.js
java -jar ../util/yuicompressor-2.4.1.jar $RD/$PROJECT/dojo/foreign.js > $RD/$PROJECT/dojo/foreign.min.js
ln -s $WD/common/.dojo-js/util/ $RD/$PROJECT/util
ln -s $WD/common/.dojo-js/dojox $RD/$PROJECT/dojox
ln -s $WD/test/ $RD/$PROJECT/test

#if dev mode
cp $WD/resources/js/moolah.profile.js $RD/moolah/moolah-profile.js
rm $RD/moolah/moolah -r
rm $RD/moolah/fragments -r
ln -s $WD/resources/fragments $RD/moolah/fragments
ln -s $WD/resources/js/moolah $RD/moolah/moolah
ln -s $WD/resources/style $RD/moolah/devStyle
