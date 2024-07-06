(async function () {
  console.debug('[GLS] Executing script: report');
  async function waitSeconds(seconds) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, seconds * 1000);
    });
  }

  await waitSeconds(10);
  if (document.querySelector('.YqHYGd')) {
    console.warn('Account suspended or no data!');
    chrome.runtime.sendMessage(null, JSON.stringify({}));
  } else {
    function triggerMostButtons(elem) {
      triggerMouseEvent(elem, 'mouseover');
      triggerMouseEvent(elem, 'mousedown');
      triggerMouseEvent(elem, 'mouseup');
      triggerMouseEvent(elem, 'click');
    }

    function triggerMouseEvent(node, eventType) {
      const clickEvent = document.createEvent('MouseEvents');
      clickEvent.initEvent(eventType, true, true);
      node.dispatchEvent(clickEvent);
    }

    //select this month
    triggerMostButtons(document.querySelectorAll('span.DPvwYc')[1]);
    await waitSeconds(2);

    const dropdown3 = [...document.querySelectorAll('span.z80M1')];
    for (const dropdownItem of dropdown3) {
      if (dropdownItem?.textContent?.includes('This month')) {
        triggerMostButtons(dropdownItem);
        break;
      }
    }
    await waitSeconds(3);
    /* */

    //parse random info
    let charged_leads;
    let total_spent;
    let ad_impressions;
    let top_impression_rate;
    let absolute_top_impression_rate;
    const leads = [];

    const spents = [...document.querySelectorAll('div.vlrAmc')];
    for (const { nextElementSibling, textContent } of spents) {
      if (!total_spent && textContent.includes('Total lead spend')) {
        const texts = [];
        let { firstChild: child } = nextElementSibling?.querySelector?.('div.tF4MG');

        while (child) {
          if (child?.nodeType == 3) {
            texts.push(child.data);
          }
          child = child?.nextSibling;
        }

        total_spent = texts.join('');
      }

      if (!charged_leads && textContent.includes('Charged leads')) {
        const texts = [];
        let { firstChild: child } = nextElementSibling.querySelector('div.tF4MG') ?? {};

        while (child) {
          if (child.nodeType == 3) {
            texts.push(child.data);
          }
          child = child.nextSibling;
        }

        charged_leads = texts.join('');
      }

      if (total_spent && charged_leads) {
        break;
      }
    }

    const ads = [...document.querySelectorAll('div.ruv1Qc')];
    for (const { nextElementSibling, textContent } of ads) {
      if (!ad_impressions && textContent.includes('Ad impressions')) {
        ad_impressions = nextElementSibling.textContent;
      }

      if (!top_impression_rate && textContent.includes('Top impression rate on Search')) {
        top_impression_rate = nextElementSibling.textContent;
      }

      if (!absolute_top_impression_rate && textContent.includes('Absolute top impression rate on Search')) {
        absolute_top_impression_rate = nextElementSibling.textContent;
      }

      if (ad_impressions && top_impression_rate && absolute_top_impression_rate) {
        break;
      }
    }

    const spas = [...document.querySelectorAll('.vRMGwf.oJeWuf')];
    //change filters on table
    for (const spa of spas) {
      if (spa.textContent.includes('Charged leads')) {
        spa.scrollIntoView(true);
        triggerMostButtons(spa);
        await waitSeconds(3);
        break;
      }
    }

    const dropdown1 = [...document.querySelectorAll('.MocG8c.LMgvRb')];
    for (const [index, dropdown] of [...dropdown1].entries()) {
      if (dropdown.textContent.includes('Any charge status') && index > 2) {
        triggerMostButtons(dropdown);
        await waitSeconds(3);
        break;
      }
    }

    //change second filter on table
    for (const spa of spas) {
      if (spa.textContent.includes('Booked')) {
        spa.scrollIntoView(true);
        triggerMostButtons(spa);
        await waitSeconds(3);
        break;
      }
    }

    const dropdown2 = [...document.querySelectorAll('div[data-value="new"]')];
    triggerMostButtons(dropdown2.at(-1));
    await waitSeconds(3);

    //parse the table with leads
    function collectLeads() {
      const { rows = [] } = document.querySelector('table.i3WFpf') ?? {};
      if (rows.length > 1) {
        for (const [index, { cells = [] }] of [...rows].entries()) {
          //iterate through rows
          //rows would be accessed using the "row" variable assigned in the for loop
          if (!index) continue;

          const lead = {};
          for (const [index, col] of [...cells].entries()) {
            //iterate through columns
            //columns would be accessed using the "col" variable assigned in the for loop
            if (!index) {
              lead.phone = col.querySelector('div.jru90.wllRo')?.textContent;
            }
            if (index === 1) {
              lead.customer_name = col.querySelector('div.jru90.h8Lmif')?.textContent;
            }
            if (index === 2) {
              lead.lead_type = col.querySelector('div.jru90.wllRo')?.textContent;
            }
            if (index === 3) {
              lead.business_category = col.querySelector('.jru90.wllRo')?.innerText;
            }
            if (index === 4) {
              lead.service_type = col.querySelector('.jru90.wllRo')?.innerText;
            }
            if (index === 5) {
              lead.status = col.querySelector('.jru90.wllRo')?.innerText;
            }
            if (index === 6) {
              lead.received = col.querySelector('.jru90.wllRo')?.innerText;
            }
          }
          leads.push(lead);
        }
      }
    }

    while (true) {
      const paginate = document.querySelector('span[data-paginate="next"]');
      collectLeads();

      if (paginate && paginate.ariaDisabled !== 'true') {
        triggerMostButtons(paginate);
        await waitSeconds(4);
      } else break;
    }

    // send message back to popup script
    chrome.runtime.sendMessage(
      null,
      JSON.stringify({ leads, total_spent, charged_leads, top_impression_rate, absolute_top_impression_rate })
    );
  }
})();
