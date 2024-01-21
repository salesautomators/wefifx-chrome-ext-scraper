const select = document.getElementById('url_select');
const go_btn = document.getElementById('go_to');
const parse_btn = document.getElementById('parse');

window.onload = async (event) => {
    var res = await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/get-reviews-urls', {
        method: 'GET'
    })

    var res_j = await res.json()

    for (let i = 0; i < res_j.rows.length; i++) {
        let new_option = document.createElement("option");
        new_option.value = res_j.rows[i].id
        new_option.innerText = `${res_j.rows[i].name} - ${res_j.rows[i].phone}`;
        new_option.dataset.urlp = res_j.rows[i].url;
        select.appendChild(new_option)
    }

    if (window.localStorage.selected_parse_id) {
        select.value = window.localStorage.selected_parse_id
    }
    else {
        select.value = '1'
    }
    go_btn.disabled = false
    parse_btn.disabled = false
    console.log(res_j)
};


go_btn.addEventListener('click', function () {
    chrome.tabs.update({ url: select.options[select.selectedIndex].dataset.urlp })
})

parse_btn.addEventListener('click', function () {

    var selected_profile = select.options[select.selectedIndex].value

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        var activeTab = tabs[0];
        var activeTabId = activeTab.id; // or do whatever you need
        //https://ads.google.com/u/2/localservices/reviews?cid=7242191078&bid=2680125475&pid=9999999999&euid=8565125162&hl=en&gl=US
        let split_url = activeTab.url.split("/").slice(5).join('/').split('&').slice(0, 4).join("&")
        let selcted_split_url = select.options[select.selectedIndex].dataset.urlp.split("/").slice(5).join('/').split('&').slice(0, 4).join("&")

        if (split_url.startsWith(selcted_split_url)) {
            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: async (profile, url) => {

                    const table = document.querySelector('table')
                    console.log(table)
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

                    if (reviews.length > 0) {
                        // save data from message to a JSON file and download
                        let json_data = {
                            profile_id: profile,
                            url: url,
                            reviews: reviews
                        };

                        console.log(json_data)

                        await fetch('https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-a2353696-a080-4405-9f3e-bd09ab52db29/wefix/save-reviews', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(json_data)
                        })

                    }

                    alert("Parsed!")
                },
                args: [selected_profile, activeTab.url]
            });
        }
        else {
            console.log(split_url)
            console.log(selcted_split_url)
            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: () => {
                    alert(`Page is different from the selected one! ${split_url}    versus  ${selcted_split_url}`)
                },
            });
        }

    });


})

select.onchange = (event) => {
    var selected = event.target.options[event.target.selectedIndex].dataset.urlp
    window.localStorage.setItem("selected_parse_id", select.options[select.selectedIndex].value);
}