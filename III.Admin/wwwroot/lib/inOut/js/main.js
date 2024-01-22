$(document).ready(function () {
    //setInterval(function () {
    //    load();
    //}, 60000);

    //setInterval(function () {
    //    load1();
    //}, 60000);
});
function load() {
    $.ajax({
        url: 'https://quanghanh.s-work.vn/MobileLogin/GetCountCheckInOut',
        type: 'get',
        dataType: 'json',
        success: function (data) {
            for (var i = 0; i < data.Object.length; i++) {
                //Cửa lò//
                if (data.Object[i].KhuVuc == "CL") {
                    var totalin = 0;
                    var totalout = 0;
                    if (data.Object[i].CuaRaVao == "8.Cua01") {
                        var in1 = data.Object[i].CoutCheckIn;
                        var out1 = data.Object[i].CoutCheckOut;
                        $('#cl1in').html(in1);
                        $('#cl1out').html(out1);
                    }

                    if (data.Object[i].CuaRaVao == "6.Cua01") {
                        var in2 = data.Object[i].CoutCheckIn;
                        var out2 = data.Object[i].CoutCheckOut;
                        $('#cl2in').html(in2);
                        $('#cl2out').html(out2);

                    }

                    if (data.Object[i].CuaRaVao == "4.Cua01") {
                        var in3 = data.Object[i].CoutCheckIn;
                        var out3 = data.Object[i].CoutCheckOut;
                        $('#cl3in').html(in3);
                        $('#cl3out').html(out3);
                    }

                    if (data.Object[i].CuaRaVao == "5.Cua01") {
                        var in4 = data.Object[i].CoutCheckIn;
                        var out4 = data.Object[i].CoutCheckOut;
                        $('#cl4in').html(in4);
                        $('#cl4out').html(out4);
                    }

                    if (data.Object[i].CuaRaVao == "7.Cua01") {
                        var in5 = data.Object[i].CoutCheckIn;
                        var out5 = data.Object[i].CoutCheckOut;
                        $('#cl5in').html(in5);
                        $('#cl5out').html(out5);
                    }

                    totalin = in1 + in2 + in3 + in4 + in5;
                    totalout = out1 + out2 + out3 + out4 + out5;
                    $('#clintotal').html(totalin);
                    $('#clouttotal').html(totalout);
                }

                //Văn Phòng//
                if (data.Object[i].KhuVuc == "VP") {
                    var vpin = 0;
                    var vpout = 0;
                    if (data.Object[i].CuaRaVao == "11.Cua01") {
                        $('#vpain').html(data.Object[i].CoutCheckIn);
                        $('#vpaout').html(data.Object[i].CoutCheckOut);
                        var in1 = data.Object[i].CoutCheckIn;
                        var out1 = data.Object[i].CoutCheckOut;
                    }

                    if (data.Object[i].CuaRaVao == "12.Cua01") {
                        $('#vpbin').html(data.Object[i].CoutCheckIn);
                        $('#vpbout').html(data.Object[i].CoutCheckOut);
                        var in2 = data.Object[i].CoutCheckIn;
                        var out2 = data.Object[i].CoutCheckOut;
                    }

                    vpin = in1 + in2;
                    vpout = out1 + out2;
                    $('#totalvpin').html(vpin);
                    $('#totalvpout').html(vpout);
                }
                //Nhà ăn//
                if (data.Object[i].KhuVuc == "NA") {
                    var total2 = 0;
                    if (data.Object[i].CuaRaVao == "1.Cua01") {
                        $('#na1in').html(data.Object[i].CoutCheckIn);
                        $('#na1out').html(data.Object[i].CoutCheckOut);
                        var total1 = data.Object[i].CoutCheckIn;

                    }

                    if (data.Object[i].CuaRaVao == "2.Cua01") {
                        $('#na2in').html(data.Object[i].CoutCheckIn);
                        $('#na2out').html(data.Object[i].CoutCheckOut);
                        var in2 = data.Object[i].CoutCheckIn;

                    }

                    if (data.Object[i].CuaRaVao == "3.Cua01") {
                        $('#na3in').html(data.Object[i].CoutCheckIn);
                        $('#na3out').html(data.Object[i].CoutCheckOut);
                        var in3 = data.Object[i].CoutCheckIn;
                    }

                    total2 = in2 + in3;
                    $('#na1total').html(total1);
                    $('#na2total').html(total2);
                }
                //Mặt Bằng//
                if (data.Object[i].KhuVuc == "MB") {
                    var mbin = 0;
                    var mbout = 0;
                    if (data.Object[i].CuaRaVao == "13.Cua01") {

                        var mbin1 = data.Object[i].CoutCheckIn;
                        var mbout1 = data.Object[i].CoutCheckOut;
                        $('#mb1in').html(mbin1);
                        $('#mb1out').html(mbout1);
                    }
                    if (data.Object[i].CuaRaVao == "14.Cua01") {
                        var mbin2 = data.Object[i].CoutCheckIn;
                        var mbout2 = data.Object[i].CoutCheckOut;
                        $('#mb2in').html(mbin2);
                        $('#mb2out').html(mbout2);
                    }
                    if (data.Object[i].CuaRaVao == "10.Cua01") {
                        var mbin3 = data.Object[i].CoutCheckIn;
                        var mbout3 = data.Object[i].CoutCheckOut;
                        $('#mb3in').html(mbin3);
                        $('#mb3out').html(mbout3);
                    }
                    if (data.Object[i].CuaRaVao == "9.Cua01") {
                        var mbin4 = data.Object[i].CoutCheckIn;
                        var mbout4 = data.Object[i].CoutCheckOut;
                        $('#mb4in').html(mbin4);
                        $('#mb4out').html(mbout4);
                    }
                    mbout = mbout1 + mbout2 + mbout3 + mbout4;
                    mbin = mbin1 + mbin2 + mbin3 + mbin4;
                    $('#mbouttotal').html(mbout);
                    $('#mbintotal').html(mbin);
                }
            }
        }

    });
}
function load1() {
    $.ajax({
        url: 'https://quanghanh.s-work.vn/MobileLogin/GetCountRoleCheckInOut',
        type: 'get',
        dataType: 'json',

        success: function (data) {
            //khu vực cửa lò
            for (var i = 0; i < data.Object.length; i++) {
                if (data.Object[i].IdKhuVuc == "CL") {
                    if (data.Object[i].Description == "CBPX") {
                        $('#cbpxcl').html(data.Object[i].Total);
                    }
                    if (data.Object[i].Description == "CBVP") {
                        $('#cbvpcl').html(data.Object[i].Total);
                    }
                    if (data.Object[i].Description == "CN") {
                        $('#cncl').html(data.Object[i].Total);
                    }

                }
            }
            for (var i = 0; i < data.Object.length; i++) {
                if (data.Object[i].IdKhuVuc == "MB") {
                    if (data.Object[i].Description == "CBPX") {
                        $('#cbpxmb').html(data.Object[i].Total);
                    }
                    if (data.Object[i].Description == "CBVP") {
                        $('#cbvpmb').html(data.Object[i].Total);
                    }
                    if (data.Object[i].Description == "CN") {
                        $('#cnmb').html(data.Object[i].Total);
                    }
                }
            }
        }
    });
}

