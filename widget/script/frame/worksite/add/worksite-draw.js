mui.init();
var mapHeight; //map的高度
var headerHeight;
var id = 0;
var overlayId;//区域描线id
apiready = function() {
  mapHeight = api.frameHeight * 0.6;
  headerHeight = api.pageParam.headerHeight;
  fnInitMap();
  fnOpenMap();
};
//初始化地图
function fnOpenMap(){
    aMap.open({
      rect: {
        x: 0,
        y: 0,
        w: api.frameWidth,
        h: mapHeight
      },
      showUserLocation: true,
      zoomLevel: 14,
      fixedOn: api.frameName,
      fixed: true
    }, function(ret, err) {
        $('#footer').css('top',mapHeight);//初始化bottom高度
   });
}
//设置地图属性
function fnInitMapAttr(){
  aMap.setMapAttr({
      type: 'standard',
      trafficOn: true,
      zoomEnable: true,
      scrollEnable: false,
      building: false,
      overlookEnabled: false,
      rotateEnabled: false
  });
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
      var appendStr = '<div class="mui-row"><input type="hidden" name="id" value="'+id+'"/>'+
                        '<div class="mui-col-sm-1 mui-col-xs-1"><span class="my-circle">' + id + '</span></div>'+
                        '<div class="mui-col-sm-7 mui-col-xs-7" style="text-align:center;" ><span class="lonlat">' + lonlat + '</span></div>'+
                        '<div class="mui-col-sm-4 mui-col-xs-4">'+
                           '<div class="mui-btn mui-btn-primary" style="margin-right:5px;" onclick="fnCorAnnotation('+id+')" tapmode="mui-active">纠错</div>'+
                           '<div class="mui-btn mui-btn-danger" onclick="fnDelAnnotation('+id+')" tapmode="mui-active">删除</div>'+
                        '</div>'+
                      '</div>';
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
            }
        });
    }
    fnShowProgress();
    setTimeout(function(){
        fnHideProgress();
        var area = BMapLib.GeoUtils.getPolygonArea(points);
        var girth = BMapLib.GeoUtils.getPolylineDistance(points);
        overlayId = fnAddPolygon([overlayId],points2);
        fnChangeGirthAndArea((area/1000000).toFixed(2),(girth/1000).toFixed(2))
    },2000)
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
function fnChangeGirthAndArea(area,girth){
    if(!area){area == 0.00};
    if(!girth){girth == 0.00};
    $('#area').html(area);
    $('#girth').html(girth);
    doScript('fnChangeGirthAndArea',[area,girth],'worksite-info');
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
   doScript('fnChangeLatlng',[latlngs.join(';')],'worksite-info');
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