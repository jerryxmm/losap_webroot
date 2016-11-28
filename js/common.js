/**
 * Created with JetBrains PhpStorm.
 * User: kk
 * Date: 13-8-28
 * Time: 下午4:44
 */
function U() {
    var url = arguments[0] || [];
    var param = arguments[1] || {};
    var url_arr = url.split('/');

    if (!$.isArray(url_arr) || url_arr.length < 2 || url_arr.length > 3) {
        return '';
    }

    if (url_arr.length == 2)
        url_arr.unshift(_GROUP_);

    var pre_arr = ['g', 'm', 'a'];

    var arr = [];
    for (d in pre_arr)
        arr.push(pre_arr[d] + '=' + url_arr[d]);

    for (d in param)
        arr.push(d + '=' + param[d]);

    return _APP_+'?'+arr.join('&');
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length < 1) {
        return result;
    }

    var data = arguments;        //如果模板参数是数组
    if (arguments.length == 1 && typeof (args) == "object") {
        //如果模板参数是对象
        data = args;
    }
    for (var key in data) {
        var value = data[key];
        if (undefined != value) {
            result = result.replace("{" + key + "}", value);
        }
}
    return result;
}

function getQueryString(name) { 
var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
var r = window.location.search.substr(1).match(reg); 
if (r != null) return unescape(r[2]); return null; 
} 
//设置cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
//获取cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}
//清除cookie  
function clearCookie(name) {  
    setCookie(name, "", -1);  
}  

// function cors(){
// 	var url = "http://192.168.60.135:4101/action/actionMonitor";
// 	var xhr = createCORSRequest('POST', url);
// 	if (!xhr) {
// 	  throw new Error('CORS not supported');
// 	}
// 	xhr.onreadystatechange=function()
//     {
//       if (xhr.readyState==4 && (xhr.status==200 || xhr.status==302)){
//             console.log(xhr.responseText);
//                // var response = xmlhttp.responseText;
//         }
//     }
//
// 	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
// 	var para = {version:"1.0", func:"ListSvc", param:"NULL"};
// 	var req = JSON.stringify(para);
//     xhr.send(req);
// }
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

function getForeignMonitorData(url, monitorItem, param, dealDataFunc) {
    var xhr = createCORSRequest('POST', url);
	if (!xhr) {
	  throw new Error('CORS not supported');
	}
	xhr.onreadystatechange=function()
    {
      if (xhr.readyState==4 && (xhr.status==200 || xhr.status==302)){
                var response = xhr.responseText;
                if (typeof(dealDataFunc) == 'function')
                {
                    if (dealDataFunc.length == 2)
                    {
                        dealDataFunc(response, param.service_id);
                    }
                    else
                    {
                        dealDataFunc(response);
                    }
                }
        }
    }

	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    var req = new Request("1.0", monitorItem, param);
	var postStr = JSON.stringify(req);
    xhr.send(postStr);
}

var Request = function(ver, fun, para)
{
    this.version = ver;
    this.func = fun;
    this.param = para;
}

function sendRequest(url, method, type, req)
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
    xmlhttp.open(method,url,true);  
    xmlhttp.setRequestHeader("Content-Type",type);
    xmlhttp.send(req);  
    return xmlhttp;
}

function getMonitorData(url, monitorItem, version, param, dealDataFunc)
{
    var req = new Request(version, monitorItem, param); 
    var postStr = JSON.stringify(req);
    //console.log(postStr);
    var xmlhttp = sendRequest(url, 'POST',  "application/x-www-form-urlencoded", postStr);
    xmlhttp.onreadystatechange=function()  
    {  
      if (xmlhttp.readyState==4 && (xmlhttp.status==200 || xmlhttp.status==302)){
                //console.log(xmlhttp.responseText);
                var response = xmlhttp.responseText;
                if (typeof(dealDataFunc) == 'function')
                {
                    if (dealDataFunc.length == 2)
                    {
                        dealDataFunc(response, param.service_id);   
                    }
                    else
                    {
                        dealDataFunc(response); 
                    }        
                }   
        }
    }
}

function parseJsonToTable(str)
{
      var obj = JSON.parse(str); 
      var head = obj.metadata;
      var table='<table class="table table-bordered data-table">';
      table+='<thead><tr>';
      for (var i=0;i<head.length;i++)
      {
        table = table + '<th>' + head[i].ColDesc + '</th>';
      }
      table+='</tr></thead>';
      table+='<tbody>';
      if (obj.hasOwnProperty('records'))
      {
          var records = obj.records;
          for (var i=0;i<records.length;i++)
          {
            table+='<tr class="gradeX">';
            var rec = records[i];
            for(var k = 0; k < head.length; k++)
            {

                if (head[k].ColType == 'href')
                {
                    var tmp = "<a href=# onclick= GetMonitorFile('{0}')>{1}</a>".format(rec[head[k].ColName],rec[head[k].ColName]);
                    table= table +'<td>' + tmp + '</td>';
                }
                else
                {
                  var key = head[k].ColName;
                  var value = rec[key];
                    table= table +'<td>' +value + '</td>';
                }
            }
            table+='</tr>\n';
          }
      }
      table+='</tbody>'; 
      table+='</table>';
      return table;
}

function GetMonitorFile(filePath)
{
    param.file_name = filePath;
    var req = new Request('1.0', 'GetMonitorFile', param); 
    var postStr = JSON.stringify(req);
    var xmlhttp = sendRequest(g_monitorUrl, 'POST',  "application/x-www-form-urlencoded", postStr);
    xmlhttp.onreadystatechange=function() 
    {  
      if (xmlhttp.readyState==4 && (xmlhttp.status==200 || xmlhttp.status==302))
        {
          var str=xmlhttp.responseText; 
          var obj = JSON.parse(str); 
          var head = obj.metadata;
          var records = obj.records;
          var record0 = records[0];
          var logTitle = record0[0] + record0[1];
          var u8 = base64decode(record0[2]);
          var u16 = utf8to16(u8);
         var con=u16.replace(/\n/g,"<br>");
          //var fileContex = window.atob(record0[2]);
          //var fileContex = record0[2];
          layer.open({
               type: 1,
               title: logTitle,
              skin: 'layui-layer-demo', //样式类名
              closeBtn: 1, //不显示关闭按钮
              shift: 2,
              shadeClose: true, //开启遮罩关闭
              area: ['70%', '50%'],
              content: con
            });
        }
    }
}
