var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderEduExam = "/views/admin/lmsExam";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_EDU_EXAM', ['App_ESEIM_LMS_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'youtube-embed'])
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
app.directive('fabricCanvas', function ($parse, $timeout) {
    return {
        restrict: 'A',
        scope: {
            fabricCanvas: '=',
        },
        link: function (scope, el, attrs) {
            var innerCanvas = el[0].querySelector('canvas');
            var outerWidth = el.outerWidth();
            var canvas = new fabric.Canvas(innerCanvas, { width: outerWidth, height: 400 });
            var ObjSelectedBefore = 0;
            var ObjSelectedCur = 0;
            var ColumnBefore = 0;
            var ColumnCur = 0;
            var checkIdObj = 0;
            var checkBefore = 0;
            var ObjSelectedBefore_left = 0;
            var ObjSelectedBefore_top = 0;
            var ObjSelectedCur_top = 0;
            var ObjSelectedCur_left = 0;
            var width = 50;
            var height = 50;
            scope.$watch('fabricCanvas', function (newValue) {
                var listObject = newValue;
                var fill = ''
                var topEven = 50
                var leftEven = (outerWidth - 200) / 2
                var topEvenContent = 50
                //var rightEventContent = (outerWidth - 200) / 2
                //var leftEventContent = 15
                var leftEvenNum = (outerWidth - 200) / 2 + 8
                var topOdd = 50
                var leftOdd = (outerWidth + 200) / 2;
                var topOddContent = 50
                var leftOddContent = (outerWidth + 200) / 2 + 65;
                var leftOddNum = (outerWidth + 200) / 2 + 8;
                var offset = 80;
                var index = 1;
                var fontSize = 40;
                var answerIndex = listObject.findIndex(x => x.IsAnswer == true);
                if (answerIndex != -1) {
                    listObject.splice(answerIndex, 1);
                }
                var maxLeftTextWidth = 0;
                for (let item of listObject) {
                    if (item.Column == 1) {
                        if (item.Type == 'TEXT') {
                            var text = new fabric.Text(item.ContentDecode, {
                                top: topEvenContent, left: 15, fontSize: fontSize,
                            })
                            if (text.width > maxLeftTextWidth) {
                                maxLeftTextWidth = text.width;
                            }
                        }
                    }

                    index++;
                }
                var leftEventContent = (outerWidth - 200) / 2 - (15 + maxLeftTextWidth);
                index = 1;
                $timeout(function () {
                    for (let item of listObject) {
                        if (item.Column == 1) {
                            var rect = new fabric.Rect({
                                id: index, column: item.Column, left: leftEven, top: topEven, width: width, fill: fill, height: height, stroke: "#0378d5", strokeWidth: 2, hasControls: true, selectable: false
                            })
                            canvas.add(rect);
                            if (item.Type == 'TEXT') {
                                var text = new fabric.Text(item.ContentDecode, {
                                    top: topEvenContent, left: leftEventContent, fontSize: fontSize, selectable: false
                                })
                                canvas.add(text);
                            } else if (item.Type == 'IMAGE') {
                                (function (topOddContent) {
                                    fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                        var obj = fabric.util.groupSVGElements(objects, options);
                                        obj.set({
                                            left: leftOddContent, top: topOddContent, scaleX: 4, scaleY: 4
                                        })
                                        obj.selectable = false;
                                        obj.scaleToWidth(50)
                                        obj.scaleToHeight(50)
                                        canvas.add(obj).renderAll();
                                    });
                                })(topOddContent);
                            } else {
                                (function (topOddContent) {
                                    var imgs = new fabric.Image.fromURL('https://os.3i.com.vn//uploads/repository/SUBJECT/background_slogan.jpg', function (img) {
                                        var oImg = img.set({ top: topOddContent, left: leftOddContent }).scale(0.25);
                                        img.selectable = false;
                                        img.scaleToWidth(50)
                                        img.scaleToHeight(50)
                                        canvas.add(oImg);
                                    })
                                })(topOddContent);
                            }

                            var text1 = new fabric.Text('' + index, {
                                top: topEvenContent, left: leftEvenNum, fontSize: fontSize, selectable: false
                            })
                            canvas.add(text1);

                            index++;
                            topEven += offset
                            topEvenContent += offset
                        } else {
                            var rect = new fabric.Rect({
                                id: index, column: item.Column, left: leftOdd, top: topOdd, width: width, fill: fill, height: height, stroke: "#0378d5", strokeWidth: 2, hasControls: true, selectable: false
                            })
                            canvas.add(rect);

                            if (item.Type == 'TEXT') {
                                var text = new fabric.Text(item.ContentDecode, {
                                    top: topOddContent, left: leftOddContent, fontSize: fontSize, selectable: false
                                })
                                canvas.add(text);
                            } else if (item.Type == 'IMAGE') {
                                (function (topOddContent) {
                                    fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                        var obj = fabric.util.groupSVGElements(objects, options);
                                        obj.set({
                                            left: leftOddContent, top: topOddContent, scaleX: 4, scaleY: 4
                                        })
                                        obj.selectable = false;
                                        obj.scaleToWidth(50)
                                        obj.scaleToHeight(50)
                                        canvas.add(obj).renderAll();
                                    });
                                })(topOddContent);
                            } else {
                                (function (topOddContent) {
                                    var imgs = new fabric.Image.fromURL('https://os.3i.com.vn//uploads/repository/SUBJECT/background_slogan.jpg', function (img) {
                                        var oImg = img.set({ top: topOddContent, left: leftOddContent }).scale(0.25);
                                        img.selectable = false;
                                        img.scaleToWidth(50)
                                        img.scaleToHeight(50)
                                        canvas.add(oImg);
                                    })
                                })(topOddContent);
                            }

                            var text1 = new fabric.Text('' + index, {
                                top: topOddContent, left: leftOddNum, fontSize: fontSize, selectable: false
                            })
                            canvas.add(text1);

                            index++;
                            topOdd += offset
                            topOddContent += offset
                        }

                    }
                    scope.$apply();
                });
            });

            var results_pair = [];
            function checkExistId(idX) {
                for (let i = 0; i < results_pair.length; i++) {
                    if ((results_pair[i].id1 == idX) || (results_pair[i].id2 == idX)) {
                        return true;
                    }
                }
                return false;
            }
            var ObjSelectedBefore = -1;
            var ObjSelectedCur = -1;

            canvas.on('mouse:down', function (event) {
                if (event.target != null) {
                    const objId = event.target['id']
                    const columnNum = event.target['column']

                    if (objId != null && objId != 0 && objId != undefined && Number.isInteger(objId)) {
                        ObjSelectedBefore = ObjSelectedCur;
                        ColumnBefore = ColumnCur;
                        ObjSelectedCur = objId;
                        ColumnCur = columnNum;
                        checkIdObj = checkBefore
                        checkBefore++;

                        ObjSelectedBefore_left = ObjSelectedCur_left;
                        ObjSelectedBefore_top = ObjSelectedCur_top;
                        if (columnNum == 1) {
                            ObjSelectedCur_left = event.target.left + width;
                        }
                        else {
                            ObjSelectedCur_left = event.target.left;
                        }
                        ObjSelectedCur_top = event.target.top + height / 2;

                        if (ColumnBefore != ColumnCur && ColumnBefore != 0 && ColumnCur != 0) {
                            if (!checkExistId(ObjSelectedCur) && !checkExistId(ObjSelectedBefore)) {
                                var line = new fabric.Line([ObjSelectedBefore_left, ObjSelectedBefore_top, ObjSelectedCur_left, ObjSelectedCur_top], {
                                    originX: 'center',
                                    originY: 'center',
                                    stroke: 'black',
                                    hasControls: false,
                                    lockMovementX: false,
                                    lockMovementY: false
                                });
                                canvas.add(line);
                                results_pair.push({
                                    id1: ObjSelectedBefore,
                                    id2: ObjSelectedCur
                                })
                            };
                        };
                    }
                }
            });
        }
    };
});

app.directive('sameHeight', function ($timeout) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var selector = attrs.sameHeight;
            var currentMaxHeight = 0;
            $timeout(function () {
                if (scope.$last) {
                    $children = element.parent().find(selector);/*.querySelector(selector);*/
                    if ($children) {
                        angular.forEach($children, function (child) {
                            var childHeight = $(child).outerHeight();

                            if (childHeight > currentMaxHeight) {
                                currentMaxHeight = childHeight;
                            }
                        });
                        // set heights
                        $children.css({ height: currentMaxHeight });
                    }
                    //var elementHeight = element.height();
                }
            });
        }
    }
})

app.factory('dataserviceEduExam', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callbackExam) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callbackExam);
    };
    var submitFormUpload1 = function (url, data, callbackExam) {
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
        $http(req).then(callbackExam);
    };
    return {
        insert: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/Insert/', data).then(callbackExam);
        },
        update: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/Update/', data).then(callbackExam);
        },
        getItem: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/GetItem', data).then(callbackExam);
        },
        getListSubject: function (callbackExam) {
            $http.post('/Admin/LmsQuiz/GetListSubject').then(callbackExam);
        },
        delete: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/Delete?id=' + data).then(callbackExam);
        },
        getListExamInheritance: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/GetListExamInheritance?code=' + data).then(callbackExam);
        },
        getListQuestion: function (data, data1, data2, callbackExam) {
            $http.post('/Admin/LmsExam/GetListQuestion?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callbackExam);
        },
        getListDetail: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/GetListDetail?examCode=' + data).then(callbackExam);
        },
        getListDetailQuiz: function (data, data1, callbackExam) {
            $http.post('/Admin/LmsExam/GetListDetailQuiz?examCode=' + data + '&sessionCode=' + data1).then(callbackExam);
        },
        insertQuestion: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/InsertQuestion/', data).then(callbackExam);
        },
        logSession: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/LogSession/', data).then(callbackExam);
        },
        deleteQuestion: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/DeleteQuestion?id=' + data).then(callbackExam);
        },
        updateDoingExamProgress: function (data, callbackExam) {
            $http.post('/Admin/LmsExam/UpdateDoingExamProgress/', data).then(callbackExam);
        },
        getListDetailQuizAssignment: function (data, data1, callback) {
            $http.post('/Admin/LmsAssignment/GetListDetailQuiz?lectureCode=' + data + '&sessionCode=' + data1).then(callback);
        },
        getEvent: function (data, callback) {
            $http.get('/Admin/LmsAssignment/GetEvent').then(callback);
        },
        updateDoingExerciseProgress: function (data, callback) {
            $http.post('/Admin/LmsAssignment/UpdateDoingExerciseProgress?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EDU_EXAM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduExam, $cookies, $translate) {
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
                    required: true,
                    regx: /^[^\s].*/
                },
                Duration: {
                    required: true,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                Title: {
                    required: caption.LMS_EXAM_MSG_REQUIRED_TITLE,
                    regx: caption.LMS_EXAM_MSG_TITLE_NO_SPACE
                },
                Duration: {
                    required: caption.LMS_EXAM_MSG_REQUIRED_TIME,
                    regx: caption.LMS_EXAM_MSG_TIME_NO_SPACE
                },
            }
        }
        $rootScope.listUnit = [
            {
                Code: "MINUTE",
                Name: caption.LMS_EXAM_LBL_TIME_MINUTE
            }, {
                Code: "HOUR",
                Name: caption.LMS_EXAM_LBL_TIME_HOUR
            },];
    });
    $rootScope.isAdded = false;
    $rootScope.page = 1;
    $rootScope.pageSize = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsExam/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderEduExam + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolderEduExam + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolderEduExam + '/add.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduExam, $translate, $window, $filter) {
    $("#breadcrumb").addClass('hidden');
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
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
    // assignments
    $scope.headerCompiled = false;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsAssignment/JTable",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Teacher = $scope.model.Teacher;
                d.Author = $scope.model.Author;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                console.log(d);
                heightTableManual(320, '#tblData');
                $scope.totalAssignments = d.responseJSON.recordsTotal;
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(4)
        .withOption('order', [2, 'desc'])
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
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.edit(Id);
            //    }
            //});
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"LMS_EXAM_LBL_ORDER" | translate}}').notSortable().withOption('sClass', 'tcenter wpercent5').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExamName').withTitle('{{"LMS_EXAM_MSG_EXAM" | translate}}').renderWith(function (data, type, full) {
        //full.Author = "Tác giả";
        var author = full.Author != null && full.Author != '' && full.Author != undefined ?
            '<span class="fs10"> ' + caption.LMS_EXAM_MSG_AUTHOR + ': ' + full.Author + '</span>' : '';
        return '<span class="text-important">' + data + '</span>' +
            '<br />' + '<span class="fs10"> ' + caption.LMS_EXAM_MSG_NUMBER_QUESTION + ': ' + full.QuizCount + '</span>' +
            '<br />' + author;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectName').withOption('sClass', '').withTitle('{{"Môn học" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('LmsTaskName').withOption('sClass', '').withTitle('{{"Nhiệm vụ" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withOption('sClass', 'wpercent10').withTitle('{{"Bắt đầu" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withOption('sClass', 'wpercent10').withTitle('{{"Kết thúc" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProgressAuto').withOption('sClass', 'wpercent5').withTitle('{{"Tiến độ" | translate}}').renderWith(function (data, type) {
        return data + '%';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'tcenter nowrap wpercent5').withTitle('{{"LMS_EXAM_LBL_DO_HW" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title1="{{&quot;COM_BTN_EDIT&quot; | translate}}" title="{{"LMS_EXAM_LBL_TEST" | translate}}" ng-click="test(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0;" class="text-green"><i class="fa fa-play"></i></button>' +
            '<br />' + '<span class="fs10"> ' + caption.LMS_EXAM_LBL_DO_COUNT + ': ' + full.DoCount + '</span > ';
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

    $scope.test = function (id) {
        var dataModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                dataModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsAssignment + '/test.html',
                controller: 'exercise',
                backdrop: 'static',
                backdropClass: 'custom-black full-opacity',
                size: '90',
                resolve: {
                    para: function () {
                        return dataModel;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        }
    }
    $scope.initData = function () {
        dataserviceEduExam.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    };
    $scope.initData();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $("#FromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#ToDate').datepicker('setStartDate', maxDate);
    });
    $("#ToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#FromDate').datepicker('setEndDate', maxDate);
    });

    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            fixedWeekCount: false,
            aspectRatio: 2,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STL_COL_DATE_SUNDAY, caption.STL_COL_DATE_MONDAY, caption.STL_COL_DATE_TUESDAY, caption.STL_COL_DATE_WEDNESDAY, caption.STL_COL_DATE_THUSDAY, caption.STL_COL_DATE_FRIDAY, caption.STL_COL_DATE_STATURDAY],
            monthNames: [caption.STL_MONTH_JANUARY + ' - ', caption.STL_MONTH_FEBRUARY + ' - ', caption.STL_MONTH_MARCH + ' - ', caption.STL_MONTH_APRIL + ' - ', caption.STL_MONTH_MAY + ' - ', caption.STL_MONTH_JUNE + ' - ', caption.STL_MONTH_JULY + ' - ', caption.STL_MONTH_AUGUST + ' - ', caption.STL_MONTH_SEPTEMBER + ' - ', caption.STL_MONTH_OCTOBER + ' - ', caption.STL_MONTH_NOVEMBER + ' - ', caption.STL_MONTH_DECEMBER + ' - '],
            monthNamesShort: [caption.STL_MONTH_JAN + ' - ', caption.STL_MONTH_FEB + ' - ', caption.STL_MONTH_MAR + ' - ', caption.STL_MONTH_APR + ' - ', caption.STL_MONTH_MA + ' - ', caption.STL_MONTH_JUN + ' - ', caption.STL_MONTH_JUL + ' - ', caption.STL_MONTH_AUG + ' - ', caption.STL_MONTH_SEPT + ' - ', caption.STL_MONTH_OCT + ' - ', caption.STL_MONTH_NOV + ' - ', caption.STL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STL_COL_DATE_SUN, caption.STL_COL_DATE_MON, caption.STL_COL_DATE_TUE, caption.STL_COL_DATE_WED, caption.STL_COL_DATE_THUS, caption.STL_COL_DATE_FRI, caption.STL_COL_DATE_SAT],

            buttonText: {
                today: caption.STL_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataserviceEduExam.getEvent("", function (rs) {
                    rs = rs.data;
                    var event = [];
                    for (var i = 0; i < rs.length; i++) {
                        var obj = {
                            title: rs[i].title,
                            start: rs[i].start,
                            end: rs[i].end,
                            className: rs[i].className,
                            //color: rs[i].color,
                            displayEventTime: false,
                            progress: rs[i].ProgressAuto,
                            author: rs[i].Author,
                            teacher: rs[i].Teacher,
                            timemeet: rs[i].sStartTime + ' - ' + rs[i].sEndTime,
                            //workContent: rs[i].workContent,
                            id: rs[i].Id
                        }
                        event.push(obj);
                    }
                    callback(event);
                })
            },
            eventMouseover: function (calEvent, jsEvent) {
                var author = author != null && author != '' && author != undefined ? ' (' + calEvent.author + ')' : '';
                var tooltip = '<div class="tooltipevent"' +
                    'style="width: 250px; background:#c6ef9c; color: #000; position: absolute; border-radius: 10px; padding: 5px;">'
                    + '' + caption.LMS_EXAM_LBL_HW + ': ' + calEvent.title + ' [' + calEvent.progress + '%]' + author +
                    '<br />' + caption.LMS_EXAM_LBL_DO_TIME + ': ' + calEvent.timemeet +
                    /*'<br />' + caption.MS_LBL_STATUS + ': ' + calEvent.status +*/
                    '</div>';

                var $tooltip = $(tooltip).appendTo('body');
                $(this).mouseover(function (e) {
                    $(this).css('z-index', 10000);
                    $tooltip.fadeIn('500');
                    $tooltip.fadeTo('10', 1.9);
                }).mousemove(function (e) {
                    $tooltip.css('top', e.pageY + 10);
                    $tooltip.css('left', e.pageX + 20);
                });
            },
            eventMouseout: function (calEvent, jsEvent) {
                $(this).css('z-index', 8);
                $('.tooltipevent').remove();
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var numLate = calEvent.numLate;
            },
        })
    }

    setTimeout(function () {
        loadCalendar("calendar");
        $('.fc-prev-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-next-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-today-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-prevYear-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-nextYear-button').click(function () {
            $rootScope.isNext = true;
        });
        //loadDate();
    }, 200);
    // exam
    $scope.headerCompiledExam = false;
    $scope.selectedExam = [];
    $scope.selectAllExam = false;
    $scope.toggleAllExam = toggleAllExam;
    $scope.toggleOneExam = toggleOneExam;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAllExam" ng-click="toggleAllExam(selectAllExam, selected)"/><span></span></label>';
    vm.dtOptionsExam = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsExam/JTable",
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
                heightTableManual(320, '#tblDataExam');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledExam) {
                $scope.headerCompiledExam = true;
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

    vm.dtColumnsExam = [];
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selectedExam[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOneExam(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('ExamTitle').withTitle('{{"Tiêu đề" | translate}}').renderWith(function (data, type) {
        return '<span class="text-important">' + data + '</span>';
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Duration').withOption('sClass', '').withTitle('{{"LMS_EXAM_LBL_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('ExamSubject').withOption('sClass', '').withTitle('{{"LMS_EXAM_LBL_SUBJECTS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-10per').withTitle('{{"LMS_EXAM_MSG_DATE_CREATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('preview').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{ "LMS_EXAM_LBL_PREVIEW" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title1="{{&quot;COM_BTN_EDIT&quot; | translate}}" title="{{"LMS_EXAM_LBL_TEST" | translate}}" ng-click="test(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadDataExam = reloadDataExam;
    vm.dtInstanceExam = {};
    function reloadDataExam(resetPaging) {
        vm.dtInstanceExam.reloadData(callbackExam, resetPaging);
    }
    function callbackExam(json) {

    }
    function toggleAllExam(selectAllExam, selectedItemsExam) {
        for (var id in selectedItemsExam) {
            if (selectedItemsExam.hasOwnProperty(id)) {
                selectedItemsExam[id] = selectAllExam;
            }
        }
    }
    function toggleOneExam(selectedItemsExam) {
        for (var id in selectedItemsExam) {
            if (selectedItemsExam.hasOwnProperty(id)) {
                if (!selectedItemsExam[id]) {
                    vm.selectAllExam = false;
                    return;
                }
            }
        }
        vm.selectAllExam = true;
    }

    $scope.reloadExam = function () {
        reloadDataExam(true);
    }
    $rootScope.reloadNoResetPageExam = function () {
        reloadDataExam(false);
    }
    $scope.searchExam = function () {
        reloadDataExam(true);
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderEduExam + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadExam();
            $rootScope.isAdded = false;
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataserviceEduExam.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderEduExam + '/add.html',
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
                    $scope.reloadNoResetPageExam();
                }, function () {
                });
            }
        });
    }
    $scope.test = function (id) {
        dataserviceEduExam.getItem(id, function (rs) {
            rs = rs.data;
            rs.Object.fromExam = true;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderEduExam + '/test.html',
                    controller: 'test',
                    backdrop: 'static',
                    backdropClass: 'custom-black full-opacity',
                    size: '90',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPageExam();
                }, function () {
                });
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceEduExam.delete(id, function (rs) {
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
            $scope.reloadNoResetPageExam();
        }, function () {
        });
    }
    $scope.initData = function () {
        dataserviceEduExam.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    };
    $scope.initData();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    };
    $scope.collapse = function () {
        heightTableAuto();
        $scope.isSearch = true;
    }
    $scope.expand = function () {
        heightTableManual(320, '#tblData');
        heightTableManual(320, '#tblDataExam');
        $scope.isSearch = false;
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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam) {
    //detail
    $scope.model = {
        Code: generateUUID(),
        Title: '',
        Duration: '',
        Note: '',
    }
    $scope.modelQst = {
        QuestCode: '',
        Mark: 10
    }

    $scope.listQuestion = [];

    $rootScope.id = -1;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataserviceEduExam.getListQuestion(function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
        });
        dataserviceEduExam.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataserviceEduExam.getListQuestion($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listQuestion = $scope.listQuestion.concat(rs);
                for (var i = 0; i < $scope.listQuestion.length; i++) {
                    $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
                }
                $scope.listQuestion = removeDuplicate($scope.listQuestion);
            });
        }
    };
    $scope.initData();

    $rootScope.reloadQuestion = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataserviceEduExam.getListQuestion($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listQuestion = $scope.listQuestion.concat(rs);
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
            $scope.listQuestion = removeDuplicate($scope.listQuestion);
        });
    }

    $scope.loadDetail = function () {
        dataserviceEduExam.getListDetail($scope.model.ExamCode, function (rs) {
            rs = rs.data;
            $scope.listDetail = rs.Object;
            for (var i = 0; i < $scope.listDetail.length; i++) {
                $scope.listDetail[i].Content = decodeHTML($scope.listDetail[i].Content);
            }
        });
    }

    $scope.submit = function () {
        if ($rootScope.id > 0) {
            dataserviceEduExam.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadNoResetPageExam();

                    return App.toastrSuccess(rs.Title);
                }
            });
        } else {
            if ($scope.addform.validate()) {
                dataserviceEduExam.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.id = rs.ID;
                        $scope.model.Id = rs.ID;
                        $scope.reloadNoResetPageExam();
                    }
                });
            }
        }
    };
    $scope.changeFlag = function (flag) {
        $scope.model[flag] = !$scope.model[flag];
    }
    $scope.addQuestion = function () {
        if ($rootScope.id < 0) {
            return App.toastrError(caption.LMS_EXAM_MSG_ADD_EXAM);
        }

        if ($scope.modelQst.QuestCode == null || $scope.modelQst.QuestCode == '' || $scope.modelQst.QuestCode == undefined) {
            return App.toastrError(caption.LMS_EXAM_MSG_QUESTION_ADDING);
        }
        $scope.modelQst.ExamCode = $scope.model.ExamCode;

        //var obj = {
        //    ExamCode: $scope.model.Code,
        //    QuestCode: $scope.model.QuestCode
        //}

        dataserviceEduExam.insertQuestion($scope.modelQst, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.loadDetail();
            }
        });
    }

    $scope.deleteQuestion = function (id) {
        dataserviceEduExam.deleteQuestion(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                $scope.loadDetail();
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Code == itm.Code) {
                    isDuplicate = true;
                    break;
                }
                //if (res[i].Id == itm.Id) {
                //    isDuplicate = true;
                //    break;
                //}
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
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

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, para) {
    $scope.modelQst = {
        QuestCode: ''
    }

    $scope.listQuestion = [];
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

    $scope.loadDetail = function () {
        dataserviceEduExam.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
        dataserviceEduExam.getListDetail($scope.model.ExamCode, function (rs) {
            rs = rs.data;
            $scope.listDetail = rs.Object;
            for (var i = 0; i < $scope.listDetail.length; i++) {
                $scope.listDetail[i].Content = decodeHTML($scope.listDetail[i].Content);
                var unit = $rootScope.listUnit.find(x => x.Code == $scope.listDetail[i].Unit);
                $scope.listDetail[i].UnitName = unit != undefined ? unit.Name : 'Phút';
            }
        });
    }

    $scope.initData = function () {
        $scope.model = para;
        $rootScope.id = $scope.model.Id;

        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataserviceEduExam.getListQuestion($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listQuestion = $scope.listQuestion.concat(rs);
                for (var i = 0; i < $scope.listQuestion.length; i++) {
                    $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
                }
                $scope.listQuestion = removeDuplicate($scope.listQuestion);
            });
        }
        //dataserviceEduExam.getListExamInheritance($scope.model.Code, function (rs) {
        //    rs = rs.data;
        //    $scope.listExamInheritance = rs;
        //});

        $scope.loadDetail();
    }

    $scope.initData();
    $rootScope.reloadQuestion = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataserviceEduExam.getListQuestion($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listQuestion = $scope.listQuestion.concat(rs);
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
            $scope.listQuestion = removeDuplicate($scope.listQuestion);
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.submit = function () {
        if (/*$scope.editform.validate()*/true) {
            dataserviceEduExam.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPageExam();
                }
            });
        }
    };

    $scope.changeFlag = function (flag) {
        $scope.model[flag] = !$scope.model[flag];
    }
    $scope.addQuestion = function () {
        if ($rootScope.id < 0) {
            return App.toastrError(caption.LMS_EXAM_MSG_ADD_EXAM);
        }

        if ($scope.modelQst.QuestCode == null || $scope.modelQst.QuestCode == '' || $scope.modelQst.QuestCode == undefined) {
            return App.toastrError(caption.LMS_EXAM_MSG_QUESTION_ADDING);
        }
        $scope.modelQst.ExamCode = $scope.model.ExamCode;
        //var obj = {
        //    ExamCode: $scope.model.Code,
        //    QuestCode: $scope.model.QuestCode
        //}

        dataserviceEduExam.insertQuestion($scope.modelQst, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.loadDetail();
            }
        });
    }

    $scope.deleteQuestion = function (id) {
        dataserviceEduExam.deleteQuestion(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                $scope.loadDetail();
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Code == itm.Code) {
                    isDuplicate = true;
                    break;
                }
                //if (res[i].Id == itm.Id) {
                //    isDuplicate = true;
                //    break;
                //}
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
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

app.controller('test', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, dataserviceLms, para, $sce) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.listColorIconBoard = ["#8e44ad33", "#27ae6026", "#2980b921", "#2ca94b29", "#ed78322b", "#ed1b2433"];
    $scope.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $rootScope.progressBar = { name: 'file X', uuid: '', progress: '0%', style: { 'width': '0%' } };
    $scope.listQuestion = Array.from(Array(30).keys());
    $scope.currentPoint = 0;
    $scope.totalPoint = 0;
    $scope.loadDetail = function () {
        dataserviceEduExam.getListDetailQuiz($scope.model.ExamCode, sessionCode, function (examDetails) {
            examDetails = examDetails.data;
            $scope.isAlreadyDone = examDetails.Object.isAlreadyDone;
            $scope.listQuestion = examDetails.Object.details;
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
    initData = function () {
        $scope.model = para;
        if ($scope.model.fromExam) {
            $scope.model.typeTraining = "DO_TEST";
            $scope.model.objectCode = $scope.model.ExamCode;
            $scope.loadDetail();
            $scope.examTime = new moment();
            if ($scope.model.Unit == "MINUTE") {
                $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            }
            else if ($scope.model.Unit == "HOUR") {
                $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'hours').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            }
            setTimeout(function () {
                countDownClock.iniClock($scope.examDeadline);
            }, 500);
        }
    }
    initData();
    $scope.checkQuestion = function (quizCode, answerIndex) {
        var qIndex = $scope.listQuestion.findIndex(x => x.Code == quizCode);
        if (qIndex != -1) {
            var oldResult = $scope.listQuestion[qIndex].listAnswer[answerIndex].check;
            var isPreviousChoiceTrue = false;
            $scope.containVideo = false;
            for (var i = 0; i < $scope.listQuestion[qIndex].listAnswer.length; i++) {
                if ($scope.listQuestion[qIndex].listAnswer[i].IsAnswer && $scope.listQuestion[qIndex].listAnswer[i].check && i != answerIndex) {
                    isPreviousChoiceTrue = true;
                }

                if ($scope.listQuestion[qIndex].Type == "QUIZ_SING_CH") {
                    $scope.listQuestion[qIndex].listAnswer[i].check = false;
                }
            }
            $scope.listQuestion[qIndex].listAnswer[answerIndex].check = !oldResult;
            if ($scope.listQuestion[qIndex].listAnswer[answerIndex].check) {
                var result = false;
                if ($scope.listQuestion[qIndex].listAnswer[answerIndex].IsAnswer) {
                    //App.toastrSuccess("Chúc mừng bạn đã chọn được đáp án đúng");
                    $scope.currentPoint += $scope.listQuestion[qIndex].Mark;
                    $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
                    $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
                    result = true;
                }
                else {
                    if (isPreviousChoiceTrue) {
                        $scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
                        $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
                        $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
                    }
                    //App.toastrError("Bạn đã chọn đáp án sai");
                }
                var session = {
                    QuizCode: quizCode,
                    UserChoose: $scope.listQuestion[qIndex].listAnswer[answerIndex].Code,
                    Result: result,
                    SessionCode: sessionCode,
                    TypeTraining: $scope.model.typeTraining,
                    ObjectCode: $scope.model.objectCode
                };
                dataserviceEduExam.logSession(session, function (rs) {
                    rs = rs.data;
                    console.log(rs.Title);
                });
            } else {
                $scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
                $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
                $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            }
        }
    };
    $scope.addRef = function (id, type) {
        dataserviceLms.getItemQuiz(id, function (rs) {
            rs = rs.data;
            rs.Type = type;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderEduExam + '/add-ref.html',
                controller: 'addReference',
                backdrop: 'false',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $rootScope.idQuiz = -1;
            }, function () {
            });
        });
    };
    $scope.submit = function () {
        var data = {
            ItemCode: $scope.model.ExamCode
        };
        dataserviceEduExam.updateDoingExamProgress(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    };
    $scope.refresh = function () {
        $scope.isAlreadyDone = false;
        for (var i = 0; i < $scope.listQuestion.length; i++) {
            for (var j = 0; j < $scope.listQuestion[i].listAnswer.length; j++) {
                $scope.listQuestion[i].listAnswer[j].check = false;
            }
        }
        $scope.currentPoint = 0;
        $rootScope.progressBar.progress = '0%';
        $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
    };
    $scope.showHint = function (index) {
        $scope.listQuestion[index].ShowHint = !$scope.listQuestion[index].ShowHint;
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

app.controller('addReference', function ($scope, $rootScope, $sce, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, dataserviceLms, dataserviceCmsItem, $uibModal, Upload, para) {
    $scope.modelRef = { Type: "CMS" };
    $scope.listRefType = [
        {
            Code: "CMS",
            Name: caption.LMS_EXAM_LBL_POST
        }, {
            Code: "VOICE",
            Name: caption.LMS_EXAM_LBL_SOUND
        }, {
            Code: "VIDEO",
            Name: caption.LMS_EXAM_LBL_VIDEO
        }, {
            Code: "IMAGE",
            Name: caption.LMS_EXAM_LBL_IMAGE
        },];
    $scope.reloadRef = function () {
        for (ref of $rootScope.listReference) {
            ref.showContent = false;
            if (ref.Type == "CMS") {
                dataserviceLms.getItemCms(ref.Link, function (rs) {
                    rs = rs.data;
                    var cmsRef = $rootScope.listReference.find(x => x.Link == rs.alias);
                    cmsRef.cmsContent = $sce.trustAsHtml(rs.full_text);
                });
            }
        }
    }
    $scope.init = function () {
        $scope.model = para;
        $rootScope.idQuiz = $scope.model.Id;
        $scope.modelRef.Type = $scope.model.Type;
        if ($scope.model.JsonRef != null && $scope.model.JsonRef != '') {
            $rootScope.listReference = JSON.parse($scope.model.JsonRef);
            $scope.reloadRef();
        }
        else {
            $rootScope.listReference = [];
        }
        dataserviceLms.getCurrentUserFullName(function (rs) {
            rs = rs.data;
            $scope.userName = rs;
        });
        dataserviceLms.getListCmsItem(function (rs) {
            rs = rs.data;
            $scope.listCmsQuiz = rs;
            $scope.listCmsQuiz.unshift({ Code: '', Name: caption.LMS_EXAM_LBL_NO_SELECT });
        });
    }
    $scope.init();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCmsTest'];
        if (check !== undefined && $scope.modelRef.Type == "CMS") {
            var data = CKEDITOR.instances['ckEditorItemCmsTest'].getData();
            $scope.modelCmsItem.full_text = data;
        }
        if (/*!validationSelect($scope.model).Status*/true) {
            if ($scope.modelRef.Link == '' || $scope.modelRef.Link == null || $scope.modelRef.Link == undefined) {
                if ($scope.modelRef.Type == "CMS") {
                    dataserviceCmsItem.insert($scope.modelCmsItem, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $scope.modelRef.Link = $scope.modelCmsItem.alias;
                            $scope.addReference();
                            $scope.reloadRef();
                        }
                    });
                }
            }
            else {
                $scope.addReference();
            }
        }
    };
    $scope.cancel = function () {
        $rootScope.JsonData = '';
        $rootScope.JsonRef = '';
        $uibModalInstance.close();
        $rootScope.idQuiz = -1;
    }
    $scope.addReference = function () {
        var obj = {
            Code: generateUUID(),
            Link: $scope.modelRef.Link,
            Type: $scope.modelRef.Type,
            TypeName: $scope.listRefType.find(x => x.Code == $scope.modelRef.Type).Name,
            CreatedBy: $scope.userName,
            CreatedTime: new Date(Date.now()).toLocaleString()
        }

        if ($rootScope.JsonRef == '' || $rootScope.JsonRef == null || $rootScope.JsonRef == undefined) {
            $rootScope.listReference.push(obj);
        } else {
            $rootScope.listReference.splice(0);
            var listRef = JSON.parse($rootScope.JsonRef);
            for (ref of listRef) {
                $rootScope.listReference.push(ref);
            }
            $rootScope.listReference = JSON.parse($rootScope.JsonRef);
            if ($rootScope.listReference.length > 0)
                $rootScope.listReference.push(obj);
        }

        $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
        var refData = {
            Id: $rootScope.idQuiz,
            JsonRef: $rootScope.JsonRef
        }

        dataserviceLms.updateReference(refData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                //$scope.reloadQuestion();
                return App.toastrSuccess(rs.Title);
            }
        });
    }
    $scope.loadImageRef = function (event) {
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
            data.ModuleName = "LMS_QUIZ_REF";
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
                    $scope.modelRef.Link = result.Object;
                    $scope.ImageRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.loadVoiceRef = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "mp3" && extFile != "wav"/* && extFile != "gif" && extFile != "bmp" && extFile != "svg"*/) {
            App.toastrError(caption.LMS_EXAM_MSG_ERR_SOUND); //caption.COM_MSG_FORMAT_IMAGE
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
            data.ModuleName = "LMS_QUIZ_REF";
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
                    $scope.modelRef.Link = result.Object;
                    $scope.VoiceRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.deleteReference = function (data) {
        if ($rootScope.listReference.indexOf(data) == -1) {
            App.toastrError(caption.LMS_EXAM_DELETE_ERR)
        } else {
            $rootScope.listReference.splice($rootScope.listReference.indexOf(data), 1);
            // if data is Cms delete Cms too
            $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
            var refData = {
                Id: $rootScope.idQuiz,
                JsonRef: $rootScope.JsonRef
            }

            dataserviceLms.updateReference(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.changeType = function () {
        $scope.modelRef.Link = '';
    }

    $scope.updateReference = function (code) {
        var item = $rootScope.listReference.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            item.IsRef = !item.IsRef;

            $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
            var refData = {
                Id: $rootScope.idQuiz,
                JsonRef: $rootScope.JsonRef
            }

            dataserviceLms.updateReference(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCmsTest', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        //CKEDITOR.instances['ckEditorItemCms'].config.height = 80;
    }
    $scope.viewReference = function (index) {
        var showContent = $rootScope.listReference[index].showContent;
        for (ref of $rootScope.listReference) {
            ref.showContent = false;
            $rootScope.listReference[index].showContent = !showContent;
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
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
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.viewCms = function (link) {
        dataserviceLms.getItemCms(link, function (rs) {
            rs = rs.data;
            $rootScope.cmsContent = $sce.trustAsHtml(rs);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/view-cms.html',
                controller: function ($scope, $uibModalInstance, $sce) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                //$scope.reloadExam();
            }, function () {
            });
        });
    };
    // CMS Item CRUD
    $scope.modelCmsItem = {
        alias: '',
        title: '',
        cat_id: 228,
        published: true,
        full_text: '',
        created_by_alias: ''
    }
    $scope.ConvertToAlias = function (strInput) {
        strInput = strInput.toLowerCase().trim();
        strInput = strInput.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        strInput = strInput.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        strInput = strInput.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        strInput = strInput.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        strInput = strInput.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        strInput = strInput.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        strInput = strInput.replace(/đ/g, "d");
        strInput = strInput.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
        strInput = strInput.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        strInput = strInput.replace(/^\-+|\-+$/g, "");//cắt bỏ ký tự - ở đầu và cuối chuỗi
        $scope.modelCmsItem.alias = strInput;
    };
    setTimeout(function () {
        ckEditer();
    }, 500);
});