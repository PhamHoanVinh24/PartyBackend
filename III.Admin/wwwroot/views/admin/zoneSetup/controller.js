var ctxfolder = "/views/admin/zoneSetup";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
        getZoneStatus: function (callback) {
            $http.post('/Admin/ZoneSetup/GetZoneStatus').then(callback);
        },

        getItem: function (data, callback) {
            $http.post('/Admin/ZoneSetup/GetItem?id=' + data).then(callback);
        },

        insert: function (data, callback) {
            submitFormUpload('/Admin/ZoneSetup/Insert', data, callback);
        },

        update: function (data, callback) {
            submitFormUpload('/Admin/ZoneSetup/Update', data, callback);
        },

        delete: function (data, callback) {
            $http.post('/Admin/ZoneSetup/Delete?id=' + data).then(callback);
        },

        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },

        getDeviceIOT: function (callback) {
            $http.post('/Admin/ZoneSetup/GetDeviceIOT').then(callback);
        },

        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },

        assignDeviceToZone: function (data, callback) {
            $http.post('/Admin/ZoneSetup/AssignDeviceToZone', data).then(callback);
        },

        getDeviceInZone: function (data, callback) {
            $http.post('/Admin/ZoneSetup/GetDeviceInZone?zoneCode=' + data).then(callback);
        },

        deleteDeviceInZone: function (data, callback) {
            $http.post('/Admin/ZoneSetup/DeleteDeviceInZone?id=' + data).then(callback);
        }
    }

});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                ZoneCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                ZoneName: {
                    required: true,
                    regx: /^[^\s].*/
                },

            },
            messages: {
                ZoneCode: {
                    required: "Mã khu vực không để trống",
                    regx: "Mã không chứa ký tự đặc biệt, khoảng trắng và có dấu"
                },
                ZoneName: {
                    required: "Tên khu vực không để trống",
                    regx: "Tên khu vực không chứa khoảng trắng đầu dòng"
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
    $rootScope.status = [{ Code: 1, Name: 'Có' }, { Code: 2, Name: 'Không' }];

    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.isAdded = false;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/CameraList/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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

});

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        ZoneName: '',
        ZoneStatus: '',
        ZoneAddress: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ZoneSetup/jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ZoneName = $scope.model.ZoneName;
                d.ZoneStatus = $scope.model.ZoneStatus;
                d.ZoneAddress = $scope.model.ZoneAddress;
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

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneCode').withTitle('{{"Mã khu vực" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneName').withTitle('{{"Tên khu vực" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneStatus').withTitle('{{"Trạng thái" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneImage').notSortable().withTitle('{{"Hình ảnh" | translate}}').renderWith(function (data, type) {
        return '<a href="' + data + '" target="_blank"><img class="img-circle" style="max-height: 100%; max-width: 100%; height: 50px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + '></a>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAddressTxt').withTitle('{{"Địa chỉ" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneDesc').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {

        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap w30').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $scope.isSearch = false;

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }

    $scope.initData = function () {
        dataservice.getZoneStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }
    $scope.initData();

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.add = function () {
        $rootScope.Id = '';
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
    }

    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            $rootScope.ZoneCode = rs.ZoneCode;
            $rootScope.isAdded = true;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });
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
            $scope.reload();
        }, function () {
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        ZoneCode: '',
        ZoneName: '',
        ZoneStatus: '',
        ZoneAddressTxt: '',
        ZoneAddressGps: '',
        ZoneDesc: '',
    }

    $scope.initData = function () {
        $rootScope.isAdded = false;
        $rootScope.ZoneCode = "";
        dataservice.getZoneStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("caption.CMS_ITEM_MSG_IMG_FORMAT");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;
                }
            }

            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("ZoneCode", $scope.model.ZoneCode);
            formData.append("ZoneName", $scope.model.ZoneName);
            formData.append("ZoneStatus", $scope.model.ZoneStatus);
            formData.append("ZoneAddressTxt", $scope.model.ZoneAddressTxt);
            formData.append("ZoneAddressGps", $scope.model.ZoneAddressGps);
            formData.append("ZoneDesc", $scope.model.ZoneDesc);

            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.ZoneStatus == "" || data.ZoneStatus == null) {
            $scope.errorZoneStatus = true;
            mess.Status = true;
        } else {
            $scope.errorZoneStatus = false;

        }

        return mess;
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "STATUS" && $scope.model.ZoneStatus != "") {
            $scope.errorZoneStatus = false;
        }
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.ZoneAddressGps != '') {
                        return {
                            lt: parseFloat($scope.model.ZoneAddressGps.split(',')[0]),
                            lg: parseFloat($scope.model.ZoneAddressGps.split(',')[1]),
                            address: $scope.model.ZoneAddressTxt,
                        };
                    }
                    else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.ZoneAddressGps = d.lat + ',' + d.lng;
                $scope.model.ZoneAddressTxt = d.address;
            }
        }, function () { });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $filter, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.model = {
        ZoneCode: '',
        ZoneName: '',
        ZoneStatus: '',
        ZoneAddressTxt: '',
        ZoneAddressGps: '',
        ZoneDesc: '',
    }

    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            debugger
            $scope.model = rs;
        });

        dataservice.getZoneStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
    }

    $scope.initData();

    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("caption.CMS_ITEM_MSG_IMG_FORMAT");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status && $scope.addform.validate()) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;
                }
            }
            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("ZoneCode", $scope.model.ZoneCode);
            formData.append("ZoneName", $scope.model.ZoneName);
            formData.append("ZoneStatus", $scope.model.ZoneStatus);
            formData.append("ZoneAddressTxt", $scope.model.ZoneAddressTxt);
            formData.append("ZoneAddressGps", $scope.model.ZoneAddressGps);
            formData.append("ZoneDesc", $scope.model.ZoneDesc);
            dataservice.update(formData, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.ZoneStatus == "" || data.ZoneStatus == null) {
            $scope.errorZoneStatus = true;
            mess.Status = true;
        } else {
            $scope.errorZoneStatus = false;

        }

        return mess;
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "STATUS" && $scope.model.ZoneStatus != "") {
            $scope.errorZoneStatus = false;
        }
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.ZoneAddressGps != '') {
                        return {
                            lt: parseFloat($scope.model.ZoneAddressGps.split(',')[0]),
                            lg: parseFloat($scope.model.ZoneAddressGps.split(',')[1]),
                            address: $scope.model.ZoneAddressTxt,
                        };
                    }
                    else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.ZoneAddressGps = d.lat + ',' + d.lng;
                $scope.model.ZoneAddressTxt = d.address;
            }
        }, function () { });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('google-map', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';


    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }

    $scope.initMap = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
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

    $scope.initMap();

    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 200;
        $("#map").css({
            'max-height': maxHeightMap,
            'height': maxHeightMap,
            'overflow': 'auto',
        });
        mapReSize();
    }

    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }

    function initData() {
        //init
        if (para) {
            lat = para.lt != '' ? para.lt : $rootScope.latDefault;
            lng = para.lg != '' ? para.lg : $rootScope.lngDefault;
            address = para.lg != '' ? para.address : $rootScope.addressDefault;
            document.getElementById("startPlace").value = address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        var centerPoint = { lat: lat, lng: lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
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

        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);

        //Map change
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
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });

        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyCPRaodudlDHg-o4K4WzGouLXcaKjG5gYY';
            lat = point.lat;
            lng = point.lng;

            dataservice.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>Thông tin</b> <br/>" + rs.Object;
                    infowindow.setContent(html);
                    infowindow.open(map, marker, html);
                    document.getElementById("startPlace").value = rs.Object;
                    address = rs.Object;
                }
            })
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }

    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('deviceIOT', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.model = {
        DeviceCode: '',
        Status: '',
        ManagerId: '',
        Position: '',
        BeginTime: '',
        EndTime: '',
        ZoneCode: $rootScope.ZoneCode
    }

    $scope.lstDevice = [];

    $scope.initData = function () {
        dataservice.getZoneStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })

        dataservice.getDeviceIOT(function (rs) {
            rs = rs.data;
            $scope.lstDevice = rs;
        })

        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.lstManger = rs;
        })

        dataservice.getDeviceInZone($rootScope.ZoneCode, function (rs) {
            rs = rs.data;
            $scope.lstDeviceInZone = rs;
        })
    }

    $scope.initData();

    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("caption.CMS_ITEM_MSG_IMG_FORMAT");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.addDevice = function () {
        if (!$rootScope.isAdded) {
            return App.toastrError("Vui lòng thêm khu vực trước!");
        }
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status && $scope.addform.validate()) {
            dataservice.assignDeviceToZone($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataservice.getDeviceInZone($rootScope.ZoneCode, function (rs) {
                        rs = rs.data;
                        $scope.lstDeviceInZone = rs;
                    })
                }
            });
        }
    }

    $scope.deleteDeviceOutZone = function (id) {
        dataservice.deleteDeviceInZone(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataservice.getDeviceInZone($rootScope.ZoneCode, function (rs) {
                    rs = rs.data;
                    $scope.lstDeviceInZone = rs;
                })
            }
        })
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.DeviceCode == "" || data.DeviceCode == null) {
            $scope.errorDeviceCode = true;
            mess.Status = true;
        } else {
            $scope.errorDeviceCode = false;
        }

        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        return mess;
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "DeviceCode" && $scope.model.DeviceCode != "") {
            $scope.errorDeviceCode = false;
        }

        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.ZoneAddressGps != '') {
                        return {
                            lt: parseFloat($scope.model.ZoneAddressGps.split(',')[0]),
                            lg: parseFloat($scope.model.ZoneAddressGps.split(',')[1]),
                            address: $scope.model.ZoneAddressTxt,
                        };
                    }
                    else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.ZoneAddressGps = d.lat + ',' + d.lng;
                $scope.model.ZoneAddressTxt = d.address;
            }
        }, function () { });
    }

    function initDateTime() {
        $("#startTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endTime').datepicker('setStartDate', maxDate);
        });
        $("#endTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startTime').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});
