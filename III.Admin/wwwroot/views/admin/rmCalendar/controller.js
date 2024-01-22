var ctxfolder = "/views/admin/RMCalendar";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ui.calendar']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }


    var submitFormUpload = function (url, data, callback) {

        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("Id", data.Id);
        formData.append("Company_Code", data.Company_Code);
        formData.append("Driver_Id", data.Driver_Id);
        formData.append("Name", data.Name);
        formData.append("Code", data.Code);
        formData.append("Group", data.Group);
        formData.append("Origin", data.Origin);  
        formData.append("Generic", data.Generic);
        formData.append("License_Plate", data.License_Plate);
        formData.append("Number", data.Number);
        formData.append("Year_Manufacture", data.Year_Manufacture);
        formData.append("Owner_Code", data.Owner_Code);
        formData.append("Category", data.Category);
        formData.append("Weight_Itself", data.Weight_Itself);
        formData.append("Design_Payload", data.Design_Payload);
        formData.append("Payload_Pulled", data.Payload_Pulled);
        formData.append("Payload_Total", data.Payload_Total);
        formData.append("Size_Registry", data.Size_Registry);
        formData.append("Size_Use", data.Size_Use);
        formData.append("Registry_Duration", data.Registry_Duration);
        formData.append("Insurrance_Duration", data.Insurrance_Duration);
        formData.append("Note", data.Note);
        formData.append("Image", data.Image != null && data.Image.length > 0 ? data.Image[0] : null);      
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).success(callback);
    };

    return {
        insert: function (data, callback) {
            submitFormUpload('/Admin/RMparking/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMparking/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/RMparking/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMparking/Delete/' + data).success(callback);
        },
        GetItemDetail: function (data, callback) {
            $http.get('/Admin/RMparking/GetItemDetail/' + data).success(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/RMparking/resort', data).success(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/RMparking/getAll/').success(callback);
        },
        gettreedataDrive: function (callback) {
            $http.post('/Admin/RMparking/gettreedataDrive').success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/RMparking/GetItem/' + data).success(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.validationOptions = {
        rules: {
            Code: {
                required: true,
                maxlength: 255
            },
            CarMaker: {
                required: true,
                maxlength: 255
            },
            TaxiType: {
                required: true,
                maxlength: 255
            },

        },
        messages: {
            Code: {
                required: "Yêu cầu nhập mã đầu kéo.",
                maxlength: "Tiêu đề không vượt quá 50 ký tự."
            },
            CarMaker: {
                required: "Yêu cầu nhập hãng xe.",
                maxlength: "Lỗi nhập giờ."
            },
            TaxiType: {
                required: "Yêu cầu nhập loại xe.",
                maxlength: "Lỗi nhập giá."
            }
        }
    }
    $rootScope.StatusData = [{
        Value: 1,
        Name: 'Hoạt động'
    }, {
        Value: 0,
        Name: 'Ngừng hoạt động'
    }];

});
app.config(function ($routeProvider, $validatorProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
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
});
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        Code: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMparking/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [1, 'asc'])
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
            $compile(angular.element(row).find('input'))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('Mã Đầu Kéo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Tên Đầu Kéo').renderWith(function (data, type) {
        return data;
    }));  
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origin').withTitle('Xuất Xứ').renderWith(function (data, type) {
        return data;
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
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '80'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        if (deleteItems.length > 0) {
            $confirm({ text: 'Bạn có chắc chắn muốn xóa các khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteItems(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger("Không có khoản mục nào được chọn");
        }
    }
    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-edit"></i> Chi tiết đầu kéo';
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: true,
                size: '80',
                resolve: {
                    para: function () {
                        return $itemScope.data.Id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-remove"></i> Xóa khoản mục';
        }, function ($itemScope, $event, model) {

            $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Title, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete($itemScope.data.Id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];

    $scope.search = function () {
        $scope.reload();
    }

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();



    /* event source that pulls from google.com */
    $scope.eventSource = {
        url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
        className: 'gcal-event',           // an option!
        currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events = [
        { title: 'All Day Event', start: new Date(y, m, 1) },
        { title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2) },
        { id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false },
        { id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false },
        { title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false },
        { title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/' }
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
        callback(events);
    };
    /* Change View */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalender = function (calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        debugger
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 500,
            editable: true,
            header: {
                left: 'today prev,next',
                center: 'title',
                right: 'month basicWeek basicDay /*agendaWeek agendaDay*/'
            },
            eventClick: function (event) {
                debugger
                $scope.model.title = event.title;
                $scope.model.start = event.start;
                $scope.model.end = event.end;
            },
           /// eventClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: function (eventevent, delta, revertFunc, jsEvent, ui, view) {

            }
        }
    };



    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];


    $scope.submit = function (rs) {
        $scope.events.push({
            title: $scope.model.title,
            start: $scope.model.start,
            end: $scope.model.end,
        }); 
        $scope.model.title = '';
        $scope.model.start = '',
        $scope.model.end=''
    }
   
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.initData = function () {
        dataservice.gettreedataDrive(function (result) {
            $scope.treeDataDrive = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError("Maximum allowed file size is 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 1000 || height > 1000) {
                                    App.toastrError("Maximum allowed file size is (1000px x 1000px)!");
                                } else {
                                    console.log('Click')

                                    dataservice.insert($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                            };
                        }
                    }
                }
            } else {
                console.log('Click else')


                dataservice.insert($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }









});

//app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.initData = function () {
//        dataservice.getItem(para, function (rs) {
//            if (rs.Error) {
//                App.notifyDanger(rs.Title);
//            } else {
//                $scope.model = rs;
//            }
//        });
//    }
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.gettreedataDrive(function (result) {
            $scope.treeDataDrive = result.Object;
        });
    }
    $scope.initData();


    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Format required is png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger("Maximum allowed file size is 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 1000 || height > 1000) {
                                    App.notifyDanger("Maximum allowed file size is (1000px x 1000px)!");
                                } else {
                                    console.log('Click')

                                    dataservice.update($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                            };
                        }
                    }
                }
            } else {
                console.log('Click else')


                dataservice.update($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }

    //$scope.submit = function () {
    //    if ($scope.editform.validate()) {
    //        debugger
    //        var fileName = $('input[type=file]').val();
    //        //   console.log("ngafileName" + fileName);
    //        var idxDot = fileName.lastIndexOf(".") + 1;
    //        //  console.log("ngaidxDot" + idxDot);
    //        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    //        console.log('Name File: ' + extFile);
    //        if (extFile != "") {
    //            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
    //                App.toastrError("Format required is png, jpg, jpeg, gif, bmp!");
    //            } else {
    //                var fi = document.getElementById('file');
    //                var fsize = (fi.files.item(0).size) / 1024;
    //                if (fsize > 1024) {
    //                    App.toastrError("Maximum allowed file size is 1 MB !");
    //                } else {
    //                    var fileUpload = $("#file")[0];
    //                    var reader = new FileReader();
    //                    reader.readAsDataURL(fileUpload.files[0]);
    //                    reader.onload = function (e) {
    //                        //Initiate the JavaScript Image object.
    //                        var image = new Image();
    //                        //Set the Base64 string return from FileReader as source.
    //                        image.src = e.target.result;
    //                        image.onload = function () {
    //                            //Determine the Height and Width.
    //                            var height = this.height;
    //                            var width = this.width;
    //                            if (width > 1000 || height > 1000) {
    //                                App.toastrError("Maximum allowed file size is (1000px x 1000px)!");
    //                            } else {
    //                                console.log('Click')
    //                                dataservice.update($scope.model, function (rs) {
    //                                    console.log("rs ne:: " + JSON.stringify(rs))
    //                                    if (rs.Error) {
    //                                        App.toastrError(rs.Title);
    //                                    } else {
    //                                        App.notifyInfo(rs.Title);
    //                                        console.log('Click')
    //                                        $uibModalInstance.close();
    //                                    }
    //                                });
    //                            }
    //                        };
    //                    }
    //                }
    //            }
    //        } else {
    //            console.log('Click else')
    //            dataservice.update($scope.model, function (rs) {
    //                console.log("rs ne:: " + JSON.stringify(rs))
    //                if (rs.Error) {
    //                    App.toastrError(rs.Title);
    //                } else {

    //                    App.notifyInfo(rs.Title);
    //                    $uibModalInstance.close();
    //                }
    //            });
    //        }
    //    }
    //}








});

