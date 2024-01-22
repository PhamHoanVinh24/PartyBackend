var ctxfolderCustomerProgress = "/views/admin/customerProgress";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_CUSTOMER_PROGRESS', ['App_ESEIM_DASHBOARD',"App_ESEIM_CARD_JOB", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
app.factory('dataserviceCustomerrProgress', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListCustomer: function (callback) {
            $http.post('/Admin/CustomerProgress/GetListCustomer').then(callback);
        },
        getListBoard: function (callback) {
            $http.post('/Admin/CardJob/GetListBoard/').then(callback);
        },
        getLists: function (data, callback) {
            $http.get('/Admin/CardJob/GetLists/?BoardCode=' + data).then(callback);
        },
        getCustomerStatus: function (callback) {
            $http.post('/Admin/Customer/GetCustomerStatus').then(callback);
        },
        getCustomerGroup: function (callback) {
            $http.post('/Admin/Customer/getCustomerGroup').then(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCard/', data).then(callback);
        },

        searchProgress: function (data, callback) {
            $http.get('/Admin/CustomerProgress/SearchProgress?customerCode=' + data, {
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
        searchCustomer: function (data, callback) {
            $http.post('/Admin/CustomerProgress/SearchCustomer', data, {
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
app.controller('Ctrl_ESEIM_CUSTOMER_PROGRESS', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
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
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CustomerProgress/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderCustomerProgress + '/index.html',
            controller: 'indexCustomerProgress'
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



app.controller('indexCustomerProgress', function ($scope, $rootScope, dataserviceCustomerrProgress, $uibModal, $filter) {
    //----libary dhtmlx https://docs.dhtmlx.com/gantt/desktop__localization.html-----
    $scope.model = {
        CustomerCode: '',
        BoardCode: '',
        ListCode: '',
        CardName: ''
    }
    $scope.messageInfomation = {
        Customer: '',
        Address: '',
        MobilePhone: ''
    }

    var customer_milestones_critical = {
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
        dataserviceCustomerrProgress.getListBoard(function (rs) {rs=rs.data;
            $scope.listBoard = rs;
            //$scope.model.BoardCode = rs.length != 0 ? rs[0].BoardCode : '';
            dataserviceCustomerrProgress.getLists($scope.model.BoardCode, function (rs) {rs=rs.data;
                $scope.listLists = rs;
            })
        })
        dataserviceCustomerrProgress.getListCustomer(function (rs) {rs=rs.data;
            $scope.listCustomer = rs;
        })
        dataserviceCustomerrProgress.searchProgress('', function (rs) {rs=rs.data;
            if (rs.Object != null && rs.Object.ListProgress.length != 0) {
                if (rs.Object.DetailCustomer != null) {
                    $scope.messageInfomation.Customer = rs.Object.DetailCustomer.CusName;
                    $scope.messageInfomation.Address = rs.Object.DetailCustomer.Address;
                    $scope.messageInfomation.MobilePhone = rs.Object.DetailCustomer.MobilePhone;
                }
                loadData(rs.Object.DetailCustomer, rs.Object.ListProgress);
            }
        })
    }
    $scope.initLoad();
    $scope.search = function () {
        dataserviceCustomerrProgress.searchProgress($scope.model.CustomerCode, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if (rs.Object.ListProgress.length != 0) {
                    gantt.clearAll();
                    if (rs.Object.DetailCustomer != null) {
                        $scope.messageInfomation.Project = rs.Object.DetailCustomer.ProjectTitle;
                        $scope.messageInfomation.Start = rs.Object.DetailCustomer.StartTime;
                        $scope.messageInfomation.End = rs.Object.DetailCustomer.EndTime;
                    }
                    loadData(rs.Object.DetailCustomer, rs.Object.ListProgress);
                } else {
                    App.toastrError(caption.CUP_MSG_NOT_FOUND_PROGRESS);/* Không tìm thấy tiến độ cho khách hàng này!*/
                }
            }
        });
    }
    //$scope.searchAdvanced = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolderCustomerProgress + '/search.html',
    //        controller: 'searchCustomerProgress',
    //        backdrop: 'static',
    //        size: '40'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.listCustomer = d;
    //    }, function () { });
    //}
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


    $scope.addList = function () {
        if ($scope.model.BoardCode == '') {
            App.toastrError(caption.CUP_VALIDATE_CHOOSE_JOB_BOARD); /*Vui lòng chọn bảng công việc!*/
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
        if (SelectType == "CustomerCode" && $scope.model.CustomerCode != "") {
            $scope.errorCustomerCode = false;
            $scope.search();
        }
        if (SelectType == "BoardCode" && $scope.model.BoardCode != "") {
            $scope.errorBoardCode = false;
            dataserviceCustomerrProgress.getLists($scope.model.BoardCode, function (rs) {rs=rs.data;
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
            $scope.addcard.TabBoard = 6;
            $scope.addcard.CardName = $scope.model.CardName;
            $scope.addcard.ListCodeRelative = [{ Code: $scope.model.CustomerCode }];
            dataserviceCustomerrProgress.insertCard($scope.addcard, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.initLoad();
                    $scope.search();
                }
            });
        }
    }

    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }
    function setMaxHeightGantt() {
        var gantt = $("#customerGantt").position().top;
        var maxHeightGantt = $(window).height() - gantt - 150;
        $("#customerGantt").css({
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
            text: caption.CUP_LBL_START,
            title: caption.CUP_LBL_START+ ": " + date_to_str(start)
        });

        var today = new Date();
        gantt.addMarker({
            start_date: today,
            css: "status_today",
            text: caption.CUP_LBL_TODAY,
            title: caption.CUP_LBL_TODAY+ ": " + date_to_str(today)
        });

        gantt.config.scale_height = 36 * 3;

        gantt.config.columns = [
            //{ name: "wbs", label: "WBS", width: 40, template: gantt.getWBSCode, "resize": true },
            { name: "text", label: caption.CUP_TXT_TASK, tree: true, width: 200, "resize": true, min_width: 10 },
            { name: "start_date", label: caption.CUP_LBL_START_DATE, align: "center", width: 90, "resize": true },
            { name: "duration", label: caption.CUP_LBL_TIME_SPAN, align: "center", width: 80, "resize": true },
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
        gantt.message({
            id: "myBox",
            text: caption.CUP_CURD_LBL_CUSTUMER +": " + $scope.messageInfomation.Customer + "</br>" +
                caption.CUP_CURD_LBL_SEARCH_ADDRESS +": " + $scope.messageInfomation.Address + "</br>" +
                caption.CUP_LBL_PHONE_NUMBER + ": " + $scope.messageInfomation.MobilePhone,
            expire: 10000 * 30,
            lifetime: 1000,
            type: "error",
        });
        gantt.config.show_errors = false;
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
                $scope.initLoad();
            }, function () { });
        });
        gantt.init("customerGantt");
        gantt.parse(customer_milestones_critical);
    }
    function loadData(Customer, data) {
        customer_milestones_critical.data = [];
        //var parent = {
        //    id: project.Id,
        //    text: project.ProjectTitle,
        //    start_date: project.StartTime,
        //    duration: project.Duration,
        //    progress: project.Completed,
        //    open: true
        //}
        //customer_milestones_critical.data.push(parent);
        for (var i = 0; i < data.length; i++) {
            var child = {
                id: data[i].CardCode,
                text: data[i].CardName,
                start_date: data[i].BeginTime,
                duration: data[i].Duration,
                progress: data[i].Completed,
                //parent: parent.id,
                open: true
            }
            customer_milestones_critical.data.push(child);
            //if (data[i].ListChild.length != 0) {
            //    var listChildForParent = data[i].ListChild;
            //    for (var j = 0; j < listChildForParent.length; j++) {
            //        var child = {
            //            id: listChildForParent[j].ListID,
            //            text: listChildForParent[j].ListName,
            //            start_date: listChildForParent[j].BeginTime,
            //            duration: listChildForParent[j].Duration,
            //            progress: listChildForParent[j].Completed,
            //            parent: parent.id,
            //            open: true
            //        }
            //        customer_milestones_critical.data.push(child);
            //        if (listChildForParent[j].ListChild != 0) {
            //            var listChildForChild = listChildForParent[j].ListChild;
            //            for (var k = 0; k < listChildForChild.length; k++) {
            //                for (var h = 0; h < listChildForChild[k].ListCard.length; h++) {
            //                    var childForChild = {
            //                        id: listChildForChild[k].ListCard[h].CardID,
            //                        text: listChildForChild[k].ListCard[h].CardName,
            //                        start_date: listChildForChild[k].ListCard[h].BeginTime,
            //                        duration: listChildForChild[k].ListCard[h].Duration,
            //                        progress: listChildForChild[k].ListCard[h].Completed,
            //                        parent: child.id,
            //                        open: true
            //                    }
            //                    customer_milestones_critical.data.push(childForChild);
            //                }
            //            }
            //        }
            //    }
            //}
        }
        configGantt();
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CustomerCode == "") {
            $scope.errorCustomerCode = true;
            mess.Status = true;
        } else {
            $scope.errorCustomerCode = false;
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
    setTimeout(function () {
        setMaxHeightGantt();
        showHideSearch();
    }, 50);
});
//app.controller('searchCustomerProgress', function ($scope, $rootScope, dataserviceCustomerrProgress, $uibModal, $uibModalInstance, $filter) {
//    $scope.model = {
//        CustomerName: '',
//        CustomerPhone: '',
//        CustomerEmail: '',
//        CustomerGroup: '',
//        CustomerActivityStatus: '',
//        Address: ''
//    }
//    $scope.init = function () {
//        dataserviceCustomerrProgress.getCustomerGroup(function (rs) {rs=rs.data;
//            $scope.CustomerGroup = rs;
//        })
//        dataserviceCustomerrProgress.getCustomerStatus(function (rs) {rs=rs.data;
//            $scope.CustomerStatusData = rs;
//        });
//    }
//    $scope.init();
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    };
//    $scope.submit = function () {
//        dataserviceCustomerrProgress.searchCustomer($scope.model, function (rs) {rs=rs.data;
//            
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                if (rs.Object.length == 0) {
//                    App.toastrError("Không tìm thấy khách hàng nào!")
//                } else {
//                    $uibModalInstance.close(rs.Object);
//                }
//            }
//        })
//    }
//    setTimeout(function () {
//        setModalDraggable('.modal-dialog');
//    }, 200);
//});



