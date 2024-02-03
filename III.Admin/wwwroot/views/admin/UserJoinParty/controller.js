var ctxfolder = "/views/admin/UserJoinParty";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        viewFileOnline: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/ViewFileOnline', data).then(callback);
        },
        //InsertFamily
        insertFamily: function (data, callback) {
            $http.post('/UserProfile/InsertFamily2/', data).then(callback); 
        },
        getFamilyByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetFamilyByProfileCode/', data).then(callback); 
        },

        updateFamily: function (data, callback) {
            $http.post('/UserProfile/UpdateFamily/', data).then(callback); 
        },
        //PartyAdmissionProfile

        getPersonalHistoryByResumeNumber: function (data, callback) {
        // console.log($http.get('/UserProfile/GetPersonalHistoryByProfileCode?profileCode=' + data))
            $http.post('/UserProfile/GetPersonalHistoryById?Id=' + data).then(callback);
        },
        GetPartyAdmissionProfileByResumeNumber: function (data, callback) {
            $http.get('/UserProfile/GetPartyAdmissionProfileByResumeNumber?resumeNumber=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/UserProfile/InsertPartyAdmissionProfile/', data).then(callback);
            
        },
        update: function (data, callback) {
            $http.put('/UserProfile/UpdatePartyAdmissionProfile/', data).then(callback);
            
        },
        delete: function (data, callback) {
            $http.delete('/UserProfile/DeletePartyAdmissionProfile/', data).then(callback);
        },
        

        //BusinessNDuty
        getBusinessNDutyById: function (data, callback) {
            $http.post('/UserProfile/GetWorkingTrackingById?id=', data).then(callback);  
        },
        insertBusinessNDuty: function (data, callback) {
            $http.post('/UserProfile/InsertWorkingTracking/', data).then(callback); 
        },
        updateWorkingTracking: function (data, callback) {
            $http.post('/UserProfile/UpdateWorkingTracking/', data).then(callback);  
        },
        deleteBusinessNDuty: function (data, callback) {
            $http.delete('/UserProfile/DeleteWorkingTracking/', data).then(callback);  
        },

        //HistorySpecialist
        getHistorySpecialistById: function (data, callback) {
            $http.post('/UserProfile/GetHistorySpecialistById?id=', data).then(callback);  
        },
        insertHistorySpecialist: function (data, callback) {
            $http.post('/UserProfile/InsertHistorysSpecialist/', data).then(callback); 
        },
        updateHistorySpecialist: function (data, callback) {
            $http.post('/UserProfile/UpdateHistorySpecialist/', data).then(callback);  
        },
        deleteHistorySpecialist: function (data, callback) {
            $http.delete('/UserProfile/DeleteHistorysSpecialist/', data).then(callback);  
        },

        //award 
        getAwardById: function (data, callback) {
            $http.post('/UserProfile/GetAwardById?id=', data).then(callback);  
        },
        getAwardByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetAwardByProfileCode?profileCode=', data).then(callback);  
        },
        insertAwards: function (data, callback) {
            $http.post('/UserProfile/InsertAward/', data).then(callback); 
        },
        updateAward: function (data, callback) {
            $http.post('/UserProfile/UpdateAward/', data).then(callback);  
        },
        deleteAward: function (data, callback) {
            $http.delete('/UserProfile/DeleteAward/', data).then(callback);  
        },

        //WarningDisciplined
        getWarningDisciplinedById: function (data, callback) {
            $http.post('/UserProfile/GetWarningDisciplinedById?id=', data).then(callback);  
        },
        updateWarningDisciplined: function (data, callback) {
            $http.post('/UserProfile/UpdateWarningDisciplined/', data).then(callback);  
        },
        deleteWarningDisciplined: function (data, callback) {
            $http.delete('/UserProfile/DeleteWarningDisciplined/', data).then(callback);  
        },

        //TrainingCertificatedPass
        getTrainingCertificatedPassById: function (data, callback) {
            $http.post('/UserProfile/GetTrainingCertificatedPassById?id=', data).then(callback);  
        },
        insertTrainingCertificatedPass: function (data, callback) {
            $http.post('/UserProfile/InsertTrainingCertificatedPass/', data).then(callback); 
        },
        updateTrainingCertificatedPass: function (data, callback) {
            $http.post('/UserProfile/UpdateTrainingCertificatedPass/', data).then(callback);  
        },
        deleteTrainingCertificatedPass: function (data, callback) {
            $http.delete('/UserProfile/DeleteTrainingCertificatedPass/', data).then(callback);  
        },

        //Ngưới giới thiệu
        insertIntroducer: function (data, callback) {
            $http.post('/UserProfile/InsertIntroduceOfParty/', data).then(callback);
        
        },
        updateIntroducer: function (data, callback) {
            $http.post('/UserProfile/UpdateIntroduceOfParty/', data).then(callback);

        },

        //lịch sử bản thân
        insertPersonalHistory: function (data, callback) {
            $http.post('/Admin/UserJoinParty/InsertPersonalHistory', data).then(callback);
        },
        insertPersonalHistorys: function (data, callback) {
            $http.post('/UserProfile/InsertPersonalHistory', data).then(callback);
        },
        updatePersonalHistory: function (data, callback) {
            $http.post('/Admin/UserJoinParty/UpdatePersonalHistory', data).then(callback);
        },
        getPersonalHistoryByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetPersonalHistoryByProfileCode?profileCode=', data).then(callback);  
        },

        //WarningDisciplined
        insertWarningDisciplined: function (data, callback) {
            $http.post('/UserProfile/InsertWarningDisciplined/', data).then(callback);

        },

        //Đi du lịch
        
        insertGoAboards: function (data, callback) {
            $http.post('/UserProfile/InsertGoAboard/', data).then(callback);
        },
        
        insertGoAboard: function (data, callback) {
            $http.post('/UserProfile/InsertGoAboardOnly/', data).then(callback);
        },

        updateGoAboard: function (data, callback) {
            $http.post('/UserProfile/UpdateGoAboard/', data).then(callback);

        },

        //Khen hưởng
        insertAwardAndUpdate: function (data, callback) {
            $http.post('/Admin/UserJoinParty/InsertAwardOnly', data).then(callback); 
        },
    }
});


app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CatCode)) {
                mess.Status = true;
                mess.Title = mess.Title.CatCode(" - ", "{{'CEF_MSG_TITLE_ERR' | translate}}", "<br/>");
            }
            //if (!partternName.test(data.CatName)) {
            //    mess.Status = true;
            //    mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.AA_CURD_LBL_AA_ACTTITLE) + "<br/>";
            //    //mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_USERNAME) + "<br/>";
            //}
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                },
                InventoryCode: {
                    required: true,
                },
                AuditFrom: {
                    required: true,
                },
                AuditTo: {
                    required: true,
                },
                Auditors: {
                    required: true,
                },
                Status: {
                    required: true,
                },
            },
            messages: {
                Name: {
                    required: caption.AU_VALIDATE_NAME_INPUT,
                    //required: caption.CEF_VALIDATE_NAME,
                },
                Title: {
                    required: caption.AU_VALIDATE_TITLE_INPUT,
                },
                InventoryCode: {
                    required: caption.AU_VALIDATE_INVENTORY_INPUT,
                },
                AuditFrom: {
                    required: caption.AU_VALIDATE_TIME_INPUT,
                },
                AuditTo: {
                    required: caption.AU_VALIDATE_TIME_INPUT,
                },
                Auditors: {
                    required:  caption.AU_VALIDATE_STAFF_INPUT,
                },
                Status: {
                    required:  caption.AU_VALIDATE_STATUS_INPUT,
                },
            }
        }
        $rootScope.validation2Options = {
            rules: {
                Quantity: {
                    required: true,
                },
            },
            messages: {
                Quantity: {
                    required: "Số lượng không được bỏ trống ",
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/InventoryAudit/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
    .when('/', {
        templateUrl: ctxfolder + '/index.html',
        controller: 'index'
    })
    .when('/edit/:resumeNumber', {
        templateUrl: ctxfolder + '/edit.html',
        controller: 'edit'
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
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $translate) {
    var vm = $scope;
    
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    
    $scope.isEditWorkflow = false;
    $scope.editWorkflow = function(){
        $scope.isEditWorkflow = !$scope.isEditWorkflow;
        if ($scope.isEditWorkflow == true) {
            $('#main-table').css('width', '1200px');
        }else{
            $('#main-table').css('width', '');
        }
        
        setTimeout(() => $scope.$apply());
    }
    
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
   
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

    
    $scope.delete = function (id) {
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeletePartyAdmissionProfile?id=" + Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }

    $scope.reload = function () {
        reloadData(true);
        ("th").addClass('text-center fw600')
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getCatId(function (rs) {
            rs = rs.data;

            $scope.listModuleId = rs;
        });

    };

    $scope.delete = function (id) {
       
    };
    $scope.edit=function(id){
        $location.path('/edit/'+id);
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UserJoinParty/JTable2",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate='',
                d.ToDate=''
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                } else {
                    $('#tblDataEmployee').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withOption('sClass', 'hidden').withTitle(titleHtml).renderWith(function (data, type) {
        $scope.selected[data] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + data + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('stt').withOption('sClass', 'wpercent1').withTitle('{{"Stt" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CurrentName').withOption('sClass', '').withTitle('{{"Mã và tên" | translate}}')
    .renderWith(function (data, type,full) {
        return `<p class="bold"><span style="color: blue">[Mã: ${full.Username}]</span> ${data}</p>`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withOption('sClass', '').withTitle('{{"Người tạo" | translate}}').renderWith(function (data, type) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', '').withTitle('{{"Trạng thái" | translate}}').renderWith(function (data, type) {
        return data
    }));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('resumeNumber').withOption('sClass', '').withTitle('{{"File" | translate}}').renderWith(function (data, type) {
        return data
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', ' w50 nowrap')
        .withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" class="width: 25px; height: 25px; padding: 0px" '
            +'ng-click="edit('+"'" + full.resumeNumber + "'" +')"><i class="fa-solid fa-edit  fs25"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" class="width: 25px; height: 25px; padding: 0px"'+
                ' ng-click="delete(' + full.Id + ')"><i class="fa-solid fa-trash  fs25"></i></a>';
        }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    setTimeout(function () {
    }, 200);
    $("#PostFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostToDate').datepicker('setStartDate', maxDate);
    });
    $("#PostToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostFromDate').datepicker('setEndDate', maxDate);
    });
});

app.controller('file-version', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    };
    $scope.ObjCode = $rootScope.ObjCode;

    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataContractFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id === id) {
                userModel = listdata[i];
                break;
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {

            if (userModel.SizeOfFile < 20971520) {
                dataservice.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Docman#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Docman#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.CONTRACT_LBL_FILE_LIMIT_SIZE);
            }
        }
    };

    $scope.viewFile = function (id) {
        if ($rootScope.IsLock) {
            return App.toastrError(caption.WFAI_MSG_ACT_IS_LOCKED);
        }

        var model = {};
        var listdata = $('#tblDataFileVersion').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].ID === id + '') {
                model = listdata[i];
                break;
            }
        }

        var data = {
            ActInstCode: $rootScope.ObjCode,
            FileCode: model.FileID,
            Url: model.Url,
            IsSign: false,
            Mode: 1
        };

        var extension = data.Url.substr(data.Url.lastIndexOf('.') + 1);
        var word = ['DOCX', 'DOC'];
        var pdf = ['PDF'];
        var excel = ['XLS', 'XLSX'];
        if (word.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/Admin/Docman#', '_blank');
            });
        }
        else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/Admin/PDF#', '_blank');
            });
        }
        else if (excel.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/Admin/Excel#', '_blank');
            });
        }
        else {
            window.open(url, '_blank');
        }
    };
});

app.controller('edit', function ($scope, $rootScope, $compile, $routeParams, dataservice, $filter,$http) {   
    $scope.initData=function(){
        //Thêm data vào PersonalHistory
        $scope.PersonalHistory = [];

        $scope.infUser = {
            LevelEducation: {
                Undergraduate: [],
                PoliticalTheory: [],
                ForeignLanguage: [],
                It: [],
                MinorityLanguage: []
            },
        }
        //lịch sử bản thân
        $scope.PersonalHistory = [];
        //quá trình công tác
        $scope.BusinessNDuty = [];
        //di nước ngoài
        $scope.GoAboard = [];
        //Những lớp đào tạo
        $scope.PassedTrainingClasses = [];
        //đạc điểm lịch sử
        $scope.HistoricalFeatures = [];
        //khen thưởng
        $scope.Laudatory = [];
        //Kỷ luật
        $scope.Disciplined = [];
        //quan hệ gia đình
        $scope.Relationship = [];
        $scope.SelfComment={};
        function DateParse(rs){
            var date = new Date(rs);
            var day = date.getDate();
            var month = date.getMonth() + 1; // Tháng bắt đầu từ 0
            var year = date.getFullYear();
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            return day + '-' + month + '-' + year;
        }
        $scope.PlaceCreatedTime={}
            dataservice.GetPartyAdmissionProfileByResumeNumber($routeParams.resumeNumber, function(rs){
                rs = rs.data;
                $scope.infUser.LastName = rs.CurrentName;
            
                $scope.infUser.Birthday = DateParse(rs.Birthday)
                $scope.infUser.FirstName = rs.BirthName;
                
                $scope.infUser.Sex = rs.Gender == 0?"Nam" : "Nữ";
                $scope.infUser.Nation = rs.Nation;
                $scope.infUser.Religion = rs.Religion;
                $scope.infUser.Residence = rs.PermanentResidence;
                $scope.infUser.Phone = rs.Phone;
                $scope.infUser.PlaceofBirth = rs.PlaceBirth;
                $scope.infUser.NowEmployee = rs.Job;
                $scope.infUser.HomeTown = rs.HomeTown;
                $scope.infUser.TemporaryAddress =rs.TemporaryAddress;
                $scope.infUser.LevelEducation.GeneralEducation =  rs.GeneralEducation;
                $scope.infUser.LevelEducation.VocationalTraining = rs.JobEducation;
                $scope.infUser.LevelEducation.Undergraduate = rs.UnderPostGraduateEducation;
                $scope.infUser.LevelEducation.RankAcademic = rs.Degree;
                
                $scope.infUser.LevelEducation.ForeignLanguage = rs.ForeignLanguage;
                $scope.infUser.LevelEducation.MinorityLanguage =  rs.MinorityLanguages;
                $scope.infUser.LevelEducation.It = rs.ItDegree;
                $scope.infUser.LevelEducation.PoliticalTheory = rs.PoliticalTheory ;
                $scope.SelfComment.context = rs.SelfComment;
                $scope.PlaceCreatedTime.place =rs.CreatedPlace;
                $scope.infUser.ResumeNumber =  rs.ResumeNumber;
                $scope.Username=rs.Username;
                console.log($scope.infUser);
                //Get By Profilecode
                $scope.getFamilyByProfileCode()
                $scope.getPersonalHistoryByProfileCode()

                $scope.getGoAboardByProfileCode()
                $scope.getAwardByProfileCode()

                $scope.getWorkingTrackingByProfileCode()
                $scope.getHistorySpecialistByProfileCode()

                $scope.getTrainingCertificatedPassByProfileCode()

                $scope.getWarningDisciplinedByProfileCode()
                $scope.Introducer = {};

                $scope.getIntroducerOfPartyByProfileCode()
                setTimeout(function () {
                    $("#PersonalHistorysFromDate").datepicker({
                        inline: false,
                        autoclose: true,
                        format: "dd-mm-yyyy",
                        fontAwesome: true,
                    }).on('changeDate', function (selected) {
                        var maxDate = new Date(selected.date.valueOf());
                        $('#PersonalHistorysToDate').datepicker('setStartDate', maxDate);
                    });
                    $("#PersonalHistorysToDate").datepicker({
                        inline: false,
                        autoclose: true,
                        format: "dd-mm-yyyy",
                        fontAwesome: true,
                    }).on('changeDate', function (selected) {
                        var maxDate = new Date(selected.date.valueOf());
                        $('#PersonalHistorysFromDate').datepicker('setEndDate', maxDate);
                    });
                    
                }, 500);
                
            })

    }
    $scope.initData();

    $scope.senddata = function () {
        var data = $rootScope.ProjectCode;
        $rootScope.$emit('eventName', data);
    }

    //Lịch sử bản thân
    $scope.selectedPersonHistory={}

    $scope.selectPersonHistory = function (x) {
        $scope.selectedPersonHistory=x;
    };
    
    $scope.addToPersonalHistory = function () {
        var model = {}
        model.Begin = $scope.selectedPersonHistory.Begin
        model.End = $scope.selectedPersonHistory.End
        model.Content = $scope.selectedPersonHistory.Content
        model.Id=0;
        model.ProfileCode= $scope.selectedPersonHistory.ProfileCode;

        $scope.PersonalHistory.push(model);
    }

    $scope.submitPersonalHistorys = function () {
        $scope.model = [];
        $scope.PersonalHistory.forEach(function (personalHistory) {
            var obj = {};
            obj.Begin = personalHistory.Begin;
            obj.End = personalHistory.End;
            obj.Content = personalHistory.Content;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id=personalHistory.Id;
            $scope.model.push(obj)
        });
        dataservice.insertPersonalHistorys($scope.model, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
            }
        });

        console.log($scope.model);
    }
    $scope.deletePesonalHistory = function (index) {
        if($scope.PersonalHistory[index].Id == undefined || $scope.PersonalHistory[index].Id == 0 ) 
        {
            $scope.PersonalHistory.splice(index,1);
        }
        else
        {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeletePersonalHistory?id=" + $scope.PersonalHistory[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.PersonalHistory.splice(index,1);
                        $scope.$apply()
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.submitDisciplined = function () {
        console.log($scope.Disciplined)
        $scope.model = [];
    
        $scope.Disciplined.forEach(function (e) {
            var obj = {};
            obj.MonthYear = e.MonthYear;
            obj.Reason = e.Reason;
            obj.GrantOfDecision = e.GrantOfDecision;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id=e.Id;
            $scope.model.push(obj)
        });
        
        dataservice.insertWarningDisciplined($scope.model, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                $scope.getGoAboardByProfileCode();
            }
        })
    }
    $scope.submitTrainingCertificatedPass = function () {
        $scope.model = [];
        $scope.PassedTrainingClasses.forEach(function (passedTrainingClasses) {
            var obj = {};
            obj.SchoolName = passedTrainingClasses.SchoolName;
            obj.Class = passedTrainingClasses.Class;
            obj.From = passedTrainingClasses.From;
            obj.To = passedTrainingClasses.To;
            obj.Certificate = passedTrainingClasses.Certificate;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id = passedTrainingClasses.Id;
            $scope.model.push(obj)
        });
       
        
            dataservice.insertTrainingCertificatedPass($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        
        console.log($scope.model);
    }
    $scope.getPersonalHistoryByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetPersonalHistoryByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.PersonalHistory = result;
                $scope.$apply()
                setTimeout(function(){
                    
                },500)
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }

    //Đi nước ngoài
    $scope.selectedGoAboard={}
    
    
    $scope.getGoAboardByProfileCode = function () {
        $.ajax({
            type: "GET",
            url: "/UserProfile/GetGoAboardByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                $scope.GoAboard = result;
                $scope.$apply();
                console.log($scope.GoAboard);
            },
            error: function (error) {
                console.log(error);
            }
        });   
    }
    
    $scope.deleteGoAboard = function (index) {
        if($scope.GoAboard[index].Id == undefined || $scope.GoAboard[index].Id == 0){
            $scope.GoAboard.splice(index,1);
        }
        else{
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteGoAboard?id=" + $scope.GoAboard[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.GoAboard.splice(index,1);
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
           
    }

    //Khen thưởng

    $scope.selectedLaudatory = {};
    
    $scope.selectLaudatory = function (x) {
        $scope.selectedLaudatory = x;
    };
    
    $scope.getAwardByProfileCode = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetAwardByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                $scope.Laudatory = result;
                $scope.$apply();
                console.log($scope.Laudatory);
            },
            error: function (error) {
                console.log(error);
            }
        });
    }

    //submit
    
    $scope.insertFamily = function () {
        $scope.model = [];
        
        $scope.Relationship.forEach(function (e) {
            var obj = {};
            obj.Relation = e.Relation;
            obj.PartyMember = e.PartyMember;
            obj.Name = e.Name;
            obj.BirthYear = e.BirthYear;
            obj.Residence = e.Residence;
            obj.PoliticalAttitude = e.PoliticalAttitude;
            obj.HomeTown = e.HomeTown;
            obj.Job = e.Job;
            obj.WorkingProgress = e.WorkingProgress;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id=e.Id;
            $scope.model.push(obj)
        });
            dataservice.insertFamily($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        
        console.log($scope.model);
    }
    $scope.submitGoAboard = function () {
        $scope.model = [];
        $scope.GoAboard.forEach(function (e) {
            var obj = {};
            obj.From = e.From;
            obj.To = e.To;
            obj.Contact = e.Contact;
            obj.Country = e.Country;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id = e.Id;
            $scope.model.push(obj)
        });
        dataservice.insertGoAboards($scope.model, function (result) {
            result= result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                $scope.getGoAboardByProfileCode()
            }
        })
    }
    $scope.submitBusinessNDuty = function () {
        $scope.model = [];
        $scope.BusinessNDuty.forEach(function (businessNDuty) {
            var obj = {};
            obj.From = businessNDuty.From;
            obj.To = businessNDuty.To;
            obj.Work = businessNDuty.Work;
            obj.Role = businessNDuty.Role;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id = businessNDuty.Id;
            $scope.model.push(obj)
        });
        dataservice.insertBusinessNDuty($scope.model, function (result) {
            result= result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                $scope.getWorkingTrackingByProfileCode()
            }

        })

        console.log($scope.model);
    }
    
    $scope.submitHistorySpecialist = function () {
        $scope.model = [];
        $scope.HistoricalFeatures.forEach(function (historicalFeatures) {
            var obj = {};
            obj.MonthYear = historicalFeatures.MonthYear;
            obj.Content = historicalFeatures.Content;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id = historicalFeatures.Id;
            $scope.model.push(obj)
        });
        dataservice.insertHistorySpecialist($scope.model, function (result) {
            result= result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.getHistorySpecialistByProfileCode()
                    }
        })
        console.log($scope.model);
    }
    
    $scope.submitAward = function () {
        $scope.model = [];
        $scope.Laudatory.forEach(function (laudatory) {
            var obj = {};
            obj.MonthYear = laudatory.MonthYear;
            obj.Reason = laudatory.Reason;
            obj.GrantOfDecision = laudatory.GrantOfDecision;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            obj.Id = laudatory.Id;
            $scope.model.push(obj)
        });
        dataservice.insertAward($scope.model, function (result) {
            result= result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.getAwardByProfileCode()
                    }
        })
        console.log($scope.model);
    }
    // AdmissionProfile
    $scope.submitPartyAdmissionProfile = function () {
        
        //$http.post('/UserProfile/UpdatePartyAdmissionProfile/', model)
        if($scope.Username!=null && $scope.Username!=undefined){
            $scope.model = {}
                $scope.model.CurrentName = $scope.infUser.LastName;
                $scope.model.Birthday = $scope.infUser.Birthday;
                $scope.model.BirthName = $scope.infUser.FirstName;
                $scope.model.Gender = $scope.infUser.Sex;
                $scope.model.Nation = $scope.infUser.Nation;
                $scope.model.Religion = $scope.infUser.Religion;
                $scope.model.PermanentResidence = $scope.infUser.Residence;
                $scope.model.Phone = $scope.infUser.Phone;
                $scope.model.PlaceBirth = $scope.infUser.PlaceofBirth;
                $scope.model.Job = $scope.infUser.NowEmployee;
                $scope.model.HomeTown = $scope.infUser.HomeTown;
                $scope.model.TemporaryAddress = $scope.infUser.TemporaryAddress;
                $scope.model.GeneralEducation = $scope.infUser.LevelEducation.GeneralEducation;
                $scope.model.JobEducation = $scope.infUser.LevelEducation.VocationalTraining;
                $scope.model.UnderPostGraduateEducation = $scope.infUser.LevelEducation.Undergraduate;
                $scope.model.Degree = $scope.infUser.LevelEducation.RankAcademic;
                $scope.model.Picture = '';
                $scope.model.ForeignLanguage = $scope.infUser.LevelEducation.ForeignLanguage;
                $scope.model.MinorityLanguages = $scope.infUser.LevelEducation.MinorityLanguage;
                $scope.model.ItDegree = $scope.infUser.LevelEducation.It;
                $scope.model.PoliticalTheory = $scope.infUser.LevelEducation.PoliticalTheory;
                $scope.model.SelfComment = $scope.SelfComment.context;
                $scope.model.CreatedPlace = $scope.PlaceCreatedTime.place;
                $scope.model.ResumeNumber = $scope.infUser.ResumeNumber;
                $scope.model.Username=$scope.Username;

            if($scope.infUser.ResumeNumber!='' && $scope.infUser.ResumeNumber!=undefined &&
            $scope.Username!='' && $scope.Username!=undefined){
                console.log($scope.model);
                dataservice.update($scope.model, function (result) {
                    result= result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                    }
                });
            }
            
            console.log($scope.model);
        }
    }
    // //getById
    // $scope.getBusinessNDutyById = function () {
    //     $scope.id = 2;
    //     dataservice.getBusinessNDutyById($scope.id, function (rs) {
    //             rs = rs.data;
    //             console.log(rs.data);
    //         })
    //     console.log($scope.id);
    // }

    // $scope.getHistorySpecialistById = function () {
    //     $scope.id = 2;
    //     dataservice.getHistorySpecialistById($scope.id, function (rs) {
    //             rs = rs.data;
    //             console.log(rs.data);
    //         })
    //     console.log($scope.id);
    // }

    // $scope.getAwardById = function () {
    //     $scope.id = 2;
    //     dataservice.getAwardById($scope.id, function (rs) {
    //             rs = rs.data;
    //             console.log(rs.data);
    //         })
    //     console.log($scope.id);
    // }

    // $scope.getWarningDisciplinedById = function () {
    //     $scope.id = 2;
    //     dataservice.getWarningDisciplinedById($scope.id, function (rs) {
    //             rs = rs.data;
    //             console.log(rs.data);
    //         })
    //     console.log($scope.id);
    // }

    //Get By Profilecode
    $scope.getFamilyByProfileCode = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetFamilyByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                $scope.Relationship = result;
                console.log($scope.Relationship);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }

    $scope.getGoAboardByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetGoAboardByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.GoAboard = result;
                console.log($scope.GoAboard);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    $scope.getWorkingTrackingByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetWorkingTrackingByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.BusinessNDuty = result;
                console.log($scope.BusinessNDuty);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    $scope.getHistorySpecialistByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetHistorySpecialistByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.HistoricalFeatures = result;
                console.log($scope.HistoricalFeatures);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    $scope.getTrainingCertificatedPassByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetTrainingCertificatedPassByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.PassedTrainingClasses = result;
                console.log($scope.PassedTrainingClasses);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    $scope.getWarningDisciplinedByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetWarningDisciplinedByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (result) {
                $scope.Disciplined = result;
                console.log($scope.Disciplined);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    $scope.Introducer = {};
    $scope.getIntroducerOfPartyByProfileCode = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetIntroducerOfPartyByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                $scope.Introducer = result;
                console.log($scope.Introducer);
            },
            error: function (error) {
                console.log(error);
            }
        });
        console.log("Vào");
    }
    //add
    $scope.addToFamily = function () {
        var model = {}
        model.Relation = $scope.selectedFamily.Relation;
        model.Residence = $scope.selectedFamily.Residence;
        model.PartyMember = $scope.selectedFamily.PartyMember;
        model.Name = $scope.selectedFamily.Name;
        model.BirthYear = $scope.selectedFamily.BirthYear;
        model.PoliticalAttitude = $scope.selectedFamily.PoliticalAttitude;
        model.HomeTown = $scope.selectedFamily.HomeTown;
        model.Job = $scope.selectedFamily.Job;
        model.WorkingProgress = $scope.selectedFamily.WorkingProgress;
        model.Id=0;
        $scope.Relationship.push(model);
        $scope.selectedFamily={}
    }
    $scope.addToAward = function () {
        if($scope.selectedLaudatory.MonthYear==null||$scope.selectedLaudatory.MonthYear==undefined||$scope.selectedLaudatory.MonthYear==''){
            return
        }
        if($scope.selectedLaudatory.GrantOfDecision==null||$scope.selectedLaudatory.GrantOfDecision==undefined||$scope.selectedLaudatory.GrantOfDecision==''){
            return
        }
        if($scope.selectedLaudatory.Reason==null||$scope.selectedLaudatory.Reason==undefined||$scope.selectedLaudatory.Reason==''){
            return
        }
        var model = {}
        model.MonthYear = $scope.selectedLaudatory.MonthYear
        model.GrantOfDecision = $scope.selectedLaudatory.GrantOfDecision
        model.Reason = $scope.selectedLaudatory.Reason
        model.ProfileCode = $scope.infUser.ResumeNumber;
        $scope.Laudatory.push(model)
    }
    $scope.addToBusinessNDuty = function () {
        if($scope.selectedWorkingTracking.From==null||$scope.selectedWorkingTracking.From==undefined||$scope.selectedWorkingTracking.From==''){
            return
        }
        if($scope.selectedWorkingTracking.To==null||$scope.selectedWorkingTracking.To==undefined||$scope.selectedWorkingTracking.To==''){
            return
        }
        if($scope.selectedWorkingTracking.Work==null||$scope.selectedWorkingTracking.Work==undefined||$scope.selectedWorkingTracking.Work==''){
            return
        }
        if($scope.selectedWorkingTracking.Role==null||$scope.selectedWorkingTracking.Role==undefined||$scope.selectedWorkingTracking.Role==''){
            return
        }
        var model = {}
        model.From = $scope.selectedWorkingTracking.From
        model.To = $scope.selectedWorkingTracking.To
        model.Work = $scope.selectedWorkingTracking.Work
        model.Role = $scope.selectedWorkingTracking.Role

        model.Id=0;
        $scope.BusinessNDuty.push(model)
    }
    $scope.addToHistorySpecialist = function () {
        
        if($scope.selectedHistorySpecialist.MonthYear==null||$scope.selectedHistorySpecialist.MonthYear==undefined||$scope.selectedHistorySpecialist.MonthYear==''){
            return
        }
        if($scope.selectedHistorySpecialist.Content==null||$scope.selectedHistorySpecialist.Content==undefined||$scope.selectedHistorySpecialist.Content==''){
            return
        }
        var obj = {};
        obj.MonthYear = $scope.selectedHistorySpecialist.MonthYear;
        obj.Content = $scope.selectedHistorySpecialist.Content;
        obj.ProfileCode = $scope.infUser.ResumeNumber;

        obj.Id=0;
        $scope.HistoricalFeatures.push(obj)
    }
    $scope.addToDisciplined = function () {
        
        if($scope.selectedWarningDisciplined.MonthYear==null||$scope.selectedWarningDisciplined.MonthYear==undefined||$scope.selectedWarningDisciplined.MonthYear==''){
            return
        }
        if($scope.selectedWarningDisciplined.Reason==null||$scope.selectedWarningDisciplined.Reason==undefined||$scope.selectedWarningDisciplined.Reason==''){
            return
        }
        if($scope.selectedWarningDisciplined.GrantOfDecision==null||$scope.selectedWarningDisciplined.GrantOfDecision==undefined||$scope.selectedWarningDisciplined.GrantOfDecision==''){
            return
        }
        var obj = {};
        obj.MonthYear = $scope.selectedWarningDisciplined.MonthYear;
        obj.Reason = $scope.selectedWarningDisciplined.Reason;
        obj.GrantOfDecision = $scope.selectedWarningDisciplined.GrantOfDecision;

        obj.ProfileCode = $scope.infUser.ResumeNumber;
        obj.Id=0;
        $scope.Disciplined.push(obj)
    }
    $scope.addToTrainingCertificatedPass = function () {
        
        if($scope.selectedTrainingCertificatedPass.From==null||$scope.selectedTrainingCertificatedPass.From==undefined||$scope.selectedTrainingCertificatedPass.From==''){
            return
        }
        if($scope.selectedTrainingCertificatedPass.To==null||$scope.selectedTrainingCertificatedPass.To==undefined||$scope.selectedTrainingCertificatedPass.To==''){
            return
        }
        if($scope.selectedTrainingCertificatedPass.SchoolName==null||$scope.selectedTrainingCertificatedPass.SchoolName==undefined||$scope.selectedTrainingCertificatedPass.SchoolName==''){
            return
        }
        if($scope.selectedTrainingCertificatedPass.Certificate==null||$scope.selectedTrainingCertificatedPass.Certificate==undefined||$scope.selectedTrainingCertificatedPass.Certificate==''){
            return
        }
        var obj = {};
        obj.From = $scope.selectedTrainingCertificatedPass.From;
        obj.To = $scope.selectedTrainingCertificatedPass.To;
        obj.SchoolName = $scope.selectedTrainingCertificatedPass.SchoolName;
        obj.Class = $scope.selectedTrainingCertificatedPass.Class;
        obj.Certificate = $scope.selectedTrainingCertificatedPass.Certificate;
        
        obj.ProfileCode = $scope.infUser.ResumeNumber;
        obj.Id=0;
        $scope.Disciplined.push(obj)
    }
    $scope.addToGoAboard = function () {
        
        if($scope.selectedGoAboard.From==null||$scope.selectedGoAboard.From==undefined||$scope.selectedGoAboard.From==''){
            return
        }
        if($scope.selectedGoAboard.To==null||$scope.selectedGoAboard.To==undefined||$scope.selectedGoAboard.To==''){
            return
        }
        if($scope.selectedGoAboard.Contact==null||$scope.selectedGoAboard.Contact==undefined||$scope.selectedGoAboard.Contact==''){
            return
        }
        if($scope.selectedGoAboard.Country==null||$scope.selectedGoAboard.Country==undefined||$scope.selectedGoAboard.Country==''){
            return
        }
        var obj = {};
        obj.From = $scope.selectedGoAboard.From;
        obj.To = $scope.selectedGoAboard.To;
        obj.Contact = $scope.selectedGoAboard.Contact;
        obj.Country = $scope.selectedGoAboard.Country;
        
        obj.ProfileCode = $scope.infUser.ResumeNumber;
        obj.Id=0;
        $scope.GoAboard.push(obj)
    }
    
    //Update
    $scope.selectedFamily={};
    $scope.selectedWarningDisciplined = {};
    $scope.selectedHistorySpecialist = {};
    $scope.selectedWorkingTracking = {};
    $scope.selectedTrainingCertificatedPass = {};
    $scope.selectedGoAboard = {};

    $scope.selectFamily = function (x) {
        $scope.selectedFamily = x;
    };
    $scope.selectWarningDisciplined = function (x) {
        $scope.selectedWarningDisciplined = x;
    };
    $scope.selectHistorySpecialist = function (x) {
        $scope.selectedHistorySpecialist = x;
    };
    $scope.selectWorkingTracking = function (x) {
        $scope.selectedWorkingTracking = x;
    };
    $scope.selectTrainingCertificatedPass = function (x) {
        $scope.selectedTrainingCertificatedPass = x;
    };
    $scope.selectGoAboard = function (x) {
        $scope.selectedGoAboard = x;
    };
    
    //Delete
    
    $scope.deleteFamily = function (index) {
            if($scope.Relationship[index].Id == undefined || $scope.Relationship[index].Id == 0 ) {
                $scope.Relationship.splice(index,1);
            }
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteFamily?Id=" + $scope.Relationship[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
                    $scope.Relationship.splice(index,1);
                    $scope.$apply()
                    console.log(response.Title);
                   
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
    }
    $scope.deleteHistorySpecialist = function (index) {
        if ($scope.HistoricalFeatures[index].Id == undefined || $scope.HistoricalFeatures[index].Id == 0){
            $scope.HistoricalFeatures.splice(index,1);
        }else {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteHistorySpecialist?id=" + $scope.HistoricalFeatures[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.HistoricalFeatures.splice(index,1);
                        $scope.$apply()
                    }
                },
                error: function (error) {
                    App.toastrSuccess(error);
                }
            });
        }
    }
    $scope.deleteWarningDisciplined = function (index) {
        if ($scope.Disciplined[index].Id == undefined || $scope.Disciplined[index].Id == 0){
            $scope.Disciplined.splice(index,1);
        }else {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteTrainingCertificatedPass?id=" + $scope.Disciplined[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.Disciplined.splice(index,1);
                        $scope.$apply()
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteTrainingCertificatedPass = function (index) {
        if ($scope.PassedTrainingClasses[index].Id == undefined || $scope.PassedTrainingClasses[index].Id == 0){
            $scope.PassedTrainingClasses.splice(index,1);
        }else {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteWorkingTracking?id=" + $scope.PassedTrainingClasses[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.PassedTrainingClasses.splice(index,1);
                        $scope.$apply()
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteWorkingTracking = function (index) {
        if ($scope.BusinessNDuty[index].Id == undefined || $scope.BusinessNDuty[index].Id == 0){
            $scope.BusinessNDuty.splice(index,1);
        }else {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteWorkingTracking?id=" + $scope.BusinessNDuty[index].Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
               // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.BusinessNDuty.splice(index,1);
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteIntroducer = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteIntroducerOfParty?profileCode=" + $scope.infUser.ResumeNumber,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    console.log(result.Title);
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                    }
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteAward = function (index) {
        if ($scope.Laudatory[index].Id == undefined || $scope.Laudatory[index].Id == 0){
            $scope.Laudatory.splice(index,1);
        }else {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteAward?id=" + $scope.Laudatory[index].Id ,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $scope.Laudatory.splice(index,1);
                    }
                },
                error: function (result) {
                    App.toastrError(result.Title);
                }
            });
        }
}
    //getGoAboardById
    $scope.getGoAboardById = function () {
        $scope.id = 2;
        dataservice.getGoAboardById($scope.id, function (rs) {
            rs = rs.data;
            console.log(rs.data);

        })

        console.log($scope.id);
    }
    $scope.getTrainingCertificatedPassById = function () {
        $scope.id = 2;
        dataservice.getTrainingCertificatedPassById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }
    //getGetPersonalHistoryById
    $scope.getPersonalHistoryById = function () {
        $scope.id = 2;
        dataservice.getPersonalHistoryById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }

    //getGoAboardById
    $scope.getGoAboardById = function () {
        $scope.id = 2;
        dataservice.getGoAboardById($scope.id, function (rs) {
            rs = rs.data;
            console.log(rs.data);

        })

        console.log($scope.id);
    }

    $scope.uploadFile = async function () {
        var file = document.getElementById("FileItem").files[0];
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else {
            var formdata = new FormData();
            formdata.append("files", file);
    
            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };
            var resultImp = await fetch("/UserProfile/Import", requestOptions);
            var txt = await resultImp.text();
            $scope.defaultRTE
            // console.log($scope.defaultRTE)
            $scope.JSONobjj = handleTextUpload(txt);
    
            console.log($scope.JSONobj);
        }
    };
});