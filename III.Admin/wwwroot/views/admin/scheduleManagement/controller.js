var ctxfolder = "/views/admin/scheduleManagement";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderMessage = "/views/message-box";


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
        
        insert: function (data, callback) {
            $http.post('/Admin/ScheduleManagement/Insert', data).then(callback);
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/ScheduleManagement/UpdateAll/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ScheduleManagement/Delete?id=' + data).then(callback);
        },
        getListBotcode: function (callback) {
            $http.post('/Admin/ScheduleManagement/GetListDomain').then(callback);
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
                    required: "Thời gian check in không được bỏ trống"
                },
                ChkoutTime: {
                    required: "Thời gian check out không được bỏ trống"
                },
                ChkinLocationTxt: {
                    required: "Địa điểm check in không được bỏ trống"
                },
                ChkoutLocationTxt: {
                    required: "Địa điểm check out không được bỏ trống"
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
    $translateProvider.useUrlLoader('/Admin/ScheduleManagement/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolder + '/index-course.html',
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
    $scope.model = {
        Url: '',
        DownloadFile: '',
        KeyWord: '',
        DataStorage: '',
        DomainId: '',
    };
    dataservice.getListBotcode(function (rs) {
        rs = rs.data;
        $scope.listbotcode = rs;
    });
    $scope.initData = function () {

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
    $scope.listPublished = [
        { code: '', name: 'Tất cả' },
        {
            code: false,
            name: "Đã tải"
        }, {
            code: true,
            name: "Chưa tải"
        }
    ];

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ScheduleManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMainSubjectManage",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.DataStorage = $scope.model.DataStorage;

            },
            complete: function () {
                App.unblockUI("#contentMainSubjectManage");
                heightTableAuto();
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
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"ID" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
    //    return data;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('JobScCode').withTitle('{{"SCHEDULE_BOT_TITLE" | translate}}').withOption('sClass', 'nowrap w300 first-col-sticky').renderWith(function (data, type,full) {
        return '<span ng-click="edit(' + full.Id + ')" class="bold text-underline" style="color:#ab7474">' + '#' + full.Id + ':</span>' + '<strong ng-click="edit(' + full.Id + ')"> '+ full.JobScTitle + '</strong>'
            + '<div class="fs9">'+data+'</div>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('JobScType').withTitle('{{"SCHEDULE_BOT_TYPE" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        if (data == 1) {
            return 'Daily';
        }
        else if (data == 2) {
            return 'Weekly';
        }
        else {
            return "Monthly";
        }
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('JobScTitle').withTitle('{{"Job Sc Title" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
    //    return data;/* URL_LIST_TXT_DOMAIN_NAME*/
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('JobScRunTime').withTitle('{{"SCHEDULE_BOT_RUNTIME" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type, full) {
        return '<span ng-click="detail(' + full.Id + ')" >' + data + '</span>'
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('BotCode').withTitle('{{"SCHEDULE_BOT_DOMAIN" | translate}}').withOption('sClass', 'nowrap w300').renderWith(function (data, type) {
        return data;
    }));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'dataTable-w80 nowrap').withTitle('{{"SCHEDULE_BOT_OPERATION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<a title="Edit" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a> <a title="Delete" ng-click="delete(' + full.Id + ')" class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>'; //+
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();

        }, function () {
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
            templateUrl: ctxfolder+ '/edit.html',
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
    $scope.detail = function (id) {
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
            templateUrl: ctxfolder + '/detailjobscruntime.html',
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
    $scope.search = function () {
        reloadData(true);
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

app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        Id:para.Id,
        JobScType: para.JobScType,
        JobScCode: para.JobScCode,
        JobScDesc: para.JobScDesc,
        JobScTitle: para.JobScTitle,
        JobScRunTime: para.JobScRunTime,
        BotCode: para.BotCode,
        Date: '',
        hour: '',
        minute: '',
        second: '',
        weekdate: '',
    };
    $scope.ListType = [
        { Code: '1', Name: 'Daily' },
        { Code: '2', Name: 'Weekly' },
        { Code: '3', Name: 'Monthly' }];
    $scope.ListDate = [
        {
            Code: "Monday",
            Name: 'Monday'
        }, {
            Code: "Tuesday",
            Name: 'Tuesday'
        },
        {
            Code: "Wednesday",
            Name: 'Wednesday'
        },
        {
            Code: "Thursday",
            Name: 'Thursday'
        }, {
            Code: "Friday",
            Name: 'Friday'
        },
        {
            Code: "Saturday",
            Name: 'Saturday'
        }, {
            Code: "Sunday",
            Name: 'Sunday'
        },
    ];
    $scope.isShowMonth = false;
    $scope.isShowWeek = false;
    $scope.isShowDay = false;
    $scope.showType = function () {
        if ($scope.model.JobScType == "2") {
            $rootScope.listDetail = [];
            $scope.isShowWeek = true;
            $scope.isShowMonth = false;
            $scope.isShowDay = false;
        } else if ($scope.model.JobScType == "3") {
            $rootScope.listDetail = [];
            $scope.isShowMonth = true;
            $scope.isShowWeek = false;
            $scope.isShowDay = false;
        } else {
            $rootScope.listDetail = [];
            $scope.isShowMonth = false;
            $scope.isShowWeek = false;
            $scope.isShowDay = true;
        }

    }
    dataservice.getListBotcode(function (rs) {
        rs = rs.data;
        $scope.listbotcode = rs;
    });
    $scope.init = function () {

        if ($scope.model.JobScRunTime != null && $scope.model.JobScRunTime != '') {
            $rootScope.listDetail = JSON.parse($scope.model.JobScRunTime);
        }
        else {
            $rootScope.listDetail = [];
        }
        if ($scope.model.JobScType == "2") {
            $scope.isShowWeek = true;
            $scope.isShowMonth = false;
            $scope.isShowDay = false;
        } else if ($scope.model.JobScType == "3") {
            $scope.isShowMonth = true;
            $scope.isShowWeek = false;
            $scope.isShowDay = false;
        } else {
            $scope.isShowMonth = false;
            $scope.isShowWeek = false;
            $scope.isShowDay = true;
        }

    }
    $scope.init();
    $scope.addchedule = function () {

        if ($scope.model.JobScType != null) {
            if ($scope.model.JobScType == 3) {

                var obj = {
                    Id: generateUUID(),
                    Date: $scope.model.Date,
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.Date == obj.Date && element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }
                if ($scope.model.Date == '' || $scope.model.Date == undefined) {
                    return App.toastrError('Vui lòng nhập ngày'); // LMS_SUBJECT_CODE_EXIST
                }
            }
            if ($scope.model.JobScType == 2) {
                var obj = {
                    Id: generateUUID(),
                    weekdate: $scope.model.weekdate,
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.weekdate == obj.weekdate && element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }
                if ($scope.model.weekdate == '' || $scope.model.weekdate == undefined) {
                    return App.toastrError('Vui lòng chọn thứ'); // LMS_SUBJECT_CODE_EXIST
                }
            }
            if ($scope.model.JobScType == 1) {
                var obj = {
                    Id: generateUUID(),
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }

            }
            if ($scope.model.hour == '' || $scope.model.hour == undefined) {
                return App.toastrError('Vui lòng nhập giờ'); // LMS_SUBJECT_CODE_EXIST
            }
            if ($scope.model.minute == '' || $scope.model.minute == undefined) {
                return App.toastrError('Vui lòng nhập phút'); // LMS_SUBJECT_CODE_EXIST
            }
            if ($scope.model.second == '' || $scope.model.second == undefined) {
                return App.toastrError('Vui lòng nhập giây'); // LMS_SUBJECT_CODE_EXIST
            }
            $rootScope.listDetail.push(obj);

            var jsonData = JSON.stringify($rootScope.listDetail);
            $scope.model.JobScRunTime = jsonData;
            var scheduleData = {
                Id: $rootScope.Id,
                JobScRunTime: jsonData
            }


        }
    };
    $scope.deleteSchedule = function (data) {
        if ($rootScope.listDetail.indexOf(data) != -1) {
            App.toastrError(caption.COM_ERR_DELETE);
        } else {
            $rootScope.listDetail.splice($rootScope.listDetail.indexOf(data), 1);

            var jsonData = JSON.stringify($rootScope.listDetail);
            var scheduleData = {
                Id: $rootScope.Id,
                JobScRunTime: jsonData
            }

            dataservice.updateListSubject(scheduleData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };
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
   

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 500);
});
app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Type: '',
        JobScCode: '',
        JobScRunTime: '',
        JobSCTitle: '',
        JobScDesc:'',
        Date: '',
        hour: '',
        minute: '',
        second:'',
        weekdate: '',
        BotCode:'',
    };
    $scope.type = '';
    $scope.isShowMonth = false;
    $scope.isShowWeek = false;
    $scope.isShowDay = false;
    $scope.showType = function () {
        if ($scope.model.JobScType == "2") {
            $rootScope.listDetail = [];
            $scope.isShowWeek = true;
            $scope.isShowMonth = false;
            $scope.isShowDay = false;
        } else if ($scope.model.JobScType == "3") {
            $rootScope.listDetail = [];
            $scope.isShowMonth = true;
            $scope.isShowWeek = false;
            $scope.isShowDay = false;
        } else {
            $rootScope.listDetail = [];
            $scope.isShowMonth = false;
            $scope.isShowWeek = false;
            $scope.isShowDay = true;
            }

    }
    $scope.ListType = [
        { Code: '1', Name: 'Daily' },
        { Code: '2', Name: 'Weekly' },
        { Code: '3', Name: 'Monthly' }];
    $scope.ListDate = [
        {
            Code: "Monday",
            Name: 'Monday'
        }, {
            Code: "Tuesday",
            Name: 'Tuesday'
        },
        {
            Code: "Wednesday",
            Name: 'Wednesday'
        },
        {
            Code: "Thursday",
            Name: 'Thursday'
        }, {
            Code: "Friday",
            Name: 'Friday'
        },
        {
            Code: "Saturday",
            Name: 'Saturday'
        }, {
            Code: "Sunday",
            Name: 'Sunday'
        }, 
    ];
    
    $rootScope.listDetail = [];
    $scope.init = function () {
        dataservice.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }
    $scope.init();
    $rootScope.validationOptions = {
        rules: {
            CourseCode: {
                required: true
            },
            CourseName: {
                required: true
            },
        },
        messages: {
            CourseCode: {
                //required: "Tên danh mục không được bỏ trống",
                required: caption.CMS_CAT_VALIDATE_CATEGORY_NAME,
            },
            CourseName: {
                //required: "Alias không được bỏ trống",
                required: caption.CMS_CAT_VALIDATE_ALIAS,
            },
        }
    }
    Array.prototype.clear = function () {
        this.length = 0;
    }
    $scope.addchedule = function () {

        if ($scope.model.JobScType != null) {
            if ($scope.model.JobScType == 3) {

                var obj = {
                    Id: generateUUID(),
                    Date: $scope.model.Date,
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.Date == obj.Date && element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }
                if ($scope.model.Date == '' || $scope.model.Date == undefined) {
                    return App.toastrError('Vui lòng nhập ngày'); // LMS_SUBJECT_CODE_EXIST
                }
            }
            if ($scope.model.JobScType == 2) {
                var obj = {
                    Id: generateUUID(),
                    weekdate: $scope.model.weekdate,
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.weekdate == obj.weekdate && element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }
                if ($scope.model.weekdate == '' || $scope.model.weekdate == undefined) {
                    return App.toastrError('Vui lòng chọn thứ'); // LMS_SUBJECT_CODE_EXIST
                }
            }
            if ($scope.model.JobScType == 1) {
                var obj = {
                    Id: generateUUID(),
                    hour: $scope.model.hour,
                    minute: $scope.model.minute,
                    second: $scope.model.second,
                }

                var checkExit = $rootScope.listDetail.find(function (element) {
                    if (element.hour == obj.hour && element.minute == obj.minute && element.second == obj.second) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Lịch đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }

            }
            if ($scope.model.hour == '' || $scope.model.hour == undefined) {
                return App.toastrError('Vui lòng nhập giờ'); // LMS_SUBJECT_CODE_EXIST
            }
            if ($scope.model.minute == '' || $scope.model.minute == undefined) {
                return App.toastrError('Vui lòng nhập phút'); // LMS_SUBJECT_CODE_EXIST
            }
            if ($scope.model.second == '' || $scope.model.second == undefined) {
                return App.toastrError('Vui lòng nhập giây'); // LMS_SUBJECT_CODE_EXIST
            }
                $rootScope.listDetail.push(obj);

            var jsonData = JSON.stringify($rootScope.listDetail);
            $scope.model.JobScRunTime = jsonData;


        }
    };
    $scope.deleteSchedule = function (data) {
        if ($rootScope.listDetail.indexOf(data) != -1) {
            App.toastrError(caption.COM_ERR_DELETE);
        } else {
            $rootScope.listDetail.splice($rootScope.listDetail.indexOf(data), 1);

            var jsonData = JSON.stringify($rootScope.listDetail);
            var scheduleData = {
                Id: $rootScope.Id,
                JobScRunTime: jsonData
            }

            dataservice.updateListSubject(scheduleData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };
    $scope.submit = function () {    
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

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 500);
});



