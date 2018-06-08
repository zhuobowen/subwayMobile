var db;

var DATABASE = "subwaymobile";

var sw_photo_url = "sw_photo_url";				//照片路径表

var sw_unusual_info = "sw_unusual_info";		//异常点信息表

var sw_unusual_trcak = "sw_unusual_trcak";      //异常点跟踪表

var sw_unusual_photo = "sw_unusual_photo";      //异常点信息-照片中间表

var sw_track_photo = "sw_track_photo";      	//异常点跟踪-照片中间表

/**
 * 初始化数据库
 */
function fnInitDB() {
    db = api.require('db');
};

/**
 *打开数据库并初始化表
 */
function fnOpenDatabase(){
    var listMap;
    var ret = db.openDatabaseSync({
        name: DATABASE
    });
    if(ret.status){
        listMap  = '[{"attr":"id","dataType":"VARCHAR(100)"},'+					//编号-uuid
            '	{"attr":"url","dataType":"VARCHAR(256)"},'+				//照片路径
            '	{"attr":"lon","dataType":"VARCHAR(100)"},'+				//拍照经度
            '	{"attr":"lat","dataType":"VARCHAR(100)"},'+				//拍照纬度
            '	{"attr":"location","dataType":"VARCHAR(256)"},'+		//拍照地址（中文）
            '	{"attr":"createTime","dataType":"DATETIME"}'+			//创建时间
            ']';
        ret = fnCreateTBSync(sw_photo_url,$api.strToJson(listMap));				//创建照片路径表


        listMap = '[{"attr":"id","dataType":"VARCHAR(100)"},'+					//编号-uuid
            '	{"attr":"lineId","dataType":"NUMBER(10)"},'+			//所属线路id
            '	{"attr":"lineName","dataType":"VARCHAR(256)"},'+		//所属线路名称
            '	{"attr":"stationId","dataType":"NUMBER(10)"},'+			//所属站点id
            '	{"attr":"stationName","dataType":"VARCHAR(256)"},'+		//所属站点名称
            '	{"attr":"unusual_id","dataType":"NUMBER(10)"},'+		//已存在的异常id
            '	{"attr":"unusualDesc","dataType":"VARCHAR(256)"},'+		//异常描述
            '	{"attr":"unusualPic","dataType":"VARCHAR(256)"},'+		//异常照片id
            '	{"attr":"unusualPics","dataType":"VARCHAR(256)"},'+		//异常照片id集合
            '	{"attr":"unusualTypeName","dataType":"VARCHAR(20)"},'+	//异常类型
            '	{"attr":"unusualLevel","dataType":"VARCHAR(10)"},'+		//异常等级
            '	{"attr":"location","dataType":"VARCHAR(256)"},'+		//异常位置
            '	{"attr":"isEmphasis","dataType":"VARCHAR(256)"},'+		//是否重点路段
            '	{"attr":"createUser","dataType":"NUMBER(10)"},'+		//创建人
            '	{"attr":"createTime","dataType":"DATETIME"}'+			//创建时间
            ']';
        ret = fnCreateTBSync(sw_unusual_info,$api.strToJson(listMap));			//创建异常信息表

        listMap = 	'[{"attr":"id","dataType":"VARCHAR(100)"},'+				//编号-uuid
            '	{"attr":"taskId","dataType":"NUMBER(10)"},'+			//异常巡查任务id
            '	{"attr":"createUser","dataType":"NUMBER(10)"},'+		//创建人
            '	{"attr":"createTime","dataType":"DATETIME"},'+			//创建时间
            '	{"attr":"unusual_info_id","dataType":"NUMBER(10)"}'+	//所属线路id
            ']';
        ret = fnCreateTBSync(sw_unusual_trcak,$api.strToJson(listMap));			//创建异常点跟踪表


        listMap = 	'[{"attr":"unusual_info_id","dataType":"VARCHAR(100)"},'+	//异常点id-uuid
            '	{"attr":"photo_url_id","dataType":"VARCHAR(100)"}'+	//照片路径id
            ']';
        ret = fnCreateTBSync(sw_unusual_photo,$api.strToJson(listMap));			//创建异常点跟踪表

        listMap = 	'[{"attr":"unusual_track_id","dataType":"VARCHAR(100)"},'+	//异常点跟踪表id-uuid
            '	{"attr":"photo_url_id","dataType":"VARCHAR(100)"}'+	//照片路径id
            ']';
        ret = fnCreateTBSync(sw_track_photo,$api.strToJson(listMap));			//创建异常点跟踪表
    }
}

/**
 * @param {Object} tableName 表名
 */
function fnDropTBSync(tableName){
    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: 'DROP TABLE ' + tableName
    });
    return ret;
}

/**
 * 删除数据
 * @param {Object} sqlStr 删除记录的语句
 */
function fnDeleteSync(sqlStr){
    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: sqlStr
    });
    return ret;
}

/**
 * 查询语句
 * @param {Object} sqlStr 查询语句
 */
function fnSelectSync(sqlStr){
    var ret = db.selectSqlSync({
        name: DATABASE,
        sql: sqlStr
    });
    return ret;
}

/**
 * 创建表(异步)
 * @param {Object} tableName 表名
 * @param {Object} listMap	包含字段的json数组
 */
function fnCreateTB(tableName,listMap){
    if(listMap.length<=0)
        return null;
    var attrStr = '';
    for(var i=0;i<listMap.length;i++){
        attrStr += ','+listMap[i].attr + ' ' + listMap[i].dataType;
    }
    db.executeSql({
        name: tableName,
        sql: 'CREATE TABLE IF NOT EXISTS ' + tableName + '('+attrStr.substring(1)+')'
    }, function(ret, err) {

    });
}

/**
 * 创建表(同步)
 * @param {Object} tableName 表名
 * @param {Object} listMap	包含字段的json数组
 */
function fnCreateTBSync(tableName,listMap){
    if(listMap.length<=0)
        return null;
    var attrStr = '';
    for(var i=0;i<listMap.length;i++){
        attrStr += ','+listMap[i].attr + ' ' + listMap[i].dataType;
    }
    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: 'CREATE TABLE IF NOT EXISTS ' + tableName + '('+attrStr.substring(1)+')'
    },function(){

    });
    return ret;
}
/**
 * 新增记录(异步)
 * @param {Object} tableName 表名
 * @param {Object} listMap 字段名与字段值的json数组
 */
function fnInsert(tableName,listMap){
    if(listMap.length<=0)
        return null;
    var attrName = '';
    var attrVal = '';
    for(var i = 0;i<listMap.length;i++){
        attrName += ','+listMap[i].name;
        if(isNaN(listMap[i].val)){
            if(listMap[i].val!='null'&&listMap[i].val!=undefined)
                attrVal += ',\''+listMap[i].val+'\'';
            else
                attrVal += ',null';
        }else{
            if(listMap[i].val!=''&&listMap[i].val!=null)
                attrVal += ','+listMap[i].val;
            else
                attrVal += ',null';
        }
    }
    var sqlStr = 'REPLACE INTO '+tableName+'('+attrName.substring(1)+') VALUES('+attrVal.substring(1)+')';

    db.executeSql({
        name: tableName,
        sql: sqlStr
    }, function(ret, err) {

    });
}

/**
 * 新增记录(同步)
 * @param {Object} tableName 表名
 * @param {Object} listMap 字段名与字段值的json数组
 */
function fnInsertSync(tableName,listMap){
    if(listMap.length<=0)
        return null;
    var attrName = '';
    var attrVal = '';
    for(var i = 0;i<listMap.length;i++){
        attrName += ','+listMap[i].name;
        if(isNaN(listMap[i].val)){
            if(listMap[i].val!='null'&&listMap[i].val!=undefined)
                attrVal += ',\''+listMap[i].val+'\'';
            else
                attrVal += ',null';
        }else{
            if(listMap[i].val!=''&&listMap[i].val!=null)
                attrVal += ','+listMap[i].val;
            else
                attrVal += ',null';
        }
    }
    var sqlStr = 'REPLACE INTO '+tableName+'('+attrName.substring(1)+') VALUES('+attrVal.substring(1)+')';

    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: sqlStr
    });

    return ret;
}
/**
 * 更新记录 (同步)
 * @param {Object} tableName 表名
 * @param {Object} updateMap 字段与值的json数组
 * @param {Object} whereStr 条件语句
 */
function fnUpdateSync(tableName,updateMap,whereStr){
    if(updateMap.length<=0)
        return null;
    var updateStr = '';
    for(var i=0;i<updateMap.length;i++){
        if(isNaN(updateMap[i].val)){
            if(updateMap[i].val!='null'&&updateMap[i].val!=undefined)
                updateStr += ',' + updateMap[i].name + '=\'' + updateMap[i].val+'\'';
            else
                updateStr += ',' + updateMap[i].name + '=null';
        }else{
            if(updateMap[i].val!=''&&updateMap[i].val!=null)
                updateStr += ',' + updateMap[i].name + '=' + updateMap[i].val;
            else
                updateStr += ',' + updateMap[i].name + '=null';
        }
    }
    var sqlStr = 'UPDATE ' + tableName + ' SET ' + updateStr.substring(1);

    if(whereStr!=null&&whereStr!='')
        sqlStr += ' WHERE ' + whereStr;
    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: sqlStr
    });
    return ret;
}

/**
 * 执行sql语句
 * @param {Object} sqlStr
 */
function fnExecuteSync(sqlStr){
    var ret = db.executeSqlSync({
        name: DATABASE,
        sql: sqlStr
    });
    return ret;
}
