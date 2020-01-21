$(function(){

  chrome.storage.local.get(['count'],function(r){
    console.log("get:" + r.count);
    const elms = document.querySelectorAll("option");
    for(let elm of elms.keys()){
      let val = parseInt(elms[elm].text);
      if(val === parseInt(r.count)){
        //selected要素をoptinonに付けたり消したりする
        elms.item(elms[elm].index).setAttribute("selected", "true");
      }
    }
  });

  $('#submit_b').on('click', function() {
    const selected = $("#CountList option:selected");
    const selectText = selected.text();
    //console.log("selectok");

    chrome.storage.local.set({count: selectText});
  });

});
