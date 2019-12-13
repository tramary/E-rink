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


chrome.browserAction.onClicked.addListener(function(tab) {
   alert(tab.url);
   chrome.tabs.sendMessage(tab.id,{},function(){
       alert("message send!");
   })


});

chrome.runtime.onMessage.addListener(function(V,sender,sendResponse){
    console.log("call loopcheck:"+V.lsaki)
    let rt:Promise<void> =  loopcheck(V);
    console.log("メッセ送る直前"+rt);
     sendResponse(rt);

    return　true;

});

chrome.storage.local.get(['mode'], function(result) {
    if(!result.mode){
      //デフォルト設定
      chrome.storage.local.set({mode: 'off'});
    }
});

chrome.storage.local.get(['count'], function(result) {
    if(!result.count){
      //デフォルト設定
      chrome.storage.local.set({count: '3'});
    }
});

let linksum:number = -1;

async function loopcheck({lsaki,ltxt,basedom}){//string,string,htmldocument
     console.log(ltxt);
     console.log(lsaki);
     let endflag:boolean = false;
    let res;
    let rt;
    let lcnt:number;
    chrome.storage.local.get(['count'], function(result){
      lcnt = parseInt(result.count);
    });

    res = await httpreq(lsaki,ltxt,basedom);
    rt = lsaki;
     while(res!="notfound"){
        //上限が来たらループ強制終了して無理やり見つからなかった扱いに
        if(linksum>lcnt){linksum=-1; break;}
         linksum+=1;
         rt = res;
         res = await httpreq(res,ltxt,basedom);
     }
     console.log(res+"れす:RT"+rt+"さむ"+linksum);
    if (linksum!=-1){
        linksum=-1;
        //alert("loopend")
       chrome.tabs.query({active:true,currentWindow:true},function(tabs){
           console.log("sendmessage"+rt);
          // chrome.tabs.sendMessage(tabs[0].id,{url:rt},function(){})
            chrome.tabs.create({url:rt});
       })

   }

}

async function httpreq(url:string,txt:string,basedomain:string){//asyncつけるのはどっちかわかんね　調べる
    return new Promise(await function(resolve){
    let xhr = new XMLHttpRequest();
    let httnum:number = url.indexOf("http")

    let activurl=false;//作業ここで終わってる　URL有効性チェック
    if(httnum==0){activurl=true;}
    if(!activurl){alert("URLがHTTPで始まってません");
        if(httnum>0){url = url.slice(httnum)}
        if(httnum==-1){
            alert("URLにHTTPが含まれていません元ドメイン"+basedomain)

            if(url.indexOf("/")==0){url="http://"+url;//urlとhttp間にbasedomainを入れるのやめてみた
                alert("整形後URL"+url);
        }
    }
    }
     xhr.open("GET",url);
    xhr.responseType="document";

     xhr.send();

    xhr.onreadystatechange =  function(){
        console.log(xhr.readyState+"&"+xhr.status);
        if(xhr.readyState === 4 && xhr.status === 200){
        let el:HTMLDocument =  xhr.response;
        console.log(xhr.response+"XHR読み込み完了");
        let qsa = el.querySelectorAll("a");

        let rturl = "notfound";

        qsa.forEach(function(q:HTMLAnchorElement){
            if(q.innerHTML.indexOf(txt)>-1){
                console.log("rturl代入前"+q.getAttribute("href"));
                rturl=q.getAttribute("href");
            }

        })
        console.log("リゾルブ"+rturl);
        resolve(rturl);
        }
    }
})
}
