$(function() {

  RBN.UI.Header = Fiber.extend(function() {
    return {
      init: function() {
        this.$el = $('header');
        this.$settingsButton = this.$el.find('#settings-btn');
        this.$settings = this.$el.find('.settings');
        this.$refreshButtton = $('#refresh-btn');
        this.$searchInput = $('#search');
        this.$notifictionsCheckbox = $('#notifications-chbx');
        this.$notifictionsCheckbox.prop('checked', RBN.Settings.get().showNotifications);

        this.bindEvents();
      },
      bindEvents: function() {
        this.$settingsButton.on('click', _.bind(this.onSettingsButtonClick, this));
        this.$searchInput.on('keyup', _.debounce(_.bind(this.onSearchKeyUp, this), 100));
        this.$refreshButtton.on('click', _.bind(this.onRefreshClicked, this));

        // Settings UI
        this.$notifictionsCheckbox.on('change', _.bind(this.onNotificationPermissionChange, this));
      },
      onSettingsButtonClick: function() {
        this.$settings.toggleClass('open');
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
      openSettings: function() {
        this.$settings.addClass('open');
      },
      closeSettings: function() {
        this.$settings.removeClass('open');
      },

      // Settings
      onNotificationPermissionChange: function() {
        RBN.Settings.get().showNotifications = this.$notifictionsCheckbox.prop('checked');
      }
    }
  });

  Fiber.mixin(RBN.UI.Header, Mixins.Event);
});