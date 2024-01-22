/*=========================================================================================
  File Name: chat.js
  Description: config websync,chat
  initialization and manipulations
  ----------------------------------------------------------------------------------------
==========================================================================================*/
var count = 1;
var configChat = {
    init: function () {
        $(".pop-chat").click(function () {
            if ($("#zoom-chat-vatco").hasClass("hidden")) {
                document.getElementById("zoom-chat-vatco").style.display = "block !important";
                $("#zoom-chat-vatco").removeClass("hidden");
            }
            else {
                $("#zoom-chat-vatco").addClass("hidden")
            }
        });
        $(".dbIOT").click(function () {
            location.replace("/Admin/IOT");
        });

        $("#catturacam").click(function () {
            location.replace("/Admin/GateInOut");
        });

        $(".block-video").click(function () {
            $('.content-wrapper').toggleClass('demoscreen');
            $('.app-content').toggleClass('demoscreen');
            $('.border-box-dashboard').toggleClass('demobox');
            $('.boxdeu').toggleClass('demobox');
            $('.text-content-box-act-emp').toggleClass('text-content-box-act-emp-demo');
            $('.text-header-box-act-employee').toggleClass('text-header-box-act-employee-demo');
            $('.text-header-box').toggleClass('text-header-box-demo');
            $('.color-text-cms').toggleClass('color-text-cms-demo');
            $('.txtAction').toggleClass('txtAction-demo');
            $('.txtName').toggleClass('txtName-demo');
            $('h4').toggleClass('h42');

            if (count == 1) {
                $('rect.Object_Label').css('fill', '#fff');
                $('text.draw2d_shape_basic_Label.txt1').css('fill', '#000');
                $('text.draw2d_shape_basic_Label.txt2').css('fill', '#000');
                $('text.draw2d_shape_basic_Label.txt3').css('fill', '#000');
                $('text.draw2d_shape_basic_Label.txt5').css('fill', '#000');
                $('text.draw2d_shape_basic_Label.txt6').css('fill', '#000');
                $('#toggleAudioMute').addClass('hidden');
                $('#toggleVideoMute').removeClass('hidden');
                count = 2;
            }
            else {
                $('rect.Object_Label').css('fill', '#000');
                $('text.draw2d_shape_basic_Label.txt1').css('fill', '#fff');
                $('text.draw2d_shape_basic_Label.txt2').css('fill', 'lime');
                $('text.draw2d_shape_basic_Label.txt3').css('fill', 'red');
                $('text.draw2d_shape_basic_Label.txt5').css('fill', 'grey');
                $('text.draw2d_shape_basic_Label.txt6').css('fill', '#00adef');
                $('#toggleVideoMute').addClass('hidden');
                $('#toggleAudioMute').removeClass('hidden');
                count = 1;
            }
        });

        $(".block-voice").click(function () {
            App.toastrError("Chức năng đang được xây dựng");
        });

        $(".video_list").click(function () {
            App.toastrError("Chức năng đang được xây dựng");
        });

        $(".status-selector").click(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $('.status-selector-bar').hide();
            } else {
                $(this).addClass('active');
                $('.status-selector-bar').show();
            }
        });
    }
}

//var webSyncHandleUrl = 'http://117.6.131.222:8089/websync.ashx';
//var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
var webSyncHandleUrl = 'https://websync.3i.com.vn/websync.ashx';
fm.websync.client.enableMultiple = true;

var peer = [];

var clients = new fm.websync.client(webSyncHandleUrl);
peer.push(clients);
var testichat = document.getElementById('testichat');
var cnt = 0;
var channel = '';
var isChatGpt = '';
var userName = document.getElementById('UserName').value;
var fullName = document.getElementById('FullName').value;
var avatar = document.getElementById('Avatar').value;
var userId = document.getElementById('UserId').value;
var host = document.getElementById('Host').value;

function initChat() {
    $(".btn-student").dblclick(function () {
        var id = $(this).attr('data-id');
        var tab = getTab();
        var channels = [];

        $("#tab-chat li").each(function (i) {
            var room = $(this).attr('data-room');
            channels.push('/' + room);
        });
        if (id != tab && cnt < 1) {
            cnt = cnt + 1;
            $('.inbox-message').css("display", "none");

            var username = $(this).attr('data-name');
            var stanza = roomid = 'private' + id;
            var ul = document.createElement('ul');
            ul.id = "testichat" + id;
            ul.className = "inbox-message style-scrollbar";

            var img = document.createElement('img');
            img.id = "closePrivate" + id;
            img.className = "close-private";
            img.src = "~/images/icons/icon_CLOSE.png";
            $('#chat').append(img);
            $('#chat').append(ul);

            var testichats = document.getElementById('testichat' + id);

            //loadChat(username, roomid, clients, testichats, false, null, null, null);
            //getSubscribe(clients, roomid, testichats);
            //if (channels.length) unSubscribe(clients, channels);

            socket.emit('privatemessage', {
                'id': id,
                'roomid': roomid,
                'studentid': id,
                'studentname': username,
                'room': stanza
            });

            $('.all-message').removeClass('active');
            $('.mess-private').removeClass('active');
            $('<li class="item-stt-message mess-private active" data-id="' + id + '" data-name="' + username + '" data-room="' + roomid + '"><p class="text-overfl">' + username + '</p></li>').insertAfter(".all-message");
        }
    });

    $('.prev-message').click(function () {
        var $prev = $('#tab-chat .active').prev();
        if ($prev.length) {
            $('#tab-chat').animate({
                scrollLeft: $prev.position().left
            }, 'slow');
        }
    });

    $('.next-message').click(function () {
        var $next = $('#tab-chat .active').next();
        if ($next.length) {
            $('#tab-chat').animate({
                scrollLeft: $next.position().left
            }, 'slow');
        }
    });

    //socket.on('privatecreate', function (data) {
    //    var channels = [];

    //    $("#tab-chat li").each(function (i) {
    //        var room = $(this).attr('data-room');
    //        channels.push('/' + room);
    //    });

    //    $('.inbox-message').css("display", "none");

    //    var ul = document.createElement('ul');
    //    ul.id = "testichat" + data.studentid;
    //    ul.className = "inbox-message style-scrollbar";
    //    $('#chat').append(ul);
    //    stanza = data.roomid;

    //    var testichats = document.getElementById('testichat' + data.studentid);

    //    loadChat('Tutor', data.roomid, clients, testichats);
    //    getSubscribe(clients, data.roomid, testichats);
    //    if (channels.length) unSubscribe(clients, channels);

    //    $('.all-message').removeClass('active');
    //    $('.mess-private').removeClass('active');
    //    $('<li class="item-stt-message mess-private active" data-id="' + data.studentid + '" data-name="' + data.studentname + '" data-room="' + data.roomid + '"><p class="text-overfl">' + data.studentname + '</p></li>').insertAfter(".all-message");
    //});
}

function initData() {
    //$('#icon-header-chat-out-room').show();
    //$('#header-chat-out-room').show();
    $('.header-menu').show();
    clearLstUserRoom();
    clearLstGroupChat();
    //getListRoom();
    getListUser();
    getListGroupChat();
    InitScreenHeight();
    ResizeWhenShowBoth();
    isChatGpt = false;
}
function chatGpt() {
    //$('#icon-header-chat-out-room').hide();
    //$('#header-chat-out-room').hide();
    $('.header-menu').hide();
    clearLstUserRoom();
    clearLstGroupChat();
    InitScreenHeightChatOnly();
    isChatGpt = true;
    messageGpt();
}

//function initVideo() {
//    var videoChat = document.getElementById('videoChat');
//    var loading = document.getElementById('loading');
//    var video = document.getElementById('video');
//    var closeVideo = document.getElementById('closeVideo');
//    var toggleAudioMute = document.getElementById('toggleAudioMute');
//    var toggleVideoMute = document.getElementById('toggleVideoMute');
//    var joinSessionButton = document.getElementById('catturacam');

//    var app = new Video(testichat);
//    var start = function (sessionId, statusVideo = false, statusAudio = true) {
//        if (app.sessionId) {
//            return;
//        }

//        if (sessionId.length != 6) {
//            console.log('Session ID must be 6 digits long.');
//            return;
//        }

//        app.sessionId = sessionId;

//        // Switch the UI context.
//        //location.hash = app.sessionId + '&screen=' + (captureScreenCheckbox.checked ? '1' : '0');
//        videoChat.style.display = 'block';

//        console.log('Joining session ' + app.sessionId + '.');
//        //fm.log.info('Joining session ' + app.sessionId + '.');

//        // Start the signalling client.
//        app.startSignalling(function (error) {
//            if (error != null) {
//                console.log(error);
//                stop();
//                return;
//            }

//            // Start the local media stream.
//            app.startLocalMedia(video, false, statusVideo, statusAudio, function (error) {
//                if (error != null) {
//                    console.log(error);
//                    stop();
//                    return;
//                }

//                // Update the UI context.
//                loading.style.display = 'none';
//                video.style.display = 'block';

//                // Enable the media controls.
//                //toggleAudioMute.removeAttribute('disabled');
//                //toggleVideoMute.removeAttribute('disabled');

//                // Start the conference.
//                app.startConference(function (error) {
//                    if (error != null) {
//                        console.log(error);
//                        stop();
//                        return;
//                    }

//                    // Enable the leave button.
//                    //leaveButton.removeAttribute('disabled');

//                    //fm.log.info('<span style="font-size: 1.5em;">' + app.sessionId + '</span>');
//                    console.log('<span style="font-size: 1.5em;">' + app.sessionId + '</span>');
//                }, function () {
//                    stop();
//                });
//            });
//        });
//    };

//    var stop = function () {
//        if (!app.sessionId) {
//            return;
//        }

//        // Disable the leave button.
//        // leaveButton.setAttribute('disabled', 'disabled');

//        console.log('Leaving session ' + app.sessionId + '.');
//        //fm.log.info('Leaving session ' + app.sessionId + '.');

//        app.sessionId = '';

//        $('#catturacam').removeClass('active');

//        app.stopConference(function (error) {
//            if (error) {
//                fm.log.error(error);
//            }

//            // Disable the media controls.
//            //toggleAudioMute.setAttribute('disabled', 'disabled');
//            //toggleVideoMute.setAttribute('disabled', 'disabled');

//            // Update the UI context.
//            video.style.display = 'none';
//            loading.style.display = 'block';

//            app.stopLocalMedia(function (error) {
//                if (error) {
//                    fm.log.error(error);
//                }

//                app.stopSignalling(function (error) {
//                    if (error) {
//                        fm.log.error(error);
//                    }
//                    // Switch the UI context.
//                    //sessionSelector.style.display = 'block';
//                    videoChat.style.display = 'none';
//                    location.hash = '';
//                });
//            });
//        });
//    };

//    // Attach DOM events.
//    fm.util.observe(joinSessionButton, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            videoChat.style.display = 'none';
//            $(this).removeClass('active');
//            stop();
//        } else {
//            videoChat.style.display = 'block';
//            $(this).addClass('active');
//            $(".menu-tray").show("slide", { direction: "right" }, "slow");
//            if ($('#toggleAudioMute').hasClass('active'))
//                statusAudio = true;
//            else
//                statusAudio = false;

//            if ($('#toggleVideoMute').hasClass('active'))
//                statusVideo = true;
//            else
//                statusVideo = false;

//            start('public', statusVideo, statusAudio);
//        }
//    });

//    fm.util.observe(closeVideo, 'click', function (evt) {
//        videoChat.style.display = 'none';
//        $('#catturacam').removeClass('active');
//        stop();
//    });

//    fm.util.observe(window, 'unload', function () {
//        stop();
//    });

//    fm.util.observe(toggleVideoMute, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            var muted = app.toggleVideoMute();
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_OFF.png');
//            $(this).removeClass('active');
//            videoChat.style.display = 'none';
//            $('#catturacam').removeClass('active');
//            stop();
//        } else {
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_ON.png');
//            $(this).addClass('active');
//            videoChat.style.display = 'block';
//            $(".menu-tray").show("slide", { direction: "right" }, "slow");
//            if ($('#toggleVideoMute').hasClass('active'))
//                statusVideo = true;
//            else
//                statusVideo = false;

//            start('public', statusVideo, true);
//        }

//    });

//    fm.util.observe(toggleAudioMute, 'click', function (evt) {
//        if ($(this).hasClass('active')) {
//            var muted = app.toggleAudioMute();
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_OFF.png');
//            $(this).removeClass('active');
//        } else {
//            $(this).children().attr('src', '../../../lib/chat/image/icon_Toggle_ALL_ON.png');
//            $(this).addClass('active');

//            if ($('#toggleAudioMute').hasClass('active'))
//                statusAudio = true;
//            else
//                statusAudio = false;
//        }

//    });
//}

function loadChat(username, roomid, client, testichats) {
    var name = username;
    console.log('username: ', username);
    var rooms = roomid;
    var clients = client;
    var testichat = testichats;
    var iconnn = document.getElementById('hihihi');
    var iconnnAC = document.getElementById('hahhhha');

    fm.util.addOnLoad(function () {

        //init object chat between users a room
        var chat = {
            alias: 'Unknown',
            clientId: 0,
            channels: {
                main: '/' + rooms
            },
            dom: {
                chat: {
                    container: document.getElementById('chat'),
                    text: document.getElementById('text-input'),
                    send: document.getElementById('btn-send'),
                    username: name,
                    roomid: rooms
                }
            },
            util: {
                start: function () {
                    chat.alias = name;
                    chat.clientId = rooms;
                    //chat.util.hide(chat.dom.prechat.container);
                    chat.util.show(chat.dom.chat.container);
                    chat.util.scroll();
                    chat.dom.chat.text.focus();
                },
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
                send: function () {
                    if (chat.util.isEmpty(chat.dom.chat.text)) {
                        chat.util.setInvalid(chat.dom.chat.text);
                    }
                    else {
                        var date = new Date();
                        var hour = date.getHours();
                        var minutes = date.getMinutes();
                        var time = hour + ":" + minutes;

                        var dataSend = {
                            alias: chat.alias,
                            type: 999,
                            from: "driver",
                            locationMessage: {
                                driverId: userId,
                            },
                            userName: userName,
                            name: fullName,
                            text: chat.dom.chat.text.value,
                            avatar: avatar,
                            time: time,
                            isFile: false,
                            fileId: null,
                            url: null
                        };

                        console.log('----------Data Send-----------');
                        console.log(dataSend);
                        removeContentChat();
                        // use global channel variable
                        clients.publish({
                            retries: 0,
                            channel: '/' + channel,
                            data: dataSend,
                            onSuccess: function (args) {
                                debugger
                                var logData = { Channel: channel, Content: dataSend.text, User: dataSend.userName, Image: dataSend.avatar, GivenName: dataSend.name };
                                insertLogMess(logData);
                                console.log('----------Send data success-----------');
                                chat.util.clear(chat.dom.chat.text);
                            }
                        });
                    }
                },
                sendFile: function (fileId) {
                    if (chat.util.isEmpty(fileId)) {
                        chat.util.setInvalid(chat.dom.chat.text);
                    }
                    else {
                        var date = new Date();
                        var hour = date.getHours();
                        var minutes = date.getMinutes();
                        var time = hour + ":" + minutes;

                        var dataSend = {
                            alias: chat.alias,
                            type: 999,
                            from: "driver",
                            locationMessage: {
                                driverId: userId,
                            },
                            userName: userName,
                            name: fullName,
                            text: fileName,
                            avatar: avatar,
                            time: time,
                            isFile: true,
                            fileId: fileId,
                            url: url
                        };

                        console.log('----------Data Send-----------');
                        console.log(dataSend);
                        removeContentChat();
                        clients.publish({
                            retries: 0,
                            channel: '/' + rooms,
                            data: dataSend,
                            onSuccess: function (args) {
                                var logData = { Channel: channel, Content: dataSend.text, User: dataSend.userName, Image: dataSend.avatar, GivenName: dataSend.name };
                                insertLogMess(logData);
                                console.log('----------Send data success-----------');
                                chat.util.clear(chat.dom.chat.text);
                            }
                        });
                    }
                },
                show: function (el) {
                    el.style.display = '';
                },
                hide: function (el) {
                    el.style.display = 'none';
                },
                clear: function (el) {
                    el.value = '';
                },
                observe: fm.util.observe,
                isEnter: function (e) {
                    return (e.keyCode == 13);
                },
                isEmpty: function (el) {
                    return (el.value == '');
                },
                setInvalid: function (el) {
                    el.className = 'invalid';
                },
                clearLog: function () {
                    testichat.innerHTML = '';
                },
                logMessage: function (alias, text, me) {
                    var html = '<li';
                    if (me) {
                        html += ' class="item-message"';
                    } else {
                        html += ' class="item-message me"';
                    }
                    html += '><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
                    chat.util.log(html);
                },
                logSuccess: function (text) {
                    chat.util.log('<li class="item-message success"><p class="content-mess">' + text + '</p></li>');
                },
                logFailure: function (text) {
                    chat.util.log('<li class="item-message failure"><p class="content-mess">' + text + '</p></li>');
                },
                log: function (html) {
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    testichat.appendChild(div);
                    chat.util.scroll();
                },
                scroll: function () {
                    testichat.scrollTop = testichat.scrollHeight;
                }
            }
        };

        chat.util.observe(chat.dom.chat.send, 'click', function (e) {
            chat.util.start();
            chat.util.send();
        });

        chat.util.observe(chat.dom.chat.text, 'keydown', function (e) {
            if (chat.util.isEnter(e)) {
                chat.util.start();
                chat.util.send();
                chat.util.stopEvent(e);


                iconnn.classList.add("hidden");
                iconnn.classList.remove("active");
                iconnnAC.classList.remove("active");
            }
        });

        client.setAutoDisconnect({
            synchronous: true
        });
        clients.connect({
            onSuccess: function (args) {
                chat.clientId = args.clientId;
                chat.util.clearLog();
                //chat.util.logSuccess('Connected to WebSync.');
                //chat.util.show(chat.dom.prechat.container);
                chat.util.show(chat.dom.chat.container);
            },
            onFailure: function (args) {
                console.log(args);
                //var username = args.getData().alias;
                //var content = c
                //chat.util.logSuccess('Could not connect to WebSync.');
            }
        });
    });
}

function getSubscribe(clients, roomid, testichat) {
    clients.subscribe({
        channel: '/' + roomid,
        onSuccess: function (args) {
            //chat.util.logSuccess('Content chat.');
            //var logs = args.getExtensionValue('logs');
            //if (logs != null) {
            //    for (var i = 0; i < logs.length; i++) {
            //        logMessage(logs[i].alias, logs[i].text, false, testichat, logs[i].emoji);
            //    }
            //}
        },
        onFailure: function (args) {
            //chat.util.logSuccess('Not connecting.');
        },
        onReceive: function (args) {
            var ch = args.getChannel();
            //logMessage(args.getData().alias, args.getData().text, args.getWasSentByMe(), testichat, args.getData().emoji);
            receiveMessage(args.getData().userName, args.getData().name, args.getData().text, args.getData().avatar, args.getWasSentByMe(), args.getData().time, args.getData().isFile, args.getData().fileId, args.getData().url);
        }
    });
}
function unSubscribe(clients, channel, callback) {
    var chat = document.getElementById('testichat');
    chat.innerHTML = '';
    clients.subscribe({
        channel: '/' + channel,
        onSuccess: callback,
        onFailure: function (args) {
            console.log(args);
            //chat.util.logSuccess('Not connecting.');
        }
    });
}

function InitScreenHeight() {
    var chatMenuHeight = $(window).height() - 205;
    var hBottom = $('.chat-body').height(),
        ht = chatMenuHeight;
    var hBottom = $('.chat-body').height(),
        hTop = chatMenuHeight - hBottom;
    $('#testichat').css('max-height', hBottom - 32);
    $('.header-menu').height(hTop);
}
function InitScreenHeightChatOnly() {
    var chatMenuHeight = $(window).height() - 103;
    $('#testichat').css('max-height', chatMenuHeight - 52);
}
function ResizeWhenShowBoth() {
    $('.chat-body').resizable({
        minHeight: 300,
        handles: {
            's': '.ui-resizable-n'
        },
        start: function (e, ui) {

        }
    }).on("resize", function (event, ui) {
        var chatMenuHeight = $(window).height() - 205;
        var hBottom = ui.size.height,
            ht = chatMenuHeight;
        var hBottom = ui.size.height,
            hTop = chatMenuHeight - hBottom;
        $('#testichat').css('max-height', hBottom - 32);
        $('.chat-body').height(hBottom);
        $('.chat-body').css('top', 0);
        console.log(hTop);
        $('.header-menu').height(hTop);
        $(window).resize(function () {
            console.log(chatMenuHeight - hBottom);
            $(".header-menu").height(chatMenuHeight - hBottom);
        });

        $(window).trigger('resize');
    });
};

//function loadChat(username, roomid, client, testichats, attachFile, fileId, fileName, url) {
//    var name = username;
//    var rooms = roomid;
//    var clients = client;
//    var testichat = testichats;
//    fm.util.addOnLoad(function () {
//        //init object chat between users a room
//        var chat = {
//            alias: 'Unknown',
//            clientId: 0,
//            channels: {
//                main: '/' + rooms
//            },
//            dom: {
//                chat: {
//                    container: document.getElementById('chat'),
//                    text: document.getElementById('text-input'),
//                    send: document.getElementById('btn-send'),
//                    username: name,
//                    roomid: rooms
//                }
//            },
//            util: {
//                start: function () {
//                    //console.log(name + ':' + room);
//                    chat.alias = name;
//                    chat.clientId = userId;
//                    //chat.util.hide(chat.dom.prechat.container);
//                    chat.util.show(chat.dom.chat.container);
//                    chat.util.scroll();
//                    chat.dom.chat.text.focus();
//                },
//                stopEvent: function (event) {
//                    if (event.preventDefault) {
//                        event.preventDefault();
//                    } else {
//                        event.returnValue = false;
//                    }
//                    if (event.stopPropagation) {
//                        event.stopPropagation();
//                    } else {
//                        event.cancelBubble = true;
//                    }
//                },
//                send: function () {
//                    if (chat.util.isEmpty(chat.dom.chat.text)) {
//                        chat.util.setInvalid(chat.dom.chat.text);
//                    }
//                    else {
//                        var date = new Date();
//                        var hour = date.getHours();
//                        var minutes = date.getMinutes();
//                        var time = hour + ":" + minutes;

//                        var dataSend = {
//                            alias: chat.alias,
//                            type: 999,
//                            from: "driver",
//                            locationMessage: {
//                                driverId: userId,
//                            },
//                            userName: userName,
//                            name: fullName,
//                            text: chat.dom.chat.text.value,
//                            avatar: avatar,
//                            time: time,
//                            isFile: false,
//                            fileId: null,
//                            url: null
//                        };

//                        console.log('----------Data Send-----------');
//                        console.log(dataSend);
//                        removeContentChat();
//                        clients.publish({
//                            retries: 0,
//                            channel: '/' + rooms,
//                            data: dataSend,
//                            onSuccess: function (args) {
//                                debugger
//                                var logData = { Channel: channel, Content: dataSend.text, User: dataSend.userName, Image: dataSend.avatar, GivenName: dataSend.name };
//                                insertLogMess(logData);
//                                console.log('----------Send data success-----------');
//                                chat.util.clear(chat.dom.chat.text);
//                            }
//                        });
//                    }
//                },
//                sendFile: function (fileId) {
//                    if (chat.util.isEmpty(fileId)) {
//                        chat.util.setInvalid(chat.dom.chat.text);
//                    }
//                    else {
//                        var date = new Date();
//                        var hour = date.getHours();
//                        var minutes = date.getMinutes();
//                        var time = hour + ":" + minutes;

//                        var dataSend = {
//                            alias: chat.alias,
//                            type: 999,
//                            from: "driver",
//                            locationMessage: {
//                                driverId: userId,
//                            },
//                            userName: userName,
//                            name: fullName,
//                            text: fileName,
//                            avatar: avatar,
//                            time: time,
//                            isFile: true,
//                            fileId: fileId,
//                            url: url
//                        };

//                        console.log('----------Data Send-----------');
//                        console.log(dataSend);
//                        removeContentChat();
//                        clients.publish({
//                            retries: 0,
//                            channel: '/' + rooms,
//                            data: dataSend,
//                            onSuccess: function (args) {
//                                var logData = { Channel: channel, Content: dataSend.text, User: dataSend.userName, Image: dataSend.avatar, GivenName: dataSend.name };
//                                insertLogMess(logData);
//                                console.log('----------Send data success-----------');
//                                chat.util.clear(chat.dom.chat.text);
//                            }
//                        });
//                    }
//                },
//                show: function (el) {
//                    el.style.display = '';
//                },
//                hide: function (el) {
//                    el.style.display = 'none';
//                },
//                clear: function (el) {
//                    el.value = '';
//                },
//                observe: fm.util.observe,
//                isEnter: function (e) {
//                    return (e.keyCode == 13);
//                },
//                isEmpty: function (el) {
//                    return (el.value == '');
//                },
//                setInvalid: function (el) {
//                    el.className = 'invalid';
//                },
//                //clearLog: function () {
//                //    testichat.innerHTML = '';
//                //},
//                logMessage: function (alias, text, me) {
//                    var html = '<li';
//                    if (me) {
//                        html += ' class="item-message"';
//                    } else {
//                        html += ' class="item-message me"';
//                    }
//                    html += '><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
//                    chat.util.log(html);
//                },
//                logSuccess: function (text) {
//                    chat.util.log('<li class="item-message success"><p class="content-mess">' + text + '</p></li>');
//                },
//                logFailure: function (text) {
//                    chat.util.log('<li class="item-message failure"><p class="content-mess">' + text + '</p></li>');
//                },
//                log: function (html) {
//                    var div = document.createElement('div');
//                    div.innerHTML = html;
//                    testichat.appendChild(div);
//                    chat.util.scroll();
//                },
//                scroll: function () {
//                    testichat.scrollTop = testichat.scrollHeight;
//                }
//            }
//        };

//        chat.util.observe(chat.dom.chat.send, 'click', function (e) {
//            chat.util.start();
//            chat.util.send();
//        });

//        chat.util.observe(chat.dom.chat.text, 'keydown', function (e) {
//            console.log('------beforsend------')
//            if ($('#text-input').val().length > 80) {
//                $('#text-input').css('height', 'auto');
//            } else {
//                $('#text-input').css('height', 'auto');
//            }

//            if (chat.util.isEnter(e)) {
//                console.log('------send------')
//                chat.util.start();
//                chat.util.send();
//                chat.util.stopEvent(e);
//            }
//        });

//        if (attachFile) {
//            chat.util.start();
//            chat.util.sendFile(fileId);
//        }

//        client.setAutoDisconnect({
//            synchronous: true
//        });

//        clients.connect({
//            onSuccess: function (args) {
//                chat.clientId = args.clientId;
//                //chat.util.clearLog();
//                //chat.util.logSuccess('Connected to WebSync.');
//                //chat.util.show(chat.dom.prechat.container);
//                chat.util.show(chat.dom.chat.container);
//            },
//            onFailure: function (args) {
//                //var username = args.getData().alias;
//                //var content = ''

//                //chat.util.logSuccess('Could not connect to WebSync.');
//            }
//        });
//    });
//}

function activeTab() {
    $(document).on('click', '.item-stt-message', function () {
        var id = $(this).attr('data-id');
        var channels = [];
        $('.item-stt-message').removeClass('active');
        $('.inbox-message').css("display", "none");
        $(this).addClass('active');
        $("#tab-chat li").each(function (i) {
            if (!$(this).hasClass('active')) {
                var room = $(this).attr('data-room');
                channels.push('/' + room);
            }
        });
        if (id == 0) {
            getSubscribe(clients, 'public', testichat);
            if (channels.length) unSubscribe(clients, channels);
            $('#testichat').css("display", "block");
        } else {
            var username = $(this).attr('data-name');
            var stanza = roomid = $(this).attr('data-room');
            var testichats = document.getElementById('testichat' + id);
            getSubscribe(clients, roomid, testichats);
            if (channels.length) unSubscribe(clients, channels);
            $('#testichat' + id).css("display", "block");
        }
    });
}

//function getSubscribe(clients, roomid, testichat) {
//    debugger
//    clients.setClientId(userId);
//    clients.subscribe({
//        channel: '/' + roomid,
//        onSuccess: function (args) {
//            //chat.util.logSuccess('Content chat.');
//            //var logs = args.getExtensionValue('logs');
//            //if (logs != null) {
//            //    for (var i = 0; i < logs.length; i++) {
//            //        logMessage(logs[i].alias, logs[i].text, false, testichat);
//            //    }
//            //}
//        },
//        onFailure: function (args) {
//            //chat.util.logSuccess('Not connecting.');
//        },
//        onReceive: function (args) {
//            var ch = args.getChannel();
//            console.log(ch);
//            //logMessage(args.getData().alias, args.getData().text, args.getWasSentByMe(), testichat);
//            receiveMessage(args.getData().userName, args.getData().name, args.getData().text, args.getData().avatar, args.getWasSentByMe(), args.getData().time, args.getData().isFile, args.getData().fileId, args.getData().url);
//        }
//    });
//}

//function unSubscribe(clients, channels) {
//    clients.unsubscribe({
//        channels: channels,
//        onFailure: function (args) {
//            alert(args.error);
//        },
//        onSuccess: function (args) {
//            var chat = document.getElementById('testichat');
//            chat.innerHTML = '';
//            //channel = "";
//        },
//    });
//}

async function logMessageGptMe() {
    var me = true;
    var text = $('#text-input').val();
    var alias = userName;
    if (isChatGpt) {
        receiveMessage(userName, fullName, text, '', me, moment().format('HH:mm'), false, null, null);

        // $('#text-input').empty(); // clear input.
        $('#text-input').val('');
        var chat = document.getElementById('testichat');
        var html = '<div id=\'makingGptAnswer\' ' + styleDiv + ' class="myMessage">';
        var content = '<img style=\'width: 200px\' ' + 'src="../../../images/default/spinning-loading.gif"/>';
        var avatar = '../../../images/default/Chat-GPT-icon.png';
        var name = 'Chat GPT';
        var time = moment().format('HH:mm');
        html += '<img ' + cssmyAvatar + 'src="' + avatar + '"/><p ' + cssmyName + '>' + name + " " + time + '</p><br/>' + '<div class=\'content\' ' + csscontentmyMess + '">' + content + '</div></div>';
        var div = document.createElement('div');
        div.innerHTML = html;
        chat.appendChild(div);
        updateScroll();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer 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");

        var raw = JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{ "role": "user", "content": text }]
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        var response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
        var result = await response.json();
        if (!result.error) {
            console.log(result.choices[0].message.content);
            var answer = document.getElementById('makingGptAnswer');
            var content = answer.querySelector('.content');
            content.innerHTML = result.choices[0].message.content;
            answer.removeAttribute('id');
        }
        else {
            var answer = document.getElementById('makingGptAnswer');
            var content = answer.querySelector('.content');
            content.innerHTML = 'Máy chủ Chat GPT đang bận. Hãy thử lại sau';
            App.toastrError(result.error.message);
        }
    }
}
function logMessage(alias, text, me, testichat) {
    var html = '<li';
    if (me) {
        html += ' class="item-message"';
    } else {
        html += ' class="item-message me"';
    }
    html += '><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
    var div = document.createElement('div');
    div.innerHTML = html;
    testichat.appendChild(div);
    setTimeout(function () {
        updateScroll();
    }, 800);
}

var cssYyourAvatar = 'style="height: 3em;width: 3em;border-radius: 50px;float: right;margin-left: 3%;border: 1px solid #d2d2d2;margin-top: 6px;"';
var cssyourName = 'style="color: black;float: right;height: 100%;width: 70%;text-align: right;font-size: 80%; padding-right: 5px;"';
var csscontenyourMess = 'style="float: right; width: 70% !important; border-radius: 5px; background: #e2ffc7; margin: 0 !important; padding: 2%;height: auto !important; margin-bottom: 6% !important; font-weight: 400;border: 1px solid #e6f4ff; white-space: pre-wrap;"';
var csscontenyourImage = 'style="float: right; border-radius: 5px; background: #e2ffc7; margin: 0 !important; padding: 2%;height: auto !important; margin-bottom: 6% !important; font-weight: 400;border: 1px solid #e6f4ff"';
var cssarrowright = 'style="width: 0; height: 0; border-bottom: 9px solid transparent; border-top: 7px solid transparent; border-left: 11px solid #d2d2d2; position: absolute;right: 16%;"';
var cssmyAvatar = 'style=" height: 3em; width: 3em; border-radius: 50px; float: left;margin-right: 3%;border: 1px solid #d2d2d2;margin-top: 6px;"';
var cssmyName = 'style="color: black; float: left; font-size: 85%; margin-bottom: 0px !important;"';
var csscontentmyMess = 'style=" float: left; width: 70% !important; // border: 1px solid; border-radius: 5px; background: #fafafa;margin: 0 !important; padding: 2%; height: auto !important;margin-bottom: 6% !important; font-weight: 400;color: black; white-space: pre-wrap;"';
var csscontentmyImage = 'style=" float: left; // border: 1px solid; border-radius: 5px; background: #fafafa;margin: 0 !important; padding: 2%; height: auto !important;margin-bottom: 6% !important; font-weight: 400;color: black;"';
var cssarrowleft = 'style=" width: 0; height: 0; border-bottom: 9px solid transparent; border-top: 7px solid transparent; border-right: 11px solid #4092f9; position: absolute; left: 17.2%;"';
var cssTime = 'style = "padding-left: 5px; font-size: 80%;"';
var styleDiv = 'style ="width: 100%; float: left; "'

function receiveMessage(_userName, name, text, avatar, me, time, isFile, fileId, url) {
    console.log('receive message', name, text);
    if (_userName == userName) {
        var chat = document.getElementById('testichat');
        var html = '<div class="yourMessage">';

        if (isFile) {
            var fileName = text;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                html += '<span ' + cssyourName + '>' + time + '</span>';
                html += '<div ' + csscontenyourImage + '>' + '<span class="fa fa-file-archive-o pr-5 text-primary">&nbsp' + text + '<span><br/>' + '<a onclick="downloadFile(' + fileId + ')" class="pull-right text-underline text-green mt5">Tải xuống<a>' + '</div></div>';
            } else {
                html += '<span ' + cssyourName + '>' + time + '</span>';
                html += '<div ' + csscontenyourImage + '>' + '<img src="' + url + '" alt="' + text + '" style="width: auto;height: 100px;"></div></div>';
            }
        } else {
            html += '<span ' + cssyourName + '>' + time + '</span>' + '<div ' + csscontenyourMess + '>' + text + '</div></div>';
        }

        var div = document.createElement('div');
        div.innerHTML = html;
        chat.appendChild(div);
        updateScroll();
    }
    else {
        var chat = document.getElementById('testichat');
        var html = '<div ' + styleDiv + ' class="myMessage">';
        if (isFile) {
            var fileName = text;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                html += '<img ' + cssmyAvatar + 'src="' + avatar + '"/><p ' + cssmyName + '>' + name + " " + time + '</p><br/>';
                html += '<div ' + csscontentmyImage + '>' + '<span class="fa fa-file-archive-o pr-5 text-primary">&nbsp' + text + '<span><br/>' + '<a onclick="downloadFile(' + fileId + ')" class="pull-right text-underline text-green mt5">Tải xuống<a>' + '</div></div>';
            } else {
                html += '<img ' + cssmyAvatar + 'src="' + avatar + '"/><p ' + cssmyName + '>' + name + " " + time + '</p><br/>';
                html += '<div ' + csscontentmyImage + '">' + '<img src="' + url + '" alt="' + text + '" style="width: auto;height: 100px;"></div></div>';
            }
        } else {
            html += '<img ' + cssmyAvatar + 'src="' + avatar + '"/><p ' + cssmyName + '>' + name + " " + time + '</p><br/>' + '<div ' + csscontentmyMess + '">' + text + '</div></div>';
        }

        var div = document.createElement('div');
        div.innerHTML = html;
        chat.appendChild(div);
        updateScroll();
    }
}

function createCanvas() {
    $("#layers-body li").each(function (i) {
        $(this).addClass("item" + (i + 1));
        $(this).attr("data-cnt", (i + 1));
        $(this).find('span').text((i + 1));

        var canvas = cloneCanvas((i + 1));
        $('#panel').append(canvas);
    });
}

function getTab() {
    var tab = 0;
    $("#tab-chat li").each(function (i) {
        if ($(this).hasClass('active')) {
            tab = parseInt($(this).attr('data-id'));
        }
    });
    return tab;
}

$(document).mouseup(function (e) {
    var container = $(".menu-tray");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        //container.hide();
        $("#zoom-chat-vatco").addClass("hidden")
    }
});

$(function () {
    configChat.init();
    //createCanvas();
    //initDraw();
    //addLayer();
    //deleteLayer();
    //clearState();
    initChat();
    activeTab();
    //initVideo();
    //logMessage();
});

//Xu ly su kien
async function messageGpt() {
    //var channels = clients.getClientId();
    //var a = clients.getSubscribedChannels();
    var roomId = 'chat_gpt';
    $('#testichat').empty();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer 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");

    var raw = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "system", "content": 'You are a helpful assistant.' }]
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    var response = await fetch("https://api.openai.com/v1/chat/completions", requestOptions);
    var result = await response.json();
    if (!result.error) {
        //console.log(result.choices[0].text);
        //var answer = document.getElementById('makingGptAnswer');
        //var content = answer.querySelector('.content');
        //content.innerHTML = result.choices[0].text;
        //answer.removeAttribute('id');
    }
    else {
        //var answer = document.getElementById('makingGptAnswer');
        //var content = answer.querySelector('.content');
        //content.innerHTML = 'Máy chủ Chat GPT đang bận. Hãy thử lại sau';
        App.toastrError(result.error.message);
    }

    //console.log(roomId);
    //if (clients._isConnected != true) {
    //    console.log('start connect');
    //    loadChat(fullName, 999999, clients, testichat);
    //}
    //if (channel != '') {
    //    console.log('unsubscribe then subscribe other channel');
    //    unSubscribe(clients, channel, function () {
    //        getSubscribe(clients, roomId, testichat);
    //    });
    //}
    //else {
    //    console.log('subscribe new channel');
    //    getSubscribe(clients, roomId, testichat);
    //}
}
function messageDetail(roomId, roomName) {
    //if (roomId != channel && channel != '') {
    //    clearGroup(channel);
    //}

    var channels = clients.getClientId();
    var a = clients.getSubscribedChannels();

    $('#testichat').empty();
    console.log(roomId);
    if (clients._isConnected != true) {
        console.log('start connect');
        loadChat(fullName, 999999, clients, testichat);
    }
    if (channel != '') {
        console.log('unsubscribe then subscribe other channel');
        unSubscribe(clients, channel, function () {
            getSubscribe(clients, roomId, testichat);
        });
    }
    else {
        console.log('subscribe new channel');
        getSubscribe(clients, roomId, testichat);
    }
    //loadChat(fullName, roomId, clients, testichat, false, null, null, null);

    //getSubscribe(clients, roomId, testichat);

    channel = roomId;//roomId;
    getMessageFromDB(channel);
}

function clearGroup(channelOld) {
    var ch = "/" + channelOld;
    clients.unsubscribe({
        channel: ch,
        data: {
            type: 888,
            from: "monitor",
            locationMessage: {
                driverId: userId,
            },
        },
        onSuccess: function (args) {
            var chat = document.getElementById('testichat');
            chat.innerHTML = '';
            channel = "";
            console.log("exits chanel success");
            clients.disconnect();
            clients = new fm.websync.client(webSyncHandleUrl);
            debugger

        },
        onFailure: function (args) {
            console.log("unsubcribe failed: " + args.channel);
        }
    });
}

function backMenu() {
    //$('.header-menu').removeClass('hidden');
    //$('.chat-content').addClass('hidden');
    //$('#header-chat-out-room').removeClass('hidden');
    //$('#icon-header-chat-out-room').removeClass('hidden');
    var ch = "/" + channel;
    clients.unsubscribe({
        channel: ch,
        data: {
            type: 888,
            from: "monitor",
            locationMessage: {
                driverId: userId,
            },
        },
        onSuccess: function (args) {
            var chat = document.getElementById('testichat');
            chat.innerHTML = '';
            channel = "";
            console.log("exits chanel success");
            clients.disconnect();
            clients = new fm.websync.client(webSyncHandleUrl);
            //peer.push(clients);
            //console.log(peer);
        },
        onFailure: function (args) {
            console.log("unsubcribe failed: " + args.channel);
        }
    });
    var divUser = document.getElementById('div-list-user');
    divUser.innerHTML = "";
    //getListRoom();
    getListUser();
}

function messageUser(cn, givenName, avatar) {
    channel = cn;
    $('#testichat').empty();
    //$('.header-menu').addClass('hidden');
    //$('.chat-content').removeClass('hidden');
    //$('#header-chat-out-room').addClass('hidden');
    //$('#icon-header-chat-out-room').addClass('hidden');
    $('#message-title-room').empty();

    var image = '<img style= "border-radius: 50%; height: 26px; margin-right: 10px;" src = "' + avatar + '" />';
    $('#message-title-room').append(image + "  " + givenName);

    $('#join-room').empty();
    var zoom = '<img class="pull-right" style="height: 30px; width: 30px;" src="/images/default/video-call-2.png" onclick="joinMeetingUser(\'' + cn + '\')" />';
    $('#join-room').append(zoom);

    loadChat(userName, channel, clients, testichat, false, null, null, null);
    getSubscribe(clients, channel, testichat);

    getMessageFromDB(channel);
}

function getMessageFromDB(channel) {
    var chat = document.getElementById('testichat');
    jQuery.ajax({
        type: "GET",
        url: "/Admin/DashBoard/GetLogMessage?channel=" + channel + "&page=" + 1,
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            console.log(rs);
            if (rs != null) {
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].User == userName) {
                        var html = '<div class="yourMessage">';
                        if (rs[i].IsFile) {
                            var fileName = rs[i].Content;
                            var idxDot = fileName.lastIndexOf(".") + 1;
                            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                                html += '<span ' + cssyourName + '>' + rs[i].TimeChat + '</span>';
                                html += '<div ' + csscontenyourImage + '>' + '<span class="fa fa-file-archive-o pr-5 text-primary">&nbsp' + rs[i].Content + '<span><br/>' + '<a onclick="downloadFile(' + rs[i].FileId + ')" class="pull-right text-underline text-green mt5">Tải xuống<a>' + '</div></div>';
                            } else {
                                html += '<span ' + cssyourName + '>' + rs[i].TimeChat + '</span>';
                                html += '<div ' + csscontenyourImage + '>' + '<img src="' + rs[i].Url + '" alt="' + rs[i].Content + '" style="width: auto;height: 100px;"></div></div>';
                            }
                        } else {
                            html += '<span ' + cssyourName + '>' + rs[i].TimeChat + '</span>' + '<div ' + csscontenyourMess + '>' + rs[i].Content + '</div></div>';
                        }
                        var div = document.createElement('div');
                        div.innerHTML = html;
                        chat.appendChild(div);
                        updateScroll();
                    }
                    else {
                        var html = '<div ' + styleDiv + ' class="myMessage">';
                        if (rs[i].IsFile) {
                            var fileName = rs[i].Content;
                            var idxDot = fileName.lastIndexOf(".") + 1;
                            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                                html += '<img ' + cssmyAvatar + 'src="' + rs[i].Image + '"/><p ' + cssmyName + '>' + rs[i].GivenName + " " + rs[i].TimeChat + '</p><br/>';
                                html += '<div ' + csscontentmyImage + '>' + '<span class="fa fa-file-archive-o pr-5 text-primary">&nbsp' + rs[i].Content + '<span><br/>' + '<a onclick="downloadFile(' + rs[i].FileId + ')" class="pull-right text-underline text-green mt5">Tải xuống<a>' + '</div></div>';
                            } else {
                                html += '<img ' + cssmyAvatar + 'src="' + rs[i].Image + '"/><p ' + cssmyName + '>' + rs[i].GivenName + " " + rs[i].TimeChat + '</p><br/>';
                                html += '<div ' + csscontentmyImage + '">' + '<img src="' + rs[i].Url + '" alt="' + rs[i].Content + '" style="width: auto;height: 100px;"></div></div>';
                            }
                        } else {
                            html += '<img ' + cssmyAvatar + 'src="' + rs[i].Image + '"/><p ' + cssmyName + '>' + rs[i].GivenName + " " + rs[i].TimeChat + '</p><br/>' + '<div ' + csscontentmyMess + '">' + rs[i].Content + '</div></div>';
                        }
                        var div = document.createElement('div');
                        div.innerHTML = html;
                        chat.appendChild(div);
                        updateScroll();
                    }
                }
            }

        },
        failure: function (errMsg) {
            console.log("Get message failed");
        }
    });
}

function joinMeeting(roomId) {
    jQuery.ajax({
        type: "POST",
        url: "/Admin/Meeting/JoinMeeting?meetingID=" + roomId,
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                window.open('/Admin/Meeting', '_blank');
            }
        },
        failure: function (errMsg) {
            App.toastrSuccess(errMsg);
        }
    });
}

function joinMeetingUser(cn) {
    debugger
    jQuery.ajax({
        type: "POST",
        url: "/Admin/Meeting/JoinMeetingUser?chanel=" + cn,
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                window.open('/Admin/Meeting', '_blank');
            }
        },
        failure: function (errMsg) {
            App.toastrSuccess(errMsg);
        }
    });
}

function insertLogMess(data) {
    jQuery.ajax({
        type: "POST",
        url: "/Admin/DashBoard/InsertLogMessage",
        contentType: "application/json",
        dataType: "JSON",
        data: JSON.stringify(data),
        success: function (rs) {
            console.log("Insert message success");
        },
        failure: function (errMsg) {
            console.log("Insert message failed");
        }
    });
}

function removeContentChat() {
    var listMessage = $('.inbox-message').children();
    var limitMessage = 100;
    if (listMessage.length > limitMessage) {
        var i = listMessage.length;
        for (item in listMessage) {
            listMessage[item].remove();
            i--;

            if (i === limitMessage)
                break;
        }
    }
}

function updateScroll() {
    var element = document.getElementById("testichat");
    element.scrollTop = element.scrollHeight;
}

function getListUser() {
    var searchZoomUser = document.getElementById('searchUserRoom').value;
    jQuery.ajax({
        type: "POST",
        url: "/Admin/DashBoard/GetListUserChat?userName=" + userName + "&givenName=" + searchZoomUser,
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs != null) {
                var listUser = rs.Object;
                if (listUser.length > 0) {
                    $('#countUser').html('Người dùng (' + listUser.length + ')');
                    var divUser = document.getElementById('div-list-user');
                    for (var i = 0; i < listUser.length; i++) {
                        var date = "";
                        var lastMess = "";
                        if (listUser[i].ContentChat != null) {
                            lastMess = listUser[i].ContentChat.Content;

                            var dateTimeInOut = new Date(listUser[i].ContentChat.TimeChat);
                            var dd = dateTimeInOut.getDate();

                            var mm = dateTimeInOut.getMonth() + 1;
                            var yyyy = dateTimeInOut.getFullYear();
                            if (dd < 10) {
                                dd = '0' + dd;
                            }

                            if (mm < 10) {
                                mm = '0' + mm;
                            }

                            date = dd + '/' + mm + '/' + yyyy;
                        }
                        var html = '<div class="btn-chat-and-notifications" role="button">';
                        html += '<div onclick="messageUser(' + '\'' + listUser[i].Channel + '\'' + ', ' + '\'' + listUser[i].GivenName + '\'' + ', ' + '\'' + listUser[i].Picture + '\'' + ')">';
                        html += '<div class="div-items-icons">';
                        html += '<img class="icons-40" src="' + listUser[i].Picture + '"/>';
                        html += '</div>';
                        html += '<div class="div-items-text">';
                        html += '<div>';
                        html += '<div class="csspadding2px "><span> ' + listUser[i].GivenName + ' </span></div>';
                        html += '<div class="csspadding2px "><span style="font-size: 10px;">' + lastMess + '</span></div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                        html += '<div class="cssBtn fs12 text-center">';
                        html += '<div class="CssBtnUpdate fs12 pr-2">';
                        html += date;
                        html += ' </div>';
                        html += ' <br>';
                        //html += ' <img class="img-call" style="height: 30px; width: 30px;" src="/images/default/video-call-2.png" onclick="joinMeeting(' + '\'' + 83177583821 + '\'' +')" />';
                        html += ' </div>';
                        html += ' </div>';

                        var div = document.createElement('div');
                        div.innerHTML = html;
                        divUser.appendChild(div);
                    }
                }
            }

        },
        failure: function (errMsg) {
            console.log("Get user failed");
        }
    });
}

function getListRoom() {
    var searchZoomUser = document.getElementById('searchUserRoom').value;
    jQuery.ajax({
        type: "POST",
        url: "/Admin/DashBoard/GetListZoom?userName=" + userName + "&roomName=" + searchZoomUser,
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs !== null) {
                var listRoom = rs.Object;
                if (listRoom.length > 0) {
                    var divUser = document.getElementById('div-list-user');
                    for (var i = 0; i < listRoom.length; i++) {
                        var date = "";
                        var lastMess = "";
                        if (listRoom[i].ContentChat !== null) {
                            lastMess = listRoom[i].ContentChat.Content;

                            var dateTimeInOut = new Date(listRoom[i].ContentChat.TimeChat);
                            var dd = dateTimeInOut.getDate();

                            var mm = dateTimeInOut.getMonth() + 1;
                            var yyyy = dateTimeInOut.getFullYear();
                            if (dd < 10) {
                                dd = '0' + dd;
                            }

                            if (mm < 10) {
                                mm = '0' + mm;
                            }

                            date = dd + '/' + mm + '/' + yyyy;
                        }
                        var html = '<div class="btn-chat-and-notifications" role="button">';
                        html += '<div onclick="messageDetail(' + '\'' + listRoom[i].RoomID + '\'' + ', ' + '\'' + listRoom[i].RoomName + '\'' + ')">';
                        html += '<div class="div-items-icons">';
                        html += '<img class="icons-40" src="/images/logo/icon_users.png" />';
                        html += '</div>';
                        html += '<div class="div-items-text csspadding2px">';
                        html += '<div>';
                        html += '<div class=""><span> ' + listRoom[i].RoomName + ' </span></div>';
                        html += '<div class=""><span style="font-size: 14px;">' + lastMess + '</span></div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';

                        if (listRoom[i].IsEdit) {
                            html += '<div class="cssBtn fs12 text-center">';
                        } else {
                            html += '<div class="cssBtn fs12 text-center">';
                        }

                        html += '<div class="CssBtnUpdate fs12 pr-2">';
                        html += date;
                        html += ' </div>';
                        html += ' <br>';
                        if (listRoom[i].IsEdit) {
                            html += ' <div class ="row d-flex"><span class="fa fa-edit fs20 btn-edit-meeting" onclick="common.EditMeeting(' + '\'' + listRoom[i].RoomID + '\'' + ')" /></div>';
                            //html += ' <div class ="row d-flex pl25"> <img class="img-call" style="height: 30px; width: 30px;" src="/images/default/video-call-2.png" onclick="joinMeeting(' + '\'' + listRoom[i].RoomID + '\'' + ')" /> <span class="fa fa-edit fs20 btn-edit-meeting" onclick="common.EditMeeting(' + '\'' + listRoom[i].RoomID + '\'' + ')" /></div>';
                        } else {
                            //html += ' <img class="img-call" style="height: 30px; width: 30px;" src="/images/default/video-call-2.png" onclick="joinMeeting(' + '\'' + listRoom[i].RoomID + '\'' + ')" />';
                        }
                        html += ' </div>';
                        html += ' </div>';

                        var div = document.createElement('div');
                        div.innerHTML = html;
                        divUser.appendChild(div);
                    }
                }
            }

        },
        failure: function (errMsg) {
            console.log("Get user failed");
        }
    });
}

function getListGroupChat() {
    var searchZoomUser = document.getElementById('searchUserRoom').value;
    jQuery.ajax({
        type: "POST",
        url: "/Admin/Chat/GetListGroupChat",
        contentType: "application/json",
        dataType: "JSON",
        success: function (rs) {
            if (rs !== null) {
                var listGroup = rs.Object;
                if (listGroup.length > 0) {
                    $('#countGroup').html('Nhóm (' + listGroup.length + ')');
                    var divGroup = document.getElementById('div-list-group');
                    for (var i = 0; i < listGroup.length; i++) {
                        var date = "";
                        var lastMess = "";
                        //if (listGroup[i].ContentChat !== null) {
                        //    lastMess = listGroup[i].ContentChat.Content;

                        //    var dateTimeInOut = new Date(listGroup[i].ContentChat.TimeChat);
                        //    var dd = dateTimeInOut.getDate();

                        //    var mm = dateTimeInOut.getMonth() + 1;
                        //    var yyyy = dateTimeInOut.getFullYear();
                        //    if (dd < 10) {
                        //        dd = '0' + dd;
                        //    }

                        //    if (mm < 10) {
                        //        mm = '0' + mm;
                        //    }

                        //    date = dd + '/' + mm + '/' + yyyy;
                        //}
                        var html = '<div class="btn-chat-and-notifications" role="button">';
                        html += '<div onclick="messageDetail(' + '\'' + listGroup[i].GroupCode + '\'' + ', ' + '\'' + listGroup[i].GroupName + '\'' + ')">';
                        html += '<div class="div-items-icons">';
                        html += '<img class="icons-40" src="/images/logo/icon_users.png" />';
                        html += '</div>';
                        html += '<div class="div-items-text">';
                        html += '<div>';
                        html += '<div class="csspadding2px"><span> ' + listGroup[i].GroupName + ' </span></div>';
                        //html += '<div class=""><span style="font-size: 14px;">' + lastMess + '</span></div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';

                        if (listGroup[i].IsEdit) {
                            html += '<div class="cssBtn fs12 text-center">';
                        } else {
                            html += '<div class="cssBtn fs12 text-center">';
                        }

                        html += '<div class="CssBtnUpdate fs12 pr-2">';
                        html += date;
                        html += ' </div>';
                        html += ' <br>';
                        if (listGroup[i].IsEdit) {
                            html += ' <div class ="row d-flex"><span class="fa fa-edit fs20 btn-edit-meeting" onclick="common.EditMeeting(' + '\'' + listGroup[i].RoomID + '\'' + ')" /></div>';
                        } else {
                        }
                        html += ' </div>';
                        html += ' </div>';

                        var div = document.createElement('div');
                        div.innerHTML = html;
                        divGroup.appendChild(div);
                    }
                }
            }
        },
        failure: function (errMsg) {
            console.log("Get user failed");
        }
    });
}

function clearLstUserRoom() {
    var divUser = document.getElementById('div-list-user');
    divUser.innerHTML = "";
}

function clearLstGroupChat() {
    var divGroup = document.getElementById('div-list-group');
    divGroup.innerHTML = "";
}

function searchRoomAndUser() {
    var divUser = document.getElementById('div-list-user');
    divUser.innerHTML = "";
    //getListRoom();
    getListUser();
    getListGroupChat();
}

var listUserInvite = [];
function selectUser(userId, userName, givenName) {

    var check = false;
    for (var i = 0; i < listUserInvite.length; i++) {
        if (listUserInvite[i].UserId === userId) {
            listUserInvite.splice(i, 1);
            check = true;
        }
    }
    if (!check) {
        var obj = {
            GivenName: givenName,
            UserName: userName,
            UserId: userId
        }
        listUserInvite.push(obj);
    }
}

function showUserInvite() {
    if ($("#lstUserInvite").hasClass('hidden')) {
        $("#lstUserInvite").removeClass('hidden');
    }
    else {
        var data = {
            MeetingTopic: "",
            RoomID: channel,
            UserZoomID: "",
            Token: "",
            Data: "",
            ListUserMeeting: listUserInvite
        };
        jQuery.ajax({
            type: "POST",
            url: "/Admin/Meeting/InviteMeeting",
            contentType: "application/json",
            dataType: "JSON",
            data: JSON.stringify(data),
            success: function (rs) {
                App.toastrSuccess(rs.Title);
            },
            failure: function (errMsg) {
                App.toastrError(errMsg.Title);
            }
        });
    }
}

function closeInvite() {
    if (!$("#lstUserInvite").hasClass('hidden')) {
        $("#lstUserInvite").addClass('hidden');
    }
}

function attachFile() {
    var fileAttach = document.getElementById("btn-attach").files[0];
    if (fileAttach != undefined) {
        fileAttach = null;
    }

    var fileuploader = angular.element("#btn-attach");
    fileuploader.on('click', function () {

    });
    fileuploader.on('change', function (e) {
        fileAttach = document.getElementById("btn-attach").files[0];
        if (fileAttach != undefined) {
            var formData = new FormData();
            formData.append("fileUpload", fileAttach != undefined ? fileAttach : null);
            formData.append("Channel", channel);

            $.ajax({
                url: '/Admin/Chat/AttachFile',
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        var data = rs.Object;
                        var testichats = document.getElementById('testichat');
                        loadChat(data.User, data.Channel, clients, testichats, true, rs.ID, data.Content, data.Url);
                        getSubscribe(clients, data.Channel, testichats);
                    }
                }
            });
        }
    });

    fileuploader.trigger('click');
}

function downloadFile(id) {
    location.href = "/Admin/EDMSRepository/Download?Id=" + id;
}

$('#searchUserRoom').bind("enterKey", function (e) {
    searchRoomAndUser();
});
$('#searchUserRoom').keyup(function (e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});

var page = 1;
$("#testichat").scroll(function () {
    if ($("#testichat").scrollTop() == 0) {
        page = page + 1;
        jQuery.ajax({
            type: "GET",
            url: "/Admin/DashBoard/GetMoreLogMessage?channel=" + channel + "&page=" + page,
            contentType: "application/json",
            dataType: "JSON",
            success: function (rs) {
                console.log(rs);
                if (rs != null) {
                    for (var i = 0; i < rs.length; i++) {
                        if (rs[i].User == userName) {
                            var html = '<div ';
                            html += ' class="yourMessage"';
                            html += '>' + '<span ' + cssyourName + '>' + rs[i].TimeChat + '</span>' + '<div ' + csscontenyourMess + '>' + rs[i].Content + '</div></div>';
                            var div = document.createElement('div');
                            div.innerHTML = html;
                            testichat.prepend(div);

                        }
                        else {
                            //var chat = document.getElementById('testichat');
                            var html = '<div ' + styleDiv;
                            html += ' class="myMessage"';
                            html += '>' + '<img ' + cssmyAvatar + 'src="' + rs[i].Image + '"/><p ' + cssmyName + '>' + rs[i].GivenName + " " + rs[i].TimeChat + '</p><br/>' + '<div ' + csscontentmyMess + '">' + rs[i].Content + '</div></div>';
                            var div = document.createElement('div');
                            div.innerHTML = html;
                            testichat.prepend(div);

                        }
                    }
                }

            },
            failure: function (errMsg) {
                console.log("Get message failed");
            }
        });
    }
});
