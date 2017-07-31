app.controller("removeService_ctrl", ['$scope','$timeout', function($scope, $timeout){
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
    $scope.removeMonitorService = function (svc) {
        confirmDialog('您确认要删除服务吗？', function(){
			svc.server.removeSvc(svc.serviceId, function(response){
				var rsp = JSON.parse(response);
				var code = parseInt(rsp.code);
				if (code == 0) {
					showTip("服务删除成功！");
				} else{
					showTip("服务删除失败！");
				}
				for(var i = 0; i < svc.server.monitorService.length; i++){
					if (svc.server.monitorService[i] == svc.serviceId){
						svc.server.monitorService.splice(i, 1);
					}
				}
				g_intance.removeService(svc.serviceId);
				saveMonitorConfig();
				$scope.serviceList = g_intance.serviceList();
				$scope.$apply();
			});
        });
    };
    $('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
    $('#monitorLog').hide();
}]);