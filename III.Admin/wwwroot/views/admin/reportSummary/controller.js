var ctxfolderReportSummary = "/views/admin/reportSummary";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderDomainManagementMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "angularjs-dropdown-multiselect", "pascalprecht.translate", 'dynamicNumber']).
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

app.directive('apexChart', function ($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attrs) {
            var id = attrs.id;
            scope.$watch(attrs['ngModel'], function (newValue) {
                if (newValue) {
                    $timeout(function () {
                        var options = newValue;
                        /*debugger*/
                        var chart = new ApexCharts(
                            document.querySelector("#" + id),
                            options
                        );

                        chart.render();

                    })
                }
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
        amchartFile: function (callback) {
            $http.get('/Admin/DashBoard/AmchartFile/').then(callback);
        },
        getCountFile: function (callback) {
            $http.get('/Admin/DashBoard/GetCountFile/').then(callback);
        },
        getActionFile: function (callback) {
            $http.get('/Admin/DashBoard/GetActionFile/').then(callback);
        },
        getListdomain: function (callback) {
            $http.post('/Admin/ReportSummary/GetListDomain').then(callback);
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
        getCountCrawlerRunningLog: function (Domain, StartTime, EndTime, callback) {
            $http.post('/Admin/ReportSummary/GetCountCrawlerRunningLog?domain=' + Domain + '&starttime=' + StartTime + '&endtime=' + EndTime).then(callback);
        },
        GetCountCrawlDataLog: function (Domain, StartTime, EndTime, callback) {
            $http.post('/Admin/ReportSummary/GetCountCrawlDataLog?domain=' + Domain + '&starttime=' + StartTime + '&endtime=' + EndTime).then(callback);
        },
        getsumcrawler: function (callback) {
            $http.get('/Admin/ReportSummary/AmChartCrawlerRunningLog').then(callback);
        },
        pythonJtableWithContent: function (data, callback) {
            $http.post('/Admin/ReportSummary/PythonJtableWithContent?content=' + data).then(callback);
        },
        PythonIndexFile: function (fileCode, content, pathIndex, callback) {
            $http.post('/Admin/PythonCrawler/PythonIndexFile').then(callback);
        },
        getlistLinkPost: function (data, callback) {
            $http.get('/Admin/ReportSummary/GetlistLinkPost?FileCode=' + data).then(callback);
        },
        getDataSession: function (data, callback) {
            $http.post('/Admin/BotSessionManagement/GetDataSession?id=' + data).then(callback);
        },
        getFileResult: function (data, callback) {
            $http.post('/Admin/ReportSummary/GetFileResult?SessionCode=' + data).then(callback);
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
    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
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
    $translateProvider.useUrlLoader('/Admin/ReportSummary/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderReportSummary + '/index.html',
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
app.controller('index', function ($scope, $rootScope, $sce, $location,$compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $sce, $translate) {
    $scope.selectedSummaryDomain = []
    $scope.IdentifierBot = '';
    $scope.initData = function () {
        $scope.ID = $location.$$hash.replace('index?id=', '');
        dataservice.getDataSession($scope.ID, function (rs) {
            rs = rs.data;
            console.log(rs[0])
            $scope.BotSessionCode = rs[0].BotSessionCode;
            $scope.RobotCode = rs[0].RobotCode;
            $scope.IdentifierBot = rs[0].IdentifierBot;
            
            if (!rs.Error) {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
            else {
                App.toastrError(rs.Title);
            }
            $rootScope.reloadNoResetPage();
        });
        dataservice.getListdomain(function (rs) {
            rs = rs.data;
            $scope.listdomain = rs;
        });
    };
    $scope.initData();
    $scope.Day = []
    $scope.captcharsum = []
    $scope.urlsum = []
    $scope.filesum = []
    $scope.timeScansum = []

    $scope.model = {
        StartTime: '',
        EndTime: '',
        Keyword: '',
    }
    function inputKey() {

    }

    function loadDate() {
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/dd/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
            $('#datefrom').datepicker('setEndDate', maxDate);
            /*resetValidateEffectiveDate();*/
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/dd/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
            /*resetValidateEndDate();*/
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EffectiveDate').datepicker('setEndDate', null);
            }
        });
    }


    setTimeout(function () {
        loadDate();
    }, 200);

    $scope.model = {
        Domain: '',
    }
    
    $scope.onChange = function () {
        console.log('Start !');
        var editor = $("#<%=RTE1.ClientID%>").ejRTE("instance");
        var selectedHtml = editor.getSelectedHtml();
        editor.pasteContent("<p style ='background-color:yellow;color:skyblue'>" + selectedHtml + "</p>");
    }
    
    $filter('date')(new Date($scope.model.StartTime), 'mm/dd/yyyy');
    $filter('date')(new Date($scope.model.EndTime), 'mm/dd/yyyy');
    $scope.Search = function () {
        dataservice.pythonJtableWithContent($scope.model.Keyword, function (rs) {
            rs = rs.data;
            $scope.listResultData = rs.Item1;
            $scope.FileCode1 = '';
            $scope.LinkPost = '';
            $scope.FreqCount = '';
            $scope.listResultData1 = [];
            for (var i = 0; i < rs.Item1.length; i++) {
                if ($scope.IdentifierBot == $scope.listResultData[i].IdentifierCode) {
                    $scope.listResultData[i].Content = $sce.trustAsHtml($scope.listResultData[i].Content);
                    $scope.FileCode1 = $scope.listResultData[i].FileCode;
                    $scope.FreqCount = $scope.listResultData[i].FreqCount;
                    var textarr = $scope.FreqCount.split("freq=");
                    var textarr2 = textarr[1].split(")");
                    var textarr3 = textarr2[0].split("=");
                    $scope.KeyCount = textarr3[0];
                    $scope.listResultData[i].FreqCount = $scope.KeyCount;

                    $scope.listResultData1.push($scope.listResultData[i]);
                    console.log($scope.listResultData1);

                }
                if ($scope.IdentifierBot == '') {
                    $scope.listResultData[i].Content = $sce.trustAsHtml($scope.listResultData[i].Content);
                    $scope.FileCode1 = $scope.listResultData[i].FileCode;
                    $scope.FreqCount = $scope.listResultData[i].FreqCount;
                    var textarr = $scope.FreqCount.split("freq=");
                    var textarr2 = textarr[1].split(")");
                    var textarr3 = textarr2[0].split("=");
                    $scope.KeyCount = textarr3[0];
                    $scope.listResultData[i].FreqCount = $scope.KeyCount;

                    $scope.listResultData1.push($scope.listResultData[i]);
                    console.log($scope.listResultData1);
                }
                

            }
            
        })
        dataservice.getCountCrawlerRunningLog($scope.model.Domain, $scope.model.StartTime, $scope.model.EndTime, function (rs) { // bot code is set to 1
            rs = rs.data;
            //console.log(rs);
            $scope.capcharNum = rs[0].SumPassCap;
            $scope.urlNum = rs[0].SumUrl;
            $scope.urlNum = rs[0].SumUrl;
            $scope.fileNum = rs[0].SumFile;
            $scope.timeScan = rs[0].SumTimeScan;
            $scope.fileSize = rs[0].SumSize / 1024;
            //console.log(typeof($scope.fileSize));
            $scope.optionPieChart = {
                chart: {
                    height: 320,
                    type: 'pie',
                },
                series: [$scope.urlNum, $scope.timeScan, $scope.fileNum, $scope.fileSize, $scope.capcharNum],
                labels: ["Url", caption.LMS_REPORT_SUMMARY_TIMESCAN, caption.LMS_REPORT_SUMMARY_DOWNLOADFILE, caption.LMS_REPORT_SUMMARY_FILESIZE, caption.LMS_REPORT_SUMMARY_CAPCHAR],
                colors: ["#1cbb8c", "#5664d2", "#fcb92c", "#4aa3ff", "#ff3d60"],
                legend: {
                    show: true,
                    position: 'bottom',
                    horizontalAlign: 'center',
                    verticalAlign: 'middle',
                    floating: false,
                    fontSize: '14px',
                    offsetX: 0,
                    offsetY: 5
                },
                responsive: [{
                    breakpoint: 600,
                    options: {
                        chart: {
                            height: 240
                        },
                        legend: {
                            show: false
                        },
                    }
                }]

            }
        })
        dataservice.GetCountCrawlDataLog($scope.model.Domain, $scope.model.StartTime, $scope.model.EndTime, function (rs) { // bot code is set to 1
            rs = rs.data;
            console.log(rs);
            $scope.sessionCode = rs[0].SessionCode;
            $scope.fileResultData = rs[0].FileResultData;
            $scope.keyWord = rs[0].KeyWord;
            $scope.keyExsist = rs[0].KeyExsist;
            $scope.countTimes = rs[0].CountTimes;
            /* $scope.capcharNum = rs[0].SessionCode;
             $scope.urlNum = rs[0].FileResultData;
             $scope.fileNum = rs[0].KeyWord;
             $scope.timeScan = rs[0].KeyExsist;
             $scope.fileSize = rs[0].CountTimes;*/
            /*$scope.fileSize = rs[0].SumSize / 1024;*/
            $scope.listdataRecevie = rs;
            console.log(sessionCode);
            console.log(fileResultData);
            console.log(keyWord);
            console.log(keyExsist);

        })
    }
    dataservice.getsumcrawler(function (rs) {
        rs = rs.data;
       
        Day = [];
        sumcaptchar = [];
        sumurl = [];
        sumfile = [];
        sumtime = [];
        sumsize = [];
        for (var i = 0; i < rs.length; i++) {
            sumcaptchar.push(rs[i].SumPasscap);
            sumurl.push(rs[i].SumUrl);
            sumfile.push(rs[i].SumFile);
            sumtime.push(rs[i].SumTimeScan);
            sumsize.push(rs[i].SumSize / 1024);
            this.curdate = (new Date().getMonth() + 1).toString() + '/' + new Date().getFullYear().toString();
            Day.push(rs[i].Day + '/' + this.curdate);
        }
        $scope.optionLineChart = {
            chart: {
                height: 380,
                type: 'line',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            colors: ["#1cbb8c", "#5664d2", "#fcb92c", "#4aa3ff", "#ff3d60"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: [3, 3],
                curve: 'straight'
            },
            series: [{
                name: "Url",
                data: sumurl
            },
            {
                name: caption.LMS_REPORT_SUMMARY_TIMESCAN,
                data: sumtime
            },
            {
                name: caption.LMS_REPORT_SUMMARY_DOWNLOADFILE,
                data: sumfile
            },
            {
                name: caption.LMS_REPORT_SUMMARY_FILESIZE,
                data: sumsize
            },
            {
                name: caption.LMS_REPORT_SUMMARY_CAPCHAR,
                data: sumcaptchar
            }
            ],
            title: {
                text: caption.LMS_REPORT_SUMMARY_CRAWL_DATA,
                align: 'left'
            },
            grid: {
                row: {
                    colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.2
                },
                borderColor: '#f1f1f1'
            },
            markers: {
                style: 'inverted',
                size: 6
            },
            xaxis: {
                categories: Day,
                title: {
                    text: caption.LMS_REPORT_SUMMARY_DAY
                }
            },
            yaxis: {
                title: {
                    text: caption.LMS_REPORT_SUMMARY_DATA
                },
                min: 5,
                max: 5000
            },
            legend: {
                offsetY: 5
            },
            responsive: [{
                breakpoint: 600,
                options: {
                    chart: {
                        toolbar: {
                            show: false
                        }
                    },
                    legend: {
                        show: false
                    },
                }
            }]
        };

    })
    $scope.view = function (filecode) {
        dataservice.getlistLinkPost(filecode, function (rs) {
            rs = rs.data;
            $scope.temp = rs;
            if ($scope.temp === undefined || $scope.temp === null || $scope.temp === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderReportSummary + '/view.html',
                    controller: 'view',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                            return $scope.temp;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () {
                    reloadData();
                });
            }
        });
        
    }
    $scope.ListSummaryDomain = [
        { "id": '1', "label": 'Tailieu123.vn' },
        { "id": '2', "label": 'VnDoc.com ' },
        { "id": '3', "label": 'Vuihoc.vn' },
        { "id": '4', "label": 'Baitap123.vn' },
        { "id": '5', "label": '789.vn' },
        { "id": '6', "label": 'quizizz.com' },
        { "id": '7', "label": 'hocmai.vn' }];

    $scope.ListExtension = [
        { Code: '1', Name: '.COM' },
        { Code: '2', Name: '.VN' },
        { Code: '3', Name: '.COM.VN' },
        { Code: '4', Name: '.NET' }];
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDomainManagement + '/view.html',
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
    $scope.initBoxCard = function () {
        dataservice.getActionFile(function (rs) {
            rs = rs.data;
            $scope.lstFile = rs;
        })
        dataservice.getCountFile(function (rs) {
            rs = rs.data;
            $scope.sumFile = rs.SumFile;
        })
        window.tabler = {
            colors: {
                'blue': '#467fcf',
                'blue-darkest': '#0e1929',
                'blue-darker': '#1c3353',
                'blue-dark': '#3866a6',
                'blue-light': '#7ea5dd',
                'blue-lighter': '#c8d9f1',
                'blue-lightest': '#edf2fa',
                'azure': '#45aaf2',
                'azure-darkest': '#0e2230',
                'azure-darker': '#1c4461',
                'azure-dark': '#3788c2',
                'azure-light': '#7dc4f6',
                'azure-lighter': '#c7e6fb',
                'azure-lightest': '#ecf7fe',
                'indigo': '#6574cd',
                'indigo-darkest': '#141729',
                'indigo-darker': '#282e52',
                'indigo-dark': '#515da4',
                'indigo-light': '#939edc',
                'indigo-lighter': '#d1d5f0',
                'indigo-lightest': '#f0f1fa',
                'purple': '#a55eea',
                'purple-darkest': '#21132f',
                'purple-darker': '#42265e',
                'purple-dark': '#844bbb',
                'purple-light': '#c08ef0',
                'purple-lighter': '#e4cff9',
                'purple-lightest': '#f6effd',
                'pink': '#f66d9b',
                'pink-darkest': '#31161f',
                'pink-darker': '#622c3e',
                'pink-dark': '#c5577c',
                'pink-light': '#f999b9',
                'pink-lighter': '#fcd3e1',
                'pink-lightest': '#fef0f5',
                'red': '#e74c3c',
                'red-darkest': '#2e0f0c',
                'red-darker': '#5c1e18',
                'red-dark': '#b93d30',
                'red-light': '#ee8277',
                'red-lighter': '#f8c9c5',
                'red-lightest': '#fdedec',
                'orange': '#fd9644',
                'orange-darkest': '#331e0e',
                'orange-darker': '#653c1b',
                'orange-dark': '#ca7836',
                'orange-light': '#feb67c',
                'orange-lighter': '#fee0c7',
                'orange-lightest': '#fff5ec',
                'yellow': '#f1c40f',
                'yellow-darkest': '#302703',
                'yellow-darker': '#604e06',
                'yellow-dark': '#c19d0c',
                'yellow-light': '#f5d657',
                'yellow-lighter': '#fbedb7',
                'yellow-lightest': '#fef9e7',
                'lime': '#7bd235',
                'lime-darkest': '#192a0b',
                'lime-darker': '#315415',
                'lime-dark': '#62a82a',
                'lime-light': '#a3e072',
                'lime-lighter': '#d7f2c2',
                'lime-lightest': '#f2fbeb',
                'green': '#5eba00',
                'green-darkest': '#132500',
                'green-darker': '#264a00',
                'green-dark': '#4b9500',
                'green-light': '#8ecf4d',
                'green-lighter': '#cfeab3',
                'green-lightest': '#eff8e6',
                'teal': '#2bcbba',
                'teal-darkest': '#092925',
                'teal-darker': '#11514a',
                'teal-dark': '#22a295',
                'teal-light': '#6bdbcf',
                'teal-lighter': '#bfefea',
                'teal-lightest': '#eafaf8',
                'cyan': '#17a2b8',
                'cyan-darkest': '#052025',
                'cyan-darker': '#09414a',
                'cyan-dark': '#128293',
                'cyan-light': '#5dbecd',
                'cyan-lighter': '#b9e3ea',
                'cyan-lightest': '#e8f6f8',
                'gray': '#868e96',
                'gray-darkest': '#1b1c1e',
                'gray-darker': '#36393c',
                'gray-dark': '#6b7278',
                'gray-light': '#aab0b6',
                'gray-lighter': '#dbdde0',
                'gray-lightest': '#f3f4f5',
                'gray-dark': '#343a40',
                'gray-dark-darkest': '#0a0c0d',
                'gray-dark-darker': '#15171a',
                'gray-dark-dark': '#2a2e33',
                'gray-dark-light': '#717579',
                'gray-dark-lighter': '#c2c4c6',
                'gray-dark-lightest': '#ebebec'
            }
        };
        dataservice.amchartFile(function (rs) {
            rs = rs.data;
            monthfile = [];
            sumfile = ['sum'];
            for (var i = 0; i < rs.length; i++) {
                sumfile.push(rs[i].sum);
                monthfile.push(caption.WDH_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_file', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumfile,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.WDH_LBL_TOTAL_FILE,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthfile
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);


        })
    }

    $scope.initBoxCard();

    $scope.switchDiv = function () {
        divMenuDigital = $('#menuDigital');
        divChart = $('#chartDigital');
        tdivMenuDigital = divMenuDigital.clone();
        tdivChart = divChart.clone();
        if (!divChart.is(':empty')) {
            divMenuDigital.replaceWith(tdivChart);
            divChart.replaceWith(tdivMenuDigital);
        }
    }

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    function showTime() {
        var date = new Date();
        var h = date.getHours(); // 0 - 23
        var m = date.getMinutes(); // 0 - 59
        var s = date.getSeconds(); // 0 - 59
        var session = "AM";

        if (h == 0) {
            h = 12;
        }

        if (h > 12) {
            h = h - 12;
            session = "PM";
        }

        h = (h < 10) ? "0" + h : h;
        m = (m < 10) ? "0" + m : m;
        s = (s < 10) ? "0" + s : s;

        var time = h + ":" + m + ":" + s + " " + session;
        document.getElementById("MyClockDisplay").innerText = time;
        document.getElementById("MyClockDisplay").textContent = time;

        //setTimeout(showTime, 1000);
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
app.controller('view', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        UrlPost: para[0].LinkPost,
        ArticleContent: para[0].TextContent,
        DownloadUrl: '',
        SessionCode: para[0].SessionCode,

    };
    
    $scope.init = function () {
        dataservice.getFileResult($scope.model.SessionCode, function (rs) {
            rs = rs.data;
            $scope.model.DownloadUrl = rs.Object.FileResultData;
            console.log($scope.model.DownloadUrl);
           /* if (!rs.Error) {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
            else {
                App.toastrError(rs.Title);
            }*/
            $rootScope.reloadNoResetPage();
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

