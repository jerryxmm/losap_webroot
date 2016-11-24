
$(function(){
	setLoginUser();
	freshSvcState();
	 GetServerInfo();
	 setInterval("GetServerInfo()",g_updateLag);
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

	document.querySelector('ul[id=monitorObject]').onclick = function (e) {
                $('#monitorObject > li').removeClass('active');
                var target = e.target;
				var liObj = target.parentElement;
				liObj.setAttribute("class", "active");
            }

    // $.getJSON("http://192.168.60.135:4101/Public/remote.js",function(data){
    //      alert('我是本地函数，可以被跨域的remote.js文件调用，远程js带来的数据是：' + data.result);
    // });
	//alert('目前 jQuery 版本：' + $().jquery);
	//remoteTest();
	//cors();
	//setInterval("remoteTest()",g_updateLag);
});

function cors(){
	var url = "http://192.168.60.135:4101/action/actionMonitor";
	var xhr = createCORSRequest('POST', url);  
	if (!xhr) {  
	  throw new Error('CORS not supported');  
	} 
	xhr.onreadystatechange=function()  
    {  
      if (xhr.readyState==4 && (xhr.status==200 || xhr.status==302)){
            console.log(xhr.responseText);
               // var response = xmlhttp.responseText; 
        }
    }
	
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	var para = {version:"1.0", func:"ListSvc", param:"NULL"};
	var req = JSON.stringify(para);
    xhr.send(req); 
}
function createCORSRequest(method, url) {  
  var xhr = new XMLHttpRequest();  
  if ("withCredentials" in xhr) {  
    // 此时即支持CORS的情况  
    // 检查XMLHttpRequest对象是否有“withCredentials”属性  
    // “withCredentials”仅存在于XMLHTTPRequest2对象里  
    xhr.open(method, url, true);  
   
  }else {  
   
    // 否则，浏览器不支持CORS  
    xhr = null;  
   
  }  
  return xhr;  
}
function remoteTest() {
	// $.getJSON("http://192.168.60.135:4101/Public/remote.js", { name: "John", time: "2pm" }, function(json){
	//   console.log('code = ' + code +'您查询到航班信息：票价： ' + json.price + ' 元，余票： ' + json.tickets + ' 张。');
	// });
	var para = {version:"1.0", func:"ListSvc", param:"NULL"};
	var uu = "http://192.168.60.135:4101/action/jsonp?data={0}".format(JSON.stringify(para));
	var urlStr = encodeURI(uu);
	console.log(uu);
	$.ajax({
		 type: "get",
		 async: false,
		 url: urlStr,
		 dataType: "jsonp",
		 jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
		 jsonpCallback:"doHandler",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
		 success: function(json){
			 console.log(json);
			// var code = getQueryString("code");
			// console.log('code = ' + code +'您查询到航班信息：票价： ' + json.price + ' 元，余票： ' + json.tickets + ' 张。');
		 },
		 error: function(){
			 alert('fail');
		 }
	 });
}

function initHomePage() {
	$("#svcView").empty();
	for (var [key, value] of g_svcStatus) {
	  createSvcViewItem(key, value);
	}
}
function createSvcViewItem(svcName, value) {
	var image = "";
	var userColor ="";
	var clientNum = ""
	if (value.status_run == 1)
	{
		image = "images/jdzt_green_pic.png";
		userColor = "green";
		clientNum = value.online_client;
	}
	else
	{
		image = "images/jdzt_red_pic.png";
		userColor = "red";
	}
	var node = "<div class='col-lg-2 jkjd_fw'>"+
					"<div class='jkjd_name'><span class='r tc'><img src=\"{0}\" /></span>".format(image) +
                        "<div class='jkjd_fwname'><a href='#monitorPage'  data-toggle='tab' onclick=\"showSvcPage('{0}')\">{1}</a></div>".format(svcName,svcName) +
                    "</div>" +
                    "<div class='row'>" +
                            "<div class='col-lg-3'><span class='glyphicon glyphicon-user' style=\"color: {0};margin-left: 5px\">{1}</span></div>".format(userColor, clientNum) +
                        "<div class=\"col-lg-6 col-lg-offset-2\">" +
                            "<p class='info'>全部笔数<span class='fs20'>{0}</span></p>".format(value.all_proc)+
                            "<p class='info'>全部笔数<span class='fs20'>{0}</span></p>".format(value.unproc) +
                            "<p class='info'>全部笔数<span class='fs20'>{0}</span></p>".format(value.proc_speed)+
                        "</div>"+
                    "</div>"+
                "</div>";
	// var node = "<div class=\"col-lg-2 jkjd_fw\"><div class=\"jkjd_name\"><span class=\"r tc\"><img src=\"{0}\" /></span><div class=\"jkjd_fwname\"><a href='#monitorPage'  data-toggle='tab' onclick=\"showSvcPage('{2}')\">{1}</a></div></div><div class=\"jkjd_yj tc\">全部笔数<span class='fs20'>{3}</span></div><div class=\"jkjd_yj tc\">未处理数<span class='fs20'>{4}</span></div><div class=\"jkjd_yj tc\">处理速度<sapn  class='fs20'>{5}</sapn></div></div>"
	// 	.format(image,svcName,svcName, value.all_proc, value.unproc, value.proc_speed);
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
	$("#addServiceForm").submit();
}

function dealRemoveService(response) {
	var rsp = JSON.parse(response);
	var code = parseInt(rsp.code);
	if (code == 0)
	{
		$('#removeResultContent').text("服务删除成功！");
		$('#removeResultDlg').modal('show');
		//$('#myTab a:first').tab('show');
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
	$("#updateBinForm").submit();
}

function GetServerInfo() {
	getMonitorData(g_getStateUrl,"GetServerInfo", '1.0', "NULL", dealServerInfo);
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
