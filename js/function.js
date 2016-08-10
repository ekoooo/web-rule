function clearStorage() {
    window.localStorage.removeItem("webRulerStatusStorage");
}

/**
 * @param id 当前 tab 的 id
 * @param val 是否需要注入 js css
 */
function setStorage(id, val) {
    var old = {};
    if(window.localStorage["webRulerStatusStorage"]) {
        old = JSON.parse(window.localStorage["webRulerStatusStorage"]);
    }
    old[id] = val;
    window.localStorage["webRulerStatusStorage"] = JSON.stringify(old);
}

/**
 * @param id 当前 tab 的 id
 */
function getStorage(id) {
    if(window.localStorage["webRulerStatusStorage"]) {
        return JSON.parse(window.localStorage["webRulerStatusStorage"])[id];
    }
    return false;
}

/**
 * 注入 js 和 css
 */
function setSrc() {
    chrome.tabs.insertCSS(null, {"file": "css/web_ruler.css"});
    chrome.tabs.executeScript(null, {"file": "js/jquery-1.8.0.min.js"});
    chrome.tabs.executeScript(null, {"file": "js/web_ruler.js"});
}

/**
 * 设置开关位置
 */
function setSwitchPosition(switchDom, isOpen) {
    isOpen ? switchDom.style.left = '0' : switchDom.style.left = '30px';
}

function log(c) {
    chrome.tabs.executeScript(null, {"code": "console.log('" + c + "');"});
}