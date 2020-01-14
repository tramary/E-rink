//popup表示時の電源ボタンの処理
$(window).on('load', function() {
	chrome.storage.local.get(['mode'], function(result) {
		console.log(result.mode);
 		if(result.mode == 'on') {
			$('.btn-real').addClass('push');
		}
  });
});

//電源ボタンクリック後の処理
$('.btn-real').on('click',function(){
	chrome.storage.local.get(['mode'], function(result) {
			console.log(result.mode);
			if(result.mode == 'off'){
				$('.btn-real').addClass('push');
				chrome.storage.local.set({mode: 'on'});
			}else if (result.mode == 'on') {
				$('.btn-real').removeClass('push');
				chrome.storage.local.set({mode: 'off'});
			}
  });
});

const openPage = function(url) {
  chrome.tabs.create({url});
};

$('#options').click(function () {
  openPage(chrome.extension.getURL('./html/elopt.html'));
});

$('#help').click(function () {
  openPage(chrome.extension.getURL('./html/help.html'));
});
