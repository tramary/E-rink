
chrome.runtime.onMessage.addListener(
    function(request,sender,callback){
         
        // alert("コンテンツ側画面遷移メッセージ受領")
        window.location.href = request.url;
       return true;
    }
)

document.addEventListener('click',function(this){
    let el:HTMLElement = <HTMLElement>event.target;
    
    let elp = el.parentElement;
    
    let lsaki = el.getAttribute("href");
    let ltxt = el.innerHTML;
    
     chrome.runtime.sendMessage({"lsaki":lsaki,"ltxt":ltxt,"basedom":this.domain},function(response){
      
      //window.location.href = response;
       })
     return true;
})

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