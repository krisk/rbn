#!/bin/sh

SOURCE=source
while getopts o: option
do
  case "${option}"
  in
    o) SOURCE=${OPTARG};;
  esac
done

echo $SOURCE

rm -rf package
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=$SOURCE
mkdir package
mv $SOURCE.crx package/rbn.crx
mv $SOURCE.pem package/rbn.pem