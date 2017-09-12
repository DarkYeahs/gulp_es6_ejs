let originUtils = window.originUtils
let $ = window.$
let origin = window.origin
let $basePath = window.$basePath
let basicFn = window.basicFn
let FastDevTool = window.FastDevTool
let OGridClass = window.OGridClass
let searchForm = $('#searchForm')
let sourceManagerView
let test = () => {
	console.log(this)
}
test()
sourceManagerView = {
	fastDevTool: FastDevTool(),
	init (opt = {}) {
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
	getGridConf () {
		return this.grid_conf
	},
	getGridColumns () {
		this._super()
		let columns = []
		columns.push([
			{
				field: 'Id',
				checkbox: true
			},
			{
				field: 'sourceId',
				title: 'ID',
				width: 50,
				halign: 'center',
				align: 'center',
				sortable: true
			},
			{
				field: 'sourceName',
				title: '产品包分类名称',
				width: 200,
				halign: 'center',
				align: 'center',
				sortable: true,
				formatter (v, row) {
					return '<a href="javascript:void(0)" onClick="openPreviewWin(' + row.sourceId + ')">' + v + '</a>'
				}
			},
			{
				field: 'companyCnName',
				title: '供应商',
				width: 100,
				halign: 'center',
				align: 'center',
				sortable: true
			},
			{
				field: 'sourceSign',
				title: '服务类型',
				width: 100,
				halign: 'center',
				align: 'center',
				sortable: true,
				formatter (v, row) {
					let list = {
						'tx-km': '腾讯卡密',
						7: '鼎级剧场',
						6: '影视VIP',
						36: '腾讯体育',
						yinhe: '奇异果会员',
						'yinhe-gold': '黄金VIP',
						'yinhe-km': '优朋混奇异卡密包'
					}
					return list[v] ? list[v] : ''
				}
			},
			{
				field: 'sourceStatus',
				title: '审核状态',
				width: 100,
				halign: 'center',
				align: 'center',
				sortable: true,
				formatter (v, row) {
					// return row.hallCurrentVersion + '/' + basicFn.numToAuditStatus(v)
					return basicFn.numToProductAuditStatus(v)
				}
			},
			{
				field: 'webVipcenterBg',
				title: '图片',
				width: 150,
				halign: 'center',
				align: 'center',
				sortable: true,
				formatter (v, row) {
					return '<img class="source-item-images" style="width: 100%" src="' + v + '" />'
				}
			},
			{
				field: 'createrName',
				title: '创建人',
				width: 100,
				halign: 'center',
				align: 'center',
				sortable: true
			},
			{
				field: 'createdDate',
				title: '创建时间',
				width: 150,
				halign: 'center',
				align: 'center',
				sortable: true
			},
			{
				field: 'flag',
				title: '操作',
				width: 100,
				halign: 'center',
				align: 'center',
				formatter (v, row) {
					if (v === 1) return '<a href="#" onclick="view.enable(' + row.sourceId + ',' + 0 + ')>启用</a>'
					return '<a href="#" onclick="view.enable(' + row.sourceId + ',' + 1 + ')>停用</a>'
				}
			}
		])
		return columns
	},
	search () {
		this.Grid.datagrid('load', origin.serializeObject(searchForm))
	},
	cleanSearch () {
		this.Grid.datagrid('load', {})
		searchForm.resetForm()
		// 触发change事件，清除级联选项
		$('#souSupplier').change()
	},
	refresh () {
		this.Grid.datagrid('reload')
	},
	getMenuRuns (opt) { // 改写获取按钮方法
		let tools = []

		let _this = this
		$.ajax({
			url: this.urls.tools,
			async: false,
			type: 'post',
			dataType: 'json',
			success: (data) => {
				$.each(data, (i, n) => {
					let runCommFn = function () {
					}
					if (n.runComm === 'add') {	//	增加操作
						runCommFn = function () {
							_this.createWindow('addWin', 'icon-tools-add', '新增', _this.urls.add_view)
						}
					}
					else if (n.runComm === 'edit') {	//	修改操作
						runCommFn = function () {
							let record = _this.utils().getCheckedRows()
							if (_this.utils().checkSelectOne(record)) {
								if (record[0].sourceStatus === 0 || record[0].sourceStatus === 3 || record[0].sourceStatus === 1) {
									// let idKey = _this.OPT.idField || 'id'
									_this.createWindow('editWin', 'icon-tools-edit', '编辑', _this.urls.edit_view + '?id=' + record[0].sourceId + '&copy=2')
								}
								else {
									_this.FastDevTool.createAlertWin('该状态产品包不支持编辑!')
								}
							}
						}
					}
					else if (n.runComm === 'delete') {	//	删除操作
						//	如果子类实现了删除操作，就不再执行父类的删除操作
						if (opt.deleteFn !== null && opt.deleteFn !== undefined) {
							runCommFn = function () {
								if ($.isFunction(opt.deleteFn)) {
									opt.deleteFn()
								}
							}
						}
						else {
							runCommFn = function () {
								//	删除操作
								let records = _this.utils().getCheckedRows()
								if (_this.utils().checkSelect(records)) {
									if (records[0].sourceStatus === 0 || records[0].sourceStatus === 3 || records[0].sourceStatus === 1) {
										$.messager.confirm('系统提示', '您确认要删除当前记录吗?', function (r) {
											if (r) {
												originUtils.progress()
												let arr = []
												// let idKey = _this.OPT.idField || 'id' //	主键名称
												$.each(records, (i, record) => {
													arr.push('id=' + record.sourceId)
												})
												let data = arr.join('&')
												originUtils.ajaxJsonAsync('remove.html', data, function (data) {
													if (!data.success) {
														originUtils.alert(originUtils.defaultMsg.sysmsg, data.msg, 'error')
													}
													else if ($.isFunction(opt.deleteFn)) opt.deleteFn(data)
												})
												_this.utils().uncheckAll()
												_this.Grid.datagrid('reload')
												originUtils.closeProgress()
											}
										})
									}
									else {
										_this.FastDevTool.createAlertWin('该状态产品包不支持删除!')
									}
								}
							}
						}
					}
					tools.push({
						iconCls: n.runBtnIcon,
						text: n.runName,
						handler: runCommFn
					})
				})
			}
		})
		//	增加自定义工具栏
		if (this.OPT.tools) {
			$.each(this.OPT.tools, function (i, n) {
				tools.push(this.OPT.tools[i])
			})
		}
		return tools
	},
	enable (id, switchItem) {
		this.FastDevTool.ajax(this.urls.enable, {
			sourceId: id,
			flag: switchItem
		}, (data) => {
			this.FastDevTool.createAlertWin(data.msg, '操作提示')
			if (data.success) {
				this.Grid.datagrid('reload')
			}
		})
	},
	getCompanyList () {
		console.log(this.FastDevTool)
		this.FastDevTool.ajax(this.urls.companyList, {},
			(data) => {
				let list = []
				data.forEach(function (item) {
					list.push('<option value="' + item.company + '">' + item.companyCnName + '</option>')
				})
				list.join('')
				$('#souSupplier').append(list)
			})
	}
}

sourceManagerView = OGridClass.extend(sourceManagerView)


let view
$(function () {
	let opt = {
		idField: 'sourceId',
		gridConf: {
			pageSize: 10,
			pageList: [10, 15, 30]
		}
	}
	view = new sourceManagerView(opt)
	view.dataGrid()
	console.log('============================')
	view.getCompanyList()
	console.log('============================')
	// view.imagePreview()
	// view.getMenuRuns()
	// 关闭页面加载等待层
	originUtils.hideLoadding()
})

// 关闭增加窗口
let closeAddWin = function (isRefresh) {
	$('#addWin').window('close')
	if (isRefresh !== undefined && isRefresh) {
		view.refresh()
	}
}
// 关闭编辑窗口
let closeEditWin = function (isRefresh) {
	$('#editWin').window('close')
	if (isRefresh !== undefined && isRefresh) {
		view.refresh()
	}
}

let openPreviewWin = function (id, flag) {
	let url = view.urls.preview_view + '?id=' + id
	view.FastDevTool.createDialogWin('auditWin', {
		fit: true,
		iconCls: 'icon-edit',
		minimizable: false,
		maximizable: true,
		title: '预览页面',
		content: view.FastDevTool.createIframe(url)
	})
}
console.log(closeAddWin, closeEditWin, openPreviewWin)
