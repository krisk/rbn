$(function() {

  RBN.App = (function() {
      return new (Fiber.extend(function() {
        return {
          init: function() {
            this.list = new RBN.UI.RBList();

            this.$notifictionsCheckbox = $('#notifications-chbx');
            this.$notifictionsCheckbox.prop('checked', RBN.DAL.canShowNotifications());

            this.bindEvents();
          },
          bindEvents: function() {
            this.$notifictionsCheckbox.on('change', _.bind(this.onNotificationPermissionChange, this));
          },
          onNotificationPermissionChange: function() {
            var allow = this.$notifictionsCheckbox.prop('checked');
            RBN.DAL.setCanShowNotifications(allow);
          }
        }
      }));
  })();

});
