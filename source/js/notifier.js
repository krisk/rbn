$(function() {

  var Notifier = {};

  Notifier.pollForNewRBs = (function() {
    var previousIds = null;

    return function() {
      setTimeout(function() {

        RBN.DAL.getAllRBs()
          .done(function(items) {

            var ids = _.map(items, function(item) {
              return item.id;
            });

            if (previousIds) {
              var newIds = _.difference(ids, previousIds);
              if (newIds.length > 0) {
                var notification = webkitNotifications.createNotification('icon.png', 'New RB', newIds.length);
                notification.show();

                chrome.browserAction.setBadgeText({text: "" + newIds.length});
              }
            }

            previousIds = ids;

          })
          .done(Notifier.pollForNewRBs);

      }, RBN.Settings.pollInterval);
    }

  })();

  Notifier.pollForNewRBs();

});