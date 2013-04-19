/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function() {

  RBN.UI.Options = (function() {
      return new (Fiber.extend(function() {
        return {
          init: function() {
            this.$rbUrlText = $('#rb-url-text');

            this.$notifictionsCheckbox = $('#notifications-chbx');
            this.$maxNumItemsText = $('#max-num-items-text');
            this.$pollFrequencyText = $('#poll-frequency-text');
            this.$timeDropdown = $('#time-dropdown');

            this.$needShipitCheckbox = $('#need-shipit-chbx');
            this.$haveShipitCheckbox = $('#have-shipit-chbx');

            this.fillValues();
            this.bindEvents();
          },

          bindEvents: function() {
            this.$rbUrlText.on('change', _.bind(this.onRBUrlChange, this));
            this.$notifictionsCheckbox.on('change', _.bind(this.onNotificationPermissionChange, this));
            this.$maxNumItemsText.on('change', _.bind(this.onMaxNumItemsChange, this));
            this.$pollFrequencyText.on('change', _.bind(this.onpollFrequencyChange, this));
            this.$timeDropdown.on('change', _.bind(this.onTimeChange, this));
            this.$needShipitCheckbox.on('change', _.bind(this.onNeedShipItChanged, this));
            this.$haveShipitCheckbox.on('change', _.bind(this.onHaveShipitChanged, this));
          },
          fillValues: function() {
            this.$rbUrlText.val(RBN.Settings.get().url);

            this.$pollFrequencyText.attr('min', RBN.Constants.Poll.MIN);
            this.$pollFrequencyText.attr('max', RBN.Constants.Poll.MAX);
            this.$maxNumItemsText.attr('min', RBN.Constants.Items.MIN);
            this.$maxNumItemsText.attr('max', RBN.Constants.Items.MAX);

            this.$notifictionsCheckbox.prop('checked', RBN.Settings.get().showNotifications);
            this.$maxNumItemsText.val(RBN.Settings.get().maxItems);
            this.$pollFrequencyText.val(RBN.Settings.get().pollFrequency / RBN.Constants.MINUTE);
            this.$timeDropdown.val('' + RBN.Settings.get().lastUpdatedFrom);

            var flags = RBN.Settings.get().displayOptions;
            this.$needShipitCheckbox.prop('checked', RBN.Constants.DisplayOptions.NEED_SHIP_IT & flags);
            this.$haveShipitCheckbox.prop('checked', RBN.Constants.DisplayOptions.HAVE_SHIP_IT & flags);
          },
          onRBUrlChange: function() {
            RBN.Settings.get().url = this.$rbUrlText.val();
          },
          onNotificationPermissionChange: function() {
            RBN.Settings.get().showNotifications = this.$notifictionsCheckbox.prop('checked');
          },
          onMaxNumItemsChange: function() {
            var value = parseInt(this.$maxNumItemsText.val());
            if (!_.isNumber(value) || value < RBN.Constants.Items.MIN || value > RBN.Constants.Items.MAX) {
              this.$maxNumItemsText.val(RBN.Settings.get().maxItems);
              return;
            }
            RBN.Settings.get().maxItems = value;
          },
          onpollFrequencyChange: function() {
            var value = parseInt(this.$pollFrequencyText.val());
            if (!_.isNumber(value) || value < RBN.Constants.Poll.MIN || value > RBN.Constants.Poll.MAX) {
              this.$pollFrequencyText.val(RBN.Settings.get().pollFrequency / RBN.Constants.MINUTE );
              return;
            }
            RBN.Settings.get().pollFrequency = value * RBN.Constants.MINUTE;
          },
          onTimeChange: function() {
            RBN.Settings.get().lastUpdatedFrom = parseInt(this.$timeDropdown.val());
          },
          onNeedShipItChanged: function() {
            if (this.$needShipitCheckbox.prop('checked')) {
              RBN.Settings.get().displayOptions |= RBN.Constants.DisplayOptions.NEED_SHIP_IT;
            } else {
              RBN.Settings.get().displayOptions &= ~RBN.Constants.DisplayOptions.NEED_SHIP_IT;
            }
          },
          onHaveShipitChanged: function() {
            if (this.$haveShipitCheckbox.prop('checked')) {
              RBN.Settings.get().displayOptions |= RBN.Constants.DisplayOptions.HAVE_SHIP_IT;
            } else {
              RBN.Settings.get().displayOptions &= ~RBN.Constants.DisplayOptions.HAVE_SHIP_IT;
            }
          }
        }
      }));
  })();

});