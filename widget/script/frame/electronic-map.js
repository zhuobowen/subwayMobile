var fs,aMap;
var lst_1 = [] ;
var lst_2 = [];
var lst_3 = [];
var map_1 = {};
var map_2 = {};
var map_3 = {};
var map_4 = {};
var flag = flag_1 = flag_2 = flag_3 = false;
var legendOpened = false;
var id = 0;
var billboard_bg = 'widget://image/map/2.png';
var icon_work = 'widget://image/map/icon-work.png';
var icon_red = 'widget://image/map/location-red-large.png';
var icon_orange = 'widget://image/map/location-orange-large.png';
apiready = function() {
    fnInitData();
    fnInitModule();
    fnAddListener();
    nopicture = fnGetServerAddr() + '/images/nopicture.png';
    fnOpenMap({
        x: 0,
        y: 0,
        w: api.frameWidth,
        h: api.frameHeight
    });
};

//初始化模块
function fnInitModule(){
    fs = api.require('fs');
    aMap = api.require('aMap');
}
//添加监听事件
function fnAddListener(){

    api.addEventListener({
        name:'viewappear'
    }, function(ret, err){
        aMap.show();
    });
    api.addEventListener({
        name:'viewdisappear'
    }, function(ret, err){
        aMap.hide();
    });

    api.addEventListener({
        name:'unusual'
    }, function(ret, err){
        if(ret.value.show){
            fnInitUnusualPoint();
        }else{
            fnHidePoints(1);
        }
    });
    api.addEventListener({
        name:'emphasis'
    }, function(ret, err){
        if(ret.value.show){
            fnInitEmphasisPoint();
        }else{
            fnHidePoints(2);
        }
    });

    api.addEventListener({
        name:'worksite'
    }, function(ret, err){
        if(ret.value.show){
            fnInitWorksitePoint();
        }else{
            fnHidePoints(3);
            var ids = [];
            for(var key in map_4){
                ids.push(key)
            }
            aMap.removeOverlay({
                ids: ids
            });
        }
    });

    //图例显示与否
    api.addEventListener({
        name:'legend'
    }, function(ret, err){
        if(ret.value.show){
            api.openFrame({
                name: 'map-legend',
                url: 'widget://html/frame/map/map-legend.html',
                rect: {
                    x: api.winWidth/2,
                    y: api.winHeight/2,
                    w: api.winWidth / 2,
                    h: api.winHeight/2
                },
                animation:{
                    type:"movein",
                    subType:"from_right",
                    duration:300
                },
                bounces: false
            });
            legendOpened = true;
        }else{
            api.closeFrame({
                name: 'map-legend'
            });
        }
    });
}
function fnHidePoints(type){
    var map = eval('map_'+type);
    var ids = [];
    for(var key in map){
        ids.push(key);
    }
    aMap.removeAnnotations({
        ids: ids
    });
}

function fnInitData(){
    fnInitUnusualPoint();
    fnInitEmphasisPoint();
    fnInitWorksitePoint();
    setTimeout(fnInitPoints,2000);
}

function fnOpenMapCallBack(){
    flag = true;
    if(flag_1 && flag_2 && flag_3){
        fnAddAnnotation();
    }
}

//初始化异常点
function fnInitUnusualPoint(lineIds){
    //查找异常点
    api.ajax({
        url: fnGetServerAddr() + '/subway/unusualSituation.do?todo=queryUnusualSituationForGis',
        method: 'get',
        timeout: 6,
        data: {
            body: {lineIds: lineIds || [], isEmphasis: 0}
        }
    }, function (ret, err) {
        if(ret){
            if(ret.success){
                flag_1 = true;
                //异常点
                for (var i = 0; i < ret.data.length ; i++){
                    var obj = ret.data[i];
                    var latLng = obj.latLng ? obj.latLng.split(','):[];
                    var point = {
                        id: id++,
                        lon: parseFloat(latLng[0]),
                        lat: parseFloat(latLng[1]),
                        pic: obj.unusualPic,
                        oldId : obj.id
                    };
                    lst_1.push(point);
                }
                if(flag && flag_2 && flag_3){
                    fnAddAnnotation();
                }
            }else{
                fnShowMessage(ret.msg || "");
            }
        }else{
            fnShowMessage("数据异常")
        }
    });
}

function fnInitEmphasisPoint(lineIds){
    //查找异常点
    api.ajax({
        url: fnGetServerAddr() + '/subway/unusualSituation.do?todo=queryUnusualSituationForGis',
        method: 'get',
        timeout: 6,
        data: {
            body: {lineIds: lineIds || [], isEmphasis: 1}
        }
    }, function (ret, err) {
        if(ret){
            if(ret.success){
                flag_2 = true;
                for (var i = 0; i < ret.data.length ; i++){
                    var obj = ret.data[i];
                    var latLng = obj.latLng ? obj.latLng.split(','):[];
                    var point = {
                        id: id++,
                        lon: parseFloat(latLng[0]),
                        lat: parseFloat(latLng[1]),
                        pic: obj.unusualPic,
                        oldId : obj.id
                    };
                    lst_2.push(point);
                }
                if(flag && flag_1 && flag_3){
                    fnAddAnnotation();
                }
            }else{
                fnShowMessage(ret.msg || "");
            }
        }else{
            fnShowMessage("数据异常")
        }
    });
}

//初始化监护工点
function fnInitWorksitePoint(lineIds){
    api.ajax({
        url: fnGetServerAddr() + '/subway/worksite.do?todo=queryWorksiteForGis',
        method: 'get',
        timeout: 6,
        data: {
            body: {lineIds: lineIds || []}
        }
    }, function (ret, err) {
        if(ret){
            if(ret.success){
                flag_3 = true;
                for (var i = 0; i < ret.data.length ; i++){
                    var worksite = ret.data[i];
                    var latLng = worksite.latLng;
                    var points = [];
                    var lonSum = 0;
                    var latSum = 0;
                    var lngLats = latLng ? latLng.split(';') : [];
                    for (var m = 0; m < lngLats.length; m++) {
                        var lon = Number(lngLats[m].split(',')[0]);
                        var lat = Number(lngLats[m].split(',')[1]);
                        points.push({
                            lon: lon,
                            lat: lat
                        });
                        lonSum += lon;
                        latSum += lat;
                    }
                    var point = {
                        id: id++,
                        lon: lonSum / points.length,
                        lat: latSum / points.length,
                        oldId: worksite.id,
                        points: points
                    };
                    lst_3.push(point);
                }
                if(flag && flag_1 && flag_2){
                    fnAddAnnotation();
                }
            }else{
                fnShowMessage(ret.msg || "");
            }
        }else{
            fnShowMessage("数据异常")
        }
    });
}

function fnAddAnnotation(){
    for (var i = 0;i < lst_1.length; i++){
        var point = lst_1[i];
        map_1[point.id] = point.oldId;
        fnAddBillboard(point,1);
        aMap.addAnnotations({
            annotations: [point],
            icons: [icon_orange],
            draggable: false
        }, function(ret) {
            if (ret.eventType == 'click') {
                fnOpenWin(map_1[ret.id],'异常情况跟踪','map-unusual-view');
            }
        });
    }

    for (var i = 0;i < lst_2.length; i++){
        var point = lst_2[i];
        map_2[point.id] = point.oldId;
        fnAddBillboard(point,2);
        aMap.addAnnotations({
            annotations: [point],
            icons: [icon_red],
            draggable: false
        }, function(ret) {
            if (ret.eventType == 'click') {
                fnOpenWin(map_2[ret.id],'异常情况跟踪','map-unusual-view');
            }
        });
    }

    for (var i = 0;i < lst_3.length; i++){
        var point = lst_3[i];
        map_3[point.id] = point.oldId;
        aMap.addAnnotations({
            annotations: [point],
            icons: [icon_work],
            draggable: false
        }, function(ret) {
            if (ret.eventType == 'click') {
                fnOpenWin(map_3[ret.id],'工点监护跟踪','map-worksite-view');
            }
        });
        map_4[id++] = point.oldId;
        aMap.addPolygon({
            id: id,
            styles: {
                borderColor: '#0A78D0',
                borderWidth: api.systemType == 'ios' ? 1 : 5,
                lineDash: true,
                fillColor: 'rgba(74, 134, 232, 0.3 )'
            },
            points: point.points
        });
    }
}

//写入插图
function fnAddBillboard(obj,type){
    var illus = obj.pic ? fnGetImageUrl(obj.pic.split(',')[0],200,200) : nopicture;
    if(type == 1){
        map_1[id++]=obj.oldId;
    }else if(type == 2){
        map_2[id++]=obj.oldId;
    }
    aMap.addBillboard({
        id: id,
        draggable: false,
        coords: {
            lon: obj.lon,
            lat: obj.lat
        },
        bgImg:billboard_bg,
        content: {
            illus:illus
        },
        styles: {
            size: {
                width: 50,
                height: 80
            },
            illusRect: {
                x: 3,
                y: 3,
                w: 44,
                h: 44
            },
            marginT: 100
        }
    }, function(ret) {
        if (ret) {
            if(ret.eventType == 'click'){
                var id = 0;
                if(type == 1){
                    id = map_1[ret.id];
                }else if(type == 2){
                    id = map_2[ret.id];
                }
                fnOpenWin(id,'异常情况跟踪','map-unusual-view');
            }
        }
    });
}

//打开窗口
function fnOpenWin(id,title,pageName){
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        id:id,
        title:title,
        frameName:pageName,
        frameUrl:'widget://html/frame/map/page/'+pageName+'.html',
        leftIcons:leftIcons,
        bounces:false
    };
    fnOpenCommonWin(pageName,pageObj);
}

/*
      获取数组指定的元素
    */
Array.prototype.properties = function(propertyName){
    var len = this.length;
    var tempArr = [];
    for (var i = 0; i < len; i++) {
        if(this[i].hasOwnProperty(propertyName)){
            tempArr.push(this[i][propertyName]);
        }
    }
    return tempArr;
}