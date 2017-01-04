var g_curIp;
var g_curServiceId;
function showSvcPage(serviceId) {
	$('#myTab li:eq(1) a').tab('show');
	$('#debugArea').hide();
	for(var service of g_intance.serviceMap.values())
	{
		service.stopStat();
	}
	var service = g_intance.getService(serviceId);
	service.startStat();
	service.showMe();
	g_curServiceId = serviceId;
}

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
}

function ListSvcItemInfo(serviceId, obj)
{
	//$('#debugArea').hide();
	var service = g_intance.getService(serviceId);
	service.listSvcItemInfo(obj);
}

function ExecCmd() {
	var server = g_intance.getServer(g_curIp);
	server.execCmd(g_curServiceId, sql);
}

function StartService(){
	var service = g_intance.getService(g_curServiceId);
	service.start();
	service.showMe();
}

function StopService() {
	var service = g_intance.getService(g_curServiceId);
	service.stop();
	service.showMe();
}

function onOnlineDebugClick() {
	var service = g_intance.getService(g_curServiceId);
	if(document.getElementById("onlineDebugCheckBox").checked == true){
		document.getElementById("onlineDebugCheckBox").checked =true;
		service.openDebugFunc();
	}else{
		document.getElementById("onlineDebugCheckBox").checked =false;
		service.closeDebugFunc();
	}
}
function showDebug() {
	$('#debugArea').show();
	 $('#table').bootstrapTable('destroy');
}

function ClearAlert() {
	var server = g_intance.getServer(g_curIp);
	server.clearAlert(g_curServiceId);
	server.getAllService();
	showSvcPage(g_curIp, g_curServiceId);
}

function showSvcStat(serviceId) {
	var service = g_intance.getService(serviceId);
	service.showStat();
}

function showOperationLog() {
	var service = g_intance.getService(g_curServiceId);
	if (service == undefined)
		return;
	service.showOperationLog();
}

