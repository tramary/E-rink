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
    chrome.tabs.sendMessage(tab.id, {}, function () {
        alert("message send!");
    });
});
chrome.runtime.onMessage.addListener(function (V, sender, sendResponse) {
    console.log("call loopcheck:" + V.lsaki);
    let rt = loopcheck(V);
    console.log("メッセ送る直前" + rt);
    sendResponse(rt);
    return true;
});
chrome.storage.local.get(['mode'], function (result) {
    if (!result.mode) {
        //デフォルト設定
        chrome.storage.local.set({ mode: 'off' });
    }
});
chrome.storage.local.get(['count'], function (result) {
    if (!result.count) {
        //デフォルト設定
        chrome.storage.local.set({ count: '3' });
    }
});
let linksum = -1;
function loopcheck({ lsaki, ltxt, basedom }) {
    return __awaiter(this, void 0, void 0, function* () {
        ltxt = removeExtraStr(ltxt); //前後の空白とか...とか削除
        console.log(ltxt);
        console.log(lsaki);
        let endflag = false;
        let res;
        let rt;
        let bl = basedom;
        let lcnt;
        chrome.storage.local.get(['count'], function (result) {
            lcnt = parseInt(result.count);
        });
        res = yield httpreq(lsaki, ltxt, bl);
        rt = lsaki;
        while (res != "notfound") {
            //上限が来たらループ強制終了して無理やり見つからなかった扱いに
            if (linksum > lcnt) {
                linksum = -1;
                console.log("無限ループ");
                break;
            }
            linksum += 1;
            bl = rt;
            rt = res;
            res = yield httpreq(rt, ltxt, bl);
            if (res == rt) {
                console.log("res==rt!!");
                break;
            } //無限ループしそうなら抜ける
        }
        console.log("RT" + rt + ":linkたどった回数" + linksum);
        if (linksum != -1) {
            linksum = -1;
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                console.log("sendmessage" + rt);
                chrome.tabs.create({ url: rt });
            });
        }
    });
}
function httpreq(url, txt, basedomain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(url);
        if (url.indexOf("//") == 0) {
            url = url.replace("//", "http://");
        } //相対表記ではなく絶対表記の場合きちんと飛べるように
        txt = removeExtraStr(txt); //txtが省略表記かもしれないしね
        return new Promise(yield function (resolve) {
            let xhr = new XMLHttpRequest();
            let httnum = url.indexOf("http");
            let dm;
            dm = basedomain;
            let ssl = false;
            let firsttxt;
            let activurl = false; //作業ここで終わってる　URL有効性チェック
            if (httnum == 0) {
                activurl = true;
                ssl = false;
                if (dm.indexOf("http://") > -1) {
                    dm = dm.replace("http://", '');
                }
                else {
                    ssl = true;
                    dm = dm.replace("https://", '');
                }
                dm = dm.split('/')[0];
                firsttxt = "http://";
                if (ssl) {
                    firsttxt = "https://";
                }
            }
            if (!activurl) {
                console.log("URLがHTTPで始まってません");
                if (httnum > 0) {
                    url = url.slice(httnum);
                    ssl = false;
                    if (dm.indexOf("http://") > -1) {
                        dm = dm.replace("http://", '');
                    }
                    else {
                        ssl = true;
                        dm = dm.replace("https://", '');
                    }
                    dm = dm.split('/')[0];
                    firsttxt = "http://";
                    if (ssl) {
                        firsttxt = "https://";
                    }
                }
                if (httnum == -1) {
                    console.log("URLにHTTPが含まれていません元ドメイン" + basedomain);
                    if (dm.indexOf("http://") > -1) {
                        dm = dm.replace("http://", '');
                    }
                    else {
                        ssl = true;
                        dm = dm.replace("https://", '');
                    }
                    dm = dm.split('/')[0];
                    firsttxt = "http://";
                    if (ssl) {
                        firsttxt = "https://";
                    }
                    if (url.indexOf("/") == 0) {
                        url = firsttxt + dm + url; //urlとhttp間にbasedomainを入れるのやめてみた
                        console.log("上分岐整形後URL" + url);
                    }
                    else {
                        url = firsttxt + dm + "/" + url;
                        console.log("下分岐整形後URL" + url);
                    }
                }
                console.log("dm=" + dm + ":ft=" + firsttxt);
            }
            xhr.open("GET", url);
            xhr.responseType = "document";
            xhr.send();
            xhr.onreadystatechange = function () {
                console.log(xhr.readyState + "&" + xhr.status);
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let el = xhr.response;
                    console.log(xhr.response + "XHR読み込み完了");
                    let qsa = el.querySelectorAll("a");
                    let rturl = "notfound";
                    qsa.forEach(function (q) {
                        if (q.innerHTML.indexOf(txt) > -1) { //リンク元テキストを含むA要素は有るか？
                            console.log("rturl代入前" + q.getAttribute("href"));
                            rturl = q.getAttribute("href");
                        }
                        else {
                            let cuttxt = removeExtraStr(q.innerHTML);
                            if (cuttxt.indexOf(txt) > -1) {
                                console.log("逆引き成立");
                                console.log("rturl代入前" + q.getAttribute("href"));
                                rturl = q.getAttribute("href");
                            }
                        }
                    });
                    if (rturl.indexOf("//") == 0) {
                        rturl = rturl.replace("//", "http://");
                    } //相対表記ではなく絶対表記の場合きちんと飛べるように
                    if (rturl.indexOf("http") != -1) {
                        console.log("リゾルブ" + rturl);
                        resolve(rturl);
                    }
                    else if (rturl == "notfound") {
                        console.log("リゾルブ" + rturl);
                        resolve(rturl);
                    }
                    else {
                        let baseU = el.URL;
                        baseU = baseU.replace(firsttxt, "");
                        baseU = baseU.split("/")[0];
                        rturl = "" + firsttxt + baseU + rturl;
                        console.log("リゾルブ" + rturl);
                        resolve(rturl);
                    }
                }
            };
        });
    });
}
//タイトルが省略された時によくつくやつを削除 ...とか
var removeExtraStr = function (str) {
    if (str.match(/(.*)｜(.*)/)) {
        str = str.replace(/(.*)｜(.*)/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)\.\.\.$/)) {
        str = str.replace(/(.*)\.\.\.$/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)…$/)) {
        str = str.replace(/(.*)…$/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)・・・$/)) {
        str = str.replace(/(.*)・・・$/, "$1");
        return removeExtraStr(str);
    }
    return trim(str);
};
// 前後のスペース削除
var trim = function (str) {
    return str.replace(/^[\s　]+|[\s　]+$/g, "");
};
//# sourceMappingURL=background.js.map