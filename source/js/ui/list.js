/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
$(function () {

  RBN.UI.List = Fiber.extend(function () {
    var defaultOptions = {
      maxItems: 5
    };

    return {
      init: function (options) {
        this.options = _.defaults(options || {}, defaultOptions);

        var lastItemIndex = lastSectionIndex = null;
        var search_lastItemIndex = search_lastSectionIndex = null;

        this.$target = null;
        this.$searchTarget = null;

        this.resetSearch = function() {
          search_lastItemIndex = search_lastSectionIndex = null;

          if (this.$searchTarget) {
            this.$searchTarget.empty()
          }
        };

        this.reset = function() {
          this.items = [];
          this.sectionTitles = [];

          lastItemIndex = lastSectionIndex = null;

          if (this.$target) {
            this.$target.empty();
          }
        };

        this.reset();

        Object.defineProperties(this, {
          "_lastItemIndex": {
            get: function() {
              return this.isSearchVisible() ? search_lastItemIndex : lastItemIndex;
            },
            set: function(value) {
              if (this.isSearchVisible()) {
                search_lastItemIndex = value;
              } else {
                lastItemIndex = value;
              }
            }
          },
          "_lastSectionIndex": {
            get: function() {
              return this.isSearchVisible() ? search_lastSectionIndex : lastSectionIndex;
            },
            set: function(value) {
              if (this.isSearchVisible()) {
                search_lastSectionIndex = value;
              } else {
                lastSectionIndex = value;
              }
            }
          }
        });
      },
      isSearchVisible: function() {
        return this.$searchTarget.is(':visible');
      },

      // begin HELPER methods
      itemAtIndex: function (sectionIndex, itemIndex) {
        return this.items[sectionIndex][itemIndex];
      },
      insertItemAtIndex: function (item, sectionIndex, itemIndex) {
        return this.itemAtIndex(sectionIndex, itemIndex).push(item);
      },
      // end HELPER methods

      // begin CELL methods
      cellForRowAtIndex: function (sectionIndex, itemIndex) {
        throw 'Subclass must implement method <cellForRowAtIndex>';
      },
      // end CELL methods

      // begin HEADER methods
      numberOfSections: function () {
        return this.items.count;
      },
      numberOfRowsInSection: function (sectionIndex) {
        if (sectionIndex < this.items.length) {
          return this.items[sectionIndex].length;
        }
        return 0;
      },
      titleForHeaderInSection: function (sectionIndex) {
        return this.sectionTitles[sectionIndex];
      },
      sectionTitles: function () {
        return this.sectionTitles;
      },
      viewForHeaderInSection: function (sectionIndex) {
        return null;
      },
      // end HEADER methods

      renderNext: function () {
        this.render();
      },
      render: function () {
        var cell, title,
          result = [],
          drawTitle = true,
          count = 0,
          sectionIndex,
          itemIndex,
          itemCount,
          sectionsLen, itemsLen;

        // Sections
        startSectionIndex = this._lastSectionIndex || 0,
        startItemIndex = this._lastItemIndex || 0;

        if (this._lastItemIndex !== null && this._lastItemIndex <= this.numberOfRowsInSection(this._lastSectionIndex)) {
          drawTitle = false;
          this._lastSectionIndex = this._lastItemIndex = null;
        }

        //console.log(startSectionIndex, startItemIndex);

        // Iterate over every section
        for (sectionIndex = startSectionIndex, sectionsLen = this.items.length; sectionIndex < sectionsLen && count < this.options.maxItems; sectionIndex++) {

          if (drawTitle) {
            title = this.viewForHeaderInSection(sectionIndex);

            // Draw the title
            if (title) {
              result.push(title);
            }
          }

          // Iterate over every item
          for (itemIndex = startItemIndex, itemsLen = this.numberOfRowsInSection(sectionIndex); itemIndex < itemsLen; itemIndex++) {
            cell = this.cellForRowAtIndex(sectionIndex, itemIndex);
            result.push(cell);

            count++;

            if (count >= this.options.maxItems) {
              this._lastSectionIndex = sectionIndex;
              this._lastItemIndex = itemIndex + 1;
              break;
            }
          }

          startItemIndex = 0;
          drawTitle = true;
        }

        return result.join('');
      }
    }
  });
});