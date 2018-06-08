mui.init();
apiready = function() {
    api.parseTapmode();
    fnRefreshDailyTask();
};
//刷新列表
function fnRefreshDailyTask(){
    fnRefreshHeader('fnGetDailyInspectList',true);//设置下拉刷新
}
//获取web端的今日日常巡查列表
function fnGetDailyInspectList(){
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/dailyTask.do?todo=queryDailyTaskForApp',
        method: 'get',
        data: {
            values: { 
                executeUserId:$api.getStorage('user').userId
            }
        }
    },function(ret, err){
        api.refreshHeaderLoadDone();//结束刷新
        if (ret) { 
            if(ret.status){
                $('#dailyTask').html('');
                $("#dailyTask").append(doT.template($api.byId('template').innerHTML)(ret.data))
                if($("#dailyTask").find('.mui-card').length == 0){
                    $("#dailyTask").append(doT.template($api.byId('empty').innerHTML)());
                }
            }else{
                fnShowMessage(ret.msg);
            }
        }else{
            fnShowMessage(err);
        }
    });
}
//根据id查询巡查任务
function fnFindDailyTaskById(id,datas){
    for(var i = 0; i < datas.length ; i++){
        if(id && id == datas[i].id){
            return datas[i];
        }
    }
}
//打开下一个窗口
function fnOpenWin(id,title,pageName) {
    var pageObj = {
        id:id,
        title:title,
        rightIcons:'',
        frameName:pageName,
        leftIcons:'icon-arrow-left,event-back',
        frameUrl:'./frame/daily/' + pageName + '.html'
    };
    fnOpenCommonWin(pageName,pageObj);
}

