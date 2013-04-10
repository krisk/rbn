/*!
 * RBN
 * Copyright 2012 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function() {
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
    RBN.DAL.getCurrentUser();

    var dfd = $.Deferred();

    function loadFromCache() {
      var expiry,
        items = window.localStorage['review_boards'];
      if (items) {
        expiry = window.localStorage['review_boards_expiry'];
        items = JSON.parse(items);
        if (expiry < (new Date()).getTime()) {
          items = null;
          clearStorage();
          loadFromAPI();
        } else {
          dfd.resolve(items)
        }
      } else {
        clearStorage();
        loadFromAPI();
      }
    }

    function loadFromAPI() {
      RBN.DAL.getCurrentUser().done(function(user) {

        $.getJSON(String.format('{0}/review-requests/?to-users={1}&status=pending&ship-it=0', RBN.Settings.get().apiUrl, user)).done(function(result) {

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