var ctxfolderCrawlerMenu = "/views/admin/crawlerMenu";
var ctxfolderSupplier = "/views/admin/supplier";
var ctxfolderProject = "/views/admin/project";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/lmsCommonSetting";
var app = angular.module('App_ESEIM_LMS_DASHBOARD', ['App_ESEIM_REPOSITORY', 'App_ESEIM_CMS_ITEM', 'App_ESEIM_FILE_PLUGIN', "ui.sortable", "ngCookies", "ngSanitize", "ngJsTree", "treeGrid", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'ui.select', "pascalprecht.translate", 'dynamicNumber', 'scrollToEnd', 'ngTagsInput', 'ui.tab.scroll', 'youtube-embed']);

app.directive('customOnChangeLms', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeLms);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
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
                    return caption.CJ_LBL_JUST_FINISH;
                } else {
                    return diffMins + ' ' + caption.CJ_LBL_MINUTE_AGO;
                }
            } else {
                return diffHrs + '  ' + caption.CJ_LBL_HOUR + diffMins + ' ' + caption.CJ_LBL_MINUTE_AGO;
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

app.filter('groupBy', function ($parse) {
    return _.memoize(function (items, field) {
        var getter = $parse(field);
        return _.groupBy(items, function (item) {
            return getter(item);
        });
    });
});

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

app.factory('dataserviceLms', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    };
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callback).catch(function (error) {
            App.unblockUI("#modal-body");
            App.toastrError(caption.CRAWL_ERROR_FILE_NOT_FOUND);
        });
    };
    return {
        //subject
        insertSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertSubject/', data).then(callback);
        },
        updateSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateSubject/', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetItemSubject/' + data).then(callback);
        },
        deleteSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteSubject?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        //lecture

        insertLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertLecture/', data).then(callback);
        },
        updateLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateLecture/', data).then(callback);
        },
        getItemLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/getItemLecture/' + data).then(callback);
        },
        deleteLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteLecture?id=' + data).then(callback);
        },
        //quiz

        insertQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertQuiz/', data).then(callback);
        },
        updateQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateQuiz/', data).then(callback);
        },
        updateAnswer: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateAnswer/', data).then(callback);
        },
        updateReference: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateReference/', data).then(callback);
        },
        getItemQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/getItemQuiz/' + data).then(callback);
        },
        getItemCms: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetItemCms?code=' + data).then(callback);
        },
        getCurrentUserFullName: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetCurrentUserFullName').then(callback);
        },
        getListCmsItem: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetListCmsItem').then(callback);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListSubject').then(callback);
        },
        getListLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetListLecture?subjectCode=' + data).then(callback);
        },
        deleteQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteQuiz?id=' + data).then(callback);
        },
        setLmsSessionCode: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/SetLmsSessionCode?sessionCode=' + data).then(callback);
        },
        getLmsSessionCode: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetLmsSessionCode').then(callback);
        },
        // amchart
        amchartDoExercise: function (callback) {
            $http.get('/Admin/LmsDashBoard/AmchartDoExercise').then(callback);
        },
        amchartLearnSubject: function (callback) {
            $http.get('/Admin/LmsDashBoard/AmchartLearnSubject/').then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM_LMS_DASHBOARD', function ($scope, $rootScope, $compile, $uibModal, dataserviceLms, $cookies, $filter, $translate, $window) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.StatusData = [{
            Value: 1,
            Name: caption.CRAWL_ACTIVATE
        }, {
            Value: 2,
            Name: caption.CRAWL_NOT_ACTIVATE
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
                    regx: caption.CRAWL_MSG_BEGIN_ITEM_NO_SPACE
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
                    required: caption.CRAWL_CHECK_IN_TIME_NO_SPACE
                },
                ChkoutTime: {
                    required: caption.CRAWL_CHECK_OUT_TIME_NO_SPACE
                },
                ChkinLocationTxt: {
                    required: caption.CRAWL_CHECK_IN_LOCATION_NO_SPACE
                },
                ChkoutLocationTxt: {
                    required: caption.CRAWL_CHECK_OUT_LOCATION_NO_SPACE
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
                    required: caption.CRAWL_WEIGHT_NO_EMPTY,
                    regx: caption.CRAWL_MSG_INPUT_NUMBER_NEGATIVE
                },
                Deadline: {
                    required: caption.CRAWL_MSG_DEADLINE_NOT_EMPTY
                },
                BeginTime: {
                    required: caption.CRAWL_STARTDATE_NOT_EMPTY
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
                    required: caption.CRAWL_MSG_REASON_NOT_EMPTY,
                    regx: caption.CRAWL_MSG_REASON_DONT_START_SPACE
                }
            }
        }
    });
    $rootScope.isTranslate = false;
    $rootScope.open = true;

    // Get fullName with picture
    $scope.fullName = fullName;
    $scope.pictureUser = pictureUser;

    dataserviceLms.getListSubject(function (rs) {
        rs = rs.data;
        $rootScope.listSubject = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $translateProvider.useUrlLoader('/Admin/CrawlerMenu/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderCrawlerMenu + '/dash-board.html',
            controller: 'dashBoard'
        })
        .when('/addSubject', {
            templateUrl: /*ctxfolderCrawlerMenu + '/index.html'*/ctxfolderCrawlerMenu + '/add-subject.html',
            controller: 'addSubject'
        })
        .when('/editSubject', {
            templateUrl: /*ctxfolderCrawlerMenu + '/index.html'*/ctxfolderCrawlerMenu + '/add-subject.html',
            controller: 'editSubject'
        })
        .when('/showStat', {
            templateUrl: ctxfolderCrawlerMenu + '/index.html',
            controller: 'showStat'
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

app.controller('menuSessionLms', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    dataserviceLms.getLmsSessionCode(function (rs) {
        rs = rs.data;
        if (rs == null || rs == '' || rs == undefined) {
            $rootScope.sessionCode = create_UUID();
            dataserviceLms.setLmsSessionCode($rootScope.sessionCode, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
            });
        }
        else {
            $rootScope.sessionCode = rs;
            console.log($rootScope.sessionCode);
        }
    });
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
});


app.controller('dashBoard', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
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
    dataserviceLms.amchartDoExercise(function (rs) {
        rs = rs.data;
        monthbuy = [];
        monthDoExc = [];
        sumTest = ['TestTotal'];
        rightTest = ['TestRight'];
        wrongTest = ['TestWrong'];
        sumSubject = ['SubjectTotal'];
        rightSubject = ['SubjectRight'];
        wrongSubject = ['SubjectWrong'];
        for (var i = 0; i < rs.length; i++) {
            sumTest.push(rs[i].TestTotal);
            rightTest.push(rs[i].TestRight);
            wrongTest.push(rs[i].TestWrong);
            sumSubject.push(rs[i].SubjectTotal);
            rightSubject.push(rs[i].SubjectRight);
            wrongSubject.push(rs[i].SubjectWrong);
            monthDoExc.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
        }
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_do_exercise', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        sumTest,
                        rightTest,
                        wrongTest,
                        sumSubject,
                        rightSubject,
                        wrongSubject
                    ],
                    type: 'area', // default type of chart
                    colors: {
                        'TestTotal': tabler.colors["blue"],
                        'TestRight': tabler.colors["pink"],
                        'TestWrong': tabler.colors["red"],
                        'SubjectTotal': tabler.colors["yellow"],
                        'SubjectRight': tabler.colors["green"],
                        'SubjectWrong': tabler.colors["hotpink"],
                    },
                    names: {
                        // name of each serie
                        'TestTotal': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.CRAWL_CHECK_TEST_TOTAL,
                        'TestRight': /*caption.DB_LBL_FINISH*/ caption.CRAWL_TEST_RIGHT,
                        'TestWrong': /*caption.DB_LBL_PROCESSING*/ caption.CRAWL_TEST_WRONG,
                        'SubjectTotal': /*caption.DB_LBL_OUT_DATE*/ caption.CRAWL_SUBJECT_EXERCISE,
                        'SubjectRight': /*caption.DB_LBL_CANCEL*/ caption.CRAWL_SUBJECT_EXERCISE_RIGHT,
                        'SubjectWrong': caption.CRAWL_SUBJECT_EXERCISE_WRONG,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthDoExc
                    },
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
    });

    dataserviceLms.amchartLearnSubject(function (rs) {
        rs = rs.data;
        monthLearnSub = [];
        sumLearnSub = ['Sum'];
        for (var i = 0; i < rs.length; i++) {
            sumLearnSub.push(rs[i].Sum);
            monthLearnSub.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
        }
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_learn_subject', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        sumLearnSub,
                    ],
                    type: 'area', // default type of chart
                    colors: {
                        'Sum': tabler.colors["blue"],
                    },
                    names: {
                        // name of each serie
                        'Sum': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.CRAWL_WATCH_LECTURE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthLearnSub
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
    });
});
app.controller('showStat', function ($scope, $http, $location, $rootScope, $controller, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    $scope.index = ctxfolderCrawlerMenu + "/show-stat.html";
    $controller('dashBoard', { $scope: $scope });
});
app.controller('indexLms', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    $scope.index = ctxfolderCrawlerMenu + "/dash-board.html";
    $("#icon-home").removeClass('pt10');
    $("#breadcrumb").addClass('hidden');
    $(document).ready(function (e) {
        $('.content-wrapper').css("height", "100%");
        $('#contentMain').css("height", "100%");
        $('.container-fluid').not('.board-detail').css("height", "100%");

        $.app.menu.expanded = true;
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
        $(".menu-toggle").click(function (e) {
            if ($.app.menu.collapsed) {
                $.app.menu.expanded = false;
                $.app.menu.expand();
                closeNavCard();
            } else {
                $.app.menu.collapsed = false;
                $.app.menu.toggle();
                closeNavCard();
            }
            e.stopImmediatePropagation();
        });
        $("#btnOpenTrello").click(function (e) {
            e.preventDefault();
            if ($.app.menu.expanded) {
                $.app.menu.toggle();
            }
            openNavCard();
            e.stopImmediatePropagation();
        });
    });
    //angular.element($window).bind('resize', function () {
    //    if ($window.innerWidth > 975 && $window.innerWidth < 1295) {
    //        $rootScope.listAndCard.Length = 2;
    //    }
    //    else if ($window.innerWidth > 1295 && $window.innerWidth < 1595) {
    //        $rootScope.listAndCard.Length = 3;
    //    } else if ($window.innerWidth > 1595 && $window.innerWidth < 1915) {
    //        $rootScope.listAndCard.Length = 4;
    //    }
    //    else if ($window.innerWidth > 1915 && $window.innerWidth < 2235) {
    //        $rootScope.listAndCard.Length = 5;
    //    } else if ($window.innerWidth > 2235) {
    //        $rootScope.listAndCard.Length = 6;
    //    }
    //});

    //Show, hide nav-left
    $scope.showNavLeft = true;
    $scope.navLeft = function () {
        if ($scope.showNavLeft) {
            $scope.showNavLeft = false;
            document.getElementById("mySidenav").style.width = "0px";
            document.getElementById("BoardDetail").style.paddingLeft = "0px";
        }
        else {
            $scope.showNavLeft = true;
            document.getElementById("mySidenav").style.width = "345px";
            document.getElementById("BoardDetail").style.paddingLeft = "330px";
        }
    }
});

// Subject & Lecture Management
app.controller('indexSubject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        CategoryName: '',
        Published: '',
        ExtraFieldGroup: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listPublished = [
        { code: '', name: caption.CRAWL_SCOPE_ALL },
        {
            code: false,
            name: caption.CRAWL_NOT_DISPLAY 
        }, {
            code: true,
            name: caption.CRAWL_DISPLAY
        }
    ];
    $scope.initData = function () {
        /*dataserviceLms.getlistGroup(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
            var all = {
                Id: '',
                Name: 'Tất cả'
            }
            $scope.listGroup.unshift(all)
        });*/
    };
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EduCategory/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.ExtraFieldGroup = $scope.model.ExtraFieldGroup;
                //d.CategoryName = $scope.model.CategoryName;
                //d.Published = $scope.model.Published;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CMS_CAT_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"Nhóm" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ordering').withTitle('{{"CMS_CAT_COL_ORDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Published').withTitle('{{"CMS_CAT_COL_PUBLISH" | translate}}').renderWith(function (data, type, full) {

        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')" ></span> '
        }
        else {
            return '<span class="cursor glyphicon glyphicon-ban-circle text-danger fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')"></span> '
        }

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
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };

    $scope.publish = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CRAWL_MSG_CHANGE_DISPLAY_STATUS;
                $scope.ok = function () {

                    /*dataserviceLms.approve(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {

                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });*/


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
                    /*dataserviceLms.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });*/
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
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 500);
});
app.controller('addSubject', function ($scope, $rootScope, $compile, $uibModal, dataserviceLms, DTOptionsBuilder, DTColumnBuilder, DTInstances, Upload) {
    $scope.index = ctxfolderCrawlerMenu + "/add-subject.html";
    $scope.model = {
        SubjectCode: '',
        SubjectName: '',
        SubjectDescription: '',
        Teacher: '',
        Duration: '',
        Unit: '',
        ImageCover: '',
        VideoPresent: '',
        FileBase: '',
        Status: '',
    };

    $scope.model1 = {
        ListUser: []
    };
    $scope.init = function () {
        dataserviceLms.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.init();
    $rootScope.isShow = '';
    $rootScope.listStatus = [
        {
            Code: "AVAILABLE",
            Name: caption.CRAWL_STATUS_AVAILABLE
        }, {
            Code: "UNAVAILABLE",
            Name: caption.CRAWL_STATUS_UNAVAILABLE
        },];
    $rootScope.listUnit = [
        {
            Code: "MINUTE",
            Name: caption.CRAWL_UNIT_MINUTE
        }, {
            Code: "HOUR",
            Name: caption.CRAWL_UNIT_HOUR
        },];
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemSubject'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemSubject'].getData();
            $scope.model.SubjectDescription = data;
        }
        $scope.model.Teacher = $scope.model1.ListUser.join(',');
        if (/*$scope.addform.validate() &&*/ !validationSelect($scope.model).Status) {
            dataserviceLms.insertSubject($scope.model, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.SubjectCode = $scope.model.SubjectCode;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadFileSubject = function (event) {
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
            data.ModuleName = "SUBJECT";
            data.IsMore = false;
            //data.uuid = create_UUID();

            //if (!$scope.isProgressModelOpen) {
            //    $scope.viewProgress();
            //}
            //$rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
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
            data.ModuleName = "SUBJECT";
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
                    $scope.model.ImageCover = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Group" && $scope.model.ExtraFieldsGroup != "" && $scope.model.ExtraFieldsGroup != null && $scope.model.ExtraFieldsGroup != undefined) {
            $scope.errorGroup = false;
        } else {
            $scope.errorGroup = true;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        /*if (data.ExtraFieldsGroup == "" || data.ExtraFieldsGroup == null || data.ExtraFieldsGroup == undefined) {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;
        }*/
        return mess;
    }
    function ckEditer() {
        var editor1 = CKEDITOR.replace('ckEditorItemSubject', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    setTimeout(function () {
        ckEditer();
    }, 1000);

    // lecture
    var vm = $scope;
    $scope.selectedLecture = [];
    $scope.selectAllLecture = false;
    $scope.toggleAllLecture = toggleAllLecture;
    $scope.toggleOneLecture = toggleOneLecture;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsLecture = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsDashBoard/JTableLecture",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SubjectCode = $rootScope.SubjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.editLecture(Id);
                }
            });
        });
    vm.dtColumnsLecture = [];
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selectedLecture[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selectedLecture[' + full.Id + ']" ng-click="toggleOneLecture(selectedLecture, \'' + full.LectCode + '\')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('LectName').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs20">Tên bài giảng</span>').renderWith(function (data, type) {
        return '<span class="fs20">' + data + '</span>';
    }));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle(/*'{{"Tác vụ" | translate}}'*/'<span class="fs20">Tác vụ</span>').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editLecture(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="deleteLecture(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadDataLecture = reloadDataLecture;
    vm.dtInstanceLecture = {};
    function reloadDataLecture(resetPaging) {
        if (typeof vm.dtInstanceLecture.reloadData === 'function') {
            vm.dtInstanceLecture.reloadData(callback, resetPaging);
        }
    }
    function callbackLecture(json) {

    }
    function toggleAllLecture(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOneLecture(selectedItems, code) {
        for (var i = 0; i < selectedItems.length; i++) {
            selectedItems[i] = false;
        }
        if ($rootScope.LectureCode != code) {
            $rootScope.LectureCode = code;
        }
        else {
            $rootScope.LectureCode = '';
        }
        $scope.reload();
    }
    $scope.reloadLecture = function () {
        reloadDataLecture(true);
    };
    $scope.reloadNoResetPageLecture = function () {
        reloadDataLecture(false);
    };
    $scope.searchLecture = function () {
        reloadDataLecture(true);
    };
    $rootScope.reloadLecture = function () {
        $scope.reloadLecture();
    };
    // quiz
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsQuiz = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsDashBoard/JTableQuiz",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.LectureCode = $rootScope.LectureCode;
                d.SubjectCode = $rootScope.SubjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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

    vm.dtColumnsQuiz = [];
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('Code').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs20">Mã câu hỏi</span>').renderWith(function (data, type) {
        return '<span class="fs20">' + data + '</span>';
    }).withOption('sClass', 'wpercent10'));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('Content').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs20">Nội dung câu hỏi</span>').renderWith(function (data, type) {
        return '<span class="fs20">' + data + '</span>';
    }).withOption('sClass', ''));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle(/*'{{"Tác vụ" | translate}}'*/'<span class="fs20">Tác vụ</span>').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editQuiz(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="deleteQuiz(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstanceQuiz = {};
    function reloadData(resetPaging) {
        if (typeof vm.dtInstanceQuiz.reloadData === 'function') {
            vm.dtInstanceQuiz.reloadData(callback, resetPaging);
        }
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
    };
    $rootScope.reloadQuiz = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.addLecture = function () {
        if ($rootScope.SubjectCode != null && $rootScope.SubjectCode != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCrawlerMenu + '/add-lecture.html',
                controller: 'addLecture',
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
            }, function () {
            });
        }
        else {
            App.toastrError(caption.CRAWL_SUBJECT_NOT_CREATE); //caption.COM_MSG_NO_SUBJECT
        }
    };
    $scope.editLecture = function (id) {
        dataserviceLms.getItemLecture(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCrawlerMenu + '/add-lecture.html',
                controller: 'editLecture',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
            }, function () {
            });
        });
    };
    $scope.deleteLecture = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceLms.deleteLecture(id, function (result) {
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
            $scope.reloadLecture();
        }, function () {
        });
    };
    $scope.addQuiz = function () {
        if (($rootScope.LectureCode != null && $rootScope.LectureCode != '') || ($rootScope.SubjectCode != null && $rootScope.SubjectCode != '')) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCrawlerMenu + '/add-quiz.html',
                controller: 'addQuiz',
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
                $rootScope.idQuiz = -1;
            }, function () {
            });
        }
        else {
            App.toastrError(caption.CRAWL_NO_LECTURE_SELECT); //caption.COM_MSG_NO_LECTURE
        }
    };
    $scope.editQuiz = function (id) {
        dataserviceLms.getItemQuiz(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCrawlerMenu + '/add-quiz.html',
                controller: 'editQuiz',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
                $rootScope.idQuiz = -1;
            }, function () {
            });
        });
    };
    $scope.deleteQuiz = function (id) {
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
            $scope.reloadLecture();
        }, function () {
        });
    };
    $scope.showVideo = function () {
        $rootScope.video = $scope.model.VideoPresent;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCrawlerMenu + '/show-video.html',
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
});
app.controller('editSubject', function ($scope, $rootScope, $controller, dataserviceLms) {
    $controller('addSubject', { $scope: $scope });
    $scope.initData = function () {
        dataserviceLms.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
        var url_string = window.location.href;
        var url = new URL(url_string);

        var id = url.searchParams.get("id");
        dataserviceLms.getItem(id, function (rs) {
            rs = rs.data;
            if (rs === undefined || rs === null || rs === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                $scope.model = rs;
                $rootScope.SubjectCode = $scope.model.SubjectCode;
                $scope.model1.ListUser = $scope.model.Teacher.split(",");
                $scope.ImageCover = $scope.model.ImageCover != null && $scope.model.ImageCover != '' ? $scope.model.ImageCover.split('/').pop() : '';
                $scope.FileBase = $scope.model.FileBase != null && $scope.model.FileBase != '' ? $scope.model.FileBase.split('/').pop() : '';
                $rootScope.reloadLecture();
                $rootScope.reloadQuiz();
                setTimeout(function () {
                    CKEDITOR.instances['ckEditorItemSubject'].setData($scope.model.SubjectDescription);
                }, 1000);
            }
        });
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemSubject'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemSubject'].getData();
            $scope.model.SubjectDescription = data;
        }
        $scope.model.Teacher = $scope.model1.ListUser.join(',');
        if (/*$scope.addform.validate() && !validationSelect($scope.model).Status*/true) {
            dataserviceLms.updateSubject($scope.model, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.SubjectCode = $scope.model.SubjectCode;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };
    $scope.initData();
});

app.controller('addLecture', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceLms) {
    $rootScope.modelLecture = {
        LectCode: /*generateUUID()*/'',
        LectName: '',
        LectDescription: '',
        Duration: '',
        Unit: '',
        VideoPresent: '',
        SubjectCode: $rootScope.SubjectCode,
    }
    $scope.header = caption.CRAWL_ADD_NEW_LECTURE;
    $rootScope.checkLectCode = function () {
        if ($rootScope.modelLecture.LectCode == null || $rootScope.modelLecture.LectCode == '') {
            App.toastrError(caption.CRAWL_LESSON_NOT_CREATED); //caption.COM_MSG_NO_LECT_CODE
        }
    }

    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemLecture'].destroy();
        }
        $uibModalInstance.close();
    }

    $scope.initData = function () {
        $rootScope.ObjectTypeFile = "LMS_LECTURE";
        $rootScope.moduleName = "LECTURE";
    };
    $scope.initData();

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemLecture'].getData();
            $rootScope.modelLecture.LectDescription = data;
        }
        dataserviceLms.insertLecture($rootScope.modelLecture, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                App.toastrSuccess(rs.Title);
                $rootScope.LectCode = $rootScope.modelLecture.LectCode;
                $rootScope.ObjCode = $rootScope.LectCode;
            }
            else {
                App.toastrError(rs.Title);
            }
        });
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        //if (data.Type == 'ANSWER') {
        //    if (data.QuestionCode == "" || data.QuestionCode == null || data.QuestionCode == undefined) {
        //        $scope.errorQuestion = true;
        //        mess.Status = true;
        //    } else {
        //        $scope.errorQuestion = false;
        //    }
        //}

        //if (data.Type == "" || data.Type == null || data.Type == undefined) {
        //    $scope.errorType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorType = false;
        //}

        return mess;
    }

    function ckEditer() {
        var editor1 = CKEDITOR.replace('ckEditorItemLecture', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    setTimeout(function () {
        ckEditer();
    }, 500);
});
app.controller('editLecture', function ($scope, $rootScope, $controller, $compile, $uibModal, $uibModalInstance, dataserviceLms, para) {
    $controller('addLecture', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.header = "CRAWL_EDIT_LECTURE";
    $scope.initData = function () {
        $rootScope.ObjectTypeFile = "LMS_LECTURE";
        $rootScope.moduleName = "LECTURE";
        $rootScope.modelLecture = para;
        $rootScope.LectCode = $rootScope.modelLecture.LectCode;
        $rootScope.ObjCode = $rootScope.LectCode;
        setTimeout(function () {
            CKEDITOR.instances['ckEditorItemLecture'].setData($rootScope.modelLecture.LectDescription);
        }, 1000);
    }
    $scope.initData();
    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemLecture'].destroy();
        }
        $rootScope.LectCode = '';
        $rootScope.ObjCode = '';
        $uibModalInstance.close();
    }

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemLecture'].getData();
            $rootScope.modelLecture.LectDescription = data;
        }
        dataserviceLms.updateLecture($rootScope.modelLecture, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                App.toastrSuccess(rs.Title);
                $rootScope.LectCode = $rootScope.modelLecture.LectCode;
            }
            else {
                App.toastrError(rs.Title);
            }
        });
    };
});
app.controller('addQuiz', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceLms) {
    $scope.model = {
        Code: '',
        Title: '',
        Content: '',
        JsonData: '',
        Lecture: '',
        Level: '',
        LectureCode: $rootScope.LectureCode,
        SubjectCode: $rootScope.SubjectCode
    }
    $scope.listTypeQuiz = [
        {
            Code: "QUIZ_SING_CH",
            Name: caption.CRAWL_QUESTION_ONE_ANSWER
        }, {
            Code: "QUIZ_MUL_CH",
            Name: caption.CRAWL_QUESTION_MULTIPLE_ANSWER
        }, /*{
            Code: "IMAGE",
            Name: "Hình ảnh"
        },*/];
    $scope.IsAnswer = false;
    $rootScope.listAnswer = [];
    $rootScope.listReference = [];
    $rootScope.idQuiz = -1;

    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItem'].destroy();
        }
        var check = CKEDITOR.instances['ckEditorItemAnswer'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemAnswer'].destroy();
        }
        $rootScope.JsonData = '';
        $rootScope.JsonRef = '';
        $uibModalInstance.close();
        $rootScope.idQuiz = -1;
    }

    $scope.initData = function () {
        dataserviceLms.getListLecture($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $rootScope.listLecture = rs;
        });
    };
    $scope.initData();

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        if (/*$scope.addform.validate() && */!validationSelect($scope.model).Status) {
            if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                return App.toastrError(caption.CRAWL_ENTER_QUESTION_TEXT);
            }
            $scope.model.JsonData = $rootScope.JsonData;
            dataserviceLms.insertQuiz($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.idQuiz = rs.ID;
                }
            });
        }
    };

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

        //if (data.Type == "" || data.Type == null || data.Type == undefined) {
        //    $scope.errorType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorType = false;
        //}

        return mess;
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
app.controller('editQuiz', function ($scope, $rootScope, $controller, $compile, $uibModal, $uibModalInstance, dataserviceLms, para) {
    $controller('addQuiz', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.header = caption.CRAWL_EDIT_LECTURE;
    $scope.initData = function () {
        $scope.model = para;
        dataserviceLms.getListLecture($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $rootScope.listLecture = rs;
        });
        $rootScope.idQuiz = $scope.model.Id;
        if ($scope.model.JsonData != null && $scope.model.JsonData != '') {
            $rootScope.listAnswer = JSON.parse($scope.model.JsonData);
        }
        else {
            $rootScope.listAnswer = [];
        }
        if ($scope.model.JsonRef != null && $scope.model.JsonRef != '') {
            $rootScope.listReference = JSON.parse($scope.model.JsonRef);
        }
        else {
            $rootScope.listReference = [];
        }
        setTimeout(function () {
            CKEDITOR.instances['ckEditorItem'].setData($scope.model.Content);
        }, 1000);
    }
    $scope.initData();

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        if (/*$scope.addform.validate() && !validationSelect($scope.model).Status*/true) {
            if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                return App.toastrError(caption.CRAWL_ENTER_QUESTION_TEXT);
            }
            $scope.model.JsonData = $rootScope.JsonData;

            dataserviceLms.updateQuiz($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$rootScope.idLecture = rs.ID;
                }
            });
        }
    };
});


app.controller('manageAnswer', function ($scope, $rootScope, $compile, dataserviceLms, $uibModal, Upload) {
    $scope.modelAnswer = { Type: "TEXT" };
    $scope.modelAnswer.IsAnswer = false;
    $scope.listAnswerType = [
        {
            Code: "TEXT",
            Name: caption.CRAWL_TEXT
        }, {
            Code: "VIDEO",
            Name: caption.CRAWL_VIDEO
        }, {
            Code: "IMAGE",
            Name: caption.CRAWL_IMAGE
        },];

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemAnswer'];
        if (check !== undefined && $scope.modelAnswer.Type == "TEXT") {
            var data = CKEDITOR.instances['ckEditorItemAnswer'].getData();
            $scope.modelAnswer.Answer = data;
        }
        if (/*!validationSelect($scope.model).Status*/true) {
            if ($scope.modelAnswer.Answer == '' || $scope.modelAnswer.Answer == null || $scope.modelAnswer.Answer == undefined) {
                return App.toastrError(caption.CRAWL_ENTER_CONTENT_ANSWER);
            }

            var obj = {
                Code: generateUUID(),
                Answer: $scope.modelAnswer.Answer,
                Type: $scope.modelAnswer.Type,
                ContentDecode: $scope.modelAnswer.Type != "FILE" ? decodeHTML($scope.modelAnswer.Answer) : $scope.modelAnswer.Answer.split('/').pop(),
                IsAnswer: $scope.modelAnswer.IsAnswer
            }

            var checkExit = $rootScope.listAnswer.find(function (element) {
                if (element.Answer == obj.Answer && element.ContentDecode == obj.ContentDecode) return true;
            });

            if (checkExit != '' && checkExit != null && checkExit != undefined) {
                return App.toastrError(caption.CRAWL_ERR_ANSWER_EXIST);
            }

            if ($rootScope.JsonData == '' || $rootScope.JsonData == null || $rootScope.JsonData == undefined) {
                $rootScope.listAnswer.push(obj);
            } else {
                $rootScope.listAnswer.splice(0);
                var listAnswer = JSON.parse($rootScope.JsonData);
                for (answer of listAnswer) {
                    $rootScope.listAnswer.push(answer);
                }
                if ($rootScope.listAnswer.length > 0)
                    $rootScope.listAnswer.push(obj);
            }

            $rootScope.JsonData = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: $rootScope.JsonData
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    //$scope.reloadQuestion();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };
    $scope.correctAnswer = function () {
        $scope.modelAnswer.IsAnswer = !$scope.modelAnswer.IsAnswer;
    }
    $scope.loadFileAnswer = function (event) {
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
            data.ModuleName = "LMS_ANSWER";
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
                    $scope.modelAnswer.Answer = result.Object;
                    $scope.FileAnswer = $scope.modelAnswer.Answer != null && $scope.modelAnswer.Answer != '' ? $scope.modelAnswer.Answer.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.deleteAnswer = function (data) {
        if ($rootScope.listAnswer.indexOf(data) == -1) {
            App.toastrError(caption.CRAWL_DELETE_FAIL)
        } else {
            $rootScope.listAnswer.splice($rootScope.listAnswer.indexOf(data), 1);

            $rootScope.JsonData = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: $rootScope.JsonData
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
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
        $scope.modelAnswer.Answer = '';
    }

    $scope.updateAnswer = function (code) {
        var item = $rootScope.listAnswer.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            item.IsAnswer = !item.IsAnswer;

            $rootScope.JsonData = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: $rootScope.JsonData
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
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

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.modelAnswer.Answer);
        }
    }
    function ckEditer() {
        var editor3 = CKEDITOR.replace('ckEditorItemAnswer', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ckEditorItemAnswer'].config.height = 80;
    }
    $scope.showVideo = function () {
        $rootScope.video = $scope.modelAnswer.Answer;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCrawlerMenu + '/show-video.html',
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

    setTimeout(function () {
        ckEditer();
    }, 500);
});
app.controller('manageReference', function ($scope, $rootScope, $sce, $compile, dataserviceLms, dataserviceCmsItem, $uibModal, Upload) {
    $scope.modelRef = { Type: "CMS" };
    $scope.listRefType = [
        {
            Code: "CMS",
            Name: caption.CRAWL_TYPE_POST
        }, {
            Code: "VOICE",
            Name: caption.CRAWL_TYPE_VOICE
        }, {
            Code: "VIDEO",
            Name: caption.CRAWL_TYPE_VIDEO
        }, {
            Code: "IMAGE",
            Name: caption.CRAWL_TYPE_IMAGE
        },];
    $scope.init = function () {
        dataserviceLms.getCurrentUserFullName(function (rs) {
            rs = rs.data;
            $scope.userName = rs;
        });
        dataserviceLms.getListCmsItem(function (rs) {
            rs = rs.data;
            $scope.listCmsQuiz = rs;
        });
    }
    $scope.init();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCms'];
        if (check !== undefined && $scope.modelRef.Type == "CMS") {
            var data = CKEDITOR.instances['ckEditorItemCms'].getData();
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
                        }
                    });
                }
            }
            else {
                $scope.addReference();
            }
        }
    };
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
            App.toastrError(caption.CRAWL_ERR_WRONG_FORMAT_AUDIO); //caption.COM_MSG_FORMAT_IMAGE
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
            App.toastrError(caption.CRAWL_DELETE_FAIL)
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

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.modelRef.Link);
        }
    }
    function ckEditer() {
        var editor3 = CKEDITOR.replace('ckEditorItemCms', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ckEditorItemCms'].config.height = 80;
    }
    $scope.viewReference = function (link, type) {
        if (type == "VIDEO") {
            $scope.showVideo(link);
        }
        if (type == "VOICE") {
            $scope.playAudio(link);
        }
        if (type == "IMAGE") {
            $scope.viewImage(link);
        }
        if (type == "CMS") {
            $scope.viewCms(link);
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCrawlerMenu + '/show-video.html',
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
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCrawlerMenu + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
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
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCrawlerMenu + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
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
    $scope.viewCms = function (link) {
        dataserviceLms.getItemCms(link, function (rs) {
            rs = rs.data;
            $rootScope.cmsContent = $sce.trustAsHtml(rs.full_text);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCrawlerMenu + '/view-cms.html',
                controller: function ($scope, $uibModalInstance, $sce) {
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
