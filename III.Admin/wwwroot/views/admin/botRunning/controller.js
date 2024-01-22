var ctxfolderBotRunning = "/views/admin/botRunning";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderBotRunningMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["App_ESEIM","ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', "angularjs-dropdown-multiselect"]).
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
/*app.directive('webSocket', function ($timeout, $parse) {
    
    return {
        *//*restrict: 'E',*//*
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            function connect() {

                //socket = new WebSocket("ws://117.6.131.222:9091");
                socket = new WebSocket(scope.webSocketConnect);
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
})*/
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
        runCrawler: function (data, callback) {
            $http.post('/Admin/BotRunning/RunCrawler?id=' + data).then(callback);
        },
        stopcrawler: function (data, callback) {
            $http.post('/Admin/BotRunning/StopCrawler?id=' + data).then(callback);
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
        getAllDataBotRunning: function (callback) {
            $http.post('/Admin/BotRunning/GetAllDataBotRunning').then(callback);
        },
        getDataCrawlIp: function (data, callback) {
            $http.post('/Admin/BotManagement/GetDataCrawlIp?id=' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/Delete?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/BotRunning/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/BotRunning/UpdateAll', data).then(callback);
        },
        countSessionCode: function (data, callback) {
            $http.post('/Admin/BotRunning/CountSessionCode?BotSessionCode=' + data).then(callback);
        },
        getListData: function (data, callback) {
            $http.post('/Admin/BotRunning/GetListData?id=' + data).then(callback);
        },
        
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
                    return caption.LMS_COURSE_MSG_FINISH;
                } else {
                    return diffMins + caption.LMS_COURSE_MSG_MINUTE_AGO;
                }
            } else {
                return diffHrs + caption.LMS_DASH_BOARD_TIME_HOURS + diffMins + caption.LMS_COURSE_MSG_MINUTE_AGO;
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
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

        $rootScope.isTranslate = true;
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
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/BotRunning/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderBotRunning + '/index-course.html',
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
app.controller('index', function ($scope, $rootScope, $sce, $location, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $timeout) {

    $scope.model = {
        Monitor: "Test"
    };
    $scope.NameBot = "";
    $scope.BotCode = "";
    $scope.webSocketConnect = 'ws://117.6.131.222:9091';
    $scope.model.ID = $location.$$hash.replace('index?id=', '');
    dataservice.getDataCrawlIp($scope.model.ID, function (rs) {
        rs = rs.data;
        $scope.BotData = rs[0];
        $scope.BotCode = $scope.BotData.RobotCode;
        $scope.NameBot = $scope.BotData.RobotName;
        $scope.IpComputer = $scope.BotData.IpComputer;
        $scope.PortComputer = $scope.BotData.PortComputer;
        if ($scope.IpComputer != "" && $scope.PortComputer != "" || $scope.IpComputer != "undefined" && $scope.PortComputer != "undefined") {
            $scope.webSocketConnect = $scope.IpComputer + ":" + $scope.PortComputer;
            console.log($scope.webSocketConnect);
        }
        $scope.terminal = function ($timeout, $parse) {

            $scope.test = function (scope, element, attrs) {
                $scope.connect = function () {

                    //socket = new WebSocket("ws://117.6.131.222:9091");
                    socket = new WebSocket($scope.webSocketConnect);
                    socket = socket;
                    socket.addEventListener('open', function (event) {
                        socket.send('Stop');
                    });
                    socket.addEventListener('close', function (event) {
                        setTimeout(function () {
                            $scope.connect();
                        }, 5000);
                    });
                    socket.addEventListener('message', function (event) {
                        console.log('Message from server ', event.data);
                        $scope.listen = function () {
                            $scope.model.Monitor += event.data + "\r\n";
                            $scope.$apply();
                        }
                        $scope.listen();
                    });
                }
                $scope.connect();
            }
            $scope.test();
        }
        $scope.terminal();
        $scope.reload();
        

        if (rs.Error) {
            App.toastrError(rs.Title);
        } else {
            App.toastrSuccess(rs.Title);
            $uibModalInstance.close();
        }

    });
    console.log($scope.webSocketConnect);
    
    $scope.initData = function () {
        $scope.model.Monitor = '';
        if ($scope.NameBot == "") {
            $scope.NameBot = "Tất cả Bot";
        }
        
    };

    $scope.initData();
    
    $scope.model = {
        StartTime: '',
        EndTime: '',
        ID:'',
    }
    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/dd/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
            $('#datefrom').datepicker('setEndDate', maxDate);
            resetValidateEffectiveDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/dd/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            resetValidateEndDate();
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }
    function resetValidateEndDate() {
         if ($('#EndDate input').valid()) {
             $('#EndDate input').removeClass('invalid').addClass('success');
         }
     }
     function resetValidateEffectiveDate() {
         if ($('#EffectiveDate input').valid()) {
             $('#EffectiveDate input').removeClass('invalid').addClass('success');
         }
     }


    setTimeout(function () {
        loadDate();
    }, 200);


    
    $(document).ready(function () {
        //$('#tblDataSubject').DataTable({
        //    "scrollX": true
        //});
    });
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    var vm = $scope;
    $scope.selectedDomain = []
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="col-md-12 mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span>  <!--<a class="" ng-click="runAllCrawler()" ><b>Start All!</b></a> | <a class="" ng-click="stopcrawler()" > <b>Stop All!</b></a>--> ';
        /*< a class ="" ><img ng-click="runAllCrawler()"  alt="Start All!"></a><a class ="" ><img ng-click="stopcrawler()"  alt="Stop All"></a> </label>';*/
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/BotRunning/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RobotCode = $scope.BotCode;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle("Id").notSortable()
        .renderWith(function (data, type, full, meta) {
            //$scope.selected[full.Id] = false;
            //return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
            return data;
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    /*vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"BOT_RUNNING_URL" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSessionCode').withTitle('{{"BOT_RUNNING_SESSION_CODE" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data;
    })); /*URL_LIST_TXT_TIME_TOTAL*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"BOT_RUNNING_URL" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"BOT_RUNNING_STATUS" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type, full) {
        return '<a ng-class="{\'disabled-element\':selected[' + full.Id + '] == true}"><img ng-click="runCrawler(' + full.Id + ')" style="height:30px ;border-radius:15px" class="img-circle" src="/images/icons/play-icon.png"></a>'
            + '<a ng-class1="{\'disabled-element\':selected[' + full.Id + '] != true}"><img ng-click="stopcrawler(' + full.Id + ')" style="height:30px ;border-radius:15px" class="img-circle" src="/images/icons/stop-icon.png"></a>';
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('IsDownloadFile').withTitle('{{"BOT_RUNNING_DOWNLOAD" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span class="cursor fa fa-circle-o text-danger fs20 pTip-right btn-publish-inline"></span> '
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListKeyWord').withTitle('{{"BOT_RUNNING_KEYWORD_LST" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataStoragePath').withTitle('{{"BOT_RUNNING_DATA_STORAGE_PATH" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return '<span><i class="fa fa-file-code-o" style="color: orange"><a href="/Admin/EDMSRepository">&nbsp;&nbsp;&nbsp;' + data + '</a></i></span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeepScan').withTitle('{{"BOT_RUNNING_DEEP_SCAN" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        return  data ;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'nowrap w50').notSortable()
        .renderWith(function (data, type, full, meta) {
            // Id not id
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>  <!-- <a title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding-right: 10px; class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> <a title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a> -->';
            
        }).withOption('sWidth', '30px').withOption('sClass',));
    vm.dtColumns.push(DTColumnBuilder.newColumn("").withTitle("BOT_RUNNING_ACTION").withOption('sClass', 'nowrap w100').notSortable()
        .renderWith(function (data, type, full, meta) {
            // Id not id
            $scope.selected[full.Id] = false;
            return '  <a title="Edit" ng-click="edit(' + full.Id + ')" ><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> ' +
                ' <!-- <a title="Delete" ng-click="delete(' + full.Id + ')" ><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a> --> '
                + '  <a title="Copy" ng-click="copy(' + full.Id + ')"><i style="--fa-primary-color: green;" class="fa-solid fa-copy fs25"></i></a> ';

        }).withOption('sWidth', '150px').withOption('sClass',));
    vm.reloadData = reloadData;
    vm.dtInstance = {};


    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        selectAll = !selectAll;
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
                vm.selectAll = selectAll;

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

  
    
    $scope.ListStatus = [
        { Code: '1', Name: 'Pause' },
        { Code: '2', Name: 'Stop' },
        { Code: '3', Name: 'Next' },
        { Code: '4', Name: 'Delete' }];
    $scope.runCrawler = function (id) { //true nho
        dataservice.runCrawler(id,function (rs) {
            rs = rs.data
            selector = decodeHTML(rs.ConfigSelectorJson)
            
            data = {
                Url: rs.Url,
                BotSessionCode: rs.BotSessionCode,
                ListKeyWord: rs.ListKeyWord,
                DataStoragePath: rs.DataStoragePath,
                DeepScan: rs.DeepScan,
                IsDownloadFile: rs.IsDownloadFile,
                ConfigSelectorJson: selector,
                RobotCode: rs.RobotCode,
            }
            console.log(rs.IsDownloadFile)
            console.log(data)
            var listDataSend = [];
            listDataSend.push(data);
            // send a list with one element
            
            //var ws = new WebSocket("ws://117.6.131.222:9091");
            
            var ws = new WebSocket($scope.webSocketConnect);
            console.log(ws)
            ws.onopen = function () {
                //ws.send("Start");
                ws.send(JSON.stringify(listDataSend))
            };
        });
        $scope.selected[id] = true;
    };
    $scope.stopcrawler = function (id) {
        dataservice.stopcrawler(id, function (rs) {
            rs = rs.data
            data = JSON.stringify(rs)

            //var ws = new WebSocket("ws://117.6.131.222:9091");
            var ws = new WebSocket($scope.webSocketConnect);
            ws.onopen = function () {
                ws.send("Stop domain: " + rs.Url);
            };
        });
        $scope.selected[id] = false;
        App.toastrSuccess('Đã Dừng');
    };
    
    $scope.initData = function () {
        dataservice.getAllDataBotRunning(function (rs) {
            rs = rs.data;
            $rootScope.listdataBotRunning = rs;
            console.log($rootScope.listdataBotRunning);
        });
       
    }
    // Anything else
    $scope.initData();
    $scope.runAllCrawler = function () { // true to
        var listData = $('#tblDataBotRunning').DataTable().data();
        var listSelected = [];
        for (var i = 0; i < listData.length; i++) {
            if ($scope.selected[listData[i].Id]) {
                listSelected.push(listData[i]);
            }
        }

        console.log(listSelected);
        var listDataSend = [];
        for (var i = 0; i < listSelected.length; i++) {
            var rs = listSelected[i];
            var UrlWeb = rs.Url;
            selector = decodeHTML(rs.ConfigSelectorJson)
            if (rs.IsDownloadFile == true) {
                dataisdownload = rs.IsDownloadFile
            }
            else {
                dataisdownload = true
            }
            data = {
                Url: UrlWeb,
                BotSessionCode: rs.BotSessionCode,
                ListKeyWord: rs.ListKeyWord,
                DataStoragePath: rs.DataStoragePath,
                DeepScan : parseInt(rs.DeepScan),
                IsDownloadFile: dataisdownload,
                ConfigSelectorJson: selector,
                RobotCode: rs.RobotCode,
            }
            
            console.log(data)
            console.log(rs.IsDownloadFile)
            listDataSend.push(data);
        }
        console.log(listDataSend);




        var ws = new WebSocket($scope.webSocketConnect);
        ws.onopen = function () {
            //ws.send("Start");
            ws.send(JSON.stringify(listDataSend))
        };
    }
    $scope.clear = function (id) {
        $scope.model.Monitor = ' ';
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotRunning + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
        });
    };
    $scope.changeImage = function () {
        if (document.getElementById("imgClickAndChange").src = "/images/icons/stop-icon.pcng") {
            document.getElementById("imgClickAndChange").src = "/images/icons/pause-icon.png";
        }
        else {
            document.getElementById("imgClickAndChange").src = "/images/icons/stop-icon.png";
        }
    };
   /* $scope.add = function () {
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
    };*/
    $scope.copy = function (id) {
        dataservice.getListData(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderBotRunning + '/Copy.html',
                    controller: 'copy',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                    $scope.reload();
                });
            }
        });
    }
    $scope.edit = function (id) {
        dataservice.getListData(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderBotRunning + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                    $scope.reload();
                });
            }
        });
    };
    /*$scope.edit = function (id) {
        location.href = "/Admin/LmsDashBoard?id=" + id + "#editSubject";
    };*/
    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            str = str.replace('\n', '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
});
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Url: '',
        BotSessionCode: '',
        RobotCode: '',
        ListKeyWord: [],
        DataStoragePath: 'https/117.6.131.222/crawlerdate/cv1.html',
        ConfigSelectorJson: '{"header": "","headerclass": "","content": "","contentclass": "","image": "","imageclass": ""}',
        DeepScan: '',
        IsDownloadFile: 'true',
        IdentifierBot:'',
    };

    $scope.KeyWord = ''
    $scope.ListRobot =
        [{ Code: 'QUARK5_9093', Name: 'QUARK5' },
        { Code: 'DELL_9091', Name: 'DELL_SERVER' },
        { Code: 'QUARK2_9095', Name: 'QUARK2' },
        { Code: 'LC-9096', Name: 'Local Host 9096' }];
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];

    
    //$scope.openTab = function () {
    //    $scope.Url = 'www.google.com';
    //}
    $rootScope.validationOptions = {
        rules: {
            Id: {
                required: true
            },
            KeyWord: {
                required: true
            },
        },
        messages: {
            Id: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            KeyWord: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
        }
    }

    // hàm thực hiện thêm keyword vào mảng khi bấm enter
    $scope.addKeyword = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.KeyWord;
        // nếu keyword chưa có 
        if ($scope.model.ListKeyWord.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeyWord.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.KeyWord = "";

    }
    $scope.submit = function () {
        if ($rootScope.validationOptions) {
            // lấy giá trị từ ckeditor
            
            if ($scope.model.BotSessionCode != "") {
                var DateTime = new Date();
                var dateString = DateTime.toISOString().slice(0, 10);
                console.log(dateString);
                $scope.AddTailSession = $scope.model.BotSessionCode + '_' + dateString;
                dataservice.countSessionCode($scope.AddTailSession, function (rs) {
                    $scope.count = parseInt(rs.data);
                    $scope.countup = $scope.count.toString();
                    $scope.model.BotSessionCode = $scope.AddTailSession + '_' + $scope.countup;
                    $scope.model.IdentifierBot = $scope.model.BotSessionCode;

                    $scope.model.ListKeyWord = JSON.stringify($scope.model.ListKeyWord);
                    $scope.model.ConfigSelectorJson = CKEDITOR.instances.ConfigSelectorJson.getData();
                    dataservice.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (!rs.Error) {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                        else {
                            App.toastrError(rs.Title);
                        }
                        $rootScope.reloadNoResetPage();
                    });
                });
                
                
            }
            
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ConfigSelectorJson', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ConfigSelectorJson'].config.height = 80;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
        Url: para.Url,
        KeyWord: '',
        ListKeyWord: para.ListKeyWord,
        DataStoragePath: para.DataStoragePath,
        ConfigSelectorJson: para.ConfigSelectorJson,
        DeepScan: para.DeepScan,
        IsDownloadFile: para.IsDownloadFile,
        BotSessionCode: para.BotSessionCode,
        RobotCode: para.RobotCode,
        IdentifierBot: para.IdentifierBot,
    }
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];
    $scope.addKeyword = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.KeyWord;
        // nếu keyword chưa có 
        if ($scope.model.ListKeyWord.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeyWord.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.KeyWord = "";

    }

    $scope.initData = function () {
        //if ($scope.model.ListKeyWord != '' && $scope.model.ListKeyWord != null && $scope.model.ListKeyWord != undefined) {
        //    $scope.model.ListKeyWord = JSON.parse($scope.model.ListKeyWord);
        //}
        //else {
        //    $scope.model.ListKeyWord = [];
        //}
    }

    $scope.initData();
    $scope.submit = function () {
        $scope.model.ListKeyWord = JSON.stringify($scope.model.ListKeyWord);
        //var check = $scope.model.ListKeyWord;
        //if (check == undefined) {
        //    var data = JSON.stringify($scope.model.ListKeyWord);
        //    $scope.model.ListKeyWord = data;
        //}
        var check = CKEDITOR.instances['ConfigSelectorJson'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ConfigSelectorJson'].getData();
            $scope.model.ConfigSelectorJson = data;
        }
        dataservice.updateAll($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
            $rootScope.reloadNoResetPage();
            $rootScope.close();
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
            modalInstance.close();
        }, function () {
        });

    }


    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ConfigSelectorJson', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ConfigSelectorJson'].config.height = 80;
    }


    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('copy', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        Url: para.Url,
        BotSessionCode: para.BotSessionCode,
        RobotCode: para.RobotCode,
        ListKeyWord: [],
        DataStoragePath: para.DataStoragePath,
        ConfigSelectorJson: para.ConfigSelectorJson,
        DeepScan: '',
        IsDownloadFile: 'true',
        IdentifierBot: '',

    }
    $scope.ListRobot =
        [{ Code: 'QUARK5_9093', Name: 'QUARK5' },
        { Code: 'DELL_9091', Name: 'DELL_SERVER' },
        { Code: 'QUARK2_9095', Name: 'QUARK2' },
        { Code: 'LC-9096', Name: 'Local Host 9096' }];
    $scope.KeyWord = '',
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];
 
   
    $scope.addKeyword = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.KeyWord;
        // nếu keyword chưa có
        if ($scope.model.ListKeyWord.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeyWord.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.KeyWord = "";
    }

    $scope.initData = function () {
        //if ($scope.model.ListKeyWord != '' && $scope.model.ListKeyWord != null && $scope.model.ListKeyWord != undefined) {
        //    $scope.model.ListKeyWord = JSON.parse($scope.model.ListKeyWord);
        //}
        //else {
        //    $scope.model.ListKeyWord = [];
        //}
    }

    $scope.initData();
    $scope.submit = function () {
        if ($scope.model.BotSessionCode != "") {
            var DateTime = new Date();
            var dateString = DateTime.toISOString().slice(0, 10);
            console.log(dateString);
            $scope.AddTailSession = $scope.model.BotSessionCode + '_' + dateString;
            dataservice.countSessionCode($scope.AddTailSession, function (rs) {
                $scope.count = parseInt(rs.data);
                $scope.countup = $scope.count.toString();
                $scope.model.BotSessionCode = $scope.AddTailSession + '_' + $scope.countup;
                $scope.model.IdentifierBot = $scope.model.BotSessionCode;

                $scope.model.ListKeyWord = JSON.stringify($scope.model.ListKeyWord);
                $scope.model.ConfigSelectorJson = CKEDITOR.instances.ConfigSelectorJson.getData();
                dataservice.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    else {
                        App.toastrError(rs.Title);
                    }
                    $rootScope.reloadNoResetPage();
                });
            });
        };

    }


    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ConfigSelectorJson', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ConfigSelectorJson'].config.height = 80;
    }


    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});








/*app.controller('tablog', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {

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
            url: "/Admin/BotRunning/JTable1",
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
    vm.dtColumn.push(DTColumnBuilder.newColumn('SessionCode').withTitle('{{"BOT_RUNNING_SESSION_CODE" | translate}}').withOption('sClass', 'nowrap w300 first-col-sticky').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('BotCode').withTitle('{{"BOT_RUNNING_BOT_CODE" | translate}}').renderWith(function (data, type, full) {

        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"BOT_RUNNING_START_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{"BOT_RUNNING_END_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('UrlScanJson').withTitle('{{"BOT_RUNNING_URL_SCAN_JSON" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('FileDownloadJson').withTitle('{{"BOT_RUNNING_FILE_DOWNLOAD_JSON" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('NumOfFile').withTitle('{{"BOT_RUNNING_FILE_NUM_OF_FILE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('FileResultData').withTitle('{{"BOT_RUNNING_FILE_RESULT_DATA" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('NumPasscap').withTitle('{{"BOT_RUNNING_NUM_PASSCAP" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('UserIdRunning').withTitle('{{"BOT_RUNNING_USER_ID_RUNNING" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('Ip').withTitle('{{"BOT_RUNNING_USER_IP" | translate }}').renderWith(function (data, type, full) {

        return data;
    }));
    vm.dtColumn.push(DTColumnBuilder.newColumn('Status').withTitle('{{"BOT_RUNNING_STATUS" | translate }}').renderWith(function (data, type, full) {

        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASMTNC_TAB_HEADER_COL_NOTE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
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
    $scope.ListStatus = [
        { Code: '1', Name: 'Pause' },
        { Code: '2', Name: 'Stop' },
        { Code: '3', Name: 'Next' },
        { Code: '4', Name: 'Delete' }];
    $scope.runCrawler = function () {
        dataservice.runCrawler("", function (rs) {
            App.toastrSuccess('Đang chạy');
            //rs = rs.data;
            //$scope.listSubject = rs;
        });
    };
    *//*    $scope.logo = '/images/icons/pause-icon.png';*//*
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderBotRunningMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletelog(id, function (rs) {
                        rs = rs.data;
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }

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
*/

