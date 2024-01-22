var ctxfolderBotSessionManagement = "/views/admin/botSessionManagement";
var ctxfolderBotSessionManagementMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
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
        getListCourse: function (callback) {
            $http.post('/Admin/ExamHome/GetListCourse').then(callback);
        },
        getListCategoryByParent: function (data, callback) {
            $http.post('/Admin/ExamHome/GetListCategoryByParent?parentCode=' + data).then(callback);
        },
        getListLectureByCategory: function (data, callback) {
            $http.post('/Admin/ExamHome/GetListLectureByCategory?categoryCode=' + data).then(callback);
        },
        getListQuestionByLecture: function (data, callback) {
            $http.post('/Admin/ExamHome/GetListQuestionByLecture?categoryCode=' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/Delete?id=' + data).then(callback);
        },

        insert: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/UpdateAll', data).then(callback);
        },
        getDataSession: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/GetDataSession?id='+ data).then(callback);
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



        $rootScope.isTranslate = false;
        $rootScope.open = true;

        // Get fullName with picture
        $scope.fullName = fullName;
        $scope.pictureUser = pictureUser;

    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/BotSessionManagement/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderBotSessionManagement + '/index-course.html',
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
    $scope.index = ctxfolderBotSessionManagement + "/index-course.html";
    $(document).ready(function (e) {
        $('.content-wrapper').css("height", "100%");
        $('#contentMain').css("height", "100%");
        $('.container-fluid').not('.board-detail').css("height", "100%");

        $.app.menu.expanded = true;
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
        $(".menu-toggle").click(function (e) {
            if ($.app.menu.collapsed) {
                $.app.menu.expanded = false;
                $.app.menu.expand();
                closeNavCard();
            } else {
                $.app.menu.collapsed = false;
                $.app.menu.toggle();
                closeNavCard();
            }
            e.stopImmediatePropagation();
        });
        $("#btnOpenTrello").click(function (e) {
            e.preventDefault();
            if ($.app.menu.expanded) {
                $.app.menu.toggle();
            }
            openNavCard();
            e.stopImmediatePropagation();
        });
    });
    $scope.initData = function () {
        dataservice.getListCourse(function (rs) {
            rs = rs.data;
            $scope.listCourse = rs;
            for (var i = 0; i < $scope.listCourse.length; i++) {
                $scope.listCourse[i].Description = decodeHTML($scope.listCourse[i].Description);
            }
        });
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
    $scope.model = {
        EndTime: '',
        StartTime: '',
        Domain: '',
        RobotCode: '',
    }

    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
            $('#datefrom').datepicker('setEndDate', maxDate);
            /*resetValidateEffectiveDate();*/
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            /*resetValidateEndDate();*/
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }


    setTimeout(function () {
        loadDate();
    }, 200);

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>' + 
        '<a ng-click="runAllCrawler()">< p class="text-underline fs9 mb5 pt3 ng-binding" > Run All!</p> </a> ';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/BotSessionManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.StartTime = $scope.model.StartTime;
                d.EndTime = $scope.model.EndTime;
                d.RobotCode = $scope.model.RobotCode;
                d.Domain = $scope.model.Domain;
                
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"ID" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSessionCode').withTitle('{{"BOT_SESS_SESSION_CODE" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"BOT_SESS_URL" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListKeyWord').withTitle('{{"BOT_SESS_KEYWORD" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RobotCode').withTitle('{{"BOT_SESS_ROBOTCODE" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataStoragePath').withTitle('{{"BOT_SESS_DATA_STORAGE" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ConfigSelectorJson').withTitle('{{"BOT_SESS_CONFIG" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        return "*****"
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeepScan').withTitle('{{"BOT_SESS_DEEPSCAN" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data;
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('IsDownloadFile').withTitle('{{"BOT_SESS_DOWNLOAD" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span class="cursor fa fa-circle-o text-danger fs20 pTip-right btn-publish-inline"></span> '
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Report').withTitle('{{"BOT_SESS_REPORTSUMM" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, full, type) {
        return '<a title="View" ng-click="view(' + type.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: blue;" class="fa-solid fa-eye fs25"></i></a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"BOT_SESS_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<!-- <a title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding-right: 10px; class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> --> <a title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>'; //+
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
    $scope.view = function (id) {
        location.href = `/Admin/ReportSummary#index?id=${id}`;
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotSessionManagement + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
        });
    };
    $scope.edit = function (id) {
        var data = {};
        var listdata = $('#tblDataSubject').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                data = listdata[i];
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotSessionManagement + '/editt.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
            reloadData();
        });
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
    
    $scope.order = [{ Code: 1, Name: "LC-9094" },
    { Code: 2, Name: "LC-9095" },
    { Code: 3, Name: "LC-9096" },
    { Code: 4, Name: "LC-9097" },
    ];
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderBotSessionManagementMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
    $scope.ListDomain = [
        { "id": '1', "label": 'Abarth' },
        { "id": '2', "label": 'Alfa Romeo' },
        { "id": '3', "label": 'Alpine' },
        { "id": '4', "label": 'Aston Martin' },
        { "id": '5', "label": 'Audi' },
        { "id": '6', "label": 'Bentley' },
        { "id": '7', "label": 'BMW' }];
    $scope.selectedDomain = []
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
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Url: '',
        KeyWord: '',
        ListKeyWord: [],
        DataStoragePath: 'https/117.6.131.222/crawlerdate/cv1.html',
        ConfigSelectorJson: '',
        DeepScan: '',
        IsDownloadFile: 'true',
        BotSessionCode: '',
        RobotCode:'',
    };
    $scope.ListRobot = [{ Code: '1', Name: 'LC-9094' },
        { Code: '2', Name: 'LC-9095' },
        { Code: '3', Name: 'LC-9096' },
        { Code: '4', Name: 'LC-9097' }];
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];

    $scope.listDataType = [
        { Code: 'TEXT', Name: caption.LMS_COURSE_MSG_STRING },
        { Code: 'NUMBER', Name: caption.LMS_COURSE_MSG_NUMBER },
        { Code: 'MONEY', Name: caption.LMS_COURSE_PRECEDENT },
        { Code: 'DATETIME', Name: caption.LMS_COURSE_DATE }];
    $scope.flag = [
        { Code: '1', Name: caption.LMS_COURSE_PRESENTLY },
        { Code: '2', Name: caption.LMS_COURSE_HIDE }];
    $scope.order = [
        { Code: '1', Name: caption.LMS_COURSE_NUMBER_1 },
        { Code: '2', Name: caption.LMS_COURSE_NUMBER_2 }];
    $scope.group = [
        { Code: '1', Name: caption.LMS_COURSE_GROUP_1 },
        { Code: '2', Name: caption.LMS_COURSE_GROUP_2 }];
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
        var valueKeyword = $scope.model.KeyWord;
        // nếu keyword chưa có 
        if ($scope.model.ListKeyWord.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeyWord.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.KeyWord = "";

    }
    $scope.submit = function () {
        if ($rootScope.validationOptions) {
            // lấy giá trị từ ckeditor
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
        BotCode: para.BotCode,
    }
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];
    $scope.listDataType = [
        { Code: 'TEXT', Name: caption.LMS_COURSE_MSG_STRING },
        { Code: 'NUMBER', Name: caption.LMS_COURSE_MSG_NUMBER },
        { Code: 'MONEY', Name: caption.LMS_COURSE_PRECEDENT },
        { Code: 'DATETIME', Name: caption.LMS_COURSE_DATE }];
    $scope.flag = [
        { Code: '1', Name: caption.LMS_COURSE_PRESENTLY },
        { Code: '2', Name: caption.LMS_COURSE_HIDE }];
    $scope.order = [
        { Code: '1', Name: caption.LMS_COURSE_NUMBER_1 },
        { Code: '2', Name: caption.LMS_COURSE_NUMBER_2 }];
    $scope.group = [
        { Code: '1', Name: caption.LMS_COURSE_GROUP_1 },
        { Code: '2', Name: caption.LMS_COURSE_GROUP_2 }];
    $scope.ListKeyWord = [
        {
            Code: "1",
            Name: 'Facebbok.com'
        }, {
            Code: "2",
            Name: 'Vietnam.net'
        },];
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



