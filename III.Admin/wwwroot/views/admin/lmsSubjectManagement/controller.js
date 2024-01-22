var ctxfolderLmsSubjectManagement = "/views/admin/lmsSubjectManagement";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderLmsSubjectManagementMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_EDU_EXAM', 'App_ESEIM_LMS_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber', 'youtube-embed']).
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
            $http.post('/Admin/LmsSubjectManagement/DeleteSubject?id=' + data).then(callback);
        },
        //Popup lecture
        getSubject: function (data, data1, callback) {
            $http.post('/Admin/LmsSubjectManagement/GetSubject?id=' + data + '&lmsTaskCode=' + data1).then(callback);
        },
        getListDetailQuiz: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/GetListDetailQuiz?subjectCode=' + data).then(callback);
        },
        logSession: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/LogSession/', data).then(callback);
        },
        // view lecture
        trackDilligence: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/TrackDilligence/', data).then(callback);
        },
        updateViewingLectureProgress: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/UpdateViewingLectureProgress/', data).then(callback);
        },
        getCountSubject: function (callback) {
            $http.post('/Admin/LmsDashBoard/CountSubjectAssignAndVoluntary').then(callback);
        }
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
        $rootScope.StatusData = [{
            Value: 1,
            Name: 'LMS_ACTIVATED'
        }, {
            Value: 2,
            Name: 'LMS_NOT_ACTIVATED'
        }];
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

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider, $locationProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsSubjectManagement/Translation');
    $locationProvider.hashPrefix('');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderLmsSubjectManagement + '/index-subject.html',
            controller: 'indexLmsSubject'
        })
        .when('/assignmentSubject/', {
            templateUrl: ctxfolderLmsSubjectManagement + '/index-subject.html',
            controller: 'assignmentSubject'
        })
        .when('/possessAndShareSubject/', {
            templateUrl: ctxfolderLmsSubjectManagement + '/index-subject.html',
            controller: 'possessAndShareSubject'
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
app.controller('indexLmsSubject', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $(document).ready(function () {
        $("#sb-left-subject-menu").addClass("open");
    });
    var listIcon = ['fa fa-file-word-o', 'fa fa-file-powerpoint-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o'];
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        SubjectCode: '',
        SubjectName: '',
        IsSharedAndEditable: true,
        OnlyAssignment: false
    };

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsSubjectManagement/JTableCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SubjectCode = $scope.model.SubjectCode;
                d.SubjectName = $scope.model.SubjectName;
                d.IsSharedAndEditable = $scope.model.IsSharedAndEditable;
                d.OnlyAssignment = $scope.model.OnlyAssignment;
            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
                heightTableViewportManual(318, '#tblDataSubject');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"LMS_PRACTICE_TEST_LBL_ORDER" | translate}}').withOption('sClass', 'nowrap wpercent01').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectCode').withTitle('{{"LMS_SUBJECT_CODE" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectName').withTitle('{{"LMS_SUBJECT_NAME" | translate}}').withOption('sClass', 'wpercent1 text-wrap mnw150').renderWith(function (data, type, full) {
        var title = '<span class="text-important">' + data + ' - ' + full.SubjectCode + '</span>';
        if (full.IsAssignment === "True" && $scope.model.OnlyAssignment === true) {
            title += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px; margin-left: 10px" /><br/>';
            title += '<span class="text-purple fs10">(' + full.LmsTaskName;
            if (full.IsAlreadyDone === "True") {
                title += ' - Đã làm';
            }
            title += ')</span></br>';
        }
        return title;
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectDescription').withTitle('{{"LMS_DESC" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Teacher').withTitle('{{"Giáo Viên" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Duration').withTitle('{{"LMS_DURATION" | translate}}').withOption('sClass', 'nowrap wpercent01').renderWith(function (data, type, full) {
        var unit = $rootScope.listUnit.findIndex(x => x.Code == full.Unit) != -1 ? $rootScope.listUnit.find(x => x.Code == full.Unit).Name : caption.LMS_DASH_BOARD_TIME_MINUTE;
        return data + ' ' + unit;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ImageCover').withTitle('{{"LMS_IMAGE" | translate}}').withOption('sClass', 'nowrap wpercent1').renderWith(function (data, type) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"LMS_SUBJECT_STATUS" | translate}}').withOption('sClass', 'nowrap wpercent1').renderWith(function (data, type) {
        var status = $rootScope.listStatus.findIndex(x => x.Code == data) != -1 ? $rootScope.listStatus.find(x => x.Code == data).Name : caption.LMS_UNAVAILABLE;
        return status;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('VideoPresent').withTitle('{{"LMS_DASD_BOARD_LBL_LECT_VIDEO_SUBJECT" | translate}}').withOption('sClass', 'nowrap wpercent1').renderWith(function (data, type, full) {
        if (full.IsShared === "True" || full.IsAssignment === "True" || full.IsEditable === "True") {
            return '<div class="pull-left ml10"><div class="btn-group actions d-flex"><a class="text-center" ng-click="popupVideo(' + full.Id + ',\'' + full.LmsTaskCode + '\')"><img src="/images/default/video-call-2.png" height="35" width="40"></a></div></div>';
        }
        else {
            return '<div class="pull-left ml10 disabled-element"><div class="btn-group actions d-flex"><a class="text-center" ng-click="popupVideo(' + full.Id + ')"><img src="/images/default/video-call-2.png" height="35" width="40"></a></div></div>';
        }
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('FileBase').withTitle('{{"LMS_SBL_A_DOCUMENT" | translate}}').withOption('sClass', 'wpercent1 text-wrap mnw100').renderWith(function (data, type, full) {
        return '<a href="' + data + '">' + data + '</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'wpercent01 nowrap').withTitle('{{"LMS_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        if (full.IsEditable === "True") {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate }}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate }}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
        else {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate }}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10 disabled-element"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate }}" ng-click="delete(' + full.Id + ')"  class="fs25 disabled-element"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $scope.add = function () {
        location.href = "/Admin/LmsDashBoard#addSubject";
    }
    $scope.edit = function (id) {
        location.href = "/Admin/LmsDashBoard?id=" + id + "#editSubject";
    };
    $scope.popupVideo = function (id, lmsTaskCode) {
        App.blockUI({
            target: "#contentMainSubjectManage",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getSubject(id, lmsTaskCode, function (rs) {
            rs = rs.data;
            $rootScope.SubjectCode = rs.SubjectCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsSubjectManagement + '/popup-video.html',
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
                clearInterval(clockTick);
                $rootScope.data = null;
                window.userResultIndex = -1;
                //$scope.reload();
            }, function () {
                clearInterval(clockTick);
                window.userResultIndex = -1;
            });
        });
    }
    $scope.reload = function () {
        reloadData(true);
    };
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
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderLmsSubjectManagementMessage + '/messageConfirmDeleted.html',
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
            $scope.reloadCount();
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.reloadCount = function () {
        dataservice.getCountSubject(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
    };
    $scope.initData = function () {
        dataservice.getCountSubject(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
    };
    $scope.initData();
    $scope.viewLectureDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsSubjectManagement + '/viewLecture.html',
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
            templateUrl: ctxfolderLmsSubjectManagement + '/viewQuestion.html',
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

app.controller('assignmentSubject',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataservice,
        $translate,
        $window,
        $filter) {
        $controller('indexLmsSubject', { $scope: $scope });

        setTimeout(function () {
            $scope.searchAssignmentOnly();
        }, 500);
    });
app.controller('possessAndShareSubject',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataservice,
        $translate,
        $window,
        $filter) {
        $controller('indexLmsSubject', { $scope: $scope });

        setTimeout(function () {
            $scope.searchShareAndEditable();
        }, 500);
    });
app.controller('popupVideo', function ($scope, $rootScope, $sce, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, para, $timeout) {
    $scope.presentation = {
        VideoUpload: '',
        YoutubeUrl: ''
    };
    $rootScope.uiChange = false;
    $scope.triggerUiChange = function () {
        $rootScope.uiChange = !$rootScope.uiChange;
    }
    $scope.isVideoPlaying = false;
    $scope.init = function () {
        $rootScope.data = para;
        $scope.activeTab = 1;
        $scope.playYoutube = $scope.$on('youtube.player.paused', function ($event, player) {
            // log it
            $scope.logTimeStart();
        });
        if ($rootScope.data.ListLecture.length > 0) {
            $scope.presentation = $rootScope.data.ListLecture[0];
            $scope.presentation.Content = $sce.trustAsHtml($scope.presentation.LectDescription);
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            if ($scope.presentation.VideoPresent) {
                var match = $scope.presentation.VideoPresent.match(regExp);
                var idxDot = $scope.presentation.VideoPresent.lastIndexOf(".") + 1;
                var extFile = $scope.presentation.VideoPresent.substr(idxDot, $scope.presentation.VideoPresent.length).toLowerCase();
                if (match && match[2].length == 11) {
                    $scope.presentation.YoutubeUrl = $scope.presentation.VideoPresent;
                    $scope.videoType = "YOUTUBE";
                    $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
                    $scope.isVideoPlaying = true;
                }
                else if (extFile == "mp4") {
                    $scope.presentation.YoutubeUrl = '';
                    $scope.videoType = "HTML5";
                    $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
                    $scope.isVideoPlaying = true;
                    $scope.presentation.VideoUpload = $scope.presentation.VideoPresent;
                }
                else {
                    $scope.presentation.YoutubeUrl = '';
                    $scope.videoType = "DRIVE";
                    $scope.isVideoPlaying = false;
                    $scope.presentation.VideoUpload = $scope.presentation.VideoPresent;
                }
            }
            else {
                $scope.presentation.YoutubeUrl = '';
                $scope.videoType = "HTML5";
                $scope.isVideoPlaying = false;
                $scope.presentation.VideoUpload = '';
            }
            $scope.oldLectureIndex = 0;
            var session = {
                SubjectCode: $rootScope.data.SubjectCode,
                LectureCode: $rootScope.data.ListLecture[0].LectCode,
                SessionCode: $rootScope.sessionCode,
            };
            dataservice.logSession(session, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
            });
        }
    }
    $scope.init();
    $scope.indexLecture = 0;
    $scope.chooseLecture = function (index) {
        $scope.indexLecture = index;
        if ($scope.isVideoPlaying) {
            var session = {
                SubjectCode: $rootScope.data.SubjectCode,
                LectureCode: $rootScope.data.ListLecture[$scope.oldLectureIndex].LectCode,
                SessionCode: $rootScope.sessionCode,
                StopTime: moment()
            };
            //dataservice.logSession(session, function (rs) {
            //    rs = rs.data;
            //    $scope.oldLectureIndex = index;
            //    App.toastrInfo("LMS_YOU_FINISHED_LECTURE");
            //});
        }
        $scope.presentation = $rootScope.data.ListLecture[index];
        $scope.presentation.Content = $sce.trustAsHtml($scope.presentation.LectDescription);
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        if ($scope.presentation.VideoPresent) {
            var match = $scope.presentation.VideoPresent.match(regExp);
            var idxDot = $scope.presentation.VideoPresent.lastIndexOf(".") + 1;
            var extFile = $scope.presentation.VideoPresent.substr(idxDot, $scope.presentation.VideoPresent.length).toLowerCase();
            if (match && match[2].length == 11) {
                $scope.presentation.YoutubeUrl = $scope.presentation.VideoPresent;
                $scope.videoType = "YOUTUBE";
                videoHandler.stopVideo();
                $scope.isVideoPlaying = true;
                $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
            }
            else if (extFile == "mp4") {
                $scope.presentation.YoutubeUrl = '';
                $scope.videoType = "HTML5";
                videoHandler.stopVideo();
                $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
                $scope.isVideoPlaying = true;
                $scope.presentation.VideoUpload = $scope.presentation.VideoPresent;
            }
            else {
                $scope.presentation.YoutubeUrl = '';
                $scope.videoType = "DRIVE";
                videoHandler.stopVideo();
                $scope.isVideoPlaying = false;
                $scope.presentation.VideoUpload = $scope.presentation.VideoPresent;
            }
        }
        else {
            $scope.presentation.YoutubeUrl = '';
            $scope.videoType = "HTML5";
            videoHandler.stopVideo();
            $scope.isVideoPlaying = false;
            $scope.presentation.VideoUpload = '';
        }
        //var session = {
        //    SubjectCode: $rootScope.data.SubjectCode,
        //    LectureCode: $rootScope.data.ListLecture[index].LectCode,
        //    SessionCode: $rootScope.sessionCode,
        //};
        //dataservice.logSession(session, function (rs) {
        //    rs = rs.data;
        //    console.log(rs.Title);
        //});
    };
    $scope.logTimeStart = function () {
        if ($scope.isVideoPlaying == false) {
            $timeout(function () {
                $scope.isVideoPlaying = true;
                scope.$apply();
            })
            $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
            console.log($scope.timeStart);
        }
    }
    $scope.finishLecture = function () {
        if ($scope.isVideoPlaying != true) {
            App.toastrError(caption.LMS_VIDEO_NOT_PLAYED);
        }
        if ($rootScope.data.IsAlreadyDone === true || $rootScope.data.IsAlreadyDone == undefined) {
            trackDiligence("", "", "");
        } else {
            var itemProgress = {
                ItemCode: $scope.model.LectureCode,
                LmsTaskCode: $scope.model.LmsTaskCode
            }
            dataservice.updateViewingLectureProgress(itemProgress, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
                trackDiligence($scope.model.LmsTaskCode, "", "");
            });
        }
    }
    function trackDiligence(taskCode, quizType, objCode) {
        var listTrackDiligent = [];
        var listPracticeResult = [];
        //var correctAnswer = $scope.getCorrectAnswer(0);
        //var userResult = $scope.getUserResult(0);
        var objPracticeResult = {
            Id: 1, // will be changed in server side
            StartTime: $scope.timeStart,
            EndTime: moment().format("DD/MM/YYYY HH:mm:ss"),
            //UserResult: userResult,
            //CorrectResult: correctAnswer,
            Device: "WEB",
            TaskCode: taskCode,
            QuizType: quizType,
            QuizObjCode: objCode
        }
        listPracticeResult.push(objPracticeResult);
        var objTrackDilligent = {
            ObjectType: "LECTURE",
            ObjectCode: $scope.data.ListLecture[$scope.indexLecture].LectCode,
            ObjectResult: JSON.stringify(listPracticeResult)
        };
        listTrackDiligent.push(objTrackDilligent);
        var modelDiligence = {
            sListDilligence: JSON.stringify(listTrackDiligent)
        }
        dataservice.trackDilligence(modelDiligence, function (rs) {
            rs = rs.data;
            console.log(rs.Title);
            $uibModalInstance.close();
        });
    }
    //$scope.logTimeStop = function () {
    //    $scope.isVideoPlaying = true;
    //    var session = {
    //        SubjectCode: $rootScope.data.SubjectCode,
    //        LectureCode: $rootScope.data.ListLecture[$scope.oldLectureIndex].LectCode,
    //        SessionCode: $rootScope.sessionCode,
    //        StartTime: moment()
    //    };
    //    dataservice.logSession(session, function (rs) {
    //        rs = rs.data;
    //        console.log(rs.Title);
    //    });
    //}
    $scope.cancel = function () {
        if ($scope.isVideoPlaying) {
            var session = {
                SubjectCode: $rootScope.data.SubjectCode,
                LectureCode: $rootScope.data.ListLecture[$scope.oldLectureIndex].LectCode,
                SessionCode: $rootScope.sessionCode,
                StopTime: moment()
            };
            dataservice.logSession(session, function (rs) {
                rs = rs.data;
                App.toastrInfo("LMS_YOU_FINISHED_LECTURE");
            });
        }
        $scope.playYoutube();
        $uibModalInstance.close();
    }
});
app.controller('freeExercise', function ($scope, $rootScope, $controller, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $timeout) {
    $scope.loadDetailSubject = function () {
        dataservice.getListDetailQuiz($rootScope.SubjectCode, function (rs) {
            rs = rs.data;
            $scope.isAlreadyDone = false;//rs.Object.isAlreadyDone;
            $scope.listQuestion = rs.Object.details;
            $scope.duration = rs.Object.totalDuration;
            $scope.examTime = new moment();
            $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            setTimeout(function () {
                initClockSimple($scope.examDeadline);
                //countDownClock.iniClock($scope.examDeadline);
            }, 500);
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = $sce.trustAsHtml($scope.listQuestion[i].Content)/*($scope.listQuestion[i].Content)*/;
                if ($scope.listQuestion[i].JsonData != null && $scope.listQuestion[i].JsonData != '') {
                    $scope.listQuestion[i].listAnswer = JSON.parse($scope.listQuestion[i].JsonData);
                }
                else {
                    $scope.listQuestion[i].listAnswer = [];
                }
                $scope.listQuestion[i].containVideo = {};
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
                    $scope.listQuestion[i].listAnswer[j].Content = decodeHTML($scope.listQuestion[i].listAnswer[j].Answer);
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
                    //setTimeout((function (i) {
                    //    $scope.redraw($scope.listQuestion[i].listAnswer, 120, 50, 120, 50, 80, 250, 25, 400, i);
                    //}) (i), 200);
                }
                if ($scope.listQuestion[i].Type === 'QUIZ_GAME') {
                    $scope.listQuestion[i].isCheck = false;
                    $scope.listQuestion[i].userResult = "";
                    $scope.listQuestion[i].played = false;
                    $scope.listQuestion[i].playGame = false;
                    $scope.listQuestion[i].isCorrect = false;
                }
            }
            try {
                $scope.listQuestion[i].ListMediaType = JSON.parse($scope.listQuestion[i].QuestionMedia);
                console.log($scope.listQuestion[i].ListMediaType.length);
            } catch (e) {
                console.log(e);
                $scope.listQuestion[i].ListMediaType = [];
            }
            $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            setTimeout(function () {
                MathJax.Hub.Register.StartupHook("End", function () {
                    console.log("Mathjax loaded");
                    console.log(MathJax);
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"]);
                });
            }, 1000);
        });
    }
    $scope.loadDetailLecture = function () {
        dataserviceLmsAssign.getListDetailQuiz($scope.LectCode, sessionCode, function (rs) {
            rs = rs.data;
            $scope.isAlreadyDone = rs.Object.isAlreadyDone;
            $scope.listQuestion = rs.Object.details;
            $scope.duration = rs.Object.totalDuration;
            $scope.examTime = new moment();
            $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            setTimeout(function () {
                initClockSimple($scope.examDeadline);
                //countDownClock.iniClock($scope.examDeadline);
            }, 500);
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = $sce.trustAsHtml($scope.listQuestion[i].Content)/*($scope.listQuestion[i].Content)*/;
                if ($scope.listQuestion[i].JsonData != null && $scope.listQuestion[i].JsonData != '') {
                    $scope.listQuestion[i].listAnswer = JSON.parse($scope.listQuestion[i].JsonData);
                }
                else {
                    $scope.listQuestion[i].listAnswer = [];
                }
                $scope.listQuestion[i].containVideo = {};
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
                    $scope.listQuestion[i].listAnswer[j].Content = decodeHTML($scope.listQuestion[i].listAnswer[j].Answer);
                    if ($scope.listQuestion[i].listAnswer[j].Type == "VIDEO") {
                        $scope.listQuestion[i].containVideo = { 'flex-wrap': 'wrap' };
                    }
                }
            }
            $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
        });
    }
    console.log($rootScope.data);
    var data = {
        Model: $rootScope.data,
        fromPractice: false
    }
    $controller('test', { $scope: $scope, $uibModalInstance: null, para: data });
    initData = function () {
        //$scope.LectCode = para.LectCode;
        //$scope.AssignId = para.Id;
        //$scope.model.typeTraining = "DO_FREE_EXERCISE";
        //$scope.model.objectCode = $rootScope.data.SubjectCode;
        $scope.loadDetailSubject();
    }
    initData();
    $scope.submit = function () {

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