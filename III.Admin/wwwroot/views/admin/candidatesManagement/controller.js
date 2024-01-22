var ctxfolder = "/views/admin/candidatesManagement";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', "ngCookies", "pascalprecht.translate", 'ngTagsInput']);
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
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
app.factory('dataservice', function ($http) {
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
        //index
        getListYear: function (callback) {
            $http.post('/Admin/CandidatesManagement/GetListYear/').then(callback);
        },
        getSkill: function (callback) {
            $http.post('/Admin/CandidatesManagement/GetSkill/').then(callback);
        },
        getCountCandidateToday: function (callback) {
            $http.post('/Admin/CandidatesManagement/GetCountCandidateToday/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CandidatesManagement/GetItem/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CandidatesManagement/Delete/' + data).then(callback);
        },

        //tab candidate info
        createCandiateCode: function (callback) {
            $http.get('/Admin/CandidatesManagement/CreateCandiateCode/').then(callback);
        },
        updateCandidateInfo: function (data, callback) {
            $http.post('/Admin/CandidatesManagement/UpdateCandidateInfo/', data).then(callback);
        },
        uploadCV: function (data, callback) {
            submitFormUpload('/Admin/CandidatesManagement/UploadFile/', data, callback);
        },
        createCandiateCode: function (callback) {
            $http.get('/Admin/CandidatesManagement/CreateCandiateCode/').then(callback);
        },
        searchCandiateCode: function (data, callback) {
            $http.get('/Admin/CandidatesManagement/SearchCandiateCode?candidateCode=' + data).then(callback);
        },
        getAutocomplete: function (data, callback) {
            $http.get('/Admin/GalaxyKeyword/GetAutocomplete?key=' + data).then(callback);
        },

        //tab candidate info more
        updateCandidateInfoMore: function (data, callback) {
            $http.post('/Admin/CandidatesManagement/UpdateCandidateInfoMore/', data).then(callback);
        },
        getLanguage: function (callback) {
            $http.post('/Admin/CandidatesManagement/GetLanguage/').then(callback);
        },

        //tab candidate event
        getEventCat: function (data, callback) {
            $http.get('/Admin/CandidatesManagement/GetEventCat?candidateCode=' + data).then(callback);
        },
        insertEventCat: function (data, callback) {
            $http.post('/Admin/CandidatesManagement/InsertEventCat', data, {
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
        deleteFrameTime: function (event, frame, callback) {
            $http.post('/Admin/CandidatesManagement/DeleteFrameTime/?id=' + event + "&frame=" + frame).then(callback);
        },
        changeFrametimeCadidate: function (id, frame, callback) {
            $http.post('/Admin/CandidatesManagement/ChangeFrametimeCadidate/?id=' + id + "&frame=" + frame).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.IsTranslate = false;
    $rootScope.dateNow = new Date();
    $rootScope.CandidateCode = "";
    $rootScope.IsEdit = false;
    $rootScope.IsAdd = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0

        $rootScope.Sex = [{
            Code: 1,
            Name: caption.CM_CURD_LBL_CM_MALE,
        }, {
            Code: 0,
            Name: caption.CM_CURD_LBL_CM_FEMALE,
            }]
        $rootScope.validationOptionsBasic = {
            rules: {
                CandidateCode: {
                    required: true
                },
                FullName: {
                    required: true,
                    maxlength: 255,
                    minlength: 6
                },
                RadioMaried: {
                    required: true,
                },
                Email: {
                    required: true,
                    maxlength: 100,
                    email: true
                },
                Birthday: {
                    required: true,
                },
                MobilePhone: {
                    required: true,
                    maxlength: 11,
                    minlength: 10,
                },
                FileCV: {
                    required: true,
                    maxlength: 255
                },
                Address: {
                    required: true,
                    maxlength: 255,
                    minlength: 15
                },
                Targeting: {
                    maxlength: 500
                },
                Skype: {
                    maxlength: 255
                },
            },
            messages: {
                CandidateCode: {
                    required: caption.CM_VALIDATE_CODE,
                },
                FullName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_FULLNAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CM_CURD_LBL_CM_FULLNAME).replace("{1}", "255"),
                    minlength: caption.CM_CURD_VALIDATE_NAME_SHORT
                },
                RadioMaried: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_MARRIED),
                },
                Email: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_EMAIL),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CM_CURD_LBL_CM_EMAIL).replace("{1}", "100"),
                    email: caption.CM_CURD_VALIDATE_ERR_MAIL
                },
                Birthday: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_BIRTHDAY),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CM_CURD_LBL_CM_BIRTHDAY).replace("{1}", "100"),
                },
                MobilePhone: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_PHONE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CM_CURD_LBL_CM_PHONE).replace("{1}", "11"),
                    minlength: caption.CM_CURD_VALIDATE_ERR_PHONE,
                },
                FileCV: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_FILECV),
                    maxlength: caption.CM_CURD_VALIDATE_NAME_FILE
                },
                Address: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CM_CURD_LBL_CM_ADDRESS),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CM_CURD_LBL_CM_ADDRESS).replace("{1}", "255"),
                    minlength: caption.CM_CURD_VALIDATE_ADDRESS_SHORT
                },
                Targeting: {
                    maxlength: caption.CM_CURD_VALIDATE_TARGET
                },
                Skype: {
                    maxlength: caption.CM_CURD_VALIDATE_SKYPE
                },
            }
        }
        $rootScope.validationOptionsAdvanced = {
            rules: {
                MainPracticeTime: {
                    required: true,
                    maxlength: 255
                },
                SubPracticeTime: {
                    maxlength: 255
                },
                LaptopInfo: {
                    maxlength: 255
                },
                SmartphoneInfo: {
                    maxlength: 255
                },
                SalaryHope: {
                    required: true,
                },
                CanJoinDate: {
                    required: true,
                }
            },
            messages: {
                MainPracticeTime: {
                    required: caption.CM_CURD_VALIDATE_INTERNSHIP_TIME,
                    maxlength: caption.CM_CURD_VALIDATE_LENGTH
                },
                SubPracticeTime: {
                    maxlength: caption.CM_CURD_VALIDATE_LENGTH
                },
                LaptopInfo: {
                    maxlength: caption.CM_CURD_VALIDATE_LENGTH
                },
                SmartphoneInfo: {
                    maxlength: caption.CM_CURD_VALIDATE_LENGTH
                },
                SalaryHope: {
                    required: caption.CM_CURD_VALIDATE_SALARY_HOPE,
                },
                CanJoinDate: {
                    required: caption.CM_CURD_VALIDATE_FROM_DAY_WORK,
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CandidatesManagement/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        }).when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        }).when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
    $scope.model = {
        FromDate: '',
        ToDate: '',
        Sex: '',
        Year: '',
        Skill: '',
        Fullname: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CandidatesManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Sex = $scope.model.Sex;
                d.Year = $scope.model.Year;
                d.Skill = $scope.model.Skill;
                d.Fullname = $scope.model.Fullname;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [6, 'desc'])
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
            $compile(angular.element(row))($scope);
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
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    dataservice.getItem(data.Id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            myService.setData(rs.Object);
                            $location.path('/edit/');
                        }
                    });
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withOption('sClass', 'dataTable-20per').withTitle('{{"CM_LIST_COL_CM_FULL_NAME" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Sex').withOption('sClass', 'dataTable-w120').withTitle('{{"CM_LIST_COL_CM_SEX" | translate}}').withOption('sClass', 'dataTable-w120').renderWith(function (data, type) {
        if (data == 1) {
            return '<i class="fas fa-male fs20"></i>';
        } else {
            return '<i class="fas fa-female fs20" style="color: #f1204fcf;"></i>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Birthday').withTitle('{{"CM_LIST_COL_CM_BIRTHDAY" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('{{"CM_LIST_COL_CM_PHONE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MainPracticeTime').withTitle('{{"CM_LIST_COL_CM_INTERNSHIP_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CM_LIST_COL_CM_CREATEDTIME" | translate}}').renderWith(function (data, type) {
        var dateNow = $filter('date')(new Date($rootScope.dateNow), 'dd/MM/yyyy');
        if (data != '') {
            var createDate = $filter('date')(new Date(data), 'dd/MM/yyyy');
            if (dateNow == createDate) {
                var today = new Date();
                var created = new Date(data);
                var diffMs = (today - created);
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                return '<span class="badge badge-success">Mới </span> <span class="time">' + diffHrs + 'h ' + diffMins + 'p </span>';
            } else {
                return createDate;
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CM_LIST_COL_CM_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.search = function () {
        reloadData(true);
    }
    $scope.initLoad = function () {
        dataservice.getListYear(function (rs) {
            rs = rs.data;
            $scope.listYear = rs;
        });
        dataservice.getSkill(function (rs) {
            rs = rs.data;
            $scope.listSkill = rs;
        });
    }
    $scope.initLoad();
    $scope.add = function () {
        $rootScope.CandidateCode = '';
        $rootScope.IsAdd = true;
        $location.path('/add/');
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                myService.setData(rs.Object);
                $location.path('/edit/');
            }
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CM_MSG_CONFIRM_DELETE_CANDIDATE;
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
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () {
        });
    }
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    var vm = $scope;
    $scope.forms = {}
    $scope.type = 0;
    $scope.modelInfo = {
        CandidateCode: '',
        Fullname: '',
        Sex: 1,
        Married: 0,
        Address: '',
        Phone: '',
        Email: '',
        Birthday: '',
        Skype: '',
        FileCv_1: '',
        Targeting: ''
    }
    $scope.modelInfoMore = {
        Ability: '',
        Targeting: '',
        MainSkill: '',
        MainPracticeTime: '',
        SubSkill: '',
        SubPracticeTime: '',
        LanguageUse: '',
        SalaryHope: '',
        CanJoinDate: '',
        LaptopInfo: '',
        SmartphoneInfo: ''
    }
    $scope.modelCalendar = {
        CandidateCode: '',
        AppointmentTime: '',
        FromDate: '',
        ToDate: '',
        FullTime: false,
        Morning: false,
        Afternoon: false,
        Evening: false,
        Sunday: false,
        Saturday: false,
    };
    $scope.entities = [{
        name: caption.CM_CURD_LBL_CM_MORNING,
        checked: false,
        value: 0,
    }, {
        name: caption.CM_CURD_LBL_CM_AFTERNOON,
        checked: false,
        value: 1,
    }, {
        name: caption.CM_CURD_LBL_CM_EVENING,
        checked: false,
        value: 2,
    }, {
        name: caption.CM_CURD_LBL_CM_SATURDAY,
        checked: false,
        value: 3,
    }, {
        name: caption.CM_CURD_LBL_CM_SUNDAY,
        checked: false,
        value: 4,
    }]

    $scope.initLoad = function () {
        $rootScope.IsEdit = false;
        if (!$rootScope.IsAdd) {
            $location.path('/');
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }
    $scope.createdSearchCandiateCode = function (type) {
        if (type == 0) {
            dataservice.createCandiateCode(function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $("#CandidateCode").val(rs.Title);
                    $rootScope.CandidateCode = rs.Title;
                    if ($('#CandidateCode').valid()) {
                        $('#CandidateCode').removeClass('invalid').addClass('success');
                    }
                }
            })
        } else {
            if ($scope.modelInfo.CandidateCode == '') {
                App.toastrError(caption.CM_MSG_CODE_TO_SEARCH);
            } else {
                dataservice.searchCandiateCode($scope.modelInfo.CandidateCode, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.modelInfo = rs.Object.CandidatesInfo;
                        $scope.modelInfoMore = rs.Object.CandidatesInfoMore;
                        $rootScope.CandidateCode = $scope.modelInfo.CandidateCode;
                        var tab = $('.nav-tabs li');
                        tab.removeClass('disabled');
                        $('div[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                            $('#calendar').fullCalendar('render');
                        });
                        if ($('#CandidateCode').valid()) {
                            $('#CandidateCode').removeClass('invalid').addClass('success');
                        }
                        reloadData(true);
                    }
                })
            }
        }
    }
    $scope.submitNextTab = function (form) {
        if (form == 1) {
            validationSelect($scope.modelInfo);
            if ($scope.forms.basicForm.validate() && validationSelect($scope.modelInfo).Status == false) {
                var file = document.getElementById("File").files[0];
                if (file == null || file == undefined) {
                    App.toastrError(caption.CM_CURD_VALIDATE_FILE);
                } else {
                    var fileName = $('input[type=file]').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    if (extFile != "docx" && extFile != "doc" && extFile != "pdf") {
                        App.toastrError(caption.CM_MSG_DOCX_DOC_PDF);
                        return;
                    };
                    var data = new FormData();
                    data.append("FileUpload", file);
                    dataservice.uploadCV(data, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            return;
                        }
                        else {
                            $scope.modelInfo.FileCv_1 = '/uploads/files/' + rs.Object;
                            $scope.modelInfo.CandidateCode = $rootScope.CandidateCode;
                            dataservice.updateCandidateInfo($scope.modelInfo, function (rs) {
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                    nextTab();
                                }
                            })
                            dataservice.getLanguage(function (rs) {
                                $scope.listLanguage = rs;
                            })
                            dataservice.getSkill(function (rs) {
                                $scope.listSkill = rs;
                                var listSkillCheck = $scope.modelInfoMore.Ability.split(',');
                                for (var i = 0; i < $scope.listSkill.length; i++) {
                                    for (var j = 0; j < listSkillCheck.length; j++) {
                                        if ($scope.listSkill[i].Code == listSkillCheck[j]) {
                                            $scope.listSkill[i].Check = true;
                                            break;
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
        if (form == 2) {
            var listAbility = [];
            for (var i = 0; i < $scope.listSkill.length; i++) {
                if ($scope.listSkill[i].Check) {
                    listAbility.push($scope.listSkill[i].Code);
                }
            }
            $scope.modelInfoMore.Ability = listAbility.join(',');
            $scope.modelInfoMore.CandidateCode = $rootScope.CandidateCode;
            if ($scope.forms.advancedForm.validate()) {
                dataservice.updateCandidateInfoMore($scope.modelInfoMore, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        nextTab();
                    }
                })
            }
        }
    }
    $scope.submitPrevTab = function () {
        prevTab();
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Phone" && $scope.modelInfo.Phone && $rootScope.partternPhone.test($scope.modelInfo.Phone)) {
            $scope.errorPhone = false;
        } else if (SelectType == "Phone") {
            $scope.errorPhone = true;
        }
    }
    $scope.loadFile = function () {
        if ($('#FileCV').valid()) {
            $('#FileCV').removeClass('invalid').addClass('success');
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorPhone = true;
            mess.Status = true;
        } else {
            $scope.errorPhone = false;
        }

        return mess;
    };
    function initCalendar(id) {
        $('#' + id).fullCalendar({
            //defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next, today',
                right: '',
                center: 'title',
            },
            dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            monthNames: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 -', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            monthNamesShort: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 ', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            dayNamesShort: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            buttonText: {
                today: 'Hôm nay',
                icon: 'far fa-calendar-check'
            },
            slotLabelFormat: "HH:mm",
            events: function (start, end, timezone, callback) {
                dataservice.getEventCat($rootScope.CandidateCode, function (rs) {
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var calendar = value.FrameTime.split(';');
                        var dateRegistraion = (new Date(value.DatetimeEvent)).getDay();
                        var morning = {
                            title: "1.Sáng",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[0] == "True") ? 'fc-event-event-orange' : calendar[0] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 0
                        }
                        var afternoon = {
                            title: "2.Chiều",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[1] == "True") ? 'fc-event-event-orange' : calendar[1] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 1
                        }
                        var evening = {
                            title: "3.Tối",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[2] == "True") ? 'fc-event-event-orange' : calendar[2] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 2
                        }
                        event.push(morning);
                        event.push(afternoon);
                        event.push(evening);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                //calEvent.color = '#bdc3c7';
                deleteFrameTime(calEvent.frameTime, calEvent.id, calEvent);
            },
        })
    }
    function loadDate() {
        var date = new Date();
        date.setDate(date.getDate());
        $("#datebirthday").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#datebirthday input').valid()) {
                $('#datebirthday input').removeClass('invalid').addClass('success');
            }
        });
        $("#can-join-date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: date,
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#can-join-date input').valid()) {
                $('#can-join-date input').removeClass('invalid').addClass('success');
            }
        });
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: date,
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $("#appointmentTime").datetimepicker({
            startDate: new Date(),
            format: 'dd/mm/yyyy hh:ii',
            todayHighlight: true,
            autoclose: true
        });
    }
    function nextTab() {
        var $active = $('.nav-tabs li.active');
        $active.next().removeClass('disabled');
        $($active).next().find('div[data-toggle="tab"]').click();
    }
    function prevTab() {
        var $active = $('.nav-tabs li.active');
        $($active).prev().find('div[data-toggle="tab"]').click();
    }
    function renderCalenderInTab() {
        $('div[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $('#calendar').fullCalendar('render');
        });
    }
    setTimeout(function () {
        initCalendar("calendar");
        renderCalenderInTab();
    }, 300);


    //2. List 
    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrametimeCadidate(eventId, frameTime, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData(false);
                $('#calendar').fullCalendar('refetchEvents');
            }
        });
    }
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CandidatesManagement/GetEventCatGrid",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CandidateCode = $rootScope.CandidateCode;
                //d.Worktype = $scope.calendar.Worktype;
                //d.Membertype = $scope.calendar.Membertype;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateCode').withTitle('{{"CM_LIST_COL_CM_CANDIDATE_CODE" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withTitle('{{"CM_LIST_COL_CM_FULL_NAME" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('{{"CM_LIST_COL_CM_DATETIME_EVENT" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('{{"CM_LIST_COL_CM_MORNING" | translate}}').renderWith(function (data, type, full) {
        //return data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
        //    '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('{{"CM_LIST_COL_CM_AFTERNOON" | translate}}').renderWith(function (data, type, full) {
        //return data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
        //    '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';

        } else {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('{{"CM_LIST_COL_CM_EVENING" | translate}}').renderWith(function (data, type, full) {
        //return data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
        //    '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff""><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dt = {
        dtInstance: {}
    }

    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.registration = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Morning = true;
                } else {
                    $scope.modelCalendar.Morning = false;
                }
            }
            if ($scope.entities[i].value == 1) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Afternoon = true;
                } else {
                    $scope.modelCalendar.Afternoon = false;
                }
            }
            if ($scope.entities[i].value == 2) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Evening = true;
                } else {
                    $scope.modelCalendar.Evening = false;
                }
            }
            if ($scope.entities[i].value == 3) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Saturday = true;
                } else {
                    $scope.modelCalendar.Saturday = false;
                }
            }
            if ($scope.entities[i].value == 4) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Sunday = true;
                } else {
                    $scope.modelCalendar.Sunday = false;
                }
            }
        }
        if (!$scope.modelCalendar.Morning && !$scope.modelCalendar.Afternoon &&
            !$scope.modelCalendar.Evening && !$scope.modelCalendar.Saturday && !$scope.modelCalendar.Sunday) {
            App.toastrError("Vui lòng chọn sáng,chiều,tối");
        } else {
            if ($scope.modelCalendar.FromDate == '' || $scope.modelCalendar.ToDate == '') {
                App.toastrError("Vui lòng chọn từ ngày và đến ngày");
                return;
            }
            $scope.modelCalendar.CandidateCode = $rootScope.CandidateCode;
            dataservice.insertEventCat($scope.modelCalendar, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $('#calendar').fullCalendar('refetchEvents');
                    reloadData(true);
                }
            })
        }
    };
    setTimeout(function () {
        $('div[data-toggle="tab"]').on('show.bs.tab', function (e) {
            var $target = $(e.target);
            if ($target.parent().hasClass('disabled')) {
                return false;
            }
        });
        loadDate();
        //initCalendar("calendar");
        //loadTagInput();
        //renderCalenderInTab();
        var dateToday = new Date();
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });

        $('#dateto').datepicker('setStartDate', dateToday);
        $('#datefrom').datepicker('setStartDate', dateToday);
        var dateBirthday = new Date();
        dateBirthday.setFullYear(dateBirthday.getFullYear() - 18);
        var dateidentitycard = new Date();
        $(".date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#date-birthday').datepicker('setEndDate', dateBirthday);
        $('#date-birthday2').datepicker('setEndDate', dateBirthday);
        $('#date-identitycard').datepicker('setEndDate', dateidentitycard);
        setModalDraggable('.modal-dialog');
    }, 300);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
    $scope.forms = {};
    $scope.entities = [{
        name: 'Sáng',
        checked: false,
        value: 0,
    }, {
        name: 'Chiều',
        checked: false,
        value: 1,
    }, {
        name: 'Tối',
        checked: false,
        value: 2,
    }, {
        name: 'Thứ 7',
        checked: false,
        value: 3,
    }, {
        name: 'Chủ nhật',
        checked: false,
        value: 4,
    }]
    $scope.modelCalendar = {
        CandidateCode: '',
        AppointmentTime: '',
        FromDate: '',
        ToDate: '',
        FullTime: false,
        Morning: false,
        Afternoon: false,
        Evening: false,
        Sunday: false,
        Saturday: false,
    };

    $scope.initLoad = function () {
        var data = myService.getData();
        if (data != undefined) {
            $scope.modelInfo = data.CandidatesInfo;
            $scope.modelInfoMore = data.CandidatesInfoMore;
            $rootScope.CandidateCode = $scope.modelInfo.CandidateCode;
            $rootScope.IsEdit = true;
        } else {
            $location.path('/');
        }
        dataservice.getLanguage(function (rs) {
            $scope.listLanguage = rs;
        })
        dataservice.getSkill(function (rs) {
            $scope.listSkill = rs;
            var listSkillCheck = $scope.modelInfoMore.Ability.split(',');
            for (var i = 0; i < $scope.listSkill.length; i++) {
                for (var j = 0; j < listSkillCheck.length; j++) {
                    if ($scope.listSkill[i].Code == listSkillCheck[j]) {
                        $scope.listSkill[i].Check = true;
                        break;
                    }
                }
            }
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }
    $scope.submitNextTab = function (form) {
        validationSelect($scope.modelInfo);
        if ($scope.forms.basicForm.validate() && validationSelect($scope.modelInfo).Status == false) {
            if (form == 1) {
                var file = document.getElementById("File").files[0];
                if (file == null || file == undefined) {
                    $scope.modelInfo.CandidateCode = $rootScope.CandidateCode;
                    dataservice.updateCandidateInfo($scope.modelInfo, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            nextTab();
                        }
                    })
                } else {
                    var fileName = $('input[type=file]').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    if (extFile != "docx" && extFile != "doc" && extFile != "pdf") {
                        App.toastrError(caption.CM_MSG_DOCX_DOC_PDF);
                        return;
                    };
                    var data = new FormData();
                    data.append("FileUpload", file);
                    dataservice.uploadCV(data, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            return;
                        }
                        else {
                            $scope.modelInfo.FileCv_1 = '/uploads/files/' + rs.Object;
                            $scope.modelInfo.CandidateCode = $rootScope.CandidateCode;
                            dataservice.updateCandidateInfo($scope.modelInfo, function (rs) {
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                    nextTab();
                                }
                            })
                        }
                    });
                }
            }
            if (form == 2) {
                if ($scope.forms.advancedForm.validate()) {
                    var listAbility = [];
                    for (var i = 0; i < $scope.listSkill.length; i++) {
                        if ($scope.listSkill[i].Check) {
                            listAbility.push($scope.listSkill[i].Code);
                        }
                    }
                    $scope.modelInfoMore.Ability = listAbility.join(',');
                    $scope.modelInfoMore.CandidateCode = $rootScope.CandidateCode;
                    dataservice.getLanguage(function (rs) {
                        $scope.listLanguage = rs;
                    })
                    dataservice.updateCandidateInfoMore($scope.modelInfoMore, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            nextTab();
                        }
                    })
                }
            }
        }
    }
    $scope.submitPrevTab = function () {
        prevTab();
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Phone" && $scope.modelInfo.Phone && $rootScope.partternPhone.test($scope.modelInfo.Phone)) {
            $scope.errorPhone = false;
        } else if (SelectType == "Phone") {
            $scope.errorPhone = true;
        }
    }
    $scope.loadFile = function () {
        if ($('#FileCV').valid()) {
            $('#FileCV').removeClass('invalid').addClass('success');
        }
    }

    //1.Calender
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorPhone = true;
            mess.Status = true;
        } else {
            $scope.errorPhone = false;
        }

        return mess;
    };
    function deleteFrameTime(frameTime, id, event) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắn chắn muốn thay đổi?";
                $scope.ok = function () {
                    dataservice.deleteFrameTime(id, frameTime, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
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
            $('#calendar').fullCalendar('refetchEvents');
            reloadData(false);
        }, function () {
        });
    }
    function initCalendar(id) {
        $('#' + id).fullCalendar({
            //defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next, today',
                right: '',
                center: 'title',
            },
            dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            monthNames: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 -', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            monthNamesShort: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 ', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            dayNamesShort: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            buttonText: {
                today: 'Hôm nay',
                icon: 'far fa-calendar-check'
            },
            slotLabelFormat: "HH:mm",
            events: function (start, end, timezone, callback) {
                dataservice.getEventCat($rootScope.CandidateCode, function (rs) {
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var calendar = value.FrameTime.split(';');
                        var dateRegistraion = (new Date(value.DatetimeEvent)).getDay();
                        var morning = {
                            title: "1.Sáng",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[0] == "True") ? 'fc-event-event-orange' : calendar[0] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 0
                        }
                        var afternoon = {
                            title: "2.Chiều",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[1] == "True") ? 'fc-event-event-orange' : calendar[1] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 1
                        }
                        var evening = {
                            title: "3.Tối",
                            start: value.DatetimeEvent,
                            allDay: true,
                            className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[2] == "True") ? 'fc-event-event-orange' : calendar[2] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                            id: value.Id,
                            frameTime: 2
                        }
                        event.push(morning);
                        event.push(afternoon);
                        event.push(evening);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                //calEvent.color = '#bdc3c7';
                deleteFrameTime(calEvent.frameTime, calEvent.id, calEvent);
            },
        })
    }
    function loadDate() {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        $("#datebirthday").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#datebirthday input').valid()) {
                $('#datebirthday input').removeClass('invalid').addClass('success');
            }
        });
        $("#can-join-date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: date,
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#can-join-date input').valid()) {
                $('#can-join-date input').removeClass('invalid').addClass('success');
            }
        });
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });

        $("#appointmentTime").datetimepicker({
            startDate: new Date(),
            format: 'dd/mm/yyyy hh:ii',
            todayHighlight: true,
            autoclose: true
        });
    }
    function filllDefaultDate() {
        //$('#dateto').datepicker('update', new Date());
        //$('#datefrom').datepicker('update', new Date());
        $('#datefrom').datepicker('setStartDate', new Date());
        $('#dateto').datepicker('setStartDate', new Date());
    }
    function nextTab() {
        var $active = $('.nav-tabs li.active');
        $active.next().removeClass('disabled');
        $($active).next().find('div[data-toggle="tab"]').click();
    }
    function prevTab() {
        var $active = $('.nav-tabs li.active');
        $($active).prev().find('div[data-toggle="tab"]').click();
    }
    function renderCalenderInTab() {
        $('div[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $('#calendar').fullCalendar('render');
        });
    }

    setTimeout(function () {
        loadDate();
        initCalendar("calendar");
        renderCalenderInTab();
        setModalDraggable('.modal-dialog');
        filllDefaultDate();
        var dateToday = new Date();
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        //$('#dateto').datepicker('setStartDate', dateToday);
        //$('#datefrom').datepicker('setStartDate', dateToday);
    }, 300);

    //2. List 
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CandidatesManagement/GetEventCatGrid",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CandidateCode = $rootScope.CandidateCode;
                //d.Worktype = $scope.calendar.Worktype;
                //d.Membertype = $scope.calendar.Membertype;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateCode').withOption('sClass', 'hidden').withTitle('{{"CM_LIST_COL_CM_CANDIDATE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withOption('sClass', 'hidden').withTitle('{{"CM_LIST_COL_CM_FULL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('{{"CM_LIST_COL_CM_DATETIME_EVENT" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('{{"CM_LIST_COL_CM_MORNING" | translate}}').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('{{"CM_LIST_COL_CM_AFTERNOON" | translate}}').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';

        } else {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('{{"CM_LIST_COL_CM_EVENING" | translate}}').renderWith(function (data, type, full) {

        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff""><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dt = {
        dtInstance: {}
    }
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }

    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrametimeCadidate(eventId, frameTime, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $('#calendar').fullCalendar('refetchEvents');
                reloadData(false);
            }
        });
    }
    $scope.registration = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Morning = true;
                } else {
                    $scope.modelCalendar.Morning = false;
                }
            }
            if ($scope.entities[i].value == 1) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Afternoon = true;
                } else {
                    $scope.modelCalendar.Afternoon = false;
                }
            }
            if ($scope.entities[i].value == 2) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Evening = true;
                } else {
                    $scope.modelCalendar.Evening = false;
                }
            }
            if ($scope.entities[i].value == 3) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Saturday = true;
                } else {
                    $scope.modelCalendar.Saturday = false;
                }
            }
            if ($scope.entities[i].value == 4) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Sunday = true;
                } else {
                    $scope.modelCalendar.Sunday = false;
                }
            }
        }
        if (!$scope.modelCalendar.Morning && !$scope.modelCalendar.Afternoon &&
            !$scope.modelCalendar.Evening && !$scope.modelCalendar.Saturday && !$scope.modelCalendar.Sunday) {
            App.toastrError("Vui lòng chọn sáng,chiều,tối");
        } else {
            if ($scope.modelCalendar.FromDate == '' || $scope.modelCalendar.ToDate == '') {
                App.toastrError("Vui lòng chọn từ ngày và đến ngày");
                return;
            }
            $scope.modelCalendar.CandidateCode = $rootScope.CandidateCode;
            dataservice.insertEventCat($scope.modelCalendar, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $('#calendar').fullCalendar('refetchEvents');
                    reloadData(true);
                    //element = document.getElementsByClassName('sorting')[0];
                    //element.click();
                }
            })
        }
    };
});
   
  