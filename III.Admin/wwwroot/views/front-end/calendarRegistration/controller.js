var ctxfolder = "/views/front-end/calendarRegistration";
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
    var vm = $scope;
    var events = [];
    $scope.forms = {}
    $scope.model = {
        Type: 0
    }
    $scope.modelInfo = {
        CandidateCode: '',
        Fullname: '',
        Sex: 1,
        Married: 0,
        Address: '',
        Phone: '',
        Email: '',
        Birthday: '',
        Skype: '',
        FileCv_1: '',
    }
    $scope.modelInfoMore = {
        Ability: '',
        Targeting: '',
        MainSkill: '',
        MainPracticeTime: '',
        SubSkill: '',
        SubPracticeTime: '',
        LanguageUse: '',
        SalaryHope: '',
        CanJoinDate: '',
        LaptopInfo: '',
        SmartphoneInfo: ''
    }
    $scope.modelCalendar = {
        CandidateCode: '',
        AppointmentTime: '',
        FromDate: '',
        ToDate: '',
        FullTime: false,
        Morning: false,
        Afternoon: false,
        Evening: false,
        Sunday: false,
        Saturday: false,
    };
    $scope.entities = [{
        name: 'Sáng',
        checked: false,
        value: 0,
    }, {
        name: 'Chiều',
        checked: false,
        value: 1,
    }, {
        name: 'Tối',
        checked: false,
        value: 2,
    }, {
        name: 'Thứ 7',
        checked: false,
        value: 3,
    }, {
        name: 'Chủ nhật',
        checked: false,
        value: 4,
    }]

    $scope.init = function () {
        dataservice.getSkill(function (rs) {rs=rs.data;
            $scope.listSkill = rs;
        });
    }
    $scope.init();
    
    $scope.createdSearchCandiateCode = function (type) {
        if (type == 0) {
            dataservice.createCandiateCode(function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.modelInfo.CandidateCode = rs.Title;
                    $rootScope.CandidateCode = rs.Title;
                    $('#CandidateCode').val(rs.Title);
                    if ($('#CandidateCode').valid()) {
                        $('#CandidateCode').removeClass('invalid').addClass('success');
                    }
                }
            })
        } else {
            if ($scope.modelInfo.CandidateCode == '') {
                App.toastrError("Xin mời bạn nhập mã đăng ký để tìm kiếm!");
            } else {
                dataservice.searchCandiateCode($scope.modelInfo.CandidateCode, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        $scope.modelInfo = rs.Object.CandidatesInfo;
                        $scope.modelInfoMore = rs.Object.CandidatesInfoMore;
                        $rootScope.CandidateCode = $scope.modelInfo.CandidateCode;
                        if ($('#CandidateCode').valid()) {
                            $('#CandidateCode').removeClass('invalid').addClass('success');
                        }
                        removeDisableTab();
                        renderCalenderInTab();
                        reloadData(true);
                        refetchEvents();
                        updateSelectSkill();
                    }
                })
            }
        }
    }
    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrameTimeStatus(eventId, frameTime, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                element = document.getElementsByClassName('sorting')[0];
                element.click();
                $('#calendar').fullCalendar('refetchEvents');
            }
        });
    }
    $scope.submitNextTab = function (form) {
        if (form == 1) {
            validationSelect($scope.modelInfo);
            if ($scope.forms.basicForm.validate() && validationSelect($scope.modelInfo).Status == false) {
                var file = document.getElementById("File").files[0];
                if ($scope.model.Type == 0) {
                    if (file == null || file == undefined) {
                        App.toastrError('Vui lòng chọn CV');
                    } else {
                        var fileName = $('input[type=file]').val();
                        var idxDot = fileName.lastIndexOf(".") + 1;
                        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                        if (extFile != "docx" && extFile != "doc" && extFile != "pdf") {
                            App.toastrError('CV không hợp lệ');
                            return;
                        };
                        var data = new FormData();
                        data.append("FileUpload", file);
                        dataservice.uploadCV(data, function (rs) {rs=rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                                return;
                            }
                            else {
                                $scope.modelInfo.FileCv_1 = '/uploads/files/' + rs.Object;
                                $scope.modelInfo.CandidateCode = $rootScope.CandidateCode;
                                dataservice.updateCandidateInfo($scope.modelInfo, function (rs) {rs=rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    }
                                    else {
                                        App.toastrSuccess(rs.Title);
                                        nextTab();
                                    }
                                })
                            }
                        });
                    }
                } else {
                    $scope.modelInfo.CandidateCode = $rootScope.CandidateCode;
                    dataservice.updateCandidateInfo($scope.modelInfo, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            nextTab();
                        }
                    })
                }
            }
        }
        if (form == 2) {
            var listAbility = [];
            for (var i = 0; i < $scope.listSkill.length; i++) {
                if ($scope.listSkill[i].Check) {
                    listAbility.push($scope.listSkill[i].Code);
                }
            }
            $scope.modelInfoMore.Ability = listAbility.join(',');
            $scope.modelInfoMore.CandidateCode = $rootScope.CandidateCode;
            if ($scope.forms.advancedForm.validate()) {
                dataservice.updateCandidateInfoMore($scope.modelInfoMore, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        nextTab();
                    }
                })
            }
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Phone" && $scope.modelInfo.Phone && $rootScope.partternPhone.test($scope.modelInfo.Phone)) {
            $scope.errorPhone = false;
        } 
    }
    $scope.loadFile = function () {
        if ($('#FileCV').valid()) {
            $('#FileCV').removeClass('invalid').addClass('success');
        }
    }
    $scope.dowloadFile = function (url) {
        window.open(url, 'Download');  
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            size: '90'
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorPhone = true;
            mess.Status = true;
        } else {
            $scope.errorPhone = false;
        }

        return mess;
    };
    function createCalendar(id) {
        $('#' + id).fullCalendar({
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next, today',
                right: '',
                center: 'title',
            },
            dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            monthNames: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 -', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            monthNamesShort: ['Tháng 1 -', 'Tháng 2 -', 'Tháng 3 -', 'Tháng 4 -', 'Tháng 5 -', 'Tháng 6 -', 'Tháng 7 -', 'Tháng 8 ', 'Tháng 9 -', 'Tháng 10 -', 'Tháng 11 -', 'Tháng 12 -'],
            dayNamesShort: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
            buttonText: {
                today: 'Hôm nay',
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataservice.getEventCat($rootScope.CandidateCode, function (rs) {rs=rs.data;
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var calendar = value.FrameTime.split(';');
                        var morning = {
                            title: "1.Sáng",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[0] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 0
                        }
                        var afternoon = {
                            title: "2.Chiều",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[1] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 1
                        }
                        var evening = {
                            title: "3.Tối",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[2] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 2
                        }
                        event.push(morning);
                        event.push(afternoon);
                        event.push(evening);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                calEvent.color = '#bdc3c7';
                deleteFrameTime(calEvent.frameTime, calEvent.id, calEvent);
                $("a.fc-day-grid-event.fc-h-event.fc-event.fc-start.fc-end.fc-draggable").click(function () {
                    var stt = $(this).hasClass("true");
                    if (stt == true) {
                        $(this).removeClass("true");
                        $(this).css('background', 'silver');
                    } else {
                        $(this).addClass(" true");
                        $(this).css('background', 'green');

                    }
                });
            },
            dayClick: function (date) {

            },
        })
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        var date = new Date();
        date.setDate(date.getDate() + 1);
        $("#datebirthday").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: "01/01/1960",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#datebirthday input').valid()) {
                $('#datebirthday input').removeClass('invalid').addClass('success');
            }
        });
        $("#appointmentTime").datetimepicker({
            startDate: new Date(),
            format: 'dd/mm/yyyy hh:ii',
            todayHighlight: true,
            autoclose: true
        });
        $("#can-join-date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: date,
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#can-join-date input').valid()) {
                $('#can-join-date input').removeClass('invalid').addClass('success');
            }
        });
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: date,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
    }
    function nextTab() {
        var $active = $('.nav-tabs li.active');
        $active.next().removeClass('disabled');
        $($active).next().find('div[data-toggle="tab"]').click();
    }
    function prevTab() {
        var $active = $('.nav-tabs li.active');
        $($active).prev().find('div[data-toggle="tab"]').click();
    }
    function renderCalenderInTab() {
        $('div[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            $('#calendar').fullCalendar('render');
        });
    }
    function removeDisableTab() {
        var tab = $('.nav-tabs li');
        tab.removeClass('disabled');
    }
    function updateSelectSkill() {
        if ($scope.modelInfoMore.Ability != '' && $scope.modelInfoMore.Ability != null) {
            var listSkillCheck = $scope.modelInfoMore.Ability.split(',');
            for (var i = 0; i < $scope.listSkill.length; i++) {
                for (var j = 0; j < listSkillCheck.length; j++) {
                    if ($scope.listSkill[i].Code == listSkillCheck[j]) {
                        $scope.listSkill[i].Check = true;
                        break;
                    }
                }
            }
        }
    }
    function refetchEvents() {
        $('#calendar').fullCalendar('refetchEvents');
    }
    function innitload() {
        $('div[data-toggle="tab"]').on('show.bs.tab', function (e) {
            var $target = $(e.target);
            if ($target.parent().hasClass('disabled')) {
                return false;
            }
        });
        $('.work-type').click(function () {
            if ($(this).attr('id') == "fulltime") {
                $('.work-type').not('#fulltime').each(function (index) {
                    $(this).removeAttr("checked")
                })
                $(this).attr("checked", "checked");
            }
            else {
                $('#fulltime').removeAttr("checked");
            }
        });
    }
    setTimeout(function () {
        loadDate();
        renderCalenderInTab();
        innitload();
        createCalendar("calendar");
    }, 300);

    //2. List 
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/CalendarRegistration/GetEventCatGrid",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CandidateCode = $rootScope.CandidateCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [2, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateCode').withTitle('Mã thành viên').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withTitle('Họ tên').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('Ngày').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('Sáng').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('Chiều').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';

        } else {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('Tối').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff""><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dt = {
        dtInstance: {}
    }
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.registration = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Morning = true;
                } else {
                    $scope.modelCalendar.Morning = false;
                }
            }
            if ($scope.entities[i].value == 1) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Afternoon = true;
                } else {
                    $scope.modelCalendar.Afternoon = false;
                }
            }
            if ($scope.entities[i].value == 2) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Evening = true;
                } else {
                    $scope.modelCalendar.Evening = false;
                }
            }
            if ($scope.entities[i].value == 3) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Saturday = true;
                } else {
                    $scope.modelCalendar.Saturday = false;
                }
            }
            if ($scope.entities[i].value == 4) {
                if ($scope.entities[i].checked) {
                    $scope.modelCalendar.Sunday = true;
                } else {
                    $scope.modelCalendar.Sunday = false;
                }
            }
        }
        if (!$scope.modelCalendar.Morning && !$scope.modelCalendar.Afternoon &&
            !$scope.modelCalendar.Evening && !$scope.modelCalendar.Saturday && !$scope.modelCalendar.Sunday) {
            App.toastrError("Vui lòng chọn sáng,chiều,tối");
        } else {
            if ($scope.modelCalendar.FromDate == '' || $scope.modelCalendar.ToDate == '') {
                App.toastrError("Vui lòng chọn từ ngày và đến ngày");
                return;
            }
            $scope.modelCalendar.CandidateCode = $rootScope.CandidateCode;
            dataservice.insertEventCat($scope.modelCalendar, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $('#calendar').fullCalendar('refetchEvents');
                    reloadData(true);
                }
            })
        }
    };
});
app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        title: 'Công ty TNHH Công nghệ và truyền thông 3i',
        address: 'Nhà B1-4, 85 Hạ Đình Khu đô thị Hạ Đình - Thanh Xuân - Hà Nội, Hà Nội, Việt Nam',
        addressCompound: 'XRR5+CV Thanh Xuân Trung, Thanh Xuân, Hà Nội, Việt Nam',
        lng: 105.80962121486664,
        lat: 20.991062319765202,
        site: '3i.com.vn',
        website: 'http://3i.com.vn/',
        phone: '0389 957 102',
        urlImage: '../../../images/default/default_geocode-1x.png'
    }

    $scope.initLoad = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$scope.model.lng, $scope.model.lat], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function initMap() {
        var centerPoint = { lat: $scope.model.lat, lng: $scope.model.lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + $scope.model.title,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMap, center: centerPoint });
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };


        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);

        //start map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            //var address = '';
            //if (place.address_components) {
            //    address = [
            //        (place.address_components[0] && place.address_components[0].short_name || ''),
            //        (place.address_components[1] && place.address_components[1].short_name || ''),
            //        (place.address_components[2] && place.address_components[2].short_name || '')
            //    ].join(' ');
            //}
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            $scope.model.title = place.name;
            $scope.model.address = place.formatted_address;
            $scope.model.phone = place.formatted_phone_number != undefined ? place.formatted_phone_number : '';
            $scope.model.website = place.website != undefined ? place.website : '';
            $scope.model.site = place.website != undefined ? place.website.substring(place.website.indexOf('://') + 3) : '';
            $scope.model.site = $scope.model.site != '' ? $scope.model.site.replace("/", "") : '';
            var photos = place.photos;
            if (!photos) {
                $scope.model.urlImage = "../../../images/default/default_geocode-1x.png";
            } else {
                var photo = photos[0].getUrl();
                $scope.model.urlImage = photo;
            }
            $scope.$apply();

        });
        //end map change

        //start map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyDHceKL6LCQusky6nFYduGFGcg4UKyTI6o';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                service.getDetails({
                    placeId: data.results[0].place_id
                }, function (result, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        var html = "<b>" + result.name + "</b> <br/>" + result.formatted_address;
                        infowindow.setContent(html);
                        infowindow.open(map, marker, html);
                        $scope.model.title = result.name;
                        $scope.model.address = result.formatted_address;
                        $scope.model.phone = result.formatted_phone_number != undefined ? result.formatted_phone_number : '';
                        $scope.model.website = result.website != undefined ? result.website : '';
                        $scope.model.site = result.website != undefined ? result.website.substring(result.website.indexOf('://') + 3) : '';
                        $scope.model.site = $scope.model.site != '' ? $scope.model.site.replace("/", "") : '';
                        var photos = result.photos;
                        if (!photos) {
                            $scope.model.urlImage = "../../../images/default/default_geocode-1x.png";
                        } else {
                            var photo = photos[0].getUrl();
                            $scope.model.urlImage = photo;
                        }
                        $scope.$apply();
                    }
                });


            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMap);
        })
        // end map click
    }
    setTimeout(function () {
        initMap();
    }, 100)
});
//$scope.addMainSkill = function () {
    //    var str = $("#mainSkill").val();
    //    $("#mainSkill").val("");
    //    $('#main-skill input').val(str);

    //    e = jQuery.Event("keypress");
    //    e.which = 13;
    //    $("#main-skill input").keypress(function () {
    //    }).trigger(e);
    //    //$scope.model.MainSkill += str + ',';
    //}
    //$scope.addSubSkill = function () {
    //    var str = $("#subSkill").val();
    //    $("#subSkill").val("");
    //    console.log(str);
    //    $('#sub-skill input').val(str);

    //    e = jQuery.Event("keypress");
    //    e.which = 13;
    //    $("#sub-skill input").keypress(function () {
    //    }).trigger(e);
    //    //$scope.model.SubSkill += str + ',';
    //}
    //$scope.addLanguage = function () {
    //    var str = $("#language").val();
    //    $("#language").val("");
    //    console.log(str);
    //    $('#language-use input').val(str);

    //    e = jQuery.Event("keypress");
    //    e.which = 13;
    //    $("#language-use input").keypress(function () {
    //    }).trigger(e);
    //    //$scope.model.LanguageUse += str + ',';
    //}
        //$scope.googleSearch = function (id) {
    //    var str = document.getElementById(id).value;
    //    $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
    //        {
    //            "hl": "vi",
    //            "q": str,
    //            "client": "chrome"
    //        }
    //    )
    //        .done(function (data) {
    //            //$scope.GoogleSuggest = data[1];
    //            data[1].length = 10;
    //            $('#' + id).autocomplete({
    //                source: data[1]
    //            });
    //        });
    //}
    //$scope.getUserId = function (item) {
    //    console.log(item);
    //    dataservice.getMemberCode(item.id, function (rs) {rs=rs.data;
    //        $scope.MemberCode = rs;
    //    })
    //}