var backgroundColorCanvas = ""
    ; (function ($, window, document, undefined) {
        'use strict';
        var url = 'https://nodejs.s-work.vn'; //Use when run on publish
        // var nodeServer = 'http://127.0.0.1:3000'; //Use when run on local
        // var url         = 'http://localhost:8000';//'https://notepad.iktutor.com:3000';
        var plugin_url = 'https://notepad.s-work.vn/v3/';
        var stanza = 999999;
        var lengthObject = 0;
        var controlpencil = true;
        var controlrubber = false;
        var positionx = '0';
        var positiony = '0';
        var lastEmit = $.now();
        var touchX, touchY;
        var mousedown = false;
        var shift = false;
        var divrubber = $('#divrubber');
        var lastObject = {};

        // A flag for drawing activity
        var drawing = false;
        var cursors = {};
        var dragging = false;
        var isDraging = false;
        var id;
        var init_position = [0, 0];
        var final_position = [0, 0];
        //  funzione richiesta di nick name
        var username;
        var usernameTemp;
        var userID = "";
        var pool_data = [];
        var layer = [];
        var isLoadDataLocal = true;
        var indexMove = -1;
        var index = -1;

        var isGrid = false;
        var isZoomJoined = false;

        let unit_x = 0;
        let unit_y = 0;



        // var id = username = Math.round($.now() * Math.random());
        //Bật thông báo yêu cầu nhập
        // if (!username) {
        //     username = prompt("Hey there, insert your nick name, please", "");
        // }
        var totalSeconds = 0;
        var idtempo;

        var undo_list = [];
        var $state = [];

        var history = function () { };
        var iStep = -1;

        history.saveState = function () {
            iStep++;

            if (iStep < undo_list.length) {
                undo_list.length = iStep;
            }

            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");

            undo_list.push(can.toDataURL());
        };

        history.undo = function () {
            if (iStep > 0) {
                iStep--;

                history.restoreState();
            }
        };

        history.redo = function () {
            if (iStep < undo_list.length - 1) {
                iStep++;

                history.restoreState();
            }
        };

        history.restoreState = function () {
            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");
            var ctxcan = can.getContext('2d');
            ctxcan.clearRect(0, 0, can.width, can.height);

            var imgdaclient = new Image();
            imgdaclient.src = undo_list[iStep];
            imgdaclient.onload = function () {
                ctxcan.drawImage(imgdaclient, 0, 0);
            }
        };
        var click_event = document.ontouchstart ? 'touchstart' : 'click';

        var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
        fm.websync.client.enableMultiple = true;
        var clients = new fm.websync.client(webSyncHandleUrl);
        var testichat = document.getElementById('testichat');
        var cnt = 0;

        username = $("#UserName").val();
        usernameTemp = $("#UserName").val();
        loadChat(username, stanza, clients, testichat);
        getSubscribe(clients, stanza, testichat);


        $(function () {
            var sidemenu = $('.opacitySideMenu');
            var tray_menu = $('.menu-tray');
            var $task_wrap = $('.taskbar-notepad');

            $task_wrap.find('.tool-btn').on('click', function () {
                var $this = $(this);

                $('.tooltip-wrap').removeClass('show-tt');

                var cnt = getCanvas();
                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');



                if ($this.hasClass('active')) {
                    $this.removeClass('active');
                    $this.next('.tool-submenu').addClass('hidden');

                    tray_menu.removeClass('has-submenutool');
                    sidemenu.removeClass('has-submenutool');
                } else {
                    $task_wrap.find('.tool-btn').removeClass('active');
                    $task_wrap.find('.tool-submenu').addClass('hidden');

                    $this.addClass('active');
                    $this.next('.tool-submenu').removeClass('hidden');

                    tray_menu.addClass('has-submenutool');
                    sidemenu.addClass('has-submenutool');
                }
            });

            var timeout;
            $('.tooltip-wrap').on('mouseenter', function () {

                var $thisElement = $(this);

                if (timeout != null) { clearTimeout(timeout); }

                timeout = setTimeout(function () {
                    $('.tooltip-wrap').removeClass('show-tt');
                    $thisElement.addClass('show-tt');
                }, 1000)
            });

            $('.tooltip-wrap').on('mouseleave', function () {

                if (timeout != null) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            });

            $(window).on('mouseover', function () {
                $('.tooltip-wrap').removeClass('show-tt');
            });

            $('#change-eraser').on('click', function () {
                $('#divrubber').css({ "display": "block", "width": "30px", "height": "30px", "visibility": "visible" });
                $('#controlrubber').addClass('css-cursor-30');
                $("#erasers-body").find(`[data-eraser='30']`).addClass('active');

                canEraser();
            });

            $('#change-size-pencil').on('click', function () {

                $(this).addClass('active');
                var cnt = getCanvas();

                $("#erasers-body li").removeClass('active');
                $('#divrubber').css("display", "none");
                canDraw();

                if (parseInt($(this).attr('data-layer')) === (cnt - 3)) {
                    return;
                }

                $(this).attr('data-layer', cnt - 3);
            });

            //display screenshots
            $("#icon-screenshot").click(function () {
                var check = $('.screenshot-class').hasClass("hidden");
                if (check == true) {
                    $('.screenshot-class').removeClass("hidden");
                } else {
                    $('.screenshot-class').addClass("hidden");
                }
            });

            // Sheet in Notepad
            $('#open-list-sheet').on('click', function () {
                $('.notepad-sheet-search').removeClass('hidden').addClass('active');
            });

            $('.wls-close').on('click', function () {
                $('.notepad-sheet-search').removeClass('active').addClass('hidden');
            });

            $('.wls-open-subject-list').on('click', function () {
                if ($('.wls-subject-list').hasClass('open')) {
                    $('.wls-subject-list').removeClass('open');
                } else {
                    $('.wls-subject-list').addClass('open');
                }
            });

            $('.wls-type').on('click', function () {
                var $this = $(this);
                var $state = $this.attr('data-state');
                var $img = $this.find('img');


                if ($state === 'all') {
                    $this.attr('data-state', '1');
                    $img.attr('src', plugin_url + '/images/notepad/worksheet/Search_Type_PRACTICE.png');
                } else if ($state === '1') {
                    $this.attr('data-state', '2');
                    $img.attr('src', plugin_url + '/images/notepad/worksheet/Search_Type_TEST.png');
                } else if ($state === '2') {
                    $this.attr('data-state', 'all');
                    $img.attr('src', plugin_url + '/images/notepad/worksheet/Search_Type_ALL.png');
                }
            });

            $('.wls-subject-list ul li').on('click', function () {
                var $p = $(this).parents('.wls-subject-list');

                $p.find('li').removeClass('active');
                $(this).addClass('active');
                $p.removeClass('open');
            });

            $('.w-list-searchbox .wls-btn').on('click', function () {
                SearchAjaxContent();
            });

            function SearchAjaxContent() {
                var $form = $('.w-list-searchbox'),
                    $input = $form.find('input').val(),
                    $type = $form.find('.wls-subject-list ul .active').attr('data-value'),
                    $mode = $form.find('.wls-type').attr('data-state');

                var data = {
                    'action': 'iii_notepad_worksheet_search_worksheet',
                    's': $input,
                    'type': $type,
                    'mode': $mode
                };

                $.ajax({
                    method: 'POST',
                    url: iii_script.ajax_url,
                    data: data,
                    dataType: 'json',
                    beforeSend: function () {
                        $('#cc-loading').addClass('open');
                    },
                    success: function (response) {
                        $('#cc-loading').removeClass('open');

                        if (response === '-99') {
                            //alert('You need login to search');
                        } else {
                            $('.wlr-content').empty();
                            $('.wlr-content').append(response);
                        }
                    }
                });
            };

            ClickSheetItem();

            function ClickSheetItem() {
                $('.wlr-item-name').on('click', function () {
                    var $sid = $(this).parents('.wlr-content-item').attr('data-w');

                    NotepadOpenSheet($sid);
                });
            }

            function CreateImageFromQuestionPage() {
                $('.np-sheet-info .sheet-btn .sopen').on('click', function () {
                    var data = {
                        'action': 'iii_notepad_notepad_create_image_from_sheet_questions',
                        'sid': $('.sheetid').val(),
                        'qid': $('.page-number-input').val(),
                    }

                    $.ajax({
                        method: 'POST',
                        url: iii_script.ajax_url,
                        data: data,
                        dataType: 'json',
                        beforeSend: function () {

                        },
                        success: function (response) {
                            var element = $('<div/>', { class: 'htmlcanvas' }).appendTo('body');

                            element.append(response);

                            html2canvas($('.htmlcanvas')[0], {
                                onrendered: function (cv) {
                                    var imgageData = cv.toDataURL('image/png');
                                    var file = dataURLtoFile(imgageData, 'img.png');
                                    var reader = new FileReader();
                                    reader.onload = fileOnload;
                                    reader.readAsDataURL(file);
                                    $('.htmlcanvas').remove();
                                    $('.np-sheet-info').addClass('hidden');

                                }
                            });
                        }
                    });
                });
            }

            function dataURLtoFile(dataurl, filename) {
                var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            }

            function NotepadOpenSheet(sid) {
                var data = {
                    'action': 'iii_notepad_notepad_call_page_number_per_sheet',
                    'sid': sid,
                };

                $.ajax({
                    method: 'POST',
                    url: iii_script.ajax_url,
                    data: data,
                    dataType: 'json',
                    beforeSend: function () {

                    },
                    success: function (response) {
                        $('.notepad-sheet-search').removeClass('active').addClass('hidden');
                        $('.np-sheet-info').empty().append(response).removeClass('hidden');
                        CreateImageFromQuestionPage();
                        $('.np-sheet-info .sheet-btn .sclose').on('click', function () {
                            $('.np-sheet-info').empty().addClass('hidden');
                        });
                    }
                });
            }

            $('body').on(click_event, function () {
                var cnt = getCanvas();
                var can = document.getElementById("canvas_draw");
                //var ctxcan = can.getContext('2d');
                $('#panel').find('.typing-input').each(function () {
                    var $this = $(this),
                        position = $this.position(),
                        left = position.left,
                        top = position.top + 10,
                        socket = io.connect(url);
                    $(this).focus();
                    var arrLine = $this.val().split('\n');
                    var $i = 1;
                    var layer_num = $('#layers-body .active').attr('data-cnt');
                    $.each(arrLine, function (index, item) {
                        var item_top = top + $i * 10;
                        socket.emit('filetest', {
                            'item': item,
                            'left': left,
                            'item_top': item_top,
                            'room': stanza,
                            'layer': layer_num - 3,
                            'type': 'text'
                        })
                        $i++;
                    });

                    if ($('#panel').find('.typing-input').length > 1) {
                        $this.remove();
                    }
                });
            });

            // $("select").selectBoxIt();

            //event close session
            $("#close-session").on('click', function () {
                $('.close-session').removeClass("hidden");
            });

            $(".close-popup-close").click(function () {
                $('.close-class').addClass("hidden");
            });
            //p2
            //
            //
            $('.hidden-participant-btn').on('click', function () {
                $('#testichat').mCustomScrollbar('destroy');
                $('#testichat').mCustomScrollbar();


                $('#testichat').mCustomScrollbar("scrollTo", "last", {
                    moveDragger: true,
                    scrollInertia: 0
                });

                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    $('.menu-tray').removeClass('hidden-participant');
                    $('.hide-participant-line').addClass('hidden');
                } else {
                    $(this).addClass('active');
                    $('.menu-tray').addClass('hidden-participant');
                    $('.hide-participant-line').removeClass('hidden');
                }

            });

            //$('.toogle-menu-tray').on('click', function () {
            //    if ($('.sb-right').hasClass('hidden')) {
            //        $('.sb-right').removeClass('hidden');
            //    } else {
            //        $('.sb-right').addClass('hidden');
            //    }
            //});

            // Event opacitySideMenu side menu
            var slider = document.getElementById("bgopacity");
            var output = document.getElementById("rangevalue");
            output.innerHTML = slider.value;

            slider.oninput = function () {
                output.innerHTML = this.value;
            };

            $('#bgopacity').on('input', function () {
                $(this).parents('.opacitySideMenu').addClass('on-change');
            });

            $('#bgopacity').on('change', function () {
                $('.wrap-sidebar-left').css({
                    opacity: $(this).val() * '.01'
                });

                $(this).parents('.opacitySideMenu').removeClass('on-change');
            });

            // Event click for button list student
            $(".student_list").on('click', function () {
                var $actionOnRight = $(".menu-tray"),
                    $parent = $('.attend-list'),
                    $this = $(this);

                if ($actionOnRight.hasClass('show-both')) {
                    updateStatus($this, 'both', 'chat-only', $parent);
                } else if ($actionOnRight.hasClass('student-only')) {
                    updateStatus($this, 'me', 'student-only', $parent);
                } else if ($actionOnRight.hasClass('chat-only')) {
                    updateStatus($this, 'other', 'chat-only', $parent);
                    ResizeWhenShowBoth();
                } else {
                    updateStatus($this, 'remove', 'student-only', $parent);
                }
            });

            ResizeWhenShowBoth();

            $(".pop-chat").on('click', function () {
                var $actionOnRight = $(".menu-tray"),
                    $parent = $('.chat_box'),
                    $this = $(this);

                if ($actionOnRight.hasClass('show-both')) {
                    updateStatus($this, 'both', 'student-only', $parent);
                } else if ($actionOnRight.hasClass('student-only')) {
                    updateStatus($this, 'other', 'student-only', $parent);
                    ResizeWhenShowBoth();
                } else if ($actionOnRight.hasClass('chat-only')) {
                    updateStatus($this, 'me', 'chat-only', $parent);
                } else {
                    updateStatus($this, 'remove', 'chat-only', $parent);
                }
            });

            function updateStatus($el, $status, $class, $parent) {
                var $wrapper = $('.menu-tray');

                if ($status === 'remove') {
                    $el.addClass('active');
                    $wrapper.css('display', 'block');
                    $parent.css('display', 'block');
                    $wrapper.addClass($class);

                    $('.opactiyPercentage').css('display', 'flex');
                    $('.editBar').css('display', 'block');
                    $('.closeSideMenu .hideSideMenu').removeClass('hidden');
                    $('.closeSideMenu .showSideMenu').addClass('hidden');
                    ShowsideMenu();
                } else if ($status === 'me') {
                    $el.removeClass('active');
                    $wrapper.css('display', 'none').removeClass($class);
                    $parent.css('display', 'none');

                    $(".hideSideMenu").addClass("hidden");
                    $(".showSideMenu").removeClass("hidden");
                    $(".opactiyPercentage").hide();
                    $(".editBar").hide();
                    $('.showSideMenu').unbind('click');
                } else if ($status === 'other') {
                    $el.addClass('active');
                    $wrapper.css('display', 'block');
                    $parent.css('display', 'block');
                    $wrapper.removeClass($class).addClass('show-both');

                    $('.opactiyPercentage').css('display', 'flex');
                    $('.editBar').css('display', 'block');
                    $('.closeSideMenu .hideSideMenu').removeClass('hidden');
                    $('.closeSideMenu .showSideMenu').addClass('hidden');

                    ShowsideMenu();
                } else if ($status === 'both') {
                    $el.removeClass('active');
                    $parent.css('display', 'none');
                    $wrapper.removeClass('show-both').addClass($class);

                    ShowsideMenu();
                }
            }

            function ResizeWhenShowBoth() {
                $('.chat_box').resizable({
                    minHeight: 300,
                    handles: {
                        's': '.ui-resizable-n'
                    },
                    start: function (e, ui) {

                    }
                }).on("resize", function (event, ui) {
                    var hBottom = ui.size.height,
                        ht = $(window).height();
                    var hBottom = ui.size.height,
                        hTop = $(window).height() - hBottom;
                    $('#testichat').css('max-height', ht - 226 - hTop);
                    $('.chat_box').height(hBottom);
                    $('.attend-list').height(hTop);
                    $(window).resize(function () {
                        $(".attend-list").height($(window).height() - hBottom);
                    });

                    $(window).trigger('resize');


                });


            };

            var video_chat = 0;
            $("#toggleVideoMute").click(function () {
                video_chat++;
                if (video_chat % 2 != 0) {
                    $("#toggleVideoMute").removeClass("active");
                    $("#videoAndMic").css("display", "block");
                    $("#videoAndMic").removeClass("hidden");
                    $(".turnVideo").removeClass("hidden");
                    $(".On_Video").removeClass("hidden");
                    $(".Off_Video").addClass("hidden");
                    $(".turnMic").addClass("hidden");
                    $('#videoChat').removeClass('hidden');
                    $(".video_list").addClass('active');
                    setTimeout('$("#videoAndMic").hide()', 3000);

                } else {
                    $(".video_list").removeClass("active");
                    $(".On_Video").addClass("hidden");
                    $(".Off_Video").removeClass("hidden");
                    $("#videoAndMic").show();
                    $('#videoChat').addClass('hidden');
                    $(".video_list").removeClass('active');
                    setTimeout('$("#videoAndMic").hide()', 3000);


                }
            });
            var mic_chat = 0;;
            $("#toggleAudioMute").click(function () {
                mic_chat++;
                if (mic_chat % 2 != 0) {
                    $("#videoAndMic").css("display", "block");
                    $("#videoAndMic").removeClass("hidden");
                    $(".turnVideo").addClass("hidden");
                    $(".turnMic").removeClass("hidden");
                    $(".On_Mic").removeClass("hidden");
                    $(".Off_Mic").addClass("hidden");
                    setTimeout('$("#videoAndMic").hide()', 3000);
                } else {
                    $(".On_Mic").addClass("hidden")
                    $(".Off_Mic").removeClass("hidden");
                    $("#videoAndMic").show();
                    setTimeout('$("#videoAndMic").hide()', 3000);

                }
            });

            // Event hide/show side menu popup

            $(".hideSideMenu").click(function () {

                $(".menu-tray").hide();
                $(".hideSideMenu").addClass("hidden");
                $(".showSideMenu").removeClass("hidden");
                $(".opactiyPercentage").hide();
                $(".editBar").hide();

            });
            // Event click for hidden & show bottom-menu
            // menu bottom

            // $(".clickToHideFrom").click(function () {
            //     $(".wrap-sidebar-left").fadeOut(300);
            //     if ($('.menu-tray').hasClass('hidden') && $('.sb-right').hasClass('hidden')) {
            //         $('.menu-tray').removeClass('hidden');
            //         $('.sb-right').removeClass('hidden');
            //     } else {
            //         $('.menu-tray').addClass('hidden');
            //         $('.sb-right').addClass('hidden');
            //     }
            //     $(".clickToShowFrom").css("display", "block");
            //     $(".clickToHideFrom").css("display", "none");

            // });
            // $(".clickToShowFrom").click(function () {
            //     $(".wrap-sidebar-left").fadeOut(300);  
            //     if ($('.menu-tray').hasClass('hidden') && $('.sb-right').hasClass('hidden')) {
            //         $('.menu-tray').removeClass('hidden');
            //         $('.sb-right').removeClass('hidden');
            //     } else {
            //         $('.menu-tray').addClass('hidden');
            //         $('.sb-right').addClass('hidden');
            //     }
            //     $(".clickToShowFrom").css("display", "none");
            //     $(".clickToHideFrom").css("display", "block");   
            // });

            // Event custom scrollbar
            $('.style-scrollbar').mCustomScrollbar();

            // Event start tutoring
            var $check_start = true;
            $('.start-tutoring').on('click', function () {
                if ($check_start == true) {
                    $('body').removeClass('none-active');
                    CountdownTime(iii_variable.time_ranger);
                }

                $check_start = false;
            });

            // Event click for button video_list
            var video_list = 0;
            $(".attend-video-list").scroll(function () {
                $('.handle img').css("box-shadow", "0px -4px 0px rgb(186,186,186,0.3)");
                $('.handle hr').css("box-shadow", "0px -3px 0px rgb(186,186,186,0.3)");
            });

            $(".status-selector").click(function () {
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    $('.status-selector-bar').show();
                    $('.status-selector-bar').addClass('hidden');

                } else {
                    $(this).addClass('active');
                    $('.status-selector-bar').show();
                    $('.status-selector-bar').removeClass('hidden');
                }
            });

            $('.status-selector-bar > ul > li').on('click', function () {
                var $val = $(this).data('type');
                $('#emoji').val($val);

                var image_patch = '/images/notepad/notepad/emo/';
                var image;

                switch ($val) {
                    case 'fast':
                        image = 'Status_TooFast.png';
                        break;
                    case 'confused':
                        image = 'Status_Confused.png';
                        break;
                    case 'understand':
                        image = 'Status_Good.png';
                        break;
                }

                $('.status-selector img').attr('src', '' + image_patch + image + '');
                $('.status-selector-bar').hide();
                $('.status-selector').removeClass('active');
            });

            $('#file-input').change(function (e) {
                $('#panel').find('.typing-input').remove();
                var file = e.target.files[0],
                    imageType = /image.*/;
                if (!file.type.match(imageType))
                    return;

                var reader = new FileReader();
                reader.onload = fileOnload;
                reader.readAsDataURL(file);

                var cnt = getCanvas();
                var can = document.getElementById("canvas_draw");
                can.addClass('has-image');
            });

            $('#divrubber').draggable();

            // Event purchase
            $('.purchase-cancel').on('click', function () {
                $('.popup-purcharse').addClass('hidden');
            });

            $('.popup-time-extend .pte-ok').on('click', function () {
                let time = $('.popup-time-extend .ctc select').val();

                let data = {
                    'action': 'iii_notepad_purchase_time_by_point',
                    'student_id': iii_script.user_id,
                    'teacher_id': iii_script.teacher_id,
                    'sid': iii_script.sid,
                    'time': time
                };

                $.ajax({
                    method: 'POST',
                    url: iii_script.ajax_url,
                    data: data,
                    dataType: 'json',
                    beforeSend: function () {

                    },
                    success: function (response) {
                        if (response === '0') {
                            alert(iii_script.buy_time_fail);
                        } else if (response === '1') {
                            //alert(iii_script.buy_time_done);

                            let a = $('.time-class').text().split(':');
                            let current_sec = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
                            CountdownTime(current_sec + time * 60);
                            $('body').removeClass('none-active');
                        }
                    }
                });
            });

            //Countdown Time
            $('#time-action').on('click', function () {
                if ($('.time-menu-popup').hasClass('hidden')) {
                    $('.time-menu-popup').removeClass('hidden');
                } else {
                    $('.time-menu-popup').addClass('hidden');
                }
            });

            $('.btn-extend-time').on('click', function () {
                $('.time-menu-popup').addClass('hidden');
                $('.popup-time-extend').removeClass('hidden');
            });

            $('.pte-close').on('click', function () {
                $('.time-menu-popup').addClass('hidden');
                $('.popup-time-extend').addClass('hidden');
            });

            $('.btn-close-session').on('click', function () {
                location.reload();
            });

            $('.popup-time-extend .ctc select').on('change', function () {
                let $time = $(this).val();
                let $x = $(this).attr('data-time');

                $('.time-info .total span').empty().html(parseInt($time * $x) / 30 + iii_script.points);
            });

            function CountdownTime($time) {
                var $clock = $('.time-class');

                var min = new Date(new Date().valueOf() + $time * 1000);

                $clock.empty().countdown(min, function (event) {
                    $(this).html(event.strftime('%H:%M:%S'));

                    if (event.type == 'finish') {
                        $('.block-status-tutor').addClass('off');
                        $('body.notepad-on').addClass('none-active');
                    };
                });
            }

            $(document).on('click', '#btn-undo', function () {
                history.undo();
            });

            $(document).on('click', '#btn-redo', function () {
                history.redo();
            });

            $('#icon-video').on('click', function () {
                if ($('.video-popup-class').hasClass('hidden')) {
                    $('.video-popup-class').removeClass('hidden');
                } else {
                    $('.video-popup-class').addClass('hidden');
                }
            });
            // 
            $('#btnclose').on('click', function () {
                $('.video-popup-class').addClass('hidden');
            })

            // $('#yotubeVideo .item-video video').mediaelementplayer();

            $('.video-btn').on('click', function () {
                var $this = $(this);
                var $url = $this.parents('.video-popup-class').find('.video-url').val();
                var cnt = getCanvas();
                console.log('hello');
                $('#yotubeVideo .item-video').addClass('hiden');

                if ($url === '') {
                    alert(iii_script.empty_video_url);
                } else {
                    if ($('#video-' + cnt).length < 1) {
                        createVideo($url);
                        $('#yotubeVideo').removeClass('hidden');

                    } else if ($('#video-' + cnt).find('source').attr('src') !== $url) {
                        $('#video-' + cnt).remove();
                        createVideo($url);
                    }
                }
            });
            // Make the DIV element draggable:


            function createVideo($url) {
                var cnt = getCanvas();
                var url = new URL($url);
                var c = url.searchParams.get("v");
                console.log(c);

                var $div = $('<div/>', {
                    class: 'item-video',
                    id: 'video-' + (cnt - 3),
                    style: "z-index: 100; width: 30%; height: 50%; background: black; padding: 20px;",
                }).appendTo('#yotubeVideo');

                var input = $('<input>', {
                    type: "button",
                    value: "X",
                    style: "color: red; position: absolute; right: 0; top: 0; font-size: 20px;"
                }).appendTo($div);

                input[0].addEventListener("click", function (e) {
                    console.log($(this).parent().remove());
                })

                var $iframe = $('<iframe/>', {
                    id: "new-video",
                    src: "https://www.youtube.com/embed/" + c + "?origin=https://os.3i.com.vn",
                    crossorigin: "anonymous"
                }).appendTo($div);


                dragElement($div[0]);
                resizeVideo($div[0]);
                socket.emit("video", $url);

                // var video = $('<video/>', {
                //     width: 400,
                //     height: 200,
                //     style: "hidden: true;",
                //     id: "video1"
                // }).appendTo($div);

                // var source = $('<source/>', {
                //     src: $url,
                //     width: 500,
                //     height: 360,
                //     class: 'me-plugin',
                //     style: "z-index: 100;",
                //     // type:"video/youtube"
                // }).appendTo(video);
                // addVideoToCanvas(canvas);
            }

            function saveAs(dataToDownload, filename) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataToDownload));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }

            $('#icon-save').on('click', function () {
                let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                if (confirm(`Bạn có muốn tải layer ${layer_num}`)) {
                    const layerSave = pool_data.filter((data) => data.layer == layer_num);
                    saveAs(JSON.stringify(layerSave), `layer${layer_num}.txt`);
                }
            });

            $('#icon-load').on('click', function () {
                let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                document.getElementById("file-layer").onchange = (e) => {
                    console.log("change");
                    var file = e.target.files[0];
                    if (confirm(`Bạn có muốn load layer lưu vào layer ${layer_num}`)) {
                        file.text().then((data) => {
                            const layerSave = JSON.parse(data);
                            for (let i = 0; i < layerSave.length; i++) {
                                layerSave[i].layer = layer_num;
                                layerSave[i].objectID = randomID();
                                pool_data.push(layerSave[i]);
                                socket.emit('drawing', layerSave[i]);
                            }
                            loadCanvasJson(pool_data, canvas);
                        })
                    }
                    $("#file-layer").val('');
                }
                // if(!fileNew){
                //     var file = document.getElementById("file-layer").files[0];
                //     file.text().then((data) => {
                //         const layerSave = JSON.parse(data);
                //         console.log(layerSave);
                //         for(let i = 0; i < layerSave.length; i++){
                //             layerSave[i].layer = layer_num;
                //             pool_data.push(layerSave[i]);
                //         }
                //         loadCanvasJson(pool_data, canvas);
                //         socket.emit('update', pool_data);
                //     })
                // }
            })

            // Event User Login
            var ctrlFlag = false;
            $(document).keydown(function (e) {
                var code = e.keyCode || e.which;

                if (code == 17) {
                    ctrlFlag = true;
                } else if (code === 53 && ctrlFlag) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    $('.user-login-form').removeClass('hidden');
                }
            });

            $(document).keyup(function () {
                ctrlFlag = false;
            });

            $('.full-screen-mode').on('click', function () {
                let $this = $(this);

                if ($this.hasClass('full')) {
                    $this.removeClass('full').addClass('min');
                    openFullscreen();
                } else if ($this.hasClass('min')) {
                    $this.removeClass('min').addClass('full');
                    closeFullscreen();
                }

            });
            $('.zoom-full-screen').on('click', function () {
                let $this = $(this);
                var userName = $('#UserName').val();
                var room = $('#ScheduleID').val();

                if ($this.hasClass('full')) {
                    //$this.removeClass('full').addClass('min');
                    socket.emit('zoom-full-screen', { 'user': userName, 'room': room });
                    //openFullscreen();
                } else if ($this.hasClass('min')) {
                    $this.removeClass('min').addClass('full');
                    //closeFullscreen();
                }

            });

            $('#reveal-icon-left').on('click', function () {
                let bar = $('.block-toolbar');
                let reveal = $('.block-reveal');

                if (bar.get(0).scrollWidth - bar.width() === bar.scrollLeft()) {
                    reveal.addClass('end').removeClass('left');
                } else {
                    reveal.removeClass('begin').addClass('left');
                }

                bar.animate({
                    scrollLeft: '+=55'
                }, 1000);
            });


            $('button.btn').on('click', function () {
                $('#listOfSymbol').addClass('hidden');
                $('#listIconSVG').addClass('hidden');
            })

            $('#reveal-icon-right').on('click', function () {
                let bar = $('.block-toolbar');
                let reveal = $('.block-reveal');

                if (bar.scrollLeft() == 0) {
                    reveal.addClass('begin').removeClass('right');
                } else {
                    reveal.addClass('right').removeClass('end');
                }

                bar.animate({
                    scrollLeft: '-=55'
                }, 1000);
            });

            $('.trigger-action').on('click', function () {
                let divws = $(this).parents('.tutor-ws-div');

                if (divws.hasClass('activate')) {
                    divws.removeClass('activate');
                } else {
                    divws.addClass('activate');
                }
            });
            createCanvas();
            initDraw();
            addLayer();
            deleteLayer();
            // clearState();
            initChat();
            activeTab();
            initVideo();
            ShowsideMenu();
            hoverMenuShowTooltip();
            testcammic();
        });

        function createCanvas() {
            $("#layers-body li").each(function (i) {
                $(this).addClass("item" + (i + 1));
                $(this).attr("data-cnt", (i + 1));
                $(this).find('span').text((i + 1));
            });
        }

        function addLayer() {
            $(".btn-add-layer").click(function () {
                $('#panel').find('.typing-input').remove();
                // canvas.clear();
                var len = $("#layers-body li").length;
                if (len - layer > 2) {
                    socket.emit("addLayer", "add");
                }
                if (len <= 8) {
                    $('#layers-body').append('<li class="icon-layer icon-selector item' + (len + 1)
                        + '" data-cnt="' + (len + 1) + '"><img src="' + '/images/notepad/notepad/layer/layer-' + (len - 2) + '.png"></li>');
                }
            });
            initDraw();
        }

        function hoverMenuShowTooltip() {

            var timeout;
            $('.tooltip-wrap').on('mouseenter', function () {
                var $this = $(this);

                if (timeout != null) { clearTimeout(timeout); }

                timeout = setTimeout(function () {
                    $('.tooltip-wrap').removeClass('show-tt');
                    $this.addClass('show-tt');
                }, 1000)
            });

            $('.tooltip-wrap').on('mouseleave', function () {
                if (timeout != null) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            });
            $('.tooltip-wrap').on('mouseover', function () {
                $('.tooltip-wrap').removeClass('show-tt');
            });

            $(window).on('mouseover', function () {
                $('.tooltip-wrap').removeClass('show-tt');
            });
        }

        function openFullscreen() {
            let elem = document.documentElement;

            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
        }

        function closeFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        function ShowsideMenu() {
            $(".showSideMenu").click(function () {
                $(".menu-tray").show();

                $(".hideSideMenu").removeClass("hidden");
                $(".showSideMenu").addClass("hidden");
                $(".opactiyPercentage").show();
                $(".editBar").show();
            });
        }

        function TypingCreatTextarea(e) {
            e.preventDefault();

            var textarea = $('<textarea/>', {
                class: 'typing-input'
            }).appendTo('#panel');

            var top = e.clientY - 70;

            textarea.css({
                resize: 'both',
                top: top + 'px',
                left: e.clientX + 'px'
            });
        }

        function TypingCreatTextareaTouchDevice(e) {
            e.preventDefault();

            var textarea = $('<textarea/>', {
                class: 'typing-input'
            }).appendTo('#panel');

            if (e.touches) {
                if (e.touches.length == 1) {
                    var touch = e.touches[0];

                    var top = touch.pageY - 70;

                    textarea.css({
                        resize: 'both',
                        top: top + 'px',
                        left: touch.pageX + 'px'
                    });
                }
            }
            canvas.addEventListener('click', function (e) {
                if (!textarea) {
                    textarea = document.createElement('textarea');
                    textarea.className = 'info';
                    document.body.appendChild(textarea);
                }
                var x = e.clientX - canvas.offsetLeft,
                    y = e.clientY - canvas.offsetTop;
                textarea.value = "x: " + x + " y: " + y;
                textarea.style.top = e.clientY + 'px';
                textarea.style.left = e.clientX + 'px';
            }, false);
        }

        function initDraw() {
            $(document).on('click', '.icon-selector', function () {

                var cnt = $(this).attr('data-cnt');
                canvas.clear();
                loadCanvasJson(pool_data, canvas);

                // canvas.requestRenderAll();
                // var socket = io.connect(url);
                // var ctxcan = canvas.getContext('2d');
                // var wd = parseInt($('#canvas_draw').css('width'));
                // var ht = parseInt($('#canvas_draw').css('height'));
                // ctxcan.clearRect(0, 0, wd, ht);
                // canDraw(cnt);
                // socket.emit('layernew', {
                //     'room': stanza,
                //     'layer': cnt - 3
                // });

                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                if (!$(this).hasClass('active') && !$(this).hasClass('none-visiable')) {
                    $("#layers-body li").removeClass('active');
                    $(this).addClass('active');
                    $('#divrubber').css("visibility", "hidden");
                    $("#erasers-body li").removeClass('active');

                    $('#yotubeVideo .item-video').addClass('hidden');
                    $('#yotubeVideo #video-' + cnt).removeClass('hidden');
                    drawVideo();
                    if ($('.icon-layer.btn-grid').hasClass('active')) {
                        var grid = $('.icon-layer.btn-grid.active').attr('data-grid');
                        // var cnv = $('#math' + cnt);
                        // var ctxcan = cnv[0].getContext('2d');
                        var bg = getBg();
                        if (bg != '') {
                            $('#panel').css('background-color', bg);
                        }

                        if (grid) {
                            $('#panel').css('background-image', 'url(' + plugin_url + '/images/notepad/notepad/grid/grid-' + grid + '.png)')
                        }
                    }
                }
            });

            // $(".icon-selector").on('click', function(){
            //     if (!$(this).hasClass('active')) {
            //         $("#layers-body li").removeClass('active');
            //         $(this).addClass('active');
            //     }
            //     var cnt = $(this).attr('data-cnt');
            //     // var socket = io.connect(url);
            //     // var ctxcan = canvas.getContext('2d');
            //     // var wd = parseInt($('#canvas_draw').css('width'));
            //     // var ht = parseInt($('#canvas_draw').css('height'));
            //     // ctxcan.clearRect(0, 0, wd, ht);
            //     debugger;
            //     canDraw(cnt);
            //     // socket.emit('layernew', {
            //     //     'room': stanza,
            //     //     'layer': cnt - 3
            //     // });

            //     $('#panel').find('.typing-input').remove();
            //     $('#add-type-box').removeClass('active');
            //     if (!$(this).hasClass('active') && !$(this).hasClass('none-visiable')) {
            //         $("#layers-body li").removeClass('active');
            //         $(this).addClass('active');
            //         $('#divrubber').css("visibility", "hidden");
            //         $("#erasers-body li").removeClass('active');

            //         $('#yotubeVideo .item-video').addClass('hidden');
            //         $('#yotubeVideo #video-' + cnt).removeClass('hidden');
            //         drawVideo();
            //         if ($('.icon-layer.btn-grid').hasClass('active')) {
            //             var grid = $('.icon-layer.btn-grid.active').attr('data-grid');
            //             var cnv = $('#math' + cnt);
            //             var ctxcan = cnv[0].getContext('2d');
            //             var bg = getBg();
            //             if (bg != '') {
            //                 $('#panel').css('background-color', bg);
            //             }

            //             if (grid) {
            //                 $('#panel').css('background-image', 'url(' + plugin_url + '/images/notepad/notepad/grid/grid-' + grid + '.png)')
            //             }
            //         }
            //     }
            // })

            $(document).on('click', '.btn-color', function () {
                var cnt = getCanvas();
                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                $('#math' + cnt).unbind(click_event, TypingCreatTextarea);
                // $('#math' + cnt)[0].removeEventListener('touchstart', TypingCreatTextareaTouchDevice);

                if (!$(this).hasClass('active')) {
                    $("#colors-body li").removeClass('active');
                    $(this).addClass('active');
                    $('#divrubber').css("display", "none");
                    $("#erasers-body li").removeClass('active');
                    //$("#pencils-body li.hr1").addClass('active');
                    $('#change-color img').attr('src', '/images/notepad/notepad/color/top/' + $(this).attr('data-image-url'));
                    canDraw();
                }
            });

            $(document).on('click', '.btn-pencil', function () {
                var cnt = getCanvas();
                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                $('#math' + cnt).unbind(click_event, TypingCreatTextarea);
                // $('#math' + cnt)[0].removeEventListener('touchstart', TypingCreatTextareaTouchDevice);

                if (!$(this).hasClass('active')) {
                    $("#pencils-body li").removeClass('active');
                    $("#erasers-body li").removeClass('active');
                    $(this).addClass('active');
                    $('#divrubber').css("display", "none");
                    canDraw();
                }
            });

            $('.btn-eraser').on('click', function () {
                var cnt = getCanvas();
                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                $('#math' + cnt).unbind(click_event, TypingCreatTextarea);
                // $('#math' + cnt)[0].removeEventListener('touchstart', TypingCreatTextareaTouchDevice);

                var $this = $(this);

                $("#erasers-body li").removeClass('active');
                //$("#pencils-body li").removeClass('active');
                $this.addClass('active');

                var val = $this.attr('data-eraser');

                $('#divrubber').css({ "display": "block", "width": val + "px", "height": val + "px" });
                $('#controlrubber').removeClass('css-cursor-30 css-cursor-50 css-cursor-70 css-cursor-90 css-cursor-100');
                $('#controlrubber').addClass('css-cursor-' + val);

                canEraser();
            });

            $('.btn-eraser-clear').on('click', function () {
                pool_data = [];
                socket.emit('update', pool_data);
                canvas.clear();
            });

            var $z;
            $(document).on('click', '.btn-color-grid', function () {
                var bg = $(this).attr('data-color');
                var cnt = getCanvas();
                var can = document.getElementById("canvas_draw");
                var ctxcan = can.getContext('2d');

                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                $('#math' + cnt).unbind(click_event, TypingCreatTextarea);
                // $('#math' + cnt)[0].removeEventListener('touchstart', TypingCreatTextareaTouchDevice);

                var $x = $("#grids-body .btn-color-grid.active").length;

                if (!$(this).hasClass('active')) {
                    $("#grids-body .btn-color-grid").removeClass('active');
                    $(this).addClass('active');

                    if ($x === 0) {
                        //
                    }
                    //ctxcan.globalCompositeOperation = "destination-over";

                    // $('#panel').css('background-color', bg);

                    canvas.setBackgroundColor(`${bg}`, canvas.renderAll.bind(canvas));
                    socket.emit('color', bg);

                    //ctxcan.fillStyle = bg;
                    //ctxcan.fillRect(0, 0, can.width, can.height);
                    //ctxcan.globalCompositeOperation = "source-over";
                    //ctxcan.globalCompositeOperation = "destination-over";
                    var grid = getGrid();
                    if (grid != '') {
                        //drawGrid(can, parseInt(grid), bg);
                        $('#panel').css('background-image', 'url(' + plugin_url + '/images/notepad/notepad/grid/grid-' + grid + '.png)');
                        //$('canvas').css('background-image', 'url('+ plugin_url + '/images/notepad/grid-' + grid + '.png)');
                    }

                    //ctxcan.globalCompositeOperation = "source-over";
                }
            });

            var $stepGrid = -1;

            $('.btn-grid').unbind('click').bind('click', function (e) {
                var cnt = getCanvas();
                var cnv = $('#math' + cnt);
                // var ctxcan = cnv[0].getContext('2d');

                $('#panel').find('.typing-input').remove();
                $('#add-type-box').removeClass('active');
                $('#math' + cnt).unbind(click_event, TypingCreatTextarea);
                // $('#math' + cnt)[0].removeEventLcristener('touchstart', TypingCreatTextareaTouchDevice);

                // $stepGrid++;
                //
                // if ($stepGrid < $state.length) {
                //     $state.length = $stepGrid;
                // }
                //
                // if (!$('.btn-grid').hasClass('active')) {
                //     $state['grid-' + $stepGrid] = cnv[0].toDataURL();
                // }

                // ctxcan.clearRect(0, 0, cnv[0].width, cnv[0].height);
                // console.log(this);

                var bg = getBg();
                if (bg != '') {
                    $('#panel').css('background-color', bg);
                }

                if (!$(this).hasClass('active')) {
                    $("#grids-body .btn-grid").removeClass('active');
                    let canvas_objects = canvas._objects;
                    let idx = canvas_objects.findIndex(item => item.custom_type === 'type_grid');
                    canvas.remove(canvas.item(idx));
                    $(this).addClass('active');

                    var grid = $(this).attr('data-grid');

                    var grid = 50 / grid;

                    let groupTogether = [];
                    for (var i = 0; i < (canvas.getWidth() * 10 / grid); i++) {
                        let horizon = new fabric.Line([i * grid, 0, i * grid, canvas.getWidth() * 10], { stroke: '#ccc', selectable: false });
                        let vertical = new fabric.Line([0, i * grid, canvas.getWidth() * 10, i * grid], { stroke: '#ccc', selectable: false });
                        groupTogether.push(horizon, vertical);

                    }
                    var alltogetherObj = new fabric.Group(groupTogether, {
                        top: -1000,
                        left: -1000,
                        originX: 'center',
                        originY: 'center',
                        evented: false,
                    });

                    alltogetherObj['custom_type'] = 'type_grid';

                    canvas.add(alltogetherObj);
                    canvas.sendToBack(alltogetherObj);
                    canvas.sendBackwards(alltogetherObj)
                    // emitEvent(layer_num);



                    // ctxcan.globalCompositeOperation = "destination-over";
                    // drawGrid(cnv, grid, bg);
                    // $('#panel').css('background-image', 'url(' + plugin_url + '/images/notepad/notepad/grid/grid-' + grid + '.png)');
                    //$('canvas').css('background-image', 'url('+ plugin_url + '/images/notepad/grid-' + grid + '.png)');
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    isGrid = false;
                    $(this).removeClass('active');
                    let canvas_objects = canvas._objects;
                    let idx = canvas_objects.findIndex(item => item.custom_type == 'type_grid');
                    canvas.remove(canvas.item(idx));
                    $('#panel').css('background-image', '');
                    //$('canvas').css('background-image', '');
                }

                // var imgdaclient = new Image();
                // imgdaclient.src = $state['draw'];
                //
                // imgdaclient.onload = function() {
                //     ctxcan.drawImage(imgdaclient, 0, 0);
                // };
                //
                // ctxcan.globalCompositeOperation = "source-over";
            });


            $(document).on('change', '#screenshot-check', function (ev) {
                if (document.getElementById('screenshot-check').checked) {
                    $("#select-screenshot").selectBoxIt('disable');
                    var val = $('#select-screenshotSelectBoxItText').attr('data-val') * 1000;
                    idtempo = setInterval(function () {
                        takepicture();
                    }, val);
                } else {
                    clearInterval(idtempo);
                    $("#select-screenshot").selectBoxIt('enable');
                }
            });
        }

        function takepicture(e) {
            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");
            var datacam = can.toDataURL('image/png');
            var socket = io.connect(url);

            socket.emit('camperaltri', {
                'id': id,
                'positionx': positionx,
                'positiony': positiony,
                'camperaltridati': datacam,
                'room': stanza
            });
        }

        function drawVideo() {
            var mediaSource = "http://www.youtube.com/watch?v=nOEw9iiopwI";

            var muted = true;

            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");
            var ctx = canvas.getContext("2d");

            var videoContainer;
            var video = $('<video/>', {
                id: '3itest',
            });

            var source = $('<source/>', {
                src: mediaSource,
                type: 'video/youtube'
            }).appendTo(video);

            //video.autoPlay  = false;
            // video.loop      = true;
            //video.muted     = muted;

            videoContainer = {
                video: video,
                ready: false,
            };

            video.appendTo($('body'));

            video.oncanplay = readyToPlayVideo;

            function readyToPlayVideo(event) {
                videoContainer.scale = Math.min(4, 3);
                videoContainer.ready = true;

                requestAnimationFrame(updateCanvas);
            }

            function updateCanvas() {
                ctx.clearRect(0, 0, can.width, can.height);

                if (videoContainer !== undefined && videoContainer.ready) {
                    // find the top left of the video on the canvas
                    video.muted = muted;
                    var scale = videoContainer.scale;
                    var vidH = videoContainer.video.videoHeight;
                    var vidW = videoContainer.video.videoWidth;
                    var top = 200;
                    var left = 300;

                    // now just draw the video the correct size
                    ctx.drawImage(videoContainer.video, left, top, vidW * scale, vidH * scale);
                    if (videoContainer.video.paused) { // if not playing show the paused screen
                        drawPayIcon();
                    }
                }

                // all done for display
                // request the next frame in 1/60th of a second
                requestAnimationFrame(updateCanvas);
            }

            function drawPayIcon() {

                ctx.fillStyle = "black";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(0, 0, can.width, can.height);
                ctx.fillStyle = "#DDD";
                ctx.globalAlpha = 0.75;
                ctx.beginPath();
                var size = (can.height / 2) * 0.5;
                ctx.moveTo(can.width / 2 + size / 2, can.height / 2);
                ctx.lineTo(can.width / 2 - size / 2, can.height / 2 + size);
                ctx.lineTo(can.width / 2 - size / 2, can.height / 2 - size);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            function playPauseClick() {
                if (videoContainer !== undefined && videoContainer.ready) {
                    if (videoContainer.video.paused) {
                        videoContainer.video.play();
                    } else {
                        videoContainer.video.pause();
                    }
                }
            }

            can.addEventListener("click", playPauseClick);
        }

        function drawGrid(cnv, grid, bg) {

            if (bg == '#DEDEDE')
                var border = '#c2c2c2';
            else
                var border = '#c2c2c2';

            if (grid == 1) {
                var gridOptions = {
                    minorLines: {
                        separation: 45,
                        color: border
                    }
                };
                drawGridLines(cnv, gridOptions.minorLines);
            } else if (grid == 2) {
                var gridOptions = {
                    minorLines: {
                        separation: 22,
                        color: border
                    }
                };
                drawGridLines(cnv, gridOptions.minorLines);
            } else {
                var gridOptions = {
                    minorLines: {
                        separation: 11,
                        color: border
                    },
                    majorLines: {
                        separation: 44,
                        color: '#B1B1B1'
                    }
                };
                drawGridLines(cnv, gridOptions.minorLines);
                drawGridLines(cnv, gridOptions.majorLines);
            }
            return;
        }

        function drawGridLines(cnv, lineOptions) {

            var iWidth = cnv[0].width;
            var iHeight = cnv[0].height;

            var ctx = cnv[0].getContext('2d');

            ctx.strokeStyle = lineOptions.color;
            ctx.strokeWidth = 1;
            ctx.lineWidth = 1;

            ctx.beginPath();

            var iCount = null;
            var i = null;
            var x = null;
            var y = null;

            iCount = Math.floor(iWidth / lineOptions.separation);

            for (i = 1; i <= iCount; i++) {
                x = (i * lineOptions.separation);
                ctx.moveTo(x, 0);
                ctx.lineTo(x, iHeight);
                ctx.stroke();
            }

            iCount = Math.floor(iHeight / lineOptions.separation);

            for (i = 1; i <= iCount; i++) {
                y = (i * lineOptions.separation);
                ctx.moveTo(0, y);
                ctx.lineTo(iWidth, y);
                ctx.stroke();
            }

            ctx.closePath();

            return;
        }

        function deleteLayer() {
            $(".btn-delete-layer").click(function () {
                var len = $("#layers-body li").length;
                if (len > 4) {
                    $("#math" + len).remove();
                    $(".item" + len).remove();
                }
            });
        }



        function clearState() {
            $(document).on('click', '.btn-eraser-clear', function () {
                $("canvas").each(function (i) {
                    var can = $(this);
                    var ctxcan = can[0].getContext('2d');
                    ctxcan.clearRect(0, 0, can[0].width, can[0].height);

                    //$("#pencils-body li.hr1").addClass('active');
                    $("#erasers-body li").removeClass('active');
                    $('#divrubber').css("display", "none");
                    canDraw();
                    $('#divrubber').css("display", "none");
                    $("#erasers-body li").removeClass('active');
                });
            });
        }

        function pad(val) {
            var valString = val + "";
            if (valString.length < 2) {
                return "0" + valString;
            } else {
                return valString;
            }
        }

        function setTime() {
            ++totalSeconds;
            var time = '-' + pad(parseInt(totalSeconds / 65)) + ':' + pad(totalSeconds % 65);
            $('.time-class').text(time);
        }

        function fileOnload(e) {
            var img = $('<img>', {
                src: e.target.result
            });
            var socket = io.connect(url);
            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");
            var ctxcan = can.getContext('2d');

            // alert(img.src.value);
            // var canvas1 = $('#paper')[0];
            // var context1 = canvas1.getContext('2d');
            img.on('load', function () {
                ctxcan.drawImage(this, positionx, positiony);
                socket.emit('fileperaltri', {
                    'id': id,
                    'positionx': positionx,
                    'positiony': positiony,
                    'fileperaltri': e.target.result,
                    'room': stanza
                });
            });
        }

        function canDraw(a) {
            console.log(a);
            var socket = io.connect(url);
            var cnt = getCanvas();
            // canvas.clear();
            // console.log(pool_data);
            var ctxcan = canvas.getContext('2d');

            var prev = {};

            // ctx setup
            ctxcan.lineCap = "round";
            ctxcan.lineJoin = "round";
            ctxcan.lineWidth = getPencil();
            ctxcan.font = "20px Tahoma";

            if (ctxcan) {
                $(window).on('resize', function () {
                    resizecanvas(canvas, ctxcan);
                });

                $(window).on('orientationchange', function () {
                    resizecanvas(canvas, ctxcan);
                });
            }

            // socket.emit('setuproom', {
            //     'room': stanza,
            //     'id': username,
            //     'usernamerem': username
            // });

            // socket.on('setuproomserKO', function (data) {
            //     stanza = data.room;
            // });

            // socket.on('setuproomser', function (data) {
            //     stanza = data.room;
            // });

            // socket.on('doppioclickser', function (data) {
            //     ctxcan.fillStyle = data.color;
            //     ctxcan.font = data.fontsizerem + "px Tahoma";
            //     ctxcan.fillText(data.scrivi, data.x, data.y);
            // });
            // socket.on('filetester', function (data) {
            //     ctxcan.fillStyle = data.color;
            //     ctxcan.font = data.fontsizerem + "px Tahoma";
            //     ctxcan.fillText(data.item, data.left, data.item_top);
            // });

            // socket.on('fileperaltriser', function (data) {
            //     var imgdaclient = new Image();
            //     imgdaclient.src = data.fileperaltri;
            //     imgdaclient.onload = function () {
            //         //  imgdaclient.src = data.fileperaltri;
            //         ctxcan.drawImage(imgdaclient, data.positionx, data.positiony);
            //     }
            // });
            if (a) {
                //Load local data for layer

                isLoadDataLocal = true;
                loadCanvasJson(pool_data, canvas);
                canvas.renderAll();
                socket.on('moves', function (list) {
                    var layer_number = $('#layers-body .active').attr('data-cnt');
                    layer_number = layer_number - 3;
                    var layer_num = a - 3;
                    list.forEach(function (data) {
                        if (data.type == 'draw') {
                            if (data.layer == layer_num) {
                                if (data.drawing && clients[data.id]) {
                                    ctxcan.strokeStyle = data.color;
                                    if (layer_number == data.layer) {
                                        drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
                                    }
                                }
                            }

                            clients[data.id] = data;
                            clients[data.id].updated = $.now();
                        }
                        else if (data.type == 'text') {
                            ctxcan.fillStyle = data.color;
                            ctxcan.font = data.fontsizerem + "px Tahoma";
                            ctxcan.fillText(data.item, data.left, data.item_top);
                        }
                    });

                });
            }

            // socket.on('moving', function (data) {
            //     // if (!(data.id in clients)) {
            //     //     // a new user has come online. create a cursor for them
            //     //     cursors[data.id] = $('<div class="cursor"><div class="identif">' + data.usernamerem + '</div>').appendTo('#cursors');
            //     // }
            //     var layer_num = $('#layers-body .active').attr('data-cnt');
            //     layer_num = layer_num - 3;



            //     // Move the mouse pointer
            //     // cursors[data.id].css({
            //     //     'left': data.x,
            //     //     'top': data.y
            //     // });

            //     // Is the user drawing?
            //     if (data.drawing && clients[data.id]) {
            //         // Draw a line on the canvas. clients[data.id] holds
            //         // the previous position of this user's mouse pointer
            //         ctxcan.strokeStyle = data.color;
            //         //  drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y,data.spessremo,data.color);
            //         if (data.layer == layer_num) {
            //             drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
            //         }
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();

            // });

            // socket.on('toccomoving', function (list) {


            //     if (data.drawing && clients[data.id]) {


            //         ctx.strokeStyle = data.color;

            //         drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();

            // });

            // socket.on('rubberser', function (data) {

            //     // if (!(data.id in clients)) {
            //     //     // a new user has come online. create a cursor for them
            //     //     cursors[data.id] = $('<div class="cursor"><div class="identif">' + data.usernamerem + '</div>').appendTo('#cursors');
            //     // }

            //     // Move the mouse pointer
            //     // Is the user drawing?
            //     if (data.controlrubber && clients[data.id]) {

            //         cursors[data.id].css({
            //             'left': data.x,
            //             'top': data.y
            //         });
            //         ctxcan.clearRect(data.x, data.y, data.width, data.height);
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();
            // });

            // //  code to draw on canvas
            // $('#panel').on('touchstart', function (e) {
            //     e.preventDefault();
            //     getTouchPos();
            //     socket.emit('mousemove', {
            //         'x': touchX,
            //         'y': touchY,
            //         'drawing': drawing,
            //         'color': getColor(),
            //         'id': id,
            //         'usernamerem': username,
            //         'spessremo': getPencil(),
            //         'room': stanza
            //     });
            //     $(".cursor").css("zIndex", 6);
            //     drawing = true;
            // }, false);

            // $('#panel').on('touchend', function (e) {
            //     e.preventDefault();
            //     drawing = false;
            //     $(".cursor").css("zIndex", 8);
            // }, false);
            // $('#panel').on('touchmove', function (e) {
            //     
            //     var cnt = getCanvas();
            //     var ctxcan = canvas.getContext('2d');
            //     e.preventDefault();
            //     if ($.now() - lastEmit > 25) {
            //         if (controlpencil) {
            //             prev.x = touchX;
            //             prev.y = touchY;
            //             getTouchPos();

            //             drawLineMultiCanvas(prev.x, prev.y, touchX, touchY, ctxcan);

            //             lastEmit = $.now();
            //             socket.emit('mousemove', {
            //                 'x': touchX,
            //                 'y': touchY,
            //                 'drawing': drawing,
            //                 'color': getColor(),
            //                 'id': id,
            //                 'usernamerem': username,
            //                 'spessremo': getPencil(),
            //                 'room': stanza
            //             });
            //         }
            //     }

            // }, false);

            // $('#panel').on('mousedown', function (e) {
            //     if ($('#change-size-pencil').hasClass('active')) {
            //         var layer_num = $('#layers-body .active').attr('data-cnt');
            //         e.preventDefault();
            //         prev.x = e.pageX + 5;
            //         prev.y = e.pageY - 55;
            //         socket.emit('mousemove', {
            //             'x': prev.x,
            //             'y': prev.y,
            //             'drawing': drawing,
            //             'color': getColor(),
            //             'id': id,
            //             'usernamerem': username,
            //             'spessremo': getPencil(),
            //             'room': stanza,
            //             'layer': layer_num - 3,
            //             'type': 'draw'
            //         });
            //         drawing = true;
            //         $(".cursor").css("zIndex", 6);
            //     }
            // });

            // $('#panel').on('mouseup mouseleave', function (e) {
            //     if (drawing) {
            //         drawing = false;
            //         $(".cursor").css("zIndex", 8);
            //         //history.saveState();

            //         if (!$('.btn-grid').hasClass('active')) {
            //             $state['draw'] = can.toDataURL();
            //         }
            //     }
            // });

            // $('#panel').on('mousemove', function (e) {
            //     var cnt = getCanvas();
            //     var ctxcan = canvas.getContext('2d');
            //     var layer_num = $('#layers-body .active').attr('data-cnt');
            //     var posmousex = e.pageX + 5;
            //     var posmousey = e.pageY - 65;
            //     // if ($.now() - lastEmit > 25) {
            //     //     if (drawing && (controlpencil)) {
            //     //         //     ctx.strokeStyle = document.getElementById('minicolore').value;
            //     //         drawLineMultiCanvas(prev.x, prev.y, e.pageX + 5, e.pageY - 65, ctxcan);
            //     //         prev.x = e.pageX + 5;
            //     //         prev.y = e.pageY - 65;
            //     //         lastEmit = $.now();
            //     //         socket.emit('mousemove', {
            //     //             'x': prev.x,
            //     //             'y': prev.y,
            //     //             'drawing': drawing,
            //     //             'color': getColor(),
            //     //             'id': id,
            //     //             'usernamerem': username,
            //     //             'spessremo': getPencil(),
            //     //             'room': stanza,
            //     //             'layer': layer_num - 3,
            //     //             'type': 'draw'
            //     //         });

            //     //     }
            //     // }
            //     // Draw a line for the current user's movement, as it is
            //     // not received in the socket.on('moving') event above
            // });
        }

        function canEraser() {
            //username = username.substr(0, 20);
            var socket = io.connect(url);
            var cnt = getCanvas();
            var ctxcan = canvas.getContext('2d');

            divrubber.on('mouseup mouseleave', function (e) {

                drawing = false;
                controlrubber = false;
                dragging = true;
            });

            divrubber.on('mousemove', function (e) {
                var rubbersize = getEraser();

                if (dragging) {
                    ctxcan.clearRect(divrubber.position().left, divrubber.position().top, rubbersize + 4, rubbersize + 4);
                    controlrubber = true;

                    socket.emit('rubber', {
                        'x': divrubber.position().left,
                        'y': divrubber.position().top,
                        'id': id,
                        'usernamerem': username,
                        'controlrubber': controlrubber,
                        'width': rubbersize + 4,
                        'height': rubbersize + 4,
                        'room': stanza
                    });
                    console.log('rubber');
                }
            });

            divrubber.on('mousedown', function (e) {
                drawing = false;
                dragging = true;
            });


        }

        function canDraw(a) {
            var socket = io.connect(url);
            var cnt = getCanvas();
            // canvas.clear();
            var ctxcan = canvas.getContext('2d');

            var prev = {};

            // ctx setup
            ctxcan.lineCap = "round";
            ctxcan.lineJoin = "round";
            ctxcan.lineWidth = getPencil();
            ctxcan.font = "20px Tahoma";

            if (ctxcan) {
                $(window).on('resize', function () {
                    resizecanvas(canvas, ctxcan);
                });

                $(window).on('orientationchange', function () {
                    resizecanvas(canvas, ctxcan);
                });
            }

            // socket.emit('setuproom', {
            //     'room': stanza,
            //     'id': username,
            //     'usernamerem': username
            // });

            // socket.on('setuproomserKO', function (data) {
            //     stanza = data.room;
            // });

            // socket.on('setuproomser', function (data) {
            //     stanza = data.room;
            // });

            // socket.on('doppioclickser', function (data) {
            //     ctxcan.fillStyle = data.color;
            //     ctxcan.font = data.fontsizerem + "px Tahoma";
            //     ctxcan.fillText(data.scrivi, data.x, data.y);
            // });
            // socket.on('filetester', function (data) {
            //     ctxcan.fillStyle = data.color;
            //     ctxcan.font = data.fontsizerem + "px Tahoma";
            //     ctxcan.fillText(data.item, data.left, data.item_top);
            // });

            // socket.on('fileperaltriser', function (data) {
            //     var imgdaclient = new Image();
            //     imgdaclient.src = data.fileperaltri;
            //     imgdaclient.onload = function () {
            //         //  imgdaclient.src = data.fileperaltri;
            //         ctxcan.drawImage(imgdaclient, data.positionx, data.positiony);
            //     }
            // });
            if (a) {
                //Load local data for layer

                isLoadDataLocal = true;
                loadCanvasJson(pool_data, canvas);
                canvas.renderAll();
                socket.on('moves', function (list) {
                    var layer_number = $('#layers-body .active').attr('data-cnt');
                    layer_number = layer_number - 3;
                    var layer_num = a - 3;
                    list.forEach(function (data) {
                        if (data.type == 'draw') {
                            if (data.layer == layer_num) {
                                if (data.drawing && clients[data.id]) {
                                    ctxcan.strokeStyle = data.color;
                                    if (layer_number == data.layer) {
                                        drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
                                    }
                                }
                            }

                            clients[data.id] = data;
                            clients[data.id].updated = $.now();
                        }
                        else if (data.type == 'text') {
                            ctxcan.fillStyle = data.color;
                            ctxcan.font = data.fontsizerem + "px Tahoma";
                            ctxcan.fillText(data.item, data.left, data.item_top);
                        }
                    });

                });
            }

            // socket.on('moving', function (data) {
            //     // if (!(data.id in clients)) {
            //     //     // a new user has come online. create a cursor for them
            //     //     cursors[data.id] = $('<div class="cursor"><div class="identif">' + data.usernamerem + '</div>').appendTo('#cursors');
            //     // }
            //     var layer_num = $('#layers-body .active').attr('data-cnt');
            //     layer_num = layer_num - 3;



            //     // Move the mouse pointer
            //     // cursors[data.id].css({
            //     //     'left': data.x,
            //     //     'top': data.y
            //     // });

            //     // Is the user drawing?
            //     if (data.drawing && clients[data.id]) {
            //         // Draw a line on the canvas. clients[data.id] holds
            //         // the previous position of this user's mouse pointer
            //         ctxcan.strokeStyle = data.color;
            //         //  drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y,data.spessremo,data.color);
            //         if (data.layer == layer_num) {
            //             drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
            //         }
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();

            // });

            // socket.on('toccomoving', function (list) {


            //     if (data.drawing && clients[data.id]) {


            //         ctx.strokeStyle = data.color;

            //         drawLinerem(clients[data.id].x, clients[data.id].y, data.x, data.y, data.spessremo, data.color, ctxcan);
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();

            // });
            // socket.on('rubberer', function (data) {
            //     // if (!(data.id in clients)) {
            //     //     // a new user has come online. create a cursor for them
            //     //     cursors[data.id] = $('<div class="cursor"><div class="identif">' + data.usernamerem + '</div>').appendTo('#cursors');
            //     // }

            //     // Move the mouse pointer
            //     // Is the user drawing?
            //     if (data.controlrubber && clients[data.id]) {

            //         cursors[data.id].css({
            //             'left': data.x,
            //             'top': data.y
            //         });
            //         ctxcan.clearRect(data.x, data.y, data.width, data.height);
            //     }

            //     // Saving the current client state
            //     clients[data.id] = data;
            //     clients[data.id].updated = $.now();
            // });

            // //  code to draw on canvas
            // $('#panel').on('touchstart', function (e) {
            //     e.preventDefault();
            //     getTouchPos();
            //     socket.emit('mousemove', {
            //         'x': touchX,
            //         'y': touchY,
            //         'drawing': drawing,
            //         'color': getColor(),
            //         'id': id,
            //         'usernamerem': username,
            //         'spessremo': getPencil(),
            //         'room': stanza
            //     });
            //     $(".cursor").css("zIndex", 6);
            //     drawing = true;
            // }, false);

            // $('#panel').on('touchend', function (e) {
            //     e.preventDefault();
            //     drawing = false;
            //     $(".cursor").css("zIndex", 8);
            // }, false);
            // $('#panel').on('touchmove', function (e) {
            //     
            //     var cnt = getCanvas();
            //     var ctxcan = canvas.getContext('2d');
            //     e.preventDefault();
            //     if ($.now() - lastEmit > 25) {
            //         if (controlpencil) {
            //             prev.x = touchX;
            //             prev.y = touchY;
            //             getTouchPos();

            //             drawLineMultiCanvas(prev.x, prev.y, touchX, touchY, ctxcan);

            //             lastEmit = $.now();
            //             socket.emit('mousemove', {
            //                 'x': touchX,
            //                 'y': touchY,
            //                 'drawing': drawing,
            //                 'color': getColor(),
            //                 'id': id,
            //                 'usernamerem': username,
            //                 'spessremo': getPencil(),
            //                 'room': stanza
            //             });
            //         }
            //     }

            // }, false);

            // $('#panel').on('mousedown', function (e) {
            //     if ($('#change-size-pencil').hasClass('active')) {
            //         var layer_num = $('#layers-body .active').attr('data-cnt');
            //         e.preventDefault();
            //         prev.x = e.pageX + 5;
            //         prev.y = e.pageY - 55;
            //         socket.emit('mousemove', {
            //             'x': prev.x,
            //             'y': prev.y,
            //             'drawing': drawing,
            //             'color': getColor(),
            //             'id': id,
            //             'usernamerem': username,
            //             'spessremo': getPencil(),
            //             'room': stanza,
            //             'layer': layer_num - 3,
            //             'type': 'draw'
            //         });
            //         drawing = true;
            //         $(".cursor").css("zIndex", 6);
            //     }
            // });

            // $('#panel').on('mouseup mouseleave', function (e) {
            //     if (drawing) {
            //         drawing = false;
            //         $(".cursor").css("zIndex", 8);
            //         //history.saveState();

            //         if (!$('.btn-grid').hasClass('active')) {
            //             $state['draw'] = can.toDataURL();
            //         }
            //     }
            // });

            // $('#panel').on('mousemove', function (e) {
            //     var cnt = getCanvas();
            //     var ctxcan = canvas.getContext('2d');
            //     var layer_num = $('#layers-body .active').attr('data-cnt');
            //     var posmousex = e.pageX + 5;
            //     var posmousey = e.pageY - 65;
            //     // if ($.now() - lastEmit > 25) {
            //     //     if (drawing && (controlpencil)) {
            //     //         //     ctx.strokeStyle = document.getElementById('minicolore').value;
            //     //         drawLineMultiCanvas(prev.x, prev.y, e.pageX + 5, e.pageY - 65, ctxcan);
            //     //         prev.x = e.pageX + 5;
            //     //         prev.y = e.pageY - 65;
            //     //         lastEmit = $.now();
            //     //         socket.emit('mousemove', {
            //     //             'x': prev.x,
            //     //             'y': prev.y,
            //     //             'drawing': drawing,
            //     //             'color': getColor(),
            //     //             'id': id,
            //     //             'usernamerem': username,
            //     //             'spessremo': getPencil(),
            //     //             'room': stanza,
            //     //             'layer': layer_num - 3,
            //     //             'type': 'draw'
            //     //         });

            //     //     }
            //     // }
            //     // Draw a line for the current user's movement, as it is
            //     // not received in the socket.on('moving') event above
            // });
        }

        function getCanvas() {
            var cnt = '1';
            $("#layers-body li").each(function (i) {
                if ($(this).hasClass('active')) {
                    cnt = $(this).attr('data-cnt');
                }
            });
            return cnt;
        }

        function getColor() {
            var color = '#000000';
            $("#colors-body li").each(function (i) {
                if ($(this).hasClass('active')) {
                    color = $(this).attr('data-color');
                }
            });
            return color;
        }

        function getPencil() {
            var pencil = '1';
            $("#pencils-body li").each(function (i) {
                if ($(this).hasClass('active')) {
                    pencil = $(this).attr('data-pencil');
                }
            });
            return pencil;
        }

        function getEraser() {
            var eraser = 0;
            $("#erasers-body li").each(function (i) {
                if ($(this).hasClass('active')) {
                    eraser = parseInt($(this).attr('data-eraser'));
                }
            });
            return eraser;
        }

        function getBg() {
            var bg = '';
            $("#grids-body .btn-color-grid").each(function (i) {
                if ($(this).hasClass('active')) {
                    bg = $(this).attr('data-color');
                }
            });
            return bg;
        }

        function getGrid() {
            var grid = '';
            $("#grids-body .btn-grid").each(function (i) {
                if ($(this).hasClass('active')) {
                    grid = parseInt($(this).attr('data-grid'));
                }
            });
            return grid;
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

        function drawLinerem(fromx, fromy, tox, toy, spessore, colorem, ctxcan) {
            // console.log(colorem, spessore)
            ctxcan.strokeStyle = colorem;
            ctxcan.lineWidth = spessore;
            ctxcan.beginPath();
            ctxcan.moveTo(fromx, fromy);
            ctxcan.lineTo(tox, toy);
            ctxcan.stroke();
            ctxcan.closePath();
            fromx = tox;
            fromy = toy;
        }

        function drawLineMultiCanvas(fromx, fromy, tox, toy, ctx) {

            ctx.strokeStyle = getColor();
            ctx.lineWidth = getPencil();
            ctx.beginPath();
            ctx.moveTo(fromx, fromy);
            ctx.lineTo(tox, toy);
            ctx.stroke();
        }

        function resizecanvas(can, ctxcan) {
            var imgdata = ctxcan.getImageData(0, 0, can.width, can.height);
            can.width = innerWidth;
            can.height = innerHeight + 65;
            ctxcan.putImageData(imgdata, 0, 0);
        }

        function getTouchPos(e) {
            if (!e)
                var e = event;

            if (e.touches) {
                if (e.touches.length == 1) { // Only deal with one finger
                    var touch = e.touches[0]; // Get the information for finger #1
                    // touchX=touch.pageX-touch.target.offsetLeft;
                    // touchY=touch.pageY-touch.target.offsetTop;
                    touchX = touch.pageX - 17;
                    touchY = touch.pageY - 95;
                }
            }
        }

        //Functions of Chat
        function initChat() {
            var socket = io.connect(url);
            username = $("#UserName").val();
            usernameTemp = $("#UserName").val();

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
                    var roomid;
                    var stanza = roomid = 'private' + id;
                    var ul = document.createElement('ul');
                    ul.id = "testichat" + id;
                    ul.className = "inbox-message style-scrollbar";

                    var img = document.createElement('img');
                    img.id = "closePrivate" + id;
                    img.className = "close-private";
                    img.src = plugin_url + "/images/notepad/notepad/icon_CLOSE.png";
                    $('#chat').append(img);
                    $('#chat').append(ul);

                    var testichats = document.getElementById('testichat' + id);

                    loadChat(username, roomid, clients, testichats);
                    getSubscribe(clients, roomid, testichats);
                    if (channels.length) unSubscribe(clients, channels);

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

            socket.on('privatecreate', function (data) {
                var channels = [];

                $("#tab-chat li").each(function (i) {
                    var room = $(this).attr('data-room');
                    channels.push('/' + room);
                });

                $('.inbox-message').css("display", "none");

                var ul = document.createElement('ul');
                ul.id = "testichat" + data.studentid;
                ul.className = "inbox-message style-scrollbar";
                $('#chat').append(ul);
                stanza = data.roomid;

                var testichats = document.getElementById('testichat' + data.studentid);

                loadChat(username, data.roomid, clients, testichats);
                getSubscribe(clients, data.roomid, testichats);
                if (channels.length) unSubscribe(clients, channels);

                $('.all-message').removeClass('active');
                $('.mess-private').removeClass('active');
                $('<li class="item-stt-message mess-private active" data-id="' + data.studentid + '" data-name="' + data.studentname + '" data-room="' + data.roomid + '"><p class="text-overfl">' + data.studentname + '</p></li>').insertAfter(".all-message");
            });
        }

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
                    getSubscribe(clients, stanza, testichat);
                    if (channels.length) unSubscribe(clients, channels);
                    $('#testichat').css("display", "block");
                } else {
                    var username = $(this).attr('data-name');
                    var roomid;
                    var stanza = roomid = $(this).attr('data-room');
                    var testichats = document.getElementById('testichat' + id);
                    getSubscribe(clients, roomid, testichats);
                    if (channels.length) unSubscribe(clients, channels);
                    $('#testichat' + id).css("display", "block");
                }
            });
        }

        function loadChat(username, roomid, client, testichats) {
            var name = username;
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
                            text: document.getElementById('scrivi'),
                            // send: document.getElementById('btn-send'),
                            send: document.getElementById('scrivi'),
                            emoji: document.getElementById('emoji'),
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
                            } else {
                                clients.publish({
                                    retries: 0,
                                    channel: '/' + rooms,
                                    data: {
                                        alias: username,
                                        text: chat.dom.chat.text.value,
                                        emoji: chat.dom.chat.emoji.value
                                    },
                                    onSuccess: function (args) {
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
                    var logs = args.getExtensionValue('logs');
                    if (logs != null) {
                        for (var i = 0; i < logs.length; i++) {
                            logMessage(logs[i].alias, logs[i].text, false, testichat, logs[i].emoji);
                        }
                    }
                },
                onFailure: function (args) {
                    //chat.util.logSuccess('Not connecting.');
                },
                onReceive: function (args) {
                    var ch = args.getChannel();
                    logMessage(args.getData().alias, args.getData().text, args.getWasSentByMe(), testichat, args.getData().emoji);
                }
            });
        }

        function unSubscribe(clients, channels) {
            clients.unsubscribe({
                channels: channels,
                onFailure: function (args) {
                    alert(args.error);
                }
            });
        }

        function logMessage(alias, text, me, testichat, emoji) {
            var html = '<li';
            if (me) {
                html += ' class="item-message"';
            } else {
                html += ' class="item-message me"';
            }
            // <p class="emoji fl">
            //         <img src="/images/notepad/Icons/54_Status_Good.png" alt="emoji">
            //     </p>
            var image_patch = '/images/notepad/notepad/emo/';
            var image;

            switch (emoji) {
                case 'fast':
                    image = 'Status_TooFast.png';
                    break;
                case 'confused':
                    image = 'Status_Confused.png';
                    break;
                case 'understand':
                    image = 'Status_Good.png';
                    break;
                case 'default':
                    image = 'Status_Defualt.png';
                    break;

            }

            html += '><p class="emoji fl"><img src="' + image_patch + image + '" alt="emoji"></p><p class="name-sender">' + alias + ':</p><p class="content-mess">' + text + '</p></li>';
            var div = document.createElement('div');
            div.innerHTML = html;
            testichat.appendChild(div);

            testichat.scrollTop = testichat.scrollHeight;

            $(testichat).mCustomScrollbar('destroy');
            $(testichat).mCustomScrollbar();
            $('#testichat').mCustomScrollbar('scrollTo', 'bottom', { scrollInertia: 0 });
        }

        function initVideo() {
            var videoChat = document.getElementById('videoChat');
            var loading = document.getElementById('loading');
            var video = document.getElementById('video');
            var closeVideo = document.getElementById('closeVideo');
            var toggleAudioMute = document.getElementById('toggleAudioMute');
            var toggleVideoMute = document.getElementById('toggleVideoMute');
            var joinSessionButton = document.getElementById('catturacam');

            var app = new Video(testichat);
            var start = function (sessionId, statusVideo = false, statusAudio = true) {
                if (app.sessionId) {
                    return;
                }

                if (sessionId.length != 6) {
                    return;
                }

                app.sessionId = sessionId;

                // Switch the UI context.
                //location.hash = app.sessionId + '&screen=' + (captureScreenCheckbox.checked ? '1' : '0');
                videoChat.style.display = 'block';

                //fm.log.info('Joining session ' + app.sessionId + '.');

                // Start the signalling client.
                app.startSignalling(function (error) {
                    if (error != null) {
                        stop();
                        return;
                    }

                    // Start the local media stream.
                    app.startLocalMedia(video, false, statusVideo, statusAudio, function (error) {
                        if (error != null) {
                            stop();
                            return;
                        }

                        // Update the UI context.
                        loading.style.display = 'none';
                        video.style.display = 'block';

                        // Enable the media controls.
                        //toggleAudioMute.removeAttribute('disabled');
                        toggleVideoMute.removeAttribute('disabled');

                        // Start the conference.
                        app.startConference(function (error) {
                            if (error != null) {
                                stop();
                                return;
                            }

                            // Enable the leave button.
                            //leaveButton.removeAttribute('disabled');

                            //fm.log.info('<span style="font-size: 1.5em;">' + app.sessionId + '</span>');
                        }, function () {
                            stop();
                        });
                    });
                });
            };

            var stop = function () {
                if (!app.sessionId) {
                    return;
                }

                // Disable the leave button.
                // leaveButton.setAttribute('disabled', 'disabled');

                //fm.log.info('Leaving session ' + app.sessionId + '.');

                app.sessionId = '';

                $('#catturacam').removeClass('active');

                app.stopConference(function (error) {
                    if (error) {
                        fm.log.error(error);
                    }

                    // Disable the media controls.
                    //toggleAudioMute.setAttribute('disabled', 'disabled');
                    //toggleVideoMute.setAttribute('disabled', 'disabled');

                    // Update the UI context.
                    video.style.display = 'none';
                    loading.style.display = 'block';

                    app.stopLocalMedia(function (error) {
                        if (error) {
                            fm.log.error(error);
                        }

                        app.stopSignalling(function (error) {
                            if (error) {
                                fm.log.error(error);
                            }
                            // Switch the UI context.
                            //sessionSelector.style.display = 'block';
                            videoChat.style.display = 'none';
                            location.hash = '';
                        });
                    });
                });
            };

            // Attach DOM events.
            fm.util.observe(joinSessionButton, 'click', function (evt) {
                stanza = iii_script.roomid;
                var statusAudio;

                if ($(this).hasClass('active')) {
                    videoChat.style.display = 'none';
                    $(this).removeClass('active');
                    stop();
                } else {
                    videoChat.style.display = 'block';
                    $(this).addClass('active');
                    $(".menu-tray").show("slide", { direction: "right" }, "slow");
                    if ($('#toggleAudioMute').hasClass('active'))
                        statusAudio = true;
                    else
                        statusAudio = false;

                    if ($('#toggleVideoMute').hasClass('active'))
                        statusVideo = true;
                    else
                        statusVideo = false;

                    start(stanza, statusVideo, statusAudio);
                }
            });

            fm.util.observe(closeVideo, 'click', function (evt) {
                videoChat.style.display = 'none';
                $('#catturacam').removeClass('active');
                stop();
            });

            fm.util.observe(window, 'unload', function () {
                stop();
            });

            // function webcame
            var tooglevideomute = 0;
            fm.util.observe(toggleVideoMute, 'click', function (evt) {
                stanza = iii_script.roomid;
                tooglevideomute++;
                if ($(this).hasClass('active')) {
                    var muted = app.toggleVideoMute();
                    $(this).children().attr('src', plugin_url + '/images/notepad/notepad/Video_OFF.png');
                    $(this).removeClass('active');
                    videoChat.style.display = 'none';
                    $('#catturacam').removeClass('active');
                } else {
                    $(this).children().attr('src', plugin_url + '/images/notepad/notepad/Video_ON.png');
                    $(this).addClass('active');
                    //  //////
                    if ($('#toggleVideoMute').hasClass('active')) {
                        statusVideo = true;
                        start(stanza, statusVideo, true);
                    } else
                        statusVideo = false;


                }

            });
        }

        addEventListener("load", () => {
            function startPosition(e) {
                painting = true;
                draw(e);
            }

            function finishedPosition() {

                painting = false;
                context.beginPath();
            }

            function draw(e) {

                if (!painting) return;
                context.lineWidth = 1;
                // context.strokeStyle = "red";
                context.lineCap = "round";
                context.lineTo(e.clientX, e.clientY);
                context.stroke();
            }
        });

        const selected = document.querySelector(".selected");
        const optionsContainer = document.querySelector(".options-container");

        const optionList = document.querySelectorAll(".option");

        const optionNew = document.querySelector("#newhihi");

        const optionOpen = document.querySelector("#openhihi");

        const optionSave = document.querySelector("#savehihi");

        const optionPre = document.querySelector("#p");

        selected.addEventListener("click", () => {
            optionsContainer.classList.toggle("active");
        });

        optionList.forEach(o => {
            o.addEventListener("click", () => {
                optionsContainer.classList.remove("active");
            });
        });

        optionNew.addEventListener("click", () => {

        });

        optionOpen.addEventListener("click", () => {
            navigator.getMedia({ video: true }, function () {
                alert('Camera Working');
            }, function () {
                alert('Camera don"t work');
            });
        });

        optionSave.addEventListener("click", () => {
            navigator.getMedia({ audio: true }, function () {
                alert('Micro Working');
            }, function () {
                alert('Micro don"t work');
            });
        });

        optionPre.addEventListener("click", () => {
            $('.notepad-sheet-search').removeClass('hidden').addClass('active');

        });
        $('.sample-close').on('click', function () {
            WS.ClearSimpleData();
        });

        // addEventListener('mouseup', function (e) {
        //     if (event.target != selected) {
        //         optionsContainer.classList.remove("active");
        //         isLoadDataLocal = false;
        //         if (!isLoadDataLocal) {
        //             setTimeout(() => {
        //                 let layer_num = $('#layers-body .active').attr('data-cnt');
        //                 emitEvent(layer_num);
        //             }, 300);
        //         }
        //     }
        // });

        $('input[type="file"]').attr('title', webkitURL ? ' ' : '');

        let socket = io(url);
        fabric.Object.prototype.objectCaching = false;
        console.log('canvas load');
        let canvas = new fabric.Canvas('canvas_draw');
        let line, triangle, origX, origY, isFreeDrawing = false;
        let isRectActive = false, isCircleActive = false, isArrowActive = false, activeColor = '#000000';
        let isLoadedFromJson = false;



        //init variables
        let div = $("#panel");
        let hw = $('#wrapper');

        //width and height of canvas's wrapper
        let w, h;
        w = hw.width();
        h = hw.height();
        //set w & h for canvas
        canvas.setHeight(h);
        canvas.setWidth(w);

        function initCanvas(canvas) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                blur: 0,
                offsetX: 0,
                offsetY: 0,
                affectStroke: true,
                color: '#ffffff',
            });
            canvas.freeDrawingBrush.color = activeColor;
            canvas.freeDrawingBrush.width = 1;
            canvas.isDrawingMode = false;

            return canvas;
        }

        function setBrush(options) {
            if (options.width !== undefined) {
                canvas.freeDrawingBrush.width = parseInt(options.width, 10);
            }

            if (options.color !== undefined) {
                canvas.freeDrawingBrush.color = options.color;
            }
        }

        function setCanvasSelectableStatus(val) {
            canvas.forEachObject(function (obj) {
                obj.lockMovementX = !val;
                obj.lockMovementY = !val;
                obj.hasControls = val;
                obj.hasBorders = val;
                obj.selectable = val;
            });
            canvas.renderAll();
        }

        function setFreeDrawingMode(val) {
            isFreeDrawing = val;
            disableShapeMode();
        }

        function removeCanvasEvents() {
            // canvas.off('mouse:down');
            // canvas.off('mouse:move');
            // canvas.off('mouse:up');
            // canvas.off('object:moving');
        }

        function enableShapeMode() {
            removeCanvasEvents();
            isFreeDrawing = canvas.isDrawingMode;
            canvas.isDrawingMode = false;
            canvas.selection = false;
            setCanvasSelectableStatus(false);
        }

        function disableShapeMode() {
            removeCanvasEvents();
            canvas.isDrawingMode = isFreeDrawing;
            if (isFreeDrawing) {
                $("#drwToggleDrawMode").addClass('active');
            }
            canvas.selection = true;
            isArrowActive = isRectActive = isCircleActive = false;
            setCanvasSelectableStatus(true);
        }

        function getTextForObject(obj, isText) {
            console.log(obj.top, obj.left);
            var text = username;
            var fontSize = 10;
            var text = new fabric.Text(text, { angle: 0, fontSize: fontSize, top: obj.top - 10, left: obj.left - 10, fill: getColor() });
            var alltogetherObj;
            if (isText) {
                var objs = [obj, text];
                alltogetherObj = new fabric.Group(objs, {
                    originX: 'center',
                    originY: 'center'
                });
            } else {
                obj.addWithUpdate(text);
                alltogetherObj = obj;
            }
            canvas.add(alltogetherObj).setActiveObject(alltogetherObj);

            isLoadDataLocal = false;
            let layer_num = $('#layers-body .active').attr('data-cnt');
            emitEvent(layer_num);
        }

        function deleteObjects() {
            let activeGroup = canvas.getActiveObjects();

            if (activeGroup) {
                canvas.discardActiveObject();
                activeGroup.forEach(function (object) {
                    let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                    deleteObjInPool(object.objectID, pool_data, layer_num);
                    socket.emit('deleteObject', {
                        objectID: object.objectID,
                        layer: layer_num
                    });
                    canvas.getObjects().forEach(item => {
                        if (item.objectID == object.objectID) {
                            canvas.remove(item);
                        }
                    })
                });
            }
        }

        function textMode() {
            var textbox = new fabric.Textbox('Init Text', {
                left: 50,
                top: 50,
                width: 200,
                fontSize: 10,
                fontFamily: 'Times New Roman'
            });

            getTextForObject(textbox, true);
        }

        async function createLatex(e, newText = 'Latex') {
            // let newText = "Latex";
            var svg = latexToImg(newText);
            console.log(svg)
            fabric.Image.fromURL(svg, function (img) {
                var text = username;
                var fontSize = 10;
                var text = new fabric.Text(text, { angle: 0, fontSize: fontSize, top: img.top - 10, left: img.left - 10, fill: getColor() });
                var latex = new fabric.Textbox(newText, { angle: 0, opacity: 0, fontSize: 12, fontFamily: 'Times New Roman' });
                var objs = [img, text, latex];
                var alltogetherObj = new fabric.Group(objs, {
                    originX: 'center',
                    originY: 'center'
                });
                canvas.add(alltogetherObj).setActiveObject(alltogetherObj);
                isLoadDataLocal = false;
                let layer_num = $('#layers-body .active').attr('data-cnt');
                emitEvent(layer_num);
            });
        }

        let listOfSymbol = [
            {
                id: 1,
                latex: "\\omega",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\omega"),
            },

            {
                id: 2,
                latex: "\\Omega",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\Omega"),
            },

            {
                id: 3,
                latex: "\\\Phi",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\\Phi"),
            },

            {
                id: 4,
                latex: "\\Theta",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\Theta"),
            },

            {
                id: 5,
                latex: "\\Lambda",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\Lambda"),
            },

            {
                id: 6,
                latex: "\\Xi",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\Xi"),
            },

            {
                id: 7,
                latex: "\\Pi",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\Pi"),
            },

            {
                id: 8,
                latex: "\\pi",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\pi"),
            },

            {
                id: 9,
                latex: "\\infty",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\infty "),
            },

            {
                id: 10,
                latex: "+\\infty",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("+\\infty"),
            },

            {
                id: 11,
                latex: "-\\infty ",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("-\\infty"),
            },

            {
                id: 12,
                latex: "a^b",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("a^b"),
            },

            {
                id: 13,
                latex: "\\frac{a}{b}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\frac{a}{b}"),
            },

            {
                id: 14,
                latex: "\\sum_{i=0}^{n}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\sum_{i=0}^{n}"),
            },

            {
                id: 15,
                latex: "\\sqrt[n]{a}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\sqrt[n]{a}"),
            },

            {
                id: 16,
                latex: "\\int_{a}^{b} x dx",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\int_{a}^{b} x dx"),
            },

            {
                id: 17,
                latex: "\\sigma",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\sigma"),
            },

            {
                id: 18,
                latex: "\\vec{a}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\vec{a}"),
            },

            {
                id: 19,
                latex: "\\overline{M}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\overline{M}"),
            },


            {
                id: 20,
                latex: "\\begin{cases} a+b=c \\\\ x+y=z \\end{cases}",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\begin{cases} a+b=c \\\\ x+y=z \\end{cases}"),
            },


            {
                id: 21,
                latex: "\\Vert{x}\\Vert",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\Vert{x}\\Vert"),
            },


            {
                id: 22,
                latex: "\\vert{x}\\vert",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\vert{x}\\vert"),
            },

            {
                id: 23,
                latex: "\\alpha",
                group: 'physics',
                type: "symbol",
                svgpath: latexToImg("\\alpha"),
            },


            {
                id: 24,
                latex: "\\le",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\le"),
            },

            {
                id: 25,
                latex: "\\ge",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\ge"),
            },

            {
                id: 26,
                latex: "\\ll",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\ll"),
            },

            {
                id: 27,
                latex: "\\gg",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\gg"),
            },


            {
                id: 28,
                latex: "\\sim",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\sim"),
            },

            {
                id: 29,
                latex: "\\simeq",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\simeq"),
            },


            {
                id: 30,
                latex: "\\approx",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\approx"),
            },

            {
                id: 31,
                latex: "\\pm",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\pm"),
            },

            {
                id: 32,
                latex: "\\cdot",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\cdot"),
            },

            {
                id: 33,
                latex: "\\in",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\in"),
            },

            {
                id: 34,
                latex: "\\notin",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\notin"),
            },

            {
                id: 35,
                latex: "\\forall",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\forall"),
            },

            {
                id: 36,
                latex: "\\exists",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\exists"),
            },

            {
                id: 37,
                latex: "\\nexists",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\nexists"),
            },

            {
                id: 38,
                latex: "\\varnothing",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\varnothing"),
            },

            {
                id: 39,
                latex: "\\perp",
                group: 'math',
                type: "symbol",
                svgpath: latexToImg("\\perp"),
            },
            {
                id: 40,
                latex: "\\ce{O - H}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{O-H}"),
            },

            {
                id: 41,
                latex: "\\ce{O = H}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{O = H}"),
            },

            {
                id: 42,
                latex: "\\ce{O # H}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{O = H}"),
            },

            {
                id: 43,
                latex: "\\ce{CO3^{2-}}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{CO3^{2-}}"),
            },

            {
                id: 43,
                latex: "\\ce{H^{+}}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{H^{+}}"),
            },

            {
                id: 44,
                latex: "\\ce{ ^{227}_{90}Th+ }",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{ ^{227}_{90}Th+ }"),
            },

            {
                id: 45,
                latex: "\\ce{BaSO4 v}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{BaSO4 v}"),
            },

            {
                id: 46,
                latex: "\\ce{NO3 ^}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{NO3}"),
            },

            {
                id: 47,
                latex: "\\ce{<=>}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{<=>}"),
            },

            {
                id: 48,
                latex: "\\ce{->[{above}][{below}]}",
                group: 'chemistry',
                type: "symbol",
                svgpath: latexToImg("\{->}"),
            },
        ];






        let math = document.getElementById('math-symbol');
        let physics = document.getElementById('physisc-symbol');
        let chemistry = document.getElementById('chemistry-symbol');
        let biology = document.getElementById('biology-symbol');

        for (let i = 0; i < listOfSymbol.length; i++) {
            let p = document.createElement("p");

            p.className = 'tooltip-wrap';
            let img = document.createElement("img");
            img.src = listOfSymbol[i].svgpath;
            p.appendChild(img)
            p.onclick = function (e) { createLatex(e, listOfSymbol[i].latex) };
            if (listOfSymbol[i].group == "math") {
                math.appendChild(p)
            }
            else if (listOfSymbol[i].group == "physics") {
                physics.appendChild(p);
            }

            else if (listOfSymbol[i].group == "chemistry") {
                chemistry.appendChild(p);
            }

        }

        // Icon svg
        let iconSVG = document.getElementById("iconSVG");
        let listIconSVG = [
            'coffee_brand_design_elements_beans_cup_machine_icons_6835690.jpg',
            'construction_design_elements_machines_signboard_sketch_flat_classic_6852449.jpg',
            'construction_work_design_elements_heavy_machines_sketch_6852448.jpg',
            'farm_design_elements_machine_windmill_sty_warehouse_icons_6839790.jpg',
            'future_life_painting_children_modern_machine_cartoon_design_6840694.jpg',
            'heavy_construction_machines_icons_isolated_with_yellow_color_6825965.jpg',
            'sewing_work_design_elements_colored_machine_tools_icons_6839755.jpg',
            'slot_machine_icons_310830.jpg',
            'tailor_design_elements_sewing_machine_ruler_mannequin_icons_6839643.jpg',
            'vintage_painting_flora_bird_sewing_machine_sketch_6843416.jpg'
        ];

        for (let i = 0; i < listIconSVG.length; i++) {
            let p = document.createElement("p");

            p.className = 'tooltip-wrap';
            let img = document.createElement("img");
            img.src = `/images/notepad/notepad/svg/${listIconSVG[i]}`;
            p.appendChild(img)
            p.onclick = function (e) { createIcon(img) };
            iconSVG.appendChild(p);
        }

        function createIcon(url) {
            let icon = new fabric.Image(url, {
                top: 100,
                left: 100
            })
            canvas.add(icon);
            let layer_num = $('#layers-body .active').attr('data-cnt');
            isLoadDataLocal = false;
            emitEvent(layer_num);
        }




        // create a rectangle object
        function imageMode(e) {
            var img = $('<img>', {
                src: e.target.result,
            });
            // var width = img.width;
            console.log(img.width);
            // if(img.width > 500){
            //     width = 500
            // }
            fabric.Image.fromURL(e.target.result, function (myImg) {
                //i create an extra var for to change some image properties
                var img1 = myImg.set({ left: 0, top: 0 });

                getTextForObject(img1, true);


            });
        }

        function createTextBox(obj) {
            var textbox = new fabric.Textbox('Init Text', {
                fontSize: 12,
                fontFamily: 'Time New Roman',
                originX: 'center',
                originY: 'center',
            });

            let group = new fabric.Group([obj, textbox], {
                left: 100,
                top: 100,
            });

            return group;
        }

        //Fabric cho đối tượng hình học (Geometric)
        function iconCricle(e) {
            //Vẽ hình tròn
            var circle = new fabric.Circle({
                radius: 50,
                stroke: 'black',
                fill: 'white',
                originX: 'center',
                originY: 'center',
            });

            getTextForObject(createTextBox(circle));
        }


        // Vẽ hình tam giác
        function iconTriange(e) {
            var triangle = new fabric.Triangle({
                width: 100,
                height: 100,
                stroke: 'black',
                fill: 'white',
                originX: 'center',
                originY: 'center',

            });
            getTextForObject(createTextBox(triangle));
        }

        //Vẽ hình elip
        function iconElipse(e) {
            var elipse = new fabric.Ellipse({
                rx: 80,
                ry: 40,
                stroke: 'black',
                fill: 'white',
                originX: 'center',
                originY: 'center',
            });

            getTextForObject(createTextBox(elipse));
        }

        // Vẽ hình chữ nhật
        function iconRect(e) {
            var rect = new fabric.Rect({
                width: 100,
                height: 100,
                stroke: 'black',
                fill: 'white',
                originX: 'center',
                originY: 'center',
            });

            getTextForObject(createTextBox(rect));
        }

        //Vẽ hình học
        function icongeometric(e) {

            // var rect = new fabric.Path( 'M 0 0 L 200 100 L 170 200 z');
            // //“M” vẫn là viết tắt của lệnh “di chuyển”
            // //“L” là viết tắt của “line”
            // //“z” yêu cầu bút vẽ đóng đường
            // canvas.add(rect.set({width: 100, height: 150, fill: 'blue', left: 500, top: 200 }));

            var rect = new Fabric.Path('M 121.32,0 L 44.58,0 C 36,67,0,29.5,3.22,24.31,8.41 z', {
                originX: 'center',
                originY: 'center',
            });

            getTextForObject(createTextBox(rect));

        }

        // Vẽ hình lục giác
        function iconPolygon(e) {
            var poly = new fabric.Polygon([
                // { x: 20, y: 10 },
                // { x: 40, y: 10 },
                // { x: 50, y: 40 },
                // { x: 40, y: 70 },
                // { x: 20, y: 70 },
                // { x: 10, y: 40 },
                // { x: 20, y: 10 }
                { x: 850, y: 75 },
                { x: 958, y: 137.5 },
                { x: 958, y: 262.5 },
                { x: 850, y: 325 },
                { x: 742, y: 262.5 },
                { x: 742, y: 137.5 },
            ], {
                top: 0,
                left: 0,
                stroke: getColor(),
                fill: 'white',
                scaleX: 0.5,
                scaleY: 0.5,
                left: -55,
                top: -60
            });

            getTextForObject(createTextBox(poly));
        }
        //Right Arrow
        function iconArrowRightArrow(e) {
            var poly = new fabric.Polyline([
                { x: 20, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 10 },
                { x: 80, y: 30 },
                { x: 60, y: 50 },
                { x: 60, y: 40 },
                { x: 20, y: 40 },
                { x: 20, y: 20 },
            ], {
                width: 300,
                height: 200,
                stroke: getColor(),
                fill: 'white',
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -50
            });
            getTextForObject(createTextBox(poly));
        }

        // Left arrow
        function iconTurnLeftArrow(e) {
            var poly = new fabric.Polyline([
                { x: 60, y: 30 },
                { x: 20, y: 30 },
                { x: 20, y: 20 },
                { x: 0, y: 40 },
                { x: 20, y: 60 },
                { x: 20, y: 50 },
                { x: 60, y: 50 },
                { x: 60, y: 30 },
            ], {
                // width: 150,
                // height: 200,
                stroke: getColor(),
                fill: 'white',
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -60
            });

            getTextForObject(createTextBox(poly));
        }


        // Right left arrow
        function iconTwoWayArrow(e) {
            var poly = new fabric.Polyline([
                { x: 20, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 10 },
                { x: 80, y: 30 },
                { x: 60, y: 50 },
                { x: 60, y: 40 },
                { x: 20, y: 40 },
                { x: 20, y: 50 },
                { x: 0, y: 30 },
                { x: 20, y: 10 },
                { x: 20, y: 20 }
            ], {
                stroke: getColor(),
                fill: 'white',
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -80
            });
            getTextForObject(createTextBox(poly));
        }

        // Hình ngôi sao
        function iconStar(e) {
            var poly = new fabric.Path(
                "M 251 30.5725 C 239.505 33.871 233.143 56.2086 228.247 66 L 192.247 139 C 187.613 148.267 183.524 162.173 176.363 169.682 C 170.726 175.592 151.9 174.914 144 176 L 57 188.729 C 46.5089 190.241 22.8477 189.409 18.0093 201.015 C 12.21 214.927 32.8242 228.824 41 237 L 95 289.83 C 104.569 298.489 120.214 309.405 126.11 321 C 130.001 328.651 123.466 345.797 122.081 354 L 107 442 C 105.042 452.114 99.142 469.478 105.228 478.895 C 109.142 484.95 116.903 484.628 123 482.64 C 137.319 477.973 151.822 468.444 165 461.139 L 232 425.756 C 238.285 422.561 249.81 413.279 257 415.071 C 268.469 417.93 280.613 427.074 291 432.691 L 359 468.258 C 369.618 473.739 386.314 487.437 398.985 483.347 C 413.495 478.664 405.025 453.214 403.25 443 L 388.75 358 C 387.045 348.184 380.847 332.006 383.194 322.285 C 385.381 313.225 403.044 300.467 410 294.424 L 469 237 C 477.267 228.733 493.411 218.004 492.941 205 C 492.398 189.944 465.753 190.478 455 189 L 369 176.421 C 359.569 175.025 343.388 175.914 335.213 170.976 C 328.335 166.822 323.703 151.166 320.576 144 L 289.753 82 L 268.532 39 C 264.58 32.6459 258.751 28.3485 251 30.5725 z"
                ,
                // var poly = new fabric.Polygon([
                //     {x:350,y:75},
                //     {x:380,y:160},
                //     {x:470,y:160},
                //     {x:400,y:215},
                //     {x:423,y:301},
                //     {x:350,y:250},
                //     {x:277,y:301},
                //     {x:303,y:215},
                //     {x:231,y:161},
                //     {x:321,y:161}
                // ], 
                {
                    stroke: getColor(),
                    strokeWidth: 3,
                    fill: 'white',
                    scaleX: 0.2,
                    scaleY: 0.2,
                    top: -50,
                    left: -50
                });
            getTextForObject(createTextBox(poly));
        }

        // Vẽ hình tứ giác
        function iconPolygen(e) {
            var poly = new fabric.Polygon([
                { x: 20, y: 10 },
                { x: 70, y: 10 },
                { x: 60, y: 50 },
                { x: 10, y: 50 },
                { x: 20, y: 10 }
            ], {
                scaleX: 2,
                scaleY: 2,
                stroke: getColor(), fill: 'white',
                top: -40,
                left: -60
            });
            getTextForObject(createTextBox(poly));
        }

        //vẽ hướng
        function iconArrowTo(e) {
            var arrow = new fabric.Polygon([
                { x: 10, y: 20 },
                { x: 20, y: 40 },
                { x: 10, y: 60 },
                { x: 40, y: 60 },


                { x: 50, y: 40 },
                { x: 40, y: 20 },
                { x: 10, y: 20 },


            ], {
                stroke: getColor(), fill: 'white',
                scaleX: 1.5,
                scaleY: 1.5,
                left: -30,
                top: -30

            });
            getTextForObject(createTextBox(arrow));
        }

        function iconTrapezoid(e) {
            var traperzoid = new fabric.Polygon([
                { x: -100, y: -50 },
                { x: 100, y: -50 },
                { x: 150, y: 50 },
                { x: -150, y: 50 }
            ], {
                stroke: getColor(), fill: 'white',
                scaleX: 0.5, scaleY: 0.5,
                top: -25,
                left: -75
            });
            getTextForObject(createTextBox(traperzoid));
        }

        function iconHeart(e) {
            var arrow = new fabric.Path(
                'M10,6 Q10,0 15,0 T20,6 Q20,10 15,14 T10,20 Q10,18 5,14 T0,6 Q0,0 5,0 T10,6 Z',
                {
                    stroke: getColor(), fill: 'white',
                    scaleX: 4.5,
                    scaleY: 4.5,
                    strokeWidth: 0.2,
                    top: -45,
                    left: -45
                });
            getTextForObject(createTextBox(arrow));
        }


        var name = $('#display_name ').attr('value');

        //var name = Math.round($.now() * Math.random());
        function emitEvent(layer_num) {
            var room = $('#ScheduleID').val();
            if (!isLoadDataLocal) {
                let json = canvas.getObjects();
                canvas.item(json.length - 1).clone(async (lastObject) => {
                    if (lastObject) {
                        lastObject.stroke = getColor();
                        lastObject.strokeWidth = getPencil();
                        lastObject.objectID = "";
                        console.log(lastObject)
                        let data = {
                            w: w,
                            h: h,
                            'drawing': drawing,
                            'color': getColor(),
                            'id': id,
                            'userID': userID,
                            'objectID': randomID(),
                            'username': username,
                            'spessremo': getPencil(),
                            'room': room,
                            'layer': layer_num - 3,
                            data: lastObject
                        };
                        // console.log(data);
                        //console.log(data);
                        pool_data.push(data);
                        socket.emit('drawing', data);
                        canvas.item(json.length - 1).set({
                            objectID: data.objectID,
                            userID: userID
                        })
                        if (canvas.item(json.length - 1)._objects && canvas.item(json.length - 1)._objects.length > 2 && canvas.item(json.length - 1)._objects[0].type != 'image') {
                            addPort(canvas.item(json.length - 1), canvas, data.objectID);
                        }
                        canvas.requestRenderAll();
                    }
                })
            }
        }

        fabric.Textbox.prototype.onKeyDown = (function (onKeyDown) {
            return function (e) {
                if (e.keyCode == 16) {
                    shift = true;
                    return;
                } else if (e.keyCode == 13 && !shift)
                    canvas.discardActiveObject();
                onKeyDown.call(this, e);
            }
        })(fabric.Textbox.prototype.onKeyDown)

        fabric.Textbox.prototype.onKeyUp = (function (onKeyUp) {
            return function (e) {
                if (e.keyCode == 16) {
                    shift = false;
                    return;
                }
                onKeyUp.call(this, e);
            }
        })(fabric.Textbox.prototype.onKeyUp)

        canvas.on({
            'object:selected': onObjectSelected,
            'selection:cleared': onSelectionCleared
        });

        function onObjectSelected(e) {
            var activeObject = e.target;

            if (activeObject.name == "p0" || activeObject.name == "p2") {
                activeObject.line2.animate('opacity', '1', {
                    duration: 200,
                    onChange: canvas.renderAll.bind(canvas),
                });
                activeObject.line2.selectable = true;
            }
        }

        function onSelectionCleared(e) {
            var activeObject = e.target;
            if (activeObject) {
                if (activeObject.name == "p0" || activeObject.name == "p2") {
                    activeObject.line2.animate('opacity', '0', {
                        duration: 200,
                        onChange: canvas.renderAll.bind(canvas),
                    });
                    activeObject.line2.selectable = false;
                }
                else if (activeObject.name == "p1") {
                    activeObject.animate('opacity', '0', {
                        duration: 200,
                        onChange: canvas.renderAll.bind(canvas),
                    });
                    activeObject.selectable = false;
                }
            }
        }

        canvas.on('text:changed', function (opt) {
            var t1 = opt.target;
            if (t1.isText) {
                if (t1.text.match(/[\r\n]/)) return;
            }
            if (t1.isText) {
                while (t1._textLines.length > 1) {
                    t1.set({
                        width: t1.getScaledWidth() + 1
                    })
                }
            }
        });

        //Canvas event with mouse
        function changeCoordinateConnectLine(obj) {
            if (obj.name == "p1") {
                if (obj.line2) {
                    obj.line2.path[1][1] = obj.left;
                    obj.line2.path[1][2] = obj.top;
                }
            } else {
                let connectors = canvas.getObjects().filter(value =>
                    value.name == "lineConnect" &&
                    (
                        value.idObject1 === obj.objectID ||
                        value.idObject2 === obj.objectID
                    )
                )
                let ports = canvas.getObjects().filter(value =>
                    value.portID == obj.objectID
                )
                if (connectors) {
                    for (let i = 0; i < connectors.length; i++) {
                        if (connectors[i].idObject1 === obj.objectID) {
                            obj.__corner = connectors[i].port1;
                            let targetPort = findTargetPort(obj);
                            connectors[i].path[0][1] = targetPort.x1;
                            connectors[i].path[0][2] = targetPort.y1;
                            movelinename(canvas, obj.objectID, targetPort.y1, targetPort.x1, connectors[i].port1)
                        }
                        else {
                            obj.__corner = connectors[i].port2
                            let portCenterPoint = getPortCenterPoint(obj, obj.__corner);
                            connectors[i].path[1][3] = portCenterPoint.x2;
                            connectors[i].path[1][4] = portCenterPoint.y2;
                            movelinename(canvas, obj.objectID, portCenterPoint.y2, portCenterPoint.x2, connectors[i].port2)
                        }
                    }
                }
                if (ports) {
                    for (let i = 0; i < ports.length; i++) {
                        let targetPort = findTargetPort(obj, ports[i].port);
                        ports[i].set({
                            top: targetPort.y1,
                            left: targetPort.x1
                        })
                        ports[i].bringToFront();
                    }
                }
            }
        }

        function getPortCenterPoint(object, port) {
            var x1 = 0;
            var y1 = 0;

            switch (port) {

                case 'mt':
                    x1 = object.left + (object.width / 2);
                    y1 = object.top;
                    break;

                case 'mr':
                    x1 = object.left + object.width;
                    y1 = object.top + (object.height / 2);
                    break;

                case 'mb':
                    x1 = object.left + (object.width / 2);
                    y1 = object.top + object.height;
                    break;
                case 'ml':
                    x1 = object.left;
                    y1 = object.top + (object.height / 2);
                    break;

                default:
                    // $log.error('getPortCenterPoint() - port === undefined');
                    break;
            }

            return {
                'x1': x1, 'y1': y1,
                'x2': x1, 'y2': y1
            }
        }

        let isMouseDown = false;
        let connectorLineFromPort = null;
        let connectorLine = null;
        let selectedObject = null;
        let corner = null;
        let objectMiro = null;
        function mouseUp(obj) {
            let object = obj.target;
            objectMiro = null;
            try {

                obj.target.addWithUpdate();
                if (object.item(0).type === 'textbox') {
                    if (object.clicked) {
                        $('#edit-form').css({ "visibility": "hidden" });

                        let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                        let obj = object.item(0);
                        let textForEditing = new fabric.Textbox(obj.text, {
                            originX: 'center',
                            originY: 'center',

                            textAlign: obj.textAlign,
                            fontSize: obj.fontSize,
                            width: obj.width,
                            fontFamily: obj.fontFamily,

                            left: object.left,
                            top: object.top,
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY,
                            isText: true,
                        })

                        // hide group inside text
                        obj.visible = false;
                        // note important, text cannot be hidden without this
                        object.addWithUpdate();

                        textForEditing.visible = true;
                        // do not give controls, do not allow move/resize/rotation on this 
                        textForEditing.hasConstrols = false;


                        // now add this temporary obj to canvas
                        canvas.add(textForEditing);
                        canvas.setActiveObject(textForEditing);
                        // make the cursor showing
                        textForEditing.enterEditing();
                        textForEditing.selectAll();


                        // editing:exited means you click outside of the textForEditing
                        textForEditing.on('editing:exited', () => {
                            let newVal = textForEditing.text;
                            let oldVal = obj.text;

                            // then we check if text is changed
                            obj.set({
                                text: newVal,
                                visible: true,
                                width: textForEditing.width,
                                fontSize: textForEditing.fontSize,
                                fontFamily: textForEditing.fontFamily
                            })

                            // comment before, you must call this
                            object.addWithUpdate();

                            // we do not need textForEditing anymore
                            textForEditing.visible = false;
                            canvas.remove(textForEditing);
                            updateLocal(pool_data, object.objectID, object, socket);
                            // optional, buf for better user experience
                            canvas.setActiveObject(object);
                        })
                        object.clicked = false;
                    }
                    else {
                        let top = object.top;
                        let left = object.left;

                        top = top - Math.abs(unit_y) - 100;
                        left = left - Math.abs(unit_x) - 200;
                        $('#edit-form').css({ "display": "block", "top": top + "px", "left": left + "px", "visibility": "visible" });
                        $('#align').css({ 'display': "none" });
                        $('#back-color-button').css({ 'display': "none" })
                        objectMiro = object;
                        object.clicked = true;
                    }
                } else if (object.item(1).type === 'textbox') {
                    if (object.clicked) {

                        $('#edit-form').css({ "visibility": "hidden" });

                        let obj = object.item(1);

                        let textForEditing = new fabric.Textbox(obj.text, {
                            top: object.top + object.height / 2 - 10,
                            left: object.left + (10 * obj.scaleX),
                            fontSize: obj.fontSize,
                            fontFamily: obj.fontFamily,
                            width: (object.width / obj.scaleX) - 12,
                            textAlign: "center",
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY
                        })

                        // hide group inside text
                        obj.visible = false;
                        // note important, text cannot be hidden without this
                        object.addWithUpdate();

                        textForEditing.visible = true;
                        // do not give controls, do not allow move/resize/rotation on this 
                        textForEditing.hasConstrols = false;


                        // now add this temporary obj to canvas
                        canvas.add(textForEditing);
                        canvas.setActiveObject(textForEditing);
                        // make the cursor showing
                        textForEditing.enterEditing();
                        textForEditing.selectAll();


                        // editing:exited means you click outside of the textForEditing
                        textForEditing.on('editing:exited', () => {
                            let newVal = textForEditing.text;
                            let oldVal = obj.text;

                            // then we check if text is changed
                            obj.set({
                                text: newVal,
                                visible: true,
                                width: (object.width / obj.scaleX) - 12,
                                // left: textForEditing.left,

                                fontSize: textForEditing.fontSize,
                                fontFamily: textForEditing.fontFamily,
                                textAlign: "center",
                            })

                            object.set({
                                // left: object.left,
                                width: object.width
                            })
                            // comment before, you must call this
                            object.addWithUpdate();

                            // we do not need textForEditing anymore
                            textForEditing.visible = false;
                            canvas.remove(textForEditing);
                            updateLocal(pool_data, object.objectID, object, socket);

                            // optional, buf for better user experience
                            canvas.setActiveObject(object);
                        })
                        object.clicked = false;
                    } else {
                        let top = object.top;
                        let left = object.left;
                        top = top + Math.abs(unit_y) - 50;
                        left = left + Math.abs(unit_x) - 220;
                        $('#edit-form').css({ "display": "block", "top": top + "px", "left": left + "px", "visibility": "visible" });
                        $('#align').css({ 'display': "block" });
                        $('#back-color-button').css({ 'display': "block" })
                        objectMiro = object;
                        object.clicked = true;
                    }
                }

                else if (object.item(0).type === 'image' && object._objects.length === 3) {
                    if (object.item(0).clicked) {
                        let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                        let obj = object.item(2);

                        let latex = object.item(0);
                        let textForEditing = new fabric.Textbox(obj.text, {
                            originX: 'center',
                            originY: 'center',

                            textAlign: obj.textAlign,
                            fontSize: 13,
                            width: obj.width,

                            left: object.left,
                            top: object.top,
                            isText: true
                        })

                        // hide group inside text
                        latex.visible = false;
                        obj.visible = false;
                        // note important, text cannot be hidden without this
                        object.addWithUpdate();

                        textForEditing.visible = true;
                        // do not give controls, do not allow move/resize/rotation on this 
                        textForEditing.hasConstrols = false;


                        // now add this temporary obj to canvas
                        canvas.add(textForEditing);
                        canvas.setActiveObject(textForEditing);
                        // make the cursor showing
                        textForEditing.enterEditing();
                        textForEditing.selectAll();



                        // editing:exited means you click outside of the textForEditing
                        textForEditing.on('editing:exited', () => {
                            let newVal = textForEditing.text;
                            let oldVal = obj.text;

                            // then we check if text is changed
                            if (newVal !== oldVal) {
                                obj.set({
                                    text: newVal,
                                    visible: true,
                                    width: textForEditing.width,
                                })
                                latex.set({
                                    visible: true,
                                })


                                // comment before, you must call this
                                object.addWithUpdate();

                                // we do not need textForEditing anymore
                                textForEditing.visible = false;
                                canvas.remove(textForEditing);
                                var index = pool_data.findIndex(item => item.objectID == object.objectID && item.layer == layer_num);
                                // console.log(index);
                                if (index >= 0) {
                                    var svg = latexToImg(newVal);
                                    latex.setSrc(svg, () => {
                                        pool_data[index].data = object;
                                        socket.emit('updated', {
                                            objectID: pool_data[index].objectID,
                                            dataChange: object,
                                            layer: layer_num,
                                        });
                                        canvas.renderAll();
                                    })

                                }
                                console.log(object.item(0))


                                // optional, buf for better user experience
                                canvas.setActiveObject(object);
                            }
                            else {

                                textForEditing.visible = false;
                                object.item(2).set({
                                    visible: false,
                                    opacity: 0,
                                });
                                latex.set({
                                    visible: true,
                                })
                            }

                        })
                        object.item(0).clicked = false;
                    }
                    else {

                        object.item(0).clicked = true;
                    }
                } else {
                    $('#edit-form').css({ "visibility": "hidden" });
                }
            }
            catch (error) {
                $('#edit-form').css({ "visibility": "hidden" });
            }
        }

        $("#font li").click(function () {
            socket.emit('changefont', {
                font: $(this).attr('value'),
                object: objectMiro.objectID
            });
            loadAndUse($(this).attr('value'), objectMiro.objectID, canvas, pool_data, true, socket);
        })

        $("#size li").click(function () {
            let font_size = parseInt($(this).attr('value'));
            if (objectMiro._objects.length > 2) {
                objectMiro.item(1).set({
                    fontSize: font_size
                })
            } else {
                objectMiro.item(0).set({
                    fontSize: font_size
                })
            }

            document.getElementById('current-size').innerHTML = font_size + ` <span class="caret">`;

            updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);

            socket.emit("changesize", {
                size: font_size,
                object: objectMiro.objectID
            });

            canvas.requestRenderAll();
        })

        $("#back-color").on("input", function () {
            if (objectMiro._objects.length > 2) {
                objectMiro.item(0).set({
                    fill: this.value
                });
                canvas.requestRenderAll();
                updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);
            }
        });

        $("#text-color").on("input", function () {
            if (objectMiro._objects.length > 2) {
                objectMiro.item(1).set({
                    fill: this.value
                });
                objectMiro.item(0).set({
                    stroke: this.value
                });
            } else {
                objectMiro.item(0).set({
                    fill: this.value
                })
            }
            canvas.requestRenderAll();
            updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);
        });

        $('#bold').on('click', function () {

            if (objectMiro._objects.length > 2) {
                if (objectMiro.item(1).fontWeight != 'normal') {
                    objectMiro.item(1).set({
                        fontWeight: 'normal'
                    })
                }
                else {
                    objectMiro.item(1).set({
                        fontWeight: 'bold'
                    })
                }

            } else {
                if (objectMiro.item(0).fontWeight != 'normal') {
                    objectMiro.item(0).set({
                        fontWeight: 'normal'
                    })
                }
                else {
                    objectMiro.item(0).set({
                        fontWeight: 'bold'
                    })
                }
            }
            updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);
            canvas.requestRenderAll();
        })

        $('#italic').on('click', function () {

            if (objectMiro._objects.length > 2) {
                if (objectMiro.item(1).fontStyle != 'normal') {
                    objectMiro.item(1).set({
                        fontStyle: 'normal'
                    })
                }
                else {
                    objectMiro.item(1).set({
                        fontStyle: 'italic'
                    })
                }

            } else {
                if (objectMiro.item(0).fontStyle != 'normal') {
                    objectMiro.item(0).set({
                        fontStyle: 'normal'
                    })
                }
                else {
                    objectMiro.item(0).set({
                        fontStyle: 'italic'
                    })
                }
            }
            updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);
            canvas.requestRenderAll();
        })

        $('#underline').on('click', function () {

            if (objectMiro._objects.length > 2) {
                if (!objectMiro.item(1).underline) {
                    objectMiro.item(1).set({
                        underline: true
                    })
                }
                else {
                    objectMiro.item(1).set({
                        underline: false
                    })
                }

            } else {
                if (!objectMiro.item(1).underline) {
                    objectMiro.item(0).set({
                        underline: true
                    })
                }
                else {
                    objectMiro.item(0).set({
                        underline: false
                    })
                }
            }
            updateLocal(pool_data, objectMiro.objectID, objectMiro, socket);
            canvas.requestRenderAll();
        })


        canvas.on('mouse:up', function (e) {

            // isMouseDown = true;
            if (e.target != null) {

                // e.target["cornerStyle"] = "rect"
                // e.target["cornerSize"] = 15

                // e.target.set("hasRotatingPoint", true)
                // e.target.set("hasBorders", true)
                // e.target.set("transparentCorners", true)
                //canvas.renderAll()

                if (e.target._objects && e.target._objects.length > 2) {
                    e.target.setControlsVisibility({
                        tl: false,
                        tr: false,
                        bl: false,
                        br: false,
                        mt: false,
                        mb: false,
                        mr: false,
                        ml: false,
                        mtr: false
                    })
                    if (findTargetPort(e.target).x1) {
                        if (selectedObject == null) {
                            console.log("ok");
                            let points = findTargetPort(e.target);
                            connectorLine = points;
                            selectedObject = e.target;
                            corner = e.target.__corner;
                            choosePort(corner, canvas, e.target.objectID);
                        } else {
                            if (selectedObject.objectID == e.target.objectID) {
                                if (corner == e.target.__corner) {
                                    let object = canvas.getObjects().filter(obj =>
                                        obj.port == corner &&
                                        obj.portID == selectedObject.objectID
                                    )
                                    if (object) {
                                        object[0].set({
                                            fill: "#B2CCFF",
                                            radius: 7
                                        })
                                    }
                                    selectedObject = null;
                                    connectorLine = null;
                                    corner = null;
                                }
                                return;
                            }
                            let portCenter = getPortCenterPoint(e.target, e.target.__corner);
                            connectorLine.x2 = portCenter.x2;
                            connectorLine.y2 = portCenter.y2;
                        }

                        let layer_num = $('#layers-body .active').attr('data-cnt') - 3;


                        if (
                            connectorLine.x1 != undefined && connectorLine.x2 !== null
                            && connectorLine.x2 != 0 && connectorLine.x1 != connectorLine.x2
                            && connectorLine.y1 != connectorLine.y2
                        ) {
                            let id = randomID();

                            var line = makeLine(canvas, connectorLine, selectedObject.objectID, e.target.objectID, corner, e.target.__corner, id, username);
                            if (selectedObject.corner) {
                                selectedObject.corner.push(corner);
                            } else {
                                selectedObject.corner = [];
                                selectedObject.corner.push(corner);
                            }
                            if (e.target.corner) {
                                e.target.corner.push(e.target.__corner);
                            } else {
                                e.target.corner = [];
                                e.target.corner.push(e.target.__corner);
                            }
                            canvas.renderAll();
                            socket.emit('connected', {
                                'idObject1': selectedObject.objectID,
                                'idObject2': e.target.objectID,
                                type: 'lineConnect',
                                objectID: id,
                                port1: corner,
                                port2: e.target.__corner,
                                connector: connectorLine,
                                lineText: username,
                                data: line,
                                'layer': layer_num
                            });


                            pool_data.push({
                                'idObject1': selectedObject.objectID,
                                'idObject2': e.target.objectID,
                                type: 'lineConnect',
                                objectID: id,
                                port1: corner,
                                port2: e.target.__corner,
                                connector: connectorLine,
                                lineText: username,
                                data: line,
                                'layer': layer_num
                            });

                            let object = canvas.getObjects().filter(obj =>
                                obj.port == corner &&
                                obj.portID == selectedObject.objectID
                            )

                            if (object) {
                                object[0].set({
                                    fill: "#B2CCFF",
                                    radius: 7
                                })
                            }

                            selectedObject = null;
                            connectorLine = null;
                            corner = null;
                        }
                    } else {
                        mouseUp(e);
                    }
                } else {
                    mouseUp(e);
                }
            } else {
                $('#edit-form').css({ "visibility": "hidden" });
            }

        })

        var isMoving = false;

        canvas.on('object:moving', function (e) {
            isMoving = true;
            isLoadDataLocal = true;
            changeCoordinateConnectLine(e.target);

            updateLocal(pool_data, e.target.objectID, {
                left: e.target.left,
                top: e.target.top,
            }, socket, true);
        });

        var isScaling = false;
        canvas.on('object:scaling', function (e) {
            isScaling = true;
            onChange(e);
        });

        let isRotating = false;
        canvas.on('object:rotating', function (e) {
            isRotating = true;

            // updateLocal(pool_data, e.target.objectID ,{
            //     angle: e.target.angle,
            // }, socket, true);

        });


        canvas.on('object:modified', function (e) {
            e.target.clicked = false;
        })

        function getVector(pointA, pointB) {
            return { x: pointA.x - pointB.x, y: pointA.y - pointB.y }
        }

        function isRightSquare(vectorA, vectorB) {
            return Math.abs(vectorA.x * vectorB.x + vectorA.y * vectorB.y) < 0.1
        }
        fabric.Object.prototype.transparentCorners = false;

        function getDistance(pointA, pointB) {
            return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
        }
        function getNearestPort(obj, pointer) {
            let objVisibility = obj.target._controlsVisibility
            let objCoords = obj.target.oCoords
            var minDistance = undefined
            var portNearest = undefined
            //console.log(objVisibility)
            //console.log(objCoords)
            for (const property in objVisibility) {
                if (objVisibility[property] === true) {
                    //console.log(property)
                    let distance = getDistance(pointer, objCoords[property])
                    //console.log(distance)
                    if (minDistance === undefined) {
                        minDistance = distance
                        portNearest = { key: property, x: objCoords[property].x, y: objCoords[property].y }
                    }
                    else if (distance < minDistance) {
                        minDistance = distance

                        portNearest = { key: property, x: objCoords[property].x, y: objCoords[property].y }

                    }
                }
            }

            return portNearest

        }

        var isHoverObj = true;
        canvas.on('mouse:over', function (obj) {
            if (obj.target !== null && obj.target._objects && obj.target._objects.length > 2 && obj.target._objects[0].type !== "image") {
                isHoverObj = true;

                obj.target.set("hasRotatingPoint", false)
                obj.target.set("hasBorders", false)
                obj.target.set("transparentCorners", false)


                if (
                    obj.target._objects[0].type === "rect" ||
                    obj.target._objects[0].type === 'circle' ||
                    obj.target._objects[0].type === 'ellipse' ||
                    obj.target._objects[0].type === 'polygon' ||
                    obj.target._objects[0].type === "path"
                ) {
                    obj.target.setControlsVisibility({
                        tl: false,
                        tr: false,
                        bl: false,
                        br: false,
                        mtr: false,
                        mb: true,
                        mt: true,
                        ml: true,
                        mr: true
                    })
                    // if(obj.target.corner){
                    //     obj.target.corner.forEach(port => {
                    //         disablePort(port, obj.target);
                    //     })
                    // }
                }
                else if (obj.target._objects[0].type === "triangle") {
                    obj.target.setControlsVisibility({
                        tl: false,
                        tr: false,
                        bl: false,
                        br: false,
                        ml: false,
                        mr: false,
                        mtr: false,
                        mb: true,
                        mt: true
                    })
                    // if(obj.target.corner){
                    //     obj.target.corner.forEach(port => {
                    //         disablePort(port, obj.target);
                    //     })
                    // }
                }

                else if (obj.target._objects[0].type === "polyline") {
                    obj.target.setControlsVisibility({
                        tl: false,
                        tr: false,
                        bl: false,
                        br: false,
                        mt: false,
                        mb: false,
                        mtr: false,
                        ml: true,
                        mr: true
                    })
                    // if(obj.target.corner){
                    //     obj.target.corner.forEach(port => {
                    //         disablePort(port, obj.target);
                    //     })
                    // }
                }
                obj.target["cornerStyle"] = "circle"
                obj.target["cornerSize"] = 15
                canvas.setActiveObject(obj.target);
                canvas.renderAll();
            }
        })


        canvas.on("mouse:out", function (obj) {

            //obj.target.item(0).set("fill", "white")
            if (obj.target !== null && obj.target._objects && obj.target._objects.length > 2 && obj.target._objects[0].type !== "image") {
                isHoverObj = false;
                obj.target["cornerStyle"] = "rect"
                obj.target["cornerSize"] = 15
                obj.target.set("active", false)

                obj.target.set("hasRotatingPoint", true)
                obj.target.set("hasBorders", true)
                obj.target.set("transparentCorners", true)
                obj.target.setControlsVisibility({
                    tl: false,
                    tr: false,
                    bl: false,
                    br: false,
                    mt: false,
                    mb: false,
                    mtr: false,
                    ml: false,
                    mr: false
                })
                canvas.discardActiveObject(obj.target);
            }
            canvas.renderAll();
        })

        canvas.on('mouse:up', function (e) {
            isMoving = false;
            isScaling = false;
            isRotating = false;

            // console.log('Event mouse:up Triggered');
        });



        canvas.on('mouse:down', function (obj) {

            if (isMoving) {
                drawimg = false;
                isLoadDataLocal = true;
                return;
            }

            if (isScaling) {
                drawing = false;
            }
            else {
                isLoadDataLocal = false;
            }
            if (drawing) {
                mousedown = true;
            }
            if (canvas.getActiveObject()) {
                //console.log(canvas.getActiveObject())
            }
        })

        canvas.on('mouse:wheel', function (opt) {
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            // var vpt = this.viewportTransform;
            // if (zoom < 400 / 1000) {
            //     vpt[4] = 200 - 1000 * zoom / 2;
            //     vpt[5] = 200 - 1000 * zoom / 2;
            // } else {
            //     if (vpt[4] >= 0) {
            //         vpt[4] = 0;
            //     } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
            //         vpt[4] = canvas.getWidth() - 1000 * zoom;
            //     }
            //     if (vpt[5] >= 0) {
            //         vpt[5] = 0;
            //     } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
            //         vpt[5] = canvas.getHeight() - 1000 * zoom;
            //     }
            // }
        })


        canvas.on('before:path:created', function (opt) {
            // var path = opt.path;
            // var pathInfo = fabric.util.getPathSegmentsInfo(path.path);
            // path.segmentsInfo = pathInfo;
            // var text = username;
            // var fontSize = 10;
            // var text = new fabric.Text(text, { fontSize: fontSize ,top: path.top - 10, left: path.left - 10});
            // var group = new fabric.Group([path, text],{
            //     width: path.width,
            //     height:path.height
            // });
            // canvas.add(group);
            var path = opt.path;
            var text = username;
            var fontSize = 10;
            var text = new fabric.Text(text, { angle: 0, fontSize: fontSize, top: path.top - 10, left: path.left - 10, fill: getColor() });
            var objs = [path, text]
            var alltogetherObj = new fabric.Group(objs, {
                originX: 'center',
                originY: 'center',
            });
            alltogetherObj.set({ objectID: randomID() });
            canvas.add(alltogetherObj);
            lastObject = alltogetherObj;
        });

        canvas.on('path:created', function (opt) {
            canvas.remove(opt.path);
        })

        function onChange(p) {
            if (p.target._objects.length > 2) {
                if (p.target.scaleX < 1)
                    p.target._objects[2].scaleX = 1 + (1 - p.target.scaleX)
                else
                    p.target._objects[2].scaleX = 1 / (p.target.scaleX)
                if (p.target.scaleY < 1)
                    p.target._objects[2].scaleY = 1 + (1 - p.target.scaleY)
                else
                    p.target._objects[2].scaleY = 1 / (p.target.scaleY)
            } else {
                if (p.target.scaleX < 1)
                    p.target._objects[1].scaleX = 1 + (1 - p.target.scaleX)
                else
                    p.target._objects[1].scaleX = 1 / (p.target.scaleX)
                if (p.target.scaleY < 1)
                    p.target._objects[1].scaleY = 1 + (1 - p.target.scaleY)
                else
                    p.target._objects[1].scaleY = 1 / (p.target.scaleY)
            }

            canvas.renderAll()
        }

        canvas.on('mouse:down', function (e) {
            if (!drawing) {
                isDraging = true;
                init_position[0] = e.pointer.x;
                init_position[1] = e.pointer.y;
            }
        })


        canvas.on('mouse:up', function (e) {
            isDraging = false;
            // final_position[0] = e.pointer.x;
            // final_position[1] = e.pointer.y;
        })


        canvas.on('mouse:move', function (e) {
            //console.log(e.pointer)
            if (isDraging && !drawing && !isMoving && !isScaling && !isRotating) {
                unit_x = e.pointer.x - init_position[0];
                unit_y = e.pointer.y - init_position[1];
                // console.log("heello")
                // console.log(e)
                // let connectors = canvas.getObjects().filter((value) =>{
                //     return value.type === "line-connect" 
                // })
                // console.log(connectors)
                // for (let i = 0;i<connectors.length;i++){
                //     connectors[i].set({
                //         x2: unit_x,
                //         y2: unit_y
                //     })
                // }
                $('#edit-form').css({ "visibility": "hidden" });

                let delta = new fabric.Point(unit_x, unit_y);
                canvas.relativePan(delta);

                init_position[0] = e.pointer.x;
                init_position[1] = e.pointer.y;



                //console.log(obj)

            }
        })


        $(function () {
            $('#goRight').click(function () {
                var units = 10;
                var delta = new fabric.Point(units, 0);
                canvas.relativePan(delta);
            });

            $('#goLeft').click(function () {
                var units = 10;
                var delta = new fabric.Point(-units, 0);
                canvas.relativePan(delta);
            });
            $('#goUp').click(function () {
                var units = 10;
                var delta = new fabric.Point(0, -units);
                canvas.relativePan(delta);
            });

            $('#goDown').click(function () {
                var units = 10;
                var delta = new fabric.Point(0, units);
                canvas.relativePan(delta);
            });
            initCanvas(canvas).renderAll();
            canvas.on('after:render', function () {

            });

            canvas.on('mouse:up', function () {
                if (drawing && mousedown) {
                    mousedown = false;
                    let layer_num = $('#layers-body .active').attr('data-cnt');
                    console.log(layer_num);
                    emitEvent(layer_num, lastObject);
                }
            });



            //dynamically resize the canvas on window resize
            $(window)
                .on('resize', function () {
                    w = div.width();
                    h = div.height();
                    canvas.setHeight(h);
                    canvas.setWidth(w);
                })
                .on('keydown', function (e) {
                    if (e.keyCode === 46) { //delete key
                        if (!$(".text-edit").hasClass('hidden')) {
                            $(".text-edit").addClass('hidden');
                        }
                        $('#edit-form').css({ "visibility": "hidden" });
                        deleteObjects();
                    }
                    if (e.keyCode === 40) { //move up
                        var units = 10;
                        var delta = new fabric.Point(0, -units);
                        canvas.relativePan(delta);
                    }

                    if (e.keyCode === 38) { //move down
                        var units = 10;
                        var delta = new fabric.Point(0, units);
                        canvas.relativePan(delta);
                    }

                    if (e.keyCode === 37) { //move right
                        var units = 10;
                        var delta = new fabric.Point(units, 0);
                        canvas.relativePan(delta);
                    }

                    if (e.keyCode === 39) { //move left
                        var units = 10;
                        var delta = new fabric.Point(-units, 0);
                        canvas.relativePan(delta);
                    }

                });

            //Set Brush Size
            $(".btn-pencil").on('click', function () {
                $(".btn-pencil").removeClass('active');
                $(this).addClass('active');
                let val = $(this).attr('data-pencil');
                // console.log(val);
                setBrush({ width: val });
            });

            //Set brush color
            $(".btn-color").on('click', function () {
                let val = $(this).attr('data-color');
                console.log(val);
                activeColor = val;
                $("#brushColor").val(val);
                setBrush({ color: val });
            });

            $("#brushColor").on('change', function () {
                let val = $(this).val();
                activeColor = val;
                setBrush({ color: val });
            });

            $('#omegaSymbol').on('click', function () {
                if ($("#listOfSymbol").hasClass('hidden')) {
                    $("#listOfSymbol").removeClass('hidden');
                }
                else {
                    $("#listOfSymbol").addClass('hidden');
                }

            })

            $('#svg').on('click', function () {
                if ($("#listIconSVG").hasClass('hidden')) {
                    $("#listIconSVG").removeClass('hidden');
                }
                else {
                    $("#listIconSVG").addClass('hidden');
                }

            })

            $('#zoomIn').on('click', function () {
                canvas.setZoom(canvas.getZoom() * 1.1)

            })

            $('#zoomOut').on('click', function () {
                canvas.setZoom(canvas.getZoom() / 1.1)

            })

            //Toggle between drawing tools
            $("#drwToggleDrawMode").on('click', function () {
                $("#toolbox button").removeClass('active');
                if (canvas.isDrawingMode) {
                    setFreeDrawingMode(false);
                    $(this).removeClass('active');
                    drawing = false;
                } else {
                    setFreeDrawingMode(true);
                    $(this).addClass('active');
                    drawing = true;

                    //set default drawing line
                    if (canvas.freeDrawingBrush.getPatternSrc) {
                        canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(canvas.freeDrawingBrush);
                    }
                    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                        blur: 0,
                        offsetX: 0,
                        offsetY: 0,
                        affectStroke: true,
                        color: "#ffffff",
                    });
                }
            });
            fabric.Object.prototype.transparentCorners = false;

            let drawingLineWidthEl = $('#drawing-line-width') //Select width of drawing line
            let drawingColorEl = $('#drawing-color') //Select color of drawing line

            //Create type pen (IMPORTANT)
            if (fabric.PatternBrush) {
                var vLinePatternBrush = new fabric.PatternBrush(canvas);

                vLinePatternBrush.getPatternSrc = function () {

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.lineTo(10, 5);
                    ctx.closePath();
                    ctx.stroke();

                    return patternCanvas;
                };

                var hLinePatternBrush = new fabric.PatternBrush(canvas);
                hLinePatternBrush.getPatternSrc = function () {

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(5, 0);
                    ctx.lineTo(5, 10);
                    ctx.closePath();
                    ctx.stroke();

                    return patternCanvas;
                };

                var squarePatternBrush = new fabric.PatternBrush(canvas);
                squarePatternBrush.getPatternSrc = function () {

                    var squareWidth = 10, squareDistance = 2;

                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
                    var ctx = patternCanvas.getContext('2d');

                    ctx.fillStyle = this.color;
                    ctx.fillRect(0, 0, squareWidth, squareWidth);

                    return patternCanvas;
                };

                var diamondPatternBrush = new fabric.PatternBrush(canvas);
                diamondPatternBrush.getPatternSrc = function () {

                    var squareWidth = 10, squareDistance = 5;
                    var patternCanvas = fabric.document.createElement('canvas');
                    var rect = new fabric.Rect({
                        width: squareWidth,
                        height: squareWidth,
                        angle: 45,
                        fill: this.color
                    });

                    var canvasWidth = rect.getBoundingRect().width;

                    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
                    rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

                    var ctx = patternCanvas.getContext('2d');
                    rect.render(ctx);

                    return patternCanvas;
                };

            }

            //Catch type pen
            $('.drawing-mode-selector').on('click', function () {
                $(".drawing-mode-selector").removeClass('active');
                $(this).addClass('active');
                let val = $(this).attr('data-pencil');

                let oldWidth = canvas.freeDrawingBrush.width
                let oldColor = canvas.freeDrawingBrush.color
                if (val === 'Hline') {
                    canvas.freeDrawingBrush = vLinePatternBrush;
                }
                else if (val === 'Vline') {
                    canvas.freeDrawingBrush = hLinePatternBrush;
                }
                else if (val === 'Square') {
                    canvas.freeDrawingBrush = squarePatternBrush;
                }
                else if (val === 'Diamond') {
                    canvas.freeDrawingBrush = diamondPatternBrush;
                }
                else {
                    canvas.freeDrawingBrush = new fabric[val + 'Brush'](canvas);
                }

                if (canvas.freeDrawingBrush) {


                    canvas.freeDrawingBrush.color = oldColor;
                    canvas.freeDrawingBrush.width = oldWidth;
                    if (canvas.freeDrawingBrush.getPatternSrc) {
                        canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(canvas.freeDrawingBrush);
                    }
                    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                        blur: 0,
                        offsetX: 0,
                        offsetY: 0,
                        affectStroke: true,
                        color: "#ffffff",
                    });
                }

            });

            //Catch wdith pen
            drawingLineWidthEl.on('change', function () {
                canvas.freeDrawingBrush.width = parseInt(this.value);
                let percent = (this.value / 60 * 100).toFixed(2)
                $("#drawing-line-width-label").text(percent + "%");

            });

            //Catch color pen
            drawingColorEl.on('change', function () {

                canvas.freeDrawingBrush.color = this.value;

                if (canvas.freeDrawingBrush.getPatternSrc) {
                    canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(canvas.freeDrawingBrush);
                }
            });

            $("#moveObject").on('click', function () {
                $("#toolbox button").removeClass('active');
                if (canvas.isDrawingMode) {
                    setFreeDrawingMode(false);
                    $(this).removeClass('active');
                    drawing = false;
                }
                $(this).addClass('active');
            })

            $("#drwEraser").on('click', function () { deleteObjects(); });

            $("#drwClearCanvas").on('click', function () { canvas.clear(); });

            $("#textMode").on('click', function () { textMode(); });






            $('#createLatex').on('click', function () { createLatex(); });

            $('#omegaSymbol').on('click', function () { omegaSymbol(); });

            //Thêm đối tượng
            $("#icongeometric").on('click', function () { icongeometric(); });

            $("#iconTriange").on('click', function () { iconTriange(); });

            $("#iconCricle").on('click', function () { iconCricle(); });

            $("#iconElipse").on('click', function () { iconElipse(); });

            $("#iconRect").on('click', function () { iconRect(); });

            $("#iconPolygon").on('click', function () { iconPolygon(); });

            $("#iconArrowRightArrow").on('click', function () { iconArrowRightArrow(); });

            $("#iconTurnLeftArrow").on('click', function () { iconTurnLeftArrow(); });

            $("#iconTwoWayArrow").on('click', function () { iconTwoWayArrow(); });

            $("#iconStar").on('click', function () { iconStar(); });

            $("#iconTrapezoid").on('click', function () { iconTrapezoid(); });

            $("#iconPolygen").on('click', function () { iconPolygen(); });

            $("#iconArrowTo").on('click', function () { iconArrowTo(); });

            $("#iconHeart").on('click', function () { iconHeart(); });



            $("#imageMode").change(function (e) {
                var file = e.target.files[0],
                    imageType = /image.*/;
                if (!file.type.match(imageType))
                    return;

                var reader = new FileReader();
                reader.onload = imageMode;
                reader.readAsDataURL(file);
            });

            $("#shapeArrow").on('click', function () {
                if (!isArrowActive || (isRectActive || isCircleActive)) {
                    disableShapeMode();
                    $("#toolbox button").removeClass('active');
                    $(this).addClass('active');
                    isArrowActive = true;
                    enableShapeMode();
                    let arrow = new Arrow(canvas);
                } else {
                    disableShapeMode();
                    isArrowActive = false;
                    $(this).removeClass('active');
                }
            });

            $("#shapeCircle").on('click', function () {
                if (!isCircleActive || (isRectActive || isArrowActive)) {
                    disableShapeMode();
                    $("#toolbox button").removeClass('active');
                    $(this).addClass('active');
                    isCircleActive = true;
                    enableShapeMode();
                    let circle = new Circle(canvas);
                } else {
                    disableShapeMode();
                    isCircleActive = false;
                    $(this).removeClass('active');
                }
            });

            $("#shapeRect").on('click', function () {
                if (!isRectActive || (isArrowActive || isCircleActive)) {
                    disableShapeMode();
                    isRectActive = true;
                    $("#toolbox button").removeClass('active');
                    $(this).addClass('active');
                    enableShapeMode();
                    let squrect = new Rectangle(canvas);
                } else {
                    isRectActive = false;
                    disableShapeMode();
                    $(this).removeClass('active');
                }
            });

            $("#debugButton").on('click', function () {
                deleteObjects();
            });

            canvas.renderAll();

            //Sockets
            socket.emit('ready', "Page loaded");
            // socket.on('change-coordinate-line-connect', data =>{
            //     isMoving = true;
            //     isLoadDataLocal = true;
            //     changeCoordinateConnectLine(data)
            // })
            socket.on("rubberser", function (data) {
                // canvas.getItemByObjectID(data.objectID).remove();
                deleteObjInPool(data, pool_data);
                loadCanvasJson(pool_data, canvas);
                canvas.renderAll();
            })

            socket.on('connecter', function (data) {
                let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
                if (data.objectID) {
                    isLoadedFromJson = true;
                    pool_data.push(data);
                    makeLine(canvas, data.connector, data.idObject1, data.idObject2, data.port1, data.port2, data.objectID, data.lineText);
                }
            });
            // socket.on('update', function (data) {
            //     pool_data = data;
            // })

            socket.on('canvasColor', function (data) {
                canvas.setBackgroundColor(`${data}`, canvas.renderAll.bind(canvas));
            })

            socket.on('drawing', function (obj) {
                var room = $("#ScheduleID").val();
                if (obj.data) {
                    isLoadedFromJson = true;

                    pool_data.push(obj);
                    console.log(obj);
                    if (/*obj.layer == layer_num &&*/ obj.room == room) {
                        var jsonObj = obj.data;
                        if (obj.type == "lineConnect") {

                        } else {
                            fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
                                enlivenedObjects[0].set({
                                    objectID: obj.objectID,
                                    userID: obj.userID,
                                    idObject1: obj.idObject1,
                                    idObject2: obj.idObject2,
                                    port1: obj.port1,
                                    port2: obj.port2,
                                })
                                canvas.add(enlivenedObjects[0]);
                                if (enlivenedObjects[0]._objects && enlivenedObjects[0]._objects.length > 2 && enlivenedObjects[0]._objects[0].type != 'image') {
                                    addPort(enlivenedObjects[0], canvas, obj.objectID);
                                }
                            });
                        }
                    }
                }

            });

            socket.on('leaning', function (obj) {
                isLoadedFromJson = true;
                obj.data_user.objects.forEach(function (object) {
                    object.id *= ratio;
                    object.us *= ratio;
                });
                canvas.loadFromJSON(obj.data_user);
            });

            socket.on('addLayer', function (data) {
                layer++;
                $(".btn-add-layer").click();
            })

            function createVideo($url) {
                var cnt = getCanvas();
                var url = new URL($url);
                var c = url.searchParams.get("v");
                console.log(c);

                var $div = $('<div/>', {
                    class: 'item-video',
                    id: 'video-' + (cnt - 3),
                    style: "z-index: 100; width: 30%; height: 50%; background: black; padding: 20px;",
                }).appendTo('#yotubeVideo');

                var input = $('<input>', {
                    type: "button",
                    value: "X",
                    style: "color: red; position: absolute; right: 0; top: 0; font-size: 20px;"
                }).appendTo($div);

                input[0].addEventListener("click", function (e) {
                    console.log($(this).parent().remove());
                })

                var $iframe = $('<iframe/>', {
                    id: "new-video",
                    src: "https://www.youtube.com/embed/" + c + "?origin=http://localhost",
                    crossorigin: "anonymous"
                }).appendTo($div);

                dragElement($div[0]);
                resizeVideo($div[0]);
                // var video = $('<video/>', {
                //     // src: `https://www.youtube.com/embed/${c}`,
                //     // width: 400,
                //     // height: 200,
                //     // allowfullscreen: true,
                //     // autoplay: true
                // }).appendTo($div);

                // var source = $('<source/>', {
                //     src: $url,
                //     type: 'video/youtube',
                //     width: 500,
                //     height: 360
                // }).appendTo(video);

                // addVideoToCanvas(canvas, $url );

                // video.mediaelementplayer();
            }
            socket.on('video', function (data) {
                createVideo(data);
            })

            socket.on('changefont', function (data) {
                loadAndUse(data.font, data.object, canvas, pool_data);
            });

            socket.on('changesize', function (data) {
                canvas.getObjects().forEach(item => {
                    if (item.objectID == data.object) {
                        if (item._objects.length > 2) {
                            item.item(1).set("fontSize", parseInt(data.size));
                        } else {
                            item.item(0).set("fontSize", parseInt(data.size));
                        }
                        canvas.requestRenderAll();
                        return;
                    }
                })
            })

            socket.on('updated', function (data) {
                if (data.moving) {
                    canvas.getObjects().forEach((item) => {
                        if (item.objectID == data.objectID) {
                            if (item.name != "lineConnect") {
                                item.set({
                                    left: data.dataChange.left,
                                    top: data.dataChange.top
                                })
                            }
                            changeCoordinateConnectLine(item);
                        }
                    })
                    updateObjectByID(pool_data, data.dataChange, data.objectID, true);
                } else {
                    updateObjectByID(pool_data, data.dataChange, data.objectID);
                    console.log(data)
                    canvas.getObjects().forEach((item) => {
                        if (item.objectID == data.objectID) {
                            canvas.remove(item);
                            var jsonObj = data.dataChange;
                            fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
                                enlivenedObjects[0].set({
                                    objectID: data.objectID
                                })
                                canvas.add(enlivenedObjects[0]);
                                canvas.renderAll();
                            });
                            return;
                        }
                    })
                }
                canvas.requestRenderAll();
            })

            socket.on('deleteObject', function (data) {
                console.log(data);
                canvas.getObjects().forEach((item) => {
                    if (item.objectID == data.objectID) {
                        canvas.remove(item);
                        return;
                    }
                })
                deleteObjInPool(data.objectID, pool_data, data.layer);
            })

            socket.on('onOffName', function (data) {
                turnOnOffUsernameCanvas(data.userID, canvas, data.name);
                turnOnOffUsernamePoolData(data.userID, pool_data, data.name);
            })


        });

        $(function () {
            $(document).ready(function () {
                username = $("#UserName").val();
                usernameTemp = $("#UserName").val();
                var room = $("#ScheduleID").val();
                var jsonLectureList = $("#LectureList").val();
                var jsonLessonList = $("#LessonDoc").val();
                var lectureList = JSON.parse(jsonLectureList);
                var lessonList = JSON.parse(jsonLessonList);
                var divLecture = "";
                var divLesson = "";
                // debugger
                let data = {
                    email: username,
                    pass: 'cc'
                };
                $.post("https://nodejs.s-work.vn/" + "/login", data, function (data) {
                    data = JSON.parse(data);
                    var dataLogin = data.DataLogIn;
                    if (!dataLogin.Error) {
                        // username = dataLogin.Object.UserName;
                        id = dataLogin.Id;
                        userID = dataLogin.userID;
                        console.log(userID);
                        //Fetch data draw when login
                        socket.emit('fetch-data-request', room, function () {
                        });
                        socket.on('fetch-data-to-client', (data) => {
                            pool_data = data.drawData;
                            console.log(pool_data);
                            layer = data.layer;
                            backgroundColorCanvas = data.currentCanvasColor;
                            if (layer > 1) {
                                for (var i = 2; i <= layer; i++) {
                                    $(".btn-add-layer").click();
                                }
                            }
                            console.log('data load');
                            var cnt = getCanvas();
                            loadCanvasJson(pool_data, canvas);
                        });
                        socket.on('init-zoom-to-client', (data) => {
                            if (data.user == username && data.room == room) {
                                if (isZoomJoined) {
                                    //$("#zoomEmbed").addClass("fullshow");
                                    $('.attend-list').addClass('hidden');
                                    if ($('.menu-tray').hasClass('show-both')) {
                                        $('.menu-tray').removeClass('show-both');
                                    }
                                }
                            }
                        });
                        socket.on('join-zoom-to-client', (data) => {
                            if (username == data.user && data.room == room) {
                                //$("#zoomEmbed").removeClass("fullshow");
                                isZoomJoined = true;
                            }
                        });
                        //document.getElementById('modal-wrapper').style.display = 'none';
                        $("#register").addClass("hidden");
                        $("#login").addClass("hidden");
                        $("#nameuser").text(username);
                        $("#div-nameuser").removeClass("hidden");
                        $("#logout").removeClass("hidden");
                        //$("#zoomEmbed").addClass("fullshow");
                        divLecture += '<ul class="list-group">';
                        divLecture += '<li class="dropdown">';
                        divLecture += '<a class="dropdown-toggle dropdown-toggle-menu" data-toggle="lecture-ul-list"><i class="fa fa-angle-down" aria-hidden="true"></i>Lecture List</a>';
                        divLecture += '<ul class="dropdown-menu-a show-dropdown-menu" id="lecture-ul-list">';
                        var count = 0
                        for (var element of lectureList) {
                            count++;
                            var icon = '<img class="a92228050 mr5" src="../../../images/iconDashBoard/icon_Text-Worksheet.png">';
                            divLecture += '<li class="dropdown" onclick="getListItemLecture(' + element.LectureId + ')"><a href="#">' + icon + element.Title + '</a></li>';
                            if (lectureList.length > 1 && count != lectureList.length) {
                                divLecture += '<div class="custom-border"></div>';
                            }
                        }

                        divLecture += '</ul>';
                        divLecture += '</li>';
                        divLecture += '</ul>';
                        $('#lecture-list').html(divLecture);
                        divLesson += '<ul class="list-group">';
                        divLesson += '<li class="dropdown">';
                        divLesson += '<a class="dropdown-toggle dropdown-toggle-menu" data-toggle="lesson-ul-list"><i class="fa fa-angle-down" aria-hidden="true"></i>Lesson Documents</a>';
                        divLesson += '<ul class="dropdown-menu-a show-dropdown-menu" id="lesson-ul-list">';
                        count = 0
                        for (var element of lessonList) {
                            count++;
                            var excel = ['.XLSM', '.XLSX', '.XLS'];
                            var text = ['.TXT'];
                            var word = ['.DOCX', '.DOC'];
                            var pdf = ['.PDF'];
                            var powerPoint = ['.PPS', '.PPTX', '.PPT'];
                            var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
                            var icon = "";
                            if (excel.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o pr5" aria-hidden="true"></i>';
                            } else if (word.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o pr5" aria-hidden="true"></i>';
                            } else if (text.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o pr5" aria-hidden="true"></i>';
                            } else if (pdf.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o pr5" aria-hidden="true"></i>';
                            } else if (powerPoint.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o pr5" aria-hidden="true"></i>';
                            } else if (image.indexOf(element.FileTypePhysic.toUpperCase()) !== -1) {
                                icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o pr5" aria-hidden="true"></i>';
                            } else {
                                icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify pr5" aria-hidden="true"></i>';
                            }
                            divLesson += '<li class="dropdown" onclick="getListItemLecture(' + element.LectureId + ')"><a href="#">' + icon + element.FileName + '</a></li>';
                            if (lessonList.length > 1 && count != lessonList.length) {
                                divLesson += '<div class="custom-border"></div>';
                            }
                        }

                        divLesson += '</ul>';
                        divLesson += '</li>';
                        divLesson += '</ul>';
                        $('#lesson-doc').html(divLesson);

                        var tilemenu = document.getElementsByClassName('dropdown-toggle-menu'),
                            sbmenu = document.getElementsByClassName('dropdown-menu-a');
                        for (var i = 0; i < tilemenu.length; i++) {
                            tilemenu[i].onclick = function () {
                                if (this.classList[1] == 'dropdown-toggle-color') { // click vào cái đã hiện thị rồi

                                    this.classList.remove('dropdown-toggle-color');

                                    // 3 dòng dưới là cho  các đối tưởng được click ẩn đi
                                    var showsubmenu = this.getAttribute('data-toggle'),
                                        show_elment = document.getElementById(showsubmenu);
                                    show_elment.classList.remove('show-dropdown-menu');
                                } else { // click vào các cái còn lại

                                    // cho all bỏ màu chữ của class dropdown-toggle-menu
                                    for (var k = 0; k < tilemenu.length; k++) {
                                        tilemenu[k].classList.remove('dropdown-toggle-color');
                                    }
                                    this.classList.toggle('dropdown-toggle-color');

                                    // lấy về data-toggle
                                    var showsubmenu = this.getAttribute('data-toggle'),
                                        show_elment = document.getElementById(showsubmenu);

                                    // cho all cac class dropdown-menu-l khác ẩn đi
                                    //for (var i = 0; i < sbmenu.length; i++) {
                                    //    sbmenu[i].classList.remove('show-dropdown-menu')
                                    //}

                                    // cho  các đối tưởng được click hiện ra
                                    show_elment.classList.toggle('show-dropdown-menu');
                                }
                            }
                        }
                        setTimeout(function () {
                            if ($('.join-audio')) {
                                $('.video_mode').click();
                                $('.video_list').click();
                                $('.start-tutoring').click();
                                $('#zmmtg-root, .meeting-app, .meeting-client').addClass('nonew');
                            } else { alert(2); };
                        }, 1000);
                    }
                    else {
                        alert("Log in failed");
                    }
                });
                $('.toogle-menu-tray').on('click', function () {
                    if ($('.sb-right').hasClass('hidden')) {
                        $('.sb-right').removeClass('hidden');
                    } else {
                        $('.sb-right').addClass('hidden');
                    }
                });

                $('.video-mode').click(function () {
                    if ($('.attend-list').hasClass('hidden') == false) {
                        $('.attend-list').addClass('hidden');
                        if ($('.menu-tray').hasClass('show-both')) {
                            $('.menu-tray').removeClass('show-both');
                        }
                    }
                    else {
                        $('.attend-list').removeClass('hidden');
                        if (!$('.menu-tray').hasClass('show-both')) {
                            $('.menu-tray').addClass('show-both');
                        }
                    }
                });

                $(".video_list").click(function () {
                    if ($('.sb-right').hasClass('hidden')) {
                        $('#zmmtg-root').addClass('show');
                    }
                    $('#zmmtg-root, .meeting-app, .meeting-client').addClass('nonew');
                    $('.meeting-client-inner').removeClass('fullshow');
                    if ($('#zmmtg-root').hasClass('hidden')) {
                        $('#nav-tool').css('display', 'block');
                        $('#zmmtg-root').addClass('show');
                        $('#zmmtg-root').removeClass('hidden');
                        $('.meeting-client-inner').removeClass('fullshow');
                        $('.meeting-client-inner').addClass('minishow');
                        setTimeout(function () { $('#wc-content').css('left', '0'); }, 10);
                    }

                    if (!$('#zmmtg-root').hasClass('hidden')) {
                        if ($('.meeting-client-inner').hasClass('minishow')) {
                            $('.meeting-client-inner').removeClass('minishow');
                            $('.meeting-client-inner').addClass('fullshow');
                            $('#menu-main').addClass('hidden');

                            $('#zmmtg-root').removeClass('show');
                        }
                        else {
                            $('.meeting-client-inner').removeClass('fullshow');
                            $('.meeting-client-inner').addClass('minishow');
                            $('#menu-main').removeClass('hidden');
                        }
                    }
                });

                $('#join_meeting').click(function () {
                    let display_name = $("#display_name").val();
                    let meeting_number = $("#meeting_number").val();
                    var data = {
                        email: display_name,
                        pass: meeting_number
                    };
                });

                $('#div-nameuser').click(function () {
                    if (username == usernameTemp) {
                        username = "";
                        $("#nameuser").css("text-decoration-line", "line-through");
                        turnOnOffUsernameCanvas(userID, canvas, "");
                        turnOnOffUsernamePoolData(userID, pool_data, "");
                        socket.emit('onOffName', {
                            userID: userID,
                            name: ""
                        });
                    } else {
                        username = usernameTemp;
                        $("#nameuser").css("text-decoration-line", "none");
                        turnOnOffUsernameCanvas(userID, canvas, usernameTemp);
                        turnOnOffUsernamePoolData(userID, pool_data, usernameTemp);
                        socket.emit('onOffName', {
                            userID: userID,
                            name: usernameTemp
                        });
                    }
                })

                $("#btn_login").click(function () {
                    username = $("#username").val();
                    usernameTemp = $("#username").val();
                    // debugger
                    let data = {
                        email: username,
                        pass: 'cc'
                    };
                    $.post("https://nodejs.s-work.vn/" + "/login", data, function (data) {
                        data = JSON.parse(data);
                        var dataLogin = data.DataLogIn;
                        if (!dataLogin.Error) {
                            // username = dataLogin.Object.UserName;
                            id = dataLogin.Id;
                            userID = dataLogin.userID;
                            console.log(userID);
                            //Fetch data draw when login
                            socket.emit('fetch-data-request', 'public', function () {
                            });
                            socket.on('fetch-data-to-client', (data) => {
                                pool_data = data.drawData;
                                layer = data.layer;
                                backgroundColorCanvas = data.currentCanvasColor;
                                if (layer > 1) {
                                    for (var i = 2; i <= layer; i++) {
                                        $(".btn-add-layer").click();
                                    }
                                }

                                var cnt = getCanvas();
                                loadCanvasJson(pool_data, canvas);
                            });
                            document.getElementById('modal-wrapper').style.display = 'none';
                            $("#register").addClass("hidden");
                            $("#login").addClass("hidden");
                            $("#nameuser").text(username);
                            $("#div-nameuser").removeClass("hidden");
                            $("#logout").removeClass("hidden");
                            setTimeout(function () {
                                if ($('.join-audio')) {
                                    $('.video_mode').click();
                                    $('.video_list').click();
                                    $('.start-tutoring').click();
                                    $('#zmmtg-root, .meeting-app, .meeting-client').addClass('nonew');
                                } else { alert(2); };
                            }, 1000);
                        }
                        else {
                            alert("Log in failed");
                        }
                    });
                })
            });

        });

    })(jQuery, window, document);

function filterIdSame(dataDraw) {
    var id = dataDraw[0].id;
    var array = [];
    array.push(dataDraw[0]);
    for (let i = 1; i < dataDraw.length; i++) {
        if (id == dataDraw[i].id) {
            console.log(i);
        } else {
            id = dataDraw[i].id;
            array.push(dataDraw[0]);
        }
    }
    return array;
}

function randomID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function loadCanvasJson(arr, canvas) {
    console.log(arr);
    var room = $("#ScheduleID").val();
    let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
    for (let index = 0; index < arr.length; index++) {
        if (arr[index].data && arr[index].layer == layer_num && arr[index].room == room) {
            var jsonObj = arr[index].data;
            if (arr[index].type == "lineConnect") {

            } else {
                fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
                    enlivenedObjects[0].set({
                        objectID: arr[index].objectID,
                        userID: arr[index].userID,
                        idObject1: arr[index].idObject1,
                        idObject2: arr[index].idObject2,
                        port1: arr[index].port1,
                        port2: arr[index].port2,
                    })
                    canvas.add(enlivenedObjects[0]);
                    if (enlivenedObjects[0]._objects && enlivenedObjects[0]._objects.length > 2 && enlivenedObjects[0]._objects[0].type != 'image') {
                        addPort(enlivenedObjects[0], canvas, arr[index].objectID);
                    }
                });
            }
        }
    }
    canvas.renderAll();
    canvas.setBackgroundColor(backgroundColorCanvas, canvas.renderAll.bind(canvas));
}

function deleteObjInPool(data, pool_data, layer) {
    const indexDelete = pool_data.findIndex((item) => item.objectID === data && item.layer == layer);
    if (indexDelete >= 0) {
        pool_data.splice(indexDelete, 1);
    }
}

function dragElement(elmnt) {
    var mover = document.createElement('div');
    mover.className = 'mover';
    mover.style.width = '20px';
    mover.style.height = '20px';
    mover.style.background = 'red';
    mover.style.position = 'absolute';
    mover.style.top = 0;
    mover.style.right = '50%';
    mover.style.cursor = 'move';
    elmnt.appendChild(mover);

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // otherwise, move the DIV from anywhere inside the DIV:
    mover.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function resizeVideo(element) {
    var resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '20px';
    resizer.style.height = '20px';
    resizer.style.background = 'red';
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.bottom = 0;
    resizer.style.cursor = 'se-resize';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        window.addEventListener('mousemove', Resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function Resize(e) {
        console.log(element.style.width);
        element.style.width = (e.clientX - element.offsetLeft + 2) + 'px';
        element.style.height = (e.clientY - element.offsetTop - 73) + 'px';
        console.log(element.style.width);
    }

    function stopResize(e) {
        e.preventDefault();
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}

function loadAndUse(font, objectID, canvas, pool_data, is, socket) {
    if (font == "Time New Roman") {
        canvas.getObjects().forEach(item => {
            if (item.objectID == objectID) {
                if (item._objects.length > 2) {
                    item.item(1).set("fontFamily", font);
                } else {
                    item.item(0).set("fontFamily", font);
                }
                if (is) {
                    updateLocal(pool_data, item.objectID, item, socket);
                }
                canvas.requestRenderAll();
                return;
            }
        })
    } else {
        WebFont.load({
            google: {
                families: [font]
            },

            loading: function () {

            },

            active: function () {
                canvas.getObjects().forEach(item => {
                    if (item.objectID == objectID) {
                        if (item._objects.length > 2) {
                            item.item(1).set("fontFamily", font);
                        } else {
                            item.item(0).set("fontFamily", font);
                        }
                        if (is) {
                            updateLocal(pool_data, item.objectID, item, socket);
                        }
                        canvas.requestRenderAll();
                        return;
                    }
                })
            }
        });
    }
}

function updateObjectByID(pool_data, dataChange, objectID, moving) {
    let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
    var index;
    if (objectID) {
        index = pool_data.findIndex(item => item.objectID == objectID && item.layer == layer_num);
    } else {
        index = pool_data.findIndex(item => item.objectID == data.objectID && item.layer == data.layer);
    }
    if (index >= 0) {
        if (moving) {
            if (pool_data[index].type != "lineConnect") {
                Object.keys(dataChange).forEach((key) => {
                    pool_data[index].data[key] = dataChange[key];
                })
            }
        } else {
            pool_data[index].data = dataChange;
        }
    }
}

function updateLocal(pool_data, objectID, dataChange, socket, moving) {
    let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
    var index = pool_data.findIndex(item => item.objectID == objectID && item.layer == layer_num);
    if (index >= 0) {
        if (moving) {
            console.log(pool_data[index].type);
            if (pool_data[index].type != "lineConnect") {
                Object.keys(dataChange).forEach((key) => {
                    pool_data[index].data[key] = dataChange[key];
                })
            }
            socket.emit('updated', {
                objectID: objectID,
                dataChange: dataChange,
                layer: layer_num,
                moving: true
            });
        }
        else {
            pool_data[index].data = dataChange;
            socket.emit('updated', {
                objectID: objectID,
                dataChange: dataChange,
                layer: layer_num,
            });
        }
    }
}

function turnOnOffUsernamePoolData(userID, pool_data, name) {
    for (let i = 0; i < pool_data.length; i++) {
        if (pool_data[i].userID == userID) {
            if (pool_data[i].data._objects) {
                if (pool_data[i].data._objects.length > 2) {
                    pool_data[i].data._objects[2].text = name;
                } else {
                    pool_data[i].data._objects[1].text = name;
                }
            } else {
                if (pool_data[i].data.objects.length > 2) {
                    pool_data[i].data.objects[2].text = name;
                } else {
                    pool_data[i].data.objects[1].text = name;
                }
            }
        }
    }
}

function turnOnOffUsernameCanvas(userID, canvas, name) {
    canvas.getObjects().forEach(item => {
        if (item.userID == userID) {
            if (item._objects.length > 2) {
                item.item(2).set({
                    text: name
                })
            } else {
                item.item(1).set({
                    text: name
                })
            }
        }
    })
    canvas.requestRenderAll();
}

function latexToImg(formula) {
    let wrapper = MathJax.tex2svg(formula, {
        em: 10,
        ex: 5,
        display: true
    })
    let fin = btoa(unescape(encodeURIComponent(wrapper.querySelector('svg').outerHTML)));
    let svg = "data:image/svg+xml;base64," + fin;
    return svg;
}

function findTargetPort(object, ports) {
    let points = new Array(4);
    let port;
    if (ports) {
        port = ports
    } else {
        port = object.__corner;
    }
    switch (port) {

        case 'mt':
            points = [
                object.left + (object.width / 2), object.top,
                object.left + (object.width / 2), object.top
            ];
            break;
        case 'mr':
            points = [
                object.left + object.width, object.top + (object.height / 2),
                object.left + object.width, object.top + (object.height / 2)
            ];
            break;
        case 'mb':
            points = [
                object.left + (object.width / 2), object.top + object.height,
                object.left + (object.width / 2), object.top + object.height
            ];
            break;
        case 'ml':
            points = [
                object.left, object.top + (object.height / 2),
                object.left, object.top + (object.height / 2)
            ];
            break;

        default:
            break;
    }

    return {
        'x1': points[0], 'y1': points[1],
        'x2': points[2], 'y2': points[3]
    }
}

function choosePort(port, canvas, objectID) {
    let object = canvas.getObjects().filter(obj =>
        obj.port == port &&
        obj.portID == objectID
    )
    if (object) {
        object[0].set({
            fill: "red",
            radius: 10
        })
    }
}

function disablePort(port, object) {

    switch (port) {
        case 'mt':
            object.setControlsVisibility({
                mt: false
            })
            break;
        case 'mr':
            object.setControlsVisibility({
                mr: false
            })
            break;
        case 'mb':
            object.setControlsVisibility({
                mb: false
            })
            break;
        case 'ml':
            object.setControlsVisibility({
                ml: false
            })
            break;
        default:
            break;
    }
}

function makeLine(canvas, point, idObject1, idObject2, corner1, corner2, objectID, text) {
    var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
        //  M 65 0 L 73 6 M 65 0 L 62 6 z 
        fill: '',
        stroke: 'black',
        objectCaching: false,
        originX: 'center',
        originY: 'center',
        name: 'lineConnect',
        idObject1: idObject1,
        idObject2: idObject2,
        port1: corner1,
        port2: corner2,
        objectID: objectID
    });

    line.path[0][1] = point.x1;
    line.path[0][2] = point.y1;

    // line.path[2][1] = point.x1;
    // line.path[2][2] = point.y1;

    // line.path[4][1] = point.x1;
    // line.path[4][2] = point.y1;

    line.path[1][1] = point.x1 + 100;
    line.path[1][2] = point.y1 + 100;

    // line.path[3][1] = point.x1 + 8;
    // line.path[3][2] = point.y1 + 6;

    // line.path[5][1] = point.x1 - 3;
    // line.path[5][2] = point.y1 + 6;

    line.path[1][3] = point.x2;
    line.path[1][4] = point.y2;
    console.log(line);
    var text;
    if (point.x1 < point.x2) {
        text = new fabric.Text(text, { fontSize: 10, top: point.y1, left: point.x1, objectCaching: false, name: "lineusername", lineID: idObject1, objectID: objectID, corner: corner1 });
    } else {
        text = new fabric.Text(text, { fontSize: 10, top: point.y2, left: point.x2, objectCaching: false, name: "lineusername", lineID: idObject2, objectID: objectID, corner: corner2 });
    }
    canvas.add(text);
    line.selectable = false;
    canvas.add(line);

    var p1 = makeCurvePoint(point.x1 + 100, point.y1 + 100, null, line, null)
    p1.name = "p1";
    p1.objectID = objectID;
    canvas.add(p1);

    return line;
}

function makeCurveCircle(object, line1, line2, line3) {
    object.line1 = line1;
    object.line2 = line2;
    object.line3 = line3;
}

function makeCurvePoint(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 8,
        radius: 14,
        fill: '#fff',
        stroke: '#666',
        originX: 'center',
        originY: 'center'
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    return c;
}

function getListItemLecture(lectureId) {
    var isPopupAllowed = $("#IsPopupAllowed").val() == "True" ? true : false;
    if (isPopupAllowed) {
        $.ajax({
            type: "POST",
            url: "/Admin/Notepad/GetListLectureItem?lectureId=" + lectureId,
            contentType: "application/json",
            dataType: "JSON",
            //data: catId,
            success: function (rs) {
                if (!rs.Error) {
                    listItem = rs.Object;
                    $("#lectureModal").modal();
                    $('#lectureBody').html(listItem[0].full_text);
                    $('#lectureBody').find("img").attr("crossorigin", "anonymous");
                } else {
                    App.toastrError(rs.Title);
                }
            },
            failure: function (errMsg) {
                App.toastrError(errMsg);
            }
        });
    }
    else {
        $.ajax({
            type: "POST",
            url: "/Admin/Notepad/GetLecture?lectureId=" + lectureId,
            contentType: "application/json",
            dataType: "JSON",
            //data: catId,
            success: function (rs) {
                if (!rs.Error) {
                    window.open('/Admin/Notepad/ViewLecture', '_blank');
                }
            },
            failure: function (errMsg) {
                App.toastrError(errMsg);
            }
        });
    }
}

function movelinename(canvas, objectID, top, left, corner) {
    canvas.getObjects().forEach(item => {
        if (item.name == "lineusername" && item.lineID == objectID && item.corner == corner) {
            item.set({
                top: top,
                left: left
            })
        }
    })
}

function addPort(object, canvas, objectID) {
    let ports;
    if (
        object._objects[0].type === "rect" ||
        object._objects[0].type === 'circle' ||
        object._objects[0].type === 'ellipse' ||
        object._objects[0].type === 'polygon' ||
        object._objects[0].type === "path"
    ) {
        ports = ['mb', 'mt', 'ml', 'mr']

    }
    else if (object._objects[0].type === "triangle") {
        ports = ['mb', 'mt']
    }

    else if (object._objects[0].type === "polyline") {
        ports = ['ml', 'mr']
    }
    ports.forEach(port => {
        let point = findTargetPort(object, port);
        var c = new fabric.Circle({
            left: point.x1,
            top: point.y1,
            radius: 7,
            fill: '#B2CCFF',
            name: "port",
            port: port,
            portID: objectID,
            originX: 'center',
            originY: 'center',
            evented: false
        });
        canvas.add(c);
    })
}


