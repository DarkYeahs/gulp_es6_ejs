'use strict';

/*
 * 说明
 * 本文件基于vue和elementui,为公共组件js,请勿随意修改本文件
 * 文件中封装了系统中常用的组件,请根据说明文档直接引入标签和配置项即可使用
 * 以下组件基本与业务相关,常用的基础组建请参照elementui
 * 一旦需增加或修改常用组件,必须在说明文档中加入对应描述,代码中也需提供可读性良好的注释
 * 不常用的组件请封装在具体的业务模块
 * 作者:shelly
 */

/***********************************************************************************************
 *@name   : toolBar
 *@desc   : 操作按钮栏
 *@author : shelly
 ***********************************************************************************************/
var toolBar = '<div class="tool-wrapper" :class="fixedClass">' + '<span v-if="options.preset === \'preview\'" style="padding: 10px;">' + '<el-tag type="success">{{ convertNum2AuditStatus(options.previewBtnOpt.status) }}</el-tag>' + '<el-select v-if="versionCount" v-model="options.previewBtnOpt.version" @input="changeVersion" style="width: 280px; margin: 0 10px">' + '<el-option v-for="(opt, oIndex) in hlOptions" :label="opt.label" :value="opt.value" :key="opt.value"></el-option>' + '</el-select>' + '</span>' + '<el-button v-for="btn in btnBar" @click="btn.handler" :icon="btn.runIcon" :type="btn.runType" :size="size">{{ btn.runName }}</el-button>' + '</div>';

Vue.component('tool-bar', {
  template: toolBar,
  mounted: function mounted() {
    var _this = this;
    switch (this.options.preset) {
      case 'view':
        // 数据列表页
        {
          this.getViewBtn();
          break;
        }
      case 'update':
        // 新增编辑页
        {
          this.options.fixed = "top"; // 将按钮组固定于顶部 便于用户操作
          //this.btnBar.push({
          //  runName: '提交审核',
          //  runType: 'primary',
          //  handler: function () {
          //    _this.$emit('save', 2); // 点击保存 并传回待审核状态
          //  }
          //});
          this.btnBar.push({
            runName: '保存',
            runType: 'primary',
            handler: function handler() {
              _this.$emit('save', 6); // 点击保存 并传回待草稿状态
            }
          });
          break;
        }
      case 'preview':
        // 预览页
        {
          this.options.fixed = "top"; // 将按钮组固定于顶部 便于用户操作
          this.getPreviewBtn();
          break;
        }
      default:
        // 当未传入预置页面时 根据自行传入的按钮列表进行展示
        {
          this.btnBar = this.options.btnList;
          break;
        }
    }
    var fixed = this.options.fixed;
    if (fixed) {
      // 当设定了fixed属性 则对按钮栏添加固定样式
      this.fixedClass['tool-wrapper-fixed'] = true;
      this.fixedClass['tool-wrapper-fixed-' + fixed] = true;
    }
  },
  props: ['options'],
  data: function data() {
    return {
      fixedClass: {},
      btnBar: [],
      hlOptions: [], // 历史版本下拉框选项
      versionCount: 0 // 历史版本记录的数量
    };
  },
  computed: {
    size: function size() {
      // view页面的按钮为小号 其余的为默认号
      return this.options.preset === 'view' ? 'small' : '';
    }
  },
  methods: {
    getViewBtn: function getViewBtn() {
      // view页面获取权限按钮的方法
      var _this = this;
      this.ajax('/tabInfo/getMenuInfo.html', {}, function (data) {
        _this.btnBar = [];
        for (var i in data) {
          var btn = data[i];
          var runComm = btn.runComm;
          switch (runComm) {
            case 'add':
              {
                _this.btnBar.push({
                  runIcon: 'plus',
                  runName: btn.runName,
                  runType: 'primary',
                  handler: function handler() {
                    _this.$emit('openDefaultWin', { // 点击打开新增页面
                      title: '新增页面',
                      src: 'add.html'
                    });
                  }
                });
                break;
              }
            case 'edit':
              {
                _this.btnBar.push({
                  runIcon: runComm,
                  runName: btn.runName,
                  runType: 'primary',
                  handler: function handler() {
                    var toolOptions = _this.options;
                    var selected = toolOptions.selected;
                    if (selected.length === 1) {
                      // 当所选数据仅为一条时才可打开编辑页面
                      var aSelect = selected[0];
                      var auditField = toolOptions.auditField;
                      var url = 'edit.html?id=' + aSelect[toolOptions.idField]; // 加入id字段
                      if (auditField) {
                        // 在传入审核字段的情况下 在接口中加入version字段
                        url += '&version=' + aSelect[auditField.version];
                        var status = _this.convertNum2AuditStatus(aSelect[auditField.status]); // 转化为中文名 防止在各平台审核状态不同需多处改动
                        if (status !== '草稿' && status !== '审核不通过') {// 只有在草稿或审核不通过状态下才允许编辑
                          //_this.$message('该记录为' + status + '状态,不可编辑');
                          //return false;
                        }
                      }
                      _this.$emit('openDefaultWin', { // 点击打开编辑页面
                        title: '编辑页面',
                        src: url
                      });
                    } else {
                      // 提示仅选择一条记录时才可打开编辑页面
                      _this.$message('请选择一条记录进行编辑');
                    }
                  }
                });
                break;
              }
            case 'delete':
              {
                _this.btnBar.push({
                  runIcon: runComm,
                  runName: btn.runName,
                  runType: 'primary',
                  handler: function handler() {
                    var toolOptions = _this.options;
                    var selected = toolOptions.selected;
                    if (selected.length) {
                      _this.$confirm('确定删除选中的记录吗?', '删除提示', { // 提示是否确认删除
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                      }).then(function () {
                        // 若确认删除 调用删除接口进行删除
                        var ids = [];
                        var auditField = toolOptions.auditField;
                        var result = {
                          success: true,
                          msg: ''
                        };
                        for (var i = 0; i < selected.length; i++) {
                          var aSelect = selected[i];
                          var id = aSelect[toolOptions.idField];
                          ids.push(id);
                          //if (auditField) { // 当提供审核字段时 判断该状态下记录是否能被删除
                          //  var status = _this.convertNum2AuditStatus(aSelect[auditField.status]); // 转化为中文名 防止在各平台审核状态不同需多处改动
                          //  if(status !== '草稿' && status !== '审核不通过') { // 只有在草稿或审核不通过状态下才允许编辑
                          //    result.success = false;
                          //    result.msg = '[ID:' + id + ']该记录为' + status + '状态,不可删除';
                          //    break;
                          //  }
                          //}
                        }
                        if (result.success) {
                          _this.ajax('remove.html', {
                            id: ids
                          }, function (data) {
                            _this.$message({
                              type: data.success ? 'success' : 'error', // 删除成功时提示成功 删除失败时提示失败
                              message: data.msg
                            });
                            _this.$emit('refreshList'); // 删除后刷新列表
                          });
                        } else {
                          _this.$message({
                            type: 'error', // 删除成功时提示成功 删除失败时提示失败
                            message: result.msg
                          });
                        }
                      }).catch(function () {
                        _this.$message({
                          type: 'info',
                          message: '已取消删除'
                        });
                      });
                    } else {
                      _this.$message('请至少选择一条记录');
                    }
                  }
                });
                break;
              }
          }
        }
      });
    },
    getPreviewBtn: function getPreviewBtn() {
      // 获取preview页面的权限按钮 确定具体需求后再完善
      var _this = this;
      var btnOpt = this.options.previewBtnOpt;
      var urls = this.options.urls;
      this.ajax(urls.historyList || 'historyList.html', {
        id: btnOpt.id
      }, function (records) {
        var isAllowCopy = true;
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          _this.versionCount++; // 数量计数
          _this.hlOptions.push({ // 构建历史版本下拉框数据
            label: record.version + '/' + record.opear + '/' + record.lastUpdateDate,
            value: record.version
          });
          var status = _this.convertNum2AuditStatus(record.status); // 记录状态转成中文名 以防各平台状态值不一致
          if (status === '草稿' || status === '待审核' || status === '审核不通过') {
            isAllowCopy = false; // 当记录中存在草稿 待审核 审核不通过的记录时 不可创建副本
          }
        }

        // 获取按钮列表
        _this.ajax($basePath + '/buttonManage/getAuditDetailButton.html', {
          status: btnOpt.status, // 记录状态
          resourceId: btnOpt.id, // 记录ID
          version: btnOpt.version, // 记录版本
          type: btnOpt.type, // 记录类型
          menuElId: btnOpt.menuElId // 记录菜单ID
        }, function (btns) {
          for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            var runComm = btn.runComm;
            if (runComm === 'copy' && !isAllowCopy) {
              // 当按钮为创建副本 但又不允许创建副本时
              break; // 跳过该按钮
            }
            switch (runComm) {
              case 'claim':
                {
                  // 认领按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'primary',
                    handler: function handler() {
                      _this.claim(true);
                    }
                  });
                  break;
                }
              case 'unclaim':
                {
                  // 撤销认领按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'warning',
                    handler: function handler() {
                      _this.claim(false);
                    }
                  });
                  break;
                }
              case 'audit':
                {
                  // 审核按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'primary',
                    handler: function handler() {
                      _this.audit();
                    }
                  });
                  break;
                }
              case 'unaudit':
                {
                  // 撤销审核按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'warning',
                    handler: function handler() {
                      _this.unaudit();
                    }
                  });
                  break;
                }
              case 'edit':
                {
                  // 编辑按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'primary',
                    handler: function handler() {
                      // 点击时跳转至编辑页
                      var url = _this.options.urls.edit;
                      url = url ? url : 'edit.html';
                      url += '?id=' + btnOpt.id + '&version=' + btnOpt.version;
                      window.location.href = url;
                    }
                  });
                  break;
                }
              case 'delete':
                {
                  // 删除按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'warning',
                    handler: function handler() {
                      _this.delete();
                    }
                  });
                  break;
                }
              case 'shelves':
                {
                  // 上架按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'primary',
                    handler: function handler() {
                      _this.shelves();
                    }
                  });
                  break;
                }
              case 'copy':
                {
                  // 创建副本按钮
                  _this.btnBar.push({
                    runName: btn.runName,
                    runType: 'warning',
                    handler: function handler() {
                      var url = _this.options.urls.copy;
                      url = url ? url : 'editHistory.html';
                      url += '?id=' + btnOpt.id + '&version=' + btnOpt.version;
                      window.location.href = url;
                    }
                  });
                  break;
                }
              default:
                break;
            }
          }
        });
      });
    },
    claim: function claim(flag) {
      // 认领(flag为true)&撤销(flag为false)认领按钮事件
      var _this = this;
      var btnOpt = this.options.previewBtnOpt;
      var title = flag ? '确定认领' : '撤销认领';
      var msg = flag ? '认领后,您将负责审核该任务,若该内容引用了其他待审核的内容,也将被一起认领' : '撤销后,可供其他审核人员认领';
      var url = flag ? $basePath + '/auditTaskInfo/claimTask.html' : $basePath + '/auditTaskInfo/revokedTask.html';
      this.$confirm(msg, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(function () {
        _this.ajax(url, {
          resourceId: btnOpt.id,
          resourceVersion: btnOpt.version,
          resourceType: btnOpt.type
        }, function (data) {
          _this.$message({
            type: data.success ? 'success' : 'error',
            message: data.msg
          });
        });
      }).catch(function () {
        _this.$message({
          type: 'info',
          message: '已取消认领'
        });
      });
    },
    audit: function audit() {
      // 审核按钮事件
      this.$msgbox({
        title: '审核',
        //message: h('p', null, [
        //  h('span', null, '内容可以是 '),
        //  h('i', { style: 'color: teal' }, 'VNode')
        //]),
        confirmButtonText: '确定'
      }).then(function () {
        this.$message({
          type: 'info',
          message: 'action: ' + action
        });
      });
      //_this.FastDevTool.ajax(_this.urls.audit, {
      //  resourceId: tagEntity.tagId,
      //  resourceVersion: tagEntity.tagCurrentVersion,
      //  resourceType: 'tag',
      //  auditFlag: _this.FastDevTool.radioCheckedVal('auditFlag'),
      //  auditDesc: $('textarea[name="auditDesc"]').val()
      //}, function (data) {
      //  _this.FastDevTool.createAlertWin(data.msg);
      //  if(data.success) {
      //    _this.FastDevTool.closeParentDialogWin('editWin', 'data-list');
      //  }
      //});
    },
    unaudit: function unaudit() {
      // 撤销审核按钮事件
      var _this = this;
      var btnOpt = this.options.previewBtnOpt;
      this.$confirm('您确定要撤销审核吗?', '撤销审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(function () {
        _this.ajax($basePath + '/auditTaskInfo/revokedAudit.html', {
          resourceId: btnOpt.id,
          resourceVersion: btnOpt.version,
          resourceType: btnOpt.type
        }, function (data) {
          if (data.success) {
            window.location.reload();
          }
          _this.$message({
            type: data.success ? 'success' : 'error',
            message: data.msg
          });
        });
      }).catch(function () {
        _this.$message({
          type: 'info',
          message: '已取消撤审'
        });
      });
    },
    delete: function _delete() {
      // 删除按钮事件
      var _this = this;
      var btnOpt = this.options.previewBtnOpt;
      this.$confirm('您确定要撤销审核吗?', '撤销审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(function () {
        _this.ajax(_this.options.urls.delete || 'delHistory.html', {
          id: btnOpt.id,
          version: btnOpt.version
        }, function (data) {
          if (data.success) {
            _this.versionCount--; // 数量减一
            if (_this.versionCount > 0) {
              // 有其他版本时 切换到其他版本详情页
              var location = window.location;
              window.location.href = location.origin + location.pathname + '?id=' + btnOpt.id + 'version=';
            } else {
              // 没有其他版本时 返回到版面列表页
              window.parent.app.closeWin();
            }
          }
          _this.$message({
            type: data.success ? 'success' : 'error',
            message: data.msg
          });
        });
      }).catch(function () {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    shelves: function shelves() {
      // 上架按钮事件
      var _this = this;
      var btnOpt = this.options.previewBtnOpt;
      this.ajax(this.urls.shelves || 'putShelves.html', {
        id: btnOpt.id,
        version: btnOpt.version
      }, function (data) {
        _this.$message({
          type: data.success ? 'success' : 'error',
          message: data.msg
        });
        if (data.success) {
          window.location.reload();
        }
      });
    }
  }
});

/***********************************************************************************************
 *@name   : dataList
 *@desc   : 数据列表查询器
 *@author : shelly
 ***********************************************************************************************/
var dataList = '<div class="wrapper">' +
// 查询条件区域 start
'<div class="search-form-wrapper" v-if="!options.cancelSearch">' + '<el-collapse v-model="activeNames" @change="delayCalDataListH">' + // 闭合查询条件区域时 自动更新数据列表高度 以自适应窗口
'<el-collapse-item name="1">' + '<template slot="title">' + '查询条件' + '<el-button type="warning" size="small" @click.stop="reset" style="float: right; margin: 8px;">重置</el-button>' + // 重置按钮
'</template>' + '<el-form :inline="true">' + '<el-form-item :label="para.label" :key="para.name" v-if="para.searched" v-for="(para, key) in searchForm">' + // 遍历传入的参数 对其中searched为true的数据项进行条件查询
'<el-select v-if="para.options" v-model="para.value" @input="search">' + // 下拉框字段 以是否传入options来区分 改变时会自动执行search方法
'<el-option v-for="(option, oIndex) in para.options" :label="option.label" :value="option.value" :key="option.value"></el-option>' + '</el-select>' + '<el-input v-else v-model="para.value" @change="delaySearch"></el-input>' + // 输入框字段 输入完成时会自动执行search方法
'</el-form-item>' + '</el-form>' + '</el-collapse-item>' + '</el-collapse>' + '</div>' +
// 查询条件区域 end
// 操作按钮区域 start
'<tool-bar :options="toolOptions" v-if="!options.cancelTools" v-on:openDefaultWin="openDefaultWin" v-on:refreshList="search"></tool-bar>' + // 当传入cancelTools为true时 不显示该区域
// 操作按钮区域 end
// 数据列表区域 start
'<div class="data-list-wrapper" ref="dataList">' + '<el-table ref="table" v-loading="loading" :row-key="options.idField" :data="tableData.rows" :highlight-current-rowborder="options.singleSelect" @selection-change="handleSelectionChange" @row-click="handleRowClick" style="width: 100%" :height="options.dataListH || dataListH">' + '<el-table-column type="selection" :reserve-selection="options.reserveSelection" width="55"></el-table-column>' + // 勾选框 可通过reserveSelection来设置是否可分页多选
'<template v-for="(para, key) in options.tableColumns">' + '<el-table-column v-if="para.customFormatter" :fixed="para.fixed" :align="para.align || \'center\'" :prop="key" :label="para.label" :width="para.width">' + // 当传入customFormatter时 根据customFormatter生成列内容
'<template scope="scope">' + '<div v-if="para.operateFn" @click="para.operateFn(scope.row)">' + // 当传入operateFn时 根据operateFn执行点击事件
'<span v-html="para.customFormatter(scope.row, scope.row[key])"></span>' + '</div>' + '<span v-else v-html="para.customFormatter(scope.row, scope.row[key])"></span>' + '</template>' + '</el-table-column>' + '<el-table-column v-else :fixed="para.fixed" :align="para.align || \'center\'" :prop="key" :label="para.label" :width="para.width"></el-table-column>' + '</template>' + '</el-table>' + '</div>' +
// 数据列表区域 end
// 分页区域 start
'<div class="page-wrapper" ref="pagination" v-if="!options.cancelPagination">' + '<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableData.total"></el-pagination>' + '</div>' +
// 分页区域 end
// 默认窗口 start
'<default-dialog v-if="options.defaultDialog && options.defaultDialog.visible" :options="options.defaultDialog" v-on:refreshList="search"></default-dialog>' +
// 默认窗口 end
'</div>';

Vue.component('data-list', {
  template: dataList,
  mounted: function mounted() {
    var _this = this;
    if (!this.options.dataListH) {
      // 当未设定数据列表高度时 窗口大小变化时 计算数据列表应有高度 达到自适应
      window.onresize = _.debounce(function () {
        _this.calDataListH();
      }, 500); // 大小变化存在延时 设定500ms延时保证计算正确性
      this.calDataListH(); // 初始化时计算高度
    }
    this.search(); // 初始化时进行搜索
  },
  props: ['options'],
  data: function data() {
    return {
      tableData: {},
      selected: [], // 列表选中项
      activeNames: ['1'], // 确保初始时 查询条件区域为展开状态
      dataListH: 0, // 数据列表高度
      currentPage: 1, // 当前页
      pageSize: 10, // 页面记录大小
      loading: false // 加载动画
    };
  },
  computed: {
    searchForm: function searchForm() {
      // 提取查询条件
      var searchForm = {};
      var tableColumns = this.options.tableColumns;
      for (var key in tableColumns) {
        var column = tableColumns[key];
        if (column.searched) {
          // 对于需作为查询的列 填入value属性 以用于表单操作
          searchForm[key] = column;
          searchForm[key].value = column.default || ''; // 对于有默认值的列 预置默认值
        }
      }
      return searchForm;
    },
    toolOptions: function toolOptions() {
      return {
        preset: 'view', // 页面预置为view
        selected: this.selected, // 当前选中项
        idField: this.options.idField, // 主键字段
        auditField: this.options.auditField // 审核字段
      };
    }
  },
  methods: {
    handleSelectionChange: function handleSelectionChange(selection) {
      // 改变记录选中事件
      var _this = this;
      var selectOption = this.options.singleSelect;
      if (selectOption) {
        selection.forEach(function (row, index) {
          if (index === selection.length - 1) return;
          _this.$refs.table.toggleRowSelection(row, false);
        });
        this.selected = selection[0];
      } else {
        this.selected = selection;
      }
      this.$emit('get-selected', this.selected); // 向父组件传入已选项
    },
    handleRowClick: function handleRowClick(row, event, column) {
      // 处理行点击事件
      var handleClick = this.options.handleRowClick;
      if (handleClick) {
        handleClick(row, event, column);
      }
      this.$refs.table.toggleRowSelection(row, true);
    },
    delayCalDataListH: _.debounce(function () {
      // 由于窗口大小或查询区域改变时 大小变化略有延迟 延迟500秒调整数据列表大小
      this.calDataListH();
    }, 500),
    calDataListH: function calDataListH() {
      // 计算数据列表高度
      var dataListH = document.body.clientHeight - this.$refs.dataList.offsetTop; // 文档高度 - 数据列表上方高度
      if (!this.options.cancelPagination) {
        // 若有分页 减去分页高度40
        dataListH -= 40;
      }
      this.dataListH = dataListH;
    },
    handleSizeChange: function handleSizeChange(pageSize) {
      // 切换页面记录大小
      this.pageSize = pageSize;
      this.search(); // 切换后立即查询
    },
    handleCurrentChange: function handleCurrentChange(currentPage) {
      // 切换当前页
      this.currentPage = currentPage;
      this.search(); // 切换后立即查询
    },
    delaySearch: _.debounce(function () {
      // 输入框输入时 采用去抖的方式 保证输入结束后再进行查询
      this.search();
    }, 500),
    search: function search() {
      // 查询事件
      var _this = this;
      var searchForm = this.searchForm;
      var searchParams = { // 预置查询参数为页数和行数
        page: this.currentPage,
        rows: this.pageSize
      };
      for (var paraKey in searchForm) {
        var para = searchForm[paraKey];
        if (para.searched) {
          searchParams[paraKey] = para.value;
        }
      }
      this.loading = true; // 查询前加载loading动画

      this.ajax(this.options.url || 'pageList.html', searchParams, function (data) {
        _this.tableData = data; // 取到列表数据
        _this.loading = false; // 查询后取消loading动画
      }, function () {
        _this.tableData = { total: 0, rows: [] };
        _this.loading = false; // 查询后取消loading动画
      });
    },
    reset: function reset() {
      var searchForm = this.searchForm;
      for (var paraKey in searchForm) {
        searchForm[paraKey].value = searchForm[paraKey].default || '';
      }
      this.search();
    },
    openDefaultWin: function openDefaultWin(options) {
      // 默认窗口打开事件
      this.options.defaultDialog = {
        title: options.title,
        visible: true,
        src: options.src
      };
    },
    closeDefaultWin: function closeDefaultWin() {
      // 默认窗口关闭事件
      this.options.defaultDialog.visible = false;
      this.search(); // 关闭后刷新数据列表
    }
  }
});

/***********************************************************************************************
 *@name   : picList
 *@desc   : 带图片的数据列表
 *@author : shelly
 ***********************************************************************************************/
var picList = '<div v-loading="loading" class="pic-list-wrapper">' +
// 查询条件区域 start
'<div class="search-form-wrapper" v-if="!options.cancelSearch">' + '<el-collapse v-model="activeNames">' + // 闭合查询条件区域时 自动更新数据列表高度 以自适应窗口
'<el-collapse-item name="1">' + '<template slot="title">' + '查询条件' + '<el-button type="warning" size="small" @click.stop="reset" style="float: right; margin: 8px;">重置</el-button>' + // 重置按钮
'</template>' + '<el-form :inline="true">' + '<el-form-item :label="para.label" :key="para.name" v-for="(para, key) in options.searchParams">' + // 遍历传入的参数 对其中searched为true的数据项进行条件查询
'<el-select v-if="para.options" v-model="para.value" @input="search">' + // 下拉框字段 以是否传入options来区分 改变时会自动执行search方法
'<el-option v-for="(option, oIndex) in para.options" :label="option.label" :value="option.value" :key="option.value"></el-option>' + '</el-select>' + '<el-input v-else v-model="para.value" @change="delaySearch"></el-input>' + // 输入框字段 输入完成时会自动执行search方法
'</el-form-item>' + '</el-form>' + '</el-collapse-item>' + '</el-collapse>' + '</div>' +
// 查询条件区域 end
'<el-row v-for="(row, rIndex) in convertedRows" :key="row[options.idField]">' + '<el-col v-for="(column, cIndex) in row" :key="cIndex" :span="24 / columnNum">' + '<el-card class="pic-wrapper" style="margin: 10px;" :body-style="{ padding: \'0px\'}">' + '<el-radio class="select-handler" v-model="selected[options.idField]" :label="column[options.idField]" :name="options.idField" @click.native="handleSelectionChange(column)" style="margin: 4px;">&nbsp;</el-radio>' + '<div style="height: 200px; text-align: center; overflow: hidden;" @click="handleSelectionChange(column)">' + // 图片显示区域
'<img :src="column[options.picField]" referrerpolicy="no-referrer" style="height: 100%">' + // 为保证爱奇艺图片正常输出 加入referrerpolicy应对防盗链
'</div>' + '<div style="min-height: 40px; padding: 12px;">' + // 文字显示区域
'<div v-for="(item, iIndex) in options.textItems" :key="iIndex">' + '<span v-if="item.customFormatter" v-html="item.customFormatter(column, column[item.field])"></span>' + '<span v-else>{{ column[item.field] }}</span>' + '</div>' + '</div>' + '</el-card>' + '</el-col>' + '</el-row>' + '<div class="page-wrapper" ref="pagination">' + // 分页区域
'<el-pagination v-if="options.tableData" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[12, 24, 36]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="options.tableData.total"></el-pagination>' + '</div>' + '</div>';

Vue.component('pic-list', {
  template: picList,
  props: ['options'],
  mounted: function mounted() {
    var _this = this;
    var initCondition = this.options.initCondition;
    if (initCondition) {
      // 若存在初始化条件 则使用
      this.searchForm = initCondition;
    }
    window.onresize = _.debounce(function () {
      // 当窗口大小变化时 调整每行的图片列数
      _this.calColumn();
    }, 500); // 大小变化存在延时 设定500ms延时保证计算正确性
    this.calColumn(); // 初始计算适合屏幕的每行图片列数

    if (!this.options.preventInitSearch) {
      this.search();
    }
  },
  data: function data() {
    return {
      selected: '1',
      activeNames: ['1'],
      convertedRows: [], // 转化后的列表形式
      columnNum: 6, // 每行的图片列数 默认为6
      currentPage: 1, // 当前页
      pageSize: 12, // 每页大小 默认为12
      loading: false // 加载动画 默认隐藏
    };
  },
  computed: {
    searchForm: function searchForm() {
      // 筛选条件
      var searchForm = {};
      var searchParams = this.options.searchParams;
      for (var key in searchParams) {
        var param = searchParams[key];
        searchForm[key] = param;
        searchForm[key].value = param.default || ''; // 对于有默认值的列 预置默认值
      }
      return searchForm;
    }
  },
  watch: {
    'options.initCondition': { // 观察传入的初始条件 变化时更新
      handler: function handler(newValue) {
        this.searchForm = newValue;
        this.search();
      }
    }
  },
  methods: {
    calColumn: function calColumn() {
      // 为自适应屏幕 根据现有组件的所占大小进行判断 自动更新每行显示的图片数 由于element采用24进行栅格划分 因此采用4和6来进行改变
      if (this.$el.clientWidth <= 1280) {
        // 当组件所占大小低于等于1280时 每行显示4个
        this.columnNum = 4;
      } else {
        // 当组件所占大小大于1280时 每行显示6个
        this.columnNum = 6;
      }
      var tableData = this.options.tableData;
      if (tableData) {
        this.convertedRows = this.convertData(tableData.rows); // 根据改变后的列数整理数据列表格式
      }
    },
    convertData: function convertData(rows) {
      // 将数组转换为二维数组 便于分行的结构遍历
      var _this = this;
      return _.toArray(_.groupBy(rows, function (num, index) {
        // 将列表按照列数分组并转化成数组
        return Math.floor(index / _this.columnNum);
      }));
    },
    handleSizeChange: function handleSizeChange(pageSize) {
      // 切换页面记录大小
      this.pageSize = pageSize;
      this.search(); // 切换后立即查询
    },
    handleCurrentChange: function handleCurrentChange(currentPage) {
      // 切换当前页
      this.currentPage = currentPage;
      this.search(); // 切换后立即查询
    },
    handleSelectionChange: function handleSelectionChange(selection) {
      // 处理选择项改变事件
      this.selected = selection;
      this.$emit('get-selected', selection);
    },
    delaySearch: _.debounce(function () {
      // 输入框输入时 采用去抖的方式 保证输入结束后再进行查询
      this.search();
    }, 500),
    search: function search() {
      // 查询事件
      var _this = this;
      var searchForm = this.searchForm;
      var searchParams = { // 预置查询参数为页数和行数
        page: this.currentPage,
        rows: this.pageSize
      };
      for (var paraKey in searchForm) {
        var para = searchForm[paraKey];
        searchParams[paraKey] = para.value;
      }
      this.loading = true; // 查询前加载loading动画
      this.ajax(this.options.url || ' pageList.html', searchParams, function (data) {
        _this.options.tableData = data; // 取到列表数据
        _this.convertedRows = _this.convertData(data.rows); // 进行结构转化
        _this.loading = false; // 查询后取消loading动画
      });
    },
    reset: function reset() {
      // 重置事件
      var searchForm = this.searchForm;
      for (var paraKey in searchForm) {
        searchForm[paraKey].value = searchForm[paraKey].default || '';
      }
      this.search();
    }
  }
});

/***********************************************************************************************
 *@name   : defaultDialog
 *@desc   : 默认窗口 用于展示新增、编辑、预览等需调用页面接口的全屏页面
 *@author : shelly
 ***********************************************************************************************/
var defaultDialog = '<el-dialog class="default-dialog" :title="dialog.title" :visible="dialog.visible" size="full" :before-close="dialog.handleClose">' + '<iframe :src="dialog.src" :height="bodyHeight" width="100%" frameborder="0"></iframe>' + '</el-dialog>';

Vue.component('default-dialog', {
  template: defaultDialog,
  props: ['options'],
  computed: {
    bodyHeight: function bodyHeight() {
      return document.body.clientHeight - 54; // 由于标题头会占高54 使内容超出 因此将内容高度减去54
    },
    dialog: function dialog() {
      var dialog = { // 默认配置
        title: '操作窗口',
        visible: false,
        handleClose: this.handleClose
      };
      _.extend(dialog, this.options); // 根据传入的自定义选项 拓展默认配置
      return dialog;
    }
  },
  methods: {
    handleClose: function handleClose() {
      this.options.visible = false;
      this.$emit('refreshList'); // 由于该窗口常用于操作数据 因此在关闭时提供一个刷新事件 用于刷新父层页面的数据列表
    }
  }
});

/***********************************************************************************************
 *@name   : customDialog
 *@desc   : 自定义窗口
 *@author : shelly
 ***********************************************************************************************/
var customDialog = '<el-dialog class="custom-dialog" ref="customDialog" :title="dialog.title" :visible="dialog.visible" :size="dialog.size" :before-close="handleClose" :show-close="dialog.showClose" top="5%">' + '<div :style="styleObj">' + '<slot name="dialogContent"></slot>' + '</div>' + '<slot name="dialogFooter" ref="dialogFooter"></slot>' + '</el-dialog>';

Vue.component('custom-dialog', {
  template: customDialog,
  props: ['options'],
  data: function data() {
    return {
      styleObj: {
        overflow: 'scroll'
      }
    };
  },
  computed: {
    dialog: function dialog() {
      var dialog = { // 默认配置项
        title: '操作窗口',
        visible: false,
        size: "large",
        handleClose: this.handleClose,
        showClose: false
      };
      _.extend(dialog, this.options); // 根据传入的自定义选项 拓展默认配置
      if (dialog.size === 'large') {
        // 为保证大窗口能自适应屏幕 将窗口内容区域的高度首先减去上下各5% 并减去头尾部的150px占高
        this.styleObj.maxHeight = 0.9 * document.body.clientHeight - 120 + 'px';
      }
      return dialog;
    }
  },
  methods: {
    handleClose: function handleClose() {
      this.options.visible = false;
    }
  }
});

/***********************************************************************************************
 *@name   : ccTableCell
 *@desc   : 数据列表单元格数据呈现
 *@author : Yeahs
 ***********************************************************************************************/
var ccTableCell = '<div class="cc-table-cell">' + '<p v-if="!type || type === \'text\'">' + '{{value | formatter(formatter, row)}}' + '</p>' + '<a href="#" v-else-if="type === \'link\'" @click="itemClick">' + '{{value | formatter(formatter, row)}}' + '</a>' + '<img :src="value" v-else="type === \'image\'" referrerpolicy="no-referrer">' + '</div>';
Vue.component('cc-table-cell', {
  template: ccTableCell,
  props: ['row', 'type', 'formatter', 'value', 'clickHandle'],
  methods: {
    itemClick: function itemClick(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.clickHandle) return this.clickHandle(this.value, this.row);
    }
  }
});

/***********************************************************************************************
 *@name   : ccTable
 *@desc   : 数据列表组件
 *@author : Yeahs
 ***********************************************************************************************/
var ccTable = '<div class="cc-table">' + '<el-table :row-key="key" border ref="table" :default-sort="defaultSort" :data="tableData" @row-click="rowClickHandle" @selection-change="handleSelectionChange" @select-all="handleAllSelectionChange" @sort-change="sortChange">' + '<el-table-column type="selection" :reserve-selection="reserveSelection || false" width="55" v-if="props && props.length != 0"></el-table-column>' + '<el-table-column v-for="item in props" :fixed="item.fixed || false" :prop="item.field" :label="item.name" :width="item.width" :sortable="sortable && (item.sort !== void 0? item.sort : \'custom\')" align="center">' + '<template scope="scope">' + '<cc-table-cell :row="scope.row" :type="item.type" :formatter="item.formatter" :value="scope.row[item.field]" :click-handle="item.handle"></cc-table-cell>' + '</template>' + '</el-table-column>' + '</el-table>' + '<el-pagination v-if="paginFlag" @size-change="sizeChangeHandle" @current-change="pageChangeHandle" :current-page="currentPage" :page-sizes="sizes" :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total">' + '</el-pagination>' + '</div>';
Vue.component('cc-table', {
  template: ccTable,
  props: ['data', 'paginShow', 'value', 'url', 'selectHandle', 'props', 'multi', 'pageSizes', 'condition', 'reserveSelection', 'sortable'],
  data: function data() {
    return {
      multiFlag: false,
      currentPage: 1,
      sizes: [],
      tableData: [],
      total: 0,
      defaultSort: {},
      key: '',
      selectedRows: [],
      paginFlag: true
    };
  },

  watch: {
    // 检测传入的条件是否发生变化，发生变化则重置currentPage以及发起search请求
    // 解耦外部组件需要调用table组件search方法
    condition: function condition(newValue, oldValue) {
      this.currentPage = 1;
      this.search();
    },
    value: function value(newValue, oldValue) {
      console.log('cc-table:', newValue);
    }
  },
  created: function created() {
    var _this2 = this;

    // 默认属性值的初始化
    this.paginFlag = this.paginShow !== void 0 ? this.paginShow : true;
    if (this.multi === void 0) this.multiFlag = false;else this.multiFlag = this.multi;
    if (this.pageSizes === void 0) {
      this.sizes = [10, 20, 30];
      this.size = 10;
    } else {
      this.sizes = this.pageSizes;
      this.size = this.pageSizes[0];
    }
    if (this.props) {
      this.key = this.key || this.props[0].field;
      this.defaultSort.prop = this.props[0].field;
      this.defaultSort.order = 'descending';
    }
    this.search().done(function () {
      _this2.tableInit();
    });
  },

  methods: {
    tableInit: function tableInit() {
      var value = this.value;
      var tableData = this.tableData;
      var len = tableData.length;
      var vLen = value.length;
      var key = this.key;
      for (var i = 0; i < vLen; i++) {
        var vItem = value[i];
        for (var j = 0; j < len; j++) {
          var item = tableData[j];
          if (item[key] === vItem[key]) {
            this.$refs.table.toggleRowSelection(vItem, true);
            break;
          }
        }
      }
    },

    // 检测是否为单选，若为单选，则在select-all以及selection-change的handle函数中进行处理
    handleSelectionChange: function handleSelectionChange(val) {
      var _this3 = this;

      var item = val[val.length - 1];
      if (this.selectHandle && !this.selectHandle(item)) {
        this.$refs.table.toggleRowSelection(item);
        return;
      }
      if (this.multiFlag) {
        this.$emit('input', val);
        return;
      }
      var len = val.length - 1;
      val.forEach(function (row, index) {
        if (index === len) return;
        _this3.$refs.table.toggleRowSelection(row, false);
      });
      this.$emit('input', val);
    },
    handleAllSelectionChange: function handleAllSelectionChange(val) {
      if (this.multiFlag) {
        this.$emit('input', val);
        return;
      }
      this.$refs.table.clearSelection();
    },

    // 点击行时响应选择交互
    rowClickHandle: function rowClickHandle(row, e, column) {
      this.$refs.table.toggleRowSelection(row);
    },
    search: function search(field, order) {
      var _this4 = this;

      if (!this.url) {
        var _data = this.data.concat([]);
        this.tableData = _data.slice(this.size * (this.currentPage - 1) + 1, this.size * this.currentPage + 1);
        return;
      }
      var data = {};
      if (this.condition) $.extend(data, this.condition);
      data.page = this.currentPage;
      data.rows = this.size;
      if (this.field !== '') {
        data.sort = field;
        data.order = order;
      }
      return this.postAjax({
        url: this.url,
        data: data
      }).done(function (res) {
        _this4.tableData = res.rows;
        _this4.total = res.total;
      });
    },
    sizeChangeHandle: function sizeChangeHandle(size) {
      this.size = size;
      if (this.paginationChange) this.paginationChange();else this.search();
    },
    pageChangeHandle: function pageChangeHandle(page) {
      this.currentPage = page;
      if (this.paginationChange) this.paginationChange();else this.search();
    },

    // 检测是否进行排序，若可排序以及有传入排序响应事件，则执行排序响应事件
    sortChange: function sortChange(_ref) {
      var column = _ref.column,
          prop = _ref.prop,
          order = _ref.order;

      this.currentPage = 1;
      var rule = '';
      if (order === 'descending') rule = order.slice(0, 4);else if (order === 'ascending') rule = order.slice(0, 3);
      this.search(prop, rule);
      return true;
    }
  }
});
/***********************************************************************************************
 *@name   : ccSearch
 *@desc   : 数据列表组件
 *@author : Yeahs
 ***********************************************************************************************/
var ccSearch = '<div class="cc-search">' + '<el-collapse value="1">' + '<el-collapse-item title="查询条件" name="1">' + '<el-form :inline="true" :model="formInline" class="search-form-inline">' + '<el-row>' + '<el-col :span="6" v-for="item in props">' + '<el-form-item :label="item.label">' + '<el-input size="small" v-if="item.type === \'text\' || !item.type" v-model="formInline[item.field]" v-on:keyup.13.native="onceChange" :placeholder="item.placeholder"></el-input>' + '<el-select size="small" v-else-if="item.type === \'select\'" v-model="formInline[item.field]" :placeholder="item.placeholder" @change="selectChange">' + '<el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value">' + '</el-option>' + '</el-select>' + '<el-date-picker v-else-if="item.type === \'date\'" size="small" v-model="formInline[item.field]" :type="item.dateType || \'datetime\'" @change="item.changeHandle || void 0" :placeholder="item.placeholder || \'选择日期\'">' + '</el-date-picker>' + '<el-cascader v-else-if="item.type === \'cascader\'" :options="item.options" @active-item-change="handleItemChange" :props="item.props"></el-cascader>' + '</el-form-item>' + '</el-col>' + '<el-col :span="6">' + '<el-button size="small" type="primary" @click="search">搜索</el-button>' + '<el-button size="small" @click="reset">重置</el-button>' + '</el-col>' + '</el-row>' + '</el-form>' + '</el-collapse-item>' + '</el-collapse>' + '</div>';
Vue.component('cc-search', {
  template: ccSearch,
  props: ['props', 'once'],
  data: function data() {
    return {
      formInline: {},
      onceFlag: null
    };
  },
  created: function created() {
    this.onceFlag = this.once !== void 0 ? this.once : true;
    var props = this.props;
    var len = props && props.length;
    var formInline = {};
    for (var i = 0; i < len; i++) {
      var item = props[i];
      formInline[item.field] = '';
    }
    this.formInline = formInline;
  },

  methods: {
    search: function search() {
      this.$emit('search', this.formInline);
    },
    reset: function reset() {
      var formInline = this.formInline;
      for (var item in formInline) {
        formInline[item] = '';
      }
      this.formInline = formInline;
      this.$emit('search', this.formInline);
    },
    selectChange: function selectChange(val) {
      var formInline = this.formInline;
      var field = '';
      for (var item in formInline) {
        if (formInline[item] === val) {
          field = item;
          break;
        }
      }
      if (this.once) this.onceChange('search', formInline);
      this.$emit('search-change', field, formInline);
    },
    onceChange: function onceChange(val) {
      if (!this.onceFlag) return;
      var formInline = this.formInline;
      this.$emit('search-change', formInline);
    }
  }
});