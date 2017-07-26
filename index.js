/**
 * Created by jerry on 17-7-17.
 */
var app = angular.module("app", ["ui.router"]);
app.config(function ($stateProvider, $urlRouterProvider) {
     $urlRouterProvider.when("", "/overView");
     $stateProvider
        .state("overView", {
            url:"/overView",
            templateUrl: "view/overView.html",
            controller:'overView_ctrl',
        }).state("detailView", {
            params:{"serviceName":null},
            url:"/detailView",
            templateUrl: "view/detailView.html",
            controller:'detailView_ctrl',
        }).state("addMonitorService", {
            url:"/addMonitorService",
            templateUrl: "maintance/addMonitorService.html",
        }).state("removeMonitorService", {
            url:"/removeMonitorService",
            templateUrl: "maintance/removeMonitorService.html"
        }).state("addService", {
            url:"/addService",
            templateUrl: "maintance/addService.html"
        }).state("removeService", {
            url:"/removeService",
            templateUrl: "maintance/removeService.html",
            controller:'removeService_ctrl'
        }).state("modService", {
            url:"/modService",
            templateUrl: "maintance/modService.html",
            controller:'modService_ctrl',
        }).state("update", {
            url:"/update",
            templateUrl: "maintance/update.html"
        });
});

var detailViewScope;
var overViewScope;
app.controller('pageTab_ctrl', ['$scope','$interval','$location','$state',
    function($scope, $interval, $location, $state){
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    setLoginUser();
    $(".fakeloader").fakeLoader({
        timeToHide:2300,
        bgColor:"#3498db",
        spinner:"spinner4"
    });
    function setLoginUser()
    {
        $.ajax({
            url:"/action/getLoginUser",
            type:"POST",
            success :function(response){
                g_intance = new Manager();
                g_intance.init(response, function(){
                    if (getQueryString('servicename') != undefined)
                    {
                        $state.go('detailView', {serviceName:getQueryString('servicename')});
                    }
                });
                $scope.userName = response;
                fresh();
            },
            error: function() {
                showTip("获取用户名失败!");
            }
        });
    };
    function fresh(){
        console.log("in index interval!!!");
        var serverList = g_intance.serverList();
        for (var i = 0; i < serverList.length; i++) {
            var server = serverList[i];
            server.getSvcStatu();
        }
        if (overViewScope != undefined)
            overViewScope.fresh();
    };
    $interval(fresh, 3000, 0);
}]);

function doOnResize() {
    $('#mainBody').height(Math.round(document.documentElement.clientHeight*0.56));
}

function confirmDialog(tips, okFun) {
    var index = layer.confirm(tips, {
        btn: ['取消','确认'], //按钮
        shade: false //不显示遮罩
    },
    function ()
    {
        console.log("cancel");
        layer.closeAll();
    },
        okFun
    );

    layer.style(index, {
        top: '200px'
    });
}