var ctxfolder = "/views/admin/formBuilder";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderCardJob = "/views/admin/cardJob";
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
        
    };
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
    setTimeout(function () {

        $('.editor__close').on('click', function () {
            $('.editor').removeClass('editor__show-hi');
            $('svg').css('background', 'transparent url(https://d4.violet.vn/uploads/blogs/735961/layout/forum_10.gif) repeat center top');
            $('.json-editor__div').css('display', 'none');
        });

        /*$('#saveData').on('click', function () {
            $('.fade6').toggleClass('show');
            $('.modal6').css('display', 'block');
        });*/




        var fbEditor = null;
        var formBuilder = null;

        jQuery(function ($) {
            var data;
            fbEditor = document.getElementById('fb-editor');

            //////////////////////////
            var actionButtons = [
                {
                    id: "smile",
                    className: "btn btn-success",
                    label: "😁",
                    type: "button",
                    events: {
                        click: function () {
                            alert("😁😁😁 !SMILE! 😁😁😁");
                        }
                    }
                }
            ];
            formBuilder = $(fbEditor).formBuilder({ actionButtons: actionButtons });
            

            // get Json
           

            // render
            document.getElementById("setData").addEventListener("click", () => {
                var data = formBuilder.actions.getData('json');
                var obj = JSON.parse(data);
                $('.json-editor__div').text(JSON.stringify(obj, undefined, 4));
                

                formData = formBuilder.actions.getData('json');
                var formRenderOpts = {
                    formData,
                    dataType: 'json'
                };
                $('.render').formRender(formRenderOpts);
                $('.rendered-form').append("<button id='saveRender' class='btn btn-primary saveRender'>Save</button>");
                $('.rendered-form').append("<button id='cencelRender' class='btn btn-danger saveRender'>Cencel</button>");
                $('#saveRender').on('click', function () {
                    var data = formBuilder.actions.getData('json');
                    var obj = JSON.parse(data);
                    // var a = obj[0].name;
                    console.log();
                    // var a = obj.name;
                    alert("Lưu thành công");
                    $('.rendered-form').css('display', 'none');
                });
                $('#cencelRender').on('click', function () {
                    $('.rendered-form').css('display', 'none');
                });
            });
            $scope.addFormBiulder = function () {
                if ($scope.model.FormCode == "") {
                    var data = {

                    };
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/add-formbiulder.html',
                        controller: 'add-formbiulder',
                        backdrop: 'static',
                        size: '50',
                        resolve: {
                            para: function () {
                                return data;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                    }, function () {
                    });
                }
                else {
                    var formjson = formBuilder.actions.getData('json');
                    var newData = JSON.parse(formjson);
                    for (var i = 0; i < newData.length; i++) {
                        var formcontrol = {
                            FcCode: newData[i].name,
                            FcName: newData[i].type,
                            FcParent: $scope.model.FormCode,
                            FcAttribute: JSON.stringify(newData[i]).toString()

                        }
                        dataservice.insertFormControl(formcontrol, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            }
                            else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                            }

                        })



                    }

                }


            }
            $scope.changeForm = function () { }







            /*$('.form-save').click(function () {
                if ($('#form-name').val() == "") {
                    $(".form-message").html("Vui Lòng Nhập Trường Này");
                    $(".form-message").css("color", "red");
                } else {
                    // post form_cat
                    let formCode = $('#formBuider-code').val();
                    let formName = $('#formBuider-name').val();
                    let formType = $('#formBuider-type').val();
                    let formGroup = $('#formBuider-group').val();
                    let formNote = $('.formBuider-note').val();

                    let CreatedBy = "admin";
                    var CreatedTime = "2020-09-11 16:51:18.0000000";
                    console.log(CreatedTime);
                    var settings = {
                        "url": "http://localhost:6001/api/ApiFormCat",
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json",
                        },
                        "data": JSON.stringify({ "FormName": "" + formName, "FormCode": "" + formCode, "FormType": "" + formType, "FormGroup": "" + formGroup, "CreatedBy": "" + CreatedBy, "FormNote": "" + formNote, "CreatedTime": "" + CreatedTime }),
                    };
                    $.ajax(settings).done(function (response) {
                        alert("thành công");
                    });


                    var newData = JSON.parse(data);
                    for (var i = 0; i < newData.length; i++) {
                        // type = autocomplete
                        let dt = JSON.stringify(newData[i]);
                        let fcAttribute = dt.toString();
                        // console.log(fcAttribute);
                        let isDeleted = true;

                        var settingss = {
                            "url": "http://localhost:6001/api/ApiFormControl",
                            "method": "POST",
                            "timeout": 100,
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "data": JSON.stringify({ "FcParent": "" + formName + "", "FcAttribute": "" + fcAttribute, "FcName": "" + newData[i].name }),
                        };

                        $.ajax(settingss).done(function (response) {

                        });

                        /////////////////////////////////////////////////////////////////////

                        ///////////////////////////////////////////////////
                    }
                    $('.chosen1').append('<option value ="' + formName + '">' + formName + '</option>');

                    $('.modal6').css('display', 'none');
                    $('.overlay').removeClass('overlay-show');
                    $('.fade6').removeClass('show');
                    $('modal-backdrop, .show').remove();
                }
            });*/
            /*load1();
            function load1() {

                var setting5 = {
                    "url": "http://localhost:6001/api/apiFormCat/",
                    "method": "get",
                    "datatype": "json"
                };
                $.ajax(setting5).done(function (response) {
                    for (var i = 0; i < response.Data.length; i++) {
                        $('.chosen1').append('<option value ="' + response.Data[i].FormName + '">' + response.Data[i].FormName + '</option>');
                    }
                });
            }*/
        });
        ///////////////////////////////////////////////////////////////


        /*function readdata1() {
            var data1 = "";
            var form = document.getElementById("chosen1").value;
            var setting5 = {
                "url": "http://localhost:6001/api/apiFormControl/",
                "method": "get",
                "datatype": "json"
            };
            $.ajax(setting5).done(function (response) {
                var x = 0;
                var a = [];
                // if (form == 0) {
                //         formBuilder.actions.setData(null);   
                //     }
                for (var i = 0; i < response.Data.length; i++) {
                    if (form == response.Data[i].FcParent) {
                        var obj = JSON.parse(response.Data[i].FcAttribute);
                        console.log(obj);
                        a[i] = obj;
                    }
                }
                // x=0;


                console.log(a);
                formBuilder.actions.setData(a);

            });
        }*/
        /////////////////////////////////////////////
       


    }, 100);
});


