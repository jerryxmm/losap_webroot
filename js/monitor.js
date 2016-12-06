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

function Server(desc, ip, port, isForeigner, cipher, user)
{
	this.desc = desc;
	this.ip = ip;
	this.port = port;
	var mySelf = this;
	var myIP = ip;
	this.foreignerFlag = isForeigner;
	this.serviceMap = new Map();
	this.monitorService = [];
	this.serverInfo = {};
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
	this.alive = false;
	this.serverRequest = function(func, para, callback, async=true) {
		var url = "";
		if (this.foreignerFlag == false){
			url = localStateUrl;
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
			async:async,
			type:"POST",
			success :function(response){
				mySelf.alive = true;
				callback(response);
			},
			error: function() {
				mySelf.alive = false;
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
				mySelf.alive = true;
			},
			error: function() {
				mySelf.alive = false;
			}
		});
	};

	this.tryHeartBeat = function () {
		this.netPing();
		if (this.alive == true){
			this.startMonitor();
			clearInterval(this.heartBeatTimer);
		}
	}

	this.startHeartBeatTimer = function () {
		this.heartBeatTimer = serverInfoTimer = setInterval("g_intance.getServer('{0}').tryHeartBeat()".format(this.ip),6000);
	}

	function dealListSvc(data) {
		var obj = JSON.parse(data);
		var records = obj.records;
		for(var i = 0 ; i < records.length; i++) {
			mySelf.serviceMap.set(records[i].svc_name, records[i]);
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
		this.alive = true;
	}
	this.getServerInfo =  function() {
		if (freshInfoFlag == true) {
			var para = {};
			this.serverRequest("GetServerInfo", para, dealServerInfo);
			freshInfoFlag = false;
		}
	}

	this.resetTimer = function () {
		freshInfoFlag = true;
		freshLogFlag = true;
		freshStateFlag = true;
	}
	var logFileLocation = {};

	function dealListSvcLog(data) {
		var obj = JSON.parse(data);
		var head = obj.metadata;
		var records = obj.records;
		var svrLst = "";
		svrLst += '<ul>';
		var color;
		var curRecord;
		var icon;
		logFileLocation = obj.file_location;
		var type = "";
		freshLogFlag = true;
		if (records == undefined)
			return;
		var lis = "";
		for(var i = 0 ; i < records.length; i++)
		{
			curRecord= records[i];
			var li = "";
			if (curRecord.log_type.indexOf("WARN") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-warning\"><span class=\"glyphicon glyphicon-info-sign\" style=\"color: sandybrown;\"></span>{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);
			}
			else if (curRecord.log_type.indexOf("INFO") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-info\"><span class=\"glyphicon glyphicon-info-sign\" style=\"color: cornflowerblue;\"></span>{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);
			}
			else if (curRecord.log_type.indexOf("ERROR") >=0)
			{
				li = "<li class=\"list-group-item list-group-item-danger\"><span class=\"glyphicon glyphicon-remove-circle\" style=\"color: red;\"></span>{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);
			}
			else{
				li = "<li class=\"list-group-item\">{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);
			}
			var myAuto = document.getElementById('alarmAudio');
			//myAuto.play();
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

	this.getLog = function () {
		if (Boolean(freshLogFlag))
		{
			var para = {service_id: this.monitorService, file_location:logFileLocation};
			this.serverRequest("ListSvcLog", para, dealListSvcLog);
			freshLogFlag = false;
		}
	};

	function dealGetMonitorServiceStatu(data) {
		var obj = JSON.parse(data);
		var records = obj.records;
		for(var i = 0 ; i < records.length; i++) {
			mySelf.serviceMap.set(records[i].svc_name, records[i]);
		}
		freshStateFlag = true;
	};

	this.getMonitorServiceStatu = function () {
		if (Boolean(freshStateFlag))
		{
			var para = {service_id: this.monitorService};
			this.serverRequest("ListSvc", para, dealGetMonitorServiceStatu);
			freshStateFlag = false;
		}
	};
	
	var updateLag = 3000;
	var serverInfoTimer = 0;
	var svcStatuTimer = 0;
	var logTimer = 0;
	this.startMonitor = function () {
		this.getMonitorServiceStatu();
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getServerInfo()".format(this.ip),updateLag);
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getMonitorServiceStatu()".format(this.ip),updateLag);
		console.log("startTimer" + this.ip);
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getLog()".format(this.ip),updateLag);
	};

	this.stopMonitor = function () {
		clearInterval(serverInfoTimer);
		clearInterval(svcStatuTimer);
		clearInterval(logTimer);
	}

	this.startSvc = function (curSvc) {
		var curObj = this.serviceMap.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1){
			alert("当前服务已经启动");
		}
		else{ //当前为服务停止状态，点击后启动服务
			this.serverRequest("ExecCmdStart", para, "NULL",false);
		}
	};

	this.stopSvc = function (curSvc) {
		var curObj = this.serviceMap.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1) {
			this.serverRequest("ExecCmdStop", para, "NULL", false);
		}
		else {
			alert("当前服务已经停止");
		}
	};

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

	function dealGetForeignServer(data) {
		var obj = JSON.parse(data);
		if (obj.content != undefined){
			mySelf.monitorConfig = obj.content;
		}
	}
	this.getFromServer = function () {
		this.serverRequest("GetForeignServer", {fileName:"{0}_monitorService.json".format(this.userName)},dealGetForeignServer, false);
	};

	this.saveToServer = function (content) {
		var para = {fileName:"{0}_monitorService.json".format(this.userName), content:content};
		this.serverRequest("SaveForeignServer", para, "NULL");
	};

	var m_curServiceId = "";
	function ShowListSvcItem(str)
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
				  var monObj = "<li><a href='#' onclick=\"ListSvcItemInfo('{0}','{1}','{2}')\">{3}</a></li>".format(myIP, m_curServiceId, rec.id,rec.name);
				 monObjs += monObj;
			  }
		  }
		var curObj = mySelf.serviceMap.get(m_curServiceId);
		if (curObj.online_debug == 1){
			monObjs += "<li><a href='#' onclick='showDebug()'>在线调试</a></li>";
		}
		$('#monitorObject').empty();
		  $('#monitorObject').html(monObjs);
	}

	this.listSvcItem =  function(serviceId)
	{
		m_curServiceId = serviceId;
		var para = {service_id:serviceId};
		this.serverRequest("ListSvcItem", para, ShowListSvcItem, false);
	};

	 function ShowListSvcInfo(varData)
	{
		// var table = parseJsonToTable(varData);
		 $('#table').bootstrapTable('destroy');
		 var table = JSON.parse(varData);
		  if (table.metadata == undefined) {
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
	};

	this.listSvcItemInfo = function ( serviceId, obj) {
		var para = {service_id:serviceId, object:obj};
		this.serverRequest("ListSvcItemInfo", para, ShowListSvcInfo);
	};

	this.execCmd = function (serviceId, sql)
	{
		var para = {service_id:serviceId, cmd: sql};
		this.serverRequest("ExecCmd", para, ShowListSvcInfo);
	}

	this.initServicePage = function (serviceId) {
		$('#monitorObject').empty();
		$('#table').bootstrapTable('destroy');

		var curObj = this.serviceMap.get(serviceId);
		var serviceInfo = "版本号：{0}  启动时间：{1}".format(curObj.version, curObj.uptime);
		$('#serviceInfo').text(serviceInfo);
		$('#serviceName').text(serviceId);
		if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
		{
			$("#startIcon").css({"color":"#BEBFC0"});
			$("#stopIcon").css({"color":"red"});
			$('#onlineDebugCheckBox').removeAttr("disabled");
			if (curObj.online_debug == 1){
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

	this.init = function init() {
		this.getAllService();
		if (mySelf.foreignerFlag == false) {
			this.getFromServer();
		}
	}

	function hasInclude(arr, serviceId) {
		if (arr == undefined)
			return -1;
		for(var i = 0; i < arr.length; i++){
			if (arr[i] == serviceId)
				return 1;
		}
		return -1;
	}
	
	this.getSvcStatus = function () {
		var desc = "";
		if (this.foreignerFlag == false) {
			desc = "本机";
		}else
		{
			desc = this.desc;
		}
		var svcLst = [];
		this.serviceMap.forEach(function(value, key) {
			if (hasInclude(mySelf.monitorService, key) != -1){
				svcLst.push(value);
			}
		});
		return {desc:desc, ip:this.ip,alive:this.alive, perform:this.serverInfo, svcLst:svcLst};
	};

	this.getSvc = function (serviceId) {
		return this.serviceMap.get(serviceId);
	};

	var debugTimerId;
	var debugFileLocation = {};
	var continueGetDebug = true;
	var debugServiceId;
	var debugPackets = new Map();

	this.showDebugModal = function(fileLocation) {
		var packet = debugPackets.get(parseInt(fileLocation));
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
		return tree;
	}

	function showDebugInfo(data) {
		var obj = JSON.parse(data);
		debugFileLocation = obj.file_location;
		continueGetDebug == true;
		var packets = obj.packets;
		if (packets == undefined)
			return;
		for(var i = 0; i < packets.length; i++)
		{
			var packet = packets[i];
			debugPackets.set(packet.fileLocation, packet);
			var pak = debugPackets.get(packet.fileLocation);
			var li = "<li class=\"list-group-item list-group-item-danger\"><a herf='#' onclick=\"showDebugModal('{0}', '{1}')\" data-toggle='modal' data-target='#debugModal'>PacketID:{2}</a></li>".format(mySelf.ip, packet.fileLocation, packet.fileLocation);
			$('#debugArea').append(li);
		}
	}

	this.getDebugInfo = function() {
		if (continueGetDebug == false)
			return;
		continueGetDebug == false;
		var para = {service_id:debugServiceId, file_location:debugFileLocation};
		mySelf.serverRequest("GetSvcDebug",para, showDebugInfo);
	}

	this.openDebugFunc = function(serviceId){
		debugServiceId = serviceId;
		var para = {service_id:serviceId};
		console.log("openDebugFunc");
		this.serverRequest("OpenSvcDebug", para, "NULL", false);
		$('#debugArea').empty();
		debugTimerId = setInterval("g_intance.getServer('{0}').getDebugInfo()".format(this.ip),updateLag);
	};

	this.closeDebugFunc = function(serviceId) {
		var para = {service_id:serviceId};
		console.log("closeDebugFunc");
		this.serverRequest("CloseSvcDebug", para, "NULL", false);
		$('#debugArea').empty();
		clearInterval(debugTimerId);
	};

	function traverseNode(node, layer) {
    if (node.nodeName == "#text")
        return;
	var desc = "";
	var atts = node.attributes;
	if (layer != 1)
	{
		if (atts != undefined)
		{
			desc = node.nodeName;
			if (node.hasAttribute("ps"))
			{
					desc = desc + "--" + node.getAttribute("ps");
			}

			for(var i = 0; i < atts.length; i++)
			{
				var att = atts[i];
				if (att.name == "ps") {
					continue
				}
				else if (att.name == "Value")
				{
					var length =node.getAttribute("Value").length * 5;
					$("#xmlContent").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px' attr = '{3}'>{1}</div>"
						.format(att.nodeValue, desc, node.nodeName,att.name));
				}
				else
				 {
					 $("#xmlContent").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px'  attr = '{3}'>{1}</div>"
						.format(att.nodeValue, att.name, node.nodeName, att.name));
				 }
			}
		}
	}

	if (layer == 2)
	{
		$('#xmlContent').append("<h5 style=\"font-weight:bold;\">{0}</h5>".format(desc));
	}
    var children = node.childNodes;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        traverseNode(child, layer+1);
    }
}

	var xmlDoc;
	function dealSvcXml(response, serviceId) {
		var obj = JSON.parse(response);
		var xml = obj.content;
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(xml,"text/xml");
		$('#xmlContent').empty();
		traverseNode(xmlDoc.documentElement, 1);
		$('.configValue').on('input', function() {
			var node = xmlDoc.getElementsByTagName($(this).attr('name'));
			var attr = $(this).attr('attr');
			node[0].setAttribute(attr, $(this).val());
		});
	};

	this.getSvcXml = function (serviceId) {
		var para = {};
		para.service_id = serviceId;
		this.serverRequest("GetSvcXml", para, dealSvcXml);
	};

	function XML2String(xmlObject) {
		return (new XMLSerializer()).serializeToString(xmlObject);
	};

	this.saveXml = function(serviceId) {
		if (xmlDoc == undefined)
			return;
		var content = XML2String(xmlDoc);
		var para = {};
		para.service_id = serviceId;
		para.content = content;
		this.serverRequest("SaveSvcXml", para, "NULL");
	};
	this.init();
};


function Manager(user) {
	this.updataLag = 3000;
	this.serverMap = new Map();
	this.foreignIp = "";
	this.foreignPort = '';
	this.foreignDesc = '';
	this.service_id = "";
	this.serviceMap = new Map();
	this.user = user;
	this.init(user);
};

Manager.prototype.showHomePage = function () {
	$("#svcView").testPlugin('destroy');
	$("#svcView").empty();
	var serverLst = [];
	this.serverMap.forEach(function (server, ip) {
		var item = server.getSvcStatus();
		serverLst.push(item);
		// if (Boolean(server.alive)){
		// 	var item = server.getSvcStatus();
		// 	serverLst.push(item);
		// }else{
		// 	//server.resetTimer();
		// }
	});
	$('#svcView').testPlugin(
		{
			data:serverLst
		}
	);
};

Manager.prototype.init = function (user) {
	var localIP = window.location.host.split(':')[0];
	var local = new Server('本机',localIP, window.location.port, false, "", user);
	this.localServer = local;
	if (local.monitorConfig != "")
	{
		var moniConf = JSON.parse(local.monitorConfig);
		var monitor = moniConf.monitor;
		for(var i = 0; i < monitor.length; i++)
		{
			var serverConf = monitor[i];
			var server;
			if (serverConf.ip == localIP){
				server = local;
			}else{
				server = new Server(serverConf.desc, serverConf.ip, serverConf.port, true, serverConf.cipher, serverConf.user);
			}
			server.monitorService = serverConf.monitor_service;
			server.netPing();
			if (Boolean(server.alive)){
				server.startMonitor();
			}else{
				server.startHeartBeatTimer();
			}
			this.serverMap.set(serverConf.ip, server);
			for(var k = 0; k < server.monitorService.length; k++)
			{
				this.serviceMap.set(server.monitorService[k], server.ip);
			}

		}
	}
	this.updateUI();
};

Manager.prototype.getServer = function (ipOrDesc) {
	var server = this.serverMap.get(ipOrDesc);
	if (server == undefined)
	{
		for (var value of this.serverMap.values()) {
			if (value.desc == ipOrDesc){
				server = value;
				break;
			}
		}
	}
	return server;
};

Manager.prototype.updateUI = function () {
	this.showHomePage();
	this.updateUiTimer = setInterval("g_intance.showHomePage()", this.updataLag);
};

Manager.prototype.stopUpdateUI = function () {
	clearInterval(this.updateUiTimer);
}

Manager.prototype.getSvc = function (ip, serviceId) {
	var server = this.serverMap.get(ip);
	return server.getSvc(serviceId);
}

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