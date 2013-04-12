/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function() {

  RBN.App = (function() {
      return new (Fiber.extend(function() {
        var MINUTE = 1000 * 60;

        return {
          init: function() {
            this.header = new RBN.UI.Header($('header'));

            this.list = new RBN.UI.RBList($('.list'), {
              maxItems: RBN.Settings.get().maxItems,
              pollInterval: RBN.Settings.get().pollInterval,
              template: _.template($('#list-item-template').html())
            });

            this.bindEvents();
          },
          bindEvents: function() {
            this.header.on('search', _.bind(this.onSearch, this));
            this.header.on('refresh', _.bind(this.onRefresh, this));
            this.header.on('opened', _.bind(this.onHeaderOpened, this));
            this.header.on('closed', _.bind(this.onHeaderClosed, this));

            this.list.on('selected', _.bind(this.onItemSelected, this));

            RBN.Settings.on('change', _.bind(this.onSettingsChange, this));

            $('.information').find('a').on('click', function() {
              chrome.tabs.create({ url: this.href });
            });
          },
          // Header events
          onHeaderOpened: function() {
            this.list.$el.addClass('under');
          },
          onHeaderClosed: function() {
            this.list.$el.removeClass('under');
          },
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
              url: String.format(RBN.Settings.get().reviewUrl, args.id)
            });
          },
          // Settings events
          onSettingsChange: function(event, args) {
            switch (args.setting) {
              case 'maxItems':
                this.list.options.maxItems = args.value;
                this.list.loadData();
                break;
              case 'pollInterval':
                this.list.options.pollInterval = args.value * MINUTE;
                this.list.startPolling();
                break;
            }
          }
        }
      }));
  })();

});
