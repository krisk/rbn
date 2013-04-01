(function() {

  var RBN = {
    Settings: {
      User: 'krisk',
      pollInterval: 1000 * 60 * 5,
      maxItems: 25
    },
    App: {},
    DAL: {},
    UI: {}
  };

  alert('TESTING!');

  RBN.UI.setBadgeCount = function(count) {
    chrome.browserAction.setBadgeText({text: count});
  }

  RBN.DAL.getAllRBs = function(refresh) {
    var dfd = $.Deferred();

    function loadFromCache() {
      var expiry,
        items = window.localStorage['review_boards'];

      if (items) {
        expiry = window.localStorage['review_boards_expiry']
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
      $.getJSON('https://rb.corp.linkedin.com/api/review-requests/?to-users=' + RBN.Settings.User + '&status=pending&ship-it=0').done(function(result) {

        console.log(result);

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
        window.localStorage['review_boards_expiry'] =  (new Date()).getTime() + (1000 * 60 * 5);

        dfd.resolve(items);
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

  window.RBN = RBN;

})();