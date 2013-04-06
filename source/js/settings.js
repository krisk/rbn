$(function () {

  var Settings = Fiber.extend(function() {

    var defaultSettings = {
      apiUrl: 'https://rb.corp.linkedin.com/api',
      pollInterval: 1000 * 60 * 5,
      maxItems: 25,
      showNotifications: true
    };

    return {
      settings: null,
      init: function() {
        var settings = this.get();

        // Create getter/setter properties for each setting.
        // By doing this, we can add a trigger and save function whenever
        // a setting is changed
        _.each(defaultSettings, function(value, setting) {
          var prop = value,
            self = this;

          Object.defineProperty(settings, setting, {
            get: function() {
              return prop;
            },
            set: function(val) {
              prop = val;
              self.trigger('changed', {setting: setting, value: val});
              self.save();
            }
          });

        }, this);
      },
      get: function() {
        if (!this.settings) {
          this.settings = _.defaults(RBN.DAL.getSettings() || {}, defaultSettings);
        }
        return this.settings;
      },
      save: function() {
        RBN.DAL.saveSettings(this.settings);
      }
    }
  });

  Fiber.mixin(Settings, Mixins.Event);

  RBN.Settings = new Settings();

});