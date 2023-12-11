'use strict';

// activate extension when host is www.website.com
// chrome.runtime.onMessage.addListener((msg, sender, res) => {
//   console.log(msg);
// });

// chrome.runtime.onStartup.addListener(function() {
//   console.log('open');

//   openDemoTab();

//   // Create an alarm so we have something to look at in the demo
//   chrome.alarms.create('demo-default-alarm', {
//     delayInMinutes: 1,
//     periodInMinutes: 1
//   });
// })

let urls_list = [
  'https://ads.google.com/u/2/localservices/reviews?cid=5400496248&bid=2604405837&pid=9999999999&euid=8565125162&hl=en&gl=US',
  'https://ads.google.com/u/2/localservices/reviews?cid=2725973755&bid=2657705400&pid=9999999999&euid=8565125162&hl=en&gl=US',
];

chrome.action.onClicked.addListener(openDemoTab);
chrome.alarms.onAlarm.addListener(handleAlarm);

function openDemoTab() {
  chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 3
  });
  chrome.tabs.create({ url: 'index.html' });
}

async function handleAlarm(alarm) {
  const json = JSON.stringify(alarm);

  console.log(json)

  // query the current tab to find its id
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    for (let i = 0; i < urls_list.length; i++) {
      // navigate to next url
      await goToPage(urls_list[i], i + 1, tabs[0].id);

      // // wait for 5 seconds
      // await waitSeconds(2);
    }

    // navigation of all pages is finished
    console.log('Navigation Completed');
  });

};

async function goToPage(url, url_index, tab_id) {
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
          console.log("Downloading data")
          // remove onMessage event as it may get duplicated
          chrome.runtime.onMessage.removeListener(getDOMInfo);

          // save data from message to a JSON file and download
          let json_data = {
            url: url,
            reviews: JSON.parse(message).reviews
          };

          let blob = new Blob([JSON.stringify(json_data)], { type: "application/json;charset=utf-8" });
          // let objectURL = URL.createObjectURL(blob);
          // chrome.downloads.download({ url: objectURL, filename: (url_index + 'data.json'), conflictAction: 'overwrite' });
          const reader = new FileReader();
          reader.onload = () => {
            const buffer = reader.result;
            const blobUrl = `data:${blob.type};base64,${btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;
            chrome.downloads.download({ url: blobUrl, filename: (url_index + 'data.json'), conflictAction: 'overwrite' });
            // chrome.downloads.download({
            //   url: blobUrl,
            //   filename: (url_index + 'data.json'),
            //   saveAs: true,
            //   conflictAction: "uniquify"
            // }, () => {
            //   sendResponse({ success: true });
            // });
          };
          reader.readAsArrayBuffer(blob);
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