/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function () {

  var Settings = Fiber.extend(function() {
    var MINUTE = 1000 * 60;

    var defaultSettings = {
      apiUrl: 'https://rb.corp.linkedin.com/api',
      reviewUrl: 'https://rb.corp.linkedin.com/r/{0}',
      submitterImagelUrl: 'http://cinco.corp.linkedin.com/images/users/thumbnail/{0}.jpg',
      pollInterval: 1000 * 60 * 5,
      minItems: 5,
      maxItems: 25,
      showNotifications: true,
      lastUpdatedFrom: 4
    };

    return {
      settings: null,
      defaults: defaultSettings,
      init: function() {
        this.settings = _.defaults(RBN.DAL.getSettings() || {}, defaultSettings);

        var settings = this.settings;

        // Create getter/setter properties for each setting.
        // By doing this, we can add a trigger and save function whenever
        // a setting is changed
        _.each(settings, function(value, setting) {
          var prop = value,
            self = this;

          Object.defineProperty(settings, setting, {
            get: function() {
              return prop;
            },
            set: function(val) {
              prop = val;
              self.trigger('change', { setting: setting, value: val});
              self.save();
            }
          });

        }, this);
      },
      get: function() {
        return this.settings;
      },
      save: function() {
        RBN.DAL.saveSettings(this.get());
      }
    }
  });

  Fiber.mixin(Settings, Mixins.Event);

  RBN.Settings = new Settings();

})();