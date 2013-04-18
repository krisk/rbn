(function() {

  var colors = require('colors'),
    fs = require('fs'),
    config = require('./config');

  var FILE_ENCODING = 'utf-8',
    EOL = '\n',
    OUTPUT_DIR = config.OUTPUT_DIR;

  var Utils = {
    rmDir: function(dirPath) {
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }

      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          } else {
            Utils.rmDir(filePath);
          }
        }
      fs.rmdirSync(dirPath);
    },
    concat: function(fileList) {
      var out = fileList.map(function(filePath){
        return fs.readFileSync(filePath, FILE_ENCODING);
      });
      return out.join(EOL);
    },
    uglify: function(src, distPath) {
      var uglyfyJS = require('uglify-js');

      var result = uglyfyJS.minify(src, {
        fromString: true,
        output: {
          comments: /^!|@preserve|@license|@cc_on/
        }
      });

      fs.writeFileSync(distPath, result.code, FILE_ENCODING);
    }
  };

  var Build = {
    init: function() {
      Build.setup();

      Build.copyPopUpScripts();
      Build.copyPopUpCss();
      Build.copyImages();
      Build.updatePopUpHtml();

      Build.copyBackgroundScripts();
      Build.copyOptionsPageSripts();
      Build.copyOptionsPageCss();
      Build.updateOptionsHtml();

      Build.changeManifest();
      Build.make();
    },

    setup: function() {
      try {
        Utils.rmDir(OUTPUT_DIR);
      } catch (e) {}
      fs.mkdirSync(OUTPUT_DIR);
    },

    // Background
    copyBackgroundScripts: function() {
      console.log('Copying background scripts'.grey);

      var result = Utils.concat(config.background.files);
      Utils.uglify(result, OUTPUT_DIR + '/' + config.background.output);
    },

    // Pop Up
    copyPopUpScripts: function() {
      console.log('Copying pop up scripts'.grey);

      var result = Utils.concat(config.popup.files);
      Utils.uglify(result, OUTPUT_DIR + '/' + config.popup.output);
    },
    copyPopUpCss: function() {
      console.log('Copying pop up CSS'.grey);

      var result = Utils.concat(config.popup.css.files);
      fs.writeFileSync(OUTPUT_DIR + '/' + config.popup.css.output, result, FILE_ENCODING);
    },
    updatePopUpHtml: function() {
      console.log('Updating pop up HTML'.grey);

      var file = fs.readFileSync(config.popup.page, FILE_ENCODING);

      // JS
      file = file.replace(/<script[^>]*>[^<]*<\/script>/g, '');
      file = file.replace('<!--[SCRIPTS]-->', '<script src="' + config.popup.output + '"></script>');

      // CSS
      file = file.replace(/<link[^>]*[^>]*>/g, '');
      file = file.replace('<!--[CSS]-->', '<link type="text/css" rel="stylesheet" href="'+ config.popup.css.output + '">');

      fs.writeFileSync(OUTPUT_DIR + '/popup.html', file, FILE_ENCODING);
    },

    // Options page
    copyOptionsPageSripts: function() {
      console.log('Copying options page scripts'.grey);

      var result = Utils.concat(config.options.files);
      Utils.uglify(result, OUTPUT_DIR + '/' + config.options.output);
    },
    copyOptionsPageCss: function() {
      console.log('Copying options page CSS'.grey);

      var result = Utils.concat(config.options.css.files);
      fs.writeFileSync(OUTPUT_DIR + '/' + config.options.css.output, result, FILE_ENCODING);
    },
    updateOptionsHtml: function() {
      console.log('Updating Options HTML'.grey);

      var file = fs.readFileSync(config.options.page, FILE_ENCODING);

      // JS
      file = file.replace(/<script[^>]*>[^<]*<\/script>/g, '');
      file = file.replace('<!--[SCRIPTS]-->', '<script src="' + config.options.output + '"></script>');

      // CSS
      file = file.replace(/<link[^>]*[^>]*>/g, '');
      file = file.replace('<!--[CSS]-->', '<link type="text/css" rel="stylesheet" href="'+ config.options.css.output + '">');

      fs.writeFileSync(OUTPUT_DIR + '/options.html', file, FILE_ENCODING);
    },

    copyImages: function() {
      console.log('Copying images'.grey);

      var IMAGE_DIR = OUTPUT_DIR + '/images';
      fs.mkdirSync(IMAGE_DIR);

      config.icons.forEach(function(item) {
        var file = fs.readFileSync(item);
        var name = item.substr(item.lastIndexOf('/') + 1);
        fs.writeFileSync(IMAGE_DIR + '/' + name, file);
      });
    },

    // Manifest
    changeManifest: function() {
      console.log('Updating manifest'.grey);

      var manifest = fs.readFileSync(config.manifest, FILE_ENCODING);
      var json  = JSON.parse(manifest);
      json.background.scripts = [config.background.output];
      fs.writeFileSync(OUTPUT_DIR + '/manifest.json', JSON.stringify(json), FILE_ENCODING);
    },

    // Make
    make: function() {
      console.log('Constructing Chrome extension'.grey);

      var exec = require('child_process').exec;
      exec('./make.sh -o ' + OUTPUT_DIR, function() {
        Utils.rmDir(OUTPUT_DIR);
        console.log('Done!'.green);
      });
    }
  }

  Build.init();

})();