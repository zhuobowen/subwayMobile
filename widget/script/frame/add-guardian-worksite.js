var menuHeight;
var menu;
var menus = [];
var frames = [];
var frameNames = ['worksite-info', 'worksite-draw'];
apiready = function() {
    headerHeight = api.pageParam.headerHeight;
    menu = $api.byId('menu');
    menuHeight = $api.offset(menu).h;
    fnOpenFrameGroup();
};
//打开frameGroup
function fnOpenFrameGroup() {
    for (var i = 0; i < frameNames.length; i++) {
        frames.push({
            name: frameNames[i],
            pageParam: {
                headerHeight: headerHeight + menuHeight
            },
            url: './worksite/add/' + frameNames[i] + '.html'
        });
    }
    api.openFrameGroup({
        name: 'worksite-add-group',
        scrollEnabled: false,
        preload: 2,
        rect: {
            x: 0,
            y: headerHeight + menuHeight,
            w: 'auto',
            h: 'auto'
        },
        index: 0,
        frames: frames
    },
    function(ret, err) {
        fnChangeStyle(ret.index);
    });
}
//切换frame
function fnChange(index) {
    fnChangeStyle(index);
    api.setFrameGroupIndex({
        name: 'worksite-add-group',
        index: index,
        scroll: true
    });
}
//修改切换frame后的样式
function fnChangeStyle(index) {
    var flag = true;
    if (index == 1) {
        flag = false;
    }
    api.setFrameAttr({
        name: 'worksite-draw-bottom',
        hidden: flag
    });
    menus = $api.domAll(menu, '.mui-item');
    for (var i = 0; i < menus.length; i++) {
        if (index == i) {
            $api.addCls(menus[i], 'mui-active');
        } else {
            $api.removeCls(menus[i], 'mui-active');
        }
    }
}

//保存监护工点信息
function fnSave() {
    api.execScript({
        name: api.winName,
        frameName: 'worksite-info',
        script: 'fnSave();'
    });
}