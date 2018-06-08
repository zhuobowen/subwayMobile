
//获取header高度
function getHeaderHeight() {
	return parseInt($api.getStorage('headerHeight'));
}

//获取设置的服务器地址
function fnGetServerAddr(){
	return $api.getStorage('serverAddr');
}

//获取当前登录用户
function fnGetUser(){
	return $api.getStorage('user');
}
//获取当前用户的id
function getUserId(){
    var user = $api.getStorage('user');
    if(user){
        return user.userId;
    }
}

//获取当前位置信息
function fnGetCurrentLocation(){
	return $api.getStorage('current_location');
}

//获取缩略图路径的方法
function fnGetImageUrl(annexId,isThumbnail,width,height){
	var url;
	if(!annexId){
		return 'widget://image/nopicture.png';
	}
	if(!isThumbnail){//原图
		url = fnGetServerAddr() + '/subway/annexUpload.do?todo=download&download=false&smallImage=false&showDefault=true&annexId=' + annexId;
	}else { //缩略图
		url = fnGetServerAddr() + '/subway/annexUpload.do?todo=download&download=false&showDefault=true&'+
								  'smallImage=true&width=' + (width || 500) + '&height=' + (height || 500) +'&annexId='+annexId;
	}
	return url;
}

//获取视频路径的方法
function fnGetVideoUrl(annexId){
    if(annexId){
        return fnGetServerAddr() + '/subway/annexUpload.do?todo=playVideo&annexId=' +annexId;
    }
}

/**
*打开新的窗口
*@Params winName 新窗口名称
*@Params winPath 当前frame相对与common-win.html的路径 例如../或者./,也可以表示层级关系
*@Params pageObj 页面传递的参数
*/
function fnOpenCommonWin(winName,pageObj){
	api.openWin({
		name: winName + '-win',
		url: api.wgtRootDir + '/html/common-win.html',
		pageParam: pageObj,//页面传递参数，包括子页面的name，url
		bounces: false,//页面是否能够弹动，下拉刷新必须设置成true
		bgColor: 'rgba(0,0,0,0)',
    	vScrollBarEnabled: false,//是否显示垂直滚动条
    	hScrollBarEnabled: false,//是否显示水平滚动条
    	slidBackEnabled :false,//侧滑返回上一个页面
    	rect: {
    		x: 0,
    		y: 0,
    		w: api.winWidth,
    		h: api.winHeight,
    		marginLeft:0,    //相对父 window 左外边距的距离
    	    marginTop:0,    //相对父 window 上外边距的距离
    	    marginBottom:0,    //相对父 window 下外边距的距离
    	    marginRight:0    //相对父 window 右外边距的距离
    	},
			animation:{
				type:'movein',
				subType:pageObj.subType || 'from_right',
				duration:300
			}
    });
}

//关闭到指定窗口
function fnCloseToWin(winName){
	api.closeToWin({
		name: winName
	});
}

//隐藏frame
function fnHiddenFrame(frameName){
	api.setFrameAttr({
		name: frameName,
		hidden:true
	});
}

//显示frame
function fnShowFrame(frameName){
	api.setFrameAttr({
		name: frameName,
		hidden:false
	});
}

/**
* 格式化当前日期（yyyy-MM-dd HH:mm:ss）
*/
function fnGetNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	var strHour = date.getHours();
	var strMin = date.getMinutes();
	var strSec = date.getSeconds();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	if (strHour >= 0 && strHour <= 9) {
		strHour = "0" + strHour;
	}
	if (strMin >= 0 && strMin <= 9) {
		strMin = "0" + strMin;
	}
	if (strSec >= 0 && strSec <= 9) {
		strSec = "0" + strSec;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
	+ " " + strHour + seperator2 + strMin + seperator2 + strSec;
	return currentdate;
}

//获取当前日期前一天字符串
function fnGetYesterdayStr(separator) {
	if(!separator){
		separator = '';
	}
	var date = new Date();
	var month = date.getMonth() + 1;
	var strDate = date.getDate() - 1;
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + separator + month + separator + strDate;
	return currentdate;
}

/**
 * 格式化时间戳（yyyy-MM-dd HH:mm:ss）
 */
 function fnFormatDate(timetemp){
 	var date = new Date();
 	date.setTime(timetemp);
 	var seperator1 = "-";
 	var seperator2 = ":";
 	var month = date.getMonth() + 1;
 	var strDate = date.getDate();
 	var strHour = date.getHours();
 	var strMin = date.getMinutes();
 	var strSec = date.getSeconds();
 	if (month >= 1 && month <= 9) {
 		month = "0" + month;
 	}
 	if (strDate >= 0 && strDate <= 9) {
 		strDate = "0" + strDate;
 	}
 	if (strHour >= 0 && strHour <= 9) {
 		strHour = "0" + strHour;
 	}
 	if (strMin >= 0 && strMin <= 9) {
 		strMin = "0" + strMin;
 	}
 	if (strSec >= 0 && strSec <= 9) {
 		strSec = "0" + strSec;
 	}
 	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
 	+ " " + strHour + seperator2 + strMin + seperator2 + strSec;
 	return currentdate;
 }
/**
 * 获取UUID
 */
 function fnGetUUID(){
	var len=32;//32长度
	var radix=16;//16进制
	var chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');var uuid=[],i;radix=radix||chars.length;if(len){for(i=0;i<len;i++)uuid[i]=chars[0|Math.random()*radix];}else{var r;uuid[8]=uuid[13]=uuid[18]=uuid[23]='-';uuid[14]='4';for(i=0;i<36;i++){if(!uuid[i]){r=0|Math.random()*16;uuid[i]=chars[(i==19)?(r&0x3)|0x8:r];}}}
	return uuid.join('');
}

//获取当前日期字符串
function fnGetTodayStr(separator) {
	if(!separator){
		separator = '';
	}
	var date = new Date();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + separator + month + separator + strDate;
	return currentdate;
}

//获取网络类型
function fnGetConnectionType(){
	var ctype = api.connectionType;
	if(ctype.toLowerCase()=='unknown'||ctype.toLowerCase()=='none'){
		$api.setStorage("online",0);//断网
	}
	if(ctype.toLowerCase()=='2g'||ctype.toLowerCase()=='3g'||ctype.toLowerCase()=='4g')
		$api.setStorage("online",1);
	if(ctype=='wifi')
		$api.setStorage("online",2);
}

//打开电子地图
function fnOpenElectronic(position){
 	var lon,lat;
 	if(position){
 		lon = position.split(',')[0];
 		lat = position.split(',')[1];
 	}
 	var pageName = 'electronic-map';
 	var pageObj = {
 		title:'当前位置',
 		frameName: api.frameName + pageName,
 		frameUrl:'widget://html/frame/' + pageName + '.html',
 		leftIcons:'icon-arrow-left,event-back',
 		rightIcons:'',
 		lon:lon,
 		lat:lat
 	};
 	fnOpenCommonWin(pageName,pageObj);
}

//开启加载过程
function fnShowProgress(msg,flag){
	if(!msg){
		msg = '加载数据中...';
	}
	api.showProgress({
		style: 'default',
		animationType: 'fade',
		title: '请稍后',
		text: msg,
		modal: flag
	});
}
//设置刷新
function fnRefreshHeader(refreshCallback,flag){
	api.setRefreshHeaderInfo({
		visible: true,
		bgColor: '#efeff4',
		textColor: '#cccccc',
		textDown: '下拉刷新...',
		textUp: '松开刷新...',
		showTime: true,
	}, function(ret, err){
		if(isExitsFunction(refreshCallback)){
			eval(refreshCallback + '()');
		}
	});

	if(flag){//第一次进入页面是否刷新
		api.refreshHeaderLoading();
	}
}

 //关闭加载过程
function fnHideProgress(){
 	api.hideProgress();
}

//底部提示框
function fnShowMessage(msg){
	api.toast({
		msg: msg,
		duration: 2000,
		location: 'bottom'
	});
}

//调试提示框
function fnAlert(obj){
    alert(JSON.stringify(obj));
}

//控制台调试
function fnConsole(obj){
	console.log(JSON.stringify(obj))
}

//执行Frame的方法
function doScript(functionName,params,frameName,winName){
	var appendStr = '';
	for (var i = 0; i < params.length; i++) {
		var value = '\'' + params[i] + '\'';
		appendStr += (',' + value);
	}
	if(appendStr.indexOf(',') == 0){
		appendStr = appendStr.substring(1);
	}
	if(!winName){
		winName = api.winName;
	}
	api.execScript({
		name: winName,
		frameName: frameName,
		script: functionName + '(' + appendStr + ')'
	});
}

//获取当前方法的名称
function getFName(fn){
	return (/^[\s\(]*function(?:\s+([\w$_][\w\d$_]*))?\(/).exec(fn.toString())[1] || '';
}

//获取日期、时间、星期
function fnGetCurrentTime(flag){
	var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日

    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var clock = '';
    if(flag == 1){
    	clock  = year + "-";
    	if(month < 10)
    		clock += "0";
    	clock += month + "-";
    	if(day < 10)
    		clock += "0";
    	clock += day + " ";
    }else if(flag == 2){
    	if(hh < 10)
    		clock += "0";
    	clock += hh + ":";
    	if (mm < 10) clock += '0';
    	clock += mm;
    }else if(flag == 3){
    	var arr = new Array("日", "一", "二", "三", "四", "五", "六");
    	var week = now.getDay();
    	clock = "星期"+ arr[week];
    }
    return clock;
}

//判断函数是否存在
function isExitsFunction(funcName) {
	try {
		if (typeof(eval(funcName)) == "function") {
			return true;
		}
	} catch (e) {}
	return false;
}
//展示图片
function fnShowImage(_this){
	var imageBrowser = api.require('imageBrowser');
	var src = '';
	var imageUrls = [];
	if(_this.tagName == 'IMG'){
		src = $(_this).attr('src');
	}else{
		src = $(_this).find('img').eq(0).attr('src');
	}
	if(src && src.indexOf('smallImage=true') != -1){
			src = src.replace('smallImage=true','smallImage=false');
	}
	imageUrls.push(src);//子集元素的
	imageBrowser.openImages({
		imageUrls: imageUrls,
		showList: false,
		activeIndex: 0
	});
}

//序列化表单用
function getFormData(id) {
    var obj = {};
    var objArr = $("#" + id).serializeArray();
    if (objArr && objArr.length) {
        var k, v;
        for (var i = 0; i < objArr.length; i++) {
            k = objArr[i].name;
            v = objArr[i].value;

            if (k in obj) {
                var arr;
                if ($.type(obj[k]) != 'array') {
                    arr = [obj[k]];
                } else {
                    arr = obj[k];
                }
                arr.push(v);
                obj[k] = arr;
            } else {
                obj[k] = v;
            }
        }
    }
    return obj;
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

//获取模板 templateId   data： 数据
function fnTemplate(templateId,data){
     var html = doT.template($api.byId(templateId).innerHTML)(data);
     api.parseTapmode();
     return html;
}

//处理懒加载图片
function fnHandleImagePath(){
    $('img').each(function(index,ele){
        var src = $(ele).attr('src');
        var imagePath = $(ele).attr('imagePath');
        if(!imagePath){
            return;
        }
        if(imagePath && imagePath.indexOf('cache') > -1){
            src = imagePath;
            $(ele).attr('src',src);
        }else{
            imagePath = fnGetImageUrl(imagePath,true,500,500);
            api.imageCache({
                url: imagePath
            }, function (ret, err) {
                src = imagePath;
                $(ele).attr('src',src);
            });
        }
    })
}

//计算距离
function fnCountDistance(point){
    var current_location = fnGetCurrentLocation();
 	if(!point){
 		return 0;
	}
	if(!point.lat || !point.lon){
 		return 0;
	}
 	var distance = Number(fnDistance(Number(current_location.lat), Number(current_location.lon), Number(point.lat), Number(point.lon))/1000).toFixed(2);
	return distance ? parseFloat(distance) : 0;
}

//显示图片
function fnCacheImage(eleName){
    $(eleName).each(function(index,ele){
        var urls = $(ele).attr('urls');
        if(urls){
            var urlArr = urls.split(',');
            if(urlArr[0]){
                api.imageCache({
                    url: fnGetImageUrl(urlArr[0],false)
                }, function(ret, err) {
                    if(ret){
                        $(ele).attr('src',ret.url);
                    }else{

					}
                });
            }
        }
    });
}

//查看缓存图片
function fnShowCacheImage(_this){
    var imageBrowser = api.require('imageBrowser');
    var urls = $(_this).attr('urls');
    var imgUrls = [];
    if(urls){
        var urlArr = urls.split(',');
        for (var i = 0 ; i < urlArr.length ; i++){
            imgUrls.push(fnGetImageUrl(urlArr[i]));
        }
    }else{
        imgUrls.push(fnGetServerAddr() + '/images/nopicture.png');
    }
    imageBrowser.openImages({
        imageUrls: imgUrls,
        showList: false,
        activeIndex: 0
    });
}