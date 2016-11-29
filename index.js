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

Manager.prototype.getServer = function (ip) {
	return this.serverMap.get(ip);
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
	// $('#ttt[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	//   e.target // newly activated tab
	//   e.relatedTarget // previous active tab
	// 	initHomePage();
	// })
	// var tab = getQueryString("tab");
	// if (tab != null)
	// {
	// 	$('#myTab a[href="#{0}"]'.format(tab)).tab('show');
	// }

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

var g_foreignSeverLst = [];
function dealGetForeignServer(data) {
	g_foreignSeverLst = JSON.parse(data);
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