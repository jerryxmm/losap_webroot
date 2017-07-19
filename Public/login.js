$(function(){
	$('#username').val('admin');
	$('#password').val('000000');
	console.log("username: " + getQueryString('username'));
	if (getQueryString('username') != undefined && getQueryString('password') != undefined)
	{
		loadXMLDoc(getQueryString('username') , getQueryString('password'),'/action/login');
	}
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

function getQueryString(name) {
var reg = new RegExp("(^|&)"+ name + "=([^&]*)(&|$)","i");
var r = window.location.search.substr(1).match(reg);
if (r != null) return unescape(r[2]);return null;
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
	 xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && (xmlhttp.status==200)){
		  if (getQueryString('servicename') != undefined)
		  {
			   window.location.href="../index.html?servicename=" + getQueryString('servicename');
		  }
		  else
		  {
			   window.location.href="../index.html";
		  }
        }
    }
}

function testCors(ip) {
		var url = "http://{0}:{1}{2}".format(ip, "4101", "/action/corsAsync");
	console.log(url);
		var para = {cipher: "thisIsForeignKey"};
		var req = new Request("1.0", "GetSvcStatus", para);

    	var postStr = JSON.stringify(req);
			console.log(postStr);
			$.ajax({
			url:url,
			data: postStr,
			async:true,
			type:"POST",
			success :function(response){
				console.log(response);
			},
			error: function() {
				console.log("testCors error!");
			}
		});
	};