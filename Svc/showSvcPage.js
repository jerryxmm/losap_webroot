function showSvcPage(serviceId) {
	funcName = "ListSvcItem";
	//serviceId = getQueryString("serviceId");
	var execFunc = funcName+'("'+serviceId + '")';
	eval(execFunc);
	g_curSvc = serviceId;
    $('#monitorObject').html("");
	$("#grid").hide();
	initServicePage(serviceId);
}

function initServicePage(serviceId) {
	var curObj = g_svcStatus.get(serviceId);
	var serviceInfo = "版本号：{0}  启动时间：{1}".format(curObj.version, curObj.uptime);
	$('#serviceInfo').text(serviceInfo);
	$('#serviceName').text(serviceId);
	if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
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

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
} 

function ShowListSvcInfo(varData)
{
	//alert(varData);
	var table = parseJsonToTable(varData);
	//$('#grid').html(table);
}

function ShowListSvcItem(str, serviceId)
{
	  var obj = JSON.parse(str); 
      var head = obj.metadata;
      var records = obj.records;
      var monObjs = "";
      for (var i=0;i<records.length;i++)
      {
		  var rec = records[i];
		  if ( rec.show == 1)
		  {
			  var monObj = "<li role=\"presentation\" ><a href=\"#\" onclick=\"ListSvcItemInfo('{0}','{1}')\">{2}</a></li>".format(serviceId, rec.id,rec.name);
         	 monObjs += monObj;
		  }
      }
      $('#monitorObject').html(monObjs);
}

function ListSvcItemInfo(serviceId, obj)
{
	//alert("in ListSvcItemInfo:" + serviceId+ "/" +obj);
	var para = {service_id:serviceId, object:obj};
	getMonitorData(g_getStateUrl, "ListSvcItemInfo", '1.0', para, ShowListSvcInfo);
	g_serviceId = serviceId;
	g_object = obj;
}

function ShowListSvcInfo(varData)
{
	// var table = parseJsonToTable(varData);
	 $('#table').bootstrapTable('destroy');

     var table = JSON.parse(varData);
      if (table.metadata == undefined)
      {
      	return;
      }
      var metadata = table.metadata;
      var data = table.records;
      var head = [];
	  var rec = {};
      for(var i = 0; i < metadata.length; i++)
      {
		  var headCol = {title: metadata[i].ColDesc,field: metadata[i].ColName};
      	  head.push(headCol);
      }
	$.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);
	$('#table').bootstrapTable({
		columns:head,
		data:data,
		striped: true,
		pagination: true,
		pageSize: 10,
		showRefresh: true,
		showToggle: true,
		cardView: false,
		showPaginationSwitch:true,
		detailView: true,
		showExport: false,
		exportDataType: "basic",
		search:true,
	});
}

function ListSvcInfo(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcInfo", '1.0', para, ShowListSvcInfo);
}

function ListSvcItem(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcItem", '1.0', para, ShowListSvcItem);
}


function ListSvcLog(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcLog", '1.0', para, ShowListSvcInfo);
}

function ListSvcLogInfo(serviceId)
{
	var para = {service_id:serviceId};
	getMonitorData(g_getStateUrl, "ListSvcLogInfo", '1.0', para, ShowListSvcInfo);
}

function execCmd()
{
	var sql = $("#sqlText").val();
	var para = {service_id:g_curSvc, cmd: sql};
	getMonitorData(g_actionMonitorUrl,"ExecCmd", '1.0', para, ShowListSvcInfo);
}