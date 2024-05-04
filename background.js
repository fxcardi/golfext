chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkName") {
    const name = message.name;
    // Implement logic to call your database API and check for the name (consider authentication)
    fetch(`your_api_endpoint?name=${name}`)
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          sendResponse({ exists: true, data: data.chartData }); // Send response to content script
        } else {
          sendResponse({ exists: false });
        }
      })
      .catch(error => console.error(error));
  }
});