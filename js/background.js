clearStorage();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if('complete' === changeInfo.status && getStorage(tabId)) {
        setSrc();
    }
});