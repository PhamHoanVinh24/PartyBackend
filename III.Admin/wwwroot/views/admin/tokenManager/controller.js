var ctxfolderTokenManager = "/views/admin/tokenManager";
var ctxfolderTokenManagerMessage = "/views/message-box";
var ctxfolderTokenManagerFileShare = "/views/admin/fileObjectShare";
var ctxfolderTokenManagerCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_Token_Manager', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ui.tinymce']);
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
app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});
app.factory('dataserviceTokenManager', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/TokenManager/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/TokenManager/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/TokenManager/Delete?id=' + data).then(callback);
        },
        getListService: function (callback) {
            $http.post('/Admin/TokenManager/GetListService').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/TokenManager/GetItem?id=' + data).then(callback);
        },
        //google
        getGoogleCredential: function (data, callback) {
            $http.post('/Admin/TokenManager/GetGoogleCredential', data).then(callback);
        },
        //zoom
        getZoomCredential: function (data, callback) {
            $http.post('/Admin/TokenManager/GetZoomCredential', data).then(callback);
        },
        // data type
        getListATTRTYPE: function (callback) {
            $http.post('/Admin/AttributeSetup/GetListATTRTYPE').then(callback);
        },
        addAutoMeetingConfig: function (data, callback) {
            $http.post('/Admin/TokenManager/InsertMeetingConfig', data).then(callback);
        },
        addShiftMeetingAuto: function (data, callback) {
            $http.post('/Admin/TokenManager/InsertShiftConfig', data).then(callback);
        },
        updateAutoMeeting: function (data, callback) {
            $http.post('/Admin/TokenManager/UpdateAutoMeeting', data).then(callback);
        },
        updateShiftMeeting: function (data, callback) {
            $http.post('/Admin/TokenManager/UpdateShiftMeeting', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM_Token_Manager', function ($scope, $rootScope, $cookies, $translate, dataserviceTokenManager, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        captionTm = captionTm[culture];
        $.extend($.validator.messages, {
            min: captionTm.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", captionTm.COM_VALIDATE_ITEM_CODE.replace("{0}", captionTm.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                AccountCode: {
                    required: true,
                },
                AccountName: {
                    required: true,
                },
                Email: {
                    required: true,
                },
                AccountNumber: {
                    required: true,
                },
                SdkKey: {
                    required: true
                },
                SdkSecret: {
                    required: true
                },
                Key: {
                    required: true,
                },
                ApiSecret: {
                    required: true,
                },
                //Token: {
                //    required: true,
                //},
                Credentials: {
                    required: true,
                },
            },
            messages: {
                AccountCode: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_ACCOUNT_CODE
                },
                AccountName: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_ACCOUNT_NAME
                },
                Email: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_EMAIL
                },
                AccountNumber: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_ACCOUNT_NUMBER
                },
                SdkKey: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_SDK_KEY
                },
                SdkSecret: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_SDK_SECRET
                },
                Key: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_WEB_KEY
                },
                ApiSecret: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_WEB_SECRET
                },
                //Token: {
                //    required: captionTm.TOKEN_MANAGER_VALIDATE_WEB_TOKEN
                //},
                Credentials: {
                    required: captionTm.TOKEN_MANAGER_VALIDATE_CREDENTIALS
                },
            }
        }
        dataserviceTokenManager.getListService(function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $rootScope.listService = rs.Object;
            }
        });
        $rootScope.listType = [
            { Code: 'MEETING_SCHEDULE', Name: captionTm.TOKEN_MANAGER_TYPE_MEETING },
            { Code: 'GROUP', Name: captionTm.TOKEN_MANAGER_TYPE_GROUP },
            { Code: 'REPOSITORY', Name: captionTm.TOKEN_MANAGER_TYPE_REPOSITORY },
            { Code: 'MATH', Name: captionTm.TOKEN_MANAGER_TYPE_MATH }];
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/TokenManager/Translation');
    captionTm = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderTokenManager + '/index.html',
            controller: 'indexTokenManager'
        })
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
});
app.controller('indexTokenManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTokenManager, $window, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AccountName: '',
        Email: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/TokenManager/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AccountName = $scope.model.AccountName;
                d.Email = $scope.model.Email;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(268, '#tblDataRequestImport');
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataRequestImport').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AccountName').withTitle('{{"TOKEN_MANAGER_ACCOUNT_NAME"|translate}}').withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type) {
        return '<span class="text-brown bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"TOKEN_MANAGER_TYPE"|translate}}').withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type) {
        switch (data) {
            case 'MEETING_SCHEDULE':
                data = '<span class="text-green">' + captionTm.TOKEN_MANAGER_TYPE_MEETING + '</span>';
                break;

            case 'GROUP':
                data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_GROUP + '</span>';
                break;

            case 'REPOSITORY':
                data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_REPOSITORY + '</span>';
                break;

            case 'MATH':
                data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_MATH + '</span>';
                break;
        }

        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AccountCode').withTitle('{{"TOKEN_MANAGER_ACCOUNT_CODE"|translate}}').withOption('sClass', ' dataTable-pr0 w110').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"TOKEN_MANAGER_EMAIL"|translate}}').withOption('sClass', 'tleft dataTable-pr0  w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AccountNumber').withTitle('{{"TOKEN_MANAGER_ACCOUNT_NUMBER"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Key').withTitle('{{"TOKEN_MANAGER_WEB_KEY"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Token').withTitle('{{"TOKEN_MANAGER_WEB_TOKEN"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
        var dataView = data.length > 30 ? data.substr(0, 30) + " ..." : data;
        if (data.length > 0) {
            var tooltip = '<span  href="javascript:;" data-toggle="tooltip" data-container="body" data-placement="top" data-original-title=\'' + data + '\'>' + dataView + '</span>';
            return tooltip;
        } else {
            return dataView;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ApiSecret').withTitle('{{"TOKEN_MANAGER_WEB_SECRET"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
        var dataView = data.length > 30 ? data.substr(0, 30) + " ..." : data;
        if (data.length > 0) {
            var tooltip = '<span  href="javascript:;" data-toggle="tooltip" data-container="body" data-placement="top" data-original-title=\'' + data + '\'>' + dataView + '</span>';
            return tooltip;
        } else {
            return dataView;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION"|translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger pr20"></i></a>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };
    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 55;
    } else if ($window.innerWidth > 1400) {
        size = 50;
    }

    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTokenManager + '/add.html',
            controller: 'addTokenManager',
            backdrop: 'static',
            size: size
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataserviceTokenManager.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderTokenManager + '/edit.html',
                    controller: 'editTokenManager',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        })
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderTokenManagerMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = captionTm.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTokenManager.delete(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 50);
});
app.controller('addTokenManager', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceTokenManager, $filter, $window) {
    $scope.model = {
        ServiceType: '',
        AccountRole: 'MEMBER',
        Value: ''
    }
    $scope.init = function () {
        dataserviceTokenManager.getListATTRTYPE(function (result) {
            result = result.data;
            $scope.ListATTRTYPE = result.Object;
        });
    }
    $scope.init();
    $scope.listNewAttr =
        [
            {
                "Id": 0,
                "AttrName": "STARTDAY",
                "Value": "",
                "DataType": "DATETIME"
            },
            {
                "Id": 2,
                "AttrName": "ENDDAY",
                "Value": "",
                "DataType": "DATETIME"
            },
            {
                "Id": 3,
                "AttrName": "STATUS",
                "Value": "",
                "DataType": "STRING"
            }
        ];
    $scope.listStatus = [{Code : "ON", Name : "On"},
        { Code: "OFF", Name: "Off" }];
    $scope.currentId = 0;
    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }
    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    //App.toastrSuccess(rs.Title);
                    //if (rs.Object != null) {
                    //    $window.open(rs.Object, '_blank');
                    //}
                    $uibModalInstance.close();
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.saveGoogle = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.getGoogleCredential($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if (rs.Object != null) {
                        $window.open(rs.Object, '_blank');
                    }
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.saveZoom = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.getZoomCredential($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if (rs.Object != null) {
                        $window.open(rs.Object, '_blank');
                    }
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.addautoMeeting = function () {
        $scope.model.Value = JSON.stringify($scope.listNewAttr);
        console.log($scope.model);
            dataserviceTokenManager.addAutoMeetingConfig($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
    }
    $scope.addShiftAuto = function () {
        $scope.model.Value = JSON.stringify($scope.listNewAttr);
        console.log($scope.model);
        dataserviceTokenManager.addShiftMeetingAuto($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Type" && $scope.model.Type != "") {
            $scope.errorType = false;
        }
        if (SelectType == "ServiceType" && $scope.model.Type != "") {
            $scope.errorServiceType = false;
        }
         loadDate();
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Type == "" || data.Type == undefined || data.Type == null) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }
        if (data.ServiceType == "" || data.ServiceType == undefined || data.ServiceType == null) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }

        return mess;
    };
    $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy');
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ToDate').datepicker('setStartDate', null);
            }
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#FromDate').datepicker('setEndDate', null);
            }
        });
    }
    setTimeout(function () {
        loadDate();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editTokenManager', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTokenManager, para, $window) {
    $scope.model = { Value: '' }
    $scope.listNewAttr = [];
    $scope.initLoad = function () {
        $scope.model = para;
        console.log(typeof ($scope.model.CredentialsJson));
        $scope.listNewAttr = JSON.parse($scope.model.CredentialsJson)
        console.log($scope.listNewAttr);
        dataserviceTokenManager.getListATTRTYPE(function (result) {
            result = result.data;
            $scope.ListATTRTYPE = result.Object;
        });
       
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.saveGoogle = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.getGoogleCredential($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if (rs.Object != null) {
                        $window.open(rs.Object, '_blank');
                    }
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.saveZoom = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceTokenManager.getZoomCredential($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if (rs.Object != null) {
                        $window.open(rs.Object, '_blank');
                    }
                    $uibModalInstance.close();
                }
            });
        }
    }
    // EDIT AUTO
    $scope.listStatus = [{ Code: "ON", Name: "On" },
    { Code: "OFF", Name: "Off" }];
    $scope.currentId = 0;
    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }
    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }
    $scope.updateAutoMeeting = function () {
        $scope.model.Value = JSON.stringify($scope.listNewAttr);
        console.log($scope.model);
        dataserviceTokenManager.updateAutoMeeting($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
};
    $scope.updateShiftMeeting = function () {
        $scope.model.Value = JSON.stringify($scope.listNewAttr);
        console.log($scope.model);
        dataserviceTokenManager.updateShiftMeeting($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
};
    //// END EDIT

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Type" && $scope.model.Type != "") {
            $scope.errorType = false;
        }
        if (SelectType == "ServiceType" && $scope.model.Type != "") {
            $scope.errorServiceType = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Type == "" || data.Type == undefined || data.Type == null) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }
        if (data.ServiceType == "" || data.ServiceType == undefined || data.ServiceType == null) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }

        return mess;
    };

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
