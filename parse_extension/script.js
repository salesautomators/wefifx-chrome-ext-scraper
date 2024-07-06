console.debug('[GLS] Executing script: main');
{
  const data = {
    reviews: [],
  };

  for (const [index, { cells = [] }] of [...(document.querySelector('table')?.rows ?? [])].entries()) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    if (!index) continue;
    const review = {};
    for (const [index, col] of [...cells].entries()) {
      //iterate through columns
      //columns would be accessed using the "col" variable assigned in the for loop
      if (!index) {
        review.rating = col?.querySelector?.('.zRhise')?.querySelectorAll?.('.Hqmfcc')?.length;
      } else if (index === 1) {
        review.customer = col?.querySelector?.('.zRhise')?.innerText;
      } else if (index === 2) {
        review.review =
          col?.querySelector?.('span[jsname=QUIPvd]')?.innerText +
          col?.querySelector?.('span[jsname=awEEA]')?.innerText;
      } else if (index === 3) {
        review.date = col?.querySelector?.('.zRhise')?.innerText;
      }
    }

    data.reviews.push(review);
  }

  // send message back to popup script
  chrome.runtime.sendMessage(null, JSON.stringify(data));
}
