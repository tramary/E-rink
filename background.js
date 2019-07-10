// 
// background.jsは、拡張機能が有効だと常に読み込まれているjs
// イベントに対するControler的な役割にすると良さそう
//
// 直下の指定だと、ページが読み込まれるごとにアラートが出力される。いまは、コメント
// アドレスバーの右側の拡張機能のアイコンをクリックした際のイベント
// ※ manifest.jsonの"browser_action"=>"default_popup"の指定があると無効になる
//xmlhttprequest()を作る
//openメソッドに"GET",リンクurlを渡す
//addeventlestnerをせっていする　HTML取得後に発火する
//取得したHTMLDOCmentはxhr.responseに格納されている
chrome.browserAction.onClicked.addListener(function (tab) {
    alert(tab.url);
    chrome.tabs.sendMessage(tab.id, {}, function () {
        alert("message send!");
    });
});
chrome.runtime.onMessage.addListener(loopcheck);
let linksum = -1;
function loopcheck({ lsaki, ltxt, }) {
    console.log(ltxt);
    console.log(lsaki);
    let endflag = false;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", lsaki);
    xhr.responseType = "document";
    xhr.addEventListener("loadend", function () {
        let el = xhr.response;
        let qsa = el.querySelectorAll("a");
        qsa.forEach(function (q) {
            if (q.innerHTML == ltxt) {
                //  alert("が見つかりました");
                endflag = true;
                linksum += 1;
                loopcheck({ lsaki: q.getAttribute("href"), ltxt: q.innerHTML });
            }
        });
    });
    let el = xhr.send();
    if (!endflag && linksum >= 0) {
        linksum = -1;
        // alert("loopend")
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { url: lsaki }, function () { });
        });
    }
    return true;
}
