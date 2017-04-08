/**
 * Created by jerry on 2016/12/22.
 */

function Service(serverIP, serviceId) {
    this.serviceId = serviceId;
    this.serverIp = serverIP;
    this.alive = 'dead';
    this.svc_name='';
    this.svc_region = '';
    this.status = '';
    this.status_run = 0;
    this.status_alert = 0;
    this.version = '';
    this.uptime = '';
    this.all_proc = 0;
    this.unproc = 0;
    this.proc_speed = 0;
    this.online_client = 0;
    this.online_debug = 0;

    this.viewId="id_{0}_view".format(this.serviceId);
    this.allProcId = "id_{0}_allProc".format(serviceId);
    this.unProcId = "id_{0}_unProc".format(serviceId);
    this.procSpeedId = "id_{0}_procSpeed".format(serviceId);
    this.onlineClientId = "id_{0}_onlineClient".format(serviceId);
    this.sideBarId = "id_{0}_sideBar".format(serviceId);
    this.viewNameId="id_{0}_name".format(this.serviceId);
    this.statArray = [];
    this.isSvcItemInit = false;
    this.listItemLis = "<li><a href='#' data-toggle='tab' onclick=\"showSvcStat('{0}')\">业务状况</a></li>".format(serviceId);
    this.statFileLocation = {};
    this.isDebugOpen = false;
    this.debugFileLocation = {};
};

Service.updataLag = 3000;

Service.prototype.setStatus = function (record) {
    this.svc_name= record.svc_name;
    this.svc_region = record.svc_region;
    this.status = record.status;
    this.status_run = record.status_run;
    this.status_alert = record.status_alert;
    this.version = record.version;
    this.uptime = record.uptime;
    this.all_proc = record.all_proc;
    this.unproc = record.unproc;
    this.proc_speed = record.proc_speed;
    this.online_client = record.online_client;
    this.online_debug = record.online_debug;
};

Service.prototype.updateUi = function () {
    var svcStyle = "", userColor="";
    var color;
    var icon;
    if (this.status_run == 1 && this.status_alert == 0)
    {
        userColor = "#90C083";
        svcStyle = "svc_normal";
        icon = 'glyphicon glyphicon-play';
        color = 'green';
    }
    else if (this.status_run == 1 && this.status_alert == 1)
    {
        userColor = "#AE4141";
        svcStyle = "svc_alter";
        icon = 'glyphicon glyphicon-play';
        color = 'red';
    }else{
        userColor = "gray";
        svcStyle = "svc_disconnect";
        icon = 'glyphicon glyphicon-stop';
        color = 'gray';
    }

    $("#" + this.viewId).attr('class', svcStyle);
	$("#" + this.allProcId).text(this.all_proc);
	$("#" + this.unProcId).text(this.unproc);
	$("#" + this.procSpeedId).text(this.proc_speed);
	$("#" + this.onlineClientId).text(this.online_client);
    $("#" + this.onlineClientId).css("color", userColor);
    $("#" + this.viewNameId).text(this.serviceId);
    // $("#" + this.sideBarId+"> span").attr("class", icon);
    // $("#" + this.sideBarId+"> span").css("color", color);
    var con = "<span class='{0}' style='color:{1}'></span>{2}".format(icon, color, this.serviceId);
    $("#" + this.sideBarId+"> a").html(con);
};

Service.prototype.setStat = function (response) {
    var obj = JSON.parse(response);
    var records = obj.records;
    this.statFileLocation = obj.file_location;
    if (records == undefined)
        return;
    if (g_curServiceId == this.serviceId)
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
}

function dealGetSvcStat(response, serviceId) {
    //console.log(response);
    var service = g_intance.getService(serviceId);
    service.setStat(response);
}

Service.prototype.getStat = function () {
    this.updateHead();
    var server = g_intance.getServer(this.serverIp);
    var para = {service_id:this.serviceId,  file_location:this.statFileLocation};
    if (this.status_run == 1) {
        server.serverRequest("GetSvcStat", para, dealGetSvcStat);
    }
};

//开启获取服务调试功能的定时器
Service.prototype.startStat = function () {
    this.statTimer = setInterval("g_intance.serviceMap.get('{0}').getStat()".format(this.serviceId) ,Service.updataLag);
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
              {title:" ", filed:'debug', formatter: operateFormatter, align: 'center', valign: 'middle'},
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
			// showRefresh: true,
			// showToggle: true,
			// showPaginationSwitch:true,
			// search:true,
		});
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
    service.debugFileLocation = obj.file_location;
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
    var server = g_intance.getServer(this.serverIp);
    var tmpArr = debugID.split('-');
    var para = {service_id:this.serviceId, date:parseInt(tmpArr[0]), index:parseInt(tmpArr[1]), file_location:parseInt(tmpArr[2])};
    server.serverRequest("GetSvcDebug",para, showDebugInfo);
}

Service.prototype.openDebugFunc = function(){
    if (!Boolean(this.isDebugOpen))
    {
        var para = {service_id:this.serviceId};
        var server = g_intance.getServer(this.serverIp);
        server.serverRequest("OpenSvcDebug", para, "NULL", false);
        $('#debugArea').empty();
        this.isDebugOpen = true;
    }
};

Service.prototype.closeDebugFunc = function() {
    var para = {service_id:this.serviceId};
    var server = g_intance.getServer(this.serverIp);
    console.log("closeDebugFunc");
    server.serverRequest("CloseSvcDebug", para, "NULL", false);
    $('#debugArea').empty();
    this.isDebugOpen = false;
};


Service.prototype.execCmd = function()
{
    var sql = $("#sqlText").val();
    var para = {service_id:this.serviceId, cmd: sql};
    var server = g_intance.getServer(this.serverIp);
    server.serverRequest("ExecCmd", para, ShowListSvcInfo);
}

function ShowListSvcInfo(response)
{
     $('#table').bootstrapTable('destroy');
     var table = JSON.parse(response);
      if (table.metadata == undefined) {
        return;
      }
      var metadata = table.metadata;
      var data = table.records;
      var head = [];
      var rec = {};
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
        // showExport: false,
        // exportDataType: "basic",
        // search:true,
    });
};

//获取某项监控项目的详细信息，如获取所有线程信息
Service.prototype.listSvcItemInfo = function (obj) {
    var para = {service_id:this.serviceId, object:obj};
    var server = g_intance.getServer(this.serverIp);
    server.serverRequest("ListSvcItemInfo", para, ShowListSvcInfo);
};

//获取监控项目列表的处理回调函数
function ShowListSvcItem(str, serviceId)
{
     var service = g_intance.getService(serviceId);
      var obj = JSON.parse(str);
      var records = obj.records;
      if (records == undefined)
          return;
      var lis = "";
      for (var i=0;i<records.length;i++)
      {
          var rec = records[i];
          if ( rec.show == 1)
          {
              lis += "<li><a href='#' data-toggle='tab' onclick=\"ListSvcItemInfo('{0}','{1}')\">{2}</a></li>".format(service.serviceId, rec.id,rec.name);
          }
      }
    service.listItemLis += lis;
    service.isSvcItemInit = true;
}

//获取监控项目列表(比如 线程，用户信息，等等)
Service.prototype.listItem =  function()
{
    if(this.status_run != 1)
        return;
    var para = {service_id:this.serviceId};
    var server = g_intance.getServer(this.serverIp);
    server.serverRequest("ListSvcItem", para, ShowListSvcItem, false);
};

//刷新单个服务监控信息
Service.prototype.updateHead = function () {
     var server = g_intance.getServer(this.serverIp);
    $('#serviceName').text(this.serviceId);
    $('#id_svc_cpu').text('CPU:{0}'.format(server.serverInfo.CPU));
     $('#id_svc_mem').text('MEM:{0}'.format(server.serverInfo.MemUsedPercent));
     $('#id_allProc').text('全部笔数:{0}'.format(this.all_proc));
     $('#id_unProc').text('未处理数:{0}'.format(this.unproc));
     $('#id_procSpeed').text('处理速度:{0}'.format(this.proc_speed));
     $('#id_next_conn').text('下级连接:{0}'.format(0));
     $('#id_threadNum').text('总线程数:{0}'.format(0));
     $('#id_workNum').text('总服务数:{0}'.format(0));
     $('#id_global').text('全局事务:{0}'.format(0));
     $('#id_atomic').text('原子事务:{0}'.format(0));
     $('#id_subscribe').text('订阅数量:{0}'.format(0));
     $('#id_sess').text('会话统计:{0}'.format(0));
     $('#id_svc_version').text('版本:{0}'.format(this.version));
     $('#id_svc_startTime').text('启动时间:{0}'.format(this.uptime));
    if (this.status_run == 1) //当前为启动状态，点击后停止服务
    {
        $("#startIcon").css({"color":"#BEBFC0"});
        $("#stopIcon").css({"color":"red"});
        $('#onlineDebugCheckBox').removeAttr("disabled");
        if (this.online_debug == 1){
            document.getElementById("onlineDebugCheckBox").checked=true;
        }else{
            document.getElementById("onlineDebugCheckBox").checked=false;
        }
    }
    else //当前为服务停止状态，点击后启动服务
    {
        $("#startIcon").css({"color":"green"});
        $("#stopIcon").css({"color":"#BEBFC0"});
        $('#onlineDebugCheckBox').attr('disabled', 'true');
        $('#onlineDebugCheckBox').removeAttr('checked');
    }
}

//切换显示当前选中的服务监控信息
Service.prototype.showMe = function () {
    this.updateHead();
    if (!Boolean(this.isSvcItemInit))
    {
        this.listItem();
    }
    $('#monitorItemNav').empty();
    $('#monitorItemNav').html(this.listItemLis);
    $('#monitorItemNav a:first').tab('show');
    this.showStat();
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
    var server = g_intance.getServer(this.serverIp);
    var para = {service_id:this.serviceId};
    if (this.status_run == 1){
        alert("当前服务已经启动");
    }
    else{ //当前为服务停止状态，点击后启动服务
        server.serverRequest("ExecCmdStart", para, dealStartService);
        showTip("{0} 服务启动中.....".format(this.serviceId));
    }
};

//停止服务功能的处理回调函数
function dealStopService(response, serviceId)
{
    var obj = JSON.parse(response);
    var code = obj.code;
    if (code >= 0)
    {
        $("#startIcon").css({"color":"green"});
        $("#stopIcon").css({"color":"#BEBFC0"});
        showTip("启动停止成功！");
    }
    else{
        showTip("停止服务" + serviceId + "失败！失败原因请查看日志！")
    }
}

//停止服务功能
Service.prototype.stop = function () {
    var server = g_intance.getServer(this.serverIp);
    var para = {service_id:this.serviceId};
    if (this.status_run == 1) {
        server.serverRequest("ExecCmdStop", para, dealStopService, false);
    }
    else {
        alert("当前服务已经停止");
    }
};

//获取服务的配置文件功能的处理回调函数
function dealSvcXml(response) {
    var obj = JSON.parse(response)
    if (obj.code < 0)
    {
        alert("获取配置文件失败！");
        return;
    }
    var xml = obj.content;
    $('#xmlContent').val(xml);
};
//获取服务的配置文件功能
Service.prototype.getXml = function () {
    var para = {};
    para.service_id = this.serviceId;
    var server = g_intance.getServer(this.serverIp);
    server.serverRequest("GetSvcXml", para, dealSvcXml);
};

//保存服务配置文件到服务端功能
Service.prototype.saveXml = function(content) {
    var server = g_intance.getServer(this.serverIp);
    var para = {};
    para.service_id = this.serviceId;
    para.content = content;
    server.serverRequest("SaveSvcXml", para, "NULL");
    $('#xmlContent').val('');
    showTip("配置文件保存成功");
};

//获取当前服务的操作日志文件功能的回调函数
function dealShowOperationLog(response) {
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
}

//获取当前服务的操作日志文件
Service.prototype.showOperationLog = function () {
    var server = g_intance.getServer(this.serverIp);
    var para = {};
    para.service_id = this.serviceId;
    server.serverRequest("ListSvcLogInfo", para, dealShowOperationLog);
}