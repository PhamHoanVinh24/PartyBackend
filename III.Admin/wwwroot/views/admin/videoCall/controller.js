var ctxfolder = "/views/admin/videoCall";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);
var appLogin = angular.module("appLogin", ["ngCookies"]);
var host = "https://facco.s-work.vn";
var host1 = "http://localhost:6002";
var hostSwork = "https://s-work.vn";
var gView = "https://docs.google.com/gview?url=";
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getCataloguesName: function (callback) {
            $http.post(host + '/MobileLogin/GetCataloguesName').then(callback);
        },
        getCatalogueAndFile: function (callback) {
            $http.post(host + '/MobileLogin/GetCatalogueAndFile').then(callback);
        },
        createTempFile: function (id, callback) {
            $http.post(host + '/MobileLogin/CreateTempFile?Id=' + id).then(callback);
        },
        scanAccordantOnlineSupport: function (callback) {
            $http.post(hostSwork + '/MobileLogin/ScanAccordantOnlineSupport').then(callback);
        },
        insertOnlineTracking: function (data, callback) {
            $http.post(hostSwork + '/MobileLogin/InsertOnlineSupportTracking?caller=' + data.caller + "&idReceiver=" + data.idReceiver + "&location=" + data.location).then(callback);
        },
        updateFinishTracking: function (data, callback) {
            $http.post(hostSwork + '/MobileLogin/FinishOnlineSupportTracking?sessionId=' + data.sessionId).then(callback);
        },
        logOut: function (data, callback) {
            $http.post(hostSwork + '/MobileLogin/Logout?username=' + data).then(callback);
        },
        getProductByCatalogue: function (data, callback) {
            $http.post(host + '/MobileLogin/GetProductByCatalogue', data).then(callback);
        },
        scanSkypeAccordantOnlineSupport: function (callback) {
            $http.post(hostSwork + '/MobileLogin/ScanSkypeAccordantOnlineSupport').then(callback);
        },
        insertSkypeOnlineSupportTracking: function (data, callback) {
            $http.post(hostSwork + '/MobileLogin/InsertSkypeOnlineSupportTracking?receiver=' + data.receiver + "&location=" + data.location).then(callback);
        },
        login: function (data, callback) {
            $http.post(hostSwork + '/MobileLogin/LoginFacco?username=' + data.username + "&password=" + data.password).then(callback);
        }

    }
});
app.run(function ($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
        });
    }, false);

    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.online = true;
        });
    }, false);
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            //min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                StartTime: {
                    required: true,
                },
                EndTime: {
                    required: true,
                },
            },
            messages: {
                StartTime: {
                    required: "Nhập thời gian bắt đầu",
                },
                EndTime: {
                    required: 'Nhập thời gian kết thúc'
                },
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $translateProvider.useUrlLoader('/Admin/UserBusyOrFree/Translation');
    caption = $translateProvider.translations();
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
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.callTitle = "Gọi hỗ trợ";
    $scope.host = "https://facco.s-work.vn";
    $scope.callback = function (rs) {
        console.log(rs);
    }
    function getParam(name, url) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
    }
    var userName = getParam('username');
    $scope.notification = "Vui lòng chọn nhóm trước để hiển thị sản phẩm";
    //Websync
    $scope.webSyncHandleUrl = "https://websync.s-work.vn/websync.ashx";
    fm.websync.client.enableMultiple = true;
    $scope.client = new fm.websync.client($scope.webSyncHandleUrl);
    $scope.client.setDisableCORS(true);
    //Value ô tìm kiếm
    $scope.searchValue = null;
    $scope.originFileUri = null;
    $scope.currentProductCode = null;
    //ảnh mặc định ở slide
    $scope.currentImg = "img/no_image.png";
    // tên mặc định
    $scope.currentProductName = "";
    //Mảng quét supporter
    $scope.supporters = [];
    //Giá mặc định
    $scope.currentCost = '';
    //Map cha và con cây thư mục - file
    $scope.map = {};
    // Map code và tên thư mục file
    $scope.mapCodeName = {};
    //$scope.showPagging1 = false;
    //Map mã ảnh và đường dẫn ảnh
    $scope.mapCodeProduct = {};
    $scope.currentCatelogue = null;
    $scope.isHaveFisrtProduct = false;
    //Icelink
    var videoView = document.getElementById('videoView');
    var logView = document.getElementById('logView');
    $scope.app = new Video(logView, $scope.callback);
    //Thông tin người dùng supporter1111 facco_test1111
    //$scope.user = { GivenName: userName, UserName: userName };
    $scope.user = { GivenName: 'supporter1111', UserName: 'facco_test1111' };

    $rootScope.rootUser = $scope.user;
    $scope.currentUser = $scope.user.UserName;
    $scope.partner = null;
    //Thông tin đường dẫn nút call
    $scope.iconCall = "img/video-call-green.png";
    //Thông tin người nhận cuộc gọi
    $scope.supporter = null;
    //Thông tin tracking
    $scope.currentTracking = null;
    //Thông tin tab hiện tại
    $scope.currentTab = "all_product"; //[finished_product, sub_product, all_product]
    //Thông tin page, đang ở page nào, số item /page, max page
    $scope.page = 1;
    $scope.length = 20;
    $scope.maxPage = 0;
    //Mảng danh sách sản phẩm
    $scope.products = [];
    //Trạng thái cuộc gọi: Chưa gọi, đang gọi
    var isCalling = false;
    //session Id của cuộc gọi video
    var sessionId = null;
    $scope.showProduct = true;
    //Tab hiện tại
    $scope.currentTab = "group";
    //Hiển thị cây
    $scope.ctr = {};
    $scope.treeData = [];
    //Mảng chứa log
    $scope.logs = [];
    //Có hiển thị khung view lên không
    $scope.isViewer = false;
    //View ảnh
    $scope.isImage = false;
    //View video
    $scope.isVideo = true;
    //View tài liệu
    $scope.isDocument = false;
    //Url view  ảnh, video, tài liệu
    $scope.url = "";
    //Khai báo pin, room cho project, room hiện tại là: Phòng Test
    $scope.pins = [{ name: "Romooc, Tam Long", pin: "RM" }, { name: "Vicem", pin: "VC" }, { name: "S-work", pin: "SW" }, { name: "Phòng Test", pin: "PT" }];
    $scope.currentRoom = $scope.pins[3].pin;
    $rootScope.rootCurrentRoom = $scope.currentRoom;
    //Cho biết đây là hỗ trợ viên hay người gọi
    //user.toLowerCase().includes("facco")
    var isSupporter = false;
    if ($scope.currentUser.toLowerCase().includes("supporter"))
        isSupporter = true;
    else
        isSupporter = false;
    // Phần mở rộng các file hay dùng
    var excels = ['.XLSM', '.XLSX', '.XLS'];
    var documents = ['.TXT'];
    var words = ['.DOCX', '.DOC'];
    var pdfs = ['.PDF'];
    var powerPoints = ['.PPS', '.PPTX', '.PPT'];
    var images = ['.JPG', '.PNG', '.TIF', '.TIFF'];
    var videos = ['.MP4'];
    //Config cây 
    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            "root":
            {
                "icon": "glyphicon glyphicon-plus"
            },
            ".mp4":
            {
                "icon": "fa fa-film"
            },
            ".pdf":
            {
                "icon": "fa fa-file-pdf-o"
            },
            ".doc":
            {
                "icon": "fa fa-file-word-o"
            },
            ".docx":
            {
                "icon": "fa fa-file-word-o"
            },
            ".pptx":
            {
                "icon": "fa fa-file-powerpoint-o"
            },
            ".png":
            {
                "icon": "fa fa-picture-o"
            },
            ".jpg":
            {
                "icon": "fa fa-picture-o"
            },
            ".xlsm":
            {
                "icon": "fa fa-file-excel-o"
            },
            ".xlsx":
            {
                "icon": "fa fa-file-excel-o"
            },
            ".xls":
            {
                "icon": "fa fa-file-excel-o"
            },
            "default":
            {
                "icon": 'fa fa-folder icon-state-warning'
            },

        },
        version: 1,
        plugins: ['types'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    //Get nhóm(danh mục) và danh sách các tệp liên quan, event tree
    $scope.getCatalogueAndFile = function () {
        dataservice.getCatalogueAndFile(function (rs) {
            var result = rs.data;
            for (var i = 0; i < result.length; i++) {
                var data = {
                    id: result[i].ProductCode,
                    parent: '#',
                    text: result[i].ProductName,
                    state: { selected: false, opened: true },
                    type: "folder"
                }
                $scope.treeData.push(data);
                $scope.map[result[i].ProductCode] = "#";
                $scope.mapCodeName[result[i].ProductCode] = result[i].ProductName;

                var list = result[i].list;
                for (var j = 0; j < list.length; ++j) {
                    var data = {
                        id: list[j].Id,
                        parent: result[i].ProductCode,
                        text: list[j].FileName,
                        state: { selected: false, opened: true },
                        type: list[j].FileTypePhysic.toLowerCase()
                    }
                    $scope.treeData.push(data);
                    $scope.map[list[j].Id] = result[i].ProductCode;
                    $scope.mapCodeName[list[j].Id] = list[j].FileName;
                }
            }
            console.log($scope.treeData);
        });
    }
    //Sự kiện click vào 1 node, event tree
    $scope.selectNodeRepository = function () {
        var current = $scope.currentCatelogue;
        ////////debugger
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_selected();
        if (listNoteSelect.length == 1 && parseInt(listNoteSelect[0]) > 0) {
            $scope.currentCatelogue = $scope.map[listNoteSelect[0]];
            $scope.updateLog("Chọn tệp: " + $scope.mapCodeName[listNoteSelect[0]], false);
            $scope.getFileUri(listNoteSelect[0]);
        }
        else if (listNoteSelect.length == 1) {
            $scope.currentCatelogue = listNoteSelect[0];
            $scope.updateLog("Catalogue: " + $scope.mapCodeName[listNoteSelect[0]], false);
        }
        if (current != $scope.currentCatelogue) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "folder;" + $scope.currentCatelogue, "key": "navigation", "type": "view_type" };
            $scope.publishMessage(content);
            $scope.page = 1;
            $scope.getProductByCatalogue($scope.currentCatelogue);
        }
    }
    $scope.onClickImage1 = function (data) {
        //////debugger
        var item = $scope.mapCodeProduct[data];
        $scope.currentProductCode = item.ProductCode;
        if (item != undefined && item != null) {
            $scope.currentImg = $scope.host + item.PathImg;
            $scope.currentProductName = item.ProductName;
            $scope.currentCost = item.PriceRetailBuild;
        }
        if (isCalling) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": data, "key": "navigation", "type": "list_type" };
            $scope.publishMessage(content);
        }
        console.log(data);
    }
    //Hàm lấy sản phẩm theo danh mục
    $scope.getProductByCatalogue = function (catalogue) {
        var obj = { Page: $scope.page, Length: $scope.length, Product: $scope.searchValue, Category: catalogue };
        dataservice.getProductByCatalogue(obj, function (res) {
            var data = res.data;
            $scope.products = data.Object;
            //if ($scope.products.length > 0)
            //$scope.showPagging1 = true;
            // else
            //$scope.showPagging1 = false;
            $scope.maxPage = Math.ceil(data.MaxLength / $scope.length);
            $scope.pagging(data);
            $scope.initOrUpdateSlide(data);
            var list = data.Object;
            var source = [];
            for (var indx = 0; indx < list.length; ++indx) {
                var item = list[indx];
                $scope.mapCodeProduct[item.ProductCode] = item;
            }
            for (var indx = 1; indx <= data.MaxLength; ++indx) {
                source.push(indx);
            }
            var DM = $('#pagination-demo');
            DM.pagination({
                dataSource: source,
                pageSize: $scope.length,
                pageNumber: $scope.page,
                callback: function (data, pagination) {
                    if ($scope.page != pagination.pageNumber) {
                        $scope.page = pagination.pageNumber;
                        $scope.getProductByCatalogue(catalogue);
                        $scope.sendNextPage();
                    }
                }
            })
            if (list.length > 0) {
                if ($scope.currentProductCode != null && $scope.currentProductCode != "") {
                    for (var indx = 0; indx < $scope.products.length; ++indx) {
                        var item = $scope.products[indx];
                        if (item.ProductCode == $scope.currentProductCode) {
                            $scope.currentImg = $scope.host + item.PathImg;
                            $scope.currentProductName = item.ProductName;
                            $scope.currentCost = item.PriceRetailBuild;
                        }
                    }
                }
                else {
                    var item = list[0];
                    $scope.currentImg = $scope.host + item.PathImg;
                    $scope.currentProductName = item.ProductName;
                    $scope.currentCost = item.PriceRetailBuild;
                }
                //$scope.showPagging = true;
            }
            else {
                $scope.notification = "Không có sản phầm nào phù hợp";
                //$scope.showPagging = false;
            }
        });
    }
    //Hàm đổ dữ liệu từ source lên pagging
    $scope.pagging = function (data) {
        //var source = [];
        //for (var i = 1; i <= data.MaxLength; ++i)
        //    source.push(i);
        //var pagination = angular.element(document.querySelector('#pagination-demo'));
        //pagination.pagination({
        //    dataSource: source,
        //    pageSize: $scope.length,
        //    pageNumber: $scope.page,
        //    callback: function (data, pagination) {
        //        if ($scope.page != pagination.pageNumber) {
        //            $scope.page = pagination.pageNumber;
        //            $scope.getProductByCatalogue($scope.currentCatelogue);
        //            $scope.sendNextPage();
        //        }
        //    }
        //})
    }
    //Hàm gửi tín hiệu đổi trang
    $scope.sendNextPage = function () {
        $scope.currentPos = 0;
        $scope.updateLog("Đổi trang", false);
        if (isCalling) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": $scope.page, "key": "navigation", "type": "change_page" };
            $scope.publishMessage(content);
        }
    }
    //Hàm gọi api lấy đường dẫn file và hiển thị
    $scope.getFileUri = function (id) {
        dataservice.createTempFile(id, function (rs) {
            var data = rs.data;
            var obj = data.Object;
            var fileType = obj.FileTypePhysic.toUpperCase();
            $scope.isVideo = false;
            $scope.isDocument = false;
            $scope.isImage = false;
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": null, "key": "navigation", "type": "view_type" };
            var url = obj.Url;
            $scope.originFileUri = url;
            $scope.originFileType = fileType;
            //debugger
            if (excels.indexOf(fileType) !== -1 || documents.indexOf(fileType) !== -1 || words.indexOf(fileType) !== -1 || powerPoints.indexOf(fileType) !== -1) {
                $scope.isDocument = true;
                $scope.url = gView + host + encodeURI("/" + url) + '&embedded=true';
                $scope.originFileUri = $scope.url;
                content.content = $scope.url;
                $scope.url = $sce.trustAsResourceUrl($scope.url);
                console.log($scope.url);
                $scope.isViewer = true;

            }
            else if (pdfs.indexOf(fileType) !== -1) {
                $scope.isDocument = true;
                $scope.url = host + encodeURI("/" + url);
                $scope.originFileUri = $scope.url;
                content.content = $scope.url;
                $scope.url = $sce.trustAsResourceUrl($scope.url);
                console.log($scope.url);
                $scope.isViewer = true;
            }
            else if (videos.indexOf(fileType) !== -1) {
                $scope.isVideo = true;
                $scope.url = host + encodeURI("/" + url);
                content.content = $scope.url;
                $scope.isViewer = true;
            }
            else if (images.indexOf(fileType) !== -1) {
                $scope.isImage = true;
                $scope.url = host + encodeURI("/" + url);
                content.content = $scope.url;
                $scope.isViewer = true;
            }
            $scope.update1111();
            if (isCalling) {
                $scope.publishMessage(content);
            }
        });
    }
    //
    $scope.update1111 = function () {
        ////debugger
        var myEl = angular.element(document.querySelector('#overlay'));
        myEl.removeClass("nonenone");
        myEl.removeClass("overlay1");
        myEl.addClass("blockblock");
    }
    //Sự kiện trên cây
    $scope.treeEvents = {
        'ready': $scope.getCatalogueAndFile,
        'select_node': $scope.selectNodeRepository
    }
    //Đóng view tệp...
    $scope.closeViewer = function (isSelf) {
        $scope.isViewer = false;
        if (isSelf) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "closeViewer", "key": "navigation", "type": "view_type" };
            $scope.publishMessage(content);
        }
        else {
            $scope.$apply();
        }
    }

    //Đóng view tệp...
    $scope.refresh = function (isSelf) {
        if (isSelf) {
            //var cr = $scope.url;
            //$scope.url = "";
            //$scope.url = cr;
            ////debugger
            if ($scope.isDocument) {
                $scope.url = $sce.trustAsResourceUrl("https://supportcenter.s-work.vn/");
                $scope.url = $sce.trustAsResourceUrl($scope.originFileUri);
            }
        }
        else {
            if (isCalling) {
                var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "refreshViewer", "key": "navigation", "type": "view_type" };
                $scope.publishMessage(content);
            }
        }
    }
    //Hàm mở video call, call video
    $scope.start = function () {
        $scope.updateLog("Bắt đầu cuộc gọi", true);
        //ngắt video call để làm gì skype?
        if (sessionId == null) {
            return;
        }
        $scope.app.sessionId = sessionId;
        // Start local media.
        $scope.app.sessionId = sessionId;
        console.log('Joining session ' + $scope.app.sessionId + '.');
        //$scope.app.startSignalling(function (error) {
        //    ////debugger
        //    if (error != null) {
        //        console.log(error);
        //        //return $scope.stopSignalling();
        //        //return "error-startSignalling";
        //    }
        //    // Start the local media stream.
        //    $scope.app.startLocalMedia(videoView, false, function (error) {
        //        if (error != null) {
        //            console.log(error);
        //            return $scope.stopLocalMedia();
        //            //return "error-startLocalMedia";
        //        }
        //        // Start the conference.
        //        $scope.app.startConference(function (error) {
        //            if (error != null) {
        //                console.log(error);
        //                return $scope.stopConference();
        //            }
        //        }

        //            //, function () {
        //            //$scope.stop();
        //            //}

        //        );
        //        return "null";
        //    });
        //});
    }
    //Dừng video, hủy video
    $scope.stop = function () {
        ////debugger
        $scope.updateLog("Kết thúc cuộc gọi", true);
        $scope.sessionId = null;
        $scope.partner = null;
        isCalling = false;
        $scope.iconCall = "img/video-call-green.png";
        $scope.callTitle = "Gọi hỗ trợ";
        $scope.$apply();
        if (!$scope.app.sessionId) {
            return;
        }
        //$scope.stopCall();
    };
    $scope.stopCall = function () {
        //var cnt = 0;
        //var log = $scope.stopConference();
        //while (log == "error-stopConference" && cnt < 100) {
        //    log = $scope.stopConference();
        //    cnt++;
        //}
        //if (log == "error-stopLocalMedia") {
        //    cnt = 0;
        //    log = $scope.stopLocalMedia();
        //    while (log == "error-stopLocalMedia" && cnt < 100) {
        //        log = $scope.stopLocalMedia();
        //        cnt++;
        //    }
        //}
        //if (log == "error-stopSignalling") {
        //    cnt = 0;
        //    log = $scope.stopSignalling();
        //    while (log == "error-stopSignalling" && cnt < 100) {
        //        log = $scope.stopSignalling();
        //        cnt++;
        //    }
        //}
        $scope.stopLocalMedia();
        $scope.stopConference();
    }
    $scope.stopConference = function () {
        //$scope.app.stopConference(function (error) {
        //    if (error) {
        //        fm.log.error(error);
        //        console.log("bug-stopConference"+error);
        //        return "error-stopConference";
        //    }
        //    $scope.app.stopLocalMedia(function (error) {
        //        if (error) {
        //            fm.log.error(error);
        //            console.log("bug-stopLocalMedia" + error);
        //            return "error-stopLocalMedia";
        //        }

        //        $scope.app.stopSignalling(function (error) {
        //            if (error) {
        //                fm.log.error(error);
        //                console.log("bug-stopSignalling" + error);
        //                return "error-stopSignalling";

        //            }
        //            else {
        //                $scope.sessionId = null;
        //                $scope.partner = null;
        //                isCalling = false;
        //            }
        //        });
        //    });
        //});
        //return "null";
        $scope.app.stopConference(function (error) {
            if (error != null) {
                alert(error);
            }
            else {
                // Disable the leave button.
                //leaveButton.setAttribute('disabled', 'disabled');
            }
        });
    }
    $scope.stopLocalMedia = function () {
        $scope.sessionId = null;
        $scope.partner = null;
        isCalling = false;
        $scope.app.stopLocalMedia(function (error) {
            if (error != null) {
                alert(error);
            }
            else {

            }
        });
        //$scope.app.stopLocalMedia(function (error) {
        //    if (error) {
        //        fm.log.error(error);
        //        console.log("bug-stopLocalMedia" + error);
        //        return "error-stopLocalMedia";
        //    }

        //    $scope.app.stopSignalling(function (error) {
        //        if (error) {
        //            fm.log.error(error);
        //            console.log("bug-stopSignalling" + error);
        //            return "error-stopSignalling";
        //        }
        //    });

        //});
        //return "null";
    }

    //Gửi tín hiệu đã nhận được tín hiệu hủy cuộc gọi
    $scope.acceptEndCall = function () {
        var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "Kết thúc", "key": "video_call", "type": "is_accepted_finish" };
        $scope.publishMessage(content);
    }
    //Hàm xử lý tin nhắn khi nhận được
    $scope.processMessage = function (obj) {
        var fromUser = obj.fromUser;
        var toUser = obj.toUser;
        var content = obj.content;
        var key = obj.key;
        var type = obj.type;
        if (toUser != $scope.user.UserName)
            return;
        $scope.partner = fromUser;
        if (isSupporter) { //supporter
            if (key == "video_call" && type == "request") {
                sessionId = fromUser + '-' + toUser;
                $scope.start(sessionId, true, true);
                isCalling = true;
                $scope.iconCall = "img/video-call-red.png";
                $scope.callTitle = "Kết thúc cuộc gọi";
                var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "handshake", "key": "video_call", "type": "is_accepted" };
                $scope.publishMessage(content);
                $scope.$apply();
            } else if (key == "navigation") {
                $scope.processnavigation(type, content);
            } else if (key == "video_call" && type == "is_finish") {
                $scope.acceptEndCall();
                isCalling = false;
                $scope.stop();
                $scope.updateFinishTracking();
                //$scope.updateLog("Có yêu cầu kết thúc cuộc gọi", true);
            } else if (key == "video_call" && type == "is_accepted_finish") {
                isCalling = false;
                $scope.stop();
                $scope.updateFinishTracking();
            } else if (key == "video_call" && type == "tracking") {
                try {
                    $scope.currentTracking = JSON.parse(content);
                }
                catch (Exception) {
                    $scope.currentTracking = content;
                    console.log("cat");
                    console.log($scope.currentTracking);
                }
            }
        }
        else { //Người dùng
            if (toUser == $scope.user.UserName) {
                if (key == "video_call" && type == "is_accepted") {
                    $scope.updateLog("Supporter nhận cuộc gọi", true);
                    $scope.supporter = $rootScope.rootSupporter;
                    isCalling = true;
                    //sessionId  = user người gọi + user hỗ trợ viên, đây là tín hiệu đồng ý từ hỗ trợ viên
                    sessionId = toUser + '-' + fromUser;
                    $scope.start(sessionId, true, true);
                    $scope.insertOnlineTracking();
                    $scope.iconCall = "img/video-call-red.png";
                    $scope.callTitle = "Kết thúc cuộc gọi";
                    if ($scope.modalInstance != undefined) {
                        //debugger
                        $scope.modalInstance.close();
                    }
                    var newlink = document.createElement('a');
                    newlink.setAttribute('href', "skype:" + $scope.supporter.Skype + "?call");
                    newlink.click();
                    //var win = window.open("skype:" + $scope.supporter.Skype + "?call", '_blank');
                    //win.focus()
                    $scope.$apply();

                } else if (key == "navigation") {
                    $scope.processnavigation(type, content);
                }
                else if (key == "video_call" && type == "is_finish") {
                    $scope.acceptEndCall();
                    isCalling = false;
                    $scope.stop();
                    $scope.updateFinishTracking();
                    //$scope.updateLog("Có yêu cầu kết thúc cuộc gọi", true);
                } else if (key == "video_call" && type == "is_accepted_finish") {
                    isCalling = false;
                    //$scope.stop();
                    $scope.updateFinishTracking();
                    //$scope.updateLog("Đối tác đồng ý kết thúc cuộc gọi", true);
                }
            }
        }
        $scope.$apply();
    }
    //Hàm update cuộc gọi khi kết thúc
    $scope.updateFinishTracking = function () {
        if ($scope.currentTracking != null && $scope.currentTracking.SvrSession != null) {
            var data = { 'sessionId': $scope.currentTracking.SvrSession };
            dataservice.updateFinishTracking(data, function (res) {
            });
        }
    }
    //Hàm tìm sản phẩm
    $scope.searchProduct = function (isRemote) {
        $scope.page = 1;
        $scope.currentPos = 0;
        $scope.updateLog("Tìm sản phẩm", false);
        $scope.getProductByCatalogue($scope.currentCatelogue);
        if (isCalling) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": $scope.searchValue, "key": "navigation", "type": "search_type" };
            $scope.publishMessage(content);
        }
        $scope.changeTab("product", true);
    }
    //Hàm gắn dữ liệu vào slide
    $scope.initOrUpdateSlide = function (data) {

    }
    //Hàm gửi search value
    $scope.sendSearchValue = function () {
        $scope.updateLog("Tìm kiếm: " + ($scope.searchValue != null ? $scope.searchValue : ""), false);
        if (isCalling) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": $scope.searchValue, "key": "navigation", "type": "search_type" };
            $scope.publishMessage(content);
        }
    }
    //Date to string
    function convertDateToString(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return day + "/" + month + "/" + year + "  " + hour + ":" + minute + ":" + second + "." + date.getMilliseconds();
    };
    //Hàm update log
    $scope.updateLog = function (content, fromPartner) {
        var color = "#3A9A0A";
        if (fromPartner == true) {
            color = "#B00A1B";
        }
        var d = new Date();
        var dates = convertDateToString(d);
        $scope.logs.unshift({ color: "#f0f0f0", content: content, time: dates });
    }
    $rootScope.rootUpdate = $scope.updateLog;
    //Hàm xử lý điều hướng
    $scope.processnavigation = function (type, value) {
        if (type == "search_type") {
            if (value.trim() == '') value = '';
            $scope.searchValue = value;
            $scope.currentPos = 0;
            $scope.page = 1;
            $scope.updateLog("Tìm sản phẩm", true);
            $scope.getProductByCatalogue($scope.currentCatelogue);
            $scope.changeTab("product", true);
        } else if (type == "list_type" || type == "view_pager_type") {
            $scope.updateLog("Đổi sản phẩm", true);
            var item = $scope.mapCodeProduct[value];
            if (item != undefined && item != null) {
                $scope.currentImg = $scope.host + item.PathImg;
                $scope.currentProductName = item.ProductName;
                $scope.currentCost = item.PriceRetailBuild;
            }

        } else if (type == "button_type") {
            console.log(value);
            $scope.updateLog("Đổi tab", true);
            $scope.changeTab(value, true);
        }
        else if (type == "view_type") {
            if (value == "closeViewer") {
                $scope.updateLog("Đóng xem tệp", true);
                $scope.closeViewer(false);
            }
            else {
                if (value.includes('folder') > 0) {
                    //////debugger
                    var res = value.split(";");
                    if (res.length == 2) {
                        $scope.currentCatelogue = res[1];
                        $scope.page = 1;
                        $scope.getProductByCatalogue($scope.currentCatelogue);
                    }
                    return;
                }
                $scope.url = value;
                $scope.originFileUri = value;
                $scope.updateLog("Xem tệp", true);
                //$scope.getFileUri(value);
                $scope.isDocument = false;
                $scope.isVideo = false;
                $scope.isImage = false;
                if ($scope.url.toLowerCase().includes("embedded=true")) {
                    $scope.isDocument = true;
                    $scope.url = $sce.trustAsResourceUrl($scope.url);
                    console.log($scope.url);
                    $scope.isViewer = true;
                }
                else if ($scope.url.toLowerCase().includes(".pdf")) {
                    $scope.isDocument = true;
                    $scope.originFileUri = $scope.url;
                    $scope.url = $sce.trustAsResourceUrl($scope.url);
                    console.log($scope.url);
                    $scope.isViewer = true;
                }
                else if ($scope.url.toLowerCase().includes(".mp4")) {
                    $scope.isVideo = true;
                    $scope.isViewer = true;
                }
                else if ($scope.url.toLowerCase().includes(".jpg") || $scope.url.toLowerCase().includes(".png") || $scope.url.toLowerCase().includes(".tif") || $scope.url.toLowerCase().includes(".tiff")) {
                    $scope.isImage = true;
                    $scope.isViewer = true;
                }
                $scope.$apply();
                //if (excels.indexOf(fileType) !== -1 || documents.indexOf(fileType) !== -1 || words.indexOf(fileType) !== -1 || pdfs.indexOf(fileType) !== -1 || powerPoints.indexOf(fileType) !== -1) {
                //    $scope.isDocument = true;
                //    $scope.url = gView + host + encodeURI("/" + url) + '&embedded=true';
                //    content.content = $scope.url;
                //    $scope.url = $sce.trustAsResourceUrl($scope.url);
                //    console.log($scope.url);
                //    $scope.isViewer = true;

                //}
                //else if (videos.indexOf(fileType) !== -1) {
                //    $scope.isVideo = true;
                //    $scope.url = host + encodeURI("/" + url);
                //    content.content = $scope.url;
                //    $scope.isViewer = true;
                //}
                //else if (images.indexOf(fileType) !== -1) {
                //    $scope.isImage = true;
                //    $scope.url = host + encodeURI("/" + url);
                //    content.content = $scope.url;
                //    $scope.isViewer = true;
                //}
            }

        }
        else if (type == "change_page") {
            $scope.updateLog("Đổi trang", true);
            $scope.page = parseInt(value);
            $scope.getProductByCatalogue($scope.currentCatelogue);

        } else if (type == "firstSynchronize") {
            var arr = value.split(";");
            if (arr.length == 5) {
                $scope.changeTab(arr[0], true);
                var pg = parseInt(arr[1]);
                $scope.page = pg;
                $scope.currentTab = arr[0];
                $scope.searchValue = arr[2];
                $scope.currentCatelogue = arr[3];
                $scope.currentProductCode = arr[4];
                $scope.isHaveFisrtProduct = true;
                if ($scope.currentCatelogue != null && $scope.currentCatelogue != "")
                    $scope.getProductByCatalogue($scope.currentCatelogue);
                else {
                    $scope.currentCatelogue = null;
                    $scope.currentImg = "img/no_image.png";
                    $scope.currentProductName = "";
                    $scope.currentCost = '';
                    $scope.products = [];
                }
            }
            $scope.updateLog("Đổi tab và đổi trang", true);
        }
    }
    //Bấm đổi tab
    $scope.changeTab = function (data, fromPatern) {
        ////debugger
        ////////debugger
        $scope.updateLog("Đổi tab", false);
        $scope.currentTab = data;
        if (fromPatern == false) {
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": data, "key": "navigation", "type": "button_type" };
            $scope.publishMessage(content);
        }
        if (data == "group") {
            var myEl = angular.element(document.querySelector('#TabGroup'));
            myEl.addClass('active');
            var myEl1 = angular.element(document.querySelector('#TabProduct'));
            myEl1.removeClass('active');

            var myEl2 = angular.element(document.querySelector('#group'));
            myEl2.addClass('zindex1000');
            var myEl3 = angular.element(document.querySelector('#product'));
            myEl3.removeClass('zindex1000');
        }
        if (data == "product") {
            var myEl = angular.element(document.querySelector('#TabGroup'));
            myEl.removeClass('active');
            var myEl1 = angular.element(document.querySelector('#TabProduct'));
            myEl1.addClass('active');

            var myEl2 = angular.element(document.querySelector('#group'));
            myEl2.removeClass('zindex1000');
            var myEl3 = angular.element(document.querySelector('#product'));
            myEl3.addClass('zindex1000');
            if ($scope.currentCatelogue == "" || $scope.currentCatelogue == null) {
                $scope.notification = "Vui lòng chọn nhóm trước để hiển thị sản phẩm";
            }

        }
        //$scope.$apply();
    }
    //Hàm khởi tạo websync
    $scope.initWebsync = function () {
        fm.util.addOnLoad(function () {
            util = {
                observe: fm.util.observe,
                stopEvent: function (event) {
                    console.log(event);
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
                subcribe: function (channel) {
                    $scope.client.subscribe({
                        channel: '/' + $scope.currentRoom,
                        onSuccess: function (args) {
                            console.log("subcribe success: " + $scope.currentRoom);
                        },
                        onFailure: function (args) {
                            console.log("subcribe failed: " + args.channel);
                        },
                        onReceive: function (args) {
                            var data = args.getData();
                            console.log(data);
                            $scope.processMessage(data);
                        }
                    });
                },
                unsubcribe: function (channel) {
                    $scope.client.unsubscribe({
                        channel: '/' + channel,
                        onSuccess: function (args) {
                            console.log("unsubcribe success: " + args.channel);
                        },
                        onFailure: function (args) {
                            console.log("subcribe failed: " + args.channel);
                        }

                    });
                },
                disconnect: function () {
                }
            }
            $scope.client.connect({
                onSuccess: function (args) {
                },
                onFailure: function (args) {
                }
            });
            util.subcribe();
        });
    }
    //Hàm gửi tin nhắn lên room
    $scope.publishMessage = function (data) {
        if ($scope.client != null) {
            $scope.client.publish({
                channel: '/' + $scope.currentRoom,
                data: data,
                onSuccess: function (args) {

                }
            });
        }
    }
    //Scan hỗ trợ viên rảnh rỗi
    $scope.scanSupporter = function () {
        if (isCalling == false) {
            if (!isSupporter) {
                $scope.updateLog("Tìm hỗ trợ viên", false);
                dataservice.scanAccordantOnlineSupport(function (res) {
                    //debugger
                    var data = res.data;
                    if (data != null && data.length > 0) {
                        $scope.supporters = data;
                        $scope.openChoose();
                        //$scope.supporter = data[0];
                        //console.log($scope.supporter);
                        //var content = { "fromUser": $scope.user.UserName, "toUser": $scope.supporter.UserName, "content": "Bạn có một cuộc gọi", "key": "video_call", "type": "request" };
                        //$scope.publishMessage(content);
                        //$scope.updateLog("Đang kết nối cuộc gọi...", false);
                        //var win = window.open("skype:" + $scope.supporter.Skype + "?call", '_blank');
                        //win.focus()
                    }
                    else {
                        alert("Không tìm thấy hỗ trợ viên nào");
                    }
                });
            }
            else
                alert("Chức năng không dùng cho hỗ trợ viên");
        }
        else {
            $scope.updateLog("Bấm kết thúc cuộc gọi", false);
            $scope.closeVideo(false);
        }
    }
    $scope.scanSupporter1 = function () {
        if (isCalling == false) {
            if (!isSupporter) {
                $scope.updateLog("Tìm hỗ trợ viên", false);
                dataservice.scanAccordantOnlineSupport(function (res) {
                    var data = res.data;
                    if (data != null && data.length > 0) {
                        $scope.supporters = data;
                        $scope.openChoose();
                        //$scope.supporter = data[0];
                        //console.log($scope.supporter);
                        //var content = { "fromUser": $scope.user.UserName, "toUser": $scope.supporter.UserName, "content": "Bạn có một cuộc gọi", "key": "video_call", "type": "request" };
                        //$scope.publishMessage(content);
                        //$scope.updateLog("Đang kết nối cuộc gọi...", false);
                        //var win = window.open("skype:" + $scope.supporter.Skype + "?call", '_blank');
                        //win.focus()
                    }
                    else {
                        alert("Không tìm thấy hỗ trợ viên nào");
                    }
                    //var data = res.data;
                    //if (data != null && data.length > 0) {
                    //    $scope.supporter = data[0];
                    //    console.log($scope.supporter);
                    //    var content = { "fromUser": $scope.user.UserName, "toUser": $scope.supporter.UserName, "content": "Bạn có một cuộc gọi", "key": "video_call", "type": "request" };
                    //    $scope.publishMessage(content);
                    //    $scope.updateLog("Đang kết nối cuộc gọi...", false);
                    //}
                    //else {
                    //    alert("Không tìm thấy hỗ trợ viên nào");
                    //}
                });
            }
            else
                alert("Chức năng không dùng cho hỗ trợ viên");
        }
        else {
            alert("Đang trong cuộc gọi");
        }
    }
    //Gửi tracking cho supporter, trong trường hợp lỗi mạng bên supporter có thể kết thúc cuộc gọi
    $scope.sendTracking = function () {
        var sessionId = $scope.user.UserName + '-' + $scope.supporter.UserName;
        var content = { "fromUser": $scope.user.UserName, "toUser": $scope.supporter.UserName, "content": $scope.currentTracking, "key": "video_call", "type": "tracking" };
        $scope.publishMessage(content);
    }
    //Gửi trạng thái về: tab, page.. sang cho bên supporter
    $scope.firstSynchronize = function () {
        var content = {
            "fromUser": $scope.user.UserName,
            "toUser": $scope.supporter.UserName,
            "content": $scope.currentTab + ";" + $scope.page + ";" + ($scope.searchValue != null ? $scope.searchValue : "") + ";" + ($scope.currentCatelogue != null ? $scope.currentCatelogue : "") + ";" + ($scope.currentProductCode != null ? $scope.currentProductCode : ""),
            "key": "navigation",
            "type": "firstSynchronize"
        };
        $scope.publishMessage(content);
    }
    //Insert online tracking
    $scope.insertOnlineTracking = function () {
        ////////debugger
        var obj = { 'caller': $scope.user.UserName, 'idReceiver': $scope.supporter.Id, 'location': "" };
        dataservice.insertOnlineTracking(obj, function (res) {
            ////////debugger
            var data = res.data;
            if (data.Object != null && data.Object != 'null') {
                $scope.currentTracking = data.Object;
                console.log($scope.currentTracking);
                $scope.sendTracking();
                $scope.firstSynchronize();
            }
        });
    }
    //Đóng video, kết thúc cuộc gọi
    $scope.closeVideo = function (isLogOut) {
        if (isCalling) {
            $scope.updateLog("Bấm kết thúc cuộc gọi", false);
            var content = { "fromUser": $scope.user.UserName, "toUser": $scope.partner, "content": "Kết thúc", "key": "video_call", "type": "is_finish" };
            $scope.publishMessage(content);
            $scope.updateFinishTracking();
            $scope.stop();
        }
        else {
            if (!isLogOut)
                alert("Chức năng chỉ khả dụng trong cuộc gọi");
        }
    }
    //Hàm gọi api đăng xuất và về màn hình đăng nhập
    $scope.logOut = function () {
        if ($scope.user != null && $scope.user.UserName != null)
            dataservice.logOut($scope.user.UserName, function (res) {
                var data = res.data;
                if (data.Error) {
                    alert(data.Title);
                } else {
                    ////////debugger
                    $scope.closeVideo(true);
                    $scope.clearCookies();
                    window.location.href = "/";
                }
            });
    }

    //Khởi tạo slide
    $scope.initSlide = function () {

    }
    //Hàm khởi tạo dữ liệu ban đầu
    $scope.loadData = function () {
        $scope.initWebsync();
        $scope.initSlide();
        //$scope.scanSupporter();
    }
    //Khởi tạo
    $scope.loadData();
    function loadPoper() {
        $('[data-toggle="popover"]').popover();
    }

    setTimeout(function () {
        loadPoper();
    }, 200);
    $scope.checkReCall = function () {
        var check = $scope.getCookie("sessionId");
        if (check != "") {
            sessionId = check;
            $scope.startLocalMedia();
        }
    }
    $scope.scanSkype = function () {
        if (!isSupporter) {
            dataservice.scanSkypeAccordantOnlineSupport(function (res) {
                var data = res.data;
                if (data.length > 0) {
                    var skype = data[0].UserName;
                    var obj = { "receiver": skype, "location": "" };
                    dataservice.insertSkypeOnlineSupportTracking(obj, function (res) {
                        var rs = res.data;
                        if (rs != null) {
                            if (rs.Error == true) {
                                alert(rs.Title);
                            }
                            else {
                                var win = window.open("skype:" + skype + "?call", '_blank');
                                win.focus();
                            }
                        }
                    });
                }
                else
                    alert("Không tìm thấy hỗ trợ viên nào");
            });
        }
        else {
            alert("Chức năng không dùng cho hỗ trợ viên");
        }
    }
    $scope.setCookie = function (cname, cvalue, exdays) {
        $cookieStore.put(cname, cvalue);
    }
    $scope.getCookie = function (cname) {
        var data = $cookieStore.get(cname);
        if (data == undefined)
            data = "";
        return data;
    }
    $scope.clearCookies = function () {
        $scope.setCookie("isRemember", "false");
        $scope.setCookie("userName", "false");
        $scope.setCookie("password", "false");
        $scope.setCookie("passByLogin", "false");
        $cookies = [];
    }
    $scope.checkByLogin = function () {
        //debugger
        var check = $scope.getCookie("passByLogin");
        var arr = check.split(";");
        if (arr[0] != "true" || arr[1].toLowerCase() != $scope.user.UserName.toLowerCase()) {
            //alert("Vui lòng đăng nhập");
            window.location.href = "/";
        }
    }
    // $scope.checkByLogin();
    $scope.startSignalling = function () {
        $scope.app.startSignalling(function (error) {
            if (error != null) {
                alert(error);
            }
            else {
                // Stop signalling when the page unloads.
                fm.util.observe(window, 'unload', function () {
                    //debugger
                    $scope.stopSignalling();

                    $scope.logOut();
                });
            }
        });
    };
    $scope.stopSignalling = function () {
        //chú thích code cũ
        //$scope.app.stopSignalling(function (error) {
        //    if (error) {
        //        fm.log.error(error);
        //        console.log("bug-stopSignalling" + error);
        //        return "bug-stopSignalling";
        //    }
        //    else {
        //        $scope.sessionId = null;
        //        $scope.partner = null;
        //        isCalling = false;
        //    }
        //});
        //return "null";
        $scope.app.stopSignalling(function (error) {
            if (error != null) {
                alert(error);
            }
        });
        $scope.closeVideo();

    }
    $scope.startLocalMedia = function () {
        $scope.app.startLocalMedia(videoView, false, function (error) {
            if (error != null) {
                alert(error);
            }
            else {
                // Enable the media controls.
                //toggleAudioMute.removeAttribute('disabled');
                //toggleVideoMute.removeAttribute('disabled');

                // Stop local media when the page unloads.
                fm.util.observe(window, 'unload', function () {
                    stopLocalMedia();
                });

                // Hide the loading indicator.
                //loading.style.display = 'none';

                // Show the video feed(s).
                videoView.style.display = 'block';

                // Start conference now that the local media is available.
                $scope.startConference();
            }
        });
    };
    $scope.startConference = function () {
        $scope.app.startConference(function (error) {
            if (error != null) {
                alert(error);
            }
            else {
                // Enable the leave button.
                //leaveButton.removeAttribute('disabled');

                // Stop conference when the page unloads.
                fm.util.observe(window, 'unload', function () {
                    $scope.saveStatus();
                    $scope.stopConference();
                    //$scope.logOut();
                });
            }
        });
    };
    $scope.startSignallingAndReCall = function () {
        $scope.startSignalling();
    }
    $scope.startSignalling();
    //$scope.checkReCall();
    $scope.$watch('online', function (newStatus) {
        if (isCalling) {
            if (newStatus) {
                $scope.startSignallingAndReCall();
            }
        }
    });
    $scope.saveStatus = function () {
        $scope.setCookie("sessionId", sessionId);
    }

    $scope.openChoose = function () {
        $scope.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: "selectSupporter.html",
            controller: 'selectSupporter',
            backdrop: true,
            size: '60',
            resolve: {
                para: function () {
                    return $scope.supporters;
                },
                websync: function () {
                    return $scope.client;
                }

            }
        });
        $scope.modalInstance.result.then(function (d) {
        }, function () { });

    }

    //$scope.supporter = data[0];
    //console.log($scope.supporter);
    //var content = { "fromUser": $scope.user.UserName, "toUser": $scope.supporter.UserName, "content": "Bạn có một cuộc gọi", "key": "video_call", "type": "request" };
    //$scope.publishMessage(content);
    //$scope.updateLog("Đang kết nối cuộc gọi...", false);
    //var win = window.open("skype:" + $scope.supporter.Skype + "?call", '_blank');
    //win.focus()
});
appLogin.controller('login', ['$scope', '$cookies', '$cookieStore', 'dataservice', function ($scope, $cookies, $cookieStore, dataservice) {
    $scope.isCheck = true;
    $scope.userName = "";
    $scope.password = "";

    $scope.changeCheck = function () {
        $scope.isCheck = !$scope.isCheck;
    }
    $scope.login = function () {
        ////debugger
        if ($scope.userName == "" && $scope.password == "")
            alert("Vui lòng nhập tên đăng nhập và mật khẩu");
        else if ($scope.userName == "")
            alert("Vui lòng nhập tên đăng nhập");
        else if ($scope.password == "")
            alert("Vui lòng nhập mật khẩu");
        else {
            var data = { username: $scope.userName, password: $scope.password }
            dataservice.login(data, function (res) {
                var data = res.data;
                if (data.Object) {
                    if (data.Object.UserName == $scope.userName) {
                        if ($scope.isCheck) {
                            $scope.setCookie("isRemember", $scope.isCheck == true ? "true" : "false", 100 * 365);
                            $scope.setCookie("userName", $scope.userName, 100 * 365);
                            $scope.setCookie("password", $scope.password, 100 * 365);
                        }
                        $scope.setCookie("passByLogin", "true;" + $scope.userName, 100 * 365);
                        window.location.href = "index.html?username=" + $scope.userName;
                    }
                } else {
                    alert(data.Title);
                }
            });
        }
    }

    $scope.setCookie = function (cname, cvalue, exdays) {
        ////debugger
        $cookieStore.put(cname, cvalue);
    }
    $scope.getCookie = function (cname) {
        ////debugger
        var data = $cookieStore.get(cname);
        if (data == undefined)
            data = "";
        return data;
    }
    $scope.checkLogin = function () {
        var check = $scope.getCookie("isRemember");
        if (check != "" && check != false && check != "false") {
            $scope.isCheck = true;
            $scope.userName = $scope.getCookie("userName");
            $scope.password = $scope.getCookie("password");
            $scope.login();
        }
        else {
            $scope.isCheck = false;
            $scope.userName = "";
            $scope.password = "";
        }

    }
    $scope.checkLogin();
}]);
app.controller('selectSupporter', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, para, websync) {
    $scope.supporters = para;
    $scope.isRequest = false;
    $scope.originSupporters = para;
    $scope.client = websync;
    $scope.searchValue = "";
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $rootScope.rootSupporter = {};
    $scope.call = function (userName) {
        if ($scope.isRequest == false) {
            $scope.isRequest = true;
            var content = { "fromUser": $rootScope.rootUser.UserName, "toUser": userName, "content": "Bạn có một cuộc gọi", "key": "video_call", "type": "request" };
            $scope.client.publish({
                channel: '/' + $rootScope.rootCurrentRoom,
                data: content,
                onSuccess: function (args) {

                }
            });
            $rootScope.rootUpdate("Đang kết nối cuộc gọi đến " + userName, false);
            for (var i = 0; i < $scope.supporters.length; ++i) {
                if ($scope.supporters[i].UserName == userName)
                    $rootScope.rootSupporter = $scope.supporters[i];
            }
            setTimeout(function () {
                $scope.isRequest = false;
            }, 5000);
        }
        else
            alert("Đang kết nối đến hỗ trợ viên: " + $rootScope.rootSupporter.GivenName + ", vui lòng chờ");

    }
    $scope.filterSupporter = function () {
        console.log($scope.searchValue);

        var temp = [];
        if ($scope.searchValue != "") {
            for (var i = 0; i < $scope.originSupporters.length; ++i) {
                var item = $scope.originSupporters[i];
                if (item.UserName.toLowerCase().includes($scope.searchValue.toLowerCase()) || item.GivenName.toLowerCase().includes($scope.searchValue.toLowerCase())) {
                    temp.push(item);
                }
            }
        }
        else {
            temp = $scope.originSupporters;
        }
        $scope.supporters = temp;

    }
    //var obj = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj1 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj2 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj3 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj4 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj5 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj6 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj7 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj8 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //var obj9 = {
    //    CountTracking: 19,
    //    Id: 75,
    //    Skype: "pegasus.iiii",
    //    UserName: "supporter2222",
    //}
    //$scope.supporters.push(obj1);
    //$scope.supporters.push(obj2);
    //$scope.supporters.push(obj3);
    //$scope.supporters.push(obj4);
    //$scope.supporters.push(obj5);
    //$scope.supporters.push(obj6);
    //$scope.supporters.push(obj7);
    //$scope.supporters.push(obj8);
    //$scope.supporters.push(obj9);
});