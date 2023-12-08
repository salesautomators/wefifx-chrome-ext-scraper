let page_title = document.title,
    page_h1_tag = '';

if (document.querySelector("h1") !== null)
    page_h1_tag = document.querySelector("h1").textContent;

const table = document.querySelector('table')

const reviews = []

for (var i = 0, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    if (i === 0){
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

// send message back to popup script
chrome.runtime.sendMessage(null, data);