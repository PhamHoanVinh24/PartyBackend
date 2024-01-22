var ctxfolder = "/views/admin/reportSocial";
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
                        debugger
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
        getSessionlog: function (data, callback) {
            $http.post('/Admin/ReportSocial/BotSocialogResults?code=' + data).then(callback);
        },
        getsumcrawler: function (callback) {
            $http.get('/Admin/ReportSummary/AmChartCrawlerRunningLog').then(callback);
        },
        getListBotcode: function (callback) {
            $http.post('/Admin/ReportSocial/GetListSocial').then(callback);
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
                    regx: caption.LMS_PRACTICE_TEST_MSG_TITLE_NO_SPACE
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
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/ReportSocial/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolder + '/index.html',
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
    $scope.selectedSummaryDomain = []
    $scope.initData = function () {
            dataservice.getListBotcode(function (rs) {
        rs = rs.data;
        $scope.listbotcode = rs;
    });
    };
    $scope.initData();
    $scope.Day = []
    $scope.captcharsum = []
    $scope.urlsum = []
    $scope.filesum = []
    $scope.timeScansum = []
    dataservice.getsumcrawler(function (rs) { 
        rs = rs.data;
        console.log(rs);
        Day = [];
        sumcaptchar = [];
        sumurl = [];
        sumfile = [];
        sumtime = [];
        for (var i = 0; i < rs.length; i++) {
            sumcaptchar.push(rs[i].SumPasscap);
            sumurl.push(rs[i].SumUrl);
            sumfile.push(rs[i].SumFile);
            sumtime.push(rs[i].SumTimeScan);
            Day.push(rs[i].Day+'-04-2022');
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
                name: "Time Scan",
                data: sumtime
            },
            {
                name: "Download File",
                data:sumfile
            },
            {
                name: "File Size",
                data: sumtime
            },
            {
                name: "Capchar Num",
                data: sumcaptchar
            }
            ],
            title: {
                text: 'Crawled Data by Time',
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
                    text: 'Day'
                }
            },
            yaxis: {
                title: {
                    text: 'Data'
                },
                min: 5,
                max: 400
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
   
    $scope.model = {
       Social:'',
    }
    $scope.Search = function () {
        dataservice.getSessionlog($scope.model.Social, function (rs) { // bot code is set to 1
            rs = rs.data;
            console.log(rs);
            $scope.capcharNum = rs[0].SumPassCap;
            $scope.urlNum = rs[0].SumUrl;
            $scope.fileNum = rs[0].SumFile;
            $scope.timeScan = rs[0].SumTimeScan;
            $scope.optionPieChart = {
                chart: {
                    height: 320,
                    type: 'pie',
                },
                series: [$scope.capcharNum, $scope.urlNum, $scope.fileNum, $scope.timeScan, $scope.urlNum],
                labels: ["Series 1", "Series 2", "Series 3", "Series 4", "Series 5"],
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
    }

    $scope.ListSummaryDomain = [
        { "id": '1', "label": 'Abarth' },
        { "id": '2', "label": 'Alfa Romeo' },
        { "id": '3', "label": 'Alpine' },
        { "id": '4', "label": 'Aston Martin' },
        { "id": '5', "label": 'Audi' },
        { "id": '6', "label": 'Bentley' },
        { "id": '7', "label": 'BMW' }];

    $scope.listdomain = [
        { Code: 'tailieu.vn', Name: 'Tailieu.vn' },
        { Code: '11', Name: 'baitap123.com' },
        { Code: '3', Name: 'quizz.vn' },
        { Code: '4', Name: 'vnDoc.com' }];
});


