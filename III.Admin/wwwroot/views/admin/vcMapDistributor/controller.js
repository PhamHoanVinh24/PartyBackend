var ctxfolder = "/views/Admin/vcMapDistributor";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngSanitize',"ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getAllData: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetAll/').success(callback);
        },
        searchCustomerWithBranch: function (data, callback) {
            $http.post('/Admin/VCMapDistributor/SearchCustomerWithBranch/',data).success(callback);
        },
        searchCustomerWithBranch1: function (data, callback) {
            $http.post('/Admin/VCMapDistributor/SearchCustomerWithBranch1/', data).success(callback);
        },

        
        //Customer
        searchCustomer: function (data, callback) {
            $http.post('/Admin/VCMapDistributor/SearchCustomer/', data).success(callback);
        },
        getAllCustomer: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetAllCustomer').success(callback);
        },
        getCustomerGroup: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetCustomerGroup').success(callback);
        },
        getCustomerStatus: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetCustomerStatus').success(callback);
        },
        getArea: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetListArea').success(callback);
        },
        getCustomerType: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetListCutomerType').success(callback);
        },
        getCustomerRole: function (callback) {
            $http.post('/Admin/VCMapDistributor/GetListCutomerRole').success(callback);
        },
        getCustomerInfoExtend: function (data,callback) {
            $http.post('/Admin/VCMapDistributor/GetCustomerInfoExtend?CusCode='+data).success(callback);
        },
       
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $filter, dataservice, $cookies, $translate) {
    $rootScope.IsMapCustomer =true;
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
    dataservice.getAllCustomer(function (rs) {
        $rootScope.Custommers = rs.Object;
    });
    dataservice.getCustomerGroup(function (rs) {
        
        $rootScope.CustomerGroup = rs;
    })
    dataservice.getCustomerStatus(function (rs) {
        $rootScope.StatusData = rs;
    });
    dataservice.getArea(function (rs) {
        $rootScope.CustomerAreas = rs.Object;
    });
    dataservice.getCustomerType(function (rs) {
        $rootScope.CustomerTypes = rs.Object;
    });
    dataservice.getCustomerRole(function (rs) {
        $rootScope.CustomerRoles = rs.Object;
    });
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
    var isFisrtLoad = true;
    $scope.model = {
        //Color: '',
        //Size: '',
        CusCode: '',
        Picture: '',
        Name: '',
        Note: ''
    }
    $scope.customer = {
        CustomerCode: ''
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
    $scope.vectorSource1 = {};
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
        },

        //load map
        loadMap: function () {


            fields_vector_source = new ol.source.Vector({});

            $scope.vectorSource1 = new ol.source.Vector({});

            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM(
                            {
                                url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                                attributions: [
                                    new ol.Attribution({ html: '© Google' }),
                                    new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
                                ]
                            })
                    }),
                    new ol.layer.Vector({
                        source: fields_vector_source
                    })
                    //test
                    ,
                    new ol.layer.Vector({
                        source: $scope.vectorSource1
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

        },

        //style drag
        styleDrag: function () {
            var zoom = map.getView().getZoom();
            var font_size = zoom * 1;
            var coordinates = this.getGeometry().getInteriorPoint().getCoordinates();
            var k = new ol.geom.Point(coordinates);
            return [
                new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: this.get('fill_color')
                    }),
                    stroke: new ol.style.Stroke({
                        color: this.get('stroke_color'),
                        width: this.get('stroke_width')
                    }),
                    text: new ol.style.Text({
                        font: font_size + 'px Calibri,sans-serif',
                        fill: new ol.style.Fill({ color: this.get('text_fill') }),
                        textBaseline: 'top',
                        stroke: new ol.style.Stroke({
                            color: this.get('text_stroke_color'), width: this.get('text_stroke_width')
                        }),
                        // get the text from the feature - `this` is ol.Feature
                        text: this.get('description')
                    }),
                    zIndex: this.get('zindex')
                }),
                new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: [0.5, 0.7],
                        size: [50, 50],
                        opacity: 6,
                        scale: 1.0,
                        src: this.get('Icon')
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
                        anchor: [0.5, 0.5],
                        size: [52, 52],
                        offset: [52, 0],
                        opacity: 1,
                        scale: 1.0,
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: "https://openlayers.org/en/v4.3.3/examples/data/icon.png"
                    }))
                }),
            ];
            //vectorSource1 = new ol.source.Vector({});
            var vectorIcon = new ol.source.Vector({});

            centervier = [];
            vnfields = [];
            var iconFeatures = [];
            //dataservice.getAllData(function (data) {
            //    for (var i in data) {
            //        try {
            //            //////debugger
            //            var obj = JSON.parse(i);
            //            var parse = JSON.parse(data[i].PolygonGPS);

            //            var title = data[i].Title;
            //            var fill_color = parse.properties.fill_color;


            //            var font_size = parse.properties.font_size;

            //            var Icon = document.location.origin + data[i].Icon;

            //            var polygon1 = new ol.geom.Polygon(parse.gis_data);


            //            var feature = new ol.Feature(polygon1);
            //            feature.setId(data[i].Id);
            //            feature.getGeometry();

            //            feature.set('point', parse.gis_data[0][0]);

            //            feature.set('description', title);
            //            feature.set('title', title);
            //            if (fill_color.includes('rgba')) {
            //                feature.set('fill_color', fill_color);
            //                feature.set('stroke_color', fill_color);
            //            }
            //            else {
            //                feature.set('fill_color', hexToRgbA(fill_color, 0.2));
            //                feature.set('stroke_color', hexToRgbA(fill_color, 1));
            //            }

            //            feature.set('stroke_width', "0.2");
            //            feature.set('text_fill', "#000000");
            //            feature.set('text_stroke_color', "#000000");
            //            feature.set('text_stroke_width', "0");
            //            feature.set('font_size', 12);
            //            feature.set('zindex', "30");
            //            feature.set('Image', Image);
            //            feature.set('Icon', Icon);

            //            feature.setStyle(config.styleDrag);
            //            vectorSource1.addFeature(feature);

            //        }
            //        catch (Exc) { }
            //    };
            //});
            searchCustomerWithBranch();
            var vectorLayer1 = new ol.layer.Vector({
                source: $scope.vectorSource1,
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
                    popup.setPosition(coordinates);
                    var data = feature.get('title');
                    if (data != null && data != "") {
                        //map.getView().fit(feature.getGeometry(), map.getSize());
                        //map.getView().setZoom(13);
                        var object = {
                            title: feature.get('title'),
                            icon: feature.get('Icon'),
                            CusCode: feature.get('CusCode'),
                            CusName: feature.get('CusName'),
                            AreaTxt: feature.get('AreaTxt'),
                            CusGroupTxt: feature.get('CusGroupTxt'),
                            RoleTxt: feature.get('RoleTxt'),
                            CusTypeTxt: feature.get('CusTypeTxt'),
                            Image: feature.get('Image')
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: 'static',
                            size: '50',
                            resolve: {
                                para: function () {
                                    return object;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $scope.reloadNoResetPage();
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
                if ($('a[data-toggle="tab"]').hasClass("hidden")) {
                    $('a[data-toggle="tab"]').removeClass("hidden");
                    $(".tab-content").removeClass("hidden");
                } else {
                    $('a[data-toggle="tab"]').addClass("hidden");
                    $(".tab-content").addClass("hidden");
                }
                config.mapReSize();
            });
        },


        //hide menu
        hideMenuRight: function () {
            $('a[data-toggle="tab"]').addClass("hidden");
            $(".tab-content").addClass("hidden");
        },

        //search customer
        //searchCustomer: function () {
        //    //////debugger

        //    searchCustomerWithBranch();
        //    //$scope.searchCustomerWithBranch = function () {
        //    //    var areas = [];
        //    //    var groups = [];
        //    //    var roles = [];
        //    //    var types = [];
        //    //    for (var indx = 0; indx < $rootScope.CustomerGroup.length; ++indx) {
        //    //        if ($rootScope.CustomerGroup[indx].checked == true)
        //    //            groups.push($rootScope.CustomerGroup[indx].Code);
        //    //    }
        //    //    for (var indx = 0; indx < $rootScope.CustomerAreas.length; ++indx) {
        //    //        if ($rootScope.CustomerAreas[indx].checked == true)
        //    //            areas.push($rootScope.CustomerAreas[indx].Code);
        //    //    }
        //    //    for (var indx = 0; indx < $rootScope.CustomerRoles.length; ++indx) {
        //    //        if ($rootScope.CustomerRoles[indx].checked == true)
        //    //            roles.push($rootScope.CustomerRoles[indx].Code);
        //    //    }
        //    //    for (var indx = 0; indx < $rootScope.CustomerTypes.length; ++indx) {
        //    //        if ($rootScope.CustomerTypes[indx].checked == true)
        //    //            types.push($rootScope.CustomerTypes[indx].Code);
        //    //    }
        //    //    $scope.modelSearch = {
        //    //        areas: areas,
        //    //        groups: groups,
        //    //        roles: roles,
        //    //        types: types,
        //    //        CustomerCode: $scope.customer.CustomerCode
        //    //    }
        //    //    $scope.customer = {};
        //    //    vectorSource1.clear();
        //    //    dataservice.searchCustomer($scope.modelSearch, function (rs) {
        //    //        //$scope.listCustomer = rs;
        //    //        if (rs.length > 0) {
        //    //            for (var indx = 0; indx < rs.length; ++indx) {
        //    //                var item = rs[indx];
        //    //                if (item.GoogleMap.length > 0) {
        //    //                    var latlngString = item.GoogleMap.split(",");
        //    //                    if (latlngString.length == 2) {
        //    //                        var lat = parseFloat(latlngString[0].trim());
        //    //                        var lng = parseFloat(latlngString[1].trim());
        //    //                        var point = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
        //    //                        var coordinates = point.getCoordinates();
        //    //                        var gis_data = [
        //    //                            [
        //    //                                [coordinates[0], coordinates[1]],
        //    //                                [coordinates[0], coordinates[1]],
        //    //                                [coordinates[0], coordinates[1]]
        //    //                            ]
        //    //                        ];
        //    //                        rs[indx].gis_data = gis_data;
        //    //                        config.addMap(rs[indx]);
        //    //                    }
        //    //                }

        //    //            }
        //    //        }
        //    //    });
        //    //}
        //},


        //search supplier
        //searchSupplier: function () {
        //    $scope.supplier = {};
        //    $scope.searchSupplier = function () {
        //        var areas = [];
        //        var groups = [];
        //        var roles = [];
        //        var types = [];
        //        for (var indx = 0; indx < $rootScope.SupplierGroup.length; ++indx) {
        //            if ($rootScope.SupplierGroup[indx].checked == true)
        //                groups.push($rootScope.SupplierGroup[indx].Code);
        //        }
        //        for (var indx = 0; indx < $rootScope.SupplierAreas.length; ++indx) {
        //            if ($rootScope.SupplierAreas[indx].checked == true)
        //                areas.push($rootScope.SupplierAreas[indx].Code);
        //        }
        //        for (var indx = 0; indx < $rootScope.SupplierRoles.length; ++indx) {
        //            if ($rootScope.SupplierRoles[indx].checked == true)
        //                roles.push($rootScope.SupplierRoles[indx].Code);
        //        }
        //        for (var indx = 0; indx < $rootScope.SupplierTypes.length; ++indx) {
        //            if ($rootScope.SupplierTypes[indx].checked == true)
        //                types.push($rootScope.SupplierTypes[indx].Code);
        //        }
        //        $scope.modelSearch = {
        //            areas: areas,
        //            groups: groups,
        //            roles: roles,
        //            types: types,
        //            //CustomerCode: $scope.customer.CustomerCode
        //        }
        //        $scope.vectorSource1.clear();
        //        dataservice.searchSupplier($scope.modelSearch, function (rs) {
        //            //$scope.listCustomer = rs;
        //            if (rs.length > 0) {
        //                for (var indx = 0; indx < rs.length; ++indx) {
        //                    var item = rs[indx];
        //                    if (item.GoogleMap.length > 0) {
        //                        var latlngString = item.GoogleMap.split(",");
        //                        if (latlngString.length == 2) {
        //                            var lat = parseFloat(latlngString[0].trim());
        //                            var lng = parseFloat(latlngString[1].trim());
        //                            var point = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
        //                            var coordinates = point.getCoordinates();
        //                            var gis_data = [
        //                                [
        //                                    [coordinates[0], coordinates[1]],
        //                                    [coordinates[0], coordinates[1]],
        //                                    [coordinates[0], coordinates[1]]
        //                                ]
        //                            ];
        //                            rs[indx].gis_data = gis_data;
        //                            config.addMap(rs[indx]);
        //                        }
        //                    }

        //                }
        //            }
        //        });
        //    }
        //},


        //add parking
        addParkingTemp: function () {
            $('#addToParkingTemp').click(function () {
                var features2 = drawLV.getSource().getFeatures();


                

                var newForm = new ol.format.GeoJSON();
                var featColl = newForm.writeFeaturesObject(features2);
                //var tx1 = document.getElementById('tx1').value;
                //var tx2 = document.getElementById('tx2').value;
                var name = $scope.model.Name;
                var note = $scope.model.Note;
                //var cl1 = document.getElementById('cl1').value;
                var color = document.getElementById('cl1').value;
                var size = document.getElementById('nb4').value;
                var customer = $scope.model.CusCode;
                var imgPath = $scope.model.Picture;
                //var nb4 = document.getElementById('nb4').value;
                var value31 = $('#idListCustomer').val();
                var Company_Code = $('#listCustomer [value="' + value31 + '"]').data('customvalue');
                //var Address = $('#Address').val();
                //var file_data = $('#file').prop('files')[0];
                var dataObj = new Object();
                if ($scope.model.CusCode != "" && $scope.model.Name != "") {
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
                        dataObj.properties.text = name;
                        dataObj.properties.font_size = size;
                        
                        var objTotal1 = {};
                        objTotal1.Gis_data = {};
                        objTotal1.Gis_data = dataObj;
                        objTotal1.title = dataObj.properties.text;
                        objTotal1.Description = note;
                        objTotal1.Owner = "1";
                        objTotal1.Company_Code = Company_Code;
                        

                        //objTotal1.Address = Address;
                        //if (isBatch == true) {
                        var pictureFile = $scope.FormData;
                        var data = {
                            title: name,
                            Gis_data: JSON.stringify(dataObj),
                            Description: note,
                            Owner: objTotal1.Owner,
                            Icon: imgPath,
                            Company_Code: $scope.model.CusCode,
                            pictureFile: pictureFile,
                            markerGps : point.A[1] + "," + point.A[0],
                            gisData2 : listGps
                        };
                        $scope.listParkingTemp.push(data);
                        count = count + 1;
                        //var html1 = '<tr><td class="text-center">' + tx1 + '</td>'
                        //    + '<td <label onclick=deleteParkingTempItem("' + (listParkingTemp.length - 1) + '")> <a>Xóa</a></label ></td>'
                        //    + '<td <label onclick=stopRobot("' + '")> </label ></td>'
                        //    + '<td><label onclick=finishRobot("' + '")> </label >'
                        //    + '</td ></tr > </tr>';
                        //$('#tableParkTemp').append(html1);
                        //}
                    }
                    else {
                        App.toastrError(caption.COM_MSG_PAINT_BEFORE_ADD.replace('{0}', caption.MS_TITTLE_PARK));
                    }
                }
                else {
                    App.toastrError("Vui lòng chọn khách hàng và nhập tên");
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
                        formdata.append("ObjCode", $scope.listParkingTemp[i].Company_Code);
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
                            url: "/Admin/VCMapDistributor/Insert",

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
            if (item.CusType == "VC_AGENT") {
                feature.set('Icon', "https://uphinhnhanh.com/images/2019/02/11/pinmap_startfd43f90b867fa024.png");
            }
            else if (item.CusType == "VC_SHOP") {
                feature.set('Icon', "https://uphinhnhanh.com/images/2019/02/11/pinmap_startfd43f90b867fa024.png");
            }
            else if (item.CusType == "VC_DISTRIBUTOR") {
                feature.set('Icon', "https://uphinhnhanh.com/images/2019/02/11/pinmap_startfd43f90b867fa024.png");
            }
            else
                feature.set('Icon', "https://uphinhnhanh.com/images/2019/02/11/pinmap_startfd43f90b867fa024.png");

            feature.set('Address', item.Address);
            feature.set('CusCode', item.CusCode);
            feature.set('CusName', item.CusName);
            feature.set('AreaTxt', item.AreaTxt);
            feature.set('CusGroupTxt', item.CusGroupTxt);
            feature.set('RoleTxt', item.RoleTxt);
            feature.set('CusTypeTxt', item.CusTypeTxt);
            feature.setStyle(config.styleDrag);
            $scope.vectorSource1.addFeature(feature);
        },
        //set height map
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 40;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
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
        }
    }
    $(function () {
        config.init();
    });
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

    $scope.FormData = {};
    $scope.searchCustomerWithBranch1 = function () {
        searchCustomerWithBranch();
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
    function searchCustomerWithBranch() {
        //////debugger
        var areas = [];
        var groups = [];
        var roles = [];
        var types = [];
        if (isFisrtLoad == false) {
            for (var indx = 0; indx < $rootScope.CustomerGroup.length; ++indx) {
                if ($rootScope.CustomerGroup[indx].checked == true)
                    groups.push($rootScope.CustomerGroup[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.CustomerAreas.length; ++indx) {
                if ($rootScope.CustomerAreas[indx].checked == true)
                    areas.push($rootScope.CustomerAreas[indx].Code);
            }
            for (var indx = 0; indx < $rootScope.CustomerTypes.length; ++indx) {
                if ($rootScope.CustomerTypes[indx].checked == true)
                    types.push($rootScope.CustomerTypes[indx].Code);
            }
        }
        
        $scope.modelSearch = {
            areas: areas,
            groups: groups,
            roles: roles,
            types: types,
            CustomerCode: $scope.customer.CustomerCode
        }
        //$scope.customer = {};
        $scope.vectorSource1.clear();
        dataservice.searchCustomerWithBranch($scope.modelSearch, function (rs) {
            isFisrtLoad = false;
            //isNoData để kiểm tra xem dữ liệu có hay không
            var isNoData = false;
            if (rs.length == 0) {
                isNoData = true;
            }
            if (isNoData == false && rs.length >= 2) {
                var check = true;
                for (var indx = 1; indx < rs.length; ++indx) {
                    if (rs[indx].list.length > 0) {
                        check = false;
                    }
                }
                isNoData = check;
            }
            if (isNoData == true) {
                App.toastrError("Không tìm thấy dữ liệu");
            }
            else {
                if (rs.length == 1) {
                    var list = rs[0].list;
                    if (list.length == 0) {
                        App.toastrError("Không tìm thấy dữ liệu");
                    }
                    else {
                        for (var indx1 = 0; indx1 < list.length; ++indx1) {
                            var data = list[indx1].MapDataGis;
                            try {
                                //debugger
                                var parse = JSON.parse(data.PolygonGPS);
                                var title = data.Title;
                                var fill_color = parse.properties.fill_color;
                                var font_size = parse.properties.font_size;
                                var Icon = document.location.origin + data.Icon;
                                var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                var feature = new ol.Feature(polygon1);
                                feature.setId(data.Id);
                                feature.getGeometry();
                                ////debugger
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

                                feature.set('CusCode', list[indx1].CusCode);
                                feature.set('CusName', list[indx1].CusName);
                                feature.set('AreaTxt', list[indx1].AreaTxt);
                                feature.set('CusGroupTxt', list[indx1].CusGroupTxt);
                                feature.set('RoleTxt', list[indx1].RoleTxt);
                                feature.set('CusTypeTxt', list[indx1].CusTypeTxt);
                                feature.set('Image', data.Image);
                                feature.setStyle(config.styleDrag);
                                $scope.vectorSource1.addFeature(feature);
                                //move camera đến cơ sở đầu tiên của NPP/ĐM/CH
                                if (data != null && data.IsDefault == true) {
                                    map.getView().fit(feature.getGeometry(), map.getSize());
                                    map.getView().setZoom(15);
                                }

                            }
                            catch (Exc) {
                                console.log("bug");
                            }
                        }
                    }
                }
                else {
                    for (var indx = 0; indx < rs.length; ++indx) {
                        var list = rs[indx].list;
                        if (rs[indx].CusCode == "UH009") {
                            ////debugger
                        }
                        //console.log(list.length);
                        if (list.length > 0) {
                            var checkMove = true;
                            ////debugger
                            for (var indx1 = 0; indx1 < list.length; ++indx1) {
                                var data = list[indx1].MapDataGis;
                                //console.log(data);
                                try {
                                    //debugger
                                    var parse = JSON.parse(data.PolygonGPS);
                                    var title = data.Title;
                                    var fill_color = parse.properties.fill_color;
                                    var font_size = parse.properties.font_size;
                                    var Icon = document.location.origin + data.Icon;
                                    var polygon1 = new ol.geom.Polygon(parse.gis_data);
                                    var feature = new ol.Feature(polygon1);
                                    feature.setId(data.Id);
                                    feature.getGeometry();
                                    ////debugger
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
                                    feature.set('CusCode', list[indx1].CusCode);
                                    feature.set('CusName', list[indx1].CusName);
                                    feature.set('AreaTxt', list[indx1].AreaTxt);
                                    feature.set('CusGroupTxt', list[indx1].CusGroupTxt);
                                    feature.set('RoleTxt', list[indx1].RoleTxt);
                                    feature.set('CusTypeTxt', list[indx1].CusTypeTxt);
                                    feature.set('Image', data.Image);
                                    feature.setStyle(config.styleDrag);
                                    $scope.vectorSource1.addFeature(feature);

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



                }
            }
        });

        
    }
});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    //console.log(para);
    $scope.model = para;
    $scope.data = {};
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
    $scope.getCustomerInfoExtend = function()
    {
        dataservice.getCustomerInfoExtend($scope.model.CusCode, function (rs) {
            $scope.data = rs.Object;
        });
    }
    $scope.getCustomerInfoExtend();
});