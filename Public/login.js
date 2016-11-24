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

function cors(){
	var url = "http://192.168.60.142:4101/action/corsService";
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
	// var para = {version:"1.0", func:"ListSvc", param:"NULL"};
	// var req = JSON.stringify(para);
	var postStr   = "username="+ username +"&password="+ password;
    xhr.send(postStr);
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