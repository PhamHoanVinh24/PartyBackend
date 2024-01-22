var ctxfolderWfPlugin = "/views/admin/workflowPlugin";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_WF_PLUGIN', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

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

app.factory('dataserviceWfPlugin', function ($http) {
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
            data: data
        }

        $http(req).then(callback);
    };
    return {
        //Workflow
        getActivityArranged: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetActivityArranged?wfCode=' + data).then(callback)
        },
        getActInstArranged: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/GetActInstArranged?objInst=' + data + '&objType=' + data1).then(callback)
        },
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        //change status

        updateStatusActInst: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusActInst?actInst=' + data + '&status=' + data1).then(callback);
        },
        approve: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/Approve?actInstCode=' + data).then(callback)
        },
        unapprove: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/Unapprove?actInstCode=' + data + '&status=' + data1).then(callback)
        },
        getPermission: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetPermission?actInstCode=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_WF_PLUGIN', function ($scope, $rootScope, $compile, $uibModal, dataserviceWfPlugin, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        })
    });
    $rootScope.WorkFlowCode = '';
    $rootScope.ObjectTypeFile = "ACT_CAT";
    $rootScope.moduleName = "ACT";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Activity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderWfPlugin + '/wf-plugin.html',
            controller: 'wf-plugin'
        })
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
});

app.controller('wf-plugin', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceWfPlugin, $filter) {
    //Declare variable
    $scope.lstActArranged = [];
    $scope.lstActRelative = [];
    $scope.isCollaps = isAllData == "True" ? false : true;
    //End declare

    $scope.width = '200px';
    $scope.isScroll = false;

    $scope.expand = function () {
        if ($scope.isCollaps) {
            $scope.isCollaps = false;
        }
        else {
            $scope.isCollaps = true;
        }
    }

    //Load diagram workflow activity category
    $rootScope.loadDiagramWF = function (wfCode) {
        dataserviceWfPlugin.getActivityArranged(wfCode, function (rs) {
            rs = rs.data;
            $scope.lstActArranged = rs;
            $scope.calculateWidth();
        })
    }
    $scope.idObjectSave;
    $scope.idObjectType;
    $rootScope.loadDiagramWfInst = function (id, objType) {
        $scope.idObjectSave = id;
        $scope.idObjectType = objType;
        dataserviceWfPlugin.getActInstArranged(id, objType, function (rs) {
            rs = rs.data;
            $scope.isCollaps = isAllData == "True" ? false : true;
            $scope.lstActArranged = rs.ActArranged;
            $scope.lstActRelative = rs.ActRela;

            $scope.calculateWidth();
        });
    }

    // view help detail
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


    $scope.calculateWidth = function () {
        if ($scope.lstActRelative.length < 4) {
            $scope.width = (100 / $scope.lstActRelative.length) + '%';
            $scope.isScroll = false;
        } else {
            $scope.width = '300px';
            $scope.isScroll = true;
        }
    }

    $scope.scrollLeft = function () {
        var leftPos = $('#wf-step').scrollLeft();
        $("#wf-step").animate({ scrollLeft: leftPos - 250 }, 800);
    }

    $scope.scrollRight = function () {
        var leftPos = $('#wf-step').scrollLeft();
        $("#wf-step").animate({ scrollLeft: leftPos + 250 }, 800);
    }
    function reloadDataList(resetPaging) {
        dataserviceWfPlugin.getActInstArranged($scope.idObjectSave, $scope.idObjectType, function (rs) {
            rs = rs.data;
            $scope.isCollaps = isAllData == "True" ? false : true;
            $scope.lstActArranged = rs.ActArranged;
            $scope.lstActRelative = rs.ActRela;

            $scope.calculateWidth();
        });
    }
    $scope.approve = function (actInstCode, status) {
        dataserviceWfPlugin.getPermission(actInstCode, function (obj) {
            obj = obj.data;
            if (!obj.PermisstionApprove) {
                return App.toastrError(caption.COM_MSG_NO_PERMISSION);
            }
            if (status == "Đang xử lý") {
                dataserviceWfPlugin.approve(actInstCode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        dataserviceWfPlugin.updateStatusActInst(actInstCode, "STATUS_ACTIVITY_END", function (rs1) {
                            rs1 = rs1.data;
                            if (rs1.Error) {
                                App.toastrError(rs1.Title);
                            } else {
                                reloadDataList(true);
                            }
                        })
                    }
                });
            }
            else {
                var actStatus = "";
                if (status == "Kích hoạt") {
                    actStatus = "STATUS_ACTIVITY_CANCEL";
                }
                else if (status == "Đã xử lý") {
                    actStatus = "STATUS_ACTIVITY_STOPPED";
                }
                else if (status == "Hủy") {
                    actStatus = "STATUS_ACTIVITY_ACTIVE";
                }
                else if (status == "Dừng lại") {
                    actStatus = "STATUS_ACTIVITY_DOING";
                }
                if (actStatus != "") {
                    dataserviceWfPlugin.unapprove(actInstCode, actStatus, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            dataserviceWfPlugin.updateStatusActInst(actInstCode, actStatus, function (rs1) {
                                rs1 = rs1.data;
                                if (rs1.Error) {
                                    App.toastrError(rs1.Title);
                                } else {
                                    reloadDataList(true);
                                }
                            })
                        }
                    });
                }
            }
        });
    }

    //End load
});
