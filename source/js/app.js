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
            this.header = new RBN.UI.Header($('header'));

            this.list = new RBN.UI.RBList($('.list'), {
              maxItems: RBN.Settings.get().maxItems,
              template: _.template($('#list-item-template').html())
            });

            this.bindEvents();
          },
          bindEvents: function() {
            this.header.on('search', _.bind(this.onSearch, this));
            this.header.on('refresh', _.bind(this.onRefresh, this));
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
        }
      }));
  })();

});
