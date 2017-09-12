'use strict';

var _methods;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Vue.filter('formatter', function (value, fn, row) {
  if (!(fn instanceof Function)) return value;
  if (value === '') return '';
  return fn(value, row);
});

Vue.directive('ccvalidate', {
  bind: function bind(el, _bind, vNode) {
    var errHandle = function errHandle(inputItem, errMsg) {
      inputItem.addClass('is-error');
      var string = '<div class="el-form-item__error">' + errMsg + '</div>';
      inputItem.find('.el-form-item__error').remove();
      inputItem.find('.el-form-item__content').append(string);
    };
    var removeErrHandle = function removeErrHandle(inputItem) {
      inputItem.removeClass('is-error');
      inputItem.find('.el-form-item__error').remove();
    };
    $(el).on('focus', 'input, select, textarea', function () {
      var item = $(this).parents('.el-form-item');
      item[0].dataset.focus = true;
    });
    $(el).on('blur', 'input, select, textarea', function () {
      var _this2 = this;

      setTimeout(function () {
        var inputItem = $(_this2).parents('.el-form-item');
        var dataset = inputItem[0].dataset;
        var rule = dataset.rule;
        var errMsg = dataset.errmsg;
        var focus = dataset.focus;
        var required = dataset.required;
        var value = void 0;
        switch (rule) {
          case 'number':
            value = _this2.value;
            value = +value;
            _this2.value = value;
            if (!value && !required && value !== void 0 || required && !value && value !== 0) errHandle(inputItem);else removeErrHandle(inputItem);
            break;
          case 'date':
            value = _this2.value;
            var date = new Date(value);
            console.log(date);
            break;
          case 'string':
            value = _this2.value;
            if (required && value === '') errHandle(inputItem, errMsg);else removeErrHandle(inputItem);
            break;
          case 'checkbox':
            var list = $(_this2).parents('.el-checkbox-group').find('input:checked');
            if (required && list.length === 0) errHandle(inputItem, errMsg);else removeErrHandle(inputItem);
            break;
          default:
            value = _this2.value;
            if (required && value === '') errHandle(inputItem, errMsg);else removeErrHandle(inputItem);
            break;
        }
      }, 200);
    });
  }
});

Vue.directive('ccrule', {
  inserted: function inserted(el, bind) {
    var rules = bind.value;
    if (rules instanceof Object && !(rules instanceof Array)) {
      var type = rules.type;
      var required = rules.required;
      var errmsg = rules.errmsg;
      if (required) $(el).addClass('is-required');
      el.dataset.rule = type;
      el.dataset.required = required || false;
      el.dataset.errmsg = errmsg;
    }
  }
});

var app = new Vue({
  el: '#app',
  data: function data() {
    var _this = this;
    return {
      tableColumns: [_defineProperty({
        field: 'tabId',
        name: 'ID',
        fixed: true,
        width: '80',
        sort: false
      }, 'fixed', true), {
        field: 'tabName',
        name: '名称',
        width: '150',
        type: 'link',
        sort: false,
        handle: function handle(v, row) {
          console.log(v);
          alert(v);
          alert(row.tabId);
          return false;
        }
      }, {
        field: 'tabType',
        name: '版面属性',
        width: '120',
        sort: false,
        formatter: function formatter(v, row) {
          switch (v) {
            case 1:
              return '普通版面';
            case 2:
              return '专题版面';
          }
        }
      }, {
        field: 'tabCategory',
        name: '业务分类',
        width: '120',
        sort: false,
        customFormatter: function customFormatter(row, column) {
          return _this.convertSource2Cn(column);
        }
      }, {
        field: 'tabAppid',
        name: 'AppId',
        width: '150',
        sort: false
      }, {
        field: 'videoType',
        name: '版本/状态',
        width: '120',
        sort: false,
        formatter: function formatter(v, row) {
          var str = row.currentVersion + '/';
          switch (row.tabStatus) {
            case 0:
              return str + '下架';
            case 1:
              return str + '上架';
            case 2:
              return str + '草稿';
            case 3:
              return str + '待审核';
            case 4:
              return str + '审核通过';
            case 4:
              return str + '审核不通过';
            default:
              return str;
          }
        }
      }, {
        field: 'duplicateVersion',
        name: '待审核副本',
        width: '120',
        type: 'link',
        sort: false
      }, {
        field: 'lastUpdateDate',
        name: '更新时间',
        width: '180',
        sort: false
      }, {
        field: 'auditor',
        name: '审核人',
        width: '120',
        sort: false
      }, {
        field: 'sysUser',
        name: '更新人',
        width: '200',
        sort: false,
        formatter: function formatter(v, row) {
          return v.userName;
        }
      }],
      options: {
        preventInitSearch: true,
        previewType: 'dataList',
        tableData: {},
        defaultDialog: {}
      },
      formInline: {
        user: '',
        region: '',
        appId: ''
      },
      toolOptions: {
        preset: 'view'
      },
      appIdList: [],
      businessTypeList: [],
      formatter: function formatter(v, row) {
        return 'test';
      },
      dataList: [],
      urls: {
        pageUrl: '/tabInfo/pageList.html'
      },
      searchOptions: [{
        field: 'test',
        label: '测试',
        placeholder: '请选择'
      }, {
        field: 'test2',
        type: 'select',
        label: '测试2',
        placeholder: '请选择',
        options: [{
          label: '测试1',
          value: 'test1'
        }, {
          label: '测试2',
          value: 'test2'
        }, {
          label: '测试3',
          value: 'test3'
        }]
      }, {
        field: 'test3',
        type: 'date',
        dateType: 'daterange',
        label: '测试3'
      }],
      tableResult: [],
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    };
  },
  watch: {
    tableResult: function tableResult() {
      console.log(this.tableResult);
    }
  },
  created: function created() {
    this.getAppId();
    this.getBusinessType();
  },
  mounted: function mounted() {
    // console.log(this.$refs)
    // console.log(this.$refs.table)
    // console.log(this.$refs.table.getSelectedRow)
  },

  methods: (_methods = {
    onSubmit: function onSubmit() {
      console.log('submit!');
    },

    openPreviewWin: function openPreviewWin(data) {
      this.options.defaultDialog = {
        title: '预览页面',
        visible: true,
        src: $basePath + '/mediaResManage/preview.html?thirdId=' + data.thirdId + '&source=' + data.source
      };
    }
  }, _defineProperty(_methods, 'onSubmit', function onSubmit() {
    console.log('submit!');
  }), _defineProperty(_methods, 'search', function search(_search) {
    console.log(_search);
  }), _defineProperty(_methods, 'getAppId', function getAppId() {
    var _this3 = this;

    this.postAjax({ url: '/globalDictInfo/getTypes/appIdType.html' }).done(function (data) {
      _this3.appIdList = data;
    }).fail(function (response, err) {
      console.log(response, err);
    });
  }), _defineProperty(_methods, 'getBusinessType', function getBusinessType() {
    var _this4 = this;

    this.postAjax({ url: '/globalDictInfo/getTypes/businessType.html' }).done(function (data) {
      _this4.businessTypeList = data;
    }).fail(function (response, err) {
      console.log(response, err);
    });
  }), _methods)
});