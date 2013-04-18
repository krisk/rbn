(function () {
  var config = {
    OUTPUT_DIR: 'output',
    background: {
      files: [
        './source/js/lib/string-format.js',
        './source/js/lib/jquery-1.8.2.js',
        './source/js/lib/underscore.js',
        './source/js/lib/moment.js',
        './source/js/lib/fiber.js',
        './source/js/utils/mixins.js',
        './source/js/setup.js',
        './source/js/constants.js',
        './source/js/dal.js',
        './source/js/settings.js',
        './source/js/notifier.js'
      ],
      output: 'background.js'
    },
    options: {
      files: [
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
        './source/js/ui/options.js'
      ],
      output: 'options.js',
      page: './source/options.html',
      css: {
        files: [
          './source/css/options.css',
        ],
        output: 'options.css'
      }
    },
    popup: {
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
      output: 'app.js',
      page: './source/popup.html',
      css: {
        files: [
          './source/css/style.css',
          './source/css/spinner.css'
        ],
        output: 'app.css'
      }
    },
    icons: [
      './source/images/icon.png',
      './source/images/thumb-up-icon.png',
      './source/images/exclamation-icon.png',
      './source/images/ghost_person.png',
      './source/images/Settings-icon.png'
    ],
    manifest: './source/manifest.json',
  };

  module.exports = config;
})();