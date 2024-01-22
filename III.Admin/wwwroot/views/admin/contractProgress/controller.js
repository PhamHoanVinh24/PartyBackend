var ctxfolderContractProgress = "/views/admin/contractProgress";
var ctxfolderMessage = "/views/message-box";
var appContractProgress = angular.module('App_ESEIM_CONTRACT_PROGRESS', ['App_ESEIM_DASHBOARD',"App_ESEIM_CARD_JOB", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
appContractProgress.factory("interceptors", [function () {
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
appContractProgress.factory('dataserviceContractProgress', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListContract: function (callback) {
            $http.post('/Admin/ContractProgress/GetListContract').then(callback);
        },
        getListBoard: function (callback) {
            $http.post('/Admin/CardJob/GetListBoard/').then(callback);
        },
        getStatusPOCus: function (callback) {
            $http.post('/Admin/Contract/GetStatusPOCus/').then(callback);
        },
        getCustomers: function (callback) {
            $http.post('/Admin/Contract/GetCustomers/').then(callback);
        },
        getLists: function (data, callback) {
            $http.get('/Admin/CardJob/GetLists/?BoardCode=' + data).then(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCard/', data).then(callback);
        },
        searchProgress: function (data, callback) {
            $http.post('/Admin/ContractProgress/searchProgress?contractCode=' + data, {
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
            }).then(callback);
        },
        searchContract: function (data, callback) {
            $http.post('/Admin/ContractProgress/SearchContract', data, {
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
            }).then(callback);
        },
    }
});
appContractProgress.controller('Ctrl_ESEIM_CONTRACT_PROGRESS', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
    });
    $rootScope.today = new Date();
});
appContractProgress.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ContractProgress/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderContractProgress + '/index.html',
            controller: 'indexContractProgress'
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
appContractProgress.controller('indexContractProgress', function ($scope, $rootScope, dataserviceContractProgress, $uibModal, $filter) {
    //----libary dhtmlx https://docs.dhtmlx.com/gantt/desktop__localization.html-----
    $scope.model = {
        ContractCode: '',
        BoardCode: '',
        ListCode: '',
        CardName: ''
    }
    $scope.messageInfomation = {
        Contact: '',
        Start: '',
        End: ''
    }
    var contracts_milestones_critical = {
        data: [],
        links: []
    }
    var toggleCritical = function () {
        if (gantt.config.highlight_critical_path)
            gantt.config.highlight_critical_path = !true;
        else
            gantt.config.highlight_critical_path = true;
        gantt.render();
    }
    var weekScaleTemplate = function (date) {
        var dateToStr = gantt.date.date_to_str("%d %M");
        var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
        return dateToStr(date) + " - " + dateToStr(endDate);
    };
    $scope.initLoad = function () {
        dataserviceContractProgress.getListBoard(function (rs) {rs=rs.data;
            $scope.listBoard = rs;
            //$scope.model.BoardCode = rs.length != 0 ? rs[0].BoardCode : '';
            dataserviceContractProgress.getLists($scope.model.BoardCode, function (rs) {rs=rs.data;
                $scope.listLists = rs;
            })
        })
        dataserviceContractProgress.getListContract(function (rs) {rs=rs.data;
            $scope.listContract = rs;
        })
        dataserviceContractProgress.searchProgress('', function (rs) {
            rs = rs.data;
            
            if (rs.Object != null && rs.Object.ListProgress.length != 0) {
                if (rs.Object.DetailContract != null) {
                    $scope.messageInfomation.Contact = rs.Object.DetailContract.Title;
                    $scope.messageInfomation.Start = rs.Object.DetailContract.StartTime;
                    $scope.messageInfomation.End = rs.Object.DetailContract.EndTime;
                }
                loadData(rs.Object.DetailContract, rs.Object.ListProgress);
            }
        })
    }
    $scope.initLoad();
    $scope.search = function () {
        dataserviceContractProgress.searchProgress($scope.model.ContractCode, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if (rs.Object != null && rs.Object.ListProgress.length != 0) {
                    //gantt.clearAll();
                    if (rs.Object.DetailContract != null) {
                        $scope.messageInfomation.Contact = rs.Object.DetailContract.Title;
                        $scope.messageInfomation.Start = rs.Object.DetailContract.StartTime;
                        $scope.messageInfomation.End = rs.Object.DetailContract.EndTime;
                    }
                    loadData(rs.Object.DetailContract, rs.Object.ListProgress);
                } else {
                    App.toastrError(caption.CPR_VALIDATE_NOT_FIND_PROGRESS);
                }
            }
        });
    }
    $scope.addBoard = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/views/admin/cardJob/add-board.html',
            controller: 'add-boardCardJob',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getListBoard(function (rs) {rs=rs.data;
                $scope.Boards = rs;
            });
        }, function () { });
    }
    $scope.addList = function () {
        if ($scope.model.BoardCode == '') {
            App.toastrError(caption.CPR_MSG_SELECT_JOB_BOARD);
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/views/admin/cardJob/add-list.html',
                controller: 'add-listCardJob',
                backdrop: 'static',
                windowClass: "top-25",
                size: '25',
                resolve: {
                    para: function () {
                        return $scope.model.BoardCode;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () { });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractCode" && $scope.model.ContractCode != "") {
            $scope.errorContractCode = false;
            $scope.search();
        }
        if (SelectType == "BoardCode" && $scope.model.BoardCode != "") {
            $scope.errorBoardCode = false;
            dataserviceContractProgress.getLists($scope.model.BoardCode, function (rs) {rs=rs.data;
                
                $scope.listLists = rs;
            })
        }

        if (SelectType == "ListCode" && $scope.model.ListCode != '') {
            $scope.errorListCode = false;
        }
        if (SelectType == "CardName" && $scope.model.CardName != '') {
            $scope.errorCardName = false;
        }
    }
    $scope.addCard = function () {
        if (validationSelect($scope.model).Status == false) {
            $scope.addcard = {};
            $scope.addcard.ListCode = $scope.model.ListCode;
            $scope.addcard.TabBoard = 7;
            $scope.addcard.CardName = $scope.model.CardName;
            $scope.addcard.ListCodeRelative = [{ Code: $scope.model.ContractCode }];
            dataserviceContractProgress.insertCard($scope.addcard, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    //App.toastrSuccess(rs.Title);
                    $scope.search();
                }
            });
        }
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }
    function setMaxHeightGantt() {
        var gantt = $("#contractGantt").position().top;
        var maxHeightGantt = $(window).height() - gantt - 150;
        $("#contractGantt").css({
            'max-height': maxHeightGantt,
            'height': maxHeightGantt,
            'overflow': 'auto',
        });
    }
    function configGantt() {
        var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
        var start = new Date($scope.messageInfomation.Start);
        gantt.addMarker({
            start_date: start,
            css: "status_line",
            text: caption.CPR_LBL_START,
            title: caption.CPR_LBL_START + ": " + date_to_str(start)
        });

        var today = new Date();
        gantt.addMarker({
            start_date: today,
            css: "status_today",
            text: caption.CPR_LBL_TODAY,
            title: caption.CPR_LBL_TODAY+ ": " + date_to_str(today)
        });

        gantt.config.scale_height = 36 * 3;

        gantt.config.columns = [
            //{ name: "wbs", label: "WBS", width: 40, template: gantt.getWBSCode, "resize": true },
            { name: "text", label: caption.CPR_CURD_LBL_WORK, tree: true, width: 200, "resize": true, min_width: 10 },
            { name: "start_date", label: caption.CPR_LBL_DATE_START, align: "center", width: 90, "resize": true },
            { name: "duration", label: caption.CPR_LBL_TIME_SPAN, align: "center", width: 80, "resize": true },
            //{ name: "add", width: 40 }
        ];

        gantt.templates.rightside_text = function (start, end, task) {
            if (task.type == gantt.config.types.milestone)
                return task.text + " / ID: #" + task.id;
            return "";
        };

        gantt.config.date_scale = "%D";
        gantt.config.start_on_monday = false;
        gantt.config.smart_rendering = false;
        gantt.config.date_grid = "%d/%m/%Y";
        gantt.config.scale_unit = "day";
        //gantt.config.date_scale = "%d %M, %D"
        gantt.config.subscales = [
            { unit: "month", step: 1, date: "%F" },
            { unit: "week", step: 1, template: weekScaleTemplate }
        ];
        gantt.templates.progress_text = function (start, end, task) {
            return "<div style='text-align:left;'>" + Math.round(task.progress * 100) + "% </div>";
        };
        gantt.message.hide("myBox");
        gantt.config.show_errors = false;
        gantt.message({
            id: "myBox",
            text: caption.CPR_LBL_CONTRACT +": " + $scope.messageInfomation.Contact + "</br>" +
                caption.CPR_LBL_DATE_START + ": " + $scope.messageInfomation.Start + "</br>" +
                caption.CPR_LBL_END_DATE + ": " + $scope.messageInfomation.End,
            expire: 10000 * 30,
            lifetime: 1000,
            type: "error",
        });
        gantt.attachEvent("onBeforeLightbox", function (id) {
            var task = gantt.getTask(id);
            if (task.$new) {
                dhtmlx.confirm({
                    text: "Create <b>" + task.text + "</b>?",
                    callback: function (res) {
                        if (res) {
                            delete task.$new;
                            gantt.addTask(task);
                        } else {
                            gantt.deleteTask(task.id);
                        }
                    }
                });

                return true;
            }
            return false;
        });
        gantt.attachEvent("onTaskDblClick", function (id, e) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
                controller: 'edit-cardCardJob',
                size: '80',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    para: function () {
                        return id;
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () { });
        });
        gantt.init("contractGantt");
        gantt.parse(contracts_milestones_critical);
    }
    function loadData(contract, data) {
        
        contracts_milestones_critical.data = [];
        var parent = {
            id: contract.ContractHeaderID,
            text: contract.Title,
            start_date: contract.StartTime,
            duration: contract.Duration,
            progress: contract.Completed,
            open: true
        }
        contracts_milestones_critical.data.push(parent);
        for (var i = 0; i < data.length; i++) {
            var child = {
                id: data[i].CardCode,
                text: data[i].CardName,
                start_date: data[i].BeginTime,
                duration: data[i].Duration,
                progress: data[i].Completed,
                parent: parent.id,
                open: true
            }
            contracts_milestones_critical.data.push(child);
        }
        configGantt();
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ContractCode == "") {
            $scope.errorContractCode = true;
            mess.Status = true;
        } else {
            $scope.errorContractCode = false;
        }
        if (data.BoardCode == "") {
            $scope.errorBoardCode = true;
            mess.Status = true;
        } else {
            $scope.errorBoardCode = false;
        }
        if (data.ListCode == "") {
            $scope.errorListCode = true;
            mess.Status = true;
        } else {
            $scope.errorListCode = false;
        }
        if (data.CardName == "") {
            $scope.errorCardName = true;
            mess.Status = true;
        } else {
            $scope.errorCardName = false;
        }
        return mess;
    };

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



    setTimeout(function () {
        setMaxHeightGantt();
    }, 50);
});




//appContractProgress.controller('searchContractProgresss', function ($scope, $rootScope, dataserviceContractProgress, $uibModal, $uibModalInstance, $filter) {
//    $scope.model = {
//        FromDate: '',
//        ToDate: '',
//        Status: '',
//        BudgetF: '',
//        BudgetT: '',
//        Signer: '',
//        Currency: ''
//    }
//    $scope.init = function () {
//        dataserviceContractProgress.getCustomers(function (rs) {rs=rs.data;
//            $scope.Customers = rs;
//        })
//        dataserviceContractProgress.getStatusPOCus(function (rs) {rs=rs.data;
//            $scope.status = rs;
//        });
//    }
//    $scope.init();
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.submit = function () {
//        dataserviceContractProgress.searchContract($scope.model, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                if (rs.Object.length == 0) {
//                    App.toastrError("Không tìm thấy hợp đồng nào!")
//                } else {
//                    $uibModalInstance.close(rs.Object);
//                }
//            }
//        })
//    }
//    function initDateTime() {
//        $("#FromTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#DateTo').datepicker('setStartDate', maxDate);
//        });
//        $("#DateTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#FromTo').datepicker('setEndDate', maxDate);
//        });
//        $('.end-date').click(function () {
//            $('#FromTo').datepicker('setEndDate', null);
//        });
//        $('.start-date').click(function () {
//            $('#DateTo').datepicker('setStartDate', null);
//        });
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//        initDateTime();
//    }, 200);
//});



