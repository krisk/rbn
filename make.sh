#!/bin/sh

rm -rf package
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=source
mkdir package
mv source.crx package/rbn.crx
mv source.pem package/rbn.pem