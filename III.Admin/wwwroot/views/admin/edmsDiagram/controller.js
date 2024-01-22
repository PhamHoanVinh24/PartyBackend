var ctxfolder = "/views/admin/edmsDiagram";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput']);
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }

    return {

    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSSendRequestProfile/JTable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Tên tệp').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('Đơn vị').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMS_DIAGRAM_COL_FROM_DATE"| translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMS_DIAGRAM_COL_TO_DATE"| translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Sender').withTitle('{{"EDMS_DIAGRAM_COL_SENDER"| translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"EDMS_DIAGRAM_COL_CODE"| translate}}').renderWith(function (data, type) {
        return '<img src="../../../images/default/qrCode.png" height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDMS_DIAGRAM_COL_ACTION"| translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.listWareHouse = [];
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];
    $scope.listBox = [];
    $scope.listBook = [];

    for (var w = 1; w < 2; w++) {
        $scope.wareHouse = {
            id: w,
            whs_code: 'WH' + w,
            qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
            whs_name: 'Kho phần mềm quang trung',
            whs_note: '',
            whs_area_square: '300m2',
            whs_cnt_floor: 3,
            whs_addr_text: 'Phường Tân Chánh Hiệp, Quận 12, thành phố Hồ Chí Minh',
            whs_addr_gps: '',
            whs_avatar: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
            img_whs: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
            whs_tags: 'quang trung',
            whs_design_map: 'https://www.qtsc.com.vn/uploads/files/2018/03/09/logo.png',
            created_by: '',
            updated_by: '',
            created_time: '',
            updated_time: '',
            whs_flag: 1,
            whs_status: 'Hoạt động',
            manager_id: 2,
            listFloor: []
        }

        $scope.listWareHouse.push($scope.wareHouse);
    }

    for (var wh = 0; wh < $scope.listWareHouse.length; wh++) {
        for (var i = 1; i < 3; i++) {
            $scope.floor = {
                id: i,
                floor_code: 'T' + i,
                floor_name: 'Tầng ' + i,
                map_design: 'https://www.kientrucadong.com/diendan/wp-content/uploads/2017/03/ban-ve-biet-thu-2-tang-4.jpg',
                image: '',
                area_square: i * 60 + ' m2',
                qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                cnt_line: 12,
                status: 'Hoạt động',
                whs_code: wh,
                manager_id: 132,
                selected: i == 1 ? true : false,
                note: '',
                listLine: []
            }

            $scope.listFloor.push($scope.floor);
        }
    }

    for (var i = 0; i < $scope.listWareHouse.length; i++) {
        var a = $filter('filter')($scope.listFloor, { whs_code: $scope.listWareHouse[i].id });
        $scope.listWareHouse[i].listFloor.push(a);
    }

    for (var i = 0; i < $scope.listFloor.length; i++) {
        if (i == 0) {
            for (var j = 1; j < 40; j++) {
                $scope.line = {
                    id: j,
                    line_code: 'D' + j,
                    l_text: 'Dãy ' + j,
                    floor_code: $scope.listFloor[i].floor_code,
                    qrCode: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                    l_postion: '',
                    l_size: '',
                    l_color: 'Đỏ',
                    l_status: 'Đầy',
                    cnt_rack: 2,
                    note: '',
                    listRack: []
                }

                $scope.listLine.push($scope.line);
            }
        }
    }

    for (var i = 0; i < $scope.listFloor.length; i++) {
        var a = $scope.listLine.filter(k => k.floor_code === $scope.listLine[i].floor_code);
        $scope.listFloor[i].listLine.push(a);
    }

    for (var i = 0; i < $scope.listLine.length; i++) {
        for (var k = 1; k < 3; k++) {
            $scope.rack = {
                id: k,
                qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                rack_code: 'K' + k,
                rack_name: k == 1 ? 'Kệ ' + k : 'Kệ trống',
                r_size: '10x10x20 m2',
                material: 'Nhựa',
                cnt_cell: k,
                r_status: k == 1 ? 'Full' : 'Emty',
                r_position: '',
                cnt_box: 32,
                line_code: $scope.listLine[i].line_code,
                listBox: []
            }
            $scope.listRack.push($scope.rack);
        }
    }

    for (var i = 0; i < $scope.listLine.length; i++) {
        var a = $scope.listRack.filter(k => k.line_code === $scope.listLine[i].line_code);
        $scope.listLine[i].listRack.push(a);
    }

    for (var i = 0; i < $scope.listRack.length; i++) {
        if (i == 0) {
            for (var b = 1; b < 31; b++) {
                $scope.box = {
                    id: b,
                    box_code: 'BOX_' + b,
                    qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
                    depart_code: '',
                    type_profile: b % 2 == 0 ? 'Hồ sơ chứng từ' : 'Thùng Trống',
                    box_size: '35x65 cm2',
                    m_cnt_brief: 20,
                    cnt_brief: 15,
                    cnt_cell: b,
                    start_time: '25/01/2019',
                    num_boxth: k * 10,
                    time_storage: '5 năm',
                    lst_member_id: '',
                    status_box: b % 2 == 0 ? 'Full' : 'Emty',
                    whs_code: 1 + k,
                    floor_code: 2 + k,
                    line_code: 2 + k,
                    rack_code: $scope.listRack[i].rack_code,
                    note: '',
                    listBook: []
                }

                $scope.listBox.push($scope.box);
            }
        }
    }

    for (var i = 0; i < $scope.listRack.length; i++) {
        var a = $scope.listBox.filter(k => k.rack_code === $scope.listRack[i].rack_code);
        $scope.listRack[i].listBox.push(a);
    }

    for (var b = 0; b < 32; b++) {
        $scope.book = {
            id: b,
            box_code: 'B' + b,
            qr_code: 'https://1.bp.blogspot.com/-lgnm_zSrQ6E/Tb6lJ-RF4UI/AAAAAAAAACQ/rELLdDxLxMs/s1600/qr-code.png',
            depart_code: '',
            type_profile: 'Hồ sơ chứng từ',
            box_size: '35x65 cm2',
            m_cnt_brief: 20,
            cnt_brief: 15,
            cnt_cell: b,
            start_time: '25/01/2019',
            num_boxth: k * 10,
            time_storage: '5 năm',
            lst_member_id: '',
            status_box: 'Đầy',
            whs_code: 1 + k,
            floor_code: 2 + k,
            line_code: 2 + k,
            rack_code: 4 + k,
            note: ''
        }
    }


    var floors = $scope.listFloor;
    var lines = $scope.listLine;
    var racks = $scope.listRack;
    var boxs = $scope.listBox;

    setTimeout(function () {
        $(".line").addClass('hideLine');
        $(".rack-item").click(function () {
            var id = this.id;
            var text = this.innerText;
            $('.numberRack').text(text)
            $(".listBox").removeClass('hideBox');
            $(".listBox").addClass('showBox');
        });

        $(".et-train-head").click(function () {
            var id = this.id;
            var text = this.innerText;
            $('div.di').removeClass('et-train-head-selected');
            $('#' + id).addClass('et-train-head-selected');

            $(".line").removeClass('showLine');
            $(".line").addClass('hideLine');
            $(".listBox").removeClass('showBox');
            $(".listBox").addClass('hideBox');

            $('.numberFloor').text(text)
            $(".listLine").removeClass('hideLine');
            $(".listLine").addClass('showLine');
            $("#listLine_" + id).removeClass('hideLine');
            $("#listLine_" + id).addClass('showLine');
        });

        var clicked = false, clickY, clickX;
        $(".et-car-floor").click(function () {
            $(document).on({
                'mousemove': function (e) {
                    clicked && updateScrollPos(e);
                },
                'mousedown': function (e) {
                    clicked = true;
                    clickY = e.pageY;
                    clickX = e.pageX;
                },
                'mouseup': function () {
                    clicked = false;
                    $('.et-car-floor').css('cursor', 'auto');
                }
            });
        });

        var updateScrollPos = function (e) {
            $('.et-car-floor').css('cursor', 'row-resize');
            console.log("Chiều ngang:" + $('.et-car-floor').scrollTop() + (clickY - e.pageY) + "Chiều dọc:" + $('.et-car-floor').scrollTop() + (clickY - e.pageY));
            $('.et-car-floor').scrollTop($('.et-car-floor').scrollTop() + (clickY - e.pageY));
            $('.et-car-floor').scrollLeft($('.et-car-floor').scrollLeft() + (clickX - e.pageX));
        }

    }, 200);

    $scope.gadient = function () {
        var c = document.getElementById("gadient");
        var ctx = c.getContext("2d");

        // Create gradient
        var grd = ctx.createLinearGradient(0, 0, 200, 0);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "white");

        // Fill with gradient
        ctx.fillStyle = grd;
        ctx.fillRect(10, 10, 150, 80);
    }

    $scope.rectangle = function () {
        var canvas = document.getElementById("rectangle");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(10, 20, 100, 100);

        var ctx1 = canvas.getContext("2d");
        ctx1.fillStyle = "#2980b9";
        ctx1.fillRect(110, 220, 100, 100);
    }

    $scope.circle = function () {
        var canvas = document.getElementById("circle");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(95, 50, 40, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt)) {
            /* if present, the header is where you move the DIV from:*/
            document.getElementById(elmnt).onmousedown = dragMouseDown;
        } else {
            /* otherwise, move the DIV from anywhere inside the DIV:*/
            elmnt.onmousedown = dragMouseDown;
        }

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
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    $scope.moveDiv = function (element) {
        var mousePosition;
        var offset = [0, 0];
        var div;
        var isDown = false;

        var gadient = document.getElementById("gadient");

        div = document.createElement("div");
        div.className = "text-center";
        div.textContent = "Dãy 1";
        div.style.position = "absolute";
        div.style.left = "0px";
        div.style.top = "0px";
        div.style.width = "100px";
        div.style.height = "100px";
        div.style.background = "red";
        div.style.color = "blue";

        gadient.appendChild(div);

        gadient.addEventListener('mousedown', function (e) {
            isDown = true;
            offset = [
                div.offsetLeft - e.clientX,
                div.offsetTop - e.clientY
            ];
        }, true);

        document.addEventListener('mouseup', function () {
            isDown = false;
        }, true);

        document.addEventListener('mousemove', function (event) {
            event.preventDefault();
            if (isDown) {
                mousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };

                var left = (mousePosition.x + offset[0]) < 0 ? 0 : (mousePosition.x + offset[0]);
                var top = (mousePosition.y + offset[1]) < 0 ? 0 : (mousePosition.y + offset[1]);
                left = left > 300 ? 300 : left;
                top = top > 100 ? 100 : top;
                div.style.left = left + 'px';
                div.style.top = top + 'px';
            }
        }, true);
    }

    $scope.draw = function () {
        //$scope.gadient();
        $scope.rectangle();
        $scope.circle();
    }

    //$scope.draw();
    //$scope.moveDiv();

});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});




