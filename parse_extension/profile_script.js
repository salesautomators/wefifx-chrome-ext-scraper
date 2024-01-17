
(async function () {


  console.log("Executing script")

  async function waitSeconds(seconds) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, seconds * 1000);
    });
  }

  await waitSeconds(10)

  //parse random info

  let weekly_target = document.querySelector("div[jsname=ppHlrf]").querySelector(".Jyrwz").textContent

  let average_weekly_budget;
  
  let previous_7_days;

  for (let budget of document.querySelectorAll("div.yO41Cb")) {
    console.log("Parsing")
    if (!average_weekly_budget && budget.textContent.includes("Average weekly budget")) {
      average_weekly_budget = budget.nextElementSibling.textContent;
    }
    if (!previous_7_days && budget.textContent.includes("Previous 7 days")) {
      previous_7_days = budget.nextElementSibling.textContent;
    }
    if (average_weekly_budget && previous_7_days) {
      break;
    }
  }

  // prepare JSON data with page title & first h1 tag
  let data = JSON.stringify({ average_weekly_budget: average_weekly_budget, weekly_target: weekly_target, previous_7_days: previous_7_days });

  // send message back to popup script
  chrome.runtime.sendMessage(null, data);

})()