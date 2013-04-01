$(function() {

  alert('test update 2');

  RBN.App = (function() {
      return new (Fiber.extend(function() {
        return {
          init: function() {
            this.list = new RBN.UI.RBTableViewController();
          }
        }
      }));
  })();

});
