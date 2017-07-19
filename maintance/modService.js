/**
 * Created by jerry on 17-7-17.
 */
app.controller("modService_ctrl", ['$scope','$timeout', function($scope, $timeout){
	$scope.fresh = function (){
		if (g_intance.readyFinish)
		{
			$scope.serviceList = g_intance.serviceList();

		}else{
			$timeout(function() {
				$scope.serviceList = g_intance.serviceList();
			},500);
		}
	};
	$scope.fresh();
	$scope.xmlContent = '';
	$scope.showXmlConfig = function(svc){
		$scope.curSvc = svc;
		layer.load(1, {shade: [0.5,'#fff']});
		$scope.curSvc.getXml(function(response){
			//获取服务的配置文件功能的处理回调函数
			var obj = JSON.parse(response);
			if (obj.code < 0)
			{
				alert("获取配置文件失败！");
				return;
			}
			$scope.xmlContent = obj.content;
			layer.closeAll();
		});
	};

	$scope.saveXmlConfig = function(){
		$scope.curSvc.saveXml($scope.xmlContent, function(response){
			var obj = JSON.parse(response);
			if(obj.code > 0)
			{
				showTip('配置文件保存成功');
			}else {
				showTip('配置文件保存失败！');
			}
		});
	};
    $('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
    $('#monitorLog').hide();

	$('#modServiceSidebar >ul >li > a').click(function(e)
	{
		e.preventDefault();
		//var sidebar = $('#modServiceSidebar');
		var li = $(this).parents('li');
		var lis = $('#modServiceSidebar li');
		for(var i = 0; i < lis.length; i++){
			var curLi = lis[i];
			$(curLi).attr("class", "");
		}
		$(li).attr("class", "active");
	});
}]);