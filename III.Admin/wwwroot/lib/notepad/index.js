(function () {

    var roomID = $('#RoomID').val();
    var scheduleID = $('#ScheduleID').val();
    var roomName = $('#RoomName').val();
    var role = $('#Role').val();
    var roomPassWord = $('#RoomPassWord').val();
    var userName = $('#UserName').val();
    var signature = $('#Signature').val();
    if (roomID == null || roomID == '' || roomID == undefined) {
        alert('Không lấy được thông tin cuộc họp');
        //window.close();
    } else {
        const client = ZoomMtgEmbedded.createClient();

        let meetingSDKElement = document.getElementById('zoomEmbed');

        client.init({
            debug: true,
            zoomAppRoot: meetingSDKElement,
            language: 'en-US',
            customize: {
                meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'dc', 'enctype'],
                toolbar: {
                    buttons: [
                        {
                            text: 'Custom Button',
                            className: 'CustomButton',
                            onClick: () => {
                                console.log('custom button');
                            }
                        }
                    ]
                }
            }
        });

        var API_KEY = $('#ApiKey').val();
        var API_SECRET = $('#ApiSecret').val();


        var meetConfig = {
            apiKey: API_KEY,
            apiSecret: API_SECRET,
            meetingNumber: parseInt(roomID),
            userName: userName,
            passWord: roomPassWord,
            leaveUrl: "/",
            role: parseInt(role)
        };

        client.join({
            meetingNumber: meetConfig.meetingNumber,
            userName: meetConfig.userName,
            signature: signature,
            apiKey: meetConfig.apiKey,
            password: meetConfig.passWord,
            success: function (res) {
                socket.emit('join-zoom', { 'user': meetConfig.userName, 'room': scheduleID });
                socket.on('full-screen-to-client', function (data) {
                    if (data.user == meetConfig.userName && data.room == scheduleID) {
                        $(".full-screen-widget").click();
                        var element = $("[aria-label='Full Screen']");
                        if (element.length > 0) {
                            $("[aria-label='Full Screen']")[0].click();
                        }
                    }
                });
                console.log('join meeting success');
            },
            error: function (res) {
                console.log(res);
            }
        });
        //console.log('checkSystemRequirements');
        //console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));
        //var url = 'https://nodejs.s-work.vn'; //Use when run on publish
        //var socket = io.connect(url);
        //ZoomMtg.preLoadWasm();

        //ZoomMtg.prepareJssdk();

        /*ZoomMtg.init({
            leaveUrl: '/Admin/Notepad/Zoom',
            isSupportAV: true,
            success: function () {
                socket.emit('init-zoom', { 'user': meetConfig.userName, 'room': scheduleID });
                ZoomMtg.join(
                    {
                        meetingNumber: meetConfig.meetingNumber,
                        userName: meetConfig.userName,
                        signature: signature,
                        apiKey: meetConfig.apiKey,
                        passWord: meetConfig.passWord,
                        success: function (res) {
                            socket.emit('join-zoom', { 'user': meetConfig.userName, 'room': scheduleID });
                            socket.on('full-screen-to-client', function (data) {
                                if (data.user == meetConfig.userName && data.room == scheduleID) {
                                    $(".full-screen-widget").click();
                                    var element = $("[aria-label='Full Screen']");
                                    if (element.length > 0) {
                                        $("[aria-label='Full Screen']")[0].click();
                                    }
                                }
                            });
                            console.log('join meeting success');
                        },
                        error: function (res) {
                            console.log(res);
                        }
                    }
                );
            },
            error: function (res) {
                console.log(res);
            }
        });*/
    }

})();
//(function ($) {
//    $(function () {
//        $(document).ready(function () {


//            $('#anzoom').click(function () {


//                $('#zmmtg-root').addClass('hide');
//                $('#zmmtg-root').removeClass('show');
//                $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').addClass('show-bold');

//            });
//            $('#hienzoom').click(function () {

//                $('#zmmtg-root').addClass('show');
//                $('#zmmtg-root').removeClass('hide');
//                $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').addClass('show-bold');
//                $('#wc-content').css('width', '100% !important');
//            });
//            $('#hienall').click(function () {
//                $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').removeClass('show-bold');
//                $('#wc-content').css('width', '0');
//            });
//            $('#join_meeting').click(function () {
//                $('#nav-tool').addClass('hide');
//                $('#nav-tool').removeClass('show');
//            });
//        });

//    });
//})(jQuery);
