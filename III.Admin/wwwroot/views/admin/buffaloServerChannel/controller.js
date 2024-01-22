var ctxfolderBuffaloServerChannel = "/views/admin/buffaloServerChannel";
var ctxfolderBuffaloInstantRunningMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["App_ESEIM", "ui.bootstrap", "ngRoute", "ngValidate", "datatables",
    "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm',
    "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate",
    'dynamicNumber', "angularjs-dropdown-multiselect"]).
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
        delete: function (data, callback) {
            $http.post('/Admin/BuffaloServerChannel/Delete?id=' + data).then(callback);
        },
        getListData: function (data, callback) {
            $http.post('/Admin/BuffaloServerChannel/GetListData?id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/BuffaloServerChannel/UpdateAll' , data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/BuffaloServerChannel/Insert', data).then(callback);
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
    $translateProvider.useUrlLoader('/Admin/BuffaloServerChannel/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderBuffaloServerChannel + '/index-course.html',
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
        ChannelId: '',
        ChannelTitle: '',
        ServerWebsync: '',
        Status: '',
        Flag: ''

    };

    $scope.ListStatus =
        [{ Code: '0', Name: 'true' },
        { Code: '1', Name: 'false' }];
    $scope.ListServer = [
        { Code: '1', Name: 'Server 1' },
        { Code: '2', Name: 'Server 2' }];


   
    $scope.initData = function () {
       
    };

    $scope.initData();
    
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
  /*  var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];*/
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
            url: "/Admin/BuffaloServerChannel/JTable",
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
   /* vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle("Id").withOption('sClass', 'nowrap w30').notSortable()
        .renderWith(function (data, type, full, meta) {
            //$scope.selected[full.Id] = false;
            //return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
            return data;
        }));*/
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"Id" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ChannelId').withTitle('{{"Tên Kênh" | translate}}').withOption('sClass', 'nowrap w200 style_p').renderWith(function (data, type, full) {
        var datatime = full.CreatedTime != "" ? $filter('date')(new Date(full.CreatedTime), 'dd/MM/yyyy hh:mm:ss') : null;
        return '<span style="font-size: 20px;">' + data + "/" + full.ChannelTitle + "<\span> <br>"
            + '<p style="color: green;font-size: 11px;">' + full.CreatedBy +  "<br>" 
             + "(" + datatime +") <\p>";
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServerWebsync').withTitle('{{"Máy Chủ" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"Trạng Thái" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        if (data == "True") {
            return '<div class="activity lead blink">🟢</div >'
        }
        else {
            return '<div class="activity lead noblink">⚫</div > '
        }
    }));
  

    vm.dtColumns.push(DTColumnBuilder.newColumn("Action").withTitle("Action").withOption('sClass', 'nowrap w100').notSortable()
        .renderWith(function (data, type, full, meta) {
            // Id not id
            /*$scope.selected[full.Id] = false;*/
            return '  <a title="Edit" ng-click="edit(' + full.Id + ')" ><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs20 Pading_Icon"></i></a>     '
                + ' <a title="Copy" ng-click="copy(' + full.Id + ')"><i style="--fa-primary-color: green;" class="fa-solid fa-copy fs20 Pading_Icon"></i></a>      '
                + ' <a title="Delete" ng-click="delete(' + full.Id + ')"><i style="--fa-primary-color: green;" class="fa-solid fa-trash fs20 Pading_Icon"></i></a> ';

        }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};


    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    /*function callback(json) {

    }*/
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBuffaloServerChannel + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
        });
    };
    $scope.copy = function (id) {
        dataservice.getListData(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderBuffaloServerChannel + '/Copy.html',
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
    $scope.delete = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderBuffaloInstantRunningMessage+ '/messageConfirmDeleted.html',
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
    $scope.edit = function (id) {
        dataservice.getListData(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderBuffaloServerChannel + '/edit.html',
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
    $scope.initData = function () {
    }
    // Anything else
    $scope.initData();
    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }

    /*function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }*/
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
app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    
    
    $scope.model = {
        Id: para.Id,
        ChannelId: para.ChannelId,
        ChannelTitle: para.ChannelTitle,
        ServerWebsync: para.ServerWebsync,
        Status: para.Status,
        Flag: para.Flag
    };
    $scope.ListStatus =
        [{ Code: '0', Name: 'true' },
        { Code: '1', Name: 'false' }];
    $scope.ListServer = [
        { Code: '1', Name: 'Server 1' },
        { Code: '2', Name: 'Server 2' }];
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
       
        dataservice.update($scope.model, function (rs) {
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
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        ChannelId: '',
        ChannelTitle: '',
        ServerWebsync: '',
        Status: '',
        Flag: ''

    };

    $scope.ListStatus =
        [{ Code: '0', Name: 'true' },
        { Code: '1', Name: 'false' }];
    $scope.ListServer = [
        { Code: '1', Name: 'Server 1' },
        { Code: '2', Name: 'Server 2' }];


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
    $scope.submit = function () {
        if ($rootScope.validationOptions) {
            // lấy giá trị từ ckeditor

            if ($scope.model.BotSessionCode != "") {
               
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
app.controller('copy', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        ChannelId: para.ChannelId,
        ChannelTitle: para.ChannelTitle,
        ServerWebsync: para.ServerWebsync,
        Status: para.Status,
        Flag: para.Flag
    };
    $scope.ListStatus =
        [{ Code: '0', Name: 'true' },
        { Code: '1', Name: 'false' }];
    $scope.ListServer = [
        { Code: '1', Name: 'Server 1' },
        { Code: '2', Name: 'Server 2' }];


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
