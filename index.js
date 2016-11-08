var g_updateLag = 3000; //刷新间隔时间
var g_freshStateFlag = true;
var g_freshLogFlag = true;
var g_logFileLocation = {};
var g_maxLogNum = 2000;
var num = 0;
var g_getStateUrl = "/action/getstate";
var g_actionMonitorUrl = "/action/actionMonitor";
var g_svcStatus = new Map();
var g_curSvc = "";

$(function(){
	setLoginUser();
	freshSvcState();
	//setInterval("freshSvcState()",g_updateLag);
	//setInterval("GetLog()",g_updateLag);

	// $('#mainPageId').on('shown.bs.tab', function (e) {
	//   e.target // newly activated tab
	//   e.relatedTarget // previous active tab
	// 	$('#sidebar').hide();
	// })


	$('#updatePackage').on('fileuploaded', function(event, data, previewId, index) {
    var form = data.form, files = data.files, extra = data.extra,
        response = data.response, reader = data.reader;
    console.log('File uploaded triggered');
});
});

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
	var logArea = $('#logArea');
	
 	for(var i = 0 ; i < records.length; i++)
 	{
		curRecord= records[i];
		switch(curRecord.log_type)
		{
			case 0: type = "list-group-item-info";break;
			case 1: type = "list-group-item-warning";break;
			case 2: type = "list-group-item-danger"; break;
			case 3: type = "list-group-item-success"; break;
			default:break;
		}
		var li = "<li class=\"list-group-item {0}\">{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);	
		logArea.append(li);
		// var lis=logArea
		// if (lis.length > g_maxLogNum)
		// {
		// 	lis[0].remove();
		// }
 	}
 	
}


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

function SVCInfo(status, status_run, status_alert, version, uptime)
{
	this.status = status;
	this.status_run = status_run;
	this.status_alert = status_alert;
	this.version = version;
	this.uptime = uptime;
}

function dealListSvc(data)
{
	var obj = JSON.parse(data);
 	var head = obj.metadata;
 	var records = obj.records;
	var svrLst = "<ul style=\"display: block;\">";
	var color;
	var curRecord;
	var icon;
	var alertFlag="";
	g_svcStatus.clear();

 	for(var i = 0 ; i < records.length; i++)
 	{
		curRecord= records[i];
		if (curRecord.status_run == 1){
			icon = 'glyphicon-play';
			color = 'green';
		}
		else {
			icon = 'glyphicon-stop';
			color = 'red';
		}
		if (curRecord.status_alert == 1)
		{
			alertFlag = "<span class='glyphicon glyphicon-exclamation-sign'  style='color:yellow; float:right'> </span>";
		}
		else
		{
			alertFlag = "";
		}

		var svc =  "<li><a class='list-group-item' href='#monitorTab' data-toggle='tab' onclick=\"showSvcPage('{0}')\"><span class='glyphicon {1}' style='color:{2}'></span>{3} {4}</a></li>"
		.format(curRecord.svc_name,icon, color, curRecord.svc_name, alertFlag);
		svrLst += svc;
		var svcObj = curRecord;
		g_svcStatus.set(curRecord.svc_name, svcObj);

		if (curRecord.svc_name== g_curSvc)
		{
			if (svcObj.status_run == 1) //当前为启动状态，点击后停止服务
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
 	}

	svrLst +="</ul>"
	$('#sidebar').html(svrLst);
	g_freshStateFlag = true;
}

function freshSvcState() {
	if (Boolean(g_freshStateFlag))
	{
		getMonitorData(g_getStateUrl,"ListSvc", '1.0', "NULL", dealListSvc);
		g_freshStateFlag = false;
	}
}

function startService() {
	var curObj = g_svcStatus.get(g_curSvc);
	var para = {service_id:g_curSvc};
	if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
	{
		alert("当前服务已经启动");
	}
	else //当前为服务停止状态，点击后启动服务
	{
		getMonitorData(g_getStateUrl, "ExecCmdStart", '1.0', para, "NULL");
	}
}

function stopService() {
	var curObj = g_svcStatus.get(g_curSvc);
	var para = {service_id:g_curSvc};
	if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
	{
		getMonitorData(g_getStateUrl, "ExecCmdStop", '1.0', para, "NULL");
	}
	else
	{
		alert("当前服务已经停止");
	}
}

function addService() {
    var para = {};
    var pkg = $('#file').fileinput('getFileStack');
    if (pkg.length == 0)
        $('#addService').popover('请选择服务配置文件！')
    para.package_name = pkg[0].name;

	$("#addServiceForm").submit(function () {
		$.ajax({
		type: "POST",
		action: "/action/uploadFile",
		enctype:"multipart/form-data",
		data: $(this).serialize(),
		  success: function(response, xml) {
			 getMonitorData(g_actionMonitorUrl, "AddSvc", '1.0', para, "NULL");
		   }
		})
	});
	$("#addServiceForm").submit();
}

function dealRemoveService(response) {
	var rsp = JSON.parse(response);
	var code = parseInt(rsp.code);
	if (code == 0)
	{
		$('#removeResultContent').text("服务删除成功！");
		$('#removeResultDlg').modal('show');
		$('#myTab a:first').tab('show');
	}
	else{
		$('#removeResultContent').text("服务删除失败！");
		$('#removeResultDlg').modal('show');
	}
}

function showRemoveConfirmDlg(serviceId) {
	$('#removeTip').val("您确认要删除服务{0}吗？".format(serviceId));
	$('#confirmRemoveServiceBtn').on("click", function () {
		removeService(serviceId);
	})
}
function removeService(serviceId) {
	var para = {service_id:serviceId};
	getMonitorData(g_actionMonitorUrl, "RemoveSvc", '1.0', para, dealRemoveService);
}

function loadRemoveServiceList() {
	var keys = g_svcStatus.keys();
	var items ="";
	for (var key of g_svcStatus.keys()) {
		var item = "<a href=\"#\"  onclick=\"showRemoveConfirmDlg('{0}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{1}</a>".format(key, key);
		items += item;
	}
	$("#removeSvcList").html(items);
}

function updateBin() {
	var para = {};
	var package = $('#updatePackage').fileinput('getFileStack');
    if (package.length == 0)
        $('#addService').popover('请选择服务配置文件！')
    para.package_name = package[0].name;
		$("#updateBinForm").submit(function () {
		$.ajax({
		type: "POST",
		action: "/action/uploadFile",
		enctype:"multipart/form-data",
		data: $(this).serialize(),
		success: function(response, xml) {
			  console.log("upload file finish!");
			 getMonitorData(g_actionMonitorUrl, "UpdateCmd", '1.0', para, "NULL");
		   }
		})
	});
	$("#updateBinForm").submit();
}

