function Manager() {
	this.updataLag = 3000;
	this.serverMap = new Map();
	this.foreignIp = "";
	this.foreignPort = '';
	this.foreignDesc = '';
	this.init();
};

Manager.prototype.showHomePage = function () {
	$("#svcView").testPlugin('destroy');
	$("#svcView").empty();
	var serverLst = [];
	this.serverMap.forEach(function (value, key) {
		serverLst.push(value.getSvcStatus());
	});
	$('#svcView').testPlugin(
		{
			data:serverLst
		}
	);
};

Manager.prototype.init = function () {
	console.log("init!!!");
//	var local = new Server(window.location.host.split(':')[0], window.location.port, false);
	var local = new Server('本机',window.location.host.split(':')[0], window.location.port, false);
	local.startMonitor();
	this.serverMap.set(local.ip, local);
	this.localServer = local;
	var serverLst = local.foreignerLst;
	if (serverLst != undefined)
	{
		for(var i = 0; i < serverLst.length; i++)
		{
			var server = serverLst[i];
			var foreigner = new Server(server.desc, server.ip, server.port, true);
			foreigner.cipher = serverLst[i].cipher;
			foreigner.startMonitor();
			this.serverMap.set(foreigner.ip, foreigner);
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
	//this.showHomePage();
	this.updateUiTimer = setInterval("g_intance.showHomePage()", this.updataLag);
};

Manager.prototype.stopUpdateUI = function () {
	clearInterval(this.updateUiTimer);
}

Manager.prototype.getSvc = function (ip, serviceId) {
	var server = this.serverMap.get(ip);
	return server.getSvc(serviceId);
}
$(function(){
	setLoginUser();
	document.querySelector('ul[id=monitorObject]').onclick = function (e) {
                $('#monitorObject > li').removeClass('active');
                var target = e.target;
				var liObj = target.parentElement;
				liObj.setAttribute("class", "active");
            };
});
var g_intance = new Manager();

function addService() {
	$("#addServiceForm").submit();
}

function showRemoveSvcConfirmDlg(serviceId) {
	$('#removeTip').val("您确认要删除服务{0}吗？".format(serviceId));
	$('#confirmRemoveServiceBtn').on("click", function () {
		removeService(serviceId);
	})
}

function loadRemoveServiceList() {
	var svcStatus = g_intance.localServer.getSvcStatus();
	var svcLst = svcStatus.svcLst;
	var items ="";
	for(var i = 0; i < svcLst.length; i++){
		var item = "<a href=\"#\"  onclick=\"showRemoveSvcConfirmDlg('{0}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{1}</a>".format(svcLst[i].svc_name, svcLst[i].svc_name);
		items += item;
	}
	$("#removeSvcList").html(items);
}

function showRemoveServerConfirmDlg(ip) {
	$('#removeTip').val("您确认要删除服务吗？");
	$('#confirmRemoveServiceBtn').on("click", function () {
		g_intance.localServer.removeForeigner(ip);
	});
}

function loadRemoveServerList() {
	var lst = g_intance.localServer.foreignerLst;
	var items ="";
	for(var i = 0; i < lst.length; i++){
		var item = "<a href=\"#\"  onclick=\"showRemoveServerConfirmDlg('{0}')\" class=\"list-group-item\" data-toggle=\"modal\" data-target=\"#removeConfirm\"><span class=\"glyphicon glyphicon-minus-sign pull-right\" style=\"color:red\"></span>{1}</a>".format(lst[i].ip, lst[i].desc);
		items += item;
	}
	$("#removeServerList").html(items);
}

function updateBin() {
	$("#updateBinForm").submit();
}

function dealForeignLogin(data) {
	console.log(data);
	var obj = JSON.parse(data);
	g_intance.localServer.addForeignerToServer(obj.cipher,g_intance.foreignIp, g_intance.foreignPort, g_intance.foreignDesc);
	$('#TipContent').text("服务节点添加成功，请重新刷新主页！");
	$('#TipDlg').modal('show');
}

function loginForeignServer() {
	var ip = $('#serverIP').val();
	var port = $('#serverPort').val();
	var userName = $('#serverUser').val();
	var pass = $('#serverPassword').val();
	g_intance.foreignIp = ip;
	g_intance.foreignPort = port;
	g_intance.foreignDesc = $('#serverDesc').val();
	var url = "http://{0}:{1}{2}".format(ip, port, "/action/corsService");
	var para = {userName:userName, password:pass};
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
	var showText = "{0}:{1}".format(ip, serviceId);
	$('#curSvc').text(showText);
	server.getSvcXml(serviceId);
}

function generateSideBarNode(serverNode) {
	var records = serverNode.svcLst;
	var hideStr = "";
	if (serverNode.sideBarHide)
		hideStr = "style='display:none'";
	var svrLst = " <li class='modSvcSubmenu' isSpan='true'> <a href='#'> <span>{0}</span> <span class='label label-important'>{1}</span></a>".format(serverNode.desc, records.length) +
		"<ul class='nav nav-list'>";
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
	svrLst +=   "</ul>" +
			"</li>";
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

	$('.modSvcSubmenu > a').click(function(e)
	{
		e.preventDefault();
		var submenu = $(this).siblings('ul');
		var li = $(this).parents('li');
		var ul = $(li).find('ul').first()[0];
		if(li.hasClass('open'))
		{	$(ul).slideDown();
			li.removeClass('open');
		} else
		{	$(ul).slideUp();
			li.addClass('open');
		}
	});
}