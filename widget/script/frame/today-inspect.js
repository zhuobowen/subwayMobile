mui.init();
var unusualTasks,dailyTasks;
var attendances = []; //出席人员
var executeUser;
var inspectTime;
var carId;
var carList;
apiready = function() {
    executeUser = fnGetUser().userId;
    inspectTime = fnGetTodayStr('-');
    fnInitData();
}

//初始化数据
function fnInitData() {
    fnShowProgress();
    fnInitCarList();
    fnInitDailyTask();
    fnInitUnusualTask();
    fnInitYesterdayCount();
    $('.inspectTime').html(fnGetTodayStr('-'));
    $('.createUser').html(fnGetUser().showname);
}

//初始化巡查车辆
function fnInitCarList(){
    api.ajax({
        url: fnGetServerAddr() + '/subway/car.do?todo=ajaxQueryEnabledCar',
        method: 'get',
        timeout: 30
    }, function (ret, err) {
        if(ret){
            carList = ret;
        }else{
            fnShowMessage("网络异常")
        }
    });
}

//选择巡查车辆
function fnChooseCar(){
    if(carList){
        var picker = new mui.PopPicker();
        var data = [];
        for (var i = 0; i < carList.length ; i++){
            var car = carList[i];
            data.push({
                value: car.id,
                text: car.carNo
            })
        }
        picker.setData(data);
        picker.show(function (item) {
            carId = item[0].value;
            $('#carNo').html(item[0].text);
        })
    }else{
        api.ajax({
            url: fnGetServerAddr() + '/subway/car.do?todo=ajaxQueryEnabledCar',
            method: 'get',
            timeout: 30
        }, function (ret, err) {
            if(ret){
                carList = ret;
                var picker = new mui.PopPicker();
                var data = [];
                for (var i = 0; i < carList.length ; i++){
                    var car = carList[i];
                    data.push({
                        value: car.id,
                        text: car.carNo
                    })
                }
                picker.setData(data);
                picker.show(function (item) {
                    carId = item[0].value;
                    $('#carNo').html(item[0].text);
                })
            }else{
                fnShowMessage("网络异常")
            }
        });
    }
}

//获取web端的今日日常巡查列表
function fnInitDailyTask(){
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/dailyTask.do?todo=queryDailyTaskByLine',
        method: 'get',
        data: {
            values: {
                executeUserId:getUserId(),
                inspectTime:fnGetTodayStr('-')
            }
        }
    },function(ret, err){
        if (ret) {
            if(ret.status){
                dailyTasks = ret.data;
                $("#taskContentDT").append(doT.template($api.byId('dailyTaskTemplate').innerHTML)(ret.data))
            }else{
                fnShowMessage(ret.msg);
            }
        }
    });
}
//获取web端的今日异常巡查列表
function fnInitUnusualTask(){
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/unusualTask.do?todo=queryUnusualTaskByLine',
        method: 'get',
        data: {
            values: {
                inspectTime:fnGetTodayStr('-'),
                executeUserId:$api.getStorage('user').userId
            }
        }
    },function(ret, err){
        fnHideProgress();
        $('.mui-content').show();
        if (ret) {
            if(ret.status){
                unusualTasks = ret.data;
                $("#taskContentUT").append(doT.template($api.byId('unusualTaskTemplate').innerHTML)(ret.data))
            }else{
                fnShowMessage(ret.msg);
            }
        }
    });
}

//统计昨日未巡查
function fnInitYesterdayCount(){
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/task.do?todo=queryTodayInspectTask',
        method: 'get',
        timeout:10,
        data: {
            values: {
                isYesterday:"true",
                executeUser:executeUser,
                inspectTime:fnGetYesterdayStr('-')
            }
        }
    },function(ret, err){
        if(ret){
            if(ret.length > 0){
                var count = 0;
                for (var i = 0; i < ret.length; i++) {
                    var line = ret[i];
                    count += ((line.hasOwnProperty('dailyCount') && line.dailyCount > 0 ? line.dailyCount : 0) + (line.hasOwnProperty('unusualCount') && line.unusualCount > 0 ? line.unusualCount : 0));
                }
                $('#yesterdayCount').html(count);
            }
        }
    })
}
//打开巡查人员列表
function fnChooseUser() {
    var pageName = 'user-list';
    var title = '巡查人员选择';
    var leftIcons = 'icon-arrow-left,event-back';
    var rightIcons = 'icon-btn-check';
    var pageObj = {
        title: title,
        frameName: pageName,
        frameUrl: './frame/common/user/' + pageName + '.html',
        leftIcons: leftIcons,
        frontFrame: api.frameName,
        rightIcons: rightIcons,
        attendances:attendances,
        events: ['fnReadyKeyBinding("icon-btn-check","fnSave()")']
    };
    fnOpenCommonWin(pageName, pageObj);
}
//初始化出席人员
function fnInitAttendanceUser(users) {
    $('#attendance').empty();
    attendances = $api.strToJson(users);
    if (attendances && attendances.length > 0) {
        var appendStr = '';
        for (var i = 0; i < attendances.length; i++) {
            appendStr += doT.template($api.byId('attendanceTemplate').innerHTML)({
                id: attendances[i].id,
                name: attendances[i].name
            });
        }
        $('#attendance').append(appendStr);
    }
}
//删除巡查人员
function fnDeleteUser(id, _this) {
    if (attendances) {
        for (var i = 0; i < attendances.length; i++) {
            if (id == attendances[i].id) {
                attendances.splice(i, 1);
            }
        }
    }
    $(_this).remove();
}
//根据任务id查找异常点明细
function fnOpenUnusualSituation(taskId,lineId){
    var pageName = 'unusual-for-inspect';
    var title = '待巡查异常点';
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        taskId:taskId,
        lineId:lineId,
        title: title,
        frameName: pageName,
        frameUrl: './frame/today/unusual/' + pageName + '.html',
        leftIcons: leftIcons,
    };
    fnOpenCommonWin(pageName, pageObj);
}

//打开昨日未完成巡查点位
function fnOpenYesterday(_this){
    var count = $(_this).find('.mui-badge').html();
    if(!count || count == 0){
        fnShowMessage('昨日无未完成巡查点位');
        return;
    }
    var pageName = 'yesterday-uninspect';
    var title = '昨日未巡查点位';
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title: title,
        frameName: pageName,
        frameUrl: './frame/today/yesterday/' + pageName + '.html',
        leftIcons: leftIcons,
        bounces: false
    };
    fnOpenCommonWin(pageName, pageObj);
}

//开始巡查
function fnStartInspect(){
    var inspectUser = [];
    if(attendances){
        for (var i = 0; i < attendances.length; i++) {
         inspectUser.push(attendances[i].name)
        }
    }
    if(!carId){
        fnShowMessage('请选择巡查车辆');
        return;
    }
     if(inspectUser.length == 0){
         fnShowMessage('请选择出勤人员');
         return;
     }

     fnShowProgress('正在保存出勤人员信息');
     api.ajax({
        url: fnGetServerAddr() + '/apicloud/attendance.do?todo=saveAttendanceForApp',
        method: 'post',
        data: {
            values: {
                carId: carId,
                userId: fnGetUser().userId,
                inspectUser:inspectUser.join(',')
            }
        }
     },function(ret, err){
        if (ret && ret.status) {
            api.ajax({
                url: fnGetServerAddr () + '/apicloud/task.do?todo=updateTaskStatusForApp',
                method: 'post',
                data: {
                    values: {
                        inspectSituation:1, //开始巡查状态
                        executeUser:getUserId(),
                        attendanceId:ret.attendanceId,
                        inspectTime:fnGetTodayStr('-')
                    }
                }
            },function(ret, err){
                fnHideProgress();
                if (ret) {
                    fnOpenTodayInspectPoint();
                }
            });
        }
    });

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
        animation:{
            type: 'movein',
            subType:'from_right',
            duration:300
        }
    });

    setTimeout(function(){
        api.closeWin({
            name: api.winName
        });
    },1000)
}
