#!/bin/bash

PROJECT=evolve
WD=`pwd`
RD=$WD/media
VERSION=3
YUICOMPRESSJS="java -jar ../util/yuicompressor-2.4.1.jar --type js"

rm $RD/$VERSION/util
rm $RD/$VERSION/test
rm $RD/$VERSION/$PROJECT
rm $RD/$VERSION/fragments
rm $RD/$VERSION/devStyle
rm $RD/$VERSION/jquery
rm $RD/sitemap.xml
cd common/.dojo-js/util/buildscripts
./build.sh profileFile=$WD/resources/js/$PROJECT.profile.js action=release \
releaseDir=$RD/ releaseName=$VERSION mini=true internStrings=true \
cssOptimize=comments.keepLines localeList="en-us" \
optimize= layerOptimize=shrinksafe stripConsole=normal

mkdir $RD/$VERSION/combined
cp -R $RD/$VERSION/dijit/themes/tundra/images $RD/$VERSION/combined

cd $WD
cp resources/robots.txt $RD/
cp resources/image/favicon.gif $RD/

cp -r $WD/_generated_media/$VERSION/admin_media $RD/$VERSION/

mv $RD/$VERSION/dojo/application.js.uncompressed.js $RD/$VERSION/dojo/application.js
mv $RD/$VERSION/dojo/foreign.js.uncompressed.js $RD/$VERSION/dojo/foreign.js
cat $RD/$VERSION/dojo/dojo.js $RD/$VERSION/dojo/application.js | $YUICOMPRESSJS > $RD/$VERSION/combined/complete.js
cat $WD/resources/js/$PROJECT/vm.js | $YUICOMPRESSJS --nomunge > $RD/$VERSION/vm.min.js
cat $RD/$VERSION/vm.min.js >> $RD/$VERSION/combined/complete.js

cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/static.css > $RD/$VERSION/combined/static.css
cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/registration.css > $RD/$VERSION/combined/registration.css
cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/application.css > $RD/$VERSION/combined/evolve.css

ln -s $WD/common/.dojo-js/util/ $RD/$VERSION/util

#if dev mode
ln -s $WD/resources/js/$PROJECT.profile.js $RD/$VERSION/$PROJECT-profile.js
ln -s $WD/resources/sitemap.xml $RD/sitemap.xml
rm $RD/$VERSION/$PROJECT -r
rm $RD/$VERSION/fragments -r
rm $RD/$VERSION/jquery -r
ln -s $WD/resources/fragments $RD/$VERSION/fragments
ln -s $WD/resources/js/$PROJECT $RD/$VERSION/$PROJECT
ln -s $WD/resources/js/jquery $RD/$VERSION/jquery
ln -s $WD/resources/style $RD/$VERSION/devStyle
