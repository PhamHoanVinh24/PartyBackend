var ctxfolder = "/views/mobile/inOutApp/";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]).
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

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
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
        getBranAndDepartment: function (callback) {
            $http.get('/DepartmentApp/GetBranAndDepartment').then(callback)
        },
        
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                WorkFlowCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                WorkFlowCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsWF = {
            rules: {
                WfCode: {
                    required: true
                },
                WfName: {
                    required: true
                },
            },
            messages: {
                WfCode: {
                    required: "Mã luồng không được bỏ trống",
                },
                WfName: {
                    required: "Tên luồng không được bỏ trống",
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
                    required: "Mã thuộc tính không được bỏ trống"
                },
                DtTitle: {
                    required: "Tên thuộc tính không được bỏ trống",
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/WorkflowActivity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.initData = function () {
        var i = 0;
        var j = 0;
        var x = 0;
        var z = 0;
        const text = "KHU VỰC CỬA LÒ";
        const textmb = "KHU VỰC MẶT BẰNG";
        const textvp = "KHU VỰC VĂN PHÒNG";
        const textna = "KHU VỰC NHÀ ĂN";
        function typing() {
            if (i < text.length) {
                document.getElementById("cualo").innerHTML = document.getElementById("cualo").innerHTML + text.charAt(i);
                i++;
            }
            if (j < textmb.length) {
                document.getElementById("matbang").innerHTML = document.getElementById("matbang").innerHTML + textmb.charAt(j);
                j++;
            }
            if (x < textvp.length) {
                document.getElementById("vanphong").innerHTML = document.getElementById("vanphong").innerHTML + textvp.charAt(x);
                x++;
            }
            if (z < textna.length) {
                document.getElementById("nhaan").innerHTML = document.getElementById("nhaan").innerHTML + textna.charAt(z);
                z++;
            }
            setTimeout(typing, 60);
        }
        typing();

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
            setTimeout(showTime, 1000);
        }
        showTime();
        setInterval(function () {
            load();
        }, 1000);

        setInterval(function () {
            load1();
        }, 1000);

        function load() {
            $.ajax({
                url: 'https://quanghanh.s-work.vn/MobileLogin/GetCountCheckInOut',
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    for (var i = 0; i < data.Object.length; i++) {
                        //Cửa lò//
                        if (data.Object[i].KhuVuc == "CL") {
                            var totalin = 0;
                            var totalout = 0;
                            if (data.Object[i].CuaRaVao == "8.Cua01") {
                                var in1 = data.Object[i].CoutCheckIn;
                                var out1 = data.Object[i].CoutCheckOut;
                                $('#cl1in').html(in1);
                                $('#cl1out').html(out1);
                            }
                            if (data.Object[i].CuaRaVao == "6.Cua01") {
                                var in2 = data.Object[i].CoutCheckIn;
                                var out2 = data.Object[i].CoutCheckOut;
                                $('#cl2in').html(in2);
                                $('#cl2out').html(out2);

                            }
                            if (data.Object[i].CuaRaVao == "4.Cua01") {
                                var in3 = data.Object[i].CoutCheckIn;
                                var out3 = data.Object[i].CoutCheckOut;
                                $('#cl3in').html(in3);
                                $('#cl3out').html(out3);
                            }

                            if (data.Object[i].CuaRaVao == "5.Cua01") {
                                var in4 = data.Object[i].CoutCheckIn;
                                var out4 = data.Object[i].CoutCheckOut;
                                $('#cl4in').html(in4);
                                $('#cl4out').html(out4);
                            }
                            if (data.Object[i].CuaRaVao == "7.Cua01") {
                                var in5 = data.Object[i].CoutCheckIn;
                                var out5 = data.Object[i].CoutCheckOut;
                                $('#cl5in').html(in5);
                                $('#cl5out').html(out5);
                            }



                            totalin = in1 + in2 + in3 + in4 + in5;
                            totalout = out1 + out2 + out3 + out4 + out5;
                            $('#clintotal').html(totalin);
                            $('#clouttotal').html(totalout);
                        }

                        //Văn Phòng//
                        if (data.Object[i].KhuVuc == "VP") {
                            var vpin = 0;
                            var vpout = 0;
                            if (data.Object[i].CuaRaVao == "11.Cua01") {
                                $('#vpain').html(data.Object[i].CoutCheckIn);
                                $('#vpaout').html(data.Object[i].CoutCheckOut);
                                var in1 = data.Object[i].CoutCheckIn;
                                var out1 = data.Object[i].CoutCheckOut;
                            }
                            if (data.Object[i].CuaRaVao == "12.Cua01") {
                                $('#vpbin').html(data.Object[i].CoutCheckIn);
                                $('#vpbout').html(data.Object[i].CoutCheckOut);
                                var in2 = data.Object[i].CoutCheckIn;
                                var out2 = data.Object[i].CoutCheckOut;
                            }
                            vpin = in1 + in2;
                            vpout = out1 + out2;
                            $('#totalvpin').html(vpin);
                            $('#totalvpout').html(vpout);
                        }
                        //Nhà ăn//
                        if (data.Object[i].KhuVuc == "NA") {
                            var total2 = 0;
                            if (data.Object[i].CuaRaVao == "1.Cua01") {
                                $('#na1in').html(data.Object[i].CoutCheckIn);
                                $('#na1out').html(data.Object[i].CoutCheckOut);
                                var total1 = data.Object[i].CoutCheckIn;

                            }
                            if (data.Object[i].CuaRaVao == "2.Cua01") {
                                $('#na2in').html(data.Object[i].CoutCheckIn);
                                $('#na2out').html(data.Object[i].CoutCheckOut);
                                var in2 = data.Object[i].CoutCheckIn;

                            }
                            if (data.Object[i].CuaRaVao == "3.Cua01") {
                                $('#na3in').html(data.Object[i].CoutCheckIn);
                                $('#na3out').html(data.Object[i].CoutCheckOut);
                                var in3 = data.Object[i].CoutCheckIn;
                            }

                            total2 = in2 + in3;
                            $('#na1total').html(total1);
                            $('#na2total').html(total2);
                        }
                        //Mặt Bằng//
                        if (data.Object[i].KhuVuc == "MB") {
                            var mbin = 0;
                            var mbout = 0;
                            if (data.Object[i].CuaRaVao == "13.Cua01") {

                                var mbin1 = data.Object[i].CoutCheckIn;
                                var mbout1 = data.Object[i].CoutCheckOut;
                                $('#mb1in').html(mbin1);
                                $('#mb1out').html(mbout1);
                            }
                            if (data.Object[i].CuaRaVao == "14.Cua01") {
                                var mbin2 = data.Object[i].CoutCheckIn;
                                var mbout2 = data.Object[i].CoutCheckOut;
                                $('#mb2in').html(mbin2);
                                $('#mb2out').html(mbout2);
                            }
                            if (data.Object[i].CuaRaVao == "10.Cua01") {
                                var mbin3 = data.Object[i].CoutCheckIn;
                                var mbout3 = data.Object[i].CoutCheckOut;
                                $('#mb3in').html(mbin3);
                                $('#mb3out').html(mbout3);
                            }
                            if (data.Object[i].CuaRaVao == "9.Cua01") {
                                var mbin4 = data.Object[i].CoutCheckIn;
                                var mbout4 = data.Object[i].CoutCheckOut;
                                $('#mb4in').html(mbin4);
                                $('#mb4out').html(mbout4);
                            }
                            mbout = mbout1 + mbout2 + mbout3 + mbout4;
                            mbin = mbin1 + mbin2 + mbin3 + mbin4;
                            $('#mbouttotal').html(mbout);
                            $('#mbintotal').html(mbin);
                        }
                    }
                }

            });
        }
        function load1() {
            $.ajax({
                url: 'https://quanghanh.s-work.vn/MobileLogin/GetCountRoleCheckInOut',
                type: 'get',
                dataType: 'json',

                success: function (data) {

                    //khu vực cửa lò
                    for (var i = 0; i < data.Object.length; i++) {
                        if (data.Object[i].IdKhuVuc == "CL") {
                            if (data.Object[i].Description == "CBPX") {
                                $('#cbpxcl').html(data.Object[i].Total);
                            }
                            if (data.Object[i].Description == "CBVP") {
                                $('#cbvpcl').html(data.Object[i].Total);
                            }
                            if (data.Object[i].Description == "CN") {
                                $('#cncl').html(data.Object[i].Total);
                            }

                        }
                    }
                    for (var i = 0; i < data.Object.length; i++) {
                        if (data.Object[i].IdKhuVuc == "MB") {
                            if (data.Object[i].Description == "CBPX") {
                                $('#cbpxmb').html(data.Object[i].Total);
                            }
                            if (data.Object[i].Description == "CBVP") {
                                $('#cbvpmb').html(data.Object[i].Total);
                            }
                            if (data.Object[i].Description == "CN") {
                                $('#cnmb').html(data.Object[i].Total);
                            }

                        }
                    }
                }
            });
        }







    }
    $scope.initData();

    
    

        

});

