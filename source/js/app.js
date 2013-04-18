/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function() {

  RBN.App = (function() {
      return new (Fiber.extend(function() {
        return {
          init: function() {
            var url = RBN.Settings.get().url;

            this.header = new RBN.UI.Header($('header'));

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
          },
          showNoSettingsMessage: function() {
            $('#no-settings-message').show();
            $('#settings-link').on('click', this.openOptions);
          },
          bindEvents: function() {
            this.header.on('search', _.bind(this.onSearch, this));
            this.header.on('refresh', _.bind(this.onRefresh, this));
            this.header.on('settings', this.openSettings);

            if (this.list) {
              this.list.on('selected', _.bind(this.onItemSelected, this));
            }
          },
          openSettings: function() {
            chrome.tabs.create({
              url: chrome.extension.getURL('options.html')
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
              }, this));
          },
          // RB List events
          onItemSelected: function(event, args) {
            chrome.tabs.create({
              url: String.format('{0}/r/{1}', RBN.Settings.get().url, args.id)
            });
          }
        }
      }));
  })();

});
