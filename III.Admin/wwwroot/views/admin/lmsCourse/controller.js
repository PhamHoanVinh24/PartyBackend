var ctxfolder = "/views/admin/lmsCourse";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_LMS_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
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
app.directive('customOnChangeCourse', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCourse);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
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
            $http.post('/Admin/LmsCourse/Delete?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/LmsCourse/Insert', data).then(callback);
        },
        deleteCourseSubject: function (data, callback) {
            $http.post('/Admin/LmsCourse/DeleteCourseSubject', data).then(callback);
        },
        insertCourseSubject: function (data, callback) {
            $http.post('/Admin/LmsCourse/InsertCourseSubject', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/LmsCourse/UpdateAll/', data).then(callback);
        },
        getItemCourse: function (data, callback) {
            $http.post('/Admin/LmsCourse/GetItemCourse/' + data).then(callback);
        },
        //Subject
        getListSubject: function (callback) {
            $http.post('/Admin/LmsCourse/GetListSubject').then(callback);
        },
        getItemSubject: function (data, callback) {
            $http.post('/Admin/LmsCourse/GetItemSubject?subjectCode=' + data).then(callback);
        },
        updateListSubject: function (data, callback) {
            $http.post('/Admin/LmsCourse/UpdateListSubject/', data).then(callback);
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
                return diffHrs + caption.LMS_PRACTICE_TEST_LBL_TIME_HOUR + diffMins + caption.LMS_COURSE_MSG_MINUTE_AGO;
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
        $rootScope.StatusData = [{
            Value: 1,
            Name: caption.LMS_COURSE_MSG_ACTIVATED
        }, {
            Value: 2,
            Name: caption.LMS_COURSE_MSG_NOT_ACTIVATED
        }];

        $rootScope.validationOptions = {
            rules: {
                CourseCode: {
                    required: true,
                },
                CourseName: {
                    required: true,
                },
            },
            messages: {
                CourseCode: {
                    required: caption.LMS_COURSE_VALIDATE_CODE,
                },
                CourseName: {
                    required: caption.LMS_COURSE_VALIDATE_NAME,
                },
            }
        }
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
            Name: "Sẵn sàng"
        }, {
            Code: "UNAVAILABLE",
            Name: "Chưa sẵn sàng"
        },];
    $rootScope.listUnit = [
        {
            Code: "MINUTE",
            Name: "Phút"
        }, {
            Code: "HOUR",
            Name: "Giờ"
        },];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsCourse/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ ctxfolder + '/index-course.html',
            controller: 'indexCourse'
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
app.controller('indexCourse', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.model = {
        CourseName: "",
        CourseCode: ""
    }
    $scope.initData = function () {
        dataservice.getListSubject(function (rs) {
            rs = rs.data;
            $rootScope.listSubject = rs;
            for (var i = 0; i < $rootScope.listSubject.length; i++) {
                $rootScope.listSubject[i].Description = decodeHTML($rootScope.listSubject[i].Description);
            }
        });
    };
    $scope.initData();
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsCourse/JTableCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CourseName = $scope.model.CourseName;
                d.CourseCode = $scope.model.CourseCode;
            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"LMS_COURSE_STT" | translate}}').withOption('sClass', 'nowrap wpercent1').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CourseCode').withTitle('{{"LMS_COURSE_LBL_CODE_COURSE" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CourseName').withTitle('{{"LMS_COURSE_LBL_NAME_COURSE" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CourseNote').withTitle('{{"LMS_PRACTICE_TEST_LBL_DESCRIPTION" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Teacher').withTitle('{{"Giáo Viên" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Duration').withTitle('{{"LMS_PRACTICE_TEST_LBL_TIME" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type, full) {
        if (data) {
            var unit = $rootScope.listUnit.findIndex(x => x.Code === full.Unit) != -1
                ? $rootScope.listUnit.find(x => x.Code === full.Unit).Name
                : "Phút";
            return data + ' ' + unit;
        } else {
            return "";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ImgCover').withTitle('{{"LMS_PRACTICE_TEST_LBL_IMAGE" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
        return data === "" ? "" : '<img class="img-circle" src="images/' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"LMS_COURSE_LBL_STATUS" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type, full) {
        return $rootScope.listStatus.findIndex(x => x.Code === data) != -1
            ? $rootScope.listStatus.find(x => x.Code === data).Name
            : "Không sẵn sàng";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('VideoPresent').withTitle('{{"LMS_DASD_BOARD_LBL_LECT_VIDEO_SUBJECT" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type, full) {
        return '<div class="pull-left ml10"><div class="btn-group actions d-flex"><a class="text-center" ng-click="popupVideo(' + full.Id + ')"><img src="/images/default/video-call-2.png" height="35" width="40"></a></div></div>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('FileBase').withTitle('{{"LMS_COURSE_LBL_DOCUMENT" | translate}}').withOption('sClass', 'w100').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"LMS_COURSE_MSG_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate }}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{"LMS_PRACTICE_TEST_LBL_DELETE" | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.search = function () {
        reloadData(true);
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

    $scope.add = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/add.html",
            controller: 'add',
            size: '60',
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {
        }, function () {
            reloadData();
        });
    }
    $scope.edit = function (id) {
        dataservice.getItemCourse(id, function (rs) {
            rs = rs.data;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add.html',
                controller: 'edit',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return rs;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () {
                reloadData();
            });
        });
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
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
    };

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
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, Upload) {
    var vm = $scope;
    $scope.model = {
        CourseCode: '',
        CourseName: '',
        CourseNote: '',
        ImgCover: '',
        Duration: '',
        Unit: '',
        Status: '',
        Flag: '',
        VideoPresent: '',
        FileBase: '',
        Rating: '',
    };
    $scope.FileBase = "";
    $scope.ImageCover = "";
    $scope.loadFileCourse = function (event) {
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
            data.ModuleName = "LMS_COURSE";
            data.IsMore = false;
            //data.uuid = create_UUID();

            //if (!$scope.isProgressModelOpen) {
            //    $scope.viewProgress();
            //}
            //$rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

            Upload.upload({
                url: '/Admin/LmsCourse/InsertObjectFileCourse/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.FileBase = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
                //var index = $rootScope.progress.findIndex(x => x.uuid == result.Object);
                //$rootScope.progress.splice(index, 1);
                //if ($rootScope.progress.length == 0) {
                //    $scope.progressModal.close("End uploading");
                //    $scope.isProgressModelOpen = false;
                //}
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //var data = evt.config.data;
                //var index = $rootScope.progress.findIndex(x => x.uuid == data.uuid);
                //$rootScope.progress[index].progress = progressPercentage + '% ';
                //$rootScope.progress[index].style.width = progressPercentage + '% ';
            });
        }
    };
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
            data.ModuleName = "LMS_COURSE";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsCourse/InsertObjectFileCourse/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.ImgCover = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };

    $scope.showVideo = function () {
        $rootScope.video = $scope.model.VideoPresent;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video.html',
            controller: function ($scope, $uibModalInstance, youtubeEmbedUtils) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    if ($scope.edit !== true) {
        $scope.title = caption.LMS_COURSE_LBL_ADD_NEW_COURSE;
    }
    $scope.listDataType = [
        { Code: 'TEXT', Name: caption.LMS_COURSE_MSG_STRING },
        { Code: 'NUMBER', Name: caption.LMS_COURSE_MSG_NUMBER },
        { Code: 'MONEY', Name: caption.LMS_COURSE_PRECEDENT },
        { Code: 'DATETIME', Name: caption.LMS_COURSE_DATE }];
    $scope.flag = [
        { Code: '1', Name: caption.LMS_COURSE_PRESENTLY },
        { Code: '2', Name: caption.LMS_COURSE_HIDE }];
    $scope.ratingList = [1, 2, 3, 4, 5];
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
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCourse'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemCourse'].getData();
            $scope.model.CourseNote = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.CourseId = rs.ID;
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
    };

    // subject area
    $scope.addSubject = function () {
        if (/*!validationSelect($scope.model).Status*/true) {
            if ($rootScope.CourseId == '' || $rootScope.CourseId == null || $rootScope.CourseId == undefined) {
                return App.toastrError(caption.LMS_COURSE_NOT_ADDED); // LMS_COURSE_NOT_ADDED
            }
            if ($scope.model.SubjectCode == '' || $scope.model.SubjectCode == null || $scope.model.SubjectCode == undefined) {
                return App.toastrError(caption.LMS_SUBJECT_CODE_NOT_CHOSEN); // LMS_SUBJECT_CODE_NOT_CHOSEN
            }

            dataservice.getItemSubject($scope.model.SubjectCode, function (rs) {
                rs = rs.data;

                var obj = {
                    Id: generateUUID(),
                    SubjectCode: $scope.model.SubjectCode,
                    SubjectName: rs.SubjectName,
                    ContentDecode: decodeHTML(rs.SubjectDescription),
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.SubjectCode == obj.SubjectCode) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError(caption.LMS_SUBJECT_CODE_EXIST); // LMS_SUBJECT_CODE_EXIST
                }

                $rootScope.listDetail.push(obj);

                var jsonData = JSON.stringify($rootScope.listDetail);
                var subjectData = {
                    Id: $rootScope.CourseId,
                    ListSubject: jsonData
                }

                dataservice.updateListSubject(subjectData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        //$scope.reloadQuestion();
                        App.toastrSuccess(rs.Title);
                        var courseSubject = {
                            CourseCode: rs.Object,
                            SubjectCode: $scope.model.SubjectCode
                        }
                        dataservice.insertCourseSubject(courseSubject, function (result) {
                            result = result.data;
                            if (result.Error) {
                                return App.toastrError(rs.Title);
                            }
                        });
                    }
                });
            });
        }
    };
    $scope.deleteSubject = function (data) {
        if ($rootScope.listDetail.indexOf(data) == -1) {
            App.toastrError(caption.COM_ERR_DELETE);
        } else {
            var index = $rootScope.listDetail.indexOf(data);
            var dataSubject = $rootScope.listDetail[index];
            $rootScope.listDetail.splice(index, 1);

            var jsonData = JSON.stringify($rootScope.listDetail);
            var subjectData = {
                Id: $rootScope.CourseId,
                ListSubject: jsonData
            }

            dataservice.updateListSubject(subjectData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    var courseSubject = {
                        CourseCode: rs.Object,
                        SubjectCode: dataSubject.SubjectCode
                    }
                    dataservice.deleteCourseSubject(courseSubject, function (result) {
                        result = result.data;
                        if (result.Error) {
                            return App.toastrError(rs.Title);
                        }
                    });
                }
            });
        }
    };
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCourse', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    $scope.changeData = function (key) {
        if (key == "Flag") {
            $scope.errorFlag = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Flag == "" || data.Flag == null || data.Flag == undefined) {
            $scope.errorFlag = true;
            mess.Status = true;
        } else {
            $scope.errorFlag = false;
        }

        return mess;
    };
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('edit', function ($scope, $rootScope, $controller, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $controller('add', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.title = caption.LMS_COURSE_EDIT_OLD_COURSE;
    var vm = $scope;
    $scope.init = function () {
        $scope.model = para;
        $scope.model.Rating = parseInt(para.Rating);
        $scope.model.Flag = "" + para.Flag;
        $rootScope.CourseId = $scope.model.Id;
        $scope.ImageCover = $scope.model.ImgCover != null && $scope.model.ImgCover != '' ? $scope.model.ImgCover.split('/').pop() : '';
        $scope.FileBase = $scope.model.FileBase != null && $scope.model.FileBase != '' ? $scope.model.FileBase.split('/').pop() : '';
        if ($scope.model.ListSubject != null && $scope.model.ListSubject != '') {
            $rootScope.listDetail = JSON.parse($scope.model.ListSubject);
        }
        else {
            $rootScope.listDetail = [];
        }
    }
    $scope.init();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCourse'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemCourse'].getData();
            $scope.model.CourseNote = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
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
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Flag == "" || data.Flag == null || data.Flag == undefined) {
            $scope.errorFlag = true;
            mess.Status = true;
        } else {
            $scope.errorFlag = false;
        }

        return mess;
    };
});

