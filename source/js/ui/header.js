/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function() {

  RBN.UI.Header = Fiber.extend(function() {
    return {
      init: function($el) {
        this._isOpened;

        this.$el = $el;
        this.$refreshButtton = $('#refresh-btn');
        this.$searchInput = $('#search');
        this.$settingsButton = $('#settings-btn');

        this.bindEvents();
      },
      bindEvents: function() {
        this.$searchInput.on('keyup', _.debounce(_.bind(this.onSearchKeyUp, this), 100));
        this.$refreshButtton.on('click', _.bind(this.onRefreshClicked, this));
        this.$settingsButton.on('click', _.bind(this.openSettings, this));
      },
      openSettings: function() {
        this.trigger('settings');
      },
      onSearchKeyUp: function() {
        var searchText = this.$searchInput.val();
        this.trigger('search', searchText);
      },
      onRefreshClicked: function() {
        this.clearSearch();
        this.$refreshButtton.attr('disabled', 'disabled');
        this.trigger('refresh');
      },
      clearSearch: function() {
        this.trigger('search', '');
        this.$searchInput.val('');
      },
      afterRefresh: function() {
        this.$refreshButtton.removeAttr('disabled');
      },
      enable: function(val) {
        if (val) {
          this.$searchInput.removeAttr('disabled');
          this.$refreshButtton.removeAttr('disabled');;
        } else {
          this.$searchInput.attr('disabled', 'disabled');
          this.$refreshButtton.attr('disabled', 'disabled');
        }
      }
    }
  });

  Fiber.mixin(RBN.UI.Header, Mixins.Event);
});