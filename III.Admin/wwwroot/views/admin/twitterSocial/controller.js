var ctxfolderTwitterSocial = "/views/admin/twitterSocial";

var ctxfolderTwitterSocialMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_Token_Manager', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber', 'youtube-embed']).
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
app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});
app.directive('webSocket', function ($timeout, $parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            function connect() {
                socket = new WebSocket("ws://localhost:9091");
                scope.socket = socket;
                socket.addEventListener('open', function (event) {
                    socket.send('Stop');
                });
                socket.addEventListener('close', function (event) {
                    setTimeout(function () {
                        connect();
                    }, 5000);
                });
                socket.addEventListener('message', function (event) {
                    console.log('Message from server ', event.data);
                    $timeout(function () {
                        scope.model.Monitor += event.data + "\r\n";
                        scope.$apply();
                    })
                });
            }
            connect();
        }
    };
})

app.factory('dataservice', function ($http) {
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
        runcrawler: function (data, callback) {
            $http.post('/Admin/TwitterSocial/RunCrawler?id=' + data).then(callback);
        },
        stopcrawler: function (data, callback) {
            $http.post('/Admin/TwitterSocial/StopCrawler?id=' + data).then(callback);
        },
        deletelog: function (data, callback) {
            $http.post('/Admin/BotRunning/Delete?id=' + data).then(callback);
        },
        GetCrawlerData: function (data, callback) {
            $http.post('/Admin/PythonCrawler/GetCrawlerData?Domain=' + data).then(callback);
        },
        getmonitor: function (callback) {
            $http.post('/Admin/PythonCrawler/GetMonitor').then(callback);
        },
       
    };
});



app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        
    });
    $rootScope.isTranslate = false;
    $rootScope.open = true;

    // Get fullName with picture
    $scope.fullName = fullName;
    $scope.pictureUser = pictureUser;
    $rootScope.listStatus = [
        {
            Code: "AVAILABLE",
            Name: caption.LMS_SM_MSG_READY
        }, {
            Code: "UNAVAILABLE",
            Name: caption.LMS_SM_MSG_NOT_READY
        },];
    //$rootScope.listUnit = [
    //    {
    //        Code: "MINUTE",
    //        Name: caption.LMS_DASH_BOARD_TIME_MINUTE
    //    }, {
    //        Code: "HOUR",
    //        Name: caption.LMS_DASH_BOARD_TIME_HOURS
    //    },];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/TwitterSocial/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl:ctxfolderTwitterSocial + '/index-course.html',
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
app.controller('index', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    //$scope.index = ctxfolderTwitterSocial + "/index-course.html";
    //$(document).ready(function (e) {
    //    $('.content-wrapper').css("height", "100%");
    //    $('#contentMain').css("height", "100%");
    //    $('.container-fluid').not('.board-detail').css("height", "100%");

    //    $.app.menu.expanded = true;
    //    $.app.menu.collapsed = false;
    //    $.app.menu.toggle();
    //    $(".menu-toggle").click(function (e) {
    //        if ($.app.menu.collapsed) {
    //            $.app.menu.expanded = false;
    //            $.app.menu.expand();
    //            closeNavCard();
    //        } else {
    //            $.app.menu.collapsed = false;
    //            $.app.menu.toggle();
    //            closeNavCard();
    //        }
    //        e.stopImmediatePropagation();
    //    });
    //    $("#btnOpenTrello").click(function (e) {
    //        e.preventDefault();
    //        if ($.app.menu.expanded) {
    //            $.app.menu.toggle();
    //        }
    //        openNavCard();
    //        e.stopImmediatePropagation();
    //    });
    //});
    $scope.initData = function () {
       
    };
    $scope.initData();
    $(document).ready(function () {
        //$('#tblDataSubject').DataTable({
        //    "scrollX": true
        //});
    });
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/BotSocialManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ParentCode = $rootScope.ParentCode;
            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
                heightTableAuto();
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
        .withOption('rowCallback', function (row, data) {
            if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.changeCategory(Id, 'Subject');
            //    }
            //});
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"FB_SOCIAL_ID" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectCode').withTitle('{{"LMS_SM_CODE_SUBJECT" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialCode').withTitle('{{"FB_SOCIAL_BOT_CODE" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"Status" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type, full) {
    //    return '<a ng-class="{\'disabled-element\':selected[' + full.Id + '] == true}"><img ng-click="runcrawler(' + full.Id + ')" style="height:30px ;border-radius:15px" class="img-circle" src="/images/icons/play-icon.png"></a>'
    //        + '<a ng-class1="{\'disabled-element\':selected[' + full.Id + '] != true}"><img ng-click="stopcrawler(' + full.Id + ')" style="height:30px ;border-radius:15px" class="img-circle" src="/images/icons/stop-icon.png"></a>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialName').withTitle('{{"FB_SOCIAL_BOT_NAME" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialType').withTitle('{{"FB_SOCIAL_TYPE" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        if (data == 1)
            return '<span class="bold" style="color:#ab7474">' + "Facebook" + ':</span>'
        else if (data == 2)
            return '<span class="bold" style="color:#0bd7ad">' + "Instagram" + ':</span>'
        else if (data == 3)
            return '<span class="bold" style="color:#0b82d7">' + "Tiktok" + ':</span>'
        else if (data == 4)
            return '<span class="bold" style="color:#33d70b">' + "Twitter" + ':</span>'
        else if (data == 5)
            return '<span class="bold" style="color:#bbd70b">' + "Telegram" + ':</span>'
        else if (data == 6)
            return '<span class="bold" style="color:#af27c8">' + "Youtube" + ':</span>'
        else if (data == 7)
            return '<span class="bold" style="color:#c82785">' + "Zalo" + ':</span>'
        else if (data == 8)
            return '<span class="bold" style="color:#5d541b">' + "Linkedin" + ':</span>'
        else if (data == 9)
            return '<span class="bold" style="color:#d71a1a">' + "Quora" + ':</span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle('{{"FB_SOCIAL_USERNAME" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PassWord').withTitle('{{"FB_SOCIAL_PASSWORD" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Credential').withTitle('{{"FB_SOCIAL_CRENDETIAL" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tocken').withTitle('{{"FB_SOCIAL_TOKEN" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"FB_SOCIAL_DESCRIPTION" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ConditionStatement').withTitle('{{"FB_SOCIAL_CONDITIONSTATEMENT" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return "*****";
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"URL_LIST_TXT_SETTING" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
    //    return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate }}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-gear"></i></button>'; //+
    //        //'<button title="{{"LMS_EXAM_LBL_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"FB_SOCIAL_OPERATION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding-right: 10px; class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> <a title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>'; //+
        //'<button title="{{"LMS_EXAM_LBL_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    //$scope.add = function () {
    //    location.href = "/Admin/LmsDashBoard#addSubject";
    //}

    $scope.runcrawler = function (id) {
        dataservice.runcrawler(id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            login = {
                UserName: rs.UserName,
                PassWord: rs.PassWord
            }
            login = JSON.stringify(login)
            data = JSON.stringify(rs)
            data = decodeHTML(data)
            condition = decodeHTML(rs.ConditionStatement)
            ws.onopen = function () {
                //ws.send("Start");
                ws.send(login)
                ws.send(condition)

            };
        });
        $scope.selected[id] = true;
    };
    $scope.stopcrawler = function (id) {
        dataservice.stopcrawler(id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop domain: " + rs.BotSocialCode);
            };
        });
        $scope.selected[id] = false;
        App.toastrSuccess('Đã Dừng');
    }
    $scope.clear = function (id) {
        $scope.model.Monitor = ' ';
    }

    $scope.reload = function () {
        reloadData(true);
    };

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            str = str.replace('\n', '');
            str = str.replace('/', '');
            str = str.replace(' \ ','');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
});
app.controller('tablog', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {

    $scope.initData = function () {

    };
    $scope.initData();
    $(document).ready(function () {

        //$('#tblDataSubject').DataTable({
        //    "scrollX": true
        //});
    });
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.headerCompiledLog = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOption = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/BotSocialSessionLog/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ParentCode = $rootScope.ParentCode;
            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
                heightTableViewportManual(378, '#tblDataLog');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledLog) {
                $scope.headerCompiledLog = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (row, data) {
            if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.changeCategory(Id, 'Subject');
            //    }
            //});
        });

    vm.dtColumn = [];
    vm.dtColumn.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.TicketID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.TicketID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumn.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"BOT_RUNNING_ORDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('BotSocialCode').withTitle('{{"BOT_RUNNING_SESSION_CODE" | translate}}').withOption('sClass', 'nowrap w300 first-col-sticky').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('BotSessionResult').withTitle('{{"BOT_RUNNING_BOT_CODE" | translate}}').renderWith(function (data, type, full) {

        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"BOT_RUNNING_START_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{"BOT_RUNNING_END_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('BotSession').withTitle('{{"BOT_RUNNING_URL_SCAN_JSON" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('FileResults').withTitle('{{"BOT_RUNNING_FILE_DOWNLOAD_JSON" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('RuningType').withTitle('{{"BOT_RUNNING_FILE_NUM_OF_FILE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('Statvs').withTitle('{{"BOT_RUNNING_FILE_RESULT_DATA" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"BOT_RUNNING_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot; COM_BTN_EDIT &quot; | translate}}" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.Id + ')"class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstances = {};
    function reloadData(resetPaging) {
        vm.dtInstances.reloadData(callback, resetPaging);
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
    //$scope.add = function () {
    //    location.href = "/Admin/LmsDashBoard#addSubject";
    //}
    $scope.runcrawler = function () {
        //dataservice.runcrawler("", function (rs) {
        //    App.toastrSuccess('Đang chạy');
        //    //rs = rs.data;
        //    //$scope.listSubject = rs;
        //});
    };
    /*    $scope.logo = '/images/icons/pause-icon.png';*/
    $scope.changeImage = function () {
        if (document.getElementById("imgClickAndChange").src = "/images/icons/stop-icon.png") {
            document.getElementById("imgClickAndChange").src = "/images/icons/pause-icon.png";
        }
        else {
            document.getElementById("imgClickAndChange").src = "/images/icons/stop-icon.png";
        }
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotRunning + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
        });
    };
    $scope.edit = function (id) {
        location.href = "/Admin/LmsDashBoard?id=" + id + "#editSubject";
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    //$scope.delete = function (id) {
    //    var modalInstance = $uibModal.open({
    //        templateUrl: ctxfolderBotRunningMessage + '/messageConfirmDeleted.html',
    //        windowClass: "message-center",
    //        controller: function ($scope, $uibModalInstance) {
    //            $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
    //            $scope.ok = function () {
    //                dataservice.deletelog(id, function (rs) {
    //                    rs = rs.data;
    //                    if (rs.Error) {
    //                        App.toastrError(rs.Title);
    //                    } else {
    //                        App.toastrSuccess(rs.Title);
    //                        $uibModalInstance.close();
    //                    }
    //                });
    //            };
    //            $scope.cancel = function () {
    //                $uibModalInstance.dismiss('cancel');
    //            };
    //        },
    //        size: '25',
    //    });
    //    modalInstance.result.then(function (d) {
    //        $rootScope.reloadNoResetPage();
    //    }, function () {
    //    });
    //}

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
});
