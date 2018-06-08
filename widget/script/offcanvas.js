
var offCanvasWrapper = mui('#offCanvasWrapper');
var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');
var offCanvasSide = document.getElementById("offCanvasSide");
if (!mui.os.android) {
    document.getElementById("move-togger").classList.remove('mui-hidden');
    var spans = document.querySelectorAll('.android-only');
    for (var i = 0, len = spans.length; i < len; i++) {
        spans[i].style.display = "none";
    }
}

//关闭手势侧换
var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');
offCanvasInner.addEventListener('drag', function(event) {
    event.stopPropagation();
});

mui('#offCanvasSideScroll').scroll();
mui('#offCanvasContentScroll').scroll();
if (mui.os.plus && mui.os.ios) {
    mui.plusReady(function() { //5+ iOS暂时无法屏蔽popGesture时传递touch事件，故该demo直接屏蔽popGesture功能
        plus.webview.currentWebview().setStyle({
            'popGesture': 'none'
        });
    });
}