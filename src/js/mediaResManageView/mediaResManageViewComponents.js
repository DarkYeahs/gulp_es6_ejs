/* author:Yeahs
 *e-mail: 1550343909@qq.com
 *createTime: 2017/8/31 上午8:43:10
 */

/***********************************************************************************************
 *@name   : resourceFilter
 *@desc   : 影片筛选器
 *@author : shelly
 ***********************************************************************************************/

Vue.component('resource-filter', {
    template: '#template-resource-filter',
    props: ['options'],
    data: function () {
        var _this = this;
        return {
            searchCondition: {}, // 搜索条件
            currentSource: {}, // 当前选中的source数据
            currentCategory: {}, // 当前选中的Category数据
            directorsSearch: '', // 导演搜索字段
            actorsSearch: '', // 主演搜索字段
            areasSearch: '', // 地区搜索字段
            contentTagSearch: '', // 内容标签搜索字段
            defaultTableColumns: { // 默认的表格列表数据
                id: {
                    label: 'ID',
                    fixed: true,
                    width: '100'
                },
                title: {
                    label: '标题',
                    fixed: true,
                    width: '250'
                },
                subTitle: {
                    label: '副标题',
                    width: '200'
                },
                source: {
                    label: '内容源',
                    width: '120',
                    customFormatter: function (row, column) {
                        return _this.convertSource2Cn(column);
                    }
                },
                thumb: {
                    label: '图片',
                    width: '150',
                    customFormatter: function (row, column) {
                        return '<img src="' + column + '" referrerpolicy="no-referrer">';
                    }
                },
                videoType: {
                    label: '频道类型',
                    width: '120'
                },
                mediaType: {
                    label: '影片类型',
                    width: '200'
                },
                contentType: {
                    label: '素材类型',
                    width: '120'
                },
                payType: {
                    label: '付费类型',
                    width: '120'
                },
                videoFormat: {
                    label: '影片格式',
                    width: '200'
                },
                currentSegment: {
                    label: '综艺期数',
                    width: '120'
                },
                directors: {
                    label: '导演',
                    width: '150'
                },
                actors: {
                    label: '主演',
                    sortable: true,
                    width: '200'
                },
                publishArea: {
                    label: '地区',
                    width: '120'
                },
                publishDate: {
                    label: '年份',
                    width: '120'
                }
            },
            tableData: {},
            convertedRows: [], // 图片展示方式时的列表转换数据
            columnNum: 6, // 图片展示方式时每行的图片数量
            selected: [], // 已选项
            currentPage: 1, // 当前页
            pageSizes: [10, 20, 30], // 每页的可选大小 默认先设置为数据列表显示形式的对应值
            pageSize: 10, // 每页记录数 默认先设置为数据列表显示形式的对应值
            filterForm: {
                sources: '', // 内容源
                category: '', // 频道类型
                videoTypes: [], // 影片类型
                videoKey: '', // 关键词
                contentTypes: [], // 素材类型
                payTypes: [], // 付费类型
                directors: [], // 导演
                actors: [], // 主演
                areas: [],//地区
                videoFormat: [], // 影片格式
                yearStart: 1970, // 开始年代
                yearEnd: (new Date()).getFullYear(), // 结束年代
                synDate: '', // 同步时间
                contentTag: [], // 内容标签
                order: 'desc',//排序方式 asc:升序，desc：降序，默认降序
                orderBy: ''//排序字段
            },
            orderTip: '降序排列', // 排序按钮文字提示
            arrow: 'arrow-down', // 排序按钮图标
            isMore: false, // 是否显示更多的标识
            loading: false, // 加载动画
            activeNames: ['1']
        }
    },
    created: function () {
      this.getSearchCondition(); // 获取可能传入的初始筛选条件
    },
    mounted: function () {
        var _this = this;
        var previewType = this.options.previewType;
        if(previewType === 'picList') {
            this.pageSize = 12;
            this.pageSizes = [12, 24, 36];
            this.calColumn();
            window.onresize = _.debounce(function () { // 当窗口大小变化时 调整每行的图片列数
                _this.calColumn();
            }, 500); // 大小变化存在延时 设定500ms延时保证计算正确性
        }
    },
    computed: {
        isDisabled: function () {
            return this.options.isDisabled || [];
        },
        initCondition: function () {
            return this.options.initCondition;
        },
        dataListH: function () {
            return document.body.clientHeight - 40; // 文档高度 - 分页高度40 确保下移时当前列表刚好占满整个页面 方便查看
        }
    },
    watch: {
        filterForm: {
            handler: function (){
                this.$emit('get-filter-form', this.filterForm);
            },
            deep:true // 深度观察
        }
    },
    methods: {
        getSearchCondition: function () { // 获取查询条件
            var _this = this;
            this.ajax($basePath + '/contentSearch/getCondition.html', {}, function (data) {
                _this.searchCondition = data;
                // 若外部传入了初始值 则设置初始值
                var initCondition = _this.options.initCondition;
                if (initCondition) {
                    _.extend(_this.filterForm, initCondition);
                } else {
                    _this.filterForm.sources = _this.searchCondition.sources[0].name;
                }

                _.defer(function () {
                    if (!_this.options.preventInitSearch) {
                        _this.search();
                    }
                });
            });
        },
        changeSource: function (data) { // 内容源改变事件
            var _this = this;
            this.currentSource = _.filter(_this.searchCondition.sources, function (sourceItem) {
                return sourceItem.name === data;
            })[0];
            var initCondition = this.options.initCondition;
            if(initCondition && initCondition.category) {
                this.filterForm.category = initCondition.category;
                initCondition.category = '';
            } else {
                this.filterForm.category = '';
            }
            this.changeCategory(this.filterForm.category, true);
        },
        changeCategory: function (data, flag) { // 频道类型改变事件
            var _this = this;
            this.currentCategory = _.filter(_this.currentSource.child, function (categoryItem) {
                    return categoryItem.categoryId === data;
            })[0] || {child: []};
            var initCondition = this.options.initCondition;
            if(initCondition && initCondition.videoTypes && !flag) {
                this.filterForm.videoTypes = initCondition.videoTypes;
                initCondition.videoTypes = '';
            } else {
                this.filterForm.videoTypes = [];
            }
        },
        querySearch: function (categoryName, queryString, cb) { // 输入意见查询
            var categories = this.searchCondition[categoryName];
            var tagCategoryId = categories[0] && categories[0].tagCategoryId;
            this.ajax($basePath + '/contentSearch/getCondition.html', {
                requestCode: 1,
                tagCategoryId: tagCategoryId,
                tagName: queryString
            }, function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].value = data[i].tagCnName;
                }
                cb(data);
            });
        },
        handleSelect: function (categoryName, item, keyName) { // 处理选中输入意见事件
            var categories = this.searchCondition[categoryName];
            var c = _.filter(categories, function (category) { // 判断所选项是否已在列表中
                return category.tagId === item.tagId;
            });
            if (c.length === 0) { // 如果不在列表中则加入列表进行显示
                categories.push(item);
            }
            this.filterForm[categoryName].push(item[keyName]); // 选中该项
            var searchInput = categoryName + 'Search';
            this[searchInput] = ''; // 清空搜索框
        },
        directorQuerySearch: function (queryString, cb) { // 导演字段输入意见查询
            this.querySearch('directors', queryString, cb);
        },
        directorHandleSelect: function (item) { // 导演输入意见选择事件
            this.handleSelect('directors', item, 'tagCnName');
        },
        actorQuerySearch: function (queryString, cb) { // 主演字段输入意见
            this.querySearch('actors', queryString, cb);
        },
        actorHandleSelect: function (item) { // 主演输入意见选择事件
            this.handleSelect('actors', item, 'tagCnName');
        },
        areaQuerySearch: function (queryString, cb) { // 地区字段输入意见
            this.querySearch('areas', queryString, cb);
        },
        areaHandleSelect: function (item) { // 地区输入意见选择事件
            this.handleSelect('areas', item, 'tagCnName');
        },
        contentLabelQuerySearch: function (queryString, cb) { // 内容标签字段输入意见
            this.querySearch('contentTag', queryString, cb);
        },
        contentLabelHandleSelect: function (item) { // 内容标签输入意见选择事件
            this.handleSelect('contentTag', item, 'tagId');
        },
        showMore: function () { // 更多/收起按钮的点击事件
            this.isMore = !this.isMore;
        },
        changeSort: function () { // 修改排序按钮的点击事件
            if (this.filterForm.order === 'asc') {
                this.filterForm.order = 'desc';
                this.orderTip = '降序排列';
            } else {
                this.filterForm.order = 'asc';
                this.orderTip = '升序排列';
            }
        },
        handleSelectionChange: function (selection) { // 处理选择项改变事件
            this.selected = selection;
            this.$emit('get-selected', selection);
        },
        handleSizeChange: function (pageSize) { // 处理页面记录数改变事件
            this.pageSize = pageSize;
            this.search();
        },
        handleCurrentChange: function (currentPage) { // 处理当前页改变事件
            this.currentPage = currentPage;
            this.search();
        },
        calColumn: function () { // 为自适应屏幕 根据现有组件的所占大小进行判断 自动更新每行显示的图片数 由于element采用24进行栅格划分 因此采用4和6来进行改变
            if (this.$el.clientWidth <= 1280) { // 当组件所占大小低于等于1280时 每行显示4个
                this.columnNum = 4;
            } else { // 当组件所占大小大于1280时 每行显示4个
                this.columnNum = 6;
            }
            this.convertedRows = this.convertData(this.options.tableData.rows);
        },
        convertData: function (rows) { // 将数组转换为二维数组 便于结构遍历
            var _this = this;
            return _.toArray(_.groupBy(rows, function (num, index) {
                return Math.floor(index / _this.columnNum);
            }));
        },
        setWeight: function (source, thirdId, weight) { // 置顶/下沉数据事件
            var _this = this;
            this.ajax($basePath + '/mediaResManage/setWeight.html', {
                source: source, // 内容源
                thirdId: thirdId, // 第三方ID
                weight: weight // 权重 置顶100 下沉-100 取消 0
            }, function (data) {
                if (data.success) {
                    _this.search();
                }
                _this.$message(data.msg);
            })
        },
        clone: function (obj) {
            var _this = this;
            var o;
            switch (typeof obj) {
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
                                o.push(_this.clone(obj[i]));
                            }
                        } else {
                            o = {};
                            for (var k in obj) {
                                o[k] = _this.clone(obj[k]);
                            }
                        }
                    }
                    break;
                default:
                    o = obj;
                    break;
            }
            return o;
        },
        search: function () {
            var _this = this;
            var searchParams = this.clone(this.filterForm);
            searchParams.page = this.currentPage;
            searchParams.rows = this.pageSize;
            this.directorsSearch && searchParams.directors.push(this.directorsSearch);
            this.actorsSearch && searchParams.actors.push(this.actorsSearch);
            this.areasSearch && searchParams.areas.push(this.areasSearch);
            this.loading = true;
            this.ajax($basePath + '/mediaResManage/pageList.html', searchParams, function (data) {
                _this.options.tableData = data;
                _this.convertedRows = _this.convertData(data.rows);
                _this.loading = false;
            })
        },
        reset: function () {
            var source = this.searchCondition.sources[0];
            this.filterForm = {
                sources: source.name, // 内容源
                category: '', // 频道类型
                videoTypes: [], // 影片类型
                videoKey: '', // 关键词
                contentTypes: [], // 素材类型
                payTypes: [], // 付费类型
                directors: [], // 导演
                actors: [], // 主演
                areas: [],//地区
                videoFormat: [], // 影片格式
                yearStart: '1970', // 开始年代
                yearEnd: (new Date()).getFullYear(), // 结束年代
                synDate: '', // 同步时间
                contentTag: [], // 内容标签
                order: 'desc',//排序方式 asc:升序，desc：降序，默认降序
                orderBy: ''//排序字段
            };
            this.options.tableData = {
                rows: [],
                total: 0
            }
        }
    }
});
