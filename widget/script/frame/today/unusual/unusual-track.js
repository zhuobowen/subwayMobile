var unusual;
var proofPics = [];     //异常照片
var proofPicIds = []    //照片回显id集合
var deletePicIds = [];  //已删除的照片Id集合
var proofVideos = [];   //异常视频
var proofVideoIds = []; //视频回显id集合
var deleteVideoIds = [] //已删除的照片Id集合
var proofRecord;        //异常录音
var proofRecordId;      //异常录音Id
var trackFlag = false;
var unusualFlag = false;
apiready = function() {
    api.parseTapmode();
    fnInitModule();     //初始化模块
    fnInitDB();         //初始化db
    fnInitImage();      //初始化已经拍的照片
    fnInitUnusual();    //初始化异常点信息
    fnInitTrack();      //初始化跟踪信息
};

//回调
function fnInitStyle(){
    api.parseTapmode();
    api.hideProgress();
    $('.mui-content').show();
}

//初始化异常点信息
function fnInitUnusual(){
    unusual = api.pageParam.unusual;
    if(unusual.situationId && unusual.situationId > 0){
        api.ajax({
            url: fnGetServerAddr() + '/apicloud/unusualSituation.do?todo=getUnusualSituationForApp',
            method: 'get',
            data: {
                values: {
                    id: unusual.situationId
                }
            }
        },function(ret, err){
            unusualFlag = true;
            if (ret) {
                ret['taskId'] = unusual.taskId;
                ret['unusualPic'] = fnGetImageUrl(ret.unusualPic,true,200,200);
                $('#unusual').append(doT.template($api.byId('template').innerHTML)(ret));
                if(trackFlag){
                    fnInitStyle();
                }
            }
        });
    }else{
        unusualFlag = true;
    }
}

//初始化已经拍的照片
function fnInitImage(){
    var imgUrls = api.pageParam.imgUrls;
    if(imgUrls && imgUrls.length > 0){
        for (var i = 0; i < imgUrls.length; i++) {
            var imagePath = imgUrls[i];
            var ret = fs.existSync({
                path: imagePath
            });
            if(ret.exist){
                proofPics.push(imagePath);
                var image = '<span class="my-image">'+
                '<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'proofPics\',this);" src="' + imagePath + '">'+
                    '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'proofPics\',this)"></a>'+
                '</span>';
                $('#proofPics').append(image);
            }
        }
    }
}

//初始化已巡查异常点记录信息
function fnInitTrack() {
    if(unusual && unusual.trackId > 0){
        api.ajax({
            url: fnGetServerAddr() + '/apicloud/unusualTrack.do?todo=getUnusualTrackForApp',
            method: 'get',
            data: {
                values: {
                    id: unusual.trackId
                }
            }
        },
        function(ret, err) {
            trackFlag = true;
            if (ret) {
                var inspectDesc = ret.inspectDesc;          //文字描述
                var proofPic = ret.proofPic;                //照片，逗号隔开
                var proofVideo = ret.proofVideo;            //视频,逗号隔开
                var proofRecord = ret.proofRecord;          //录音，id
                var isdealed = ret.isdealed;                //是否排除隐患
                var isdiscovered = ret.isdiscovered;        //是否发现异常

                //图片回显
                if(proofPic){
                    var proofPicsStr = '';
                    for(var i = 0 ; i < proofPic.split(',').length ; i++){
                        var annexId = proofPic.split(',')[i];
                        var imagePath = fnGetImageUrl(annexId,true,200,200);
                        proofPicsStr += '<span class="my-image">'+
                                        '<img class="mui-media-object mui-pull-left"  onclick="fnShowImage(this);" src="' + imagePath + '">'+
                                        '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'proofPics\',this,\'deletePicIds\')"></a><input type="hidden" name="proofPics" value="'+annexId+'"/>'+
                                        '</span>';
                    }
                    $('#proofPics').append(proofPicsStr);
                }

                if(proofVideo){
                    var proofVideosStr = '';
                    for(var i = 0 ; i < proofVideo.split(',').length ; i++){
                        var annexId = proofVideo.split(',')[i];
                        var videoPath = fnGetVideoUrl(annexId);
                        proofVideosStr += '<span class="my-image" style="height:75px;">'+
                                            '<img class="mui-media-object mui-pull-left" videoPath="'+videoPath+'" tapmode onclick="fnShowVideo(this);" src="../../../../image/video-btn.png">'+
                                            '<a class="mui-icon iconfont icon-image-delete" tapmode onclick="fnDelVideo(\'proofVideos\',this,\'deleteVideoIds\')"></a>'+
                                            '<input type="hidden" name="proofVideos" value="'+annexId+'">'+
                                        '</span>';
                    }
                    $('#proofVideos').append(proofVideosStr);
                }

                api.parseTapmode();

                //录音
                if(proofRecord){
                    $('#myform').find('input[name="proofRecordId"]').val(proofRecord);
                }
                //初始化数据
                $('.plan').removeClass('plan-active');
                $('.plan').eq(isdealed).addClass('plan-active');
                $('.situation').removeClass('situation-active');
                $('.situation').eq(isdiscovered).addClass('situation-active');
                $('#myform').find('input[name=isdealed]').val(isdealed);
                $('#myform').find('input[name=isdiscovered]').val(isdiscovered);
                $('#myform').find('textarea[name=inspectDesc]').html(inspectDesc);

                if(unusualFlag){
                    fnInitStyle();
                }
            }
        });
    }else{
        trackFlag = true;
    }
}

//地图显示定位点
function fnShowLocation(position) {
    alert(position)
}

//改变下一步执行计划
function fnChangePlanStyle(_this, isdealed) {
    $('.plan').removeClass('plan-active');
    $(_this).addClass('plan-active');
    $('#myform').find('input[name=isdealed]').val(isdealed);
}

//改变本次巡查情况
function fnChangeSituationStyle(_this, isdiscovered){
    if(isdiscovered == 0){
        $('#myform').find('textarea[name=inspectDesc]').html('无发现异常情况');
    }else{
        if($('#myform').find('textarea[name=inspectDesc]').html() == '无发现异常情况'){
            $('#myform').find('textarea[name=inspectDesc]').html('');
        }
    }
    $('.situation').removeClass('situation-active');
    $(_this).addClass('situation-active');
    $('#myform').find('input[name=isdiscovered]').val(isdiscovered);
}

//提交表单
function fnSubmit() {
    var userId = fnGetUser().userId;
    var isdealed = $('#myform').find('input[name=isdealed]').val();
    var isdiscovered = $('#myform').find('input[name=isdiscovered]').val();
    var inspectDesc = $('#myform').find('textarea[name=inspectDesc]').val();
    var proofRecordId = $('#myform').find('input[name=proofRecordId]').val();
    var unusualTaskId = $('#myform').find('input[name=unusualTaskId]').val();
    var unusualSituationId = $('#myform').find('input[name=unusualSituationId]').val();

    //回显的照片id
    $('[name=proofPics]').each(function(index,ele){
        if($(ele).val() && $(ele).val() != 0){
            proofPicIds.push($(ele).val());
        }
    });

    //回显的视频id
    $('[name=proofVideos]').each(function(index,ele){
        if($(ele).val() && $(ele).val() != 0){
            proofVideoIds.push($(ele).val());
        }
    });

    var files = {};
    var params = {
        userId: userId,                                  //用户id
        isdealed: isdealed,                              //是否排除隐患
        id:unusual.trackId,                              //跟踪表id
        inspectDesc: inspectDesc,                        //巡查描述
        isdiscovered:isdiscovered,                       //是否发现异常
        proofRecordId:proofRecordId,                     //录音文件id
        unusualTaskId: unusualTaskId,                    //异常任务id
        proofPicIds:proofPicIds.join(','),               //照片id集合
        proofVideoIds:proofVideoIds.join(','),           //视频id集合
        unusualSituationId: unusualSituationId,          //异常点id
        deletePicIds:deletePicIds.join(','),             //删除已上传图片id集合
        deleteVideoIds:deleteVideoIds.join(','),         //删除已上传视频id集合
    };
    if (proofPics && proofPics.length > 0) {
        for (var i = 0; i < proofPics.length; i++) {
            var ret = fs.existSync({
                path: proofPics[i]
            });
            if(ret.exist){
                files['proofPics[' + i + ']'] = proofPics[i];
            }else{
                fnShowMessage('找不到图片：'+proofPics[i]);
                return false;
            }
        }
    }
    if (proofVideos && proofVideos.length > 0) {
        for (var i = 0; i < proofVideos.length; i++) {
            var ret = fs.existSync({
                path: proofVideos[i]
            });
            if(ret.exist){
                files['proofVideos[' + i + ']'] = proofVideos[i];
            }else{
                fnShowMessage('找不到视频：'+proofPics[i]);
                return false;
            }
        }
    }
    files['proofRecord'] = proofRecord;

    fnShowProgress('正在保存');
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/unusualTrack.do?todo=saveUnusualTrackForApp',
        method: 'post',
        data: {
            values: params,
            files: files
        }
    },
    function(ret, err) {
        fnHideProgress();
        if (ret) {
            if(ret.status){
                for (var i = 0; i < proofPics.length; i++) {
                    fs.removeSync({ path: proofPics[i]});
                }
                for (var i = 0; i < proofVideos.length; i++) {
                    fs.removeSync({ path: proofVideos[i]});
                }
                //如果是待补录跳转过来的
                if(api.pageParam.trackKey && api.pageParam.trackKey != "undefined"){
                    var ret = fnSelectSync('select * from sw_unusual_trcak where id = "' + api.pageParam.trackKey + '"');
                    if(ret.status && ret.data.length > 0){
                      var track = ret.data[0];
                      ret = fnDeleteSync('delete from sw_track_photo stp , sw_photo_url spu where stp.photo_url_id = spu.id and unusual_track_id = "' + track.id + '"'); //查找这个异常点所有照片
                      ret = fnDeleteSync('delete from sw_unusual_trcak where id = "' + track.id + '"');
                      ret = fnDeleteSync('delete from sw_unusual_info where id = "' + track.unusual_info_id + '"');
                    }
                }
                api.closeToWin({
                    name: api.pageParam.frontWin || 'today-inspect-point-main'
                });
            }else{
                fnShowMessage('保存失败')
            }
        }else{
            fnShowMessage('网络异常')
        }
    });
}

/**
 * 开始录音
 */
 function fnAddAudio(_this, domName) {
    var speechRecognizer = api.require('speechRecognizer');
    var root_voicePath = $api.getStorage('root_voicePath');
    var audioPath = root_voicePath + '/' + new Date().getTime() + '.mp3';
    var ctype = api.connectionType;
    if (ctype.toLowerCase() == 'unknown' || ctype.toLowerCase() == 'none') {
        api.alert({msg: '请保持网络畅通!'});
        return;
    }
    if ($(_this).hasClass('mui-icon-mic')) {
        $(_this).removeClass('mui-icon-mic');
        $(_this).addClass('mui-icon-micoff');
        showAudioStatus();
        api.startRecord({
            path: audioPath
        });
        speechRecognizer.record({
            rate: 16000,
            asrptt: 1
        }, function (ret, err) {
            if (ret.status) {
                var wordStr = ret.wordStr;
                if (wordStr.substring(wordStr.length - 1, wordStr.length) == '。') {
                    hideAudioStatus();
                    $("textarea[name='" + domName + "']").val(wordStr);
                }
                $(_this).removeClass('mui-icon-micoff');
                $(_this).addClass('mui-icon-mic');
                $('#loader_audio').hide();
                $(_this).show();
            } else {
                var fs = api.require('fs');
                var ret = fs.removeSync({
                    path: audioPath
                });
                api.alert({msg: '识别失败,您可能没有说话哦,请重试!'});
                hideAudioStatus();
                $(_this).removeClass('mui-icon-micoff');
                $(_this).addClass('mui-icon-mic');
                $('#loader_audio').hide();
                $(_this).show();
            }
        });
    } else if ($(_this).hasClass('mui-icon-micoff')) {
        $(_this).removeClass('mui-icon-micoff');
        hideAudioStatus();
        speechRecognizer.stopRecord();
        $('#loader_audio').show();
        $(_this).hide();
    }
}

/**
 * 显示录音窗口
 */
 function showAudioStatus(){
    $('#audioRecord').show();
    $('#audioRecord').css('top',api.winHeight/2 - 50);
    $('#audioRecord').css('left',api.winWidth/2 - 50);
    $('#audioTime_div span').html('00');
    var sec = 0;var min = 0;
    audioTimer = window.setInterval(function(){
        sec++;
        if(sec%60==0)
            sec=0;
        if(sec<10)
            $('#span_sec').html('0'+sec);
        else
            $('#span_sec').html(sec);
        if(sec%60==0)
            min++;
        if(min<10)
            $('#span_min').html('0'+ min);
        else
            $('#span_min').html(min);
    }, 1000);
}

/**
 * 关闭录音窗口
 */
 function hideAudioStatus(){
    api.stopRecord(function(ret, err){
        if(ret){
           var path = ret.path;
           var duration = ret.duration;
           proofRecord = path;
       }
   });
    $('#audioRecord').hide();
    window.clearInterval(audioTimer);
}

//返回今日巡查地图页面
function fnBackToInspectPoint() {
    api.closeToWin({
        name: api.pageParam.frontWin
    });
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

//拍照的回调函数
function fnTakePhotoCallBack(imagePath){
    proofPics.push(imagePath);
    var image = '<span class="my-image">'+
                    '<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'proofPics\',this);" src="' + imagePath + '">'+
                '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelImg(\'proofPics\',this)"></a>'+
                '</span>';
    $('#proofPics').append(image);
}
/**
 * 根据属性删除数组元素
 * @param prop 属性名，例如：“id”
 * @param value 属性值，例如：1
 * @param isSingle 是否删除一个就结束了
 */
Array.prototype.removeByProperty = function(prop, value, isSingle) {
    var count = 0;  //移除的数量
    var tmpObj;
    for (var i = 0; i < this.length; i++) {
        tmpObj = this[i];
        if ((prop in tmpObj) && tmpObj[prop] == value) {
            count++;
            this.splice(i--, 1);
            if (isSingle) return count;
        }
    }
    return count;
}
