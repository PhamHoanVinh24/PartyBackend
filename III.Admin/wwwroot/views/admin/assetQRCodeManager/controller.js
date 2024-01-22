var ctxfolder = "/views/admin/assetQRCodeManager";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/assetQRCodeManager";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);
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
        //Danh sách kho
        loadAsset: function (data, callback) {
            $http.get('/Admin/AssetQRCodeManager/LoadAsset?position=' + data).then(callback);
        },
        getListPosition: function (callback) {
            $http.get('/Admin/AssetQRCodeManager/GetListPosition').then(callback);
        },
        searchAsset: function (data, callback) {
            $http.post('/Admin/AssetQRCodeManager/SearchAsset', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetQRCodeManager/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    $scope.model = {
        ListAssetCode: [],
    };
    $scope.searchBoxModel = {
        FromDate: '',
        ToDate: '',
        AssetCode: '',
        Position: ''
    };
    $scope.QRlistAsset = [];
    $scope.listObjPrint = [];
    $scope.init = function () {
        dataservice.loadAsset($scope.searchBoxModel.Position, function (rs) {
            rs = rs.data;
            
            $scope.listAsset = rs;
            $scope.QRlistAsset = rs;
            setTimeout(function () {
                loadMultiSelectAsset();
            }, 10);
        });
        dataservice.getListPosition(function (rs) {
            rs = rs.data;
            $scope.listPosition = rs;
        });
    };
    $scope.init();
    $scope.searchAsset = function () {
        if ($scope.searchBoxModel.Position !== '' || $scope.searchBoxModel.FromDate !== '' || $scope.searchBoxModel.ToDate !== '') {
            dataservice.searchAsset($scope.searchBoxModel, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Object.length > 0) {
                        var countResult = 0;
                        for (var i = 0; i < rs.Object.length; i++) {
                            var checkExist = $scope.listObjPrint.find(function (element) {
                                if (element.Code === rs.Object[i].Code) return true;
                            });
                            if (!checkExist) {
                                $scope.listObjPrint.push(rs.Object[i]);
                                countResult++;
                            }
                        }
                        App.toastrSuccess(caption.ASSET_QRCODE_MANAGER_SEARCH_SUCCESS + rs.Object.length + caption.ASSET_QRCODE_MANAGER_FOUND_BOX + countResult + ' tài sản thành công');
                    } else {
                        App.toastrError(caption.ASSET_QRCODE_MANAGER_NOT_FOUND_BOX);
                    }
                }
            })
        } else {
            App.toastrError(caption.ASSET_QRCODE_MANAGER_ENTER);
        }
    };

    // view help detail
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

    $scope.changleSelect = function () {
        //$scope.init();
    };
    $scope.selectObjPrint = function (item) {
        item.IsCheck = !item.IsCheck;
        var lengthCheck = $filter('filter')($scope.listObjPrint, { 'IsCheck': true }).length;
        $scope.IsCheckAll = lengthCheck == $scope.listObjPrint.length;
    }
    $scope.selectAllObjPrint = function (isCheckAll) {
        $scope.listObjPrint.forEach(function (obj, index) {
            obj.IsCheck = isCheckAll;
        });
        $scope.model.IsRackPosition = false;
        $scope.model.IsBox = false;
    }
    $scope.deleteObjPrint = function () {
        var countDelete = 0;
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].IsCheck) {
                if ($scope.listObjPrint[i].Type == "WAREHOUSE") {
                    resetSelectMultiSelectWareHouse($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "FLOOR") {
                    resetSelectMultiSelectFloor($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "LINE") {
                    resetSelectMultiSelectLine($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "RACK") {
                    resetSelectMultiSelectRack($scope.listObjPrint[i].Code);
                }

                $scope.listObjPrint.splice(i, 1);
                countDelete++;
                i--;
            }
        }
        if (countDelete > 0) {
            App.toastrSuccess(caption.COM_DELETE_SUCCESS);
        } else {
            App.toastrError(caption.ASSET_QRCODE_MANAGER_CHOOSE_OBJ_DEL);
        }
        if ($scope.listObjPrint.length == 0) {
            $scope.IsCheckAll = false;
        }
    }
    $scope.printObjPrint = function () {
        var listPrint = [];
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].IsCheck) {
                var obj = {
                    Code: $scope.listObjPrint[i].Code,
                    Base64: document.getElementById($scope.listObjPrint[i].Code).getElementsByTagName('a')[0].getAttribute('href')
                };
                listPrint.push(obj);
            }
        }
        if (listPrint.length > 0) {
            var hiddenFrame = $('<iframe style = "width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            var listQrCode = "";
            var newWin = window.frames["printf"];
            for (var j = 0; j < listPrint.length; j++) {
                var str = listPrint[j].Code.replace(/_QUANGTRUNG/g, '');
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center"> ' +
                    '<img src="' + listPrint[j].Base64 + '"width="100" height="100"/> ' +
                    '<p style="font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all">' + str + '<p/>' +
                    '</div>';
            }

            doc.write('<style>@page{margin: 0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;margin-top:20px}</style>' + '<body onload="window.print()">' + listQrCode + '</body>');
            doc.close();
        } else {
            App.toastrError(caption.ASSET_QRCODE_MANAGER_CHOOSE_OBJ_PRINT);
        }
    };

    function loadMultiSelectAsset() {
        $("#asset-multiple-checkboxes").multiselect({
            nonSelectedText: caption.ASSET_QRCODE_MANAGER_CHOOSE_ASSET,
            allSelectedText: caption.ASSET_QRCODE_MANAGER_SELECT_ALL,
            nSelectedText: caption.ASSET_QRCODE_MANAGER_CHOOSE,
            maxHeight: 400,
            buttonWidth: '100%',
            disableIfEmpty: true,
            includeSelectAllOption: true,
            selectAllText: caption.ASSET_QRCODE_MANAGER_All,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            filterPlaceholder: caption.COM_BTN_SEARCH,
            onChange: function (option, checked) {
                var item = $scope.QRlistAsset.find(function (element) {
                    if (element.Code == $(option).val()) return true;
                });
                if (item) {
                    if (checked) {
                        $scope.listObjPrint.push(item);
                    } else {
                        //remove item print
                        for (var i = 0; i < $scope.listObjPrint.length; i++) {
                            if ($scope.listObjPrint[i].Code == item.Code) {
                                $scope.listObjPrint.splice(i, 1);
                                break;
                            }
                        }
                        //remove child print
                        removeChildPrintAsset(item.Code);
                    }
                }
            },
            onSelectAll: function () {
                $scope.QRlistAsset.forEach(function (obj, index) {
                    var checkExist = $scope.listObjPrint.find(function (element) {
                        if (element.Code == obj.Code) return true;
                    });
                    if (!checkExist) {
                        $scope.listObjPrint.push(obj);
                    }
                });
            },
            onDeselectAll: function () {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type == "ASSET") {
                        //remove child
                        removeChildPrintAsset($scope.listObjPrint[i].Code);

                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
            },
            templates: {
                li: '<li class="checkList"><a tabindex="0"><div class="aweCheckbox aweCheckbox-danger"><label for=""></label></div></a></li>'
            }
        });
        $('.multiselect-container div.aweCheckbox').each(function (index) {
            var id = 'multiselectAsset-' + index,
                $input = $(this).find('input');
            // Associate the label and the input
            $(this).find('label').attr('for', id);
            $input.attr('id', id);

            // Remove the input from the label wrapper
            $input.detach();

            // Place the input back in before the label
            $input.prependTo($(this));

            $(this).click(function (e) {
                // Prevents the click from bubbling up and hiding the dropdown
                e.stopPropagation();
            });
        });
    }
    function removeChildPrintAsset(code) {
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].Parent === code && $scope.listObjPrint[i].Type === "ASSET") {
                $scope.listObjPrint.splice(i, 1);
                i--;
            }
        }
    }
    function resetSelectMultiSelectWareHouse(code) {
        $('option:selected', $('#warehouse-multiple-checkboxes')).each(function (element) {
            if (code == $(this).val()) {
                $(this).removeAttr('selected').prop('selected', false);
                return;
            }
        });
        $('#warehouse-multiple-checkboxes').multiselect('refresh');
    }
    function addClassScrollFade() {
        $(".bootstrap-multiple-checkboxes").find('.multiselect-container').addClass("scroller-sm-fade");
    }
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        addClassScrollFade();
        loadDate();
    }, 10);
});
