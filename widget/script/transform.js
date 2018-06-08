var PI = 3.1415926535897932384626;
var X_PI = 3.14159265358979324 * 3000.0 / 180.0;
var A = 6378245.0;
var EE = 0.00669342162296594323;
var D2R = 0.017453;

function transformLat(x, y){
	var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
	ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;  
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;  
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;  
    return ret;  
}

function transformLon(x, y) {  
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));  
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;  
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;  
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;  
    return ret;  
}  

function outOfChina(lat, lon) {  
    if (lon < 72.004 || lon > 137.8347)  
        return true;  
    if (lat < 0.8293 || lat > 55.8271)  
        return true;  
    return false;  
}
/** 
 * 原始坐标(GPS-84) to 火星坐标系 (GCJ-02) 
 * @param lat 
 * @param lon 
 * @return 
 */
function gps84_To_Gcj02(lat, lon) {  
	var result = [];
    if (outOfChina(lat, lon)) {  
    	result = [lat,lon];
        return result;  
    }  
    var dLat = transformLat(lon - 105.0, lat - 35.0);  
    var dLon = transformLon(lon - 105.0, lat - 35.0);  
    var radLat = lat / 180.0 * PI;  
    var magic = Math.sin(radLat);  
    magic = 1 - EE * magic * magic;  
    var sqrtMagic = Math.sqrt(magic);  
    dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);  
    dLon = (dLon * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);  
    var mgLat = lat + dLat;  
    var mgLon = lon + dLon;
    result = [mgLat,mgLon];
    return result;  
}

/** 
 *  将百度坐标系(BD-09) 坐标转换成火星坐标系(GCJ-02)坐标
 *  @param bd_lat 
 *  @param bd_lon 
 *  @return 
 */  
function bd09_To_Gcj02(bd_lat, bd_lon) {  
    var x = bd_lon - 0.0065, y = bd_lat - 0.006;  
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);  
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);  
    var tempLon = z * Math.cos(theta);  
    var tempLat = z * Math.sin(theta);
    var gps = [tempLat,tempLon];
    return gps;  
}

/**
 * 计算两点间距离
 * @param lng1
 * @param lat1
 * @param lng2
 * @param lat2
 * @returns
 */
function fnDistance(lat1,lng1,lat2,lng2){
	if(lng1 == lng2 && lat1 == lat2) {  
        return 0;  
    }else{
    	var fdLambda = (lng1 - lng2) * D2R;
    	var fdPhi = (lat1 - lat2) * D2R;
    	var fPhimean = ((lat1 + lat2) / 2.0) * D2R;
    	var fTemp = 1 - EE * (Math.pow (Math.sin(fPhimean),2));
    	var fRho = (A * (1 - EE)) / Math.pow (fTemp, 1.5);
    	var fNu = A / (Math.sqrt(1 - EE * (Math.sin(fPhimean) * Math.sin(fPhimean))));
    	var fz = Math.sqrt (Math.pow(Math.sin(fdPhi / 2.0), 2) +  
                Math.cos(lat2 * D2R) * Math.cos(lat1*D2R ) * Math.pow( Math.sin(fdLambda / 2.0),2));
    	fz = 2 * Math.asin(fz);
    	var fAlpha = Math.cos(lat2 * D2R) * Math.sin(fdLambda) * 1 / Math.sin(fz);
    	fAlpha = Math.asin (fAlpha);
    	var fR = (fRho * fNu) / ((fRho * Math.pow( Math.sin(fAlpha),2)) + (fNu * Math.pow( Math.cos(fAlpha),2)));
    	return fz * fR;
    }
}


function getRandomNum(){
	var radomNum = [];
	for(var i=0;i<5;i++){
		radomNum[i] = Math.random();
	}
	var timestamp = radomNum[0]*10000;
	timestamp = parseInt(timestamp);
	return timestamp;
}


/*  
js由毫秒数得到年月日  
使用： (new Date(data[i].creationTime)).Format("yyyy-MM-dd hh:mm:ss.S")  
*/  
Date.prototype.Format = function (fmt) { //author: meizz  
    var o = {  
        "M+": this.getMonth() + 1, //月份  
        "d+": this.getDate(), //日  
        "h+": this.getHours(), //小时  
        "m+": this.getMinutes(), //分  
        "s+": this.getSeconds(), //秒  
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度  
        "S": this.getMilliseconds() //毫秒  
    };  
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));  
    for (var k in o)  
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));  
    return fmt;  
};

/* 
 * formatMoney(s,type) 
 * 功能：金额按千位逗号分割 
 * 参数：s，需要格式化的金额数值. 
 * 参数：type,判断格式化后的金额是否需要小数位. 
 * 返回：返回格式化后的数值字符串. 
 */  
function formatMoney(s, type) {  
    if (/[^0-9\.]/.test(s))  
        return "0";  
    if (s == null || s == "")  
        return "0";  
    s = s.toString().replace(/^(\d*)$/, "$1.");  
    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");  
    s = s.replace(".", ",");  
    var re = /(\d)(\d{3},)/;  
    while (re.test(s))  
        s = s.replace(re, "$1,$2");  
    s = s.replace(/,(\d\d)$/, ".$1");  
    if (type == 0) {// 不带小数位(默认是有小数位)  
        var a = s.split(".");  
        if (a[1] == "00") {  
            s = a[0];  
        }  
    }  
    return s;  
}