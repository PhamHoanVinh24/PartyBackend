var ctxfolder = "/views/admin/salaryScale";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUploadFile = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getListPayScale: function (callback) {
            $http.get('/Admin/SalaryScale/GetListPayScale').then(callback);
        },
        getListPayScale2: function (callback) {
            $http.get('/Admin/SalaryScale/GetListPayScale2').then(callback);
        },
        getPayScaleCat: function (callback) {
            $http.get('/Admin/SalaryScale/GetPayScaleCat').then(callback);
        },
        getListUnit: function (callback) {
            $http.get('/Admin/SalaryScale/GetListUnit').then(callback);
        },
        insertPayScale: function (data,callback) {
            $http.post('/Admin/SalaryScale/InsertPayScale/',data).then(callback);
        },
        insertPayScaleDetail: function (data, callback) {
            $http.post('/Admin/SalaryScale/InsertPayScaleDetail/', data).then(callback);
        },
        updatePayScale: function (data, callback) {
            $http.post('/Admin/SalaryScale/UpdatePayScale/', data).then(callback);
        },
        deletePayScale: function (data, callback) {
            $http.post('/Admin/SalaryScale/DeletePayScale/', data).then(callback);
        },
        getItemPayScale: function (data, callback) {
            $http.get('/Admin/SalaryScale/GetItemPayScale?id=' + data).then(callback);
        },
        getItemPayScale2: function (data, callback) {
            $http.get('/Admin/SalaryScale/GetItemPayScale2?code=' + data).then(callback);
        },
        updatePayScaleDetail: function (data, callback) {
            $http.post('/Admin/SalaryScale/UpdatePayScaleDetail/', data).then(callback);
        },
        deletePayScaleDetail: function (data, callback) {
            $http.post('/Admin/SalaryScale/DeletePayScaleDetail/', data).then(callback);
        },
        deletePayScaleAll: function (data, callback) {
            $http.post('/Admin/SalaryScale/DeletePayScaleAll?Code='+ data).then(callback);
        },
        getItemPayScaleDetail: function (data, callback) {
            $http.get('/Admin/SalaryScale/GetItemPayScaleDetail?id=' + data).then(callback);
        },
        getListNameJob: function ( callback) {
            $http.get('/Admin/SalaryScale/GetListNameJob').then(callback);
        },
        searchPayScale: function (data,  callback) {
            $http.post('/Admin/SalaryScale/SearchPayScale/', data).then(callback);
        },
        getListPayCareer: function (callback) {
            $http.post('/Admin/SalaryScale/GetListPayCareer').then(callback);
        },
        getListPayTitle: function (callback) {
            $http.post('/Admin/SalaryScale/GetListPayTitle').then(callback);
        },
        getListPayCertificate: function (callback) {
            $http.post('/Admin/SalaryScale/GetListPayCertificate').then(callback);
        },
        getListPayMajor: function (callback) {
            $http.post('/Admin/SalaryScale/GetListPayMajor').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternNumber = /^\d+$/;
            //var partternPremiumTerm = /^\d+(\+)?/
            //var partternFloat = /^-?\d*(\.\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.Code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Mã sổ bao gồm chữ cái và số và không bao gồm ký tự đặc biệt", "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                PayScaleCode: {
                    required: true
                },
                PayBase: {
                    required: true,
                },
                Ranges: {
                    required: true,
                },
                

            },
            messages: {
                PayScaleCode: {
                    required: "Mã thang lương không được bỏ trống"
                },
                PayBase: {
                    required: "Mức lương cơ bản không được bỏ trống"
                },
                Ranges: {
                    required: "Bậc lương không được để trống"
                },
                
            }
        }
        $rootScope.IsTranslate = true;
    });
 
});

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/SalaryScale/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
        })

    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
            $(element).closest('.form-input').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
            $(element).closest('.input-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
            label.closest('.input-group').removeClass('has-error');
        }
    });
});

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, $location, DTColumnBuilder, DTInstances, dataservice,  $filter, myService) {
    
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
        Year: '',
    };
    $scope.model = {
        PayScaleCode: '',
        PayBase: '',
        Unit: '',
        Ranges:''
    };
    $rootScope.PayScaleCode = "";
  
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    $scope.headerCompiledSalary = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Document/jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Name = $scope.model.Name;
                d.Year = $scope.model.Year;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(100)
        .withOption('order', [2, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledSalary) {
                $scope.headerCompiledSalary = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('ID').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"SALARYS_WAGE" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"SALARYS_LEVEL" | translate}} 1/ {{"SALARYS_COEFFICIENT" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumberCreator').withTitle('{{"SALARYS_LEVEL" | translate}} 2/ {{"SALARYS_COEFFICIENT" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('Thao tác').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<a ng-click="editPayScale(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25"></i></a>' +
            '<a title="Xoá" ng-click="deletePayScale(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    var pivot = (function () {

        var SortedSet = (function () {

            function find(val, array, comparator) {
                var l = 0;
                var r = array.length - 1;
                var i;
                var compare;
                while (l <= r) {
                    i = ((l + r) / 2) | 0;
                    compare = comparator(array[i], val);
                    if (compare <0) {
                        l = i + 1;
                        continue;
                    }
                    if (compare > 0) {
                        r = i - 1;
                        continue;
                    }
                    return i;
                }
                return null;
            }

            var concat = (function () {
                var a = [];
                var c = a.concat;
                function concat() {
                    return c.apply(a, arguments);
                }
                return concat;
            }());


            function insert(value, comparator, values) {
                var r = values.length - 1;
                if (r === -1) {
                    return [value];
                }
                var l = 0;
                var i, compare;
                while (l <= r) {
                    i = ((l + r) / 2) | 0;
                    compare = comparator(values[i], value);
                    if (compare < 0) {
                        //array[i] is less than our value
                        l = i + 1;

                    } else if (compare > 0) {
                        r = i - 1;
                    } else {
                        //already here
                        return values;
                    }
                }
                if (comparator(values[i], value) < 0) {
                    //insert after i
                    return concat(values.slice(0, i + 1), [value], values.slice(i + 1));
                } else {
                    //insert before i

                    return concat(values.slice(0, i), [value], values.slice(i));
                }
            }

            function SortedSet(comparator) {
                this.comparator = comparator;
                this.values = [];
            }

            SortedSet.prototype.insert = function (value) {
                this.values = insert(value, this.comparator, this.values);
            };

            SortedSet.prototype.indexOf = function (value) {
                return find(value, this.values, this.comparator);
            };

            SortedSet.prototype.size = function () {
                return this.values.length;
            };

            return SortedSet;
        }());

        var Utils = {
            copyProperties: function (source, dest) {
                for (var k in source) {
                    if (source.hasOwnProperty(k)) {
                        dest[k] = source[k];
                    }
                }
            },
            isArray: function (testObject) {
                return testObject && !(testObject.propertyIsEnumerable('length'))
                    && typeof testObject === 'object' && typeof testObject.length === 'number';
            },
            stringComparator: function (a, b) {
                return a.localeCompare(b);
            },
            numberComparator: function (a, b) {
                if (a > b) {
                    return 1;
                } else if (b > a) {
                    return -1;
                } else {
                    return 0;
                }
            },
            defaultComparator: function () {
                return 0;
            },
            makeComparator: function (fields, data, comparators) {
                var len = fields.length;
                var i;
                var c = [];
                for (i = 0; i < len; i++) {
                    var entry = data[0][fields[i]];
                    var entryType = typeof entry;
                    if (typeof comparators[fields[i]] === 'function') {
                        c[i] = comparators[fields[i]];
                    } else if (entryType === 'number') {
                        c[i] = this.numberComparator;
                    } else if (entryType === 'string') {
                        c[i] = this.stringComparator;
                    } else if (Utils.isArray(entry)) {
                        c[i] = this.defaultComparator;
                    } else {
                        c[i] = this.defaultComparator;
                    }
                }
                return function (a, b) {
                    var v = 0;
                    for (i = 0; i < len; i++) {
                        var field = fields[i];
                        v = c[i](a[field], b[field]);
                        if (v !== 0) {
                            return v;
                        }
                    }
                    return 0;
                }
            }
        };

        var pivot = (function () {

            var defaultOptions = {
                extractor: null,
                comparators: {}
            };

            function extractData(data, options) {
                var extractor = options.extractor;
                if (typeof extractor === 'function') {
                    var extracted = [];
                    var length = data.length;
                    for (var i = 0; i < length; i++) {
                        extracted = extracted.concat(extractor(data[i]));
                    }
                    return extracted;
                } else {
                    return data;
                }
            }

            function buildPivotResult(data, leftSet, topSet) {
                var len = data.length;
                var dat;
                var i;
                for (i = 0; i < len; i++) {
                    dat = data[i];
                    leftSet.insert(dat);
                    topSet.insert(dat);
                }

                var result = [];
                result.length = leftSet.size();

                for (i = 0; i < len; i++) {
                    dat = data[i];
                    var rowIndex = leftSet.indexOf(dat);
                    var colIndex = topSet.indexOf(dat);
                    var row = result[rowIndex];
                    if (row === undefined) {
                        row = [];
                        row.length = topSet.size();
                        result[rowIndex] = row;
                    }
                    var entry = row[colIndex];
                    if (entry === undefined) {
                        row[colIndex] = [dat];
                    } else {
                        entry.push(dat);
                    }
                }
                return result;
            }

            function makeHeaders(data, fieldNames) {
                var result = [];
                var dataLength = data.length;
                var namesLength = fieldNames.length;
                var i, j;
                for (i = 0; i < dataLength; i++) {
                    var datum = data[i];
                    var entry = [];
                    for (j = 0; j < namesLength; j++) {
                        entry[j] = datum[fieldNames[j]];
                    }
                    result[i] = entry;
                }
                return result;
            }

            function pivotData(data, rowNames, columnNames, userOptions) {
                if (userOptions === undefined) {
                    userOptions = {};
                }
                var options = {};
                Utils.copyProperties(defaultOptions, options);
                if (userOptions) {
                    Utils.copyProperties(userOptions, options);
                }

                var leftSet = new SortedSet(Utils.makeComparator(rowNames, data, options));
                var topSet = new SortedSet(Utils.makeComparator(columnNames, data, options));

                data = extractData(data, options);

                var result = buildPivotResult(data, leftSet, topSet);
                result.rowHeaders = makeHeaders(leftSet.values, rowNames);
                result.columnHeaders = makeHeaders(topSet.values, columnNames);
                return result;
            }

            return pivotData;
        }());

        return pivot;
    }());

    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };


    $scope.initLoad = function () {
        var currentdate = new Date();
        $scope.model.Year = currentdate.getFullYear();
        var count = [];
        dataservice.getListPayScale2(function (rs) {
            rs = rs.data;
            for (var i = 0; i < rs.length; i++) {
                count.push(rs[i].length);
            }
            $scope.dem = count;
            dataservice.getListPayScale(function (rs) {
                rs = rs.data;
                $scope.lstScale = rs;
                $scope.lstRanges = removeDuplicate($scope.lstScale);
                $scope.lstRanges.sort();

                var arr = [];

                var result = pivot(rs, ['PayScaleCode'], [''], {});
                var max = Math.max(...$scope.dem);
                $scope.max = max;
                $scope.result = result;
                var ar = [];
                for (var i = 0; i < result.length; i++) {
                    var obj = {
                        PayScaleCode: '',
                        PayBase: [],
                        Salary: [],
                        Postfix: [],
                    }
                    var t = result[i];
                    for (var j = 0; j < t.length; j++) {
                        if (t[j] != undefined) {
                            var u = t[j];
                            obj.PayScaleCode = u[0].PayScaleCode;
                            obj.Salary.length = $scope.lstRanges.length;
                            for (var x = 0; x < $scope.lstRanges.length; x++) {
                                var index = -1;
                                var isDuplicate = false;
                                for (var y = 0; y < u.length; y++) {
                                    if (u[y].Ranges == $scope.lstRanges[x]) {
                                        if (index == -1) {
                                            index = y;
                                        }
                                        else if (u[index].Salary != u[y].Salary) {
                                            isDuplicate = true;
                                            break;
                                        }
                                    }
                                }
                                if (index != -1) {
                                    obj.Salary[x] = u[index].Salary;
                                    obj.Postfix[x] = isDuplicate ? '...' : '';
                                }
                            }
                        }
                        if (t[j] == undefined) {
                            obj.Salary.push("");
                        }
                    }
                    arr.push(obj);


                }
                $scope.arr = arr;
              /*  ar.sort(function (a, b) { return a - b });
                $scope.ullll = Array.from(new Set(ar));*/

                for (var i = 0; i < arr.length ; i++) {
                    for (var j = 0; j < max; j++) {
                        if (arr[i].Salary.length < max) {
                            arr[i].Salary.push("0");
                        }
                    }
                }

                dataservice.getListNameJob(function (rs) {
                    rs = rs.data;
                    for (var i = 0; i < rs.length; i++) {
                        for (var j = 0; j < $scope.arr.length; j++) {
                            if ($scope.arr[j].PayScaleCode == rs[i].PayScaleCode) {
                                $scope.arr[j].PayBase.push(rs[i].CareerCode);
                            }
                        }
                    }

                })

            })
        })
        
        dataservice.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;
          
        })
    }
    $scope.showindex = true;
    $scope.showsearch = false;
    $scope.initLoad();
    $scope.searchpayScale = function () {
        if ($scope.model.PayScaleCode != "") {
            dataservice.searchPayScale($scope.model, function (rst) {
                rst = rst.data;
                
                if (rst.length == 0) {
                    App.toastrError("Không có bản ghi tồn tại");
                }
                else {
                    $scope.lstScale = rst;
                    $scope.lstRanges = removeDuplicate($scope.lstScale);
                    $scope.lstRanges.sort();

                    var arrt = [];
                    var obj = {
                        PayScaleCode: '',
                        PayBase: '',
                        Salary: [],
                        Coeff: [],
                        Postfix: []
                    }
                    obj.Salary.length = $scope.lstRanges.length;
                    obj.PayBase.length = $scope.lstRanges.length;
                    obj.Coeff.length = $scope.lstRanges.length;
                    obj.PayScaleCode = rst[0].PayScaleCode;
                    obj.PayBase = rst[0].PayBase;
                    for (var j = 0; j < $scope.lstRanges.length; j++) {
                        var index = -1;
                        var isDuplicate = false;
                        for (var i = 0; i < rst.length; i++) {
                            if (rst[i].Ranges == $scope.lstRanges[j]) {
                                if (index == -1) {
                                    index = i;
                                }
                                else if (rst[index].Salary != rst[i].Salary) {
                                    isDuplicate = true;
                                    break;
                                }
                            }
                        }
                        if (index != -1) {
                            obj.Salary[j] = rst[index].Salary;
                            obj.Coeff[j] = rst[index].Coeff;
                            obj.Postfix[j] = isDuplicate ? '...' : '';
                        }
                    }
                    //obj.Salary.sort(function (a, b) { return a - b });
                    //obj.Coeff.sort(function (a, b) { return a - b });
                    arrt.push(obj);
                    $scope.max2 = rst.length;
                    $scope.arrt = arrt;
                    $scope.showindex = false;
                    $scope.showsearch = true;
                }
            })
        }

        if ($scope.model.PayScaleCode == "" && $scope.model.Ranges != "") {
            var count = [];
            dataservice.getListPayScale2(function (rs) {
                rs = rs.data;
                for (var i = 0; i < rs.length; i++) {
                    count.push(rs[i].length);
                }
                $scope.dem = count;
                dataservice.searchPayScale($scope.model, function (rst) {
                    rst = rst.data;
                    if (rst.length == 0) {
                        App.toastrError("Không có bản ghi tồn tại");
                    }
                    else {
                        $scope.lstScale = rst;
                        $scope.lstRanges = removeDuplicate($scope.lstScale);
                        $scope.lstRanges.sort();
                        var arrt = [];

                        var result = pivot(rst, ['PayScaleCode'], [''], {});
                        var max = Math.max(...$scope.dem);
                        $scope.max2 = max;
                        $scope.result = result;

                        for (var i = 0; i < result.length; i++) {
                            var obj = {
                                PayScaleCode: '',
                                PayBase: [],
                                Salary: [],
                                Coeff: [],
                                Postfix: [],
                            }
                            var t = result[i];
                            for (var j = 0; j < t.length; j++) {
                                if (t[j] != undefined) {
                                    var u = t[j];
                                    obj.PayScaleCode = u[0].PayScaleCode;
                                    obj.Salary.length = $scope.lstRanges.length;
                                    obj.Coeff.length = $scope.lstRanges.length;
                                    for (var x = 0; x < $scope.lstRanges.length; x++) {
                                        var index = -1;
                                        var isDuplicate = false;
                                        for (var y = 0; y < u.length; y++) {
                                            if (u[y].Ranges == $scope.lstRanges[x]) {
                                                if (index == -1) {
                                                    index = y;
                                                }
                                                else if (u[index].Salary != u[y].Salary) {
                                                    isDuplicate = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (index != -1) {
                                            obj.Salary[x] = u[index].Salary;
                                            obj.Coeff[x] = u[index].Coeff;
                                            obj.Postfix[x] = isDuplicate ? '...' : '';
                                        }
                                    }
                                }
                                if (t[j] == undefined) {
                                    obj.Salary.push("");
                                    obj.Coeff.push("");
                                }
                            }
                            arrt.push(obj);
                        }
                        //obj.Salary.sort(function (a, b) { return a - b });
                        //obj.Coeff.sort(function (a, b) { return a - b });
                        $scope.arrt = arrt;
                        $scope.showindex = false;
                        $scope.showsearch = true;
                    }
                })
            })
        }
        if ($scope.model.PayScaleCode == "" && $scope.model.Ranges == "") {
            var count = [];
            dataservice.getListPayScale2(function (rs) {
                rs = rs.data;
                for (var i = 0; i < rs.length; i++) {
                    count.push(rs[i].length);
                }
                $scope.dem = count;
                dataservice.getListPayScale(function (rs) {
                    rs = rs.data;
                    $scope.lstScale = rs;
                    $scope.lstRanges = removeDuplicate($scope.lstScale);
                    $scope.lstRanges.sort();

                    var arr = [];

                    var result = pivot(rs, ['PayScaleCode'], [''], {});
                    var max = Math.max(...$scope.dem);
                    $scope.max2 = max;
                    $scope.result = result;
                    var ar = [];
                    for (var i = 0; i < result.length; i++) {
                        var obj = {
                            PayScaleCode: '',
                            PayBase: [],
                            Salary: [],
                            Coeff: [],
                            Postfix: [],
                        }
                        var t = result[i];
                        for (var j = 0; j < t.length; j++) {
                            if (t[j] != undefined) {
                                var u = t[j];
                                obj.PayScaleCode = u[0].PayScaleCode;
                                obj.Salary.length = $scope.lstRanges.length;
                                obj.Coeff.length = $scope.lstRanges.length;
                                for (var x = 0; x < $scope.lstRanges.length; x++) {
                                    var index = -1;
                                    var isDuplicate = false;
                                    for (var y = 0; y < u.length; y++) {
                                        if (u[y].Ranges == $scope.lstRanges[x]) {
                                            if (index == -1) {
                                                index = y;
                                            }
                                            else if (u[index].Salary != u[y].Salary) {
                                                isDuplicate = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (index != -1) {
                                        obj.Salary[x] = u[index].Salary;
                                        obj.Coeff[x] = u[index].Coeff;
                                        obj.Postfix[x] = isDuplicate ? '...' : '';
                                    }
                                }
                            }
                            if (t[j] == undefined) {
                                obj.Salary.push("");
                                obj.Coeff.push("");
                            }
                        }
                        arr.push(obj);


                    }
                    $scope.arrt = arr;
                    /*  ar.sort(function (a, b) { return a - b });
                      $scope.ullll = Array.from(new Set(ar));*/

                    for (var i = 0; i < arr.length; i++) {
                        for (var j = 0; j < max; j++) {
                            if (arr[i].Salary.length < max) {
                                arr[i].Salary.push("0");
                            }
                        }
                    }
                    
/*
                    dataservice.getListNameJob(function (rs) {
                        rs = rs.data;
                        for (var i = 0; i < rs.length; i++) {
                            for (var j = 0; j < $scope.arr.length; j++) {
                                if ($scope.arr[j].PayScaleCode == rs[i].PayScaleCode) {
                                    $scope.arr[j].PayBase.push(rs[i].CareerCode);
                                }
                            }
                        }

                    })*/

                })
            })
        }
        
    }
    $scope.add = function () {
       /* dataservice.getItem(Id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add.html',
                controller: 'add',
                backdrop: 'static',
                size: '80',
                resolve: {
                    para: function () {

                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });*/
   /*     $scope.showindex = true;
        $scope.showsearch = false;*/
       /* var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return "";
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });*/
        $rootScope.PayScaleCode = "";
        $location.path("/add");
    }
    $scope.showdetail = function (data) {

       /* $scope.showindex = true;
        $scope.showsearch = false;*/
  /*      var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });*/
        $rootScope.PayScaleCode = data;
        $location.path("/add");
        /*modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });*/
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.edit = function (Id) {
        dataservice.getItem(Id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '80',
                resolve: {
                    para: function () {
                        
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });
    }
    $scope.deletePayScaleAll = function (code) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePayScaleAll(code, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            location.href = "#";
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () {
        });
    };

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i] == itm.Ranges) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm.Ranges);
            }
        }
        return res;
    }
});

app.controller('add', function ($scope, $location, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, $uibModal, $confirm, dataservice, $filter, myService) {
    $scope.modelp = {
        PayScaleCode: '',
        PayBase: '',
        Unit: '',
        CareerCode: '',
        CareerTitle: '',
        Certificate: '',
        Major: '',
    };

    $scope.modelScaleDetail = {
        Salary: '',
        ScaleCode: '',
        CareerCode: '',
        Ranges: '',
    };

    var para = $rootScope.PayScaleCode;
    var vm = $scope;
   
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    $scope.headerCompiledSalary = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SalaryScale/Jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                
                d.PayScaleCode = $scope.modelp.PayScaleCode;
                d.CareerCode = $scope.modelp.CareerCode;
                d.CareerTitle = $scope.modelp.CareerTitle;
                d.Certificate = $scope.modelp.Certificate;
                d.Major = $scope.modelp.Major;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [2, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledSalary) {
                $scope.headerCompiledSalary = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
           /* contextScope.contextMenu = $scope.contextMenu;*/
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {

                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                } else {
                    $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.modelScaleDetail.ScaleCode = data.PayScaleCode;
                    $scope.modelScaleDetail.CareerCode = data.CareerCode;
                 /*   $scope.model.PayScaleCode = data.PayScaleCode;*/
                    $(".disabled-element").removeClass("disabled-element");
                    $scope.reload1();
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayScaleCode').withTitle('{{"SALARYS_WAGE" | translate}}').withOption('sClass','bold thang').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayBase').withTitle('{{"SALARYS_WAGE_BASIC" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        data = $filter('number')(data, '2');
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SALARYS_UNIT" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerName').withTitle('{{"SALARYS_JOB" | translate}}').withOption('sClass').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerTitle').withTitle('{{"SALARYS_TITLE" | translate}}').withOption('sClass').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Certificate').withTitle('{{"SALARYS_LEVEL_IM" | translate}}').withOption('sClass').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Major').withTitle('{{"SALARYS_SPECIALIZE" | translate}}').withOption('sClass').renderWith(function (data, type) {
        return data;
    }));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SALARYS_MANIPULATION" | translate}}').withOption('sClass', 'nowrap  dataTable-w80').renderWith(function (data, type, full) {
        return '<a ng-click="editPayScale(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr10"></i></a>' +
            '<a title="Xoá" ng-click="deletePayScale(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        
        reloadData(true);
    };

    $scope.cancel = function () {
        $scope.showindex = true;
        $scope.showsearch = false;
        location.href = "#";
    }
    $scope.deletePayScale = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePayScale(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reload1();
                            reloadData(true);
                            
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };
    $scope.editPayScale = function (id) {
        $scope.edit = true;
        dataservice.getItemPayScale(id, function (rs) {
            rs = rs.data;
            $scope.modelp = rs;
            /*$rootScope.PayScaleCode = rs.PayScaleCode;
            $location.path("/edit");
            */
        })
        $scope.model = {
            Id: '',
        };  
        $scope.model.Id = id;
        $scope.EditPayScale = function () {
            validationSelectPayScale($scope.modelp);
            if (!validationSelectPayScale($scope.modelp).Status) {
                dataservice.updatePayScale($scope.modelp, function (rs) {
                    
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.modelp.PayScaleCode = "";
                        $scope.modelp.CareerCode = "";
                        $scope.modelp.CareerTitle = "";
                        $scope.modelp.Certificate = "";
                        $scope.modelp.Major = "";
                        $scope.reload();
                        $scope.edit = false;
                    }

                })
            }
           


        }
    }
    $scope.cancelEditPayScale = function () {
        $scope.edit = false;
        $scope.modelp = {
            PayScaleCode: '',
            PayBase: '',
            Unit: '',
            CareerCode: '',
            CareerTitle: '',
            Certificate: '',
            Major: '',
        };
    }
    //detail grid
    //bảng ngạch lương
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SalaryScale/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ScaleCode = $scope.modelScaleDetail.ScaleCode;
                d.CareerCode = $scope.modelScaleDetail.CareerCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [2, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                } else {
                    $('#tblDataCertifi').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.modelScaleDetail.ScaleCode = data.PayScaleCode;
                    $scope.modelScaleDetail.CareerCode = data.CareerCode;
                    $(".disabled-element").removeClass("disabled-element");
                }
                $scope.$apply();
            });

        });

    vm.dtColumns1 = [];
    vm.dtColumns1.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('ScaleCode').withTitle('{{"SALARYS_WAGE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('Ranges').withTitle('{{"SALARYS_LEVEL_WAGE" | translate}}').withOption('sClass','bold text-center').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('Salary').withTitle('{{"SALARYS_WAGE_UP" | translate}}').withOption('sClass','pl10').renderWith(function (data, type) {
        data = $filter('number')(data, '0');
        return data;
    }));

    vm.dtColumns1.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SALARYS_MANIPULATION" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
        return '<a ng-click="editPayScaleDetail(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr10"></i></a>' +
            '<a title="Xoá" ng-click="deletePayScaleDetail(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }));
    vm.reloadData1 = reloadData1;
    vm.dtInstance1 = {};
    function reloadData1(resetPaging) {
        vm.dtInstance1.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData1(true);
    }
    $scope.reload1 = function () {

        reloadData1(true);
    };
    $rootScope.reload1 = function () {
        reloadData1(true);
    };
    if (para != '') {
        $scope.modelp.PayScaleCode = para;
        /*dataservice.getItemPayScale2(para, function (rs) {
            rs = rs.data;
            $scope.modelScaleDetail = rs;
            reloadData1(true);
        })*/
    }
    
    $scope.AddPayScaleDetail = function () {
        
        validationSelectPayScale($scope.modelScaleDetail);
        if ($scope.addData.validate() && !validationSelectPayScaleDetail($scope.modelScaleDetail).Status) {
            dataservice.insertPayScaleDetail($scope.modelScaleDetail, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload1();
                }

            })
        }
    }

    function validationSelectPayScaleDetail(data) {
        
        var mess = { Status: false, Title: "" }
      
        if (data.Ranges == "") {
            $scope.errorRanges = true;
            mess.Status = true;
        } else {
            $scope.errorRanges = false;
        }
        if (data.Salary == "") {
            $scope.errorSalary = true;
            mess.Status = true;
        } else {
            $scope.errorSalary = false;
        }

        return mess;
    };

    function loadDateGrades() {
        $("#fromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#toDateEnd').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#toDateEnd').datepicker('setStartDate', null);
            }
        });
        $("#toDateEnd").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#fromDate').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#fromDate').datepicker('setEndDate', null);
            }
        });;
    }
    function validateDefault(from, to) {
        setStartDate("#toDateEnd", from);
        setEndDate("#fromDate", to);
    }
    setTimeout(function () {
        loadDateGrades();
    }, 50);


    $scope.initLoad = function () {
        
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.lstUnit = rs;
        })
        dataservice.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;
        })
        dataservice.getListPayCareer(function (rs) {
            rs = rs.data;
            $scope.lstCareer = rs;
        })
        dataservice.getListPayTitle(function (rs) {
            rs = rs.data;
            $scope.lstTitle = rs;
        })
        dataservice.getListPayCertificate(function (rs) {
            rs = rs.data;
            $scope.lstCertificate = rs;
        })
        dataservice.getListPayMajor(function (rs) {
            rs = rs.data;
            $scope.lstMajor = rs;
        })
    }
    $scope.initLoad();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.editPayScaleDetail = function (id) {
        $scope.editdetail = true;
        dataservice.getItemPayScaleDetail(id, function (rs) {
            rs = rs.data;
            $scope.modelScaleDetail.ScaleCode = rs.ScaleCode;
            $scope.modelScaleDetail.CareerCode = rs.CareerCode;
            $scope.modelScaleDetail.Ranges = rs.Ranges;
            $scope.modelScaleDetail.Salary = rs.Salary;
           
        })
        $(".disabled-element").removeClass("disabled-element");
        $scope.modelScaleDetail = {
            Id: '',
        };
        $scope.modelScaleDetail.Id = id;
        $scope.EditPayScaleDetail = function () {

            if ($scope.addData.validate()) {
                $scope.modelScaleDetail.ScaleDtCode = "" + $scope.modelScaleDetail.ScaleCode + "_" + $scope.modelScaleDetail.Ranges + "_" + $scope.modelScaleDetail.Coeff + "";
                dataservice.updatePayScaleDetail($scope.modelScaleDetail, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload1();
                    }
                })
                $scope.editdetail = false;
            }
            
        }
    }
    $scope.deletePayScaleDetail = function (id) {
        dataservice.getItemPayScaleDetail(id, function (rs) {
            rs = rs.data;
            $scope.modelScaleDetail.ScaleCode = rs.ScaleCode;
            $scope.modelScaleDetail.CareerCode = rs.CareerCode;
            $scope.modelScaleDetail.Ranges = rs.Ranges;
            $scope.modelScaleDetail.Coeff = rs.Coeff;
        })
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePayScaleDetail(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $scope.reload1();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                    $scope.reload1();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () {
        });
    };
   
    $scope.AddPayScale = function () {
        
        validationSelectPayScale($scope.modelp);
        if (!validationSelectPayScale($scope.modelp).Status) {
            dataservice.insertPayScale($scope.modelp, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            })
        }
       
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
       
    }
    function validationSelectPayScale(data) {
        var mess = { Status: false, Title: "" }
        if (data.PayScaleCode == "") {
            $scope.errorPayScaleCode = true;
            mess.Status = true;
        } else {
            $scope.errorPayScaleCode = false;
        }
        if (data.CareerCode == "") {
            $scope.errorCareerCode = true;
            mess.Status = true;
        } else {
            $scope.errorCareerCode = false;
        }
        if (data.CareerTitle == "") {
            $scope.errorTitle = true;
            mess.Status = true;
        } else {
            $scope.errorTitle = false;
        }
        if (data.Certificate == "") {
            $scope.errorCertificate = true;
            mess.Status = true;
        } else {
            $scope.errorCertificate = false;
        }
        if (data.Major == "") {
            $scope.errorMajor = true;
            mess.Status = true;
        } else {
            $scope.errorMajor = false;
        }
       /* if (data.PayBase == "") {
            $scope.errorPayBase = true;
            mess.Status = true;
        } else {
            $scope.errorPayBase = false;
        }
        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }*/

        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
       
    }, 10);
});
