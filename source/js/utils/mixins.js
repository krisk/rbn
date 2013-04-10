/*!
 * RBN
 * Copyright 2012 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function() {
  var Mixins = {};

  Mixins.Event  = function(base) {
    return  {
        _hook: function() {
          // TODO: use method swizzling instead.
          if (!this._$hook) {
            this._$hook = $({});
          }
          return this._$hook;
        },
        on: function() {
          var hook = this._hook();
          hook.on.apply(hook, arguments);
        },
        off: function() {
          var hook = this._hook();
          hook.off.apply(hook, arguments);
        },
        trigger: function() {
          var hook = this._hook();
          hook.trigger.apply(hook, arguments);
        }
    }
  }

  window.Mixins = Mixins;
})();