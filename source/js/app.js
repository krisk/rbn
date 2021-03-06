/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
(function($, _, window) {

  $(function() {

    RBN.App = (function() {
      return new(Fiber.extend(function() {
        return {
          init: function() {
            var url = RBN.Settings.get().url;

            this.header = new RBN.UI.Header($('header'));

            this.$settingsLink = $('#settings-link');
            this.$noSettingsMessage = $('#no-settings-message');
            this.$unauthorizedMessage = $('#unauthorized-message');
            this.$loginLink = $('#login-link');

            if (!url) {
              this.header.enable(false);
              this.showNoSettingsMessage();
            } else {
              this.list = new RBN.UI.RBList($('.list'), {
                maxItems: RBN.Settings.get().maxItems,
                pollFrequency: RBN.Settings.get().pollFrequency,
                template: _.template($('#list-item-template').html())
              });
            }

            this.bindEvents();

            if (this.list) {
              this.list.load();
            }
          },
          bindEvents: function() {
            this.header.on('search', _.bind(this.onSearch, this));
            this.header.on('refresh', _.bind(this.onRefresh, this));
            this.header.on('settings', this.openSettings);

            this.$settingsLink.on('click', this.openSettings);
            this.$loginLink.on('click', this.openLogin);

            if (this.list) {
              this.list.on('selected', _.bind(this.onItemSelected, this));
              this.list.on('unauthorized', _.bind(this.onUnauthorized, this));
            }
          },
          showNoSettingsMessage: function() {
            this.$noSettingsMessage.show();
          },
          openSettings: function() {
            chrome.tabs.create({
              url: chrome.extension.getURL('options.html')
            });
          },
          openLogin: function() {
            chrome.tabs.create({
              url: String.format('{0}/{1}', RBN.Settings.get().url, 'account/login/')
            });
          },
          // Header events
          onSearch: function(event, args) {
            this.list.search(args);
          },
          onRefresh: function() {
            this.list.loadData(true)
              .done(_.bind(function() {
                this.header.afterRefresh();
                this.header.enable(true);
              }, this));
          },
          // RB List events
          onUnauthorized: function() {
            this.$unauthorizedMessage.show();
            this.header.enable(false);
          },
          onItemSelected: function(event, args) {
            chrome.tabs.create({
              url: String.format('{0}/r/{1}', RBN.Settings.get().url, args.id)
            });
          }
        }
      }));
    })();

  });
})(jQuery, _, window);