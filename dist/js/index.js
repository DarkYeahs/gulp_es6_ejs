'use strict';

var originUtils = window.originUtils;
var $ = window.$;
var origin = window.origin;
var $basePath = window.$basePath;
var basicFn = window.basicFn;
var FastDevTool = window.FastDevTool;
var OGridClass = window.OGridClass;
var searchForm = $('#searchForm');
var sourceManagerView = void 0;
var test = function test() {
	console.log(undefined);
};
test();
sourceManagerView = {
	fastDevTool: FastDevTool(),
	init: function init() {
		// // 调用父类的方法
		// this._super(opt)

		// this.grid_conf = opt.gridConf || {}
		// // 远程排序
		// this.grid_conf.remoteSort = true
		// this.getCompanyList()
		// //	供应商选择展示服务类型
		// $('#souSupplier').on('change', () => {
		// 	let _this_option = $(this).val()
		// 	// let companyName = $(this).find('option:selected').html()
		// 	console.log(_this_option)
		// 	let op_htmls = '<option value="">请选择</option>'
		// 	switch (_this_option) {
		// 		case 'yinhe': {
		// 			op_htmls += '<option value="yinhe-km">爱奇艺卡密包</option><option value="yinhe">奇异果VIP</option><option value="yinhe-gold">黄金VIP</option>'
		// 			break
		// 		}
		// 		case 'tencent': {
		// 			op_htmls += '<option value="7">鼎级剧场</option><option value="tx-km">腾讯卡密包</option><option value="6">影视VIP（企鹅影院）</option><option value="36">腾讯体育</option>'
		// 			break
		// 		}
		// 		case 'tencent_yst': {
		// 			op_htmls += '<option value="6">影视VIP</option><option value="7">鼎级剧场</option><option value="36">腾讯体育</option>'
		// 			break
		// 		}
		// 		case 'yinhe_mix_voole': {
		// 			op_htmls += '<option value="yinhe">奇艺果会员</option><option value="yinhe-gold">黄金VIP</option><option value="yinhe-km">优朋混奇艺卡密包</option>'
		// 			break
		// 		}
		// 		default:
		// 			op_htmls = '<option value="">请先选择供应商</option>'
		// 				//	演示而写的代码
		// 				// op_htmls = '<option value=\"" + _this_option + 'SS\">" + companyName +"产品包<\/option>"
		// 	}
		// 	$('#souServiceType').html(op_htmls)
		// })

		var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	},

	urls: {
		add_view: $basePath + '/source/add.html',
		edit_view: $basePath + '/source/edit.html',
		preview_view: $basePath + '/source/preview.html',
		data_list: $basePath + '/source/pageList.html',
		tools: $basePath + '/source/getMenuInfo.html',
		enable: $basePath + '/source/setStatus.html',
		companyList: $basePath + '/company/list.html'
	},
	getGridConf: function getGridConf() {
		return this.grid_conf;
	},
	getGridColumns: function getGridColumns() {
		this._super();
		var columns = [];
		columns.push([{
			field: 'Id',
			checkbox: true
		}, {
			field: 'sourceId',
			title: 'ID',
			width: 50,
			halign: 'center',
			align: 'center',
			sortable: true
		}, {
			field: 'sourceName',
			title: '产品包分类名称',
			width: 200,
			halign: 'center',
			align: 'center',
			sortable: true,
			formatter: function formatter(v, row) {
				return '<a href="javascript:void(0)" onClick="openPreviewWin(' + row.sourceId + ')">' + v + '</a>';
			}
		}, {
			field: 'companyCnName',
			title: '供应商',
			width: 100,
			halign: 'center',
			align: 'center',
			sortable: true
		}, {
			field: 'sourceSign',
			title: '服务类型',
			width: 100,
			halign: 'center',
			align: 'center',
			sortable: true,
			formatter: function formatter(v, row) {
				var list = {
					'tx-km': '腾讯卡密',
					7: '鼎级剧场',
					6: '影视VIP',
					36: '腾讯体育',
					yinhe: '奇异果会员',
					'yinhe-gold': '黄金VIP',
					'yinhe-km': '优朋混奇异卡密包'
				};
				return list[v] ? list[v] : '';
			}
		}, {
			field: 'sourceStatus',
			title: '审核状态',
			width: 100,
			halign: 'center',
			align: 'center',
			sortable: true,
			formatter: function formatter(v, row) {
				// return row.hallCurrentVersion + '/' + basicFn.numToAuditStatus(v)
				return basicFn.numToProductAuditStatus(v);
			}
		}, {
			field: 'webVipcenterBg',
			title: '图片',
			width: 150,
			halign: 'center',
			align: 'center',
			sortable: true,
			formatter: function formatter(v, row) {
				return '<img class="source-item-images" style="width: 100%" src="' + v + '" />';
			}
		}, {
			field: 'createrName',
			title: '创建人',
			width: 100,
			halign: 'center',
			align: 'center',
			sortable: true
		}, {
			field: 'createdDate',
			title: '创建时间',
			width: 150,
			halign: 'center',
			align: 'center',
			sortable: true
		}, {
			field: 'flag',
			title: '操作',
			width: 100,
			halign: 'center',
			align: 'center',
			formatter: function formatter(v, row) {
				if (v === 1) return '<a href="#" onclick="view.enable(' + row.sourceId + ',' + 0 + ')>启用</a>';
				return '<a href="#" onclick="view.enable(' + row.sourceId + ',' + 1 + ')>停用</a>';
			}
		}]);
		return columns;
	},
	search: function search() {
		this.Grid.datagrid('load', origin.serializeObject(searchForm));
	},
	cleanSearch: function cleanSearch() {
		this.Grid.datagrid('load', {});
		searchForm.resetForm();
		// 触发change事件，清除级联选项
		$('#souSupplier').change();
	},
	refresh: function refresh() {
		this.Grid.datagrid('reload');
	},
	getMenuRuns: function getMenuRuns(opt) {
		// 改写获取按钮方法
		var tools = [];

		var _this = this;
		$.ajax({
			url: this.urls.tools,
			async: false,
			type: 'post',
			dataType: 'json',
			success: function success(data) {
				$.each(data, function (i, n) {
					var runCommFn = function runCommFn() {};
					if (n.runComm === 'add') {
						//	增加操作
						runCommFn = function runCommFn() {
							_this.createWindow('addWin', 'icon-tools-add', '新增', _this.urls.add_view);
						};
					} else if (n.runComm === 'edit') {
						//	修改操作
						runCommFn = function runCommFn() {
							var record = _this.utils().getCheckedRows();
							if (_this.utils().checkSelectOne(record)) {
								if (record[0].sourceStatus === 0 || record[0].sourceStatus === 3 || record[0].sourceStatus === 1) {
									// let idKey = _this.OPT.idField || 'id'
									_this.createWindow('editWin', 'icon-tools-edit', '编辑', _this.urls.edit_view + '?id=' + record[0].sourceId + '&copy=2');
								} else {
									_this.FastDevTool.createAlertWin('该状态产品包不支持编辑!');
								}
							}
						};
					} else if (n.runComm === 'delete') {
						//	删除操作
						//	如果子类实现了删除操作，就不再执行父类的删除操作
						if (opt.deleteFn !== null && opt.deleteFn !== undefined) {
							runCommFn = function runCommFn() {
								if ($.isFunction(opt.deleteFn)) {
									opt.deleteFn();
								}
							};
						} else {
							runCommFn = function runCommFn() {
								//	删除操作
								var records = _this.utils().getCheckedRows();
								if (_this.utils().checkSelect(records)) {
									if (records[0].sourceStatus === 0 || records[0].sourceStatus === 3 || records[0].sourceStatus === 1) {
										$.messager.confirm('系统提示', '您确认要删除当前记录吗?', function (r) {
											if (r) {
												originUtils.progress();
												var arr = [];
												// let idKey = _this.OPT.idField || 'id' //	主键名称
												$.each(records, function (i, record) {
													arr.push('id=' + record.sourceId);
												});
												var _data = arr.join('&');
												originUtils.ajaxJsonAsync('remove.html', _data, function (data) {
													if (!data.success) {
														originUtils.alert(originUtils.defaultMsg.sysmsg, data.msg, 'error');
													} else if ($.isFunction(opt.deleteFn)) opt.deleteFn(data);
												});
												_this.utils().uncheckAll();
												_this.Grid.datagrid('reload');
												originUtils.closeProgress();
											}
										});
									} else {
										_this.FastDevTool.createAlertWin('该状态产品包不支持删除!');
									}
								}
							};
						}
					}
					tools.push({
						iconCls: n.runBtnIcon,
						text: n.runName,
						handler: runCommFn
					});
				});
			}
		});
		//	增加自定义工具栏
		if (this.OPT.tools) {
			$.each(this.OPT.tools, function (i, n) {
				tools.push(this.OPT.tools[i]);
			});
		}
		return tools;
	},
	enable: function enable(id, switchItem) {
		var _this2 = this;

		this.FastDevTool.ajax(this.urls.enable, {
			sourceId: id,
			flag: switchItem
		}, function (data) {
			_this2.FastDevTool.createAlertWin(data.msg, '操作提示');
			if (data.success) {
				_this2.Grid.datagrid('reload');
			}
		});
	},
	getCompanyList: function getCompanyList() {
		console.log(this.FastDevTool);
		this.FastDevTool.ajax(this.urls.companyList, {}, function (data) {
			var list = [];
			data.forEach(function (item) {
				list.push('<option value="' + item.company + '">' + item.companyCnName + '</option>');
			});
			list.join('');
			$('#souSupplier').append(list);
		});
	}
};

sourceManagerView = OGridClass.extend(sourceManagerView);

var view = void 0;
$(function () {
	var opt = {
		idField: 'sourceId',
		gridConf: {
			pageSize: 10,
			pageList: [10, 15, 30]
		}
	};
	view = new sourceManagerView(opt);
	view.dataGrid();
	console.log('============================');
	view.getCompanyList();
	console.log('============================');
	// view.imagePreview()
	// view.getMenuRuns()
	// 关闭页面加载等待层
	originUtils.hideLoadding();
});

// 关闭增加窗口
var closeAddWin = function closeAddWin(isRefresh) {
	$('#addWin').window('close');
	if (isRefresh !== undefined && isRefresh) {
		view.refresh();
	}
};
// 关闭编辑窗口
var closeEditWin = function closeEditWin(isRefresh) {
	$('#editWin').window('close');
	if (isRefresh !== undefined && isRefresh) {
		view.refresh();
	}
};

var openPreviewWin = function openPreviewWin(id, flag) {
	var url = view.urls.preview_view + '?id=' + id;
	view.FastDevTool.createDialogWin('auditWin', {
		fit: true,
		iconCls: 'icon-edit',
		minimizable: false,
		maximizable: true,
		title: '预览页面',
		content: view.FastDevTool.createIframe(url)
	});
};
console.log(closeAddWin, closeEditWin, openPreviewWin);