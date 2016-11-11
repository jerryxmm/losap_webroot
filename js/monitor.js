/**
 * Created by jerry on 2016/11/7.
 */
var g_getStateUrl = "/action/getstate";
var g_actionMonitorUrl = "/action/actionMonitor";
var g_svcStatus = new Map();
var g_curSvc = "";
var g_updateLag = 3000; //刷新间隔时间
var g_freshStateFlag = true;
var g_freshLogFlag = true;
var g_logFileLocation = {};
var g_maxLogNum = 2000;

//设置用户名
function setLoginUser()
{
	var xmlhttp = sendRequest("/action/getLoginUser", 'GET',  "application/x-www-form-urlencoded", "");
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	   	{
	   		console.log(xmlhttp.responseText);
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
//	AXLOG_TYPE_INFO, 0
//	AXLOG_TYPE_WARN, 1
//	AXLOG_TYPE_ERROR, 2
//	AXLOG_TYPE_DEBUG, 3
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