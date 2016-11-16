$(function(){
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
	//loadXMLDoc(username,password,'/login');
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
	 xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && (xmlhttp.status==200)){
		  window.location.href="../index.html";
		  //var response = xmlhttp.responseText;
        }
    }
}  
