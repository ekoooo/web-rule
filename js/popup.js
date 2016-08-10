var isInjectSrc = false;

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({"active": true}, function(tabs) {
        var top = document.getElementById('top');
        var id = tabs[0].id;
        setSwitchPosition(top, getStorage(id));
        top.addEventListener('click', function(e) {
            var isOpen = getStorage(id);
            setStorage(id, !isOpen);
            setSwitchPosition(top, !isOpen);

            if(!isOpen && !isInjectSrc) { // 原来没有注入 js css, 用户点击了开关注入
                setSrc();
                isInjectSrc = true;
            }
            else if(isOpen) { // 在 background 初始化已经注入 js css, 固设置标志位
                isInjectSrc = true;
            }
        });
    });
});