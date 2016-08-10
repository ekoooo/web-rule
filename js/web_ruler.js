(function($) {
    var drawLinePara = {
        "canWork": false, // 创建和拖动开关
        "canDrawLine": true, // 是否创建新的参考线
        "canDrag": false, // 是否可以拖动
        "currentDir": "", // 当前操作的的方向，h 水平方向, v 为垂直方向
        "currentDragLineId": "", // 当前拖动参考线的 id
        "currentLineUID": "" // 用于生成参考线 id
    };

    /**
     * 初始刻度尺
     */
    function initRule() {
        // 初始化 HTML 框架
        $('body').append($('<div class="rule-h" id="rule-h">' +
                '  <i class="rule-h-sm"></i>' +
                '  <i class="rule-h-md"></i>' +
                '  <i class="rule-h-lg"></i>' +
                '</div>' +
                '<div class="rule-v" id="rule-v">' +
                '  <i class="rule-v-sm"></i>' +
                '  <i class="rule-v-md"></i>' +
                '  <i class="rule-v-lg"></i>' +
                '</div>' +
                '<div id="rule-lines"></div>'));

        // 绘制尺子刻度线
        drawRule(50, 'lg'); // 每 50px 一个, 例如第 50px
        drawRule(10, 'md'); // 每 10px 一个, 例如第 60px
        drawRule(10, 'sm'); // 每 10px 一个, 例如第 55px
        // 绘制尺子刻度位置相应数值
        appendRuleNums();

        // 还原上次状态
        initSetting();
    }

    function initSetting() {
        // 还原参考线
        window.sessionStorage.webRulerLines && $('#rule-lines').html(window.sessionStorage.webRulerLines);

        // 参考线是否隐藏
        typeof window.sessionStorage.webRulerLinesStatus === 'undefined'|| window.sessionStorage.webRulerLinesStatus === '1' ? $('#rule-lines').show() : $('#rule-lines').hide();

        // 标尺线是否隐藏
        typeof window.sessionStorage.webRulerStatus === 'undefined' || window.sessionStorage.webRulerStatus === '1' ? $('#rule-h, #rule-v').show() : $('#rule-h, #rule-v').hide();
    }

    /**
     * 你用 box-shadow 方式画出尺子中的刻度
     * @param dis 每隔多少 px 阴影
     * @param type 尺子刻度有三种长度，最小到最大分别为 sm, md, lg
     */
    function drawRule(dis, type) {
        // 需要阴影出刻度的数量
        var ruleHNum = parseInt((screen.width + 1) / dis);
        var ruleVNum = parseInt((screen.height + 1) / dis);
        var ruleHBoxShadow = '0 0';
        var ruleVBoxShadow = '0 0';
        // 拼接 box-shadow 值
        for (var i = 1; i <= ruleHNum; i++) {
            ruleHBoxShadow += ', ' + (dis * i) + 'px 0';
        };
        for (var i = 1; i <= ruleVNum; i++) {
            ruleVBoxShadow += ', 0 ' + (dis * i) + 'px';
        };

        $('.rule-h-' + type).css({
            "boxShadow": ruleHBoxShadow
        });
        $('.rule-v-' + type).css({
            "boxShadow": ruleVBoxShadow
        });
    }

    /**
     * 在尺子中添加刻度值
     */
    function appendRuleNums() {
        // 需要添加 span 的数量
        var ruleHNum = parseInt((screen.width + 1) / 50);
        var ruleVNum = parseInt((screen.height + 1) / 50);
        var ruleHSpan = '';
        var ruleVSpan = '';
        for (var i = 0; i <= ruleHNum; i++) {
            ruleHSpan += '<span class="rule-h-num" style="left: ' + (i * 50) + 'px;">' + (i * 50) + '</span>';
        };
        for (var i = 0; i <= ruleVNum; i++) {
            ruleVSpan += '<span class="rule-v-num" style="top: ' + (i * 50) + 'px;">' + (i * 50) + '</span>';
        };
        $('#rule-h').append($(ruleHSpan));
        $('#rule-v').append($(ruleVSpan));
    }

    /**
     * 绘制参考线，根据 drawLinePara 中参数控制
     * @param e event
     */
    function drawLine(e) {
        if(drawLinePara.canWork) {
            if(drawLinePara.currentDir == 'h') { // 水平方向
                // isOut 当前鼠标是否已经超出水平尺子的范围
                var isOut = e.clientY >= $('#rule-' + drawLinePara.currentDir).outerHeight();
                if(drawLinePara.canDrag) {
                    if(isOut) {
                        // 拖动参考线
                        setLinePosition($('#web-rule-line-h-' + drawLinePara.currentLineUID), drawLinePara.currentDir, e.clientY);
                    }else {
                        // 删除参考线
                        removeLine($('#web-rule-line-h-' + drawLinePara.currentLineUID));
                    }
                }
            }else { // 垂直方向
                var isOut = e.clientX >= $('#rule-' + drawLinePara.currentDir).outerWidth();
                if(drawLinePara.canDrag) {
                    if(isOut) {
                        setLinePosition($('#web-rule-line-v-' + drawLinePara.currentLineUID), drawLinePara.currentDir, e.clientX);
                    }else {
                        removeLine($('#web-rule-line-v-' + drawLinePara.currentLineUID));
                    }
                }
            }
            // 如果已经超出水平尺子的范围则新建一个参考线
            if(isOut && drawLinePara.canDrawLine) {
                createLine(drawLinePara.currentDir);
                drawLinePara.canDrawLine = false; // 设置当前不能创建参考线，用于下面控制拖动当前参考线
                drawLinePara.canDrag = true; // 允许拖动
            }
        }
    }

    /**
     * 拖动参考线
     */
    function dragLine(e) {
        if(drawLinePara.canDrag) {
            if(drawLinePara.currentDir == 'h') {
                if(e.clientY >= $('#rule-' + drawLinePara.currentDir).outerHeight()) {
                    setLinePosition($('#' + drawLinePara.currentDragLineId), drawLinePara.currentDir, e.clientY);
                }else {
                    removeLine($('#' + drawLinePara.currentDragLineId));
                }
            }else {
                if(e.clientX >= $('#rule-' + drawLinePara.currentDir).outerWidth()) {
                    setLinePosition($('#' + drawLinePara.currentDragLineId), drawLinePara.currentDir, e.clientX);
                }else {
                    removeLine($('#' + drawLinePara.currentDragLineId));
                }
            }
        }
    }

    /**
     * 删除参考线
     * @param  {[type]}
     */
    function removeLine(thiz) {
        thiz.remove();
    }

    /**
     * 直接新建一根参考线
     * @param dir h 水平方向, v 为垂直方向
     * @param position 位置
     */
    function createLine(dir, position) {
        drawLinePara.currentLineUID = guid();
        $('#rule-lines').append('<div class="web-rule-line-' + dir + '" id="web-rule-line-' + dir + '-' + drawLinePara.currentLineUID + '"></div>');
        if(position) {
            setLinePosition($('#web-rule-line-' + dir + '-' + drawLinePara.currentLineUID), dir, position);
        }
    }

    /**
     * 设置参考线位置
     * @param thiz 当前要拖动的参考线对象
     * @param dir h 水平方向, v 为垂直方向
     * @param pos 拖动的位置
     */
    function setLinePosition(thiz, dir, pos) {
        thiz.attr('title', pos + 'px');
        if('h' === dir) {
            thiz.css({"top": (pos - 1) + 'px'});
        }else {
            thiz.css({"left": (pos - 1) + 'px'});
        }
    }

    /**
     * 弹出添加参考线面板
     */
    function addLinePanel() {
        var content = prompt('请输入参考线信息, h 水平方向 v 垂直方向, 例如: v200', '');
        if(content) {
            if(/^[v|h][0-9]+$/.test(content)) {
                var pos = content.match(/[0-9]+$/)[0];
                var dir = content.match(/^[v|h]/)[0];
                var minPos = 0;
                var maxPos = 0;
                if('v' === dir) {
                    minPos = $('#rule-' + dir).outerWidth();
                    maxPos = screen.width;
                }else {
                    minPos = $('#rule-' + dir).outerHeight();
                    maxPos = screen.height;
                }
                if(pos >= minPos && pos <= maxPos) {
                    createLine(content.match(/[v|h]/)[0], content.match(/[0-9]+$/)[0]);
                    saveLines();
                }else {
                    window.alert('min: ' + dir + minPos + ', max: ' + dir + maxPos);
                }
            }else {
                window.alert('error input!');
            }
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    }

    /**
     * 保存参考线 html 到缓存中
     */
    function saveLines() {
        window.sessionStorage.webRulerLines = $('#rule-lines').html();
    }

    $.fn.webRuler = function() {
        initRule();

        $('#rule-h, #rule-v').on('mousedown', function(e) {
            drawLinePara.canWork = true;
            drawLinePara.currentDir = $(this).attr('id').replace('rule-', '');
        });

        $(document).on('mousemove', function(e) {
            drawLine(e);
            dragLine(e);
        });

        $(document).on('mouseup', function(e) {
            if(drawLinePara.canDrag) { // 保存参考线
                saveLines();
            }
            drawLinePara.canWork = false;
            drawLinePara.canDrag = false;
            drawLinePara.canDrawLine = true;
        });

        $(document).on('contextmenu selectstart', function(e) { // 禁止选择文字
            if(drawLinePara.canWork) {
                return false;
            }
        });

        $(document).on('keyup', function(e) {
            switch(e.keyCode) {
                case 186: // 键盘 ; 显示或者隐藏 line
                    window.sessionStorage.webRulerLinesStatus = typeof window.sessionStorage.webRulerLinesStatus === 'undefined' || window.sessionStorage.webRulerLinesStatus === '1' ? '-1' : '1';
                    $('#rule-lines').toggle();
                    break;
                case 82: // 键盘 r 显示或者隐藏标尺
                    window.sessionStorage.webRulerStatus = typeof window.sessionStorage.webRulerStatus === 'undefined' || window.sessionStorage.webRulerStatus === '1' ? '-1' : '1';
                    $('#rule-h, #rule-v').toggle();
                    break;
                case 220: // 键盘 \ 添加 line
                    addLinePanel();
                    break;
                case 67: // 键盘 c 删除全部参考线
                    window.sessionStorage.webRulerLines = '';
                    removeLine($(".web-rule-line-v, .web-rule-line-h"));
                    break;
                default:
            }
        });

        $('#rule-lines').delegate('.web-rule-line-h, .web-rule-line-v', 'dblclick mousedown', function(e) {
            if('dblclick' === e.type) { // 双击删除参考线
                removeLine($(this));
            }else if('mousedown' === e.type) {
                drawLinePara.canDrag = true;
                drawLinePara.currentDir = $(this).attr('class').replace('web-rule-line-', '');
                drawLinePara.currentDragLineId = $(this).attr('id');
            }
        });
    }
})(jQuery);

$(this).webRuler();
