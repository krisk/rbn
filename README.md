RBN - Review Board Notifier
============================

### Ready to use

Download the `.crx` file found in the `package` folder, and simply drag it into `chrome://extensions/`.

### Want to build from source?

Simply do:

`node build.js`

Creates a production ready (all scripts minified) Chrome Extension `.crx` file in the `package` folder.

### Developer's version

You can create a Chrome Extension without any script minified by manually calling

`./make.sh`

As above, this will create the `.crx` file within the `package` folder.  Alternatively, you can simply navigate to `chrome://extensions/` > "Load unpacked extension..." > and select the `source` directory.

