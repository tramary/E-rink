// 
// background.jsは、拡張機能が有効だと常に読み込まれているjs
// イベントに対するControler的な役割にすると良さそう
//
// 直下の指定だと、ページが読み込まれるごとにアラートが出力される。いまは、コメント
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
chrome.runtime.onMessage.addListener(function (V, sender, sendResponse) {
    let rt = loopcheck(V);
    console.log("メッセ送る直前" + rt.then);
    sendResponse(rt);
    return true;
});
let linksum = -1;
function loopcheck({ lsaki, ltxt, basedom }) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(ltxt);
        console.log(lsaki);
        let endflag = false;
        let res;
        let rt;
        res = yield httpreq(lsaki, ltxt, basedom);
        rt = lsaki;
        while (res != "notfound") {
            linksum += 1;
            rt = res;
            res = yield httpreq(res, ltxt, basedom);
        }
        if (linksum >= 0) {
            linksum = -1;
            //alert("loopend")
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //alert("sendmessage"+rt);
                chrome.tabs.sendMessage(tabs[0].id, { url: rt }, function () { });
            });
        }
    });
}
function httpreq(url, txt, basedomain) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            let xhr = new XMLHttpRequest();
            let httnum = url.indexOf("http");
            let activurl = false; //作業ここで終わってる　URL有効性チェック
            if (httnum == 0) {
                activurl = true;
            }
            if (!activurl) {
                alert("URLがHTTPで始まってません");
                if (httnum > 0) {
                    url = url.slice(httnum);
                }
                if (httnum == -1) {
                    alert("URLにHTTPが含まれていません元ドメイン" + basedomain);
                    if (url.indexOf("/") == 0) {
                        url = "http://" + url; //urlとhttp間にbasedomainを入れるのやめてみた
                        alert("整形後URL" + url);
                    }
                }
            }
            xhr.open("GET", url);
            xhr.responseType = "document";
            if (activurl) {
                xhr.send();
            }
            else {
                xhr.send();
            } //後々消す
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let el = xhr.response;
                    console.log(xhr.response + "XHR読み込み完了");
                    let qsa = el.querySelectorAll("a");
                    let rturl = "notfound";
                    qsa.forEach(function (q) {
                        if (q.innerHTML.indexOf(txt) > -1) {
                            rturl = q.getAttribute("href");
                        }
                    });
                    resolve(rturl);
                }
            };
        });
    });
}
