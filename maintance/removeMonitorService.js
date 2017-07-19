app.controller("removeMonitorService_ctrl", ['$scope','$timeout', function($scope, $timeout){
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
    };
    $('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
    $('#monitorLog').hide();
}]);

function saveMonitorConfig() {
	var svrLst = [];
	g_intance.serverMap.forEach(function (server, ip) {
		var item = {ip:ip,port:server.port, cipher:server.cipher,user:server.userName, monitor_service:server.monitorService};
		svrLst.push(item);
	});
	var content = {user:g_intance.localServer.userName, monitor:svrLst};
	g_intance.localServer.saveToServer(JSON.stringify(content));
}