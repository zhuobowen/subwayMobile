/**
操作地图的工具类
*/
var aMap,aMapLBS;
var subWayLinePointsIds = [],subWayStationPointsIds = [] ,protectPointsIds = [];
var lineFlag,stationFlag,protectFlag;

function fnInitMap(){
    aMap = api.require('aMap');
    aMapLBS = api.require('aMapLBS');
}
//初始化地图属性
function fnInitMapAttr(){
    aMap.setMapAttr({
        type: 'standard',
        trafficOn: false,
        zoomEnable: true,
        scrollEnable: true,
        building: false,
        overlookEnabled: false,
        rotateEnabled: false
    });
    fnHideCompass();         //关闭指南针
    fnHideScaleBar();        //关闭比例尺
}
function fnOpenMap(rect) {
    setTimeout(function(){
        var center = $api.getStorage('current_location');
        if(!center){
            fnShowMessage('请开启定位');
            return;
        }
        aMap.open({
            rect: rect,
            showUserLocation: true,
            zoomLevel: 15.8,
            center:{
                lon: center.lon,
                lat: center.lat
            },
            fixedOn: api.frameName,
            fixed: true
        },
        function(ret, err) {
            fnInitMapAttr(); //初始化地图属性
            if(isExitsFunction('fnOpenMapCallBack')){
                fnOpenMapCallBack();
            }
        });
    },500)
}

//描绘点位
function fnInitPoints(){
    fnRemoveOverlay(protectPointsIds);
    fnRemoveOverlay(subWayStationPointsIds);
    fnRemoveOverlay(subWayLinePointsIds);
    if(api.systemType == 'ios'){
        fnAddIOSEventListener();
    }else{
        fnAddAndroidListener();
    }
}

//添加监听事件
function fnAddIOSEventListener(){
    fnInitLinePoints();            //显示地铁线路
    aMap.addEventListener({
        name: 'zoom'
    }, function(ret) {
        if (ret.status) {
            if(ret.zoom >= 16){
                if(!protectFlag){
                    fnInitProtectPoints();            //显示地铁保护区
                }
            }else{
                fnRemoveOverlay(protectPointsIds);
                protectFlag = false;
                protectPointsIds = [];
            }

            if(ret.zoom >= 17){
                aMap.getCenter(function(ret, err) {
                    if (ret) {
                        if(!stationFlag){
                            fnInitStationPoint(ret.lat,ret.lon)
                        }
                    }
                });

                //层级>=17时新增拖动地图监听
                aMap.addEventListener({
                    name: 'viewChange'
                }, function(ret) {
                    if (ret.status) {
                        //fnRemoveOverlay(subWayStationPointsIds);
                        stationFlag = false;
                        aMap.getCenter(function(ret, err) {
                            if (ret) {
                                if(!stationFlag){
                                    fnInitStationPoint(ret.lat,ret.lon)
                                }
                            }
                        });
                    }
                });
            }else{
                //移除拖动地图监听
                aMap.removeEventListener({
                    name: 'viewChange'
                });
                fnRemoveOverlay(subWayStationPointsIds);
                stationFlag = false;
                subWayStationPointsIds = [];
            }
        }
    });
}
//添加安卓地图展示
function fnAddAndroidListener(){
    fnInitLinePoints();            //显示地铁线路
    aMap.addEventListener({
        name: 'viewChange'
    }, function(ret) {
        if (ret.status) {
            if(ret.zoom >= 16){
                if(!protectFlag){
                    fnInitProtectPoints();            //显示地铁保护区
                }
            }else{
                fnRemoveOverlay(protectPointsIds);
                protectFlag = false;
                protectPointsIds = [];
            }
            if(ret.zoom >= 17){
                //fnRemoveOverlay(subWayStationPointsIds);
                stationFlag = false;
                aMap.getCenter(function(ret, err) {
                    if (ret) {
                        if(!stationFlag){
                            fnInitStationPoint(ret.lat,ret.lon)
                        }
                    }
                });
            }else{
                fnRemoveOverlay(subWayStationPointsIds);
                stationFlag = false;
                subWayStationPointsIds = [];
            }
        }
    });
}

//初始化地图的地铁保护区、站点、区域
function fnInitLinePoints() {
    lineFlag = true;
    var Lines = fnGetLine();
    var selectedLines = $api.getStorage('selectedLines');
    if(!selectedLines){
        selectedLines = [];
        for (var lineId in Lines) {
            selectedLines.push(lineId);
        }
    }
    for (var i = 0; i < selectedLines.length; i++) {
        var lineId = selectedLines[i] + "";
        var points;
        if(Lines && Lines.hasOwnProperty(lineId)){
            points = Lines[lineId].points;
        }
        $.each(points,function(i, point) {
            var subWayLinePoints = new Array();
            subWayLinePointsId = Math.random();
            subWayLinePointsIds.push(subWayLinePointsId)
            if (point.linePoints != '' && point.linePoints != null) {
                var lineList = point.linePoints.split('|');
                $.each(lineList,function(j, line) {
                    var latlng = line.split(',');
                    subWayLinePoints.push({
                        lon: Number(latlng[0]),
                        lat: Number(latlng[1])
                    });
                });
            }
            var borderWidth = 1;
            if(api.systemType != 'ios'){
                borderWidth = 4;
            }
            if (subWayLinePoints.length > 0) {
                subWayLinePoints.push(subWayLinePoints[0]);
                aMap.addLine({
                    id: subWayLinePointsId,
                    styles: {
                        borderColor: '#00FF00',
                        borderWidth: borderWidth,
                        lineDash: false
                    },
                    points: subWayLinePoints
                });
            }
        })
    }
}

//初始化站点
function fnInitStationPoint(lat,lon){
    if(subWayStationPointsIds.length > 0){
        return;
    }
    var Lines = fnGetLine();
    var selectedLines = $api.getStorage('selectedLines');
    if(!selectedLines){
        selectedLines = [];
        for (var lineId in Lines) {
            selectedLines.push(lineId);
        }
    }
    for (var i = 0; i < selectedLines.length; i++) {
        var lineId = selectedLines[i]  + "" ;
        var points;
        if(Lines && Lines && Lines.hasOwnProperty(lineId)){
            points = Lines[lineId].points;
        }
        $.each(points,function(i, point) {
            var subWayStationPoints = new Array();
            subWayStationPointsId = Math.random();
            subWayStationPointsIds.push(subWayStationPointsId);
            if (point.stationPoints != '') {
                var stationList = point.stationPoints.split('|');
                $.each(stationList,function(j, station) {
                    var latlng = station.split(',');
                    if(fnDistance(lat,lon,Number(latlng[1]),Number(latlng[0]))<=1000){//描绘中心点半径为500米内的点
                        subWayStationPoints.push({
                            lon: Number(latlng[0]),
                            lat: Number(latlng[1])
                        });
                    }
                });
            }
            var borderWidth = 1;
            if(api.systemType != 'ios'){
                borderWidth = 4;
            }
            if (subWayStationPoints.length > 0) {
                subWayStationPoints.push(subWayStationPoints[0]);
                aMap.addLine({
                    id: subWayStationPointsId,
                    styles: {
                        borderColor: '#0000FF',
                        borderWidth: borderWidth,
                        lineDash: false
                    },
                    points: subWayStationPoints
                });
            }
        })
    }
}

//初始化地铁保护区
function fnInitProtectPoints(){
    protectFlag = true;
    var Lines = fnGetLine();
    var selectedLines = $api.getStorage('selectedLines');
    if(!selectedLines){
        selectedLines = [];
        for (var lineId in Lines) {
            selectedLines.push(lineId);
        }

    }
    for (var i = 0; i < selectedLines.length; i++) {
        var lineId = selectedLines[i]  + "" ;
        var points;
        if(Lines.hasOwnProperty(lineId)){
            points = Lines[lineId].points;
        }
        $.each(points,function(i, point) {
            var protectPoints = new Array();
            protectPointsId = Math.random();
            protectPointsIds.push(protectPointsId);
            if (point.protectPoints != '') {
                var projectList = point.protectPoints.split('|');
                $.each(projectList,function(j, project) {
                    var latlng = project.split(',');
                    protectPoints.push({
                        lon: Number(latlng[0]),
                        lat: Number(latlng[1])
                    });
                });
            }
            var borderWidth = 1;
            if(api.systemType != 'ios'){
                borderWidth = 4;
            }
            if (protectPoints.length > 0) {
                protectPoints.push(protectPoints[0]);
                aMap.addLine({
                    id: protectPointsId,
                    styles: {
                        borderColor: '#FF0000',
                        borderWidth: borderWidth,
                        lineDash: false
                    },
                    points: protectPoints
                });
            }
        })
    }
}


//隐藏地铁保护区
function fnRemoveOverlay(ids){
    if(ids){
        aMap.removeOverlay({
            ids: ids
        });
    }
}
//隐藏指南针
function fnHideCompass(){
    aMap.setCompass({
        show: false
    });
}
//隐藏比例尺
function fnHideScaleBar(){
 aMap.setScaleBar({
    show: false
});
}

 //添加标注图片
function fnAddAnnotations(annotations,icons,bubbles,callback,dragging){
    aMap.addAnnotations({
        annotations:annotations,
        icons: icons,
        draggable: true,
    }, function(ret) {
        if (ret.eventType == 'click') {
            if (callback) {
                eval(callback)
            }
        }
        if(ret.dragState == 'ending'){
            if(dragging){
                eval(dragging)
            }
        }
    });
    //设置气泡信息
    for (var i = 0; i < bubbles.length; i++) {
        var id = bubbles[i].id
        aMap.setBubble({
          id: id,
          content: {
              title: bubbles[i].title,
              subTitle: bubbles[i].subTitle,
          },
          styles: {
              titleColor: '#000',
              titleSize: 16,
              subTitleColor: '#999',
              subTitleSize: 12,
              illusAlign: 'left'
          }},
        function(ret) {
            if (ret) {
                //alert(JSON.stringify(ret));
            }
        });
    }
}

//改变显示标记
function fnChangeMarker(markerType, isShow) {
    if (isShow) {
        alert(markerType + '显示');
    } else {
        alert(markerType + '隐藏');
    }
}

//监听视图改变事件
function fnAddViewChangeEventListener() {
    aMap.addEventListener({
        name: 'viewChange'
    },
    function(ret) {
        if (ret.status) {
            api.execScript({
                name: api.winName,
                frameName: 'map-location',
                script: 'fnChangeLocalizationColor();'
            });
        }
    });
}

//地图定位中心位置
function fnGoCenter() {
    var current_location = $api.getStorage('current_location');
    if(current_location){
        aMap.setCenter({
            coords: {
                lon: current_location.lon,
                lat: current_location.lat
            },
            animation: true
        });
    }
}

//缩放地图的方法 value 可传正负数
function fnChangeLevel(value){
    var level;
    aMap.getZoomLevel(function(ret, err) {
        if (ret) {
            level = ret.level;
            aMap.setZoomLevel({
                level: level + value,
                animation: true
            });
        }
    });
}

//移除标记
function fnRemoveAnnotation(ids){
    aMap.removeAnnotations({
        ids: ids
    });
}


//改变地图视图
function fnChangeMapType(mapType){
    aMap.setMapAttr({
        type: mapType
    });
}

//添加多边形
function fnAddPolygon(oldIds,points){
    if(oldIds){
        fnRemoveOverlay(oldIds);
    }
    var random =  (Math.random(1000)*1000).toFixed(0);
    aMap.addPolygon({
        id: random,
        styles: {
            borderColor: '#FF0000',
            borderWidth: 3,
            lineDash:false,
            fillColor:'rgba(0,0,0,0)'
        },
        points: points
    });
    return random;
}

//设置中心点
function fnSetCenter(point){
    aMap.setCenter({
        coords:point,
        animation: true
    });
}

//返回当前最近的坐标  传入坐标获取当前位置最近的站点  isIndex true:返回最近站点的角标
function fnGetCurrentStation(location,returnIndex){
    var distances = [];
    var points = $api.getStorage('StationPoints');//所有的站点信息
    location = location ? location : $api.getStorage('current_location');//当前位置
    for (var i = 0; i < points.length; i++) {
        distances.push(fnDistance(location.lat,location.lon,Number(points[i].point.split(',')[1]),Number(points[i].point.split(',')[0])));
    }
    var result = fnGetMinIndex(distances);
    if(!returnIndex){
        result = points[result];
    }
    return result;
}
/*******************************************打开地图上frame*************************************************/

//打开右侧图标的内容
function fnOpenIconFrame(rect,pageParam) {
    api.openFrame({
        name: 'map-icon',
        url: 'widget://html/frame/map/map-icon.html',
        rect: rect,
        pageParam: pageParam,
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: false,
        hScrollBarEnabled: false
    });
}

//打开右侧异常图标
function fnOpenUnusualFrame(rect) {
    api.openFrame({
        name: 'map-unusual',
        url: 'widget://html/frame/map/map-unusual.html',
        rect: rect,
        pageParam: {
            parentName: api.frameName
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: true,
        hScrollBarEnabled: true
    });
}

//打开右侧异常图标
function fnOpenLineIconFrame(rect) {
    api.openFrame({
        name: 'map-line-icon',
        url: 'widget://html/frame/map/map-line-icon.html',
        rect: rect,
        pageParam: {
            parentName: api.frameName
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: true,
        hScrollBarEnabled: true
    });
}

//打开定位图标层
function fnOpenLocationFrame(rect) {
    api.openFrame({
        name: 'map-location',
        url: 'widget://html/frame/map/map-location.html',
        rect: rect,
        pageParam: {
            parentName: api.frameName
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        animation:{
            type:"fade",
            duration:500
        }
    });
}

//打开导航图标
function fnOpenNavigationFrame(rect) {
    api.openFrame({
        name: 'map-navigation',
        url: 'widget://html/frame/map/map-navigation.html',
        rect: rect,
        hidden:true,
        pageParam: {
            parentName: api.frameName
        },
        bgColor: 'rgba(0,0,0,0)',
        animation:{
            type:"fade",
            duration:600
        }
    });
}

//打开缩放地图图标
function fnOpenLevelFrame(rect) {
    api.openFrame({
        name: 'map-level-sign',
        url: 'widget://html/frame/map/map-level-sign.html',
        rect: rect,
        pageParam: {
            parentName: api.frameName
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        animation:{
            type:"fade",
            duration:500
        }
    });
}

//初始化地图图例和筛选的Frame
function fnInitRightFrame() {
    var frameNames = ['map-filter', 'map-legend'];
    var frames = [];
    for (var i = 0; i < frameNames.length; i++) {
        frames.push({
            name: frameNames[i],
            url: 'widget://html/frame/map/' + frameNames[i] + '.html',
            pageParam: {
                parentName: api.frameName
            },
            animation:{
                type:"push",
                subType:"from_right",
                duration:5500
            }
        })
    }
    api.openFrameGroup({
        name: 'right-frames',
        background: '#fff',
        scrollEnabled: false,
        rect: {
            x: api.frameWidth - 200,
            y: getHeaderHeight(),
            w: 200,
            h: api.winHeight
        },
        index: 0,
        frames: frames
    },
    function(ret, err) {
        if (ret) {}
    });
    api.setFrameGroupAttr({
        name: 'right-frames',
        hidden: true
    });
}

//单独显示显示右侧frame的方法
function fnShowRightFrame(index) {
    api.setFrameGroupAttr({
        name: 'right-frames',
        hidden: false
    });
    api.setFrameGroupIndex({
        name: 'right-frames',
        index: index
    });
}
function fnHiddenRightFrame() {
    api.setFrameGroupAttr({
        name: 'right-frames',
        hidden: true
    });
}

//获取线路点数据
function fnGetLine(){
    var fs = api.require('fs');
    var ret = fs.openSync({
        path: $api.getStorage('root_pointFile'),
        flags: 'read'
    });
    if(ret.status){
        ret = fs.readSync({
            fd: ret.fd,
            offset: 0
        });
        if(ret.status){
            return $api.strToJson(ret.data);
        }
    }
}
