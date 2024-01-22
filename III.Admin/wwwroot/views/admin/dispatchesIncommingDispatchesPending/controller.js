var ctxfolder = "/views/admin/dispatchesIncommingDispatchesPending";
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
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
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
        update: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/Update/', data, {
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


        getItem: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetItem/', data, {
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
        getYear: function (callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetYear').success(callback);
        },
        send: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/Send', data).success(callback);
        },
        watched: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/Watched/', data, {
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
        done: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/Done', data, {
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



        getUserActive: function (callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetUserActive').success(callback);
        },
        getPermisionInGroup: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetPermisionInGroup?listGroup=' + data).success(callback);
        },
        getListUserInGroup: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetListUserInGroup?listGroup=' + data).success(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetListUser').success(callback);
        },
        getAllGroupUser: function (callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetAllGroupUser').success(callback);
        },
        getActivity: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetActivity?Id=' + data).success(callback);
        },
        getUserAuthority: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/GetUserAuthority?userId=' + data).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/DispatchesIncommingDispatchesPending/UploadFile/', data, callback);
        },
        export: function (data, callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/Export', data).success(callback);

        },
        checkIsSecretary: function (callback) {
            $http.post('/Admin/DispatchesIncommingDispatchesPending/CheckIsSecretary').success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.DocumentStatus = false;
    $rootScope.RoleStatus = false;
    $rootScope.Role = "";
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                DocumentSymbol: {
                    required: true
                },
                DocumentNumber: {
                    required: true,
                }
            },
            messages: {
                DocumentSymbol: {
                    required: caption.DIDP_VALIDATE_NUMBER_SYMBOL
                },
                DocumentNumber: {
                    required: caption.DIDP_VALIDATE_NUMBER_TO
                }
            }
        }
        $rootScope.Status = [{
            Code: 'DONE',
            Name: caption.DIDP_MSG_DONE
        }, {
            Code: 'PENDING',
            Name: caption.DIDP_MSG_PENDING
        }]
        $rootScope.StatusActivity = [{
            Code: 'COORDINATED',
            Name: caption.DIDP_MSG_COORDINATED
        }, {
            Code: 'NOCOORDINATED',
            Name: caption.DIDP_MSG_NOCOORDINATED
        }, {
            Code: 'PROCESSING',
            Name: caption.DIDP_MSG_PROCESSING
        }]
    });
    $rootScope.Modelsearch = {
        Number: '',
        FromDate: '',
        ToDate: '',
        Origanization: '',
        DocumentSymbol: '',
        CreatedTimeFrom: '',
        CreatedTimeTo: '',
        Note: '',
        Status: '',
        Year: ''
    };
    $rootScope.Modelsearch.Year = getYearDefault();
    dataservice.getYear(function (rs) {
        $rootScope.ListYearData = rs;
    })
    function getYearDefault() {
        var currentdate = new Date();
        var year = currentdate.getFullYear();
        return year;
    }
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/document/', {
            templateUrl: ctxfolder + '/document.html',
            controller: 'document'
        }).when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
        });
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DispatchesIncommingDispatchesPending/JTable",
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
                d.FromDate = $rootScope.Modelsearch.FromDate;
                d.ToDate = $rootScope.Modelsearch.ToDate;
                d.Origanization = $rootScope.Modelsearch.Origanization;
                d.DocumentSymbol = $rootScope.Modelsearch.DocumentSymbol;
                d.CreatedTimeFrom = $rootScope.Modelsearch.CreatedTimeFrom;
                d.CreatedTimeTo = $rootScope.Modelsearch.CreatedTimeTo;
                d.Note = $rootScope.Modelsearch.Note;
                d.Status = $rootScope.Modelsearch.Status;
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

                        //$('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        //$scope.selected.forEach(function (obj, index) {
                        //    if ($scope.selected[index])
                        //        $scope.selected[index] = false;
                        //});
                        //$(self).addClass('selected');
                        //$scope.selected[data.Id] = true;
                        dataservice.watched(data.Id, function (rs) {
                            dataservice.getItem(data.Id, function (rs) {
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    myService.setData(rs.Object);
                                    $location.path('/document/');
                                }
                            });
                        });
                    }
                    $scope.$apply();
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentNumber').withTitle('{{"DIDP_LIST_COL_NUMBER" | translate}}').withOption('sWidth', '30px').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"DIDP_LIST_COL_FROM_DATE" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origanization').withTitle('{{"DIDP_LIST_COL_ORIGANIZATION" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbol').withTitle('{{"DIDP_LIST_COL_NUMER_SYMBOL" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"DIDP_LIST_COL_CREATED_TIME" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"DIDP_LIST_COL_TEXT_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"DIDP_LIST_COL_STATUS" | translate}}').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        if (data == "DONE") {
            return '<span class="text-success">Đã hoàn thành</span>';
        } else {
            return '<span class="text-danger">Đang chờ</span>';
        }
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
    $scope.export = function () {
        reloadData(true);
    }
    $scope.export = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/export.html',
            controller: 'export',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.initLoad = function () {
        dataservice.getListUser(function (rs) {
            $scope.ListUserData = rs;
        })
        dataservice.checkIsSecretary(function (rs) {
            $scope.isTP = rs;
        });
    }
    $scope.initLoad();


    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });

        $("#CreatedTimeFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CreatedTimeTo').datepicker('setStartDate', maxDate);
        });
        $("#CreatedTimeTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CreatedTimeFrom').datepicker('setEndDate', maxDate);
        });
        $('.CreatedTime-To').click(function () {
            $('#CreatedTimeFrom').datepicker('setEndDate', null);
        });
        $('.CreatedTime-From').click(function () {
            $('#CreatedTimeTo').datepicker('setStartDate', null);
        });
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
    setTimeout(function () {
        loadDate();
        validateNumber();
    }, 200);
});
app.controller('document', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, dataservice, myService) {
    var fileId = -1;
    var commentId = -1;
    var memberId = -1;
    $scope.model = {};
    $scope.model1 = {
        Comment: '',
        Member: [],
        //Status: ''
    }
    $scope.ListRole = [{
        Code: 1,
        Checked: false,
        Name: caption.DIDP_MSG_MAIN_PROCESSING
    }, {
        Code: 2,
        Checked: false,
        Name: caption.DIDP_MSG_COMBINATION
    }, {
        Code: 3,
        Checked: false,
        Name: caption.DIDP_MSG_SEE_TO_KNOW
    }]
    $scope.ListSearchMember = [];
    $scope.treeData = [];
    $scope.ListDeleteFile = [];
    $scope.ListDeleteComment = [];
    $scope.ListDeleteMember = [];



    $scope.initLoad = function () {
        $scope.model = myService.getData();
        if ($scope.model != undefined) {
            validationDefaultDateTime();
            dataservice.getActivity($scope.model.Header.Id, function (rs) {
                $scope.ActivityData = rs;
            })
            $rootScope.DocumentStatus = $scope.model.DocumentStatus;
            $rootScope.RoleStatus = $scope.model.RoleStatus;
            $rootScope.Role = $scope.model.Role;
            if ($rootScope.Role == 2) {
                $scope.ListRole = [{
                    Code: 2,
                    Checked: false,
                    Name: caption.DIDP_MSG_COMBINATION
                }, {
                    Code: 3,
                    Checked: false,
                    Name: caption.DIDP_MSG_SEE_TO_KNOW
                }]
            }
        } else {
            $location.path('/');
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
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
                text: caption.DIDP_TITLE_ALL_DEPARTMENT,
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
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            if ($rootScope.Role != 3 && $rootScope.DocumentStatus != true && $rootScope.RoleStatus != true) {
                dataservice.getUserActive(function (rs) {
                    var getUserPermision = result.find(function (element) {
                        if (element.IsPermision == true) return true;
                    });
                    if (getUserPermision && getUserPermision.UserId != rs.UserId) {
                        var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                            if (element.UserId == getUserPermision.UserId) return true;
                        });
                        if (!checkExistUser) {
                            //check exist user main
                            var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                                if (element.Role == 1 && element.Id < 0) return true;
                            });
                            var getGroupName = $scope.treeData.find(function (element) {
                                if (element.id == result[i].GroupUserCode) return element;
                            });
                            if (!checkExistUserMain) {
                                var obj = {
                                    Id: memberId--,
                                    Assigner: rs.UserId,
                                    AssignerName: rs.Name,
                                    AssignerGroupUserName: rs.AssignerGroupUserName,
                                    GroupUserName: getGroupName ? getGroupName.title : null,
                                    UserId: getUserPermision.UserId,
                                    Name: getUserPermision.Name,
                                    Role: $rootScope.Role == 1 ? 1 : 2,
                                    CreatedTime: new Date(),
                                    IsPermision: getUserPermision.IsPermision,
                                    Status: false,
                                    IsShowDelete: true,
                                    IsShowComment: true,
                                }
                                $scope.model.Detail.ListMember.push(obj);
                                App.toastrSuccess(caption.DIDP_MSG_ADD_RECEPTION + obj.Name + caption.DIDP_MSG_SUCCESS);
                            } else {
                                var obj = {
                                    Id: memberId--,
                                    Assigner: rs.UserId,
                                    AssignerName: rs.Name,
                                    AssignerGroupUserName: rs.AssignerGroupUserName,
                                    GroupUserName: getGroupName ? getGroupName.title : null,
                                    UserId: getUserPermision.UserId,
                                    Name: getUserPermision.Name,
                                    Role: 2,
                                    CreatedTime: new Date(),
                                    IsPermision: getUserPermision.IsPermision,
                                    Status: false,
                                    IsShowDelete: true,
                                    IsShowComment: true,
                                }
                                $scope.model.Detail.ListMember.push(obj);
                                App.toastrSuccess(caption.DIDP_MSG_ADD_RECEPTION + obj.Name + caption.DIDP_MSG_SUCCESS);
                            }
                        } else {
                            App.toastrError(getUserPermision.Name + caption.DIDP_MSG_RECEIVED_TEXT);
                        }
                    }
                })
            }
            $scope.model1.Member = [];
            $scope.ListSearchMember = result;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.model1.Member = [];
        $scope.ListSearchMember = [];
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
    $scope.updateSelection = function (position, ListRole) {
        angular.forEach(ListRole, function (subscription, index) {
            if (position != index) {
                subscription.Checked = false;
            }
        });
    }
    $scope.addMember = function (member) {
        if (member == '' || member == undefined) {
            App.toastrError(caption.DIDP_MSG_SELECTE_USER);
        } else {
            //check no select role
            var role = $scope.ListRole.find(function (element) {
                if (element.Checked == true) return element;
            });
            if (!role) {
                App.toastrError(caption.DIDP_MSG_SELECTE_ROLE);
            } else {
                //check exist user
                if (role.Code == 1) {
                    //check exist user main
                    var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                        if (element.Role == 1 && element.Id < 0) return true;
                    });
                    //check exist select one main
                    if ($scope.model1.Member.length > 1) {
                        App.toastrError(caption.DIDP_MSG_WARNING);
                        return;
                    }
                }
                if (checkExistUserMain) {
                    App.toastrError(caption.DIDP_MSG_DIDP_DONE);
                } else {
                    dataservice.getUserActive(function (rs) {
                        var count = 0;
                        var existUserMain = false;
                        var existUser = false;
                        var existActive = false;
                        //start for
                        for (var i = 0; i < $scope.model1.Member.length; i++) {
                            if (!$scope.model1.Member[i].IsPermision && $scope.model1.Member[i].IsMain) {
                                continue;
                            } else {
                                //check exist user main
                                if (role.Code == 2 || role.Code == 3) {
                                    var checkExistMain = $scope.model.Detail.ListMember.find(function (element) {
                                        if (element.Role == 1 && element.UserId == $scope.model1.Member[i].UserId) return true;
                                    });
                                }
                                //check exist user
                                var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                                    if (element.UserId == $scope.model1.Member[i].UserId && element.Id < 0) return true;
                                });
                                if (rs.UserId != $scope.model1.Member[i].UserId && !checkExistMain && !checkExistUser) {
                                    var getGroupName = $scope.treeData.find(function (element) {
                                        if (element.id == $scope.model1.Member[i].GroupUserCode) return element;
                                    });
                                    var obj = {
                                        Id: memberId--,
                                        AssignerGroupUserName: rs.AssignerGroupUserName,
                                        Assigner: rs.UserId,
                                        AssignerName: rs.Name,
                                        UserId: $scope.model1.Member[i].UserId,
                                        Name: $scope.model1.Member[i].Name,
                                        GroupUserName: getGroupName ? getGroupName.title : null,
                                        Role: role.Code,
                                        CreatedTime: new Date(),
                                        Status: false,
                                        IsShowDelete: true,
                                        IsShowComment: true,
                                    }
                                    $scope.model.Detail.ListMember.push(obj);
                                    count++;
                                } else {
                                    if (checkExistMain) {
                                        existUserMain = true;
                                    } else {
                                        if (rs.UserId == $scope.model1.Member[i].UserId) {
                                            existActive = true;
                                        } else {
                                            existUser = true;
                                        }
                                    }
                                }
                            }
                        }
                        //end for
                        if (count == 0) {
                            if (existUserMain) {
                                if (role.Code == 2) {
                                    App.toastrError(caption.DIDP_MSG_NOT_TRANSFER_COORDINATION);
                                    return;
                                } else if (role.Code == 3) {
                                    App.toastrError(caption.DIDP_MSG_NOT_VIEW_COORDINATION);
                                    return;
                                }
                            } else if (existActive) {
                                App.toastrError(caption.DIDP_MSG_CANNOT_SEND_TO_YOU);
                            } else {
                                App.toastrError(caption.DIDP_MSG_PERSON_PROCESSED_SELECTED);
                            }
                        } else {
                            if (role.Code == 1) {
                                App.toastrSuccess(caption.DIDP_MAG_ADD_PERSON_SUCCESSTED);
                            } else if (role.Code == 2) {
                                App.toastrSuccess(caption.DIDP_MSG_ADD_COORDINATED_SUCCESSTED);
                            } else {
                                App.toastrSuccess(caption.DIDP_MSG_ADD_VIEWERS_KNOW_SUCCESS);
                            }
                            $scope.model1.Member = [];
                        }
                    })
                }
            }
        }
    }
    $scope.deleteMember = function (index, id) {
        $scope.model.Detail.ListMember.splice(index, 1);
        if (id > 0) {
            $scope.ListDeleteMember.push(id);
        }
        App.toastrSuccess(caption.DIDP_MSG_DELETE_PROCESSING_DONE);
    }

    //action
    $scope.send = function () {
        var checkSelectUser = $scope.model.Detail.ListMember.find(function (element) {
            if (element.IsShowDelete == true) return true;
        });
        if (!checkSelectUser) {
            App.toastrError(caption.DIDP_MSG_CHOOSE_PERSON_DELIVERED);
        } else {
            $scope.model.Detail.ListDeleteComment = $scope.ListDeleteComment;
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.DIDP_MSG_DELIVERED_OR_NOT;
                    $scope.ok = function () {
                        dataservice.send(para, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '30',
            });
            modalInstance.result.then(function (d) {
                $rootScope.savePageState = false;
                $location.path('/');
            }, function () {
            });
        }
    }
    $scope.done = function () {
        $scope.model.Detail.ListDeleteComment = $scope.ListDeleteComment;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return $scope.model;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.DIDP_MSG_CONFIRM_COMPLETE;
                $scope.ok = function () {
                    dataservice.done(para, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $rootScope.savePageState = false;
            $location.path('/');
        }, function () {
        });
    }
    $scope.update = function () {
        $scope.model.Detail.ListDeleteFile = $scope.ListDeleteFile;
        $scope.model.Detail.ListDeleteComment = $scope.ListDeleteComment;
        $scope.model.Detail.ListDeleteMember = $scope.ListDeleteMember;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return $scope.model;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.DIDP_MSG_UPDATE_OR_NOT;
                $scope.ok = function () {
                    dataservice.update(para, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $rootScope.savePageState = false;
            $location.path('/');
        }, function () {
        });
    }
    function validationDefaultDateTime() {
        setTimeout(function () {
            $("#DeadLine").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            });
            if ($scope.model.Header.FromDate != null) {
                var fromDate = $filter('date')($scope.model.Header.FromDate, 'dd/mm/yyyy');
                $('#DeadLine').datepicker('setStartDate', fromDate);
            }
            if ($scope.model.Header.ExperiedReply != null) {
                var experiedReply = $filter('date')($scope.model.Header.ExperiedReply, 'dd/mm/yyyy');
                $('#DeadLine').datepicker('setEndDate', experiedReply);
            }
        }, 200);
    }


    //comment
    $scope.addComment = function () {
        if ($scope.model1.Comment == null || $scope.model1.Comment == "") {
            App.toastrError(caption.DIDP_MSG_YET_ENTERD_COMMENT)
        } else {
            dataservice.getUserActive(function (rs) {
                $scope.comment = {
                    Id: commentId--,
                    User: rs.Name,
                    Comment: $scope.model1.Comment,
                    CreatedTime: new Date(),
                    IsShowComment: true,
                    IsShowDelete: true,
                }
                $scope.model.Detail.ListComment.push($scope.comment);
                App.toastrSuccess(caption.DIDP_MSG_ADD_COMMENT_DONE);
            });
        }
    }
    $scope.deleteComment = function (index, id) {
        $scope.model.Detail.ListComment.splice(index, 1);
        if (id > 0) {
            $scope.ListDeleteComment.push(id);
        }
        App.toastrSuccess(caption.DIDP_MSG_DELETE_COMMENT_DONE);
    }
    $scope.showComment = function (comment) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detailComment.html',
            controller: 'detailComment',
            backdrop: 'static',
            size: 'sm',
            resolve: {
                para: function () {
                    return comment;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }
    $scope.editComment = function (comment, id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editComment.html',
            controller: 'editComment',
            backdrop: 'static',
            size: 'sm',
            resolve: {
                para: function () {
                    return obj = {
                        comment: comment,
                        id: id,
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }
    $rootScope.updateComment = function (comment, id) {
        for (var i = 0; i < $scope.model.Detail.ListMember.length; i++) {
            if ($scope.model.Detail.ListMember[i].Id == id) {
                $scope.model.Detail.ListMember[i].Comment = comment;
                break;
            }
        }
    }

    //xuất luồng xử lý văn bản
    $rootScope.exportFlow = function () {
        location.href = "/DispatchesIncommingDispatchesPending/ExportFlow?"
            + "id=" + $scope.model.Header.Id;

    };
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }

    //xem chi tiết người gửu
    //$scope.detailAssignee = function (item) {

    //}

    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    setTimeout(function () {
        loadPoper();
    }, 200);
});
app.controller('detailComment', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $translate, $timeout, para) {
    $scope.initLoad = function () {
        $scope.comment = para;
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});
app.controller('editComment', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $translate, $timeout, para) {
    $scope.comment = '';
    $scope.initLoad = function () {
        $scope.comment = para.comment;
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        $rootScope.updateComment($scope.comment, para.id);
        $uibModalInstance.close();
    }
});
app.controller('export', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $translate, $timeout, $filter, $location) {
    var date1 = new Date().toString('dd/MM/yyyy');
    $scope.model = { FromDate: '', ToDate: '' }
    setTimeout(function () {
        var date = new Date();
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });

        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', minDate);
        });
    }, 200);
    $scope.clearFromDate = function () {
        $('#ToDate').datepicker('setStartDate', null);
    }
    $scope.clearToDate = function () {
        $('#FromDate').datepicker('setEndDate', null);
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //location.href = "/DispatchesIncommingDispatchesPending/ExportFlow?"
        // + "id=" + 123;
        location.href = "/DispatchesIncommingDispatchesPending/Export?from=" + $scope.model.FromDate + "&to=" + $scope.model.ToDate;
    }

});
app.controller('pdfViewer', function ($scope, $rootScope, $compile, $uibModal, dataservice, $filter) {

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
