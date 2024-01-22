var ctxfolder = "/views/mobile/departmentApp";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngTagsInput', 'dynamicNumber']);

app.factory('dataservice', function ($http) {
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
        insertEventCat: function (data, callback) {
            $http.post('/CalendarRegistration/InsertEventCat/', data).then(callback);
        },
        getEventCat: function (data, callback) {
            $http.get('/CalendarRegistration/GetEventCat?candidateCode=' + data).then(callback);
        },
        getSkill: function (callback) {
            $http.post('/CalendarRegistration/GetSkill/').then(callback);
        },
        deleteFrameTime: function (event, frame, callback) {
            $http.post('/CalendarRegistration/DeleteFrameTime/?id=' + event + "&FRAME=" + frame).then(callback);
        },
        changeFrameTimeStatus: function (id, frame, callback) {
            $http.post('/CalendarRegistration/ChangeFrametimeStatus/?id=' + id + "&frame=" + frame).then(callback);
        },
        getMemberCode: function (data, callback) {
            $http.post('/CalendarRegistration/GetMemberCode/?MemberType=' + data).then(callback);
        },
        getGoogleSuggest: function (searchStr, callback) {
            $http.get("http://suggestqueries.google.com/complete/search?client=chrome&q=" + searchStr).then(callback);
        },
        searchCandiateCode: function (data, callback) {
            $http.get('/CalendarRegistration/SearchCandiateCode?candidateCode=' + data).then(callback);
        },
        createCandiateCode: function (callback) {
            $http.get('/CalendarRegistration/CreateCandiateCode/').then(callback);
        },
        updateCandidateInfo: function (data, callback) {
            $http.post('/CalendarRegistration/UpdateCandidateInfo/', data).then(callback);
        },
        updateCandidateInfoMore: function (data, callback) {
            $http.post('/CalendarRegistration/UpdateCandidateInfoMore/', data).then(callback);
        },
        uploadCV: function (data, callback) {
            submitFormUpload('/CalendarRegistration/UploadFile/', data, callback);
        },
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
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    $rootScope.CandidateCode = "";
    $rootScope.validationOptionsBasic = {
        rules: {
            CandidateCode: {
                required: true
            },
            FullName: {
                required: true,
                maxlength: 255,
                minlength: 6
            },
            RadioMaried: {
                required: true,
            },
            Email: {
                required: true,
                maxlength: 100,
                email: true
            },
            Birthday: {
                required: true,
            },
            MobilePhone: {
                required: true,
                maxlength: 11,
                minlength: 10,
            },
            FileCV: {
                required: true,
                maxlength: 255
            },
            Address: {
                required: true,
                maxlength: 255,
                minlength: 15
            },
            Targeting: {
                maxlength: 500
            },
            Skype: {
                maxlength: 255
            },
        },
        messages: {
            CandidateCode: {
                required: "Mã ứng viên yêu cầu bắt buộc!",
            },
            FullName: {
                required: "Họ tên yêu cầu bắt buộc!",
                maxlength: "Tên tối đa 255 ký tự!",
                minlength: "Tên quá ngắn!"
            },
            RadioMaried: {
                required: "Hôn nhân yêu cầu bắt buộc!",
            },
            Email: {
                required: "Email yêu cầu bắt buộc!",
                maxlength: "Email tối đa 100 ký tự!",
                email: "Địa chỉ email không hợp lệ!"
            },
            Birthday: {
                required: "Ngày sinh yêu cầu bắt buộc!",
            },
            MobilePhone: {
                required: "Số điện thoại yêu cầu bắt buộc!",
                maxlength: "Số điện thoại tối đa 10 chữ số!",
                minlength: "Số điện thoại tối đa 10 chữ số!",
            },
            FileCV: {
                required: "Chọn tệp tin!",
                maxlength: "Tên tệp tin quá dài!"
            },
            Address: {
                required: 'Địa chỉ yêu cầu bắt buộc',
                maxlength: "Địa chỉ tối đa 255 ký tự!",
                minlength: "Địa chỉ quá ngắn!"
            },
            Targeting: {
                maxlength: "Mục tiêu tối đa 500 ký tự!"
            },
            Skype: {
                maxlength: "Skype tối đa 255 ký tự!"
            },
        }
    }
    $rootScope.validationOptionsAdvanced = {
        rules: {
            MainPracticeTime: {
                required: true,
                maxlength: 255
            },
            SubPracticeTime: {
                maxlength: 255
            },
            LaptopInfo: {
                maxlength: 255
            },
            SmartphoneInfo: {
                maxlength: 255
            },
            SalaryHope: {
                required: true,
            },
            CanJoinDate: {
                required: true,
            }
        },
        messages: {
            MainPracticeTime: {
                required: "Thời gian thực tập yêu cầu bắt buộc!",
                maxlength: "Thời gian thực tập tối đa 255 ký tự!"
            },
            SubPracticeTime: {
                maxlength: "Thời gian thực tập tối đa 255 ký tự!"
            },
            LaptopInfo: {
                maxlength: "Nhập tối đa 255 ký tự!"
            },
            SmartphoneInfo: {
                maxlength: "Nhập tối đa 255 ký tự!"
            },
            SalaryHope: {
                required: "Lương mong muốn yêu cầu bắt buộc!",
            },
            CanJoinDate: {
                required: "Ngày bắt đầu làm yêu cầu bắt buộc!",
            }
        }
    }
    $rootScope.zoomMap = 17;
});

app.config(function ($routeProvider, $validatorProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/search', {
            templateUrl: ctxfolder + '/duration-search.html',
            controller: 'duration-search'
        })
        .when('/interview', {
            templateUrl: ctxfolder + '/interview.html',
            controller: 'duration-search'
        })
        .when('/candidates', {
            templateUrl: ctxfolder + '/Candidate-grid.html',
            controller: 'candidate-grid'
        })
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {

    setTimeout(function () {
        
    }, 300);
});
