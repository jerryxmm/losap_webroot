var g_serverMap = new Map();
$(function(){
	setLoginUser();
	var local = new Server(window.location.host.split(':')[0], window.location.port, false);
	local.startMonitor();
	g_serverMap.set(local.ip, local);
	var serverLst = local.getForeignServer();
	if (serverLst != undefined)
	{
		for(var i = 0; i < serverLst.size; i++)
		{
			var foreigner = new Server(serverLst[i].ip, serverLst[i].port, true);
			foreigner.cipher = serverLst[i].cipher;
			foreigner.startMonitor();
			g_serverMap.set(foreigner.ip, foreigner);
		}
	}
	// $('#ttt[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	//   e.target // newly activated tab
	//   e.relatedTarget // previous active tab
	// 	initHomePage();
	// })
	var tab = getQueryString("tab");
	if (tab != null)
	{
		$('#myTab a[href="#{0}"]'.format(tab)).tab('show');
	}

	document.querySelector('ul[id=monitorObject]').onclick = function (e) {
                $('#monitorObject > li').removeClass('active');
                var target = e.target;
				var liObj = target.parentElement;
				liObj.setAttribute("class", "active");
            };
});

function Manager() {
	this.updataLag = 3000;
	this.init();
}
Manager.prototype.init = function () {
	
}

Manager.prototype.updateUI = function () {
	
}

function initHomePage() {
	$("#svcView").empty();
	var serverLst = [];
	for(var i = 0; i < g_serverLst.length; i++){
		serverLst.push(g_serverLst[i].getSvcStatus());
	}
	$('#svcView').testPlugin(
		{
			data:serverLst
		}
	);
}

function dealHomeListSvc(data) {
	var svrLst = dealListSvc(data);
	$('#sidebar').html(svrLst);
	g_freshStateFlag = true;
	initHomePage();
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
		var isActive="";
		if (g_curSvc == curRecord.svc_name)
		{
			isActive = "active";
		}
		var svc =  "<li class='{5}'><a class='list-group-item' href='#monitorTab' data-toggle='tab' onclick=\"showSvcPage('{0}')\"><span class='glyphicon {1}' style='color:{2}'></span>{3} {4}</a></li>"
		.format(curRecord.svc_name,icon, color, curRecord.svc_name, alertFlag, isActive);
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
	return svrLst;
}

function addService() {
	$("#addServiceForm").submit();
}

function showRemoveConfirmDlg(serviceId) {
	$('#removeTip').val("您确认要删除服务{0}吗？".format(serviceId));
	$('#confirmRemoveServiceBtn').on("click", function () {
		removeService(serviceId);
	})
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
	$("#updateBinForm").submit();
}


function dealServerInfo(data) {
	var obj = JSON.parse(data);
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

var g_foreignSeverLst = [];
function dealGetForeignServer(data) {
	g_foreignSeverLst = JSON.parse(data);
}

function dealForeignLogin(data) {
	var obj = JSON.parse(data);
}

function loginForeignServer() {
	var ip = $('#serverIP').val();
	var port = $('#serverPort').val();
	var userName = $('#serverUser').val();
	var pass = $('#serverPassword').val();
	var url = "http://{0}:{1}{2}".format(ip, port, g_foreignerUrl);
	var para = {userName:userName, password:pass};
	getForeignMonitorData(url, "ForeignLogin", para, dealForeignLogin);
}