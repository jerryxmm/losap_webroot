
$(function(){
	setLoginUser();
	freshSvcState();
	setInterval("freshSvcState()",g_updateLag);
	setInterval("GetLog()",g_updateLag);
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
	$('#updatePackage').on('fileuploaded', function(event, data, previewId, index) {
    var form = data.form, files = data.files, extra = data.extra,
        response = data.response, reader = data.reader;
    console.log('File uploaded triggered');
});
});

function initHomePage() {
	$("#svcView").empty();
	for (var [key, value] of g_svcStatus) {
	  createSvcViewItem(key, value);
	}
}
function createSvcViewItem(svcName, value) {
	var image = "";
	if (value.status_run == 1)
	{
		image = "images/jdzt_green_pic.png";
	}
	else
	{
		image = "images/jdzt_red_pic.png";
	}
	var node = "<div class=\"col-lg-2 jkjd_fw\"><div class=\"jkjd_name\"><span class=\"r tc\"><img src=\"{0}\" /></span><div class=\"jkjd_fwname\"><a href='#'>{1}</a></div></div><div class=\"jkjd_yj tc\">当前<font>0</font>条预警</div></div>".format(image,svcName);
	$("#svcView").append(node);
}


function SVCInfo(status, status_run, status_alert, version, uptime)
{
	this.status = status;
	this.status_run = status_run;
	this.status_alert = status_alert;
	this.version = version;
	this.uptime = uptime;
}

function freshSvcState() {
	if (Boolean(g_freshStateFlag))
	{
		getMonitorData(g_getStateUrl,"ListSvc", '1.0', "NULL", dealHomeListSvc);
		g_freshStateFlag = false;
	}
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
	return svrLst;
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
		async:false,
		action: "/action/uploadFile",
		enctype:"multipart/form-data",
		data: $(this).serialize(),
			statusCode: {505: function() {
    alert('page not found');
  }},
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
	// var para = {};
	// var package = $('#updatePackage').fileinput('getFileStack');
    // if (package.length == 0)
     //    $('#addService').popover('请选择服务配置文件！')
    // para.package_name = package[0].name;
	// 	$("#updateBinForm").submit(function () {
	// 	$.ajax({
	// 	type: "POST",
	// 	action: "/action/uploadFile",
	// 	enctype:"multipart/form-data",
	// 	data: $(this).serialize(),
	// 	success: function(response, xml) {
	// 		  console.log("upload file finish!");
	// 		 getMonitorData(g_actionMonitorUrl, "UpdateCmd", '1.0', para, "NULL");
	// 	   }
	// 	})
	// });
	$("#updateBinForm").submit();
}