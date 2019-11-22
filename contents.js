chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    //alert("コンテンツ側画面遷移メッセージ受領")
    window.location.href = request.url;
});
document.addEventListener('click', function () {
    var el = event.target;
    var elp = el.parentElement;
    var lsaki = el.getAttribute("href");
    var ltxt = el.innerHTML;
    chrome.runtime.sendMessage({ "lsaki": lsaki, "ltxt": ltxt, "basedom": this.domain, "type": "main" }, function (response) {
        //ここに書いた処理はどうやら元のタブにて適用されるらしい　それもそうか。
    });
    return true;
});
/*
とりあえず必要な道具
HTML内のリンク取得→document.queryselectall("a[href]")
リンク取得→(get.attribute)
リンクテキスト取得→(firstChild.data) ただしこれはコードによっては動かないのでチルドレンも視野に
リンクの差し替え→setAttribute

動作軽くする案としてはセレクトオール時にオンクリックメソッドを埋め込んでクリックされた要素を
返しつつメソッドを呼ぶようにするとかが無難か？

クロスドメイン制約については、contentsJSでは弾かれるがbackground.jsでは問題なく作動する。

*/ 
