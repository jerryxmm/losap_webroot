function showSvcPage(serviceId) {
	funcName = "ListSvcItem";
	//serviceId = getQueryString("serviceId");
	var execFunc = funcName+'("'+serviceId + '")';
	eval(execFunc);
	g_curSvc = serviceId;
    $('#monitorObject').html("");
	$("#grid").hide();
	var curObj = g_svcStatus.get(serviceId);
	var serviceInfo = "版本号：{0}  启动时间：{1}".format(curObj.version, curObj.uptime);
	$('#serviceInfo').text(serviceInfo);
	$('#serviceName').text(serviceId);
	if (curObj.status_run == 1) //当前为启动状态，点击后停止服务
	{
		$("#svcControl").html("停止服务");
	}
	else //当前为服务停止状态，点击后启动服务
	{
		$("#svcControl").html("启动服务");
	}
	var cNode =document.getElementById('sidebar').getElementsByTagName('li');
	for( var i=0; i<cNode.length; i++){
		cNode[i].setAttribute('class', '');
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
          var monObj = "<li role=\"presentation\" ><a href=\"#\" onclick=\"ListSvcItemInfo('{0}','{1}')\">{2}</a></li>".format(serviceId, rec.id,rec.name);
          monObjs += monObj;
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
	// $("#grid").html(table);

     var table = JSON.parse(varData);
      if (table.metadata == undefined)
      {
      	$("#grid").hide();
      	return;
      }
      var metadata = table.metadata;
      var data = table.records;
      var head = [];
      for(var i = 0; i < metadata.length; i++)
      {
      	var headCol = {title: metadata[i].ColDesc, width: 100,dataIndx: metadata[i].ColName, align: "right"};
      	head.push(headCol);
      }
      var obj = {
		         // width: 1000,
		         // minWidth:1000,
		         flexWidth: true,
      	 		  height: 500,
      	 		  title: "Result" ,
      	 		  pageModel: {type: "local", rPP:20, strRpp:"{0}", strDisplay:"{0} to {1} of {2}"},
      	 		  numberCell: { resizable: true, title: "#" },
      	 		  resizable:true,
      	 		  draggable:true,
		          viewrecords: true,
		          editable:false,
      	 		  colModel: head,
      	 		  dataModel:{ data: data }
      	 		};
	$("#grid").show();
    $("#grid").pqGrid(obj);
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