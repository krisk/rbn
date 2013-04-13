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
          case '1':
            return moment().startOf('day').format(FORMAT);
          case '2':
            return moment().subtract('days', 1).startOf('day').format(FORMAT);
          case '3':
            return moment().subtract('days', 7).startOf('day').format(FORMAT);
          case '4':
            return moment().subtract('days', 14).startOf('day').format(FORMAT);
        }
    }
  };

  RBN.DAL.getCurrentUser = (function() {
    var user;

    return function() {
      var dfd = $.Deferred();

      if (user) {
        dfd.resolve(user);
      }

      $.getJSON(RBN.Settings.get().apiUrl + '/session').done(function(result) {
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

        $.get(RBN.Settings.get().apiUrl + '/review-requests/', {
            'to-users': user,
            'status': 'pending',
            'ship-it': '0',
            'last-updated-from': utils.getLastUpdatedFromISO8601()
          })
          .done(function(result) {

          var items = _.map(result.review_requests, function(item) {
            return {
              id: item.id,
              summary: item.summary,
              description: item.description,
              last_updated: new Date(item.last_updated),
              status: item.status,
              time_added: new Date(item.time_added),
              submitter: item.links.submitter.title
            }
          });

          window.localStorage['review_boards'] = JSON.stringify(items);
          window.localStorage['review_boards_expiry'] =  (new Date()).getTime() + RBN.Settings.get().pollInterval;

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