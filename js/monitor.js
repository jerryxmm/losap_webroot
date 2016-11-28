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

function GetLog() {
	if (Boolean(g_freshLogFlag))
	{
		var para = {file_location:g_logFileLocation};
		getMonitorData(g_getStateUrl,"ListSvcLog", '1.0', para, dealListSvcLog);
		g_freshLogFlag = false;
	}
}

function dealListSvcLog(data) {
	var obj = JSON.parse(data);
 	var head = obj.metadata;
 	var records = obj.records;
	var svrLst = "";
	svrLst += '<ul>';
	var color;
	var curRecord;
	var icon;
	g_logFileLocation = obj.file_location;
	var type = "";
	g_freshLogFlag = true;
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

function Server(ip, port, isForeigner)
{
	this.ip = ip;
	this.port = port;
	var foreignerFlag = isForeigner;
	var svcStatu = new Map();
	this.serverInfo = {};
	var localStateUrl = "/action/getstate";
	var localMonitorUrl = "/action/actionMonitor";
	var foreignerUrl = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	var freshStateFlag = true;
	var freshInfoFlag = true;
	var freshLogFlag = true;
	this.foreignCipher = "";

	function serverRequest(func, para, callback) {
		if (foreignerFlag == false){
			getMonitorData(localStateUrl,func, '1.0', para, callback);
		}
		else{
			para['cipher'] = this.foreignCipher;
			getForeignMonitorData(foreignerUrl, func, para, callback);
		}
	}

	function dealListSvc(data) {
		var obj = JSON.parse(data);
		var records = obj.records;
		for(var i = 0 ; i < records.length; i++) {
			svcStatu.set(records[i].svc_name, records[i]);
		}
		freshStateFlag = true;
	}

	this.getSvcState = function() {
		if (Boolean(freshStateFlag))
		{
			var para = {};
			serverRequest("ListSvc", para, dealListSvc);
			freshStateFlag = false;
		}
	}

	function dealServerInfo(data) {
		this.serverInfo = JSON.parse(data);
		freshInfoFlag = true;
	}

	this.getServerInfo =  function() {
		if (freshInfoFlag == true) {
			var para = {};
			serverRequest("GetServerInfo", para, dealServerInfo);
			freshInfoFlag = false;
		}
	}

	var logFileLocation = {};

	function dealListSvcLog(data) {
		var obj = JSON.parse(data);
		var head = obj.metadata;
		var records = obj.records;
		logFileLocation = obj.file_location;
		freshLogFlag = true;
	}
	this.getLog = function () {
		if (Boolean(freshLogFlag))
		{
			var para = {file_location:logFileLocation};
			serverRequest("ListSvcLog", para, dealListSvcLog);
			freshLogFlag = false;
		}
	}
	var updateLag = 3000;
	var serverInfoTimer = 0;
	var svcStatuTimer = 0;
	var logTimer = 0;
	this.startMonitor = function () {
		 serverInfoTimer = setInterval("g_serverMap.get('{0}').getServerInfo()".format(this.ip),updateLag);
		 serverInfoTimer = setInterval("g_serverMap.get('{0}').getSvcState()".format(this.ip),updateLag);
		 serverInfoTimer = setInterval("g_serverMap.get('{0}').getLog()".format(this.ip),updateLag);
	}

	this.stopMonitor = function () {
		// clearInterval(serverInfoTimer);
		// clearInterval(svcStatuTimer);
		// clearInterval(logTimer);
	}

	this.startSvc = function (curSvc) {
		var curObj = svcStatu.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1){
			alert("当前服务已经启动");
		}
		else{ //当前为服务停止状态，点击后启动服务
			serverRequest("ExecCmdStart", para, "NULL");
		}
	}

	this.stopSvc = function (curSvc) {
		var curObj = svcStatu.get(curSvc);
		var para = {service_id:curSvc};
		if (curObj.status_run == 1) {
			serverRequest("ExecCmdStop", para, "NULL");
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
			$('#removeResultContent').text("服务删除成功！");
			$('#removeResultDlg').modal('show');
		}
		else{
			$('#removeResultContent').text("服务删除失败！");
			$('#removeResultDlg').modal('show');
		}
	}
	this.removeSvc = function (curSvc) {
		var para = {service_id:curSvc};
		serverRequest("RemoveSvc", para, dealRemoveService);
	}
	var foreignerLst;
	function dealGetForeignServer(data) {
		var obj = JSON.parse(data);
		foreignerLst = obj.content;
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
	}

	this.saveToServer = function (content) {
		var para = {fileName:"foreignServer.json", serverLst:content};
		serverRequest("GetForeignServer", para, "NULL");
	}

	this.init = function init() {
		this.getFromServer();
	}
	this.getForeignServer = function () {
		return foreignerLst;
	}
	this.getSvcStatus = function () {
		var desc = "";
		if (foreignerFlag == false) {
			desc = "本机";
		}else
		{
			desc = "{0}:{1}".format(this.ip, this.port);
		}
		return {desc:desc, svcLst:svcStatu.values()};
	}
	this.init();
}
