mui.init();
var mapHeight,dot;
var id = 0;
var overlayId;//区域描线id
apiready = function() {
  api.parseTapmode();
    mapHeight = api.frameHeight * 0.6;
    fnInitMap();
    fnOpenMap({
      x: 0,
      y: 0,
      w: api.frameWidth,
      h: mapHeight
    });
};

/**
  初始化数据
*/
function fnInitData(){
    if(api.pageParam.area){
      $('#area').html(api.pageParam.area + '平方米');

    }
    if(api.pageParam.girth){
      $('#girth').html(api.pageParam.girth + '米');
    }
    if(api.pageParam.points){
      var points = api.pageParam.points.split(';');
      var annotations = [];
      for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var id = new Number(Math.random()*100).toFixed(0);
        annotations.push({
          id:id,
          lon:point.split(',')[0],
          lat:point.split(',')[1]
        });
        var lonlat = new Number(point.split(',')[0]).toFixed(6) + ',' + new Number(point.split(',')[1]).toFixed(6);
        var appendStr = doT.template($api.byId('template').innerHTML)({id:id,lonlat:lonlat});
        fnAppendTable(id,lonlat,appendStr);
      }
      var icon = api.systemType == 'ios' ? 'widget://image/map/location-red.png' : 'widget://image/map/location-red-large.png';
      fnAddAnnotations(annotations,[icon],[],'','fnDraggingCallBack(ret.id)');
      overlayId = fnAddPolygon([overlayId],annotations);
    }
}
function fnOpenMapCallBack(){
    fnInitData();
    $('#footer').css('top',mapHeight);            //初始化bottom高度
    $('#footer').show();
}

//添加点位
function fnAddMarker(){
    id++;
    var annotations = [];//标注
    var billboards = [];//布告牌用于显示id
    aMap.getLocation(function(ret, err) {
      if (ret.status) {
        annotations.push({
          id:id,
          lon:ret.lon,
          lat:ret.lat,
        });
        fnAddAnnotations(annotations,['widget://image/map/location-red.png'],[],'','fnDraggingCallBack(ret.id)');
        var lonlat = new Number(ret.lon).toFixed(6) + ',' + new Number(ret.lat).toFixed(6);
        var appendStr = doT.template($api.byId('template').innerHTML)({id:id,lonlat:lonlat});
        fnAppendTable(id,lonlat,appendStr);
      }
    });
  }
//新增点位
function fnAppendTable(id,lonlat,appendStr){
  isTableEmpty(true);
  var $appendStr = $(appendStr);
  $appendStr.find('.my-circle').html($('#annotation-table').find('.mui-row').length);
  $('#annotation-table').append($appendStr);
  fnGetLatlng();
}
//纠错标注
function fnCorAnnotation(annotationId){
  fnRemoveOverlay([overlayId]);//移除多边形
  fnAddBubble(annotationId);
  aMap.popupBubble({
    id: annotationId
  }, function(ret){
    setTimeout(function(){
      aMap.closeBubble({
        id: annotationId
      });
    },1000);
  });
}
//删除标注
function fnDelAnnotation(annotationId){
    fnRemoveOverlay([overlayId])//移除多边形
    $('#annotation-table').find('.mui-row').each(function(index,ele){
      var value = $(ele).find('input[name=id]').val();
      if( value && value == annotationId){
        $(ele).remove();
      }
    })
    $('#annotation-table').find('.mui-row').each(function(index,ele){
      $(ele).find('.my-circle').html(index);
    })
    isTableEmpty(false);
    fnGetLatlng();
    fnRemoveAnnotation([annotationId]);
  }


//鼠标拖动的回调函数
function fnDraggingCallBack(id){
  var lonlat = '';
  aMap.getAnnotationCoords({
    id: id
  }, function(ret) {
    if (ret) {
      lonlat = ret.lon.toFixed(6) + ',' + ret.lat.toFixed(6);
      fnRemoveOverlay([overlayId])
          fnChangeLonLat(id,lonlat)//改变经纬度
          fnGetLatlng();
        }
      });
}
//添加提示信息
function fnAddBubble(id){
 aMap.setBubble({
  id: id,
  content: {
    title: '请移动点位',
    subTitle: '按压点位并移动',
  },
  styles: {
    titleColor: '#000',
    titleSize: 16,
    subTitleColor: '#999',
    subTitleSize: 12,
    illusAlign: 'left'
  }
}, function(ret) {
  if (ret) {
    alert(JSON.stringify(ret));
  }
});
}
//保存并计算
function fnSaveAndCalculate(){
  var ids = [];
  $('#annotation-table').find('.mui-row').each(function(index,ele){
    var value = $(ele).find('[name=id]').val();
    if(value){
      ids.push(value);
    }
  })
  if(ids.length == 0){
    fnShowMessage('请先添加点位');return;
  }
  if(ids.length == 1){
    fnShowMessage('至少需要两个点位');return;
  }
  var arr = ids.join().split(',');
  var points = [];
  var points2 = [];
  var points3 = [];
  for(var i = 0 ; i < arr.length;i++){
    aMap.getAnnotationCoords({
      id: arr[i]
    }, function(ret) {
      if (ret) {
        points.push(new BMap.Point(ret.lon, ret.lat));
        points2.push({
          lon:ret.lon,
          lat:ret.lat
        });
        points3.push(new Number(ret.lon).toFixed(6)+','+new Number(ret.lat).toFixed(6));
      }
    });
  }
  fnShowProgress();
  setTimeout(function(){
    fnHideProgress();
    var area = BMapLib.GeoUtils.getPolygonArea(points);
    var girth = BMapLib.GeoUtils.getPolylineDistance(points);
    overlayId = fnAddPolygon([overlayId],points2);
    if( isNaN(area) || !girth ){
      fnShowMessage('请正确绘制点位');return;
    }
    fnChangeGirthAndArea((area).toFixed(2),(girth).toFixed(2),points3.join(';'));
    setTimeout(function(){
      api.closeWin({
          name: api.winName
      });
    },500)
  },1000);
}

//改变标注的经纬度
function fnChangeLonLat(id,lonlat){
  $('#annotation-table').find('.mui-row').each(function(index,ele){
    if($(ele).find('[name=id]').val() == id){
      $(ele).find('.lonlat').html(lonlat);
    }
  })
}
//改变面积和周长
function fnChangeGirthAndArea(area,girth,points){
  if(!area){area == 0.00};
  if(!girth){girth == 0.00};
  $('#area').html(area + '平方米');
  $('#girth').html(girth + '米');
    api.sendEvent({
        name: 'draw-changed',
        extra: {area: area, girth: girth,points:points}
    });
  doScript('fnChangeGirthAndArea',[area,girth,points],'unusual-register','unusual-register-win');
}

//判断时候为点位表格是否为空
function isTableEmpty(bool){
  if($('#annotation-table').find('.mui-row').length == 1 && bool){$('#empty').hide();}
  if($('#annotation-table').find('.mui-row').length == 1 && !bool){$('#empty').show();}
}

//保存点位信息
function fnGetLatlng(){
   var latlngs = [];
   $('#annotation-table').find('.mui-row').each(function (index,ele){
    var latlng = $(ele).find('.lonlat').html();
    if(latlng && latlng != ''){latlngs.push(latlng)}
  })
}

//获取当前的标注的所有点位信息
function fnGetPoints(){
  var points = [];
  $('#annotation-table').find('.mui-row').each(function(index,ele){
    var lonlat = $(ele).find('.lonlat').html();
    if(lonlat){
      var lonlatArr = lonlat.split(',');
      points.push({
        lon:lonlatArr[0],
        lat:lonlatArr[1]
      });
    }
  })
  return points;
}
