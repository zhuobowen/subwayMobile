mui.init();
var fs;
var executeUser;
var inspectTime;
apiready = function() {
    fnInitData();
    fnInitStyle();
    fnInitBasicData();
    fnRefreshHeaderInfo();
    api.addEventListener({
        name:'viewappear'
    }, function(ret, err){
        fnInitData();
    });
};

//初始化样式
function fnInitStyle(){
    var topDivHeight = api.winHeight / 3;
    $('#topDiv').height(topDivHeight);
    $('#topDiv img').css('margin-top', (topDivHeight-150) / 3 + 'px');
    var top = $api.byId('topDiv');
    var liHeight = (api.winHeight - $api.offset(top).h - (topDivHeight-150) / 2) / 3;
    api.parseTapmode();
}


//初始化基础数据
function fnInitBasicData(){
    fs = api.require('fs');
    var path = $api.getStorage('root_pointFile');
    fs.open({
        path: path,
        flags: 'read'
    }, function(ret, err) {
        if (!ret.status) { //文件不存在
            fnShowProgress("正在初始化数据");
            $.getJSON( fnGetServerAddr() + '/subway/lineAndStation.do?todo=queryUsedStationPointsGrouped', function(json) {
                if (json) {
                    var lineList = [];
                    for (var key in json){
                        lineList.push({
                            id: key,
                            name: json[key].lineName
                        })
                    }
                    $api.setStorage('lineList', lineList);
                    ret = fs.removeSync({
                        path: path
                    });
                    fs.createFile({
                        path: path
                    }, function(ret, err) {
                        if (ret.status) {
                            fs.open({
                                path: path,
                                flags: 'read_write'
                            }, function(ret, err) {
                                if (ret.status) {
                                    fs.write({
                                        fd: ret.fd,
                                        data: JSON.stringify(json),
                                        offset: 0
                                    }, function(ret, err) {
                                        api.hideProgress();
                                        if (ret.status) {
                                            fnShowMessage('初始化成功')
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            })
        }
    });

    if(!$api.getStorage('StationPoints')){
        $.getJSON(fnGetServerAddr() + '/apicloud/unusualSituation.do?todo=queryStationPointForApp', function(json) {
            if (json != null) {
                $api.setStorage('StationPoints', json.data);
            }
        })
    }
}

//设置下拉刷新
function fnRefreshHeaderInfo(){
    fnRefreshHeader('fnInitData',false);
}

//初始化数据
function fnInitData(){
    executeUser = getUserId();
    inspectTime = fnGetTodayStr('-');
    $('#user_name').html(fnGetUser().showname);
    api.ajax({
        url: fnGetServerAddr () + '/apicloud/task.do?todo=getTodayTaskCount',
        method: 'get',
        timeout:3,
        data: {
            values: {
                executeUser:executeUser,
                inspectTime:inspectTime
            }
        }
    },function(ret, err){
        api.refreshHeaderLoadDone();
        if (ret) {
            if(ret.success){
                $('#worksiteCount').html(ret.worksiteCount);
                $('#todayInspectCount').html(ret.todayInspectCount);
            }else{
                fnShowMessage(ret.msg || "数据异常");
            }
        }else{
            fnShowMessage("网络异常")
        }
    });
}
//今日巡查按钮
function fnTodayInspect(){
    fnShowProgress();
    api.ajax({
        url: fnGetServerAddr () + '/apicloud/task.do?todo=queryTodayTaskCount',
        method: 'get',
        timeout:6,
        data: {
            values: {
                executeUser:executeUser,
                inspectTime:inspectTime
            }
        }
    },function(ret, err){
        fnHideProgress();
        if (ret && ret.state != -1) {
            if(ret.count > 0){
                if(!ret.state || ret.state == 0){
                    fnOpenTodayInspect();
                }else if(ret.state == 1){
                    fnOpenTodayInspectPoint();
                }else if(ret.state == 2){
                    fnOpenTodayInspectResult();
                }
            }else{
                fnShowMessage('今日无巡查任务');
            }
        }else{
            fnShowMessage('网络异常')
        }
    });
}

//打开今日巡查
function fnOpenTodayInspect(){
    var title = '今日巡查';
    var pageName = 'today-inspect';
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title:title,
        frameName:pageName,
        frameUrl:'./frame/'+pageName+'.html',
        leftIcons:leftIcons
    };
    fnOpenCommonWin(pageName,pageObj);
}

//打开今日巡查点页面
function fnOpenTodayInspectPoint(){
    api.openDrawerLayout({
        name: 'today-inspect-point-main',
        url: 'widget://html/frame/today/inspect/today-inspect-point-main.html',
        slidBackEnabled:false,
        rightPane: {
            edge: api.winWidth/3,
            name: 'today-inspect-point-right',
            url: 'widget://html/frame/today/inspect/today-inspect-point-right.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        },
        delay:300,
        animation:{
            type: 'movein',
            subType:'from_right',
            duration:300
        }
    });
}

//打开今日巡查结果
function fnOpenTodayInspectResult(){
    var title = '今日巡查结果';
    var pageName = 'today-inspect-result-main'
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title: title,
        frameName: pageName,
        frameUrl: 'widget://html/frame/today/result/' + pageName + '.html',
        leftIcons: leftIcons,
        isFinish:true
    };
    api.openDrawerLayout({
        name: 'today-inspect-restult-win',
        url: 'widget://html/common-win.html',
        animation: {
            type: 'none'
        },
        slidBackEnabled:false,
        pageParam:pageObj,
        leftPane: {
            edge: api.winWidth/3,
            name: 'today-inspect-point-right',
            url: 'widget://html/frame/today/inspect/today-inspect-point-right.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        },
        animation:{
            type: 'movein',
            subType:'from_right',
            duration:300
        }
    });
}


//打开电子地图
function fnOpenElectronicMap(){
    api.openWin({
        name: 'map-win',
        url: 'widget://html/frame/map/map-win.html',
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        slidBackEnabled :false
    });
}


//打开今日工点监护
function fnWorksiteInspect(){
    fnShowProgress();
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/worksite.do?todo=hasWorksiteTaskStarted',
        method: 'get',
        timeout: 30,
        dataType: 'json',
        returnAll: false,
        data: {
            values: {userId: getUserId()}
        }
    }, function (ret, err) {
        fnHideProgress();
        if(ret){
            if(ret.success){
                if(!ret.inspectSituation || ret.inspectSituation == 0){
                    //打开今日监护出勤页面
                    fnOpenWorksiteInspect();
                }else if (ret.inspectSituation == 1){
                    //今日监护地图页面
                    fnOpenWorksiteInspectPoint();
                }else if(ret.inspectSituation == 2){
                    //今日监护报告页面
                    fnOpenWorksiteInspectResult();
                }
            }else{
                fnShowMessage(ret.msg || "数据异常");
            }
        }else{
            fnShowMessage("网络异常");
        }
    });
}


//打开今日工点监护（出勤页面）
function fnOpenWorksiteInspect(){
    var title = '今日监护工点';
    var pageName = 'worksite-inspect';
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title:title,
        frameName:pageName,
        frameUrl:'./frame/'+pageName+'.html',
        leftIcons:leftIcons,
        bounces:false
    };
    fnOpenCommonWin(pageName,pageObj);
}

//打开今日工点监护（地图页面）
function fnOpenWorksiteInspectPoint(){
    api.openDrawerLayout({
        name: 'workstie-inspect-point-main',
        url: 'widget://html/frame/worksite/inspect/worksite-inspect-point-main.html',
        slidBackEnabled:false,
        rightPane: {
            edge: api.winWidth/5,
            name: 'today-inspect-point-right',
            url: 'widget://html/frame/worksite/inspect/worksite-inspect-point-right.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        },
        animation:{
            type: 'movein',
            subType:'from_right',
            duration:300
        }
    });
}

//打开今日工点监护（结果页面）
function fnOpenWorksiteInspectResult(){
    var title = '今日监护报告';
    var pageName = 'worksite-inspect-result',
        leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title: title,
        frameName: pageName,
        frameUrl: 'widget://html/frame/worksite/result/' + pageName + '.html',
        leftIcons: leftIcons,
        scrollEnabled:false,
        isFinish: true
    };
    api.openDrawerLayout({
        name: 'worksite-inspect-restult-win',
        url: 'widget://html/common-win.html',
        animation: {
            type: 'none'
        },
        slidBackEnabled: false,
        pageParam: pageObj,
        leftPane: {
            edge: api.winWidth / 3,
            name: 'worksite-inspect-result-right',
            url: 'widget://html/frame/worksite/inspect/worksite-inspect-point-right.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        },
        animation: {
            type: 'movein',
            subType: 'from_right',
            duration: 300
        }
    });
}

//地保巡视
function fnProtectInspect(){
    // fnShowMessage('努力开发中');
    // return;
    api.openWin({
        name: 'subway-protect-inspect-win',
        url: 'widget://html/frame/protect/subway-protect-inspect-win.html',
        slidBackEnabled:false
    });
}

//异常确认单现场确认
function fnConfirmInspect(){
    // fnShowMessage('努力开发中');
    // return;
    api.openDrawerLayout({
        name: 'unusual-confirm-win',
        url: 'widget://html/frame/confirm/unusual-confirm-win.html',
        slidBackEnabled:false,
        rightPane: {
            edge: api.winWidth/5,
            name: 'unusual-confirm-right',
            url: 'widget://html/frame/confirm/unusual-confirm-right.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            }
        },
        animation:{
            type: 'movein',
            subType:'from_right',
            duration:300
        }
    });
}

//返回登录页面
function fnExist(){
    api.confirm({
        title: '提示',
        msg: '确认退出登录吗?',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if(index == 1){
            //初始化当前登录人
            $api.setStorage('user', '');

            api.openWin({
                name: 'login',
                url: './login.html',
                rect: {
                    x: 0,
                    y: 0,
                    w: api.winWidth,
                    h: api.winHeight,
                },
                bounces: false,
                bgColor: 'rgba(0,0,0,0)',
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                slidBackEnabled: false
            });
        }else{
            return;
        }
    });
}
