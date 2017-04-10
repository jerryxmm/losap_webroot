/**
 * Created by jerry on 2016/11/7.
 */
var g_curSvc = "";
var g_maxLogNum = 2000;
//设置用户名
var g_curLogLevel = "all";

function doShowLog(type) {
	if (type == 'all'){
		$('#logArea > .list-group-item').show();
		$('#infoBtn').css("background-color", "#C0DCF3");
		$('#warningBtn').css("background-color", "");
		$('#errorBtn').css("background-color", "");
	}else if (type == 'warning'){
		$('#infoBtn').css("background-color", "");
		$('#warningBtn').css("background-color", "#C0DCF3");
		$('#errorBtn').css("background-color", "");
		$('#logArea > .list-group-item').hide();
		$('#logArea > .list-group-item-warning').show();
		$('#logArea > .list-group-item-danger').show();
	}else if (type == 'error'){
		$('#infoBtn').css("background-color", "");
		$('#warningBtn').css("background-color", "");
		$('#errorBtn').css("background-color", "#C0DCF3");
		$('#logArea > .list-group-item').hide();
		$('#logArea > .list-group-item-danger').show();
	}else {
		$('#logArea > .list-group-item').show();
	}
	g_curLogLevel = type;
}

function ping (url) {
	var ret = false;
	$.ajax({
		type: "POST",
		cache: false,
		url: url,
		async:false,
		data: "",
		success: function() {
			ret = true;
		},
		error: function() {
			ret = false;
		}
	});
	return ret;
}

function Manager() {
	this.updataLag = 3000;
	this.serverMap = new Map();
	this.service_id = "";
	this.serviceMap = new Map();
	this.user = "";
};

Manager.prototype.addService = function (service) {
	this.serviceMap.set(service.serviceId, service);
}

Manager.prototype.getService = function (serviceId) {
	return this.serviceMap.get(serviceId);
}

Manager.prototype.removeService = function (serviceId) {
	this.serviceMap.delete(serviceId);
}

Manager.prototype.getServer = function (ip) {
	return this.serverMap.get(ip);
};

Manager.prototype.removeServer = function (ip) {
	this.serverMap.delete(ip);
}

function Server(desc, ip, port, isForeigner, cipher, user)
{
	this.desc = desc;
	this.ip = ip;
	this.port = port;
	var mySelf = this;
	this.foreignerFlag = isForeigner;
	var tmpStr = ip.replace(/\./g,"_");
	this.performId = "id_{0}_Perform".format(tmpStr);
	this.cpuId = "id_{0}_cpu".format(tmpStr);
	this.diskId="id_{0}_disk".format(tmpStr);
	this.memId = "id_{0}_mem".format(tmpStr);
	this.netSpeedId="id_{0}_netSpeed".format(tmpStr);
	this.performThemeId = "id_{0}_theme".format(tmpStr);
	this.allService = [];
	this.monitorService = [];
	this.serverInfo = {CPU:0, MemUsedPercent:0, DiskTotal:0, DiskFree:0, UpSpeed: 0, DownSpeed:0};
	var localStateUrl = "/action/getstate";
	var localMonitorUrl = "/action/actionMonitor";
	var foreignerUrl = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	var freshStateFlag = true;
	var freshInfoFlag = true;
	var freshLogFlag = true;
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

	this.serverRequest = function(func, para, callback,  async = true) {
		var url = "";
		if (this.foreignerFlag == false){
			url = localMonitorUrl;
		}
		else{
			url = foreignerUrl;
			para['cipher'] = this.cipher;
		}
		var req = new Request("1.0", func, para);

    	var postStr = JSON.stringify(req);
			$.ajax({
			url:url,
			data: postStr,
			timeout : 60000,
			async:async,
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
		if (this.foreignerFlag == false){
			url = localStateUrl;
		}
		else{
			url = foreignerUrl;
		}
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

	this.heartBeatTimer = -1;
	this.tryHeartBeat = function () {
		this.netPing();
		if (this.alive == "wakeUp"){
			this.stopMonitor();
			this.startMonitor();
			clearInterval(this.heartBeatTimer);
			this.heartBeatTimer = -1;
		}
	}

	this.startHeartBeatTimer = function () {
		if (this.heartBeatTimer == -1){
			this.heartBeatTimer = setInterval("g_intance.getServer('{0}').tryHeartBeat()".format(this.ip),6000);
		}
	}

	function dealListSvc(data) {
		var obj = JSON.parse(data);
		var records = obj.records;
		if (records == undefined)
			return;
		for(var i = 0 ; i < records.length; i++) {
			var rec = records[i];
			mySelf.allService.push(rec.svc_name);
			if (mySelf.monitorService.indexOf(rec.svc_name) > -1)
			{
				var service = new Service(mySelf.ip, rec.svc_name);
				service.setStatus(rec);
				g_intance.addService(service);
			}
		}
	};

	this.getAllService = function() {
		var para = {};
		this.serverRequest("ListSvc", para, dealListSvc, false);
		this.serverRequest("GetServerInfo", para, dealServerInfo, false);
	}

	function dealServerInfo(data) {
		freshInfoFlag = true;
		var obj = JSON.parse(data);
		mySelf.serverInfo = obj;
	}

	this.resetTimer = function () {
		freshInfoFlag = true;
		freshLogFlag = true;
		freshStateFlag = true;
	}
	var logFileLocation = {};

    function showLogs(logs){
        if (logs == undefined)
            return;
        var lis = "";
		var curRecord;
		for(var i = 0 ; i < logs.length; i++)
		{
			curRecord= logs[i];
			var li = "";
			var log = "{0} {1} {2} {3}".format(curRecord.svc, curRecord.log_time,  curRecord.log_type,curRecord.note);
			if (curRecord.log_type.indexOf("WARN") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-warning\"><span class=\"glyphicon glyphicon-info-sign\" style=\"color: sandybrown;\"></span>{0}</li>".format(log);
			}
			else if (curRecord.log_type.indexOf("INFO") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-info\"><span class=\"glyphicon glyphicon-info-sign\" style=\"color: cornflowerblue;\"></span>{0}</li>".format(log);
			}
			else if (curRecord.log_type.indexOf("ERROR") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-danger\"><span class=\"glyphicon glyphicon-remove-circle\" style=\"color: red;\"></span>{0}</li>".format(log);
			}
			else{
				li = "<li class=\"list-group-item\">{0}</li>".format(log);
			}
			var myAuto = document.getElementById('alarmAudio');
			myAuto.play();
			lis +=li;
		}
		$('#logArea').append(lis);
		doShowLog(g_curLogLevel);
		$('#logDiv').scrollTop($('#logDiv').prop("scrollHeight"));
		// var lis=logArea
		// if (lis.length > g_maxLogNum)
		// {
		// 	lis[0].remove();
		// }
    }
	
	var freshSvcStatuFlag = true;
	function dealSvcStatu(response){
		freshSvcStatuFlag = true;
		//console.log(response);
		var obj = JSON.parse(response);
		logFileLocation = obj.file_location;
        showLogs(obj.logs);
        mySelf.serverInfo = obj.serverInfo;

        var records = obj.records;
		if (records == undefined)
			return;
        for(var i = 0 ; i < records.length; i++) {
            var rec = records[i];
            var service = g_intance.getService(rec.svc_name);
            if (service != undefined)
            {
                service.setStatus(rec);
            }
        }
	};

	this.getMonitorSvcStatu = function(){
		if (Boolean(freshSvcStatuFlag))
		{
			var para = {service_id: this.monitorService, file_location:logFileLocation};
			this.getState("GetSvcStatus", para, dealSvcStatu);
			freshSvcStatuFlag = false;
		}
	};

	var updateLag = 3000;
	var serverInfoTimer = 0;
	var svcStatuTimer = 0;
	var logTimer = 0;

	this.startMonitor = function(){
		this.getAllService();
		 svcStatuTimer = setInterval("g_intance.getServer('{0}').getMonitorSvcStatu()".format(this.ip),updateLag);
	}

	this.stopMonitor = function () {
		clearInterval(serverInfoTimer);
		clearInterval(svcStatuTimer);
		clearInterval(logTimer);
	}

	function dealRemoveService(response) {
		var rsp = JSON.parse(response);
		var code = parseInt(rsp.code);
		if (code == 0) {
			showTip("服务删除成功！");
		} else{
			showTip("服务删除失败！");
		}
	}
	this.removeSvc = function (curSvc) {
		var para = {service_id:curSvc};
		this.serverRequest("RemoveSvc", para, dealRemoveService);
	}

	function generateDefaultConfig(response)
	{
		var obj = JSON.parse(response);
		var records = obj.records;
		if (records == undefined)
			return;
		var svcLst = [];
		for(var i = 0 ; i < records.length; i++) {
			var rec = records[i];
			svcLst.push(rec.svc_name);
		}
		var tObj= {user:mySelf.userName, monitor:[{ip:mySelf.ip,port:mySelf.port, cipher:mySelf.cipher,user:mySelf.userName, monitor_service:svcLst}]};
		mySelf.monitorConfig = JSON.stringify(tObj);
		mySelf.saveToServer(mySelf.monitorConfig);
	}

	function dealGetForeignServer(data) {
		var obj = JSON.parse(data);
		if (obj.content != undefined){
			mySelf.monitorConfig = obj.content;
		}
		else
		{
			var para = {};
			mySelf.serverRequest("ListSvc", para, generateDefaultConfig, false);
		}
	}
	this.getFromServer = function () {
		this.serverRequest("GetForeignServer", {fileName:"{0}_monitorService.json".format(this.userName)},dealGetForeignServer, false);
	};

	this.saveToServer = function (content) {
		var para = {fileName:"{0}_monitorService.json".format(this.userName), content:content};
		this.serverRequest("SaveForeignServer", para, "NULL");
	};

	this.init = function init() {
		if (mySelf.foreignerFlag == false) {
			this.getFromServer();
		}
	}
	this.init();
};

Server.prototype.clearAlert = function (serviceId) {
	var para = {};
	para.service_id = serviceId;
	this.serverRequest("ClearSvcAlert", para, dealSvcXml);
};

Server.prototype.updateUi = function () {
	var perform = this.serverInfo;
	var theme = "perform_alive";
	var desc = this.ip;
	if (this.alive == 'dead')
	{
		desc = desc + "服务器未启动";
		theme = "perform_dead";
		perform.CPU = 0;
		perform.DiskTotal = 0;
		perform.DiskFree = 0;
		perform.MemUsedPercent = 0;
		perform.UpSpeed = 0;
		perform.DownSpeed = 0;
	}
	$("#" + this.performThemeId).attr("class", "{0}".format(theme));
	$("#" + this.performId).text(desc);
	$("#" + this.cpuId).text("CPU:{0}%".format(perform.CPU));
	$("#" + this.diskId).text("磁盘:Used:{0}G, Free:{1}G ".format(perform.DiskTotal-perform.DiskFree, perform.DiskFree));
	$("#" + this.memId).text("Mem:{0}% ".format(perform.MemUsedPercent));
	var up = (perform.UpSpeed*1000).toFixed(0);
	var down = (perform.DownSpeed*1000).toFixed(0);
	$("#" + this.netSpeedId).text("网速:Up:{0}kb/s, Down:{1}kb/s".format(up, down));
};

// function clickSubmenu(ip)
// {
// 	var server = g_intance.getServer(ip);
// 	var js = document.getElementById(ip);
// 	if (server.sideBarHide){
// 		$(js).slideDown();
// 		server.sideBarHide = false;
// 	}else{
// 		$(js).slideUp();
// 		server.sideBarHide = true;
// 	}
// }