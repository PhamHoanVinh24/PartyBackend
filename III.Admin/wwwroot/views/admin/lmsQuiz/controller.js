var ctxfolderLmsQuiz = "/views/admin/lmsQuiz";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_EDU_QUIZ', ['App_ESEIM_EDU_EXAM', 'App_ESEIM_LMS_DASHBOARD', 'App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
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

//app.directive("mathjaxBind", function () {
//    return {
//        restrict: "A",
//        controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
//            $scope.$watch($attrs.mathjaxBind, function (value) {
//                var $script = angular.element("<script type='math/tex'>")
//                    .html(value == undefined ? "" : value);
//                $element.html("");
//                $element.append($script);
//                MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
//            });
//        }]
//    };
//});

app.factory('dataserviceLmsQuiz', function ($http) {
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
        getItemQuiz: function (data, callbackExam) {
            $http.post('/Admin/LmsQuiz/GetItemQuiz?id=' + data).then(callbackExam);
        },
        delete: function (data, callback) {
            $http.post('/Admin/EduQuiz/Delete?id=' + data).then(callback);
        },
        getListCourse: function (callback) {
            $http.post('/Admin/EduQuiz/GetListCourse').then(callback);
        },
        //getListLecture: function (callback) {
        //    $http.post('/Admin/EduQuiz/GetListLecture').then(callback);
        //},
        getListSubject: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListSubject').then(callback);
        },
        getListLecture: function (subjectCode, callback) {
            $http.post('/Admin/LmsQuiz/GetListLecture?subjectCode=' + subjectCode).then(callback);
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
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
        },
        getUserShareQuizPermission: function (data, callback) {
            $http.post('/Admin/LmsQuiz/GetUserShareQuizPermission?id=' + data).then(callback);
        },
        updateQuizPermission: function (data, callback) {
            $http.post('/Admin/LmsQuiz/UpdateQuizPermission/', data).then(callback);
        },
        getListClass: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListClass').then(callback);
        },
        getCountQuiz: function (callback) {
            $http.post('/Admin/LmsDashBoard/CountQuizAssignAndVoluntary').then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserOfClass?classCode=' + data).then(callback);
        },
        // do quiz
        trackDilligence: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/TrackDilligence/', data).then(callback);
        },
        updateDoingExerciseProgress: function (data, callback) {
            $http.post('/Admin/LmsQuiz/UpdateDoingExerciseProgress/', data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EDU_QUIZ', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLmsQuiz, $cookies, $translate) {
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
        };

        $rootScope.listType = [
            {
                Code: 'QUESTION',
                Name: caption.LMS_PRACTICE_TEST_LBL_QUESTION
            }, {
                Code: 'ANSWER',
                Name: caption.LMS_QUIZ_LBL_ANSWER
            }
        ];
        $rootScope.listUnit = [
            {
                Code: "MINUTE",
                Name: "Phút"
            }, {
                Code: "HOUR",
                Name: "Giờ"
            },];
    });
    $rootScope.isAdded = false;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider, $locationProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsQuiz/Translation');
    caption = $translateProvider.translations();
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLmsQuiz + '/index.html',
            controller: 'indexLmsQuiz'
        })
        .when('/assignmentQuiz/', {
            templateUrl: ctxfolderLmsQuiz + '/index.html',
            controller: 'assignmentQuiz'
        })
        .when('/possessAndShareQuiz/', {
            templateUrl: ctxfolderLmsQuiz + '/index.html',
            controller: 'possessAndShareQuiz'
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

app.controller('indexLmsQuiz', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLmsQuiz, dataserviceLms, $translate, $timeout, $window, $filter) {
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    $(document).ready(function () {
        $("#sb-left-question-menu").addClass("open");
    });
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
        IsSharedAndEditable: true,
        OnlyAssignment: false
    };
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.isRenderLatex = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsQuiz/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Content = $scope.model.Content;
                d.CreFromDate = $scope.model.CreFromDate;
                d.CreToDate = $scope.model.CreToDate;
                d.Level = $scope.model.Level;
                d.SubjectCode = $scope.model.SubjectCode;
                d.LectureCode = $scope.model.LectureCode;
                d.CreatedBy = $scope.model.CreatedBy;
                d.IsSharedAndEditable = $scope.model.IsSharedAndEditable;
                d.OnlyAssignment = $scope.model.OnlyAssignment;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(268, '#tblData');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        /*.withOption('autoWidth', false)*/
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
            //contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            var element = $(row).find(".ng-non-bindable");
            //if (element) {
            //    var $script = angular.element("<script type='math/tex'>")
            //        .html(element.html() == undefined ? "" : element.html());
            //    element.html("");
            //    element.append($script);
            //}
            setTimeout(function () {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]);
            }, 100);
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"LMS_PRACTICE_TEST_LBL_ORDER" | translate}}').withOption('sClass', 'nowrap w25').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Content').withOption('sClass', '').withTitle('{{"LMS_PRACTICE_TEST_LBL_CONTENT" | translate}}').renderWith(function (data, type, full) {
        var title = "";
        if (full.Type !== 'QUIZ_GAME') {
            title = '<span class1="break-word"><div class="ng-non-bindable">' + decodeHTML(data) + '</div>';
            var typeIndex = $scope.listTypeQuiz.findIndex(x => x.Code == full.Type);
            if (typeIndex != -1) {
                title += caption[$scope.listTypeQuiz[typeIndex].Name] + '</span>';
            }
        } else {
            title = '<span class1="break-word">' +
                caption.LMS_QUIZ_GAME_TITLE +
                '<img style="height: 25px; margin-left: 25px" src="/images/lms/jigsaw.png" />' +
                '</span>';
        }
        if (full.IsAssignment === "True") {
            title += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px; margin-left: 10px" /><br/>';
            title += '<span class="text-purple fs10">(' + full.LmsTaskName;
            if (full.IsAlreadyDone === "True") {
                title += ' - Đã làm';
            }
            title += ')</span></br>';
        }
        return title;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectName').withOption('sClass', 'wpercent10').withTitle('{{"LMS_PRACTICE_TEST_LBL_SUBJECTS" | translate}}').renderWith(function (data, type, full) {
        return '<span style="font-size: 12px;color: darkblue;">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LectureName').withOption('sClass', 'wpercent10').withTitle('{{"LMS_LECTURE" | translate}}').renderWith(function (data, type, full) {
        return '<span style="font-size: 12px;color: green;">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TryTime').withOption('sClass', 'wpercent5').withTitle('{{"LMS_TRY_TIME" | translate}}').renderWith(function (data, type, full) {
        return '<span style="font-size: 12px;color: purple;">' + data + '</span>';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-10per').withTitle('{{"LMS_PRACTICE_TEST_MSG_DATE_CREATE" | translate}}').renderWith(function (data, type) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"LMS_QUIZ_COL_STATUS" | translate}}').renderWith(function (data, type, full, meta) {
    //    if (data == "Active") {
    //        return '<a ng-click="approve(' + full.Id + ')"><i class="fas fa-check-square fs25 pt10"></i></a> '
    //    }
    //    else {
    //        return '<a ng-click="approve(' + full.Id + ')"><i class="fas fa-square fs25 pt10"></i></a> '
    //    }
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DoPractice').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{ "LMS_DO_PRACTICE" | translate }}').renderWith(function (data, type, full, meta) {
        if (full.IsShared === "True" || full.IsAssignment === "True" || full.IsEditable === "True") {
            return '<a title="{{&quot;LMS_DO_PRACTICE&quot; | translate}}" ng-click="test(' + full.Id + ')"  class="fs25"><i class="fas fa-play text-green"></i></a>';
        }
        else {
            return '<a title="{{&quot;LMS_DO_PRACTICE&quot; | translate}}" ng-click="test(' + full.Id + ')"  class="fs25 disabled-element"><i class="fas fa-edit text-green"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        //return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="share(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-share-alt"></i></a>' +
        //    '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
        //    '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
        if (full.IsEditable === "True") {
            return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="share(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-share-alt"></i></a>' +
                '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
        else {
            return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="share(' + full.Id + ')" class="fs25 pr20 disabled-element"><i class="fas fa-share-alt"></i></a>' +
                '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10 disabled-element"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25 disabled-element"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.searchAssignmentOnly = function () {
        $scope.model.IsSharedAndEditable = false;
        $scope.model.OnlyAssignment = true;
        reloadData(true);
    }
    $scope.searchShareAndEditable = function () {
        $scope.model.IsSharedAndEditable = true;
        $scope.model.OnlyAssignment = false;
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/add-quiz.html',
            controller: 'addQuiz',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
            $scope.reloadCount();
            $rootScope.idQuiz = -1;
        }, function () {
        });
    };
    $scope.edit = function (id) {
        dataserviceLms.getItemQuiz(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/add-quiz.html',
                controller: 'editQuiz',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '70'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
                $scope.reloadCount();
                $rootScope.idQuiz = -1;
            }, function () {
            });
        });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceLms.deleteQuiz(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reloadCount();
            $scope.reloadNoResetPage();
        }, function () {
        });
    };

    $scope.test = function (id) {
        dataserviceLmsQuiz.getItemQuiz(id, function (rs) {
            rs = rs.data;
            if (rs == undefined || rs == null || rs === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                rs.fromPractice = false;
                rs.fromQuiz = true;
                var para = {
                    Model: rs
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsQuiz + '/test.html',
                    controller: 'testQuiz',
                    backdrop: 'static',
                    backdropClass: 'custom-black full-opacity',
                    windowClass: 'no-scroll',
                    size: '90',
                    resolve: {
                        para: function () {
                            return para;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    clearInterval(clockTick);
                    $scope.reloadNoResetPage();
                    window.userResultIndex = -1;
                }, function () {
                    clearInterval(clockTick);
                    window.userResultIndex = -1;
                });
            }
        });
    }
    $scope.share = function (id) {
        var userModel = {};

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsQuiz + '/shareObject.html',
            controller: 'shareQuiz',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        //CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    $scope.approve = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CMS_ITEM_VALIDATE_STATE_DISPLAY;
                $scope.ok = function () {

                    dataserviceLmsQuiz.aprrove(id, function (rs) {
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
            Name: caption.LMS_PRACTICE_TEST_LBL_DISPLAY

        }, {
            Code: 0,
            Name: caption.LMS_QUIZ_MSG_NOT_DISPLAY
        },
    ];
    $scope.listFeaturedOrdering = [
        {
            Code: 0,
            Name: caption.LMS_QUIZ_MSG_FREQUENTLY_ARTICLE

        }, {
            Code: 1,
            Name: caption.LMS_QUIZ_MSG_FORCUS,
        },
        {
            Code: 2,
            Name: caption.LMS_QUIZ_MSG_ENGLISH
        },

    ];
    $scope.reloadCount = function () {
        dataserviceLmsQuiz.getCountQuiz(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
    }
    $scope.initData = function () {
        dataserviceLmsQuiz.getListSubject(function (rs) {
            rs = rs.data;
            $rootScope.listSubject = rs;
        });
        dataserviceLmsQuiz.getCountQuiz(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
        dataserviceLms.getListTypeQuiz(function (rs) {
            rs = rs.data;
            $scope.listTypeQuiz = rs;
        });
        //dataserviceLmsQuiz.getListLecture(function (rs) {
        //    rs = rs.data;
        //    $scope.listLecture = rs;
        //});

    };
    $scope.initData();
    $rootScope.changeData = function (type, item) {
        if (type == "TrainingType") {
            $scope.modelCheckList.ItemCode = "";
            $scope.modelCheckList.ItemName = "";
        }
        else if (type == "SubjectCode") {
            dataserviceLmsQuiz.getListLecture(item.Code, function (rs) {
                rs = rs.data;
                $rootScope.listLecture = rs;
            })
        }
        else if (type == "LectCode" || type == "PracticeTestCode") {
            $scope.modelCheckList.ItemCode = item.Code;
            $scope.modelCheckList.ItemName = item.Name;
        }
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
            //str = str.replaceAll('\\', '\\\\');
        }

        return str;
    }

    //setTimeout(function () {
    //    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    //}, 200);
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

app.controller('assignmentQuiz',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataserviceLmsQuiz,
        dataserviceLms,
        $translate,
        $window,
        $filter) {
        $controller('indexLmsQuiz', { $scope: $scope });

        setTimeout(function () {
            $scope.searchAssignmentOnly();
        }, 500);
    });
app.controller('possessAndShareQuiz',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataserviceLmsQuiz,
        dataserviceLms,
        $translate,
        $window,
        $filter) {
        $controller('indexLmsQuiz', { $scope: $scope });

        setTimeout(function () {
            $scope.searchShareAndEditable();
        }, 500);
    });

app.controller('shareQuiz', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceLmsQuiz, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };
    $scope.modelClass = {
        Code: ''
    }
    $scope.modelShare = {
        isPublic: false
    }

    $scope.model1 = {
        UserName: '',
        GivenName: ''
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_QUIZ_USER_ALL
            }
        ];
        dataserviceLmsQuiz.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });

        dataserviceLmsQuiz.getUserShareQuizPermission($scope.model.Id,
            function (rs) {
                rs = rs.data;
                $scope.lstUserSharePermission = rs;
                var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == "All");
                if (allIndex != -1) {
                    $scope.lstUserSharePermission = $scope.lstUserSharePermission.filter(x => x.UserName == "All");
                }
            });

        dataserviceLmsQuiz.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName === '' && $scope.modelShare.isPublic !== true) {
            return App.toastrError(caption.LMS_QUIZ_MUST_CHOOSE_USER);
        }
        var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === "All");
        if (allIndex !== -1) {
            return App.toastrError(caption.LMS_QUIZ_ALREADY_ADD_ALL);
        }

        var model = angular.copy($scope.model1);
        if ($scope.modelShare.isPublic === true) {
            $scope.lstUserSharePermission = [];
            $scope.lstUserSharePermission.push({
                UserName: 'All',
                GivenName: caption.LMS_QUIZ_USER_ALL
            });
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceLmsQuiz.updateQuizPermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
        }
        else if (model.UserName === "All") {
            $scope.addUser(0);
        } else {
            var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
            if (userIndex !== -1) {
                App.toastrError(caption.LMS_QUIZ_USER_EXIST);
            }
            else {
                $scope.lstUserSharePermission.push(model);
                var share = JSON.stringify($scope.lstUserSharePermission);

                var answerData = {
                    Id: $scope.model.Id,
                    Share: share
                }

                dataserviceLmsQuiz.updateQuizPermission(answerData,
                    function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
            }
        }
    }

    $scope.addUser = function (index) {
        if (index >= $scope.listUser.length) {
            return;
        }
        var model = $scope.listUser[index];
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
        if (userIndex !== -1) {
            App.toastrError(caption.LMS_QUIZ_USER_EXIST);
            $scope.addUser(index + 1);
        }
        else if (model.UserName === "All") {
            $scope.addUser(index + 1);
        }
        else {
            $scope.lstUserSharePermission.push(model);
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceLmsQuiz.updateQuizPermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $scope.addUser(index + 1);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.addUser(index + 1);
                    }
                });
        }
    }

    $scope.classOff = function () {
        $scope.modelClass = {
            Code: ''
        };
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_QUIZ_USER_ALL
            }
        ];
        dataserviceLmsQuiz.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });
    }

    var allMember = {
        UserId: "ALL",
        GivenName: "Tất cả",
        UserName: "All",
        RoleSys: "",
        Branch: "",
        DepartmentName: ""
    }

    $scope.classSelect = function (obj) {
        $scope.listUser = [];
        dataserviceLmsQuiz.getListUserOfClass($scope.modelClass.Code, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.countUser = rs.length;
            $scope.listUser.unshift(allMember);
            $scope.isClassSelect = true;
        });
    }

    $scope.deleteShare = function (userName) {
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == userName);
        if (userIndex == -1) {
            return App.toastrError(caption.LMS_QUIZ_USER_NOT_EXIST);
        }

        $scope.lstUserSharePermission.splice(userIndex, 1);
        var share = JSON.stringify($scope.lstUserSharePermission);

        var answerData = {
            Id: $scope.model.Id,
            Share: share
        }

        dataserviceLmsQuiz.updateQuizPermission(answerData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.changeUser = function (item) {
        $scope.model1.GivenName = item.GivenName;
        $scope.model1.UserName = item.UserName;
        //$scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('testQuiz', function ($scope, $rootScope, $controller, $sce, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLmsQuiz, para, $filter, $translate, $timeout) {
    $controller('test', { $scope: $scope, $uibModalInstance: $uibModalInstance, para: para });
    $scope.loadDetailQuiz = function () {
        $scope.listQuestion = [];
        $scope.listQuestion.push($scope.model);
        for (var i = 0; i < $scope.listQuestion.length; i++) {
            $scope.listQuestion[i].Content = $sce.trustAsHtml($scope.listQuestion[i].Content)/*($scope.listQuestion[i].Content)*/;
            if ($scope.listQuestion[i].JsonData != null && $scope.listQuestion[i].JsonData != '') {
                $scope.listQuestion[i].listAnswer = JSON.parse($scope.listQuestion[i].JsonData);
            }
            else {
                $scope.listQuestion[i].listAnswer = [];
            }
            $scope.listQuestion[i].containVideo = {};
            $scope.listQuestion[i].ShowHint = false;
            $scope.totalPoint += $scope.listQuestion[i].Mark;
            var colorIndex = i % $scope.listColorIconBoard.length;
            $scope.listQuestion[i].color = { 'color': $scope.listColorIconBoard[colorIndex] };
            for (var j = 0; j < $scope.listQuestion[i].listAnswer.length; j++) {
                $scope.listQuestion[i].listAnswer[j].alphabet = $scope.alphabet[j];
                if ($scope.listQuestion[i].UserChoose == $scope.listQuestion[i].listAnswer[j].Code) {
                    $scope.listQuestion[i].listAnswer[j].check = true;
                    if ($scope.listQuestion[i].listAnswer[j].IsAnswer) {
                        $scope.currentPoint += $scope.listQuestion[i].Mark;
                    }
                }
                else {
                    $scope.listQuestion[i].listAnswer[j].check = false;
                }
                //$scope.listQuestion[i].listAnswer[j].Content = decodeHTML($scope.listQuestion[i].listAnswer[j].Answer);
                $scope.listQuestion[i].listAnswer[j].Content = $sce.trustAsHtml($scope.listQuestion[i].listAnswer[j].Answer);
                if ($scope.listQuestion[i].listAnswer[j].Type == "VIDEO") {
                    $scope.listQuestion[i].containVideo = { 'flex-wrap': 'wrap' };
                }
            };
            if ($scope.listQuestion[i].Type === 'QUIZ_SORT_ARRANGE') {
                $scope.initDragDrop(100, i);
            }
            if ($scope.listQuestion[i].Type === 'QUIZ_NO_CH_FILL_WORD' || $scope.listQuestion[i].Type === 'QUIZ_NO_CH_REPLY_WORD') {
                $scope.listQuestion[i].isFilled = false;
            }
            if ($scope.listQuestion[i].Type === 'QUIZ_PAIRS_ELEMENT') {
                $scope.listQuestion[i].modelFabric = {
                    canvas: null,
                    resultPairs: [],
                    listCheckAnswer: [],
                    index: i
                };
                setTimeout((function (i) {
                    console.log($scope.listQuestion[i].modelFabric);
                    //$scope.redraw($scope.listQuestion[i].listAnswer, 120, 50, 120, 50, 80, 250, 25, 400, i);
                })(i), 1000);
            }
            if ($scope.listQuestion[i].Type === 'QUIZ_GAME') {
                $scope.listQuestion[i].isCheck = false;
                $scope.listQuestion[i].userResult = "";
                $scope.listQuestion[i].played = false;
                $scope.listQuestion[i].playGame = false;
                $scope.listQuestion[i].isCorrect = false;
            }
            try {
                $scope.listQuestion[i].ListMediaType = JSON.parse($scope.listQuestion[i].QuestionMedia);
                console.log($scope.listQuestion[i].ListMediaType.length);
            } catch (e) {
                console.log(e);
                $scope.listQuestion[i].ListMediaType = [];
            }
            $scope.totalQuestion++;
        }
        $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
        $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
        $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
        $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
        setTimeout(function () {
            MathJax.Hub.Register.StartupHook("End", function () {
                console.log("Mathjax loaded");
                console.log(MathJax);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"]);
            });
        }, 1000);
    }
    initData = function () {
        //$scope.model.typeTraining = "DO_QUIZ";
        //$scope.model.objectCode = $rootScope.data.SubjectCode;
        $scope.model = para.Model;
        $scope.model.IdQuiz = $scope.model.Id;
        $scope.model.objectType = "QUIZ";
        $scope.loadDetailQuiz();
        console.log($scope.model.IsAlreadyDone);
        $scope.examTime = new moment();
        if ($scope.model.Unit === "HOUR") {
            $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'hours').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
        } else {
            $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
        }
        setTimeout(function () {
            $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
            console.log($scope.timeStart);
            initClockSimple($scope.examDeadline);
        }, 500);
    }
    initData();
    $scope.submit = function () {
        if ($scope.model.IsAlreadyDone === true) {
            trackDiligence("", "QUIZ", $scope.model.LectureCode);
        } else {
            var itemProgress = {
                ItemCode: $scope.model.LectureCode,
                LmsTaskCode: $scope.model.LmsTaskCode
            }
            dataserviceLmsQuiz.updateDoingExerciseProgress(itemProgress, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
                trackDiligence($scope.model.LmsTaskCode, "QUIZ", $scope.listQuestion[0].Code);
            });
        }
    }
    function trackDiligence(taskCode, quizType, objCode) {
        var listTrackDiligent = [];
        var listPracticeResult = [];
        var correctAnswer = $scope.getCorrectAnswer(0);
        var userResult = $scope.getUserResult(0);
        var objPracticeResult = {
            Id: 1, // will be changed in server side
            StartTime: $scope.timeStart,
            EndTime: moment().format("DD/MM/YYYY HH:mm:ss"),
            UserResult: userResult,
            CorrectResult: correctAnswer,
            IsCorrect: false,
            Device: "WEB",
            TaskCode: taskCode,
            QuizType: quizType,
            QuizObjCode: objCode
        }
        listPracticeResult.push(objPracticeResult);
        var objTrackDilligent = {
            ObjectType: "QUIZ",
            ObjectCode: $scope.listQuestion[0].Code,
            ObjectResult: JSON.stringify(listPracticeResult)
        };
        listTrackDiligent.push(objTrackDilligent);
        var modelDiligence = {
            sListDilligence: JSON.stringify(listTrackDiligent)
        }
        dataserviceLmsQuiz.trackDilligence(modelDiligence, function (rs) {
            rs = rs.data;
            console.log(rs.Title);
            $uibModalInstance.close();
        });
    }
    function initClockSimple(date) {
        date = date.split(':');
        toDate = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);

        var currentDate = new Date();
        dateDif = toDate - currentDate;
        var duration = moment.duration(dateDif, 'milliseconds');
        $scope.countDown = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
        $timeout(function () {
            $scope.$apply();
        })
        var interval = 1000;
        var ticksCount = Math.round(dateDif / 1000);
        clockTick = setInterval(function () {
            ticksCount--;
            if (ticksCount >= 0) {
                duration = moment.duration(duration - interval, 'milliseconds');
                $scope.countDown = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
                $timeout(function () {
                    $scope.$apply();
                })
            }
            else {
                clearInterval(clockTick);
            }
        }, interval);
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