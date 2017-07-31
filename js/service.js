/**
 * Created by jerry on 2016/12/22.
 */

function Service(server, serviceId) {
    this.serviceId = serviceId;
    this.alive = 'dead';
    this.statArray = [];
    this.listItem = [];
    this.isDebugOpen = false;
    this.server = server;
};

Service.updataLag = 3000;

Service.prototype.setStatus = function (record) {
    this.monitor_data = record;
    var stats = record['stats'];
    if (stats)
    {
        for(var i = 0; i < stats.length; i++)
        {
            var rec = stats[i];
            var src = rec.Head.split('|');
            var work = "{0}({1})".format(rec.Func, rec.FName);
            var showTime = "{0}({1})".format(rec.time, rec.use);
            var note ="{0}  thrid:{1} sid:{2}".format(rec.Dest, rec.ThreadIndex, rec.SessId);
            var debugId = rec.DebugId;
            var kk = {src: src[3], work: work, result: rec.Code, time:showTime, note: note, DebugId:debugId};
            this.statArray.push(kk);
        }
    }
    if (this.monitor_data.status_run == 1 && this.monitor_data.status_alert == 0)
    {
        this.svcStyle = "svc_normal";
    }
    else if (this.monitor_data.status_run == 1 && this.monitor_data.status_alert == 1)
    {
        this.svcStyle = "svc_alter";
    }else{

        this.svcStyle = "svc_disconnect";
    }
    if (this.listItem.length == 0 && this.monitor_data.status_run == 1)
    {
        this.listSvcItem();
    }
};

//关闭获取服务调试功能的定时器
Service.prototype.stopStat = function () {
  clearInterval(this.statTimer);
};

Service.prototype.getDebugInfo = function(debugID, okFun) {
    var tmpArr = debugID.split('-');
    var para = {service_id:this.serviceId, date:parseInt(tmpArr[0]), index:parseInt(tmpArr[1]), debug_file_location:parseInt(tmpArr[2])};
    this.server.serverRequest("GetSvcDebug",para, okFun);
};

Service.prototype.openDebugFunc = function(){
    if (!Boolean(this.isDebugOpen))
    {
        var para = {service_id:this.serviceId};
        this.server.serverRequest("OpenSvcDebug", para, "NULL", false);
        this.isDebugOpen = true;
    }
};

Service.prototype.closeDebugFunc = function() {
    var para = {service_id:this.serviceId};
    console.log("closeDebugFunc");
    this.server.serverRequest("CloseSvcDebug", para, "NULL", false);
    this.isDebugOpen = false;
};


Service.prototype.execCmd = function(sql, okFunc)
{
    var para = {service_id:this.serviceId, cmd: sql};
    this.server.serverRequest("ExecCmd", para, okFunc);
};

//获取某项监控项目的详细信息，如获取所有线程信息
Service.prototype.listSvcItemInfo = function (item, okFunc) {
    var para = {service_id:this.serviceId, object:item.id};
    this.server.serverRequest("ListSvcItemInfo", para, okFunc);
};

//获取监控项目列表(比如 线程，用户信息，等等)
Service.prototype.listSvcItem =  function()
{
    var para = {service_id:this.serviceId};
    var my = this;
    this.server.serverRequest("ListSvcItem", para, function(data) {
        var obj = JSON.parse(data);
        my.listItem = obj.records;
    });
};

//启动服务功能的处理回调函数
function dealStartService(response, serviceId) {
    var obj = JSON.parse(response);
    var code = obj.code;
    if (code >= 0)
    {
        $("#startIcon").css({"color":"#BEBFC0"});
        $("#stopIcon").css({"color":"red"});
        showTip("{0} 启动服务成功！".format(serviceId));
    }
    else{
        showTip("启动服务" + serviceId + "失败！失败原因请查看日志！")
    }
}

//启动服务功能
Service.prototype.start = function () {
    var para = {service_id:this.serviceId};
    if (this.monitor_data.status_run == 1){
        alert("当前服务已经启动");
    }
    else{ //当前为服务停止状态，点击后启动服务
        this.server.serverRequest("ExecCmdStart", para, dealStartService);
        showTip("{0} 服务启动中.....".format(this.serviceId));
    }
};

Service.prototype.clearAlert = function() {
  this.server.clearAlert(this.serviceId);
};

//停止服务功能的处理回调函数
function dealStopService(response, serviceId)
{
    var obj = JSON.parse(response);
    var code = obj.code;
    if (code >= 0)
    {
        showTip("启动停止成功！");
    }
    else{
        showTip("停止服务" + serviceId + "失败！失败原因请查看日志！")
    }
}

//停止服务功能
Service.prototype.stop = function () {
    var para = {service_id:this.serviceId};
    if (this.monitor_data.status_run == 1) {
        this.server.serverRequest("ExecCmdStop", para, dealStopService, false);
    }
    else {
        alert("当前服务已经停止");
    }
};

//获取服务的配置文件功能
Service.prototype.getXml = function (okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    this.server.serverRequest("GetSvcXml", para, okFunc);
};

function Appendzero(obj)
{
    if(obj<10) return "0" +""+ obj;
    else return obj;
}

Service.prototype.getCurDate = function(){
    var datetime = new Date();
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1;
    var date = datetime.getDate();
    return "{0}{1}{2}".format(year, Appendzero(month), date);
};

//保存服务配置文件到服务端功能
Service.prototype.saveXml = function(content, okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    para.content = content;
    this.server.serverRequest("SaveSvcXml", para, okFunc);
};

//获取当前服务的操作日志文件
Service.prototype.showLog = function (fileType, okFunc) {
    var para = {};
    para.service_id = this.serviceId;
    if (fileType == '操作日志')
        para.fileName = "{0}_{1}.txt".format(this.serviceId, this.getCurDate());
    else if (fileType == 'sql日志')
        para.fileName = "{0}_sql_{1}.txt".format(this.serviceId, this.getCurDate());
    this.server.serverRequest("ListSvcLogInfo", para, okFunc);
}