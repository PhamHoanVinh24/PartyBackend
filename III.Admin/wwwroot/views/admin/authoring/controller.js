var ctxfolder = "/views/admin/authoring";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);
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
    return {
        insert: function (data, callback) {
            $http.post('/Admin/Authoring/insert', data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Authoring/update', data).success(callback);
        },
        updateAuthoring: function (data, callback) {
            $http.post('/Admin/Authoring/updateAuthoring?Id=' + data).success(callback);
        },
        checkIsTP: function (callback) {
            $http.post('/Admin/Authoring/CheckIsTP').success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Authoring/delete?Id=' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/Authoring/getitem?Id=' + data).success(callback);
        },
        getDispatchesUser: function (callback) {
            $http.post('/Admin/Authoring/getDispatchesUser').success(callback);
        },
        flow: function (data, callback) {
            $http.post('/Admin/Authoring/Flow/', data).success(callback);
        },
    }
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
        var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
        var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.GroupUserCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.VALIDATE_ITEM_CODE.replace('{0}', caption.G_USERS_CODE), "<br/>");
        }
        if (!partternName.test(data.Title)) {
            mess.Status = true;
            mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.G_USERS_NAME) + "<br/>";
        }
        if (!partternDescription.test(data.Description)) {
            mess.Status = true;
            mess.Title += " - " + caption.VALIDATE_ITEM.replace('{0}', caption.DESCRIPTION) + "<br/>";
        }
        return mess;
    }
    $rootScope.validationOptions = {
        rules: {
            FromDate: {
                required: true,
            },
            ToDate: {
                required: true,
            }

        },
        messages: {
            FromDate: {
                required: caption.AUTHORING_MSG_NO_BLANK_FROM_DATE
            },
            ToDate: {
                required: caption.AUTHORING_MSG_NO_BLANK_TO_DATE
            }
        }
    }
    $rootScope.StatusData = [{
        Value: true,
        Name: caption.AUTHORING_VALIDATE_ACTIVATE
    }, {
            Value: false,
            Name: caption.AUTHORING_VALIDATE_INACTIVE
    }];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/',
            {
                templateUrl: ctxfolder + '/index.html',
                controller: 'index'
            })
        .when('/edit/:id',
            {
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit'
            })
        .when('/user/:id',
            {
                templateUrl: ctxfolder + '/user.html',
                controller: 'user'
            })
        .when('/add/',
            {
                templateUrl: ctxfolder + '/add.html',
                controller: 'add'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.isTP = false;
    var vm = $scope;
    $scope.model = {
        GroupName: '',
        GroupUserCode: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';


    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Authoring/jtable",
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
                d.UserName = $scope.model.UserName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'asc'])
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
        });


    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('ID').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName1').withTitle('{{"AUTHORING_LIST_COL_AUTHORIZED_PERSON" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"AUTHORING_LIST_COL_AUTHORIZED_RECIPIENT" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"AUTHORING_LIST_COL_STATUS" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        if (data == "False-N") return '<button ng-click="confirm(' + full.Id + ')" style = "height: 25px; padding-left:5px; padding-right:5px;  padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn">Xác nhận</button>';

        if (data == "False-Y") return '<span style = "color:#00c5dc">Đã xác nhận</span>';
        if (data == "True-N") return '<span style = "color:red">Chưa xác nhận</span>';


        if (data == "True-Y") return '<span style = "color:#00c5dc">Đã xác nhận</span>';
        return data;

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"AUTHORING_LIST_COL_FROM_DATE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{"AUTHORING_LIST_COL_TO_DATE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'inline-flex').renderWith(function (data, type, full) {
        if (full.Status == "False-N" || full.Status == "False-Y")
            return "";
        else
            return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-pencil-alt"></i></button>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt"></i></button>' +
                '<button title="Hoạt động" ng-click="activity(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgb(153, 196, 201);" class="btn btn-icon-only btn-circle btn-outline green"><i class="fas fa-history"></i></button>';
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
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
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
        reloadData(false);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.AUTHORING_MSG_DELETE_AUTHORING;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });

    }
    $scope.activity = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/document.html',
            controller: 'document',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return userModel;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.confirm = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.AUTHORING_MSG_VERIFICATION_AUTHORING;
                $scope.ok = function () {
                    dataservice.updateAuthoring(id, function (rs) {
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
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        ToUser: ''
    };
    $scope.DispatchUsers = [];
    $scope.getDispatchesUser = function () {
        dataservice.getDispatchesUser(function (result) {
            $scope.DispatchUsers = result;
        });
    }
    $scope.getDispatchesUser();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.changeSelect = function (selectType) {
        if (selectType == "ToUser" && $scope.model.ToUser != "") {
            $scope.errorToUser = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ToUser == "") {
            $scope.errorToUser = true;
            mess.Status = true;
        } else {
            $scope.errorToUser = false;
        }
        return mess;
    };
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
        $('#FromDate').datepicker('setStartDate', date);
    }, 200);
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 10);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $filter) {
    $scope.model = {};
    $scope.DispatchUsers = [];
    $scope.getDispatchesUser = function () {
        dataservice.getDispatchesUser(function (result) {
            $scope.DispatchUsers = result;
        });
    }
    $scope.getDispatchesUser();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.changeSelect = function (selectType) {
        if (selectType == "ToUser" && $scope.model.ToUser != "") {
            $scope.errorToUser = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.getItem = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
            } else {
                $scope.model = rs;
                $scope.model.FromDate = $filter('date')($scope.model.FromDate, "dd/MM/yyyy");
                $scope.model.ToDate = $filter('date')($scope.model.ToDate, "dd/MM/yyyy");

                var resFrom = $scope.model.FromDate.split("/");
                var resTo = $scope.model.ToDate.split("/");
                var m0 = resFrom[2] + '-' + resFrom[1] + '-' + resFrom[0];
                var m00 = resTo[2] + '-' + resTo[1] + '-' + resTo[0];
                var m000 = new Date("2018-10-13");
                var m = new Date(resFrom[2] + '-' + resFrom[1] + '-' + resFrom[0]);
                var m1 = new Date(resTo[2] + '-' + resTo[1] + '-' + resTo[0]);

                setTimeout(function () {
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
                    $('#FromDate').datepicker('setEndDate', m1);
                    $('#ToDate').datepicker('setStartDate', m);
                }, 200);
            }
        });
    }
    $scope.getItem();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ToUser == "") {
            $scope.errorToUser = true;
            mess.Status = true;
        } else {
            $scope.errorToUser = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 10);
});

app.controller('document', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, para, $timeout, $filter) {
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Authoring/JTableDocumentByAuthoringId",
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
                d.Id = $scope.model.Id;
            },
            complete: function (rs) {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('serverSide', false)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).find('input'))($scope);
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
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/activity.html',
                            controller: 'activity',
                            backdrop: 'static',
                            size: '60',
                            resolve: {
                                para: function () {
                                    return data.Id;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reload();
                        }, function () {
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
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentNumber').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_DOCUMENT_NUMBER" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_FROM_DATE" | translate}}').renderWith(function (data, type, full, meta) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : '';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origanization').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_ORIGANIZATION" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbol').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_DOCUMENT_SYMBOL" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type, full, meta) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : '';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_NOTE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"AUTHORING_CLICK_DC_LIST_COL_STATUS" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
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
    $scope.initLoad = function () {
        $scope.user = para.GivenName;
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
        $scope.loadData();
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $timeout(function () {
        setModalMaxHeight('.modal');
    }, 100);
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 10);
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, para) {
    $scope.initLoad = function () {
        dataservice.flow(para, function (rs) {
            $scope.model = rs;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    //Download luồng xử lý văn bản
    $rootScope.exportFlow = function () {
        location.href = "/Admin/Authoring/ExportFlow?"
            + "id=" + para;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 10);
});