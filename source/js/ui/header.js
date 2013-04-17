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
        this.$settingsButton = this.$el.find('#settings-btn');
        this.$settings = this.$el.find('.settings');
        this.$refreshButtton = $('#refresh-btn');
        this.$searchInput = $('#search');

        this.$notifictionsCheckbox = $('#notifications-chbx');
        this.$maxNumItemsText = $('#max-num-items-text');
        this.$pollIntervalText = $('#poll-interval-text');
        this.$timeDropdown = $('#time-dropdown');

        this.$needShipitCheckbox = $('#need-shipit-chbx');
        this.$haveShipitCheckbox = $('#have-shipit-chbx');

        this.fillValues();
        this.bindEvents();
      },
      bindEvents: function() {
        this.$settingsButton.on('click', _.bind(this.onSettingsButtonClick, this));
        this.$searchInput.on('keyup', _.debounce(_.bind(this.onSearchKeyUp, this), 100));
        this.$refreshButtton.on('click', _.bind(this.onRefreshClicked, this));

        // Settings UI
        this.$notifictionsCheckbox.on('change', _.bind(this.onNotificationPermissionChange, this));
        this.$maxNumItemsText.on('change', _.bind(this.onMaxNumItemsChange, this));
        this.$pollIntervalText.on('change', _.bind(this.onPollIntervalChange, this));
        this.$timeDropdown.on('change', _.bind(this.onTimeChange, this));
        this.$needShipitCheckbox.on('change', _.bind(this.onNeedShipItChanged, this));
        this.$haveShipitCheckbox.on('change', _.bind(this.onHaveShipitChanged, this));
      },
      fillValues: function() {
        this.$pollIntervalText.attr('min', RBN.Constants.Poll.min);
        this.$pollIntervalText.attr('max', RBN.Constants.Poll.max);
        this.$maxNumItemsText.attr('min', RBN.Constants.Items.min);
        this.$maxNumItemsText.attr('max', RBN.Constants.Items.max);

        this.$notifictionsCheckbox.prop('checked', RBN.Settings.get().showNotifications);
        this.$maxNumItemsText.val(RBN.Settings.get().maxItems);
        this.$pollIntervalText.val(RBN.Settings.get().pollInterval / RBN.Constants.MINUTE);
        this.$timeDropdown.val(RBN.Settings.get().lastUpdatedFrom);

        var flags = RBN.Settings.get().displayOptions;
        this.$needShipitCheckbox.prop('checked', RBN.Constants.DisplayOptions.needShipIt & flags);
        this.$haveShipitCheckbox.prop('checked', RBN.Constants.DisplayOptions.haveShipIt & flags);
      },
      onSettingsButtonClick: function() {
        if (this._isOpened) {
          this.closeSettings();
        } else {
          this.openSettings();
        }
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
        this._isOpened = true;
        this.$settings.addClass('open');
        this.trigger('opened');
      },
      closeSettings: function() {
        this._isOpened = false;
        this.$settings.removeClass('open');
        this.trigger('closed');
      },

      // Settings
      onNotificationPermissionChange: function() {
        RBN.Settings.get().showNotifications = this.$notifictionsCheckbox.prop('checked');
      },
      onMaxNumItemsChange: function() {
        var value = parseInt(this.$maxNumItemsText.val());
        if (!_.isNumber(value) || value < RBN.Constants.Items.min || value > RBN.Constants.Items.max) {
          this.$maxNumItemsText.val(RBN.Settings.get().maxItems);
          return;
        }
        RBN.Settings.get().maxItems = value;
      },
      onPollIntervalChange: function() {
        var value = parseInt(this.$pollIntervalText.val());
        if (!_.isNumber(value) || value < RBN.Constants.Poll.min || value > RBN.Constants.Poll.max) {
          this.$pollIntervalText.val(RBN.Settings.get().pollInterval / RBN.Constants.MINUTE );
          return;
        }
        RBN.Settings.get().pollInterval = value * RBN.Constants.MINUTE;
      },
      onTimeChange: function() {
        RBN.Settings.get().lastUpdatedFrom = this.$timeDropdown.val();
      },
      onNeedShipItChanged: function() {
        if (this.$needShipitCheckbox.prop('checked')) {
          RBN.Settings.get().displayOptions |= RBN.Constants.DisplayOptions.needShipIt;
        } else {
          RBN.Settings.get().displayOptions &= ~RBN.Constants.DisplayOptions.needShipIt;
        }
      },
      onHaveShipitChanged: function() {
        if (this.$haveShipitCheckbox.prop('checked')) {
          RBN.Settings.get().displayOptions |= RBN.Constants.DisplayOptions.haveShipIt;
        } else {
          RBN.Settings.get().displayOptions &= ~RBN.Constants.DisplayOptions.haveShipIt;
        }
      }
    }
  });

  Fiber.mixin(RBN.UI.Header, Mixins.Event);
});