//初始化组件
function fnInitComponent(components){
    $('.component').hide();
    if (components && components.length > 0) {
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            $('.' + component).show();
        }
    }
}
