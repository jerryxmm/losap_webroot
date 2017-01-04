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
            serviceMap: new Map(),
            serverMap:new Map(),
            inlineNum:6,
            server:'本机'
    };

    var nodeGroup = function (element, options) {
        this.$element = $(element);
        $(element).empty();
        this.options = options;
        this.init();
    };
    function initServerPerform(server) {
        var tmp = "<div class='col-lg-3 col-md-4'>"+
                    "<div id='{0}' class='perform_dead'>".format(server.performThemeId)+
                        "<div class='col-lg-2 col-md-2'>" +
                            "<img src='images/jdtj_pic.png' />" +
                        "</div>"+
                        "<div class='col-lg-10 col-md-10'>"+
                            "<div class='serverName'>"+
                               "<span  id='{0}' class='performItem'></span>".format(server.performId) +
                            "</div>"+
                            "<div class='row'>"+
                                "<div class='col-lg-3 col-md-3'><span id='{0}' class='performItem'></span></div>".format(server.cpuId) +
                                "<div class='col-lg-9 col-md-9'><span id='{0}' class='performItem'></span></div>".format(server.diskId) +
                            "</div>"+
                            "<div class='row'>"+
                                "<div class='col-lg-3 col-md-3'><span id='{0}' class='performItem'> </span></div>".format(server.memId)+
                                "<div class='col-lg-9 col-md-9'><span  id='{0}' class='performItem'></span></div>".format(server.netSpeedId)+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                "</div>";
        return tmp;
    };

    nodeGroup.prototype.initTreeMenu = function (service) {
        // var hideStr = "";
        // if (serverNode.sideBarHide)
        //     hideStr = "style='display:none'";
        var svc =  "<li id='{0}'><a class='list-group-item' onclick='showSvcPage(\"{1}\")'><span></span></a></li>"
        .format(service.sideBarId, service.serviceId);
        return svc;
    }

    nodeGroup.prototype.initServerHead = function (desc) {
        this.$element.append("<div class='jkjd_fw_title'></div>");
        //s this.$element.append("<div class='jkjd_fw_title'>{0}</div>".format(desc + '服务节点情况'));
    };

   function initServerHomeView(options, service) {
        var nodeWidth = 12/options.inlineNum;
        var nodeWidthClass = "col-lg-{0} col-md-{1} col-sm-{3}".format(nodeWidth, nodeWidth+1, nodeWidth+2);
        var node = "<div class='{0}'>".format( nodeWidthClass) +
                "<div id='{0}'>".format(service.viewId) +
                "<a id='{0}' href='#' data-toggle='tooltip' title='{1}' onclick='showSvcPage(\"{2}\")'></a><span class='r tc'></span>".format(service.viewNameId, service.serverIp, service.serviceId) +
                "<div class='row jkjd_yj'>" +
                "<div class='col-lg-3 col-md-3'><span id='{0}' class='glyphicon glyphicon-user'></span></div>".format(service.onlineClientId) +
                "<div class='col-lg-9 col-md-9'>" +
                    "<p class='info'>{0}<span id='{1}' class='fs20'></span></p>".format(options.allProcDesc, service.allProcId) +
                    "<p class='info'>{0}<span id='{1}' class='fs20'></span></p>".format(options.unprocDesc, service.unProcId) +
                    "<p class='info'>{0}<span id='{1}' class='fs20'></span></p>".format(options.procSpeedDesc, service.procSpeedId) +
                "</div>" +
                "</div>" +
                "</div>"+
            "</div>";
        return node;
    };
    nodeGroup.prototype.init = function () {
        var serverMap = this.options.serverMap;
        var serviceMap = this.options.serviceMap;
        $('#sidebar').empty();
        $("#serverPerform").empty();
        $("#svcView").empty();
        this.initServerHead("");
        var sideBarHtml = "";
        var allHomeView = "<div class='row' style='margin-left: 10px'>";
        var serverPerform = "";
        serverMap.forEach(function (server, ip) {
            serverPerform += initServerPerform(server);
        });
        for(var service of serviceMap.values())
        {
            allHomeView += initServerHomeView(this.options, service);
            sideBarHtml += this.initTreeMenu(service);
        }
        allHomeView += "</div>";
        this.$element.append(allHomeView);
        var sideBar = this.options.sideBar;
        $(sideBar).html(sideBarHtml);
        $("#serverPerform").html(serverPerform);
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