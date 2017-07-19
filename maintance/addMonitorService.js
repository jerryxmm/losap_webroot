/**
 * Created by jerry on 17-7-18.
 */
function addMonitorService() {
	var ip = $('#serverIP').val();
	var port = $('#serverPort').val();
	var serviceId = $('#serviceId').val();
	var svc = g_intance.getService(serviceId);
	if (svc != undefined)
	{
		showTip("监控服务名已经存在，添加监控失败！");
		return;
	}
	//服务器不存在则进入新增服务器流程
	var server = g_intance.getServer(ip);
	if (server == undefined)
	{
		var userName = $('#serverUser').val();
		var pass = $('#serverPassword').val();
		loginForeignServer(serviceId, ip, port, userName, pass);
	}

	server = g_intance.getServer(ip);
	if (server == undefined)
	{
		showTip("服务器监控服务未启动，添加监控失败！");
		return;
	}
	if ( server.allService.indexOf(serviceId) > -1) {
		var service = new Service(ip, serviceId);
		server.monitorService.push(serviceId);
		g_intance.addService(service);
		g_intance.initUi();
		g_intance.updateUi();
		saveMonitorConfig();
		showTip("监控服务添加成功！");
	}else{
		showTip("监控服务不存在，添加监控失败！");
	}
}
