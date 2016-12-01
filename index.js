var g_intance;
$(function(){
	setLoginUser();
	document.querySelector('ul[id=monitorObject]').onclick = function (e) {
                $('#monitorObject > li').removeClass('active');
                var target = e.target;
				var liObj = target.parentElement;
				liObj.setAttribute("class", "active");
            };
	window.onbeforeunload = function () {
		
	};
	doOnResize();
});

function doOnResize() {
	var hg = Math.round(document.documentElement.clientHeight*0.35);
	$('#logDiv').height(hg);
	if($("#logDiv").is(":hidden")){
		Math.round(document.documentElement.clientHeight*0.8)
	}else{
		$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.5));
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
			g_intance = new Manager(user)
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
	console.log("doHomePage");
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

function loadRemoveServiceList() {
	var svcStatus = g_intance.localServer.getSvcStatus();
	var svcLst = svcStatus.svcLst;
	var items ="";
	g_intance.serviceMap.forEach(function (ip, serviceId) {
		var server = g_intance.getServer(ip);
		var value = server.getSvc(serviceId);
		var item ="";
		if (value.status_run == 1){
			item =  "<a href='#' class='list-group-item disabled' ><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\">请先停止服务</span>{0}</a>".format(serviceId);
		}
		else {
			item = "<a href=\"#\"  onclick=\"showRemoveMonitorServiceConfirmDlg('{0}','{1}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{2}</a>".format(ip, serviceId, serviceId);
		}
		items += item;
	})
	$("#removeSvcList").html(items);
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}

function showRemoveMonitorServiceConfirmDlg(ip, serviceId) {
	$('#removeTip').val("您确认要删除服务吗？");
	$('#confirmRemoveServiceBtn').on("click", function () {
		delMonitor(ip, serviceId);
	});
}

function loadRemoveMonitorServiceList() {
	var items ="";
	g_intance.serviceMap.forEach(function (ip, serviceId) {
		var item = "<a href=\"#\"  onclick=\"showRemoveMonitorServiceConfirmDlg('{0}','{1}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{2}</a>".format(ip, serviceId, serviceId);
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

function addMonitor(ip, service) {
	g_intance.serviceMap.set(service, ip);
	var server = g_intance.getServer(ip);
	server.monitorService.push(service);
	saveMonitorConfig();
}

function delMonitor(ip, service) {
	g_intance.serviceMap.delete(service);
	var server = g_intance.getServer(ip);
	for(var i = 0; i < server.monitorService.length; i++){
		if (server.monitorService[i] == service){
			server.monitorService.splice(i, 1);
		}
	}
	saveMonitorConfig();
}

function addMonitorService() {
	var ip = $('#serverIP').val();
	var port = $('#serverPort').val();
	var serviceId = $('#serviceId').val();
	var svc = g_intance.serviceMap.get(serviceId);
	if (svc != undefined)
	{
		showTip("监控服务名已经存在，添加监控失败！");
		return;
	}
	var server = g_intance.getServer(ip);
	if (server != undefined){
		svc = server.serviceMap.get(serviceId);
		if (svc == undefined) {
			showTip("监控服务不存在或者服务器监控服务未启动，添加监控失败！");
		}else{
			addMonitor(ip, serviceId);
			showTip("监控服务添加成功！");
		}
	}else{
		var userName = $('#serverUser').val();
		var pass = $('#serverPassword').val();
		loginForeignServer(serviceId, ip, port, userName, pass);
	}
}

function dealForeignLogin(data) {
	var obj = JSON.parse(data);
	if (obj.code == 1 ){
		if (obj.hasService == 1){
			var foreigner = new Server("NULL", g_intance.foreignIp, g_intance.foreignPort, true, obj.cipher, g_intance.userName);
			foreigner.startMonitor();
			g_intance.serverMap.set(g_intance.foreignIp, foreigner);
			addMonitor(g_intance.foreignIp, g_intance.service_id);
			showTip("监控服务添加成功!");
		}else
		{
			showTip("监控服务不存在,添加监控失败!");
		}
	}
	else{
		showTip("用户名或者密码错误！");
	}
}

function loginForeignServer(serviceId, ip, port, userName, pass) {
	g_intance.foreignIp = ip;
	g_intance.foreignPort = port;
	g_intance.service_id = serviceId;
	g_intance.userName = userName;
	var url = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	var para = {userName:userName, password:pass, service_id:serviceId};
	getMonitorData(url, "ForeignLogin", "1.0", para, dealForeignLogin);
}

function saveXmlConfig() {
	var showText = $('#curSvc').val();
	var ip = showText.split(':')[0];
	var serviceId = showText.split(':')[1];
	var server = g_intance.getServer(ip);
	server.saveXml(serviceId);
}

function showXmlConfig(ip, serviceId) {
	var server = g_intance.getServer(ip);
	$('#curSvc').text(serviceId);
	server.getSvcXml(serviceId);

}

function generateSideBarNode(serverNode) {
	var records = serverNode.svcLst;
	var hideStr = "";
	if (serverNode.sideBarHide)
		hideStr = "style='display:none'";
	var svrLst =""
	var color;
	var curRecord;
	var icon;
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
		var svc =  "<li><a class='list-group-item' href='#' onclick='showXmlConfig(\"{3}\", \"{4}\")'><span class='glyphicon {0}' style='color:{1}'></span>{2}</a></li>"
		.format(icon, color, curRecord.svc_name, serverNode.ip, curRecord.svc_name);
		svrLst += svc;
	}
	return svrLst;
}

function loadModService() {
	$("#modServiceSidebar").empty();
	var sideBarHtml = "<ul class='nav nav-list'>";
	g_intance.serverMap.forEach(function (value, key) {
		sideBarHtml += generateSideBarNode(value.getSvcStatus());
	});
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