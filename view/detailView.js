/**
 * Created by jerry on 17-7-18.
 */
app.controller("detailView_ctrl", ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout){
    $scope.fresh = function (){
		if (g_intance.readyFinish)
		{
			$scope.serviceList = g_intance.serviceList();
            $scope.curSvc = g_intance.getCurSvc();
		}else{
			$timeout(function() {
				$scope.serviceList = g_intance.serviceList();
                $scope.curSvc = g_intance.getCurSvc();
                $scope.showSvcStat();
			},500);
		}
        doOnResize();
	};
	$scope.fresh();

    $interval(function(){
        console.log("in detailView interval!!!");
        if ($scope.curSvc != undefined)
        {
            $scope.curSvc.getStat(function(response){
                var obj = JSON.parse(response);
                var records = obj.stats;
                $scope.curSvc.statFileLocation = obj.stat_file_location;
                if (records == undefined)
                    return;
                if ($('#table').attr('curPage') == '业务状况')
                {
                    var appendArray = [];
                    for(var i = 0; i < records.length; i++)
                    {
                        var rec = records[i];
                        var src = rec.Head.split('|');
                        var work = "{0}({1})".format(rec.Func, rec.FName);
                        var showTime = "{0}({1})".format(rec.time, rec.use);
                        var note ="{0}  thrid:{1} sid:{2}".format(rec.Dest, rec.ThreadIndex, rec.SessId);
                        var debugId = rec.DebugId;
                        var kk = {src: src[3], work: work, result: rec.Code, time:showTime, note: note, DebugId:debugId};
                        appendArray.push(kk);
                        this.statArray.push(kk);
                    }
                    $('#table').bootstrapTable('append', appendArray);
                }
            });
        }
    }, 3000, 0);
    $scope.setCurSvc = function(svc){
        $scope.curSvc = svc;
    };

    $scope.showSvcStat = function() {
        $scope.curSvc.showStat();
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
    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);
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