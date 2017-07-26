/**
 * Created by jerry on 2016/12/22.
 */

function Service(server, serviceId) {
    this.serviceId = serviceId;
    this.alive = 'dead';
    this.statArray = [];
    this.listItem = [];
    this.statFileLocation = {};
    this.isDebugOpen = false;
    this.debugFileLocation = {};
    this.server = server;
};

Service.updataLag = 3000;

Service.prototype.setStatus = function (record) {
    this.monitor_data = record;
    if (this.monitor_data.status_run == 1 && this.monitor_data.status_alert == 0)
    {
        this.svcStyle = "svc_normal";
    }
    else if (this.monitor_data.status_run == 1 && this.monitor_data.status_alert == 1)
    {
        this.svcStyle = "svc_alter";
    }else{

        this.svcStyle = "svc_disconnect";
    }
    if (this.listItem.length == 0 && this.monitor_data.status_run == 1)
    {
        this.listSvcItem();
    }
    //this.svc_name= record.svc_name;
    //this.svc_region = record.svc_region;
    //this.status = record.status;
    //this.status_run = record.status_run;
    //this.status_alert = record.status_alert;
    //this.version = record.version;
    //this.uptime = record.uptime;
    //this.all_proc = record.all_proc;
    //this.unproc = record.unproc;
    //this.proc_speed = record.proc_speed;
    //this.online_client = record.online_client;
    //this.online_debug = record.online_debug;
};
Service.prototype.getStat = function (okFunc) {
    var para = {service_id:this.serviceId,  stat_file_location:this.statFileLocation};
    if (this.monitor_data.status_run == 1) {
        this.server.getState("GetSvcStat", para, okFunc);
    }
};

//关闭获取服务调试功能的定时器
Service.prototype.stopStat = function () {
  clearInterval(this.statTimer);
};

//获取单个功能码的具体通信信息
function GetSvcDebug(debugId) {
    var service = g_intance.getService(g_curServiceId);
    service.getDebugInfo(debugId);
}

function operateFormatter(value, row, index) {
    if (row.DebugId.length < 10)
    {
        return "";
    }
    var tmp = "<a href='#' onclick='GetSvcDebug(\"{0}\")' data-toggle='modal' data-target='#debugModal'><span class='glyphicon glyphicon-heart'></span></a>".format(row.DebugId);
    //console.log(tmp);
    return tmp;
}

Service.prototype.showStat = function () {
    	 $('#table').bootstrapTable('destroy');
		  var head = [
              {title:"调试信息", filed:'debug', formatter: operateFormatter, align: 'center', valign: 'middle'},
              {title: '来源',field:'src', align: 'center', valign: 'middle' },
              {title: '业务',field:'work', align: 'center', valign: 'middle' },
              {title: '结果',field: 'result', align: 'center', valign: 'middle'},
              {title: '时间',field: 'time', align: 'center', valign: 'middle'},
              {title: '备注',field: 'note', align: 'center', valign: 'middle'}
          ];
		$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);
		$('#table').bootstrapTable({
			columns:head,
			data:this.statArray,
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
        $('#table').on('expand-row.bs.table', function (e, index, row, $detail) {
        if (index % 2 == 1) {
            $detail.html('Loading from ajax request...');
            $.get('LICENSE', function (res) {
                $detail.html(res.replace(/\n/g, '<br>'));
            });
        }
    });
};

function showDebugInfo(data, serviceId) {
    var service = g_intance.getService(serviceId);
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
}

Service.prototype.getDebugInfo = function(debugID) {
    var tmpArr = debugID.split('-');
    var para = {service_id:this.serviceId, date:parseInt(tmpArr[0]), index:parseInt(tmpArr[1]), debug_file_location:parseInt(tmpArr[2])};
    this.server.serverRequest("GetSvcDebug",para, showDebugInfo);
}

Service.prototype.openDebugFunc = function(){
    if (!Boolean(this.isDebugOpen))
    {
        var para = {service_id:this.serviceId};
        this.server.serverRequest("OpenSvcDebug", para, "NULL", false);
        this.isDebugOpen = true;
    }
};

Service.prototype.closeDebugFunc = function() {
    var para = {service_id:this.serviceId};
    console.log("closeDebugFunc");
    this.server.serverRequest("CloseSvcDebug", para, "NULL", false);
    this.isDebugOpen = false;
};


Service.prototype.execCmd = function(sql, okFunc)
{
    var para = {service_id:this.serviceId, cmd: sql};
    this.server.serverRequest("ExecCmd", para, okFunc);
};

//获取某项监控项目的详细信息，如获取所有线程信息
Service.prototype.listSvcItemInfo = function (item, okFunc) {
    var para = {service_id:this.serviceId, object:item.id};
    this.server.serverRequest("ListSvcItemInfo", para, okFunc);
};

//获取监控项目列表(比如 线程，用户信息，等等)
Service.prototype.listSvcItem =  function()
{
    var para = {service_id:this.serviceId};
    var my = this;
    this.server.serverRequest("ListSvcItem", para, function(data) {
        var obj = JSON.parse(data);
        my.listItem = obj.records;
    });
};

//启动服务功能的处理回调函数
function dealStartService(response, serviceId) {
    var obj = JSON.parse(response);
    var code = obj.code;
    if (code >= 0)
    {
        $("#startIcon").css({"color":"#BEBFC0"});
        $("#stopIcon").css({"color":"red"});
        showTip("{0} 启动服务成功！".format(serviceId));
    }
    else{
        showTip("启动服务" + serviceId + "失败！失败原因请查看日志！")
    }
}

//启动服务功能
Service.prototype.start = function () {
    var para = {service_id:this.serviceId};
    if (this.monitor_data.status_run == 1){
        alert("当前服务已经启动");
    }
    else{ //当前为服务停止状态，点击后启动服务
        this.server.serverRequest("ExecCmdStart", para, dealStartService);
        showTip("{0} 服务启动中.....".format(this.serviceId));
    }
};

Service.prototype.clearAlert = function() {
  this.server.clearAlert(this.serviceId);
};

//停止服务功能的处理回调函数
function dealStopService(response, serviceId)
{
    var obj = JSON.parse(response);
    var code = obj.code;
    if (code >= 0)
    {
        showTip("启动停止成功！");
    }
    else{
        showTip("停止服务" + serviceId + "失败！失败原因请查看日志！")
    }
}

//停止服务功能
Service.prototype.stop = function () {
    var para = {service_id:this.serviceId};
    if (this.monitor_data.status_run == 1) {
        this.server.serverRequest("ExecCmdStop", para, dealStopService, false);
    }
    else {
        alert("当前服务已经停止");
    }
};

//获取服务的配置文件功能
Service.prototype.getXml = function (okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    this.server.serverRequest("GetSvcXml", para, okFunc);
};

function Appendzero(obj)
{
    if(obj<10) return "0" +""+ obj;
    else return obj;
}

Service.prototype.getCurDate = function(){
    var datetime = new Date();
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1;
    var date = datetime.getDate();
    return "{0}{1}{2}".format(year, Appendzero(month), date);
};

//保存服务配置文件到服务端功能
Service.prototype.saveXml = function(content, okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    para.content = content;
    this.server.serverRequest("SaveSvcXml", para, okFunc);
};

//获取当前服务的操作日志文件
Service.prototype.showLog = function (fileType, okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    if (fileType == '操作日志')
        para.fileName = "{0}_{1}.log".format(this.serviceId, this.getCurDate());
    else if (fileType == 'sql日志')
        para.fileName = "{0}_sql_{1}.log".format(this.serviceId, this.getCurDate());
    this.server.serverRequest("ListSvcLogInfo", para, okFunc);
}