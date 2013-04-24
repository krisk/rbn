/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function($, _, window) {

  $(function() {

    RBN.UI.RBList = RBN.UI.List.extend(function (base) {

      var defaultOptions = {
        template: null,
        pollFrequency: RBN.Constants.MINUTE * 5
      };

      //var GHOST_PERSON_IMG = 'images/ghost_person.png';

      return {
        init: function($el, options) {
          options = _.defaults({}, options, defaultOptions);
          base.init.call(this, options);

          this.$el = $el;
          this.fuse = null;
          this.itemsIds = [];
          this.badImageMap = {};

          this.$target = this.$el.find('.review-list');
          this.$searchTarget = this.$target.clone().appendTo($('.list')).hide();
          this.$spinner = this.$el.find('.spinner');

          this.pollTimer = null;

          this.bindEvents();

          chrome.browserAction.setBadgeText({text: ''});
        },
        bindEvents: function() {
          var bound = _.bind(this.onItemClick, this);
          this.$target.on('click', 'li', bound);
          this.$searchTarget.on('click', 'li', bound);

          RBN.DAL.RB.on('unauthorized', _.bind(this.onUnauthorizedError, this));
        },
        onItemClick: function(event) {
          var $target = $(event.target).closest('li');
          var attrId = $target.data('item-id');

          this.trigger('selected', { id: attrId });
        },
        onUnauthorizedError: function() {
          this.trigger('unauthorized');
          this.showSpinner(false);
        },

        load: function() {
          if (this.items.length === 0) {
            this.showSpinner(true);
          }

          this.loadData()
            .done(_.bind(function() {
              this.showSpinner(false);
            }, this))
            .done(_.bind(this.startPolling, this));
        },
        showSpinner: function(value) {
          if (value) {
            this.$spinner.addClass('spin');
          } else {
            this.$spinner.removeClass('spin');
          }
        },
        search: function(text) {
          this.searchItems = this.fuse.search(text);

          this.resetSearch();

          if (text.length === 0) {
            this.$searchTarget.hide();
            this.$target.show();
            if (this._shouldRerender) {
              this.render();
              this._shouldRerender = false;
            }
            return;
          }

          this.$searchTarget.empty().show();
          this.render();
          this.$target.hide();
        },

        numberOfSections: function () {
          if (this.isSearchVisible()) {
            return 1;
          } else {
            return base.numberOfSections.call(this);
          }
        },
        numberOfRowsInSection: function (sectionIndex) {
          if (this.isSearchVisible()) {
            return this.searchItems.length;
          } else {
            return base.numberOfRowsInSection.call(this, sectionIndex);
          }
        },
        itemAtIndex: function (sectionIndex, itemIndex) {
          if (this.isSearchVisible()) {
            return this.searchItems[itemIndex];
          } else {
            return base.itemAtIndex.call(this, sectionIndex, itemIndex);
          }
        },
        loadData: function(refresh) {
          return RBN.DAL.RB.get(refresh).done(_.bind(function(items) {
            this.update(items);
          }, this));
        },
        update: function(items) {
          this.reset();

          this.items.push(items);

          if (this.isSearchVisible()) {
            this._shouldRerender = true;
          } else {
            this.render();
            this._shouldRerender = false;
          }

          this.itemsIds = _.map(items, function(item) {
            return item.id;
          });

          this.fuse = new Fuse(items, {
            keys: ['summary', 'submitter']
          });
        },
        startPolling: function() {
          var bound = _.bind(function() {
            this.loadData(true)
              .done(_.bind(this.startPolling, this));
          }, this);

          this.pollTimer = setTimeout(bound, this.options.pollFrequency);
        },
        stopPolling: function() {
          clearTimeout(this.pollTimer);
          this.pollTimer = null;
        },
        cellForRowAtIndex: function (sectionIndex, itemIndex) {
          var data = this.itemAtIndex(sectionIndex, itemIndex);
          return this.options.template(data);
        },
        insertMetaData: function() {
          var self = this;
          var $target;

          if (this.isSearchVisible()) {
            $target = this.$searchTarget;
          } else {
            $target = this.$target;
          }

          var dfds = [];

          // Fetch the user meta data that have not been retrieved/cached
          $target.find('li.partial').each(function() {

            var $li = $(this);
              $submitter = $li.find('.submitter'),
              $img = $li.find('.profile-img'),
              alias = $li.data('item-submitter'),
              dfd = $.Deferred();

            dfds.push(dfd);

            (function($img, $submitter) {
              RBN.DAL.Users.getInfoOfUser(alias)
                .done(function(info) {
                  $img
                    .attr('src', info.avatarUrl)
                    .removeClass('default');

                  $submitter
                    .attr('title', info.fullname);
                })
                .always(dfd.resolve);
            })($img, $submitter);

          });

          // When all users' meta data has been retrieved, save it
          $.when.apply(null, dfds).done(function() {
            RBN.DAL.Users.saveAll();
          });
        },
        render: function() {
          var output = base.render.call(this);

          if (this.isSearchVisible()) {
            this.$searchTarget.append(output);
          } else {
            this.$target.append(output);
          }

         this.insertMetaData();
        }
      }
    });

    Fiber.mixin(RBN.UI.RBList, Mixins.Event);
  });

})(jQuery, _, window);