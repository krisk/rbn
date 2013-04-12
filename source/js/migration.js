/*!
 * RBN
 * Copyright 2013 Kirollos Risk <kirollos@gmail.com>
 * Released under the MIT license
 */
 (function() {
  var version = chrome.app.getDetails().version;
  var installedVersion = window.localStorage['rbn_version'] || version;

  if (version > installedVersion) {
    window.localStorage.removeItem('review_boards');
    window.localStorage.removeItem('review_boards_expiry');
  }
  window.localStorage['rbn_version'] = version;
})();