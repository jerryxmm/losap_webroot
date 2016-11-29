/**
 * Created by jerry on 2016/11/7.
 */
var g_curSvc = "";
var g_maxLogNum = 2000;
//设置用户名
function setLoginUser()
{
	var xmlhttp = sendRequest("/action/getLoginUser", 'GET',  "application/x-www-form-urlencoded", "");
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	   	{
		 //举个例子,如果结果是1代表登录成功跳转到index.html，并保存用户名否则提示登录失败消息
		  var user=xmlhttp.responseText;
            var user = "<span class=\"glyphicon glyphicon-user\"></span>" + "   " + user;
		  $('#loginUserName').html(user);
	    }
	  }
}

function Server(desc, ip, port, isForeigner)
{
	this.desc = desc;
	this.ip = ip;
	this.port = port;
	var mySelf = this;
	var myIP = ip;
	var foreignerFlag = isForeigner;
	var svcStatu = new Map();
	this.serverInfo = {};
	var localStateUrl = "/action/getstate";
	var localMonitorUrl = "/action/actionMonitor";
	var foreignerUrl = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	var freshStateFlag = true;
	var freshInfoFlag = true;
	var freshLogFlag = true;
	this.cipher = "";
	this.foreignerLst = [];
	this.sideBarHide = false;

	this.serverRequest = function(func, para, callback) {
		if (foreignerFlag == false){
			getMonitorData(localStateUrl,func, '1.0', para, callback);
		}
		else{
			para['cipher'] = this.cipher;
			getMonitorData(foreignerUrl, func, '1.0', para, callback);
		}
	}
	function refreshCurSvc(curObj) {
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
	}

	function dealListSvc(data) {
		var obj = JSON.parse(data);
		var records = obj.records;
		if (g_curIp == myIP)
		{
			for(var i = 0 ; i < records.length; i++) {
				svcStatu.set(records[i].svc_name, records[i]);
				if (records[i].svc_name == g_curServiceId){
					refreshCurSvc(records[i]);
				}
			}
		}else{
			for(var i = 0 ; i < records.length; i++) {
				svcStatu.set(records[i].svc_name, records[i]);
			}
		}
		freshStateFlag = true;
	}

	this.getSvcState = function() {
		if (Boolean(freshStateFlag))
		{
			var para = {};
			this.serverRequest("ListSvc", para, dealListSvc);
			freshStateFlag = false;
		}
	}

	function dealServerInfo(data) {
		freshInfoFlag = true;
		var obj = JSON.parse(data);
		this.serverInfo = obj;
		if (foreignerFlag != false) {
			return;
		}
		document.getElementById ("cpu").innerHTML = obj.CPU + "%";
		document.getElementById("memery").innerHTML = obj.MemUsedPercent + "%";
		var memUsed = (obj.MemTotal - obj.MemFree)/1024;
		var memTotal = obj.MemTotal/1024;
		document.getElementById("memInfo").innerHTML  = memUsed.toFixed(0) + "M/" + memTotal.toFixed(0)+ "M";
		var diskUsed = obj.DiskTotal - obj.DiskFree;
		var percent = diskUsed/obj.DiskTotal *100;
		document.getElementById("diskUsed").innerHTML = percent.toFixed(2) + "%";
		document.getElementById("diskInfo").innerHTML  = diskUsed.toString() + "G/" + obj.DiskTotal.toString() + "G";
		document.getElementById("netSpeed").innerHTML  = "UP:" + obj.UpSpeed.toFixed(3)+ "MB/s "+ "Down:"+ obj.DownSpeed.toFixed(3) + "MB/s";
	}
	this.getServerInfo =  function() {
		if (freshInfoFlag == true) {
			var para = {};
			this.serverRequest("GetServerInfo", para, dealServerInfo);
			freshInfoFlag = false;
		}
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
			$('#logArea').append(li);
			// var lis=logArea
			// if (lis.length > g_maxLogNum)
			// {
			// 	lis[0].remove();
			// }
		}
		$('#logDiv').scrollTop($('#logDiv').prop("scrollHeight"));
	}

	this.getLog = function () {
		if (Boolean(freshLogFlag))
		{
			var para = {file_location:logFileLocation};
			this.serverRequest("ListSvcLog", para, dealListSvcLog);
			freshLogFlag = false;
		}
	}
	var updateLag = 3000;
	var serverInfoTimer = 0;
	var svcStatuTimer = 0;
	var logTimer = 0;
	this.startMonitor = function () {
		this.getServerInfo();
		this.getSvcState();
		this.getLog();
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getServerInfo()".format(this.ip),updateLag);
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getSvcState()".format(this.ip),updateLag);
		 serverInfoTimer = setInterval("g_intance.getServer('{0}').getLog()".format(this.ip),updateLag);
	}

	this.stopMonitor = function () {
		clearInterval(serverInfoTimer);
		clearInterval(svcStatuTimer);
		clearInterval(logTimer);
	}

	this.startSvc = function (curSvc) {
		var curObj = svcStatu.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1){
			alert("当前服务已经启动");
		}
		else{ //当前为服务停止状态，点击后启动服务
			this.serverRequest("ExecCmdStart", para, "NULL");
		}
	}

	this.stopSvc = function (curSvc) {
		var curObj = svcStatu.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1) {
			this.serverRequest("ExecCmdStop", para, "NULL");
		}
		else {
			alert("当前服务已经停止");
		}
	}

	function dealRemoveService(response) {
		var rsp = JSON.parse(response);
		var code = parseInt(rsp.code);
		if (code == 0)
		{
			$('#TipContent').text("服务删除成功！");
			$('#TipDlg').modal('show');
		}
		else{
			$('#TipContent').text("服务删除失败！");
			$('#TipDlg').modal('show');
		}
	}
	this.removeSvc = function (curSvc) {
		var para = {service_id:curSvc};
		this.serverRequest("RemoveSvc", para, dealRemoveService);
	}

	function dealGetForeignServer(data) {
		var obj = JSON.parse(data);
		if (obj.content != undefined){
			mySelf.foreignerLst = JSON.parse(obj.content);
		}
	}
	this.getFromServer = function () {
		var req = new Request("1.0", "GetForeignServer", {fileName:"foreignServer.json"});
		$.ajax({
			url:localMonitorUrl,
			data: JSON.stringify(req),
			async:false,
			type:"POST",
			success :dealGetForeignServer
		});
	};

	this.saveToServer = function (content) {
		var para = {fileName:"foreignServer.json", content:content};
		this.serverRequest("SaveForeignServer", para, "NULL");
	};

	this.addForeignerToServer = function (cipher, ip, port, desc) {
		var fore = {cipher:cipher, ip:ip, port:port, desc:desc};
		this.foreignerLst.push(fore);
		this.saveToServer(JSON.stringify(this.foreignerLst));
	};

	this.removeForeigner = function (ip) {
		for(var i = 0; i < this.foreignerLst.length; i++)
		{
			if (this.foreignerLst[i].ip == ip){
				this.foreignerLst.splice(i, 1);
				break;
			}
		}
		this.saveToServer(JSON.stringify(this.foreignerLst));
		$('#TipContent').text("服务器节点删除成功！");
		$('#TipDlg').modal('show');
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
				  var monObj = "<li><a href=\"#\" onclick=\"ListSvcItemInfo('{0}','{1}','{2}')\">{3}</a></li>".format(myIP, serviceId, rec.id,rec.name);
				 monObjs += monObj;
			  }
		  }
		  $('#monitorObject').html(monObjs);
	}

	this.listSvcItem =  function(serviceId)
	{
		var para = {service_id:serviceId};
		this.serverRequest("ListSvcItem", para, ShowListSvcItem);
	};

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

		var curObj = svcStatu.get(serviceId);
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

	this.init = function init() {
		this.getFromServer();
	}

	this.getSvcStatus = function () {
		var desc = "";
		if (foreignerFlag == false) {
			desc = "本机";
		}else
		{
			desc = this.desc;
		}
		var svcLst = [];
		svcStatu.forEach(function (value, key) {
			svcLst.push(value);
		});
		return {desc:desc, sideBarHide:this.sideBarHide, ip:this.ip, svcLst:svcLst};
	};

	this.getSvc = function (serviceId) {
		return svcStatu.get(serviceId);
	};

	var debugTimerId;
	var debugFileLocation = {};
	var continueGetDebug = true;
	var debugServiceId;
	var debugPackets = new Map();

	function showDebugModal(fileLocation) {
		$('#debugModalBody').treeview("destory");
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
		$('#debugModalBody').treeview({
			data:tree
		});
	}

	function showDebugInfo(data) {
		console.log(data);
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
			var li = "<li class=\"list-group-item list-group-item-danger\"><a herf='#' onclick=\"showDebugModal('{0}')\" data-toggle='modal' data-target='#debugModal'>PacketID:{1}</a></li>".format(packet.fileLocation, packet.fileLocation);
			$('#debugArea').append(li);
		}
	}

	function getDebugInfo() {
		if (continueGetDebug == false)
			return;
		continueGetDebug == false;
		var para = {service_id:debugServiceId, file_location:debugFileLocation};
		mySelf.serverRequest("GetSvcDebug",para, showDebugInfo);
	}

	this.openDebugFunc = function(serviceId){
		debugServiceId = serviceId;
		var para = {service_id:serviceId};
		this.serverRequest("OpenSvcDebug", para, "NULL");
		$("#debugTab").attr("href", "#debugPage");
		$("#debugTab").attr("isDebug", "on");
		$("#onlineDebug").css({"color":"green"});
		debugTimerId = setInterval("getDebugInfo()",g_updateLag);
	};

	this.closeDebugFunc = function(serviceId) {
		var para = {service_id:serviceId};
		this.serverRequest("CloseSvcDebug", para, "NULL");
		$("#debugTab").attr("href", "#svcPage");
		$("#debugTab").attr("isDebug", "off");
		$("#onlineDebug").css({"color":"#BEBFC0"});
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
				console.log(att.name + "***"+att.nodeValue);
				if (att.name == "ps") {
					continue
				}
				else if (att.name == "Value")
				{
					var length =node.getAttribute("Value").length * 5;
					$("#content").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px' attr = '{3}'>{1}</div>"
						.format(att.nodeValue, desc, node.nodeName,att.name));
				}
				else
				 {
					 $("#content").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px'  attr = '{3}'>{1}</div>"
						.format(att.nodeValue, att.name, node.nodeName, att.name));
				 }
			}
		}
	}

	if (layer == 2)
	{
		$('#content').append("<h5 style=\"font-weight:bold;\">{0}</h5>".format(desc));
	}
    var children = node.childNodes;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        traverseNode(child, layer+1);
    }
}

var g_xmlDoc;
function dealSvcXml(response, serviceId) {
    var obj = JSON.parse(response);
    var xml = obj.content;
	parser=new DOMParser();
    g_xmlDoc=parser.parseFromString(xml,"text/xml");
	$('#content').empty();
	$('#curSvc').text(serviceId);
    traverseNode(g_xmlDoc.documentElement, 1);
	$('.configValue').on('input', function() {
		var node = g_xmlDoc.getElementsByTagName($(this).attr('name'));
		var attr = $(this).attr('attr');
		node[0].setAttribute(attr, $(this).val());
	});
}

	this.modService = function () {
		var para = {};
		para.service_id = serviceId;
		this.serverRequest("GetSvcXml", para, dealSvcXml);
	};

	function XML2String(xmlObject) {
		return (new XMLSerializer()).serializeToString(xmlObject);
	};

	this.saveXml = function() {
		if (g_xmlDoc == undefined)
			return;
		var content = XML2String(g_xmlDoc);
		var para = {};
		var ddd = $('#curSvc');
		para.service_id = ddd[0].innerText;
		para.content = content;
		this.serverRequest("SaveSvcXml", para, "NULL");
	}
	this.init();
};

// function clickSubmenu(desc)
// {
// 	var submenu = $(this).siblings('ul');
// 	var submenus = $('#sidebar li.submenu');
// 	for(var i = 0; i < submenus.length; i++)
// 	{
// 		var tmp = submenus[i];
// 		var span = $(tmp).find("span");
// 		if ($(span[0]).html() != desc) {
// 			continue;
// 		}
// 		var dest = $(tmp).find("ul")[0];
// 		if ($(tmp).attr("isSpan") == 'true') {
// 			$(dest).slideDown();
// 			$(tmp).attr("isSpan", 'false');
// 		}
// 		else{
// 			$(dest).slideUp();
// 			$(tmp).attr("isSpan", 'true');
// 		}
// 	}
// }
function clickSubmenu(ip)
{
	var server = g_intance.getServer(ip);
	var js = document.getElementById(ip);
	if (server.sideBarHide){
		$(js).slideDown();
		server.sideBarHide = false;
	}else{
		$(js).slideUp();
		server.sideBarHide = true;
	}
}