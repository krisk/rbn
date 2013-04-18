/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function() {

  var utils = {
    getLastUpdatedFromISO8601: function() {
        var FORMAT = 'YYYY-MM-DDTHH:mm:ss';

        switch (RBN.Settings.get().lastUpdatedFrom) {
          case RBN.Constants.LastUpdated.TODAY:
            return moment().startOf('day').format(FORMAT);
          case RBN.Constants.LastUpdated.YESTERDAY:
            return moment().subtract('days', 1).startOf('day').format(FORMAT);
          case RBN.Constants.LastUpdated.LAST_WEEK:
            return moment().subtract('days', 7).startOf('day').format(FORMAT);
          case RBN.Constants.LastUpdated.LAST_TWO_WEEKS:
            return moment().subtract('days', 14).startOf('day').format(FORMAT);
        }
    }
  };

  RBN.DAL.getCurrentUser = (function() {
    var user;

    return function() {
      var dfd = $.Deferred(),
        url;

      if (user) {
        dfd.resolve(user);
      }

      url = String.format('{0}/api/session', RBN.Settings.get().url);

      $.getJSON(url).done(function(result) {
        user = result.session.links.user.title;
        dfd.resolve(user);
      });

      return dfd.promise();
    }
  })();

  RBN.DAL.getSettings = function() {
    var settings = window.localStorage['review_boards_settings'];
    return settings && JSON.parse(settings);
  };

  RBN.DAL.saveSettings = function(settings) {
    window.localStorage['review_boards_settings'] = JSON.stringify(settings);
    window.localStorage['review_boards_expiry'] = -1;
  };

  RBN.DAL.getAllRBs = function(refresh) {
    var dfd = $.Deferred();

    function loadFromCache() {
      var expiry,
        items = window.localStorage['review_boards'];
      if (items) {
        expiry = window.localStorage['review_boards_expiry'];
        if (expiry < (new Date()).getTime()) {
          items = null;
          clearStorage();
          loadFromAPI();
        } else {
          items = JSON.parse(items);
          dfd.resolve(items)
        }
      } else {
        clearStorage();
        loadFromAPI();
      }
    }

    function loadFromAPI() {
      RBN.DAL.getCurrentUser().done(function(user) {

        var params = {
          'to-users': user,
          'status': RBN.Constants.Status.ALL,
          'last-updated-from': utils.getLastUpdatedFromISO8601()
        };

        var flags = RBN.Settings.get().displayOptions,
          options = RBN.Constants.DisplayOptions,
          url = String.format('{0}/api/review-requests/', RBN.Settings.get().url)
          dfds = [],
          items = [],
          imageUrl = String.format('{0}/{1}.jpg', RBN.Settings.get().submitterImagelUrl);

        function add(result, hasShipIt) {
          var arr = [];

          _.each(result.review_requests, function(item) {
            if (_.contains([RBN.Constants.Status.PENDING, RBN.Constants.Status.SUBMITTED], item.status)) {
              arr.push({
                id: item.id,
                summary: item.summary,
                description: item.description,
                last_updated: new Date(item.last_updated),
                status: item.status,
                time_added: new Date(item.time_added),
                submitter: item.links.submitter.title,
                submitter_img_url: String.format('{0}/{1}.jpg', RBN.Settings.get().submitterImagelUrl, item.links.submitter.title),
                hasShipIt: hasShipIt
              });
            }
          });
          items = items.concat(arr);
        }

        // We make wo calls to the API, one requesting RBs with no ship-it, and the other to request RBs with ship-it.
        // This is because if we make a single call asking for both (by ommitting the "ship-it" from the query string),
        // the items returned do not have a key to describe whether it has a ship-it or not. Therefore, to solve this,
        // we make two calls, thus being able to distinquish the items returned.

        if (flags & options.NEED_SHIP_IT) {
          dfds.push($.get(url, _.extend({}, params, {
              'ship-it': '0'
            })).done(function(result) {
              add(result, false);
            }));
        }

        if (flags & options.HAVE_SHIP_IT) {
          dfds.push($.get(url, _.extend({}, params, {
              'ship-it': '1'
            })).done(function(result) {
              add(result, true);
            }));
        }

        $.when.apply(null, dfds).done(function() {
          items.sort(function(a, b) {
            return a.last_updated > b.last_updated ? -1 : 1;
          });

          window.localStorage['review_boards'] = JSON.stringify(items);
          window.localStorage['review_boards_expiry'] =  (new Date()).getTime() + RBN.Settings.get().pollFrequency;

          dfd.resolve(items);
        });

      });
    }

    function clearStorage() {
      window.localStorage.removeItem('review_boards');
      window.localStorage.removeItem('review_boards_expiry');
    }

    if (refresh) {
      loadFromAPI();
    } else {
      loadFromCache();
    }

    return dfd.promise();
  }
})();