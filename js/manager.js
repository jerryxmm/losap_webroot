//*************************Server begin*****************************************
function Server(desc, ip, port, isForeigner, cipher, user)
{
	this.desc = desc+ip;
	this.ip = ip;
	this.port = port;
	var mySelf = this;
	this.foreignerFlag = isForeigner;
	this.monitorService = [];
	this.serverInfo = {CPU:0, MemUsedPercent:0, DiskTotal:0, DiskFree:0, UpSpeed: 0, DownSpeed:0};
	var localStateUrl = "/action/getstate";
	var localMonitorUrl = "/action/actionMonitor";
	this.cipher = cipher;
	this.monitorConfig = "";
	this.userName = user;
	this.password = "";
	this.alive = 'dead';
	this.getState = function(func, para, callback)
	{
		var url = localStateUrl;
		var req = new Request("1.0", func, para);
    	var postStr = JSON.stringify(req);
		$.ajax({
			url:url,
			data: postStr,
			async:true,
			type:"POST",
			success :function(response){
				mySelf.alive = "alive";
				if (callback != undefined && callback != "NULL")
				{
					if (callback.length == 2)
					{
						var serviceId = para.service_id;
						callback(response, serviceId);
					}
					else
					{
						callback(response);
					}
				}
			},
			error: function (xhr, status, error) {
				showTip("获取监控数据失败，请检查通讯!" + error);
			}
		});
	};

	this.serverRequest = function(func, para, callback) {
		var req = new Request("1.0", func, para);
    	var postStr = JSON.stringify(req);
		$.ajax({
			url:localMonitorUrl,
			data: postStr,
			timeout : 60000,
			type:"POST",
			success :function(response){
				mySelf.alive = "alive";
				if (callback != undefined && callback != "NULL")
				{
					if (callback.length == 2)
                    {
						var serviceId = para.service_id;
                        callback(response, serviceId);
                    }
                    else
                    {
                        callback(response);
                    }
				}
			},
			error:  function (xhr, status, error) {
				showTip("服务请求失败，请检查通讯!" + error);
			}
		});
	};

	this.netPing = function () {
		var url = "";
		url = localStateUrl;
		$.ajax({
			type: "POST",
			cache: false,
			url: url,
			async:false,
			data: "",
			success: function() {
				mySelf.alive = "wakeUp";
			},
			error: function() {
				mySelf.alive = "dead";
			}
		});
	};

	var logFileLocation = {};
	var statFileLocation = {};
	var freshSvcStatuFlag = true;
	function dealSvcStatu(response){
		freshSvcStatuFlag = true;
		var obj = JSON.parse(response);
		logFileLocation = obj.log_file_location;
		statFileLocation = obj.stat_file_location;

        mySelf.serverInfo = obj.serverInfo;
		mySelf.serverInfo['up'] = (mySelf.serverInfo.UpSpeed * 1000).toFixed(0);
		mySelf.serverInfo['down'] = (mySelf.serverInfo.DownSpeed * 1000).toFixed(0);
		if (mySelf.alive == 'dead') {
			mySelf.desc = mySelf.desc + "服务器未启动";
		}

        var records = obj.records;
		if (records == undefined)
			return;
        for(var i = 0 ; i < records.length; i++) {
            var rec = records[i];
			$('#monitorLog').logview('dealLog', rec);
            var service = g_intance.getService(rec.svc_name);
            if (service != undefined) {
                service.setStatus(rec);
            }
			else{
				if(mySelf.monitorService.indexOf(rec.svc_name) > -1)
				{
					service = new Service(mySelf, rec.svc_name);
					service.setStatus(rec);
					g_intance.addService(service);
				}
			}
        }


	};

	this.getSvcStatu = function(){
		if (Boolean(freshSvcStatuFlag))
		{
			var para = {service_id: this.monitorService, log_file_location:logFileLocation, stat_file_location:statFileLocation};
			this.getState("GetSvcStatus", para, dealSvcStatu);
			freshSvcStatuFlag = false;
		}
	};

	this.removeSvc = function (curSvc, okFunc) {
		var para = {service_id:curSvc};
		this.serverRequest("RemoveSvc", para, okFunc);
	};

	this.saveToServer = function () {
		var para = {fileName:"{0}_monitorService.json".format(this.userName), content:this.monitorConfig};
		this.serverRequest("SaveForeignServer", para, "NULL");
	};

	this.init = function init() {
		if (Boolean(this.foreignerFlag)){
			localStateUrl = "http://{0}:{1}{2}".format(this.ip, this.port, "/action/corsSync");
			localMonitorUrl = "http://{0}:{1}{2}".format(this.ip, this.port, "/action/corsAsync");
		}
	};
	this.init();
};

Server.prototype.clearAlert = function (serviceId) {
	var para = {};
	para.service_id = serviceId;
	this.serverRequest("ClearSvcAlert", para, dealSvcXml);
};
//*********************************Server end*********************************************************************

//*********************************Manager begin******************************************************************
function Manager() {
	this.serverMap = new Map();
	this.serviceMap = new Map();
	this.user = "";
	this.curSvc;
	this.readyFinish = false;
};
Manager.prototype.setCurSvc = function(svc){
	this.curSvc = svc;
};
Manager.prototype.getCurSvc = function(){
	return this.curSvc;
};

Manager.prototype.initLogView = function()
{
	$('#monitorLog').logview({
		height: Math.round(window.screen.availHeight*0.3),
		serviceSelector:this.serverList(),
	});
	g_intance.readyFinish = true;
};

Manager.prototype.addService = function (service) {
	this.serviceMap.set(service.serviceId, service);
};

Manager.prototype.getService = function (serviceId) {
	return this.serviceMap.get(serviceId);
};

Manager.prototype.removeService = function (serviceId) {
	this.serviceMap.delete(serviceId);
};
Manager.prototype.getServer = function (ip) {
	return this.serverMap.get(ip);
};

Manager.prototype.serverList = function(){
	var serverList = [];
	for (var server of this.serverMap.values()) {
	 	serverList.push(server);
	}
	return serverList;
};
Manager.prototype.serviceList = function(){
	var svcList = [];
	for (var svc of this.serviceMap.values()) {
	 	svcList.push(svc);
	}
	return svcList;
};

//Manager.prototype.updateUi = function () {
//	for (var server of this.serverMap.values()) {
//	 	server.updateUi();
//	}
//	for(var service of this.serviceMap.values()){
//		service.updateUi();
//	}
//}

//初始化全局管理类
//配置文件格式：
//{
// "user":"admin",
// "monitor":[
// 		{"ip":"192.168.3.173","port":"4101","cipher":"","user":"admin","monitor_service":["test_queue2","test_arbit","test_mdb2"]},
//      {"ip":"192.168.0.66","port":"4101","cipher":"thisIsForeignKey","user":"admin","monitor_service":["test_queue2","test_arbit","test_mdb2"]},
// 	]
// }
Manager.prototype.init = function (user, finishDo) {
	// step1.先初始化本地服务器类，
	var localIP = window.location.host.split(':')[0];
	var local = new Server('本机',localIP, window.location.port, false, "", user);
	this.localServer = local;
	var my = this;
	// step2: 获取服务端配置
	local.serverRequest("GetForeignServer", {fileName:"{0}_monitorService.json".format(local.userName)},
		function(data) {
			var obj = JSON.parse(data);
			// step3:解析本地服务器配置文件
			var parseFlag = false;
			if (obj.content != undefined){
				local.monitorConfig = obj.content;
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
							g_intance.serverMap.set(serverConf.ip, server);
							server.getSvcStatu();
						}
					}
					parseFlag = true;
				}
			}
			// step4: 解析失败则获取本机所有服务的监控数据
			if (!parseFlag)
			{
				my.serverMap.set(local.ip, local);
				var para = {};
				local.serverRequest("ListSvc", para, function(data){
					var obj = JSON.parse(data);
					var records = obj.records;
					if (records == undefined)
						return;
					for(var i = 0 ; i < records.length; i++) {
						var rec = records[i];
						local.monitorService.push(rec.svc_name);
						{
							var service = new Service(local, rec.svc_name);
							service.setStatus(rec);
							g_intance.addService(service);
						}
					}
					// step5: 保存配置文件到后端(从无到有)
					var tObj= {user:local.userName, monitor:[{ip:local.ip,port:local.port, cipher:local.cipher,user:local.userName, monitor_service:local.monitorService}]};
					local.monitorConfig = JSON.stringify(tObj);
					local.saveToServer();
					g_intance.initLogView();
					finishDo();
				});
			}else{
				g_intance.initLogView();
				finishDo();
			}
		});
};
//*********************************Manager end******************************************************************

