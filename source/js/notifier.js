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

            var itemMap = new Object;
            for (x in items)
            {
                itemMap[items[x].id] = items[x];
            }

            var ids = Object.keys(itemMap);

            if (previousIds) {
              var newIds = _.difference(ids, previousIds); 
              if (newIds.length > 0) {
                var firstUpdate = itemMap[newIds[0]];
                if (RBN.Settings.get().showNotifications) {
                    var onlyOne = newIds.length == 1;
                    var description = onlyOne ? firstUpdate.description : "And " + newIds.length + " more.";
                    var notification = webkitNotifications.createNotification("http://cinco.corp.linkedin.com/images/users/thumbnail/" + firstUpdate.submitter + ".jpg",
                        firstUpdate.submitter + " - " + firstUpdate.summary, description);
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
