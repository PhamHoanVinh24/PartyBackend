$(document).ready(function() {
    setInterval(function() {
        loadIot();
    }, 1000);

});

function loadIot() {
    $.ajax({
        url: 'https://drome3i.firebaseio.com/.json',
        type: 'get',
        dataType: 'json',

        success: function(data) {
            $('#dht1').append('<img class="icon" src="../../../lib/iot/img/temp.svg" alt=""> Humi(Độ ẩm) <br>');

            $('#dht2').append(data.SENSOR.DHT11.Humi + " %<br>");

            $('#dht3').append('<i class="fas fa-cogs"></i>Temp(Nhiệt độ) <br>');

            $('#dht4').append(data.SENSOR.DHT11.Temp + " ºC<br>");

            $('#hcs1').append('<img class="icon" src="../../../lib/iot/img/router.svg" alt=""> Distance <br>');

            $('#hcs2').append(data.SENSOR.HCSR.Distance + " cm<br>");

            // $('#lig1').append('<i class="fas fa-record-vinyl"></i>Analog <br>');

            // $('#lig2').append(data.SENSOR.Light.Analog +"<br>");

            $('#lig3').append('<img class="icon" src="../../../lib/iot/img/light.svg" alt=""> Lux <br>');


            $('#lig4').append(data.SENSOR.Light.Lux + " Lux <br>");
            $('#mpu1').append('<img class="icon" src="../../../lib/iot/img/goc.svg" alt=""> ACX <br>');
            $('#mpu4').append(data.MPU.MPU6050.ACX + " <br>");

            $('#mpu2').append("ACY <br>");
            $('#mpu5').append(data.MPU.MPU6050.ACY + " <br>");
            $('#mpu3').append("ACZ <br>");

            $('#mpu6').append(data.MPU.MPU6050.ACZ + " <br>");



            $('#mpu7').append('<img class="icon" src="../../../lib/iot/img/den.svg" alt=""> GYX <br>');
            $('#mpu8').append(data.MPU.MPU6050.GYX + " <br>");

            $('#mpu9').append("GYY <br>");
            $('#mpu10').append(data.MPU.MPU6050.GYY + " <br>");
            $('#mpu11').append("GYZ <br>");






            $('#mpu12').append(data.MPU.MPU6050.GYZ + " <br>");





            var time = new Date();
            var date = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "<br>";
            $('#time1').append('<i class="fas fa-clock"></i>' + date);
            $('#time2').append('<i class="fas fa-clock"></i>' + date);

            $('#time3').append('<i class="fas fa-clock"></i>' + date);

            $('#time4').append('<i class="fas fa-clock"></i>' + date);

            $('#time5').append('<i class="fas fa-clock"></i>' + date);
            $('#time6').append('<i class="fas fa-clock"></i>' + date);
            $('#time7').append('<i class="fas fa-clock"></i>' + date);


        }
    });

}