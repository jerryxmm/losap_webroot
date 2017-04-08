/**
 * Created by jerry on 2016/12/22.
 */
Manager.prototype.initUi = function () {
	$("#svcView").testPlugin('destroy');
	$('#svcView').testPlugin(
		{
			serviceMap:this.serviceMap,
			serverMap:this.serverMap
		}
	);
};

Manager.prototype.updateUi = function () {
	for (var server of this.serverMap.values()) {
	 	server.updateUi();
	}
	for(var service of this.serviceMap.values()){
		service.updateUi();
	}
}

Manager.prototype.init = function (user) {
	var localIP = window.location.host.split(':')[0];
	var local = new Server('本机',localIP, window.location.port, false, "", user);
	this.localServer = local;
	if (local.monitorConfig != "")
	{
		var moniConf = JSON.parse(local.monitorConfig);
		var monitor = moniConf.monitor;
		if (monitor != undefined) {
			for (var i = 0; i < monitor.length; i++) {
				var serverConf = monitor[i];
				var server;
				if (serverConf.ip == localIP) {
					server = local;
				} else {
					server = new Server(serverConf.desc, serverConf.ip, serverConf.port, true, serverConf.cipher, serverConf.user);
				}
				server.monitorService = serverConf.monitor_service;
				server.netPing();
				if (server.alive == 'wakeUp') {
					server.startMonitor();
				} else if (server.alive == 'dead') {
					server.startHeartBeatTimer();
				}
				this.serverMap.set(serverConf.ip, server);
			}
		}
	}
	else {
		this.serverMap.set(local.ip, local);
		local.netPing();
		if (local.alive == 'wakeUp'){
			local.startMonitor();
		}else if (local.alive == 'dead'){
			local.startHeartBeatTimer();
		}
	}
	this.startUpdateUi();
};

Manager.prototype.startUpdateUi = function () {
	this.initUi();
	this.updateUi();
	this.updateUiTimer = setInterval("g_intance.updateUi()", this.updataLag);
	doOnResize();
};

// Manager.prototype.stopUpdateUi = function () {
// 	clearInterval(this.updateUiTimer);
// }
