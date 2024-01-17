
(async function () {

  console.log("Executing script")

  async function waitSeconds(seconds) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, seconds * 1000);
    });
  }

  function triggerMostButtons(elem) {
    triggerMouseEvent(elem, "mouseover");
    triggerMouseEvent(elem, "mousedown");
    triggerMouseEvent(elem, "mouseup");
    triggerMouseEvent(elem, "click");
  }

  function triggerMouseEvent(node, eventType) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  }

  await waitSeconds(10)

  //select this month
  triggerMostButtons(document.querySelectorAll("span.DPvwYc")[1])
  await waitSeconds(2)

  let dropdown3 = document.querySelectorAll("span.z80M1")
  for (let i = 0; i < dropdown3.length; i++) {
    if (dropdown3[i].textContent.includes("This month")) {
      triggerMostButtons(dropdown3[i])
      break;
    }
  }
  await waitSeconds(3)
  /* */

  //parse random info
  let charged_leads;
  let total_spent;
  let ad_impressions;
  let top_impression_rate;
  let absolute_top_impression_rate;

  for (let spent of document.querySelectorAll("div.vlrAmc")) {
    if (!total_spent && spent.textContent.includes("Total lead spend")) {
      let el = spent.nextElementSibling.querySelector("div.tF4MG");
      let child = el.firstChild;
      let texts = [];

      while (child) {
        if (child.nodeType == 3) {
          texts.push(child.data);
        }
        child = child.nextSibling;
      }

      total_spent = texts.join("");
    }

    if (!charged_leads && spent.textContent.includes("Charged leads")) {
      let el = spent.nextElementSibling.querySelector("div.tF4MG");
      let child = el.firstChild;
      let texts = [];

      while (child) {
        if (child.nodeType == 3) {
          texts.push(child.data);
        }
        child = child.nextSibling;
      }

      charged_leads = texts.join("");
    }
    if (total_spent && charged_leads) {
      break;
    }
  }

  for (let ad of document.querySelectorAll("div.ruv1Qc")) {
    if (!ad_impressions && ad.textContent.includes("Ad impressions")) {
      ad_impressions = ad.nextElementSibling.textContent;
    }

    if (!top_impression_rate && ad.textContent.includes("Top impression rate on Search")) {
      top_impression_rate = ad.nextElementSibling.textContent;
    }

    if (!absolute_top_impression_rate && ad.textContent.includes("Absolute top impression rate on Search")) {
      absolute_top_impression_rate = ad.nextElementSibling.textContent;
    }

    if (ad_impressions && top_impression_rate && absolute_top_impression_rate) {
      break;
    }
  }


  //change filters on table
  var selector1 = document.querySelectorAll(".vRMGwf.oJeWuf")

  for (let spa of selector1) {
    if (spa.textContent.includes("Charged leads")) {
      spa.scrollIntoView(true)
      triggerMostButtons(spa)
      break;
    }
  }

  await waitSeconds(3)

  let dropdown1 = document.querySelectorAll(".MocG8c.LMgvRb")

  for (let i = 0; i < dropdown1.length; i++) {
    if (dropdown1[i].textContent.includes("Any charge status") && i > 2) {
      triggerMostButtons(dropdown1[i])
      break;
    }
  }

  await waitSeconds(3)


  //change secont filter on table
  for (let spa of selector1) {
    if (spa.textContent.includes("Only booked appointments")) {
      spa.scrollIntoView(true)
      triggerMostButtons(spa)
      break;
    }
  }
  await waitSeconds(3)

  let dropdown2 = document.querySelectorAll(".MocG8c.LMgvRb")

  for (let i = 0; i < dropdown2.length; i++) {
    if (dropdown2[i].textContent.includes("Any lead status") && i > 5) {
      console.log(dropdown2[i])
      triggerMostButtons(dropdown1[i])
      break;
    }
  }

  await waitSeconds(3)



  //parse the table with leads
  const table = document.querySelector('table.i3WFpf')

  const leads = []

  for (var i = 0, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    if (i === 0) {
      continue
    }
    let lead = {}

    for (var j = 0, col; col = row.cells[j]; j++) {
      //iterate through columns
      //columns would be accessed using the "col" variable assigned in the for loop
      if (j === 0) {
        lead['phone'] = col.querySelector("div.jru90.wllRo").textContent
      }
      if (j === 1) {
        lead['customer_name'] = col.querySelector("div.jru90.h8Lmif").textContent
      }
      if (j === 2) {
        // lead['lead_type'] = col.querySelector("span[jsname=QUIPvd]").innerText + col.querySelector("span[jsname=awEEA]").innerText
        lead['lead_type'] = col.querySelector("div.jru90.wllRo").textContent
      }
      if (j === 3) {
        lead['business_category'] = col.querySelector(".jru90.wllRo").innerText
      }
      if (j === 4) {
        lead['service_type'] = col.querySelector(".jru90.wllRo").innerText
      }
      if (j === 5) {
        lead['status'] = col.querySelector(".jru90.wllRo").innerText
      }
      if (j === 6) {
        lead['received'] = col.querySelector(".jru90.wllRo").innerText
      }
    }

    leads.push(lead)

  }

  // prepare JSON data with page title & first h1 tag
  let data = JSON.stringify({ leads: leads, total_spent: total_spent, charged_leads: charged_leads });

  // send message back to popup script
  chrome.runtime.sendMessage(null, data);

})()