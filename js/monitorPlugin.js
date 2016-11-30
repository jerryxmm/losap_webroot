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
        // console.log(element);
        // console.log($(element));
        // console.log(options);
        this.init();
       // g_intance.stopUpdateUI();
    };
    nodeGroup.prototype.init = function () {
        var data = this.options.data;
        var sideBarHtml = "<ul class='nav nav-list'>";
        for(var i = 0; i < data.length; i++)
        {
            var serverNode = data[i];
            this.initServerHead(serverNode.desc);
            this.initServerHomeView(serverNode);
            sideBarHtml += this.initTreeMenu(serverNode);
            if (g_curIp == serverNode.desc)
            {
                
            }
        }
        sideBarHtml += "</ul>";
        var sideBar = this.options.sideBar;
        $(sideBar).empty();
        $(sideBar).html(sideBarHtml);
    };

    nodeGroup.prototype.initTreeMenu = function (serverNode) {
        var records = serverNode.svcLst;
        var hideStr = "";
        if (serverNode.sideBarHide)
            hideStr = "style='display:none'";
        var svrLst = " <li class='submenu' isSpan='true'> <a href='#' onclick='clickSubmenu(\"{2}\")'> <span>{0}</span> <span class='label label-important'>{1}</span></a>".format(serverNode.desc, records.length, serverNode.ip) +
            "<ul id='{1}' class='nav nav-list' {0}>".format(hideStr, serverNode.ip);
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
                alertFlag = "<span class='glyphicon glyphicon-exclamation-sign'  style='color:yellow; float:right'> </span>";
            }
            else
            {
                alertFlag = "";
            }
            var isActive="";
            if (g_curServiceId == curRecord.svc_name && g_curIp == serverNode.ip)
            {
                isActive = "active";
            }
            var svc =  "<li class='{4}'><a class='list-group-item' href='#monitorTab' data-toggle='tab' onclick='showSvcPage(\"{5}\", \"{6}\")'><span class='glyphicon {0}' style='color:{1}'></span>{2} {3}</a></li>"
            .format(icon, color, curRecord.svc_name, alertFlag, isActive, serverNode.ip, curRecord.svc_name);
            svrLst += svc;
            if (curRecord.svc_name== g_curSvc)
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
        svrLst +=   "</ul>" +
                "</li>";
        return svrLst;
    }

    nodeGroup.prototype.initServerHead = function (desc) {
        this.$element.append("<div class='jkjd_fw_title'>{0}</div>".format(desc + '服务节点情况'));
    };

    nodeGroup.prototype.initServerHomeView = function (serverNode) {
        var data = serverNode.svcLst;
        var homeView = "<div class='row' style='margin-left: 10px'>";
        var nodeWidth = 12/this.options.inlineNum;
        var nodeWidthClass = "col-lg-{0} col-md-{1} col-sm-{3}".format(nodeWidth, nodeWidth+1, nodeWidth+2);
        var image = "", userColor = "";
        var svcStyle = "";
        for(var i = 0; i < data.length; i++)
        {
            if (data[i].status_run == 1)
            {
                image = "../images/jdzt_green_pic.png";
                userColor = "green";
                svcStyle = "active_svc";
            }
            else
            {
                image = "images/jdzt_red_pic.png";
                userColor = "red";
                svcStyle = "inactive_svc";
            }
            var node = "<div id='{0}' class='{1}'>".format("nodeCode" + i, nodeWidthClass) +
                    "<div class = '{0}'>".format(svcStyle) +
                "<a href='{0}' data-toggle='tab' onclick='showSvcPage(\"{3}\", \"{4}\")'>{1}</a><span class='r tc'><img src='{2}' ></span>".format(this.options.tabShow, data[i].svc_name, image, serverNode.ip, data[i].svc_name) +
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
        homeView += "</div>";
        this.$element.append(homeView);
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