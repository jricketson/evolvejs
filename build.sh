#!/bin/bash

PROJECT=evolve
RD=media
WD=`pwd`
VERSION=4.0
YUICOMPRESSJS="java -jar ../util/yuicompressor-2.4.2.jar --type js --line-break 0"
YUICOMPRESSCSS="java -jar ../util/yuicompressor-2.4.2.jar --type css"

rm -rf $RD/$VERSION

cd common/.dojo-js/util/buildscripts
./build.sh profileFile=$WD/resources/js/$PROJECT.profile.js action=release \
releaseDir=$WD/$RD/ releaseName=$VERSION mini=true internStrings=true \
cssOptimize=comments.keepLines localeList="en-us" \
optimize= layerOptimize=shrinksafe stripConsole=normal

mkdir $WD/$RD/$VERSION/combined

cd $WD
cp resources/robots.txt $RD/
cp resources/image/favicon.gif $RD/

mv $RD/$VERSION/dojo/application.js.uncompressed.js $RD/$VERSION/dojo/application.js
mv $RD/$VERSION/dojo/foreign.js.uncompressed.js $RD/$VERSION/dojo/foreign.js
cat $RD/$VERSION/dojo/dojo.js $RD/$VERSION/dojo/application.js | $YUICOMPRESSJS > $RD/$VERSION/combined/complete.js
cat $WD/resources/js/$PROJECT/vm.js | $YUICOMPRESSJS --nomunge > $RD/$VERSION/vm.min.js
cat $RD/$VERSION/vm.min.js >> $RD/$VERSION/combined/complete.js
cat $RD/$VERSION/dojo/dojo.js $RD/$VERSION/dojo/speciesList.js | $YUICOMPRESSJS > $RD/$VERSION/combined/speciesList.js

cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/static.css > $RD/$VERSION/combined/static.css
cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/registration.css > $RD/$VERSION/combined/registration.css
cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/application.css > $RD/$VERSION/combined/evolve.css
cat $RD/$VERSION/dijit/themes/tundra/tundra.css $RD/$VERSION/dojo/resources/dojo.css $RD/$VERSION/style/speciesList.css > $RD/$VERSION/combined/speciesList.css

ln -s $WD/common/.dojo-js/util/ $RD/$VERSION/util

#if dev mode
ln -s $WD/resources/js/$PROJECT.profile.js $RD/$VERSION/$PROJECT-profile.js
ln -s $WD/resources/sitemap.xml $RD/sitemap.xml
ln -s $WD/common/django_aep_export/admin_media/media $RD/$VERSION/admin_media
rm $RD/$VERSION/$PROJECT -r
rm $RD/$VERSION/fragments -r
rm $RD/$VERSION/jquery -r
rm $RD/$VERSION/image -r
ln -s $WD/resources/fragments $RD/$VERSION/fragments
ln -s $WD/resources/js/$PROJECT $RD/$VERSION/$PROJECT
ln -s $WD/resources/js/jquery $RD/$VERSION/jquery
ln -s $WD/resources/style $RD/$VERSION/devStyle
ln -s $WD/resources/image $RD/$VERSION/image
