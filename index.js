var g_intance;
$(function(){
    $("#fakeloader").fakeLoader({
        timeToHide:1200,
        bgColor:"#3498db",
        spinner:"spinner4"
    });
	setLoginUser();
	window.onbeforeunload = function () {
		
	};
});

function doOnResize() {
	var hg = Math.round(document.documentElement.clientHeight*0.25);
	$('#logDiv').height(hg);
	if($("#logDiv").is(":hidden")){
		Math.round(document.documentElement.clientHeight*0.8)
	}else{
		$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.6));
	}
}

function setLoginUser()
{
	var xmlhttp = sendRequest("/action/getLoginUser", 'GET',  "application/x-www-form-urlencoded", "");
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	   	{
		 	//举个例子,如果结果是1代表登录成功跳转到index.html，并保存用户名否则提示登录失败消息
		  	var user=xmlhttp.responseText;
			g_intance = new Manager();
			g_intance.init(user);
		  	var user = "<span class=\"glyphicon glyphicon-user\"></span>" + "   " + user;
		  	$('#loginUserName').html(user);
	    }
	  }
}

function doAddMonitorService() {
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function doHomePage() {
	$('#monitorLog').show();
	doOnResize();
}

function doMonitorPage() {
    if (g_intance.serviceMap.size > 0){
        $('#monitorLog').show();
	    doOnResize();
    }
    else{
        showTip('请先添加需要监控的服务！');
    }
}
function addService() {
	$("#addServiceForm").submit();
}

function doAddServiceTab() {
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function doUpdateBinTab() {
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function showRemoveSvcConfirmDlg(ip, serviceId) {
	$('#removeTip').val("您确认要删除服务{0}吗？".format(serviceId));
	$('#confirmRemoveServiceBtn').on("click", function () {
		var server = g_intance.getServer(ip);
		server.removeSvc(serviceId);
	})
}

function loadRemoveServiceList() {;
	var items ="";
	g_intance.serviceMap.forEach(function (service, serviceId) {
		var item ="";
		if (service.status_run == 1){
			item =  "<a href='#' class='list-group-item disabled' ><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\">请先停止服务</span>{0}</a>".format(serviceId);
		}
		else {
			item = "<a href=\"#\"  onclick=\"showRemoveMonitorServiceConfirmDlg('{0}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{1}</a>".format(serviceId, serviceId);
		}
		items += item;
	})
	$("#removeSvcList").html(items);
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function showRemoveMonitorServiceConfirmDlg(serviceId) {
	$('#removeTip').val("您确认要删除服务吗？");
	$('#confirmRemoveServiceBtn').on("click", function () {
		delMonitor(serviceId);
	});
}

function loadRemoveMonitorServiceList() {
	var items ="";
	g_intance.serviceMap.forEach(function (service, serviceId) {
		var item = "<a href=\"#\"  onclick=\"showRemoveMonitorServiceConfirmDlg('{0}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{1}</a>".format(serviceId, serviceId);
		items += item;
	});
	$("#removeMonitorServiceList").html(items);
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function updateBin() {
	$("#updateBinForm").submit();
}

function saveMonitorConfig() {
	var svrLst = [];
	g_intance.serverMap.forEach(function (server, ip) {
		var item = {ip:ip,port:server.port, cipher:server.cipher,user:server.userName, monitor_service:server.monitorService};
		svrLst.push(item);
	});
	var content = {user:g_intance.localServer.userName, monitor:svrLst};
	g_intance.localServer.saveToServer(JSON.stringify(content));
}

function dealTestSvcStatus(response)
{
	console.log(response);
}

function testSvcStatus(){
	g_intance.serverMap.forEach(function (server, ip) {
		var para = {service_id:['A5_MCenter_xhm']};
		server.serverRequest("GetSvcStatus",para, dealTestSvcStatus);
	});
}

function delMonitor(serviceId) {
	var service = g_intance.getService(serviceId);
	var server = g_intance.getServer(service.serverIp);
	for(var i = 0; i < server.monitorService.length; i++){
		if (server.monitorService[i] == serviceId){
			server.monitorService.splice(i, 1);
		}
	}
	g_intance.removeService(serviceId);
	saveMonitorConfig();
	g_intance.initUi();
	g_intance.updateUi();
	loadRemoveMonitorServiceList();
}

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

function dealForeignLogin(data) {
	var obj = JSON.parse(data);
	if (obj.code == 1 ){
		var foreigner = new Server("NULL", g_intance.foreignIp, g_intance.foreignPort, true, obj.cipher, g_intance.userName);
		foreigner.startMonitor();
		g_intance.serverMap.set(g_intance.foreignIp, foreigner);
		console.log("添加服务器：" + foreigner.ip + "成功！");
	}
	else{
		showTip("用户名或者密码错误！");
	}
}

function SendRequest(url, func, para,async, callback) {
	var req = new Request("1.0", func, para);
	var postStr = JSON.stringify(req);
	$.ajax({
		url:url,
		data: postStr,
		async:async,
		type:"POST",
		success :function(response){
			callback(response);
		},
		error: function() {
		}
	});
}

function loginForeignServer(serviceId, ip, port, userName, pass) {
	g_intance.foreignIp = ip;
	g_intance.foreignPort = port;
	g_intance.service_id = serviceId;
	g_intance.userName = userName;
	var url = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	if (!Boolean(ping(url)))
	{
		alert("服务无法连接，请检查网络或目标服务是否启用！");
		return;
	}
	var para = {userName:userName, password:pass, service_id:serviceId};
	SendRequest(url, "ForeignLogin", para, false, dealForeignLogin);
}

function saveXmlConfig() {
	var showText = $('#curSvc').val();
	var ip = showText.split(':')[0];
	var serviceId = showText.split(':')[1];
	var server = g_intance.getServer(ip);
	server.saveXml(serviceId);
}

function showXmlConfig(serviceId) {
	$('#curSvc').text(serviceId);
	var service = g_intance.getService(serviceId);
	service.getSvcXml();
}



function loadModService() {
	$("#modServiceSidebar").empty();
	var sideBarHtml = "<ul class='nav nav-list'>";
	var icon = "", color = "";
	for(var service of g_intance.serviceMap.values())
	{
		if (service.status_run == 1){
			icon = 'glyphicon-play';
			color = 'green';
		}
		else {
			icon = 'glyphicon-stop';
			color = 'red';
		}
		var svc =  "<li><a class='list-group-item' href='#' onclick='showXmlConfig(\"{3}\")'><span class='glyphicon {0}' style='color:{1}'></span>{2}</a></li>"
		.format(icon, color, service.serviceId, service.serviceId);
		sideBarHtml += svc;
	}
	sideBarHtml += "</ul>";
	$('#modServiceSidebar').html(sideBarHtml);

	$('#modServiceSidebar >ul >li > a').click(function(e)
	{
		e.preventDefault();
		//var sidebar = $('#modServiceSidebar');
		var li = $(this).parents('li');
		var lis = $('#modServiceSidebar li');
		for(var i = 0; i < lis.length; i++){
			var curLi = lis[i];
			$(curLi).attr("class", "");
		}
		$(li).attr("class", "active");
	});
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}