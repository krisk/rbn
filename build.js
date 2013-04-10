(function() {

  var colors = require('colors'),
    fs = require('fs'),
    config = require('./config');

  var FILE_ENCODING = 'utf-8',
    EOL = '\n',
    OUTPUT_DIR = 'output';

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
      Build.copyBackgroundScripts();
      Build.copyScripts();
      Build.copyImages();
      Build.copyCss();
      Build.changeManifest();
      Build.updateHtml();
      Build.make();
    },
    setup: function() {
      try {
        Utils.rmDir(OUTPUT_DIR);
      } catch (e) {}
      fs.mkdirSync(OUTPUT_DIR);
    },
    copyBackgroundScripts: function() {
      console.log('Copying background scripts'.grey);

      var result = Utils.concat(config.background.files);
      Utils.uglify(result, OUTPUT_DIR + '/' + config.background.output);
    },
    copyScripts: function() {
      console.log('Copying scripts'.grey);

      var result = Utils.concat(config.html.files);
      Utils.uglify(result, OUTPUT_DIR + '/' + config.html.output);
    },
    copyImages: function() {
      console.log('Copying images'.grey);

      config.icons.forEach(function(item) {
        var file = fs.readFileSync(item);
        var name = item.substr(item.lastIndexOf('/') + 1);
        fs.writeFileSync(OUTPUT_DIR + '/' + name, file);
      });
    },
    copyCss: function() {
      console.log('Copying CSS'.grey);

      var result = Utils.concat(config.css.files);
      fs.writeFileSync(OUTPUT_DIR + '/' + config.css.output, result, FILE_ENCODING);
    },
    changeManifest: function() {
      console.log('Updating manifest'.grey);

      var manifest = fs.readFileSync('./source/manifest.json', FILE_ENCODING);
      var json  = JSON.parse(manifest);
      json.background.scripts = [config.background.output];
      fs.writeFileSync(OUTPUT_DIR + '/manifest.json', JSON.stringify(json), FILE_ENCODING);
    },
    updateHtml: function() {
      console.log('Updating HTML'.grey);

      var file = fs.readFileSync('./source/popup.html', FILE_ENCODING);

      file = file.replace(/<script[^>]*>[^<]*<\/script>/g, '');
      file = file.replace('<!--[SCRIPTS]-->', '<script src="' + config.html.output + '"></script>');

      // CSS
      file = file.replace(/<link[^>]*[^>]*>/g, '');
      file = file.replace('<!--[CSS]-->', '<link type="text/css" rel="stylesheet" href="'+ config.css.output + '">');

      fs.writeFileSync(OUTPUT_DIR + '/popup.html', file, FILE_ENCODING);
    },
    make: function() {
      console.log('Constructing Chrome extension'.grey);

      var exec = require('child_process').exec;
      exec('./make.sh -o ' + OUTPUT_DIR, function() {
        //Utils.rmDir(OUTPUT_DIR);
        console.log('Done!'.green);
      });
    }
  }

  build();

})();