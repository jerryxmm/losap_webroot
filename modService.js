$(function(){
	setLoginUser();
	freshSvcState();
	// setInterval("freshSvcState()",g_updateLag);
	// setInterval("GetLog()",g_updateLag);
});

function freshSvcState() {
	if (Boolean(g_freshStateFlag))
	{
		getMonitorData(g_getStateUrl,"ListSvc", '1.0', "NULL", dealModServiceListSvc);
		g_freshStateFlag = false;
	}
}

function dealModServiceListSvc(data) {
	var svrLst = dealListSvc(data);
	$('#sidebar').html(svrLst);
	g_freshStateFlag = true;
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
		var svc =  "<li><a class='list-group-item' href='#' onclick=\"modService('{0}')\"><span class='glyphicon {1}' style='color:{2}'></span>{3} {4}</a></li>"
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

function modService(serviceId) {
    var para = {};
	para.service_id = serviceId;
	getMonitorData(g_actionMonitorUrl, "GetSvcXml", '1.0', para, dealSvcXml);
}

function traverseNode(node, layer) {
    if (node.nodeName == "#text")
        return;
	var desc = "";
    if (node.hasAttribute("ps"))
    {
		desc = "项:"+ node.nodeName + "    描述:" + node.getAttribute("ps");
        console.log(node.nodeName + node.getAttribute("ps"));
    }
	else{
		desc = "项:"+ node.nodeName;
	}

	if (node.hasAttribute("Value"))
	{
		$("#content").append("<div class='list-inline'><p>{1}</p> <input type='text' value='{0}'></div>".format(node.getAttribute("Value"), desc));
	}
	else
	{
		if (layer == 1)
		{
			$('#content').append("".format(desc));
			$('#content').append("");
			$('#content').append("<HR style=\"FILTER: alpha(opacity=100,finishopacity=0,style=2)\" width=\"80%\" color=#987cb9 SIZE=10>");
		}
		else if (layer == 2)
		{
			$('#content').append("<h5>{0}</h5>".format(desc));
		}
	}

    var children = node.childNodes;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        traverseNode(child, layer+1);
    }
}

var g_xmlDoc;
function dealSvcXml(response) {
    var obj = JSON.parse(response);
    var xml = obj.content;
	parser=new DOMParser();
    g_xmlDoc=parser.parseFromString(xml,"text/xml");
	$('#content').empty();
    traverseNode(g_xmlDoc.documentElement, 1);
}

function saveXml() {
    if (g_xmlDoc == undefined)
        return;
    var content = XML2String(g_xmlDoc);
    console.log(content);
}

function XML2String(xmlObject) {
    return (new XMLSerializer()).serializeToString(xmlObject);
}
