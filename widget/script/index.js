apiready = function () {

    fnInitDB();		   //初始化数据库

    fnOpenDatabase();  //打开数据库并建表

    fnInitMediaPath(); //初始化多媒体存储路径

    fnInitStartPage(); //初始化首页

    fnInitLocation();   //初始化定位

    fnInitServerAddr(); //初始化服务器地址

};

//初始化网络
function fnInitServerAddr() {
    if (!$api.getStorage('serverAddr')){
        $api.setStorage('serverAddr', 'http://117.29.161.2:5389/subway');
    }
}

//初始化定位
function fnInitLocation(){
    var aMap = api.require('aMap');
    var aMapLBS = api.require('aMapLBS');
    var locationTimer = null;
    aMapLBS.configManager({
        accuracy: 'tenMeters',
        filter: 1
    }, function (ret, err) {
        if (ret.status) {
            locationTimer = setInterval(function(){
                aMapLBS.singleLocation({
                    timeout: 10
                }, function(ret, err) {
                    if (ret.status) {
                        aMap.searchNearby({
                            keyword: '商务住宅|道路附属设施|地名地址信息|公共设施',
                            lon: ret.lon,
                            lat: ret.lat,
                            radius: 1000,
                            offset: 1,
                            page: 1,
                            sortrule: 0
                        }, function (rett, err) {
                            if (rett.status) {
                                var current_location = {
                                    lon: ret.lon,
                                    lat: ret.lat,
                                    location: rett.pois[0].name
                                }
                                $api.setStorage('current_location', current_location);
                            }
                        });
                    }
                });
            },5000);

            //应用进入后台
            api.addEventListener({
                name:'pause'
            }, function(ret, err){
                clearInterval(locationTimer);
            });


            //后台进入应用
            api.addEventListener({
                name:'resume'
            }, function(ret, err){
                fnInitLocation();
            });
        }
    });
}

//初始化多媒体文件存储路径
function fnInitMediaPath() {
    var fs = api.require('fs');
    var paths = [
        {
            storeName: 'root_cachePath',
            realPath: api.boxDir + '/subway/cache'
        }, {
            storeName: 'root_imgPath',
            realPath: api.boxDir + '/subway/image'
        }, {
            storeName: 'root_videoPath',
            realPath: api.boxDir + '/subway/video'
        }, {
            storeName: 'root_voicePath',
            realPath: api.boxDir + '/subway/voice'
        }, {
            storeName: 'root_pointFile',
            realPath: 'fs://resource/point.json'
        }
    ];
    for (var i = 0; i < paths.length; i++) {
        var ret = fs.existSync({
            path: paths[i].realPath
        });
        if (!ret.exist && ret.directory) { //如果文件夹不存在，则创建目录
            var rett = fs.createDirSync({
                path: paths[i].realPath
            });
            if (rett) {
                $api.setStorage(paths[i].storeName, paths[i].realPath);
            }
        }else if(!ret.directory){
        	$api.setStorage(paths[i].storeName, paths[i].realPath);
        }
    }
}


//打开登录页面
function fnInitStartPage() {
    if (!$api.getStorage('user')) {//如果还没有打开登录页面
        api.openWin({
            name: 'login',
            url: './html/login.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            },
            bounces: false,
            bgColor: 'rgba(0,0,0,0)',
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
            slidBackEnabled: false
        });
    } else {
        var pageObj = {
            bounces: true,
            title: '厦门地铁保护',//新窗口标题
            frameName: 'main',//子页面名称
            frameUrl: './main.html',//页面路径
            rightIcons: 'icon-exist,event-exist',//右边字体图标，多种样式可以用逗号，隔开
            events: ['fnReadyKeyBinding("event-exist","fnExist()")']//绑定事件，方法名称fnReadyKeyBinding()，参数1：样式名称，参数2：子页面的方法
        };
        fnOpenCommonWin('main', pageObj)
    }
}
