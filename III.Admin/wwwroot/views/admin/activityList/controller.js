var ctxfolder = "/views/admin/activityList";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderCardJob = "/views/admin/cardJob";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_CUSTOMER', 'App_ESEIM_PROJECT', 'App_ESEIM_CARD_JOB', 'App_ESEIM_ATTR_MANAGER', 'App_ESEIM_MATERIAL_PROD', 'App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_WF_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ngFileUpload']).
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

app.factory('dataserviceActivityList', function ($http) {
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
    var submitFormUpload1 = function (url, data, callback) {
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
        getListAct: function (data, callback) {
            $http.post('/Admin/ActivityList/GetListAct?wfInstCode=' + data).then(callback)
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataserviceActivityList, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;

        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }

    });

    //$rootScope.actInstCode = '';
    var url_string = window.location.href;
    var url = new URL(url_string);
    var wfInstCode = url.searchParams.get("wfInstCode");
    if (wfInstCode !== '' && wfInstCode !== null && wfInstCode !== undefined) {
        $rootScope.wfInstCode = wfInstCode;
    }
    $rootScope.isWfInstJobCard = true;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ActivityList/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index-wf.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $controller, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceActivityList, $filter, myService, $location) {
    $controller('indexCardJob', { $scope: $scope, $rootScope: $rootScope });
    $('.menu-toggle').addClass('hidden');
    $('.page-sidebar').addClass('hidden');
    $("#breadcrumb").addClass('hidden');
    dataserviceActivityList.getListAct($rootScope.wfInstCode, function (rs) {
        rs = rs.data;
        if (rs.Error) {
            App.toastrError(rs.Title);
        }
        else {
            $scope.data = rs.Object;
            $rootScope.wfCode = rs.Object.WfCode;
            if ($scope.data != null) {
                $scope.lstAct = JSON.parse(rs.Object.ListAct);
                if ($scope.lstAct.length > 0) {
                    $rootScope.actInstCode = $scope.lstAct[0].ActivityInstCode;
                    $rootScope.reloadData();
                }
            }
        }
    });
    $rootScope.reloadListAct = function () {
        dataserviceActivityList.getListAct($rootScope.wfInstCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.data = rs.Object;
                if ($scope.data != null) {
                    $scope.lstAct = JSON.parse(rs.Object.ListAct);
                }
            }
        });
    }
    $scope.chooseActivity = function (actInstCode) {
        $rootScope.actInstCode = actInstCode;
        $rootScope.reloadData();
    };

    $scope.addCardActivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
            controller: 'add-card-activity',
            backdrop: 'static',
            keyboard: false,
            size: '75',
            resolve: {
                para: function () {
                    return {
                        wfCode: $rootScope.wfCode,
                        wfInstCode: $rootScope.wfInstCode,
                        actInstCode: $rootScope.actInstCode,
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadData();
        }, function () {
            $rootScope.reloadData();
            if ($rootScope.isTabSumary == false) {
                dataserviceCardJob.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                    rs = rs.data;
                    $scope.listBoardsGroupWorkFlow = rs;
                });
                dataserviceCardJob.getBoardDetail($rootScope.boardCode, $rootScope.searchObj.Object, function (rs) {

                    rs = rs.data;
                    $scope.modelDetail = rs;
                });
            }
        });
    };
});

app.controller('grid-card-listActivity', function ($scope, $rootScope, $controller, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, dataserviceActivityList, dataserviceCardJob) {
    $controller('grid-cardCardJob', { $scope: $scope, $rootScope: $rootScope });
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsActivity = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ActivityList/GetGridCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.WorkflowInstCode = $rootScope.wfInstCode;
                d.ActivityInstCode = $rootScope.actInstCode;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (row, data) {
            if (data.BoardType == "BOARD_REGULARLY") {
                $(row).addClass('row-board-regularly');
            }
            else if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
            row.addEventListener('dragstart', handleDragStart, false);
            acts = document.querySelectorAll('#list-board .boards');
            [].forEach.call(acts, function (act) {
                act.addEventListener('dragenter', handleDragEnter, false)
                act.addEventListener('dragover', handleDragOver, false);
                act.addEventListener('dragleave', handleDragLeave, false);
                act.addEventListener('drop', handleDrop, false);
                act.addEventListener('dragend', handleDragEnd, false);
            });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $compile(angular.element(row))($scope);
            $(row).attr("draggable", "true");
            $(row).attr("cardCode", data.CardCode);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    //$rootScope.CardCode = data.CardCode;
                    //var modalInstance = $uibModal.open({
                    //    animation: true,
                    //    templateUrl: ctxfolderCardJob + "/add-card-buffer.html",
                    //    controller: 'edit-cardCardJob',
                    //    size: '80',
                    //    keyboard: false,
                    //    backdrop: 'static',
                    //    resolve: {
                    //        para: function () {
                    //            return data.CardCode;
                    //        }
                    //    }
                    //});
                    //modalInstance.result.then(function (d) {
                    //    $rootScope.reloadGridCard();
                    //    updateNotify();
                    //}, function () { });
                }
            });
        })
    vm.dtColumnsActivity = [];
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;

        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type, full) {
        var deadLine = '';
        var workType = "";
        var priority = "";
        var updateTimeTxt = "";
        var showLadbelApprove = "";
        var groupAssign = "";
        var departmentAssign = "";
        var wfName = "";
        var actName = "";
        if (full.DepartmentAssign != "") {
            departmentAssign = '<br/><span class="fs9 black">' + caption.CJ_CURD_BTN_DEPARTMENT + ': ' + full.DepartmentAssign + '</span>'
        }
        if (full.GroupAssign != "") {
            groupAssign = '<br/><span class="fs9 black">' + caption.CJ_CURD_BTN_TEAM + ': ' + full.GroupAssign + '</span>'
        }
        if (full.IsShowLabelAssign == 'True') {
            showLadbelApprove = '</br><img src="/images/default/icon-warning.gif" style = "width: 17px; height: 17px;"/><span class="fs9 blink">' + caption.CJ_LBL_APPROVE_EMP + ' ! </span>'
        }

        if (full.WfName != "") {
            wfName = '<br/><span class="fs9">' + '<span style="color: green;">' + caption.CJ_LBL_WF + ': </span>' + full.WfName + '</span>'
        }
        if (full.ActName != "") {
            var instName = full.ActName.length > 40 ? full.ActName.substr(0, 40) + " ..." : full.ActName;
            actName = '; <span role="button" class="fs9" title="' + full.ActName + '"><span style="color: green;">' + caption.CJ_TXT_ACTIVITY + ': </span>' + instName + '</span>'
        }

        var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
        if (full.UpdateTime != null && full.UpdateTime != "" && full.UpdateTime != undefined) {

            var updateText = $filter('date')(full.UpdateTime, 'dd/MM/yyyy HH:mm:ss')
            updateTimeTxt = '<span class="fs9 black">' + caption.CJ_LBL_UPDATE_TIME + ': ' + updateText + '</span>'

            var updated = new Date(full.UpdateTime);
            var currentTime = new Date();
            var diffMsUpdate = (updated - currentTime);
            var diffDayUpdated = Math.floor((diffMsUpdate / 86400000));
            if (diffDayUpdated == -1) {
                var diffHrsUpdate = Math.floor((diffMsUpdate % 86400000) / 3600000);
                if (diffHrsUpdate < 10) {
                    cardName = '<span style = "color: #9406b7">' + cardName + '</span>'
                }
            }
        }
        if (full.WorkType != "") {
            workType = '<span class="fs9 mr-1" style="color: #048004;">' + caption.CJ_LBL_WORK_TYPE + ': ' + full.WorkType + '</span>'
        }
        if (full.Priority != "") {
            priority = '<span class="badge-customer badge-customer-success ml-1">' + full.Priority + '</span>'
        }
        if (full.Deadline == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">{{"CJ_LBL_NO_SET_DEADLINE" | translate}}</span>'
        }
        else {
            if (full.Status != 'Thẻ rác' && full.Status != 'Đóng' && full.Status != 'Bị hủy' && full.Status != 'Hoàn thành') {
                var created = new Date(full.Deadline);
                var now = new Date();
                var diffMs = (created - now);
                var diffDay = Math.floor((diffMs / 86400000));
                if ((diffDay + 1) < 0) {
                    deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">' + caption.CJ_LBL_TIME_OUT + '</span>';
                } else if ((diffDay + 1) > 0) {
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + (diffDay + 1) + ' ' + caption.CJ_LBL_DAY + '</span>'
                } else {
                    var end = new Date(new Date().setHours(23, 59, 59, 999));
                    var diffMs1 = (end - now);
                    var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                    var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + diffHrs + 'h ' + diffMins + 'p</span>'
                }
            }
        }
        if (full.Status == 'Hoàn thành') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_SUCCESS + '</span>' + priority +
                '</div>' + '<div class= "pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Đang triển khai') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger" style="width:95px;">&nbsp;' + caption.CJ_LBL_PENDING + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Bị hủy') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning" style="width:95px;">&nbsp;' + caption.CJ_LBL_CANCLE + '</span>' + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_CREATE + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Thẻ rác') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_TAB_STATUS_TRASH + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
        else if (full.Status == 'Đóng') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_MSG_TAB_CLOSE + '</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + updateTimeTxt + showLadbelApprove + departmentAssign + groupAssign + wfName + actName + '</div>';
        }
    }).withOption('sClass', 'nowrap wpercent35'));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_START" | translate}}').withOption('sClass', 'text-wrap w50').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('Deadline').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_DEADLINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'text-wrap w50'));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_END" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user mr5"></i>{{"CJ_COL_CREATE_BY" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('BoardName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"CJ_LIST_COL_BOARD" | translate}}').withOption('sClass', 'nowrap w250').renderWith(function (data, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_COL_CREATE_DATE" | translate}}').withOption('sClass', 'text-wrap w20').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsActivity.push(DTColumnBuilder.newColumn('').notSortable().withTitle('<i class="fa fa-recycle mr5"></i>{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'dataTable-pr0  d-flex w250').renderWith(function (data, type, full, meta) {
        return '<div class="pr5"><span title= "Nhóm" ng-click="cardMember(\'' + full.CardCode + '\')" /*style = "width: 25px; height: 25px; padding: 0px;background: #009432;border-color: #009432;margin-right: 0px !important;"*/ class="fs20"><i class="fas fa-users"></i></span><p class="fs8 text-underline">{{"CJ_BTN_GROUP" | translate}}</p></div>' +
            '<div class="pr5 text-center"><span title="Phòng ban" ng-click="cardGroupUser(\'' + full.CardCode + '\')" /*style = "width: 25px; height: 25px; padding: 0px;background: #3598dc;border-color: #3598dc;margin-right: 0px !important;"*/ class="fs20"><i class="fas fa-door-open"></i></span><p class="fs8 text-underline nowrap">{{"CJ_BTN_DEPARTMENT" | translate}}</p></div>' +
            '<div class="pr5 text-center"><span title="Liên kết" ng-click="cardRelative(\'' + full.CardCode + '\')" /*style = "width: 25px; height: 25px; padding: 0px;background: #009432;border-color: #009432;margin-right: 0px !important;"*/ class="fs20"><i class="fas fa-link"></i></span><p class="fs8 text-underline nowrap">{{"CJ_BTN_LINK" | translate}}</p></div>' +
            '<div class="pr5 text-center"><span title="Copy" ng-click="cardCopy(\'' + full.CardCode + '\')" /*style = "width: 25px; height: 25px; padding: 0px;background: #8e44ad;border-color: #8e44ad;margin-right: 0px !important;"*/ class="fs20"><i class="fas fa-copy"></i></span><p class="fs8 text-underline">{{"CJ_BTN_COPY" | translate}}</p></div>' +
            '<div class="pr5 text-center"><span title="Sửa" ng-click="editActivityCard(\'' + full.CardCode + '\')" /*style = "width: 25px; height: 25px; padding: 0px;background: #3598dc;border-color: #3598dc;margin-right: 0px !important;"*/ class="fs20"><i class="fas fa-edit"></i></span><p class="fs8 text-underline">{{"CJ_BTN_EDIT" | translate}}</p></div>' +
            '<div class="text-center"><span title="Xoá" ng-click="deleteActivityCard(' + full.CardID + ')" /*style="width: 25px; height: 25px; padding: 0px;background: #e7505a;border-color: ##e7505a;margin-right: 0px !important*/;" class="fs20"><i class="fas fa-trash-alt"></i></span><p class="fs8 text-underline">{{"COM_BTN_DELETE" | translate}}</p></div>';
    }));
    vm.reloadData = reloadData;

    vm.dtInstanceActivity = {};

    function reloadData(resetPaging) {
        vm.dtInstanceActivity.reloadData(callback, resetPaging);
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
    };

    function handleDragStart(e) {
        // Keep track globally of the source row and source table id
        //dragSrcRow = this;
        //srcTable = this.parentNode.parentNode.id
        console.log('Drag started');
        var cardCode = $(this.closest('tr')).attr('cardCode');
        // Allow moves
        e.dataTransfer.effectAllowed = 'move';

        // Save the source row html as text
        e.dataTransfer.setData('text/plain', cardCode);

    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }

        // Allow moves
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) { };
    function handleDragLeave(e) { };
    function handleDrop(e) {
        // this / e.target is current target element.
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }

        // Get destination table id, row
        var actInstCode = $(this.closest('.boards')).attr('actInstCode');
        //var dstRow = $(this).closest('tr');
        var cardCode = e.dataTransfer.getData('text/plain');

        var data = {
            ActInstCode: actInstCode,
            WfInstCode: $rootScope.wfInstCode,
            ObjectInst: cardCode,
            ObjectType: "CARD_JOB",
        };
        dataserviceCardJob.insertObjectProcess(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
        return false;
    }
    function handleDragEnd(e) { };

    $rootScope.reloadData = function () {
        reloadData(true);
        $rootScope.reloadListAct();
    };
    $scope.editActivityCard = function (CardCode) {
        $rootScope.CardCode = CardCode;
        $rootScope.titleModalAssign = 3;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
            controller: 'edit-cardActivity',
            backdrop: 'static',
            size: '75',
            keyboard: false,
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(false);
            $rootScope.reloadWFBoard($rootScope.searchObj.Object);
        }, function () { });
    };
    $scope.deleteActivityCard = function (CardID) {
        dataserviceCardJob.deleteCard(CardID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData();
                $rootScope.reloadData();
            }
        });
    };
});

app.controller('add-card-activity', function ($scope, $controller, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, $filter, para) {
    $controller('add-card-buffer', { $scope: $scope, $rootScope: $rootScope, $uibModalInstance: $uibModalInstance, para: para });
    $scope.init = function () {
        $scope.IsCreateWF = true;
        $scope.isLockWf = true;
        //Workflow
        dataserviceCardJob.getWorkFlow(function (rs) {
            rs = rs.data;
            $scope.listWorkFlow = rs;
            $scope.modelWF = {
                WorkflowCode: para.wfCode,
                WfInstCode: para.wfInstCode,
                ActInstCode: para.actInstCode
            };
            dataserviceCardJob.getActInstCard($scope.modelWF.WfInstCode, "", function (rs) {
                rs = rs.data;
                $scope.lstActInstance = rs;
            })
        })
    }
    $scope.init();

    //Insert card
    $scope.saveBuffer = function () {
        var element = $('#card_000000');
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        if (newName != currentName) {
            $scope.model.CardName = newName;
            newName = "";
        }
        $scope.acticeDetailDrag = false;

        var check = CKEDITOR.instances['description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['description'].getData();
            $scope.model.Description = data;
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.model.CardName.trim() == "" && $scope.model.ListCode == "") {
                return App.toastrError("Vui lòng nhập tên thẻ việc và chọn danh mục công việc");
            }
            else if ($scope.model.CardName.trim() == "") {
                return App.toastrError("Vui lòng nhập tên thẻ việc");
            }
            else if ($scope.model.ListCode == "") {
                return App.toastrError("Vui lòng chọn danh mục công việc");
            }

            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });

            if (!$rootScope.isAddedCard) {
                dataserviceCardJob.insertCardNew($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        App.unblockUI("#modal-body");
                    }
                    else {
                        $rootScope.isAddedCard = true;
                        $rootScope.CardCode = rs.Object;
                        $scope.cardCode = rs.Object;
                        App.toastrSuccess(rs.Title)

                        //Copy data using to rollback
                        dataserviceCardJob.getCardDetail($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            if (!rs.Error) {
                                $scope.model = rs.Object.CardDetail;
                                $scope.cardCode = $scope.model.CardCode;
                                $scope.cardName = $scope.model.CardName;
                                $rootScope.Inherit = $scope.model.Inherit;
                                $scope.obj.Board = rs.Object.Board;
                                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                                $rootScope.IsLock = $scope.model.IsLock;
                                dataserviceCardJob.getLists($scope.obj.Board, function (rs) {
                                    rs = rs.data;
                                    $scope.Lists = rs;
                                });
                                $scope.obj.List = rs.Object.List;
                                $scope.CompletedOld = $scope.model.Completed;
                                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                                        $scope.isAssign = false;
                                    } else {
                                        $scope.isAssign = true;
                                    }
                                }
                                $rootScope.settingNotification = rs.Object.Notification;
                                $scope.currentUser = rs.Object.CurrenUser;
                                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy') : '';
                                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy') : "";
                                $scope.completeBoard = rs.Object.BoardCompleted;
                                $scope.completeList = rs.Object.ListCompleted;
                                //Copy data using to rollback
                                $scope.rollBack.CardHeader = angular.copy($scope.model);
                                //End copy data using to rollback

                                setTimeout(function () {
                                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                                }, 100);
                            }
                        });

                        //End copy data using to rollback

                        dataserviceCardJob.updateActivity(rs.Object, 2, true, function (rs) {
                            rs = rs.data;
                            dataserviceCardJob.getCardDetail($scope.cardCode, function (rs) {
                                rs = rs.data;
                                if (!rs.Error) {
                                    $scope.model = rs.Object.CardDetail;

                                    $scope.descriptionOld = angular.copy($scope.model.Description);

                                    if ($scope.model.Status == "CLOSED") {
                                        $scope.isClose = true;
                                    } else {
                                        $scope.isClose = false;
                                    }
                                    $scope.CompletedOld = $scope.model.Completed;
                                    if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {

                                        if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                                            $scope.isAssign = false;
                                        } else {
                                            $scope.isAssign = true;
                                        }
                                    }
                                    $rootScope.settingNotification = rs.Object.Notification;
                                    $scope.currentUser = rs.Object.CurrenUser;
                                    $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy') : '';
                                    $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                                    $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy') : "";
                                    $scope.completeBoard = rs.Object.BoardCompleted;
                                    $scope.completeList = rs.Object.ListCompleted;
                                    dataserviceCardJob.roleInCardOfUser($scope.cardCode, function (rs) {
                                        rs = rs.data;
                                        $scope.RoleUser = rs.Responsibility;

                                        if ($scope.RoleUser == "ROLE_LEADER") {
                                            $scope.isNotLeader = false;
                                        }
                                        if ($scope.isNotLeader && $scope.isClose) {
                                            $scope.isDisableStatus = true;
                                            $scope.isDisableControl = true;
                                        } else if (!$scope.isNotLeader && $scope.isClose) {
                                            $scope.isDisableStatus = false;
                                            $scope.isDisableControl = true;
                                        } else {
                                            $scope.isDisableStatus = false;
                                            $scope.isDisableControl = false;
                                        }
                                    })
                                    setTimeout(function () {
                                        validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                                    }, 100);
                                }
                            });
                        });
                        dataserviceCardJob.getComment($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.comments = rs;
                        });
                        $rootScope.getLogActivity();
                        dataserviceCardJob.insertCardSuggestion($rootScope.CardCode, function (rs) {
                            dataserviceCardJob.getObjectRelative($rootScope.CardCode, function (rs) {
                                rs = rs.data;
                                $rootScope.listID = [];
                                $rootScope.listObjRelative = rs;
                                for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                                    $rootScope.listID.push($scope.listObjRelative[i].ID);
                                }
                                $scope.rollbackObject = angular.copy($rootScope.listID);
                            });
                        });
                        //$rootScope.reloadFile();
                        $rootScope.listCardJobLink = [];
                        clearInterval($scope.interval);
                        $scope.interval = setInterval(sessionCard, 3000);
                        App.unblockUI("#modal-body");
                        $scope.changeActInst();
                    }
                })
            }
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        if (data.WfType == "") {
            $scope.errorWfType = true;
            mess.Status = true;
        } else {
            $scope.errorWfType = false;
        }

        return mess;
    };

    function validateDefaultDate(startDate, endDate, deadline) {
        setStartDate("#endDate", startDate);
        setStartDate("#deadline", startDate);
        //setEndDate
        const [dayDead, monthDead, yearDeal] = deadline.split("/")
        var deadTime = new Date(yearDeal, monthDead - 1, dayDead)
        if (endDate != "") {
            const [day, month, year] = endDate.split("/")
            var endTime = new Date(year, month - 1, day)
            if (endTime > deadTime) {
                setEndDate("#startDate", deadline)
            }
            else {
                setEndDate("#startDate", endDate)
            }
        }
        else {
            setEndDate("#startDate", deadline)
        }
    }

    function sessionCard() {
        dataserviceCardJob.isUpdateNewData($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (rs) {
                loadNewData();
            }
        })
    }
});

app.controller('edit-cardActivity', function ($scope, $controller, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, $filter, para) {
    $controller('edit-cardCardJob', { $scope: $scope, $rootScope: $rootScope, $uibModalInstance: $uibModalInstance, para: para });
    $scope.init = function () {
        $scope.IsCreateWF = true;
        $scope.isLockWf = true;
        $scope.showInfoHeader = true;
        //Workflow
        dataserviceCardJob.getWorkFlow(function (rs) {
            rs = rs.data;
            $scope.listWorkFlow = rs;

            $scope.modelWF = {
                WorkflowCode: $rootScope.wfCode,
                WfInstCode: $rootScope.wfInstCode,
                ActInstCode: $rootScope.actInstCode
            };
        })
    }
    $scope.init();
});