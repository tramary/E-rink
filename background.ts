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
    sendResponse(loopcheck(V))
    
    return　true;

});

let linksum:number = -1;

async function loopcheck({lsaki,ltxt}){
     console.log(ltxt);
     console.log(lsaki);
     let endflag:boolean = false;
    let res;
     res = await httpreq(lsaki,ltxt);
     while(res!="notfound"){
         linksum+=1;
         res = await httpreq(res,ltxt);
     }


    if (linksum>=0){
        linksum=-1;
        // alert("loopend")
       chrome.tabs.query({active:true,currentWindow:true},function(tabs){
           
           chrome.tabs.sendMessage(tabs[0].id,{url:res},function(){})
       })
       
   }

}

function httpreq(url,txt){
    return new Promise(function(resolve){
    let xhr = new XMLHttpRequest();
    xhr.open("GET",url);
    xhr.responseType="document";
    // xhr.addEventListener("loadend",function(){
        
    //     let el:HTMLDocument = xhr.response;
    //     let qsa = el.querySelectorAll("a");

    //     let rturl;
       
    //     qsa.forEach(function(q:HTMLAnchorElement){
    //         if(q.innerHTML==txt){
    //             //  alert("が見つかりました");
                
    //             loopcheck({lsaki:q.getAttribute("href"),ltxt:q.innerHTML})
    //             rturl=q.getAttribute("href");
                
    //         }

    //     })
    // })
    xhr.send();

    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
        let el:HTMLDocument = xhr.response;
        let qsa = el.querySelectorAll("a");

        let rturl = "notfound";
       
        qsa.forEach(function(q:HTMLAnchorElement){
            if(q.innerHTML==txt){
                //  alert("が見つかりました");
                rturl=q.getAttribute("href");
            }

        })
        resolve(rturl);
        }
    }
})
}