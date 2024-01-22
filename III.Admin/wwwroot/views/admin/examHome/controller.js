var ctxfolder = "/views/admin/examHome";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
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

        //Comment
        insertComment: function (data, callback) {
            $http.post('/Admin/ExamHome/InsertComment', data).then(callback);
        },
        updateComment: function (data, callback) {
            $http.post('/Admin/ExamHome/UpdateComment', data).then(callback);
        },
        deleteComment: function (data, callback) {
            $http.post('/Admin/ExamHome/DeleteComment?id=' + data).then(callback);
        },
        getListComment: function (data, callback) {
            $http.post('/Admin/ExamHome/GetListComment?parentId=' + data).then(callback);
        },
        addFileComment: function (data, callback) {
            submitFormUpload('/Admin/ExamHome/AddFileComment', data, callback);
        },
        deleteFileComment: function (data, callback) {
            $http.post('/Admin/ExamHome/DeleteFileComment?id=' + data).then(callback);
        },
        getFileItem: function (data, callback) {
            $http.post('/Admin/ExamHome/GetFileItem?id=' + data).then(callback);
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
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
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
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/UserBusyOrFree/TranslationCusHome');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
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

    $scope.changeCategory = function (code, type) {
        switch (type) {
            case 'Course':
                $rootScope.ParentCode = code;
                $rootScope.reloadSubject();
                break;

            case 'Subject':
                dataservice.getListCategoryByParent(code, function (rs) {
                    rs = rs.data;
                    $scope.listSection = rs;
                });

                dataservice.getListLectureByCategory(code, function (rs) {
                    rs = rs.data;
                    $scope.listLecture = rs;
                    for (var i = 0; i < $scope.listLecture.length; i++) {
                        $scope.listLecture[i].full_text_encode = decodeHTML($scope.listLecture[i].full_text);
                    }
                });

                dataservice.getListQuestionByLecture(code, function (rs) {
                    rs = rs.data;
                    $scope.listQuestion = rs;
                    for (var i = 0; i < $scope.listQuestion.length; i++) {
                        $scope.listQuestion[i].ContentEnCode = decodeHTML($scope.listQuestion[i].Content);
                    }
                });

                break;

            case 'Section':

                break;
            case 'Lecture':

                break;
        }
    };

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
            url: "/Admin/ExamHome/JTableCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ParentCode = $rootScope.ParentCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.changeCategory(Id, 'Subject');
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"Loại" | translate}}').withOption('sClass', 'nowrap dataTable-w80 text-center').renderWith(function (data, type) {
        var icon = listIcon[getRndInteger(0, 3)];
        var color = listColor[getRndInteger(0, 3)];

        return '<button style = "width: 25px; height: 25px; padding: 0px; background:' + color + '" class="btn btn-icon-only btn-circle btn-outline"><i class="text-white ' + icon + '"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"Môn học" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
        return '<span class="text-important">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"Thời lượng" | translate}}').withOption('sClass', 'nowrap w100 text-center').renderWith(function (data, type) {
        return '<span class="text-primary">3 Tháng</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {
        return data;
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
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }

    $scope.viewLectureDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewLecture.html',
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
            templateUrl: ctxfolder + '/viewQuestion.html',
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

app.controller('viewLecture', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    $scope.modelComment = {
        Comment: ''
    }
    $rootScope.id = -1;

    $scope.initData = function () {
        dataservice.getListComment($scope.model.id, function (rs) {
            rs = rs.data;
            $scope.comments = rs.Object;
        });
    };


    $scope.addComment = function () {
        var obj = {
            ParentId: $scope.model.id,
            Comment: $scope.modelComment.Comment
        }
        dataservice.insertComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $rootScope.id = rs.ID;
                $scope.initData();
            }
        });
    }

    $scope.editComment = function (cmt) {
        var obj = {
            Id: cmt.Id,
            ParentId: $scope.model.id,
            Comment: cmt.Comment
        }
        dataservice.updateComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $rootScope.id = rs.ID;
                $scope.initData();
            }
        });
    }

    $scope.deleteComment = function (id) {
        dataservice.deleteComment(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }

    $scope.deleteFileComment = function (id) {
        dataservice.deleteFileComment(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }

    $scope.setObjCode = function (code) {
        $scope.ObjCode = code;
    }

    var count = 1;

    $scope.uploadFileComment = function (event) {
        $scope.file = event.target.files[0];
        if (count == 1) {
            count = count + 1;
            if ($scope.file == '' || $scope.file == undefined) {
                count = 1;
                App.toastrError(caption.COM_MSG_CHOSE_FILE);
            }
            else {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                var data = {};
                data.FileUpload = $scope.file;
                data.objCode = $scope.ObjCode;

                var formData = new FormData();
                formData.append("fileUpload", data.FileUpload);
                formData.append("objCode", data.objCode);

                dataservice.addFileComment(formData, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                        App.unblockUI("#modal-body");
                        count = 1;
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.initData();
                        App.unblockUI("#modal-body");
                        $('#' + $scope.chkCodeFile).replaceWith($('#' + $scope.chkCodeFile).val('').clone(true));
                        count = 1;
                    }
                })
            }
        }
    }

    $scope.viewFile = function (file) {
        var obj = {
            Type: '',
            Source: ''
        };

        if (file.FileTypePhysic === '.mp4') {
            obj.Type = 'video';
            dataservice.getFileItem(file.Id, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    obj.Source = result.Object;
                    $scope.viewFileDetail(obj);
                }
            });
        } else if (file.FileTypePhysic === '.mp3' || file.FileTypePhysic === '.wav') {
            obj.Type = 'audio';
            dataservice.getFileItem(file.Id, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    obj.Source = result.Object;
                    $scope.viewFileDetail(obj);
                }
            });
        } else {
            App.toastrError('Tệp tin chưa hỗ trợ phát');
        }
    }


    $scope.viewFileDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewFile.html',
            controller: 'viewFile',
            backdrop: 'static',
            size: '40',
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

    setTimeout(function () {
        $('#lectureViewItem').html($scope.model.full_text);
        $scope.initData();
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('viewQuestion', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    setTimeout(function () {
        $('#questionViewItem').html($scope.model.Content);
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('viewFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

