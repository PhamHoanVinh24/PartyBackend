var ctxfolder = "/views/admin/staffOnline";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
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
        //insert: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Insert', data, callback).then(callback);
        //},
        //update: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Update', data).then(callback);
        //},
        //deleteItems: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/DeleteItems', data).then(callback);
        //},
        //delete: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Delete/' + data).then(callback);
        //},
        //getItem: function (data, callback) {
        //    $http.get('Admin/VCProductCategory/GetItem/' + data).then(callback);
        //},
        //getItemDetail: function (data, callback) {
        //    $http.get('Admin/VCProductCategory/GetItemDetail/' + data).then(callback);
        //},
        //getproductgroup: function (callback) {
        //    $http.post('Admin/VCProductCategory/GetProductGroup/').then(callback);
        //},
        //gettreedataLevel: function (callback) {
        //    $http.post('Admin/VCProductCategory/GetProductUnit/').then(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('Admin/VCProductCategory/UploadImage/', data, callback);
        //},
        GetListStaff: function (callback) {
            $http.post('/Admin/VCStaffPosition/GetListStaff').then(callback);
        },
        getStaffCheckIn: function (data, callback) {
            $http.post('/Admin/VCStaffPosition/getStaffCheckIn/', data).then(callback);
        },
        getStaffCheckInNotPaging: function (data, callback) {
            $http.post('/Admin/VCStaffPosition/GetStaffCheckInNotPaging/', data).then(callback);
        },


        //getStaffCheckIn1: function (data, callback) {
        //    $http.post('/Admin/VCStaffPosition/getStaffCheckIn1/', data).then(callback);
        //},
        getArea: function (callback) {
            $http.post('/Admin/Map/GetListArea').then(callback);
        },

    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.model = { StaffName: '', UserName: '' };
    $scope.modelPopUp = {
        Avatar: '',
        Name: '',
        Phone: '',
        CheckInTime: '',
        Position: '',
        CheckInDate: ''
    };

    var vectorArrowSource = new ol.source.Vector({});

    var vectorArrowLayer = new ol.layer.Vector({
        source: vectorArrowSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: '#B40404', width: 1 }),
            stroke: new ol.style.Stroke({ color: '#B40404', width: 4 })
        })
    });

    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
    var map;
    $scope.staffCodeOrName = {
        StaffCodeOrName: ''
    }
    $scope.staffInfoGroupByIdAndDate = [];
    $scope.Customers = [];
    $scope.reloadCount = 0;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/VCStaffPosition/GetStaffCheckIn/",
            beforeSend: function (jqXHR, settings) {

                App.blockUI({
                    target: "#tblData",
                    boxed: true,
                    message: 'loading...'
                });
                //if ($scope.reloadCount == 0) {
                //    $scope.reloadCount = $scope.reloadCount + 1;
                //    reloadNotPaging();
                //}
            },
            type: 'POST',
            data: function (d) {
                d.UserName = $scope.model.UserName;
                d.FromDate = $scope.model.fromDate;
                d.ToDate = $scope.model.toDate;
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#tblData");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        //.withOption('scrollX', '400px')
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
            //drawMarkerExist(data);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').notSortable().withTitle('{{"VCSP_LIST_COL_NAME" | translate}}').withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CompanyName').notSortable().withTitle('{{"VCSP_LIST_COL_COMPANY_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CheckInTime').notSortable().withTitle('{{"VCSP_LIST_COL_CHECK_IN_TIME" | translate}}').renderWith(function (data, type, full) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CompanyAddress').notSortable().withTitle('{{"VCSP_LIST_COL_COMPANY_ADDRESS" | translate}}').renderWith(function (data, type, full) {
        return data
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
        reloadNotPaging();
    }
    $scope.init = function () {
        initMap();
        hideToogle();
        dataservice.getArea(function (rs) {rs=rs.data;
            $rootScope.StaffAreas = rs.Object;
        });
        dataservice.GetListStaff(function (rs) {rs=rs.data;
            $scope.Customers = rs;
        });

    }
    $scope.init();
    $scope.toogleClick = function () {
        if ($('a[data-toggle="tab"]').hasClass("hidden")) {
            $('a[data-toggle="tab"]').removeClass("hidden");
            $(".tab-content").removeClass("hidden");
        } else {
            $('a[data-toggle="tab"]').addClass("hidden");
            $(".tab-content").addClass("hidden");
        }
    }
    //$scope.searchMap = function () {
    //    var place = autocomplete.getPlace();
    //    if (place == undefined) {
    //        App.toastrError("Vui lòng nhập địa chỉ chính xác!");
    //        return;
    //    }
    //    var lat = place.geometry.location.lat();
    //    var lng = place.geometry.location.lng();
    //    var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
    //    map.setView(new ol.View({
    //        center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
    //        zoom: 11
    //    }));
    //    map.getView().setZoom(15);
    //}
    function reloadNotPaging() {
        carSourceVector.clear();
        vectorArrowSource.clear();
        var searchData = {};
        searchData.UserName = $scope.model.UserName;
        searchData.FromDate = $scope.model.fromDate;
        searchData.ToDate = $scope.model.toDate;
        dataservice.getStaffCheckInNotPaging(searchData, function (rs) {rs=rs.data;
            $scope.staffInfoGroupByIdAndDate = rs;
            for (var indx = 0; indx < rs.length; indx++) {
                var list = rs[indx].Data;
                // tìm kiếm theo 1 thằng cụ thể mới vẽ
                if ($scope.model.UserName != "") {
                    // move to current staff gps

                    for (var indx1 = 0; indx1 < list.length; indx1++) {
                        if (indx1 == list.length - 1) {
                            if (list[indx1].CheckOutTime != "")
                                drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_yellow.png", indx1);
                            else
                                drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_start.png", indx1);
                        }
                        else if (indx1 == 0) {
                            drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/ic_start_flag.png", indx1);
                        }
                        else {
                            drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_gray.png", indx1);
                        }
                        if (indx1 > 0) {
                            drawLineExist(list[indx1], list[indx1 - 1]);
                        }
                    }
                }
                else {
                    if (list[list.length - 1].CheckOutTime != "")
                        drawMarkerExist(list[list.length - 1], "../../../images/logo/pinmap_yellow.png");
                    else
                        drawMarkerExist(list[list.length - 1], "../../../images/logo/pinmap_start.png");

                }

            }
        });
    }
    function drawMarkerExist(data, imgIconUrl) {
        var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
        if (s.length == 2) {
            var lng = parseFloat(s[1]);
            var lat = parseFloat(s[0]);

            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326',
                'EPSG:3857'));
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    rotation: 0,
                    // src: 'https://sv1.uphinhnhanh.com/images/2019/01/19/Webp.net-resizeimage.png'
                    src: imgIconUrl

                })),
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#000',
                    width: '0.2'
                }),
                text: new ol.style.Text({
                    font: 14 + 'px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    textBaseline: 'top',
                    stroke: new ol.style.Stroke({
                        color: '#000', width: '0.2'
                    }),
                    // get the text from the feature - `this` is ol.Feature
                    text: data.Name
                }),

            });

            var iconFeature = new ol.Feature({
                geometry: lonlat3857,
                id: data.Id,
                userId: data.IdUser,
                name: data.Name,
                phone: data.Phone,
                profilePicture: data.ProfilePicture,
                checkInGps: data.CheckInGps,
                checkInTime: data.CheckInTime,
                population: 4000,
                rainfall: 500,
                style: iconStyle,
                companyAddress: data.CompanyAddress,
                checkInDate: data.CheckInDate,
                companyName: data.CompanyName
            });
            iconFeature.setId(data.Id);
            iconFeature.setStyle(iconStyle);
            carSourceVector.addFeature(iconFeature);

        }
    }
    function drawMarkerExistByOneStaff(data, imgIconUrl, indx) {
        var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
        if (s.length == 2) {
            var lng = parseFloat(s[1]);
            var lat = parseFloat(s[0]);

            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326',
                'EPSG:3857'));
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    rotation: 0,
                    // src: 'https://sv1.uphinhnhanh.com/images/2019/01/19/Webp.net-resizeimage.png'
                    src: imgIconUrl

                })),
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#000',
                    width: '0.2'
                }),
                text: new ol.style.Text({
                    font: 14 + 'px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    textBaseline: 'top',
                    stroke: new ol.style.Stroke({
                        color: '#000', width: '0.2'
                    }),
                    // get the text from the feature - `this` is ol.Feature
                    text: data.CompanyName
                }),

            });
            //
            var iconFeature = new ol.Feature({
                geometry: lonlat3857,
                id: data.Id,
                userId: data.IdUser,
                name: data.Name,
                phone: data.Phone,
                profilePicture: data.ProfilePicture,
                checkInGps: data.CheckInGps,
                checkInTime: data.CheckInTime,
                population: 4000,
                rainfall: 500,
                style: iconStyle,
                companyAddress: data.CompanyAddress,
                checkInDate: data.CheckInDate,
                companyName: data.CompanyName
            });
            iconFeature.setId(data.Id);
            iconFeature.setStyle(iconStyle);
            carSourceVector.addFeature(iconFeature);
            if (indx == 0) {
                map.getView().fit(iconFeature.getGeometry(), map.getSize());
                map.getView().setZoom(15);
            }

        }
    }
    function drawLineExist(data, data1) {
        var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
        var s1 = data1.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
        if (s.length == 2 && s1.length == 2) {
            var lng = parseFloat(s[1]);
            var lat = parseFloat(s[0]);

            var lng1 = parseFloat(s1[1]);
            var lat1 = parseFloat(s1[0]);

            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));

            var lonlat3857_1 = new ol.geom.Point(ol.proj.transform([lng1, lat1], 'EPSG:4326', 'EPSG:3857'));

            var geometry = new ol.geom.LineString([ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'), ol.proj.transform([lng1, lat1], 'EPSG:4326', 'EPSG:3857')]);
            var featureLine = new ol.Feature({
                geometry: geometry
            });
            vectorArrowSource.addFeature(featureLine);

        }
    }
    function initMap() {
        var uluru = { lat: 20.99093210090554, lng: 105.80906867980957 };
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: 'http://picresize.com/images/rsz_user.png'
            }))
        });
        var vectorSource = new ol.source.Vector({
            features: []
        });
        var vectorLayerMarker = new ol.layer.Vector({
            source: vectorSource
        });
        // car layer
        carSourceVector = new ol.source.Vector({
            features: []

        });

        carLayerMarker = new ol.layer.Vector({
            source: carSourceVector
        });
        carLayerMarker.setZIndex(2);
        // path layer
        pathSourceVector = new ol.source.Vector({
            features: []
        });
        pathLayerMarker = new ol.layer.Vector({
            source: pathSourceVector
        });
        var view1 = new ol.View({
            //	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
            center: ol.proj.fromLonLat([105.8102273, 20.99113243]),
            zoom: 15
        });
        var googleLayer = new ol.layer.Tile({
            source: new ol.source.OSM({
                url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                attributions: [
                    new ol.Attribution({ html: '© Google' }),
                    new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
                ]
            })
        });
        map = new ol.Map({
            target: 'map',
            layers: [

                googleLayer,
                vectorArrowLayer,
                vectorLayerMarker,
                carLayerMarker
            ],
            view: view1
        });
        //map.on('moveend', checknewzoom);

        element = document.getElementById('popupBooking');
        popup = new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10]
        });
        map.addOverlay(popup);
        map.on('click', function (evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });

            if (feature) {
                var userId = feature.get('userId');
                var checkInDate = feature.get('checkInDate');
                $scope.modelPopUp = {
                    Avatar: feature.get('profilePicture'),
                    Name: feature.get('name'),
                    Phone: feature.get('phone'),
                    CheckInTime: feature.get('checkInTime'),
                    Position: feature.get('companyAddress'),
                    CheckInDate: checkInDate,
                    CompanyName: feature.get('companyName')
                };
                $scope.modelPopUpList = [];

                var title = caption.VCSP_TITLE_MAP_ON;
                var list = $scope.staffInfoGroupByIdAndDate;
                for (var indx = 0; indx < list.length; ++indx) {
                    if (list[indx].IdUser == userId && list[indx].CheckInDate == checkInDate) {
                        $scope.modelPopUpList = list[indx].Data;
                    }
                }
                var coordinates = feature.getGeometry().getCoordinates();
                popup.setPosition(coordinates);
                $('#title').html(title);
                $('#Modal_Info').modal('show');
                $scope.$apply();
            }
            else {
                $(element).popover('destroy');
                $("#listrm").attr("hidden", "true");
                $("#romoocstatus").attr("hidden", "true");
                $("#parkinghst").attr("hidden", "true");
                $('#rm1Table').empty();
                $('#parkingTable').empty();
            }
        });
    }
    function hideToogle() {
        $('a[data-toggle="tab"]').addClass("hidden");
        $(".tab-content").addClass("hidden");
    }
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#ToDate').datepicker('setStartDate', maxDate);
        });
    }
    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 40;
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
    function menuLeftClick() {
        $(".menu-toggle").click(function (e) {
            mapReSize();
        });
    }
    setTimeout(function () {
        loadDate();
        setHeightMap();
        menuLeftClick();
    }, 200);
});


