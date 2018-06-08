var leftImgs = []; //左侧照片数组
var rightImgs = []; //右侧照片数组
var delLeftPicIds = []; //左侧照片删除id集合
var delRightPicIds = []; //右侧照片删除id集合
var lon, lat, taskId, userId, lineId, stationId, detailId, stationName, index, dot, lOr;
var leftPoints = [];
var rightPoints = [];
apiready = function() {
    api.parseTapmode();
    fnInitModule(); //初始化模块
    fnClearPage(); //清空表单数据
    fnInitData(); //初始化数据
};

function fnInitData() {
    var daily = api.pageParam.daily;
    userId = fnGetUser().userId;
    lon = daily.lon;
    lat = daily.lat;
    taskId = daily.taskId;
    detailId = daily.detailId;
    stationId = daily.stationId;
    stationName = daily.stationName;
    $('.station').html(stationName);
    if (detailId && detailId > 0) { //编辑页面
        fnShowProgress();
        api.ajax({
            url: fnGetServerAddr() + '/apicloud/dailyTaskDetail.do?todo=getDailyTaskDetail',
            method: 'get',
            data: {
                values: {
                    id: detailId
                }
            }
        }, function(ret, err) {
            fnHideProgress();
            if (ret) {
                var leftAppendStr = '';
                var rightAppendStr = '';
                var leftPics = ret.leftPic ? ret.leftPic.split(',') : [];
                var rightPics = ret.rightPic ? ret.rightPic.split(',') : [];
                leftPoints = ret.leftPoint ? ret.leftPoint.split('|') : [];
                rightPoints = ret.rightPoint ? ret.rightPoint.split('|') : [];
                var data;
                for (var i = 0; i < leftPics.length; i++) {
                    var imagePath = fnGetImageUrl(leftPics[i],true,100,100);
										leftImgs.push(imagePath);
                    leftAppendStr += (doT.template($api.byId('imgTemplate').innerHTML)({
                        id: leftPics[i],
                        picName: 'leftPics',
                        imagePath: imagePath,
                        delFunction: 'fnDelDailyImg(\'leftImgs\',this,\'delLeftPicIds\')',
                        showFunction: 'fnShowImage(this)'
                    }));
                }
                for (var i = 0; i < rightPics.length; i++) {
                    var imagePath = fnGetImageUrl(rightPics[i],true,100,100);
										rightImgs.push(imagePath);
                    rightAppendStr += (doT.template($api.byId('imgTemplate').innerHTML)({
                        id: rightPics[i],
                        picName: 'rightPics',
                        imagePath: imagePath,
                        delFunction: 'fnDelDailyImg(\'rightImgs\',this,\'delRightPicIds\')',
                        showFunction: 'fnShowImage(this)'
                    }));
                }
                $('#leftImgs').append(leftAppendStr);
                $('#rightImgs').append(rightAppendStr);
                $('.mui-content').show();
            }
        });
    } else {   //新增页面
        var leftPhotos = api.pageParam.leftPhotos;
        var rightPhotos = api.pageParam.rightPhotos;
        if (leftPhotos && leftPhotos.length > 0) {
            for (var i = 0; i < leftPhotos.length; i++) {
                var leftPath = leftPhotos[i].url;
								leftPoints.push(leftPhotos[i].lon + ',' + leftPhotos[i].lat);
                var ret = fs.existSync({
                    path: leftPath
                });
								if (ret.exist && !ret.directory) {
										leftImgs.push(leftPath)
										var image = '<span class="my-image">' +
												'<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'leftImgs\',this);" src="' + leftPath + '">' +
												'<a class="mui-icon iconfont icon-image-delete" onclick="fnDelDailyImg(\'leftImgs\',this)"></a>' +
												'</span>';
										$('#leftImgs').append(image);
								}
            }
        }
        if (rightPhotos && rightPhotos.length > 0) {
            for (var i = 0; i < rightPhotos.length; i++) {
                var rightPath = rightPhotos[i].url;
								rightPoints.push(rightPhotos[i].lon + ',' + rightPhotos[i].lat);
								var ret = fs.existSync({
                    path: rightPath
                });
								if (ret.exist && !ret.directory) {
										rightImgs.push(rightPath)
										var image = '<span class="my-image">' +
												'<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'rightImgs\',this);" src="' + rightPath + '">' +
												'<a class="mui-icon iconfont icon-image-delete" onclick="fnDelDailyImg(\'rightImgs\',this)"></a>' +
												'</span>';
										$('#rightImgs').append(image);
								}
            }
        }
        $('.mui-content').show();
    }
}

//重置页面
function fnClearPage() {
    $('#leftImgs').empty();
    $('#rightImgs').empty();
    $('.mui-content').hide();
}

//提交表单
function fnSubmit() {
    var files = {};
		var cachePath = $api.getStorage('root_cachePath');
    if (leftImgs && leftImgs.length > 0) {
        for (var i = 0; i < leftImgs.length; i++) {
						if(leftImgs[i].indexOf(cachePath) > -1){
								files['leftPics[' + i + ']'] = leftImgs[i];
						}
        }
    }

    if (rightImgs && rightImgs.length > 0) {
        for (var i = 0; i < rightImgs.length; i++) {
						if(rightImgs[i].indexOf(cachePath) > -1){
							files['rightPics[' + i + ']'] = rightImgs[i];
						}
        }
    }
    var leftPicIds = [];
    var rightPicIds = [];
    $('[name=leftPics]').each(function(index, ele) {
        if ($(ele).val() && $(ele).val() != 0) {
            leftPicIds.push($(ele).val());
        }
    });
    $('[name=rightPics]').each(function(index, ele) {
        if ($(ele).val() && $(ele).val() != 0) {
            rightPicIds.push($(ele).val());
        }
    });

    var params = {
        id: detailId,
        userId: userId,
        dailyTaskId: taskId,
        stationId: stationId,
        leftPoint: leftPoints.join('|'),
        rightPoint: rightPoints.join('|'),
        leftPicIds: leftPicIds.join(','),
        rightPicIds: rightPicIds.join(','),
        delLeftPicIds: delLeftPicIds.join(','),
        delRightPicIds: delRightPicIds.join(',')
    };
    fnShowProgress('正在保存');
    api.ajax({
        url: fnGetServerAddr() + '/apicloud/dailyTaskDetail.do?todo=saveDailyTaskDetail',
        method: 'post',
        data: {
            values: params,
            files: files
        }
    }, function(ret, err) {
        fnHideProgress();
        if (ret.status) {
            fnShowMessage('保存成功');
            for (var i = 0; i < leftImgs.length; i++) {
								if(ret.status && leftImgs[i].indexOf(cachePath) > -1){
		                ret = fs.removeSync({
		                    path: leftImgs[i]
		                });
								}
            }
            for (var i = 0; i < rightImgs.length; i++) {
								if(rightImgs[i].indexOf(cachePath) > -1){
		                ret = fs.removeSync({
		                    path: rightImgs[i]
		                });
								}
            }
            api.closeToWin({
                name: 'today-inspect-point-main'
            });
        } else {
            api.toast({
                msg: JSON.stringify(err)
            });
        }
    });
}

//打开照相机
function fnOpenCamera(picName) {
    lOr = picName;
    api.closeWin({
        name: 'camera-main-win'
    });
		api.openWin({
				name: 'camera-main-win',
				url: 'widget://html/frame/common/media/camera-win.html',
				slidBackEnabled:false,
				pageParam: {
						cameraType: 4,
						frontWin: api.winName,
						frontFrame: api.frameName,
						daily : api.pageParam.daily
				}
		});
}

//拍照的回调函数
function fnTakePhotoCallBack(image) {
    //存储图片-位置信息
		var lon = image.lon;
		var lat = image.lat;
		var imagePath = image.url;
    if (lOr.indexOf('left') > -1) {
				leftPoints.push(lon + ',' + lat);
    } else {
				rightPoints.push(lon + ',' + lat);
    }
    eval(lOr + '.push("' + imagePath + '")');
    var image = '<span class="my-image">' +
        '<img class="mui-media-object mui-pull-left"  onclick="fnShowImg(\'' + lOr + '\',this);" src="' + imagePath + '">' +
        '<a class="mui-icon iconfont icon-image-delete" onclick="fnDelDailyImg(\'' + lOr + '\',this)"></a>' +
        '</span>';
    $('#' + lOr).append(image);
}

//返回到今日巡查点页面页面
function fnBackToInspectPoint() {
    api.closeToWin({
        name: 'today-inspect-point-win'
    });
}

//打开拍照页面
function fnBackToCamera() {
    api.openWin({
        name: 'camera-win',
        url: 'widget://html/frame/common/camera/camera_win.html',
        slidBackEnabled: false,
        pageParam: api.pageParam.dailyTaskDetail
    });
}

//删除照片
function fnDelDailyImg(urlArr,_this,deleteArr) {
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
						if(urlArr.indexOf('left') > -1 ) {
								leftPoints.splice(i,1);
						}else{
								rightPoints.splice(i,1);
						}
        }
    }
    if (imagePath) {
        fs.remove({//删除本地缓存照片
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

//打开电子地图
function fnOpenElectronic(){
		api.openDrawerLayout({
				name: 'map-main',
				url: 'widget://html/frame/map/map-main.html',
				animation: {
						type: 'none'
				},
				pageParam:{
					 lon: lon,
					 lat: lat
				},
				slidBackEnabled:false,
				rightPane: {
						edge: api.winWidth/3,
						name: 'map-right',
						url:  'widget://html/frame/map/map-right.html'
				},
				animation:{
						type: 'movein',
						subType:'from_right',
						duration:500
				}
		});
}
/**
 * 根据属性删除数组元素
 * @param prop 属性名，例如：“id”
 * @param value 属性值，例如：1
 * @param isSingle 是否删除一个就结束了
 */
Array.prototype.removeByProperty = function(prop, value, isSingle) {
    var count = 0; //移除的数量
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
