var ctxfolderEduQuiz = "/views/admin/eduQuiz";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_EDU_QUIZ', ['App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive("filesInput", function () {
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

app.directive('customOnChangeSupplier', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeSupplier);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.factory('dataserviceEduQuiz', function ($http) {
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
    var submitFormUpload1 = function (url, data, callback) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("file_name", data.FileName);
        formData.append("file_type", data.FileType);
        formData.append("title", data.title);
        formData.append("title_attribute", data.title_attribute);
        formData.append("item_id", data.item_id);
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/EduQuiz/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/EduQuiz/Update/', data).then(callback);
        },
        updateAnswer: function (data, callback) {
            $http.post('/Admin/EduQuiz/UpdateAnswer/', data).then(callback);
        },
        updateLecture: function (data, callback) {
            $http.post('/Admin/EduQuiz/UpdateLecture/', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/EduQuiz/GetItem', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/EduQuiz/Delete?id=' + data).then(callback);
        },
        getListCourse: function (callback) {
            $http.post('/Admin/EduQuiz/GetListCourse').then(callback);
        },
        getListLecture: function (callback) {
            $http.post('/Admin/EduQuiz/GetListLecture').then(callback);
        },
        getListCategoryByParent: function (data, callback) {
            $http.post('/Admin/EduQuiz/GetListCategoryByParent?parentCode=' + data).then(callback);
        },
        getListLectureByCategory: function (data, callback) {
            $http.post('/Admin/EduQuiz/GetListLectureByCategory?categoryCode=' + data).then(callback);
        },
        getListQuestionByLecture: function (data, callback) {
            $http.post('/Admin/EduQuiz/GetListQuestionByLecture?lectureCode=' + data).then(callback);
        },
        getListQuestion: function (callback) {
            $http.post('/Admin/EduQuiz/GetListQuestion').then(callback);
        },
        getLectureDetail: function (data, callback) {
            $http.post('/Admin/EduQuiz/GetLectureDetail?id=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EDU_QUIZ', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduQuiz, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
        $.extend($.validator.messages, {
            //min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CurrencyCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.FCC_MSG_ITEM_CODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true
                },
                Alias: {
                    required: true
                },
                //Category: {
                //    required: true
                //},
                //Created: {
                //    required: true
                //}

            },
            messages: {
                Title: {
                    //required: "Tiêu đề không được bỏ trống",
                    required: caption.CMS_ITEM_VALIDATE_TITLE,
                },
                Alias: {
                    //required: "Đường dẫn không được bỏ trống",
                    required: caption.CMS_ITEM_VALIDATE_ALIAS,
                },
                //Category: {
                //    required: "Danh mục không được bỏ trống",
                //},
                //Created: {
                //    required: "Ngày đăng không được bỏ trống",
                //}
            }
        }
        $rootScope.validationOptionsCSA = {
            rules: {
                Title: {
                    required: true
                },
                ValueSet: {
                    required: true
                },


                CodeSet: {
                    required: true
                },
                Type: {
                    required: true
                },


            },
            messages: {
                Title: {
                    //required: "Tiêu đề không được bỏ trống",
                    required: caption.CMS_ITEM_VALIDATE_EMPTY.replace("{0}", caption.CMS_ITEM_CURD_TXT_TITLE),
                },
                ValueSet: {

                    required: caption.CMS_ITEM_VALIDATE_EMPTY.replace("{0}", caption.CMS_ITEM_CURD_LBL_VALUE),
                },

                CodeSet: {

                    required: caption.CMS_ITEM_VALIDATE_EMPTY.replace("{0}", caption.CMS_ITEM_CURD_LBL_CODESET),
                },
                Type: {

                    required: caption.CMS_ITEM_VALIDATE_EMPTY.replace("{0}", caption.CMS_ITEM_CURD_LBL_TYPE),
                },
            }
        }
    });
    $rootScope.isAdded = false;
    $rootScope.listType = [
        {
            Code: 'QUESTION',
            Name: 'Câu hỏi'
        }, {
            Code: 'ANSWER',
            Name: 'Câu trả lời'
        }
    ];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/EduQuiz/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderEduQuiz + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolderEduQuiz + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolderEduQuiz + '/add.html',
            controller: 'add'
        });
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduQuiz, $translate, $window, $filter) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        PostFromDate: '',
        PostToDate: '',
        CreFromDate: '',
        CreToDate: '',
        Category: '',
        Status: '',
        TypeItem: '',
    };
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EduQuiz/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Title = $scope.model.Title;
                d.PostFromDate = $scope.model.PostFromDate;
                d.PostToDate = $scope.model.PostToDate;
                d.CreFromDate = $scope.model.CreFromDate;
                d.CreToDate = $scope.model.CreToDate;
                d.Category = $scope.model.Category;
                d.Status = $scope.model.Status;
                d.TypeItem = $scope.model.TypeItem;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"Loại" | translate}}').withOption('sClass', 'nowrap w30 text-center').renderWith(function (data, type) {
        var icon = listIcon[getRndInteger(0, 3)];
        var color = listColor[getRndInteger(0, 3)];

        return '<button style = "width: 25px; height: 25px; padding: 0px; background:' + color + '" class="btn btn-icon-only btn-circle btn-outline"><i class="text-white ' + icon + '"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"Tiêu đề" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Content').withOption('sClass', '').withTitle('{{"Nội dung" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CategoryName').withTitle('{{"Chương" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LectureRelative').withTitle('{{"Bài giảng liên quan" | translate}}').renderWith(function (data, type) {
        if (data != '' && data != null && data != undefined) {
            var listLecture = JSON.parse(data);
            var item = '';
            for (var i = 0; i < listLecture.length; i++) {
                item += '- <a ng-click="viewDetail(' + listLecture[i].Code + ')">' + listLecture[i].Name + '</a><br/>';
            }

            data = item;
        } else {
            data = '<span class="text-danger">Không có bài giảng liên quan</span>';
        }

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-10per').withTitle('{{"Ngày tạo" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }

    $scope.add = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderEduQuiz + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '65',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
            $rootScope.isAdded = false;
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataserviceEduQuiz.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderEduQuiz + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    }

    $scope.approve = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CMS_ITEM_VALIDATE_STATE_DISPLAY;
                $scope.ok = function () {

                    dataserviceEduQuiz.aprrove(id, function (rs) {
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceEduQuiz.delete(id, function (rs) {
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
    $scope.listPublished = [
        {
            Code: 1,
            Name: 'Hiển thị'

        }, {
            Code: 0,
            Name: 'Không hiển thị'
        },
    ];
    $scope.listFeaturedOrdering = [
        {
            Code: 0,
            Name: 'Bài viết thường'

        }, {
            Code: 1,
            Name: 'Tiêu điểm',
        },
        {
            Code: 2,
            Name: 'Tiếng anh'
        },

    ];
    $scope.initData = function () {
        //dataserviceEduQuiz.getCatId(function (rs) {
        //    rs = rs.data;

        //    $scope.listCatId = rs;
        //});
    };
    $scope.initData();

    $scope.viewDetail = function (id) {
        dataserviceEduQuiz.getLectureDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderEduQuiz + '/viewLecture.html',
                    controller: 'viewLecture',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        });
    }

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    setTimeout(function () {
    }, 200);
    $("#PostFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostToDate').datepicker('setStartDate', maxDate);
    });
    $("#PostToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostFromDate').datepicker('setEndDate', maxDate);
    });
    $("#CreFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#CreToDate').datepicker('setStartDate', maxDate);
    });
    $("#CreToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#CreFromDate').datepicker('setEndDate', maxDate);
    });
    $('.end-post-date').click(function () {
        $('#PostFromDate').datepicker('setEndDate', null);
    });
    $('.start-post-date').click(function () {

        $('#PostToDate').datepicker('setStartDate', null);
    });
    $('.end-create-date').click(function () {
        $('#CreFromDate').datepicker('setEndDate', null);
    });
    $('.start-create-date').click(function () {

        $('#CreToDate').datepicker('setStartDate', null);
    });
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduQuiz) {
    $scope.model = {
        Code: generateUUID(),
        Title: '',
        Content: '',
        JsonData: '',
        Lecture: '',
        Type: '',
        IsAnswer: false
    }

    $scope.IsAnswer = false;
    $scope.listAnswer = [];
    $rootScope.id = -1;

    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItem'].destroy();
        }
        $uibModalInstance.close();
    }

    $scope.initData = function () {
        dataserviceEduQuiz.getListCourse(function (rs) {
            rs = rs.data;
            $scope.listCourse = rs;
        });

        dataserviceEduQuiz.getListLecture(function (rs) {
            rs = rs.data;
            $scope.listLecture = rs;
        });
    };
    $scope.initData();

    $scope.changeCategory = function (code, type) {
        switch (type) {
            case 'Course':
                dataserviceEduQuiz.getListCategoryByParent(code, function (rs) {
                    rs = rs.data;
                    $scope.listSubject = rs;
                    $scope.model.Subject = '';
                });
                break;

            case 'Subject':
                dataserviceEduQuiz.getListCategoryByParent(code, function (rs) {
                    rs = rs.data;
                    $scope.listSection = rs;
                    $scope.model.Section = '';
                });
                break;

            case 'Section':
                //dataserviceEduQuiz.getListLectureByCategory(code, function (rs) {
                //    rs = rs.data;
                //    $scope.listLecture = rs;
                //    $scope.model.Lecture = '';
                //});
                break;
            case 'Lecture':
                //dataserviceEduQuiz.getListQuestionByLecture(code, function (rs) {
                //    rs = rs.data;
                //    $scope.listQuestion = rs;
                //    $scope.model.QuestionCode = '';
                //});

                dataserviceEduQuiz.getListQuestion(function (rs) {
                    rs = rs.data;
                    $scope.listQuestion = rs;
                });
                break;
        }
    };

    $scope.changeQuestion = function (item) {
        $scope.model.QuestionCode = item.Code;
        $scope.errorQuestion = false;
        if (item.JsonData != null && item.JsonData != '' && item.JsonData != undefined) {
            $scope.listAnswer = JSON.parse(item.JsonData);
            $scope.model.JsonData = item.JsonData;
        } else {
            $scope.listAnswer = [];
            $scope.model.JsonData = '';
        }
    }

    $scope.changeType = function () {
        if ($scope.model.Type == 'ANSWER') {
            $scope.IsAnswer = true;
            $scope.reloadQuestion();
            $scope.model.QuestionCode = '';
            $scope.model.Content = '';
            refreshData();
            activeTab();
        } else {
            $scope.IsAnswer = false;
            $scope.listAnswer = [];
            $scope.model.QuestionCode = '';
            $scope.model.JsonData = '';
            if ($rootScope.id > 0) {
                dataserviceEduQuiz.getItem($rootScope.id, function (rs) {
                    rs = rs.data;
                    if (rs.Object != '' && rs.Object != null && rs.Object != undefined) {
                        $scope.model.Content = rs.Object.Content;
                        $scope.model.JsonData = rs.Object.JsonData;
                        $scope.model.Title = rs.Object.Title;
                        refreshData();
                    };
                });
            }
        }
    }

    $scope.reloadQuestion = function () {
        //dataserviceEduQuiz.getListQuestionByLecture($scope.model.Lecture, function (rs) {
        //    rs = rs.data;
        //    $scope.listQuestion = rs;
        //});
        dataserviceEduQuiz.getListQuestion(function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
        });
    }

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        if ($scope.model.Type == 'ANSWER') {
            if (!validationSelect($scope.model).Status) {
                if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                    return App.toastrError('Nhập nội dung câu trả lời');
                }

                var obj = {
                    Code: generateUUID(),
                    Content: $scope.model.Content,
                    ContentDecode: decodeHTML($scope.model.Content),
                    IsAnswer: $scope.model.IsAnswer
                }

                var checkExit = $scope.listAnswer.find(function (element) {
                    if (element.Content == obj.Content && element.ContentDecode == obj.ContentDecode) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Đáp án đã tồn tại');
                }

                if ($scope.model.JsonData == '' || $scope.model.JsonData == null || $scope.model.JsonData == undefined) {
                    $scope.listAnswer.push(obj);
                } else {
                    $scope.listAnswer = JSON.parse($scope.model.JsonData);
                    if ($scope.listAnswer.length > 0)
                        $scope.listAnswer.push(obj);
                }

                $scope.model.JsonData = JSON.stringify($scope.listAnswer);

                dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        $scope.reloadQuestion();
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        } else {
            if ($rootScope.id > 0) {
                if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                    if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                        return App.toastrError('Nhập nội dung câu hỏi');
                    }

                    dataserviceEduQuiz.update($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            return App.toastrError(rs.Title);
                        } else {
                            $scope.reloadNoResetPage();
                            return App.toastrSuccess(rs.Title);
                        }
                    });
                }
            } else {
                if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                    if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                        return App.toastrError('Nhập nội dung câu hỏi');
                    }

                    dataserviceEduQuiz.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.id = rs.ID;
                            $scope.model.Id = rs.ID;
                            $scope.reloadNoResetPage();
                        }
                    });
                }
            }
        }
    };

    $scope.deleteAnswer = function (data) {
        if ($scope.listAnswer.indexOf(data) == -1) {
            App.toastrError('Xóa thất bại')
        } else {
            $scope.listAnswer.splice($scope.listAnswer.indexOf(data), 1);

            $scope.model.JsonData = JSON.stringify($scope.listAnswer);

            dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadQuestion();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.updateAnswer = function (code) {
        var item = $scope.listAnswer.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            item.IsAnswer = !item.IsAnswer;

            $scope.model.JsonData = JSON.stringify($scope.listAnswer);

            dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadNoResetPage();
                    $scope.reloadQuestion();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.Type == 'ANSWER') {
            if (data.QuestionCode == "" || data.QuestionCode == null || data.QuestionCode == undefined) {
                $scope.errorQuestion = true;
                mess.Status = true;
            } else {
                $scope.errorQuestion = false;
            }
        }

        if (data.Type == "" || data.Type == null || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }

        return mess;
    }

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.model.Content);
        }
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    setTimeout(function () {
        ckEditer();
    });
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduQuiz, para) {
    $rootScope.id = para.Id;
    $scope.listLectureRelative = [];

    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItem'].destroy();
        }
        $uibModalInstance.close();
        $rootScope.isAdded = false;
        $rootScope.alias = null;
        $rootScope.id = -1;
    }

    $scope.initData = function () {
        $scope.model = para;
        $scope.model.Type = 'QUESTION';
        $scope.model.QuestionCode = $scope.model.Code;

        $scope.listAnswer = JSON.parse($scope.model.JsonData);
        if ($scope.model.LectureRelative != '' && $scope.model.LectureRelative != null && $scope.model.LectureRelative != undefined)
            $scope.listLectureRelative = JSON.parse($scope.model.LectureRelative);

        dataserviceEduQuiz.getListCourse(function (rs) {
            rs = rs.data;
            $scope.listCourse = rs;
        });

        dataserviceEduQuiz.getListLecture(function (rs) {
            rs = rs.data;
            $scope.listLecture = rs;
        });

        dataserviceEduQuiz.getListCategoryByParent($scope.model.Course, function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;

            dataserviceEduQuiz.getListCategoryByParent($scope.model.Subject, function (rs) {
                rs = rs.data;
                $scope.listSection = rs;
            });

            //dataserviceEduQuiz.getListLectureByCategory($scope.model.Section, function (rs) {
            //    rs = rs.data;
            //    $scope.listLecture = rs;
            //});
        });
    }

    $scope.initData();

    $scope.changeCategory = function (code, type) {
        switch (type) {
            case 'Course':
                dataserviceEduQuiz.getListCategoryByParent(code, function (rs) {
                    rs = rs.data;
                    $scope.listSubject = rs;
                    $scope.model.Subject = '';
                });
                break;

            case 'Subject':
                dataserviceEduQuiz.getListCategoryByParent(code, function (rs) {
                    rs = rs.data;
                    $scope.listSection = rs;
                    $scope.model.Section = '';
                });
                break;

            case 'Section':
                //dataserviceEduQuiz.getListLectureByCategory(code, function (rs) {
                //    rs = rs.data;
                //    $scope.listLecture = rs;
                //    $scope.model.Lecture = '';
                //});
                break;
            case 'Lecture':
                //dataserviceEduQuiz.getListQuestionByLecture(code, function (rs) {
                //    rs = rs.data;
                //    $scope.listQuestion = rs;
                //    $scope.model.QuestionCode = '';
                //});
                break;
        }
    };

    $scope.changeQuestion = function (item) {
        $scope.model.QuestionCode = item.Code;
        $scope.errorQuestion = false;
        if (item.JsonData != null && item.JsonData != '' && item.JsonData != undefined) {
            $scope.listAnswer = JSON.parse(item.JsonData);
            $scope.model.JsonData = item.JsonData;
        } else {
            $scope.listAnswer = [];
            $scope.model.JsonData = '';
        }
    }

    $scope.changeType = function () {
        if ($scope.model.Type == 'ANSWER') {
            $scope.IsAnswer = true;
            $scope.reloadQuestion();
            $scope.model.QuestionCode = '';
            $scope.model.Content = '';
            refreshData();
            activeTab();
        } else {
            $scope.IsAnswer = false;
            $scope.listAnswer = [];
            $scope.model.QuestionCode = '';
            $scope.model.JsonData = '';
            if ($rootScope.id > 0) {
                dataserviceEduQuiz.getItem($rootScope.id, function (rs) {
                    rs = rs.data;
                    if (rs.Object != '' && rs.Object != null && rs.Object != undefined) {
                        $scope.model.Content = rs.Object.Content;
                        $scope.model.JsonData = rs.Object.JsonData;
                        $scope.model.Title = rs.Object.Title;
                        refreshData();
                    };
                });
            }
        }
    }

    $scope.reloadQuestion = function () {
        //dataserviceEduQuiz.getListQuestionByLecture($scope.model.Lecture, function (rs) {
        //    rs = rs.data;
        //    $scope.listQuestion = rs;
        //});

        dataserviceEduQuiz.getListQuestion(function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
        });
    }

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }

        if ($scope.model.Type == 'ANSWER') {
            if (!validationSelect($scope.model).Status) {
                if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                    return App.toastrError('Nhập nội dung câu trả lời');
                }

                var obj = {
                    Code: generateUUID(),
                    Content: $scope.model.Content,
                    ContentDecode: decodeHTML($scope.model.Content),
                    IsAnswer: $scope.model.IsAnswer
                }

                var checkExit = $scope.listAnswer.find(function (element) {
                    if (element.Content == obj.Content && element.ContentDecode == obj.ContentDecode) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Đáp án đã tồn tại');
                }

                if ($scope.model.JsonData == '' || $scope.model.JsonData == null || $scope.model.JsonData == undefined) {
                    $scope.listAnswer.push(obj);
                } else {
                    $scope.listAnswer = JSON.parse($scope.model.JsonData);
                    if ($scope.listAnswer.length > 0)
                        $scope.listAnswer.push(obj);
                }

                $scope.model.JsonData = JSON.stringify($scope.listAnswer);

                dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        $scope.reloadQuestion();
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        } else {
            if ($rootScope.id > 0) {
                if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
                    if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                        return App.toastrError('Nhập nội dung câu hỏi');
                    }

                    dataserviceEduQuiz.update($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            return App.toastrError(rs.Title);
                        } else {
                            $scope.reloadNoResetPage();

                            return App.toastrSuccess(rs.Title);
                        }
                    });
                }
            } else {
                if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
                    if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                        return App.toastrError('Nhập nội dung câu hỏi');
                    }

                    dataserviceEduQuiz.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.id = rs.ID;
                            $scope.model.Id = rs.ID;
                            $scope.reloadNoResetPage();
                        }
                    });
                }
            }
        }
    };

    $scope.deleteAnswer = function (data) {
        if ($scope.listAnswer.indexOf(data) == -1) {
            App.toastrError('Xóa thất bại')
        } else {
            $scope.listAnswer.splice($scope.listAnswer.indexOf(data), 1);

            $scope.model.JsonData = JSON.stringify($scope.listAnswer);

            dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadQuestion();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.updateAnswer = function (code) {
        var item = $scope.listAnswer.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {

            $scope.model.JsonData = JSON.stringify($scope.listAnswer);

            dataserviceEduQuiz.updateAnswer($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadNoResetPage();
                    $scope.reloadQuestion();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.changeLecture = function (item) {
        $scope.item = item;
    }

    $scope.addLecture = function () {
        if ($scope.model.LectureRelativeTemp == '' || $scope.model.LectureRelativeTemp == null || $scope.model.LectureRelativeTemp == undefined) {
            return App.toastrError('Tài liệu tham khảo yêu cầu bắt buộc');
        }

        var obj = {
            Code: $scope.item.Id,
            Name: $scope.item.Name
        }

        var item = $scope.listLectureRelative.find(function (element) {
            if (element.Code == obj.Code) return true;
        });

        if (item != null && item != undefined && item != '') {
            return App.toastrError('Tài liệu tham khảo đã tồn tại');
        } else {
            $scope.listLectureRelative.push(obj);
            $scope.model.LectureRelative = JSON.stringify($scope.listLectureRelative);

            dataserviceEduQuiz.updateLecture($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.deleteLecture = function (data) {
        if ($scope.listLectureRelative.indexOf(data) == -1) {
            App.toastrError('Xóa thất bại')
        } else {
            $scope.listLectureRelative.splice($scope.listLectureRelative.indexOf(data), 1);

            $scope.model.LectureRelative = JSON.stringify($scope.listLectureRelative);

            dataserviceEduQuiz.updateLecture($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.viewDetail = function (id) {
        dataserviceEduQuiz.getLectureDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderEduQuiz + '/viewLecture.html',
                    controller: 'viewLecture',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        });
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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.Type == 'ANSWER') {
            if (data.QuestionCode == "" || data.QuestionCode == null || data.QuestionCode == undefined) {
                $scope.errorQuestion = true;
                mess.Status = true;
            } else {
                $scope.errorQuestion = false;
            }
        }

        if (data.Type == "" || data.Type == null || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }

        return mess;
    }

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.model.Content);
        }
    }

    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        ckEditer();
    });
});

app.controller('viewLecture', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    setTimeout(function () {
        $('#lectureViewItem').html($scope.model.full_text);
        setModalDraggable('.modal-dialog');
    }, 200)
});
