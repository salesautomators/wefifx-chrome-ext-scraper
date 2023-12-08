'use strict';

// activate extension when host is www.website.com
chrome.runtime.onMessage.addListener((msg, sender, res) => {
  console.log(msg);
});