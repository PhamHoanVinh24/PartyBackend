window.onload = function() {
    var dataPoints1 = [];
    var dataPoints2 = [];
    var dataPoints3 = [];
    var dataPoints4 = [];
    var dataPoints5 = [];
    var dataPoints6 = [];

    var dataPoints7 = [];
    var dataPoints8 = [];

    var dataPoints9 = [];

    var dataPoints10 = [];




    $.getJSON("https://drome3i.firebaseio.com/.json", function(data) {
        ///set time x
        var time = new Date().getTime();
        var date = new Date(time);

        dataPoints1.push({ x: date, y: data.SENSOR.DHT11.Temp });
        chart1 = new CanvasJS.Chart("box2", {
            backgroundColor: "transparent",
            title: {
                text: "DHT11 TEMP(CẢM BIẾN NHIỆT ĐỘ)",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "Temperature",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,

                suffix: " ºC",

                includeZero: false,

            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1

            },

            data: [{
                    type: "line",
                    color: "red",
                    dataPoints: dataPoints1

                }
                // ,
                // {
                //     color:"blue",
                //     type: "line",
                //     dataPoints : dataPoints1

                // }

            ]
        });


        dataPoints2.push({ x: date, y: data.MPU.MPU6050.ACX });
        dataPoints6.push({ x: date, y: data.MPU.MPU6050.ACY });
        dataPoints7.push({ x: date, y: data.MPU.MPU6050.ACZ });
        dataPoints8.push({ x: date, y: data.MPU.MPU6050.GYX });

        dataPoints9.push({ x: date, y: data.MPU.MPU6050.GYY });

        dataPoints10.push({ x: date, y: data.MPU.MPU6050.GYZ });



        chart2 = new CanvasJS.Chart("box5", {
            backgroundColor: "transparent",
            title: {
                text: "MPU MPU6050(CẢM BIẾN GÓC NGHIÊNG) ",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "MPU_A",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,


                includeZero: false,

            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1,

            },
            legend: {
                fontColor: "white"
            },

            data: [{
                    name: "ACX",
                    showInLegend: true,
                    color: "green",
                    type: "line",
                    dataPoints: dataPoints2

                },
                {
                    name: "ACX",
                    showInLegend: true,
                    color: "yellow",
                    type: "line",
                    dataPoints: dataPoints6

                },
                {
                    name: "ACX",
                    showInLegend: true,
                    color: "red",
                    type: "line",
                    dataPoints: dataPoints7

                },


            ]
        });
        chart6 = new CanvasJS.Chart("box6", {
            backgroundColor: "transparent",
            title: {
                text: "MPU MPU6050 G(CẢM BIẾN TỐC ĐỘ GÓC)",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "MPU",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,


                includeZero: false,

            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1,

            },
            legend: {
                fontColor: "white"
            },

            data: [{
                    name: "ACX",
                    showInLegend: true,
                    color: "green",
                    type: "line",
                    dataPoints: dataPoints8

                },
                {
                    name: "ACY",
                    showInLegend: true,
                    color: "yellow",
                    type: "line",
                    dataPoints: dataPoints9

                }, {
                    name: "ACZ",
                    showInLegend: true,
                    color: "red",
                    type: "line",
                    dataPoints: dataPoints10

                }

            ]
        });

        dataPoints3.push({ x: date, y: data.SENSOR.HCSR.Distance });
        chart3 = new CanvasJS.Chart("box3", {
            backgroundColor: "transparent",
            title: {
                text: "HCSR DISTANCE(CẢM BIẾN KHOẢNG CÁCH)",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "Distance",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,
                suffix: " cm",


                includeZero: false,
            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1

            },

            data: [{
                    color: "yellow",
                    type: "line",
                    dataPoints: dataPoints3

                }
                // ,
                // {
                //     color:"blue",
                //     type: "line",
                //     dataPoints : dataPoints1

                // }

            ]
        });

        dataPoints4.push({ x: date, y: data.SENSOR.DHT11.Humi });
        chart4 = new CanvasJS.Chart("box1", {
            backgroundColor: "transparent",
            title: {
                text: "DHT11 HUMI(CẢM BIẾN ĐỘ ẨM)",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "Humi",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,
                suffix: " %",


                includeZero: false,

            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1

            },

            data: [{
                    color: "red",
                    type: "line",
                    dataPoints: dataPoints4

                }
                // ,
                // {
                //     color:"blue",
                //     type: "line",
                //     dataPoints : dataPoints1

                // }

            ]
        });
        dataPoints5.push({ x: date, y: data.SENSOR.Light.Lux });
        chart5 = new CanvasJS.Chart("box4", {
            backgroundColor: "transparent",
            title: {
                text: "LIGHT LUX(CẢM BIẾN ÁNH SÁNG)",
                fontColor: "#00FF00",
                fontSize: 15
            },
            axisY: {
                title: "Lux",
                labelFontColor: "white",
                titleFontColor: "white",
                gridThickness: 0.5,
                lineThickness: 1,
                suffix: "Lux",


                includeZero: false,

            },
            axisX: {
                title: "Time",

                labelFontColor: "white",
                titleFontColor: "white",
                lineThickness: 1

            },

            data: [{
                    color: "green",
                    type: "line",
                    dataPoints: dataPoints5

                }
                // ,
                // {
                //     color:"blue",
                //     type: "line",
                //     dataPoints : dataPoints1

                // }

            ]
        });



        chart1.render();

        chart2.render();
        chart3.render();

        chart4.render();
        chart5.render();
        chart6.render();



        updateChart();


    });

    function updateChart() {
        $.getJSON("https://drome3i.firebaseio.com/.json", function(data) {
            ///set time x
            var time = new Date().getTime();
            var date = new Date(time);



            dataPoints1.push({
                x: date,
                y: data.SENSOR.DHT11.Temp,
            });
            dataPoints4.push({
                x: date,
                y: data.SENSOR.DHT11.Humi,
            });
            dataPoints3.push({
                x: date,
                y: data.SENSOR.HCSR.Distance,
            });
            dataPoints2.push({
                x: date,
                y: data.MPU.MPU6050.ACX,

            });



            dataPoints5.push({
                x: date,
                y: data.SENSOR.Light.Lux,

            });
            dataPoints6.push({
                x: date,
                y: data.MPU.MPU6050.ACY,

            });
            dataPoints7.push({
                x: date,
                y: data.MPU.MPU6050.ACZ,

            });
            dataPoints8.push({
                x: date,
                y: data.MPU.MPU6050.GYX,

            });
            dataPoints9.push({
                x: date,
                y: data.MPU.MPU6050.GYY,

            });
            dataPoints10.push({
                x: date,
                y: data.MPU.MPU6050.GYZ,

            });
            chart1.render();

            chart2.render();
            chart3.render();

            chart4.render();
            chart5.render();
            chart6.render();
            setTimeout(function() { updateChart() }, 1000);
        });
    }
}