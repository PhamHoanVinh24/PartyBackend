var webSyncHandleUrl = 'http://117.6.131.222:8089/websync.ashx';
fm.websync.client.enableMultiple=true;
client = new fm.websync.client(webSyncHandleUrl);
client.setDisableCORS(true);
var current_channel={};
var addMarker= function(data) {
 drawMarkerExist(data);
}
getImagebyStatus = function (status, channel) {

    if(status ==1 ){
        return      "lib/assets/layouts/monitor/image/car_grey.png";
    }
    if(status==0 ){

        return "lib/assets/layouts/monitor/image/car.png";
    }
    //if(status != 1  && status != 2){

    //    return "lib/assets/layouts/monitor/image/car_grey.png";
    //}
}
	function initMap() {
		var uluru = {lat:20.99093210090554, lng: 105.80906867980957};
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [0.5, 0.5],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				rotation: 0,
                src: 'lib/assets/layouts/monitor/image/check.png'
			}))
		});
		var iconFeature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.transform([105.81022739410399,20.99113243756568], 'EPSG:4326',
					'EPSG:3857')),
			name: 'Hạ Đình',
			population: 4000,
			rainfall: 500,
			style: iconStyle
		});
		iconFeature.setId(1);
		iconFeature.setStyle(iconStyle);

		var vectorSource = new ol.source.Vector({
			features: [iconFeature]
		});
		console.log("idL: "+vectorSource.getFeatureById(1).get('name'));


		var vectorLayerMarker = new ol.layer.Vector({
			source: vectorSource
		});
		// car layer
		carSourceVector=new ol.source.Vector({
			features: []

		});
		carLayerMarker = new ol.layer.Vector({
			source: carSourceVector
		});
		carLayerMarker.setZIndex(2);
		// path layer
		pathSourceVector=new ol.source.Vector({
			features: []
		});
		pathLayerMarker = new ol.layer.Vector({
			source: pathSourceVector
		});
		var view1= new ol.View({
			//	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
			center : ol.proj.fromLonLat([105.8102273,20.99113243]),
			zoom : 12
		});
		var googleLayer=	new ol.layer.Tile({
			source: new ol.source.OSM({
				url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
				attributions: [
					new ol.Attribution({ html: '© Google' }),
					new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
				]
			})
		});
		map = new ol.Map({
			target : 'map',
			layers : [
				googleLayer,
				vectorLayerMarker,
				carLayerMarker
			],
			view :view1
		});
		 element = document.getElementById('popupBooking');
		 popup = new ol.Overlay({
			element: element,
			positioning: 'bottom-center',
			stopEvent: false,
			offset: [0, -10]
		});
         map.addOverlay(popup);
         
         map.on('click', function (evt) {
             var coordinatez = evt.coordinate;
             var hdms = ol.proj.transform(coordinatez, 'EPSG:3857', 'EPSG:4326');
             console.log(hdms);

             if ($('#coorx1').val() == null || $('#coorx1').val() == "")
             {
                 $('#coorx1').val(hdms[1]);
                 $('#coory1').val(hdms[0]);
             }
             else {
                 $('#coorx2').val(hdms[1]);
                 $('#coory2').val(hdms[0]);
             }
         });

			// var element = popup.getElement();
				// popup.setPosition([11772998.295847073,2390238.343688335]);
				// $(element).popover({
					// 'placement': 'top',
					// 'html': true,
					// 'content': "ThuLuu"
				// });
				// $(element).popover('show');
                        $.ajax({
                          type: "POST",
                          dataType: "json",
                          url: "/VayxeMonitor/GetAllDriverId",
                          success: function (data) {
                              console.log("aa" + JSON.stringify(data))
                              console.log(data.Object.length)
                              for (var i = 0; 1 < data.Object.length; i++) {
                                  $('#listNodeStart')
                                      .append($("<option>")
                                          .attr("class", 'list-group-item')
                                          .attr("data-customvalue", data.Object[i].Id)
                                          .attr("value", data.Object[i].Robot_code));

                              }
                          }
         });                      

	}
var drawMarkerExist= function(data){
    if (data != null &&carSourceVector.getFeatureById(data.location_message.driverId) != null) {
        //console.log("111111111111111111111" + data.location_message.status)
        var feature1=carSourceVector.getFeatureById(data.location_message.driverId);
        var coord = feature1.getGeometry().getCoordinates();
        coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
        var lon = coord[0];
        var lat = coord[1];
        var bear= bearing(lat,lon,data.location_message.lonlat[1],data.location_message.lonlat[0]);
        // var bear= getBearing(lat,lon,data.lonlat[1],data.lonlat[0]);
        // console.log("bear: "+bear);
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.location_message.lonlat, 'EPSG:4326',
            'EPSG:3857'));
        carSourceVector.getFeatureById(data.location_message.driverId).setGeometry(lonlat3857);
        carSourceVector.getFeatureById(data.location_message.driverId).set("name",data.location_message.username+"_"+data.location_message.channel);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: bear,
                src: getImagebyStatus(data.location_message.status,data.location_message.channel)
            }))
        });

        carSourceVector.getFeatureById(data.location_message.driverId).setStyle(iconStyle);
		 if(data.location_message.status == 2){
				 var element = popup.getElement();
					 popup.setPosition(ol.proj.transform(data.location_message.lonlat, 'EPSG:4326',
						 'EPSG:3857'));
					 $(element).popover({
						 'placement': 'top',
						 'html': true,
						 'content' : ''
						 //'content': '<table class="table table-striped"><tbody><tr><td>Khách</td><td style="color:blue">Công Công</td></tr><tr class="info"><td>Từ</td><td style="color:green">Hạ Đình</td></tr class="info"><tr><td>Đến</td><td style="color:green">Trần Duy Hưng</td></tr><tr><td>Giá</td><td style="color:red">25000 VNĐ</td></tr></tbody></table>'
					 });
					 $(element).popover('show');
		 }

        // console.log("method: " +carSourceVector.getFeatureById(data.id).get("style"));
    }
    else if (data != null && carSourceVector.getFeatureById(data.location_message.driverId) == null) {
        //--------------------------------------------
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.location_message.lonlat, 'EPSG:4326',
            'EPSG:3857'));
        //   var carFeature = renderCarFeature(lonlat3857,data.id);
        //console.log("22222222222222222222222222222222222222" + data.location_message.status)
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: getImagebyStatus(data.location_message.status)
            }))
        });
        var iconFeature = new ol.Feature({
            geometry:lonlat3857,
            name: data.location_message.driverName+"_"+data.location_message.channel,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.location_message.driverId);
        iconFeature.setStyle(iconStyle);
        carSourceVector.addFeature(iconFeature);
    }
}
fm.util.addOnLoad(function () {
    var chatObject = {
        alias: 'Unknown',
        clientId: '0',
        channels: {
            main: '/chat'
        }
    }
    listDriver = [1000];

     util =  {

        observe: fm.util.observe,
        stopEvent: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },
    
        subcribe: function(channel){
            client.subscribe({
                channel: '/' + channel,
                onSuccess: function (args) {
                    // console.log("subcribe successx: "+channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                },
                onReceive: function (args) {
                    dataDriver = args.getData();
                    var flag = false;
                    if (dataDriver.type == 3) {                       
                        //var booking3 = dataDriver;
                        //$('#act' + dataDriver.booking_message.driverId).append('<button type="button" onClick="mess3" class="btn btn-sm btn-success">Nhận chuyến</button>')
                    }
                    else if (dataDriver.type == 4) {
                        console.log(JSON.stringify(dataDriver))
                    }
                    else {
                        for (var i in listDriver) {
                            if (dataDriver.location_message.driverId == listDriver[i]) {
                                flag = true;
                            }
                        }
                        if (flag == false) {
                            
                            $("#listNodeStart").find('[data-customvalue=' + dataDriver.location_message.driverId + ']').prop("disabled", true);
                            var strStatus = (dataDriver.location_message.status == 0 ? '<a href="#" id="status">Rảnh</a>' : '<a href="#" id="status">Bận</a>')
                            listDriver.push(dataDriver.location_message.driverId)
                            $('#tableDriver').append('<tr><td class="text-center">' + dataDriver.location_message.driverId + '</td><td class="text-center">' + strStatus + '</td><td class="text-center">' + dataDriver.location_message.lonlat + '</td><td class="text-center">' + dataDriver.location_message.lonlat + '</td><td class="text-center">' + dataDriver.location_message.driverTypeCar + '</td></tr>')
                        }
                        addMarker(dataDriver);
                    }
                    //console.log("Getdata" + JSON.stringify(dataDriver))
                   }
            });
        },
        unsubcribe: function(channel){
            client.unsubscribe({
                channel: '/' + channel,
                onSuccess: function (args) {
                    // console.log("unsubcribe success: "+args.channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                }
            });
        },
        disconnect: function(){
        }
    }


     
     allUserOrder={};
     allClientMap={};
     allClientArr=[];
  
    client.connect({
        onSuccess: function (args) {
            chatObject.clientId = args.clientId;


        },
        onFailure: function (args) {

      }
    });

 
    util.subcribe("VN.HN.TX");
    util.subcribe("VN.HN.DA");
    util.subcribe("VN.HN.DD");
    util.subcribe("VN.HN.BD");
    util.subcribe("VN.HN.CG");
    util.subcribe("VN.HN.GL");
    util.subcribe("VN.HN.HB");
    util.subcribe("VN.HN.HK");
    util.subcribe("VN.HN.HM");
    util.subcribe("VN.HN.LB");
    util.subcribe("VN.HN.SS");
    util.subcribe("VN.HN.TH");
    util.subcribe("VN.HN.TL");
    util.subcribe("VN.HN.TT");
    util.subcribe("VN.TH.HH");
    util.subcribe("VN.TH.TH");
    util.subcribe("VN.TH.NS");
    util.subcribe("VN.NB.GV");
    util.subcribe("VN.NB.HL");
    util.subcribe("VN.NB.KS");
    util.subcribe("VN.NB.NQ");
    util.subcribe("VN.NB.NB");
    util.subcribe("VN.NB.TD");
    util.subcribe("VN.NB.YK");
    util.subcribe("VN.NB.YM");

});

