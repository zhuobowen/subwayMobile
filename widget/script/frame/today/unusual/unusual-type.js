 apiready = function(){
    fnInitData();
};

//初始化异常类型列表
function fnInitData(){
    $('#content').hide();
    fnShowProgress();
    api.ajax({
        url: fnGetServerAddr() + '/subway/inspectProject.do?todo=queryAllInspectProjectForApp',
        method: 'get',
        data: {
        }
    },function(ret, err){
        fnHideProgress();
        if (ret) {
            $('#content').append(doT.template($api.byId('template').innerHTML)(ret));
            $('#content').show();
            fnInitStyle();
        }
    });
}

//初始化样式
function fnInitStyle(){
    $('.unusual-type').each(function(index,ele){
        var value = $(ele).html();
        if(value.length >= 14){
            $(ele).css('padding-top','0px')
        }
    })
    api.parseTapmode();
}

//登记异常
function fnRegisterUnusual(typeId,typeName,levelId,levelName){
    var type = {
        typeId : typeId,
        typeName : typeName,
        levelId : levelId,
        levelName:levelName
    }
    if(api.pageParam.selectedMode){
        api.execScript({
            name: 'unusual-register-win',
            frameName: 'unusual-register',
            script: 'changeTypeAndLevel('+JSON.stringify(type)+');'
        });
        api.closeWin({
            name: api.winName
        });
    }else{
        var pageName = 'unusual-register';
        var events = [];
        var pageObj = {
            type:type,
            title:'异常点登记',
            frameName:pageName,
            frameUrl:'widget://html/frame/today/unusual/'+pageName+'.html',
            leftIcons:'icon-arrow-left,event-back',
            events:events,
            imgUrls:api.pageParam.imgUrls,
            frontWin:api.pageParam.frontWin,
            unusualKey:api.pageParam.unusualKey
        };
        fnOpenCommonWin(pageName,pageObj);
    }
}

//返回今日巡查地图页面
function fnBackToInspectPoint(){
    api.closeToWin({
        name: 'today-inspect-point-win'
    });
}

//返回今日巡查地图页面
function fnBackToUnusualRegister(){
    api.closeToWin({
        name: 'unusual-register-win'
    });
}

//f返回到拍照页面
function fnBackToCamera(){
    api.openWin({
        name: 'camera-main-win',
        url: 'widget://html/frame/common/media/camera-win.html',
        slidBackEnabled:false,
        pageParam: {
            cameraType:1
        }
    });
}
