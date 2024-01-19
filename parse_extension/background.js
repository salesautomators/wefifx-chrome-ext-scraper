'use strict';

async function get_urls() {
  var res = await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/get-reviews-urls', {
    method: 'GET'
  })
  let res_j = await res.json()
  return res_j
}

chrome.action.onClicked.addListener(openDemoTab);
chrome.alarms.onAlarm.addListener(handleAlarm);

function openDemoTab() {
  chrome.alarms.create('fetch-reviews', {
    delayInMinutes: 1,
    periodInMinutes: 60
  });
  chrome.tabs.create({ url: 'index.html' });
}

async function handleAlarm(alarm) {

  const urls = await get_urls()

  console.log(urls)

  // query the current tab to find its id
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {

    for (let i = 0; i < urls.rows.length; i++) {
      // navigate to next url
      if (urls.rows[i].url) {
        await goToPage(urls.rows[i].url, i + 1, tabs[0].id, urls.rows[i].id);
      }
      if (urls.rows[i].reports_url) {
        await goToPageReports(urls.rows[i].reports_url, i + 1, tabs[0].id, urls.rows[i].id);
      }
      if (urls.rows[i].profile_url) {
        await goToPageProfile(urls.rows[i].profile_url, i + 1, tabs[0].id, urls.rows[i].id);
      }
    }

    // navigation of all pages is finished
    console.log('Navigation Completed');
    chrome.tabs.update({ url: 'index.html' });
  });

};

async function goToPage(url, url_index, tab_id, profile_id) {
  console.log(url)
  return new Promise(async function (resolve, reject) {
    // update current tab with new url
    console.log(url)
    chrome.tabs.update({ url: url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(async function openPage(tabID, changeInfo) {
      // tab has finished loading, validate whether it is the same tab
      if (tab_id == tabID && changeInfo.status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(async function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          let comments = JSON.parse(message).reviews

          if (comments.length > 0) {
            // save data from message to a JSON file and download
            let json_data = {
              profile_id: profile_id,
              url: url,
              reviews: comments
            };

            await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-reviews', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(json_data)
            })

          }

        });

        chrome.scripting.executeScript({
          target: { tabId: tab_id },
          files: ['script.js']
        }, function () {
          // resolve Promise after content script has executed
          resolve();
        });
      }
    });
  });
}

async function goToPageReports(url, url_index, tab_id, profile_id) {

  return new Promise(function (resolve, reject) {
    // update current tab with new url
    chrome.tabs.update({ url: url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
      // tab has finished loading, validate whether it is the same tab
      if (tab_id == tabID && changeInfo.status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          let message_j = JSON.parse(message)

          if (message_j.leads.length > 0) {
            // save data from message to a JSON file and download
            let json_data = {
              profile_id: profile_id,
              leads: message_j.leads,
              total_spent: message_j.total_spent,
              charged_leads: message_j.charged_leads,
              ad_impressions: message_j.ad_impressions,
              top_impression_rate: message_j.top_impression_rate,
              absolute_top_impression_rate: message_j.absolute_top_impression_rate
            };

            fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-leads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(json_data)
            }).then(() => { resolve(); })

          }

        });

        chrome.scripting.executeScript({
          target: { tabId: tab_id },
          files: ['report_script.js']
        });
      }
    });
  });
}

async function goToPageProfile(url, url_index, tab_id, profile_id) {
  console.log(url)
  return new Promise(function (resolve, reject) {
    // update current tab with new url
    console.log(url)
    chrome.tabs.update({ url: url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
      // tab has finished loading, validate whether it is the same tab
      if (tab_id == tabID && changeInfo.status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          let message_j = JSON.parse(message)

          if (message_j.average_weekly_budget) {
            // save data from message to a JSON file and download
            let json_data = {
              profile_id: profile_id,
              average_weekly_budget: message_j.average_weekly_budget,
              weekly_target: message_j.weekly_target,
              previous_7_days: message_j.previous_7_days
            };

            fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-leads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(json_data)
            }).then(() => { resolve(); })

          }

        });

        chrome.scripting.executeScript({
          target: { tabId: tab_id },
          files: ['profile_script.js']
        });
      }
    });
  });
}

// async function to wait for x seconds 
async function waitSeconds(seconds) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
}

