/**
 * Created by jerry on 2016/11/7.
 */
$(document).ready(function(){
    // === Sidebar navigation === //
	$('.submenu > a').click(function(e)
	{
		e.preventDefault();
		var submenu = $(this).siblings('ul');
		var li = $(this).parents('li');
		var submenus = $('#sidebar li.submenu ul');
		var submenus_parents = $('#sidebar li.submenu');
		if(li.hasClass('open'))
		{
			if(($(window).width() > 768) || ($(window).width() < 479)) {
				submenu.slideUp();
			} else {
				submenu.fadeOut(250);
			}
			li.removeClass('open');
		} else
		{
			if(($(window).width() > 768) || ($(window).width() < 479)) {
				submenus.slideUp();
				submenu.slideDown();
			} else {
				submenus.fadeOut(250);
				submenu.fadeIn(250);
			}
			submenus_parents.removeClass('open');
			li.addClass('open');
		}
	});

	var ul = $('#sidebar > ul');

	$('#sidebar > a').click(function(e)
	{
		e.preventDefault();
		var sidebar = $('#sidebar');
		if(sidebar.hasClass('open'))
		{
			sidebar.removeClass('open');
			ul.slideUp(250);
		} else
		{
			sidebar.addClass('open');
			ul.slideDown(250);
		}
	});

	// === Resize window related === //
	$(window).resize(function()
	{
		if($(window).width() > 479)
		{
			ul.css({'display':'block'});
			$('#content-header .btn-group').css({width:'auto'});
		}
		if($(window).width() < 479)
		{
			ul.css({'display':'none'});
			fix_position();
		}
		if($(window).width() > 768)
		{
			$('#user-nav > ul').css({width:'auto',margin:'0'});
            $('#content-header .btn-group').css({width:'auto'});
		}
	});

	if($(window).width() < 468)
	{
		ul.css({'display':'none'});
		fix_position();
	}

	if($(window).width() > 479)
	{
	   $('#content-header .btn-group').css({width:'auto'});
		ul.css({'display':'block'});
	}

	// === Tooltips === //
	$('.tip').tooltip();
	$('.tip-left').tooltip({ placement: 'left' });
	$('.tip-right').tooltip({ placement: 'right' });
	$('.tip-top').tooltip({ placement: 'top' });
	$('.tip-bottom').tooltip({ placement: 'bottom' });
});

var g_getStateUrl = "/action/getstate";
var g_actionMonitorUrl = "/action/actionMonitor";
var g_svcStatus = new Map();
var g_curSvc = "";
var g_updateLag = 3000; //刷新间隔时间
var g_freshStateFlag = true;
var g_freshLogFlag = true;
var g_logFileLocation = {};
var g_maxLogNum = 2000;

//设置用户名
function setLoginUser()
{
	var xmlhttp = sendRequest("/action/getLoginUser", 'GET',  "application/x-www-form-urlencoded", "");
	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	   	{
	   		console.log(xmlhttp.responseText);
		 //举个例子,如果结果是1代表登录成功跳转到index.html，并保存用户名否则提示登录失败消息
		  var user=xmlhttp.responseText;
            var user = "<span class=\"glyphicon glyphicon-user\"></span>" + "   " + user;
		  $('#loginUserName').html(user);
	    }
	  }
}

function GetLog() {
	if (Boolean(g_freshLogFlag))
	{
		var para = {file_location:g_logFileLocation};
		getMonitorData(g_getStateUrl,"ListSvcLog", '1.0', para, dealListSvcLog);
		g_freshLogFlag = false;
	}
}

function dealListSvcLog(data) {
	var obj = JSON.parse(data);
 	var head = obj.metadata;
 	var records = obj.records;
	var svrLst = "";
	svrLst += '<ul>';
	var color;
	var curRecord;
	var icon;
	g_logFileLocation = obj.file_location;
//	AXLOG_TYPE_INFO, 0
//	AXLOG_TYPE_WARN, 1
//	AXLOG_TYPE_ERROR, 2
//	AXLOG_TYPE_DEBUG, 3
	var type = "";
	g_freshLogFlag = true;
	var logArea = $('#logArea');

 	for(var i = 0 ; i < records.length; i++)
 	{
		curRecord= records[i];
		switch(curRecord.log_type)
		{
			case 0: type = "list-group-item-info";break;
			case 1: type = "list-group-item-warning";break;
			case 2: type = "list-group-item-danger"; break;
			case 3: type = "list-group-item-success"; break;
			default:break;
		}
		var li = "<li class=\"list-group-item {0}\">{1} {2} {3} {4}</li>".format(type, curRecord.log_time, curRecord.log_type, curRecord.svc, curRecord.note);
		logArea.append(li);
		// var lis=logArea
		// if (lis.length > g_maxLogNum)
		// {
		// 	lis[0].remove();
		// }
 	}
}