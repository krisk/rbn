/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function($, _, window) {

  var DAL = Fiber.extend(function() {
    var STATUS_CODES = {
      UAUTHORIZED: 401
    };

    return {
      validateResponse: function(data, text, xhr) {
        if (data.session && !data.session.authenticated) {
          var deferred = $.Deferred();
          deferred.rejectWith(this, [{ status: STATUS_CODES.UAUTHORIZED }]);
          return deferred;
        }
        return data;
      },
      checkError: function(error) {
        if (error && error.status === STATUS_CODES.UAUTHORIZED) {
          this.trigger('unauthorized');
        }
      }
    };
  });

  Fiber.mixin(DAL, Mixins.Event);

  RBN.DAL.Users = new (DAL.extend(function(base) {
    return {
      init: function() {
        this.result = window.localStorage['rbn_users'];
        this.users = this.result ? JSON.parse(this.result) : {};
        this.currentUser = null;
      },
      saveAll: function() {
        window.localStorage['rbn_users'] = JSON.stringify(this.users);
      },
      getCachedInfoOfUser: function(user) {
         return this.users[user];
      },
      getInfoOfUser: function(user) {
        var dfd = $.Deferred(),
          url,
          data = this.getCachedInfoOfUser(user),
          url,
          onDone, onError;

        if (data) {
          dfd.resolve(data);
        } else {
          url = String.format('{0}/api/users/{1}', RBN.Settings.get().url, user);

          onDone = function(result) {
            var data = {
              email: result.user.email,
              fullname: result.user.fullname
            };

            dfd.resolve(data);
            this.users[user] = data;
          };

          onError = function(error) {
            this.checkError(error);
            dfd.reject(error);
          };

          $.getJSON(url)
            .pipe(this.validateResponse)
            .done(_.bind(onDone, this))
            .fail(_.bind(onError, this));
        }

        return dfd.promise();
      },
      getCurrentUser: function() {
        var dfd = $.Deferred(),
          url, onDone, onError;

        if (this.currentUser) {
          dfd.resolve(this.currentUser);
        }

        url = String.format('{0}/api/session', RBN.Settings.get().url);

        onDone = function(result) {
          this.currentUser = result.session.links.user.title;
          dfd.resolve(this.currentUser);
        };

        onError = function(error) {
          this.checkError(error);
          dfd.reject(error);
        };

        $.getJSON(url)
          .pipe(this.validateResponse)
          .done(_.bind(onDone, this))
          .fail(_.bind(onError, this));

        return dfd.promise();
      }
    };
  }));

  RBN.DAL.Settings = new (DAL.extend(function(base) {
    return {
      get: function() {
        var settings = window.localStorage['rbn_settings'];
        return settings && JSON.parse(settings);
      },
      save: function(settings) {
        window.localStorage['rbn_settings'] = JSON.stringify(settings);
        window.localStorage['rbn_items_expiry'] = -1;
      }
    };
  }));

  RBN.DAL.RB = new (DAL.extend(function(base) {
    return {
      get: function(refresh) {
        var dfd = $.Deferred();

        if (refresh) {
          this.getFromAPI().done(function(items) {
            dfd.resolve(items)
          });
        } else {
          this.getFromCache().done(function(items) {
            dfd.resolve(items)
          });
        }

        return dfd.promise();
      },
      getFromCache: function() {
        var expiry,
          items = window.localStorage['rbn_items'];

        if (items) {
          if (this.areItemsExpired()) {
            items = null;
            this.clearStorage();
            return this.getFromAPI();
          } else {
            var dfd = $.Deferred();
            dfd.resolve(JSON.parse(items));
            return dfd.promise();
          }
        } else {
          this.clearStorage();
          return this.getFromAPI();
        }
      },
      getFromAPI: function() {
        var dfd = $.Deferred(),
          onUserDone,
          onUserError;

        onUserDone = function(user) {
          var params = {
            'to-users': user,
            'status': RBN.Constants.Status.ALL,
            'last-updated-from': this.getLastUpdatedFromISO8601()
          },

          flags = RBN.Settings.get().displayOptions,
          options = RBN.Constants.DisplayOptions,
          url = String.format('{0}/api/review-requests/', RBN.Settings.get().url),
          dfds = [],
          items = [],
          onRbsDone,

          add = function(result, hasShipIt) {
            var arr = [];

            _.each(result.review_requests, function(item) {
              if (_.contains([RBN.Constants.Status.PENDING, RBN.Constants.Status.SUBMITTED], item.status)) {

                var user = RBN.DAL.Users.getCachedInfoOfUser(item.links.submitter.title);

                arr.push({
                  id: item.id,
                  summary: item.summary,
                  description: item.description,
                  last_updated: new Date(item.last_updated),
                  status: item.status,
                  time_added: new Date(item.time_added),
                  submitter: item.links.submitter.title,
                  hasShipIt: hasShipIt,
                  submitterImagelUrl: user ? user.avatarUrl : null
                });
              }
            });

            items = items.concat(arr);
          };

          // We make wo calls to the API, one requesting RBs with no ship-it, and the other to request RBs with ship-it.
          // This is because if we make a single call asking for both (by ommitting the "ship-it" from the query string),
          // the items returned do not have a key to describe whether it has a ship-it or not. Therefore, to solve this,
          // we make two calls, thus being able to distinquish the items returned.

          if (flags & options.NEED_SHIP_IT) {
            dfds.push(
              $.get(url, _.extend({}, params, {
                'ship-it': '0'
              }))
              .pipe(this.validateResponse)
              .done(function(result) {
                add(result, false);
              })
              .fail(_.bind(this.checkError, this))
            );
          }

          if (flags & options.HAVE_SHIP_IT) {
            dfds.push(
              $.get(url, _.extend({}, params, {
                'ship-it': '1'
              }))
              .pipe(this.validateResponse)
              .done(function(result) {
                add(result, true);
              })
              .fail(_.bind(this.checkError, this))
            );
          }

          onRbsDone = function() {
            items.sort(function(a, b) {
              return a.last_updated > b.last_updated ? -1 : 1;
            });

            window.localStorage['rbn_items'] = JSON.stringify(items);
            this.updateExpiry();
            dfd.resolve(items);
          };

          $.when.apply(null, dfds)
            .done(_.bind(onRbsDone, this))
            .fail(dfd.reject);
        };

        onUserError = function(error){
          this.checkError(error);
          dfd.reject(error);
        };

        RBN.DAL.Users.getCurrentUser()
          .done(_.bind(onUserDone, this))
          .fail(_.bind(onUserError, this));

        return dfd.promise();
      },
      clearStorage: function() {
        window.localStorage.removeItem('rbn_items');
        window.localStorage.removeItem('rbn_items_expiry');
      },
      // Helpers
      updateExpiry: function() {
        window.localStorage['rbn_items_expiry'] =  (new Date()).getTime() + RBN.Settings.get().pollFrequency;
      },
      areItemsExpired: function() {
        var expiry = expiry = window.localStorage['rbn_items_expiry'];
        return expiry < (new Date()).getTime();
      },
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
  }));

})(jQuery, _, window);