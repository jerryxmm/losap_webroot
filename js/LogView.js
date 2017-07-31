/**
 * Created by jerry on 17-6-29.
 */
(function ($, window, document, undefined) {
    var pluginName = 'logview';
    var _default = {};
    _default.settings = {
        serviceSelector:{},
        alarm:'images/alarm.mp3',
        maxNum:1000,
        height:200,
    };
    var LogViewer = function (element, options) {
        this.$element = $(element);
        $(element).empty();
        this.options = options;
        this.curLogLevel = "INFO";
        this.isScrollBottom = false;
        this.init();
    };

    LogViewer.prototype.init = function () {
        this.$element.html("<div id='' class='panel panel-default'>" +
            "<div class='panel-heading' style='padding:5px'>" +
            "<div class='panel-title row'>" +
                "<audio src='{0}' controls='controls' loop='true' hidden='true'></audio>".format(this.options.alarm) +
                "<div class='col-md-5'>" +
                    "<div class='col-md-2'><h6>日志</h6></div>"+
                    "<div class='col-md-1' style='margin-top:8px'><a class='infoBtn' title='显示Info级别日志'><span class='glyphicon glyphicon-info-sign'></span></a ></div>"+
                    "<div class='col-md-1'style='margin-top:8px'><a class='warningBtn' title='显示Warning级别日志' ><span class='glyphicon glyphicon-info-sign' style='color: sandybrown;'></span></a ></div>"+
                    "<div class='col-md-1' style='margin-top:8px'><a class='errorBtn' title='显示Error级别日志'><span class='glyphicon glyphicon-remove-circle' style='color: red;'></span></a ></div>"+
                "</div>" +
                "<div class='col-md-offset-3 col-md-4 text-right'>" +
            "<select title='选择服务' class='show-menu-arrow' data-size='5' multiple data-actions-box='true' data-live-search='true'></select></div>"+
            "</div>"+
            "</div>"+
            "<div class='panel-body' style='padding:0px;background-color: white;overflow-x:auto;overflow-y: scroll;'>"+
            "<ul class='list-group' style='margin-bottom: 0px;'></ul>"+
            "</div>"+
            "</div>");

        this.$element.find('.panel').css("min-height", this.options.height);
        this.$element.find('.panel-body').css('max-height', this.options.height-10);
        var my = this;
        this.$element.find('.infoBtn').click(function () {
            my.showLevel("INFO");
        });
        this.$element.find('.warningBtn').click(function () {
            my.showLevel("WARN");
        });
        this.$element.find('.errorBtn').click(function () {
            my.showLevel("ERROR");
        });
        this.logs = this.$element.find('ul');
        this.selector = this.$element.find('select');
        this.initSelector();
    };

    function getOptgroup(server) {
        var objHtml = "<optgroup label='{0}'>".format(server.ip);
        var serviceList = server['monitorService'];
        for(var j = 0; j < serviceList.length; j++){
            objHtml += "<option value='{0}'>{1}</option>".format(serviceList[j],serviceList[j]);
        }
        objHtml += "</optgroup>";
        return objHtml;
    }
    LogViewer.prototype.initSelector = function()
    {
        for(var i = 0; i < this.options.serviceSelector.length; i++)
        {
            var server = this.options.serviceSelector[i];
            this.selector.append(getOptgroup(server));
        }
        this.selector.selectpicker({});
        var my = this;
        this.selector.on('hidden.bs.select', function (e) {
            my.showService();
        });
    };

    LogViewer.prototype.dealLog = function(record) {
        var logs = record.logs;
        var serviceName= record.svc_name;
        if (logs == undefined)
            return;
        var curRecord;
        var lis = this.logs;
        for(var i = 0; i < logs.length; i++)
        {
            curRecord= logs[i];
			var words = curRecord["content"].split('\t');
			if (words.length >=4)
			{
				curRecord['log_type'] = words[0];
				curRecord['log_date'] = words[1];
				curRecord['log_time'] = words[2];
				curRecord['note'] = words[3];
				curRecord['log_src'] = words[4];
			}
			var li = "";
			var log = "{0} {1} {2} {3} {4}".format(serviceName, curRecord.log_time,  curRecord.log_type,curRecord.note, curRecord.log_src);
            var level = curRecord['log_type'];
            if (level.indexOf("WARN") >=0)
            {
                li = "<li class=\"list-group-item list-group-item-warning\" log_level='{0}' service_name='{1}'><span class=\"glyphicon glyphicon-info-sign\" style=\"color: sandybrown;\"></span>{2}</li>".format(level, serviceName, log);
            }
            else if (level.indexOf("INFO") >=0)
            {
                li = "<li class=\"list-group-item list-group-item-info\" log_level='{0}' service_name='{1}'><span class=\"glyphicon glyphicon-info-sign\" style=\"color: cornflowerblue;\"></span>{2}</li>".format(level, serviceName, log);
            }
            else if (level.indexOf("LOG") >=0)
            {
                //li = "<li class=\"list-group-item list-group-item-info\" log_level='{0}' service_name='{1}'><span class=\"glyphicon glyphicon-info-sign\" style=\"color: cornflowerblue;\"></span>{2}</li>".format(level, serviceName, log);
            }
            else if (level.indexOf("ERROR") >=0)
            {
                li = "<li class=\"list-group-item list-group-item-danger\" log_level='{0}' service_name='{1}'><span class=\"glyphicon glyphicon-remove-circle\" style=\"color: red;\"></span>{2}</li>".format(level, serviceName, log);
            }
            else{
                li = "<li class=\"list-group-item list-group-item-info\" log_level='{0}' service_name='{1}'>{2}</li>".format(level, serviceName, log);
            }
            lis.append(li);
            //控制日志数量不能超过1000条，会影响前端显示效果
            if (lis.length > this.options.maxNum)
            {
                lis[0].remove();
            }
        }
        if (Boolean(this.isScrollBottom))
        {
            lis.scrollTop(lis.prop("scrollHeight"));
        }
    };

    LogViewer.prototype.showLevel = function(type) {
        this.curLogLevel = type;
        this.showService();
        return false;
    };

    LogViewer.prototype.showService = function () {
        var serviceList = this.selector.selectpicker('val');
        this.logs.find('li').hide();
        if (serviceList == undefined)
            return;
        for(var i = 0; i < serviceList.length; i++)
        {
            var serviceName = serviceList[i];
            this.logs.find("li[service_name='{0}']".format(serviceName)).show();
        }

        if (this.curLogLevel == 'INFO'){
        }else if (this.curLogLevel == 'WARN'){
            this.logs.find(".list-group-item-info").hide();
        }else if (this.curLogLevel == 'ERROR'){
            this.logs.find(".list-group-item-info").hide();
            this.logs.find(".list-group-item-warning").hide();
        }else {
        }
    };

    var allowedMethods = [
        'destroy',
        'dealLog'
    ];

    $.fn[pluginName] = function (option) {
        var ps = $.extend({},_default.settings, option);
        var args = Array.prototype.slice.call(arguments, 1);
        var value;
        this.each(function () {
            value = $.data(this, pluginName);
            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0){
                    throw new Error('Unkown Method:' + option);
                }
                if (option === 'destroy'){
                    $.removeData(this, pluginName);
                }
                if (option === 'dealLog'){
                    value.dealLog(args[0]);
                }
            }
            else{
                $.data(this, pluginName, (value = new LogViewer(this, ps)));
            }
        });
    }
})(jQuery, window, document);