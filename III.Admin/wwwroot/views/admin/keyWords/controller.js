var ctxfolderKeyWords = "/views/admin/keyWords";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderEDMSRepository = "/views/admin/edmsRepository";
var ctxfolderKeyWordsMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber', 'youtube-embed']).
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
            $http.post('/Admin/Keywords/Delete?id=' + data).then(callback);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsCourse/GetListSubject').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/KeyWords/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/KeyWords/UpdateAll/', data).then(callback);
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
}); app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.Code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.KeyWord), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.KeyWordGroup) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                Code: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_TITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.SET_IC_MAN_CURD_LBL_ICON_TITLE).replace('{1}', '255')
                },
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.KeyWord),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.KeyWord).replace('{1}', '50')
                },
            }
        }
    });
    $scope.selectedDomain = [];
    $rootScope.StatusData = [{
        Value: true,
        Name: "Hoạt động"
    }, {
        Value: false,
        Name: "Không hoạt động"
    }];

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/KeyWords/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderKeyWords + '/index-course.html',
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
    $scope.ListKeyWord = [
        {
            Code: "1",
            Name: 'Facebbok.com'
        }, {
            Code: "2",
            Name: 'Vietnam.net'
        },];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/KeyWords/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $rootScope.Id;
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
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectCode').withTitle('{{"LMS_SM_CODE_SUBJECT" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('KeyWord').withTitle('{{"KeyWord" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('KeyWordGroup').withTitle('{{"KeyWord Group" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return data /*==='<span><i class="fa fa-file-code-o" style="color: orange"><a href="/Admin/EDMSRepository"></a></i></span>'*/;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"Operation" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
            '<a ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
    })); /*URL_LIST_TXT_SETTING*/
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
    $scope.path = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderEDMSRepository + '/index.html',
            controller: 'index',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
        });
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderKeyWords + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });

        modalInstance.result.then(function (d) {
            $scope.reload();
            
        }, function () {
        });
    };
    $scope.search = function () {
        //if ($scope.model.Name === '' || $scope.model.Name == null) {
        //    App.toastrWarning('Nhập điều kiện tìm kiếm');
        //} else {
        //    reloadData(true);
        //}
        reloadData(true);
    }
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
            templateUrl: ctxfolderKeyWords + '/edit.html',
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
    $scope.popupVideo = function (id) {
        App.blockUI({
            target: "#contentMainSubjectManage",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getSubject(id, function (rs) {
            rs = rs.data;
            $rootScope.SubjectCode = rs.SubjectCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderKeyWords + '/popup-video.html',
                controller: 'popupVideo',
                backdrop: 'static',
                backdropClass: 'custom-black full-opacity',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '90'
            });
            modalInstance.result.then(function (d) {
                App.unblockUI("#contentMainSubjectManage");
                $rootScope.data = null;
                //$scope.reload();
            }, function () {
            });
        });
    }

    $scope.search = function () {
        //if ($scope.model.Name === '' || $scope.model.Name == null) {
        //    App.toastrWarning('Nhập điều kiện tìm kiếm');
        //} else {
        //    reloadData(true);
        //}
        reloadData(true);
    }
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
            templateUrl: ctxfolderKeyWordsMessage + '/messageConfirmDeleted.html',
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
        $scope.isSearch = false;
        $scope.showSearch = function () {
            if (!$scope.isSearch) {
                $scope.isSearch = true;
            } else {
                $scope.isSearch = false;
            }
        }
    }
    $scope.viewLectureDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderKeyWords + '/viewLecture.html',
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
            templateUrl: ctxfolderKeyWords + '/viewQuestion.html',
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
app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
        KeyWord: para.KeyWord,
        KeyWordGroup: para.KeyWordGroup,
    }
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
    $scope.submit = function () {
        dataservice.updateAll($scope.model, function (rs) {

            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
            $rootScope.reloadNoResetPage();
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCourse', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        KeyWord: '',
        KeyWordGroup: '',
    };
    $scope.ListExtension = [
        { Code: '1', Name: '.COM' },
        { Code: '2', Name: '.VN' },
        { Code: '3', Name: '.COM.VN' },
        { Code: '4', Name: '.NET' }];
    $scope.ListKeyWord = [
        {
            Code: "1",
            Name: 'Facebbok.com'
        }, {
            Code: "2",
            Name: 'Vietnam.net'
        }];
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.LMS_COURSE_IMAGE_FORMAT_FAIL);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
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
    $scope.init = function () {
        dataservice.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('WorkContent', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['WorkContent'].config.height = 80;
    }
    $scope.ListStatus = [
        { Code: '1', Name: 'Action Stop' },
        { Code: '2', Name: 'Action Pause' }];
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];

    //$scope.init();
    $rootScope.validationOptions = {
        rules: {
            Id: {
                required: true
            },
            DomainName: {
                required: true
            },
        },
        messages: {
            Id: {
                //required: "Tên danh mục không được bỏ trống",
                required: caption.DOM_NO_LACK_ID,
            },
            DomainName: {
                //required: "Alias không được bỏ trống",
                required: caption.DOM_NOT_LEAVE_DOMAIN_BLANK,
            },
        }
    }
    $scope.submit = function () {
        if ($rootScope.validationOptions) {
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
            modalInstance.result.then(function (d) {
                $rootScope.reloadNoResetPage();
            }, function () {
            });
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});



