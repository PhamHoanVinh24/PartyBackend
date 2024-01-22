var ctxfolder = "/views/admin/PDF";
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
            $http.post('/Admin/AssetBuy/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/AssetBuy/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AssetBuy/Delete?Id=' + data).then(callback);
        },

        getGenReqCode: function (callback) {
            $http.post('/Admin/AssetBuy/GenReqCode').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/AssetBuy/GetStatus').then(callback);
        },
        getDepart: function (callback) {
            $http.post('/Admin/AssetBuy/GetDepart').then(callback);
        },
        getBuyer: function (callback) {
            $http.post('/Admin/AssetBuy/GetBuyer').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/AssetBuy/GetBranch').then(callback);
        },
        getCatObjActivity: function (callback) {
            $http.post('/Admin/AssetBuy/GetCatObjActivity').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/AssetBuy/GetItem?Id=' + data).then(callback);
        },
        getAssset: function (callback) {
            $http.post('/Admin/AssetBuy/GetAssset').then(callback);
        },
        getStatusAsset: function (callback) {
            $http.post('/Admin/AssetBuy/GetStatusAsset').then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/AssetBuy/GetAssetType').then(callback);
        },
        getSupp: function (callback) {
            $http.post('/Admin/AssetBuy/GetSupp').then(callback);
        },
        genReqfile: function (callback) {
            $http.post('/Admin/AssetBuy/GenReqfile').then(callback);
        },
        getListFile: function (data, callback) {
            $http.post('/Admin/AssetBuy/GetListFile?code=' + data).then(callback);
        },
        getCatAct: function (callback) {
            $http.post('/Admin/AssetBuy/GetCatAct').then(callback);
        },
        getItemAttrSetup: function (data, callback) {
            $http.get('/Admin/AssetBuy/GetItemAttrSetup?actCode=' + data).then(callback);
        },
        getListActivityAttrData: function (data, data1, data2, callback) {
            $http.post('/Admin/AssetBuy/GetListActivityAttrData?objCode=' + data + '&&actCode=' + data1 + '&&objActCode=' + data2).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/AssetBuy/GetCurrency').then(callback);
        },

        insertasset: function (data, callback) {
            $http.post('/Admin/AssetBuy/InsertAsset', data).then(callback);
        },
        deleteasset: function (data, callback) {
            $http.post('/Admin/AssetBuy/Deleteasset?Id=' + data).then(callback);
        },

        insertFile: function (data, callback) {
            submitFormUpload('/Admin/AssetBuy/UploadFile', data, callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/AssetBuy/DeleteFile?Id=' + data).then(callback);
        },

        insertLog: function (data, callback) {
            $http.post('/Admin/AssetBuy/InsertLog', data).then(callback);
        },
        insertdata: function (data, callback) {
            $http.post('/Admin/AssetBuy/Insertdata', data).then(callback);
        },
        deleteAttrData: function (data, callback) {
            $http.post('/Admin/AssetBuy/DeleteAttrData?id=' + data).then(callback);
        },
        deleteItemActivity: function (data, callback) {
            $http.post('/Admin/AssetBuy/DeleteItemActivity?id=' + data).then(callback);
        }
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
            //max: 'Max some message {0}'


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
        $rootScope.checkDataAssetAttribute = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AttrCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE), "<br/>");//"Mã bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AttrValue)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE)//"Yêu cầu góa trị có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true
                },
                Location: {
                    required: true
                },
                

            },
            messages: {
                Title: {
                    required: caption.ASSET_BUY_VALIDATE_REQ.replace("{0}", caption.ASSET_BUY_TITLE ),//"Tiêu đề phiếu không được bỏ trống",
                    maxlength: caption.ASSET_BUY_VALIDATE_WORD.replace("{0}", caption.ASSET_BUY_TITLE), //"Tiêu đề phiếu không vượt quá 255 ký tự",
                },
                Location: {
                    required: caption.ASSET_BUY_VALIDATE_REQ.replace("{0}", caption.ASSET_BUY_LOCATION), //"Địa điểm sửa chữa không được bỏ trống",
                },
               

            },
        },

        $rootScope.validationOptionsasset = {
            rules: {
                Quantity: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },
               
            },
            messages: {
                Quantity: {
                    required: caption.ASSET_BUY_VALIDATE_REQ.replace("{0}", caption.ASSET_BUY_QUANTITY), //"Số lượng yêu cầu bắt buộc",
                    regx: caption.ASSET_BUY_VALIDATE_NO_ZERO.replace("{0}", caption.ASSET_BUY_QUANTITY), //"Số lượng không nhỏ hơn 0"
                },
               
            }

            }
        $rootScope.validationOptionsResultAct = {
            rules: {
                Value: {
                    required: true
                }
            },
            messages: {
                Value: {
                    required: "Giá trị bắt buộc"
                }
            }
        }
    });

    dataservice.getStatus(function (result) {result=result.data;
        $rootScope.ListStatus = result;
    });
    dataservice.getAssset(function (result) {result=result.data;
        $rootScope.ListAsset = result;
    });

    $rootScope.IsAdd = false;
    $rootScope.map = {
        Lat: '',
        Lng: '',
        Address: ''
    };
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetBuy/Translation');
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
   
    $scope.model = {
        TicketCode: '',
        Title: '',
        FromDate: '',
        ToDate: '',
        Buyer: '',
        Depart: ''
    };
    dataservice.getDepart(function (result) {result=result.data;
        $scope.ListDepart = result;
    });
   

    dataservice.getBuyer(function (result) {result=result.data;
        $scope.ListBuyer = result;
    });

 
  
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage()
        }, function () { });
    }
   
    function initDateTime() {

        $("#fromdate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#todate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });


    }
    setTimeout(function () {
        initDateTime();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
   
    $scope.model = {
        Buyer: '',
        Depart: '',
        Branch:'',
        TicketCode: '',
        ObjActCode: '',
        TotalMoney: '',
        Currency:'',
        Status: $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[0].Code : '',
    }
    $scope.initLoad = function () {
        dataservice.getDepart(function (result) {result=result.data;
            $scope.ListDepart = result;
        });
        dataservice.getBranch(function (result) {result=result.data;
            $scope.ListBranch = result;
        });
        dataservice.getCurrency(function (result) {result=result.data;
            $scope.ListCurrency = result;
        });

        dataservice.getBuyer(function (result) {result=result.data;
            $scope.ListBuyer = result;
        });

    }
    $scope.initLoad();

    $scope.chkSubTab = function () {
        if ($rootScope.AssetCode == '') {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
        }
    }

    $scope.viewImage = function () {
        var image = "https://www.kientrucadong.com/diendan/wp-content/uploads/2017/04/1-MAT-BANG-TANG-1-2.jpg";
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewImage.html',
            controller: 'viewImage',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return image;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }


    //combobox
    dataservice.getGenReqCode(function (rs) {rs=rs.data;
        if (!rs.Error) {
            $scope.model.TicketCode = rs;
        }
    });
    dataservice.getCatObjActivity(function (rs) {rs=rs.data;
        $scope.listCatObjActivity = rs;
        if ($scope.listCatObjActivity.length == 1) {
            $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
        }
    })


    $scope.deleteFile = function (id) {
        dataservice.deleteFile(id, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataservice.getListFile($scope.model.TicketCode, function (rs) {rs=rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }

    $scope.addFile = function () {
        if ($rootScope.IsAdd == true) {
            $rootScope.TicketCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/file_add.html',
                controller: 'file_add',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                dataservice.getListFile($scope.model.TicketCode, function (rs) {rs=rs.data;
                    $scope.model.listFile = rs;
                });
            }, function () {
            });
        } else {
            App.toastrError(caption.ASSET_BUY_VALIDATE_UPLOAD_ADD);
        }
    }

    $scope.cancel = function () {
        $rootScope.TicketCode = null;
        $rootScope.IsAdd = false;
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var msg = $rootScope.checkData($scope.model);

            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }

            if (!$rootScope.IsAdd) {
                dataservice.insert($scope.model, function (result) {result=result.data;

                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.TicketCode = $scope.model.TicketCode;
                        $scope.model.ID = result.ID;
                        $rootScope.IsAdd = true;
                        $scope.reloadNoResetPage();
                        $scope.isDisabled = false;


                    }
                });
            }
            else {
                dataservice.update($scope.model, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.IsAdd = false;
                        $scope.reloadNoResetPage();
                        $uibModalInstance.close();
                        $rootScope.TicketCode = null;
                    }
                });
            }

        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Depart" && $scope.model.Depart != "") {
            $scope.errorDepart = false;
        }
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "Buyer" && $scope.model.Buyer != "") {
            $scope.errorBuyer = false;
        }
        if (SelectType == "TotalMoney" && $scope.model.TotalMoney!= "") {
            $scope.errorTotalMoney = false;
        }
        if (SelectType == "ObjActCode" && $scope.model.ObjActCode != "") {
            $scope.errorObjActCode = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: true,
            size: '70',
            resolve: {
                para: function () {
                    return '';
                }
            }
        });
        modalInstance.result.then(function (d) {
            if ($rootScope.map.Lat != '' && $rootScope.map.Lng != '') {
                $scope.model.LocationGps = $rootScope.map.Lat + ',' + $rootScope.map.Lng;
                $scope.model.LocationText = $rootScope.map.Address;
            }
        }, function () { });
    }
    function initAutocomplete() {
        var input = document.getElementById('address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            $scope.lat = place.geometry.location.lat();
            $scope.lng = place.geometry.location.lng();
            $scope.model.LocationGps = $scope.lat + "," + $scope.lng;
            $scope.$apply();
        });
    }
    function initDateTime() {

        $("#BuyTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#reqtime').datepicker('setstartDate', maxDate);
        });

        $('.start-date').click(function () {
            $('#BuyTime').datepicker('setstartDate', null);
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.Depart == "") {
            $scope.errorDepart = true;
            mess.Status = true;
        } else {
            $scope.errorDepart = false;
        }

        if (data.Branch == "") {
            $scope.errorBranch = true;
            mess.Status = true;
        } else {
            $scope.errorBranch = false;
        }

        if (data.Buyer == "") {
            $scope.errorBuyer = true;
            mess.Status = true;
        } else {
            $scope.errorBuyer = false;
        }
        if (data.ObjActCode == "") {
            $scope.errorObjActCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjActCode = false;
        }
        if (data.TotalMoney == "") {
            $scope.errorTotalMoney = true;
            mess.Status = true;
        } else {
            $scope.errorTotalMoney = false;
        }

        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }
        return mess;
    };
    setTimeout(function () {
        initDateTime();
        initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});
app.controller('Addtable', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.model = {
        AssetCode: '',
        StatusAsset: '',
        AssetType: '',
        Property: '',
        Supplier: '',
        CostValue: '',
        CurrencyAsset:''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetBuy/JTableADD",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
               d.TicketCode = $rootScope.TicketCode;

            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ID').withTitle('ID').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASSET_BUY_ASSET" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetType').withTitle('{{"ASSET_BUY_TYPE_ASSET" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Supplier').withTitle('{{"ASSET_BUY_SUPPLIER" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CostValue').withTitle('{{"ASSET_BUY_COSTVL" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"ASSET_BUY_QUANTITY" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusAsset').withTitle('{{"ASSET_BUY_STT_ASSET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_BUY_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ASSET_BUY_LIST_COL_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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


    $rootScope.reloadNoResetPage5 = function () {
        reloadData(false);
    };

    $scope.addasset = function () {
        validationSelect($scope.model);
        if ($scope.addassetform.validate() && !validationSelect($scope.model).Status) {
           var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }

            // $scope.model.CreateTime = convertDatetime($scope.model.CreateTime);
            $scope.model.TicketCode = $rootScope.TicketCode;
            dataservice.insertasset($scope.model, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reloadNoResetPage5();
                    //$uibModalInstance.close();

                }
            })
        }

    }

    dataservice.getStatusAsset(function (rs) {rs=rs.data;
        $scope.listStatusAsset = rs;
    });
    dataservice.getAssetType(function (rs) {rs=rs.data;
        $rootScope.listAssetType = rs;
    });
    dataservice.getSupp(function (rs) {rs=rs.data;
        $rootScope.listSupp = rs;
    });
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.model.AssetCode != "") {
            $scope.errorAssetCode = false;
        }
        if (SelectType == "StatusAsset" && $scope.model.StatusAsset != "") {
            $scope.errorStatusAsset = false;
        }
        if (SelectType == "AssetType" && $scope.model.AssetType != "") {
            $scope.errorAssetType = false;
        }
        if (SelectType == "Supplier" && $scope.model.Supplier != "") {
            $scope.errorSupplier = false;
        }
        if (SelectType == "CostValue" && $scope.model.CostValue != "") {
            $scope.errorCostValue = false;
        }
        if (SelectType == "CurrencyAsset" && $scope.model.CurrencyAsset != "") {
            $scope.errorCurrencyAsset = false;
        }

    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AssetCode == "") {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }

        if (data.StatusAsset == "") {
            $scope.errorStatusAsset = true;
            mess.Status = true;
        } else {
            $scope.errorStatusAsset = false;
        }


        if (data.AssetType == "") {
            $scope.errorAssetType = true;
            mess.Status = true;
        } else {
            $scope.errorAssetType = false;
        }

        if (data.Supplier == "") {
            $scope.errorSupplier = true;
            mess.Status = true;
        } else {
            $scope.errorSupplier = false;
        }

        if (data.CostValue == "") {
            $scope.errorCostValue = true;
            mess.Status = true;
        } else {
            $scope.errorCostValue = false;
        }

        if (data.CurrencyAsset == "") {
            $scope.errorCurrencyAsset = true;
            mess.Status = true;
        } else {
            $scope.errorCurrencyAsset = false;
        }

        return mess;
    }

  
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.deleteasset(id, function (rs) {rs=rs.data;
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
            $scope.reloadNoResetPage5();
        }, function () {
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }



    setTimeout(function () {

    }, 200);
});


app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {

    $scope.model = {
        ActCode: '',
        TotalMoney: '',
        Status: $rootScope.ListStatus.length > 0 ? $rootScope.ListStatus[0].Code : '',

    }
    $scope.initLoad = function () {
        dataservice.getDepart(function (result) {result=result.data;
            $scope.ListDepart = result;
        });
        dataservice.getBranch(function (result) {result=result.data;
            $scope.ListBranch = result;
        });
        dataservice.getCurrency(function (result) {result=result.data;
            $scope.ListCurrency = result;
        });
        dataservice.getBuyer(function (result) {result=result.data;
            $scope.ListBuyer = result;
        });

    }
    dataservice.getCatObjActivity(function (rs) {rs=rs.data;
        $scope.listCatObjActivity = rs;
        if ($scope.listCatObjActivity.length == 1) {
            $scope.model.ObjActCode = $scope.listCatObjActivity[0].Code;
        }
    })
    dataservice.getCatAct(function (result) {result=result.data;
        $scope.ListCatAct = result;

    });
    $scope.initLoad();
    $rootScope.ID = para
    $scope.initData = function () {
        $scope.model = para;
        $scope.model.BuyTime = $filter('date')(new Date($scope.model.BuyTime), 'dd/MM/yyyy');
        dataservice.getListFile($rootScope.TicketCode, function (rs) {rs=rs.data;

            $scope.model.listFile = rs;
        });
    }
    $scope.initData();
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/googleMap.html',
            controller: 'googleMap',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return $scope.model.LocationGps;
                }
            }
        });
        modalInstance.result.then(function (d) {
            if ($rootScope.map.Lat != '' && $rootScope.map.Lng != '') {
                $scope.model.GoogleMap = $rootScope.map.Lat + ',' + $rootScope.map.Lng;
            }
            $rootScope.map = [];
        }, function () { });
    }
    $scope.cancel = function () {

        $rootScope.IsAdd = false;
        $uibModalInstance.dismiss('cancel');
        $rootScope.TicketCode = null;
    }

    $scope.addFile = function () {
        
            $rootScope.TicketCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/file_add.html',
                controller: 'file_add',
                backdrop: 'static',
                size: '40'
            });
            modalInstance.result.then(function (d) {
                dataservice.getListFile($scope.model.TicketCode, function (rs) {rs=rs.data;
                    $scope.model.listFile = rs;
                });
            }, function () {
            });
      
    }
    $scope.deleteFile = function (id) {
        dataservice.deleteFile(id, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataservice.getListFile($scope.model.TicketCode, function (rs) {rs=rs.data;
                    $scope.model.listFile = rs;
                });
            }
        });
    }

    $scope.result = function (id) {
        if ($scope.model.ActCode != '' && $scope.model.ActCode != undefined && $scope.model.ActCode != null) {
            $rootScope.ActCode = $scope.model.ActCode;
            $rootScope.ObjActCode = $scope.model.ObjActCode;
            $rootScope.ObjCode = $scope.model.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/resultActivity.html',
                controller: 'resultActivity',
                backdrop: true,
                size: '70'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
                // $scope.reloadNoResetPage5();
            }, function () { });
        }
        else {
            App.toastrError(caption.ASSET_BUY_CURD_VALIDATE_CHOOSE_ACT);
        }


    }
    $scope.tableActivity = function () {
        $rootScope.ActCode = $scope.model.ActCode;
        $rootScope.ObjActCode = $scope.model.ObjActCode;
        $rootScope.ObjCode = $scope.model.TicketCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/tableActivity.html',
            controller: 'tableActivity',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
           
            dataservice.update($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                    $uibModalInstance.close();
                    $rootScope.TicketCode = null;
                    $rootScope.IsAdd = false;
                }
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Depart" && $scope.model.Depart != "") {
            $scope.errorDepart = false;
        }
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "Buyer" && $scope.model.Buyer != "") {
            $scope.errorBuyer = false;
        }
        if (SelectType == "ObjActCode" && $scope.model.ObjActCode != "") {
            $scope.errorObjActCode = false;
        }
        if (SelectType == "ActCode" && $scope.model.ActCode != "") {
            dataservice.insertLog($scope.model, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);

                }
            });
             $scope.errorActCode = false;
        }
        if (SelectType == "TotalMoney" && $scope.model.TotalMoney != "") {
            $scope.errorTotalMoney = false;
        }
    }
    function initAutocomplete() {
        var input = document.getElementById('address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            $scope.lat = place.geometry.location.lat();
            $scope.lng = place.geometry.location.lng();
            $scope.model.LocationGps = $scope.lat + "," + $scope.lng;
            $scope.$apply();
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }
    function convertFomartdate(dateTime) {
        var result = "";
        if (dateTime != null && dateTime != "") {
            result = $filter('date')(new Date(dateTime), 'dd/MM/yyyy');
        }
        return result;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.Depart == "") {
            $scope.errorDepart = true;
            mess.Status = true;
        } else {
            $scope.errorDepart = false;
        }

        if (data.Branch == "") {
            $scope.errorBranch = true;
            mess.Status = true;
        } else {
            $scope.errorBranch = false;
        }

        if (data.Buyer == "") {
            $scope.errorBuyer = true;
            mess.Status = true;
        } else {
            $scope.errorBuyer = false;
        }
        if (data.ObjActCode == "") {
            $scope.errorObjActCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjActCode = false;
        }
        if (data.ActCode == "") {
            $scope.errorActCode = true;
            mess.Status = true;
        } else {
            $scope.errorActCode = false;
        }
        if (data.TotalMoney == "") {
            $scope.errorTotalMoney = true;
            mess.Status = true;
        } else {
            $scope.errorTotalMoney = false;
        }
        return mess;
    };
    setTimeout(function () {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
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
            //var maxDate = new Date(selected.date.valueOf());
            //$('#datefrom').datepicker('setEndDate', maxDate);
        });
        initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 100);
});

app.controller('file_add', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataservice, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        //dataservice.generateTicketCode(function (result) {result=result.data;
        //    $scope.model.TicketCode = result;
        //});
        dataservice.genReqfile(function (rs) {rs=rs.data;
            $scope.model.FileCode = rs;
        });
    }
    $scope.initData();
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addformfile.validate()) {
            var file = document.getElementById("File").files[0];
            if (file == null || file == undefined) {
                App.toastrError(caption.COM_MSG_CHOSE_FILE);
            } else {
                var formData = new FormData();
                formData.append("fileUpload", file);
                formData.append("FileName", $scope.model.FileName);
                formData.append("FileCode", $scope.model.FileCode);
                formData.append("TicketCode", $rootScope.TicketCode);
                dataservice.insertFile(formData, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
});
app.controller('resultActivity', function ($scope, $rootScope, $confirm, $compile, $uibModalInstance, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {

    $scope.model = {
        AttrCode: '',
        AttrDataType: '',
        AttrUnit: '',

    }



    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    }

    $scope.model.ActCode = $rootScope.ActCode;
    $scope.model.ObjCode = $rootScope.ObjCode;
    $scope.model.ObjActCode = $rootScope.ObjActCode;

    $scope.initLoad = function () {
        dataservice.getItemAttrSetup($scope.model.ActCode, function (rs) {rs=rs.data;
            $scope.model.listAttrData = rs;
        });
        dataservice.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.ObjActCode, function (rs) {rs=rs.data;
            $scope.model.listAttrDataSetUp = rs;
        });
    }
    $scope.initLoad();


    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.resultActivity.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);

            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            else {
                dataservice.insertdata($scope.model, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        dataservice.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.ObjActCode, function (rs) {rs=rs.data;
                            $scope.model.listAttrDataSetUp = rs;
                        });
                    }
                });
            }
        }
    }
    $scope.delete = function (id) {
        dataservice.deleteAttrData(id, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                dataservice.getListActivityAttrData($scope.model.ObjCode, $scope.model.ActCode, $scope.model.ObjActCode, function (rs) {rs=rs.data;
                    $scope.model.listAttrDataSetUp = rs;
                });
            }
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AttrCode" && $scope.model.AttrCode != "") {

            for (var i = 0; i < $scope.model.listAttrData.length; i++) {
                $scope.model.AttrUnit = $scope.model.listAttrData[i].UnitCode;
                $scope.model.AttrDataType = $scope.model.listAttrData[i].DataTypeCode;
            }
            $scope.errorAttrCode = false;
        }

        if (SelectType == "AttrDataType" && $scope.model.AttrDataType != "") {
            $scope.errorAttrDataType = false;
        }

        if (SelectType == "AttrUnit" && $scope.model.AttrUnit != "") {
            $scope.errorAttrUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AttrCode == "") {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }

        if (data.AttrDataType == "") {
            $scope.errorAttrDataType = true;
            mess.Status = true;
        } else {
            $scope.errorAttrDataType = false;
        }

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }


        return mess;
    };
    setTimeout(function () {

    }, 200);
});
app.controller('tableActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model.ActCode = $rootScope.ActCode;
    $scope.model.ObjActCode = $rootScope.ObjActCode;
    $scope.model.TicketCode = $rootScope.ObjCode
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetBuy/JTableActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TicketCode = $scope.model.TicketCode;
                d.ObjActCode = $scope.model.ObjActCode;
                d.ActCode = $scope.model.ActCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(20)
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
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"ASSET_BUY_ACT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"ASSET_BUY_ACT_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationGPS').withTitle('{{"ASSET_BUY_GPS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserAct').withTitle('{{"ASSET_BUY_USER_ACT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"ASSET_BUY_RESULT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_BUY_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {rs=rs.data;

            $rootScope.TicketCode = rs.Object.TicketCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadTabTicket();
            }, function () {
            });
        });
    }
    $scope.delete = function (id) {
        var list = [];
        list.push(id);
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return list;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteItemActivity(para, function (rs) {rs=rs.data;
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
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadTabTicket();
        }, function () {
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});


//Hiển thị ảnh khi click double vào Kho
app.controller('viewImage', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initLoad = function () {
        $scope.image = para;
    }
    $scope.initLoad();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var lat = '';
    var lng = '';
    $scope.model = {
        Lat: '',
        Lng: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        $rootScope.map.Lat = lat;
        $rootScope.map.Lng = lng;
        $rootScope.map.Address = document.getElementById("startPlace").value;
        $uibModalInstance.close();
    }
    function initMap() {
        if (para) {
            lat = parseFloat(para.split(',')[0]);
            lng = parseFloat(para.split(',')[1]);
        }

        var centerPoint = { lat: lat == '' ? 16.05465498484808 : lat, lng: lng == '' ? 107.53517201377485 : lng };
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: 8, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: maps
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('startPlace'), options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            address = document.getElementById("startPlace").value;
            console.log(lat + ',' + lng);
            maps.setCenter({ lat: lat, lng: lng });
            if (marker) {
                marker.setPosition({ lat: lat, lng: lng });
            }
            else {
                marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: maps
                });
            }
            maps.setZoom(10);
        });

        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyAn-5Fd7KH4e78m1X7SNj5gayFcJKDoUow';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                address = data.results[0].formatted_address;
                document.getElementById("startPlace").value = address;
            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps
                });
            }
            maps.setZoom(10);
        })
    }
    setTimeout(function () {
        initMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});