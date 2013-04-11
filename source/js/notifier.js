/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function() {

  var stopped = false;
  var Notifier = {};

  Notifier.start = function() {
    var interval = RBN.Settings.get().pollInterval,
      previousIds = null;

    stopped = false;

    function poll() {

      pollTimer = setTimeout(function() {

        if (stopped) {
          clearTimeout(pollTimer);
          pollTimer = null;
          return;
        }

        RBN.DAL.getAllRBs()
          .done(function(items) {

            if (stopped) {
              return;
            }

            var ids = _.map(items, function(item) {
              return item.id;
            });

            if (previousIds) {
              var newIds = _.difference(ids, previousIds);
              if (newIds.length > 0) {
                if (RBN.Settings.get().showNotifications) {
                  var notification = webkitNotifications.createNotification('icon.png', 'New RB', newIds.length);
                  notification.show();
                }
                chrome.browserAction.setBadgeText({text: "" + newIds.length});
              }
            }

            previousIds = ids;

          })
          .done(poll);

      }, interval);
    }

    poll();
  }

  Notifier.stop = function() {
    stopped = true;
  };

  Notifier.start();

  window.Notifier = Notifier;
});