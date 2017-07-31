/**
 * Created by jerry on 17-7-18.
 */
app.controller("detailView_ctrl", ['$scope', '$interval', '$timeout', '$stateParams',
    function($scope, $interval, $timeout, $stateParams){

    $scope.initStat = function () {
    	 $('#table').bootstrapTable('destroy');
		  var head = [
              {title:"调试信息", filed:'debug', align: 'center', valign: 'middle',formatter: function(value, row, index){
                  return "<a href='#' ng-click='getSvcDebug(\"{0}\")' data-toggle='modal' data-target='#debugModal'>".format(row.DebugId) +
                      "<span class='glyphicon glyphicon-heart'></span></a>";
              }},
              {title: '来源',field:'src', align: 'center', valign: 'middle' },
              {title: '业务',field:'work', align: 'center', valign: 'middle' },
              {title: '结果',field: 'result', align: 'center', valign: 'middle'},
              {title: '时间',field: 'time', align: 'center', valign: 'middle'},
              {title: '备注',field: 'note', align: 'center', valign: 'middle'}
          ];
		$('#table').bootstrapTable({
			columns:head,
			data:$scope.curSvc.statArray,
            // detailView: true,
			// striped: true,
			// pagination: true,
			// pageSize: 10,
			 showRefresh: true,
			 showToggle: true,
			 showPaginationSwitch:true,
             height: Math.round(window.screen.availHeight*0.4),
			 search:true,
		});
        $('#table').attr('curPage', '业务状况');
    };

    $scope.fresh = function (){
		if (g_intance.readyFinish)
		{
			$scope.serviceList = g_intance.serviceList();
            $scope.curSvc = g_intance.getService($stateParams.serviceName);
            $scope.initStat();
		}else{
			$timeout(function() {
				$scope.serviceList = g_intance.serviceList();
                $scope.curSvc = g_intance.getService($stateParams.serviceName);
                $scope.initStat();
			},500);
		}
        doOnResize();
        $('#monitorLog').show();
	};
	$scope.fresh();

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);

    function showDebugInfo(data) {
        var service = $scope.curSvc;
        var obj = JSON.parse(data);
        service.debugFileLocation = obj.debug_file_location;
        var packet = obj.packet;
        if (packet == undefined)
            return;

        var nodeReq = {text: '请求', nodes:[]};
        $.each(packet.Req, function (name, value) {
            var node = {text: "{0} = {1}".format(name, value)};
            nodeReq.nodes.push(node);
        });
        var nodeRsp = {text: '回复', nodes:[]};
        var rsps = packet.Rsp;
        if (rsps != undefined) {
            for (var i = 0; i < rsps.length; i++) {
                var node = {text: "{0}".format(i + 1), nodes: []};
                var rsp = rsps[i];
                if (rsp == undefined)
                    continue;
                $.each(rsp, function (name, value) {
                    var leaf = {text: "{0} = {1}".format(name, value)}
                    node.nodes.push(leaf);
                });
                nodeRsp.nodes.push(node);
            }
        }
        var tree =[nodeReq, nodeRsp];
        $('#debugModalBody').treeview({
            data:tree
        });
    };
    $interval(function(){
        if ($('#table').attr('curPage') == "业务状况")
        {
            $('#table').bootstrapTable("load", $scope.curSvc.statArray);
        }
    }, 3000, 0);
    //获取单个功能码的具体通信信息
    $scope.getSvcDebug = function(debugId) {
        $scope.curSvc.getDebugInfo(debugId, showDebugInfo);
    };

    $scope.setCurSvc = function(svc){
        $scope.curSvc = svc;
    };

    $scope.sqlText = "";
    $scope.startService = function(){
        $scope.curSvc.start();
    };
    $scope.stopService = function() {
        $scope.curSvc.stop();
    };
    $scope.clearAlert = function() {
        $scope.curSvc.clearAlert();
    };
    $scope.showOperationLog = function() {
        $scope.curSvc.showLog('操作日志', dealShowLog);
    };
    $scope.showSqlLog = function() {
        $scope.curSvc.showLog('sql日志', dealShowLog);
    };
    $scope.onOnlineDebugClick = function () {
        if ($scope.curSvc.monitor_data.online_debug == 1) {
            $scope.curSvc.openDebugFunc();
        }else{
            $scope.curSvc.closeDebugFunc();
        }
    };
    $scope.execCmd = function(){
        $scope.curSvc.execCmd($scope.sqlText, showListSvcInfo);
    };
    $scope.ListSvcItemInfo = function(item)
    {
        $('#table').attr('curPage', item);
        $scope.curSvc.listSvcItemInfo(item, showListSvcInfo);
    };
    detailViewScope = $scope;
}]);

//获取当前服务的操作日志文件功能的回调函数
function dealShowLog(response) {
    console.log(response);
    var obj = JSON.parse(response)
    if (obj.code < 0)
    {
        alert("获取配置文件失败！");
        return;
    }
    $('#operationLogContentId').text(obj.content);
    $('#operationLogFileNameId').text(obj.FileName);
	$('#operationLogDlg').modal('show');
};

function showListSvcInfo(response)
{
     $('#table').bootstrapTable('destroy');
     var table = JSON.parse(response);
      if (table.metadata == undefined) {
        return;
      }
      var metadata = table.metadata;
      var data = table.records;
      var head = [];
      if (metadata != undefined)
      {
          for(var i = 0; i < metadata.length; i++)
          {
              var headCol = {title: metadata[i].ColDesc,field: metadata[i].ColName};
              head.push(headCol);
          }
      }
    $('#table').bootstrapTable({
        columns:head,
        data:data,
         striped: true,
         pagination: true,
         pageSize: 10,
        // showRefresh: true,
        // showToggle: true,
        // cardView: false,
        // showPaginationSwitch:true,
         showExport: false,
         height: Math.round(window.screen.availHeight*0.4),
         exportDataType: "basic",
         search:true,
    });
};