var ctxfolderBotManagement = "/views/admin/botSocialManagement";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderBotManagementMessage = "/views/message-box";
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
        
        delete: function (data, callback) {
            $http.post('/Admin/BotSocialManagement/Delete?id=' + data).then(callback);
        },

        insert: function (data, callback) {
            $http.post('/Admin/BotSocialManagement/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/BotSocialManagement/UpdateAll/', data).then(callback);
        },
        getlistbot: function (callback) {
            $http.post('/Admin/BotSocialManagement/GetListBot').then(callback);
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
    $translateProvider.useUrlLoader('/Admin/BotSocialManagement/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderBotManagement + '/index-course.html',
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
    $scope.index = ctxfolderBotManagement + "/index-course.html";
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
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"ID" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectCode').withTitle('{{"LMS_SM_CODE_SUBJECT" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialCode').withTitle('{{"Bot Social Code" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialName').withTitle('{{"Bot Social Name " | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BotSocialCode').withTitle('{{"FB_SOCIAL_MANA_NAME" | translate}}').withOption('sClass', 'nowrap w300 first-col-sticky').renderWith(function (data, type, full) {
        return '<span ng-click="edit(' + full.Id + ')" class="bold text-underline" style="color:#ab7474">' + '#' + full.Id + ':</span>' + '<strong ng-click="edit(' + full.Id + ')"> ' + full.BotSocialName + '</strong>'
            + '<div class="fs9">' + data + '</div>';
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
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"FB_SOCIAL_OPERATION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding-right: 10px; class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> <a title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>'; //+
        //'<button title="{{"LMS_EXAM_LBL_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotManagement + '/add.html',
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
            templateUrl: ctxfolderBotManagement + '/editt.html',
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderBotManagementMessage + '/messageConfirmDeleted.html',
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
    $scope.viewLectureDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotManagement + '/viewLecture.html',
            controller: 'viewLecture',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return item;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.viewQuestionDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderBotManagement + '/viewQuestion.html',
            controller: 'viewQuestion',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return item;
                }
            }
        });
        modalInstance.result.then(function (d) {

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
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        UserName: '',
        PassWord: '',
        Tocken: '',
        Description: '',
        BotSocialCode: '',
        BotSocialName: '',
        BotSocialType: '',
        Credential: '',
        ConditionStatement:'',
    };
    $scope.ListSocial = [
        { Code: '1', Name: 'Facebook' },
        { Code: '2', Name: 'Instagram' },
        { Code: '3', Name: 'Tiktok' },
        { Code: '4', Name: 'Twitter' },
        { Code: '5', Name: 'Telegram' },
        { Code: '6', Name: 'Youtube' },
        { Code: '7', Name: 'Zalo' },
        { Code: '8', Name: 'Linkedin' },
        { Code: '9', Name: 'Quora' }       ];

   
   
    $scope.init = function () {
        
    }

    $scope.init();
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
    
    $scope.submit = function () {
        if ($rootScope.validationOptions) {
            // lấy giá trị từ ckeditor
            $scope.model.Tocken = CKEDITOR.instances.Token.getData();
            $scope.model.Description = CKEDITOR.instances.Description.getData();
            $scope.model.ConditionStatement = CKEDITOR.instances.ConditionStatement.getData();

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
        var editor = CKEDITOR.replace('Token', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Token'].config.height = 80;
    }
    function ckEditer2() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 80;
    }
    function ckEditer3() {
        var editor = CKEDITOR.replace('ConditionStatement', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ConditionStatement'].config.height = 80;
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
        ckEditer2();
        ckEditer3();
    }, 500);
});
app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
        UserName: para.UserName,
        PassWord: para.PassWord,
        Tocken: para.Tocken,
        Description: para.Description,
        BotSocialCode: para.BotSocialCode,
        BotSocialName: para.BotSocialName,
        BotSocialType: para.BotSocialType,
        Credential: para.Credential,
        ConditionStatement: para.ConditionStatement,
    };
    $scope.ListSocial = [
        { Code: '1', Name: 'Facebook' },
        { Code: '2', Name: 'Instagram' },
        { Code: '3', Name: 'Tiktok' },
        { Code: '4', Name: 'Twitter' },
        { Code: '5', Name: 'Telegram' },
        { Code: '6', Name: 'Youtube' },
        { Code: '7', Name: 'Zalo' },
        { Code: '8', Name: 'Linkedin' },
        { Code: '9', Name: 'Quora' } ];

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
        
        var check = CKEDITOR.instances['Token'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Token'].getData();
            $scope.model.Tocken = data;
        }
        var check = CKEDITOR.instances['Description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Description'].getData();
            $scope.model.Description = data;
        }
        var check = CKEDITOR.instances['ConditionStatement'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ConditionStatement'].getData();
            $scope.model.ConditionStatement = data;
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
        var editor = CKEDITOR.replace('Token', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Token'].config.height = 80;
    }
    function ckEditer2() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 80;
    }
    function ckEditer3() {
        var editor = CKEDITOR.replace('ConditionStatement', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ConditionStatement'].config.height = 80;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
        ckEditer2();
        ckEditer3();

    }, 500);
});



