$(function() {

  RBN.UI.RBTableViewController = RBN.UI.TableViewController.extend(function (base) {

    var options = {
      template: _.template($('#list-item-template').html()),
    };

    return {
      init: function () {
        base.init.call(this, {maxItems: RBN.Settings.maxItems});

        this.fuse = null;
        this.itemsIds = [];

        this.$target = $('#items');
        this.$searchTarget = $('#search-items');
        this.$searchInput = $('#search');
        this.$refreshButtton = $('#refresh-btn')

        this.pollTimer = null;

        // Load data, and start polling
        this.loadData().done(_.bind(this.startPolling, this));

        this.bindEvents();

        RBN.UI.setBadgeCount('');
      },
      bindEvents: function() {
        this.$searchInput.on('keyup', _.debounce(_.bind(this.onSearchKeyUp, this), 100));

        var bound = _.bind(this.onItemClick, this);
        this.$target.on('click', 'li', bound);
        this.$searchTarget.on('click', 'li', bound);

        this.$refreshButtton.on('click', _.bind(this.onRefreshClicked, this));
      },
      onItemClick: function(event) {
        var $target = $(event.target).closest('li');
        var attrId = $target.data('item-id');
        chrome.tabs.create({url: 'https://rb.corp.linkedin.com/r/' + attrId});
      },
      onSearchKeyUp: function() {
        var searchText = this.$searchInput.val();
        this.displaySearch(searchText);
      },
      onRefreshClicked: function() {
        this.clearSearch();

        var $btn = this.$refreshButtton.attr('disabled', 'disabled');

        this.loadData(true)
          .done(function() {
            $btn.removeAttr('disabled');
          });
      },
      clearSearch: function() {
        this.displaySearch('');
        this.$searchInput.val('');
      },
      displaySearch: function(text) {
        this.searchItems = this.fuse.search(text);

        this.resetSearch();

        if (text.length === 0) {
          this.$searchTarget.hide();
          this.$target.show();
          if (this._shouldRerender) {
            this.render();
            this._shouldRerender = false;
          }
          return;
        }

        this.$searchTarget.empty().show();
        this.render();
        this.$target.hide();
      },
      numberOfSections: function () {
        if (this.isSearchVisible()) {
          return 1;
        } else {
          return base.numberOfSections.call(this);
        }
      },
      numberOfRowsInSection: function (sectionIndex) {
        if (this.isSearchVisible()) {
          return this.searchItems.length;
        } else {
          return base.numberOfRowsInSection.call(this, sectionIndex);
        }
      },
      itemAtIndex: function (sectionIndex, itemIndex) {
        if (this.isSearchVisible()) {
          return this.searchItems[itemIndex];
        } else {
          return base.itemAtIndex.call(this, sectionIndex, itemIndex);
        }
      },
      loadData: function(refresh) {
        return RBN.DAL.getAllRBs(refresh).done(_.bind(function(items) {
          this.update(items);
        }, this));
      },
      update: function(items) {
        this.reset();
        this.items.push(items);

        if (this.isSearchVisible()) {
          this._shouldRerender = true;
        } else {
          this.render();
          this._shouldRerender = false;
        }

        this.itemsIds = _.map(items, function(item) {
          return item.id;
        });

        this.fuse = new Fuse(items, {
          keys: ['summary', 'submitter']
        });
      },
      startPolling: function() {
        var bound = _.bind(function() {
          this.loadData(true)
            .done(_.bind(this.startPolling, this));
        }, this);

        this.pollTimer = setTimeout(bound, RBN.Settings.pollInterval);
      },
      stopPolling: function() {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      },
      cellForRowAtIndex: function (sectionIndex, itemIndex) {
        var data = this.itemAtIndex(sectionIndex, itemIndex);
        return options.template(data);
      },
      render: function() {
        var output = base.render.call(this);

        if (this.isSearchVisible()) {
          this.$searchTarget.append(output);
        } else {
          this.$target.append(output);
        }
      }
    }
  });

});