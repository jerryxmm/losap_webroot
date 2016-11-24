function showSvcPage(serviceId) {
	var curObj = g_svcStatus.get(serviceId);
	if (curObj.status_run == 1)
	{
		funcName = "ListSvcItem";
		//serviceId = getQueryString("serviceId");
		var execFunc = funcName+'("'+serviceId + '")';
		eval(execFunc);
	}
	g_curSvc = serviceId;
    $('#monitorObject').empty();
	$('#table').bootstrapTable('destroy');
	initServicePage(serviceId);
}

function initServicePage(serviceId) {
	var curObj = g_svcStatus.get(serviceId);
	var serviceInfo = "版本号：{0}  启动时间：{1}".format(curObj.version, curObj.uptime);
	$('#serviceInfo').text(serviceInfo);
	$('#serviceName').text(serviceId);
	if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
	{
		$("#startIcon").css({"color":"#BEBFC0"});
		$("#stopIcon").css({"color":"red"});
	}
	else //当前为服务停止状态，点击后启动服务
	{
		$("#startIcon").css({"color":"green"});
		$("#stopIcon").css({"color":"#BEBFC0"});
	}
	$("#onlineDebug").css({"color":"#BEBFC0"});
	$("#debugTab").attr("isDebug","off");
}

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
} 

function ShowListSvcInfo(varData)
{
	//alert(varData);
	var table = parseJsonToTable(varData);
	//$('#grid').html(table);
}

function ShowListSvcItem(str, serviceId)
{
	  var obj = JSON.parse(str); 
      var head = obj.metadata;
      var records = obj.records;
      var monObjs = "";
      for (var i=0;i<records.length;i++)
      {
		  var rec = records[i];
		  if ( rec.show == 1)
		  {
			  var monObj = "<li><a href=\"#\" onclick=\"ListSvcItemInfo('{0}','{1}')\">{2}</a></li>".format(serviceId, rec.id,rec.name);
         	 monObjs += monObj;
		  }
      }
      $('#monitorObject').html(monObjs);
}

function ListSvcItemInfo(serviceId, obj)
{
	//alert("in ListSvcItemInfo:" + serviceId+ "/" +obj);
	var para = {service_id:serviceId, object:obj};
	getMonitorData(g_getStateUrl, "ListSvcItemInfo", '1.0', para, ShowListSvcInfo);
	g_serviceId = serviceId;
	g_object = obj;
}

function ShowListSvcInfo(varData)
{
	// var table = parseJsonToTable(varData);
	 $('#table').bootstrapTable('destroy');

     var table = JSON.parse(varData);
      if (table.metadata == undefined)
      {
      	return;
      }
      var metadata = table.metadata;
      var data = table.records;
      var head = [];
	  var rec = {};
      for(var i = 0; i < metadata.length; i++)
      {
		  var headCol = {title: metadata[i].ColDesc,field: metadata[i].ColName};
      	  head.push(headCol);
      }
	$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);
	$('#table').bootstrapTable({
		columns:head,
		data:data,
		striped: true,
		pagination: true,
		pageSize: 10,
		showRefresh: true,
		showToggle: true,
		cardView: false,
		showPaginationSwitch:true,
		showExport: false,
		exportDataType: "basic",
		search:true,
	});
}

function ListSvcInfo(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcInfo", '1.0', para, ShowListSvcInfo);
}

function ListSvcItem(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcItem", '1.0', para, ShowListSvcItem);
}


function ListSvcLog(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcLog", '1.0', para, ShowListSvcInfo);
}

function ListSvcLogInfo(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcLogInfo", '1.0', para, ShowListSvcInfo);
}

function execCmd()
{
	var sql = $("#sqlText").val();
	var para = {service_id:g_curSvc, cmd: sql};
	getMonitorData(g_actionMonitorUrl,"ExecCmd", '1.0', para, ShowListSvcInfo);
}

var g_debugTimerId;
var g_debugFileLocation = {};
var g_continueGetDebug = true;
function startDebug() {
	var isDebug = $("#debugTab").attr("isDebug");
	if (isDebug == "off")
	{
		$("#debugTab").attr("href", "#debugPage");
		$("#debugTab").attr("isDebug", "on");
		$("#onlineDebug").css({"color":"green"});
		openDebugFunc();
		g_debugTimerId = setInterval("getDebugInfo()",g_updateLag);
	}
	else
	{
		$("#debugTab").attr("href", "#svcPage");
		$("#debugTab").attr("isDebug", "off");
		$("#onlineDebug").css({"color":"#BEBFC0"});
		closeDebugFunc();
		clearInterval(g_debugTimerId);
	}
}

function openDebugFunc(){
	var para = {service_id:g_curSvc};
	getMonitorData(g_actionMonitorUrl,"OpenSvcDebug", '1.0', para, "NULL");
}

function closeDebugFunc() {
		var para = {service_id:g_curSvc};
	getMonitorData(g_actionMonitorUrl,"CloseSvcDebug", '1.0', para, "NULL");
}

var g_debugPackets = new Map();
function showDebugModal(fileLocation) {
	$('#debugModalBody').treeview("destory");
	var packet = g_debugPackets.get(parseInt(fileLocation));
	var nodeReq = {text: '请求', nodes:[]};
	$.each(packet.Req, function (name, value) {
		var node = {text: "{0} = {1}".format(name, value)};
		nodeReq.nodes.push(node);
	});
	var nodeRsp = {text: '回复', nodes:[]};
	var rsps = packet.Rsp;
	for(var i = 0; i < rsps.length; i++)
	{
		var node = {text:"{0}".format(i+1), nodes:[]};
		var rsp = rsps[i];
		if (rsp == undefined)
			continue;
		$.each(rsp, function (name, value) {
			var leaf = {text:"{0} = {1}".format(name, value)}
			node.nodes.push(leaf);
		});
		nodeRsp.nodes.push(node);
	}
	var tree =[nodeReq, nodeRsp];
	$('#debugModalBody').treeview({
		data:tree
	});
}
// function showDebugModal(fileLocation) {
// 	var packet = g_debugPackets.get(parseInt(fileLocation));
// 	$('#debugModalLabel').html("文件位置:" + fileLocation);
// 	var content = "";
// 	content += "<p>请求：</p>";
// 	content += "<p>{0}</p>".format(JSON.stringify(packet.Req));
// 	content += "<p>回应：</p>";
// 	content += "<ul>"
// 	var rsp = packet.Rsp;
// 	for(var i = 0; i < rsp.length; i++)
// 	{
// 		content += "<li><p>{0}</p></li>".format(JSON.stringify(rsp[i]));
// 	}
// 	content += "</ul>";
// 	$('#debugModalBody').html(content);
// }

function showDebugInfo(data) {
	console.log(data);
	var obj = JSON.parse(data);
	g_debugFileLocation = obj.file_location;
	g_continueGetDebug == true;
	var packets = obj.packets;
	if (packets == undefined)
		return;
	for(var i = 0; i < packets.length; i++)
	{
		var packet = packets[i];
		g_debugPackets.set(packet.fileLocation, packet);
		var pak = g_debugPackets.get(packet.fileLocation);
		var li = "<li class=\"list-group-item list-group-item-danger\"><a herf='#' onclick=\"showDebugModal('{0}')\" data-toggle='modal' data-target='#debugModal'>PacketID:{1}</a></li>".format(packet.fileLocation, packet.fileLocation);
		$('#debugArea').append(li);
	}
}

function getDebugInfo() {
	if (g_continueGetDebug == false)
		return;
	g_continueGetDebug == false;
	var para = {service_id:g_curSvc, file_location:g_debugFileLocation};
	getMonitorData(g_actionMonitorUrl,"GetSvcDebug", '1.0', para, showDebugInfo);
}

