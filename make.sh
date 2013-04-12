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

OS=${OSTYPE//[0-9.]/}
GOOGLE_CHROME=

if [[ $OS == 'darwin' ]]; then
   alias GOOGLE_CHROME='/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
elif [[ $OS == 'linux-gnu' ]]; then
   alias GOOGLE_CHROME='google-chrome'
fi

rm -rf package
GOOGLE_CHROME --pack-extension=$SOURCE
mkdir package
mv $SOURCE.crx package/rbn.crx
mv $SOURCE.pem package/rbn.pem