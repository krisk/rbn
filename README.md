RBN - Review Board Notifier
============================

### Build

`node build.js`

Creates a production ready (all scripts minified) Chrome Extension, in the package folder.  Simply drag the create `.crx` file into `chrome://extensions/`.

### Developer's version

You can create a Chrome Extension without any script minified by manually calling

`./make.sh`

As above, this will create the `.crx` file within the package folder.  Alternatively, can simply navigate to `chrome://extensions/` -> "Load unpacked extension..." -> and select the `source` directory.

