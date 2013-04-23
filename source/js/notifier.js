/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function($, _, window) {

  $(function() {
    var stopped = false;
    var Notifier = {};

    Notifier.start = function() {
      var interval = RBN.Settings.get().pollFrequency,
        previousIds = null;

      stopped = false;

      (function poll() {
        var pollTimer = setTimeout(function() {
          if (stopped) {
            clearTimeout(pollTimer);
            pollTimer = null;
            return;
          }

          RBN.DAL.RB.get(true).done(function(items) {
              if (stopped) {
                return;
              }

              var itemMap = {},
                ids = _.map(items, function(item) {
                  itemMap[item.id] = item;
                  return item.id;
                });

              if (previousIds) {
                var newIds = _.difference(ids, previousIds);
                if (newIds.length > 0) {
                  var firstUpdate = itemMap[newIds[0]];
                  if (RBN.Settings.get().showNotifications) {
<<<<<<< HEAD
                    var icon = firstUpdate.submitterImagelUrl,
=======
                    var icon = String.format(RBN.Settings.get().submitterImagelUrl, firstUpdate.submitter),
>>>>>>> 0fbad1f19a1884be115b34909a2abc97a143e443
                      title = String.format('{0} - {1}', firstUpdate.submitter, firstUpdate.summary),
                      description = newIds.length == 1 ? firstUpdate.description : String.format('And {0} more.', newIds.length),
                      notification = webkitNotifications.createNotification(icon, title, description);

                    notification.show();
                  }
                  chrome.browserAction.setBadgeText({text: '' + newIds.length});
                }
              }

              previousIds = ids;

            })
            .done(poll);

        }, interval);
      })();
    }

    Notifier.stop = function() {
      stopped = true;
    };

    Notifier.start();

    window.Notifier = Notifier;
  });

})(jQuery, _, window);