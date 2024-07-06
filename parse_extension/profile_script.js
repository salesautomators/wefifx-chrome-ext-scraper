(async function () {
  console.debug('[GLS] Executing script: profile');
  async function waitSeconds(seconds) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, seconds * 1000);
    });
  }

  await waitSeconds(10);
  if (document.querySelector('.yfCPTc')) {
    console.warn('Account suspended!');
    chrome.runtime.sendMessage(null, JSON.stringify({}));
  } else {
    //parse random info
    const { textContent: weekly_target } = document.querySelector('div[jsname=ppHlrf]')?.querySelector('.Jyrwz') ?? {};
    const budgets = document.querySelectorAll('div.yO41Cb') ?? [];
    let average_weekly_budget;
    let previous_7_days;

    for (const { textContent, nextElementSibling } of budgets) {
      console.debug('[GLS] Parsing: profile');
      if (!average_weekly_budget && textContent.includes('Average weekly budget')) {
        average_weekly_budget = nextElementSibling?.textContent;
      }
      if (!previous_7_days && textContent.includes('Previous 7 days')) {
        previous_7_days = nextElementSibling?.textContent;
      }
      if (average_weekly_budget && previous_7_days) {
        break;
      }
    }

    // prepare JSON data with page title & first h1 tag
    const data = JSON.stringify({
      average_weekly_budget,
      weekly_target,
      previous_7_days,
    });

    // send message back to popup script
    chrome.runtime.sendMessage(null, data);
  }
})();
