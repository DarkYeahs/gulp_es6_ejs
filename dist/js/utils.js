'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * 说明
 * 本文件为公共js,请勿随意修改本文件
 * 文件中封装了系统中常用的方法,请根据注释直接传入配置项即可在vue实例中调用
 * 以下方法基本与业务相关,常用的数据处理方法请参照Underscore.js
 * 作者:shelly
 */

// 常用数据操作方法
/***********************************************************************************************
 *@method : ajax
 *@desc   : ajax请求
 *@param  : {String}url:请求的接口
 *@param  : {obj}oData:请求的参数,例如{type:'机型',model:'t43',page:1,rows:10}
 *@param  : {function}callback:用于请求的回调函数,参数data,获取请求成功的数据
 *@param  : {obj}ajax拓展参数，可以覆盖默认参数
 *@return : void
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.ajax = function (url, oData, successCb, errorCb, options) {
    var _this = this;
    oData = oData || {};
    options = options || {};
    var _options = {
        traditional: true,
        async: true,
        type: 'POST',
        dataType: 'json',
        url: url,
        data: oData,
        success: function success(data) {
            successCb && successCb(data);
        },
        error: function error(request, _error) {
            errorCb ? errorCb() : _this.$message('请求出错啦,请稍后重试:' + _error);
        }
    };
    _.extend(_options, options);
    $.ajax(_options);
};
/************************************************************************************************
 * [description]
 * @method getAjax
 * @desc   get请求
 * @author Yeahs
 * @param  {[Object]} opt [get请求配置]
 * @return {[Object]}     [Deferred对象，将请求的数据抛给上一层去处理]
 ***********************************************************************************************/
Vue.prototype.getAjax = function (opt) {
    var d = $.Deferred();
    var _options = {
        traditional: true,
        async: true,
        type: 'GET',
        dataType: 'json',
        success: function success(data) {
            d.resolve(data);
        },
        error: function error(request, _error2) {
            d.reject(request, _error2);
        }
    };
    $.extend(_options, opt);
    $.ajax(_options);
    return d;
};
/************************************************************************************************
 * [description]
 * @method postAjax
 * @desc   post请求
 * @author Yeahs
 * @param  {[Object]} opt [post请求配置]
 * @return {[Object]}     [Deferred对象，将请求的数据抛给上一层去处理]
 ***********************************************************************************************/
Vue.prototype.postAjax = function (opt) {
    var d = $.Deferred();
    var _options = {
        traditional: true,
        async: true,
        type: 'POST',
        dataType: 'json',
        success: function success(data) {
            d.resolve(data);
        },
        error: function error(request, _error3) {
            d.reject(request, _error3);
        }
    };
    $.extend(_options, opt);
    $.ajax(_options);
    return d;
};

/***********************************************************************************************
 *@method : uniqueArrByKeys
 *@desc   : 数组元素是对象时的去重方法
 *@param  : {Array}arr:待去重的数组
 *@param  : {Array}keys:参照的键值
 *@return : {Array}newArr:去重后的数组
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.uniqueArrByKeys = function (arr, keys) {
    var newArr = [];
    var hash = {};
    for (var i = 0, j = arr.length; i < j; i++) {
        var obj = arr[i];
        // 将对象转成字符串
        var n = keys.length,
            key = [];
        while (n--) {
            key.push(obj[keys[n]]);
        }
        var k = key.join('|');
        // 使用转换后的字符串进行比较
        if (!(k in hash)) {
            hash[k] = true;
            newArr.push(arr[i]);
        }
    }
    return newArr;
};

/***********************************************************************************************
 *@method : findIndexByKeys
 *@desc   : 数组元素是对象时的确认下标方法
 *@param  : {Object}target:要查找的对象
 *@param  : {Array}arr:待查找数组
 *@param  : {Array}keys:参照的键值
 *@return : {Number}index:对象在数组中的位置
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.findIndexByKeys = function (target, arr, keys) {
    var index = -1;
    var tKey = [];
    for (var n = 0; n < keys.length; n++) {
        tKey.push(target[keys[n]]);
    }
    var tKeyStr = tKey.join('|');

    for (var i = 0, j = arr.length; i < j; i++) {
        var obj = arr[i];
        // 将对象转成字符串
        var key = [];
        for (var n = 0; n < keys.length; n++) {
            key.push(obj[keys[n]]);
        }
        if (key.join('|') === tKeyStr) {
            index = i;
            break;
        }
    }
    return index;
};

/***********************************************************************************************
 *@method : 深拷贝
 *@desc   : 数组元素是对象时的确认下标方法
 *@param  : {Object}obj:拷贝对象
 *@return : {Object}o:拷贝后的对象
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.deepCopy = function (obj) {
    var _this = this;
    var o;
    switch (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) {
        case 'undefined':
            break;
        case 'string':
            o = obj + '';
            break;
        case 'number':
            o = obj - 0;
            break;
        case 'boolean':
            o = obj;
            break;
        case 'object':
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(_this.deepCopy(obj[i]));
                    }
                } else {
                    o = {};
                    for (var k in obj) {
                        o[k] = _this.deepCopy(obj[k]);
                    }
                }
            }
            break;
        default:
            o = obj;
            break;
    }
    return o;
};

// 常用数据转换方法
/***********************************************************************************************
 *@method : convertDict2Select
 *@desc   : 将需要通过接口获取的数据字典转换成下拉选择框的选项
 *@param  : {String}url:请求的接口
 *@param  : {String}label:选择项的内容
 *@param  : {String}value:选择项的value
 *@return : {Array}options:选项数组
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.convertDict2Select = function (data, label, value) {
    var options = [];
    data.forEach(function (datum, i) {
        options.push({
            label: datum[label],
            value: datum[value]
        });
    });
    return options;
};

/***********************************************************************************************
 *@method : convertSource2Cn
 *@desc   : 将内容源转为对应的中文 o_iqiyi爱奇艺,o_tencent腾讯,o_voole优朋
 *@param  : {String}source:内容源的英文表示
 *@return : {String}sourceCn:内容源的中文表示
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.convertSource2Cn = function (source) {
    var sourceCn = {
        'o_iqiyi': '爱奇艺',
        'o_tencent': '腾讯',
        'o_voole': '优朋'
    };
    return sourceCn[source];
};

/***********************************************************************************************
 *@method : convertNum2AuditStatus
 *@desc   : 将数字转为对应的审核状态 0下架,1上架,2草稿,3待审核,4审核通过,5审核不通过
 *@param  : {Number}num:审核状态对应的数字
 *@return : {String}auditStatus:审核状态的文字表示
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.convertNum2AuditStatus = function (num) {
    var auditStatus = ['下架', '上架', '待审核', '审核不通过', '审核中', '审核通过', '草稿'];
    return auditStatus[num];
};

/***********************************************************************************************
 *@method : convertNum2BusinessType
 *@desc   : 将数字转为对应的业务分类 0影视
 *@param  : {Number}num:审核状态对应的数字
 *@return : {String}auditStatus:审核状态的文字表示
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.convertNum2BusinessType = function (num) {
    var auditStatus = ['影视'];
    return auditStatus[num];
};

// 常用页面操作方法
/***********************************************************************************************
 *@method : getUrlQueryString
 *@desc   : 获取页面url中的参数值
 *@param  : {String}name:参数名
 *@return : {String}value:参数值
 *@author : shelly
 ***********************************************************************************************/
Vue.prototype.getUrlQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
};