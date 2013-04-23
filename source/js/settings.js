/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function () {

  var Settings = Fiber.extend(function() {

    var defaultSettings = {
      url: '',
      submitterImagelUrl: '',
      pollFrequency: RBN.Constants.MINUTE * 5,
      maxItems: RBN.Constants.Items.MAX,
      showNotifications: true,
      lastUpdatedFrom: RBN.Constants.LastUpdated.YESTERDAY,
      displayOptions: RBN.Constants.DisplayOptions.NEED_SHIP_IT|RBN.Constants.DisplayOptions.HAVE_SHIP_IT
    };

    return {
      settings: null,
      defaults: defaultSettings,
      init: function() {
        this.settings = _.defaults(RBN.DAL.Settings.get() || {}, defaultSettings);

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