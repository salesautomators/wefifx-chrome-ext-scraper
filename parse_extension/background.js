'use strict';

async function getURLs() {
  const { rows = [] } =
    (await (
      await fetch(
        'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/get-reviews-urls'
      )
    ).json()) ?? {};

  return rows;
}

chrome.action.onClicked.addListener(openDemoTab);
chrome.alarms.onAlarm.addListener(handleAlarm);

function openDemoTab() {
  chrome.alarms.create('fetch-reviews', {
    delayInMinutes: 0,
    periodInMinutes: 60,
  });
  chrome.tabs.create({ url: 'index.html' });
}

async function handleAlarm() {
  const urls = await getURLs();

  console.debug('[GLS] Fetched links: ', urls);

  // query the current tab to find its id
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    for (const { url, reports_url, profile_url, id } of urls) {
      // navigate to next url
      if (url) await goToPage(url, tabs[0].id, id);
      if (reports_url) await goToPageReports(reports_url, tabs[0].id, id);
      if (profile_url) await goToPageProfile(profile_url, tabs[0].id, id);
    }

    // navigation of all pages is finished
    console.debug('[GLS] Navigation Completed');
    chrome.tabs.update({ url: 'index.html' });
  });
}

async function goToPage(url, tabId, profile_id) {
  return new Promise(async function (resolve) {
    // update current tab with new url
    chrome.tabs.update({ url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(async function openPage(tabID, info) {
      // tab has finished loading, validate whether it is the same tab
      if (tabId == tabID && info.status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(async function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          const { reviews } = JSON.parse(message);

          if (reviews?.length) {
            // save data from message to a JSON file and download
            await fetch(
              'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-reviews',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profile_id,
                  url,
                  reviews,
                }),
              }
            );
          }
        });

        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ['script.js'],
          },
          function () {
            // resolve Promise after content script has executed
            resolve();
          }
        );
      }
    });
  });
}

async function goToPageReports(url, tabId, profile_id) {
  return new Promise(function (resolve) {
    // update current tab with new url
    chrome.tabs.update({ url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, info) {
      // tab has finished loading, validate whether it is the same tab
      if (tabId == tabID && info.status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          const {
            leads,
            total_spent,
            charged_leads,
            ad_impressions,
            top_impression_rate,
            absolute_top_impression_rate,
          } = JSON.parse(message);

          if (leads?.length) {
            // save data from message to a JSON file and download
            fetch(
              'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-leads',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profile_id,
                  leads,
                  total_spent,
                  charged_leads,
                  ad_impressions,
                  top_impression_rate,
                  absolute_top_impression_rate,
                }),
              }
            ).then(() => {
              resolve();
            });
          } else resolve();
        });

        chrome.scripting.executeScript({
          target: { tabId },
          files: ['report_script.js'],
        });
      }
    });
  });
}

async function goToPageProfile(url, tabId, profile_id) {
  return new Promise(function (resolve) {
    // update current tab with new url
    chrome.tabs.update({ url });

    // fired when tab is updated
    chrome.tabs.onUpdated.addListener(function openPage(tabID, { status }) {
      // tab has finished loading, validate whether it is the same tab
      if (tabId == tabID && status === 'complete') {
        // remove tab onUpdate event as it may get duplicated
        chrome.tabs.onUpdated.removeListener(openPage);

        // fired when content script sends a message
        chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          const { average_weekly_budget, weekly_target, previous_7_days } = JSON.parse(message);

          if (average_weekly_budget) {
            // save data from message to a JSON file and download
            fetch(
              'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-leads',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profile_id,
                  average_weekly_budget,
                  weekly_target,
                  previous_7_days,
                }),
              }
            ).then(() => {
              resolve();
            });
          } else resolve();
        });

        chrome.scripting.executeScript({
          target: { tabId },
          files: ['profile_script.js'],
        });
      }
    });
  });
}

// async function to wait for x seconds
async function waitSeconds(seconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
}
