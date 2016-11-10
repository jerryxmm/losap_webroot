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
	var atts = node.attributes;
	if (layer != 1)
	{
		if (atts != undefined)
		{
			desc = node.nodeName;
			if (node.hasAttribute("ps"))
			{
					desc = desc + "--" + node.getAttribute("ps");
			}

			for(var i = 0; i < atts.length; i++)
			{
				var att = atts[i];
				console.log(att.name + "***"+att.nodeValue);
				if (att.name == "ps") {
					continue
				}
				else if (att.name == "Value")
				{
					var length =node.getAttribute("Value").length * 5;
					$("#content").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px' attr = '{3}'>{1}</div>"
						.format(att.nodeValue, desc, node.nodeName,att.name));
				}
				else
				 {
					 $("#content").append("<div class='list-inline' style='margin-left: 3%; margin-bottom: 10px'><input class='configValue' type='text' value='{0}' name='{2}' style='width: 300px'  attr = '{3}'>{1}</div>"
						.format(att.nodeValue, att.name, node.nodeName, att.name));
				 }
			}
		}
	}

	if (layer == 2)
	{
		$('#content').append("<h5 style=\"font-weight:bold;\">{0}</h5>".format(desc));
	}
    var children = node.childNodes;
    for(var i = 0; i < children.length; i++)
    {
        var child = children[i];
        traverseNode(child, layer+1);
    }
}

var g_xmlDoc;
function dealSvcXml(response, serviceId) {
    var obj = JSON.parse(response);
    var xml = obj.content;
	parser=new DOMParser();
    g_xmlDoc=parser.parseFromString(xml,"text/xml");
	$('#content').empty();
	$('#curSvc').text(serviceId);
    traverseNode(g_xmlDoc.documentElement, 1);
	$('.configValue').on('input', function() {
		var node = g_xmlDoc.getElementsByTagName($(this).attr('name'));
		var attr = $(this).attr('attr');
		node[0].setAttribute(attr, $(this).val());
	});
}

function saveXml() {
    if (g_xmlDoc == undefined)
        return;
    var content = XML2String(g_xmlDoc);
    console.log(content);
	var para = {};
	var ddd = $('#curSvc');
	para.service_id = ddd[0].innerText;
	para.content = content;
	getMonitorData(g_actionMonitorUrl, "SaveSvcXml", '1.0', para, "NULL");
}

function XML2String(xmlObject) {
    return (new XMLSerializer()).serializeToString(xmlObject);
}
