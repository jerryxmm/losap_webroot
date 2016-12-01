var g_curIp;
var g_curServiceId;
function showSvcPage(ip, serviceId) {
	var curObj = g_intance.getSvc(ip, serviceId);
	var server = g_intance.getServer(ip);
	server.initServicePage(serviceId);
	if (curObj.status_run == 1) {
		server.listSvcItem(serviceId);
	}
	g_curIp = ip;
	g_curServiceId = serviceId;
}

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
}

function ListSvcItemInfo(ip, serviceId, obj)
{
	var server = g_intance.getServer(ip);
	server.listSvcItemInfo(serviceId, obj);
}

function ExecCmd() {
	var server = g_intance.getServer(g_curIp);
	var sql = $("#sqlText").val();
	server.execCmd(g_curServiceId, sql);
}

function StartService(){
	var server = g_intance.getServer(g_curIp);
	server.startSvc(g_curServiceId);
}

function StopService() {
	var server = g_intance.getServer(g_curIp);
	server.stopSvc(g_curServiceId);
}

function startDebug() {
	var isDebug = $("#debugTab").attr("isDebug");
	var server = g_intance.getServer(g_curIp);
	if (isDebug == "off")
	{
		server.openDebugFunc(g_curServiceId);
	}
	else
	{
		server.closeDebugFunc(g_curServiceId);
	}
}

function showDebugModal(ip, fileLocation) {
	var server = g_intance.getServer(ip);
	var treeData = server.showDebugModal(fileLocation);
	$('#debugModalBody').treeview({
		data:treeData
	});
}



