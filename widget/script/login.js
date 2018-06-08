apiready = function(){
	fnInitStyle();
};

/**
	初始化项目样式
*/
function fnInitStyle(){
	api.parseTapmode();
	$api.fixStatusBar( $api.byId( 'headId' ) );
	//$( '#headId' ).css('height', api.winHeight/2 );
	//$( '.content' ).css('height', api.winHeight/3 );
	api.setStatusBarStyle( { style:  'dark' } );
}

/**
	右上角登录设置按钮事件
*/
function fnGoLoginSetting(){
	var pageName = 'login-set'
	var pageObj = {
		title: '登录设置',
		frameName: pageName,
		frameUrl: './login-set.html',
		leftIcons: 'icon-arrow-left,event-back',
		rightIcons: ''
	};
	fnOpenCommonWin(pageName,pageObj)
}

/**
登录
*/
function fnLogin(){
	if( api.connectionType == 'none'){
		fnShowMessage('请打开网络');
		return;
	}
	var username = $('#username').val();
	var password = $('#password').val();
	if ( $.trim(username) == '' ) {
		fnShowMessage('用户名不能为空');
		return;
	}else if ( $.trim(password) == '' ) {
		fnShowMessage('密码不能为空');
		return;
	}

	//加载过程
	fnShowProgress('登录中...');

	/**异步登录并获取用户信息*/
	api.ajax({
		url: fnGetServerAddr() + '/apicloud/user.do?todo=getUser',
		method: 'get',
		timeout:6,
		data: {
			values: {
				username: $.trim(username),
				password: $.trim(password)
			}
		}
	},function(ret, err){
		api.hideProgress();
		if (ret) {
			if(ret.code == 0){
				$api.setStorage('user', ret.user);//将用户信息存储在本地
				//打开主页面
				var pageObj = {
						bounces:true,
						title:'厦门地铁保护',//新窗口标题
						frameName:'main',//子页面名称
						frameUrl:'./main.html',//页面路径
						rightIcons:'icon-exist,event-exist',//右边字体图标，多种样式可以用逗号，隔开
						events:['fnReadyKeyBinding("event-exist","fnExist()")']//绑定事件，方法名称fnReadyKeyBinding()，参数1：样式名称，参数2：子页面的方法
				};
				fnOpenCommonWin('main',pageObj)
			}else{
				fnShowMessage('账户名或者密码错误')
			}
		} else {
			fnShowMessage('请检查网络设置')
		}
	});
}
