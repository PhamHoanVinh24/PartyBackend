var ctxfolderDomainManagement = "/views/admin/domainManagement";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderDomainManagementMessage = "/views/message-box";

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
app.directive("filesInput", function () {
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
            $http.post('/Admin/DomainManagement/Delete?id=' + data).then(callback);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsCourse/GetListSubject').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/DomainManagement/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/DomainManagement/UpdateAll/', data).then(callback);
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
        getSubject: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/GetSubject/' + data).then(callback);
        },
        getListDetailQuiz: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/GetListDetailQuiz?subjectCode=' + data).then(callback);
        },
        logSession: function (data, callback) {
            $http.post('/Admin/LmsSubjectManagement/LogSession/', data).then(callback);
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
                Name: caption.LMS_DASH_BOARD_STATUS_NOT_ACTIVATE
        }];

        $rootScope.validationOptionsAssignStaffToItem = {
            rules: {
                EstimateTime: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                EstimateTime: {
                    required: caption.CJ_VALIDATE_TIME_OUT_NO_BLANK,
                    regx: caption.CJ_REGEX_NUMBER_NEGATIVE,
                }
            }
        }

        $rootScope.validationOptionsCheckList = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                WeightNumCheckList: {
                    required: true,
                    min: 0,
                    max: 100,
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE),//'Nhập tiêu đề!',
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE).replace("{1}", "255"),
                    regx: caption.LMS_EXAM_MSG_TITLE_NO_SPACE
                },
                WeightNumCheckList: {
                    required: caption.CJ_VALIDATE_ENTER_WEIGHTNUM,
                    min: caption.CJ_VALIDATE_WEIGHT_NUM_GREATER_THAN_0,
                    max: caption.CJ_VALIDATE_WEIGHT_NUM_SMALLER_THAN_100
                }
            }
        }

        $rootScope.validationOptionsAddCardNormal = {
            rules: {
                CardName: {
                    required: true,
                },
            },
            messages: {
                CardName: {
                    required: caption.CJ_VALIDATE_WORK_REQUIRED
                }
            }
        }

        $rootScope.validationOptionsItemWork = {
            rules: {
                StartTime: {
                    required: true,
                },
                EndTime: {
                    required: true,
                },
                ProgressFromStaff: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
                ProgressFromLeader: {
                    regx: /^[+]?\d+(\.\d+)?$/,
                }
            },
            messages: {
                StartTime: {
                    required: caption.CJ_VALIDATE_START_DATE
                },
                EndTime: {
                    required: caption.CJ_VALIDATE_ENTER_END_DATE
                },
                ProgressFromStaff: {
                    required: caption.CJ_VALIDATE_ENTER_PROGRESS,
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                },
                ProgressFromLeader: {
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                }
            }
        }

        $rootScope.validationOptionsShiftLog = {
            rules: {
                ChkinTime: {
                    required: true,
                },
                ChkoutTime: {
                    required: true,
                },
                ChkinLocationTxt: {
                    required: true,
                },
                ChkoutLocationTxt: {
                    required: true,
                }
            },
            messages: {
                ChkinTime: {
                    required: caption.DOM_CHECK_IN_TIME_NO_SPACE
                },
                ChkoutTime: {
                    required: caption.DOM_CHECK_OUT_TIME_NO_SPACE
                },
                ChkinLocationTxt: {
                    required: caption.DOM_CHECK_IN_LOCATION_NO_SPACE
                },
                ChkoutLocationTxt: {
                    required: caption.DOM_CHECK_OUT_LOCATION_NO_SPACE
                }
            }
        }

        $rootScope.validationOptionsWeightNum = {
            rules: {
                WeightNum: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                WeightNum: {
                    required: caption.CJ_VALIDATE_ENTER_WEIGHTNUM,
                    regx: caption.CJ_VALIDATE_ENTER_WEIGHTNUM_PLUS,
                }
            }

        }

        $rootScope.validationOptionsProgress = {
            rules: {
                Progress: {
                    required: true,
                    //regx: /^([0-9])+\b$/,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                Progress: {
                    required: caption.CJ_VALIDATE_PROGRESS,
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                }
            }
        }

        $rootScope.validationOptionsBoard = {
            rules: {
                BoardName: {
                    required: true,
                },
            },
            messages: {
                BoardName: {
                    required: caption.CJ_VALIDATE_BOARD_NAME,
                }
            }
        }

        $rootScope.isTranslate = true;

        $rootScope.validationOptionsService = {
            rules: {
                ServiceCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                ServiceName: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ServiceCode: {
                    required: caption.SVC_MSG_NOT_CODE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SVC_CURD_LBL_SERVICE_CODE),
                    maxlength: caption.SVC_MSG_NOT_CODE_CHARACTER_255
                },
                ServiceName: {
                    required: caption.SVC_MSG_NOT_NAME,
                    maxlength: caption.SVC_MSG_NOT_NAME_CHARACTER
                },
            }
        }

        $rootScope.validationAttributeOptionsService = {
            rules: {
                AttributeCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/
                },
                AttributeName: {
                    required: true,
                },
                Note: {
                    maxlength: 300
                },
                FieldType: {
                    required: true,
                },
                AttributeValue: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.SVC_MSG_CODE_NOT_BLANK,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SVC_CURD_TAB_ATTRIBUTE_LBL_CODE),
                },
                AttributeName: {
                    required: caption.SVC_MSG_NAME_NOT_BLANK,
                },
                Note: {
                    maxlength: caption.SVC_MSG_NOT_ACTION_CHARACTER
                },
                FieldType: {
                    required: caption.SVC_MSG_VALUE_TYPE_NOT_BLANK,
                },
                AttributeValue: {
                    required: caption.SVC_MSG_TYPE_NOT_BLANK
                }
            }
        }

        $rootScope.validationOptionsOrderRQ = {
            rules: {
                Title: {
                    required: true,
                },
                Content: {
                    required: true,
                },
                Phone: {
                    regx: /^(^0)+([0-9]){9,10}\b$/
                }

            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_TITLE),
                },
                Content: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_CONTENT),
                },
                Phone: {
                    regx: caption.ORR_VALIDATE_PHONE_NUMBER
                }
            }
        }

        $scope.validationOptionsmore = {
            rules: {
                AttributeCode: {
                    required: true,
                    maxlength: 255,
                },
                AttributeName: {
                    required: true,
                    maxlength: 255,
                },
                Page: {
                    required: true,
                    maxlength: 255,
                },
                Category: {
                    required: true,
                    maxlength: 255,
                },
                Width: {
                    required: true,
                    maxlength: 255,
                },
                Length: {
                    required: true,
                    maxlength: 255,
                },
                Weight: {
                    required: true,
                    maxlength: 255,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_CODE_CHARACTER_PRODUCT
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_NAME_CHARACTER_PRODUCT
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,

                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,

                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,

                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,

                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,

                },

            }
        }

        $rootScope.validationOptionsMaterial = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                },
                PricePerM: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Wide: {
                    regx: /^([0-9])+\b$/
                },
                High: {
                    regx: /^([0-9])+\b$/
                }
            },
            messages: {
                ProductCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT_CHARACTER
                },
                ProductName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT_CHARACTER
                },
                Unit: {
                    required: caption.MLP_VALIDATE_UNIT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_UNIT_IMPORT_CHARACTER1
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM_IMPORT,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2_IMPORT,
                },
                Wide: {
                    regx: caption.MLP_VALIDATE_WIDTH,
                },
                High: {
                    regx: caption.MLP_VALIDATE_HEIGHT,
                }
            }
        }

        $rootScope.validationAttributeOptions = {
            rules: {
                AttributeCode: {
                    required: true,
                    maxlength: 255
                },
                AttributeName: {
                    required: true,
                    maxlength: 255
                },
                AttributeValue: {
                    required: true
                },


            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT_CHARACTER
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                    maxlength: caption.MLP_VALIDATE_NAME_PROPẺTIES_IMPORT_CHARACTER
                },
                AttributeValue: {
                    required: caption.MLP_VALIDATE_VALUE_IMPORT,
                },

            }
        }

        $rootScope.validationOptionAddC1more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Value: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                },
                Value: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },

            }
        }

        $rootScope.validationOptionCarpetMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTH_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },

            }
        }

        $rootScope.validationOptionSimpleOrder = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
            }
        }

        $rootScope.validationOptionAddC2more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
                Weight: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,
                },
            }
        }

        $rootScope.validationOptionFloorMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Width: {
                    required: true,
                }

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },

            }
        }

        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_TAB_FILE_LIST_COL_NAME),
                },

            }
        }

        $rootScope.validationOptionsCardLogger = {
            rules: {
                DtCode: {
                    required: true,
                },
                DtTitle: {
                    required: true,
                }
            },
            messages: {
                DtCode: {
                    required: caption.CJ_VALIDATE_ATTR_CODE
                },
                DtTitle: {
                    required: caption.CJ_VALIDATE_ATTR_NAME,
                }
            }
        }

        $rootScope.validationOptionsCard = {
            rules: {
                CardName: {
                    required: true,
                },
                WeightNum: {
                    required: true,
                    regx: /^\d+(\.\d+)?$/
                },
                Deadline: {
                    required: true,
                },
                BeginTime: {
                    required: true,
                }
            },
            messages: {
                CardName: {
                    required: caption.CJ_VALIDATE_WORK_REQUIRED
                },
                WeightNum: {
                    required: caption.LMS_COURSE_MSG_NUMBER_NO_SPACE,
                    regx: caption.LMS_COURSE_MSG_NUMBER_POSITIVE
                },
                Deadline: {
                    required: caption.LMS_COURSE_MSG_DATE_AND_NO_SPACE
                },
                BeginTime: {
                    required: caption.LMS_COURSE_MSG_DATE_START_NO_SPACE
                }
            }
        }

        $rootScope.validationOptionsReason = {
            rules: {
                ChangeDetails: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                ChangeDetails: {
                    required: caption.LMS_COURSE_MSG_REASON,
                    regx: caption.LMS_COURSE_MSG_REASON_NO_SPACE
                }
            }
        }
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
    $translateProvider.useUrlLoader('/Admin/DomainManagement/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderDomainManagement + '/index-course.html',
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

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DomainManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DomainName = $rootScope.DomainName;
            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable min-height: 455px;'t>ip")
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('DomainName').withTitle('{{"Domain" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;/* URL_LIST_TXT_DOMAIN_NAME*/
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectDescription').withTitle('{{"LMS_DASD_BOARD_LBL_LECT_DESCRIPTION" | translate}}').withOption('sClass', '').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Teacher').withTitle('{{"Giáo Viên" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Duration').withTitle('{{"LMS_DASD_BOARD_LBL_LECT_DURATION" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type, full) {
    //    var unit = $rootScope.listUnit.findIndex(x => x.Code == full.Unit) != -1 ? $rootScope.listUnit.find(x => x.Code == full.Unit).Name : "Phút";
    //    return data + ' ' + unit;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"Status" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data /*=== "" ? "" : '<img class="img-circle" src="images/' + data + '" onerror =' + "'" + 'this.src="' + '/images/icons/stop-icon.png' + '"' + "'" + ' class="img-responsive" height="30" width="30">'*/;
    }));/* URL_LIST_TXT_STATUS*/
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"Time total (minute)" | translate}}').withOption('sClass', 'nowrap w200').renderWith(function (data, type) {
    //    var status = $rootScope.listStatus.findIndex(x => x.Code == data) != -1 ? $rootScope.listStatus.find(x => x.Code == data).Name : "Sẵn sàng";
    //    return status;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DomainGroup').withTitle('{{"Group Domain" | translate}}').withOption('sClass', 'nowrap w150').renderWith(function (data, type) {
        return data; /*URL_LIST_TXT_TIME_TOTAL*/
    }));
    
    //vm.dtColumns.push(DTColumnBuilder.newColumn('VideoPresent').withTitle('{{"LMS_DASD_BOARD_LBL_LECT_VIDEO_SUBJECT" | translate}}').withOption('sClass', 'nowrap w100').renderWith(function (data, type, full) {
    //    return '<div class="pull-left ml10"><div class="btn-group actions d-flex"><button class="text-center" ng-click="popupVideo(' + full.Id + ')"><img src="/images/default/video-call-2.png" height="35" width="40"></button></div></div>';
    //}));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('FileBase').withTitle('{{"LMS_SBL_A_DOCUMENT" | translate}}').withOption('sClass', '').renderWith(function (data, type, full) {
    //    return '<a href="' + data + '">' + data + '</a>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"Operation" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button> <button title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash-o"></i></button>'; //+
            //'<button title="{{"LMS_EXAM_LBL_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    })); /*URL_LIST_TXT_SETTING*/
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
    $scope.ListExtension = [
        { Code: '1', Name: '.COM' },
        { Code: '2', Name: '.VN' },
        { Code: '3', Name: '.COM.VN' },
        { Code: '4', Name: '.NET' }];
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDomainManagement + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
        }, function () {
            reloadData();
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
            templateUrl: ctxfolderDomainManagement + '/edit.html',
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
                templateUrl: ctxfolderDomainManagement + '/popup-video.html',
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
            templateUrl: ctxfolderDomainManagementMessage + '/messageConfirmDeleted.html',
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
            templateUrl: ctxfolderDomainManagement + '/viewLecture.html',
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
            templateUrl: ctxfolderDomainManagement + '/viewQuestion.html',
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
});
app.controller('popupVideo', function ($scope, $rootScope, $sce, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, para) {
    $scope.presentation = {
        VideoUpload: '',
        YoutubeUrl: ''
    };
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
                    $scope.isVideoPlaying = false;
                }
                else if (extFile == "mp4") {
                    $scope.presentation.YoutubeUrl = '';
                    $scope.videoType = "HTML5";
                    $scope.isVideoPlaying = false;
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

    $scope.chooseLecture = function (index) {
        if ($scope.isVideoPlaying) {
            var session = {
                SubjectCode: $rootScope.data.SubjectCode,
                LectureCode: $rootScope.data.ListLecture[$scope.oldLectureIndex].LectCode,
                SessionCode: $rootScope.sessionCode,
                StopTime: moment()
            };
            dataservice.logSession(session, function (rs) {
                rs = rs.data;
                $scope.oldLectureIndex = index;
                App.toastrInfo(caption.DOM_HAVE_FINISH_LECTURE);
            });
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
                $scope.isVideoPlaying = false;
            }
            else if (extFile == "mp4") {
                $scope.presentation.YoutubeUrl = '';
                $scope.videoType = "HTML5";
                videoHandler.stopVideo();
                $scope.isVideoPlaying = false;
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
        var session = {
            SubjectCode: $rootScope.data.SubjectCode,
            LectureCode: $rootScope.data.ListLecture[index].LectCode,
            SessionCode: $rootScope.sessionCode,
        };
        dataservice.logSession(session, function (rs) {
            rs = rs.data;
            console.log(rs.Title);
        });
    }
    $scope.logTimeStart = function () {
        $scope.isVideoPlaying = true;
        var session = {
            SubjectCode: $rootScope.data.SubjectCode,
            LectureCode: $rootScope.data.ListLecture[$scope.oldLectureIndex].LectCode,
            SessionCode: $rootScope.sessionCode,
            StartTime: moment()
        };
        dataservice.logSession(session, function (rs) {
            rs = rs.data;
            console.log(rs.Title);
        });
    }
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
                App.toastrInfo(caption.DOM_HAVE_FINISH_LECTURE);
            });
        }
        $scope.playYoutube();
        $uibModalInstance.close();
    }
});
app.controller('exam', function ($scope, $rootScope, $controller, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.loadDetailSubject = function () {
        dataservice.getListDetailQuiz($rootScope.SubjectCode, function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs.Object;
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
                    $scope.listQuestion[i].listAnswer[j].check = false;
                    $scope.listQuestion[i].listAnswer[j].Content = decodeHTML($scope.listQuestion[i].listAnswer[j].Answer);
                    if ($scope.listQuestion[i].listAnswer[j].Type == "VIDEO") {
                        $scope.listQuestion[i].containVideo = { 'flex-wrap': 'wrap' };
                    }
                }
            }
        });
    }
    $rootScope.data.fromExam = false;
    $controller('test', { $scope: $scope, $uibModalInstance: null, para: $rootScope.data });
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
        DomainName: para.DomainName,
        Status: para.Status,
        DomainGroup: para.DomainGroup,
        Note: para.Note,
        Seclect: '',
    };
    $scope.ListStatus = [
        { Code: '1', Name: 'Action Stop' },
        { Code: '2', Name: 'Action Pause' }];
    $scope.ListDomainGroup = [
        { Code: '1', Name: 'Domain HaNoi' },
        { Code: '2', Name: 'Doamin TPHCM' }];
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
        var editor = CKEDITOR.replace('WorkContent', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['WorkContent'].config.height = 80;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        DomainName: '',
        Note: '',
        DomainGroup: '',
        Status: '',
    };
    $scope.ListExtension = [
        { Code: '1', Name: '.COM' },
        { Code: '2', Name: '.VN' },
        { Code: '3', Name: '.COM.VN' },
        { Code: '4', Name: '.NET' }];
    $scope.ListStoragePath = [
        {
            Code: "1",
            Name: 'Facebbok.com'
        }, {
            Code: "2",
            Name: 'Vietnam.net'
        },];
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
            App.toastrError(caption.DOM_FILE_NOT_SUPPORT_PLAYBACK);
        }
    }


    $scope.viewFileDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDomainManagement + '/viewFile.html',
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

