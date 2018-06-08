mui.init();
var levelPicker;
var unusualRecord;         //异常录音
var unusualPics = [];      //异常照片
var unusualVideos = [];    //异常视频

var unusualPicIds = []    //照片回显id集合
var deletePicIds = [];    //已删除的照片Id集合
var unusualVideoIds = []; //视频回显id集合
var deleteVideoIds = []   //已删除的照片Id集合
var levelList = [];       //异常等级列表

apiready = function(){
    fnInitDB();
    fnInitModule();
    fnInitLevelList();
    fnChangeLocationListener();
}

//位置改变后的监听事件
function fnChangeLocationListener(){
    api.addEventListener({
        name: 'location-changed'
    }, function(ret, err) {
        if(ret.value){
          var location = ret.value;
          $('#location').html(location.location);
          $('#latLng').html(location.lon + ',' + location.lat);
          $('#myform').find('input[name=location]').val(location.location);
        }
    });
}

/*
初始化异常等级
*/
function fnInitLevelList(){
    levelPicker = new mui.PopPicker();
    api.ajax({
        url: fnGetServerAddr() + '/subway/unusualLevel.do?todo=ajaxQueryList',
        method: 'get',
        data: {}
    },function(ret, err){
        for (var i = 0; i < ret.length; i++) {
            levelList.push({
                value:ret[i].id,
                text:ret[i].name
            });
        }
        levelPicker.setData(levelList);
        fnInitData();
    })
}


//初始化数据
function fnInitData(){
    var id = api.pageParam.id;
    if(!id){ //新增页面
        fnInitStation();
        fnInitEmphasis();
        fnInitPicAndVideo();
        fnInitTypeAndLevel();
    }else{//编辑页面
        api.ajax({
            url: fnGetServerAddr() + '/apicloud/unusualSituation.do?todo=getUnusualSituationForApp',
            method: 'get',
            data: {
                values: {
                    id: id
                }
            }
        },function(ret, err){
            if (ret) {
                fnInitStation(ret);
                fnInitEmphasis(ret);
                fnInitPicAndVideo(ret);
                fnInitTypeAndLevel(ret);
                $('#myform').find('input[name=id]').val(ret.id);
                $('#myform').find('input[name=area]').val(ret.area);
                $('#myform').find('input[name=girth]').val(ret.girth);
                $('#myform').find('input[name=latLng]').val(ret.latLng);
                $('#myform').find('textarea[name=focus]').val(ret.focus);
                $('#myform').find('input[name=position]').val(ret.position);
                $('#myform').find('textarea[name=unusualDesc]').val(ret.unusualDesc);
            }
        });
    }
}



//显示照片和视频
function fnInitPicAndVideo(unusual){
    if(unusual){
        var pics = unusual.unusualPics;
        var videos = unusual.unusualVideos;
         if(pics){
            var picStr = '';
            for(var i = 0 ; i < pics.split(',').length ; i++){
                var annexId = pics.split(',')[i];
                unusualPicIds.push(annexId);
                var imagePath = fnGetImageUrl(annexId,true,200,200);
                picStr += '<span class="my-image">'+
                            '<img class="mui-media-object mui-pull-left"  onclick="fnShowImage(this);" src="' + imagePath + '">'+
                                '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'unusualPics\',this,\'deletePicIds\')"></a>'+
                                '<input type="hidden" name="unusualPicIds" value="'+annexId+'"/>'+
                            '</span>';
            }
            $('#unusualPics').append(picStr);
        }
        if(videos){
            var videoStr = '';
            for(var i = 0 ; i < videos.split(',').length ; i++){
                var annexId = videos.split(',')[i];
                unusualVideoIds.push(annexId);
                var videoPath = fnGetVideoUrl(annexId);
                videoStr += '<span class="my-image" style="height:75px;">'+
                                '<img class="mui-media-object mui-pull-left" videoPath="'+videoPath+'" tapmode onclick="fnShowVideo(this);" src="../../../../image/video-btn.png">'+
                                '<a class="mui-icon iconfont icon-image-delete" tapmode onclick="fnDelVideo(\'unusualVideos\',this,\'deleteVideoIds\')"></a>'+
                                '<input type="hidden" name="unusualVideoIds" value="'+annexId+'"/>'+
                            '</span>';
            }
            $('#unusualVideos').append(videoStr);
        }
    }else{
        var imgUrls = api.pageParam.imgUrls;
        if(imgUrls && imgUrls.length > 0){
            for (var i = 0; i < imgUrls.length; i++) {
                var imagePath = imgUrls[i].url;
                unusualPics.push(imagePath);
                var image = '<span class="my-image">'+
                                    '<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'unusualPics\',this);" src="' + imagePath + '">'+
                                    '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'unusualPics\',this)"></a>'+
                                '</span>';
                $('#unusualPics').append(image);
            }
        }
    }
}
//初始化站点
function fnInitStation(unusual){
    var lineId,stationId,position,location,html = '';
    if(unusual){ //编辑
        position = unusual.position;
        location = unusual.location;
        lineId = unusual.line.lineId;
        stationId = unusual.station.stationId;
        stationName = unusual.station.stationName;
        html  = fnGetStationStr(stationName,'checked=checked');
    }else{ //新增
        var imgUrls = api.pageParam.imgUrls;
        var stationPoints = $api.getStorage('StationPoints');
        current_location = $api.getStorage('current_location');
        if( current_location ){
            var minIndex = fnGetCurrentStation(current_location,true);
            if(stationPoints[minIndex]){
                var line_id = stationPoints[minIndex].lineId;
                var line_id_2 = stationPoints[minIndex - 1] ? stationPoints[minIndex - 1].lineId : '';
                var line_id_3 = stationPoints[minIndex + 1] ? stationPoints[minIndex + 1].lineId : '';
                //判断前一个站点是否是区间
                if(minIndex!= 0){
                    if(stationPoints[minIndex -1] && stationPoints[minIndex -1].type == "2" && line_id == line_id_2) {
                        html  += fnGetStationStr(stationPoints[minIndex -1].stationName,'');
                    }
                }

                html += fnGetStationStr(stationPoints[minIndex].stationName,'checked=checked');

                //判断后一个站点是否是区间
                if( minIndex != (stationPoints.length -1)){
                    if(stationPoints[minIndex + 1] && stationPoints[minIndex + 1].type == "2" && line_id == line_id_3) {
                        html += fnGetStationStr(stationPoints[minIndex+1].stationName,'');
                    }
                }

                lineId = stationPoints[minIndex].lineId;
                position = current_location.lon + ',' + current_location.lat;
                stationId = stationPoints[minIndex].stationId;
            }
            location = current_location.location || '重新定位';
        }else{
            fnShowMessage('定位失败');
        }
    }
    $('#location').html(location);
    $('#currentStation').append(html);
    $('#myform').find('input[name=lineId]').val(lineId);
    $('#myform').find('input[name=latLng]').val(position);
    $('#myform').find('input[name=location]').val(location);
    $('#myform').find('input[name=stationId]').val(stationId);
}

//初始化异常类型和等级
function fnInitTypeAndLevel(unusual){
    var typeId;
    var typeName;
    var levelId;
    var levelName;
    if(unusual){//编辑页面
        typeId = unusual.unusualType.typeId;
        typeName = unusual.unusualType.typeName;
        levelId = unusual.unusualLevel.levelId;
        levelName = unusual.unusualLevel.levelName;
    }else{//新增页面 初始化类型和等级
        var type = api.pageParam.type;
        typeId = type.typeId;
        typeName = type.typeName;
        levelId = type.levelId;
        levelName = type.levelName;
        for (var i = 0; i < levelList.length; i++) {
            if(levelList[i].value == levelId){
                levelId = levelList[i].value;
                levelName = levelList[i].text;
            }
        }
        if( !levelId || levelId == "0"){
            levelId  = levelList[0].value;
            levelName  = levelList[0].text;
        }
    }
    $('#myform').find('input[name=unusualLevelId]').val(levelId);
    $('#myform').find('span[field=unusualLevelName]').html(levelName);
    $('#myform').find('input[name=unusualTypeId]').val(typeId);
    $('#myform').find('span[field=unusualTypeName]').html(typeName);
}

/*
    改变类型和等级
*/
function changeTypeAndLevel(type){
    var levelId = type.levelId;
    var levelName = type.levelName;
    if(type){
        if(!type.levelId || type.levelId == "0"){
            levelId = levelList[0].value;
            levelName = levelList[0].text;
        }
    }
    $('#myform').find('input[name=unusualLevelId]').val(levelId);
    $('#myform').find('span[field=unusualLevelName]').html(levelName);
    $('#myform').find('input[name=unusualTypeId]').val(type.typeId);
    $('#myform').find('span[field=unusualTypeName]').html(type.typeName);
}
//监听是否重点路段
function fnInitEmphasis(unusual){
    if(unusual && unusual.isEmphasis){
        $('#isEmphasis').addClass('mui-active');
        $('#myform').find('input[name=isEmphasis]').val(isEmphasis);
    }
    document.getElementById('isEmphasis').addEventListener('toggle', function(event) {
        $('#myform').find('input[name=isEmphasis]').val(event.detail.isActive ? '1' : '0')
    });
}

//格式化获取字符串
function fnGetStationStr(stationName,checked){
    return '<li class="mui-table-view-cell mui-indexed-list-item mui-radio">'+
                '<span>' + stationName + '</span><input name="radio" ' + checked + ' type="radio">'+
            '</li>';
}



//获取位置回调
function fnLocationCallBack(locationName){
     $('#location').html(locationName);
     $('#myform').find('input[name=location]').val(locationName)
}

//打开规范标准页面
function fnGoManageAndTechnical(){
	var typeId = $('#myform').find('input[name=unusualTypeId]').val();
	if(!typeId){
		fnShowMessage('请先选择异常类型');
		return;
	}
	var pageName = 'management-standard';
	var pageObj = {
		title:'管理措施及控制技术标准',
		frameName:'management-standard',
		frameUrl:'./frame/today/unusual/management-standard.html',
		leftIcons:'icon-arrow-left,event-back',
		rightIcons:'',
        typeId:typeId
	};
	fnOpenCommonWin(pageName,pageObj)
}

//返回今日巡查地图页面
function fnBackToInspectPoint(){
    api.closeToWin({
        name: 'today-inspect-point-main'
    });
}


//改变面积和点位
function fnChangeGirthAndArea(area,girth,points){
	  $('#myform').find('input[name=area]').val(area);
	  $('#myform').find('input[name=girth]').val(girth);
	  $('#myform').find('input[name=position]').val(points);
    $('#myform').find('span[field=area]').html('面积：' + area +'平方米');
    $('#myform').find('span[field=girth]').html('   周长：' + girth +'米');
    $('#myform').find('span[field=empty]').hide();
}

//选择异常等级
function fnSelectUnusualLevel(){
	levelPicker.show(function(items) {
		$('#myform').find('input[name=unusualLevelId]').val(items[0].value);
		$('#myform').find('span[field=unusualLevelName]').html(items[0].text ? items[0].text : '');
	})
}


//拍照的回调函数
function fnTakePhotoCallBack(imagePath){
    unusualPics.push(imagePath);
    var image = '<span class="my-image">'+
                        '<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'unusualPics\',this);" src="' + imagePath + '">'+
                        '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'unusualPics\',this)"></a>'+
                    '</span>';
    $('#unusualPics').append(image);
}


//保存异常点信息
function fnSave(){
    fnShowProgress();
    var params = fnCheckForm();
    if( params.isValid ){
        var files = {};
        if(unusualPics && unusualPics.length > 0){
            for (var i = 0; i < unusualPics.length; i++) {
                files['unusualPics[' + i + ']'] = unusualPics[i];
            }
        }
        if(unusualVideos && unusualVideos.length > 0){
            for (var i = 0; i < unusualVideos.length; i++) {
                files['unusualVideos[' + i + ']'] = unusualVideos[i];
            }
        }
        if(unusualRecord){
            files['unusualRecord']  = unusualRecord;
        }
        params['unusualPicIds'] = unusualPicIds.join(',');      //原有的照片id集合
        params['unusualVideoIds'] = unusualVideoIds.join(',');  //原有的视频id集合
        params['deletePicIds'] = deletePicIds.join(',');        //删除已上传图片id集合
        params['deleteVideoIds'] = deleteVideoIds.join(',');    //删除已上传视频id集合

        api.ajax({
            url: fnGetServerAddr() + '/apicloud/unusualSituation.do?todo=saveUnusualSituationForApp',
            method: 'post',
            timeout:6,
            data: {
                values: params,
                files: files
            }
        },function(ret, err){
            fnHideProgress();
            if (ret) {
                if(ret.status){
                    for (var i = 0; i < unusualPics.length; i++) {
                        fs.removeSync({ path: unusualPics[i]});
                    }
                    for (var i = 0; i < unusualVideos.length; i++) {
                        fs.removeSync({ path: unusualVideos[i]});
                    }

                    //删除待补记内容
                    if(api.pageParam.unusualKey && api.pageParam.unusualKey != "undefined"){
                        var id = api.pageParam.unusualKey;
                        var photoUrls = fnSelectSync('select * from sw_photo_url pu,sw_unusual_photo up where up.photo_url_id = pu.id and up.unusual_info_id = "' + id + '"');
                        if(photoUrls.status && photoUrls.data.length >　0){
                            for (var i = 0; i < photoUrls.data.length; i++) {
                                var photo = photoUrls.data[i];
                                ret = fnDeleteSync('delete from sw_photo_url where id = "' + photo.id + '"'); //删图片表
                            }
                        }
                        ret = fnDeleteSync('delete from sw_unusual_photo where unusual_info_id = "' + id + '"'); //删中间表
                        ret = fnDeleteSync('delete from sw_unusual_info where id = "' + id + '"');//删主表异常点
                    }
                    var frontWin = $api.getStorage('frontWin');
                    if(frontWin){
                        api.closeToWin({
                            name: frontWin
                        });
                        $api.setStorage('frontWin', '');
                    }else{
                        api.closeToWin({
                            name: api.pageParam.frontWin || 'today-inspect-point-main'
                        });
                    }
                }else{
                    fnShowMessage('保存失败')
                }
            }else{
                fnShowMessage('网络异常')
            }
        });
    }else{
        fnHideProgress();
    }
}

//表单验证
function fnCheckForm(){
    var params = {
        userId : getUserId()
    };
    $('#myform input,#myform textarea').each(function(index,ele){
        var value = $(ele).val();
        var name = $(ele).attr('name');
        var classList = $(ele).attr('class');
        if(classList && classList.indexOf('validatebox') > -1){
            var message = $(ele).attr('msg');
            if( value && value.trim() != ''){
                params['isValid']  = true;
            }else{
                fnShowMessage(message);
                params = {};
                params['isValid']  = false;
                return false;
            }
        }
        params[name] = value;
    })
    return params;
}

//打开异常补记列表
function fnBackToRegisterList(){
    var pageName = 'today-inspect-result-register';
    var title = '异常点补录';
    var leftIcons = 'icon-arrow-left,event-back';
    var pageObj = {
        title: title,
        frameName: pageName,
        frameUrl: 'widget://html/frame/today/result/' + pageName + '.html',
        leftIcons: leftIcons,
        bounces: true
    };
    fnOpenCommonWin(pageName, pageObj);
}
//获取位置
function fnChooseLocation(){
    var pageName = 'unusual-location';
    var events = [];
    var pageObj = {
        title:'异常位置',
        frameName:pageName,
        frameUrl:'widget://html/frame/today/unusual/'+pageName+'.html',
        leftIcons:'icon-arrow-left,event-back',
        bounces:true,
        frontFrame:api.pageParam.frameName
    };
    fnOpenCommonWin(pageName,pageObj);
}


//打开照相机
function fnOpenCamera(picName){
    api.closeWin({
        name: 'camera-main-win'
    });
    api.openWin({
        name: 'camera-main-win',
        url: 'widget://html/frame/common/media/camera-win.html',
        slidBackEnabled:false,
        pageParam: {
            cameraType: 5,
            frontWin: api.winName,
            frontFrame: api.frameName
        }
    });
}


/**
    打开异常点绘制的页面
*/
function fnUnusualDraw(){
    var area = $('#myform').find('input[name=area]').val();
    var girth = $('#myform').find('input[name=girth]').val();
    var points = $('#myform').find('input[name=position]').val();
    var pageName = 'unusual-draw';
    var events = [];
    var pageObj = {
        title:'现场位置绘制',
        frameName:pageName,
        frameUrl:'widget://html/frame/today/unusual/'+pageName+'.html',
        leftIcons:'icon-arrow-left,event-back',
        area:area,
        girth:girth,
        points:points
    };
    fnOpenCommonWin(pageName,pageObj);
}

//选择异常类型
function fnSelectUnusualType(){
    api.closeWin({
        name: 'unusual-type-win'
    });
	var pageName = 'unusual-type';
    var pageObj = {
        title:'异常类型选择',
        frameName:pageName,
        frameUrl:'widget://html/frame/today/unusual/'+ pageName + '.html',
        leftIcons:'icon-arrow-left,event-back',
        selectedMode:true
    };
    fnOpenCommonWin(pageName,pageObj);
}


//获取最小值的角标
function fnGetMinIndex(arr){
    var min = arr[0];
    var len = arr.length;
    var index = 0;
    for (var i = 1; i < len; i++){
        if (arr[i] < min){
            min = arr[i];
        }
    }
    for (var i = 0; i < len; i++) {
        if(min == arr[i]){
            index = i;
        }
    }
    return index;
}
