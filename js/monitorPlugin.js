/**
 * Created by jerry on 2016/11/24.
 */
;(function ($, window, document, undefined) {
    var pluginName = "testPlugin";
    var _default = {};
    _default.settings = {
            renderTo: $(document.body),
            allProcDesc:'全部笔数',
            unprocDesc:'未处理笔数',
            procSpeedDesc:'处理速度',
            tabShow:'#monitorPage',
            data:[],
            inlineNum:6,
            server:'本机'
    };

    var allowedMethods = [
        'addNode',
        'removeNode',
        'modeNode',
        'destroy'
    ];

    var nodeGroup = function (element, options) {
        this.$element = $(element);
        $(element).empty();
        this.options = options;
        console.log(element);
        console.log($(element));
        console.log(options);
        this.init(options);
    };
    nodeGroup.prototype.init = function () {
        var data = this.options.data;
        for(var i = 0; i < data.length; i++)
        {
            var serverNode = data[i];
            this.initServerHead(serverNode.desc);
            this.initServerHomeView(serverNode.svcLst);
        }
    };

    nodeGroup.prototype.initServerHead = function (desc) {
        this.$element.append("<div class='jkjd_fw_title'>{0}</div>".format(desc + '服务节点情况'));
    };

    nodeGroup.prototype.initServerHomeView = function (data) {
        var homeView = "<div class='row' style='margin-left: 10px'>";
        var nodeWidth = 12/this.options.inlineNum;
        var nodeWidthClass = "col-lg-{0} col-md-{1} col-sm-{3}".format(nodeWidth, nodeWidth+1, nodeWidth+2);
        var image = "", userColor = "";
        for(var i = 0; i < data.length; i++)
        {
            if (data[i].status_run == 1)
            {
                image = "../images/jdzt_green_pic.png";
                userColor = "green";
            }
            else
            {
                image = "images/jdzt_red_pic.png";
                userColor = "red";
            }
            var node = "<div id='{0}' class='{1}'>".format("nodeCode" + i, nodeWidthClass) +
                    "<div class = 'jkjd_fw'>" +
                "<a href='{0}' data-toggle='tab'>{1}</a><span class='r tc'><img src='{2}' ></span>".format(this.options.tabShow, data[i].svc_name, image) +
                    "<div class='row jkjd_yj'>" +
                    "<div class='col-lg-3 col-md-3'><span class='glyphicon glyphicon-user' style='color:{1}'>{0}</span></div>".format(data[i].online_client, userColor) +
                    "<div class='col-lg-6 col-md-6 col-lg-offset-2 col-md-offset-2'>" +
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

    $.fn[pluginName] = function (option) {
        var ps = $.extend({},_default.settings, option);
        ps.renderTo.append("<div></div>");
        this.each(function () {
            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0){
                    throw new Error('Unkown Method:' + option);
                }
            }
            else{
                $.data(this, pluginName, new nodeGroup(this, ps));
            }
        });
        console.log("this is testPlugin!");
    }
})(jQuery, window, document);