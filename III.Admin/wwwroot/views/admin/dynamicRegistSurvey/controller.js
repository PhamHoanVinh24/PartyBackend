var ctxfolderSVC = "/views/admin/dynamicRegistSurvey";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_SVC', ["ui.bootstrap", "angularjs-dropdown-multiselect", 'ng.jsoneditor', 'dynamicNumber', "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'ngFileUpload']);

app.factory('dataserviceSVC', function ($http) {
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
    return { //API   get : get data and not do anything with this 
        insertDynamic: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/InsertDynamic', data).then(callback);
        },
        updateDynamic: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/UpdateDynamic', data).then(callback);
        },
        deleteDynamic: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/DeleteDynamic/' + data).then(callback);
        },
        getItemDynamic: function (data, callback) {
            $http.get('/Admin/DynamicRegistSurvey/GetItemDynamic/' + data).then(callback);
        },
        getRepeatDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetRepeatDynamic').then(callback);
        },
        getStatusDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetStatusDynamic').then(callback);
        },
        getTypeDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetTypeDynamic').then(callback);
        },
        insertDataLogger: function (data, callback) {
            $http.post('/Admin/CardJob/InsertDataLogger', data).then(callback);
        },
        getAllEvent: function (callback) {
            $http.get('/Admin/MeetingSchedule/GetAllEvent').then(callback);
        },
        updateOnDrag: function (data, callback) {
            $http.post('/Admin/MeetingSchedule/UpdateOnDrag', data).then(callback);
        },
        getMealDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetMealDynamic').then(callback);
        },
        getTravelDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetTravelDynamic').then(callback);
        },
        getSportDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetSportDynamic').then(callback);
        },
        getStudyDynamic: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetStudyDynamic').then(callback);
        },
        getDynamicAttributes: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetDynamicAttributes?groupCode=' + data).then(callback);
        },
        insertRegist: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/InsertRegist', data).then(callback);
        },
        getlistRegist: function (callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetlistRegist').then(callback);
        },
        getGroupAttr: function (callback) {
            $http.post('/Admin/AttributeSetup/GetGroupAttr').then(callback);
        },
        getDataAllRegist: function (data, callback) {
            $http.get('/Admin/DynamicRegistSurvey/GetDataAllRegist?surveyCode=' + data).then(callback);
        },
        getStatProcedure: function (data, callback) {
            $http.post('/Admin/DynamicRegistSurvey/GetStatProcedure?Input=' + data).then(callback);
        },

    }
});
app.directive('bDatepicker', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            el.datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function () {
                if (el.valid()) {
                    el.removeClass('invalid').addClass('success');
                }
            });
            var noStartDate = false;
            var startDate = new Date();
            if (attr.noStartDate != null && attr.noStartDate != "") {
                scope.$watch($parse(attr.noStartDate), function (newval) {
                    noStartDate = newval;
                    if (newval == true) {
                        el.datepicker('setStartDate', new Date(1960, 01, 01));
                    }
                    else {
                        el.datepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.startDate != null && attr.startDate != "") {
                scope.$watch($parse(attr.startDate), function (newval) {
                    startDate = newval;
                    if (newval == true) {
                        el.datepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.endDate != null && attr.endDate != "") {
                scope.$watch($parse(attr.endDate), function (newval) {
                    endDate = newval;
                    if (newval == true) {
                        el.datepicker('setEndDate', endDate);
                    }
                });
            }
        }
    };
});
app.directive('customOnChangeLms', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeLms);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});
app.controller('Ctrl_ESEIM_SVC', function ($scope, $rootScope, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                SurveyCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
            },
            messages: {
                SurveyCode: {
                    required: caption.DNM_VALIDATE_SURVEY_CODE,
                },
                Title: {
                    required: caption.DNM_VALIDATE_TITLE,
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $locationProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/DynamicRegistSurvey/Translation');
    $locationProvider.hashPrefix('');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderSVC + '/index.html',
            controller: 'index'
        })
        .when('/addRegist', {
            templateUrl: ctxfolderSVC + '/addRegist.html',
            controller: 'addRegist'
        })
        .when('/total', {
            templateUrl: ctxfolderSVC + '/total.html',
            controller: 'total'
        })
        .when('/registMeal', {
            templateUrl: ctxfolderSVC + '/registMeal.html',
            controller: 'registMeal'
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

});
app.controller('index', function ($scope, $rootScope, $filter, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, dataserviceSVC) {
    // declare variable : khai báo biến
    $scope.model = {
        Keyword: '',
        Type: '',
        GroupCode: '',
    }
    $scope.TypeDynamic = [
        dangKy = "đăng ký",
        khaoSat = "Khảo sát",
    ];
    // config main table 
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DynamicRegistSurvey/JTableDy",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Keyword = $scope.model.Keyword;
                d.Type = $scope.model.Type;
                d.GroupCode = $scope.model.GroupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
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

    // creat collumn
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    // creat column ID
    vm.dtColumns.push(DTColumnBuilder.newColumn('SurveyCode').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"DNM_SURVEY_CODE" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    // creat column ID
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('<i class="fa fa-paper-plane mr5 "></i>{{"DNM_TITLE" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, full, type) {

        return '<span>' + ' ' + ' </span>' + '<span style =" font - family: system - ui; font-weight : 700;font - size: 15px;">' + type.Title + '</span>' + '<br>' + '<span></span>' + '[' + '<span  style = "color: #2bb742 !important;">' + ' ' + data + ' ' + '</span>' + ']'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"DNM_TYPE_TICKET" | translate }}').withOption('sClass', 'nowrap w20', 'dashed').renderWith(function (data, full, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"DNM_GROUP_TICKET" | translate }}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"DNM_STATUS" | translate }}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Prioritized').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"DNM_PRIOR" | translate }}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return data;
    }));
    // tạo stick thao tác
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').notSortable().withOption('sClass', 'w40').withTitle('{{"Flag" | translate}}').renderWith(function (data, full, type) {
        return '<a title="Xoá" ng-click="delete(' + type.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(
        All, selectedItems) {
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
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy');

    // init function to populate data to controller

    $scope.initData = function () {
        dataserviceSVC.getTypeDynamic(function (rs) {
            rs = rs.data;
            $rootScope.listTypeDynamic = rs;
        });
        dataserviceSVC.getStatusDynamic(function (rs) {
            rs = rs.data;
            $rootScope.listStatusDynamic = rs;
        });
        dataserviceSVC.getRepeatDynamic(function (rs) {
            rs = rs.data;
            $rootScope.listRepeatDynamic = rs;
        });
        dataserviceSVC.getGroupAttr(function (rs) {
            rs = rs.data;
            $scope.lstAttrGroup = rs;
        });
    }
    // Anything else
    $scope.initData();

    // toggle on off search box
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    // popup add form to insert data into database
    $scope.add = function () {
        $rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSVC + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        },
            function () {
            });
    }
    $scope.addRegist = function () {
        $rootScope.ServiceCode = '';
        templateUrl: ctxfolderSVC + '/addRegist.html';
        controller: 'addRegist';
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AttrDataType" && $scope.modelAttr.AttrDataType != "") {
            $scope.errorAttrDataType = false;
        }
        //if (SelectType == "AttrUnit" && $scope.modelAttr.AttrUnit != "") {
        //    $scope.errorAttrUnit = false;
        //}
        if (SelectType == "AttrGroup" && $scope.modelAttr.AttrGroup != "") {
            $scope.errorAttrGroup = false;
            $scope.reload();
        }
    }

    // popup edit form to edit existing data in database
    $scope.edit = function (id) {
        dataserviceSVC.getItemDynamic(id, function (rs) {
            rs = rs.data;
            console.log(rs);
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderSVC + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            console.log(rs.Object);
                            return rs.Object;

                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }
        });
    }
    // popup confirm dialog to delete existing data in database
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSVC.deleteDynamic(id, function (rs) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    setTimeout(function () {

    }, 50);
});
app.controller('add', function ($scope, $uibModalInstance, dataserviceSVC, $rootScope, Upload) {  // add = insert
    // declare variable
    $scope.model = {
        SurveyCode: '',
        Title: '',
        Type: '',  // Kiểu phiếu 
        GroupCode: '',
        Repeat: '',  // Lặp lại
        Status: '',   //Trạng thái
        Description: '',
        Prioritized: '',
        GroupTitle: '',
        ImageCover: '',
    }
    $scope.id = '';
    $scope.file = '';
    $scope.listFile = [];
    $scope.listFileRemove = [];
    // init signature

    $scope.init = function () {
        dataserviceSVC.getGroupAttr(function (rs) {
            rs = rs.data;
            $scope.lstAttrGroup = rs;
        })
    };
    // run after declare it
    $scope.init();
    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImageCover = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
            App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.ImageCover = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };
    // submit to save model to database
    $scope.addDynamic = function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Description = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.id == '') {
                dataserviceSVC.insertDynamic($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.id = rs.Object; //id return from insert header
                        $uibModalInstance.close(); //close popup when finish but not necessary
                    }
                });
            }
        }
    }

    // listen when user choose a item in combobox

    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
    //collapse variable
    var expandCollapseApp = angular.module('expandCollapseApp', ['ngAnimate']);
    expandCollapseApp.controller('expandCollapseCtrl', function ($scope) {
        $scope.active = true;
        $scope.active1 = true;

    });
    // change combobox event handler
    $scope.changeData = function (type) {
        if (type == 'Type') {
            $scope.errorType = false;
        }
        if (type == 'GroupName') {
            $scope.errorGroupName = false;
        }
        if (type == 'Repeat') {
            $scope.errorRepeat = false;
        }
    }
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Type == null || data.Type == '' || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        }
        if (data.GroupName == null || data.GroupName == '' || data.GroupName == undefined) {
            $scope.errorGroupName = true;
            mess.Status = true;
        }
        if (data.Repeat == null || data.Repeat == '' || data.Repeat == undefined) {
            $scope.errorRepeat = true;
            mess.Status = true;
        }
        return mess;
    };
    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
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
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }
    // a function that run later instead of instantly
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $filter, $confirm, $uibModalInstance, dataserviceSVC, para, Upload) {
    // declare variable
    $scope.model = {
        SurveyCode: '',
        Title: '',
        Type: '',  // Kiểu phiếu 
        GroupCode: '',
        Repeat: '',  // Lặp lại
        Status: '',   //Trạng thái
        Description: '',
        Prioritized: '',
        GroupTitle: '',
        ImageCover: '',
    }
    //Show, hide header  
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }
    $scope.model = para;
    // init signature

    $scope.init = function () {
        dataserviceSVC.getGroupAttr(function (rs) {
            rs = rs.data;
            $scope.lstAttrGroup = rs;
        })
    };
    // run after declare it
    $scope.init();
    // submit change
    $scope.loadImageCover = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
            App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.ImageCover = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };
    $scope.submitDynamic = function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Description = data;
        }
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataserviceSVC.updateDynamic($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    // convert Array to String 
                }
            });
        }
    }
    // change combobox event handler
    $scope.changeData = function (type) {
        if (type == 'Type') {
            $scope.errorType = false;
        }
        if (type == 'GroupName') {
            $scope.errorGroupName = false;
        }
        if (type == 'Repeat') {
            $scope.errorRepeat = false;
        }
    }
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Type == null || data.Type == '' || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        }
        if (data.GroupName == null || data.GroupName == '' || data.GroupName == undefined) {
            $scope.errorGroupName = true;
            mess.Status = true;
        }
        if (data.Repeat == null || data.Repeat == '' || data.Repeat == undefined) {
            $scope.errorRepeat = true;
            mess.Status = true;
        }
        return mess;
    };
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setStartDate', maxDate);
            if ($('#datefrom input').valid()) {
                $('#datefrom input').removeClass('invalid').addClass('success');
            }
        });
        $("#acceptanceTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
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
            format: "dd/mm/yyyy",
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
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }
    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor1 = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    // a function that run later instead of instantly
    setTimeout(function () {
        //validationSelect();
        ckEditer();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('addRegist', function ($scope, $rootScope, dataserviceSVC) {  // add = insert
    // declare variable
    $scope.model = {
        SurveyCode: '',
        Title: '',
        Type: '',  // Kiểu phiếu 
        GroupCode: '',
        Repeat: '',  // Lặp lại
        Status: '',   //Trạng thái
        Description: '',
        Prioritized: '',
        GroupTitle: '',
    }
    $scope.id = '';    // init signature

    $scope.init = function () {
        dataserviceSVC.getlistRegist(function (rs) {
            rs = rs.data;
            $rootScope.listRegist = rs;
            console.log($rootScope.listRegist);
        });
    };
    // run after declare it
    $scope.init();
    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
    // jump data into registMeal in change page ;
    $scope.registMeal = function (x) { // add a valible x to function
        location.href = `/Admin/DynamicRegistSurvey#registMeal?SurveyCode=${x.SurveyCode}&Repeat=${x.Repeat}&GroupCode=${x.GroupCode}&GroupName=${x.GroupName}`; // constructor URL location ,
    }
    $scope.registStudy = function (x) { // add a valible x to function
        location.href = `/Admin/DynamicRegistSurvey#registMeal?SurveyCode=${x.SurveyCode}&Repeat=${x.Repeat}&GroupCode=${x.GroupCode}&GroupName=${x.GroupName}`; // constructor URL location ,
    }
    $scope.registSport = function (x) { // add a valible x to function
        location.href = `/Admin/DynamicRegistSurvey#registMeal?SurveyCode=${x.SurveyCode}&Repeat=${x.Repeat}&GroupCode=${x.GroupCode}&GroupName=${x.GroupName}`; // constructor URL location ,
    }
    $scope.registTravel = function (x) { // add a valible x to function
        location.href = `/Admin/DynamicRegistSurvey#registMeal?SurveyCode=${x.SurveyCode}&Repeat=${x.Repeat}&GroupCode=${x.GroupCode}&GroupName=${x.GroupName}`; // constructor URL location ,
    }
    //collapse variable
    var expandCollapseApp = angular.module('expandCollapseApp', ['ngAnimate']);
    expandCollapseApp.controller('expandCollapseCtrl', function ($scope) {
        $scope.active = true;
        $scope.active1 = true;

    });
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        return mess;
    };
    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
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
            resetValidateEffectiveDate();
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

    // a function that run later instead of instantly
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('registMeal', function ($scope, $filter, $location, dataserviceSVC, $timeout) {
    $scope.model = {
        SurveyCode: '',
    }
    $scope.model.AttrValue = {};
    $scope.modelMeal = {
        listMealDynamic: [], //
        listMealDynamicDefault: [] // 1 bộ dữ liệu default listStudyDynamic
    }
    $scope.listDataAllRegist = [];
    $scope.initData = function () {
        $scope.model.SurveyCode = $location.search().SurveyCode;   // receive data from addRegist controller
        $scope.model.Repeat = $location.search().Repeat;
        $scope.model.GroupCode = $location.search().GroupCode;
        $scope.model.GroupName = $location.search().GroupName;
        dataserviceSVC.getDynamicAttributes($scope.model.GroupCode, function (rs) {
            rs = rs.data;
            $scope.modelMeal.listMealDynamic = rs;
            $scope.modelMeal.listMealDynamicDefault = angular.copy($scope.modelMeal.listMealDynamic);
        });
        dataserviceSVC.getDataAllRegist($scope.model.SurveyCode, function (rs) {
            rs = rs.data;
            $scope.listDataAllRegist = JSON.parse(rs);
        });
    }
    $scope.model.Date = $filter("date")(new Date(), 'dd/MM/yyyy');
    $scope.initData();
    // add meal regist
    $scope.addRegistData = function () {
        if ($scope.model.Repeat == 'REPEAT_DYNAMIC_NONE') {
            console.log($scope.model.Repeat);
            $scope.listDataAllRegist = [];
            var objDate = {  // tạo một object ảo chứa 2 thuộc tính 
                Date: $scope.model.Date,
                Values: []
            }
            for (var j = 0; j < $scope.modelMeal.listMealDynamic.length; j++) {
                var objAttr = {
                    Group: $scope.modelMeal.listMealDynamic[j].Group,
                    Value: $scope.modelMeal.listMealDynamic[j].Value,
                    Code: $scope.modelMeal.listMealDynamic[j].Code,
                    Name: $scope.modelMeal.listMealDynamic[j].Name,
                    Unit: $scope.modelMeal.listMealDynamic[j].Unit,
                    DataType: $scope.modelMeal.listMealDynamic[j].DataType,
                };
                objDate.Values.push(objAttr);
            };
            $scope.listDataAllRegist.push(objDate);
            $scope.model.AttrValue = JSON.stringify($scope.listDataAllRegist);
        }
        else {
            var objDate = {
                Date: $scope.model.Date,
                Values: []
            }
            for (var j = 0; j < $scope.modelMeal.listMealDynamic.length; j++) {
                var objAttr = {
                    Group: $scope.modelMeal.listMealDynamic[j].Group,
                    Value: $scope.modelMeal.listMealDynamic[j].Value,
                    Code: $scope.modelMeal.listMealDynamic[j].Code,
                    Name: $scope.modelMeal.listMealDynamic[j].Name,
                    Unit: $scope.modelMeal.listMealDynamic[j].Unit,
                    DataType: $scope.modelMeal.listMealDynamic[j].DataType,
                };
                objDate.Values.push(objAttr);
            };
            if ($scope.listDataAllRegist == null) {
                $scope.listDataAllRegist = [];

            }
            else {
                var index = $scope.listDataAllRegist.findIndex(x => x.Date == $scope.model.Date); // khai báo biến index : findindex
                if (index != -1) { // nếu giá trị khác -1 thì Date = Date chứa trong object
                    $scope.listDataAllRegist.splice(index, 1);
                }
            }
            $scope.listDataAllRegist.push(objDate);
            $scope.model.AttrValue = JSON.stringify($scope.listDataAllRegist);
        }
        dataserviceSVC.insertRegist($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.id = rs.Object; //id return from insert header
                //close popup when finish but not necessary
                dataserviceSVC.getDataAllRegist($scope.model.SurveyCode, function (rs) {
                    rs = rs.data;
                    $scope.listDataAllRegist = JSON.parse(rs);
                });
            }
        });
    }
    // add = insert
    $scope.search = function () {
        $('#calendar').fullCalendar('refetchEvents');
    }
    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: false,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            monthNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            monthNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            buttonText: {
                today: caption.STRE_CURD_TAB_WORK_CALENDAR_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            select: function (start) {
                var date = start.format("DD/MM/YYYY"); // khai bao 1 bien dung tam, format du lieu cho dau ra 
                $scope.model.Date = start.format("DD/MM/YYYY");
                var index = $scope.listDataAllRegist.findIndex(x => x.Date == date); // khai báo biến index : findindex
                if (index != -1) { // nếu giá trị khác -1 thì Date = Date chứa trong object
                    $scope.modelMeal.listMealDynamic = $scope.listDataAllRegist[index].Values;
                    $timeout(function () {  // khắc phục lỗi của Query với Angular
                        $scope.$apply();
                    });
                }
                else {
                    $scope.modelMeal.listMealDynamic = angular.copy($scope.modelMeal.listMealDynamicDefault); // trả về bộ dữ liệu default
                    $timeout(function () {
                        $scope.$apply();
                    });
                }
            },
        });

    }
    setTimeout(function () {
        loadCalendar("calendar");
    }, 500);
    $scope.total = function () {
        location.href = `/Admin/DynamicRegistSurvey#total?GroupCode=${$scope.model.GroupCode}`;
    }
});
app.controller('total', function ($scope, dataserviceSVC, $location) {
    $scope.model = {
        GroupCode: '',
    }
    $scope.listDataSelect = [];
    // receive data from addRegist controller
    $scope.initData = function () {
        $scope.model.GroupCode = $location.search().GroupCode;
    }
    $scope.initData1 = function () {
        dataserviceSVC.getDynamicAttributes($scope.model.GroupCode, function (rs) {
            rs = rs.data;
            $scope.listDynamicAttributes = rs;

            $scope.Array = [];
            for (var j = 0; j < $scope.listDynamicAttributes.length; j++) {
                var objAttr = {
                    id: $scope.listDynamicAttributes[j].Code,
                    label: $scope.listDynamicAttributes[j].Name,
                };
                $scope.Array.push(objAttr);
            };
            console.log($scope.Array);
        });
    }
    $scope.initData();
    $scope.initData1();
    $scope.multiselectsettings = {
        checkBoxes: true,
        dynamicTitle: false,
        showUncheckAll: false,
        showCheckAll: false
    };
    $scope.listAttr = [];
    $scope.addAttr = function (item) {
        $scope.listAttr.push({
            Name: item.Name,
            Code: item.Code,
        });
        console.log($scope.listAttr);
    }
    // not have remove function there
    $scope.removeAttr = function (item) {
        var index = $scope.listAttr.findIndex(x => x.Name == item.Name);
        if (index != -1) {
            $scope.listAttr.splice(index, 1);
        }
        console.log($scope.listAttr);
    }
    
    $scope.submitData = function () {
        $scope.listDataSelect = [];
        for (var i = 0; i < $scope.listAttr.length; i++) {
            for (var j = 0; j < $scope.listDynamicAttributes.length; j++) {
                if ($scope.listAttr[i].Code == $scope.listDynamicAttributes[j].Code) {
                    var listDataSelect = {
                        Code: $scope.listDynamicAttributes[j].Code,
                        Name: $scope.listDynamicAttributes[j].Name,
                        DataType: $scope.listDynamicAttributes[j].DataType,
                        Unit: $scope.listDynamicAttributes[j].Unit,
                    }
                    $scope.listDataSelect.push(listDataSelect);
                }
            }

        }
    }
    $scope.search = function () {
        var listDataSearch = [];
        for (var i = 0; i < $scope.listDataSelect.length; i++) {
            listDataSearch.push({
                AttrCode: $scope.listDataSelect[i].Code,
                Value: $scope.listDataSelect[i].Value,
                StartValue: $scope.listDataSelect[i].StartValue,
                EndValue: $scope.listDataSelect[i].EndValue,
                DataType: $scope.listDataSelect[i].DataType
            });
        }
        var inPut = JSON.stringify(listDataSearch);
        console.log(inPut);
        
        dataserviceSVC.getStatProcedure(inPut, function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.listResult = rs;
        })
    }
});