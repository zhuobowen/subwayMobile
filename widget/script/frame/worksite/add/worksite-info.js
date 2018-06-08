mui.init();
var linePicker;
var serverAddr;
var picfiles = [];
var videofiles = [];
apiready = function(){
	fnInitModule();//初始化模块
	initData();
}
//初始化轨道交通区域数据
function initData(){
	var user = $api.getStorage('user');
	$('#myform').find('input[name=createUser]').val(user.showname);//设置创建人
	serverAddr = $api.getStorage('serverAddr');
	fnShowProgress();
	api.ajax({//获取轨道交通区域
		url: serverAddr + '/subway/lineAndStation.do?todo=queryLineAndStationForApp',
		method: 'get',
		timeout:1
	},function(ret, err){
		fnHideProgress();
		if (ret) {
			linePicker = new mui.PopPicker({layer: 2});
			linePicker.setData(ret);
		}
	});
}

//改变线路站点
function fnChangeLineStation(){
	linePicker.show(function(items) {
		$('#myform').find('input[name=lineId]').val(items[0].value);
		$('#myform').find('input[name=stationId]').val(items[1].value);
		$('#myform').find('#line-station-span').html((items[0].text ? items[0].text:'') + '/' + (items[1].text ? items[1].text : ''));
	})
}

/*
选择工点等级
*/
function fnChangeGrade(_this){
	$('.my-item').removeClass('mui-active');
	$(_this).addClass('mui-active');
	$('#myform').find('input[name=grade]').val($(_this).html());
}

/**添加图片后的回调函数
@param imgPath 图片的存储路径
@param imgEle  添加的图片标签字符串
*/
/*function fnImageCallBack(imgPath,imgEle){
	picfiles.push(imgPath);
}*/

/**添加视频后的回调函数
@param videoPath 视频的存储路径
@param videoEle  添加的视频元素字符串
*/
/*function fnVideoCallBack(videoPath,videoEle){
	videofiles.push(videoPath);
}*/

/**修改表单中面积和周长
@param area 面积
@param girth  周长
*/
function fnChangeGirthAndArea(area,girth){
	$('#myform').find('input[name=area]').val(area);
	$('#myform').find('input[name=girth]').val(girth);
}
/**修改表单中点位
@param latLng 点位信息
@param isRoot  是否本页面调用
*/
function fnChangeLatlng(latLng){
	$('#myform').find('input[name=latLng]').val(latLng);//本页面的修改方法
}

//保存并上传监护工点表单
function fnSave(){
	fnShowProgress();
	var files = {};
	if(imageUrls && imageUrls.length > 0){
		for (var i = 0; i < imageUrls.length; i++) {
			files['picfiles[' + i + ']'] = imageUrls[i];
		}
	}
	if(videoUrls && videoUrls.length > 0){
		for (var i = 0; i < videoUrls.length; i++) {
			files['videofiles[' + i + ']'] = videoUrls[i];
		}
	}
	var params = fnCheckForm();
	if(params){
		api.ajax({
			url: serverAddr + '/apicloud/worksite.do?todo=uploadWorksite',
			method: 'post',
			timeout:3,
			data: {
				values: params,
				files: files
			}
		},function(ret, err){
			fnHideProgress();
			if (ret.status) {
				alert('保存成功');
				api.closeWin({name: api.winName});
			}
		});
	}else{
		fnHideProgress();
	}

}

//表单验证
function fnCheckForm(){
	var params = {};
	var lineId = $('#myform').find('input[name=lineId]').val();
	var createUser = $('#myform').find('input[name=createUser]').val();
	var stationId = $('#myform').find('input[name=stationId]').val();
	var grade = $('#myform').find('input[name=grade]').val();
	var area = $('#myform').find('input[name=area]').val();
	var girth = $('#myform').find('input[name=girth]').val();
	var latLng = $('#myform').find('input[name=latLng]').val();
	var name = $('#myform').find('input[name=name]').val();
	var company = $('#myform').find('input[name=company]').val();
	var userName = $('#myform').find('input[name=userName]').val();
	var emphases = $('#myform').find('textarea[name=emphases]').val();
	var support = $('#myform').find('textarea[name=support]').val();
	var rainfall = $('#myform').find('textarea[name=rainfall]').val();
	var environment = $('#myform').find('textarea[name=environment]').val();
	var timeLimit = $('#myform').find('textarea[name=timeLimit]').val();
	if(createUser && createUser.trim() != ''){
		params['createUser'] = createUser;
	}else{
		return fnShowMessage('未登录');
	}
	if(name && name.trim() != ''){
		params['name'] = name;
	}else{
		return fnShowMessage('请填写工点名称');
	}
	if(company && company.trim() != ''){
		params['company'] = company;
	}else{
		return fnShowMessage('请填写施工单位');
	}
	if(userName && userName.trim() != ''){
		params['userName'] = userName;
	}else{
		return fnShowMessage('请填写联系人');
	}
	if(emphases && emphases.trim() != ''){
		params['emphases'] = emphases;
	}else{
		return fnShowMessage('请填写监护重点');
	}
	if(support && support.trim() != ''){
		params['support'] = support;
	}else{
		return fnShowMessage('请填写维护及支护结构');
	}
	if(rainfall && rainfall.trim() != ''){
		params['rainfall'] = rainfall;
	}else{
		return fnShowMessage('请填写土方及降水');
	}
	if(environment && environment.trim() != ''){
		params['environment'] = environment;
	}else{
		return fnShowMessage('请填写周边环境');
	}
	if(timeLimit && timeLimit.trim() != ''){
		params['timeLimit'] = timeLimit;
	}else{
		return fnShowMessage('请填写工期影响');
	}
	if(lineId && lineId.trim() != '' && stationId && stationId.trim() != ''){
		params['lineId'] = lineId;
		params['stationId'] = stationId;
	}else{
		return fnShowMessage('请选择轨道交通区域');
	}
	if(grade && grade.trim() != ''){
		params['grade'] = grade;
	}else{
		return fnShowMessage('请选择影响等级');
	}
	if(latLng && latLng.trim() != ''){
		params['latLng'] = latLng;
	}else{
		return fnShowMessage('请先选择点位');
	}
	if(area && area.trim() != '' && girth && girth.trim() != ''){
		params['area'] = area;
		params['girth'] = girth;
	}else{
		return fnShowMessage('请先计算并保存点位');
	}
	return params;
}	
