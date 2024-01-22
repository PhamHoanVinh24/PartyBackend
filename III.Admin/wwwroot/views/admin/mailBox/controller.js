var ctxfolderMailBox = "/views/admin/mailBox";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_MAIL_BOX', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "pascalprecht.translate", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", 'dynamicNumber']).
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

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
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
                    return "vừa xong";
                } else {
                    return diffMins + ' ' + "phút trước";
                }
            } else {
                return diffHrs + '  ' + "giờ" + diffMins + ' ' + "phút";
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});
app.factory('myService', function () {
    var message = [];
    return {
        set: set,
        get: get
    }
    function set(mes) {
        message.push(mes)
    }
    function get() {
        DataMess = message;
        message = [];
        return DataMess;

    }
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
    var submitFormUploadFile = function (url, data, callback) {
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
            data: data
        }
        $http(req).then(callback);
    };
    return {
        jTableMail: function (data, data1, data2, data3, data4, data5, data6, callback) {
            $http.post("/Admin/MailBox/JTableMail?page=" + data + "&length=" + data1 + "&type=" + data2 + "&user=" + data3 + "&pass=" + data4 + "&IP=" + data5 + "&Port=" + data6).then(callback);
        },
        insertMailCf: function (data, callback) {
            $http.post("/Admin/MailBox/Insert", data).then(callback);
        },
        sendMail: function (data, data1, data2, data3, data4, data5, data6, data7, callback) {
            $http.post("/Admin/MailBox/SendMail?From=" + data + "&To=" + data1 + "&header=" + data2 + "&content=" + data3 + "&attachment=" + data4 + "&password=" + data5 + "&smtpip=" + data6 + "&smtpport=" + data7).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/MailBox/GetItem?settingid=' + data).then(callback);
        },
        /* string From, string To, string header, string content, string attachment, string password, string smtpip, int smtpport*/
        getSendItem: function (data, callback) {
            $http.get('/Admin/MailBox/GetSendItem?id=' + data).then(callback);
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/MailBox/UploadFile/', data, callback);
        },
    }
});

app.controller('Ctrl_ESEIM_MAIL_BOX', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            //if (!partternName.test(data.Title)) {
            //    mess.Status = true;
            //    mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            //}
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true
                },
                AllocateTime: {
                    required: true
                },
                LocationAllocate: {
                    required: true
                }
            },
            messages: {
                Title: {
                    required: caption.ASSET_ALLO_VALIDATE_NO_EMPTY.replace("{0}", caption.ASSET_ALLO_LBL_TITLE),//"Tiêu đề phiếu không được bỏ trống",
                    maxlength: caption.ASSET_ALLO_VALIDATE_NO_LONG.replace("{0}", caption.ASSET_ALLO_LBL_TITLE),//"Tiêu đề phiếu không vượt quá 255 ký tự",
                },
                AllocateTime: {
                    required: "Thời gian cấp phát không được bỏ trống"
                },
                LocationAllocate: {
                    required: "Địa điểm không được để trống"
                }
            }
        }
        $rootScope.validationOptionsFile = {
            rules: {
                Name: {
                    required: true
                }
            },
            messages: {
                Name: {
                    required: caption.ASSET_ALLO_VALIDATE_NO_EMPTY.replace("{0}", caption.ASSET_ALLO_LBL_FILE_NAME),
                }
            }
        }
        $rootScope.validationOptionsAssetAttribute = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
            },
            messages: {
                Quantity: {
                    required: caption.ASSET_ALLO_VALIDATE_NO_EMPTY.replace("{0}", caption.ASSET_ALLO_LBL_QUANTITY),//"Số lượng yêu cầu bắt buộc",
                    regx: caption.ASSET_ALLO_VALIDATE_LBL_QUANTITY,// "Số lượng không nhỏ hơn 0"
                }
            }
        };
        $rootScope.validationOptionsResultAct = {
            rules: {
                //Value: {
                //    required: true
                //}
            },
            messages: {
                //Value: {
                //    required: caption.ASSET_ALLO_VALIDATE_NO_EMPTY.replace("{0}", caption.ASSET_ALLO_LBL_VL),//"Giá trị bắt buộc"
                //}
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetAllocation/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMailBox + '/index.html',
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

app.controller('index', function ($scope, myService, $rootScope, $sce, $location, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $timeout) {
    $scope.currentPage = 1;

    $scope.length = 50;

    $scope.type = "INBOX";

    $scope.listMail = true;
    $scope.userName = "huynguyen104798@gmail.com";
    $scope.password = "Anhhuyc3";
    $scope.POP3port = 995;
    $scope.POP3ip = "outlook.office365.com";
    $scope.SMTPip = "smtp.office365.com";
    $scope.SMTPport = 587;
    $scope.initData = function () {
        $scope.datarecive = myService.get()[0];
        console.log($scope.datarecive2);
        if (!$scope.datarecive) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.jTableMail($scope.currentPage, $scope.length, $scope.type, $scope.userName, $scope.password, $scope.POP3ip, $scope.POP3port, function (rs) {
                App.unblockUI("#contentMain");
                rs = rs.data;
                $scope.sumPage = rs.SumPage;
                $scope.totalMail = rs.TotalMail;
                $scope.listEmail = rs.Emails;
                if ($scope.totalMail < $scope.length) {
                    $scope.countViewMail = $scope.totalMail;
                }
                else {
                    $scope.countViewMail = $scope.length;
                }
            })
        }
        else {

            $scope.userName = $scope.datarecive.Email;
            $scope.password = $scope.datarecive.Password;
            $scope.POP3ip = $scope.datarecive.POP3Server;
            $scope.POP3port = $scope.datarecive.POP3Port;
            $scope.SMTPip = $scope.datarecive.SMTPServer;
            $scope.SMTPport = $scope.datarecive.SMTPPort;
            dataservice.jTableMail($scope.currentPage, $scope.length, $scope.type, $scope.userName, $scope.password, $scope.POP3ip, $scope.POP3port, function (rs) {
                rs = rs.data;
                $scope.sumPage = rs.SumPage;
                $scope.totalMail = rs.TotalMail;
                $scope.listEmail = rs.Emails;
                if ($scope.totalMail < $scope.length) {
                    $scope.countViewMail = $scope.totalMail;
                }
                else {
                    $scope.countViewMail = $scope.length;
                }
            })
        }

    }

    $scope.initData();

    $scope.viewContentMail = function (content) {
        debugger
        $scope.listMail = false;
        $('#mail-content').html(content);
    }

    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    $scope.MailSelected = [];
    $scope.cvLink = 'https://tuyendung.topcv.vn/app/cvs-management/cvs/13449234?share-token=eyJ0b2tlbl9uYW1lIjoiZW1wbG95ZXJfY3ZfbWFuYWdlbWVudF90b2tlbiIsImV4cGlyZWRfYXQiOiIyMDIyLTExLTA3IDA4OjQ1OjUyIn0.eyJlbXBsb3llcl9pZCI6OTQxMywiY3ZfcmVjb3JkX2lkIjoxMzQ0OTIzNCwicm9sZV9uYW1lIjoiYW5vbnltb3VzIn0.1d7d27e499954adadbe511101a3ffb8b&ref=mail';
    $scope.selectCheck = function (text) {
        var UUID = create_UUID().toString();
        $scope.data = {
            MailCode: UUID,
            MailContent: text,
        }
        $scope.MailSelected.push(UUID);
        console.log($scope.data)
        //dataservice insrt DB

    }
    $scope.changeTypeMail = function (type) {
        debugger
        $scope.listMail = true;
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.jTableMail($scope.currentPage, $scope.length, type, $scope.userName, $scope.password, function (rs) {
            rs = rs.data;
            $scope.sumPage = rs.SumPage;
            $scope.totalMail = rs.TotalMail;
            $scope.listEmail = rs.Emails;

            if ($scope.totalMail < $scope.length) {
                $scope.countViewMail = $scope.totalMail;
            }
            else {
                $scope.countViewMail = $scope.length;
            }
            App.unblockUI("#contentMain");
        })
    }


    $scope.configEvent = function () {
        //$rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMailBox + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.userName;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        },
            function () {
            });
    }

    $scope.SendEvent = function () {
        $scope.Dataserver = {

            Username: $scope.userName,
            Password: $scope.password,
            SMTPServer: $scope.SMTPip,
            SMTPPort: $scope.SMTPport,
        }
        var modalInstance = $uibModal.open({

            animation: true,
            templateUrl: ctxfolderMailBox + '/compose.html',
            controller: 'send',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.Dataserver;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        },
            function () {
            });
    }
});

app.controller('add', function ($scope, $rootScope, myService, $route, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.MailCheckJt = para;
    console.log($scope.MailCheckJt)
    /*$scope.products = productService.getProducts();
    console.log($scope.products)*/
    $scope.model = {
        Email: '',
        Password: '',
        SMTPServer: '',
        SMTPPort: '',
        POP3Server: '',
        POP3Port: '',
    };
    $scope.sendData = {
        Email: '',
        Password: '',
        SMTPServer: '',
        SMTPPort: '',
        POP3Server: '',
        POP3Port: '',
    }


    $scope.changeAccountMail = changeAccountMail; // số 1
    function changeAccountMail(settingID) {  // số 2  
        // 1. cancel popup
        $scope.listdataMail = '';
        $scope.cancel();
        dataservice.getItem(settingID, function (rs) {
            rs = rs.data;
            $scope.listdataMail = rs.Object[0];
            console.log($scope.listdataMail);

            $scope.sendData.SMTPPort = $scope.listdataMail.POP3Port;
            $scope.sendData.SMTPServer = $scope.listdataMail.POP3Server;
            $scope.sendData.POP3Port = $scope.listdataMail.POP3Port;
            $scope.sendData.POP3Server = $scope.listdataMail.POP3Server;
            $scope.sendData.Email = $scope.listdataMail.Email;//"tuyendung@3i.com.vn";
            $scope.sendData.Password = $scope.listdataMail.Password; // "Vietnam3i";
            console.log($scope.sendData);
            myService.set($scope.sendData);
            console.log(myService);
            $route.reload()

        })
    }

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MailBox/JTable1",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                /*d.AttrGroup = $scope.modelAttr.AttrGroup;*/
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(500, "#tblDataSubject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'asc'])
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
                    var Id = data.Code;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle('').withOption('sClass', 'nowrap w50').notSortable()
        .renderWith(function (data, type, full, meta) {
            // Id not id
            $scope.selected[full.SettingID] = false;
            $scope.EmailData = full;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="changeAccountMail(' + full.SettingID + ')" /*ng-click="toggleOne(selected)"*//><span></span></label>  <!-- <a title="Edit" ng-click="edit(' + full.Id + ')" style="width: 25px; height: 25px; padding-right: 10px; class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a> <a title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a> -->';

        }).withOption('sWidth', '30px').withOption('sClass',));
    /*vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"Mail Address"|translate}}').withOption('sWidth', '30px hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('POP3Server').withTitle('{{"Server Pop3"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SMTPServer').withTitle('{{"Server Stmp"|translate}}').withOption('sWidth', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"Status" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        if (data == $scope.MailCheckJt) {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span class="cursor fa fa-circle-o text-danger fs20 pTip-right btn-publish-inline"></span> '
        }
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.SettingID + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" clas1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    function toggleOne(selectedItems) { //giu ID
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
    //$scope.openTab = function () {
    //    $scope.Url = 'www.google.com';
    //}
    $rootScope.validationOptions = {
        rules: {
            Email: {
                required: true
            },
            Password: {
                required: true
            },
            SMTPServer: {
                required: true
            },
            SMTPPort: {
                required: true
            },
            POP3Server: {
                required: true
            },
            POP3Port: {
                required: true
            },
        },
        messages: {
            Email: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            Password: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
            POP3Server: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            POP3Port: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
            SMTPServer: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            SMTPPort: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
        }
    }
    $scope.DataInsert = {
        Group: 'EMAIL_SETTING',
        CodeSet: 'EMAIL_SETTING_' + create_UUID().toString(),
        Title: '',
        ValueSet: '',
    }
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    $scope.order = [
        { Code: 0, Name: 'FREE' },
        { Code: 1, Name: 'BUSY' }];

    $scope.submit = function () {
        console.log($scope.model)
        $scope.DataMailJson = JSON.stringify($scope.model);
        console.log($scope.DataMailJson)
        $scope.DataInsert.ValueSet = $scope.DataMailJson;


        console.log($scope.DataInsert);
        if ($rootScope.validationOptions) {
            // lấy giá trị từ ckeditor
            dataservice.insertMailCf($scope.DataInsert, function (rs) {
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
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }


});
app.controller('send', function ($scope, $rootScope, myService, $route, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {


    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MailBox/JTableSend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                /*d.AttrGroup = $scope.modelAttr.AttrGroup;*/
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(300, "#tblDataSubject");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'asc'])
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
                    var Id = data.Code;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').withOption('sClass', 'nowrap w50').notSortable()
        .renderWith(function (data, type, full, meta) {
            // Id not id
            $scope.selected[full.Id] = false;
            $scope.EmailData = full;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" " ng-click="toggleOne(selected)"/><span></span></label>  ';

        }).withOption('sWidth', '30px').withOption('sClass',));
    /*vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"Tên ứng viên"|translate}}').withOption('sWidth', '30px hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"Mail address"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('{{"Số điện thoại"|translate}}').withOption('sWidth', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('{{"Qrcode"|translate}}').withOption('sWidth', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    /*vm.dtColumns.push(DTColumnBuilder.newColumn('Pdf').withTitle('{{"CV File" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        if (data == $scope.MailCheckJt) {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span class="cursor fa fa-circle-o text-danger fs20 pTip-right btn-publish-inline"></span> '
        }
    }));*/

    /*vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.SettingID + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" clas1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }));*/

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
    function toggleOne(selectedItems) { //giu ID
        for (var id in selectedItems) {
            //$scope.model.UserTo = id
            dataservice.getSendItem(id, function (rs) {
                rs = rs.data;
                $scope.SendData1 = rs.Object[0];
                console.log($scope.SendData1);

                $scope.model.UserTo = $scope.SendData1.Email;
                //$scope.model.AttachFile = $scope.SendData1.QrCode;


            })
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
    //$scope.openTab = function () {
    //    $scope.Url = 'www.google.com';
    //}
    $rootScope.validationOptions = {
        rules: {
            Email: {
                required: true
            },
            Password: {
                required: true
            },
            SMTPServer: {
                required: true
            },
            SMTPPort: {
                required: true
            },
            POP3Server: {
                required: true
            },
            POP3Port: {
                required: true
            },
        },
        messages: {
            Email: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            Password: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
            POP3Server: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            POP3Port: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
            SMTPServer: {
                //required: "Tên danh mục không được bỏ trống",
                required: "Không thiếu Id",
            },
            SMTPPort: {
                //required: "Alias không được bỏ trống",
                KeyWord: "Không để trống KeyWord",
            },
        }
    }
    $scope.DataInsert = {
        Group: 'EMAIL_SETTING',
        CodeSet: 'EMAIL_SETTING_' + create_UUID().toString(),
        Title: '',
        ValueSet: '',
    }
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    $scope.order = [
        { Code: 0, Name: 'FREE' },
        { Code: 1, Name: 'BUSY' }];
    /*$scope.SendMail = function () {
        $scope.from = 'tuyendung@3i.com.vn';
        $scope.to = 'huynguyen104798@gmail.com';
        $scope.header = "HelloWorld!";
        $scope.content = "Xin chào các bạn! 0830PM";
        $scope.attachment = '';
        dataservice.sendMail($scope.from, $scope.to, $scope.header, $scope.content, function () {

            rs = rs.data;
            if (!rs.Error) {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
            else {
                App.toastrError(rs.Title);
            }
        })
    }*/

    $scope.DataServer = para;
    console.log($scope.DataServer)
    $scope.model = {
        UserFrom: '',
        PassFrom: '',
        UserTo: '',
        AttachFile: '',
        Header: '',
        Content: '',
        SMTPPort: '',
        SMTPServer: '',
        Name: '',
    }
    $scope.initData = function () {
        $scope.model.UserFrom = $scope.DataServer.Username;
        $scope.model.PassFrom = $scope.DataServer.Password;
        $scope.model.SMTPServer = $scope.DataServer.SMTPServer;
        $scope.model.SMTPPort = $scope.DataServer.SMTPPort;
    }
    $scope.initData();

    $scope.attachment = function () {


    }

    $scope.submit = function () {
        var f = document.getElementById('file').files[0],
            r = new FileReader();
        console.log(f);
        var file = f;
        if (file != undefined) {
            var size = file.size;;
            var data = new FormData();
            data.append("FileUpload", file);
            data.append("ActivityCode", $scope.model.ActivityCode)
            dataservice.uploadAttachment(data, function (rs) {
                rs = rs.data;
                $scope.Path = rs.Object;
                $scope.model.AttachFile = $scope.Path;
                dataservice.sendMail($scope.model.UserFrom, $scope.model.UserTo, $scope.model.Header, $scope.model.Content, $scope.model.AttachFile, $scope.model.PassFrom, $scope.model.SMTPServer, $scope.model.SMTPPort, function () {

                    rs = rs.data;
                    if (!rs.Error) {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    else {
                        App.toastrError(rs.Title);
                    }
                })
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    return;
                }
            });
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});


