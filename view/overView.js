/**
 * Created by jerry on 17-7-18.
 */

app.controller("overView_ctrl", ['$scope','$interval', function($scope, $interval){
    $scope.fresh = function(){
        $scope.serverList = g_intance.serverList();
        $scope.serviceList = g_intance.serviceList();
    };
    doOnResize();
    overViewScope = $scope;
    $scope.showSvcPage = function(svc)
    {
        if (detailViewScope != undefined)
        {
            detailViewScope.setCurSvc(svc);
        }
        g_intance.setCurSvc(svc);
    };
   // $scope.fresh();
}]);