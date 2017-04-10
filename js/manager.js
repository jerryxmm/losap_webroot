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

//初始化全局管理类
//配置文件格式：
//{
// "user":"admin",
// "monitor":[
// 		{"ip":"192.168.3.173","port":"4101","cipher":"","user":"admin","monitor_service":["test_queue2","test_arbit","test_mdb2"]},
//      {"ip":"192.168.0.66","port":"4101","cipher":"thisIsForeignKey","user":"admin","monitor_service":["test_queue2","test_arbit","test_mdb2"]},
// 	]
// }
Manager.prototype.init = function (user) {
	//1.先初始化本地服务器类，
	var localIP = window.location.host.split(':')[0];
	var local = new Server('本机',localIP, window.location.port, false, "", user);
	this.localServer = local;
	//解析本地服务器配置文件
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
					//初始化跨域服务器类
					server = new Server(serverConf.desc, serverConf.ip, serverConf.port, true, serverConf.cipher, serverConf.user);
				}
				//跨域服务器的监控服务由此配置文件读取
				server.monitorService = serverConf.monitor_service;
				//先查看跨域服务器是否在线
				server.netPing();
				//如果在线就设置标志位，并开始定时从服务器获取监控数据
				if (server.alive == 'wakeUp') {
					server.startMonitor();
				} else if (server.alive == 'dead') {
					//如在不在线，不启动监控数据，启动定时检测心跳功能，如果测试到心跳，则重新启动该服务器的定时获取监控数据功能
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
