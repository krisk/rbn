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

rm -rf package/rbn.crx
google-chrome --pack-extension=$SOURCE --pack-extension-key=package/rbn.pem
mkdir -p package
mv $SOURCE.crx package/rbn.crx
