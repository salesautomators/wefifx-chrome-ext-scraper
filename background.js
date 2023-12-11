'use strict';

// let urls_list = [
//   'https://ads.google.com/u/2/localservices/reviews?cid=5400496248&bid=2604405837&pid=9999999999&euid=8565125162&hl=en&gl=US',
//   'https://ads.google.com/u/2/localservices/reviews?cid=2725973755&bid=2657705400&pid=9999999999&euid=8565125162&hl=en&gl=US',
// ];
async function get_urls() {
  var res = await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/get-reviews-urls', {
    method: 'GET'
  })
  return await res.json()

}

chrome.action.onClicked.addListener(openDemoTab);
chrome.alarms.onAlarm.addListener(handleAlarm);

function openDemoTab() {
  chrome.alarms.create('fetch-reviews', {
    delayInMinutes: 1,
    periodInMinutes: 720
  });
  chrome.tabs.create({ url: 'index.html' });
}

async function handleAlarm(alarm) {
  const json = JSON.stringify(alarm);

  const urls = await get_urls()

  console.log(urls)
  console.log(json)

  // query the current tab to find its id
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    for (let i = 0; i < urls.rows.length; i++) {
      // navigate to next url
      await goToPage(urls.rows[i].url, i + 1, tabs[0].id, urls.rows[i].id);

      // // wait for 5 seconds
      // await waitSeconds(2);
    }

    // navigation of all pages is finished
    console.log('Navigation Completed');
    chrome.tabs.update({ url: 'index.html' });
  });

};

async function goToPage(url, url_index, tab_id, profile_id) {
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
        chrome.runtime.onMessage.addListener(async function getDOMInfo(message) {
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          if (message.reviews.length > 0) {
            // save data from message to a JSON file and download
            let json_data = {
              profile_id: profile_id,
              url: url,
              reviews: JSON.parse(message).reviews
            };

            await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-reviews', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(json_data)
            })

          }
          // let blob = new Blob([JSON.stringify(json_data)], { type: "application/json;charset=utf-8" });

          // const reader = new FileReader();
          // reader.onload = () => {
          //   const buffer = reader.result;
          //   const blobUrl = `data:${blob.type};base64,${btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;
          //   chrome.downloads.download({ url: blobUrl, filename: (url_index + 'data.json'), conflictAction: 'overwrite' });
          // };
          // reader.readAsArrayBuffer(blob);
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

// async function to wait for x seconds 
async function waitSeconds(seconds) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, seconds * 1000);
  });
}

async function parsePage() {
  let page_title = document.title,
    page_h1_tag = '';

  if (document.querySelector("h1") !== null)
    page_h1_tag = document.querySelector("h1").textContent;

  const table = document.querySelector('table')

  const reviews = []

  for (var i = 0, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    if (i === 0) {
      continue
    }
    let review = {}

    for (var j = 0, col; col = row.cells[j]; j++) {
      //iterate through columns
      //columns would be accessed using the "col" variable assigned in the for loop
      if (j === 0) {
        review['rating'] = col.querySelector(".zRhise").querySelectorAll(".Hqmfcc").length
      }
      if (j === 1) {
        review['customer'] = col.querySelector(".zRhise").innerText
      }
      if (j === 2) {
        review['review'] = col.querySelector("span[jsname=QUIPvd]").innerText + col.querySelector("span[jsname=awEEA]").innerText
      }
      if (j === 3) {
        review['date'] = col.querySelector(".zRhise").innerText
      }
    }

    reviews.push(review)

  }

  // prepare JSON data with page title & first h1 tag
  let data = JSON.stringify({ title: page_title, h1: page_h1_tag, reviews: reviews });

  return data

}