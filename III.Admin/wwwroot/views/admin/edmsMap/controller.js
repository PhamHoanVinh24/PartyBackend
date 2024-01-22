var ctxfolder = "/views/admin/edmsMap";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngSanitize']);
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

    return {

        getAllData: function (callback) {
            $http.post('/Admin/EDMSMap/GetAll/').success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter) {
    $scope.model = {
        CusCode: '',
        Picture: '',
        Name: '',
        Note: ''
    }
    $scope.listParkingTemp = [];
    $scope.lisStore = [
        {
            Code: 'K01',
            Name: 'Kho hồ sơ chứng từ'
        },
        {
            Code: 'K02',
            Name: 'Kho ACB Hà Nội'
        }, {
            Code: 'K03',
            Name: 'Kho hội sở ACB'
        }, {
            Code: 'K04',
            Name: 'Kho ACB phần mềm quan trung'
        }
    ];
    $scope.lisPicture = [
        {
            'name': 'Kho loại một',
            'url': '/images/map/store.png'
        },
        {
            'name': 'Kho loại hai',
            'url': '/images/map/store_1.png'
        }
    ];

    var map;
    var fields_vector_source;
    var draw;
    var parkingTemplayer = new ol.source.Vector({});
    var count = 0;
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
            config.searchCustomer();
            config.searchSupplier();
        },

        //load map
        loadMap: function () {


            fields_vector_source = new ol.source.Vector({});

            vectorSource1 = new ol.source.Vector({});

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
                        anchor: [0.5, 1],
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
            vectorSource1 = new ol.source.Vector({});
            var vectorIcon = new ol.source.Vector({});

            centervier = [];
            vnfields = [];
            var iconFeatures = [];
            dataservice.getAllData(function (data) {
                for (var i in data) {
                    try {
                        var obj = JSON.parse(i);
                        var parse = JSON.parse(data[i].PolygonGPS);

                        var title = data[i].Title;
                        var fill_color = parse.properties.fill_color;

                        //var stroke_color = parse.properties.stroke_color;
                        //var stroke_width = parse.properties.stroke_width;
                        //var text_fill = parse.properties.text_fill;
                        var font_size = parse.properties.font_size;
                        //var Image = data[i].Image;
                        //var CompanyCode = data[i].Company_Code;
                        //var Owner = data[i].Owner;
                        //var Address = data[i].Address;
                        //var Description = data[i].Description;
                        //var title = data[i].Title;
                        var Icon = document.location.origin + data[i].Icon;
                        //vnfields.push(parse.gis_data);

                        var polygon1 = new ol.geom.Polygon(parse.gis_data);
                        //console.log(parse.gis_data);
                        //var iconFeature = new ol.Feature({
                        //    geometry: new ol.geom.Point(parse.gis_data[0][0]),
                        //    name: parse.properties.text,
                        //    image: data[i].Image,
                        //    description: data[i].Description,
                        //    title: data[i].Title,
                        //    owner: data[i].Owner,
                        //    Address: data[i].Address,
                        //    CompanyCode: data[i].Company_Code,
                        //    population: data[i].Id,
                        //    rainfall: 500
                        //});

                        var feature = new ol.Feature(polygon1);
                        feature.setId(data[i].Id);
                        feature.getGeometry();
                        //var xyx = feature1.getGeometry();
                        //var xzx = feature1.getId();
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
                        //feature.set('Icon', Icon);
                        //feature.set('Address', Address);
                        //feature.set('Owner', Owner);
                        //feature.set('Description', Description);
                        feature.setStyle(config.styleDrag);
                        vectorSource1.addFeature(feature);

                    }
                    catch (Exc) { }
                };
            });
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
                    popup.setPosition(coordinates);
                    var data = feature.get('title');
                    if (data != null && data != "") {
                        map.getView().fit(feature.getGeometry(), map.getSize());
                        map.getView().setZoom(13);
                        var object = {
                            title: feature.get('title'),
                            icon: feature.get('Icon'),
                        }
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/detail.html',
                            controller: 'detail',
                            backdrop: 'static',
                            size: '35',
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
            });
        },


        //hide menu
        hideMenuRight: function () {
            $('a[data-toggle="tab"]').addClass("hidden");
            $(".tab-content").addClass("hidden");
        },

        //search customer
        searchCustomer: function () {
            $scope.customer = {};
            $scope.searchCustomer = function () {
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
                    //CustomerCode: $scope.customer.CustomerCode
                }
                vectorSource1.clear();
                dataservice.searchCustomer($scope.modelSearch, function (rs) {
                    //$scope.listCustomer = rs;
                    if (rs.length > 0) {
                        for (var indx = 0; indx < rs.length; ++indx) {
                            var item = rs[indx];
                            if (item.GoogleMap.length > 0) {
                                var latlngString = item.GoogleMap.split(",");
                                if (latlngString.length == 2) {
                                    var lat = parseFloat(latlngString[0].trim());
                                    var lng = parseFloat(latlngString[1].trim());
                                    var point = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
                                    var coordinates = point.getCoordinates();
                                    var gis_data = [
                                        [
                                            [coordinates[0], coordinates[1]],
                                            [coordinates[0], coordinates[1]],
                                            [coordinates[0], coordinates[1]]
                                        ]
                                    ];
                                    rs[indx].gis_data = gis_data;
                                    config.addCustomerMap(rs[indx]);
                                }
                            }

                        }
                    }
                });
            }
        },


        //search supplier
        searchSupplier: function () {
            $scope.supplier = {};
            $scope.searchSupplier = function () {
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
                    //CustomerCode: $scope.customer.CustomerCode
                }
                vectorSource1.clear();
                dataservice.searchSupplier($scope.modelSearch, function (rs) {
                    //$scope.listCustomer = rs;
                    if (rs.length > 0) {
                        for (var indx = 0; indx < rs.length; ++indx) {
                            var item = rs[indx];
                            if (item.GoogleMap.length > 0) {
                                var latlngString = item.GoogleMap.split(",");
                                if (latlngString.length == 2) {
                                    var lat = parseFloat(latlngString[0].trim());
                                    var lng = parseFloat(latlngString[1].trim());
                                    var point = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
                                    var coordinates = point.getCoordinates();
                                    var gis_data = [
                                        [
                                            [coordinates[0], coordinates[1]],
                                            [coordinates[0], coordinates[1]],
                                            [coordinates[0], coordinates[1]]
                                        ]
                                    ];
                                    rs[indx].gis_data = gis_data;
                                    config.addMap(rs[indx]);
                                }
                            }

                        }
                    }
                });
            }
        },


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
                //var value31 = $('#idListCustomer').val();
                //var Company_Code = $('#listCustomer [value="' + value31 + '"]').data('customvalue');
                //var Address = $('#Address').val();
                //var file_data = $('#file').prop('files')[0];
                var dataObj = new Object();
                if (featColl.features[count] != null && featColl.features[count].geometry != null && featColl.features[count].geometry.coordinates != null) {

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
                    //objTotal1.Company_Code = Company_Code;
                    //objTotal1.Address = Address;
                    //if (isBatch == true) {
                    var data = {
                        title: name,
                        Gis_data: JSON.stringify(dataObj),
                        Description: note,
                        Owner: objTotal1.Owner,
                        Icon: imgPath,
                        //Company_Code: objTotal1.Company_Code != null ? objTotal1.Company_Code : null,
                        //Address: objTotal1.Address != null ? objTotal1.Address : null,
                        //pictureFile: file_data != null ? file_data : null
                    };

                    $scope.listParkingTemp.push(data);
                    //count = count + 1;
                    //var html1 = '<tr><td class="text-center">' + tx1 + '</td>'
                    //    + '<td <label onclick=deleteParkingTempItem("' + (listParkingTemp.length - 1) + '")> <a>Xóa</a></label ></td>'
                    //    + '<td <label onclick=stopRobot("' + '")> </label ></td>'
                    //    + '<td><label onclick=finishRobot("' + '")> </label >'
                    //    + '</td ></tr > </tr>';
                    //$('#tableParkTemp').append(html1);
                    //}
                }
                else {
                    App.toastrError("Vui lòng vẽ 1 bãi xe trước khi thêm");
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
                        //formdata.append("Company_Code", listParkingTemp[i].Company_Code);
                        formdata.append("Icon", $scope.listParkingTemp[i].Icon);
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
                    App.toastrSuccess(caption.EDMSM_CURD_MSG_ADD_SUCCESS);
                    window.location.reload();
                }
                else {
                    App.toastrError(caption.EDMSM_CURD_MSG_ADD_BEFORE_SAVE);
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





