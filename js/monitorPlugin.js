/**
 * Created by jerry on 2016/11/24.
 */
(function ($, window, document, undefined) {
    var pluginName = "testPlugin";
    var _default = {};
    _default.settings = {
            //renderTo: $(this),
            allProcDesc:'全部笔数',
            unprocDesc:'未处理笔数',
            procSpeedDesc:'处理速度',
            tabShow:'#monitorPage',
            sideBar:'#sidebar',
            data:[],
            inlineNum:6,
            server:'本机'
    };

    var nodeGroup = function (element, options) {
        this.$element = $(element);
        $(element).empty();
        this.options = options;
        this.init();
    };
    nodeGroup.prototype.init = function () {
        var data = this.options.data;
        this.initServerHead("");
        var sideBarHtml = "<ul class='nav nav-list'>";
        var allHomeView = "<div class='row' style='margin-left: 10px'>";
        var serverPerform = "";
        for(var i = 0; i < data.length; i++)
        {
            var serverNode = data[i];
            allHomeView += this.initServerHomeView(serverNode);
            sideBarHtml += this.initTreeMenu(serverNode);
            serverPerform += this.initServerPerform(serverNode);
        }
        allHomeView += "</div>";
        this.$element.append(allHomeView);
        sideBarHtml += "</ul>";
        var sideBar = this.options.sideBar;
        $(sideBar).empty();
        $(sideBar).html(sideBarHtml);
        $("#serverPerform").html(serverPerform);
    };

    nodeGroup.prototype.initTreeMenu = function (serverNode) {
        var records = serverNode.svcLst;
        var hideStr = "";
        if (serverNode.sideBarHide)
            hideStr = "style='display:none'";
        var svrLst = "";
        var color;
        var curRecord;
        var icon;
        var alertFlag="";

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
                alertFlag = "<span class='glyphicon glyphicon-exclamation-sign'  style='color:darkgoldenrod; float:right'> </span>";
            }
            else
            {
                alertFlag = "";
            }
            var isActive="";
            if ($('#serviceName').text() == curRecord.svc_name)
            {
                isActive = "active";
            }
            var svc =  "<li class='{4}'><a class='list-group-item' onclick='showSvcPage(\"{5}\", \"{6}\")'><span class='glyphicon {0}' style='color:{1}'></span>{2} {3}</a></li>"
            .format(icon, color, curRecord.svc_name, alertFlag, isActive, serverNode.ip, curRecord.svc_name);
            svrLst += svc;
            if (curRecord.svc_name== $('#serviceName').text())
            {
                if (curRecord.status_run == 1) //当前为启动状态，点击后停止服务
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
        return svrLst;
    }

    nodeGroup.prototype.initServerHead = function (desc) {
        this.$element.append("<div class='jkjd_fw_title'></div>");
        //s this.$element.append("<div class='jkjd_fw_title'>{0}</div>".format(desc + '服务节点情况'));
    };

    nodeGroup.prototype.initServerPerform = function (serverNode) {
      var perform = serverNode.perform;
        if (perform.CPU == undefined){
            return "";
        }
        var up = (perform.UpSpeed*1000).toFixed(0);
        var down = (perform.DownSpeed*1000).toFixed(0);
      var tmp = "<div class='col-lg-3 col-md-4'>"+
                    "<div class='perform'>"+
                        "<div class='col-lg-2 col-md-2'>" +
                            "<img src='images/jdtj_pic.png' />" +
                        "</div>"+
                        "<div class='col-lg-10 col-md-10'>"+
                            "<div class='serverName'>"+
                               "<span class='performItem'>ip:{0}</span>".format(serverNode.ip) +
                            "</div>"+
                            "<div class='row'>"+
                                "<div class='col-lg-3 col-md-3'><span class='performItem'>CPU:{0}%</span></div>".format(perform.CPU) +
                                "<div class='col-lg-9 col-md-9'><span class='performItem'>磁盘:Used:{0}G, Free:{1}G </span></div>".format(perform.DiskTotal-perform.DiskFree, perform.DiskFree) +
                            "</div>"+
                            "<div class='row'>"+
                                "<div class='col-lg-3 col-md-3'><span class='performItem'>Mem:{0}% </span></div>".format(perform.MemUsedPercent)+
                                "<div class='col-lg-9 col-md-9'><span class='performItem'> 网速:Up:{0}kb/s, Down:{1}kb/s</span></div>".format(up,down)+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                "</div>";
        return tmp;
    };
    nodeGroup.prototype.initServerHomeView = function (serverNode) {
        var homeView = "";
        var nodeWidth = 12/this.options.inlineNum;
        var nodeWidthClass = "col-lg-{0} col-md-{1} col-sm-{3}".format(nodeWidth, nodeWidth+1, nodeWidth+2);
        var data = serverNode.svcLst;
        var image = "", userColor = "";
        var svcStyle = "";
        for(var i = 0; i < data.length; i++)
        {
            if (data[i].status_run == 1)
            {
                userColor = "#90C083";
                svcStyle = "active_svc";
            }
            else
            {
                userColor = "#AE4141";
                svcStyle = "inactive_svc";
            }
            var node = "<div id='{0}' class='{1}'>".format("nodeCode" + i, nodeWidthClass) +
                    "<div class = '{0}'>".format(svcStyle) +
                "<a href='#' data-toggle='tooltip' title='{3}' onclick='showSvcPage(\"{1}\", \"{2}\")'>{0}</a><span class='r tc'></span>".format(data[i].svc_name, serverNode.ip, data[i].svc_name, serverNode.ip) +
                    "<div class='row jkjd_yj'>" +
                    "<div class='col-lg-3 col-md-3'><span class='glyphicon glyphicon-user' style='color:{1}'>{0}</span></div>".format(data[i].online_client, userColor) +
                    "<div class='col-lg-9 col-md-9'>" +
                        "<p class='info'>{0}<span class='fs20'>{1}</span></p>".format(this.options.allProcDesc, data[i].all_proc) +
                        "<p class='info'>{0}<span class='fs20'>{1}</span></p>".format(this.options.unprocDesc, data[i].unproc) +
                        "<p class='info'>{0}<span class='fs20'>{1}</span></p>".format(this.options.procSpeedDesc, data[i].proc_speed) +
                    "</div>" +
                    "</div>" +
                    "</div>"+
                "</div>";
            homeView += node;
        }
        return homeView;
    };

    var allowedMethods = [
        'addNode',
        'removeNode',
        'modeNode',
        'destroy'
    ];

    $.fn[pluginName] = function (option) {
        var ps = $.extend({},_default.settings, option);
        this.each(function () {
            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0){
                    throw new Error('Unkown Method:' + option);
                }
                if (option === 'destroy'){
                    $.removeData(this, pluginName);
                }
            }
            else{
                $.data(this, pluginName, new nodeGroup(this, ps));
            }
        });
    }
})(jQuery, window, document);