var ctxfolder = "/views/admin/dispatchesOutDispatches";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    //var submitFormUploadMultifile = function (url, data, callback) {
    //    var req = {
    //        url: url,
    //        method: 'POST',
    //        headers: { "Content-Type": undefined },
    //        transformRequest: angular.identity,
    //        data: data
    //    }
    //    $http(req).success(callback);
    //};
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#contentFile",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#contentFile");
            },
            data: data
        }
        $http(req).success(callback);
    };

    return {
        getItem: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetItem/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },
        insertAsync: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/InsertAsync', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/Update', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },
        //update: function (data, callback) {
        //    $http.post('/DispatchesOutDispatches/Update', data).success(callback);
        //},
        delete: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/Delete', data).success(callback);
        },
        //getAuthoringDeparment: function (data, callback) {
        //    $http.post('/OutDispatchesPending/GetAuthoringDeparment?listGroup=' + data).success(callback);
        //},


        //combobox
        getDispatches: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDispatches').success(callback);
        },
        getDocumentType: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDocumentType').success(callback);
        },
        getRoleForUser: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetRoleForUser?userId=' + data).success(callback);
        },
        getListUserInUnit: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetListUserInUnit?listGroup=' + data).success(callback);
        },
        getDoMat: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDoMat').success(callback);
        },
        getDocumentUrgency: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDocumentUrgency').success(callback);
        },
        getDocumentConfidentiality: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDocumentConfidentiality').success(callback);
        },
        getPosition: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetPosition').success(callback);
        },
        getDocumentField: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDocumentField').success(callback);
        },
        getDocumentSecurity: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetDocumentSecurity').success(callback);
        },
        getGetMothod: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetGetMethod').success(callback);
        },
        getLoadDefaultUnit: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetLoadDefaultUnit').success(callback);
        },
        getUserActive: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetUserActive').success(callback);
        },
        getListUserWithRole: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetListUserWithRole').success(callback);
        },
        getYear: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetYear').success(callback);
        },

        //detail
        getListUserInGroup: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetListUserInGroup?listGroup=' + data).success(callback);
        },
        getAllGroupUser: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetAllGroupUser').success(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetListUser').success(callback);
        },
        getActivity: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatches/GetActivity?id=' + data).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/DispatchesOutDispatches/UploadFile/', data, callback);
        },
    }
});
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});


app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
    });
    $rootScope.validationOptions = {
        rules: {
            DocumentSymbol: {
                required: true
            },
            DocumentSymbols: {
                required: true
            },
            DocumentNumber: {
                required: true,
            },
            SignUser: {
                required: true,
            },
            FromDate: {
                required: true,
            },
            UnitEditor: {
                required: true,
            },
            CreatedBy: {
                required: true,
            }
        },
        messages: {
            DocumentSymbol: {
                required: caption.DOD_VALIDATE_NUMBER_SYMBOL
            },
            DocumentSymbols: {
                required: caption.DOD_VALIDATE_SYMBOL
            },
            DocumentNumber: {
                required: caption.DOD_VALIDATE_NUMBER
            },
            SignUser: {
                required: caption.DOD_VALIDATE_SIGNER
            },
            FromDate: {
                required: caption.DOD_VALIDATE_DAY
            },
            UnitEditor: {
                required: caption.DOD_VALIDATE_UNIT
            },
            CreatedBy: {
                required: caption.DOD_VALIDATE_DRAFTERS
            }
        }
    }
    $rootScope.Modelsearch = {
        Number: '',
        DocumentSymbol: '',
        DocumentSymbols: '',
        SignUser: '',
        FromDate: '',
        ToDate: '',
        PromulgateDate: '',
        UnitEditor: '',
        Year: ''
    };
    $rootScope.Modelsearch.Year = getYearDefault();
    dataservice.getYear(function (rs) {
        $rootScope.ListYearData = rs;
    })
    dataservice.getAllGroupUser(function (rs) {
        //get unit
        $rootScope.UnitEditorDataOrderBy = [];
        var getManager = rs.find(function (element) {
            if (element.Code == "LANHDAO") return true;
        });
        for (var i = rs.length - 1; i >= 0; i--) {
            if (rs[i].Code != "LANHDAO") {
                var obj = {
                    Id: rs[i].Id,
                    Code: rs[i].Code,
                    Title: rs[i].Title,
                }
                $rootScope.UnitEditorDataOrderBy.push(obj);
            }
        }
        if (getManager) {
            var obj = {
                Id: getManager.Id,
                Code: getManager.Code,
                Title: getManager.Title,
            }
            $rootScope.UnitEditorDataOrderBy.push(obj);
        }

        //get AllgroupUser
        $rootScope.UnitEditorData = rs;
    });
    function getYearDefault() {
        var currentdate = new Date();
        var year = currentdate.getFullYear();
        return year;
    }
  
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        }).when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
        });
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
                error.insertAfter(element.parent().parent());
            } else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                error.appendTo(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
        }
    });
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');

});
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.ListUserDataAll = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DispatchesOutDispatches/JTable",
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
                d.Number = $rootScope.Modelsearch.Number;
                // d.DocumentSymbol = $scope.model.DocumentSymbol;
                d.DocumentSymbols = $rootScope.Modelsearch.DocumentSymbols;
                d.SignUser = $rootScope.Modelsearch.SignUser;
                d.PromulgateDate = $rootScope.Modelsearch.PromulgateDate;
                //  d.ToDate = $scope.model.ToDate;
                d.CreatedUser = $rootScope.Modelsearch.CreatedUser;
                d.Note = $rootScope.Modelsearch.Note;
                d.UnitEditor = $rootScope.Modelsearch.UnitEditor;
                d.Year = $rootScope.Modelsearch.Year;

            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('stateSave', true)
        .withOption('stateSaveCallback', function (settings, data) {
            sessionStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
        })
        .withOption('stateLoadCallback', function (settings) {
            if ($rootScope.savePageState) {
                return JSON.parse(sessionStorage.getItem('DataTables_' + settings.sInstance));
            } else {
                return settings.sInstance;
            }
        })
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $rootScope.savePageState = true;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $scope.selected[data.Id] = true;
                        dataservice.getItem(data.Id, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                myService.setData(rs.Object);
                                $location.path('/edit/');
                            }
                        });
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentNumber').withTitle('{{"DOD_LIST_COL_DOCUMENT_NUMBER" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbol').withTitle('Sổ/ký hiệu').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PromulgateDate').withTitle('{{"DOD_LIST_COL_PROMULGATE_DATE" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbols').withTitle('{{"DOD_LIST_COL_DOCUMENT_SYMBOLS" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentName').withTitle('Sổ văn bản').withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    return data;
    //}));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Trích yếu').withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SignUser').withTitle('{{"DOD_LIST_COL_SIGNUSER" | translate}}').withOption('sClass', 'tcenter nowrap dataTable-pr20').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"DOD_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitEditor').withTitle('{{"DOD_LIST_COL_UNIT_EDITOR" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('Trạng thái').withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    return data == "" ? "Chưa xử lý" : (data == "processing" ? "Đang xử lý" : "Hoàn thành");
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('Tác vụ').withOption('sClass', 'dataTable-pr20').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
    //    //'<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));

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
    $scope.initLoad = function () {
        dataservice.getListUser(function (rs) {
            $scope.ListUserDataAll = rs;
            $scope.ListUserData = $scope.ListUserDataAll.All;
        })
    }
    $scope.initLoad();


    $scope.add = function () {
        $location.path('/add/');
    }
    $scope.delete = function (id) {
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                var list = [];
                list.push(id);
                dataservice.delete(list, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                });
            });
    }
    $scope.deleteList = function () {
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length > 0) {
                $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_BTN_DELETE, cancel: caption.COM_CONFIRM_CANCEL})
                    .then(function () {
                        App.blockUI({
                            target: "#contentMain",
                            boxed: true,
                            message: 'loading...'
                        });
                        dataservice.delete(editItems, function (rs) {
                            if (rs) {
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                    $scope.reload();
                                }
                                App.unblockUI("#contentMain");
                            }
                        });

                    });
            } else {
                App.toastrWarning(captino.COM_VALIDATE_DELETE_RECORD);
            }
        } else {
            App.toastrWarning(caption.COM_VALIDATE_DELETE_RECORD);
        }
    }

    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    function validateNumber() {
        var number = document.getElementById('Number');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }
    setTimeout(function () {
        loadDate();
        validateNumber();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $window, dataservice, $http) {
    var fileId = 1;
    var memmberId = 1;
    $scope.model = {
        Header: {
            DocumentNumber: '',
            DocumentCode: '',
            Origanization: '',
            UnitEditor: '',
            CreatedUserId: '',
            CreatedEditor: '',
            SignUser: '',
            IsQppl: true
        },
        Detail: {
            ListFile: [],
            ListComment: [],
            ListMember: [],
            Reason: '',
            DeadLine: '',
            Coordinate: [],
            Received: []
        }
    }
    $scope.model1 = {
        Comment: '',
        Member: '',
    }
    $scope.ListSearchMember = [];
    $scope.treeData = [];
    $scope.selectAll = false;
    $scope.ListUserData1 = [];
    $scope.lengthMember = 0;
    $scope.lengthMemberSelect = 0;
    $scope.dataListSymboys = [];

    $scope.ListGroup = [];
    $scope.ListMember = [];
    $scope.ListUserDataAll = [];

    $scope.initLoad = function () {
        dataservice.getListUser(function (rs) {
            $scope.ListUserDataAll = rs;
            $scope.ListUserData1 = $scope.ListUserDataAll.All
        })
        dataservice.getLoadDefaultUnit(function (rs) {
            $scope.model.Header.CreatedUserId = rs.UserId;
        });
        dataservice.getDispatches(function (rs) {
            $scope.dispatchesData = rs;
        })
        dataservice.getPosition(function (rs) {
            $scope.PositioData = rs;
        });
        dataservice.getDocumentSecurity(function (rs) {
            $scope.DocumentSecurityData = rs;
        });
       
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }
    //combobox Sổ văn bản
    $scope.changeDocument = function (item) {
        $scope.model.Header.DocumentNumber = item.NumberCreator;
        $scope.model.Header.DocumentSymbols = item.DocumentSymbol;
        $scope.model.Header.DocumentSymbol = item.NumberCreator + "/" + ($scope.model.Header.DocumentSymbols != null ? $scope.model.Header.DocumentSymbols : "");
        if (item.TypeM == 'NQ' || item.TypeM == 'QD') {
            $scope.model.Header.SignUser = '';
            $scope.ListUserData = $scope.ListUserDataAll.NV;
        }
        else {
            $scope.model.Header.SignUser = '';
            $scope.ListUserData = $scope.ListUserDataAll.NV;
        }
        if (item.TypeM == 'CV') {
            $scope.dataListSymboys = [
                "CNT - TCKT", "CNT - TCNS",
                "CNT - KHĐT", "CNT - KTSX",
                "CNT - KDTM", "CNT - ĐMDN",
                "CNT - TTNB", "CNT - KSNB",
                "CNT - VP", "CNT - ĐTLĐ",
                "GM - CNT", "BB - CNT",
                "UQ - CNT", "HĐ - CNT",
                "GNP - CNT", "KSV - CNT",
                "TTr - CNT", "TB - CNT",
                "BC - CNT"
            ];
        } else {
            $scope.dataListSymboys = [];
        }
    }
    $scope.changeDocumentNumber = function () {
        $scope.model.Header.DocumentSymbol = $scope.model.Header.DocumentNumber + "/" + ($scope.model.Header.DocumentSymbols != null ? $scope.model.Header.DocumentSymbols : "");
    }
    $scope.changeDocumentSymbols = function () {
        $scope.model.Header.DocumentSymbol = $scope.model.Header.DocumentNumber + "/" + ($scope.model.Header.DocumentSymbols != null ? $scope.model.Header.DocumentSymbols : "");
    }

    $scope.selectUnitEditor = function (item) {
        dataservice.getListUserInUnit(item, function (rs) {
            $scope.ListUserCreatedEditor = rs;
        });
    }
    $scope.selectRole = function (item) {
        dataservice.getRoleForUser(item, function (rs) {
            $scope.model.Header.Position = rs.Code;
        });
    }
    $scope.clearSignUser = function () {
        $scope.model.Header.SignUser = '';
        $scope.model.Header.Position = '';
    }

    //groupUser
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainTree",
            boxed: true,
            message: 'loading...'
        });
        var root = {
            id: 'root',
            parent: "#",
            text: caption.DOD_TITLE_FILE_DEPARTMENT,
            state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
        }
        $scope.treeData.push(root);
        var index = 0;
        $scope.ListParent = $rootScope.UnitEditorData.filter(function (item) {
            return (item.ParentCode == null);
        });
        for (var i = 0; i < $rootScope.UnitEditorData.length; i++) {
            if ($rootScope.UnitEditorData[i].ParentCode == null) {
                var stt = $scope.ListParent.length - index;
                if (stt.toString().length == 1) {
                    stt = "0" + stt;
                }
                index = index + 1;
                var data = {
                    id: $rootScope.UnitEditorData[i].Code,
                    parent: "root",
                    text: stt + ' - ' + $rootScope.UnitEditorData[i].Title,
                    title: $rootScope.UnitEditorData[i].Title,
                    state: { selected: false, opened: true }
                }
                $scope.treeData.push(data);
            } else {
                var data = {
                    id: $rootScope.UnitEditorData[i].Code,
                    parent: $rootScope.UnitEditorData[i].ParentCode,
                    text: $rootScope.UnitEditorData[i].Title,
                    title: $rootScope.UnitEditorData[i].Title,
                    state: { selected: false, opened: false }
                }
                $scope.treeData.push(data);
            }
        }
        App.unblockUI("#contentMainTree");
    }
    $scope.selectGroupUser = function () {
        var listSelect = $("#treeDiv").jstree("get_selected", true);
        var listGroup = [];
        for (var i = 0; i < listSelect.length; i++) {
            listGroup.push(listSelect[i].id);
            //check exist group
            var checkExistGroup = $scope.ListGroup.find(function (element) {
                if (element.GroupUserCode == listSelect[i].id) return true;
            });
            if (!checkExistGroup) {
                var obj = {
                    GroupUserCode: listSelect[i].id,
                    Name: listSelect[i].original.title
                }
                $scope.ListGroup.push(obj);
                App.toastrSuccess(caption.DOD_ADD_RECEIVER + " " + obj.Name +  " " + caption.DOD_ADD_SUCCESS);
            } else {
                App.toastrError(caption.DOD_ADD_DEPARTMENT + " " + checkExistGroup.Name + " " + caption.DOD_ADD_DOCUMENT);
            }
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            $scope.ListSearchMember = result;
            $scope.lengthMember = result.length;
            $scope.selectAll = false;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.ListSearchMember = [];
        $scope.lengthMember = 0;
        $scope.selectAll = false;
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectGroupUser,
        'deselect_node': $scope.deselectGroupUser,
        //'search': $scope.searchTreeRepository,
    }
    $scope.saveUser = function (selectAll) {
        if ($scope.ListSearchMember.length == 0) {
            App.toastrError(caption.DOD_ERR_USER);
        } else {
            var listCheck = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; });
            if (listCheck.length == 0) {
                App.toastrError(caption.DOD_ERR_CHOOSE_USER);
            } else {
                if (selectAll == true) {
                    var listCheckUserMain = listCheck.filter(function (obj, index) { return obj.IsPermision; });
                    //check exist user main in group
                    if (listCheckUserMain) {
                        var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                            if (element.GroupUserCode == listCheckUserMain[0].GroupUserCode) return true;
                        });
                        if (checkExistUserMainInGroup) {
                            App.toastrError(caption.DOD_MSG_EXITS_CAREGIVER);
                            return;
                        }
                    }
                } else {
                    var count = 0;
                    for (var i = 0; i < listCheck.length; i++) {
                        //check exist user main in group
                        if (listCheck[i].IsPermision) {
                            var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                                if (element.GroupUserCode == listCheck[i].GroupUserCode) return true;
                            });
                            if (checkExistUserMainInGroup) {
                                App.toastrError(caption.DOD_MSG_EXITS_CAREGIVER);
                                return;
                            }
                        }
                        var checkExistUser = $scope.ListMember.find(function (element) {
                            if (element.UserId == listCheck[i].UserId) return true;
                        });
                        if (!checkExistUser) {
                            var obj = {
                                UserId: listCheck[i].UserId,
                                Name: listCheck[i].Name,
                                GroupUserCode: listCheck[i].GroupUserCode,
                                IsPermision: listCheck[i].IsPermision
                            }
                            $scope.ListMember.push(obj);
                            count++;
                        }
                    }
                    if (count == 0) {
                        App.toastrError(captino.DOD_ADD_CHOOSE_USER);
                    } else {
                        App.toastrSuccess(captino.DOD_ADD_USER_SUCCESS);
                    }
                }
            }
        }
    }
    $scope.removeUser = function (index) {
        $scope.ListMember.splice(index, 1);
    }
    $scope.removeGroup = function (index, id) {
        $scope.ListGroup.splice(index, 1);
    }
    $scope.selectAllUser = function (selectAll) {
        $scope.ListSearchMember.forEach(function (obj, index) {
            obj.IsChecked = selectAll;
        });
        if (selectAll) {
            $scope.lengthMemberSelect = $scope.ListSearchMember.length;
        } else {
            $scope.lengthMemberSelect = 0;
        }
    }
    $scope.clickSelectOneUser = function (item, type) {
        if (type == 1) {
            item.IsChecked = !item.IsChecked;
        }
        var lengthChecked = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; }).length;
        if ($scope.ListSearchMember.length == lengthChecked) {
            $scope.selectAll = true;
        } else {
            $scope.selectAll = false;
        }
        $scope.lengthMemberSelect = lengthChecked;
    }





    //file
    $scope.addFile = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            if ($scope.model.Header.CreatedUserId == '') {
                App.toastrError(caption.COM_VALIDATE_CHOOSE_DRAFTERS);
            } else {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                var exist = false;
                for (var i = 0; i < $scope.model.Detail.ListFile.length; i++) {
                    if ($scope.model.Detail.ListFile[i].FileName == name) {
                        exist = true;
                    }
                }
                if (exist) {
                    App.toastrError(caption.COM_MSG_FILE_EXISTS);
                } else {
                    //start else
                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                    } else {
                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                //var createdEditor = $filter('filter')($scope.ListUserData, { Id: $scope.model.Header.CreatedUserId }, true)[0];
                                $scope.file = {
                                    Id: fileId++,
                                    FileName: name,
                                    //CreatedEditor: createdEditor != null ? createdEditor.GivenName : null,
                                    User: rs.Object != null ? rs.Object.User : null,
                                    Fomart: extFile,
                                    CreatedTime: new Date(),
                                    Source: rs.Object != null ? rs.Object.Source : null
                                }
                                $scope.model.Detail.ListFile.push($scope.file);
                                App.toastrSuccess(rs.Title);
                            }
                        })
                    }
                }
                //end else
            }
        }
    }
    $scope.deleteFile = function (index) {
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                $scope.model.Detail.ListFile.splice(index, 1);
                App.toastrSuccess(caption.COM_MSG_DELETE_SUCCESS.replace('{0}',caption.COM_FILE));
            });
    }


    $scope.changeSelect = function (SelectType) {
        if (SelectType == "DocumentCode" && $scope.model.DocumentCode != "") {
            $scope.errorDocumentCode = false;
        }
        if (SelectType == "CreatedUserId" && $scope.model.Header.CreatedUserId != "") {
            $scope.errorCreatedUserId = false;
        }
        if (SelectType == "UnitEditor" && $scope.model.Header.UnitEditor != "") {
            $scope.errorUnitEditor = false;
        }
        if (SelectType == "CreatedEditor" && $scope.model.Header.CreatedEditor != "") {
            $scope.errorCreatedEditor = false;
        }
        if (SelectType == "SignUser" && $scope.model.Header.SignUser != "") {
            $scope.errorSignUser = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.Detail.ListMember = $scope.ListMember;
            $scope.model.Detail.ListGroup = $scope.ListGroup;

            $confirm({ text: caption.COM_MSG_CREAT_DOCUMENT_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    dataservice.insertAsync($scope.model, function (rs) {
                        if (rs.Error == false) {
                            App.toastrSuccess(rs.Title);
                            $rootScope.savePageState = false;
                            $location.path('/');
                        }
                        else {
                            App.toastrError(rs.Title);
                        }
                    });
                });
        }
    }

    //validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Header.DocumentCode == "") {
            $scope.errorDocumentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDocumentCode = false;
        }
        if (data.Header.CreatedUserId == "") {
            $scope.errorCreatedUserId = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedUserId = false;
        }
        if (data.Header.UnitEditor == "") {
            $scope.errorUnitEditor = true;
            mess.Status = true;
        } else {
            $scope.errorUnitEditor = false;
        }
        if (data.Header.CreatedEditor == "") {
            $scope.errorCreatedEditor = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedEditor = false;
        }
        if (data.Header.SignUser == "") {
            $scope.errorSignUser = true;
            mess.Status = true;
        } else {
            $scope.errorSignUser = false;
        }
        return mess;
    };
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var minDate = new Date();
        $("#PromulgateDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#SignDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $('#PromulgateDate').datepicker('setEndDate', minDate);
        $('#SignDate').datepicker('setEndDate', minDate);
        $('#DeadLine').datepicker('setStartDate', minDate);
    }
    function validateNumber() {
        var number = document.getElementById('DocumentNumber');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }

    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    setTimeout(function () {
        loadDate();
        validateNumber();
        loadPoper();
    }, 200);
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }

});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $routeParams, $location, $filter, $window, dataservice, myService) {
    var fileId = -1;
    var commentId = -1;
    var memberId = -1;
    $scope.model = {};
    $scope.treeData = [];

    $scope.lengthMember = 0;
    $scope.lengthMemberSelect = 0;
    $scope.dataListSymboys = [];


    $scope.ListDeleteFile = [];
    $scope.ListSearchMember = [];
    $scope.ListGroup = [];
    $scope.ListMember = [];
    $scope.ListUserData1 = [];
    $scope.ListUserDataAll = [];

    $scope.initLoad = function () {
        $scope.model = myService.getData();
        var s = "";
        dataservice.getDispatches(function (rs) {
            $scope.dispatchesData = rs;
            for (var i = 0; i < $scope.dispatchesData.length; ++i) {
                if ($scope.dispatchesData[i].Code == $scope.model.Header.DocumentCode) {
                    s = $scope.dispatchesData[i].TypeM;
                    break;
                }
            }
            if (s == 'CV') {
                $scope.dataListSymboys = [
                    "CNT - TCKT", "CNT - TCNS",
                    "CNT - KHĐT", "CNT - KTSX",
                    "CNT - KDTM", "CNT - ĐMDN",
                    "CNT - TTNB", "CNT - KSNB",
                    "CNT - VP", "CNT - ĐTLĐ",
                    "GM - CNT", "BB - CNT",
                    "UQ - CNT", "HĐ - CNT",
                    "GNP - CNT", "KSV - CNT",
                    "TTr - CNT", "TB - CNT",
                    "BC - CNT"
                ];
            } else {
                $scope.dataListSymboys = [];
            }
            dataservice.getListUser(function (rs) {
                // $scope.ListUserData = rs;
                $scope.ListUserDataAll = rs;
                //var list = [];
                //for (var i = 0; i < $scope.ListUserDataAll.LD.length; ++i)
                //    list.push($scope.ListUserDataAll.LD[i]);

                //for (var i = 0; i < $scope.ListUserDataAll.NV.length; ++i)
                //    list.push($scope.ListUserDataAll.NV[i]);
                $scope.ListUserData = $scope.ListUserDataAll.NV;
                $scope.ListUserData1 = $scope.ListUserDataAll.NV;
            })
        })

        dataservice.getListUser(function (rs) {
            // $scope.ListUserData = rs;
            $scope.ListUserDataAll = rs;
            $scope.ListUserData = $scope.ListUserDataAll.NV;
            $scope.ListUserData1 = $scope.ListUserDataAll.NV;
        })

        dataservice.getPosition(function (rs) {
            $scope.PositioData = rs;
        });

        dataservice.getDocumentSecurity(function (rs) {
            $scope.DocumentSecurityData = rs;
        });

        if ($scope.model != undefined) {
            $scope.ListGroup = $scope.model.Detail.ListGroup;
            $scope.ListMember = $scope.model.Detail.ListMember;


            if ($scope.model.Header.UnitEditor != null) {
                dataservice.getListUserInUnit($scope.model.Header.UnitEditor, function (rs) {
                    $scope.ListUserCreatedEditor = rs;
                });
            }
            dataservice.getActivity($scope.model.Header.Id, function (rs) {
                $scope.ActivityData = rs;
            })
        } else {
            $location.path('/');
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }


    $scope.changeDocument = function (item) {
        $scope.model.Header.DocumentNumber = item.NumberCreator;
        $scope.model.Header.DocumentSymbols = item.DocumentSymbol;
        $scope.model.Header.DocumentSymbol = item.NumberCreator + "/" + ($scope.model.Header.DocumentSymbols != null ? $scope.model.Header.DocumentSymbols : "");
        if (item.TypeM == 'NQ' || item.TypeM == 'QD') {
            $scope.model.Header.SignUser = '';
            $scope.ListUserData = $scope.ListUserDataAll.LD;
        }
        else {
            $scope.model.Header.SignUser = '';
            $scope.ListUserData = $scope.ListUserDataAll.NV;
        }
        if (item.TypeM == 'CV') {
            $scope.dataListSymboys = [
                "CNT - TCKT", "CNT - TCNS",
                "CNT - KHĐT", "CNT - KTSX",
                "CNT - KDTM", "CNT - ĐMDN",
                "CNT - TTNB", "CNT - KSNB",
                "CNT - VP", "CNT - ĐTLĐ",
                "GM - CNT", "BB - CNT",
                "UQ - CNT", "HĐ - CNT",
                "GNP - CNT"
            ];
        } else {
            $scope.dataListSymboys = [];
        }
    }
    $scope.changeDocumentNumber = function (number) {
        if ($scope.model.Header.DocumentSymbol != '') {
            var documentSymboy = $scope.model.Header.DocumentSymbol.split('/');
            $scope.model.Header.DocumentSymbol = number + '/' + documentSymboy[1];
        }
    }
    $scope.changeDocumentSymbols = function (symbols) {
        if ($scope.model.Header.DocumentSymbol != '') {
            var documentSymboy = $scope.model.Header.DocumentSymbol.split('/');
            $scope.model.Header.DocumentSymbol = documentSymboy[0] + '/' + symbols;
        }
    }

    $scope.selectUnitEditor = function (item) {
        $scope.model.Header.CreatedEditor = ''
        dataservice.getListUserInUnit(item, function (rs) {
            $scope.ListUserCreatedEditor = rs;
        });
    }
    $scope.selectRole = function (item) {
        dataservice.getRoleForUser(item, function (rs) {
            $scope.model.Header.Position = rs.Code;
        });
    }
    $scope.clearSignUser = function () {
        $scope.model.Header.SignUser = '';
        $scope.model.Header.Position = '';
    }


    //groupUser
    $scope.readyCB = function () {
        dataservice.getAllGroupUser(function (rs) {
            App.blockUI({
                target: "#contentMainTree",
                boxed: true,
                message: 'loading...'
            });
            var root = {
                id: 'root',
                parent: "#",
                text: caption.DOD_TITLE_FILE_DEPARTMENT,
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            var index = 0;
            $scope.ListParent = rs.filter(function (item) {
                return (item.ParentCode == null);
            });
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].ParentCode == null) {
                    var stt = $scope.ListParent.length - index;
                    if (stt.toString().length == 1) {
                        stt = "0" + stt;
                    }
                    index = index + 1;
                    var data = {
                        id: rs[i].Code,
                        parent: "root",
                        text: stt + ' - ' + rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: rs[i].Code,
                        parent: rs[i].ParentCode,
                        text: rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: false }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainTree");
        });
    }
    $scope.selectGroupUser = function () {
        var listSelect = $("#treeDiv").jstree("get_selected", true);
        var listGroup = [];
        for (var i = 0; i < listSelect.length; i++) {
            listGroup.push(listSelect[i].id);
            //check exist group
            var checkExistGroup = $scope.ListGroup.find(function (element) {
                if (element.GroupUserCode == listSelect[i].id) return true;
            });
            if (!checkExistGroup) {
                var obj = {
                    GroupUserCode: listSelect[i].id,
                    Name: listSelect[i].original.title,
                    IsShow: true
                }
                $scope.ListGroup.push(obj);
                App.toastrSuccess(caption.DOD_ADD_RECEIVER + " " + obj.Name + " " + caption.DOD_ADD_SUCCESS);
            } else {
                App.toastrError(caption.DOD_ADD_DEPARTMENT + " " + checkExistGroup.Name + " " + captino.DOD_ADD_DOCUMENT);
            }
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            $scope.ListSearchMember = result;
            $scope.lengthMember = result.length;
            $scope.selectAll = false;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.ListSearchMember = [];
        $scope.lengthMember = 0;
        $scope.selectAll = false;
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectGroupUser,
        'deselect_node': $scope.deselectGroupUser,
        //'search': $scope.searchTreeRepository,
    }
    $scope.saveUser = function (selectAll) {
        if ($scope.ListSearchMember.length == 0) {
            App.toastrError(caption.DOD_ERR_USER);
        } else {
            var listCheck = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; });
            if (listCheck.length == 0) {
                App.toastrError(caption.DOD_ERR_CHOOSE_USER);
            } else {
                if (selectAll == true) {
                    var listCheckUserMain = listCheck.filter(function (obj, index) { return obj.IsPermision; });
                    //check exist user main in group
                    if (listCheckUserMain) {
                        var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                            if (element.GroupUserCode == listCheckUserMain[0].GroupUserCode) return true;
                        });
                        if (checkExistUserMainInGroup) {
                            App.toastrError(caption.DOD_MSG_EXITS_CAREGIVER);
                            return;
                        }
                    }
                } else {
                    var count = 0;
                    for (var i = 0; i < listCheck.length; i++) {
                        //check exist user main in group
                        if (listCheck[i].IsPermision) {
                            var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                                if (element.GroupUserCode == listCheck[i].GroupUserCode) return true;
                            });
                            if (checkExistUserMainInGroup) {
                                App.toastrError(caption.DOD_MSG_EXITS_CAREGIVER);
                                return;
                            }
                        }
                        var checkExistUser = $scope.ListMember.find(function (element) {
                            if (element.UserId == listCheck[i].UserId) return true;
                        });
                        if (!checkExistUser) {
                            var obj = {
                                UserId: listCheck[i].UserId,
                                Name: listCheck[i].Name,
                                GroupUserCode: listCheck[i].GroupUserCode,
                                IsPermision: listCheck[i].IsPermision,
                                IsShowDelete: true
                            }
                            $scope.ListMember.push(obj);
                            count++;
                        }
                    }
                    if (count == 0) {
                        App.toastrError(caption.DOD_ADD_CHOOSE_USER);
                    } else {
                        App.toastrSuccess(caption.DOD_ADD_USER_SUCCESS);
                    }
                }
            }
        }
    }
    $scope.removeUser = function (index) {
        $scope.ListMember.splice(index, 1);
    }
    $scope.removeGroup = function (index, id) {
        $scope.ListGroup.splice(index, 1);
    }
    $scope.selectAllUser = function (selectAll) {
        $scope.ListSearchMember.forEach(function (obj, index) {
            obj.IsChecked = selectAll;
        });
        if (selectAll) {
            $scope.lengthMemberSelect = $scope.ListSearchMember.length;
        } else {
            $scope.lengthMemberSelect = 0;
        }
    }
    $scope.clickSelectOneUser = function (item, type) {
        if (type == 1) {
            item.IsChecked = !item.IsChecked;
        }
        var lengthChecked = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; }).length;
        if ($scope.ListSearchMember.length == lengthChecked) {
            $scope.selectAll = true;
        } else {
            $scope.selectAll = false;
        }
        $scope.lengthMemberSelect = lengthChecked;
    }


    //file
    $scope.addFile = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            if ($scope.model.Header.CreatedUserId == '') {
                App.toastrError(caption.COM_VALIDATE_CHOOSE_DRAFTERS);
            } else {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                var exist = false;
                for (var i = 0; i < $scope.model.Detail.ListFile.length; i++) {
                    if ($scope.model.Detail.ListFile[i].FileName == name) {
                        exist = true;
                    }
                }
                if (exist) {
                    App.toastrError(caption.COM_MSG_FILE_EXISTS);
                } else {
                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                    } else {
                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                $scope.file = {
                                    Id: fileId--,
                                    FileName: name,
                                    User: rs.Object != null ? rs.Object.User : null,
                                    Fomart: extFile,
                                    CreatedTime: new Date(),
                                    IsShowDelete: true,
                                    Source: rs.Object != null ? rs.Object.Source : null
                                }
                                $scope.model.Detail.ListFile.push($scope.file);
                                App.toastrSuccess(rs.Title);
                            }
                        })
                    }
                }
            }
        }
    }
    $scope.deleteFile = function (index, id) {
        $confirm({ text: caption.COM_MSG_DELETE_CONFIRM_COM, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                $scope.model.Detail.ListFile.splice(index, 1);
                if (id > 0) {
                    $scope.ListDeleteFile.push(id);
                }
                App.toastrSuccess(caption.COM_MSG_DELETE_SUCCESS.replace('{0}', caption.COM_FILE));
            });
    }

    //submit
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "DocumentCode" && $scope.model.DocumentCode != "") {
            $scope.errorDocumentCode = false;
        }
        if (SelectType == "CreatedUserId" && $scope.model.Header.CreatedUserId != "") {
            $scope.errorCreatedUserId = false;
        }
        if (SelectType == "UnitEditor" && $scope.model.Header.UnitEditor != "") {
            $scope.errorUnitEditor = false;
        }
        if (SelectType == "CreatedEditor" && $scope.model.Header.CreatedEditor != "") {
            $scope.errorCreatedEditor = false;
        }
        if (SelectType == "SignUser" && $scope.model.Header.SignUser != "") {
            $scope.errorSignUser = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.Detail.ListDeleteFile = $scope.ListDeleteFile;
            $confirm({ text: caption.DOD_MSG_UPDATE_DOCUMENT, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    dataservice.update($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $location.path('/');
                        }
                    });
                });
        }
    }

    //view file online
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }


    //validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Header.DocumentCode == "") {
            $scope.errorDocumentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDocumentCode = false;
        }
        if (data.Header.CreatedUserId == "") {
            $scope.errorCreatedUserId = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedUserId = false;
        }
        if (data.Header.UnitEditor == "") {
            $scope.errorUnitEditor = true;
            mess.Status = true;
        } else {
            $scope.errorUnitEditor = false;
        }
        if (data.Header.CreatedEditor == "") {
            $scope.errorCreatedEditor = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedEditor = false;
        }
        if (data.Header.SignUser == "") {
            $scope.errorSignUser = true;
            mess.Status = true;
        } else {
            $scope.errorSignUser = false;
        }
        return mess;
    };
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        var minDate = new Date();
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#PromulgateDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#SignDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $('#FromDate').datepicker('setEndDate', minDate);
        $('#SignDate').datepicker('setEndDate', minDate);
        $('#PromulgateDate').datepicker('setEndDate', minDate);

        $('#DeadLine').datepicker('setStartDate', minDate);
    }
    function validateNumber() {
        var number = document.getElementById('DocumentNumber');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }


    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    setTimeout(function () {
        loadDate();
        validateNumber();
        loadPoper();
    }, 200);
});
app.controller('pdfViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataservice, $filter) {

    // PDFObject.embed(para, "#example1");
    var url_string = window.location.href;
    //console.log('url: ' + url_string);
    //var url = new URL(url_string);
    //console.log(url.toString());
    //var c = url.searchParams.get("source");
    //console.log('source: '+c);
    var index = url_string.indexOf("source=");
    var length = url_string.length;
    var res = url_string.substring(index + 7);
    var source = res.replace("%2F", "/");
    source = source.replace("%3D", "=");
    PDFObject.embed(source, "#example1");
});
