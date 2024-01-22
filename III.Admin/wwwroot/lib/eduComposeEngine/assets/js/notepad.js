var backgroundColorCanvas = "";
var canvasData;
(function ($, window, document, undefined) {
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
    var isChoosePort = false;
    var objCover = null;

    // store objects for ctrl + c/v
    var _clipboard;
    var ctrlDown = false; // check ctrl press

    // A flag for drawing activity
    var drawing = false;
    var cursors = {};
    var isErasing = false;
    var isDraging = false;
    var isSelecting = false;
    var isEditText = false;
    var id;
    var init_position = [0, 0];
    var final_position = [0, 0];
    //  funzione richiesta di nick name
    var username = "";
    var usernameTemp = "";
    var userID = "";
    var pool_data = [];
    var layer = [];
    var isLoadDataLocal = true;
    var indexMove = -1;
    var index = -1;

    var listUsers = [];
    let quizMode = false;

    // layers
    const layerStorage = {
        count: 1,
        layers: [
            {
                id: 1,
                canvas: ''
            }
        ]
    }


    var isGrid = false;

    var idtempo;

    var click_event = document.ontouchstart ? 'touchstart' : 'click';
    // Kiet loadCanvasJsonNew
    var quizTitle = "";
    var countItem = 0;
    var userResult = [];
    var qIndex = -1;

    // svg object device
    let attachFileObj = null;

    // this for draw line with special type
    let isDrawLine = false;
    let isDrawingLine = false;
    let drawLine;
    let isDown;
    let lineType = '';
    let lineArray = [];
    var pointArray = [];
    var isCurving = false;
    var isPointToPoint = true;
    var nextPointStart = null;

    let typesOfLinesIter = -1;
    const typesOfLines = [
        // Default: sine
        null,
        // Custom: tangens
        [
            function (x) { return Math.max(-10, Math.min(Math.tan(x / 2) / 3, 10)); },
            4 * Math.PI
        ],
        // Custom: Triangle function
        [
            function (x) {
                let g = x % 6;
                if (g <= 3) return g * 5;
                if (g > 3) return (6 - g) * 5;
            },
            6
        ],
        // Custom: Square function
        [
            function (x) {
                let g = x % 6;
                if (g <= 3) return 15;
                if (g > 3) return -15;
            },
            6
        ],
    ];

    // create canvas
    fabric.Object.prototype.objectCaching = false;
    let canvas = new fabric.Canvas('canvas_draw', {
        id: layerStorage.layers[0].id,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
    });
    console.log('canvas load');

    let line,
        triangle,
        origX,
        origY,
        isFreeDrawing = false;
    let isRectActive = false,
        isCircleActive = false,
        isArrowActive = false,
        activeColor = '#000000';
    let isLoadedFromJson = false;

    // store custom attributes to save and load json
    const customAttributes = [
        // canvas
        'backgroundColor',
        'typeGrid',

        'name',
        'id',
        'port1',
        'port2',
        'idObject1',
        'idObject2',
        'objectID',
        'port',
        'lineID',
        'line2',
        'isDrop',
        'isDrag',
        'isBackground',
        'answerId',
        'text',

        // 'isChoosePort',
        'colorBorder',
        'widthBorder',
        'curve',
        'hasShadow',
        'shadowObj',
        'fixed',
        'position',

        'isMoving',
        'isRepeat',
        'isDrawingPath',
        'speedMoving',
        'pathObj',
        'soundMoving',
        'nameSoundMoving',

        'blink',
        'lineStyle',
        'lineType',
        'customProps',
        'funct',
        'coord_x1',

        'select',
        'status',
        'colorText',
        'colorTextSelected',
        'colorSelected',
        'colorUnselected',
        'soundSelected',
        'nameSoundSelected',
        'soundUnselected',
        'nameSoundUnselected',

        'input',
        'soundTyping',
        'nameSoundTyping',

        'snap',
        'soundSnap',
        'nameSoundSnap',

        // device record
        'nameDevice',
        'device',
        'src',
        'countRecord',
        'files'
    ];

    var snap = 20; //Pixels to snap
    let activeObject = null; // get obj was dblclick for config

    // device variables
    let isRecordAudio = false;
    let isRecordVideo = false;
    let audioStream;
    let videoStream;
    let audioRecorder = null;
    let cameraRecorder = null;
    let audioRecorded = $('#micRecorded')[0];
    let cameraRecorded = $('#cameraRecorded')[0];
    let cameraRecording = $('#cameraRecording')[0];
    let screenshotImg = $('#screenshot-img')[0];
    let takephotoImg = $('#takephoto-img')[0];
    let activeDeviceObject = null;

    // play variables
    let isCreateQuiz = false;
    let isCreateAnswer = false;
    let correctAnswers = [];
    let userAnswers = [];
    let isViewAnswer = false;
    let isMakingAnswer = false;
    let isDoQuiz = false;
    let isChecked = false;
    let readyCheck = false;
    let isCreateDoquiz = false;

    let correctAnswerBox;
    let userAnswerBox;
    let correctPositionBox;
    function loadCanvasJsonNew(canvasObj) {
        fabric.util.enlivenObjects(canvasObj.objects, function (enlivenedObjects) {
            enlivenedObjects.forEach(function (obj) {
                var quizType = $('#quiz-type').val();
                if (obj.isDrag === true || obj.isDrop === true) {
                    countItem++;
                }

                if (obj.name == 'lineConnect') {
                    var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
                        //  M 65 0 L 73 6 M 65 0 L 62 6 z 
                        fill: '',
                        stroke: '#000',
                        objectCaching: false,
                        originX: 'center',
                        originY: 'center',
                        name: 'lineConnect',
                        idObject1: obj.idObject1,
                        idObject2: obj.idObject2,
                        port1: obj.port1,
                        port2: obj.port2,
                        objectID: obj.objectID
                    });

                    line.selectable = false;
                    line.path = obj.path;

                    canvas.add(line);
                }
                else if (obj.name == 'media') {
                    if (obj.nameDevice == 'attach-file') {
                        // attachFileObj
                        obj.on('moving', function () {
                            $(`.attach-file-popup-class`).addClass("hidden");
                        });
                        changeCoordinateConnectLine(obj);

                        obj.on('mousedblclick', function () {
                            var check = $(`.attach-file-popup-class`).hasClass("hidden");
                            attachFileObj = this;

                            if (check) {
                                // re render list
                                $(`.attach-file-popup-class .list`)[0].innerHTML = '';
                                this.files.forEach(file => addNewAttachFile(file));

                                const zoom = canvas.getZoom();
                                const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 150;
                                let top = (this.top) * zoom + canvas.viewportTransform[5] - 30;

                                $(`.attach-file-popup-class`).css({ 'top': top + 'px', 'left': left + 'px' });
                                $(`.attach-file-popup-class`).removeClass("hidden");
                            } else {
                                $(`.attach-file-popup-class`).addClass("hidden");
                            }
                        });
                    }
                    else {
                        activeDeviceObject = obj;
                        startActiveMedia(obj);
                    }
                    // console.log(obj);
                    canvas.add(obj);
                }
                else if (obj.type === 'group') {
                    if (obj.name == 'line-style' && obj.lineType == 'curve') {
                        obj._objects.forEach(obj => obj._setPath(obj.path));
                    }
                    if (obj._objects.length > 0) {
                        obj._objects.forEach(child => {
                            if (child.id == 'answer-correct-textbox') {
                                correctAnswerBox = child;
                                if (quizType == 'quiz-3') {
                                    console.log(correctAnswerBox);
                                    correctAnswerBox.text = correctAnswerMatch.map(item => item).join(', ');
                                    correctAnswerBox.set('fill', '#ffffff');
                                }
                                if (isDoQuiz) {
                                    const title = new fabric.Text('User Answer', {
                                        top: 0,
                                        left: 30,
                                        fontSize: 16,
                                        fontFamily: 'Times New Roman',
                                        fill: "#ffffff"
                                    });

                                    userAnswerBox = new fabric.Textbox('', {
                                        left: 0,
                                        top: 40,
                                        width: 200,
                                        fontSize: 10,
                                        fontFamily: 'Times New Roman',
                                        id: 'answer-correct-textbox',
                                        fill: "#ffffff"
                                    });

                                    const group = new fabric.Group([title, userAnswerBox], {
                                        top: 150,
                                        left: 50,
                                        selectable: false
                                    })

                                    canvas.add(group);
                                    isCreateDoquiz = true;
                                }
                            }
                            if (child.id == 'answer-position-textbox') {
                                correctPositionBox = child;
                                if (quizType == 'quiz-3') {
                                    correctPositionBox.text = correctAnswerPosition.map(item => item.id + ' - ' + item.top + ' - ' + item.left).join(', ');
                                    correctPositionBox.set('fill', '#ffffff');
                                }
                            }
                        });
                    }

                    if (obj.name == 'grid') {
                        obj.set({
                            evented: false,
                            selectable: false,
                            renderOnAddRemove: false,
                            objectCaching: false,
                        })
                    }

                    startActiveObject(obj);
                    canvas.add(obj);
                }
                else if (obj.type === 'image') {
                    fabric.Image.fromURL(obj.src, function (img) {
                        img.set({
                            top: obj.top,
                            left: obj.left,
                            width: obj.width,
                            height: obj.height,
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY,
                        })
                        if (quizType == 'quiz-3') {
                            img.set({
                                name: obj.name,
                                id: obj.id,
                                port1: obj.port1,
                                port2: obj.port2,
                                idObject1: obj.idObject1,
                                idObject2: obj.idObject2,
                                objectID: obj.objectID,
                                port: obj.port,
                                lineID: obj.lineID,
                                hasShadow: obj.hasShadow,
                                shadowObj: obj.shadowObj,
                                pos: obj.pos,
                                snap: obj.snap,
                                soundSnap: obj.soundSnap,
                                nameSoundSnap: obj.nameSoundSnap,
                                readySound: obj.readySound,
                                sound: obj.sound,
                                line2: obj.line2,
                                isDrop: obj.isDrop,
                                isDrag: obj.isDrag,
                                isBackground: obj.isBackground,
                                answerId: obj.answerId,
                            })
                        }

                        startActiveObject(img);

                        canvas.add(img);
                    });
                }
                else if (obj.name == 'line-style') {
                    if (obj.type == 'wavy-line-with-arrow') {
                        console.log(obj);
                        obj._objects = [];
                        obj.objects = [];
                        obj.updateInternalPointsData();
                    }

                    startActiveObject(obj);
                    canvas.add(obj);
                }
                else {
                    obj.hasBorders = obj.hasControls = false;

                    if (obj.name === 'curve-point') {
                        obj.on('moving', function () {
                            const line = canvas.getObjects().find(item =>
                                item.type === 'path' &&
                                item.objectID === obj.lineID
                            );

                            if (line) {
                                line.path[1][1] = obj.left;
                                line.path[1][2] = obj.top;
                            }
                        })
                    }
                    else if (obj.type === 'path') {
                        obj._setPath(obj.path);
                        obj.selectable = false;

                        if (obj.name == 'svg') {
                            startActiveObject(obj);
                        }
                    }
                    canvas.add(obj);
                }
            });
        });

        canvas.setBackgroundColor(canvasObj.backgroundColor, canvas.renderAll.bind(canvas));

        canvas.renderAll();
    };
    function createCanvasSaveData() {
        var quizType = $('#quiz-type').val();
        const attrs = [
            'name',
            'id',
            'port1',
            'port2',
            'idObject1',
            'idObject2',
            'objectID',
            'port',
            'lineID',
            'line2',
            'isDrop',
            'isDrag',
            'isBackground',
            'answerId',

            'colorBorder',
            'widthBorder',
            'curve',
            'hasShadow',
            'shadowObj',
            'fixed',
            'position',

            'isMoving',
            'isRepeat',
            'isDrawingPath',
            'speedMoving',
            'pathObj',

            'select',
            'status',
            'colorText',
            'colorTextSelected',
            'colorSelected',
            'colorUnselected',
            'soundSelected',
            'nameSoundSelected',
            'soundUnselected',
            'nameSoundUnselected',

            'input',
            'soundTyping',
            'nameSoundTyping',

            'snap',
            'soundSnap',
            'nameSoundSnap',

            // device record
            'nameDevice',
            'device',
            'src',
            'countRecord',

        ];

        if (quizType == 'quiz-1') {
            const saveData = {
                canvas: JSON.stringify(canvas.toJSON(attrs)),
                questions,
                correctAnswers: correctAnswers,
                userAnswers: userAnswers,
                setting: quizSetting,
                title: quizTitle,
                gameType: quizType
            }
        }
        else {
            var startingCanvas = matchQuizData.canvas;
            const saveData = {
                canvas: startingCanvas,
                questions,
                correctAnswers: correctAnswers,
                userAnswers: userAnswers,
                setting: quizSetting,
                title: quizTitle,
                gameType: quizType
            }
        }

        return saveData;
    }

    function createMediaID() {
        const today = new Date();
        return `${today.getSeconds()}_${today.getMinutes()}_${today.getHours()}-${today.getDay()}_${today.getMonth()}_${today.getFullYear()}`;
    }

    // Add new record to list
    function addNewRecord(name, id) {
        let player;
        switch (name) {
            case 'mic': player = audioRecorded;
                break;
            case 'camera': player = cameraRecorded;
                break;
            case 'takephoto': player = takephotoImg;
                break;
            default:
                break;
        }

        const li = document.createElement('li');
        const playButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const div = document.createElement('div');
        const src = activeDeviceObject.src.find(value => value.id == id);

        li.innerHTML = `
                <p>${src.name}</p>
            `;
        li.classList.add('device-item');

        if (name == 'takephoto') {
            playButton.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>';
        }
        else {
            playButton.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
        }
        playButton.classList.add('btn', 'btn-primary');
        playButton.value = id;

        playButton.onclick = function () {
            try {
                player.src = src.url;
                if (name != 'takephoto') {
                    player.load();
                    player.play();
                }
            }
            catch (e) {
                console.log(e);
                alert(`File ${src.name} did not found in /file folder!`)
            }
        };

        deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
        deleteButton.classList.add('btn', 'btn-danger');

        deleteButton.onclick = function () {
            li.remove();
            activeDeviceObject.src = activeDeviceObject.src.filter(item => item.id != id);
            if (activeDeviceObject.src.length == 0) {
                player.src = '';
                if (name == 'takephoto') {
                    player.style.display = 'none';
                }
            }
            else if (player.src == src.url) {
                player.src = activeDeviceObject.src[0].url;
            }
        };

        div.appendChild(playButton);
        div.appendChild(deleteButton);
        li.appendChild(div);

        $(`.${name}-popup-class .list`)[0].appendChild(li);
    }

    // add file to attach file list
    function addNewAttachFile(file) {
        const li = document.createElement('li');
        const playButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const div = document.createElement('div');

        li.innerHTML = `
                <p>${file.name}</p>
            `;
        li.classList.add('device-item');

        playButton.innerHTML = '<i class="fa fa-file-o" aria-hidden="true"></i>';

        playButton.classList.add('btn', 'btn-primary');
        playButton.value = id;

        playButton.onclick = function () {
            if (file.type == 'link') {
                $('#attach-file-view')[0].src = `https://docs.google.com/gview?url=${file.url}&embedded=true`;
            }
            else if (file.type == 'local') {
                $('#attach-file-view')[0].src = file.url;
            }
            $('#attach-file-container').css({ 'display': 'block' });
        };

        deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
        deleteButton.classList.add('btn', 'btn-danger');

        deleteButton.onclick = function () {
            li.remove();
            attachFileObj.src = attachFileObj.src.filter(item => item.id != id);
        };

        div.appendChild(playButton);

        div.appendChild(deleteButton);
        li.appendChild(div);

        $(`.attach-file-popup-class .list`)[0].appendChild(li);
    }

    function startActiveMedia(svg) {
        const name = svg.nameDevice;

        svg.on('moving', function () {
            $(`.${name}-popup-class`).addClass("hidden");
        });

        changeCoordinateConnectLine(svg);

        svg.on('mousedblclick', function () {
            var check = $(`.${name}-popup-class`).hasClass("hidden");
            activeDeviceObject = this;

            if (check) {
                // re render list
                $(`.${name}-popup-class .list`)[0].innerHTML = '';
                this.src.forEach(item => addNewRecord(name, item.id));

                const zoom = canvas.getZoom();
                const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 160;
                let top = (this.top) * zoom + canvas.viewportTransform[5] - 100;
                if (name == 'takephoto') top += 60;

                if (this.src.length > 0) {
                    if (name == 'mic') {
                        audioRecorded.src = this.src[this.src.length - 1].url;
                        audioRecorded.load();
                    }
                    else if (name == 'camera') {
                        cameraRecorded.src = this.src[this.src.length - 1].url;
                        cameraRecorded.load();
                    }
                    else if (name == 'takephoto') {
                        takephotoImg.src = this.src[this.src.length - 1].url;
                    }
                }
                else {
                    if (name == 'mic') {
                        audioRecorded.src = '';
                    }
                    else if (name == 'camera') {
                        cameraRecorded.src = '';
                    }
                    else if (name == 'takephoto') {
                        takephotoImg.style.display = 'none';
                    }
                }

                $(`.${name}-popup-class`).css({ 'top': top + 'px', 'left': left + 'px' });
                $(`.${name}-popup-class`).removeClass("hidden");
            } else {
                $(`.${name}-popup-class`).addClass("hidden");
            }
        });
    }

    $(function () {

        var sidemenu = $('.opacitySideMenu');
        var tray_menu = $('.menu-tray');
        var $task_wrap = $('.taskbar-notepad');

        $task_wrap.find('.tool-btn').on('click', function () {
            var $this = $(this);
            if ($('.tool-btn.active').length > 0 && $('.tool-btn.active')[0] != $this[0]) {
                if ($('.tool-btn.active').hasClass('tool-nosubmenu')) {
                    $('.tool-btn.active').removeClass('active');
                }
                else {
                    $('.tool-btn.active')[0].click();

                }
            }

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
            if ($(this).hasClass('active')) {
                $("#erasers-body li").removeClass('active');
                $("#erasers-body li[data-eraser='30']").addClass('active');

                $('#divrubber').css({ "display": "block", 'top': '100px', 'left': '100px', "width": "30px", "height": "30px", "visibility": "visible" });
                $('#controlrubber').addClass(`css-cursor-30`);

                canEraser();
            }
            else {
                $('#divrubber').css({ "display": "none" });
            }
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

        let showSideBar = true;
        $('#btn-send').on('click', function () {
            showSideBar = !showSideBar;
            if (showSideBar) {
                $('.menu-tray.show-both').css({ 'right': '0' });
                $(this).css({ 'top': '0', 'left': '0', 'transform': 'rotate(0deg)' });
            }
            else {
                $('.menu-tray.show-both').css({ 'right': '-340px' });
                $(this).css({ 'top': '-40px', 'left': '-45px', 'transform': 'rotate(180deg)' });
            }
        })

        $('#btn_login').on('click', function () {
            if ($('#username')[0].value != '' && $('#pass')[0].value != '') {
                $('#modal-wrapper').css({ 'display': 'none' });

                const today = new Date();
                const user = {
                    userID: randomID(),
                    name: $('#username')[0].value,
                    password: $('#pass')[0].value,
                    time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
                    status: 'available',
                    raiseHand: 'false'
                }

                listUsers.push(user);
                $('#listUsers')[0].innerHTML = `
                    <li>
                        <div class="user-item">
                            <div>
                                <img src="assets/icons/61_Profile_User.png" alt="avatar">
                                <span>${user.name}</span>
                            </div>
                            <div>
                                ${user.time}
                            </div>
                        </div>
                    </li>
                `;
            }
            else {
                alert('Username and password cannot be blank!');
            }
        })

        // load svg for user device using
        function loadSVG(name, svg, player) {
            fabric.loadSVGFromURL(svg, function (objects, options) {
                const svg = fabric.util.groupSVGElements(objects, options);
                const maxWidth = 100;
                const maxHeight = 100;

                // resize svg if size is too large
                if (svg.width > maxWidth) {
                    svg.scaleToWidth(maxWidth);
                }
                if (svg.height > maxHeight) {
                    svg.scaleToHeight(maxHeight);
                }

                svg.set({
                    top: 100,
                    left: 100,
                    objectID: randomID(),
                    name: 'media',
                    nameDevice: name,
                    player: player,
                    src: [],
                });

                startActiveMedia(svg, name);

                canvas.add(svg);
                canvas.renderAll();
            });

            $('#moveObject')[0].click();
        }

        // create svg file canvas
        $('#icon-attach-file').click(function () {
            fabric.loadSVGFromURL('assets/svg/file.svg', function (objects, options) {
                const svg = fabric.util.groupSVGElements(objects, options);
                const maxWidth = 100;
                const maxHeight = 100;

                // resize svg if size is too large
                if (svg.width > maxWidth) {
                    svg.scaleToWidth(maxWidth);
                }
                if (svg.height > maxHeight) {
                    svg.scaleToHeight(maxHeight);
                }

                svg.set({
                    top: 100,
                    left: 100,
                    objectID: randomID(),
                    name: 'media',
                    nameDevice: 'attach-file',
                    files: []
                });

                svg.on('moving', function () {
                    $(`.attach-file-popup-class`).addClass("hidden");
                });
                changeCoordinateConnectLine(svg);

                svg.on('mousedblclick', function () {
                    var check = $(`.attach-file-popup-class`).hasClass("hidden");
                    attachFileObj = this;

                    if (check) {
                        // re render list
                        $(`.attach-file-popup-class .list`)[0].innerHTML = '';
                        this.files.forEach(file => addNewAttachFile(file));

                        const zoom = canvas.getZoom();
                        const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 150;
                        let top = (this.top) * zoom + canvas.viewportTransform[5] - 30;

                        $(`.attach-file-popup-class`).css({ 'top': top + 'px', 'left': left + 'px' });
                        $(`.attach-file-popup-class`).removeClass("hidden");
                    } else {
                        $(`.attach-file-popup-class`).addClass("hidden");
                    }
                });

                canvas.add(svg);
                canvas.renderAll();
            });

            $('#moveObject')[0].click();
        });
        $('#attach-file-view-close').click(function () {
            $('#attach-file-container').css({ 'display': 'none' });
        })

        // select file and add to list
        $('#attach-file-input').on('change', function (e) {
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                let check = attachFileObj.files.every(item => item.name != file.name);

                if (check) {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        const data = {
                            id: createMediaID(),
                            url: reader.result,
                            type: 'local',
                            name: file.name
                        };
                        attachFileObj.files.push(data);
                        addNewAttachFile(data);
                    }

                    reader.readAsDataURL(file);
                }
            }
            this.value = '';
        });
        $('#attach-file-close').click(function () {
            $('.attach-file-popup-class').addClass('hidden');
        });

        $('#attach-link-file').click(function () {
            $('#link-file-container').css({ 'display': 'block' });
        });

        $('#link-file-open').click(function () {
            const url = $('#link-file')[0].value;
            if (url != '') {
                const arr = url.split('/');
                const data = {
                    id: createMediaID(),
                    url: url,
                    type: 'link',
                    name: arr[arr.length - 1]
                };

                attachFileObj.files.push(data);
                addNewAttachFile(data);

                $('#link-file-close')[0].click();
            }
            else {
                alert('Invalid url file!');
            }
            $('#link-file').val('');
        })

        $('#link-file-close').click(function () {
            $('#link-file-container').css({ 'display': 'none' });
        });

        // add mic svg
        $("#icon-mic").click(function () {
            loadSVG('mic', 'assets/svg/microphone.svg');
        });
        // start / stop audio record
        $('#mic-record').click(function () {
            if (!isRecordAudio) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        audioStream = stream;
                        audioRecorder = new MediaRecorder(stream);

                        const audioChunks = [];
                        audioRecorder.addEventListener("dataavailable", event => {
                            audioChunks.pop();
                            audioChunks.push(event.data);
                        });

                        audioRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks, {
                                type: 'audio/wav'
                            });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const id = createMediaID();
                            const file = {
                                id: id,
                                name: `${id}.wav`,
                                url: `file/media/${id}.wav`
                            }

                            try {
                                audioRecorded.src = file.url;
                                audioRecorded.load();

                                // download
                                var a = document.createElement('a');
                                document.body.appendChild(a);
                                a.style = 'display: none';
                                a.href = audioUrl;
                                a.download = file.name;
                                a.click();
                                window.URL.revokeObjectURL(audioUrl);
                                document.body.removeChild(a);

                                // add new record
                                activeDeviceObject.src.push(file);
                                addNewRecord('mic', id);
                            }
                            catch (e) {
                                console.log(e);
                                alert(`File ${file.name} did not found in /file folder!`)
                            }
                        });

                        audioRecorder.start();
                        activeDeviceObject.blink = true;

                        blink(activeDeviceObject);
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-warning');
                        this.innerHTML = '<i class="fa fa-stop" aria-hidden="true"></i>';
                    })
            }
            else {
                audioStream.getTracks().forEach(track => {
                    track.stop();
                });
                audioRecorder.stop();
                activeDeviceObject.blink = false;
                this.classList.remove('btn-warning');
                this.classList.add('btn-primary');
                this.innerHTML = '<i class="fa fa-microphone" aria-hidden="true"></i>';
            }

            isRecordAudio = !isRecordAudio;
        })
        // close mic form
        $('#mic-close').click(function () {
            audioRecorded.pause();
            $('.mic-popup-class').addClass("hidden");
        });

        // add camera svg
        $("#icon-camera").click(function () {
            loadSVG('camera', 'assets/svg/camera.svg');
        });
        // start / stop video record
        $('#camera-record').click(function () {
            if (!isRecordVideo) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then(stream => {
                        cameraRecorded.style.display = 'none';
                        cameraRecording.style.display = 'inline-block';

                        videoStream = stream;
                        cameraRecording.srcObject = stream;
                        cameraRecording.play();
                        cameraRecorder = new MediaRecorder(stream);

                        const videoChunks = [];
                        cameraRecorder.addEventListener("dataavailable", event => {
                            videoChunks.pop();
                            videoChunks.push(event.data);
                        });

                        cameraRecorder.addEventListener("stop", () => {
                            const videoBlob = new Blob(videoChunks, {
                                type: 'video/webm'
                            });
                            const videoUrl = URL.createObjectURL(videoBlob);
                            const id = createMediaID();
                            const file = {
                                id: id,
                                name: `${id}.webm`,
                                url: `file/media/${id}.webm`
                            }


                            cameraRecording.pause();
                            cameraRecorded.style.display = 'inline-block';
                            cameraRecording.style.display = 'none';

                            try {
                                cameraRecorded.src = file.url;
                                cameraRecorded.load();

                                // download
                                var a = document.createElement('a');
                                document.body.appendChild(a);
                                a.style = 'display: none';
                                a.href = videoUrl;
                                a.download = file.name;
                                a.click();
                                window.URL.revokeObjectURL(videoUrl);
                                document.body.removeChild(a);

                                activeDeviceObject.src.push(file);
                                addNewRecord('camera', id);
                            }
                            catch (e) {
                                console.log(e);
                                alert(`File ${file.name} did not found in /file folder!`);
                            }

                        });

                        cameraRecorder.start();
                        activeDeviceObject.blink = true;
                        $('#camera-mark').css({ 'display': 'block' });

                        blink(activeDeviceObject);
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-warning');
                        this.innerHTML = '<i class="fa fa-stop" aria-hidden="true"></i>';
                    })
            }
            else {
                $('#camera-mark').css({ 'display': 'none' });

                videoStream.getTracks().forEach(track => {
                    track.stop();
                });
                cameraRecorder.stop();
                activeDeviceObject.blink = false;
                this.classList.remove('btn-warning');
                this.classList.add('btn-primary');
                this.innerHTML = '<i class="fa fa-video-camera" aria-hidden="true"></i>';
            }

            isRecordVideo = !isRecordVideo;
        })
        $('#camera-close').click(function () {
            cameraRecorded.pause();
            $('.camera-popup-class').addClass("hidden");
        })

        // popup takephoto form
        $("#icon-takephoto").click(function () {
            loadSVG('takephoto', 'assets/svg/takephoto.svg');
        });
        // take a photo
        $('#takephoto-capture').click(function () {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    var video = $('#takephoto-video')[0];
                    var canvas = $('#takephoto-canvas')[0];

                    video.srcObject = stream;

                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                            stream.getTracks().forEach(track => track.stop());
                            resolve(canvas.toDataURL('image/jpeg'));
                        }, 500);
                    })
                })
                .then(url => {
                    const id = createMediaID();
                    const file = {
                        id: id,
                        name: `${id}.jpg`,
                        url: `file/media/${id}.jpg`
                    }

                    try {
                        takephotoImg.src = url;
                        takephotoImg.style.display = 'block';

                        // download
                        var a = document.createElement('a');
                        document.body.appendChild(a);
                        a.style = 'display: none';
                        a.href = url;
                        a.download = file.name;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        activeDeviceObject.src.push(file);
                        addNewRecord('takephoto', id);
                    }
                    catch (e) {
                        console.log(e);
                        alert(`File ${file.name} did not found in /file folder!`);
                    }

                })
        });
        // close takephoto form
        $('#takephoto-close').click(function () {
            $('.takephoto-popup-class').addClass("hidden");
            takephotoImg.src = '';
        })

        // popup screenshot form
        $("#icon-screenshot").click(function () {
            var check = $('.screenshot-popup-class').hasClass("hidden");
            if (check) {
                if (screenshotImg.srcset == '') {
                    screenshotImg.style.display = 'none';
                }
                $('.screenshot-popup-class').css({ 'top': '40px', 'left': '530px' });
                $('.screenshot-popup-class').removeClass("hidden");
            } else {
                $('.screenshot-popup-class').addClass("hidden");
                $('#moveObject')[0].click();
            }
        });
        // take a screenshot
        $('#screenshot-capture').click(function () {
            screenshotCapture(screenshotImg);
        });
        // close screenshot form
        $('#screenshot-close').click(function () {
            $('.screenshot-popup-class').addClass("hidden");
            screenshotImg.src = '';
            $('#moveObject')[0].click();
        });

        $('#icon-cover').click(function () {
            isChoosePort = !isChoosePort;
            if (!isChoosePort) {
                canvas.getObjects().forEach(obj => {
                    obj.portMark && canvas.remove(obj.portMark);
                });

                objCover = null;
            }
        });

        // group active objects
        $('#icon-group').click(function () {
            if (!canvas.getActiveObject()) {
                return;
            }
            if (canvas.getActiveObject().type !== 'activeSelection') {
                return;
            }
            const group = canvas.getActiveObject().toGroup();
            group.objectID = randomID();

            setDefaultAttributes(group);
            startActiveObject(group);
            canvas.requestRenderAll();
            $('#moveObject')[0].click();
        });
        canvas.on("mouse:down", function (opts) {
            if ($('.tool-btn.active').length > 0) {
                // if ()
            }


            var target = opts.target;
            var mousePos = canvas.getPointer(opts.e);
            if (target && target.type == "group-extended") {
                var obj = opts.subTargets && opts.subTargets[0];
                if (obj) {
                    target._selectedObject = obj;
                } else {
                    target._selectedObject = null;
                }
                target._showSelectedBorder();
            }

            if (isChoosePort && target && target.name != 'curve-point') {
                if (!objCover) {
                    objCover = target;

                    const circle = new fabric.Circle({
                        top: objCover.top - 20,
                        left: objCover.left,
                        fill: 'red',
                        radius: 6,
                        selectable: false,
                        blink: true
                    });

                    canvas.add(circle);
                    blink(circle);
                    objCover.portMark = circle;

                    canvas.discardActiveObject();
                }
                else if (target !== objCover) {
                    canvas.remove(objCover.portMark);
                    objCover.portMark = null;

                    const point1 = findTargetPort(target, 'mt');
                    const point2 = findTargetPort(objCover, 'mt');

                    point1.x2 = point2.x2;
                    point1.y2 = point2.y2;
                    const line = makeLine(canvas, point1, target.objectID, objCover.objectID, 'mt', 'mt', randomID(), userID);

                    // line.selectable = true;
                    // setDefaultAttributes(line);
                    // startActiveObject(line);

                    objCover = null;
                    canvas.discardActiveObject();
                }
            }
        });

        // ungroup selected group
        $('#icon-ungroup').click(function () {
            if (!canvas.getActiveObject()) {
                return;
            }
            if (canvas.getActiveObject().type !== 'group') {
                return;
            }
            canvas.getActiveObject().toActiveSelection();
            canvas.requestRenderAll();
            $('#moveObject')[0].click();
        })

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
                $img.attr('src', plugin_url + '/assets/images/worksheet/Search_Type_PRACTICE.png');
            } else if ($state === '1') {
                $this.attr('data-state', '2');
                $img.attr('src', plugin_url + '/assets/images/worksheet/Search_Type_TEST.png');
            } else if ($state === '2') {
                $this.attr('data-state', 'all');
                $img.attr('src', plugin_url + '/assets/images/worksheet/Search_Type_ALL.png');
            }
        });

        $('.wls-subject-list ul li').on('click', function () {
            var $p = $(this).parents('.wls-subject-list');

            $p.find('li').removeClass('active');
            $(this).addClass('active');
            $p.removeClass('open');
        });



        $('body').on(click_event, function () {
            $('#panel').find('.typing-input').each(function () {
                var $this = $(this);
                $(this).focus();


                if ($('#panel').find('.typing-input').length > 1) {
                    $this.remove();
                }
            });
        });


        //event close session
        $("#close-session").on('click', function () {
            $('.close-session').removeClass("hidden");
        });

        $(".close-popup-close").click(function () {
            $('.close-class').addClass("hidden");
        });

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

        $('.toogle-menu-tray').on('click', function () {
            if ($('.sb-right').hasClass('hidden')) {
                $('.sb-right').removeClass('hidden');
            } else {
                $('.sb-right').addClass('hidden');
            }
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
            try {
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
            } catch (e) {
                console.log(e);
            }
        };

        // Event hide/show side menu popup

        $(".hideSideMenu").click(function () {

            $(".menu-tray").hide();
            $(".hideSideMenu").addClass("hidden");
            $(".showSideMenu").removeClass("hidden");
            $(".opactiyPercentage").hide();
            $(".editBar").hide();

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
            can?.addClass('has-image');
        });

        try {
            $('#divrubber').draggable();
        } catch (e) {
            console.log(e);
        }


        $('#icon-video').on('click', function () {
            if ($('.video-popup-class').hasClass('hidden')) {
                $('.video-popup-class').removeClass('hidden');
            } else {
                $('.video-popup-class').addClass('hidden');
                $('#moveObject')[0].click();
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

            $('#yotubeVideo .item-video').addClass('hidden');
            $('.video-popup-class').addClass('hidden');

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
                style: "z-index: 100; width: 30%; height: 50%; background: #000; padding: 20px;",
            }).appendTo('#yotubeVideo');

            var input = $('<input>', {
                type: "button",
                value: "X",
                style: "color: red; position: absolute; right: 0; top: 0; font-size: 20px;"
            }).appendTo($div);

            input[0].addEventListener("click", function (e) {
                $(this).parent().remove();
            })

            var $iframe = $('<iframe/>', {
                id: "new-video",
                src: "https://www.youtube.com/embed/" + c,
            }).appendTo($div);


            dragElement($div[0]);
            resizeVideo($div[0]);


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
            saveAs(JSON.stringify(canvas.toObject(customAttributes)), createMediaID());
        });

        $('#icon-load-canvas').on('change', function (e) {
            var file = e.target.files[0];

            var reader = new FileReader();
            reader.onload = function (e) {
                canvas.clear();

                const canvasObj = JSON.parse(e.target.result);

                loadCanvasJsonNew(canvasObj);

                // fabric.util.enlivenObjects(canvasObj.objects, function(enlivenedObjects) {
                //     enlivenedObjects.forEach(function(obj) {
                //         if(
                //             obj.type === 'group' ||
                //             obj.type === 'image' ||
                //             obj.type === 'path' && obj.name === 'svg'
                //         ) {
                //             startActiveObject(obj);
                //             canvas.add(obj);
                //             if(obj.type == 'path') obj._setPath(obj.path);
                //             if(obj.name == 'line-style' && obj.lineType == 'curve') {
                //                 obj._objects.forEach(obj => obj._setPath(obj.path));
                //             }
                //         }
                //         else {
                //             obj.hasBorders = obj.hasControls = false;

                //             if(obj.type === 'circle' && obj.name === 'p1') {
                //                 obj.on('moving', function() {
                //                     const line = canvas.getObjects().find(item =>
                //                         item.type === 'path' &&
                //                         item.objectID === obj.lineID
                //                     );

                //                     if(line) {
                //                         line.path[ 1 ][ 1 ] = obj.left;
                //                         line.path[ 1 ][ 2 ] = obj.top;
                //                     }
                //                 })
                //             }
                //             else if(obj.type === 'path') {
                //                 obj._setPath(obj.path);
                //                 obj.selectable = false;
                //             }
                //             canvas.add(obj);
                //         }
                //     });
                // });

                // canvas.setBackgroundColor(canvasObj.backgroundColor, canvas.renderAll.bind(canvas));

                // canvas.renderAll();
                // console.log(canvas);
            };
            reader.readAsText(file);

            $('#icon-load-canvas').val('');
        });

        $('#icon-load').on('click', function () {
            let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
            try {
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

                            }
                            loadCanvasJson(pool_data, canvas);
                        })
                    }
                    $("#file-layer").val('');
                }
            } catch (e) {
                console.log(e);
            }
        })


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


        $('button.close-listIcon').on('click', function () {
            $('#omegaSymbol').removeClass('active');
            $('#svg').removeClass('active');

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
        ShowsideMenu();
        hoverMenuShowTooltip();
    });

    function createCanvas() {

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

    function initDraw() {
        $(document).on('click', '.icon-selector', function () {
            // console.log(canvas.backgroundColor);
            var cnt = $(this).data('cnt');

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
                // if ($('.icon-layer.btn-grid').hasClass('active')) {
                //     var grid = $('.icon-layer.btn-grid.active').attr('data-grid');
                //     // var cnv = $('#math' + cnt);
                //     // var ctxcan = cnv[0].getContext('2d');
                //     var bg = getBg();
                //     if (bg != '') {
                //         $('#panel').css('background-color', bg);
                //     }

                //     if (grid) {
                //         $('#panel').css('background-image', 'url(' + plugin_url + '/assets/images/notepad/grid/grid-' + grid + '.png)')
                //     }
                // }

                // save current layer
                canvas.getObjects().forEach(obj => {
                    if (obj.isMoving) obj.stopAudio();
                });

                layerStorage.layers.forEach(item => {
                    if (item.id == canvas.id) {
                        item.canvas = JSON.stringify(canvas.toJSON(customAttributes));
                    }
                });

                canvas.clear();

                // load target layer
                const layer = layerStorage.layers.find(item => item.id == cnt);
                const canvasObj = JSON.parse(layer.canvas);
                loadCanvasJsonNew(canvasObj);
                canvas.id = layer.id;

                // set active to background color icon
                $("#grids-body .btn-color-grid").removeClass('active');
                $(`#grids-body .btn-color-grid[data-color='${canvasObj.backgroundColor}']`).addClass('active');
                // set un active to grid icon
                $("#grids-body .btn-grid").removeClass('active');
                const gridObj = canvas._objects.find(item => item.name == 'grid');
                if (gridObj) {
                    $(`#grids-body .btn-grid[data-grid='${gridObj.typeGrid}']`).addClass('active');
                }
            }
        });





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
                $('#change-color img').attr('src', 'assets/images/notepad/color/top/' + $(this).attr('data-image-url'));
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

            canvas.clear();
        });

        var $z;
        $(document).on('click', '.btn-color-grid', function () {
            var bg = $(this).attr('data-color');
            var cnt = getCanvas();
            var can = document.getElementById("canvas_draw");
            var ctxcan = can?.getContext('2d');

            $('#panel').find('.typing-input').remove();
            $('#add-type-box').removeClass('active');
            $('#math' + cnt).unbind(click_event, TypingCreatTextarea);

            var $x = $("#grids-body .btn-color-grid.active").length;

            if (!$(this).hasClass('active')) {
                $("#grids-body .btn-color-grid").removeClass('active');
                $(this).addClass('active');

                if ($x === 0) {
                    //
                }

                canvas.setBackgroundColor(`${bg}`, canvas.renderAll.bind(canvas));
                // console.log(canvas);

            }
        });

        var $stepGrid = -1;

        $('.btn-grid').unbind('click').bind('click', function (e) {
            var cnt = getCanvas();
            var cnv = $('#math' + cnt);


            $('#panel').find('.typing-input').remove();
            $('#add-type-box').removeClass('active');
            $('#math' + cnt).unbind(click_event, TypingCreatTextarea);

            var bg = getBg();
            if (bg != '') {
                $('#panel').css('background-color', bg);
            }

            if (!$(this).hasClass('active')) {
                $("#grids-body .btn-grid").removeClass('active');

                let canvas_objects = canvas._objects;
                let gridObj = canvas_objects.find(item => item.name === 'grid');

                canvas.remove(gridObj);
                $(this).addClass('active');

                var grid = $(this).attr('data-grid');

                grid = 50 / grid;

                let groupTogether = [];
                for (var i = 0; i < (canvas.width * 10 / grid); i++) {
                    let horizon = new fabric.Line([i * grid, 0, i * grid, canvas.width * 10], {
                        stroke: '#ccc',
                        selectable: false,
                        // renderOnAddRemove: false,
                        // objectCaching: false 
                    });
                    let vertical = new fabric.Line([0, i * grid, canvas.width * 10, i * grid], {
                        stroke: '#ccc',
                        selectable: false,
                        // renderOnAddRemove: false,
                        // objectCaching: false 
                    });
                    groupTogether.push(horizon, vertical);

                }
                var alltogetherObj = new fabric.Group(groupTogether, {
                    top: -1000,
                    left: -1000,
                    originX: 'center',
                    originY: 'center',
                    evented: false,
                    selectable: false,
                    renderOnAddRemove: false,
                    objectCaching: false,
                    name: 'grid'
                });

                if (grid == 50) {
                    alltogetherObj.typeGrid = 1;
                }
                else if (grid == 25) {
                    alltogetherObj.typeGrid = 2;
                }

                canvas.add(alltogetherObj);
                canvas.sendToBack(alltogetherObj);
                canvas.sendBackwards(alltogetherObj);
                e.preventDefault();
                e.stopPropagation();
            } else {
                isGrid = false;
                $(this).removeClass('active');

                let canvas_objects = canvas._objects;
                let idx = canvas_objects.findIndex(item => item.name == 'grid');

                canvas.remove(canvas.item(idx));
            }

        });


        $(document).on('change', '#screenshot-check', function (ev) {
            try {
                if (document.getElementById('screenshot-check').checked) {
                    $("#select-screenshot").selectBoxIt('disable');

                } else {
                    clearInterval(idtempo);
                    $("#select-screenshot").selectBoxIt('enable');
                }
            } catch (e) {
                console.log(e);
            }
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
            ctx.clearRect(0, 0, can?.width, can?.height);

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

            ctx.fillStyle = "#000";
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

    function fileOnload(e) {
        var img = $('<img>', {
            src: e.target.result
        });

        var can = document.getElementById("canvas_draw");
        var ctxcan = can?.getContext('2d');

        img.on('load', function () {
            ctxcan.drawImage(this, positionx, positiony);
        });
    }

    function canDraw(a) {
        console.log(a);


        var ctxcan = canvas.getContext('2d');

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


    }

    function canEraser() {
        console.log(canvas);

        divrubber.on('mouseup', function (e) {

            drawing = false;
            controlrubber = false;
            isErasing = false;;
        });

        divrubber.on('mousemove', function (e) {
            if (isErasing) {
                const deleteObjs = [];

                canvas.getObjects().forEach(obj => {
                    const zoom = canvas.getZoom();
                    const points = [
                        {
                            top: obj.top * zoom + canvas.viewportTransform[5],
                            left: obj.left * zoom + canvas.viewportTransform[4]
                        },
                        {
                            top: (obj.top + obj.height) * obj.scaleY * zoom + canvas.viewportTransform[5],
                            left: obj.left * zoom + canvas.viewportTransform[4]
                        },
                        {
                            top: (obj.top + obj.height) * obj.scaleY * zoom + canvas.viewportTransform[5],
                            left: (obj.left + obj.width) * obj.scaleX * zoom + canvas.viewportTransform[4]
                        },
                        {
                            top: obj.top * zoom + canvas.viewportTransform[5],
                            left: (obj.left + obj.width) * obj.scaleX * zoom + canvas.viewportTransform[4]
                        },
                    ];

                    points.some(point => {
                        if (Math.abs(point.top - divrubber.position().top) <= divrubber.height() &&
                            Math.abs(point.left - divrubber.position().left) <= divrubber.width()
                        ) {
                            deleteObjs.push(obj);
                            return true;
                        }
                        return false;
                    });
                });

                deleteObjects(deleteObjs);
            }
        });

        divrubber.on('mousedown', function (e) {
            drawing = false;
            isErasing = true;
        });


    }

    function canDraw(a) {

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

    function resizecanvas(can, ctxcan) {
        var imgdata = ctxcan.getImageData(0, 0, can.width, can.height);
        can.width = innerWidth;
        can.height = innerHeight + 65;
        ctxcan.putImageData(imgdata, 0, 0);
    }

    $(".btn-add-layer").click(function () {
        $('#panel').find('.typing-input').remove();

        var len = $("#layers-body li").length;
        if (len <= 8) {
            // update current layer to layerStorage
            canvas.getObjects().forEach(obj => {
                if (obj.isMoving) obj.stopAudio();
            });

            layerStorage.layers.forEach(item => {
                if (item.id == canvas.id) {
                    item.canvas = JSON.stringify(canvas.toJSON(customAttributes));
                }
            });

            $('.icon-selector.active').removeClass('active');

            // create new layer
            const layer = {
                id: ++layerStorage.count,
                canvas: ''
            }
            canvas.id = layer.id;
            canvas.clear();
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

            layerStorage.layers.push(layer);

            const li = document.createElement('li');
            li.classList.add('icon-layer', 'icon-selector', 'active');
            $(li).attr('data-cnt', layer.id);
            li.innerHTML = `<img src="assets/images/notepad/layer/layer-${len - 2}.png">`;

            $('#layers-body').append(li);
            // set active to background color icon
            $("#grids-body .btn-color-grid").removeClass('active');
            $(`#grids-body .btn-color-grid[data-color='#ffffff']`).addClass('active');
            // set un active to grid icon
            $("#grids-body .btn-grid").removeClass('active');
        }
    });


    $(".btn-delete-layer").click(function () {
        if (layerStorage.layers.length > 1) {
            $('#panel').find('.typing-input').remove();
            $('.icon-selector').remove();
            canvas.clear();

            let currentIndex = 0;
            layerStorage.layers = layerStorage.layers.filter((item, index) => {
                if (item.id == canvas.id) currentIndex = index;
                return item.id != canvas.id;
            });

            layerStorage.layers.forEach((layer, index) => {
                const li = document.createElement('li');

                li.classList.add('icon-layer', 'icon-selector');
                $(li).attr('data-cnt', layer.id);
                li.innerHTML = `<img src="assets/images/notepad/layer/layer-${index + 1}.png">`;

                $('#layers-body').append(li);
            })

            if (currentIndex > 0) {
                currentIndex--;
            }
            $('.icon-selector')[currentIndex].classList.add('active');

            // load next layer
            const layer = layerStorage.layers[currentIndex];
            canvas.id = layer.id;
            loadCanvasJsonNew(JSON.parse(layer.canvas));
        }
    });

    // blink object while recording
    function blink(obj) {
        if (obj.blink && obj.opacity == 1) {
            obj.animate('opacity', '0.3', {
                duration: 300,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function () {
                    blink(obj);
                }
            });
        }
        else {
            obj.animate('opacity', '1', {
                duration: 300,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function () {
                    blink(obj);
                }
            });
        }
    }

    // copy active objects when press ctrl + c
    function copyObjects() {
        if (!canvas.getActiveObject()) {
            return;
        }
        canvas.getActiveObject().clone(function (cloned) {
            _clipboard = cloned;
        }, customAttributes);
    }

    // paste copied objects when press ctrl + v
    function pasteObjects() {
        if (_clipboard) {
            _clipboard.clone(function (clonedObj) {
                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true
                });
                // drag drop question special case
                if (clonedObj.answerId) {
                    countItem++;
                    clonedObj.answerId = countItem;
                }
                // end
                if (clonedObj.type === 'activeSelection') {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = canvas;
                    clonedObj.forEachObject(function (obj) {
                        obj.objectID = randomID();
                        if (obj.name == 'media') {
                            if (obj.nameDevice == 'attach-file') {
                                // attachFileObj
                                obj.on('moving', function () {
                                    $(`.attach-file-popup-class`).addClass("hidden");
                                });
                                changeCoordinateConnectLine(obj);

                                obj.on('mousedblclick', function () {
                                    var check = $(`.attach-file-popup-class`).hasClass("hidden");
                                    attachFileObj = this;

                                    if (check) {
                                        // re render list
                                        $(`.attach-file-popup-class .list`)[0].innerHTML = '';
                                        this.files.forEach(file => addNewAttachFile(file));

                                        const zoom = canvas.getZoom();
                                        const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 150;
                                        let top = (this.top) * zoom + canvas.viewportTransform[5] - 30;

                                        $(`.attach-file-popup-class`).css({ 'top': top + 'px', 'left': left + 'px' });
                                        $(`.attach-file-popup-class`).removeClass("hidden");
                                    } else {
                                        $(`.attach-file-popup-class`).addClass("hidden");
                                    }
                                });
                            }
                            else {
                                activeDeviceObject = obj;
                                startActiveMedia(obj);
                            }
                        }
                        else {
                            activeDeviceObject = obj;
                            startActiveMedia(obj);
                        }
                        canvas.add(obj);
                    });
                    // this should solve the unselectability
                    clonedObj.setCoords();
                } else {
                    clonedObj.objectID = randomID();
                    startActiveObject(clonedObj);
                    canvas.add(clonedObj);
                }
                _clipboard.top += 10;
                _clipboard.left += 10;
                objectSnapAdjacent(clonedObj);
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
            }, customAttributes);

        }
    }

    const selected = document.querySelector(".selected");
    const optionsContainer = document.querySelector(".options-container");

    const optionList = document.querySelectorAll(".option");

    const optionNew = document.querySelector("#newhihi");

    const optionOpen = document.querySelector("#openhihi");

    const optionSave = document.querySelector("#savehihi");

    const optionPre = document.querySelector("#p");

    selected?.addEventListener("click", () => {
        optionsContainer.classList.toggle("active");
    });

    optionList.forEach(o => {
        o.addEventListener("click", () => {
            optionsContainer.classList.remove("active");
        });
    });

    optionNew?.addEventListener("click", () => {

    });

    optionOpen?.addEventListener("click", () => {
        navigator.getMedia({ video: true }, function () {
            alert('Camera Working');
        }, function () {
            alert('Camera don"t work');
        });
    });

    optionSave?.addEventListener("click", () => {
        navigator.getMedia({ audio: true }, function () {
            alert('Micro Working');
        }, function () {
            alert('Micro don"t work');
        });
    });

    optionPre?.addEventListener("click", () => {
        $('.notepad-sheet-search').removeClass('hidden').addClass('active');

    });

    $('.sample-close').on('click', function () {
        WS.ClearSimpleData();
    });


    $('input[type="file"]').attr('title', webkitURL ? ' ' : '');





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

    function enableShapeMode() {

        isFreeDrawing = canvas.isDrawingMode;
        canvas.isDrawingMode = false;
        canvas.selection = false;
        setCanvasSelectableStatus(false);
    }

    function disableShapeMode() {

        canvas.isDrawingMode = isFreeDrawing;
        if (isFreeDrawing) {
            $("#drwToggleDrawMode").addClass('active');
        }
        canvas.selection = true;
        isArrowActive = isRectActive = isCircleActive = false;
        setCanvasSelectableStatus(true);
    }

    function getTextForObject(obj, isText) {
        var text = username;
        var fontSize = 10;

        canvas.add(obj);

        isLoadDataLocal = false;
        let layer_num = $('#layers-body .active').attr('data-cnt');
        emitEvent(layer_num);
    }

    function deleteObjects(objects) {
        if (objects) {
            objects.forEach(function (object) {
                // remove lineConnect + curvePoint
                canvas.getObjects().forEach(item => {
                    if (object.name === 'curve-point' && item.objectID === object.lineID) {
                        canvas.remove(item);
                    }

                    else if (item.name === 'lineConnect' && (
                        item.idObject1 === object.objectID ||
                        item.idObject2 === object.objectID
                    )) {
                        const curvePoint = canvas.getObjects().find(obj => obj.lineID === item.objectID);

                        canvas.remove(item);
                        curvePoint && canvas.remove(curvePoint);;
                    }
                })

                canvas.remove(object);
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

        $('#moveObject')[0].click();
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
                top: 100,
                left: 100,
                originX: 'center',
                originY: 'center'
            });
            canvas.add(alltogetherObj).setActiveObject(alltogetherObj);
            // isLoadDataLocal = false;
            // let layer_num = $('#layers-body .active').attr('data-cnt');
            // emitEvent(layer_num);
        });
    }

    // Don't allow objects off the canvas
    function objectSnapCanvas(obj) {
        if (obj.snap) {
            obj.setCoords();

            const width = obj.width * obj.scaleX;
            const height = obj.height * obj.scaleY;

            if (obj.left < snap) {
                obj.left = 0;
            }

            if (obj.top < snap) {
                obj.top = 0;
            }

            if ((width + obj.left) > (canvas.width - snap)) {
                obj.left = canvas.width - width;
            }

            if ((height + obj.top) > (canvas.height - snap)) {
                obj.top = canvas.height - height;
            }

            canvas.requestRenderAll();

        }
    }

    // find new position for snap adjacent if obj is overlap
    function findNewPos(distX, distY, target, obj) {
        // See whether to focus on X or Y axis
        if (Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
                target.left = (obj.left - target.width);
            } else {
                target.left = (obj.left + obj.width);
            }
        } else {
            if (distY > 0) {
                target.top = (obj.top - target.height);
            } else {
                target.top = (obj.top + obj.height);
            }
        }
    }

    // snap object to adjacent position of an object
    function objectSnapAdjacent(object) {
        // Sets corner position coordinates based on current angle, width and height
        object.setCoords();

        // Loop through objects
        canvas.forEachObject(function (obj) {
            if (obj === object || obj.name != 'quiz-inputObj') return;

            // If objects intersect
            if (object.isContainedWithinObject(obj) || object.intersectsWithObject(obj) || obj.isContainedWithinObject(object)) {

                var distX = ((obj.left + obj.width) / 2) - ((object.left + object.width) / 2);
                var distY = ((obj.top + obj.height) / 2) - ((object.top + object.height) / 2);

                // Set new position
                findNewPos(distX, distY, object, obj);
            }

            // Snap objects to each other horizontally

            // If bottom points are on same Y axis
            if (Math.abs((object.top + object.height) - (obj.top + obj.height)) < snap) {
                // Snap target BL to object BR
                if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
                    object.left = obj.left + obj.width;
                    object.top = obj.top + obj.height - object.height;
                }

                // Snap target BR to object BL
                if (Math.abs((object.left + object.width) - obj.left) < snap) {
                    object.left = obj.left - object.width;
                    object.top = obj.top + obj.height - object.height;
                }
            }

            // If top points are on same Y axis
            if (Math.abs(object.top - obj.top) < snap) {
                // Snap target TL to object TR
                if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
                    object.left = obj.left + obj.width;
                    object.top = obj.top;
                }

                // Snap target TR to object TL
                if (Math.abs((object.left + object.width) - obj.left) < snap) {
                    object.left = obj.left - object.width;
                    object.top = obj.top;
                }
            }

            // Snap objects to each other vertically

            // If right points are on same X axis
            if (Math.abs((object.left + object.width) - (obj.left + obj.width)) < snap) {
                // Snap target TR to object BR
                if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
                    object.left = obj.left + obj.width - object.width;
                    object.top = obj.top + obj.height;
                }

                // Snap target BR to object TR
                if (Math.abs((object.top + object.height) - obj.top) < snap) {
                    object.left = obj.left + obj.width - object.width;
                    object.top = obj.top - object.height;
                }
            }

            // If left points are on same X axis
            if (Math.abs(object.left - obj.left) < snap) {
                // Snap target TL to object BL
                if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
                    object.left = obj.left;
                    object.top = obj.top + obj.height;
                }

                // Snap target BL to object TL
                if (Math.abs((object.top + object.height) - obj.top) < snap) {
                    object.left = obj.left;
                    object.top = obj.top - object.height;
                }
            }
        });

        object.setCoords();

        // If objects still overlap

        var outerAreaLeft = null,
            outerAreaTop = null,
            outerAreaRight = null,
            outerAreaBottom = null;

        canvas.forEachObject(function (obj) {
            if (obj === object || obj.name != 'quiz-inputObj') return;

            if (object.isContainedWithinObject(obj) || object.intersectsWithObject(obj) || obj.isContainedWithinObject(object)) {

                var intersectLeft = null,
                    intersectTop = null,
                    intersectWidth = null,
                    intersectHeight = null,
                    intersectSize = null,
                    targetLeft = object.left,
                    targetRight = targetLeft + object.width,
                    targetTop = object.top,
                    targetBottom = targetTop + object.height,
                    objectLeft = obj.left,
                    objectRight = objectLeft + obj.width,
                    objectTop = obj.top,
                    objectBottom = objectTop + obj.height;

                // Find intersect information for X axis
                if (targetLeft >= objectLeft && targetLeft <= objectRight) {
                    intersectLeft = targetLeft;
                    intersectWidth = obj.width - (intersectLeft - objectLeft);

                } else if (objectLeft >= targetLeft && objectLeft <= targetRight) {
                    intersectLeft = objectLeft;
                    intersectWidth = object.width - (intersectLeft - targetLeft);
                }

                // Find intersect information for Y axis
                if (targetTop >= objectTop && targetTop <= objectBottom) {
                    intersectTop = targetTop;
                    intersectHeight = obj.height - (intersectTop - objectTop);

                } else if (objectTop >= targetTop && objectTop <= targetBottom) {
                    intersectTop = objectTop;
                    intersectHeight = object.height - (intersectTop - targetTop);
                }

                // Find intersect size (this will be 0 if objects are touching but not overlapping)
                if (intersectWidth > 0 && intersectHeight > 0) {
                    intersectSize = intersectWidth * intersectHeight;
                }

                // Set outer snapping area
                if (obj.left < outerAreaLeft || outerAreaLeft == null) {
                    outerAreaLeft = obj.left;
                }

                if (obj.top < outerAreaTop || outerAreaTop == null) {
                    outerAreaTop = obj.top;
                }

                if ((obj.left + obj.width) > outerAreaRight || outerAreaRight == null) {
                    outerAreaRight = obj.left + obj.width;
                }

                if ((obj.top + obj.height) > outerAreaBottom || outerAreaBottom == null) {
                    outerAreaBottom = obj.top + obj.height;
                }

                // If objects are intersecting, reposition outside all shapes which touch
                if (intersectSize) {
                    var distX = (outerAreaRight / 2) - ((object.left + object.width) / 2);
                    var distY = (outerAreaBottom / 2) - ((object.top + object.height) / 2);

                    // Set new position
                    findNewPos(distX, distY, object, obj);
                }
            }
        });
    }

    // hide popup menu
    function hidePopupMenu() {
        $('#edit-form').css({ 'visibility': 'hidden' });
        $('#sub-menu').css({ 'visibility': 'hidden' });
        $('#path-menu').css({ 'visibility': 'hidden' });
        $('#pathBtns').css({ 'visibility': 'hidden' });
    }

    // set default attributes object
    function setDefaultAttributes(obj) {
        obj.set({
            // isChoosePort: false,
            // port: [],
            colorBorder: '#000',
            widthBorder: 1,
            curve: 0,
            hasShadow: false,
            shadow: null,
            shadowObj: new fabric.Shadow({
                blur: 30,
                color: '#999',
                offsetX: 0,
                offsetY: 0
            }),
            fixed: false,
            position: 'front',

            isMoving: false,
            isRepeat: false,
            isDrawingPath: false,
            speedMoving: 1,
            pathObj: null,
            soundMoving: '',
            nameSoundMoving: '',

            blink: false,
            lineStyle: 'solid',

            select: false,
            status: false,
            colorText: '#000',
            colorTextSelected: '#000',
            colorSelected: '#ccc',
            colorUnselected: '#fff',
            soundSelected: '',
            nameSoundSelected: '',
            soundUnselected: '',
            nameSoundUnselected: '',

            input: false,
            soundTyping: '',
            nameSoundTyping: '',

            snap: false,
            soundSnap: 'assets/song/snap.mp3',
            nameSoundSnap: '',
        });
    }

    // call this function to create attributes and event for object
    function startActiveObject(obj) {
        // audio object
        const audio = new Audio('');
        obj.playSound = function (name) {
            var link = "";
            if (name == 'selected') link = obj.soundSelected;
            else if (name == 'unselected') link = obj.soundUnselected;
            else if (name == 'typing') link = obj.soundTyping;
            else if (name == 'snap') link = obj.soundSnap;
            if (isDoQuiz) {
                audio.src = "/lib/eduComposeEngine/" + link;
                console.log(audio.src);
            }
            else {
                audio.src = link;
            }
            audio.load();
            audio.play();
        }

        //const movingSound = new Audio(soundMoving)
        //movingSound.loop = true;

        obj.startMoving = function () {
            startPathAnimation(obj);

            if (obj.soundMoving != '') {
                movingSound.src = obj.soundMoving;
                movingSound.load();
                movingSound.play();
            }
        }

        obj.stopAudio = function () {
            audio.pause();
            movingSound.pause();
        }

        // start object animation if isMoving
        if (obj.isMoving) obj.startMoving();
        if (obj.blink) blink(obj);


        if (obj.name == 'quiz-selectObj') {
            selectObjEventHandler(obj);
        }
        else if (obj.name == 'quiz-inputObj') {
            inputObjEventHandler(obj);
        }
        else if (obj.name == 'quiz-matchObj') {
            matchObjEventHandler(obj);
        }
        else {
            obj.on('mousedblclick', function () {
                const editForm = $('#edit-form')[0];

                if (editForm.style.visibility === 'hidden' || activeObject !== this) {
                    activeObject = this;
                    $('#soundSelected')[0].nextElementSibling.innerText = this.nameSoundSelected;
                    $('#soundUnselected')[0].nextElementSibling.innerText = this.nameSoundUnselected;
                    $('#soundTyping')[0].nextElementSibling.innerText = this.nameSoundTyping;
                    $('#soundSnap')[0].nextElementSibling.innerText = this.nameSoundSnap;

                    $('#objBlink')[0].innerText = this.blink ? 'ON' : 'OFF';
                    $('#lineStyle')[0].value = this.lineStyle;

                    $('#objSelect')[0].checked = this.select;
                    $('#objInput')[0].checked = this.input;
                    $('#objSnap')[0].checked = this.snap;
                    $('#objControl')[0].checked = this.hasControls;
                    $('#textColor')[0].value = this.colorText;
                    $('#borderColor')[0].value = this.colorBorder;
                    $('#borderWidth')[0].value = this.widthBorder;
                    $('#objCurve')[0].value = this.curve;
                    $('#objAngle')[0].value = this.angle;
                    $('#objBring')[0].value = this.position;
                    $('#objShadow')[0].innerText = this.hasShadow ? 'On' : 'Off';
                    $('#objFixed')[0].innerText = this.lockMovementX ? 'On' : 'Off';

                    if (this.pathObj) {
                        const value = this.pathObj.path.map(point => (
                            `[${parseInt(point[2])}, ${parseInt(point[1])}]`
                        )).join(' ');
                        $('#pathObj').val(value);
                    }
                    else $('#pathObj').val('Empty');

                    if (this.isMoving) {
                        $('#pathMovingMark').css({ 'left': '33px', 'background': '#ff0000' });
                    }
                    else {
                        $('#pathMovingMark').css({ 'left': '1px', 'background': '#aaa' });
                    }

                    $('#pathMovingRepeat')[0].checked = this.isRepeat;
                    $('#pathMovingSpeed')[0].value = this.speedMoving;
                    $('#soundMoving')[0].nextElementSibling.innerText = this.nameSoundMoving != '' ? this.nameSoundMoving : 'Empty';

                    const zoom = canvas.getZoom();
                    let top = (this.top) * zoom + canvas.viewportTransform[5] - 60;
                    let left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 180;

                    if (this.lineType == 'waving') {
                        top = Math.cos(this.angle) * (this.top) * zoom + canvas.viewportTransform[5] - 60;
                        left = Math.cos(this.angle) * (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 180;
                    }

                    $('#edit-form').css({ 'visibility': 'visible', 'top': top + 'px', 'left': left + 'px' });
                }
                else {
                    hidePopupMenu();
                }
            });

            obj.on('moving', function (options) {
                if (this.snap) {
                    const _this = this;
                    options = options.transform;
                    // Sets corner position coordinates based on current angle, width and height
                    objectSnapCanvas(this);

                    const o1 = {
                        x: this.top + (this.height / 2),
                        y: this.left + (this.width / 2)
                    }

                    // Loop through objects
                    canvas.forEachObject(function (obj) {
                        if (obj === _this || (obj.type == 'circle' && obj.name == 'port')) return;

                        // if (options.target.isContainedWithinObject(obj) || 
                        //     options.target.intersectsWithObject(obj) || 
                        //     obj.isContainedWithinObject(options.target)) 
                        // {   

                        // }

                        const o2 = {
                            x: obj.top + (obj.height / 2),
                            y: obj.left + (obj.width / 2)
                        }

                        if (Math.sqrt((o1.x - o2.x) ** 2 + (o1.y - o2.y) ** 2) < snap) {
                            _this.top = o2.x - (_this.height / 2);
                            _this.left = o2.y - (_this.width / 2);

                            if (isMakingAnswer) {
                                const check = correctAnswers.find(item => item.id == object.objectID);
                                if (!check) {
                                    correctAnswers.push({
                                        id: object.objectID,
                                        name: 'input'
                                    });
                                    console.log('correct answer:', orrectAnswers);
                                }
                            }
                            else if (isDoQuiz) {
                                const check = userAnswers.find(item => item.id == object.objectID);
                                if (!check) {
                                    userAnswers.push({
                                        id: object.objectID,
                                        name: 'input'
                                    });
                                    console.log('user answer:', userAnswers);
                                }
                            }

                            _this.playSound('snap');
                        }
                        else {
                            if (isMakingAnswer) {
                                correctAnswers = correctAnswers.filter(item => item.id != object.objectID);
                                console.log('correct answer:', orrectAnswers);
                            }
                            else if (isDoQuiz) {
                                userAnswers = userAnswers.filter(item => item.id != object.objectID);
                                console.log('user answer:', userAnswers);
                            }
                        }
                    });

                    this.setCoords();
                }

                if ($('#edit-form')[0]?.style?.visibility === 'visible') {
                    hidePopupMenu();
                }
            });

            obj.on('mouseup', function () {
                obj.stopAudio();
            });

            changeCoordinateConnectLine(obj);
        }

    }

    // handle select obj type
    function selectObjEventHandler(obj) {
        obj.on('mousedown', function () {
            // console.log('mousedown');
            if (isCreateQuiz && (isMakingAnswer || isDoQuiz)) {
                this.select = !this.select;
                if (this.select) {
                    this._objects[0].set({
                        fill: this.colorSelected
                    });
                    this._objects[1].set({
                        fill: this.colorTextSelected
                    });
                    this.playSound('selected');

                    const answer = {
                        id: this.objectID,
                        name: 'select-obj-quiz',
                        value: this.text
                    }
                    if (isMakingAnswer) {
                        correctAnswers.push(answer);
                    }
                    else if (isDoQuiz) {
                        console.log(userAnswers);
                        userAnswers.push(answer);
                    }
                }
                else {
                    this._objects[0].set({
                        fill: this.colorUnselected
                    });
                    this._objects[1].set({
                        fill: this.colorText
                    });
                    this.playSound('unselected');

                    if (isMakingAnswer) {
                        correctAnswers = correctAnswers.filter(item => item.id != this.objectID);
                    }
                    else if (isDoQuiz) {
                        console.log(userAnswers);
                        userAnswers = userAnswers.filter(item => item.id != this.objectID);
                    }
                }

                if (isMakingAnswer) {
                    correctAnswerBox.text = correctAnswers.map(item => item.value).join(' ');
                }
                else if (isDoQuiz) {
                    console.log(userAnswerBox);
                    userAnswerBox.text = userAnswers.map(item => item.value).join(' ');
                }

                canvas.requestRenderAll();

            }
        });
    }

    // handle input obj type
    function inputObjEventHandler(item) {
        if (isDoQuiz) {
            item.set({
                lockMovementX: true,
                lockMovementY: true,
                snap: true
            });
        }

        // item.on('mousedblclick', function() {
        //     activeObject = this;

        //     const editForm = $('#edit-form')[ 0 ];

        //     if(editForm.style.visibility === 'hidden') {
        //         $('#soundSelected')[ 0 ].nextElementSibling.innerText = this.nameSoundSelected;
        //         $('#soundUnselected')[ 0 ].nextElementSibling.innerText = this.nameSoundUnselected;
        //         $('#soundTyping')[ 0 ].nextElementSibling.innerText = this.nameSoundTyping;
        //         $('#soundSnap')[ 0 ].nextElementSibling.innerText = this.nameSoundSnap;

        //         $('#objSelect')[ 0 ].checked = this.select;
        //         $('#objInput')[ 0 ].checked = this.input;
        //         $('#objSnap')[ 0 ].checked = this.snap;
        //         $('#objControl')[ 0 ].checked = this.hasControls;
        //         $('#textColor')[ 0 ].value = this.colorText;
        //         $('#borderColor')[ 0 ].value = this.colorBorder;
        //         $('#borderWidth')[ 0 ].value = this.widthBorder;
        //         $('#objCurve')[ 0 ].value = this.curve;
        //         $('#objAngle')[ 0 ].value = this.angle;
        //         $('#objBring')[ 0 ].value = this.position;
        //         $('#objShadow')[ 0 ].innerText = this.hasShadow ? 'On' : 'Off';
        //         $('#objFixed')[ 0 ].innerText = this.lockMovementX ? 'On' : 'Off';

        //         const zoom = canvas.getZoom();
        //         const top = (this.top) * zoom + canvas.viewportTransform[ 5 ] - 60;
        //         const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[ 4 ] - 180;

        //         $('#edit-form').css({ 'visibility': 'visible', 'top': top + 'px', 'left': left + 'px' });
        //     }
        //     else {
        //         hidePopupMenu();
        //     }
        // });
        item.on('mouseup', function () {
            // console.log(item);
            if (isCreateQuiz && (isMakingAnswer || isDoQuiz)) {
                var object = this;
                objectMiro = null;
                if (object.clicked) {
                    // console.log('here 1');

                    let obj = object.item(1);
                    // console.log(obj.fontSize * object.scaleY);
                    let textForEditing = new fabric.Textbox(obj.text, {
                        top: object.top + object.height * object.scaleY / 2 - obj.fontSize * object.scaleY / 2,
                        left: object.left,
                        fontSize: obj.fontSize * object.scaleY,
                        fontFamily: obj.fontFamily,
                        width: object.item(0).width * object.scaleX,
                        hasBorders: false,
                        textAlign: "center",
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                    })

                    // console.log(textForEditing);
                    // hide group inside text
                    obj.visible = false;
                    // note important, text cannot be hidden without this
                    // object.addWithUpdate();

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
                            text: newVal.toUpperCase(),
                            visible: true,
                            // width: textForEditing.width,
                            // left: textForEditing.left,

                            // fontSize: textForEditing.fontSize,
                            // fontFamily: textForEditing.fontFamily,
                            textAlign: "center",
                        });

                        if (newVal && newVal != '') {
                            const answer = {
                                id: this.objectID,
                                name: 'input-obj-quiz',
                                value: newVal.toUpperCase()
                            }
                            if (isMakingAnswer) {
                                var indexId = correctAnswers.findIndex(x => x.id == answer.id);
                                if (indexId != -1) {
                                    correctAnswers[indexId].value = newVal;
                                }
                                else {
                                    correctAnswers.push(answer);
                                }
                            }
                            else if (isDoQuiz) {
                                // console.log(userAnswers);
                                var indexId = userAnswers.findIndex(x => x.id == answer.id);
                                if (indexId != -1) {
                                    userAnswers[indexId].value = newVal;
                                }
                                else {
                                    userAnswers.push(answer);
                                }
                            }
                        }
                        else {
                            if (isMakingAnswer) {
                                correctAnswers = correctAnswers.filter(item => item.id != this.objectID);
                            }
                            else if (isDoQuiz) {
                                // console.log(userAnswers);
                                userAnswers = userAnswers.filter(item => item.id != this.objectID);
                            }
                        }
                        // console.log('test', object, obj);
                        // comment before, you must call this
                        // object.addWithUpdate();

                        // we do not need textForEditing anymore
                        textForEditing.visible = false;
                        canvas.remove(textForEditing);

                        // optional, buf for better user experience
                        canvas.setActiveObject(object);

                        if (isMakingAnswer) {
                            correctAnswerBox.text = correctAnswers.map(item => item.id + ' - ' + item.value).join(', ');
                        }
                        else if (isDoQuiz) {
                            // console.log(userAnswerBox);
                            userAnswerBox.text = userAnswers.map(item => item.id + ' - ' + item.value).join(', ');
                        }
                    })
                    object.clicked = false;
                } else {
                    // console.log('here 2');

                    // object.set({
                    //     width: object.item(0).width,
                    //     height: object.item(0).height,
                    // })

                    canvas.requestRenderAll();

                    // console.log('obj', object);

                    objectMiro = object;
                    object.clicked = true;
                }
            }
        });
        item.on('moving', function () {
            if (this.snap) {

                objectSnapCanvas(this);
                objectSnapAdjacent(this);
            }


            if ($('#edit-form')[0]?.style?.visibility === 'visible') {
                hidePopupMenu();
            }
        });
        changeCoordinateConnectLine(item);
    }

    // handle match obj type
    var correctAnswerMatch = [];
    var correctAnswerPosition = [];
    var userResultPosition = [];
    var oldObject;
    function matchObjEventHandler(obj) {
        obj.checked = false;
        obj.checkCorrect = false;
        if (obj.isDrop !== true && obj.isDrag !== true && obj.isBackground !== true) {
            obj.pos = 'front';
            obj.isBackground = false;
        }
        if (obj.isDrop) {
            repositionDragDrop(obj);
        }
        if (obj.isDrag) {
            obj.snap = true;
            obj.shadowObj = new fabric.Shadow({
                blur: 30,
                color: '#000',
                offsetX: 0,
                offsetY: 0
            });
        }
        obj.on('mousedown', function () {
            if (oldObject) {
                oldObject.shadow = null;
            }
            this.shadow = this.shadowObj;
            oldObject = this;
        })
        obj.on('mousedblclick', function () {
            activeObject = this;

            const editForm = $('#edit-form')[0];

            if (editForm.style.visibility === 'hidden') {
                $('#soundSelected')[0].nextElementSibling.innerText = this.nameSoundSelected;
                $('#soundUnselected')[0].nextElementSibling.innerText = this.nameSoundUnselected;
                $('#soundTyping')[0].nextElementSibling.innerText = this.nameSoundTyping;
                $('#soundSnap')[0].nextElementSibling.innerText = this.nameSoundSnap;

                $('#objSelect')[0].checked = this.select;
                $('#objInput')[0].checked = this.input;
                $('#objSnap')[0].checked = this.snap;
                $('#objControl')[0].checked = this.hasControls;
                $('#textColor')[0].value = this.colorText;
                $('#borderColor')[0].value = this.colorBorder;
                $('#borderWidth')[0].value = this.widthBorder;
                $('#objCurve')[0].value = this.curve;
                $('#objAngle')[0].value = this.angle;
                $('#objBring')[0].value = this.position;
                $('#objShadow')[0].innerText = this.hasShadow ? 'On' : 'Off';
                $('#objVessel')[0].innerText = this.lockMovementX ? 'On' : 'Off';
                $('#bgToggle')[0].innerText = this.isBackground === true ? 'On' : 'Off';

                const zoom = canvas.getZoom();
                const top = (this.top) * zoom + canvas.viewportTransform[5] - 60;
                const left = (this.left + (this.width / 2) * this.scaleX) * zoom + canvas.viewportTransform[4] - 180;

                $('#edit-form').css({ 'visibility': 'visible', 'top': top + 'px', 'left': left + 'px' });
            }
            else {
                hidePopupMenu();
            }
        })

        obj.on('moving', function (options) {
            if (this.snap && this.isDrop != true) {
                const _this = this;
                options = options.transform;
                // Sets corner position coordinates based on current angle, width and height
                objectSnapCanvas(this);

                const o1 = {
                    x: this.top + (this.height / 2),
                    y: this.left + (this.width / 2)
                }

                // Loop through objects
                canvas.forEachObject(function (obj) {
                    if (obj === _this || (obj.name && obj.name === 'port')) return;

                    const o2 = {
                        x: obj.top + (obj.height / 2),
                        y: obj.left + (obj.width / 2)
                    }
                    // drag drop quiz handle add - Kiet
                    if (Math.sqrt((o1.x - o2.x) ** 2 + (o1.y - o2.y) ** 2) < snap) {
                        if (_this.isDrag === true) {
                            if (obj.isDrop === true) { // create answer on correct snap
                                if (_this.checked === false) {
                                    if (isMakingAnswer) {
                                        correctAnswerMatch.push(_this.answerId + '-' + obj.answerId);
                                        var positionObj = {
                                            id: _this.answerId,
                                            targetId: obj.answerId,
                                            top: o2.x - (_this.height / 2),
                                            left: o2.y - (_this.width / 2)
                                        }
                                        correctAnswerPosition.push(positionObj);
                                        console.log(correctAnswerMatch);
                                    }
                                    else if (isDoQuiz) {
                                        userResult.push(_this.answerId + '-' + obj.answerId); // write user result
                                        var positionObj = {
                                            id: _this.answerId,
                                            targetId: obj.answerId,
                                            top: o2.x - (_this.height / 2),
                                            left: o2.y - (_this.width / 2)
                                        }
                                        userResultPosition.push(positionObj);
                                    }
                                    _this.checked = true;
                                    _this.linkedId = obj.answerId;
                                    _this.top = o2.x - (_this.height / 2);
                                    _this.left = o2.y - (_this.width / 2);

                                    _this.playSound('snap');
                                }
                            }
                        }
                        else if (_this.isDrop === true) {
                            // do nothing
                        }
                        else {
                            _this.top = o2.x - (_this.height / 2);
                            _this.left = o2.y - (_this.width / 2);

                            _this.playSound('snap');
                        }
                    }
                    else {
                        if (_this.isDrag === true) {
                            if (_this.checked === true) {
                                if (_this.linkedId === obj.answerId) {
                                    _this.checked = false;
                                    if (isMakingAnswer) {
                                        var index = correctAnswerMatch.findIndex(x => x === (_this.answerId + '-' + _this.linkedId));
                                        correctAnswerMatch.splice(index, 1);
                                        var indexPosition = correctAnswerPosition.findIndex(x => x.id === _this.answerId);
                                        correctAnswerPosition.splice(indexPosition, 1);
                                    }
                                    if (isDoQuiz) {
                                        var index = userResult.findIndex(x => x === (_this.answerId + '-' + _this.linkedId));
                                        userResult.splice(index, 1);
                                    }
                                    console.log(correctAnswerMatch);
                                }
                            }
                        }
                    }

                    if (isMakingAnswer) {
                        correctAnswerBox.text = correctAnswerMatch.map(item => item).join(', ');
                        correctPositionBox.text = correctAnswerPosition.map(item => item.id + ' - ' + item.top + ' - ' + item.left).join(', ');
                    }
                    else if (isDoQuiz) {
                        userAnswerBox.text = userResult.map(item => item).join(', ');
                    }
                });

                this.setCoords();

            }

            // console.log('obj moving',);

            if ($('#edit-form')[0]?.style?.visibility === 'visible') {
                hidePopupMenu();
            }
        })

        changeCoordinateConnectLine(obj);
    }

    // obj moving on path animation
    function moveToPoint(object, path, index, pos, reverse) {
        if (object.isMoving) {
            if (0 <= index && index < path.length) {
                object.animate('left', path[index][pos] - object.width / 2 * object.scaleX, {
                    duration: 100 / object.speedMoving,
                    onChange: canvas.renderAll.bind(canvas),
                });

                object.animate('top', path[index][pos + 1] - object.height / 2 * object.scaleY, {
                    duration: 100 / object.speedMoving,
                    onChange: canvas.renderAll.bind(canvas),
                    onComplete: function () {
                        if (reverse) {
                            if (path[index].length == 5 && pos == 3) moveToPoint(object, path, index, 1, reverse);
                            else if (index > 0 && path[index - 1].length == 5 && pos == 1) moveToPoint(object, path, --index, 3, reverse);
                            else moveToPoint(object, path, --index, 1, reverse);
                        }
                        else {
                            if (path[index].length == 5 && pos == 1) moveToPoint(object, path, index, 3, reverse);
                            else moveToPoint(object, path, ++index, 1, reverse);
                        }
                    },
                });
            }
            else if (object.isRepeat) {
                if (index >= path.length) moveToPoint(object, path, path.length - 1, 1, !reverse);
                else moveToPoint(object, path, 0, 1, !reverse)
            }
            else {
                $('#pathMovingMark').css({ 'left': '1px', 'background': '#aaa' });
                activeObject.isMoving = false;
            }
        }
    }
    function startPathAnimation(object) {
        object.objectCaching = true;
        moveToPoint(object, object.pathObj.path, 0, 1, false);
    }

    // load sound form input with input, label form html
    function loadSoundInput(target) {
        const file = target.files[0];
        const blob = window.URL || window.webkitURL;
        const label = target.nextElementSibling;
        var fullPath = target.value;
        let name;

        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            name = fullPath.substring(startIndex);
            if (name.indexOf('\\') === 0 || name.indexOf('/') === 0) {
                name = name.substring(1);
            }
            label.innerHTML = name;
        }

        const src = blob.createObjectURL(file);

        return { name, src };
    }


    function screenshotCapture(screenshotImg) {
        const context = canvas.getContext("2d");
        const video = document.createElement("video");

        navigator.mediaDevices.getDisplayMedia()
            .then(captureStream => {
                video.srcObject = captureStream;
                context.drawImage(video, 0, 0, window.width, window.height);

                const src = canvas.toDataURL("image/png");

                captureStream.getTracks().forEach(track => track.stop());
                screenshotImg.src = src;
                screenshotImg.style.height = window.height / window.width * screenshotImg.width + 'px';
                screenshotImg.style.display = 'block';

                $('.screenshot-popup-class').css({ 'left': '230px' })
            })
            .catch(err => {
                console.error("Screenshot Error: " + err);
            })
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
            math?.appendChild(p)
        }
        else if (listOfSymbol[i].group == "physics") {
            physics?.appendChild(p);
        }

        else if (listOfSymbol[i].group == "chemistry") {
            chemistry?.appendChild(p);
        }

    }

    // Icon svg
    let iconSVG = document.getElementById("iconSVG");
    let listIconImg = [
        'coffee_brand_design_elements_beans_cup_machine_icons_6835690.jpg',
        'construction_design_elements_machines_signboard_sketch_flat_classic_6852449.jpg',
        'construction_work_design_elements_heavy_machines_sketch_6852448.jpg',
        'farm_design_elements_machine_windmill_sty_warehouse_icons_6839790.jpg',
        'future_life_painting_children_modern_machine_cartoon_design_6840694.jpg',
        'heavy_construction_machines_icons_isolated_with_yellow_color_6825965.jpg',
        'sewing_work_design_elements_colored_machine_tools_icons_6839755.jpg',
        'slot_machine_icons_310830.jpg',
        'tailor_design_elements_sewing_machine_ruler_mannequin_icons_6839643.jpg',
        'vintage_painting_flora_bird_sewing_machine_sketch_6843416.jpg',
        'forest.png',
        'cloud.png',
        'babane.png',
        'bg.png',
        'carrot.png',
        'chestnus.png',
        'empty.png',
        'Fish.png',
        'item1.png',
        'item2.png',
        'item3.png',
        'item4.png',
        'item5.png',
        'item6.png',
        'item7.png',
        'item8.jpg',
        'ban-ve.png',
        '3069d8b5a4933c84b89ef1253ad7589a.png',
        'battle.png',
        'blower.png',
        'chemistry.png',
        'chemistry2.png',
        'chemistry3.png',
        'conduit.png',
        'extraction-flask.png',
        'extraction-tube.png',
        'ledaihanh.png',
        'Ly-Thuong-Kiet.png',
        'map.png',
        'pham-ngu-lao.png',
        'PhungHung.png',
        'pick-up-test-tube.png',
        'shake-test-tube.png',
        'sodier.png',
        'sodier2.png',
        'sodier3.png',
        'sodier4.png',
        'sodier5.png',
        'sodier6.png',
        'tranhungdao.png',
        'tranquoc toan.png',
        'tube1.png',
        'tube2.png',
        'tube3.png',
        'tube4.png',
        'tube5.png',
        'tube6.png',
        'tube7.png',
        'tube8.png',
        'tube9.png',
        'tube10.png',
        'tube11.png',
        'tube12.png',
        'tube13.png',
        'tube14.png',
        'tube15.png',
        'tubes.png',
        'tubes2.png',
        'tubes3.png',
        'tubes4.png',
        'warrior1.png',
        'warrior2.png',
        'warrior3.png',
        'warrior4.png',
        'warrior5.png',
        'warrior6.png',
        'warrior7.png',
        'warrior8.png',
        'warrior9.png',
        'warrior10.png',
        'warrior11.png',
        'warrior12.png',
        'warrior13.png',
        'warrior14.png',
        'warrior15.png',
        'warrior16.png',
        'warrior17.png',
    ];

    let listIconSVG = [
        'bird.svg',
        'cloud-computing-svgrepo-com.svg',
        'leaves.svg',
        'leaves2.svg',
        'Peileppe-3-flowers.svg',
        'tree-svgrepo-com.svg',
        'twitter-bird-evandro.svg',
    ]

    for (let i = 0; i < listIconSVG.length; i++) {
        let p = document.createElement("p");

        p.className = 'tooltip-wrap';
        let img = document.createElement("img");
        // img.src = `/assets/images/notepad/svg/${listIconImg[ i ]}`;


        img.src = `assets/images/notepad/svg/${listIconSVG[i]}`;
        p.appendChild(img);
        p.onclick = function (e) { createSVG(img.src) };
        iconSVG?.appendChild(p);
    }
    for (let i = 0; i < listIconImg.length; i++) {
        let p = document.createElement("p");

        p.className = 'tooltip-wrap';
        let img = document.createElement("img");
        // img.src = `/assets/images/notepad/svg/${listIconImg[ i ]}`;


        img.src = `assets/images/notepad/svg/${listIconImg[i]}`;
        p.appendChild(img)
        p.onclick = function (e) { createIcon(img) };
        iconSVG?.appendChild(p);
    }


    function createSVG(svg) {
        fabric.loadSVGFromURL(svg, function (objects, options) {
            const svg = fabric.util.groupSVGElements(objects, options);
            const maxWidth = 100;
            const maxHeight = 80;

            // resize svg if size is too large
            if (svg.width > maxWidth) {
                svg.scaleToWidth(maxWidth);
            }
            if (svg.height > maxHeight) {
                svg.scaleToHeight(maxHeight);
            }

            svg.set({
                top: 100,
                left: 100,
                name: 'svg',
                objectID: randomID()
            })

            setDefaultAttributes(svg);
            startActiveObject(svg);
            canvas.add(svg);
        })
    }

    function createIcon(url) {
        let icon = new fabric.Image(url, {
            top: 100,
            left: 100,
            name: 'svg',
            objectID: randomID()
        })

        const maxWidth = 100;
        const maxHeight = 80;

        // resize svg if size is too large
        if (icon.width > maxWidth) {
            icon.scaleToWidth(maxWidth);
        }
        if (icon.height > maxHeight) {
            icon.scaleToHeight(maxHeight);
        }

        setDefaultAttributes(icon);
        startActiveObject(icon);

        canvas.add(icon);
        let layer_num = $('#layers-body .active').attr('data-cnt');
        isLoadDataLocal = false;
        emitEvent(layer_num);
    }




    // create a img object
    function imageMode(e) {
        fabric.Image.fromURL(e.target.result, function (img) {
            //i create an extra var for to change some image properties
            const maxWidth = 600;
            const maxHeight = 400;

            if (img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
            }

            if (img.height > maxHeight) {
                img.scaleToHeight(maxHeight);
            }

            img.set({
                top: 100,
                left: 100,
                name: 'image',
                objectID: randomID()
            })

            setDefaultAttributes(img);
            startActiveObject(img);

            canvas.add(img);
            canvas.sendToBack(img);

            let layer_num = $('#layers-body .active').attr('data-cnt');
            isLoadDataLocal = false;
            emitEvent(layer_num);

        });
    }
    function imageQuizMatchMode(e, value, isDrag) {
        fabric.Image.fromURL(e.target.result, function (img) {
            //i create an extra var for to change some image properties
            const maxWidth = 600;
            const maxHeight = 400;

            if (img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
            }

            if (img.height > maxHeight) {
                img.scaleToHeight(maxHeight);
            }

            img.set({
                top: canvas.height / 2 - img.height / 2,
                left: canvas.width / 2 - img.width / 2
            })
            img.name = 'quiz-matchObj';
            img.isDrag = true;
            img.answerId = value;

            setDefaultAttributes(img);
            startActiveObject(img);

            canvas.add(img);
            canvas.sendToBack(img);

            let layer_num = $('#layers-body .active').attr('data-cnt');
            isLoadDataLocal = false;
            emitEvent(layer_num);

        });
    }

    function createTextBox(obj) {
        var textbox = new fabric.Textbox('Text', {
            fontSize: 12,
            fontFamily: 'Time New Roman',
            originX: 'center',
            originY: 'center',
            left: obj.left,
            top: obj.top,
            fill: '#333',
            textAlign: 'center',
        });

        let group = new fabric.Group([obj, textbox], {
            top: 100,
            left: 100,
            name: obj.type,
            subTargetCheck: false
        });

        setDefaultAttributes(group);
        startActiveObject(group);

        return group;
    }

    //Fabric cho đối tượng hình học (Geometric)
    function iconCricle(e) {
        //Vẽ hình tròn
        var circle = new fabric.Circle({
            radius: 50,
            stroke: '#000',
            strokeWidth: 1,
            fill: '#fff',
            originX: 'center',
            originY: 'center'
        });

        getTextForObject(createTextBox(circle));
    }


    // Vẽ hình tam giác
    function iconTriange(e) {
        var triangle = new fabric.Triangle({
            width: 100,
            height: 100,
            stroke: '#000',
            strokeWidth: 1,
            fill: '#fff',
            originX: 'center',
            originY: 'center'

        });
        getTextForObject(createTextBox(triangle));
    }

    //Vẽ hình elip
    function iconElipse(e) {
        var elipse = new fabric.Ellipse({
            rx: 80,
            ry: 40,
            stroke: '#000',
            strokeWidth: 1,
            fill: '#fff',
            originX: 'center',
            originY: 'center'
        });

        getTextForObject(createTextBox(elipse));
    }

    // Vẽ hình chữ nhật
    function iconRect(e) {
        var rect = new fabric.Rect({
            width: 100,
            height: 100,
            stroke: '#000',
            strokeWidth: 1,
            fill: '#fff',
            originX: 'center',
            originY: 'center',
            rx: 0,
            ry: 0
        });

        rect.on('scaling', function () {
            console.log('scaling');
            this.set({
                width: this.width * this.scaleX,
                height: this.height * this.scaleY,
                scaleX: 1,
                scaleY: 1
            })
        })

        getTextForObject(createTextBox(rect));
    }

    // Vẽ hình chữ nhật
    function iconRoundedRect(e) {
        var roundedRect = new fabric.Rect({
            width: 100,
            height: 100,
            stroke: '#000',
            strokeWidth: 1,
            fill: '#fff',
            originX: 'center',
            originY: 'center',
            rx: 10,
            ry: 10
        });

        roundedRect.on('scaling', function () {
            this.set({
                width: this.width * this.scaleX,
                height: this.height * this.scaleY,
                scaleX: 1,
                scaleY: 1
            })
        })

        getTextForObject(createTextBox(roundedRect));
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
            originY: 'center'
        });

        getTextForObject(createTextBox(rect));

    }

    // Vẽ hình lục giác
    function iconPolygon(e) {
        var poly = new fabric.Polygon([

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
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 0.5,
            scaleY: 0.5,
            left: -55,
            top: -60,
            originX: 'center',
            originY: 'center'
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
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 2,
            scaleY: 2,
            top: -40,
            left: -50,
            originX: 'center',
            originY: 'center'
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
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 2,
            scaleY: 2,
            top: -40,
            left: -60,
            originX: 'center',
            originY: 'center'
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
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 2,
            scaleY: 2,
            top: -40,
            left: -80,
            originX: 'center',
            originY: 'center'
        });
        getTextForObject(createTextBox(poly));
    }

    // Hình ngôi sao
    function iconStar(e) {
        var poly = new fabric.Path(
            "M 251 30.5725 C 239.505 33.871 233.143 56.2086 228.247 66 L 192.247 139 C 187.613 148.267 183.524 162.173 176.363 169.682 C 170.726 175.592 151.9 174.914 144 176 L 57 188.729 C 46.5089 190.241 22.8477 189.409 18.0093 201.015 C 12.21 214.927 32.8242 228.824 41 237 L 95 289.83 C 104.569 298.489 120.214 309.405 126.11 321 C 130.001 328.651 123.466 345.797 122.081 354 L 107 442 C 105.042 452.114 99.142 469.478 105.228 478.895 C 109.142 484.95 116.903 484.628 123 482.64 C 137.319 477.973 151.822 468.444 165 461.139 L 232 425.756 C 238.285 422.561 249.81 413.279 257 415.071 C 268.469 417.93 280.613 427.074 291 432.691 L 359 468.258 C 369.618 473.739 386.314 487.437 398.985 483.347 C 413.495 478.664 405.025 453.214 403.25 443 L 388.75 358 C 387.045 348.184 380.847 332.006 383.194 322.285 C 385.381 313.225 403.044 300.467 410 294.424 L 469 237 C 477.267 228.733 493.411 218.004 492.941 205 C 492.398 189.944 465.753 190.478 455 189 L 369 176.421 C 359.569 175.025 343.388 175.914 335.213 170.976 C 328.335 166.822 323.703 151.166 320.576 144 L 289.753 82 L 268.532 39 C 264.58 32.6459 258.751 28.3485 251 30.5725 z"
            ,

            {
                stroke: getColor(),
                strokeWidth: 3,
                fill: '#fff',
                scaleX: 0.2,
                scaleY: 0.2,
                top: -50,
                left: -50,
                originX: 'center',
                originY: 'center'
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
            stroke: getColor(),
            strokeWidth: 1,
            fill: '#fff',
            top: -40,
            left: -60,
            originX: 'center',
            originY: 'center'
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
            stroke: getColor(),
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 1.5,
            scaleY: 1.5,
            left: -30,
            top: -30,
            originX: 'center',
            originY: 'center'
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
            stroke: getColor(),
            strokeWidth: 1,
            fill: '#fff',
            scaleX: 0.5, scaleY: 0.5,
            top: -25,
            left: -75,
            originX: 'center',
            originY: 'center'
        });
        getTextForObject(createTextBox(traperzoid));
    }

    function iconHeart(e) {
        var arrow = new fabric.Path(
            'M10,6 Q10,0 15,0 T20,6 Q20,10 15,14 T10,20 Q10,18 5,14 T0,6 Q0,0 5,0 T10,6 Z',
            {
                stroke: getColor(),
                strokeWidth: 0.2,
                fill: '#fff',
                scaleX: 4.5,
                scaleY: 4.5,
                top: -45,
                left: -45,
                originX: 'center',
                originY: 'center'
            });
        getTextForObject(createTextBox(arrow));
    }


    var name = $('#display_name ').attr('value');

    //var name = Math.round($.now() * Math.random());
    function emitEvent(layer_num) {
        if (!isLoadDataLocal) {
            let json = canvas.getObjects();
            // canvas.item(json.length - 1).clone(async (lastObject) => {
            //     if(lastObject) {
            //         lastObject.stroke = getColor();
            //         lastObject.strokeWidth = getPencil();
            //         lastObject.objectID = randomID();

            //         let data = {
            //             w: w,
            //             h: h,
            //             'drawing': drawing,
            //             'color': getColor(),
            //             'id': id,
            //             'userID': userID,
            //             'objectID': randomID(),
            //             'username': username,
            //             'spessremo': getPencil(),
            //             'room': stanza,
            //             'layer': layer_num - 3,
            //             data: lastObject
            //         };
            //         // console.log(data);
            //         //console.log(data);
            //         pool_data.push(data);

            //     }
            // })
            var lastItem = canvas.item(json.length - 1);
            const objectID = randomID();
            canvas.item(json.length - 1).set({
                objectID: objectID,
                userID: userID
            })
            if (canvas.item(json.length - 1)._objects /* && canvas.item(json.length - 1)._objects.length > 2 && canvas.item(json.length - 1)._objects[0].type != 'image' */) {
                // addPort(canvas.item(json.length - 1), canvas, objectID);
            }
            canvas.requestRenderAll();
        }
    }

    fabric.Textbox.prototype.onKeyDown = (function (onKeyDown) {
        return function (e) {
            if (e.keyCode == 16) {
                shift = true;
                return;
            }
            else if (e.keyCode === 17) { // remove ctrl key check for ctrl + c/v
                ctrlDown = false;
            }
            else if (e.keyCode == 13 && !shift)
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
        'selection:created': onObjectSelected,
        'selection:cleared': onSelectionCleared
    });

    function onObjectSelected(e) {
        var activeObject = e.target;

        if (activeObject) {
            if (activeObject.name == "p0" || activeObject.name == "p2") {
                activeObject.line2.animate('opacity', '1', {
                    duration: 200,
                    onChange: canvas.renderAll.bind(canvas),
                });
                activeObject.line2.selectable = true;
            }
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
            else if (activeObject.name == "curve-point") {
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
        function updateCoords() {
            let connectors = canvas.getObjects().filter(value =>
                value.name == "lineConnect" &&
                (
                    value.idObject1 === obj.objectID ||
                    value.idObject2 === obj.objectID
                )
            );

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
                        let portCenterPoint = findTargetPort(obj);
                        connectors[i].path[1][3] = portCenterPoint.x2;
                        connectors[i].path[1][4] = portCenterPoint.y2;
                        movelinename(canvas, obj.objectID, portCenterPoint.y2, portCenterPoint.x2, connectors[i].port2)
                    }
                }
            }
        }
        obj.on('moving', updateCoords);
        obj.on('scaling', updateCoords);
    }


    let isMouseDown = false;
    let connectorLineFromPort = null;
    let connectorLine = null;
    let corner = null;
    let objectMiro = null;
    function mouseUp(obj) {
        let object = obj.target;
        objectMiro = null;
        if (!isChoosePort && object.type === 'group' && object.name !== 'quiz') {
            try {
                if (object.item(0).type === 'textbox') {
                    console.log('1');
                    if (object.clicked) {

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
                            // optional, buf for better user experience
                            canvas.setActiveObject(object);
                        })
                        object.clicked = false;
                    }
                    else {
                        $('#align').css({ 'display': "none" });
                        $('#back-color-button').css({ 'display': "none" })
                        objectMiro = object;
                        object.clicked = true;
                    }
                } else if (object.item(1).type === 'textbox') {
                    // console.log('2');
                    if (object.clicked) {
                        // console.log('here 1');

                        let obj = object.item(1);
                        let textForEditing = new fabric.Textbox(obj.text, {
                            top: object.top + object.height * object.scaleY / 2 - obj.fontSize * object.scaleY / 2,
                            left: object.left,
                            fontSize: obj.fontSize * object.scaleY,
                            fontFamily: obj.fontFamily,
                            width: object.item(0).width * object.scaleX,
                            textAlign: "center",
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY,
                        })

                        // console.log(textForEditing);
                        // hide group inside text
                        obj.visible = false;
                        // note important, text cannot be hidden without this
                        // object.addWithUpdate();

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
                                // width: textForEditing.width,
                                // left: textForEditing.left,

                                // fontSize: textForEditing.fontSize,
                                // fontFamily: textForEditing.fontFamily,
                                textAlign: "center",
                            })
                            // console.log('test', object, obj);
                            // comment before, you must call this
                            // object.addWithUpdate();

                            // we do not need textForEditing anymore
                            textForEditing.visible = false;

                            if (object.input) {
                                if (isMakingAnswer) {
                                    correctAnswers.push({
                                        id: object.objectID,
                                        name: 'input'
                                    });
                                    console.log('correct answer:', orrectAnswers);
                                }
                                else if (isDoQuiz) {
                                    userAnswers.push({
                                        id: object.objectID,
                                        name: 'input'
                                    });
                                    console.log('user answer:', userAnswers);
                                }
                            }
                            canvas.remove(textForEditing);

                            // optional, buf for better user experience
                            canvas.setActiveObject(object);
                        })
                        object.clicked = false;
                    } else {
                        // console.log('here 2');

                        // object.set({
                        //     width: object.item(0).width,
                        //     height: object.item(0).height,
                        // })

                        canvas.requestRenderAll();

                        // console.log('obj', object);

                        objectMiro = object;
                        object.clicked = true;
                    }
                }
                else if (object.item(0).type === 'image' && object._objects.length === 3) {
                    console.log('3');
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

                        isEditText = true;
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
                                // var index = pool_data.findIndex(item => item.objectID == object.objectID && item.layer == layer_num);
                                // // console.log(index);
                                // if (index >= 0) {
                                //     var svg = latexToImg(newVal);
                                //     latex.setSrc(svg, () => {
                                //         pool_data[index].data = object;

                                //         canvas.renderAll();
                                //     })

                                // }
                                // console.log(object.item(0))

                                var svg = latexToImg(newVal);
                                latex.setSrc(svg, () => {

                                    canvas.renderAll();
                                })


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

                            isEditText = false;
                        })
                        object.item(0).clicked = false;
                    }
                    else {

                        object.item(0).clicked = true;
                    }
                }
            }
            catch (error) {
                console.log(error);
            }

        }
    }

    $('#quiz').on('click', function () {
        if (!$(this).hasClass('active')) {
            quizMode = true;

            if (!isCreateQuiz) {
                $('#quiz-create').css({ 'opacity': '1', 'pointer-events': 'auto' });
                $('#quizs-body li:nth-child(n+4):nth-child(-n+10)').css({ 'opacity': '0.5', 'pointer-events': 'none' });
            }
        }
        else {
            quizMode = false;
        }
    })
    $('#quiz-create').on('click', function () {
        canvas.clear();
        $('#quiz-create').css({ 'opacity': '0.5', 'pointer-events': 'none' });
        let quizType = $('#quiz-type').val();
        if (quizType == 'quiz-1') {
            $('#quizs-body li:nth-child(n+4):nth-child(-n+5)').css({ 'opacity': '1', 'pointer-events': 'auto' });
        }
        else {
            $('#quizs-body li:nth-child(n+4):nth-child(-n+6)').css({ 'opacity': '1', 'pointer-events': 'auto' });
            isCreateQuiz = true;
        }
    })
    $('#quiz-save').on('click', function () {
        $('#quiz-create').css({ 'opacity': '1', 'pointer-events': 'auto' });
        $('#quizs-body li:nth-child(n+4):nth-child(-n+10)').css({ 'opacity': '0.5', 'pointer-events': 'none' });
    })

    $('#quiz-type').on('change', function () {
        canvas.clear();
        console.log('quizType changed');
        isCreateQuiz = false;
        isCreateAnswer = false;
        correctAnswers = [];
        userAnswers = [];
        isViewAnswer = false;
        isMakingAnswer = false;
        isDoQuiz = false;
        isChecked = false;
        readyCheck = false;
        isCreateDoquiz = false;

        var quizType = this.value;
        if (quizType == 'quiz-1') {
            $('#open-quiz-modal')[0].style.display = 'block';
            $('#create-table-empty')[0].style.display = 'none';
            $('#normal-addimage')[0].style.display = 'inline-block';
            $('#quiz-addimage')[0].style.display = 'none';
            // $('#sub-menu-background')[ 0 ].style.display = 'none';
            $('#sub-menu-fixed')[0].style.display = 'block';
            $('#sub-menu-vessel')[0].style.display = 'none';
        }
        else if (quizType == 'quiz-2') {
            $('#open-quiz-modal')[0].style.display = 'none';
            $('#create-table-empty')[0].style.display = 'none';
            $('#normal-addimage')[0].style.display = 'inline-block';
            $('#quiz-addimage')[0].style.display = 'none';
            // $('#sub-menu-background')[ 0 ].style.display = 'none';
            $('#sub-menu-fixed')[0].style.display = 'block';
            $('#sub-menu-vessel')[0].style.display = 'none';

            isCreateQuiz = true;
        }
        else if (quizType == 'quiz-3') {
            $('#open-quiz-modal')[0].style.display = 'none';
            $('#create-table-empty')[0].style.display = 'none';
            $('#normal-addimage')[0].style.display = 'none';
            $('#quiz-addimage')[0].style.display = 'inline-block';
            // $('#sub-menu-background')[ 0 ].style.display = 'block';
            $('#sub-menu-fixed')[0].style.display = 'none';
            $('#sub-menu-vessel')[0].style.display = 'block';
        }
        $('#quiz-create').css({ 'opacity': '1', 'pointer-events': 'auto' });
        $('#quizs-body li:nth-child(n+4):nth-child(-n+10)').css({ 'opacity': '0.5', 'pointer-events': 'none' });

    });

    $("#font li").click(function () {

        loadAndUse($(this).attr('value'), activeObject.objectID, canvas);
    })

    $("#size li").click(function () {
        let font_size = parseInt($(this).attr('value'));
        activeObject.item(1).set({
            fontSize: font_size
        })
        try {
            document.getElementById('current-size').innerHTML = font_size + ` <span class="caret">`;
        } catch (e) {
            console.log(e);
        }
        canvas.requestRenderAll();
    })

    $('#objBlink').on('click', function () {
        activeObject.blink = !activeObject.blink;
        if (activeObject.blink) {
            this.innerText = 'ON';
            blink(activeObject);
        }
        else {
            this.innerText = 'OFF';
        }
    })

    $("#textColor").on("input", function () {
        if (activeObject._object.length > 1) {
            activeObject.item(1).set({
                fill: this.value
            });
        }

        canvas.requestRenderAll();
    });

    // soundMode....
    // activeObject.soundMoving = blob.createObjectURL(file);

    // dropdown submenu
    $('#objSelectDropDown').on('click', function () {
        if ($('#objSelectList')[0].style.display == 'none') {
            $('#objSelectList').css({ 'display': 'block' });
            this.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        }
        else {
            $('#objSelectList').css({ 'display': 'none' });
            this.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        }
    });
    $('#objInputDropDown').on('click', function () {
        if ($('#objInputList')[0].style.display == 'none') {
            $('#objInputList').css({ 'display': 'block' });
            this.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        }
        else {
            $('#objInputList').css({ 'display': 'none' });
            this.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        }
    });
    $('#objSnapDropDown').on('click', function () {
        if ($('#objSnapList')[0].style.display == 'none') {
            $('#objSnapList').css({ 'display': 'block' });
            this.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        }
        else {
            $('#objSnapList').css({ 'display': 'none' });
            this.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        }
    });
    $('#objControlDropDown').on('click', function () {
        if ($('#objControlList')[0].style.display == 'none') {
            $('#objControlList').css({ 'display': 'block' });
            this.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        }
        else {
            $('#objControlList').css({ 'display': 'none' });
            this.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        }
    });

    $("#bgColor").on("input", function () {
        if (activeObject._object.length > 0) {
            activeObject.item(0).set({
                fill: this.value
            });
        }
        else {
            activeObject.set({
                fill: this.value
            });
        }
        canvas.requestRenderAll();
    });

    $("#borderColor").on("input", function () {
        if (activeObject._object.length > 0) {
            activeObject.item(0).set({
                stroke: this.value
            });
        }
        canvas.requestRenderAll();
    });

    $("#borderWidth").on("input", function () {
        // if (activeObject.name == 'line-style') {
        //     activeObject._objects.forEach(obj => {
        //         obj.set({
        //             stroke: this.value,
        //         })
        //     })
        // }
        if (activeObject._object.length > 0) {
            activeObject.item(0).set({
                strokeWidth: this.value,
            });
        }
        canvas.requestRenderAll();
    });

    $("#objCurve").on("input", function () {
        if (activeObject.name == 'rect') {
            activeObject.item(0).set({
                rx: this.value,
                ry: this.value
            });
        }
        canvas.requestRenderAll();
    });

    $('#objShadow').on('click', function () {
        if (activeObject.hasShadow) {
            activeObject.hasShadow = false;
            if (activeObject._objects && activeObject._object.length > 0) activeObject.item(0).shadow = null;
            else activeObject.shadow = null;

            this.innerText = 'Off';
        }
        else {
            activeObject.hasShadow = true;
            if (activeObject._objects && activeObject._object.length > 0) activeObject.item(0).shadow = activeObject.shadowObj;
            else activeObject.shadow = activeObject.shadowObj;

            this.innerText = 'On';
        }
        canvas.requestRenderAll();
    });

    $('#objSelect').on('change', function () {
        activeObject.select = !activeObject.select;
        canvas.requestRenderAll();
    });

    $('#objInput').on('change', function () {
        activeObject.input = !activeObject.input;
        canvas.requestRenderAll();
    });

    $('#objSnap').on('change', function () {
        if (activeObject.snap) {
            activeObject.set({
                snap: false
            })
            this.innerText = 'Off';
        }
        else {
            activeObject.set({
                snap: true
            })
            this.innerText = 'On';
        }
        canvas.requestRenderAll();
    });
    // Kiet add background and change object type to drop when fixed
    function repositionDragDrop() {
        canvas.forEachObject(function (obj) {
            if (obj.isDrop === true) {
                obj.set({
                    pos: 'back',
                    lockMovementY: true,
                    lockMovementX: true,
                    selectable: false
                })
                canvas.sendToBack(obj);
            }
        });
        canvas.forEachObject(function (obj) {
            if (obj.isBackground === true) {
                obj.set({
                    pos: 'back',
                    lockMovementY: true,
                    lockMovementX: true,
                    selectable: false
                })
                canvas.sendToBack(obj);
            }
        });
    }

    $('#objControl').on('change', function () {
        if (activeObject.hasControls) {
            activeObject.set({
                hasControls: false
            });
        }
        else {
            activeObject.set({
                hasControls: true
            });
        }
        canvas.requestRenderAll();
    });

    $('#objFixed').on('click', function () {
        if (activeObject.lockMovementX) {
            activeObject.set({
                lockMovementX: false,
                lockMovementY: false
            });
            this.innerText = 'Off';
        }
        else {
            activeObject.set({
                lockMovementX: true,
                lockMovementY: true
            })
            this.innerText = 'On';
        }
        canvas.requestRenderAll();
    })

    $('#objBring').on('click', function () {
        if (activeObject.pos === 'back') {
            activeObject.set({
                pos: 'front'
            })
            canvas.bringToFront(activeObject);
            this.innerText = 'Back';
        }
        else {
            activeObject.set({
                pos: 'back'
            })
            canvas.sendToBack(activeObject);
            this.innerText = 'Front';
        }
        canvas.requestRenderAll();
    })


    $('#objVessel').on('click', function () {
        if (activeObject.lockMovementX) {
            if (activeObject.isDrop === true) {
                activeObject.set({
                    isDrag: true,
                    isDrop: false,
                })
            }
            activeObject.set({
                lockMovementX: false,
                lockMovementY: false
            });
            this.innerText = 'Off';
        }
        else {
            if (activeObject.isDrag === true) {
                activeObject.set({
                    isDrag: false,
                    isDrop: true
                })
                repositionDragDrop();
            }
            activeObject.set({
                lockMovementX: true,
                lockMovementY: true
            })
            this.innerText = 'On';
        }
        canvas.requestRenderAll();
    })

    var quizSetting = {
        textColor: '#000000',
        bgColor: '#ffffff',
        bgSelectColor: '#cccccc',
        textSelectColor: '#000000',
        selectSound: 'assets/song/keypress.mp3',
        correctSound: 'assets/song/correct.mp3',
        incorrectSound: 'assets/song/incorrect.mp3',
    }
    var background;
    $('#bgToggle').on('click', function () {
        if (activeObject.isBackground) {
            activeObject.set({
                isBackground: false,
                isDrag: true,
                isDrop: false,
                lockMovementX: false,
                lockMovementY: false
            });
            this.innerText = 'Off';

            canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        }
        else {
            activeObject.set({
                isBackground: true,
                isDrag: false,
                isDrop: false,
                lockMovementX: true,
                lockMovementY: true,
                correctSound: new Audio(quizSetting.correctSound),
                incorrectSound: new Audio(quizSetting.incorrectSound),
            });
            background = activeObject;
            background.correctSound.volume = 0.6;
            background.incorrectSound.volume = 0.6;
            repositionDragDrop();
            this.innerText = 'On';

            canvas.setBackgroundImage(activeObject, canvas.renderAll.bind(canvas), {
                top: 0,
                left: 0,
                scaleX: canvas.width / activeObject.width,
                scaleY: canvas.height / activeObject.height
            });
        }
        canvas.requestRenderAll();
    })

    $('#bold').on('click', function () {

        if (activeObject._objects.length > 1) {
            if (activeObject.item(1).fontWeight != 'normal') {
                activeObject.item(1).set({
                    fontWeight: 'normal'
                })
            }
            else {
                activeObject.item(1).set({
                    fontWeight: 'bold'
                })
            }

        } else if (activeObject._object.length > 0) {
            if (activeObject.item(0).fontWeight != 'normal') {
                activeObject.item(0).set({
                    fontWeight: 'normal'
                })
            }
            else {
                activeObject.item(0).set({
                    fontWeight: 'bold'
                })
            }
        }
        canvas.requestRenderAll();
    })

    $('#italic').on('click', function () {

        if (activeObject._objects.length > 1) {
            if (activeObject.item(1).fontStyle != 'normal') {
                activeObject.item(1).set({
                    fontStyle: 'normal'
                })
            }
            else {
                activeObject.item(1).set({
                    fontStyle: 'italic'
                })
            }

        } else if (activeObject._object.length > 0) {
            if (activeObject.item(0).fontStyle != 'normal') {
                activeObject.item(0).set({
                    fontStyle: 'normal'
                })
            }
            else {
                activeObject.item(0).set({
                    fontStyle: 'italic'
                })
            }
        }
        canvas.requestRenderAll();
    })

    $('#underline').on('click', function () {

        if (activeObject._objects.length > 1) {
            if (!activeObject.item(1).underline) {
                activeObject.item(1).set({
                    underline: true
                })
            }
            else {
                activeObject.item(1).set({
                    underline: false
                })
            }
        } else if (activeObject._object.length > 0) {
            if (!activeObject.item(1).underline) {
                activeObject.item(0).set({
                    underline: true
                })
            }
            else {
                activeObject.item(0).set({
                    underline: false
                })
            }
        }
        canvas.requestRenderAll();
    });

    $('#menuMore').on('click', function (e) {
        const subMenu = $('#sub-menu')[0];
        if (subMenu.style.visibility === 'hidden') {
            $('#sub-menu').css({ 'visibility': 'visible', 'top': 50 + 'px', 'left': 0 + 'px' });
        }
        else {
            $('#sub-menu').css({ 'visibility': 'hidden' });
        }
    })

    // popup path-menu
    $('#pathMover').on('click', function () {
        const pathMenu = $('#path-menu')[0];
        if (pathMenu.style.visibility === 'hidden') {
            $('#path-menu').css({ 'visibility': 'visible', 'top': 50 + 'px', 'left': 0 + 'px' });
        }
        else {
            $('#path-menu').css({ 'visibility': 'hidden' });
        }
    })

    // start create path
    $('#pathCreate').on('click', function () {
        $('#edit-form').css({ 'visibility': 'hidden' });
        $('#path-menu').css({ 'visibility': 'hidden' });
        $('#pathBtns').css({ 'visibility': 'visible' });

        $('#pathToggleDrawing').click();

        $('.pencil-class').addClass('hidden');
    })

    // startIdx for check path created for path moving
    // after creating path, get the last path for obj moving  
    var startIdx;
    $('#pathToggleDrawing').on('click', function () {
        if (activeObject.isDrawingPath) {
            $('#drwToggleDrawMode').click();
            $('.tool-btn').removeClass('active');
            $('.pencil-class').addClass('hidden');

            activeObject.isDrawingPath = false;
            this.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';

            const pathObj = canvas._objects.splice(startIdx, canvas._objects.length - startIdx)[0];

            activeObject.pathObj = pathObj.item(0);

            canvas.renderAll();

            const value = activeObject.pathObj.path.map(point => (
                `[${parseInt(point[2])}, ${parseInt(point[1])}]`
            )).join(' ');
            $('#pathObj').val(value);
        }
        else {
            $('#drwToggleDrawMode').click();
            $('.tool-btn').removeClass('active');
            $('.pencil-class').addClass('hidden');

            activeObject.isDrawingPath = true;
            this.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

            startIdx = canvas._objects.length;

            $('#pathObj').val('Empty');
        }
    });

    $('#closePathDrawMode').on('click', function () {
        activeObject.isDrawingPath = false;
        $('#pathBtns').css({ 'visibility': 'hidden' });

        $('#edit-form').css({ 'visibility': 'visible' });
        $('#path-menu').css({ 'visibility': 'visible' });
    });

    $('#pathMovingRepeat').on('change', function () {
        activeObject.isRepeat = !activeObject.isRepeat;
    });

    $('#pathMovingSpeed').on('input', function () {
        activeObject.speedMoving = this.value;
    });


    $("#soundMoving").change(function (e) {
        const sound = loadSoundInput(e.target);

        activeObject.set({
            nameSoundMoving: sound.name,
            soundMoving: sound.src
        });
        this.value = '';
    });

    $('#pathMovingMode').on('click', function () {
        if (activeObject.pathObj) {
            activeObject.isMoving = !activeObject.isMoving;
            if (activeObject.isMoving) {
                $('#pathMovingMark').css({ 'left': '33px', 'background': '#ff0000' });
                hidePopupMenu();
                activeObject.startMoving();
            }
            else {
                $('#pathMovingMark').css({ 'left': '1px', 'background': '#aaa' });
            }
        }
    });



    $('#toggleObjStatus').on('click', function () {
        if (activeObject.select) {
            if (activeObject.status) {
                this.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
                $('#toggleObjStatus').removeClass('btn-success');
                $('#toggleObjStatus').addClass('btn-danger');

                // remove
                if (isMakingAnswer) {
                    correctAnswers = correctAnswers.filter(item => item.id != activeObject.objectID);
                    console.log('correct answer:', orrectAnswers);
                }
                else if (isDoQuiz) {
                    userAnswers = userAnswers.filter(item => item.id != activeObject.objectID);
                    console.log('user answer:', userAnswers);
                }
            }
            else {
                this.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
                $('#toggleObjStatus').removeClass('btn-danger');
                $('#toggleObjStatus').addClass('btn-success');

                // add
                if (isMakingAnswer) {
                    correctAnswers.push({
                        id: activeObject.objectID,
                        name: select
                    });
                    console.log('correct answer:', orrectAnswers);
                }
                else if (isDoQuiz) {
                    userAnswers.push({
                        id: activeObject.objectID,
                        name: select
                    });
                    console.log('user answer:', userAnswers);
                }
            }
            activeObject.status = !activeObject.status;

        }
    });

    $("#colorSelected").on("input", function () {
        activeObject.colorSelected = this.value;
    });

    $("#colorUnselected").on("input", function () {
        activeObject.colorUnselected = this.value;
    });

    $('#close-editor').on('click', function () {
        $('#edit-form').css({ 'visibility': 'hidden' })
        $('#sub-menu').css({ 'visibility': 'hidden' })
        $('#path-menu').css({ 'visibility': 'hidden' })
    });

    $('#soundSelected').on('input', function (e) {
        const sound = loadSoundInput(e.target);

        activeObject.set({
            nameSoundSelected: sound.name,
            soundSelected: sound.src
        });
        this.value = '';
    });

    $('#soundUnselected').on('input', function (e) {
        const sound = loadSoundInput(e.target);

        activeObject.set({
            nameSoundUnselected: sound.name,
            soundUnselected: sound.src
        });
        this.value = '';
    });

    $('#soundTyping').on('input', function (e) {
        const sound = loadSoundInput(e.target);

        activeObject.set({
            nameSoundTyping: sound.name,
            soundTyping: sound.src
        });
        this.value = '';
    });

    $('#soundSnap').on('input', function (e) {
        const sound = loadSoundInput(e.target);

        activeObject.set({
            nameSoundSnap: sound.name,
            soundSnap: sound.src
        });
        this.value = '';
    });

    $("#objAngle").on("input", function () {
        activeObject.angle = this.value;
        console.log(activeObject);
        canvas.renderAll();
    });

    canvas.on('mouse:up', function (e) {
        if (e.target != null &&
            e.target.type != 'image' &&
            e.target.name != 'quiz-inputObj' &&
            e.target.name != 'line-style' &&
            !isDrawLine &&
            !isChoosePort
        ) {
            if (e.target._objects && e.target._objects.length > 0) {
                if (findTargetPort(e.target).x1) {

                } else {
                    mouseUp(e);
                }
            } else {
                mouseUp(e);
            }
        }
    });

    var isMoving = false;
    canvas.on('object:moving', function (e) {
        isMoving = true;
        isLoadDataLocal = true;

        if (e.target && e.target.portMark) {
            const circle = e.target.portMark;
            circle.set({
                top: e.target.top - 20,
                left: e.target.left,
            });

            canvas.requestRenderAll();
        }
    });

    var isScaling = false;
    canvas.on('object:scaling', function (e) {
        isScaling = true;
        // onChange(e);
    });

    let isRotating = false;
    canvas.on('object:rotating', function (e) {
        isRotating = true;



    });

    canvas.on('object:modified', function (e) {
        e.target.clicked = false;
    })

    canvas.on('mouse:over', function (obj) {
        if (!isErasing && !isSelecting) {
            if (obj.target && !obj.target.isBackground) {
                // console.log(obj.target);
                if (obj.target.name != 'curve-point' &&
                    // obj.target.name != 'lineConnect' &&
                    obj.target.name != 'grid' &&
                    !isDrawLine && !quizMode
                ) {
                    const size = obj.target.width * obj.target.scaleX * canvas.getZoom();
                    obj.target["cornerStyle"] = "circle"
                    obj.target["cornerSize"] = 15

                    obj.target.set("hasControls", true)
                    obj.target.set("hasRotatingPoint", true)
                    obj.target.set("hasBorders", true)
                    obj.target.set("transparentCorners", false)

                    obj.target.setControlsVisibility({
                        tl: true,
                        tr: true,
                        bl: true,
                        br: true,
                        mtr: true,
                        mb: true,
                        mt: true,
                        ml: true,
                        mr: true
                    });

                    canvas.setActiveObject(obj.target);
                }
                else {
                    obj.target.set("hasControls", false)
                    obj.target.set("hasRotatingPoint", false)
                    obj.target.set("hasBorders", false)
                    obj.target.set("transparentCorners", false)

                    obj.target.setControlsVisibility({
                        tl: false,
                        tr: false,
                        bl: false,
                        br: false,
                        mtr: false,
                        mb: false,
                        mt: false,
                        ml: false,
                        mr: false
                    });
                }
            }
            canvas.renderAll();

        }
    })

    canvas.on("mouse:out", function (obj) {
        // if (obj.target && obj.target.name == 'line-style') {
        //     obj.target["cornerStyle"] = "rect"
        //     obj.target["cornerSize"] = 15
        //     obj.target.set("active", true)

        //     obj.target.set("hasRotatingPoint", true)
        //     obj.target.set("hasBorders", true)
        //     obj.target.set("transparentCorners", true)
        //     obj.target.setControlsVisibility({
        //         tl: true,
        //         tr: true,
        //         bl: true,
        //         br: true,
        //         mt: true,
        //         mb: true,
        //         mtr: true,
        //         ml: true,
        //         mr: true
        //     })
        // }

        // //obj.target.item(0).set("fill", "white")
        // else if (obj.target !== null &&
        //     obj.target._objects /* && 
        //         obj.target._objects.length > 2 && obj.target._objects[0].type !== "image" */) {
        //     isHoverObj = false;
        //     obj.target["cornerStyle"] = "rect"
        //     obj.target["cornerSize"] = 15
        //     obj.target.set("active", false)

        //     obj.target.set("hasRotatingPoint", true)
        //     obj.target.set("hasBorders", true)
        //     obj.target.set("transparentCorners", true)
        //     obj.target.setControlsVisibility({
        //         tl: false,
        //         tr: false,
        //         bl: false,
        //         br: false,
        //         mt: false,
        //         mb: false,
        //         mtr: false,
        //         ml: false,
        //         mr: false
        //     })
        //     canvas.discardActiveObject(obj.target);
        // }
        // canvas.renderAll();
    })

    canvas.on('mouse:up', function (e) {
        isScaling = false;
        isMoving = false;
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
        console.log(isDoQuiz);
        if (!isDoQuiz) {
            hidePopupMenu();

            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();

            zoom = zoom * 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;

            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

            opt.e.preventDefault();
            opt.e.stopPropagation();
        }
    })

    canvas.on('before:path:created', function (opt) {
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
        isSelecting = false;
    })

    canvas.on('mouse:move', function (options) {
        if (isDraging && !drawing && !isMoving && !isScaling && !isRotating && !options.target && !isSelecting && !isDrawLine) {
            const x = options.pointer.x - init_position[0];
            const y = options.pointer.y - init_position[1];

            hidePopupMenu();

            let delta = new fabric.Point(x, y);
            canvas.relativePan(delta);

            init_position[0] = options.pointer.x;
            init_position[1] = options.pointer.y;
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
                emitEvent(layer_num, lastObject);
            }

            // this for draw line
            // if (isDrawLine) {
            //     isDown = false;
            //     drawLine.setCoords();
            //     canvas.setActiveObject(drawLine).renderAll();
            // }
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
                    $('#sub-menu').css({ "visibility": "hidden" });
                    $('#path-menu').css({ "visibility": "hidden" });

                    deleteObjects(canvas.getActiveObjects());
                }
                if (e.keyCode === 16) { // shift key 
                    isSelecting = true;
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

                if (e.keyCode === 17) { // ctrl key check for ctrl + c/v
                    ctrlDown = true;
                }

                if (!isEditText && ctrlDown && e.keyCode === 67) { // ctrl + c
                    console.log(isEditText);
                    copyObjects();
                }

                if (!isEditText && ctrlDown && e.keyCode === 86) { // ctrl + v
                    console.log(isEditText);
                    pasteObjects();
                }
            })
            .on('keyup', function (e) {
                if (e.keyCode === 17) { // remove checking ctrl + c/v
                    ctrlDown = false;
                }
            })

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
            if ($(this).hasClass('active')) {
                $("#listOfSymbol").removeClass('hidden');
            }
            else {
                $("#listOfSymbol").addClass('hidden');
            }

        })

        $('#svg').on('click', function () {
            if ($(this).hasClass('active')) {
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

        // function event for draw line
        function addDrawLineListener() {
            canvas.on('mouse:up', onDrawLineMouseUp);
            canvas.on('mouse:down', onDrawLineMouseDown);
            canvas.on('mouse:dblclick', onDrawLineDblClick);
            canvas.on('mouse:move', onDrawLineMouseMove);
        }

        function removeDrawLineListener() {
            canvas.off('mouse:up', onDrawLineMouseUp);
            canvas.off('mouse:down', onDrawLineMouseDown);
            canvas.off('mouse:dblclick', onDrawLineDblClick);
            canvas.off('mouse:move', onDrawLineMouseMove)
        }

        function setSelectDrawLine(value) {
            canvas.forEachObject(function (object) {
                object.selectable = value;
                object.setCoords();
            })
            canvas.selection = value;
            // if (lineType == 'multiple' || lineType == 'dash') {

            // }
            canvas.renderAll();
        }

        function onDrawLineMouseUp(options) {
            isCurving = false;
            if (lineType == 'waving' || lineType == 'simple') {
                isDown = false;
                drawLine.setCoords();
                setDefaultAttributes(drawLine);
                startActiveObject(drawLine);
                drawLine.set({
                    objectID: randomID(),
                    name: 'line-style',
                    lineType
                })
                canvas.setActiveObject(drawLine).renderAll();
                drawLine = null;

                $('#lines').click();
            }
            if (lineType == 'curve') {
                const pointer = canvas.getPointer(options.e);

                drawLine = new fabric.Path('M 0 0 Q 100 100 200 0', {
                    stroke: 'black',
                    hasControls: false,
                    hasBorders: false,
                    strokeWidth: 1,
                    fill: ''
                });

                drawLine.path[0] = ['M', pointer.x, pointer.y];
                drawLine.path[1] = ['Q', pointer.x, pointer.y, pointer.x, pointer.y];

                if (nextPointStart) {
                    drawLine.path[0] = ['M', nextPointStart.x, nextPointStart.y];
                    drawLine.path[1] = ['Q', nextPointStart.x, nextPointStart.y, nextPointStart.x, nextPointStart.y];
                }
                lineArray.push(drawLine);
                canvas.add(drawLine);
                canvas.renderAll();
            }
        }

        function onDrawLineMouseDown(options) {
            isDown = true;
            const pointer = canvas.getPointer(options.e);
            const points = [pointer.x, pointer.y, pointer.x, pointer.y];

            if (lineType == 'multiple') {
                drawLine = new fabric.Line(points, {
                    stroke: 'black',
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: false,
                    lockMovementY: false,
                    hoverCursor: 'default',
                    selectable: false
                });

                lineArray.push(drawLine);
                canvas.add(drawLine);
            }
            else if (lineType == 'dash') {
                drawLine = new fabric.Line(points, {
                    stroke: 'black',
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: false,
                    lockMovementY: false,
                    hoverCursor: 'default',
                    strokeDashArray: [5, 5],
                    selectable: false
                });

                lineArray.push(drawLine);
                canvas.add(drawLine);
            }
            else if (lineType == 'simple') {
                drawLine = new fabric.LineWithArrow(points, {
                    strokeWidth: 1,
                    stroke: '#000',
                });

                canvas.add(drawLine);
            }
            else if (lineType == 'waving') {
                ++typesOfLinesIter;
                typesOfLinesIter %= typesOfLines.length;

                drawLine = new fabric.WavyLineWithArrow(points, {
                    strokeWidth: 1,
                    stroke: '#000',
                    funct: typesOfLines[typesOfLinesIter],
                });

                canvas.add(drawLine);
            }
            else if (lineType == 'dot' && (!options.target || (options.target && options.target.name != 'dot-line'))) {
                var point = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 8,
                    fill: 'green',
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    name: 'dot-line'
                });

                lineArray.push(point);
                canvas.add(point);
                pointArray.push(point);

                const length = pointArray.length;
                if (length > 1) {
                    const line = new fabric.Line([
                        pointArray[length - 2].left, pointArray[length - 2].top, pointArray[length - 1].left, pointArray[length - 1].top
                    ], {
                        strokeWidth: 2,
                        fill: 'black',
                        stroke: 'black',
                        originX: 'center',
                        originY: 'center',
                        selectable: false
                    });

                    pointArray[length - 2].line2 = line;
                    pointArray[length - 1].line1 = line;

                    lineArray.unshift(line);
                    canvas.add(line);
                    canvas.sendToBack(line);
                }

                point.on('moving', function () {
                    if (point.line1) {
                        point.line1.set({
                            x2: point.left,
                            y2: point.top
                        })
                    }
                    if (point.line2) {
                        point.line2.set({
                            x1: point.left,
                            y1: point.top
                        })
                    }
                })
            }
            else if (lineType == 'curve') {
                nextPointStart = pointer;
                isCurving = true;
            }
            canvas.requestRenderAll();
        };

        function onDrawLineDblClick() {
            if (lineType == 'multiple' || lineType == 'dash' || lineType == 'curve' || lineType == 'dot') {
                if (drawLine) drawLine.setCoords();
                isDown = false;
                isDrawingLine = false;
                drawLine = null;
                if (lineArray.length > 0) {
                    lineArray.forEach(line => canvas.remove(line));

                    let lines;
                    if (lineType == 'curve') {
                        lines = new fabric.Path('M 0 0', {
                            fill: null,
                            selectable: true,
                            stroke: '#000',
                            strokeWidth: 1
                        });

                        const path = [];

                        lineArray.forEach((line, index) => {
                            if (index == 0) path.push(line.path[0]);

                            path.push(line.path[1]);

                            // if(index == lineArray.length - 1) lines.path.push([ 'L', line.path[ 1 ][ 3 ], line.path[ 1 ][ 4 ] ]);
                        });

                        lines._setPath(path);
                    }
                    else {
                        lines = new fabric.Group(lineArray, {
                            objectID: randomID(),
                            name: 'line-style',
                            lineType,
                        });
                    }
                    if (lineType == 'dash') lines.lineStyle = 'dash';

                    setDefaultAttributes(lines);
                    startActiveObject(lines);
                    canvas.add(lines);

                    lineArray = [];
                }

                if (pointArray.length > 0) pointArray = [];
                canvas.requestRenderAll();

                $('#lines').click();
            }
        };

        function onDrawLineMouseMove(o) {
            if (!isDown) return;
            var pointer = canvas.getPointer(o.e);
            if (drawLine && lineType == 'curve') {
                if (isCurving) {
                    drawLine.path[1][1] = pointer.x;
                    drawLine.path[1][2] = pointer.y;
                }
                else {
                    drawLine.path[1][3] = pointer.x;
                    drawLine.path[1][4] = pointer.y;
                }
            }
            else if (lineType == 'dot' && o.target) {
                // if (o.target.name == 'dot-line') {
                //     const obj = o.target;
                //     obj.line1.set({
                //         x2: obj.
                //         y2:
                //     })
                // }
            }
            else if (
                // lineType == 'multiple' || lineType == 'waving' || lineType == 'dash' && 
                drawLine) {
                drawLine.set({
                    x2: pointer.x,
                    y2: pointer.y
                });
            }
            canvas.requestRenderAll();
        }; //end mouse:move

        $('#simple-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'simple';
            }
        })

        $('#waving-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'waving';
            }
        })

        $('#multiple-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'multiple';
            }
        })

        $('#dash-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'dash';
            }
        })

        $('#curve-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'curve';
            }
        })

        $('#dot-line').on('click', function () {
            if ($(this).hasClass('active')) {
                lineType = '';
                $(this).removeClass('active');

                if (lineArray.length > 0) {
                    lineArray.forEach(line => canvas.remove(line));

                    const lines = new fabric.Group(lineArray, {
                        objectID: randomID(),
                        name: 'line-style',
                    });

                    setDefaultAttributes(lines);
                    startActiveObject(lines);
                    canvas.add(lines);

                    lineArray = [];
                }

                if (pointArray.length > 0) pointArray = [];
                canvas.requestRenderAll();
            }
            else {
                $('.draw-line.active').removeClass('active');
                $(this).addClass('active');
                lineType = 'dot';
            }
        })

        $('.draw-line').on('click', function (e) {
            if ($('.draw-line.active').length > 0 && !isDrawLine) {
                isDrawLine = true;

                addDrawLineListener();
                setSelectDrawLine(false);

                hidePopupMenu();
            }
            else if ($('.draw-line.active').length == 0 && isDrawLine) {
                isDrawLine = false;

                removeDrawLineListener();
                setSelectDrawLine(true);

                if ((lineType == 'multiple' || lineType == 'dash' || lineType == 'curve') && drawLine) {
                    var canvas_objects = canvas._objects;
                    var sel = canvas_objects[canvas_objects.length - 1]; //Get last object 
                    canvas.remove(sel);

                }
            }
            // console.log(canvas);
        })

        $('#lines').on('click', function () {
            if (!$('#lines').hasClass('active')) {
                if ($('.draw-line.active').length > 0)
                    $('.draw-line.active')[0].click();
            }
        })

        $('#lineStyle').on('change', function () {
            if (activeObject.name == 'line-style') {
                if (this.value == 'solid' || this.value == 'dash') {
                    activeObject.lineStyle = this.value;
                    let strokeArr = [0, 0];
                    if (this.value == 'dash') strokeArr = [5, 5];

                    if (activeObject._objects) {
                        activeObject._objects.forEach(obj => {
                            if (obj.type == 'line' || obj.type == 'path') {
                                obj.strokeDashArray = strokeArr;
                                obj.stroke = '#000';
                            }
                        })
                    }
                    else {
                        activeObject.strokeDashArray = strokeArr;
                        activeObject.stroke = '#000';
                    }
                    activeObject.shadow = null;

                }
                else if (this.value == 'shadow') {
                    const shadow = new fabric.Shadow({
                        blur: 5,
                        color: '#000',
                        offsetX: 0,
                        offsetY: 0
                    });

                    activeObject.set({
                        shadow: shadow,
                    })
                    if (activeObject._objects) {
                        activeObject._objects.forEach(obj => {
                            if (obj.type == 'line' || obj.type == 'path') {
                                obj.stroke = '#ddd';
                                obj.strokeDashArray = [0, 0];
                            }
                        })
                    }
                    else {
                        activeObject.stroke = '#ddd';
                        activeObject.strokeDashArray = [0, 0];
                    }

                }

                canvas.requestRenderAll();
            }
        })


        // quiz variables
        let size;
        const grid = 40;
        const inset = 20;

        const viewColor = '#71eb7f';
        const successColor = '#66f079';
        const wrongColor = '#ff7070';

        const answerQuiz = $('#quiz-answer')[0];
        const viewAnswerQuiz = $('#quiz-view-answer')[0];
        const doQuiz = $('#quiz-doquiz')[0];
        const checkQuiz = $('#quiz-check')[0];
        const quizInputFile = $('#quiz-input-file')[0];
        const dndItem = $('#dndItem')[0];
        const next = $('#quiz-next')[0];
        const hint = $('#quiz-hint')[0];
        const zoomIn = $('#quiz-zoom-in')[0];
        const zoomOut = $('#quiz-zoom-out')[0];
        const groupAll = $('#quiz-group')[0];
        const ungroupAll = $('#quiz-ungroup')[0];

        let quiz = [];
        let table;

        // setting

        let questions = [];
        var quizName = "test";
        var qIndex = -1;
        var played = false;
        var canvasUserResult = [];
        function makeDoQuiz() {
            console.log('make do quiz');
            qIndex = canvasData.qIndex;
            quizMode = true;
            var quizType = $('#quiz-type').val();
            if (isCreateAnswer && !isCreateDoquiz) {
                const title = new fabric.Text('User Answer', {
                    top: 0,
                    left: 30,
                    fontSize: 16,
                    fontFamily: 'Times New Roman',
                    fill: '#ffffff'
                });

                userAnswerBox = new fabric.Textbox('', {
                    left: 0,
                    top: 40,
                    width: 200,
                    fontSize: 10,
                    fontFamily: 'Times New Roman',
                    id: 'answer-correct-textbox',
                    fill: '#ffffff'
                });

                if (quizType != 'quiz-3') {
                    var correctForm = canvas._objects.find(obj => obj._objects && obj.item(1) == correctAnswerBox);
                }
                else {
                    var correctForm = canvas._objects.find(obj => obj._objects && obj.item(1) == correctPositionBox);
                }

                const group = new fabric.Group([title, userAnswerBox], {
                    top: correctForm.top + correctForm.height + 100,
                    left: 50,
                    selectable: false
                })

                canvas.add(group);
                isCreateDoquiz = true;
            }
            console.log('isChecked: ', isChecked);
            console.log('isMakingAnswer: ', isMakingAnswer);
            console.log('isViewAnswer: ', isViewAnswer);
            console.log('quizType: ', quizType);
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-1') {
                isDoQuiz = true;
                console.log('do quiz: ', isDoQuiz);
                if (isDoQuiz) {
                    userAnswers = [];

                    userAnswerBox.text = '';
                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-inputObj') {
                            obj.select = false;
                        }
                    });
                    if (played) {
                        userAnswers = canvasUserResult;
                        userAnswerBox.text = userAnswers.map(item => item.value).join(' ');

                        userAnswers.forEach(item => {
                            const obj = table._objects.find(object => item.id == object.objectID);

                            obj._objects[0].set({
                                fill: obj.colorSelected
                            });
                            obj._objects[1].set({
                                fill: obj.colorTextSelected
                            });
                        });
                    }

                    readyCheck = false;
                }
                else {
                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-inputObj') {
                            obj._objects[0].set({
                                fill: obj.colorUnselected
                            });
                            obj._objects[1].set({
                                fill: obj.colorText
                            });
                        }
                    });

                    readyCheck = true;
                }
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-2') {
                isDoQuiz = true;
                console.log('do quiz: ', isDoQuiz);
                if (isDoQuiz) {
                    userAnswers = [];

                    userAnswerBox.text = '';
                    if (played) {
                        userAnswers = canvasUserResult;
                        userAnswerBox.text = userAnswers.map(item => item.id + ' - ' + item.value).join(', ');

                        userAnswers.forEach(item => {
                            const obj = canvas._objects.find(object => item.id == object.objectID);

                            var textBox = obj.item(1);
                            textBox.text = item.value;
                        });
                    }

                    readyCheck = false;
                }
                else {
                    readyCheck = true;
                }
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-3') {
                isDoQuiz = true;
                console.log('do quiz: ', isDoQuiz);
                if (isDoQuiz) {
                    userResult = [];
                    console.log(userAnswerBox);
                    userAnswerBox.text = '';
                    readyCheck = false;
                    canvas.clear();
                    if (played) {
                        userResult = canvasUserResult;
                        userAnswerBox.text = userResult.map(item => item).join(', ');
                        var userCanvas = JSON.parse(matchQuizData.userCanvas);
                        loadCanvasJsonNew(userCanvas);
                    }
                    else {
                        var startingCanvas = JSON.parse(matchQuizData.canvas);
                        loadCanvasJsonNew(startingCanvas);
                    }
                }
                else {

                    readyCheck = true;
                }
            }
            canvas.requestRenderAll();
            console.log('finish make do quiz');
        };
        function makeViewAnswer() {
            quizMode = true;
            var quizType = $('#quiz-type').val();

            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-1') {
                isViewAnswer = true;

                correctAnswers.forEach(item => {
                    const obj = table._objects.find(object => item.id == object.objectID);

                    obj._objects[0].set({
                        fill: obj.colorSelected
                    });
                    obj._objects[1].set({
                        fill: obj.colorTextSelected
                    });
                });
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-2') {
                isViewAnswer = true;

                correctAnswers.forEach(item => {
                    const obj = canvas._objects.find(object => item.id == object.objectID);

                    var textBox = obj.item(1);
                    textBox.text = item.value;
                });
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-3') {
                isViewAnswer = true;

                var correctCanvas = JSON.parse(matchQuizData.correctCanvas);
                canvas.clear();
                loadCanvasJsonNew(correctCanvas);
            }
            canvas.requestRenderAll();
        }
        if (canvasData) {
            const data = canvasData.content;
            console.log(data);
            quizName = canvasData.quizName;
            if (canvasData.played) {
                played = canvasData.played;
                try {
                    canvasUserResult = JSON.parse(canvasData.userResult);
                } catch (e) {
                    console.log(e);
                    played = false;
                }
            }
            if (data) {
                canvas.clear();
                questions = data.questions;
                correctAnswers = data.correctAnswers;
                quizSetting = data.setting;

                isCreateQuiz = true;
                isCreateAnswer = true;

                var quizType = data.gameType;

                const canvasObj = JSON.parse(data.canvas);
                console.log(canvasObj);
                $("#quiz-type").val(quizType);
                if (quizType == 'quiz-1') {
                    const tableObjs = [];
                    var tableIndex = canvasObj.objects.findIndex(x => x.objects.findIndex(y => y.name == 'quiz-selectObj') != -1);
                    tableIndex = tableIndex != -1 ? tableIndex : 0;
                    const tableObj = canvasObj.objects[tableIndex];

                    if (data.canvas && data.questions && data.correctAnswers) {
                        console.log(tableObj.objects);
                        fabric.util.enlivenObjects(tableObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj) {
                                if (obj.name == 'quiz-selectObj') {


                                    startActiveObject(obj);
                                    obj.set({
                                        fixed: true,
                                        soundSelected: quizSetting.selectSound,
                                        soundUnselected: quizSetting.selectSound
                                    })


                                    tableObjs.push(obj);
                                }
                                else if (obj.name == 'quiz-index') {
                                    tableObjs.push(obj);
                                }

                            });
                        });

                        const title = new fabric.Text('Answer Correct', {
                            top: 0,
                            left: 30,
                            fontSize: 16,
                            fontFamily: 'Times New Roman',
                            fill: '#ffffff'
                        });

                        const text = correctAnswers.map(item => item.value).join(' ');

                        correctAnswerBox = new fabric.Textbox(text, {
                            left: 0,
                            top: 40,
                            width: 200,
                            fontSize: 10,
                            fontFamily: 'Times New Roman',
                            id: 'answer-correct-textbox',
                            fill: '#ffffff'
                        });

                        const group = new fabric.Group([title, correctAnswerBox], {
                            top: 50,
                            left: 50,
                            selectable: false
                        });


                        canvas.add(group);

                        table = createTable(tableObjs);
                        canvas.add(table);

                        canvas.renderAll();
                        if (canvasData.doQuiz) {
                            makeDoQuiz();
                        }
                        if (canvasData.viewAnswer) {
                            makeViewAnswer();
                        }
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
                else if (quizType == 'quiz-2') {
                    if (data.canvas && data.questions && data.correctAnswers) {
                        fabric.util.enlivenObjects(canvasObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj) {
                                if (obj.name == 'quiz-inputObj') {


                                    startActiveObject(obj);
                                    obj.set({
                                        fixed: true,
                                    })

                                    canvas.add(obj);
                                }
                                console.log(obj);
                            });
                        });

                        const title = new fabric.Text('Answer Correct', {
                            top: 0,
                            left: 30,
                            fontSize: 16,
                            fontFamily: 'Times New Roman',
                            fill: '#ffffff'
                        });

                        const text = correctAnswers.map(item => (
                            `${item.id} - ${item.value}`
                        )).join(', ');

                        correctAnswerBox = new fabric.Textbox(text, {
                            left: 0,
                            top: 40,
                            width: 200,
                            fontSize: 10,
                            fontFamily: 'Times New Roman',
                            id: 'answer-correct-textbox',
                            fill: '#ffffff'
                        });

                        const group = new fabric.Group([title, correctAnswerBox], {
                            top: 50,
                            left: 50,
                            selectable: false
                        });

                        canvas.add(group);

                        table = createTable([]);
                        canvas.add(table);

                        canvas.renderAll();
                        if (canvasData.doQuiz) {
                            makeDoQuiz();
                        }
                        if (canvasData.viewAnswer) {
                            makeViewAnswer();
                        }
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
                else if (quizType == 'quiz-3') {
                    var countObject = 0;
                    if (data.canvas && data.startingCanvas && data.questions && data.correctAnswers) {
                        fabric.util.enlivenObjects(canvasObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj, index, array) {
                                if (obj.type === 'group') {
                                    if (obj._objects.length > 0) {
                                        function createQuizTextBox(obj, isAnswerCorrect, isUserResult, isAnswerPosition) {
                                            if (isAnswerCorrect) {
                                                obj._objects.forEach(child => {
                                                    if (child.id == 'answer-correct-textbox') {
                                                        correctAnswerBox = child;
                                                        if (quizType == 'quiz-3') {
                                                            console.log(correctAnswerBox);
                                                            correctAnswerMatch = correctAnswerBox.text.split(', ');
                                                            correctAnswerBox.set('fill', '#ffffff');
                                                        }
                                                    }
                                                });
                                            }
                                            if (isUserResult) {
                                                obj._objects.forEach(child => {
                                                    if (child.id == 'answer-correct-textbox') {
                                                        userAnswerBox = child;
                                                        if (quizType == 'quiz-3') {
                                                            console.log(correctAnswerBox);
                                                            userResult = userAnswerBox.text.split(', ');
                                                            userResult.set('fill', '#ffffff');
                                                        }
                                                    }
                                                });
                                            }
                                            if (isAnswerPosition) {
                                                obj._objects.forEach(child => {
                                                    if (child.id == 'answer-position-textbox') {
                                                        correctPositionBox = child;
                                                        if (quizType == 'quiz-3') {
                                                            correctAnswerPosition = data.correctPosition;
                                                            correctPositionBox.text = correctAnswerPosition.map(item => item.id + ' - ' + item.top + ' - ' + item.left).join(', ');
                                                            correctPositionBox.set('fill', '#ffffff');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        obj._objects.forEach(child => {
                                            if (child.text == "Answer Correct") {
                                                child.set('fill', '#ffffff');
                                                createQuizTextBox(obj, true, false, false);
                                            }
                                            if (child.text == "User Answer") {
                                                child.set('fill', '#ffffff');
                                                createQuizTextBox(obj, false, true, false);
                                            }
                                            if (child.text == "Correct Position") {
                                                child.set('fill', '#ffffff');
                                                createQuizTextBox(obj, false, false, true);
                                            }
                                        });
                                    }
                                    startActiveObject(obj);
                                    canvas.add(obj);
                                    countObject += 1;
                                    checkMakeDoQuiz(countObject, array.length, data, quizType);
                                }
                                else if (obj.type === 'image') {
                                    fabric.Image.fromURL(obj.src, function (img) {
                                        img.set({
                                            top: obj.top,
                                            left: obj.left,
                                            width: obj.width,
                                            height: obj.height,
                                            scaleX: obj.scaleX,
                                            scaleY: obj.scaleY,
                                        })
                                        if (quizType == 'quiz-3') {
                                            img.set({
                                                name: obj.name,
                                                id: obj.id,
                                                port1: obj.port1,
                                                port2: obj.port2,
                                                idObject1: obj.idObject1,
                                                idObject2: obj.idObject2,
                                                objectID: obj.objectID,
                                                port: obj.port,
                                                lineID: obj.lineID,
                                                hasShadow: obj.hasShadow,
                                                shadowObj: obj.shadowObj,
                                                pos: obj.pos,
                                                snap: obj.snap,
                                                soundSnap: obj.soundSnap,
                                                nameSoundSnap: obj.nameSoundSnap,
                                                readySound: obj.readySound,
                                                sound: obj.sound,
                                                correctSound: obj.correctSound,
                                                incorrectSound: obj.incorrectSound,
                                                line2: obj.line2,
                                                isDrop: obj.isDrop,
                                                isDrag: obj.isDrag,
                                                isBackground: obj.isBackground,
                                                answerId: obj.answerId,
                                            })
                                            if (img.isBackground) {
                                                background = img;
                                                background.set({
                                                    correctSound: new Audio(quizSetting.correctSound),
                                                    incorrectSound: new Audio(quizSetting.incorrectSound),
                                                });
                                                background.correctSound.volume = 0.6;
                                                background.incorrectSound.volume = 0.6;
                                            }
                                        }

                                        startActiveObject(img);

                                        canvas.add(img);
                                        countObject += 1;
                                        checkMakeDoQuiz(countObject, array.length, data, quizType);
                                    });
                                }
                                else {
                                    obj.hasBorders = obj.hasControls = false;

                                    if (obj.name === 'curve-point') {
                                        obj.on('moving', function () {
                                            const line = canvas.getObjects().find(item =>
                                                item.type === 'path' &&
                                                item.objectID === obj.lineID
                                            );

                                            if (line) {
                                                line.path[1][1] = obj.left;
                                                line.path[1][2] = obj.top;
                                            }
                                        })
                                    }
                                    else if (obj.type === 'path') {
                                        obj._setPath(obj.path);
                                        obj.selectable = false;
                                    }
                                    canvas.add(obj);
                                    countObject += 1;
                                    checkMakeDoQuiz(countObject, array.length, data, quizType);
                                }
                            });
                        });
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
            }
        }

        function checkMakeDoQuiz(index, last, data, quizType) {
            if (index === last) {
                matchQuizData = {
                    canvas: data.startingCanvas,
                    correctCanvas: data.correctCanvas,
                    correctPosition: data.correctPosition,
                    userCanvas: canvasData.userCanvas,
                    title: '',
                    gameType: quizType
                };

                isCreateQuiz = true;
                isCreateAnswer = true;

                canvas.renderAll();
                if (canvasData.doQuiz) {
                    makeDoQuiz();
                }
                if (canvasData.viewAnswer) {
                    makeViewAnswer();
                }
            }
        }

        function createTableObject(questionValue) {
            const questionArr = questionValue.split('\n');
            const table = [];

            size = questionArr.length;

            for (var i = 0; i < size; i++) {
                table.push(new fabric.Text(String(i), {
                    left: inset / 2 + (i + 0.5) * grid,
                    top: 0,
                    fontSize: 14,
                    name: 'quiz-index',
                    selectable: false
                }));

                table.push(new fabric.Text(String(i), {
                    left: 0,
                    top: inset / 2 + (i + 0.5) * grid,
                    fontSize: 14,
                    textAlign: 'right',
                    name: 'quiz-index',
                    selectable: false
                }));
            }


            questionArr.map((question, index) => {
                for (let i = 0; i < question.length && i < 15; i++) {
                    const newCell = createCell(i, index, question[i]);

                    setDefaultAttributes(newCell);
                    startActiveObject(newCell);
                    newCell.set({
                        colorSelected: quizSetting.bgSelectColor,
                        colorUnselected: quizSetting.bgColor,
                        soundSelected: quizSetting.selectSound,
                        soundUnselected: quizSetting.selectSound
                    });

                    table.push(newCell);
                }
            });

            return table;
        }

        function createCell(idX, idY, character) {
            const rect = new fabric.Rect({
                left: idX * grid + inset,
                top: idY * grid + inset,
                width: grid,
                height: grid,
                fill: quizSetting.bgColor,
                stroke: '#333',
                strokeWidth: 2,
                originX: 'left',
                originY: 'top',
                centeredRotation: true
            });

            const textbox = new fabric.Text(character, {
                fontSize: 16,
                fontFamily: 'Time New Roman',
                fontStyle: 'normal',
                originX: 'center',
                originY: 'center',
                fill: quizSetting.textColor,
                left: rect.left + rect.width / 2,
                top: rect.top + rect.height / 2,
                textAlign: 'center'
            });

            const cell = new fabric.Group([rect, textbox], {
                top: rect.top,
                left: rect.left,
                selectable: false,
                text: character,
                objectID: randomID(),
                name: 'quiz-selectObj'
            });

            return cell;
        }

        function createTableEmpty(size) {
            const table = [];
            for (var i = 0; i < size; i++) {
                table.push(new fabric.Text(String(i), {
                    left: inset / 2 + (i + 0.5) * grid,
                    top: 0,
                    fontSize: 14,
                    name: 'quiz-index',
                    selectable: false
                }));

                table.push(new fabric.Text(String(i), {
                    left: 0,
                    top: inset / 2 + (i + 0.5) * grid,
                    fontSize: 14,
                    textAlign: 'right',
                    name: 'quiz-index',
                    selectable: false
                }));
            }

            var questionArr = Array.from(Array(size), () => new Array(size));


            questionArr.map((question, index) => {
                for (let i = 0; i < question.length && i < 15; i++) {
                    const newCell = createCellEmpty(i, index, question[i]);

                    setDefaultAttributes(newCell);
                    startActiveObject(newCell);
                    newCell.set({
                        colorSelected: quizSetting.bgSelectColor,
                        colorUnselected: quizSetting.bgColor,
                        soundSelected: quizSetting.selectSound,
                        soundUnselected: quizSetting.selectSound,

                    });

                    table.push(newCell);
                }
            });

            return table;
        }

        function createCellEmpty(idX, idY, character) {
            const rect = new fabric.Rect({
                left: idX * grid + inset,
                top: idY * grid + inset,
                width: grid,
                height: grid,
                fill: quizSetting.bgColor,
                stroke: '#333',
                strokeWidth: 2,
                originX: 'left',
                originY: 'top',
                centeredRotation: true
            });

            const textbox = new fabric.Textbox('', {
                fontSize: 16,
                fontFamily: 'Time New Roman',
                fontStyle: 'normal',
                originX: 'center',
                originY: 'center',
                fill: quizSetting.textColor,
                left: rect.left + rect.width / 2,
                top: rect.top + rect.height / 2,
                textAlign: 'center'
            });

            const cell = new fabric.Group([rect, textbox], {
                top: rect.top,
                left: rect.left,
                subTargetCheck: false,
                text: character,
                objectID: randomID(),
                name: 'quiz-inputObj'
            });

            return cell;
        }

        function createTable(objs) {
            table = new fabric.Group(objs, {
                top: 50,
                left: 250,
                name: 'quiz',
                selectable: true,
                subTargetCheck: true,
                selectSound: new Audio(quizSetting.selectSound),
                correctSound: new Audio(quizSetting.correctSound),
                incorrectSound: new Audio(quizSetting.incorrectSound),
            });

            table.selectSound.volume = 0.6;
            table.correctSound.volume = 0.6;
            table.incorrectSound.volume = 0.6;

            return table;
        }

        function createAnswerTextBox(obj) {
            var textbox = new fabric.Textbox('', {
                fontSize: 24,
                fontFamily: 'Time New Roman',
                originX: 'center',
                originY: 'center',
                left: obj.left,
                top: obj.top,
                fill: '#333',
                textAlign: 'center',
            });

            let group = new fabric.Group([obj, textbox], {
                objectID: randomID(),
                top: 150,
                left: 250,
                name: 'quiz-inputObj',
                subTargetCheck: false
            });

            setDefaultAttributes(group);
            startActiveObject(group);

            canvas.add(group);
            // return group;
        }

        function answerRect(e) {
            var rect = new fabric.Rect({
                width: 40,
                height: 40,
                stroke: '#000',
                strokeWidth: 1,
                fill: '#fff',
                originX: 'center',
                originY: 'center',
                rx: 0,
                ry: 0
            });

            rect.on('scaling', function () {
                this.set({
                    width: this.width * this.scaleX,
                    height: this.height * this.scaleY,
                    scaleX: 1,
                    scaleY: 1
                })
            })

            createAnswerTextBox(rect);
        }

        // load quiz - Kiet edit
        function changeQuizInput(e) {
            $('#quizs-body li:nth-child(n+4):nth-child(-n+5)').css({ 'opacity': '0.5', 'pointer-events': 'none' });
            $('#quizs-body li:nth-child(n+7)').css({ 'opacity': '1', 'pointer-events': 'auto' });

            let reader = new FileReader();

            reader.onload = function (e) {
                const data = JSON.parse(e.target.result);
                canvas.clear();

                questions = data.questions;
                correctAnswers = data.correctAnswers;
                quizSetting = data.setting;

                isCreateQuiz = true;
                isCreateAnswer = true;

                var quizType = data.gameType;
                var quizTypeCurrent = $('#quiz-type').val();
                if (quizType != quizTypeCurrent) {
                    alert('Invalid Quiz game type!');
                }

                const canvasObj = JSON.parse(data.canvas);
                if (quizType == 'quiz-1') {
                    const tableObjs = [];
                    var tableIndex = canvasObj.objects.findIndex(x => x.objects.findIndex(y => y.name == 'quiz-selectObj') != -1);
                    tableIndex = tableIndex != -1 ? tableIndex : 0;
                    const tableObj = canvasObj.objects[tableIndex];

                    if (data.canvas && data.questions && data.correctAnswers) {
                        fabric.util.enlivenObjects(tableObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj) {
                                if (obj.name == 'quiz-selectObj') {


                                    startActiveObject(obj);
                                    obj.set({
                                        fixed: true,
                                        soundSelected: quizSetting.selectSound,
                                        soundUnselected: quizSetting.selectSound
                                    })


                                    tableObjs.push(obj);
                                }
                                else if (obj.name == 'quiz-index') {
                                    tableObjs.push(obj);
                                }

                            });
                        });

                        const title = new fabric.Text('Answer Correct', {
                            top: 0,
                            left: 30,
                            fontSize: 16,
                            fontFamily: 'Times New Roman',
                        });

                        const text = correctAnswers.map(item => item.value).join(' ');

                        correctAnswerBox = new fabric.Textbox(text, {
                            left: 0,
                            top: 40,
                            width: 200,
                            fontSize: 10,
                            fontFamily: 'Times New Roman',
                            id: 'answer-correct-textbox'
                        });

                        const group = new fabric.Group([title, correctAnswerBox], {
                            top: 50,
                            left: 50,
                            selectable: false
                        });


                        canvas.add(group);

                        table = createTable(tableObjs);
                        canvas.add(table);

                        canvas.renderAll();
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
                else if (quizType == 'quiz-2') {
                    if (data.canvas && data.questions && data.correctAnswers) {
                        fabric.util.enlivenObjects(canvasObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj) {
                                if (obj.name == 'quiz-inputObj') {


                                    startActiveObject(obj);
                                    obj.set({
                                        fixed: true
                                    })

                                    canvas.add(obj);
                                }
                            });
                        });

                        const title = new fabric.Text('Answer Correct', {
                            top: 0,
                            left: 30,
                            fontSize: 16,
                            fontFamily: 'Times New Roman',
                        });

                        const text = correctAnswers.map(item => (
                            `${item.id} - ${item.value}`
                        )).join(', ');

                        correctAnswerBox = new fabric.Textbox(text, {
                            left: 0,
                            top: 40,
                            width: 200,
                            fontSize: 10,
                            fontFamily: 'Times New Roman',
                            id: 'answer-correct-textbox'
                        });

                        const group = new fabric.Group([title, correctAnswerBox], {
                            top: 50,
                            left: 50,
                            selectable: false
                        });

                        canvas.add(group);

                        table = createTable([]);
                        canvas.add(table);

                        canvas.renderAll();
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
                else if (quizType == 'quiz-3') {
                    if (data.canvas && data.startingCanvas && data.questions && data.correctAnswers) {
                        fabric.util.enlivenObjects(canvasObj.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj) {
                                console.log(obj);
                                var quizType = $('#quiz-type').val();
                                if (obj.isDrag === true || obj.isDrop === true) {
                                    countItem++;
                                }
                                if (obj.type === 'group') {
                                    if (obj._objects.length > 0) {
                                        function createQuizTextBox(obj, isAnswerCorrect, isUserResult, isAnswerPosition) {
                                            if (isAnswerCorrect) {
                                                obj._objects.forEach(child => {
                                                    if (child.id == 'answer-correct-textbox') {
                                                        correctAnswerBox = child;
                                                        if (quizType == 'quiz-3') {
                                                            console.log(correctAnswerBox);
                                                            correctAnswerMatch = correctAnswerBox.text.split(', ');
                                                        }
                                                    }
                                                });
                                            }
                                            if (isUserResult) {
                                                obj._objects.forEach(child => {
                                                    if (child.id == 'answer-correct-textbox') {
                                                        userAnswerBox = child;
                                                        if (quizType == 'quiz-3') {
                                                            console.log(correctAnswerBox);
                                                            userResult = userAnswerBox.text.split(', ');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        obj._objects.forEach(child => {
                                            if (child.text == "Answer Correct") {
                                                createQuizTextBox(obj, true, false, false);
                                            }
                                            if (child.text == "User Answer") {
                                                createQuizTextBox(obj, false, true, false);
                                            }
                                            if (child.text == "Correct Position") {
                                                createQuizTextBox(obj, false, false, true);
                                            }
                                        });
                                    }
                                    startActiveObject(obj);
                                    canvas.add(obj);
                                }
                                else if (obj.type === 'image') {
                                    fabric.Image.fromURL(obj.src, function (img) {
                                        img.set({
                                            top: obj.top,
                                            left: obj.left,
                                            width: obj.width,
                                            height: obj.height,
                                            scaleX: obj.scaleX,
                                            scaleY: obj.scaleY,
                                        })
                                        if (quizType == 'quiz-3') {
                                            img.set({
                                                name: obj.name,
                                                id: obj.id,
                                                port1: obj.port1,
                                                port2: obj.port2,
                                                idObject1: obj.idObject1,
                                                idObject2: obj.idObject2,
                                                objectID: obj.objectID,
                                                port: obj.port,
                                                lineID: obj.lineID,
                                                hasShadow: obj.hasShadow,
                                                shadowObj: obj.shadowObj,
                                                pos: obj.pos,
                                                snap: obj.snap,
                                                soundSnap: obj.soundSnap,
                                                nameSoundSnap: obj.nameSoundSnap,
                                                readySound: obj.readySound,
                                                sound: obj.sound,
                                                correctSound: obj.correctSound,
                                                incorrectSound: obj.incorrectSound,
                                                line2: obj.line2,
                                                isDrop: obj.isDrop,
                                                isDrag: obj.isDrag,
                                                isBackground: obj.isBackground,
                                                answerId: obj.answerId,
                                            })
                                            if (img.isBackground) {
                                                background = img;
                                                background.set({
                                                    correctSound: new Audio(quizSetting.correctSound),
                                                    incorrectSound: new Audio(quizSetting.incorrectSound),
                                                });
                                                background.correctSound.volume = 0.6;
                                                background.incorrectSound.volume = 0.6;
                                            }
                                        }

                                        startActiveObject(img);

                                        canvas.add(img);
                                    });
                                }
                                else {
                                    obj.hasBorders = obj.hasControls = false;

                                    if (obj.name === 'curve-point') {
                                        obj.on('moving', function () {
                                            const line = canvas.getObjects().find(item =>
                                                item.type === 'path' &&
                                                item.objectID === obj.lineID
                                            );

                                            if (line) {
                                                line.path[1][1] = obj.left;
                                                line.path[1][2] = obj.top;
                                            }
                                        })
                                    }
                                    else if (obj.type === 'path') {
                                        obj._setPath(obj.path);
                                        obj.selectable = false;
                                    }
                                    canvas.add(obj);
                                }
                            });
                        });

                        matchQuizData = {
                            canvas: data.startingCanvas,
                            correctCanvas: data.correctCanvas,
                            userCanvas: data.userCanvas,
                            title: '',
                            gameType: quizType
                        };

                        isCreateQuiz = true;
                        isCreateAnswer = true;

                        canvas.renderAll();
                    }
                    else {
                        alert('Invalid Quiz file input!');
                    }
                }
            }

            reader.readAsText(e.target.files[0]);
            this.value = '';
        };
        try {
            quizInputFile.onchange = changeQuizInput;
        } catch (e) {
            console.log(e);
        }

        function changeDndItems(e) {
            var files = e.target.files,
                imageType = /image.*/;
            for (const file of files) {
                if (!file.type.match(imageType))
                    return;
                function handleEvent(value, isDrag) {
                    return function (e) {
                        imageQuizMatchMode(e, value, isDrag);
                    };
                }
                countItem++;
                var value = countItem;
                var reader = new FileReader();
                reader.onload = handleEvent(value, true);
                reader.readAsDataURL(file);
                $('#quizs-body li:nth-child(n+7)').css({ 'opacity': '1', 'pointer-events': 'auto' });
            }

            e.target.value = '';
        };
        try {
            dndItem.onchange = changeDndItems;
        } catch (e) {
            console.log(e);
        }

        $('#create-table-empty').on('click', function (e) {
            if (questions.length > 0) questions = [];
            if (correctAnswers.length > 0) correctAnswers = [];

            let tableOld;
            canvas.forEachObject(function (obj) {
                if (obj.name == 'quiz') {
                    tableOld = obj;
                }
            });
            canvas.remove(tableOld);

            table = createTable(createTableEmpty(15));

            console.log(canvas);
            canvas.add(table);

            isCreateQuiz = true;

            canvas.renderAll();
        });

        $('.close-quiz-modal').on('click', function (e) {
            $('#quiz-modal')[0].style.display = 'none';
        });

        $('#open-quiz-modal').on('click', function (e) {
            $('#quiz-modal').css({ display: 'block', });
            $('#quizs-body li:nth-child(n+4):nth-child(-n+5)').css({ 'opacity': '0.5', 'pointer-events': 'none' });
            $('#quizs-body li:nth-child(n+6)').css({ 'opacity': '1', 'pointer-events': 'auto' });
        });

        $('#question-submit').on('click', function () {
            if (questions.length > 0) questions = [];
            if (correctAnswers.length > 0) correctAnswers = [];

            let questionValue = $('#question-input').val();
            canvas.clear();

            table = createTable(createTableObject(questionValue));

            console.log(canvas);
            canvas.add(table);

            isCreateQuiz = true;

            canvas.renderAll();

            $('#quiz-modal')[0].style.display = 'none';
        })

        var matchQuizData;
        function clickAnswerQuiz() {
            var quizType = $('#quiz-type').val();
            if (isCreateQuiz && !isCreateAnswer) {
                const title = new fabric.Text('Answer Correct', {
                    top: 0,
                    left: 30,
                    fontSize: 16,
                    fontFamily: 'Times New Roman',
                });

                correctAnswerBox = new fabric.Textbox('', {
                    left: 0,
                    top: 40,
                    width: 200,
                    fontSize: 10,
                    fontFamily: 'Times New Roman',
                    id: 'answer-correct-textbox'
                });

                const group = new fabric.Group([title, correctAnswerBox], {
                    top: 50,
                    left: 50,
                    selectable: false
                })

                canvas.add(group);
                if (quizType == 'quiz-3') {
                    const title = new fabric.Text('Correct Position', {
                        top: 0,
                        left: 30,
                        fontSize: 16,
                        fontFamily: 'Times New Roman',
                    });

                    correctPositionBox = new fabric.Textbox('', {
                        left: 0,
                        top: 40,
                        width: 200,
                        fontSize: 10,
                        fontFamily: 'Times New Roman',
                        id: 'answer-position-textbox'
                    });

                    const correctForm = canvas._objects.find(obj => obj._objects && obj.item(1) == correctAnswerBox);

                    const group = new fabric.Group([title, correctPositionBox], {
                        top: correctForm.top + correctForm.height + 100,
                        left: 50,
                        selectable: false
                    })

                    canvas.add(group);
                }

                if (quizType == 'quiz-2') {
                    table = createTable([]);
                }
                isCreateAnswer = true;
            }

            if (!isChecked && !isDoQuiz && !readyCheck && !isViewAnswer && quizType == 'quiz-1') {
                isMakingAnswer = !isMakingAnswer;
                if (isMakingAnswer) {
                    answerQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save Answer</span>
                        </span>
                        `;

                    correctAnswers = [];
                    correctAnswerBox.text = '';
                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-selectObj') {
                            obj.select = false;
                        }
                    });
                }
                else {
                    answerQuiz.innerHTML = `
                            <img src="assets/images/notepad/create-answer.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Answer</span>
                            </span>
                        `;

                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-selectObj') {
                            obj.select = false;
                            obj._objects[0].set({
                                fill: obj.colorUnselected
                            });
                            obj._objects[1].set({
                                fill: obj.colorText
                            });
                        }
                    });
                }
            }

            if (!isChecked && !isDoQuiz && !readyCheck && !isViewAnswer && quizType == 'quiz-2') {
                isMakingAnswer = !isMakingAnswer;
                if (isMakingAnswer) {
                    answerQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save Answer</span>
                        </span>
                        `;

                    correctAnswers = [];
                    if (correctAnswerBox) correctAnswerBox.text = '';
                    canvas._objects = canvas._objects.filter(obj => obj.name != 'quiz-inputObj');

                    answerRect();
                }
                else {
                    answerQuiz.innerHTML = `
                            <img src="assets/images/notepad/create-answer.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Answer</span>
                            </span>
                        `;

                    canvas._objects.forEach(obj => {
                        if (obj.name == 'quiz-inputObj') {
                            obj.fixed = true;
                            obj.item(1).text = '';
                        }
                    });
                }
            }

            if (!isChecked && !isDoQuiz && !readyCheck && !isViewAnswer && quizType == 'quiz-3') {
                isMakingAnswer = !isMakingAnswer;
                if (isMakingAnswer) {
                    answerQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save Answer</span>
                        </span>
                        `;

                    correctAnswerMatch = [];
                    correctAnswerBox.text = '';

                    correctAnswerPosition = [];
                    correctPositionBox.text = '';

                    const saveData = {
                        canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                        //correctCanvas: data.correctCanvas,
                        //userCanvas: data.userCanvas,
                        title: quizTitle,
                        gameType: quizType
                    }
                    matchQuizData = saveData;
                }
                else {
                    answerQuiz.innerHTML = `
                            <img src="assets/images/notepad/create-answer.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Answer</span>
                            </span>
                        `;
                    matchQuizData.correctCanvas = JSON.stringify(canvas.toJSON(customAttributes));
                    var startingCanvas = JSON.parse(matchQuizData.canvas);
                    canvas.clear();
                    loadCanvasJsonNew(startingCanvas);
                }
            }

            canvas.renderAll();
        };
        try {
            answerQuiz.onclick = clickAnswerQuiz;
        } catch (e) {
            console.log(e);
        }

        function clickViewAnswerQuiz() {
            var quizType = $('#quiz-type').val();
            if (quizType == 'quiz-1') {
                if (correctAnswers.length > 0 && !isMakingAnswer && !isDoQuiz && !isChecked) {
                    if (isViewAnswer) {
                        viewAnswerQuiz.innerHTML = `
                                <img src="assets/images/notepad/unview-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">View Answer</span>
                                </span>
                            `;
                        isViewAnswer = false;

                        table._objects.forEach(obj => {
                            if (obj.name == 'quiz-selectObj') {
                                obj._objects[0].set({
                                    fill: obj.colorUnselected
                                });
                                obj._objects[1].set({
                                    fill: obj.colorText
                                });
                            }
                        });

                    }
                    else {
                        viewAnswerQuiz.innerHTML =
                            `
                                <img src="assets/images/notepad/view-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">Unview Answer</span>
                                </span>
                            `;
                        isViewAnswer = true;

                        correctAnswers.forEach(item => {
                            const obj = table._objects.find(object => item.id == object.objectID);

                            obj._objects[0].set({
                                fill: obj.colorSelected
                            });
                            obj._objects[1].set({
                                fill: obj.colorTextSelected
                            });
                        });

                    }
                    canvas.requestRenderAll();
                }
            }
            else if (quizType == 'quiz-2') {
                if (correctAnswers.length > 0 && !isMakingAnswer && !isDoQuiz && !isChecked) {
                    if (isViewAnswer) {
                        viewAnswerQuiz.innerHTML = `
                                <img src="assets/images/notepad/unview-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">View Answer</span>
                                </span>
                            `;
                        isViewAnswer = false;

                        canvas._objects.forEach(obj => {
                            if (obj.name == 'quiz-inputObj') {
                                var textBox = obj.item(1);
                                textBox.text = '';
                            }
                        });

                    }
                    else {
                        viewAnswerQuiz.innerHTML =
                            `
                                <img src="assets/images/notepad/view-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">Unview Answer</span>
                                </span>
                            `;
                        isViewAnswer = true;

                        correctAnswers.forEach(item => {
                            const obj = canvas._objects.find(object => item.id == object.objectID);

                            var textBox = obj.item(1);
                            textBox.text = item.value;
                        });

                    }
                    canvas.requestRenderAll();
                }
            }
            else if (quizType == 'quiz-3') {
                if (correctAnswerMatch.length > 0 && !isMakingAnswer && !isDoQuiz && !isChecked) {
                    if (isViewAnswer) {
                        viewAnswerQuiz.innerHTML = `
                                <img src="assets/images/notepad/unview-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">View Answer</span>
                                </span>
                            `;
                        isViewAnswer = false;
                        var startingCanvas = JSON.parse(matchQuizData.canvas);
                        canvas.clear();
                        loadCanvasJsonNew(startingCanvas);
                    }
                    else {
                        viewAnswerQuiz.innerHTML =
                            `
                                <img src="assets/images/notepad/view-answer.png" />
                                <span class="hidden tooltip-icon">
                                    <span class="h">Unview Answer</span>
                                </span>
                            `;
                        isViewAnswer = true;
                        var correctCanvas = JSON.parse(matchQuizData.correctCanvas);
                        canvas.clear();
                        loadCanvasJsonNew(correctCanvas);
                    }
                    canvas.requestRenderAll();
                }
            }
        };
        try {
            viewAnswerQuiz.onclick = clickViewAnswerQuiz;
        } catch (e) {
            console.log(e);
        }

        function clickDoQuiz(e) {
            console.log('click do quiz');
            var quizType = $('#quiz-type').val();
            if (isCreateAnswer && !isCreateDoquiz) {
                const title = new fabric.Text('User Answer', {
                    top: 0,
                    left: 30,
                    fontSize: 16,
                    fontFamily: 'Times New Roman',
                });

                userAnswerBox = new fabric.Textbox('', {
                    left: 0,
                    top: 40,
                    width: 200,
                    fontSize: 10,
                    fontFamily: 'Times New Roman',
                    id: 'answer-correct-textbox'
                });

                const correctForm = canvas._objects.find(obj => obj._objects && obj.item(1) == correctAnswerBox);

                const group = new fabric.Group([title, userAnswerBox], {
                    top: correctForm.top + correctForm.height + 100,
                    left: 50,
                    selectable: false
                })

                canvas.add(group);
                isCreateDoquiz = true;
            }

            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-1') {
                isDoQuiz = !isDoQuiz;
                // console.log('do quiz');
                if (isDoQuiz) {
                    doQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save User Result</span>
                        </span>
                        `;

                    userAnswers = [];

                    userAnswerBox.text = '';
                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-inputObj') {
                            obj.select = false;
                        }
                    });

                    readyCheck = false;
                }
                else {
                    doQuiz.innerHTML = `
                            <img src="assets/images/notepad/edit.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Do Quiz</span>
                            </span>
                        `;

                    table._objects.forEach(obj => {
                        if (obj.name == 'quiz-inputObj') {
                            obj._objects[0].set({
                                fill: obj.colorUnselected
                            });
                            obj._objects[1].set({
                                fill: obj.colorText
                            });
                        }
                    });

                    readyCheck = true;
                }
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-2') {
                isDoQuiz = !isDoQuiz;
                console.log(canvas);
                if (isDoQuiz) {
                    doQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save User Result</span>
                        </span>
                        `;

                    userAnswers = [];

                    userAnswerBox.text = '';
                    // canvas._objects.forEach(obj => {
                    //     if (obj.name == 'quiz-inputObj') {
                    //         obj.visible = false;
                    //     }
                    // });

                    // correctAnswers.forEach(item => {
                    //     const obj = canvas._objects.find(object => item.id == object.objectID);

                    //     obj.visible = true;
                    // });

                    readyCheck = false;
                }
                else {
                    doQuiz.innerHTML = `
                            <img src="assets/images/notepad/edit.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Do Quiz</span>
                            </span>
                        `;
                    // canvas._objects.forEach(obj => {
                    //     if (obj.name == 'quiz-inputObj') {
                    //         obj.visible = true;
                    //         var textBox = obj.item(1);
                    //         textBox.text = obj.value;
                    //     }
                    // });

                    readyCheck = true;
                }
            }
            if (!isChecked && !isMakingAnswer && !isViewAnswer && quizType == 'quiz-3') {
                isDoQuiz = !isDoQuiz;
                // console.log('do quiz');
                if (isDoQuiz) {
                    doQuiz.innerHTML =
                        `
                        <img src="assets/images/notepad/save.png" />
                        <span class="hidden tooltip-icon">
                        <span class="h">Save User Result</span>
                        </span>
                        `;

                    userResult = [];
                    userAnswerBox.text = '';
                    readyCheck = false;
                    var startingCanvas = JSON.parse(matchQuizData.canvas);
                    canvas.clear();
                    countItem = 0;
                    loadCanvasJsonNew(startingCanvas);
                    console.log(correctAnswerMatch);
                }
                else {
                    doQuiz.innerHTML = `
                            <img src="assets/images/notepad/edit.png" />
                            <span class="hidden tooltip-icon">
                                <span class="h">Do Quiz</span>
                            </span>
                        `;
                    matchQuizData.userCanvas = JSON.stringify(canvas.toJSON(customAttributes));
                    readyCheck = true;
                }
            }
            canvas.requestRenderAll();
        };
        try {
            doQuiz.onclick = clickDoQuiz;
        } catch (e) {
            console.log(e);
        }

        if (next) {
            next.onclick = function () {
                var quizType = $('#quiz-type').val();
                if (quizType === 'quiz-1') {
                    //window.opener.HandleUserResult(
                    //    JSON.stringify(userAnswers), qIndex, null, null);
                    //window.close();
                } else if (quizType === 'quiz-2') {
                    //window.opener.HandleUserResult(
                    //    JSON.stringify(userAnswers), qIndex, null, null);
                    //window.close();
                } else if (quizType === 'quiz-3') {
                    //window.opener.HandleUserResult(
                    //    JSON.stringify(userResult), qIndex, JSON.stringify(canvas.toJSON(customAttributes)), JSON.stringify(userResultPosition));
                    //window.close();
                }
            };
        }

        if (hint) {
            hint.onclick = function () {
                var quizType = $('#quiz-type').val();
                if (quizType === 'quiz-1') {
                    table._objects.forEach(obj => {
                        if (obj._objects && obj._objects.length > 1) {
                            obj._objects[0].set({
                                fill: obj.colorUnselected
                            });
                            obj._objects[1].set({
                                fill: obj.colorText
                            });
                        }
                    });
                    correctAnswers.forEach(item => {
                        const obj = table._objects.find(object => item.id == object.objectID);

                        obj._objects[0].set({
                            fill: obj.colorSelected
                        });
                        obj._objects[1].set({
                            fill: obj.colorTextSelected
                        });
                    });
                    userAnswers = [];
                    correctAnswers.forEach(item => {
                        userAnswers.push(item);
                    });
                    userAnswerBox.text = userAnswers.map(item => item.value).join(' ');
                } else if (quizType === 'quiz-2') {
                    correctAnswers.forEach(item => {
                        const obj = canvas._objects.find(object => item.id == object.objectID);

                        var textBox = obj.item(1);
                        textBox.text = item.value;
                        console.log(textBox);
                    });
                    userAnswers = [];
                    correctAnswers.forEach(item => {
                        userAnswers.push(item);
                    });
                    userAnswerBox.text = userAnswers.map(item => item.id + ' - ' + item.value).join(', ');
                } else if (quizType === 'quiz-3') {
                    correctAnswerPosition.forEach(item => {
                        var obj = canvas._objects.find(object => item.id == object.answerId);

                        obj.set({
                            top: item.top,
                            left: item.left,
                            checked: true,
                            linkedId: item.targetId
                        });
                        obj.setCoords();
                    });
                    userResult = [];
                    correctAnswerMatch.forEach(item => {
                        userResult.push(item);
                    });
                    userAnswerBox.text = userResult.map(item => item).join(', ');
                }

                canvas.requestRenderAll();
            };
        }

        if (zoomIn) {
            zoomIn.onclick = function () {
                canvas.setZoom(canvas.getZoom() * 1.1);
            };
        }

        if (zoomOut) {
            zoomOut.onclick = function () {
                canvas.setZoom(canvas.getZoom() / 1.1);
            };
        }

        if (groupAll) {
            groupAll.onclick = function () {
                canvas.discardActiveObject();
                var sel = new fabric.ActiveSelection(canvas.getObjects(), {
                    canvas: canvas,
                    hasControls: false,
                    strokeWidth: 1
                });
                canvas.setActiveObject(sel);
                canvas.requestRenderAll();
            };
        }

        if (ungroupAll) {
            ungroupAll.onclick = function () {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            };
        }

        function answerCmp(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        }

        function checkAnswer() {
            if (correctAnswers.length != userAnswers.length) {
                return false;
            }

            correctAnswers.sort(answerCmp);
            userAnswers.sort(answerCmp);

            return correctAnswers.every((correctAnswer, index) => {
                const userAnswer = userAnswers[index];
                if (correctAnswer.id != userAnswer.id) return false;
                return true;
            });
        }

        function checkAnswerInput() {
            if (correctAnswers.length != userAnswers.length) {
                return false;
            }

            correctAnswers.sort(answerCmp);
            userAnswers.sort(answerCmp);

            return correctAnswers.every((correctAnswer, index) => {
                const userAnswer = userAnswers[index];
                if (correctAnswer.id != userAnswer.id) return false;
                if (correctAnswer.value != userAnswer.value) return false;
                return true;
            });
        }
        function checkAnswerMatch() {
            if (correctAnswerMatch === userResult) return true;
            if (correctAnswerMatch.length !== userResult.length) return false;
            if (correctAnswerMatch.length != userResult.length) {
                return false;
            }

            correctAnswerMatch.sort();
            userResult.sort(function (a, b) {
                try {
                    var aFirst = parseInt(a.split('-')[0]);
                    var bFirst = parseInt(b.split('-')[0]);
                    return aFirst - bFirst
                } catch (error) {
                    console.log(error);
                    return false;
                }
            });

            for (var i = 0; i < correctAnswerMatch.length; ++i) {
                if (correctAnswerMatch[i] !== userResult[i]) return false;
            }
            return true;
        }

        function clickCheckQuiz() {
            var quizType = $('#quiz-type').val();
            if (readyCheck && !isChecked) {
                const title = new fabric.Text('Result', {
                    top: 0,
                    left: 30,
                    fontSize: 16,
                    fontFamily: 'Times New Roman',
                });

                const content = new fabric.Textbox('', {
                    left: 30,
                    top: 40,
                    width: 50,
                    fontSize: 14,
                    fontFamily: 'Times New Roman',
                    id: 'answer-correct-textbox'
                });

                const correctForm = canvas._objects.find(obj => obj._objects && obj.item(1) == userAnswerBox);

                const group = new fabric.Group([title, content], {
                    top: correctForm.top + correctForm.height + 100,
                    left: 50,
                    selectable: false
                });

                if (quizType == 'quiz-1') {

                    correctAnswers.forEach(item => {
                        const obj = table._objects.find(object => item.id == object.objectID);

                        obj._objects[0].set({
                            fill: wrongColor
                        });
                    });

                    userAnswers.forEach(item => {
                        const obj = table._objects.find(object => item.id == object.objectID);

                        if (obj.item(0).fill == wrongColor) {
                            obj.item(0).fill = successColor;
                        }
                        else {
                            obj.item(0).fill = obj.colorSelected;
                        }
                    });

                    if (checkAnswer()) {
                        content.text = 'True';
                        table.correctSound.play();
                    }
                    else {
                        content.text = 'False';
                        table.incorrectSound.play();
                    }
                    isChecked = true;
                }
                else if (quizType == 'quiz-2') {

                    correctAnswers.forEach(item => {
                        const obj = canvas._objects.find(object => item.id == object.objectID);

                        var textBox = obj.item(1);
                        textBox.text = item.value;

                        obj._objects[0].set({
                            fill: wrongColor
                        });
                    });

                    userAnswers.forEach(item => {
                        const obj = canvas._objects.find(object => item.id == object.objectID);
                        const correctAnswer = correctAnswers.find(x => x.id == obj.objectID);

                        if (correctAnswer && item.value == correctAnswer.value) {
                            obj.item(0).fill = successColor;
                        }
                        else {
                            obj.item(0).fill = '#ffff00';
                        }

                        var textBox = obj.item(1);
                        textBox.text = item.value;
                    });

                    if (checkAnswerInput()) {
                        content.text = 'True';
                        table.correctSound.play();
                    }
                    else {
                        content.text = 'False';
                        table.incorrectSound.play();
                    }
                    isChecked = true;
                }
                else if (quizType == 'quiz-3') {
                    if (checkAnswerMatch()) {
                        content.text = 'True';
                        background.correctSound.play();
                    }
                    else {
                        content.text = 'False';
                        background.incorrectSound.play();
                    }
                }

                canvas.add(group);
            }

            canvas.renderAll();
        };
        try {
            checkQuiz.onclick = clickCheckQuiz;
        } catch (e) {
            console.log(e);
        }

        // quiz save - Kiet edit
        function uploadQuiz(saveData) {
            var blob = new Blob([encodeURIComponent(JSON.stringify(saveData))],
                { type: "text/plain;charset=utf-8" });
            var formData = new FormData();

            formData.append("FileUpload", blob, quizName + ".json");
            formData.append("ObjectCode", "");
            formData.append("ObjectType", "");
            formData.append("ModuleName", "SUBJECT");
            formData.append("IsMore", false);
            function reqListener() {
                console.log(this.responseText);
                var resp = JSON.parse(this.responseText);
                if (window.opener) {
                    window.opener.HandleCanvasJson(resp.Object);
                    window.close();
                }
            }
            var request = new XMLHttpRequest();
            request.addEventListener("load", reqListener);
            request.open("POST", "/Admin/LmsDashBoard/InsertObjectFileSubject/");
            request.send(formData);
        }
        $('#quiz-save').on('click', function () {
            var quizType = $('#quiz-type').val();
            if (isCreateQuiz) {

                if (quizType == 'quiz-1') {
                    const saveData = {
                        canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                        // startingCanvas: matchQuizData.canvas,
                        questions,
                        correctAnswers: correctAnswers,
                        userAnswers: userAnswers,
                        setting: quizSetting,
                        gameType: quizType
                    }

                    var element = document.createElement('a');

                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveData)));
                    element.setAttribute('download', 'quiz-selectObj.json');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
                else if (quizType == 'quiz-2') {
                    const saveData = {
                        canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                        questions,
                        correctAnswers: correctAnswers,
                        userAnswers: userAnswers,
                        setting: quizSetting,
                        gameType: quizType
                    }

                    var element = document.createElement('a');

                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveData)));
                    element.setAttribute('download', 'quiz-inputObj.json');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
                else if (quizType == 'quiz-3')
                    try {
                        const saveData = {
                            canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                            startingCanvas: matchQuizData.canvas,
                            correctCanvas: matchQuizData.correctCanvas,
                            userCanvas: matchQuizData.userCanvas,
                            questions,
                            correctAnswers: correctAnswers,
                            userAnswers: userAnswers,
                            setting: quizSetting,
                            gameType: quizType
                        }

                        var element = document.createElement('a');

                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveData)));
                        element.setAttribute('download', 'quiz-matchObj.json');
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                    } catch (error) {
                        console.log(error);
                        const saveData = {
                            canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                            questions,
                            correctAnswers: correctAnswerMatch,
                            userAnswers: userResult,
                            setting: quizSetting,
                            gameType: quizType
                        }

                        var element = document.createElement('a');

                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveData)));
                        element.setAttribute('download', 'quiz-inputObj.json');
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                    }
            }
        });
        $('#quiz-upload').on('click', function () {
            var quizType = $('#quiz-type').val();
            if (isCreateQuiz) {

                if (quizType == 'quiz-1') {
                    const saveData = {
                        canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                        // startingCanvas: matchQuizData.canvas,
                        questions,
                        correctAnswers: correctAnswers,
                        userAnswers: userAnswers,
                        setting: quizSetting,
                        gameType: quizType
                    }
                    uploadQuiz(saveData);
                }
                else if (quizType == 'quiz-2') {
                    const saveData = {
                        canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                        questions,
                        correctAnswers: correctAnswers,
                        userAnswers: userAnswers,
                        setting: quizSetting,
                        gameType: quizType
                    }
                    uploadQuiz(saveData);
                }
                else if (quizType == 'quiz-3')
                    try {
                        const saveData = {
                            canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                            startingCanvas: matchQuizData.canvas,
                            correctCanvas: matchQuizData.correctCanvas,
                            userCanvas: matchQuizData.userCanvas,
                            questions,
                            correctAnswers: correctAnswers,
                            correctPosition: correctAnswerPosition,
                            userAnswers: userAnswers,
                            setting: quizSetting,
                            gameType: quizType
                        }
                        uploadQuiz(saveData);
                    } catch (error) {
                        console.log(error);
                        const saveData = {
                            canvas: JSON.stringify(canvas.toJSON(customAttributes)),
                            questions,
                            correctAnswers: correctAnswerMatch,
                            userAnswers: userResult,
                            setting: quizSetting,
                            gameType: quizType
                        }
                        uploadQuiz(saveData);
                    }
            }
        });

        $("#quiz-textColor").on('change', function () {
            console.log('textCOlor');
            quizSetting.textColor = this.value;
        });

        $("#quiz-bgColor").on('change', function () {
            quizSetting.bgColor = this.value;
        });

        $("#quiz-bgSelectColor").on('change', function () {
            quizSetting.bgSelectColor = this.value;
        });

        $("#quiz-textSelectColor").on('change', function () {
            quizSetting.textSelectColor = this.value;
        });

        $('#quiz-soundSelected').on('input', function (e) {
            const sound = loadSoundInput(e.target);
            quizSetting.selectSound = sound.src;
        })

        $('#quiz-soundCheck').on('input', function (e) {
            const sound = loadSoundInput(e.target);
            quizSetting.checkSound = sound.src;
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

        $("#drwClearCanvas").on('click', function () { canvas.clear(); });

        $("#textMode").on('click', function () { textMode(); });

        $('#createLatex').on('click', function () { createLatex(); });

        // $('#omegaSymbol').on('click', function () { omegaSymbol(); });

        //Thêm đối tượng
        $("#icongeometric").on('click', function () { icongeometric(); });

        $("#iconTriange").on('click', function () { iconTriange(); });

        $("#iconCricle").on('click', function () { iconCricle(); });

        $("#iconElipse").on('click', function () { iconElipse(); });

        $("#iconRect").on('click', function () { iconRect(); });

        $("#iconRoundedRect").on('click', function () { iconRoundedRect(); });

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
            var files = e.target.files,
                imageType = /image.*/;
            for (const file of files) {
                if (!file.type.match(imageType))
                    return;
                var reader = new FileReader();
                reader.onload = imageMode;
                reader.readAsDataURL(file);
            }

            e.target.value = '';
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

        canvas.renderAll();


    });

    // it's need to run 
    $('#zmmtg-root, .meeting-app, .meeting-client').addClass('nonew');

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

function generateID(type) {
    var date = new Date();
    return type + date.getDate() + date.getMonth() + date.getFullYear() + date.getHours() + date.getMinutes() + date.getSeconds();
}

function loadCanvasJson(arr, canvas) {
    console.log(arr);
    let layer_num = $('#layers-body .active').attr('data-cnt') - 3;
    for (let index = 0; index < arr.length; index++) {
        if (arr[index].data && arr[index].layer == layer_num) {
            var jsonObj = arr[index].data;
            if (arr[index].name == "lineConnect") {

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
                    if (enlivenedObjects[0]._objects &&
                        enlivenedObjects[0]._objects.length > 2 &&
                        enlivenedObjects[0]._objects[0].type != 'image') {
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
        elmnt.style.top = (elmnt.offtop = - pos2) + "px";
        elmnt.style.left = (elmnt.offleft = - pos1) + "px";
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

        element.style.width = (e.clientX - element.offsetLeft + 5) + 'px';
        element.style.height = (e.clientY - element.offsetTop - 30) + 'px';

    }

    function stopResize(e) {
        e.preventDefault();
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}

function loadAndUse(font, objectID, canvas) {
    if (font == "Time New Roman") {
        canvas.getObjects().forEach(item => {
            if (item.objectID == objectID) {
                if (item._objects.length > 2) {
                    item.item(1).set("fontFamily", font);
                } else {
                    item.item(0).set("fontFamily", font);
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
            if (pool_data[index].name != "lineConnect") {
                Object.keys(dataChange).forEach((key) => {
                    pool_data[index].data[key] = dataChange[key];
                })
            }
        } else {
            pool_data[index].data = dataChange;
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
    //let wrapper = MathJax.tex2svg(formula, {
    //    em: 10,
    //    ex: 5,
    //    display: true
    //})
    //let fin = btoa(unescape(encodeURIComponent(wrapper.querySelector('svg').outerHTML)));
    //let svg = "data:image/svg+xml;base64," + fin;
    //return svg;
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
                object.left + (object.width * object.scaleX / 2), object.top,
                object.left + (object.width * object.scaleX / 2), object.top
            ];
            break;
        case 'mr':
            points = [
                object.left + object.width * object.scaleX, object.top + (object.height * object.scaleY / 2),
                object.left + object.width * object.scaleX, object.top + (object.height * object.scaleY / 2)
            ];
            break;
        case 'mb':
            points = [
                object.left + (object.width * object.scaleX / 2), object.top + object.height * object.scaleY,
                object.left + (object.width * object.scaleX / 2), object.top + object.height * object.scaleY
            ];
            break;
        case 'ml':
            points = [
                object.left, object.top + (object.height * object.scaleY / 2),
                object.left, object.top + (object.height * object.scaleY / 2)
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
    console.log('choosePort');

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
        stroke: '#000',
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


    line.path[1][1] = point.x1 + 100;
    line.path[1][2] = point.y1 + 100;

    line.path[1][3] = point.x2;
    line.path[1][4] = point.y2;

    // var text;
    // if(point.x1 < point.x2) {
    //     text = new fabric.Text(text, {
    //         fontSize: 10,
    //         top: point.y1,
    //         left: point.x1,
    //         objectCaching: false,
    //         name: "lineusername1",
    //         lineID: objectID,
    //         corner: corner1
    //     });
    // } else {
    //     text = new fabric.Text(text, {
    //         fontSize: 10,
    //         top: point.y2,
    //         left: point.x2,
    //         objectCaching: false,
    //         name: "lineusername",
    //         lineID: objectID,
    //         corner: corner2
    //     });
    // }
    // canvas.add(text);

    canvas.add(line);

    var p1 = makeCurvePoint(canvas, objectID, point.x1 + 100, point.y1 + 100, line);
    canvas.add(p1);

    return line;
}

function makeCurvePoint(canvas, objectID, left, top, line) {
    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 4,
        radius: 8,
        fill: '#fff',
        stroke: '#666',
        originX: 'center',
        originY: 'center',
        lineID: objectID,
        name: 'curve-point'
    });

    c.hasBorders = c.hasControls = false;


    c.on('moving', function () {
        if (line) {
            line.path[1][1] = c.left;
            line.path[1][2] = c.top;
        }
    });

    return c;
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

// function addPort(object, canvas, objectID) {
//     let port = [ 'mt', 'mr', 'mb', 'ml' ];

//     let point = findTargetPort(object, port);
//     var c = new fabric.Circle({
//         left: point.x1,
//         top: point.y1,
//         radius: 0,
//         fill: '#37e226',
//         name: "port",
//         port: port,
//         portID: objectID,
//         originX: 'center',
//         originY: 'center'
//     });

//     canvas.add(c);
// }