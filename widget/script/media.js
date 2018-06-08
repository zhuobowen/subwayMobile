var fs, //文件操作
    audio, //录音
    imageBrowser, //照片浏览器
    aMap, //高德地图
    aMapLBS, //高德地图定位
    FNPhotograph, //调动摄像头拍照的模块
    pictureWatermark; //水印模块
var imageUrls = []; //图片列表
var videoUrls = []; //视频列表
var voicePath = '';
var container; //容器
var operator; //操作符;

//初始化模块
function fnInitModule() {
    fs = api.require('fs');
    audio = api.require('audio');
    aMap = api.require('aMap');
    aMapLBS = api.require('aMapLBS');
	imageBrowser = api.require('imageBrowser');
	FNPhotograph = api.require('FNPhotograph');
	pictureWatermark = api.require('pictureWatermark');
}
//开始录制视频
function fnStartVideoRecord(ele) {
	svideo.start(callBack);
	function callBack(ret) {
        var random = fnGetUUID(); //uuid
        var today = fnGetTodayStr()
        var root_videoPath = $api.getStorage('root_videoPath') + '/' + today;
        var root_imgPath = $api.getStorage('root_imgPath') + '/' + today;
        var videoPath = ret.video;
        var imagePath = ret.image;
        var newImagePath = root_imgPath + imagePath.substring(imagePath.lastIndexOf('/'), imagePath.length);
        var newVideoPath = root_videoPath + videoPath.substring(videoPath.lastIndexOf('/'), videoPath.length);
        fnCheckExist(newImagePath);
        fnCheckExist(newVideoPath);
        fs.moveTo({
        	oldPath: imagePath,
        	newPath: root_imgPath
        }, function(ret, err) {
        	if (ret.status) {
        		fs.moveTo({
        			oldPath: videoPath,
        			newPath: root_videoPath
        		}, function(ret, err) {
        			if (ret.status) {
        				var oldImagePath = newImagePath;
        				var oldVideoPath = newVideoPath;
        				newImagePath = newImagePath.substring(0, newImagePath.lastIndexOf('/') + 1) + random +
        				newImagePath.substring(newImagePath.lastIndexOf('.'), newImagePath.length);
        				newVideoPath = newVideoPath.substring(0, newVideoPath.lastIndexOf('/') + 1) + random +
        				newVideoPath.substring(newVideoPath.lastIndexOf('.'), newVideoPath.length);
        				fs.renameSync({
        					oldPath: oldImagePath,
        					newPath: newImagePath
        				});
        				fs.renameSync({
        					oldPath: oldVideoPath,
        					newPath: newVideoPath
        				});
        				eval(ele + '.push(\''+newVideoPath+'\')');
        				fnAddVideToEle(newImagePath,newVideoPath,ele);
                        //判断是否有回调
                        if (isExitsFunction('fnVideoCallBack')) {
                            fnVideoCallBack(newImagePath,newVideoPath,ele); //调用回调
                        }
                    }
                });

        	} else {
        		api.alert({
        			title: '提示',
        			msg: '视频获取失败，请重试!'
        		}, function(ret, err) {});
        	}
            //禁止屏幕休眠
            api.setKeepScreenOn({
            	keepOn: true
            });
        });
    }
}

function fnAddVideToEle(newImagePath,newVideoPath,ele){
	var video = '<div class="mui-media-object mui-pull-left my-img">' +
	'<img class="mui-image" videoUrl="' + newVideoPath + '" src="' + newImagePath + '" alt="" style="border: 1px solid #cccccc;border-radius: 2px;">' +
	'<span class="mui-icon iconfont icon-play-video my-paly-video" style="position: absolute;left: 12px; top:8px;color: #cdcdcd;font-size: 50px;" onclick="fnStartVideo(\''+ele+'\',this);"></span>' +
	'<span class="mui-icon mui-icon-close-filled my-del" onclick="fnDelVideo(\''+ele+'\',this)" style="position: absolute;top:-10px;right:-10px;color: red;"></span>' +
	'</div>';
	$('#'+ele).append($(video));
}

//播放视频
function fnStartVideo(ele,_this) {
	var videoUrl = $(_this).prev().attr('videoUrl');
	api.openVideo({
		url: videoUrl
	});
}

/**
	检查文件是否存在，如果存在就删除
*/
function fnCheckExist(path) {
	fs.exist({
		path: path
	}, function(ret, err) {
		if (ret.exist) {
			fs.removeSync({
				path: path
			});
		}
	});
}

//获取视频
function fnGetVideo(ele,iconPath){
    api.getPicture({
        sourceType:'camera',
        encodingType: 'jpg',
        mediaValue:'video',
        destinationType: 'url',
        videoQuality: 'medium',
        saveToPhotoAlbum: false
    },function(ret,err){
        if (ret) {
            if(ret.data!=''){
                var videoPath = ret.data;
                eval(ele + '.push(\''+videoPath+'\')');
                var video = '<span class="my-image" style="height:75px;">'+
                                '<img class="mui-media-object mui-pull-left" videoPath="'+videoPath+'" tapmode onclick="fnShowVideo(this);" src="'+iconPath+'">'+
                                '<a class="mui-icon iconfont icon-image-delete" tapmode onclick="fnDelVideo(\''+ele+'\',this)"></a>'+
                            '</span>';
                $('#' + ele).append($(video));
                api.parseTapmode();
                //判断是否有回调
                if (isExitsFunction('fnVideoCallBack')) {
                    fnVideoCallBack(videoPath,ele);return;//调用回调
                }
            }
        }
        //禁止屏幕休眠
        api.setKeepScreenOn({ keepOn: true });
    });
}

//播放视频
function fnShowVideo(_this){
    var videoPath = $(_this).attr('videoPath');
    if(videoPath && videoPath.indexOf('annexId') > -1){
//      api.showProgress({
//          style: 'default',
//          animationType: 'fade',
//          title: '努力加载中...',
//          modal: true
//      });
//      api.download({
//          url: videoPath,
//          report: false,
//          cache: true,
//          allowResume: false
//      }, function(ret, err) {
//          if (ret.state == 1) {
//              api.hideProgress();
//              api.openVideo({
//                  url: ret.savePath
//              });
//          }
//      });
		if(api.systemType != 'ios'){
			api.openVideo({
	            url: videoPath
            });
            return;
		}
		var videoPlayer = api.require('videoPlayer');
		videoPlayer.play({
		    texts: {
		       
		    },
		    styles: {
		        head: {
		            bg: 'rgba(0.5,0.5,0.5,0.7)',
		            height: 44,
		            titleSize: 20,
		            titleColor: '#fff',
		            backSize: 44,
		            backImg: 'fs://img/back.png',
		            setSize: 44,
		            setImg: 'fs://img/set.png'
		        },
		        foot: {
		            bg: 'rgba(0.5,0.5,0.5,0.7)',
		            height: 44,
		            playSize: 44,
		            playImg: 'fs://img/back.png',
		            pauseImg: 'fs://img/back.png',
		            nextSize: 44,
		            nextImg: 'fs://img/back.png',
		            timeSize: 14,
		            timeColor: '#fff',
		            sliderImg: 'fs://img/slder.png',
		            progressColor: '#696969',
		            progressSelected: '#76EE00'
		        }
		    },
		    path: videoPath,
		    autoPlay: true
		}, function(ret, err) {
		    if (ret) {
		        
		    } else {
		        
		    }
		});
    }else if (videoPath) {
        api.openVideo({
            url: videoPath
        });
    }
}

//删除视频
function fnDelVideo(ele,_this,deleteArr){
    videoUrls = eval(ele)
    var videoPath = $(_this).parent().find('img').attr('videoPath');
    var id = $(_this).next().val();
    if(id){//已删除的id
        var tempArr = eval(deleteArr);
        tempArr.push(id);
    }
    var videoIndex = 0;
    for (var i = 0; i < videoUrls.length; i++) {
        if (videoPath == videoUrls[i]) {
            videoUrls.splice(i, 1);
        }
    }
    if (videoPath) {
        //删除本地缓存照片
        fs.remove({
            path: videoPath
        }, function(ret, err) {
            $(_this).parent().remove();
            api.toast({
                msg: '删除成功',
                duration: 1000,
                location: 'bottom'
            });
        });
    }
}


//查看照片
function fnShowImg(urlArr,_this) {
    imageUrls = eval(urlArr);
    if(imageUrls && imageUrls.length>0){
        var imagePath = $(_this).attr('src');
        var imgIndex = 0;
        for (var i = 0; i < imageUrls.length; i++) {
            if (imagePath == imageUrls[i]) {
                imgIndex = i;
            }
        }
        imageBrowser.openImages({
            imageUrls: imageUrls,
            showList: false,
            activeIndex: imgIndex
        });
    }
}
//删除照片
function fnDelImg(urlArr,_this,deleteArr) {
    imageUrls = eval(urlArr)
    var imagePath = $(_this).prev().attr('src');
    var id = $(_this).next().val();

    if(id){//已删除的id
        var tempArr = eval(deleteArr);
        tempArr.push(id);
    }
    for (var i = 0; i < imageUrls.length; i++) {
        if (imagePath == imageUrls[i]) {
            imageUrls.splice(i, 1);
        }
    }
    if (imagePath) {
        //删除本地缓存照片
        fs.remove({
            path: imagePath
        }, function(ret, err) {
            $(_this).parent().remove();
            api.toast({
                msg: '删除成功',
                duration: 1000,
                location: 'bottom'
            });
        });
    }
}
