(function () {
  var config = {
    OUTPUT_DIR: 'output',
    background: {
      files: [
        './source/js/lib/string-format.js',
        './source/js/lib/jquery-1.8.2.js',
        './source/js/lib/underscore.js',
        './source/js/lib/moment.js',
        './source/js/setup.js',
        './source/js/constants.js',
        './source/js/dal.js',
        './source/js/lib/fiber.js',
        './source/js/utils/mixins.js',
        './source/js/settings.js',
        './source/js/notifier.js'
      ],
      output: 'background.js'
    },
    html: {
      files: [
        './source/js/migration.js',
        './source/js/lib/string-format.js',
        './source/js/lib/jquery-1.8.2.js',
        './source/js/lib/underscore.js',
        './source/js/lib/moment.js',
        './source/js/lib/fuse.js',
        './source/js/lib/fiber.js',
        './source/js/utils/mixins.js',
        './source/js/setup.js',
        './source/js/constants.js',
        './source/js/dal.js',
        './source/js/settings.js',
        './source/js/ui/list.js',
        './source/js/ui/rb-list.js',
        './source/js/ui/header.js',
        './source/js/app.js'
      ],
      output: 'app.js'
    },
    css: {
      files: [
        './source/css/header.css',
        './source/css/style.css',
        './source/css/spinner.css'
      ],
      output: 'style.css'
    },
    icons: [
      './source/icon.png',
      './source/ghost_person.png',
      './source/Settings-icon.png'
    ],
    manifest: './source/manifest.json',
    popup: './source/popup.html'
  };

  module.exports = config;
})();