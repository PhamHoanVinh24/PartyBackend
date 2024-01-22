var ctxfolder = "/views/admin/map";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngSanitize', "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        //search: function (data, callback) {
        //    $http.post('/Admin/Map/search/', data).then(callback);
        //},
        //getCustomerGroup: function (callback) {
        //    $http.post('/Admin/Map/getCustomerGroup').then(callback);
        //},
        //getCustomerStatus: function (callback) {
        //    $http.post('/Admin/Map/GetCustomerStatus').then(callback);
        //},
        //getArea: function (callback) {
        //    $http.post('/Admin/Map/GetListArea').then(callback);
        //},
        //getCustomerType: function (callback) {
        //    $http.post('/Admin/Map/GetListCutomerType').then(callback);
        //},
        //getCustomerRole: function (callback) {
        //    $http.post('/Admin/Map/GetListCutomerRole').then(callback);
        //},


        getAllData: function (data, callback) {
            $http.get('/Admin/Map/GetAll?objType=' + data).then(callback);
        },


        //Customer
        searchCustomer: function (data, callback) {
            $http.post('/Admin/MapCustomer/SearchCustomer/', data).then(callback);
        },
        getAllCustomer: function (callback) {
            $http.post('/Admin/MapCustomer/GetAllCustomer').then(callback);
        },
        getCustomerGroup: function (callback) {
            $http.post('/Admin/MapCustomer/GetCustomerGroup').then(callback);
        },
        getCustomerStatus: function (callback) {
            $http.post('/Admin/MapCustomer/GetCustomerStatus').then(callback);
        },
        getArea: function (callback) {
            $http.post('/Admin/MapCustomer/GetListArea').then(callback);
        },
        getCustomerType: function (callback) {
            $http.post('/Admin/MapCustomer/GetListCutomerType').then(callback);
        },
        getCustomerRole: function (callback) {
            $http.post('/Admin/MapCustomer/GetListCutomerRole').then(callback);
        },

        //Supplier
        getAllSupplier: function (callback) {
            $http.post('/Admin/MapSupplier/GetAllSupplier/').then(callback);
        },
        searchSupplier: function (data, callback) {
            $http.post('/Admin/MapSupplier/SearchSupplier/', data).then(callback);
        },
        getSupplierGroup: function (callback) {
            $http.post('/Admin/MapSupplier/GetSupplierGroup').then(callback);
        },
        getSupplierStatus: function (callback) {
            $http.post('/Admin/MapSupplier/GetSupplierStatus').then(callback);
        },
        getAreaSupplier: function (callback) {
            $http.post('/Admin/MapSupplier/GetListAreaSupplier').then(callback);
        },
        getSupplierType: function (callback) {
            $http.post('/Admin/MapSupplier/GetListSupplierType').then(callback);
        },
        getSupplierRole: function (callback) {
            $http.post('/Admin/MapSupplier/GetListSupplierRole').then(callback);
        },

        //Store
        getAllWareHouse: function (callback) {
            $http.post('/Admin/MapStore/GetAllWareHouse/').then(callback);
        },
        searchStore: function (data, callback) {
            $http.post('/Admin/MapStore/SearchStore/', data).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $filter, dataservice, $cookies, $translate) {
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
        });
    });
    //Customer
    if (isMapCustomer) {
        $rootScope.CustomerGroup = [];
        $rootScope.StatusData = [];
        $rootScope.CustomerAreas = [];
        $rootScope.CustomerTypes = [];
        $rootScope.CustomerRoles = [];
        $rootScope.objType = [];
        $rootScope.IsMapCustomer = isMapCustomer;
        dataservice.getCustomerGroup(function (rs) {
            rs = rs.data;
            $rootScope.CustomerGroup = rs;
        })
        dataservice.getCustomerStatus(function (rs) {
            rs = rs.data;
            $rootScope.StatusData = rs;
        });
        dataservice.getArea(function (rs) {
            rs = rs.data;
            $rootScope.CustomerAreas = rs.Object;
        });
        dataservice.getCustomerType(function (rs) {
            rs = rs.data;
            $rootScope.CustomerTypes = rs.Object;
        });
        dataservice.getCustomerRole(function (rs) {
            rs = rs.data;
            $rootScope.CustomerRoles = rs.Object;
        });
        dataservice.getAllCustomer(function (rs) {
            rs = rs.data;
            $rootScope.objType = rs.Object;
        });
    }
    //Store
    else if (isMapStore) {
        dataservice.getAllWareHouse(function (rs) {
            rs = rs.data;
            $rootScope.objType = rs.Object;
        });
        $rootScope.IsMapStore = isMapStore;
    }
    //Supplier
    else {
        $rootScope.SupplierGroup = [];
        $rootScope.SupplierStatusData = [];
        $rootScope.SupplierAreas = [];
        $rootScope.SupplierTypes = [];
        $rootScope.SupplierRoles = [];
        $rootScope.objType = [];
        dataservice.getSupplierGroup(function (rs) {
            rs = rs.data;
            $rootScope.SupplierGroup = rs;
        })
        dataservice.getSupplierStatus(function (rs) {
            rs = rs.data;
            $rootScope.SupplierStatusData = rs;
        });
        dataservice.getAreaSupplier(function (rs) {
            rs = rs.data;
            $rootScope.SupplierAreas = rs.Object;
        });
        dataservice.getSupplierType(function (rs) {
            rs = rs.data;
            $rootScope.SupplierTypes = rs.Object;
        });
        dataservice.getSupplierRole(function (rs) {
            rs = rs.data;
            $rootScope.SupplierRoles = rs.Object;
        });
        dataservice.getAllSupplier(function (rs) {
            rs = rs.data;
            $rootScope.objType = rs.Object;
        });
        $rootScope.IsMapSupplier = isMapSupplier;
    }
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Map/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter) {
    /* #region  Map */
    $scope.model = {
        //Color: '',
        //Size: '',
        CusCode: '',
        Picture: '',
        Name: '',
        Note: ''
    }
    $scope.listParkingTemp = [];
    $scope.lisPicture = [
        {
            'name': 'pinmap_red',
            'url': '/images/map/pinmap_red.png'
        },
        {
            'name': 'pinmap_start',
            'url': '/images/map/pinmap_start.png'
        }, {
            'name': 'pinmap_orange',
            'url': '/images/map/pinmap_orange.png'
        }, {
            'name': 'pinmap_violet',
            'url': '/images/map/pinmap_violet.png'
        }
    ];

    var map;
    var fields_vector_source;
    //var isDraw = false;
    //var isOpen = false;
    var draw;
    //var vectorIcon2 = new ol.source.Vector({});
    //var vectorIcon3 = new ol.source.Vector({});
    //var ibs = 10;
    //var path = [];
    //var isBatch = true;
    //var objnew = {};
    var parkingTemplayer = new ol.source.Vector({});
    var count = 0;
    //$scope.person = {};
    var drawSV = new ol.source.Vector({ wrapX: false });
    var drawLV = new ol.layer.Vector({
        source: drawSV
    });
    var typeSelect = document.getElementById('type');
    var addPacking = document.getElementById('add_packing');
    var input = document.getElementById('autocomplete');
    var autocomplete = new google.maps.places.Autocomplete(input);
    var bounds = new google.maps.LatLngBounds();

    var element = document.getElementById('popup');
    var pos = ol.proj.fromLonLat([106.68479919433594, 10.897367896986843]);
    var popup = new ol.Overlay({
        element: element,
        position: pos,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, 50]

    });
    var config = {
        init: function () {
            config.loadMap();
            config.hideMenuRight();
            config.loadData();
            config.mapClick();
            config.pointMap();
            config.searchMap();
            config.resetDrag();
            config.toogleClick();
            config.save();
            config.drag();
            config.tabClick();
            config.addParkingTemp();
            config.deletedParkingTemp();
            config.setHeightMap();
            config.menuLeftClick();
            config.searchSupplier();
            config.searchCustomer();
            config.searchStore();
        },

        //load map
        loadMap: function () {


            fields_vector_source = new ol.source.Vector({});

            vectorSource1 = new ol.source.Vector({});
            //For layer sources that provide pre-rendered, tiled images in grids that are organized by zoom levels for specific resolutions.
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });

            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    LayerMap,
                    new ol.layer.Vector({
                        source: fields_vector_source
                    })
                    //test
                    ,
                    new ol.layer.Vector({
                        source: vectorSource1
                    }),
                    new ol.layer.Vector({
                        source: parkingTemplayer
                    })

                ],
                view: new ol.View({
                    center: ol.proj.transform([106.68479919433594, 10.897367896986843], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            map.addLayer(drawLV);
            map.addOverlay(popup);

            //hide and show icon 
            document.getElementById("hide-poi").checked = true;
            document.getElementById("show-poi").checked = false;
            document.getElementById('hide-poi').addEventListener('click', function () {
                LayerMap.setSource(googleLayer);
                document.getElementById("show-poi").checked = false;
            });
            document.getElementById('show-poi').addEventListener('click', function () {
                LayerMap.setSource(layerGoogle);
                document.getElementById("hide-poi").checked = false;
            });
            //chuyeenr map
            document.getElementById('show-OSM').addEventListener('click', function osm() {
                LayerMap.setSource(OSM);
                document.getElementById("show-gg").checked = false;
            });
            document.getElementById('show-gg').addEventListener('click', function googleMap() {
                LayerMap.setSource(googleLayer);
                document.getElementById("show-OSM").checked = false;
                document.getElementById("hide-poi").checked = true;
                document.getElementById("show-poi").checked = false;
            });
        },

        //style drag
        styleDrag: function () {
            var zoom = map.getView().getZoom();
            var font_size = zoom * 1;
            var coordinates = this.getGeometry().getInteriorPoint().getCoordinates();
            var k = new ol.geom.Point(coordinates);
            var image = config.loadImage(this.get('Icon'));
            return [
                new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: this.get('fill_color')
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#7ebdda",
                        width: this.get('stroke_width')
                    }),
                    text: new ol.style.Text({
                        font: font_size + 'px Calibri,sans-serif',
                        fill: new ol.style.Fill({ color: "#0095ff" }),
                        textBaseline: 'top',
                        stroke: new ol.style.Stroke({
                            color: '#0095ff', width: '1'
                        }),
                        text: map.getView().getZoom() > 12 ? this.get('description') : ''
                    }),
                    zIndex: 1000
                }),
                new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: [0.7, 1],
                        opacity: 6,
                        scale: 30 / image.height,
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        src: 'data:image/svg+xml,' + encodeURIComponent(svgIcon)
                    })),
                    geometry: k
                })
            ];
        },

        //load data in map
        loadData: function () {
            var styles3 = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.1)'
                    }),
                    image: new ol.style.Icon(({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'data:image/svg+xml,' + encodeURIComponent(svgIcon)
                    }))
                }),
            ];
            vectorSource1 = new ol.source.Vector({});
            var vectorIcon = new ol.source.Vector({});

            centervier = [];
            vnfields = [];
            var iconFeatures = [];
            if (isMapCustomer) {
                config.loadDataCustomer();
            } else if (isMapSupplier) {
                config.loadDataSupplier();
            } else if (isMapStore) {
                config.loadDataStore();
            }

            var vectorLayer1 = new ol.layer.Vector({
                source: vectorSource1,
                style: styles3
            });

            vectorLayer2 = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            vectorLayer3 = new ol.layer.Vector({
                source: parkingTemplayer,
                style: styles3
            });

            map.addLayer(vectorLayer1);
            map.addLayer(vectorLayer2);
            map.addLayer(vectorLayer3);
        },

        //map click
        mapClick: function () {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature) {
                    var coordinates = feature.getGeometry().getCoordinates();
                    var pixelCoordinates = map.getPixelFromCoordinate(coordinates[0][0]);
                    popup.setPosition(coordinates);
                    var data = feature.get('title');
                    if (data != null && data != "") {
                        //map.getView().fit(feature.getGeometry(), map.getSize());
                        //map.getView().setZoom(13);

                        var object = {
                            title: feature.get('title'),
                            icon: feature.get('Icon'),
                            Code: feature.get('Code'),
                            Name: feature.get('Name'),
                            AreaTxt: feature.get('AreaTxt'),
                            GroupTxt: feature.get('GroupTxt'),
                            RoleTxt: feature.get('RoleTxt'),
                            TypeTxt: feature.get('TypeTxt'),
                            Image: feature.get('Image')
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: 'static',
                            size: '30',
                            resolve: {
                                para: function () {
                                    return object;
                                }
                            },
                            // Set the modal's position based on the icon's coordinates
                            // windowClass: 'modal-position',
                        });
                        // Position the modal based on the icon's coordinates
                        modalInstance.rendered.then(function () {
                            var modalElement = document.querySelector('.modal-dialog');
                            var body = document.querySelector('body');
                            var modalContent = modalElement.querySelector('.modal-content');
                            var modalWidth = modalContent.offsetWidth;
                            var bodyWidth = body.offsetWidth;
                            var leftPosition = pixelCoordinates[0] - bodyWidth / 2 + modalWidth / 2; // Adjust for centering
                            var topPosition = pixelCoordinates[1] - 300; // Adjust for on top
                            modalElement.style.left = leftPosition + 'px';
                            modalElement.style.top = topPosition + 'px';
                            console.log(pixelCoordinates);
                        });
                        modalInstance.result.then(function (d) {
                        }, function () { });
                    }
                }
            });
        },

        //point to map
        pointMap: function () {
            map.on('pointermove', function (e) {
                if (e.dragging) {
                    $(element).popover('destroy');
                    return;
                }
                var pixel = map.getEventPixel(e.originalEvent);
                var hit = map.hasFeatureAtPixel(pixel);
                map.getTarget().style.cursor = hit ? 'pointer' : '';
            });
        },


        //search map
        searchMap: function () {
            $('#TimKiem').click(function () {
                var place = autocomplete.getPlace();

                var a = bounds.extend(place.geometry.location);
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                map.setView(new ol.View({
                    center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }));
                map.getView().setZoom(15);
            })
        },


        //drag
        drag: function () {
            $('#draw').click(function () {
                map.removeInteraction(draw);
                typeSelect.value = 'Polygon';
                config.addInteraction();
            })
        },

        //reset drag
        resetDrag: function () {
            $('#refresh').click(function () {
                var features = drawLV.getSource().getFeatures();
                if (features != null && features.length > 0) {

                    drawLV.getSource().removeFeature(features[features.length - 1]);

                }
                map.addOverlay(popup);
                map.removeInteraction(draw);
                typeSelect.value = 'None';
                config.addInteraction();
            })
        },

        //remove drag
        cancelDrag: function () {
            var features = drawLV.getSource().getFeatures();
            if (features != null && features.length > 0) {

                for (x in features) {
                    drawLV.getSource().removeFeature(features[x]);
                }
            }

            map.addOverlay(popup);

            map.removeInteraction(draw);
            typeSelect.value = 'None';
            config.addInteraction();
        },


        //add interaction
        addInteraction: function () {
            var value = typeSelect.value;
            if (value !== 'None') {
                draw = new ol.interaction.Draw({
                    source: drawSV,
                    type: (typeSelect.value)
                });
                map.addInteraction(draw);
            }
        },

        //toggleTab click
        toogleClick: function () {
            $('.mini-submenu').on('click', function () {
                if ($('.tab-header').hasClass("hidden")) {
                    $('.tab-header').removeClass("hidden");
                    $("#tab-content-map").removeClass("hidden");
                } else {
                    $('.tab-header').addClass("hidden");
                    $("#tab-content-map").addClass("hidden");
                }
            });
        },


        //hide menu
        hideMenuRight: function () {
            $('.tab-header').addClass("hidden");
            $("#tab-content-map").addClass("hidden");
        },

        //customer
        searchCustomer: function () {
            $('#customerSearch').click(function () {
                config.loadDataCustomer();
            });
        },
        loadDataCustomer: function () {
            var areas = [];
            var groups = [];
            var roles = [];
            var types = [];
            for (var indx = 0; indx < $rootScope.CustomerGroup.length; ++indx) {
                if ($rootScope.CustomerGroup[indx].checked == true)
                    groups.push($rootScope.CustomerGroup[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.CustomerAreas.length; ++indx) {
                if ($rootScope.CustomerAreas[indx].checked == true)
                    areas.push($rootScope.CustomerAreas[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.CustomerRoles.length; ++indx) {
                if ($rootScope.CustomerRoles[indx].checked == true)
                    roles.push($rootScope.CustomerRoles[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.CustomerTypes.length; ++indx) {
                if ($rootScope.CustomerTypes[indx].checked == true)
                    types.push($rootScope.CustomerTypes[indx].Code);
            }
            $scope.modelSearch = {
                areas: areas,
                groups: groups,
                roles: roles,
                types: types,
                customerCode: $scope.CustomerName
            }
            dataservice.searchCustomer($scope.modelSearch, function (rs) {
                rs = rs.data;
                if (rs.length == 1) {
                    var list = rs[0].list;
                    if (list.length == 0) {
                        App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                    }
                    else {
                        vectorSource1.clear();
                        for (var indx1 = 0; indx1 < list.length; ++indx1) {
                            var data = list[indx1].MapDataGis;
                            try {
                                //
                                var parse = JSON.parse(data.PolygonGPS);
                                var title = data.Title;
                                var fill_color = parse.properties.fill_color;
                                var font_size = parse.properties.font_size;
                                var Icon = document.location.origin + data.Icon;
                                var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                var feature = new ol.Feature(polygon1);
                                feature.setId(data.Id);
                                feature.getGeometry();
                                ////
                                var center = feature.getProperties();
                                var bounds = center.geometry.getExtent();
                                feature.set('point', parse.gis_data[0][0]);
                                feature.set('description', title);
                                feature.set('title', title);
                                if (fill_color.includes('rgba')) {
                                    feature.set('fill_color', fill_color);
                                    feature.set('stroke_color', fill_color);
                                }
                                else {
                                    feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                    feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                }

                                feature.set('stroke_width', "0.2");
                                feature.set('text_fill', "#000000");
                                feature.set('text_stroke_color', "#000000");
                                feature.set('text_stroke_width', "0");
                                feature.set('font_size', 12);
                                feature.set('zindex', "30");
                                feature.set('Image', Image);
                                feature.set('Icon', Icon);

                                feature.set('Code', list[indx1].Code);
                                feature.set('Name', list[indx1].Name);
                                feature.set('AreaTxt', list[indx1].AreaTxt);
                                feature.set('GroupTxt', list[indx1].GroupTxt);
                                feature.set('RoleTxt', list[indx1].RoleTxt);
                                feature.set('TypeTxt', list[indx1].TypeTxt);
                                feature.set('Image', data.Image);
                                feature.setStyle(config.styleDrag);
                                vectorSource1.addFeature(feature);
                                if (data != null && data.IsDefault == true) {
                                    map.getView().fit(feature.getGeometry(), map.getSize());
                                    map.getView().setZoom(16.4);
                                }

                            }
                            catch (Exc) {
                                console.log("bug");
                            }
                        }
                    }
                }
                else if (rs.length > 1) {
                    vectorSource1.clear();
                    for (var indx = 0; indx < rs.length; ++indx) {
                        var list = rs[indx].list;
                        //console.log(list.length);
                        if (list.length > 0) {
                            var checkMove = true;
                            ////
                            for (var indx1 = 0; indx1 < list.length; ++indx1) {
                                var data = list[indx1].MapDataGis;
                                //console.log(data);
                                try {
                                    //
                                    var parse = JSON.parse(data.PolygonGPS);
                                    var title = data.Title;
                                    var fill_color = parse.properties.fill_color;
                                    var font_size = parse.properties.font_size;
                                    var Icon = document.location.origin + data.Icon;
                                    var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                    var feature = new ol.Feature(polygon1);
                                    feature.setId(data.Id);
                                    feature.getGeometry();
                                    ////
                                    var center = feature.getProperties();
                                    var bounds = center.geometry.getExtent();
                                    feature.set('point', parse.gis_data[0][0]);
                                    feature.set('description', title);
                                    feature.set('title', title);
                                    if (fill_color.includes('rgba')) {
                                        feature.set('fill_color', fill_color);
                                        feature.set('stroke_color', fill_color);
                                    }
                                    else {
                                        feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                        feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                    }

                                    feature.set('stroke_width', "0.2");
                                    feature.set('text_fill', "#000000");
                                    feature.set('text_stroke_color', "#000000");
                                    feature.set('text_stroke_width', "0");
                                    feature.set('font_size', 12);
                                    feature.set('zindex', "30");
                                    feature.set('Image', Image);
                                    feature.set('Icon', Icon);
                                    feature.set('Code', list[indx1].Code);
                                    feature.set('Name', list[indx1].Name);
                                    feature.set('AreaTxt', list[indx1].AreaTxt);
                                    feature.set('GroupTxt', list[indx1].GroupTxt);
                                    feature.set('RoleTxt', list[indx1].RoleTxt);
                                    feature.set('TypeTxt', list[indx1].TypeTxt);
                                    feature.set('Image', data.Image);
                                    feature.setStyle(config.styleDrag);
                                    vectorSource1.addFeature(feature);

                                    //move camera đến cơ sở đầu tiên của NPP/ĐM/CH
                                    if (data != null && data.IsDefault == true && checkMove) {
                                        map.getView().fit(feature.getGeometry(), map.getSize());
                                        map.getView().setZoom(15);
                                        checkMove = false;
                                    }

                                }
                                catch (Exc) {
                                    console.log("bug");
                                }
                            }
                        }
                    }
                } else {
                    App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                }
            });
        },

        //supplier
        searchSupplier: function () {
            $('#supplierSearch').click(function () {
                config.loadDataSupplier();
            });
        },
        loadDataSupplier: function () {
            var areas = [];
            var groups = [];
            var roles = [];
            var types = [];
            for (var indx = 0; indx < $rootScope.SupplierGroup.length; ++indx) {
                if ($rootScope.SupplierGroup[indx].checked == true)
                    groups.push($rootScope.SupplierGroup[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.SupplierAreas.length; ++indx) {
                if ($rootScope.SupplierAreas[indx].checked == true)
                    areas.push($rootScope.SupplierAreas[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.SupplierRoles.length; ++indx) {
                if ($rootScope.SupplierRoles[indx].checked == true)
                    roles.push($rootScope.SupplierRoles[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.SupplierTypes.length; ++indx) {
                if ($rootScope.SupplierTypes[indx].checked == true)
                    types.push($rootScope.SupplierTypes[indx].Code);
            }
            $scope.modelSearch = {
                areas: areas,
                groups: groups,
                roles: roles,
                types: types,
                supplierName: $scope.SupplierName
            }
            dataservice.searchSupplier($scope.modelSearch, function (rs) {
                rs = rs.data;
                if (rs.length == 1) {
                    var list = rs[0].list;
                    if (list.length == 0) {
                        App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                    }
                    else {
                        vectorSource1.clear();
                        for (var indx1 = 0; indx1 < list.length; ++indx1) {
                            var data = list[indx1].MapDataGis;
                            try {
                                var parse = JSON.parse(data.PolygonGPS);
                                var title = data.Title;
                                var fill_color = parse.properties.fill_color;
                                var font_size = parse.properties.font_size;
                                var Icon = document.location.origin + data.Icon;
                                var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                var feature = new ol.Feature(polygon1);
                                feature.setId(data.Id);
                                feature.getGeometry();
                                ////
                                var center = feature.getProperties();
                                var bounds = center.geometry.getExtent();
                                feature.set('point', parse.gis_data[0][0]);
                                feature.set('description', title);
                                feature.set('title', title);
                                if (fill_color.includes('rgba')) {
                                    feature.set('fill_color', fill_color);
                                    feature.set('stroke_color', fill_color);
                                }
                                else {
                                    feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                    feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                }

                                feature.set('stroke_width', "0.2");
                                feature.set('text_fill', "#000000");
                                feature.set('text_stroke_color', "#000000");
                                feature.set('text_stroke_width', "0");
                                feature.set('font_size', 12);
                                feature.set('zindex', "30");
                                feature.set('Image', Image);
                                feature.set('Icon', Icon);

                                feature.set('Code', list[indx1].Code);
                                feature.set('Name', list[indx1].Name);
                                feature.set('AreaTxt', list[indx1].AreaTxt);
                                feature.set('GroupTxt', list[indx1].GroupTxt);
                                feature.set('RoleTxt', list[indx1].RoleTxt);
                                feature.set('TypeTxt', list[indx1].TypeTxt);
                                feature.set('Image', data.Image);
                                feature.setStyle(config.styleDrag);
                                vectorSource1.addFeature(feature);
                                if (data != null && data.IsDefault == true) {
                                    map.getView().fit(feature.getGeometry(), map.getSize());
                                    map.getView().setZoom(16.4);
                                }

                            }
                            catch (Exc) {
                                console.log("bug");
                            }
                        }
                    }
                }
                else if (rs.length > 1) {
                    vectorSource1.clear();
                    for (var indx = 0; indx < rs.length; ++indx) {
                        var list = rs[indx].list;
                        //console.log(list.length);
                        if (list.length > 0) {
                            var checkMove = true;
                            ////
                            for (var indx1 = 0; indx1 < list.length; ++indx1) {
                                var data = list[indx1].MapDataGis;
                                //console.log(data);
                                try {
                                    //
                                    var parse = JSON.parse(data.PolygonGPS);
                                    var title = data.Title;
                                    var fill_color = parse.properties.fill_color;
                                    var font_size = parse.properties.font_size;
                                    var Icon = document.location.origin + data.Icon;
                                    var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                    var feature = new ol.Feature(polygon1);
                                    feature.setId(data.Id);
                                    feature.getGeometry();
                                    ////
                                    var center = feature.getProperties();
                                    var bounds = center.geometry.getExtent();
                                    feature.set('point', parse.gis_data[0][0]);
                                    feature.set('description', title);
                                    feature.set('title', title);
                                    if (fill_color.includes('rgba')) {
                                        feature.set('fill_color', fill_color);
                                        feature.set('stroke_color', fill_color);
                                    }
                                    else {
                                        feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                        feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                    }

                                    feature.set('stroke_width', "0.2");
                                    feature.set('text_fill', "#000000");
                                    feature.set('text_stroke_color', "#000000");
                                    feature.set('text_stroke_width', "0");
                                    feature.set('font_size', 12);
                                    feature.set('zindex', "30");
                                    feature.set('Image', Image);
                                    feature.set('Icon', Icon);
                                    feature.set('Code', list[indx1].Code);
                                    feature.set('Name', list[indx1].Name);
                                    feature.set('AreaTxt', list[indx1].AreaTxt);
                                    feature.set('GroupTxt', list[indx1].GroupTxt);
                                    feature.set('RoleTxt', list[indx1].RoleTxt);
                                    feature.set('TypeTxt', list[indx1].TypeTxt);
                                    feature.set('Image', data.Image);
                                    feature.setStyle(config.styleDrag);
                                    vectorSource1.addFeature(feature);

                                    //move camera đến cơ sở đầu tiên của NPP/ĐM/CH
                                    if (data != null && data.IsDefault == true && checkMove) {
                                        map.getView().fit(feature.getGeometry(), map.getSize());
                                        map.getView().setZoom(15);
                                        checkMove = false;
                                    }

                                }
                                catch (Exc) {
                                    console.log("bug");
                                }
                            }
                        }
                    }
                } else {
                    App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                }
            });
        },

        //store
        searchStore: function () {
            $('#storeSearch').click(function () {
                config.loadDataStore();
            });
        },
        loadDataStore: function () {
            $scope.modelSearch = {
                WareHouseName: $scope.WareHouseName
            }
            dataservice.searchStore($scope.modelSearch, function (rs) {
                rs = rs.data;
                if (rs.length == 1) {
                    var list = rs[0].list;
                    if (list.length == 0) {
                        App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                    }
                    else {
                        vectorSource1.clear();
                        for (var indx1 = 0; indx1 < list.length; ++indx1) {
                            var data = list[indx1].MapDataGis;
                            try {
                                var parse = JSON.parse(data.PolygonGPS);
                                var title = data.Title;
                                var fill_color = parse.properties.fill_color;
                                var font_size = parse.properties.font_size;
                                var Icon = document.location.origin + data.Icon;
                                var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                var feature = new ol.Feature(polygon1);
                                feature.setId(data.Id);
                                feature.getGeometry();
                                ////
                                var center = feature.getProperties();
                                var bounds = center.geometry.getExtent();
                                feature.set('point', parse.gis_data[0][0]);
                                feature.set('description', title);
                                feature.set('title', title);
                                if (fill_color.includes('rgba')) {
                                    feature.set('fill_color', fill_color);
                                    feature.set('stroke_color', fill_color);
                                }
                                else {
                                    feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                    feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                }

                                feature.set('stroke_width', "0.2");
                                feature.set('text_fill', "#000000");
                                feature.set('text_stroke_color', "#000000");
                                feature.set('text_stroke_width', "0");
                                feature.set('font_size', 12);
                                feature.set('zindex', "30");
                                feature.set('Image', Image);
                                feature.set('Icon', Icon);

                                feature.set('Code', list[indx1].Code);
                                feature.set('Name', list[indx1].Name);
                                feature.set('AreaTxt', list[indx1].AreaTxt);
                                feature.set('GroupTxt', list[indx1].GroupTxt);
                                feature.set('RoleTxt', list[indx1].RoleTxt);
                                feature.set('TypeTxt', list[indx1].TypeTxt);
                                feature.set('Image', data.Image);
                                feature.setStyle(config.styleDrag);
                                vectorSource1.addFeature(feature);
                                if (data != null && data.IsDefault == true) {
                                    map.getView().fit(feature.getGeometry(), map.getSize());
                                    map.getView().setZoom(16.4);
                                }

                            }
                            catch (Exc) {
                                console.log("bug");
                            }
                        }
                    }
                }
                else if (rs.length > 1) {
                    vectorSource1.clear();
                    for (var indx = 0; indx < rs.length; ++indx) {
                        var list = rs[indx].list;
                        //console.log(list.length);
                        if (list.length > 0) {
                            var checkMove = true;
                            ////
                            for (var indx1 = 0; indx1 < list.length; ++indx1) {
                                var data = list[indx1].MapDataGis;
                                //console.log(data);
                                try {
                                    //
                                    var parse = JSON.parse(data.PolygonGPS);
                                    var title = data.Title;
                                    var fill_color = parse.properties.fill_color;
                                    var font_size = parse.properties.font_size;
                                    var Icon = document.location.origin + data.Icon;
                                    var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                    var feature = new ol.Feature(polygon1);
                                    feature.setId(data.Id);
                                    feature.getGeometry();
                                    ////
                                    var center = feature.getProperties();
                                    var bounds = center.geometry.getExtent();
                                    feature.set('point', parse.gis_data[0][0]);
                                    feature.set('description', title);
                                    feature.set('title', title);
                                    if (fill_color.includes('rgba')) {
                                        feature.set('fill_color', fill_color);
                                        feature.set('stroke_color', fill_color);
                                    }
                                    else {
                                        feature.set('fill_color', hexToRgbA(fill_color, 0.2));
                                        feature.set('stroke_color', hexToRgbA(fill_color, 1));
                                    }

                                    feature.set('stroke_width', "0.2");
                                    feature.set('text_fill', "#000000");
                                    feature.set('text_stroke_color', "#000000");
                                    feature.set('text_stroke_width', "0");
                                    feature.set('font_size', 12);
                                    feature.set('zindex', "30");
                                    feature.set('Image', Image);
                                    feature.set('Icon', Icon);
                                    feature.set('Code', list[indx1].Code);
                                    feature.set('Name', list[indx1].Name);
                                    feature.set('AreaTxt', list[indx1].AreaTxt);
                                    feature.set('GroupTxt', list[indx1].GroupTxt);
                                    feature.set('RoleTxt', list[indx1].RoleTxt);
                                    feature.set('TypeTxt', list[indx1].TypeTxt);
                                    feature.set('Image', data.Image);
                                    feature.setStyle(config.styleDrag);
                                    vectorSource1.addFeature(feature);

                                    //move camera đến cơ sở đầu tiên của NPP/ĐM/CH
                                    if (data != null && data.IsDefault == true && checkMove) {
                                        map.getView().fit(feature.getGeometry(), map.getSize());
                                        map.getView().setZoom(15);
                                        checkMove = false;
                                    }

                                }
                                catch (Exc) {
                                    console.log("bug");
                                }
                            }
                        }
                    }
                } else {
                    App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                }
            });
        },

        //add parking
        addParkingTemp: function () {
            $('#addToParkingTemp').click(function () {
                var features2 = drawLV.getSource().getFeatures();
                var newForm = new ol.format.GeoJSON();
                var featColl = newForm.writeFeaturesObject(features2);
                //var tx1 = document.getElementById('tx1').value;
                //var tx2 = document.getElementById('tx2').value;
                //var name = $scope.model.Name;
                //var note = $scope.model.Note;
                //var cl1 = document.getElementById('cl1').value;
                var color = document.getElementById('cl1').value;
                var size = document.getElementById('nb4').value;
                //var customer = $scope.model.ObjCode;
                //var imgPath = $scope.model.Picture;
                //var nb4 = document.getElementById('nb4').value;
                //var value31 = $('#idListCustomer').val();
                //var Company_Code = $('#listCustomer [value="' + value31 + '"]').data('customvalue');
                var dataObj = new Object();
                if ($scope.model.ObjCode != "" && $scope.model.Name != "") {
                    if (featColl.features[count] != null && featColl.features[count].geometry != null && featColl.features[count].geometry.coordinates != null) {
                        var polygon1 = new ol.geom.Polygon(featColl.features[count].geometry.coordinates);
                        var feature = new ol.Feature(polygon1);
                        feature.getGeometry();
                        var center = feature.getProperties();
                        var bounds = center.geometry.getExtent();
                        var x = bounds[0] + ((bounds[2] - bounds[0]) / 2);
                        var y = bounds[1] + ((bounds[3] - bounds[1]) / 2);
                        var point = new ol.geom.Point(ol.proj.transform([x, y], 'EPSG:3857', 'EPSG:4326'));
                        var listGps = "";
                        var coordinates = featColl.features[count].geometry.coordinates[0];
                        for (var indx = 0; indx < coordinates.length; ++indx) {

                            var point1 = new ol.geom.Point(ol.proj.transform([coordinates[indx][0], coordinates[indx][1]], 'EPSG:3857', 'EPSG:4326'));
                            if (indx < coordinates.length - 1) {
                                listGps = listGps + point1.A[1] + "," + point1.A[0] + ";";
                            }
                            else
                                listGps = listGps + point1.A[1] + "," + point1.A[0];
                        }
                        dataObj.gis_data = featColl.features[count].geometry.coordinates;
                        dataObj.properties = {};
                        dataObj.properties.fill_color = color;
                        dataObj.properties.text = $scope.model.Name;
                        dataObj.properties.font_size = size;

                        var objTotal1 = {};
                        objTotal1.Gis_data = {};
                        objTotal1.Gis_data = dataObj;
                        objTotal1.title = dataObj.properties.text;
                        objTotal1.Description = $scope.model.Note;
                        objTotal1.Owner = "1";

                        var pictureFile = $scope.FormData;
                        var data = {
                            title: $scope.model.Name,
                            Gis_data: JSON.stringify(dataObj),
                            Description: $scope.model.Note,
                            Owner: objTotal1.Owner,
                            Icon: $scope.model.Picture,
                            ObjCode: $scope.model.ObjCode,
                            pictureFile: pictureFile,
                            markerGps: point.A[1] + "," + point.A[0],
                            gisData2: listGps
                        };

                        $scope.listParkingTemp.push(data);
                        count = count + 1;
                    }
                    else {
                        App.toastrError(caption.COM_MSG_PAINT_BEFORE_ADD.replace('{0}', caption.MS_TITTLE_PARK));
                    }
                }
                else {
                    App.toastrError(caption.MS_MSG_NOT_FOUND_DATA);
                }
            })
        },


        //delete parking
        deletedParkingTemp: function () {
            $scope.deleteParkingTempItem = function (data) {
                //delete drag in map
                for (var i = 0; i < $scope.listParkingTemp.length; ++i) {
                    if (i == parseInt(data)) {
                        $scope.listParkingTemp.splice(i, 1);
                        var features = drawLV.getSource().getFeatures();
                        if (features != null && features.length > 0) {
                            drawLV.getSource().removeFeature(features[i]);
                            count = count - 1;
                        }
                    }
                }
                //$("#tableParkTemp tr").remove();
                //for (var i = 0; i < listParkingTemp.length; ++i) {
                //    var html1 = '<tr><td class="text-center">' + listParkingTemp[i].title + '</td>'
                //        + '<td <label onclick=deleteParkingTempItem("' + (listParkingTemp.length - 1) + '")> <a>Xóa</a></label ></td>'
                //        + '<td <label onclick=stopRobot("' + '")> </label ></td>'
                //        + '<td><label onclick=finishRobot("' + '")> </label >'
                //        + '</td ></tr > </tr>';
                //    $('#tableParkTemp').append(html1);

                //}
            }
        },


        //tab click
        tabClick: function () {
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                config.cancelDrag();
            });
        },

        //click save
        save: function () {
            $('#save').click(function () {
                if ($scope.listParkingTemp.length > 0) {
                    for (var i = 0; i < $scope.listParkingTemp.length; i++) {
                        var formdata = new FormData();
                        formdata.append("title", $scope.listParkingTemp[i].title);
                        formdata.append("Gis_data", $scope.listParkingTemp[i].Gis_data);
                        formdata.append("Description", $scope.listParkingTemp[i].Description);
                        formdata.append("Owner", $scope.listParkingTemp[i].Owner);
                        formdata.append("ObjCode", $scope.listParkingTemp[i].ObjCode);
                        formdata.append("ObjType", isMapCustomer ? 'CUSTOMER' : isMapSupplier ? 'SUPPLIER' : 'WAREHOUSE');
                        formdata.append("Icon", $scope.listParkingTemp[i].Icon);
                        formdata.append("pictureFile", $scope.listParkingTemp[i].pictureFile);
                        formdata.append("MarkerGps", $scope.listParkingTemp[i].markerGps);
                        formdata.append("GisData2", $scope.listParkingTemp[i].gisData2);
                        //formdata.append("Address", listParkingTemp[i].Address);
                        //formdata.append("pictureFile", listParkingTemp[i].pictureFile);
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            data: formdata,
                            url: "/Admin/Map/Insert",

                            contentType: false,
                            processData: false,
                            success: function (data) {
                                //Cancel drag
                                config.cancelDrag();
                                //reset
                                config.loadData();
                            }
                        });
                    }

                    $scope.listParkingTemp = [];
                    drawLV.getSource().clear();
                    count = 0;
                    App.toastrSuccess(caption.COM_MSG_ADD_SUCCESS.replace('{0}', caption.MS_TITTLE_LOCATION));
                    //window.location.reload();
                }
                else {
                    App.toastrError(caption.COM_MSG_ADD_BEFORE_SAVE.replace('{0}', caption.MS_TITTLE_PARK));
                }
            })
        },

        //addMap
        addMap: function (item) {
            var polygon = new ol.geom.Polygon(item.gis_data);
            var feature = new ol.Feature(polygon);
            feature.getGeometry();

            feature.setId(item.CusID);
            feature.set('point', item.gis_data[0][0]);
            feature.set('description', item.CusName);
            feature.set('title', "Tiêu đề");
            feature.set('fill_color', "#ff0099");
            feature.set('stroke_color', "#ff0099");

            feature.set('stroke_width', "0.2");
            feature.set('text_fill', "#000000");
            feature.set('text_stroke_color', "#000000");
            feature.set('text_stroke_width', "0");
            feature.set('font_size', 12);
            feature.set('zindex', "30");
            feature.set('Image', "");
            if (item.CusType == "AGENT") {
                feature.set('Icon', "http://localhost:5002/images/map/icon_chua.png");
            }
            else if (item.CusType == "SHOP") {
                feature.set('Icon', "http://localhost:5002/images/map/icon_chua.png");
            }
            else if (item.CusType == "DISTRIBUTOR") {
                feature.set('Icon', "http://localhost:5002/images/map/icon_chua.png");
            }
            else
                feature.set('Icon', "http://localhost:5002/images/map/icon_chua.png");

            feature.set('Address', item.Address);
            feature.set('CusCode', item.CusCode);
            feature.set('CusName', item.CusName);
            feature.set('AreaTxt', item.AreaTxt);
            feature.set('CusGroupTxt', item.CusGroupTxt);
            feature.set('RoleTxt', item.RoleTxt);
            feature.set('CusTypeTxt', item.CusTypeTxt);
            feature.setStyle(config.styleDrag);
            vectorSource1.addFeature(feature);
        },

        //set height map
        setHeightMap: function () {
            //var maxHeightMap = $(window).height() - $("#map").position().top - 40;
            //$("#map").css({
            //    'height': maxHeightMap,
            //    'max-height': maxHeightMap,
            //    'overflow': 'auto',
            //});
            config.mapReSize();
        },
        //set map resize
        mapReSize: function () {
            setTimeout(function () {
                map.updateSize();
            }, 600);
        },
        menuLeftClick: function () {
            $(".menu-toggle").click(function (e) {
                config.mapReSize();
            });
        },
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        }
    }
    $(function () {
        config.init();
    });

    function hexToRgbA(hex, opacity) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
        }
        throw new Error('Bad Hex');
    }
    function hexToRgb(hex, a) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            r = parseInt(result[1], 16);
            g = parseInt(result[2], 16);
            b = parseInt(result[3], 16);
            var mess = 'rgba(' + r + ', ' + g + ', ' + b + ',' + a + ')';
            return mess
        }

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
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('Profile_picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }

            reader.readAsDataURL(files[0]);
            var fileUpload = $("#file").get(0);
            var file = fileUpload.files[0];
            $scope.FormData = file;
        });
        fileuploader.trigger('click');
    }
    setInterval(function () {
        var crzoom = map.getView().getZoom();
        if (crzoom < 11
        ) {
            map.addLayer(vectorLayer2);
        }
    }, 1000);
    setTimeout(function () {
        loadDate();
    }, 200);
    /* #endregion */
});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.init = function () {
        $scope.model = para;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

// Define your SVG code as a string
var svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
    <path fill="green" d="M48 0C21.5 0 0 21.5 0 48V464c0 26.5 21.5 48 48 48h96V432c0-26.5 21.5-48 48-48s48 21.5 48 48v80h96c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H48zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM80 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V112zM272 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16z"/>
</svg>`;
//layer hide fure
/*Hàm trả về style để ẩn feature map */
const encodeStyle = function (styles) {
    let ret = "";

    const styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };

    const styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };

    const styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };

    styles.forEach((style) => {
        if (style.featureType) ret += "s.t:" + styleparse_types[style.featureType] + "|";

        // if !styleparse_elements[style.elementType], the style element is unknown
        if (style.elementType) ret += "s.e:" + styleparse_elements[style.elementType] + "|";

        style.stylers.forEach((styler) => {
            let keys = [];
            for (var k in styler) {
                if (k === "color" && styler[k].length === 7) styler[k] = "#ff" + styler[k].slice(1);
                ret += styleparse_stylers[k] + ":" + styler[k] + "|";
            }
        });

        ret = ret.slice(0, ret.length - 1);
        ret += ","
    });

    return encodeURIComponent(ret.slice(0, ret.length - 1));
};
const styles = [
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    }
];
const apistyles = encodeStyle(styles);
var googleLayer = new ol.source.XYZ({
    url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + apistyles,
})
var layerGoogle = new ol.source.XYZ({
    url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
})
var OSM = new ol.source.OSM({
})
// layer map
var LayerMap;