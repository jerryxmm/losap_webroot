$(function(){
	resize();
	$('#username').val('jerry');
	$('#password').val('12345');
});

function login(){
	var username=$('#username').val();
	var password=$('#password').val();
	if(username==''||password==''){
		$('#error').html('用户名密码不为空');
		return;
	}
	loadXMLDoc(username,password,'/action/login');
}

function loadXMLDoc(username,password,url)  
{  
	var xmlhttp;  
	if (window.XMLHttpRequest)  
	  {// code for IE7+, Firefox, Chrome, Opera, Safari  
	  xmlhttp=new XMLHttpRequest();  
	  }  
	else  
	  {// code for IE6, IE5  
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");  
	  }
	xmlhttp.open("POST",url,true);  
	xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
	var postStr   = "username="+ username +"&password="+ password; 
	xmlhttp.send(postStr);  
}  

function resize(){
	var Sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
	(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
	(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
	(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
	(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	var documentHeight=document.documentElement.clientHeight;
	var navHeght=$("div[class='navbar navbar-fixed-top']").height();

	$('#login-container').attr('style','min-height:'+(documentHeight-navHeght-130)+'px');
}