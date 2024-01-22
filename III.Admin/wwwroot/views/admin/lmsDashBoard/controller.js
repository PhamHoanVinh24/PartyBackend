var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderLmsQuiz = "/views/admin/lmsQuiz";
var ctxfolderSupplier = "/views/admin/supplier";
var ctxfolderProject = "/views/admin/project";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/lmsCommonSetting";
var app = angular.module('App_ESEIM_LMS_DASHBOARD', ['App_ESEIM_REPOSITORY', 'App_ESEIM_CMS_ITEM', 'App_ESEIM_FILE_PLUGIN', "ui.sortable", "ngCookies", "ngSanitize", "ngJsTree", "treeGrid", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'ui.select', "pascalprecht.translate", 'dynamicNumber', 'scrollToEnd', 'ngTagsInput', 'ui.tab.scroll', 'youtube-embed', "dndLists", "FBAngular"]);

app.directive('customOnChangeLms', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeLms);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});

app.directive('customOnChangeSupplier', function () {
    return {
        restrict: 'A',
        scope: {
            obj: "=ngModel",
            handler: '&handler'
        },
        link: function (scope, element, attrs) {
            //var onChangeHandler = scope.$eval(attrs.customOnChangeSupplier);
            window.URL = window.URL || window.webkitURL;
            function getDuration(control) {
                var video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = function () {
                    window.URL.revokeObjectURL(video.src);
                    scope.obj = parseInt(video.duration);
                    //alert("Duration : " + video.duration + " seconds");
                }
                if (control.files.length > 0) {
                    video.src = URL.createObjectURL(control.files[0]);
                }
            }
            element.on('change', function (evt) {
                getDuration(this);
                scope.handler({ event: evt });
                //onChangeHandler(evt);
            });
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.directive('getFtpServerVideoDuration', function ($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            handler: '&handler'
        },
        link: function (scope, element, attrs) {
            var id = scope.$eval(attrs.lectureId);
            window.URL = window.URL || window.webkitURL;
            element.on('click', function (evt) {
                var newValue = scope.$eval(attrs.getFtpServerVideoDuration);
                var video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = function () {
                    window.URL.revokeObjectURL(video.src);
                    scope.handler({ id: id, duration: video.duration });
                };
                video.src = newValue;
            });
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});

app.directive('fabricCanvas', function ($parse, $timeout) {
    return {
        restrict: 'A',
        scope: {
            fabricCanvas: '=',
            obj: '=ngModel'
        },
        link: function (scope, el, attrs) {
            var innerCanvas = el[0].querySelector('canvas');
            var outerWidth = el.outerWidth();
            var canvas = new fabric.Canvas(innerCanvas, { width: outerWidth, height: 400 });
            scope.obj.canvas = canvas;
            var listCheckAnswer = [];
            scope.obj.listCheckAnswer = listCheckAnswer;

            var results_pair = [];
            scope.obj.resultPairs = results_pair;
        }
    };
});

app.directive('loadUrl', function ($http, $compile, $timeout, $parse) {
    return {
        link: function (scope, element, attrs) {
            var url = "/lib/eduComposeEngine/index.html";
            scope.$watch($parse(attrs.loadUrl), function (newval) {
                if (newval === true) {
                    //$timeout(function () {
                    //    $http.get(url).then(function (response) {
                    //        var data = response.data;
                    //        var contents = document.createElement('div');
                    //        contents.innerHTML = data.trim();
                    //        var elementRef = document.getElementById('#eduComposeEngine');
                    //        var shadow = elementRef.attachShadow({ mode: 'open' });
                    //        shadow.appendChild(contents);
                    //    });
                    //});
                }
                else {
                    scope.$parent.isCreateAnswer = false;
                }
            });
        }
    }
});

app.directive('watchCanvasJson', function ($http, $compile, $timeout, $parse, $window) {
    return {
        link: function (scope, element, attrs, ngModel) {
            /* #region watch json canvas change  */
            scope.$watch(function () {
                return $window.canvasJson;
            }, function (newVal, oldVal) {
                if (newVal) {
                    scope.model.Content = newVal;
                    if (CKEDITOR.instances['ckEditorItem']) {
                        CKEDITOR.instances['ckEditorItem'].setData(newVal);
                    }
                }
            });
        }
    }
});

app.directive('recordAudioLms', function ($http, $compile, $timeout, $parse, $window) {
    return {
        restrict: 'A',
        scope: {
            obj: "=ngModel",
            handler: '&handler'
        },
        link: function (scope, element, attrs) {
            window.URL = window.URL || window.webkitURL;
            let isRecordAudio = false;
            let audioStream;
            let audioRecorded = $('#micRecorded')[0];
            element.on('click', function (evt) {
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
                                const audioBlob = new Blob(audioChunks);
                                const audioUrl = URL.createObjectURL(audioBlob);

                                audioRecorded.src = audioUrl;
                                audioRecorded.load();
                                scope.handler({ blob: audioBlob, ext: '.mp3' });
                            });

                            audioRecorder.start();
                            element[0].innerHTML = '<i class="fas fa-stop fs25" aria-hidden="true"></i>';
                        })
                }
                else {
                    audioStream.getTracks().forEach(track => {
                        track.stop();
                    });
                    audioRecorder.stop();
                    element[0].innerHTML = '<i class="fas fa-microphone fs25" aria-hidden="true"></i>';
                }
                isRecordAudio = !isRecordAudio;
            });
        }
    };
});

app.directive('captureVideoLms', function ($http, $compile, $timeout, $parse, $window) {
    return {
        restrict: 'A',
        scope: {
            obj: "=ngModel",
            handler: '&handler'
        },
        link: function (scope, element, attrs) {
            window.URL = window.URL || window.webkitURL;
            let isRecordVideo = false;
            let videoStream;
            let cameraRecorded = $('#cameraRecorded')[0];
            let cameraRecording = $('#cameraRecording')[0];
            element.on('click', function (evt) {
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
                                const videoBlob = new Blob(videoChunks);
                                const videoUrl = URL.createObjectURL(videoBlob);

                                cameraRecording.pause();
                                cameraRecorded.style.display = 'inline-block';
                                cameraRecording.style.display = 'none';

                                cameraRecorded.src = videoUrl;
                                cameraRecorded.load();
                                scope.handler({ blob: audioBlob, ext: '.mp4' });
                            });

                            cameraRecorder.start();
                            $('#camera-mark').css({ 'display': 'block' });

                            element.innerHTML = '<i class="fas fa-stop fs25" aria-hidden="true"></i>';
                        })
                }
                else {
                    $('#camera-mark').css({ 'display': 'none' });

                    videoStream.getTracks().forEach(track => {
                        track.stop();
                    });
                    cameraRecorder.stop();
                    element[0].innerHTML = '<i class="fas fa-video fs25" aria-hidden="true"></i>';
                }

                isRecordVideo = !isRecordVideo;
            });
        }
    };
});

app.directive('captureScreenLms', function ($http, $compile, $timeout, $parse, $window) {
    return {
        restrict: 'A',
        scope: {
            obj: "=ngModel",
            handler: '&handler'
        },
        link: function (scope, element, attrs) {
            window.URL = window.URL || window.webkitURL;
            let screenshotImg = $('#screenshot-img')[0];
            element.on('click', function (evt) {
                var video = $('#takephoto-video')[0];
                var canvas = $('#takephoto-canvas')[0];
                function b64toBlob(b64Data, contentType, sliceSize) {
                    contentType = contentType || '';
                    sliceSize = sliceSize || 512;

                    var byteCharacters = atob(b64Data);
                    var byteArrays = [];

                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);

                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        var byteArray = new Uint8Array(byteNumbers);

                        byteArrays.push(byteArray);
                    }

                    var blob = new Blob(byteArrays, { type: contentType });
                    return blob;
                }

                navigator.mediaDevices.getDisplayMedia()
                    .then(captureStream => {
                        video.srcObject = captureStream;

                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                                captureStream.getTracks().forEach(track => track.stop());
                                resolve(canvas.toDataURL('image/jpeg'));
                            }, 500);
                        })

                        captureStream.getTracks().forEach(track => track.stop());

                        $('.screenshot-popup-class').css({ 'left': '230px' })
                    })
                    .then(base64 => {
                        screenshotImg.src = base64;
                        screenshotImg.style.height = window.height / window.width * screenshotImg.width + 'px';
                        screenshotImg.style.display = 'block';
                        var imageBlob = b64toBlob(base64);
                        scope.handler({ blob: imageBlob, ext: '.png' });
                    })
                    .catch(err => {
                        console.error("Screenshot Error: " + err);
                    })
            });
        }
    };
});

app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return caption.CJ_LBL_JUST_FINISH;
                } else {
                    return diffMins + ' ' + caption.CJ_LBL_MINUTE_AGO;
                }
            } else {
                return diffHrs + '  ' + caption.CJ_LBL_HOUR + diffMins + ' ' + caption.CJ_LBL_MINUTE_AGO;
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

app.filter('groupBy', function ($parse) {
    return _.memoize(function (items, field) {
        var getter = $parse(field);
        return _.groupBy(items, function (item) {
            return getter(item);
        });
    });
});

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

app.factory('dataserviceLms', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    };
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callback).catch(function (error) {
            App.unblockUI("#modal-body");
            App.toastrError(caption.LMS_FILE_NOT_SEE_ON_THE_MACHINE_PLEASE_CHOOSE_FILE);
        });
    };
    return {
        //subject
        insertSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertSubject/', data).then(callback);
        },
        updateSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateSubject/', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetItemSubject/' + data).then(callback);
        },
        deleteSubject: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteSubject?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetListUser').then(callback);
        },
        gettreedata: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetTreeData').then(callback);
        },
        getTreeCourseware: function (callback) {
            $http.post('/Admin/LmsCourseware/GetTreeCategory/').then(callback);
        },
        //lecture

        insertLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertLecture/', data).then(callback);
        },
        updateLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateLecture/', data).then(callback);
        },
        getItemLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/getItemLecture/' + data).then(callback);
        },
        deleteLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteLecture?id=' + data).then(callback);
        },
        deleteLectureCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteLectureCourse', data).then(callback);
        },
        insertLectureCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertLectureCourse', data).then(callback);
        },
        getSubjectCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetSubjectCourse?subjectCode=' + data).then(callback);
        },
        getListLectureCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetListLectureCourse?lectureCode=' + data).then(callback);
        },
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
        },
        getUserShareLecturePermission: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetUserShareLecturePermission?id=' + data).then(callback);
        },
        updateLecturePermission: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateLecturePermission/', data).then(callback);
        },
        updateVideoDuration: function (data, data1, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateVideoDuration?id=' + data + '&duration=' + data1).then(callback);
        },
        getVideoDurationById: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetVideoDurationById?id=' + data).then(callback);
        },
        getListClass: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListClass').then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserOfClass?classCode=' + data).then(callback);
        },
        //quiz

        insertQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertQuiz/', data).then(callback);
        },
        updateQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateQuiz/', data).then(callback);
        },
        updateAnswer: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateAnswer/', data).then(callback);
        },
        updateReference: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateReference/', data).then(callback);
        },
        getItemQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/getItemQuiz/' + data).then(callback);
        },
        getItemCms: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetItemCms?code=' + data).then(callback);
        },
        getCurrentUserFullName: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetCurrentUserFullName').then(callback);
        },
        getListCmsItem: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetListCmsItem').then(callback);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListSubject').then(callback);
        },
        getListLecture: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetListLecture?subjectCode=' + data).then(callback);
        },
        getListTypeQuiz: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetLmsQuizType').then(callback);
        },
        deleteQuiz: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteQuiz?id=' + data).then(callback);
        },
        setLmsSessionCode: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/SetLmsSessionCode?sessionCode=' + data).then(callback);
        },
        getLmsSessionCode: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetLmsSessionCode').then(callback);
        },
        deleteQuizCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteQuizCourse', data).then(callback);
        },
        insertQuizCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertQuizCourse', data).then(callback);
        },
        getSubjectLectureCourse: function (data, data1, callback) {
            $http.post('/Admin/LmsDashBoard/GetSubjectLectureCourse?subjectCode=' + data + 'lectureCode=' + data1).then(callback);
        },
        getListQuizCourse: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetListQuizCourse?lectureCode=' + data).then(callback);
        },
        getGameJsonData: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetGameJsonData?url=' + data).then(callback);
        },
        // amchart
        amchartDoExercise: function (callback) {
            $http.get('/Admin/LmsDashBoard/AmchartDoExercise').then(callback);
        },
        amchartLearnSubject: function (callback) {
            $http.get('/Admin/LmsDashBoard/AmchartLearnSubject/').then(callback);
        },
        getApiLmsCount: function (callback) {
            $http.post('/Admin/LmsDashBoard/GetApiLmsCount/').then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM_LMS_DASHBOARD', function ($scope, $rootScope, $compile, $uibModal, dataserviceLms, $cookies, $filter, $translate, $window) {
    console.log('bootstrapped');
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.StatusData = [{
            Value: 1,
            Name: caption.LMS_ACTIVATED
        }, {
            Value: 2,
            Name: caption.LMS_NO_ACTIVATED
        }];

        //$rootScope.validationOptionsQuiz = {
        //    rules: {
        //        Code: {
        //            required: true,
        //        },
        //        Duration: {
        //            required: true,
        //        },
        //    },
        //    messages: {
        //        Code: {
        //            required: caption.LMS_VALIDATE_QUIZ_CODE,
        //        },
        //        Duration: {
        //            required: caption.LMS_VALIDATE_DURATION,
        //        },
        //    }
        //}

        $rootScope.isTranslate = true;
    });
    $rootScope.isTranslate = false;
    $rootScope.open = true;

    // Get fullName with picture
    $scope.fullName = fullName;
    $scope.pictureUser = pictureUser;

    dataserviceLms.getListSubject(function (rs) {
        rs = rs.data;
        $rootScope.listSubject = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $translateProvider.useUrlLoader('/Admin/LmsDashBoard/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLmsDashBoard + '/dash-board.html',
            controller: 'dashBoard'
        })
        .when('/addSubject', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderLmsDashBoard + '/add-subject.html',
            controller: 'addSubject'
        })
        .when('/editSubject', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderLmsDashBoard + '/add-subject.html',
            controller: 'editSubject'
        })
        .when('/showStat', {
            templateUrl: ctxfolderLmsDashBoard + '/stat-chart.html',
            controller: 'showStat'
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('menuSessionLms', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    dataserviceLms.getLmsSessionCode(function (rs) {
        rs = rs.data;
        if (rs == null || rs == '' || rs == undefined) {
            $rootScope.sessionCode = create_UUID();
            dataserviceLms.setLmsSessionCode($rootScope.sessionCode, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
            });
        }
        else {
            $rootScope.sessionCode = rs;
            console.log($rootScope.sessionCode);
        }
    });
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
});


app.controller('dashBoard', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    window.tabler = {
        colors: {
            'blue': '#467fcf',
            'blue-darkest': '#0e1929',
            'blue-darker': '#1c3353',
            'blue-dark': '#3866a6',
            'blue-light': '#7ea5dd',
            'blue-lighter': '#c8d9f1',
            'blue-lightest': '#edf2fa',
            'azure': '#45aaf2',
            'azure-darkest': '#0e2230',
            'azure-darker': '#1c4461',
            'azure-dark': '#3788c2',
            'azure-light': '#7dc4f6',
            'azure-lighter': '#c7e6fb',
            'azure-lightest': '#ecf7fe',
            'indigo': '#6574cd',
            'indigo-darkest': '#141729',
            'indigo-darker': '#282e52',
            'indigo-dark': '#515da4',
            'indigo-light': '#939edc',
            'indigo-lighter': '#d1d5f0',
            'indigo-lightest': '#f0f1fa',
            'purple': '#a55eea',
            'purple-darkest': '#21132f',
            'purple-darker': '#42265e',
            'purple-dark': '#844bbb',
            'purple-light': '#c08ef0',
            'purple-lighter': '#e4cff9',
            'purple-lightest': '#f6effd',
            'pink': '#f66d9b',
            'pink-darkest': '#31161f',
            'pink-darker': '#622c3e',
            'pink-dark': '#c5577c',
            'pink-light': '#f999b9',
            'pink-lighter': '#fcd3e1',
            'pink-lightest': '#fef0f5',
            'red': '#e74c3c',
            'red-darkest': '#2e0f0c',
            'red-darker': '#5c1e18',
            'red-dark': '#b93d30',
            'red-light': '#ee8277',
            'red-lighter': '#f8c9c5',
            'red-lightest': '#fdedec',
            'orange': '#fd9644',
            'orange-darkest': '#331e0e',
            'orange-darker': '#653c1b',
            'orange-dark': '#ca7836',
            'orange-light': '#feb67c',
            'orange-lighter': '#fee0c7',
            'orange-lightest': '#fff5ec',
            'yellow': '#f1c40f',
            'yellow-darkest': '#302703',
            'yellow-darker': '#604e06',
            'yellow-dark': '#c19d0c',
            'yellow-light': '#f5d657',
            'yellow-lighter': '#fbedb7',
            'yellow-lightest': '#fef9e7',
            'lime': '#7bd235',
            'lime-darkest': '#192a0b',
            'lime-darker': '#315415',
            'lime-dark': '#62a82a',
            'lime-light': '#a3e072',
            'lime-lighter': '#d7f2c2',
            'lime-lightest': '#f2fbeb',
            'green': '#5eba00',
            'green-darkest': '#132500',
            'green-darker': '#264a00',
            'green-dark': '#4b9500',
            'green-light': '#8ecf4d',
            'green-lighter': '#cfeab3',
            'green-lightest': '#eff8e6',
            'teal': '#2bcbba',
            'teal-darkest': '#092925',
            'teal-darker': '#11514a',
            'teal-dark': '#22a295',
            'teal-light': '#6bdbcf',
            'teal-lighter': '#bfefea',
            'teal-lightest': '#eafaf8',
            'cyan': '#17a2b8',
            'cyan-darkest': '#052025',
            'cyan-darker': '#09414a',
            'cyan-dark': '#128293',
            'cyan-light': '#5dbecd',
            'cyan-lighter': '#b9e3ea',
            'cyan-lightest': '#e8f6f8',
            'gray': '#868e96',
            'gray-darkest': '#1b1c1e',
            'gray-darker': '#36393c',
            'gray-dark': '#6b7278',
            'gray-light': '#aab0b6',
            'gray-lighter': '#dbdde0',
            'gray-lightest': '#f3f4f5',
            'gray-dark': '#343a40',
            'gray-dark-darkest': '#0a0c0d',
            'gray-dark-darker': '#15171a',
            'gray-dark-dark': '#2a2e33',
            'gray-dark-light': '#717579',
            'gray-dark-lighter': '#c2c4c6',
            'gray-dark-lightest': '#ebebec'
        }
    };
    dataserviceLms.amchartDoExercise(function (rs) {
        rs = rs.data;
        monthbuy = [];
        monthDoExc = [];
        sumTest = ['TestTotal'];
        rightTest = ['TestRight'];
        wrongTest = ['TestWrong'];
        sumSubject = ['SubjectTotal'];
        rightSubject = ['SubjectRight'];
        wrongSubject = ['SubjectWrong'];
        for (var i = 0; i < rs.length; i++) {
            sumTest.push(rs[i].TestTotal);
            rightTest.push(rs[i].TestRight);
            wrongTest.push(rs[i].TestWrong);
            sumSubject.push(rs[i].SubjectTotal);
            rightSubject.push(rs[i].SubjectRight);
            wrongSubject.push(rs[i].SubjectWrong);
            monthDoExc.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
        }
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_do_exercise', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        sumTest,
                        rightTest,
                        wrongTest,
                        sumSubject,
                        rightSubject,
                        wrongSubject
                    ],
                    type: 'area', // default type of chart
                    colors: {
                        'TestTotal': tabler.colors["blue"],
                        'TestRight': tabler.colors["pink"],
                        'TestWrong': tabler.colors["red"],
                        'SubjectTotal': tabler.colors["yellow"],
                        'SubjectRight': tabler.colors["green"],
                        'SubjectWrong': tabler.colors["hotpink"],
                    },
                    names: {
                        // name of each serie
                        'TestTotal': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_TEST,
                        'TestRight': /*caption.DB_LBL_FINISH*/ caption.LMS_CORRECT_TEST_RESULTS,
                        'TestWrong': /*caption.DB_LBL_PROCESSING*/ caption.LMS_WRONG_TEST_RESULTS,
                        'SubjectTotal': /*caption.DB_LBL_OUT_DATE*/ caption.LMS_SUBJECT_EXERCISES,
                        'SubjectRight': /*caption.DB_LBL_CANCEL*/ caption.LMS_CORRECT_COURSE_RESULTS,
                        'SubjectWrong': caption.LMS_WRONG_COURSE_RESULTS,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthDoExc
                    },
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });

        }, 100);
    });

    dataserviceLms.amchartLearnSubject(function (rs) {
        rs = rs.data;
        monthLearnSub = [];
        sumLearnSub = ['Sum'];
        for (var i = 0; i < rs.length; i++) {
            sumLearnSub.push(rs[i].Sum);
            monthLearnSub.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
        }
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_learn_subject', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        sumLearnSub,
                    ],
                    type: 'area', // default type of chart
                    colors: {
                        'Sum': tabler.colors["blue"],
                    },
                    names: {
                        // name of each serie
                        'Sum': /*caption.DB_LBL_TOTAL_NUMBER*/ "Xem bài giảng",
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthLearnSub
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);
    });
});
app.controller('showStat', function ($scope, $http, $location, $rootScope, $controller, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies, $timeout) {
    $scope.index = ctxfolderLmsDashBoard + "/show-stat.html";
    $controller('dashBoard', { $scope: $scope });
    $scope.listRole = [{
        Code: "STUDENT",
        Name: caption.LMS_STUDENT
    }, {
        Code: "TEACHER",
        Name: caption.LMS_TEACHER
    }
    ];
    $scope.model = {
        Role: "STUDENT"
    };
    $scope.refreshViewStudent = function () {
        monthQuizVoluntary = [];
        totalQuizVoluntary = ['Total'];
        doneQuizVoluntary = ['Done'];
        totalQuizVoluntary.push($scope.QuizVoluntary.Total);
        doneQuizVoluntary.push($scope.QuizVoluntary.Done);
        monthQuizVoluntary.push(caption.LMS_DASHBOARD_LBL_CHART_QUIZ_VOLUNTARY);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_QUIZ_VOLUNTARY', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalQuizVoluntary,
                        doneQuizVoluntary,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_TOTAL,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthQuizVoluntary
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthQuizAssignment = [];
        totalQuizAssignment = ['Total'];
        doneQuizAssignment = ['Done'];
        totalQuizAssignment.push($scope.QuizAssignment.Total - $scope.QuizAssignment.Done);
        doneQuizAssignment.push($scope.QuizAssignment.Done);
        monthQuizAssignment.push(caption.LMS_DASHBOARD_LBL_CHART_QUIZ_ASSIGMENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_QUIZ_ASSIGMENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalQuizAssignment,
                        doneQuizAssignment,
                    ],
                    type: 'pie', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_NOT_DONE,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthQuizAssignment
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthLectureVoluntary = [];
        totalLectureVoluntary = ['Total'];
        doneLectureVoluntary = ['Done'];
        totalLectureVoluntary.push($scope.LectureVoluntary.Total);
        doneLectureVoluntary.push($scope.LectureVoluntary.Done);
        monthLectureVoluntary.push(caption.LMS_DASHBOARD_LBL_CHART_LECTURE_VOLUNTARY);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_LECTURE_VOLUNTARY', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalLectureVoluntary,
                        doneLectureVoluntary,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_TOTAL,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthLectureVoluntary
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthLectureAssignment = [];
        totalLectureAssignment = ['Total'];
        doneLectureAssignment = ['Done'];
        totalLectureAssignment.push($scope.LectureAssignment.Total - $scope.LectureAssignment.Done);
        doneLectureAssignment.push($scope.LectureAssignment.Done);
        monthLectureAssignment.push(caption.LMS_DASHBOARD_LBL_CHART_LECTURE_ASSIGNMENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_LECTURE_ASSIGNMENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalLectureAssignment,
                        doneLectureAssignment,
                    ],
                    type: 'donut', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_NOT_DONE,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthLectureAssignment
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthTestVoluntary = [];
        totalTestVoluntary = ['Total'];
        doneTestVoluntary = ['Done'];
        totalTestVoluntary.push($scope.TestVoluntary.Total);
        doneTestVoluntary.push($scope.TestVoluntary.Done);
        monthTestVoluntary.push(caption.LMS_DASHBOARD_LBL_CHART_TEST_VOLUNTARY);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_TEST_VOLUNTARY', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalTestVoluntary,
                        doneTestVoluntary,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_TOTAL,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthTestVoluntary
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthTestAssignment = [];
        totalTestAssignment = ['Total'];
        doneTestAssignment = ['Done'];
        totalTestAssignment.push($scope.TestAssignment.Total - $scope.TestAssignment.Done);
        doneTestAssignment.push($scope.TestAssignment.Done);
        monthTestAssignment.push(caption.LMS_DASHBOARD_LBL_CHART_TEST_ASSIGNMENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_TEST_ASSIGNMENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalTestAssignment,
                        doneTestAssignment,
                    ],
                    type: 'pie', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_NOT_DONE,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthTestAssignment
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthExamStudent = [];
        totalExamStudent = ['Total'];
        doneExamStudent = ['Done'];
        totalExamStudent.push($scope.ExamStudent.Total);
        doneExamStudent.push($scope.ExamStudent.Done);
        monthExamStudent.push(caption.LMS_DASHBOARD_LBL_CHART_EXAM_STUDENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_EXAM_STUDENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalExamStudent,
                        doneExamStudent,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_TOTAL,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthExamStudent
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthTutorStudent = [];
        totalTutorStudent = ['Total'];
        doneTutorStudent = ['Done'];
        totalTutorStudent.push($scope.TutorStudent.Total - $scope.TutorStudent.Done);
        doneTutorStudent.push($scope.TutorStudent.Done);
        monthTutorStudent.push(caption.LMS_DASHBOARD_LBL_CHART_TUTOR_STUDENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_TUTOR_STUDENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalTutorStudent,
                        doneTutorStudent,
                    ],
                    type: 'donut', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_NOT_DONE,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthTutorStudent
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthSubjectStudent = [];
        totalSubjectStudent = ['Total'];
        doneSubjectStudent = ['Done'];
        totalSubjectStudent.push($scope.SubjectStudent.Total);
        doneSubjectStudent.push($scope.SubjectStudent.Done);
        monthSubjectStudent.push(caption.LMS_DASHBOARD_LBL_CHART_SUBJECT_STUDENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_SUBJECT_STUDENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalSubjectStudent,
                        doneSubjectStudent,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_TOTAL,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthSubjectStudent
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthFileStudent = [];
        totalFileStudent = ['Total'];
        doneFileStudent = ['Done'];
        totalFileStudent.push($scope.FileStudent.Total - $scope.FileStudent.Done);
        doneFileStudent.push($scope.FileStudent.Done);
        monthFileStudent.push(caption.LMS_DASHBOARD_LBL_CHART_FILE_STUDENT);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_FILE_STUDENT', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalFileStudent,
                        doneFileStudent,
                    ],
                    type: 'pie', // default type of chart
                    colors: {
                        'Total': tabler.colors["blue"],
                        'Done': tabler.colors["yellow"],
                    },
                    names: {
                        // name of each serie
                        'Total': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_NOT_DONE,
                        'Done': /*caption.DB_LBL_TOTAL_NUMBER*/ caption.LMS_DASHBOARD_LBL_DONE,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthFileStudent
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);
    };
    $scope.refreshViewTeacher = function () {
        monthTeacherOne = [];
        totalQuizTeacher = ['QuizTeacher'];
        totalLectureTeacher = ['LectureTeacher'];
        totalTestTeacher = ['TestTeacher'];
        totalExamTeacher = ['ExamTeacher'];
        totalQuizTeacher.push($scope.QuizTeacher.Total);
        totalLectureTeacher.push($scope.LectureTeacher.Total);
        totalTestTeacher.push($scope.TestTeacher.Total);
        totalExamTeacher.push($scope.ExamTeacher.Total);
        monthTeacherOne.push(caption.LMS_DASHBOARD_LBL_TOTAL);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_TEACHER_1', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalQuizTeacher,
                        totalLectureTeacher,
                        totalTestTeacher,
                        totalExamTeacher,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'QuizTeacher': tabler.colors["blue"],
                        'LectureTeacher': tabler.colors["yellow"],
                        'TestTeacher': tabler.colors["pink"],
                        'ExamTeacher': tabler.colors["green"],
                    },
                    names: {
                        // name of each serie
                        'QuizTeacher': caption.LMS_DASHBOARD_LBL_QUIZ_TEACHER,
                        'LectureTeacher': caption.LMS_DASHBOARD_LBL_LECTURE_TEACHER,
                        'TestTeacher': caption.LMS_DASHBOARD_LBL_TEST_TEACHER,
                        'ExamTeacher': caption.LMS_DASHBOARD_LBL_EXAM_TEACHER,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthTeacherOne
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);

        monthTeacherTwo = [];
        totalClassTeacher = ['ClassTeacher'];
        totalSubjectTeacher = ['SubjectTeacher'];
        totalStudentTeacher = ['StudentTeacher'];
        totalFileTeacher = ['FileTeacher'];
        totalClassTeacher.push($scope.ClassTeacher.Total);
        totalSubjectTeacher.push($scope.SubjectTeacher.Total);
        totalStudentTeacher.push($scope.StudentTeacher.Total);
        totalFileTeacher.push($scope.FileTeacher.Total);
        monthTeacherTwo.push(caption.LMS_DASHBOARD_LBL_TOTAL);
        setTimeout(function () {
            var chart = c3.generate({
                bindto: '#chart_TEACHER_2', // id of chart wrapper
                data: {
                    columns: [
                        // each columns data
                        totalClassTeacher,
                        totalSubjectTeacher,
                        totalStudentTeacher,
                        totalFileTeacher,
                    ],
                    type: 'bar', // default type of chart
                    colors: {
                        'ClassTeacher': tabler.colors["blue"],
                        'SubjectTeacher': tabler.colors["yellow"],
                        'StudentTeacher': tabler.colors["pink"],
                        'FileTeacher': tabler.colors["green"],
                    },
                    names: {
                        // name of each serie
                        'ClassTeacher': caption.LMS_DASHBOARD_LBL_CLASS_TEACHER,
                        'SubjectTeacher': caption.LMS_DASHBOARD_LBL_SUBJECT_TEACHER,
                        'StudentTeacher': caption.LMS_DASHBOARD_LBL_STUDENT_TEACHER,
                        'FileTeacher': caption.LMS_DASHBOARD_LBL_FILE_TEACHER,
                    }
                },
                axis: {
                    x: {
                        type: 'category',
                        // name of each category
                        categories: monthTeacherTwo
                    },
                    y: {
                        tick: {
                            format: function (x) {
                                if (x != Math.floor(x)) {
                                    var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                        var text = d3.select(this).select('text').text();
                                        return +text === x;
                                    }).style('opacity', 0);
                                    return '';
                                }
                                return x;
                            }
                        }
                    }
                },
                legend: {
                    show: true, //hide legend
                },
                padding: {
                    bottom: 0,
                    top: 0
                },
            });
        }, 100);
    }
    dataserviceLms.getApiLmsCount(function (rs) {
        rs = rs.data;
        //Student
        $scope.QuizVoluntary = JSON.parse(rs.QuizVoluntary);
        $scope.QuizAssignment = JSON.parse(rs.QuizAssignment);
        $scope.LectureVoluntary = JSON.parse(rs.LectureVoluntary);
        $scope.LectureAssignment = JSON.parse(rs.LectureAssignment);
        $scope.TestVoluntary = JSON.parse(rs.TestVoluntary);
        $scope.TestAssignment = JSON.parse(rs.TestAssignment);
        $scope.ExamStudent = JSON.parse(rs.ExamStudent);
        $scope.TutorStudent = JSON.parse(rs.TutorStudent);
        $scope.SubjectStudent = JSON.parse(rs.SubjectStudent);
        $scope.FileStudent = JSON.parse(rs.FileStudent);

        $scope.refreshViewStudent();
        //Teacher
        $scope.QuizTeacher = JSON.parse(rs.QuizTeacher);
        $scope.LectureTeacher = JSON.parse(rs.LectureTeacher);
        $scope.TestTeacher = JSON.parse(rs.TestTeacher);
        $scope.ExamTeacher = JSON.parse(rs.ExamTeacher);

        $scope.ClassTeacher = JSON.parse(rs.ClassTeacher);
        $scope.SubjectTeacher = JSON.parse(rs.SubjectTeacher);
        $scope.StudentTeacher = JSON.parse(rs.StudentTeacher);
        $scope.FileTeacher = JSON.parse(rs.FileTeacher);

        $scope.refreshViewTeacher();
    });

    $scope.switchDiv = function () {
        if ($scope.model.Role == "STUDENT") {
            $scope.model.Role = "TEACHER";
            $timeout(function () {
                $scope.refreshViewTeacher();
                $scope.$apply();
            });
        }
        else {
            $scope.model.Role = "STUDENT";
            $timeout(function () {
                $scope.refreshViewStudent();
                $scope.$apply();
            });
        }
    }
});
app.controller('indexLms', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $filter, $window, $cookies) {
    $scope.index = ctxfolderLmsDashBoard + "/dash-board.html";
    $("#icon-home").removeClass('pt10');
    $("#breadcrumb").addClass('hidden');
    $(document).ready(function (e) {
        $('.content-wrapper').css("height", "100%");
        $('#contentMain').css("height", "100%");
        $('.container-fluid').not('.board-detail').css("height", "100%");

        $.app.menu.expanded = true;
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
        $(".menu-toggle").click(function (e) {
            if ($.app.menu.collapsed) {
                $.app.menu.expanded = false;
                $.app.menu.expand();
                closeNavCard();
            } else {
                $.app.menu.collapsed = false;
                $.app.menu.toggle();
                closeNavCard();
            }
            e.stopImmediatePropagation();
        });
        $("#btnOpenTrello").click(function (e) {
            e.preventDefault();
            if ($.app.menu.expanded) {
                $.app.menu.toggle();
            }
            openNavCard();
            e.stopImmediatePropagation();
        });
    });
    //angular.element($window).bind('resize', function () {
    //    if ($window.innerWidth > 975 && $window.innerWidth < 1295) {
    //        $rootScope.listAndCard.Length = 2;
    //    }
    //    else if ($window.innerWidth > 1295 && $window.innerWidth < 1595) {
    //        $rootScope.listAndCard.Length = 3;
    //    } else if ($window.innerWidth > 1595 && $window.innerWidth < 1915) {
    //        $rootScope.listAndCard.Length = 4;
    //    }
    //    else if ($window.innerWidth > 1915 && $window.innerWidth < 2235) {
    //        $rootScope.listAndCard.Length = 5;
    //    } else if ($window.innerWidth > 2235) {
    //        $rootScope.listAndCard.Length = 6;
    //    }
    //});

    //Show, hide nav-left
    $scope.showNavLeft = true;
    $scope.navLeft = function () {
        if ($scope.showNavLeft) {
            $scope.showNavLeft = false;
            document.getElementById("mySidenav").style.width = "0px";
            document.getElementById("BoardDetail").style.paddingLeft = "0px";
        }
        else {
            $scope.showNavLeft = true;
            document.getElementById("mySidenav").style.width = "345px";
            document.getElementById("BoardDetail").style.paddingLeft = "330px";
        }
    }
});

// Subject & Lecture Management
app.controller('indexSubject', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLms, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        CategoryName: '',
        Published: '',
        ExtraFieldGroup: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listPublished = [
        { code: '', name: caption.LMS_ALL },
        {
            code: false,
            name: caption.LMS_NOT_DISPLAYED
        }, {
            code: true,
            name: caption.LMS_DISPLAY
        }
    ];
    $scope.initData = function () {
        /*dataserviceLms.getlistGroup(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
            var all = {
                Id: '',
                Name: 'Tất cả'
            }
            $scope.listGroup.unshift(all)
        });*/
    };
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EduCategory/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.ExtraFieldGroup = $scope.model.ExtraFieldGroup;
                //d.CategoryName = $scope.model.CategoryName;
                //d.Published = $scope.model.Published;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CMS_CAT_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"Nhóm" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ordering').withTitle('{{"CMS_CAT_COL_ORDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Published').withTitle('{{"CMS_CAT_COL_PUBLISH" | translate}}').renderWith(function (data, type, full) {

        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')" ></span> '
        }
        else {
            return '<span class="cursor glyphicon glyphicon-ban-circle text-danger fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')"></span> '
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash-alt"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }

    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };

    $scope.publish = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.LMS_MSG_WANT_STATUS_CHANGE;
                $scope.ok = function () {

                    /*dataserviceLms.approve(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {

                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });*/


                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    /*dataserviceLms.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });*/
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 500);
});
app.controller('addSubject', function ($scope, $rootScope, $compile, $uibModal, dataserviceLms, DTOptionsBuilder, DTColumnBuilder, DTInstances, Upload) {
    $("#breadcrumb").addClass('hidden');
    $scope.header = "Thêm môn học";
    $scope.index = ctxfolderLmsDashBoard + "/add-subject.html";
    $scope.videoUrl = "https://drive.google.com/file/d/1jHwULrJYT9EJnR-0u7KxodjjLyc_zpbU/preview";
    $scope.model = {
        SubjectCode: '',
        SubjectName: '',
        SubjectDescription: '',
        Teacher: '',
        Duration: '',
        Unit: '',
        ImageCover: '',
        VideoPresent: '',
        FileBase: '',
        Status: '',
    };

    $scope.model1 = {
        ListUser: []
    };
    $scope.init = function () {
        dataserviceLms.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.model1.ListUser.push(userName);
        });

        dataserviceLms.gettreedata(function (result) {
            result = result.data;
            $scope.listParentSubject = result;
        });
        dataserviceLms.getTreeCourseware(function (result) {
            result = result.data;
            $scope.listCatFolder = result;
        });
    }
    $scope.init();
    $rootScope.isShow = '';
    $rootScope.listStatus = [
        {
            Code: "AVAILABLE",
            Name: "Sẵn sàng"
        }, {
            Code: "UNAVAILABLE",
            Name: "Chưa sẵn sàng"
        },];
    $rootScope.listUnit = [
        {
            Code: "MINUTE",
            Name: "Phút"
        }, {
            Code: "HOUR",
            Name: "Giờ"
        },];
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemSubject'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemSubject'].getData();
            $scope.model.SubjectDescription = data;
        }
        $scope.model.Teacher = $scope.model1.ListUser.join(',');
        validationSelect($scope.model).Status;
        if (/*$scope.addform.validate() &&*/ !validationSelect($scope.model).Status) {
            dataserviceLms.insertSubject($scope.model, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.SubjectCode = $scope.model.SubjectCode;

                    dataserviceLms.getListSubject(function (rs) {
                        rs = rs.data;
                        $rootScope.listSubject = rs;
                    });
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.loadFileSubject = function (event) {
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;
            //data.uuid = create_UUID();

            //if (!$scope.isProgressModelOpen) {
            //    $scope.viewProgress();
            //}
            //$rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.FileBase = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
                //var index = $rootScope.progress.findIndex(x => x.uuid == result.Object);
                //$rootScope.progress.splice(index, 1);
                //if ($rootScope.progress.length == 0) {
                //    $scope.progressModal.close("End uploading");
                //    $scope.isProgressModelOpen = false;
                //}
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //var data = evt.config.data;
                //var index = $rootScope.progress.findIndex(x => x.uuid == data.uuid);
                //$rootScope.progress[index].progress = progressPercentage + '% ';
                //$rootScope.progress[index].style.width = progressPercentage + '% ';
            });
        }
    };
    $scope.loadImageCover = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        //if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
        //    App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
        //    return;
        //}
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.model.ImageCover = result.Object;
                    //defaultShareFile(result.ID);
                    //$scope.reload();
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Group" && $scope.model.ExtraFieldsGroup != "" && $scope.model.ExtraFieldsGroup != null && $scope.model.ExtraFieldsGroup != undefined) {
            $scope.errorGroup = false;
        } else {
            $scope.errorGroup = true;
        }
    }
    $scope.changeData = function (type, item) {
        if (type == "SubjectCode") {
            $scope.errorSubjectCode = false;
        }
        if (type == "SubjectName") {
            $scope.errorSubjectName = false;
        }
        if (type == "Teacher") {
            $scope.errorTeacher = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubjectCode = true;
            mess.Status = true;
        } else {
            $scope.errorSubjectCode = false;
        }
        if (data.SubjectName == "" || data.SubjectName == null || data.SubjectName == undefined) {
            $scope.errorSubjectName = true;
            mess.Status = true;
        } else {
            $scope.errorSubjectName = false;
        }
        if (data.Teacher == "" || data.Teacher == null || data.Teacher == undefined) {
            $scope.errorTeacher = true;
            mess.Status = true;
        } else {
            $scope.errorTeacher = false;
        }
        return mess;
    }
    function ckEditer() {
        var editor1 = CKEDITOR.replace('ckEditorItemSubject', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    setTimeout(function () {
        ckEditer();
    }, 1000);

    // lecture
    var vm = $scope;
    $scope.headerCompiledLecture = false;
    $scope.selectedLecture = [];
    $scope.listVideoUrl = [];
    $scope.selectAllLecture = false;
    $scope.toggleAllLecture = toggleAllLecture;
    $scope.toggleOneLecture = toggleOneLecture;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsLecture = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsDashBoard/JTableLecture",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SubjectCode = $rootScope.SubjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledLecture) {
                $scope.headerCompiledLecture = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.editLecture(Id);
                }
            });
        });
    vm.dtColumnsLecture = [];
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selectedLecture[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selectedLecture[' + full.Id + ']" ng-click="toggleOneLecture(selectedLecture, \'' + full.LectCode + '\')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('LectName').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">{{"LMS_LECTURE_NAME" | translate}}</span>').renderWith(function (data, type) {
        return '<span class="fs15">' + data + '</span>';
    }));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('ListCourse').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">{{"LMS_LIST_COURSE" | translate}}</span>').renderWith(function (data, type) {
        if (data != null && data != '' && data != undefined) {
            var listCourse = JSON.parse(data);
            var stringListCourse = listCourse.join(', ');
            return '<span class="fs15">' + stringListCourse + '</span>';
        }
        else {
            return '';
        }
    }));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('VideosDuration').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">{{"LMS_VIDEO_DURATION" | translate}}</span>').renderWith(function (data, type, full) {
        try {
            var listDuration = JSON.parse(data);
            $scope.listVideoUrl[full.Id] = full.VideoPresent;
            var listDurationLength = listDuration.length;
            var result = (listDuration[listDurationLength - 1].Duration / 60).toFixed(1) + " Phút";
            if (full.VideoPresent) {
                if (full.VideoPresent.indexOf('https://drive.google.com') != -1) {
                    result += '<a title="{{&quot;COM_BTN_CALCULATE&quot; | translate}}" ng-click="updateGoogleDuration(' + full.Id + ')" class="fs25 pl20"><i class="fas fa-calculator"></i></a>';
                }
                else {
                    result += '<a title="{{&quot;COM_BTN_CALCULATE&quot; | translate}}" get-ftp-server-video-duration="\'' + full.VideoPresent + '\'" lecture-id="' + full.Id + '" handler="updateFtpDuration(id, duration)" class="fs25 pl20"><i class="fas fa-calculator"></i></a>';
                }
                //getFtpServerVideoDuration
            }
            return result;
        } catch (e) {
            console.log(e);
            if (full.VideoPresent) {
                if (full.VideoPresent.indexOf('https://drive.google.com') != -1) {
                    return '<a title="{{&quot;COM_BTN_CALCULATE&quot; | translate}}" ng-click="updateGoogleDuration(' + full.Id + ')" class="fs25 pl20"><i class="fas fa-calculator"></i></a>';
                }
                else {
                    return '<a title="{{&quot;COM_BTN_CALCULATE&quot; | translate}}" get-ftp-server-video-duration="\'' + full.VideoPresent + '\'" lecture-id="' + full.Id + '" handler="updateFtpDuration(id, duration)" class="fs25 pl20"><i class="fas fa-calculator"></i></a>';
                }
            }
            else {
                return '';
            }
        }
    }));
    vm.dtColumnsLecture.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle(/*'{{"Tác vụ" | translate}}'*/'<span class="fs15">{{"COM_LIST_COL_ACTION" | translate}}</span>').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="shareLecture(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-share-alt"></i></a>' +
            '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editLecture(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="deleteLecture(' + full.Id + ')"  class="fs25"><i class="fas fa-trash-alt"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadDataLecture = reloadDataLecture;
    vm.dtInstanceLecture = {};
    function reloadDataLecture(resetPaging) {
        if (typeof vm.dtInstanceLecture.reloadData === 'function') {
            vm.dtInstanceLecture.reloadData(callback, resetPaging);
        }
    }
    function callbackLecture(json) {

    }
    function toggleAllLecture(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOneLecture(selectedItems, code) {
        for (var i = 0; i < selectedItems.length; i++) {
            selectedItems[i] = false;
        }
        if ($rootScope.LectureCode != code) {
            $rootScope.LectureCode = code;
        }
        else {
            $rootScope.LectureCode = '';
        }
        $scope.reload();
    }
    $scope.reloadLecture = function () {
        reloadDataLecture(true);
    };
    $scope.reloadNoResetPageLecture = function () {
        reloadDataLecture(false);
    };
    $scope.searchLecture = function () {
        reloadDataLecture(true);
    };
    $rootScope.reloadLecture = function () {
        $scope.reloadLecture();
    };
    // quiz
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsQuiz = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsDashBoard/JTableQuiz",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.LectureCode = $rootScope.LectureCode;
                d.SubjectCode = $rootScope.SubjectCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.edit(Id);
            //    }
            //});
        });

    vm.dtColumnsQuiz = [];
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('Code').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">Mã câu hỏi</span>').renderWith(function (data, type) {
        return '<span class="fs15">' + data + '</span>';
    }).withOption('sClass', 'wpercent10'));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('Content').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">Nội dung câu hỏi</span>').renderWith(function (data, type) {
        return '<span class="fs15">' + data + '</span>';
    }).withOption('sClass', ''));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('LectureName').withTitle(/*'{{"Tên" | translate}}'*/'<span class="fs15">Bài giảng</span>').renderWith(function (data, type) {
        return '<span class="fs15">' + data + '</span>';
    }).withOption('sClass', ''));
    vm.dtColumnsQuiz.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle(/*'{{"Tác vụ" | translate}}'*/'<span class="fs15">Tác vụ</span>').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editQuiz(' + full.Id + ')"  class="fs25 pr20"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="deleteQuiz(' + full.Id + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstanceQuiz = {};
    function reloadData(resetPaging) {
        if (typeof vm.dtInstanceQuiz.reloadData === 'function') {
            vm.dtInstanceQuiz.reloadData(callback, resetPaging);
        }
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }

    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadQuiz = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.updateGoogleDuration = function (id) {
        const regexpSize = /file\/d\/(.*)\/preview/;
        const match = $scope.listVideoUrl[id].match(regexpSize);
        dataserviceLms.getVideoDurationById(match[1], function (rs) {
            rs = rs.data;
            console.log(rs);
            dataserviceLms.updateVideoDuration(id, parseInt(rs.Object), function (res) {
                res = res.data;
                console.log(res);
                $scope.reloadLecture();
            })
        });
    }
    $scope.updateFtpDuration = function (id, duration) {
        dataserviceLms.updateVideoDuration(id, parseInt(duration), function (res) {
            res = res.data;
            console.log(res);
            $scope.reloadLecture();
        })
    }
    $scope.addLecture = function () {
        if ($rootScope.SubjectCode != null && $rootScope.SubjectCode != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/add-lecture.html',
                controller: 'addLecture',
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
            }, function () {
            });
        }
        else {
            App.toastrError(caption.LMS_NO_SUBJECT_CREATED); //caption.COM_MSG_NO_SUBJECT
        }
    };
    $scope.editLecture = function (id) {
        dataserviceLms.getItemLecture(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/add-lecture.html',
                controller: 'editLecture',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
            }, function () {
            });
        });
    };
    $scope.deleteLecture = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceLms.deleteLecture(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadLecture();
            $scope.reload();
        }, function () {
        });
    };
    $scope.shareLecture = function (id) {
        var userModel = {};
        //var listdata = $('#tblDataCustomerFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}

        //if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
        //    return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        //}

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsQuiz + '/shareObject.html',
            controller: 'shareLecture',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        //CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.addQuiz = function () {
        if (($rootScope.LectureCode != null && $rootScope.LectureCode != '') || ($rootScope.SubjectCode != null && $rootScope.SubjectCode != '')) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/add-quiz.html',
                controller: 'addQuiz',
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
                $rootScope.idQuiz = -1;
            }, function () {
            });
        }
        else {
            App.toastrError(caption.LMS_NO_LECTURE_SELECTED); //caption.COM_MSG_NO_LECTURE
        }
    };
    $scope.editQuiz = function (id) {
        dataserviceLms.getItemQuiz(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/add-quiz.html',
                controller: 'editQuiz',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: '50'
            });
            modalInstance.result.then(function (d) {
                $scope.reloadLecture();
                $rootScope.idQuiz = -1;
            }, function () {
            });
        });
    };
    $scope.deleteQuiz = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceLms.deleteQuiz(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };
    $scope.showVideo = function () {
        $rootScope.video = $scope.model.VideoPresent;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video.html',
            controller: function ($scope, $uibModalInstance, youtubeEmbedUtils) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
});
app.controller('editSubject', function ($scope, $rootScope, $controller, dataserviceLms) {
    $controller('addSubject', { $scope: $scope });
    $scope.header = caption.LMS_SUBJECT_EDIT;
    $scope.initData = function () {
        dataserviceLms.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
        var url_string = window.location.href;
        var url = new URL(url_string);

        var id = url.searchParams.get("id");
        dataserviceLms.getItem(id, function (rs) {
            rs = rs.data;
            if (rs === undefined || rs === null || rs === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                $scope.model = rs;
                $rootScope.SubjectCode = $scope.model.SubjectCode;
                $scope.model1.ListUser = $scope.model.Teacher.split(",");
                $scope.ImageCover = $scope.model.ImageCover != null && $scope.model.ImageCover != '' ? $scope.model.ImageCover.split('/').pop() : '';
                $scope.FileBase = $scope.model.FileBase != null && $scope.model.FileBase != '' ? $scope.model.FileBase.split('/').pop() : '';
                $rootScope.reloadLecture();
                $rootScope.reloadQuiz();
                setTimeout(function () {
                    CKEDITOR.instances['ckEditorItemSubject'].setData($scope.model.SubjectDescription);
                }, 1000);
            }
        });
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemSubject'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemSubject'].getData();
            $scope.model.SubjectDescription = data;
        }
        $scope.model.Teacher = $scope.model1.ListUser.join(',');
        validationSelect($scope.model).Status;
        if (/*$scope.addform.validate() && !validationSelect($scope.model).Status*/
            !validationSelect($scope.model).Status) {
            dataserviceLms.updateSubject($scope.model, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.SubjectCode = $scope.model.SubjectCode;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubjectCode = true;
            mess.Status = true;
        } else {
            $scope.errorSubjectCode = false;
        }
        if (data.SubjectName == "" || data.SubjectName == null || data.SubjectName == undefined) {
            $scope.errorSubjectName = true;
            mess.Status = true;
        } else {
            $scope.errorSubjectName = false;
        }
        if (data.Teacher == "" || data.Teacher == null || data.Teacher == undefined) {
            $scope.errorTeacher = true;
            mess.Status = true;
        } else {
            $scope.errorTeacher = false;
        }
        return mess;
    }
});

app.controller('addLecture', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceLms, Upload) {
    $rootScope.modelLecture = {
        LectCode: /*generateUUID()*/'',
        LectName: '',
        LectDescription: '',
        Duration: '',
        Unit: '',
        VideoPresent: '',
        SubjectCode: $rootScope.SubjectCode,
        IsInteractive: false,
        InteractiveFilePath: ''
    };
    $scope.modelCourse = {
        Code: ''
    };
    $scope.header = caption.LMS_ADDNEW_LECTURE;
    $rootScope.checkLectCode = function () {
        if ($rootScope.modelLecture.LectCode == null || $rootScope.modelLecture.LectCode == '') {
            App.toastrError(caption.LMS_LECTURE_NOT_CREATED); //caption.COM_MSG_NO_LECT_CODE
        }
    }

    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemLecture'].destroy();
        }
        $uibModalInstance.close();
    }

    $scope.initData = function () {
        $rootScope.ObjectTypeFile = "LMS_LECTURE";
        $rootScope.moduleName = "LECTURE";
        dataserviceLms.getSubjectCourse($rootScope.SubjectCode, function (rs) {
            rs = rs.data;
            $scope.listCourse = rs;
        });
    };
    $scope.initData();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemLecture'].getData();
            $rootScope.modelLecture.LectDescription = data;
        }
        validationSelect($rootScope.modelLecture).Status;
        if (/*$scope.addform.validate() && !validationSelect($scope.model).Status*/
            !validationSelect($rootScope.modelLecture).Status) {
            dataserviceLms.insertLecture($rootScope.modelLecture, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.LectCode = $rootScope.modelLecture.LectCode;
                    $rootScope.ObjCode = $rootScope.LectCode;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };
    $scope.changeData = function (type, item) {
        if (type == "LectCode") {
            $scope.errorLectureCode = false;
        }
        if (type == "LectName") {
            $scope.errorLectureName = false;
        }
    }

    $scope.addCourse = function () {
        if ($scope.modelCourse.Code == "" || $scope.modelCourse.Code == null || $scope.modelCourse.Code == undefined) {
            return App.toastr(caption.LMS_MUST_SELECT_COURSE);
        }
        var courseObj = {
            LectureCode: $rootScope.LectCode,
            CourseCode: $scope.modelCourse.Code,
            SubjectCode: $rootScope.SubjectCode
        }
        dataserviceLms.insertLectureCourse(courseObj, function (result) {
            result = result.data;
            if (result.Error) {
                return App.toastrError(rs.Title);
            }
            else {
                dataserviceLms.getListLectureCourse($rootScope.LectCode, function (rs) {
                    rs = rs.data;
                    $scope.listLectureCourse = rs;
                });
            }
        });
    }
    $scope.deleteCourse = function (obj) {
        var courseSubject = {
            LectureCode: $rootScope.LectCode,
            CourseCode: obj.CourseCode,
            SubjectCode: $rootScope.SubjectCode
        }
        dataserviceLms.deleteLectureCourse(courseSubject, function (result) {
            result = result.data;
            if (result.Error) {
                return App.toastrError(rs.Title);
            }
            else {
                dataserviceLms.getListLectureCourse($rootScope.LectCode, function (rs) {
                    rs = rs.data;
                    $scope.listLectureCourse = rs;
                });
            }
        });
    }
    $scope.loadInteractFile = function (event) {
        var files = event.target.files;
        //if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
        //    App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
        //    return;
        //}
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            $rootScope.modelLecture.IsInteractive = false;
            return App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        var data = {};
        data.FileUpload = file;
        data.ObjectCode = $rootScope.ObjCode;
        data.ObjectType = $rootScope.ObjectTypeFile;
        data.ModuleName = "LECTURE";
        data.IsMore = false;

        Upload.upload({
            url: '/Admin/LmsDashBoard/InsertInteractFileLecture/',
            data: data
        }).then(function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                $rootScope.modelLecture.IsInteractive = true;
                $rootScope.modelLecture.InteractiveFilePath = result.Object;
                $scope.InteractiveFilePath = $rootScope.modelLecture.InteractiveFilePath != null && $rootScope.modelLecture.InteractiveFilePath != '' ? $rootScope.modelLecture.InteractiveFilePath.split('/').pop() : '';
                event.target.value = "";
                //defaultShareFile(result.ID);
                //$scope.reload();
            }
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            $rootScope.modelLecture.IsInteractive = false;
            event.target.value = "";
        }, function (evt) {

        });
    };
    $scope.showVideo = function () {
        $rootScope.video = $rootScope.modelLecture.VideoPresent;
        if ($rootScope.video) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/show-video-origin.html',
                controller: function ($scope, $rootScope, $uibModalInstance, youtubeEmbedUtils, $sce) {
                    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
                    var match = $rootScope.video.match(regExp);
                    var idxDot = $rootScope.video.lastIndexOf(".") + 1;
                    var extFile = $rootScope.video.substr(idxDot, $rootScope.video.length).toLowerCase();
                    if (match && match[2].length == 11) {
                        $scope.videoType = "YOUTUBE";
                    }
                    else if (extFile.length > 0 && extFile.length < 5) {
                        $scope.videoType = "HTML5";
                    }
                    else {
                        $rootScope.video = $sce.trustAsResourceUrl($rootScope.video);
                        $scope.videoType = "DRIVE";
                    }
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                //$scope.reload();
            }, function () {
            });
        }
        else {
            return App.toastr(caption.LMS_VIDEO_IS_EMPTY);
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.LectCode == "" || data.LectCode == null || data.LectCode == undefined) {
            $scope.errorLectureCode = true;
            mess.Status = true;
        } else {
            $scope.errorLectureCode = false;
        }

        if (data.LectName == "" || data.LectName == null || data.LectName == undefined) {
            $scope.errorLectureName = true;
            mess.Status = true;
        } else {
            $scope.errorLectureName = false;
        }
        return mess;
    }

    function ckEditer() {
        var editor1 = CKEDITOR.replace('ckEditorItemLecture', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    setTimeout(function () {
        ckEditer();
    }, 500);
});
app.controller('editLecture', function ($scope, $rootScope, $controller, $compile, $uibModal, $uibModalInstance, dataserviceLms, para, Upload) {
    $controller('addLecture', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.header = "Sửa bài giảng";
    $scope.initData = function () {
        $rootScope.ObjectTypeFile = "LMS_LECTURE";
        $rootScope.moduleName = "LECTURE";
        $rootScope.modelLecture = para;
        $rootScope.LectCode = $rootScope.modelLecture.LectCode;
        $rootScope.ObjCode = $rootScope.LectCode;
        $scope.InteractiveFilePath = $rootScope.modelLecture.InteractiveFilePath != null && $rootScope.modelLecture.InteractiveFilePath != '' ? $rootScope.modelLecture.InteractiveFilePath.split('/').pop() : '';
        dataserviceLms.getListLectureCourse($rootScope.LectCode, function (rs) {
            rs = rs.data;
            $scope.listLectureCourse = rs;
        });
        setTimeout(function () {
            CKEDITOR.instances['ckEditorItemLecture'].setData($rootScope.modelLecture.LectDescription);
        }, 1000);
    }
    $scope.initData();
    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemLecture'].destroy();
        }
        $rootScope.LectCode = '';
        $rootScope.ObjCode = '';
        $uibModalInstance.close();
    }

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemLecture'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemLecture'].getData();
            $rootScope.modelLecture.LectDescription = data;
        }
        validationSelect($rootScope.modelLecture).Status;
        if (/*$scope.addform.validate() && !validationSelect($scope.model).Status*/
            !validationSelect($rootScope.modelLecture).Status) {
            dataserviceLms.updateLecture($rootScope.modelLecture, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $rootScope.LectCode = $rootScope.modelLecture.LectCode;
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.LectCode == "" || data.LectCode == null || data.LectCode == undefined) {
            $scope.errorLectureCode = true;
            mess.Status = true;
        } else {
            $scope.errorLectureCode = false;
        }

        if (data.LectName == "" || data.LectName == null || data.LectName == undefined) {
            $scope.errorLectureName = true;
            mess.Status = true;
        } else {
            $scope.errorLectureName = false;
        }
        return mess;
    }
});
app.controller('shareLecture', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceLms, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };

    $scope.model1 = {
        UserName: '',
        GivenName: ''
    };
    $scope.modelClass = {
        Code: ''
    }
    $scope.modelShare = {
        isPublic: false
    }

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            }
        ];
        dataserviceLms.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });

        dataserviceLms.getUserShareLecturePermission($scope.model.Id, function (rs) {
            rs = rs.data;
            $scope.lstUserSharePermission = rs;
            var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == "All");
            if (allIndex != -1) {
                $scope.lstUserSharePermission = $scope.lstUserSharePermission.filter(x => x.UserName == "All");
            }
        });

        dataserviceLms.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName == '' && $scope.modelShare.isPublic !== true) {
            return App.toastrError(caption.LMS_QUIZ_MUST_CHOOSE_USER);
        }
        var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === "All");
        if (allIndex !== -1) {
            return App.toastrError(caption.LMS_QUIZ_ALREADY_ADD_ALL);
        }

        var model = angular.copy($scope.model1);
        if ($scope.modelShare.isPublic === true) {
            $scope.lstUserSharePermission = [];
            $scope.lstUserSharePermission.push({
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            });
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceLms.updateLecturePermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
        }
        else if (model.UserName === "All") {
            $scope.addUser(0);
        }
        else {
            var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
            if (userIndex !== -1) {
                App.toastrError(caption.LMS_STUDENT_EXIST);
            }
            else {
                $scope.lstUserSharePermission.push(model);
                var share = JSON.stringify($scope.lstUserSharePermission);

                var answerData = {
                    Id: $scope.model.Id,
                    Share: share
                }

                dataserviceLms.updateLecturePermission(answerData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        }

    }

    $scope.addUser = function (index) {
        if (index >= $scope.listUser.length) {
            return;
        }
        var model = $scope.listUser[index];
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
        if (userIndex !== -1) {
            App.toastrError(caption.LMS_STUDENT_EXIST);
            $scope.addUser(index + 1);
        }
        else if (model.UserName === "All") {
            $scope.addUser(index + 1);
        }
        else {
            $scope.lstUserSharePermission.push(model);
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceLms.updateLecturePermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $scope.addUser(index + 1);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.addUser(index + 1);
                    }
                });
        }
    }

    $scope.classOff = function () {
        $scope.modelClass = {
            Code: ''
        };
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            }
        ];
        dataserviceLms.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });
    }

    var allMember = {
        UserId: "ALL",
        GivenName: "Tất cả",
        UserName: "All",
        RoleSys: "",
        Branch: "",
        DepartmentName: ""
    }

    $scope.classSelect = function (obj) {
        $scope.listUser = [];
        dataserviceLms.getListUserOfClass($scope.modelClass.Code, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.countUser = rs.length;
            $scope.listUser.unshift(allMember);
            $scope.isClassSelect = true;
        });
    }

    $scope.deleteShare = function (userName) {
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == userName);
        if (userIndex == -1) {
            return App.toastrError(caption.LMS_QUIZ_USER_NOT_EXIST);
        }

        $scope.lstUserSharePermission.splice(userIndex, 1);
        var share = JSON.stringify($scope.lstUserSharePermission);

        var answerData = {
            Id: $scope.model.Id,
            Share: share
        }

        dataserviceLms.updateLecturePermission(answerData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.changeUser = function (item) {
        $scope.model1.GivenName = item.GivenName;
        $scope.model1.UserName = item.UserName;
        //$scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('file-plugin-lecture', function ($scope, $rootScope, $compile, $controller, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceFilePlugin, $filter, $window, Upload) {
    $controller('file-plugin', { $scope: $scope, $rootScope: $rootScope });
    $scope.modelFile = {
        Duration: ''
    };
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    function defaultShareFile(id) {
        if ($rootScope.ObjectTypeFile != "ACT_CAT") {
            dataserviceFilePlugin.getListUserShare(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
        else {
            dataserviceFilePlugin.getListUserShareActCat($rootScope.ObjCode, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
    }

    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        /*else if ($scope.file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        }*/ else {
            var data = new FormData();
            data.FileUpload = $scope.file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = $rootScope.moduleName;
            data.Duration = $scope.modelFile.Duration;
            data.IsMore = false;
            data.uuid = create_UUID();

            if (!$scope.isProgressModelOpen) {
                $scope.viewProgress();
            }
            $rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

            Upload.mediaDuration($scope.file).then(function (durationInSeconds) {
                console.log(durationInSeconds);
            });

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileLecture/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    defaultShareFile(result.ID);
                    $scope.reload();
                }
                var index = $rootScope.progress.findIndex(x => x.uuid == result.Object);
                $rootScope.progress.splice(index, 1);
                if ($rootScope.progress.length == 0) {
                    $scope.progressModal.close("End uploading");
                    $scope.isProgressModelOpen = false;
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                var data = evt.config.data;
                var index = $rootScope.progress.findIndex(x => x.uuid == data.uuid);
                $rootScope.progress[index].progress = progressPercentage + '% ';
                $rootScope.progress[index].style.width = progressPercentage + '% ';
            });
        }
    }

    $scope.uploadFileLecture = function (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file == '' || file == undefined) {
                App.toastrError(caption.COM_MSG_CHOSE_FILE);
            }
            /*else if (file.size > 20971520) {
                App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
            }*/ else {
                var data = {};
                data.FileUpload = file;
                data.ObjectCode = $rootScope.ObjCode;
                data.ObjectType = $rootScope.ObjectTypeFile;
                data.ModuleName = $rootScope.moduleName;
                data.IsMore = false;
                data.uuid = create_UUID();

                if (!$scope.isProgressModelOpen) {
                    $scope.viewProgress();
                }
                $rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

                Upload.upload({
                    url: '/Admin/LmsDashBoard/InsertObjectFileLecture/',
                    data: data
                }).then(function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        defaultShareFile(result.ID);
                        $scope.reload();
                    }
                    var index = $rootScope.progress.findIndex(x => x.uuid == result.Object);
                    $rootScope.progress.splice(index, 1);
                    if ($rootScope.progress.length == 0) {
                        $scope.progressModal.close("End uploading");
                        $scope.isProgressModelOpen = false;
                    }
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    var data = evt.config.data;
                    var index = $rootScope.progress.findIndex(x => x.uuid == data.uuid);
                    $rootScope.progress[index].progress = progressPercentage + '% ';
                    $rootScope.progress[index].style.width = progressPercentage + '% ';
                });
            }
        }
    };
    //function loadDate() {
    //    $("#duration").datetimepicker({
    //        inline: false,
    //        autoclose: true,
    //        format: 'LT',
    //        dateFormat: "HH:mm:ss",
    //        fontAwesome: true,
    //    });
    //}

    //setTimeout(function () {
    //    loadDate();
    //}, 400);
});

app.controller('addQuiz', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceLms, Upload) {
    $scope.model = {
        Code: '',
        Title: '',
        Content: '',
        JsonData: '',
        Lecture: '',
        Level: '',
        LectureCode: $rootScope.LectureCode,
        SubjectCode: $rootScope.SubjectCode
    }
    $scope.listLevel = [
        {
            Code: "VERY_EASY",
            Name: caption.LMS_LEVEL_VERY_EASY
        },
        {
            Code: "EASY",
            Name: caption.LMS_LEVEL_EASY
        },
        {
            Code: "NORMAL",
            Name: caption.LMS_LEVEL_NORMAL
        },
        {
            Code: "HARD",
            Name: caption.LMS_LEVEL_HARD
        },
        {
            Code: "QUITE_HARD",
            Name: caption.LMS_LEVEL_QUITE_HARD
        },
        {
            Code: "VERY_HARD",
            Name: caption.LMS_LEVEL_VERY_HARD
        },
    ];
    $scope.mediaChecked = false;
    if ($scope.isEdit != true) {
        $scope.title = caption.LMS_NEW_QUIZ;
    }
    $scope.mediaIndex = "";
    $scope.listMediaType = [
        {
            Code: "VIDEO",
            Name: caption.LMS_DASD_BOARD_MEDIA_TYPE_VIDEO, /*COM_MEDIA_VIDEO*/
            Icon: "video",
            Url: "",
            Check: false
        },
        {
            Code: "IMAGE",
            Name: caption.LMS_IMAGE, /*COM_MEDIA_IMAGE*/
            Icon: "image",
            Url: "",
            Check: false
        },
        {
            Code: "VOICE",
            Name: caption.LMS_VOICE, /*COM_MEDIA_VOICE*/
            Icon: "microphone-alt",
            Url: "",
            Check: false
        }
    ];
    $scope.addMedia = function (index) {
        $scope.mediaIndex = index;
    }
    $scope.deleteMedia = function (media) {
        media.Url = "";
        $scope.mediaChecked = false;
        media.Check = false;
    }
    $scope.loadFileQuiz = function (event) {
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.listMediaType[$scope.mediaIndex].Check = true;
                    $scope.listMediaType[$scope.mediaIndex].Url = result.Object;
                    $scope.mediaChecked = true;
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };

    $scope.viewFile = function (link, type) {
        if (type == "VIDEO") {
            $scope.showVideo(link);
        }
        if (type == "VOICE") {
            $scope.playAudio(link);
        }
        if (type == "IMAGE") {
            $scope.viewImage(link);
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video-origin.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };

    $scope.IsAnswer = false;
    $rootScope.listAnswer = [];
    $rootScope.listReference = [];
    $rootScope.idQuiz = -1;

    $scope.cancel = function () {
        canvasJson = '';
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItem'].destroy();
        }
        var check = CKEDITOR.instances['ckEditorItemAnswer'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItemAnswer'].destroy();
        }
        $rootScope.JsonData = '';
        $rootScope.JsonRef = '';
        $uibModalInstance.close();
        $rootScope.idQuiz = -1;
    }

    $scope.initData = function () {
        dataserviceLms.getListLecture($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $rootScope.listLecture = rs;
        });
        dataserviceLms.getListTypeQuiz(function (rs) {
            rs = rs.data;
            $scope.listTypeQuiz = rs;
        });
        dataserviceLms.getSubjectLectureCourse($scope.model.SubjectCode, $scope.model.LectureCode, function (rs) {
            rs = rs.data;
            $scope.listCourse = rs;
        });
    };
    $scope.initData();

    $scope.isExpand = false;
    $scope.expand = function () {

    }

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        $scope.model.QuestionMedia = JSON.stringify($scope.listMediaType);
        if (/*$scope.addformQuiz.validate() &&*/ !validationSelect($scope.model).Status) {
            if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                return App.toastrError(caption.LMS_INPUT_QUESTION_CONTENT);
            }
            $scope.model.JsonData = $rootScope.JsonData;
            dataserviceLms.insertQuiz($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.idQuiz = rs.ID;
                }
            });
        }
    };

    $scope.save = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        $scope.model.QuestionMedia = JSON.stringify($scope.listMediaType);
        if (/*$scope.addformQuiz.validate() &&*/ !validationSelect($scope.model).Status) {
            if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                return App.toastrError(caption.LMS_ENTER_QUESTION_CONTENT);
            }
            $scope.model.JsonData = $rootScope.JsonData;
            var modelSave = angular.copy($scope.model);
            modelSave.Id = $rootScope.idQuiz;

            dataserviceLms.updateQuiz(modelSave, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$rootScope.idLecture = rs.ID;
                }
            });
        }
    };
    $scope.changeData = function (type, item) {
        if (type == "SubjectCode") {
            $scope.errorSubject = false;
            dataserviceLms.getListLecture(item.Code, function (rs) {
                rs = rs.data;
                $rootScope.listLecture = rs;
            });
        }
        if (type == "Code") {
            $scope.errorCode = false;
        }
        if (type == "Duration") {
            $scope.errorDuration = false;
        }
        if (type == "Type") {
            $scope.errorType = false;
            if ($scope.changeType) {
                $scope.changeType();
            }
        }
    }
    $scope.addCourse = function () {
        if ($scope.model.Code == "" || $scope.model.Code == null || $scope.model.Code == undefined) {
            return App.toastr(caption.LMS_MUST_SELECT_COURSE);
        }
        var courseObj = {
            QuizCode: $scope.model.Code,
            LectureCode: $rootScope.LectCode,
            CourseCode: $scope.modelCourse.Code,
            SubjectCode: $rootScope.SubjectCode
        }
        dataserviceLms.insertQuizCourse(courseObj, function (result) {
            result = result.data;
            if (result.Error) {
                return App.toastrError(rs.Title);
            }
            else {
                dataserviceLms.getListQuizCourse($scope.model.Code, function (rs) {
                    rs = rs.data;
                    $scope.listQuizCourse = rs;
                });
            }
        });
    }
    $scope.deleteCourse = function (obj) {
        var courseSubject = {
            QuizCode: $scope.model.Code,
            LectureCode: $rootScope.LectCode,
            CourseCode: obj.CourseCode,
            SubjectCode: $rootScope.SubjectCode
        }
        dataserviceLms.deleteQuizCourse(courseSubject, function (result) {
            result = result.data;
            if (result.Error) {
                return App.toastrError(rs.Title);
            }
            else {
                dataserviceLms.getListQuizCourse($scope.model.Code, function (rs) {
                    rs = rs.data;
                    $scope.listQuizCourse = rs;
                });
            }
        });
    };
    $scope.createQuizGame = function () {
        if (isValidHttpUrl(decodeHTML($scope.model.Content))) {
            dataserviceLms.getGameJsonData(decodeHTML($scope.model.Content), function (rs) {
                rs = rs.data;
                var canvasWindow = window.open("/lib/EduComposeEngine/index.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
                try {
                    var content = decodeURIComponent(rs);
                    var canvasContent = { content: JSON.parse(content) };
                    canvasContent.doQuiz = false;
                    canvasContent.viewAnswer = false;
                    canvasContent.quizName = $scope.model.Code;
                    canvasWindow.canvasData = canvasContent;
                } catch (e) {
                    console.log(e);
                    var canvasContent = {};
                    canvasContent.doQuiz = false;
                    canvasContent.viewAnswer = false;
                    canvasContent.quizName = $scope.model.Code;
                    canvasWindow.canvasData = canvasContent;
                }
            });
        }
        else {
            var canvasWindow = window.open("/lib/EduComposeEngine/index.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
            var canvasContent = {};
            canvasContent.doQuiz = false;
            canvasContent.viewAnswer = false;
            canvasContent.quizName = $scope.model.Code;
            canvasWindow.canvasData = canvasContent;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        //if (data.Type == 'ANSWER') {
        //    if (data.QuestionCode == "" || data.QuestionCode == null || data.QuestionCode == undefined) {
        //        $scope.errorQuestion = true;
        //        mess.Status = true;
        //    } else {
        //        $scope.errorQuestion = false;
        //    }
        //}

        if (data.Code == "" || data.Code == null || data.Code == undefined) {
            $scope.errorCode = true;
            mess.Status = true;
        } else {
            $scope.errorCode = false;
        }

        if (data.Duration == "" || data.Duration == null || data.Duration == undefined) {
            $scope.errorDuration = true;
            mess.Status = true;
        } else {
            $scope.errorDuration = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.Type == "" || data.Type == null || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }

        return mess;
    }

    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }
    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
    setTimeout(function () {
        ckEditer();
    });
});
app.controller('editQuiz', function ($scope, $rootScope, $controller, $compile, $uibModal, $uibModalInstance, dataserviceLms, para, Upload) {
    $scope.isEdit = true;
    $controller('addQuiz', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.header = "LMS_LECTURE_EDIT";
    $scope.initData = function () {
        $scope.model = para;
        dataserviceLms.getListLecture($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $rootScope.listLecture = rs;
        });
        dataserviceLms.getListQuizCourse($scope.model.Code, function (rs) {
            rs = rs.data;
            $scope.listQuizCourse = rs;
        });
        $rootScope.idQuiz = $scope.model.Id;
        if ($scope.model.JsonData != null && $scope.model.JsonData != '') {
            $rootScope.listAnswer = JSON.parse($scope.model.JsonData);
        }
        else {
            $rootScope.listAnswer = [];
        }
        if ($scope.model.JsonRef != null && $scope.model.JsonRef != '') {
            $rootScope.listReference = JSON.parse($scope.model.JsonRef);
        }
        else {
            $rootScope.listReference = [];
        }
        if ($scope.model.QuestionMedia != null && $scope.model.QuestionMedia != '') {
            try {
                $scope.listMediaType = JSON.parse($scope.model.QuestionMedia);
                for (var item of $scope.listMediaType) {
                    if (item.Check == true) {
                        $scope.mediaChecked = true;
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        setTimeout(function () {
            CKEDITOR.instances['ckEditorItem'].setData($scope.model.Content);
        }, 1000);
    }
    $scope.initData();
    $scope.title = caption.LMS_EDIT_QUESTION;

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Content = data;
        }
        $scope.model.QuestionMedia = JSON.stringify($scope.listMediaType);
        if (/*$scope.addformQuiz.validate() &&*/ !validationSelect($scope.model).Status) {
            if ($scope.model.Content == '' || $scope.model.Content == null || $scope.model.Content == undefined) {
                return App.toastrError(caption.LMS_ENTER_QUESTION_CONTENT);
            }
            $scope.model.JsonData = $rootScope.JsonData;

            dataserviceLms.updateQuiz($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$rootScope.idLecture = rs.ID;
                }
            });
        }
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.Code == "" || data.Code == null || data.Code == undefined) {
            $scope.errorCode = true;
            mess.Status = true;
        } else {
            $scope.errorCode = false;
        }

        if (data.Duration == "" || data.Duration == null || data.Duration == undefined) {
            $scope.errorDuration = true;
            mess.Status = true;
        } else {
            $scope.errorDuration = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.Type == "" || data.Type == null || data.Type == undefined) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }

        return mess;
    }
});


app.controller('manageAnswer', function ($scope, $rootScope, $compile, dataserviceLms, $uibModal, Upload, $window) {
    $scope.modelAnswer = { Type: "TEXT" };
    $scope.isCreateAnswer = false;
    $scope.modelFabric = {
        canvas: null,
        resultPairs: [],
        listCheckAnswer: []
    };
    $scope.modelAnswer.IsAnswer = false;
    $scope.listAnswerType = [
        {
            Code: "TEXT",
            Name: caption.LMS_DASD_BOARD_MEDIA_TYPE_TEXT
        }, {
            Code: "VIDEO",
            Name: caption.LMS_DASD_BOARD_MEDIA_TYPE_VIDEO
        }, {
            Code: "IMAGE",
            Name: caption.LMS_DASD_BOARD_MEDIA_TYPE_IMAGE
        },];


    $scope.mediaCheckedAnswer = false;
    $scope.mediaIndexAnswer = "";
    $scope.listMediaTypeAnswer = [
        {
            Code: "VIDEO",
            Name: caption.LMS_DASD_BOARD_MEDIA_TYPE_VIDEO, /*COM_MEDIA_VIDEO*/
            Icon: "video",
            Url: "",
            Check: false
        },
        {
            Code: "IMAGE",
            Name: caption.LMS_IMAGE, /*COM_MEDIA_IMAGE*/
            Icon: "image",
            Url: "",
            Check: false
        },
        {
            Code: "VOICE",
            Name: caption.LMS_VOICE, /*COM_MEDIA_VOICE*/
            Icon: "microphone-alt",
            Url: "",
            Check: false
        }
    ];
    $scope.addMediaAnswer = function (index) {
        $scope.mediaIndexAnswer = index;
    }
    $scope.deleteMediaAnswer = function (media) {
        media.Url = "";
        $scope.mediaCheckedAnswer = false;
        media.Check = false;
    }
    $scope.loadFileAnswer = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        //if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
        //    App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
        //    return;
        //}
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ModuleName = "LMS_ANSWER";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.listMediaTypeAnswer[$scope.mediaIndexAnswer].Check = true;
                    $scope.listMediaTypeAnswer[$scope.mediaIndexAnswer].Url = result.Object;
                    $scope.mediaCheckedAnswer = true;
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };

    $scope.viewFile = function (link, type) {
        if (type == "VIDEO") {
            $scope.showVideo(link);
        }
        if (type == "VOICE") {
            $scope.playAudio(link);
        }
        if (type == "IMAGE") {
            $scope.viewImage(link);
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video-origin.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };

    $scope.submit = function () {
        if (($scope.model.Type == "QUIZ_NO_CH_REPLY_WORD" || $scope.model.Type == "QUIZ_NO_CH_FILL_WORD") && $rootScope.listAnswer.length > 0) {
            return App.toastrError(caption.LMS_QUIZ_NO_CHOICE_LIMIT); //LMS_QUIZ_NO_CHOICE_LIMIT
        }
        if ($scope.model.Type != "QUIZ_MUL_CH" && $rootScope.listAnswer.filter(x => x.IsAnswer == true).length > 0 && $scope.modelAnswer.IsAnswer === true) {
            return App.toastrError(caption.LMS_QUIZ_IS_ANSWER_LIMIT); //LMS_QUIZ_IS_ANSWER_LIMIT
        }
        if ($scope.model.Type == "QUIZ_PAIRS_ELEMENT" && parseInt($scope.modelAnswer.Column) != 1 && parseInt($scope.modelAnswer.Column) != 2) {
            return App.toastrError(caption.LMS_VALIDATE_COLUMN); //LMS_QUIZ_IS_ANSWER_LIMIT
        }
        var check = CKEDITOR.instances['ckEditorItemAnswer'];
        if (check !== undefined && $scope.modelAnswer.Type == "TEXT") {
            var data = CKEDITOR.instances['ckEditorItemAnswer'].getData();
            $scope.modelAnswer.Answer = data;
        }

        var mediaIndex = $scope.listMediaTypeAnswer.findIndex(x => x.Check == true);

        if (/*!validationSelect($scope.model).Status*/true) {
            if (($scope.modelAnswer.Answer == '' || $scope.modelAnswer.Answer == null || $scope.modelAnswer.Answer == undefined) && mediaIndex == -1) {
                return App.toastrError(caption.LMS_MSG_INPUT_ANSWER_CONTENT);
            }

            var obj = {
                Code: generateUUID(),
                Answer: $scope.modelAnswer.Answer,
                Type: $scope.modelAnswer.Type,
                Column: $scope.modelAnswer.Column,
                ContentDecode: $scope.modelAnswer.Type != "FILE" ? decodeHTML($scope.modelAnswer.Answer) : $scope.modelAnswer.Answer.split('/').pop(),
                IsAnswer: $scope.modelAnswer.IsAnswer
            }
            if (mediaIndex != -1) {
                obj.Icon = $scope.listMediaTypeAnswer[mediaIndex].Icon;
                obj.ContentDecode = $scope.listMediaTypeAnswer[mediaIndex].Url;
                obj.Answer = $scope.listMediaTypeAnswer[mediaIndex].Url;
                obj.Type = $scope.listMediaTypeAnswer[mediaIndex].Code;
            }

            var checkExit = $rootScope.listAnswer.find(function (element) {
                if (element.Answer == obj.Answer && element.ContentDecode == obj.ContentDecode) return true;
            });

            if (checkExit != '' && checkExit != null && checkExit != undefined) {
                return App.toastrError(caption.LMS_MSG_YOUR_ANSWER_EXIST);
            }

            //if ($rootScope.JsonData == '' || $rootScope.JsonData == null || $rootScope.JsonData == undefined) {
            //    $rootScope.listAnswer.push(obj);
            //} else {
            //    $rootScope.listAnswer.splice(0);
            //    var listAnswer = JSON.parse($rootScope.JsonData);
            //    for (answer of listAnswer) {
            //        $rootScope.listAnswer.push(answer);
            //    }
            //    if ($rootScope.listAnswer.length > 0)
            //        $rootScope.listAnswer.push(obj);
            //}
            $rootScope.listAnswer.push(obj);

            var dataJSON = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: dataJSON
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.modelAnswer.Answer = '';
                    $scope.modelAnswer.Column = '';
                    $scope.modelAnswer.IsAnswer = false;
                    CKEDITOR.instances['ckEditorItemAnswer'].setData($scope.modelAnswer.Answer);
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };
    $scope.correctAnswer = function () {
        if ($scope.model.Type != "QUIZ_MUL_CH" && $rootScope.listAnswer.filter(x => x.IsAnswer == true).length > 0 && $scope.modelAnswer.IsAnswer == false) {
            return App.toastrError(caption.LMS_QUIZ_IS_ANSWER_LIMIT); //LMS_QUIZ_IS_ANSWER_LIMIT
        }
        $scope.modelAnswer.IsAnswer = !$scope.modelAnswer.IsAnswer;
    }

    $scope.deleteAnswer = function (data) {
        if ($rootScope.listAnswer.indexOf(data) == -1) {
            App.toastrError(caption.LMS_MSG_DELETED_FAILURE)
        } else {
            $rootScope.listAnswer.splice($rootScope.listAnswer.indexOf(data), 1);

            var dataJSON = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: dataJSON
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };

    $scope.changeType = function () {
        $scope.modelAnswer.Answer = '';
    }

    $scope.updateAnswer = function (code) {
        var item = $rootScope.listAnswer.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            if ($scope.model.Type != "QUIZ_MUL_CH" && $scope.model.Type != "QUIZ_SING_CH") {
                return;
            }
            if ($scope.model.Type != "QUIZ_MUL_CH" && $rootScope.listAnswer.filter(x => x.IsAnswer == true).length > 0 && item.IsAnswer == false) {
                return App.toastrError(caption.LMS_MSG_YOUR_ANSWER_CORRECT); //LMS_QUIZ_IS_ANSWER_LIMIT
            }

            item.IsAnswer = !item.IsAnswer;

            $rootScope.JsonData = JSON.stringify($rootScope.listAnswer);
            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: $rootScope.JsonData
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.modelAnswer.Answer);
        }
    }
    function ckEditer() {
        var editor3 = CKEDITOR.replace('ckEditorItemAnswer', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ckEditorItemAnswer'].config.height = 80;
    };
    $scope.listTwo = [];
    $scope.listOne = [];
    $scope.placeHolderMinW = 100;
    $scope.isFullScreen = false;
    $scope.createAnswer = function () {
        if ($scope.model.Type == 'QUIZ_PAIRS_ELEMENT') {
            var listColumnOne = $rootScope.listAnswer.filter(x => x.Column == 1);
            var listColumnTwo = $rootScope.listAnswer.filter(x => x.Column == 2);
            if (listColumnOne.length != listColumnTwo.length) {
                return App.toastrError(caption.LMS_COLUMN_LENGTH_IS_DIFFERENT);
            }
            setTimeout(function () {
                $scope.redraw($rootScope.listAnswer, 120, 50, 120, 50, 80, 250, 25, 400);
            }, 200);
            $scope.isCreateAnswer = true;
        }
        else if ($scope.model.Type == 'QUIZ_SORT_ARRANGE') {
            $scope.initDragDrop(100);
            $scope.isCreateAnswer = true;
        }
        else {
            //$scope.isFullScreen = !$scope.isFullScreen;
            if (isValidHttpUrl(decodeHTML($scope.model.Content))) {
                dataserviceLms.getGameJsonData(decodeHTML($scope.model.Content), function (rs) {
                    rs = rs.data;
                    var canvasWindow = window.open("/lib/EduComposeEngine/index.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
                    try {
                        var content = decodeURIComponent(rs);
                        var canvasContent = { content: JSON.parse(content) };
                        canvasContent.doQuiz = false;
                        canvasContent.viewAnswer = false;
                        canvasContent.quizName = $scope.model.Code;
                        canvasWindow.canvasData = canvasContent;
                    } catch (e) {
                        console.log(e);
                        var canvasContent = {};
                        canvasContent.doQuiz = false;
                        canvasContent.viewAnswer = false;
                        canvasContent.quizName = $scope.model.Code;
                        canvasWindow.canvasData = canvasContent;
                    }
                });
            }
            else {
                var canvasWindow = window.open("/lib/EduComposeEngine/index.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
                var canvasContent = {};
                canvasContent.doQuiz = false;
                canvasContent.viewAnswer = false;
                canvasContent.quizName = $scope.model.Code;
                canvasWindow.canvasData = canvasContent;
            }
        }
    }
    $scope.initDragDrop = function (minWidth) {
        $scope.placeHolderMinW = minWidth;
        var listObject = $rootScope.listAnswer;
        var answerIndex = $rootScope.listAnswer.findIndex(x => x.IsAnswer == true);
        if (answerIndex == -1) {
            $scope.listTwo = listObject.filter(e => {
                return e.IsAnswer != true;
            });
            for (let i = 0; i < $scope.listTwo.length; i++) {
                const element = $scope.listTwo[i];
                element.minW = minWidth;
                element.Moved = false;
                element.DragIndex = i;
            }
        }
        else {
            var listAnswer = JSON.parse($rootScope.listAnswer[answerIndex].Answer);
            $scope.listTwo = listObject.filter(e => {
                return e.IsAnswer != true;
            });
            for (let i = 0; i < $scope.listTwo.length; i++) {
                const element = $scope.listTwo[i];
                element.minW = minWidth;
                element.DragIndex = i;
                element.Moved = false;
            }
            for (let j = 0; j < listAnswer.length; j++) {
                const dragIndex = listAnswer[j] - 1;
                $scope.listOne.push($scope.listTwo[dragIndex]);
                $scope.listTwo[dragIndex].Moved = true;
            }
        }
    }
    $scope.listTwoAllowedTypes = [
        "one"
    ];
    $scope.listOneType = "one";
    $scope.listTwoType = "two";
    $scope.dropCallback = function (index, item, external, type) {
        $scope.listTwo[item.DragIndex].Moved = false;
        // Return false here to cancel drop. Return true if you insert the item yourself.
        return true;
    };
    $scope.saveDragNDrop = function () {
        var content = [];
        if ($scope.listOne.length == 0) {
            return App.toastrError(caption.LMS_QUIZ_MUST_DRAG_ONE_ELEMENT);
        }
        for (const item of $scope.listOne) {
            content.push(item.DragIndex + 1);
        }

        var obj = {
            Code: generateUUID(),
            Answer: JSON.stringify(content),
            Type: "TEXT",
            ContentDecode: JSON.stringify(content),
            IsAnswer: true
        }
        //if (!this.isAnswerCreated) {
        //    this.listAnswer.push(this.answer);
        //}
        //else {
        //    this.deleteCorrectAnswer();
        //    this.listAnswer.push(this.answer);
        //}
        //this.isAnswerCreated = true;
        var answerIndex = $rootScope.listAnswer.findIndex(x => x.IsAnswer == true);
        if (answerIndex != -1) {
            $rootScope.listAnswer.splice(answerIndex, 1);
        }
        $rootScope.listAnswer.push(obj);
        var jsonData = JSON.stringify($rootScope.listAnswer);

        var answerData = {
            Id: $rootScope.idQuiz,
            JsonData: jsonData
        }

        dataserviceLms.updateAnswer(answerData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                //$scope.reloadQuestion();
                $scope.isCreateAnswer = false;
                $scope.modelFabric.listCheckAnswer = [];
                $scope.listOne = [];
                $scope.listTwo = [];
                return App.toastrSuccess(rs.Title);
            }
        });
    };

    $scope.closeCanvas = function () {
        $scope.listOne = [];
        $scope.listTwo = [];
        $scope.isCreateAnswer = false;
    };

    $scope.zoomIn = function () {
        $scope.modelFabric.canvas.setZoom($scope.modelFabric.canvas.getZoom() * 1.1);
        // this.refreshGrid();
    };
    $scope.zoomOut = function () {
        $scope.modelFabric.canvas.setZoom($scope.modelFabric.canvas.getZoom() / 1.1);
        // this.refreshGrid();
    };
    $scope.deleteLine = function () {
        let objects = $scope.modelFabric.canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                var indexPair = $scope.modelFabric.resultPairs.findIndex(x => x.id1 == object.linePortId);
                if (indexPair != -1) {
                    $scope.modelFabric.resultPairs.splice(indexPair, 1);
                    $scope.modelFabric.listCheckAnswer.splice(indexPair, 1);
                }
                $scope.modelFabric.canvas.remove(object);
            });
        }
        $scope.modelFabric.canvas.renderAll();
    };
    $scope.saveCanvas = function () {
        if ($scope.modelFabric.resultPairs.length == 0) {
            return App.toastrError(caption.LMS_QUIZ_MUST_CONNECT_ONE_PAIR);
        }

        var obj = {
            Code: generateUUID(),
            Answer: JSON.stringify($scope.modelFabric.listCheckAnswer),
            Type: "TEXT",
            ContentDecode: JSON.stringify($scope.modelFabric.listCheckAnswer),
            IsAnswer: true
        }
        //if (!this.isAnswerCreated) {
        //    this.listAnswer.push(this.answer);
        //}
        //else {
        //    this.deleteCorrectAnswer();
        //    this.listAnswer.push(this.answer);
        //}
        //this.isAnswerCreated = true;
        var answerIndex = $rootScope.listAnswer.findIndex(x => x.IsAnswer == true);
        if (answerIndex != -1) {
            $rootScope.listAnswer.splice(answerIndex, 1);
        }
        $rootScope.listAnswer.push(obj);
        var jsonData = JSON.stringify($rootScope.listAnswer);

        var answerData = {
            Id: $rootScope.idQuiz,
            JsonData: jsonData
        }

        dataserviceLms.updateAnswer(answerData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                //$scope.reloadQuestion();
                $scope.isCreateAnswer = false;
                $scope.modelFabric.listCheckAnswer = [];
                return App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.redrawCanvas = function () {
        $scope.modelFabric.resultPairs = [];
        //$scope.modelFabric.listCheckAnswer = [];
        $scope.modelFabric.canvas.setZoom(1);
        $scope.modelFabric.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        $scope.redraw($rootScope.listAnswer, 120, 50, 120, 50, 80, 250, 25, 400);
    };
    $scope.redraw = function (listObjectOrigin, width1 /*120*/, height1 /*50*/, width2, height2, distanceVertical, distanceHorizontal, top, left) {
        $scope.modelFabric.canvas.clear();
        var listObject = angular.copy(listObjectOrigin);
        //var listObject = newValue;
        var topEvenContent = top; //25
        var topOddContent = top; //25
        var leftEventContent = left; //20
        var leftOddContent = left + distanceHorizontal; //20+65
        var offSet = distanceVertical; //80
        var fontSize = 15;
        var index = 1;
        var countObjectDraw = 1;
        var answerIndex = listObject.findIndex(x => x.IsAnswer == true);
        if (answerIndex != -1) {
            if (listObject[answerIndex].Answer != null && listObject[answerIndex].Answer != '' && listObject[answerIndex].Answer != undefined) {
                listCheckAnswer = JSON.parse(listObject[answerIndex].Answer);
                $scope.modelFabric.listCheckAnswer = listCheckAnswer;
            }
            listObject.splice(answerIndex, 1);
        }
        for (let item of listObject) {
            if (item.Column == 1) {
                var dynamicOffset = height1;
                if (item.Type == 'TEXT') {
                    // text
                    // vertical align = center
                    var text = new fabric.Textbox(item.ContentDecode, {
                        originX: 'center', originY: 'center',
                        left: 0.5 * width1, top: 0.5 * (height1 + fontSize), fontSize: fontSize, width: width1 - 20, dirty: true
                    })
                    dynamicOffset = text.height > height1 ? text.height : height1;
                    text.set({ top: 0.5 * (dynamicOffset + fontSize) });
                    var rect = new fabric.Rect({
                        width: width1, height: dynamicOffset,
                        fill: 'rgb(239, 239, 239, 0.25)', stroke: '#e5e5e5',
                        rx: 10,
                        ry: 10, dirty: true
                    })
                    // group
                    var group = new fabric.Group(
                        [rect, text], {
                        id: index, Column: item.Column, top: topEvenContent, left: leftEventContent,
                        hasControls: false, hasBorders: false
                    })
                    $scope.modelFabric.canvas.add(group);
                    addPort(group, $scope.modelFabric.canvas, index, item.Column);

                    if (countObjectDraw == listObject.length) {
                        redrawAllLine(left + width1, distanceHorizontal);
                    }
                    countObjectDraw++;
                } else if (item.Type == 'IMAGE') {
                    var idxDot = item.ContentDecode.lastIndexOf(".") + 1;
                    var extFile = item.ContentDecode.substr(idxDot, item.ContentDecode.length).toLowerCase();
                    if (extFile === "SVG") {
                        (function (topEvenContent, index) {
                            fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                var obj = fabric.util.groupSVGElements(objects, options);
                                obj.set({
                                    id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                    hasControls: false, hasBorders: false
                                })
                                obj.scaleToWidth(height1)
                                obj.scaleToHeight(height1)
                                $scope.listQuestion[qIndex].modelFabric.canvas.calcOffset();
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(obj).renderAll();
                                addPort(obj, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            });
                        })(topEvenContent, index);
                    }
                    else {
                        (function (topOddContent, index) {
                            var imgs = new fabric.Image.fromURL(item.ContentDecode, function (img) {
                                var oImg = img.set({
                                    id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                    hasControls: false, hasBorders: false
                                }).scale(0.25);
                                img.scaleToWidth(height2)
                                img.scaleToHeight(height2)
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(oImg);
                                addPort(oImg, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            })
                        })(topOddContent, index);
                    }
                } else {
                    (function (topEvenContent, index) {
                        fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                            var obj = fabric.util.groupSVGElements(objects, options);
                            obj.set({
                                id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                hasControls: false, hasBorders: false
                            })
                            obj.scaleToWidth(height1)
                            obj.scaleToHeight(height1)
                            $scope.modelFabric.canvas.add(obj).renderAll();
                            addPort(obj, $scope.modelFabric.canvas, index, item.Column);

                            if (countObjectDraw == listObject.length) {
                                redrawAllLine(left + width1, distanceHorizontal);
                            }
                            countObjectDraw++;
                        });
                    })(topEvenContent, index);
                }

                index++;
                topEvenContent += (offSet + dynamicOffset - height1);
            } else {
                var dynamicOffset = height2;
                if (item.Type == 'TEXT') {
                    // text
                    // vertical align = center
                    var text = new fabric.Textbox(item.ContentDecode, {
                        originX: 'center', originY: 'center',
                        left: 0.5 * width2, top: 0.5 * (height2 + fontSize), fontSize: fontSize, width: width2 - 20
                    })
                    dynamicOffset = text.height > height2 ? text.height : height2;
                    text.set({ top: 0.5 * (dynamicOffset + fontSize) });
                    var rect = new fabric.Rect({
                        width: width2, height: dynamicOffset,
                        fill: 'rgb(239, 239, 239, 0.25)', stroke: '#e5e5e5',
                        rx: 10,
                        ry: 10,
                    })
                    // group
                    var group = new fabric.Group(
                        [rect, text], {
                        id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                        hasControls: false, hasBorders: false
                    })
                    $scope.modelFabric.canvas.add(group);
                    addPort(group, $scope.modelFabric.canvas, index, item.Column);

                    if (countObjectDraw == listObject.length) {
                        redrawAllLine(left + width1, distanceHorizontal);
                    }
                    countObjectDraw++;
                } else if (item.Type == 'IMAGE') {
                    var idxDot = item.ContentDecode.lastIndexOf(".") + 1;
                    var extFile = item.ContentDecode.substr(idxDot, item.ContentDecode.length).toLowerCase();
                    if (extFile === "SVG") {
                        (function (topEvenContent, index) {
                            fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                var obj = fabric.util.groupSVGElements(objects, options);
                                obj.set({
                                    id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                    hasControls: false, hasBorders: false
                                })
                                obj.scaleToWidth(height1)
                                obj.scaleToHeight(height1)
                                $scope.listQuestion[qIndex].modelFabric.canvas.calcOffset();
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(obj).renderAll();
                                addPort(obj, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            });
                        })(topEvenContent, index);
                    }
                    else {
                        (function (topOddContent, index) {
                            var imgs = new fabric.Image.fromURL(item.ContentDecode, function (img) {
                                var oImg = img.set({
                                    id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                    hasControls: false, hasBorders: false
                                }).scale(0.25);
                                img.scaleToWidth(height2)
                                img.scaleToHeight(height2)
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(oImg);
                                addPort(oImg, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            })
                        })(topOddContent, index);
                    }
                } else {
                    (function (topOddContent, index) {
                        var imgs = new fabric.Image.fromURL('https://os.3i.com.vn//uploads/repository/SUBJECT/background_slogan.jpg', function (img) {
                            var oImg = img.set({
                                id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                hasControls: false, hasBorders: false
                            }).scale(0.25);
                            img.scaleToWidth(height2)
                            img.scaleToHeight(height2)
                            $scope.modelFabric.canvas.add(oImg);
                            addPort(oImg, $scope.modelFabric.canvas, index, item.Column);

                            if (countObjectDraw == listObject.length) {
                                redrawAllLine(left + width1, distanceHorizontal);
                            }
                            countObjectDraw++;
                        })
                    })(topOddContent, index);

                }

                console.log(index);
                index++;
                topOddContent += (offSet + dynamicOffset - height2);
            }

        }


        /* #region  mouse event handler */
        var ObjSelectedBefore = 0;
        var ObjSelectedCur = 0;
        var checkIdObj = 0;
        var checkBefore = 0;
        var ObjSelectedBefore_left = 0;
        var ObjSelectedBefore_top = 0;
        var ObjSelectedCur_top = 0;
        var ObjSelectedCur_left = 0;
        var ColmnSelecBefor = 1
        var CollumnSelecAfter = 1
        if (true) {
            (function (ObjSelectedBefore, ObjSelectedCur, checkIdObj, checkBefore, ObjSelectedBefore_left, ObjSelectedBefore_top, ObjSelectedCur_top, ObjSelectedCur_left, ColmnSelecBefor, CollumnSelecAfter, $scope) {
                var canvas = $scope.modelFabric.canvas;
                //var listCheckAnswer = $scope.modelFabric.listCheckAnswer;
                canvas.on('mouse:down', function (opt) {
                    // slides.lockSwipes(true);
                    var evt = opt.e;
                    if (opt.target === null) {
                        this.isDragging = true;
                        this.selection = false;
                        var pointer = canvas.getPointer(opt.e, true);
                        var posX = pointer.x;
                        var posY = pointer.y;
                        this.lastPosX = posX;
                        this.lastPosY = posY;
                    }
                });
                canvas.on('mouse:move', function (opt) {
                    //$timeout(function () {
                    //    scope.$apply();
                    //})
                    if (this.isDragging) {
                        var e = opt.e;
                        var vpt = this.viewportTransform;
                        var pointer = canvas.getPointer(opt.e, true);
                        var posX = pointer.x;
                        var posY = pointer.y;
                        vpt[4] += posX - this.lastPosX;
                        vpt[5] += posY - this.lastPosY;
                        this.requestRenderAll();
                        this.lastPosX = posX;
                        this.lastPosY = posY;
                    }
                });
                canvas.on("mouse:up", function (e) {
                    if (e.target !== null) {
                        var objectList = e;
                        const objId = objectList.target['id']
                        const objCol = objectList.target['Column']
                        ObjSelectedBefore = ObjSelectedCur;
                        ObjSelectedCur = objId;

                        ColmnSelecBefor = CollumnSelecAfter;
                        CollumnSelecAfter = objCol;

                        checkIdObj = checkBefore
                        checkBefore++;

                        ObjSelectedBefore_left = ObjSelectedCur_left;
                        ObjSelectedBefore_top = ObjSelectedCur_top;

                        /* #region  get port top left */
                        let object = canvas.getObjects().filter(obj =>
                            (obj.port == "ml" || obj.port == "mr") &&
                            obj.portID == objId
                        );
                        if (object && object.length > 0) {
                            ObjSelectedCur_top = object[0].top;
                            ObjSelectedCur_left = object[0].left;
                        }
                        /* #endregion */
                        /* #region  expand object */
                        //let object = canvas.getObjects().filter(obj =>
                        //    obj.id == objId
                        //);
                        //if (object && object.length > 0) {
                        //    obj.scaleToWidth(mediaSize)
                        //    obj.scaleToHeight(mediaSize)
                        //    canvas.calcOffset();
                        //    canvas.add(obj).renderAll();
                        //}
                        /* #endregion */
                        // ObjSelectedCur_top = objectList.target.top;
                        // ObjSelectedCur_left = objectList.target.left;

                        if ((ColmnSelecBefor == 1 && CollumnSelecAfter == 2 && checkIdObj >= 1) || (ColmnSelecBefor == 2 && CollumnSelecAfter == 1 && checkIdObj >= 1)) {
                            console.log("ObjSelectedCur: " + CollumnSelecAfter, "ObjSelectedBefore: " + ColmnSelecBefor);
                            checkBefore = 0

                            if (!checkExistId(ObjSelectedCur, $scope)) {
                                let connectorLine = { x1: ObjSelectedCur_left, y1: ObjSelectedCur_top, x2: ObjSelectedBefore_left, y2: ObjSelectedBefore_top };

                                createCurves(canvas, connectorLine, ObjSelectedBefore, ObjSelectedCur, left + width1, distanceHorizontal);
                                $scope.modelFabric.listCheckAnswer.push(ObjSelectedBefore + '-' + ObjSelectedCur)
                                $scope.modelFabric.resultPairs.push({
                                    id1: ObjSelectedBefore,
                                    id2: ObjSelectedCur
                                });
                                unchoosePort(canvas);
                                unchooseLine(canvas);
                            }
                            else {
                                unchoosePort(canvas);
                                unchooseLine(canvas);
                            }
                        } else {
                            if (isPortChoosen(canvas)) {
                                unchoosePort(canvas);
                                var targetLine = getLine(canvas, objId);
                                if (targetLine != -1) {
                                    chooseLine(canvas, targetLine)
                                }
                            }
                            else {
                                choosePort(canvas, objId);
                                var targetLine = getLine(canvas, objId);
                                if (targetLine != -1) {
                                    chooseLine(canvas, targetLine)
                                }
                            }
                        }
                    } else {
                        unchoosePort(canvas);
                        unchooseLine(canvas);
                    }
                    var evt = e.e;
                    if (this.isDragging) {
                        this.setViewportTransform(this.viewportTransform);
                        this.isDragging = false;
                        this.selection = true;
                    }
                });
                canvas.on("object:moving", (e) => {
                    let ports = canvas.getItemsByName("port");
                    ports.forEach((port) => {
                        if (port.portID == e.target.id) {
                            canvas.remove(port);
                        }
                    });
                    addPort(e.target, canvas, e.target.id, e.target.Column);
                    let movingPorts = getPortOnMoving(e.target, canvas, e.target.id, e.target.Column);
                    if (movingPorts.result != -1) {
                        let connectorLine = movingPorts.points;
                        let connectline = getLine(canvas, e.target.id);
                        if (connectline != -1) {
                            let otherPortId = getOtherPortId(canvas, e.target.id);
                            let otherPort = getPortById(canvas, otherPortId);
                            // let portCenter = getPortCenterPoint(e.target, e.target.__corner);

                            connectorLine.x2 = otherPort.left;
                            connectorLine.y2 = otherPort.top;
                            connectline.path[0][1] = connectorLine.x1;
                            connectline.path[0][2] = connectorLine.y1;

                            // connectline[0].path[1][1] = connectorLine.x1;
                            // connectline[0].path[1][2] = connectorLine.y1;

                            connectline.path[1][3] = connectorLine.x2;
                            connectline.path[1][4] = connectorLine.y2;
                        }
                    }
                });
                fabric.Canvas.prototype.getItemsByName = function (name) {
                    var objectList = [],
                        objects = this.getObjects();

                    for (var i = 0, len = this.size(); i < len; i++) {
                        if (objects[i].name && objects[i].name === name) {
                            objectList.push(objects[i]);
                        }
                    }

                    return objectList;
                };
            })(ObjSelectedBefore, ObjSelectedCur, checkIdObj, checkBefore, ObjSelectedBefore_left, ObjSelectedBefore_top, ObjSelectedCur_top, ObjSelectedCur_left, ColmnSelecBefor, CollumnSelecAfter, $scope);
        }
        /* #endregion */
        //$timeout(function () {
        //    scope.$apply();
        //});
    };

    /* #region  port and connect */
    function findTargetPort(object, ports) {
        let points = new Array(4);
        let port;
        if (ports) {
            port = ports;
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
                    object.left + object.width + 10, object.top + (object.height / 2),
                    object.left + object.width + 10, object.top + (object.height / 2)
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
                    object.left - 10, object.top + (object.height / 2),
                    object.left - 10, object.top + (object.height / 2)
                ];
                break;

            default:
                break;
        }

        return {
            'x1': points[0], 'y1': points[1],
            'x2': points[2], 'y2': points[3]
        };
    }
    function findTargetPortScale(object, ports) {
        let points = new Array(4);
        let port;
        if (ports) {
            port = ports;
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
                    object.left + object.width * object.scaleX + 10, object.top + (object.height * object.scaleY / 2),
                    object.left + object.width * object.scaleX + 10, object.top + (object.height * object.scaleY / 2)
                ];
                break;
            case 'mb':
                points = [
                    object.left + (object.width * object.scaleX / 2), object.top + object.height,
                    object.left + (object.width * object.scaleX / 2), object.top + object.height
                ];
                break;
            case 'ml':
                points = [
                    object.left - 10, object.top + (object.height * object.scaleY / 2),
                    object.left - 10, object.top + (object.height * object.scaleY / 2)
                ];
                break;

            default:
                break;
        }

        return {
            'x1': points[0], 'y1': points[1],
            'x2': points[2], 'y2': points[3]
        };
    }

    function addPort(object, canvas, objectID, column) {
        if (object.name == "p1" || object.name == "p2" || object.name == "p0") {
            return;
        }
        let ports;
        if (
            object.type === "rect" ||
            object.type === 'circle' ||
            object.type === 'ellipse' ||
            object.type === 'polygon' ||
            object.type === "path" ||
            object.type === "group" ||
            object.type === "image"
        ) {
            if (column == 1) {
                ports = ['mr'];
            }
            else {
                ports = ['ml'];
            }
        }
        if (ports && ports.length > 0 && object.type != "image" && !object.hasOwnProperty('svgUid')) {
            ports.forEach(port => {
                let point = findTargetPort(object, port);
                var c = new fabric.Circle({
                    left: point.x1,
                    top: point.y1,
                    radius: 10,
                    fill: 'green',
                    name: "port",
                    port: port,
                    portID: objectID,
                    column: column,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    isChosen: false
                });
                canvas.add(c);
            });
        }
        else if (ports && ports.length > 0) {
            ports.forEach(port => {
                let point = findTargetPortScale(object, port);
                var c = new fabric.Circle({
                    left: point.x1,
                    top: point.y1,
                    radius: 10,
                    fill: 'green',
                    name: "port",
                    port: port,
                    portID: objectID,
                    column: column,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    isChosen: false
                });
                canvas.add(c);
            });
        }
    }
    function createCurves(canvas, points, portId1, portId2, left, distanceHorizon) {
        canvas.on({
            'object:selected': onObjectSelected,
            // 'object:moving': onObjectMoving, //decrepitated
        });

        (function drawQuadratic(points) {

            var line = new fabric.Path('M 65 0 Q 100, 100, 200, 0', { fill: '', stroke: '#ccc', objectCaching: false, isLine: true, linePortId: portId1 });

            line.path[0][1] = points.x1;
            line.path[0][2] = points.y1;

            line.path[1][1] = left + distanceHorizon / 2;
            line.path[1][2] = 200;

            line.path[1][3] = points.x2;
            line.path[1][4] = points.y2;

            line.selectable = false;
            canvas.add(line);

            let objects1 = canvas.getObjects().filter(obj =>
                (obj.id && obj.id > 0)
            );
            if (objects1 && objects1.length > 0) {
                objects1.forEach(object => {
                    canvas.remove(object);
                    canvas.add(object);
                });
            }

            let objects2 = canvas.getObjects().filter(obj =>
                (obj.port == "ml" || obj.port == "mr")
            );
            if (objects2 && objects2.length > 0) {
                objects2.forEach(object => {
                    canvas.remove(object);
                    canvas.add(object);
                });
            }

            /* #region  decrepitated */
            // var p1 = makeCurvePoint(200, 200, null, line, null);
            // p1.name = "p1";
            // p1.port = object.objid;
            // canvas.add(p1);

            // var p0 = makeCurveCircle(points.x1, points.y1, line, p1, null);
            // p0.name = "p0";
            // canvas.add(p0);

            // var p2 = makeCurveCircle(300, 100, null, p1, line);
            // p2.name = "p2";
            // canvas.add(p2);
            /* #endregion */

        })(points);

        /* #region  decrepitated */
        function makeCurveCircle(left, top, line1, line2, line3) {
            var c = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 5,
                radius: 12,
                fill: '#fff',
                stroke: '#666'
            });

            c.hasBorders = c.hasControls = false;

            c.line1 = line1;
            c.line2 = line2;
            c.line3 = line3;

            return c;
        }

        function makeCurvePoint(left, top, line1, line2, line3) {
            var c = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 8,
                name: "linecnt",
                radius: 14,
                fill: '#fff',
                stroke: '#666'
            });

            c.hasBorders = c.hasControls = false;

            c.line1 = line1;
            c.line2 = line2;
            c.line3 = line3;

            return c;
        }
        /* #endregion */

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

        function onObjectMoving(e) {
            if (e.target.name == "p0" || e.target.name == "p2") {
                var p = e.target;

                if (p.line1) {
                    p.line1.path[0][1] = p.left;
                    p.line1.path[0][2] = p.top;
                }
                else if (p.line3) {
                    p.line3.path[1][3] = p.left;
                    p.line3.path[1][4] = p.top;
                }
            }
            else if (e.target.name == "p1") {
                var p = e.target;

                if (p.line2) {
                    p.line2.path[1][1] = p.left;
                    p.line2.path[1][2] = p.top;
                }
            }
            else if (e.target.name == "p0" || e.target.name == "p2") {
                var p = e.target;

                p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
                p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
                p.line3 && p.line3.set({ 'x1': p.left, 'y1': p.top });
                p.line4 && p.line4.set({ 'x1': p.left, 'y1': p.top });
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
                break;
        }

        return {
            'x1': x1, 'y1': y1,
            'x2': x1, 'y2': y1
        };
    }
    function getPortOnMoving(object, canvas, objectID, column) {
        if (object.name == "p1" || object.name == "p2" || object.name == "p0") {
            return;
        }
        let ports;
        if (
            object.type === "rect" ||
            object.type === 'circle' ||
            object.type === 'ellipse' ||
            object.type === 'polygon' ||
            object.type === "path" ||
            object.type === "group" ||
            object.type === "image"
        ) {
            if (column == 1) {
                ports = ['mr'];
            }
            else {
                ports = ['ml'];
            }
        }
        if (ports && ports.length > 0 && object.type != "image" && !object.hasOwnProperty('svgUid')) {
            var points = findTargetPort(object, ports[0]);
            return { result: 0, points: points };
        }
        else if (ports && ports.length > 0) {
            var points = findTargetPortScale(object, ports[0]);
            return { result: 0, points: points };
        }
        return {
            result: -1, points: {
                'x1': 0, 'y1': 0,
                'x2': 0, 'y2': 0
            }
        };
    }

    function choosePort(canvas, objectID) {
        if (objectID == undefined || objectID == null) {
            return;
        }

        let object = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") &&
            obj.portID == objectID
        );
        if (object && object.length > 0) {
            object[0].set({
                isChosen: true,
                radius: 10,
            });
        }
        canvas.renderAll();
    }
    function unchoosePort(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr")
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    isChosen: false,
                    radius: 10,
                });
            });
        }
        canvas.renderAll();
    }
    function isPortChoosen(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") && obj.isChosen == true
        );
        if (objects && objects.length > 0) {
            return true;
        }
        return false;
    }
    function getLine(canvas, portId) {
        var pairIndex = $scope.modelFabric.resultPairs.findIndex(x => x.id1 == portId || x.id2 == portId);
        if (pairIndex != -1) {
            var pair = $scope.modelFabric.resultPairs[pairIndex];
            let objects = canvas.getObjects().filter(obj =>
                obj.linePortId == pair.id1 && obj.isLine
            );
            if (objects && objects.length > 0) {
                return objects[0];
            }
        }
        return -1;
    }
    function chooseLine(canvas, line) {
        let objects = canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    stroke: "#ccc",
                    strokeWidth: 1
                });
            });
        }
        line.set({
            stroke: "black",
            strokeWidth: 2
        });
        canvas.renderAll();
        isLineChoosen = true;
    }
    function unchooseLine(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    stroke: "#ccc",
                    strokeWidth: 1
                });
            });
        }
        canvas.renderAll();
        isLineChoosen = false;
    };
    function getOtherPortId(canvas, portId) {
        var pairIndex = $scope.modelFabric.resultPairs.findIndex(x => x.id1 == portId || x.id2 == portId);
        if (pairIndex != -1) {
            var pair = $scope.modelFabric.resultPairs[pairIndex];
            if (pair.id1 == portId) {
                return pair.id2;
            } else {
                return pair.id1;
            }
        }
        return -1;
    }
    function getPortById(canvas, portId) {
        if (portId == undefined || portId == null) {
            return -1;
        }

        let object = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") &&
            obj.portID == portId
        );
        return object[0];
    }
    function checkExistId(idX, $scope) {
        for (let i = 0; i < $scope.modelFabric.resultPairs.length; i++) {
            if (($scope.modelFabric.resultPairs[i].id1 == idX) || ($scope.modelFabric.resultPairs[i].id2 == idX)) {
                return true;
            }
        }
        return false;
    }

    /* #region redraw all curve  */
    // after all item is draw, draw all the line

    function redrawAllLine(left, distanceHorizon) {
        for (var checkAnswer of $scope.modelFabric.listCheckAnswer) {
            let checkAnswerMembers = checkAnswer.split('-');
            let ObjSelectedBefore = checkAnswerMembers[0];
            /* #region  get port top left */
            let object1 = $scope.modelFabric.canvas.getObjects().filter(obj =>
                (obj.port == "ml" || obj.port == "mr") &&
                obj.portID == ObjSelectedBefore
            );
            if (object1 && object1.length > 0) {
                ObjSelectedBefore_top = object1[0].top;
                ObjSelectedBefore_left = object1[0].left;
            }
            /* #endregion */
            let ObjSelectedCur = checkAnswerMembers[1];
            /* #region  get port top left */
            let object2 = $scope.modelFabric.canvas.getObjects().filter(obj =>
                (obj.port == "ml" || obj.port == "mr") &&
                obj.portID == ObjSelectedCur
            );
            if (object2 && object2.length > 0) {
                ObjSelectedCur_top = object2[0].top;
                ObjSelectedCur_left = object2[0].left;
            }
            /* #endregion */

            let connectorLine = { x1: ObjSelectedCur_left, y1: ObjSelectedCur_top, x2: ObjSelectedBefore_left, y2: ObjSelectedBefore_top };

            createCurves($scope.modelFabric.canvas, connectorLine, ObjSelectedBefore, ObjSelectedCur, left, distanceHorizon);
            $scope.modelFabric.resultPairs.push({
                id1: ObjSelectedBefore,
                id2: ObjSelectedCur
            });
        }
        //scope.$apply();
    }
    /* #endregion */
    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }
    /* #region watch correct answer game  */
    $scope.$watch(function () {
        return $window.correctAnswerGame;
    }, function (newVal, oldVal) {
        if (newVal) {
            var obj = {
                Code: generateUUID(),
                Answer: newVal,
                Type: "TEXT",
                ContentDecode: newVal,
                IsAnswer: true
            }

            var answerIndex = $rootScope.listAnswer.findIndex(x => x.IsAnswer == true);
            if (answerIndex != -1) {
                $rootScope.listAnswer.splice(answerIndex, 1);
            }
            $rootScope.listAnswer.push(obj);
            var jsonData = JSON.stringify($rootScope.listAnswer);

            var answerData = {
                Id: $rootScope.idQuiz,
                JsonData: jsonData
            }

            dataserviceLms.updateAnswer(answerData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    });
    setTimeout(function () {
        ckEditer();
    }, 500);
});

app.controller('manageReference', function ($scope, $rootScope, $sce, $compile, dataserviceLms, dataserviceCmsItem, $uibModal, Upload) {
    $scope.modelRef = { Type: "CMS" };
    $scope.listRefType = [
        {
            Code: "CMS",
            Name: caption.LMS_ARTICLE_CMS
        }, {
            Code: "VOICE",
            Name: caption.LMS_VOICE
        }, {
            Code: "VIDEO",
            Name: caption.LMS_VIDEO_REF
        }, {
            Code: "IMAGE",
            Name: caption.LMS_IMAGE
        },];
    $scope.init = function () {
        dataserviceLms.getCurrentUserFullName(function (rs) {
            rs = rs.data;
            $scope.userName = rs;
        });
        dataserviceLms.getListCmsItem(function (rs) {
            rs = rs.data;
            $scope.listCmsQuiz = rs;
        });
    }
    $scope.init();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCms'];
        if (check !== undefined && $scope.modelRef.Type == "CMS") {
            var data = CKEDITOR.instances['ckEditorItemCms'].getData();
            $scope.modelCmsItem.full_text = data;
        }
        if (/*!validationSelect($scope.model).Status*/true) {
            if ($scope.modelRef.Link == '' || $scope.modelRef.Link == null || $scope.modelRef.Link == undefined) {
                if ($scope.modelRef.Type == "CMS") {
                    dataserviceCmsItem.insert($scope.modelCmsItem, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $scope.modelRef.Link = $scope.modelCmsItem.alias;
                            $scope.addReference();
                        }
                    });
                }
            }
            else {
                $scope.addReference();
            }
        }
    };
    $scope.addReference = function () {
        var obj = {
            Code: generateUUID(),
            Link: $scope.modelRef.Link,
            Type: $scope.modelRef.Type,
            TypeName: $scope.listRefType.find(x => x.Code == $scope.modelRef.Type).Name,
            CreatedBy: $scope.userName,
            CreatedTime: new Date(Date.now()).toLocaleString()
        }

        if ($rootScope.JsonRef == '' || $rootScope.JsonRef == null || $rootScope.JsonRef == undefined) {
            $rootScope.listReference.push(obj);
        } else {
            $rootScope.listReference.splice(0);
            var listRef = JSON.parse($rootScope.JsonRef);
            for (ref of listRef) {
                $rootScope.listReference.push(ref);
            }
            $rootScope.listReference = JSON.parse($rootScope.JsonRef);
            if ($rootScope.listReference.length > 0)
                $rootScope.listReference.push(obj);
        }

        $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
        var refData = {
            Id: $rootScope.idQuiz,
            JsonRef: $rootScope.JsonRef
        }

        dataserviceLms.updateReference(refData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                //$scope.reloadQuestion();
                return App.toastrSuccess(rs.Title);
            }
        });
    }
    $scope.loadImageRef = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
            App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ModuleName = "LMS_QUIZ_REF";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.modelRef.Link = result.Object;
                    $scope.ImageRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.loadVoiceRef = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "mp3" && extFile != "wav"/* && extFile != "gif" && extFile != "bmp" && extFile != "svg"*/) {
            App.toastrError(caption.LMS_WRONG_AUDIO_FILE_FORMAT); //caption.COM_MSG_FORMAT_IMAGE
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ModuleName = "LMS_QUIZ_REF";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.modelRef.Link = result.Object;
                    $scope.VoiceRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.deleteReference = function (data) {
        if ($rootScope.listReference.indexOf(data) == -1) {
            App.toastrError(caption.LMS_MSG_DELETED_FAILURE)
        } else {
            $rootScope.listReference.splice($rootScope.listReference.indexOf(data), 1);
            // if data is Cms delete Cms too
            $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
            var refData = {
                Id: $rootScope.idQuiz,
                JsonRef: $rootScope.JsonRef
            }

            dataserviceLms.updateReference(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.changeType = function () {
        $scope.modelRef.Link = '';
    }

    $scope.updateReference = function (code) {
        var item = $rootScope.listReference.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            item.IsRef = !item.IsRef;

            $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
            var refData = {
                Id: $rootScope.idQuiz,
                JsonRef: $rootScope.JsonRef
            }

            dataserviceLms.updateReference(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    function activeTab() {
        $('div[href="#Section1"]').click();
    }

    function refreshData() {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            check.setData($scope.modelRef.Link);
        }
    }
    function ckEditer() {
        var editor3 = CKEDITOR.replace('ckEditorItemCms', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['ckEditorItemCms'].config.height = 80;
    }
    $scope.viewReference = function (link, type) {
        if (type == "VIDEO") {
            $scope.showVideo(link);
        }
        if (type == "VOICE") {
            $scope.playAudio(link);
        }
        if (type == "IMAGE") {
            $scope.viewImage(link);
        }
        if (type == "CMS") {
            $scope.viewCms(link);
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video.html',
            controller: function ($scope, $uibModalInstance, youtubeEmbedUtils) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () {
        });
    };
    $scope.viewCms = function (link) {
        dataserviceLms.getItemCms(link, function (rs) {
            rs = rs.data;
            $rootScope.cmsContent = $sce.trustAsHtml(rs.full_text);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/view-cms.html',
                controller: function ($scope, $uibModalInstance, $sce) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                //$scope.reload();
            }, function () {
            });
        });
    };
    // CMS Item CRUD
    $scope.modelCmsItem = {
        alias: '',
        title: '',
        cat_id: 228,
        published: true,
        full_text: '',
        created_by_alias: ''
    }
    $scope.ConvertToAlias = function (strInput) {
        strInput = strInput.toLowerCase().trim();
        strInput = strInput.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        strInput = strInput.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        strInput = strInput.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        strInput = strInput.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        strInput = strInput.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        strInput = strInput.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        strInput = strInput.replace(/đ/g, "d");
        strInput = strInput.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
        strInput = strInput.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        strInput = strInput.replace(/^\-+|\-+$/g, "");//cắt bỏ ký tự - ở đầu và cuối chuỗi
        $scope.modelCmsItem.alias = strInput;
    };
    setTimeout(function () {
        ckEditer();
    }, 500);
});