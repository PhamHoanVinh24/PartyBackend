var ctxfolder = "/views/admin/workflowActivityCat";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
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

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
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
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

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
            data: data
        }

        $http(req).then(callback);
    };
    var submitFormUpload1 = function (url, data, callback) {
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
        getWfGroup: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetWfGroup').then(callback)
        },
        getWfType: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetWfType').then(callback)
        },
        insertWorkFlow: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertWorkFlow', data).then(callback)
        },
        getWorkflow: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetWorkflow').then(callback)
        },
        getItemWf: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetItemWf?wfCode=' + data).then(callback)
        },
        updateWf: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateWf', data).then(callback)
        },
        deleteWf: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteWf?wfCode=' + data).then(callback)
        },
        settingWF: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/SettingWF', data).then(callback)
        },
        deleteSettingWF: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteSettingWF?transitionCode=' + data).then(callback)
        },
        getInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetInstanceAct?wfCode=' + data).then(callback)
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        getDurationUnit: function (callback) {
            $http.post('/Admin/CatActivity/GetDurationUnit').then(callback);
        },
        getGroupAct: function (callback) {
            $http.post('/Admin/CatActivity/GetGroupAct').then(callback);
        },
        getTypeAct: function (callback) {
            $http.post('/Admin/CatActivity/GetTypeAct').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/CatActivity/GetStatusAct').then(callback);
        },
        getStatusAssign: function (callback) {
            $http.get('/Admin/CatActivity/GetStatusAssign').then(callback);
        },
        getListGroupUser: function (callback) {
            $http.post('/Admin/CatActivity/GetListGroupUser/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/CatActivity/GetBranch').then(callback);
        },
        getMemberInGroupUser: function (groupUserCode, data, callback) {
            $http.post('/Admin/CatActivity/GetMemberInGroupUser/?groupUserCode=' + groupUserCode + '&branch=' + data).then(callback);
        },
        getListUserInDepartment: function (departmentCode, data, callback) {
            $http.get('/Admin/CatActivity/GetListUserInDepartment/?departmentCode=' + departmentCode + '&branch=' + data).then(callback);
        },
        getListUserOfBranch: function (data, callback) {
            $http.post('/Admin/CatActivity/GetListUserOfBranch?branch=' + data).then(callback);
        },
        getListRoleAssign: function (callback) {
            $http.post('/Admin/CatActivity/GetListRoleAssign').then(callback);
        },
        getMilesStone: function (callback) {
            $http.post('/Admin/CatActivity/GetMilesStone').then(callback);
        },
        getDepartmentInBranch: function (data, callback) {
            $http.post('/Admin/CatActivity/GetDepartmentInBranch?branch=' + data).then(callback);
        },
        updateActInst: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateActInst', data).then(callback);
        },
        assign: function (data, callback) {
            $http.post('/Admin/CatActivity/Assign', data).then(callback);
        },
        getAttrOfAct: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetAttrOfAct?actCode=' + data).then(callback);
        },
        insertAttrData: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertAttrData', data).then(callback);
        },
        getAttrData: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetAttrData', data).then(callback);
        },
        getLstResultAttrData: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetLstResultAttrData', data).then(callback);
        },
        insertObjectProcess: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertObjectProcess', data).then(callback);
        },
        deleteObjInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteObjInstance?id=' + data).then(callback);
        },
        getMemberAssign: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetMemberAssign', data).then(callback);
        },
        updateRole: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateRole?id=' + data + '&role=' + data1).then(callback);
        },
        updateStatus: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatus?id=' + data + '&status=' + data1).then(callback);
        },
        getStatusAssign: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetStatusAssign').then(callback);
        },
        deleteAssign: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteAssign?id=' + data).then(callback);
        },
        //File object share
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getObjFileShare: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetObjFileShare').then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertFileShare', data).then(callback);
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/WorkflowActivity/UploadFile/', data, callback);
        },
        addAttachment: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/AddAttachment', data).then(callback);
        },
        getAttachment: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetAttachment?actInstCode=' + data).then(callback);
        },
        deleteAttachment: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteAttachment', data).then(callback);
        },
        isFileEdms: function (data1, data2, callback) {
            $http.get('/Admin/WorkflowActivity/IsFileEdms?fileCode=' + data1 + '&url=' + data2).then(callback);
        },
        viewFileOnline: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/ViewFileOnline', data).then(callback);
        },
        getTemplate: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetTemplate').then(callback);
        },

        //Command
        getStatusCommand: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetStatusCommand').then(callback);
        },
        insertCommand: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertCommand', data).then(callback);
        },
        getCommand: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetCommand?actInstCode=' + data).then(callback);
        },
        getConfirm: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetConfirm').then(callback);
        },
        getApprove: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetApprove').then(callback)
        },
        getDesActivity: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetDesActivity?actInstCode=' + data).then(callback)
        },

        // Work flow instance
        getWorkflowInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetWorkflowInstance?wfInst=' + data).then(callback);
        },
        getAttachmentWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetAttachmentWfInstance?wfInstCode=' + data).then(callback);
        },
        getResultAttrData: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetResultAttrData?wfInstCode=' + data).then(callback);
        },
        countMilestone: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/CountMilestone?wfCode=' + data).then(callback)
        },
        getActivity: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetActivity?wfCode=' + data).then(callback)
        },
        getTransition: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetTransition?wfCode=' + data).then(callback)
        },
        getWflow: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetWflow').then(callback)
        },
        insertActivity: function (data, callback) {
            $http.post('/Admin/CatActivity/InsertActivity', data).then(callback)
        },
        updateActivity: function (data, callback) {
            $http.post('/Admin/CatActivity/UpdateActivity', data).then(callback);
        },

        getUnitName: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetUnitName?Code=' + data).then(callback)
        },
        getAllActInstance: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetActInstance').then(callback)
        },

        //Object relative
        getObjFromObjType: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback)
        },
        getObjTypeJC: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetObjTypeJC').then(callback)
        },
        getObjectProcess: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetObjectProcess?actInstCode=' + data).then(callback)
        },
        getActRelaObject: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/GetActRelaObject?objType=' + data + '&objCode=' + data1).then(callback)
        },
        deleteObjectProcessingShare: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/DeleteObjectProcessingShare?id=' + data).then(callback)
        },

        //Form builder
        insertSharpLibrary: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertSharpLibrary', data).then(callback)
        },
        getTypeLibrary: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetTypeLibrary').then(callback)
        },
        insertFormCat: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertFormCat', data).then(callback)
        },
        getFormCat: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetFormCat').then(callback)
        },
        insertFormControl: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/InsertFormControl', data).then(callback)
        },
        getFormBuilder: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetFormBuilder?FormCode=' + data).then(callback)
        },
        getSharpLibraryImage: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetSharpLibraryImage').then(callback)
        },
        getSharpLibraryItem: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetSharpLibraryItem?SharpCode=' + data).then(callback)
        },

        //Instance wf
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/CardJob/GetWorkFlow').then(callback)
        },
        deleteWfInstance: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/DeleteWfInstance?wfInstCode=' + data).then(callback)
        },
        getItemWfInst: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/GetItemWfInst?wfInsCode=' + data).then(callback)
        },
        updateWfInst: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateWfInst', data).then(callback)
        },

        //Attr data
        getUnitAttr: function (callback) {
            $http.post('/Admin/WorkflowActivity/GetUnitAttr').then(callback)
        },


        //Activity
        getDurationUnit: function (callback) {
            $http.post('/Admin/CatActivity/GetDurationUnit').then(callback);
        },
        getGroupAct: function (callback) {
            $http.post('/Admin/CatActivity/GetGroupAct').then(callback);
        },
        getTypeAct: function (callback) {
            $http.post('/Admin/CatActivity/GetTypeAct').then(callback);
        },
        getStatusAct: function (callback) {
            $http.post('/Admin/CatActivity/GetStatusAct').then(callback);
        },
        getMilesStone: function (callback) {
            $http.post('/Admin/CatActivity/GetMilesStone').then(callback);
        },
        getListATTRUNIT: function (callback) {
            $http.post('/Admin/CatActivity/GetListATTRUNIT').then(callback);
        },
        getListATTRTYPE: function (callback) {
            $http.post('/Admin/CatActivity/GetListATTRTYPE').then(callback);
        },
        getAct: function (data, callback) {
            $http.post('/Admin/WorkflowActivityCat/GetAct?wfCode=' + data).then(callback);
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                WorkFlowCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                WorkFlowCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsWF = {
            rules: {
                WfCode: {
                    required: true
                },
                WfName: {
                    required: true
                },
            },
            messages: {
                WfCode: {
                    required: "Mã luồng không được bỏ trống",
                },
                WfName: {
                    required: "Tên luồng không được bỏ trống",
                },
            }
        }

        $rootScope.validationOptionsActivity = {
            rules: {
                ActivityCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
                Duration: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                ActivityCode: {
                    required: "Mã hoạt động không được bỏ trống",
                },
                Title: {
                    required: "Tiêu đề không được bỏ trống",
                },
                Duration: {
                    required: "Thời lượng không được bỏ trống",
                    regx: "Vui lòng nhập số"
                },
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/WorkflowActivity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var itemmmm;
    var canvas2;
    var dataweb = "";
    var checkdell = [];
    var timer;
    var time;
    var arr = [];
    var cu = 0;

    $scope.model = {
        WfInst: "",
        WfCode: ""
    };

    var LabelConnection = draw2d.Connection.extend({
        init: function () {
            this._super();
            var auto = new Connection_Label({

            });
            auto.attr({
                text: "Auto",
                width: 20,
                height: 20,
                bgColor: "white",
                cssClass: "auto",
                radius: 3
            });
            this.add(auto, new draw2d.layout.locator.PolylineMidpointLocator(), 1000000);
            var dell = new draw2d.shape.basic.Image({
                path: "/images/workflowActivity/delete.png",
                color: "#27ae60",
                fontColor: "#0d0d0d",
                bgColor: "#ffffff",
                stroke: 1,
                height: 25,
                width: 25,
                y: -30,
                x: 20,
                visible: false
            });
            auto.add(dell, new draw2d.layout.locator.Locator());
            var setting = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/setting.png", height: 25, width: 25, stroke: 1, x: -10, y: -30, visible: false, cssClass: "settinglabel" });
            auto.add(setting, new draw2d.layout.locator.Locator());
            var that = this;
            that.setCssClass("connect");
            auto.installEditor(new draw2d.ui.LabelInplaceEditor({ width: 20 }));
            dell.on("click", function () {
                $scope.deleteSettingWF();
                canvas2.remove(that);
            });
            auto.on("click", function () {
                if (dell.isVisible() == false) {
                    dell.attr({
                        visible: true
                    });
                    setting.attr({
                        visible: true
                    });
                } else {
                    dell.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                }
            });
            this.attr({
                cssClass: "path",
                router: new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
                outlineStroke: 1,
                outlineColor: "#303030",
                stroke: 2,
                color: "gray",
                radius: 4,
            });
            setting.on("click", function () {
                
                $scope.settingTransition();
            })
        },
        getPersistentAttributes: function () {
            var memento = this._super();

            // add all decorations to the memento 
            //
            memento.labels = [];
            this.children.each(function (i, e) {
                var labelJSON = e.figure.getPersistentAttributes();
                labelJSON.locator = e.locator.NAME;
                memento.labels.push(labelJSON);
            });

            return memento;
        },
        setPersistentAttributes: function (memento) {
            this._super(memento);

            // remove all decorations created in the constructor of this element
            //
            this.resetChildren();

            // and add all children of the JSON document.
            //
            $.each(memento.labels, $.proxy(function (i, json) {
                // create the figure stored in the JSON
                var figure = eval("new " + json.type + "()");

                // apply all attributes
                figure.attr(json);

                // instantiate the locator
                var locator = eval("new " + json.locator + "()");

                // add the new figure as child to this figure
                this.add(figure, locator);
            }, this));
        }
    });

    draw2d.shape.basic.Label.inject({
        clearCache: function () {
            this.portRelayoutRequired = true;
            this.cachedMinWidth = null;
            this.cachedMinHeight = null;
            this.cachedWidth = null;
            this.cachedHeight = null;
            this.lastAppliedTextAttributes = {};
            return this;
        }
    });
    var canvas = new draw2d.Canvas("gfx_holder");
    canvas.getCommandStack().addEventListener(function (e) {
        if (e.isPostChangeEvent()) {
            displayJSON(canvas);
        }
    });

    canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.ExtendedKeyboardPolicy());
    canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: function (sourcePort, targetPort) {
            itemmmm = new LabelConnection();
            itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
            itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
            canvas.add(new draw2d.shape.basic.Oval({
                cssClass: "ball" + cu,
                id: "ball",
                width: 10,
                height: 10,
                y: -5

            }));
            cu++;
            checkconn = 1;
            arr.push(itemmmm);
            console.log(arr);
            return itemmmm;

        }
    }));
    canvas2 = canvas;
    $rootScope.canvas2 = canvas;

    //Init data
    $scope.initData = function () {
        dataservice.getWorkflow(function (rs) {
            rs = rs.data;
            $scope.lstWorkflow = rs;
        })
        dataservice.getWorkflowInstance($scope.model.WfInst, function (rs) {
            rs = rs.data;
            $scope.lstWfInst = rs;
        })
        dataservice.getWflow(function (rs) {
            rs = rs.data;
            $scope.listWF = rs;
        })

        dataservice.getFormCat(function (rs) {
            rs = rs.data;
            $scope.lstFormcat = rs;
        })

        dataservice.getSharpLibraryImage(function (rs) {
            rs = rs.data;
            $scope.lstLibSharp = rs;
        })
    }
    $scope.initData();

    //Zoom canvas
    $scope.zoomIn = function () {
        canvas.setZoom(canvas.getZoom() * 0.9, true);
    }
    $scope.zoomDefault = function () {
        canvas.setZoom(1.0, true);
    }
    $scope.zoomOut = function () {
        canvas.setZoom(canvas.getZoom() * 1.1, true);
    }

    // region Activity
    var i = 1;
    $scope.createActivity = function () {
        if ($scope.model.WfCode == "") {
            return App.toastrError("Vui lòng chọn luồng");
        }
        check = 1;
        /////////add activity///////////
        var figure = new Activity_Label({});
        canvas.add(figure, 200, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.setRadius(2);
        figure.attr({
            "bgColor": "#27AE60",
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var lblTitleAct = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 30, y: 0, stroke: 0 });
        lblTitleAct.setWidth(150);

        lblTitleAct.setId(i);
        lblTitleAct.addCssClass("txt1");
        $rootScope.ActName = lblTitleAct;


        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        txt2.setId(i);
        $rootScope.ActDate = txt2;


        var lblStatusAct = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 30, y: 40, stroke: 0 });
        lblStatusAct.setWidth(150);

        lblStatusAct.addCssClass("txt3");
        lblStatusAct.setId(i);

        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);

        txt5.addCssClass("txt5");
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(lblTitleAct, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(lblStatusAct, new draw2d.layout.locator.Locator());

        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 0, y: -27, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");
        var label2 = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 0, y: 64, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label2, new draw2d.layout.locator.Locator());
        label2.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/setting.png", height: 20, width: 20, stroke: 1, x: 0, y: -27, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/next.svg", height: 20, width: 20, stroke: 1, x: 30, y: -27, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/nextpage.svg", height: 20, width: 20, stroke: 1, x: 60, y: -27, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/coppy.svg", height: 20, width: 20, stroke: 1, x: 90, y: -27, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/delete.png", height: 20, width: 20, stroke: 1, x: 120, y: -27, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var clock1 = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/greenclock.svg", height: 30, width: 30, stroke: 1, x: -5, y: 63, visible: false });
        figure.add(clock1, new draw2d.layout.locator.Locator());
        clock1.setId("clock1");
        figure.add(txt5, new draw2d.layout.locator.Locator());
        var dem = 1;
        var c1;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });

            c1.setHeight(17);
            c1.setWidth(17);

            dem++;
        }
        // figure db click//

        figure.on('dblclick', function () {
            
            var act = canvas.getPrimarySelection();
            var parseDataWeb = JSON.parse(dataweb);
            var jsonAct = "";
            for (var k = 0; k < parseDataWeb.length; k++) {
                if (parseDataWeb[k].id == act.id) {
                    jsonAct = JSON.stringify(parseDataWeb[k]);
                }
            }

            var data = {
                IdAct: act.id,
                WfCode: $scope.model.WfCode,
                Json: jsonAct
            }

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add-activity.html',
                controller: 'addCatActivity',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        });

        ///acti click icon///
        figure.on("click", function () {
            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function () {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function () {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function (e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function (e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function () {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function () {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });

        displayJSON(canvas);
        i++;
    }

    //Region WorkFlow
    $scope.addWorkflow = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-workflow.html',
            controller: 'add-workflow',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }

    $scope.editWf = function () {
        if ($scope.model.WfCode == "") {
            return App.toastrError("Vui lòng tạo luồng trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-workflow.html',
            controller: 'edit-workflow',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $scope.model.WfCode;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.settingTransition = function () {
        if ($scope.model.WfCode == "") {
            return App.toastrError("Vui lòng tạo luồng trước");
        }
        var data = {
            WorkflowCode: "",
            TransitionCode: "",
            ActivityInitial: "",
            ActivityDestination: ""
        };

        var node = canvas.getPrimarySelection();
        
        var parseDataweb = JSON.parse(dataweb);
        for (var k = 0; k < parseDataweb.length; k++) {
            if (parseDataweb[k].id == node.id) {
                
                data = {
                    WorkflowCode: $scope.model.WfCode,
                    TransitionCode: node.id,
                    ActivityInitial: parseDataweb[k].source.node,
                    ActivityDestination: parseDataweb[k].target.node
                };
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-setting-transition.html',
            controller: 'add-setting-transition',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.deleteSettingWF = function () {
        var node = canvas.getPrimarySelection();
        dataservice.deleteSettingWF(node.id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    $scope.changeWf = function (code) {
        $scope.model.WfInst = "";
        canvas.clear();
        $rootScope.reloadGridCard();
        var count = 0;
        dataservice.countMilestone($scope.model.WfCode, function (rs) {
            rs = rs.data;
            var div = "";
            if (rs.length > 0) {
                for (var i = 0; i < rs.length; i++) {
                    div += '<div class ="' + rs[i].MileStoneCode + '" style="text-align:center;height: 1500px;  border: 1px solid red; margin:10px ;width:' + 1450 / rs[i].CountMileStone + 'px"><label style = "z-index: 2000;font-weight: 600;font-size:15px">' + rs[i].MileStoneName + '</label></div>';
                    $(".milestone").html(div);
                }
            }
            else {
                $(".milestone").html("");
            }
            dataservice.getActivity($scope.model.WfCode, function (rs) {
                rs = rs.data;
                $scope.lstActivity = rs;

                var data_json = [];

                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].shapJson != null) {
                        var jsons1 = JSON.parse(rs[i].shapJson);
                        data_json.push(jsons1);
                        jsons1.labels[0].text = rs[i].Title;
                        jsons1.labels[2].text = rs[i].Status;

                        var x = ($('.' + rs[i].MilestoneCode + '').position()).left;
                        var y = ($('.' + rs[i].MilestoneCode + '').position()).top;
                        jsons1.x = x - 100;
                        jsons1.y = 80 * (i + 1) + y;
                        //timer//
                        var timer;
                        if (rs[i].Unit == "Ngày") {
                            timer = rs[i].Timer * 86400000;
                        }
                        if (rs[i].Unit == "Giờ") {
                            timer = rs[i].Timer * 3600000;
                        }
                        if (rs[i].Unit == "Phút") {
                            timer = rs[i].Timer * 60000;
                        }
                        if (rs[i].Unit == "Giây") {
                            timer = rs[i].Timer * 1000;
                        }
                    }
                }
                dataservice.getTransition(code, function (res) {
                    $scope.lisTrs = res.data;
                    
                    for (var k = 0; k < $scope.lisTrs.length; k++) {
                        var jsons2 = JSON.parse($scope.lisTrs[k].tranShapJson);
                        data_json.push(jsons2);
                        jsons2.source.node = $scope.lisTrs[k].actintial;
                        jsons2.target.node = $scope.lisTrs[k].actdes;
                    }
                    var reader = new draw2d.io.json.Reader();

                    reader.unmarshal(canvas, data_json);
                    displayJSON(canvas);
                });
            })
            $scope.updateLast();
        })
    }

    $scope.viewFile = function (fileCode, url) {
        var data = {
            ActInstCode: $scope.model.ActivityInstCode,
            FileCode: fileCode,
            Url: url
        };
        
        var extension = url.substr(url.lastIndexOf('.') + 1);
        var word = ['DOCX', 'DOC'];
        var pdf = ['PDF'];
        var excel = ['XLS', 'XLSX'];
        if (word.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/Docman#', '_blank');
            });
        }
        else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/PDF#', '_blank');
            });
        }
        else if (excel.indexOf(extension.toUpperCase()) !== -1) {
            dataservice.viewFileOnline(data, function (rs) {
                window.open('/Excel#', '_blank');
            });
        }
        else {
            window.open(url, '_blank');
        }
    }

    //Show canvas or Card job
    $scope.isWF = true;
    $scope.changeTypeView = function () {
        if ($scope.isWF) {
            $scope.isWF = false;
            document.getElementById("main-content-vatco").style.paddingLeft = "0px !important";
        }
        else {
            $scope.isWF = true;
        }
    }

    $scope.updateLast = function () {
        setTimeout(function () {
            $(".setting").on('click', function () {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit-activity.html',
                    controller: 'edit-activity',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });

            });
            $('.delll').on('click', function () {
                $scope.deleteAct = function () {
                    var node = $rootScope.canvas2.getPrimarySelection();


                    dataservice.deleteActivity(node.id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                        }
                    })
                    // xoa  transiton theo act
                    dataservice.deleteTransAct(node.id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                        }
                    })
                    dataservice.deleteMileStone(node.id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                        }
                    })
                }
                $scope.deleteAct();
                var node = $rootScope.canvas2.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                $rootScope.canvas2.getCommandStack().execute(command);
            });
            if (screen.width < 1000) {
                $(".txt1").css("width", "150px");
                $(".txt1").css("height", "60px");

                $(".txt1 ").click(function () {
                    var node = canvas2.getPrimarySelection();
                    $(document).on("mousemove", function (event) {
                        node.attr({
                            x: event.pageX,
                            y: event.pageY
                        });
                        $(document).off("mousemove");


                    });
                });
            }

            $(".auto").click(function () {
                var node = $rootScope.canvas2.getPrimarySelection();
                var del = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/delete.png", height: 25, width: 25, stroke: 1, x: 23, y: -30, visible: true });
                var settting2 = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/setting.png", height: 25, width: 25, stroke: 1, x: -8, y: -30, visible: true });

                if (!node.children.data[0].figure.children.data.length) {
                    node.children.data[0].figure.add(del, new draw2d.layout.locator.Locator());
                    node.children.data[0].figure.children.data[0].figure.attr({
                        cssClass: "dell2",
                        visible: true
                    });
                    node.children.data[0].figure.add(settting2, new draw2d.layout.locator.Locator());
                    node.children.data[0].figure.children.data[1].figure.attr({
                        cssClass: "setting2",
                        visible: true
                    });
                    settting2.on("click", function () {
                        
                        $scope.settingTransition();
                    })
                }
            });
        }, 3000);
    }

    //Sharp lib
    $scope.creatActByLib = function (code) {
        dataservice.getSharpLibraryItem(code, function (rs) {
            rs = rs.data;
            var data_json = [];
            data_json.push(JSON.parse(rs.SharpData));
            var reader = new draw2d.io.json.Reader();
            reader.unmarshal(canvas, data_json);
            displayJSON(canvas);
            $scope.updateLast();

        })
    }

    $scope.library = function () {
        var data = {
            WorkflowCode: $scope.model.WfCode,
        };
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-wf-sharp-library.html',
            controller: 'add-wf-sharp-library',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    function updateLast() {
        $('.setting').on('click', function () {
            var node = canvas2.getPrimarySelection();
            $('.fade2').toggleClass('show');
            $('.modal2').css('display', 'block');
        });

        $('.delll').on('click', function () {
            var node = canvas2.getPrimarySelection();
            var command = new draw2d.command.CommandDelete(node);
            canvas2.getCommandStack().execute(command);
            checkdell.push(node.id);
        });
        if (screen.width < 1000) {
            $(".txt1").css("width", "150px");
            $(".txt1").css("height", "60px");

            $(".txt1 ").click(function () {
                var node = canvas2.getPrimarySelection();
                $(document).on("mousemove", function (event) {
                    node.attr({
                        x: event.pageX,
                        y: event.pageY
                    });
                    $(document).off("mousemove");


                });
            });
        }
        $('.btn-save2').on('click', function (e) {
            var node = canvas2.getPrimarySelection();
            //node.children.data[0].figure// trỏ đến label
            var text11 = document.getElementById("activity-name2").value;
            if (text11 == "") {

            } else {
                node.children.data[0].figure.attr({
                    text: text11
                });
            }
            document.getElementById("activity-name2").value = "";
            var text22 = document.getElementById("state-name2").value;
            timer = text22;

            node.children.data[1].figure.attr({

                text: timer
            });
            if (!Date.parse(timer)) {
                node.children.data[3].figure.attr({
                    text: ""
                });
            } else {
                var countDownDate = new Date(timer).getTime();
                // Update the count down every 1 second
                var x = setInterval(function () {
                    // Get today's date and time
                    var now = new Date().getTime();
                    // Find the distance between now and the count down date
                    var distance = countDownDate - now;
                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    // Output the result in an element with id="demo"
                    if (days >= 1) {
                        time = days + "d " + hours + "h " +
                            minutes + "m " + seconds + "s ";
                    } else {
                        time = hours + "h " +
                            minutes + "m " + seconds + "s ";
                    }
                    node.children.data[3].figure.attr({
                        text: time,
                        stroke: 0.2,
                        radius: 2,
                        bgColor: "#fff"
                    });

                    displayJSON(canvas2);
                    // If the count down is over, write some text 

                }, 1000);
                document.getElementById("state-name2").value = "";
            }
            var ActStatus = $("#status2").val();
            console.log(ActStatus);
            if (ActStatus == 1) {

                if (node.children.data.length == 11) {
                    node.children.data[10].figure.attr({
                        path: "greenclock.svg",
                        id: "clock1"
                    });
                } else {
                    var clock1 = new draw2d.shape.basic.Image({ path: "greenclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                    node.add(clock1, new draw2d.layout.locator.Locator());
                    clock1.setId("clock1");
                }
            }
            if (ActStatus == 2) {


                if (node.children.data.length == 11) {
                    node.children.data[10].figure.attr({
                        path: "redclock.svg",
                        id: "clock2"
                    });
                } else {
                    var clock2 = new draw2d.shape.basic.Image({ path: "redclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                    node.add(clock2, new draw2d.layout.locator.Locator());
                    clock2.setId("clock2");
                }

            }
            if (ActStatus == 3) {
                if (node.children.data.length == 11) {
                    node.children.data[10].figure.attr({
                        path: "blackclock.svg",
                        id: "clock3"
                    });
                } else {
                    var clock3 = new draw2d.shape.basic.Image({ path: "blackclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                    node.add(clock3, new draw2d.layout.locator.Locator());
                    clock3.setId("clock3");
                }
            }
            if (ActStatus == 4) {
                if (node.children.data.length == 11) {
                    node.children.data[10].figure.attr({
                        path: "yellowclock.svg",
                        id: "clock4"
                    });
                } else {
                    var clock4 = new draw2d.shape.basic.Image({ path: "yellowclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                    node.add(clock4, new draw2d.layout.locator.Locator());
                    clock4.setId("clock4");
                }
            }

            $('.modal2').css('display', 'none');
            $('.overlay').removeClass('overlay-show');
            $('.fade2').removeClass('show');
            displayJSON(canvas2);
        });
    }

    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            dataweb = JSON.stringify(json, null, 2);
        });
    }
});

app.controller('addCatActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $scope.model = {
        ActivityCode: para.IdAct,
        Title: "",
        Duration: "",
        Unit: "",
        Group: "",
        Type: "",
        Status: "",
        Located: "",
        MileStone: "",
        WorkflowCode: para.WfCode,
        ShapeJson: para.Json
    }
    $rootScope.isAdded = false;
    $rootScope.ActivityCode = "";

    $scope.initData = function () {
        dataservice.getDurationUnit(function (rs) {
            rs = rs.data;
            $scope.lstUnit = rs;
        })
        dataservice.getGroupAct(function (rs) {
            rs = rs.data;
            $scope.lstGroup = rs;
        })
        dataservice.getTypeAct(function (rs) {
            rs = rs.data;
            $scope.lstType = rs;
        })
        dataservice.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataservice.getMilesStone(function (rs) {
            rs = rs.data;
            $scope.lstMileStone = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            
            if (!$rootScope.isAdded) {
                
                dataservice.insertActivity($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.isAdded = true;
                        $rootScope.ActivityCode = $scope.model.ActivityCode;
                    }
                });
            }
            else {
                dataservice.updateActivity($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close('cancel');
                    }
                });
            }
        }
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "Group" && $scope.model.Group != "") {
            $scope.errorGroup = false;
        }
        if (SelectType == "Type" && $scope.model.Type != "") {
            $scope.errorType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MileStone" && $scope.model.MileStone != "") {
            $scope.errorMileStone = false;
        }

    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.Unit == "") {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }

        if (data.Group == "") {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;
        }

        if (data.Type == "") {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }

        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        if (data.MileStone == "") {
            $scope.errorMileStone = true;
            mess.Status = true;
        } else {
            $scope.errorMileStone = false;
        }

        return mess;
    };

    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'DURATION_UNIT',
                        GroupNote: 'Đơn vị thời lượng',
                        AssetCode: 'DURATION_UNIT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getDurationUnit(function (rs) {
                rs = rs.data;
                $scope.lstUnit = rs;
            })
        }, function () { });
    }

    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'GROUP_ACTIVITY',
                        GroupNote: 'Nhóm hoạt động',
                        AssetCode: 'GROUP_ACTIVITY'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getGroupAct(function (rs) {
                rs = rs.data;
                $scope.lstGroup = rs;
            })
        }, function () { });
    }

    $scope.addType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'TYPE_ACTIVITY',
                        GroupNote: 'Loại hoạt động',
                        AssetCode: 'TYPE_ACTIVITY'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getTypeAct(function (rs) {
                rs = rs.data;
                $scope.lstType = rs;
            })
        }, function () { });
    }

    $scope.addStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'STATUS_ACTIVITY',
                        GroupNote: 'Trạng thái hoạt động',
                        AssetCode: 'STATUS_ACTIVITY'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getStatusAct(function (rs) {
                rs = rs.data;
                $scope.lstStatus = rs;
            })
        }, function () { });
    }

    $scope.addMileStone = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'MILES_STONE',
                        GroupNote: 'Mốc',
                        AssetCode: 'MILES_STONE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getMilesStone(function (rs) {
                rs = rs.data;
                $scope.lstMileStone = rs;
            })
        }, function () { });
    }
});

app.controller('add-setting-transition', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        WorkflowCode: para.WorkflowCode,
        TransitionCode: "",
        ActivityInitial: para.ActivityInitial,
        ActivityDestination: para.ActivityDestination,
        Command: ""
    };
    $scope.initData = function () {
        dataservice.getTransitionType(function (rs) {
            rs = rs.data;
            $scope.lstTransition = rs;
        })
        dataservice.getAct(para.WorkflowCode, function (rs) {
            rs = rs.data;
            $scope.lstAct = rs;
        })
    }
    $scope.initData();
    $scope.submit = function () {
        dataservice.settingWF($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    function loadDate() {
        $("#actDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
    }
    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            dataweb = JSON.stringify(json, null, 2);
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit-setting-transition', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        WorkflowCode: para.WorkflowCode,
        TransitionCode: "",
        ActivityInitial: para.ActivityInitial,
        ActivityDestination: para.ActivityDestination,
        Command: ""
    };
    $scope.initData = function () {
        dataservice.getTransitionType(function (rs) {
            rs = rs.data;
            $scope.lstTransition = rs;
        })
        dataservice.getAct(para.WorkflowCode, function (rs) {
            rs = rs.data;
            $scope.lstAct = rs;
        })
    }
    $scope.initData();
    $scope.submit = function () {
        dataservice.settingWF($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    function loadDate() {
        $("#actDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
        });
    }
    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            dataweb = JSON.stringify(json, null, 2);
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add-workflow', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        WfCode: "",
        WfName: "",
        WfGroup: "",
        WfType: "",
        WfNote: ""
    };

    $scope.initData = function () {
        dataservice.getWfGroup(function (rs) {
            rs = rs.data;
            $scope.lstWfGroup = rs;
        })
        dataservice.getWfType(function (rs) {
            rs = rs.data;
            $scope.lstWfType = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertWorkFlow($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }

    $scope.changeSelect = function (selectType) {
        if (selectType == "WfGroup" && $scope.model.WfGroup != "") {
            $scope.errorWfGroup = false;
        }

        if (selectType == "WfType" && $scope.model.WfType != "") {
            $scope.errorWfType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.WfGroup == "") {
            $scope.errorWfGroup = true;
            mess.Status = true;
        } else {
            $scope.errorWfGroup = false;
        }

        if (data.WfType == "") {
            $scope.errorWfType = true;
            mess.Status = true;
        } else {
            $scope.errorWfType = false;
        }

        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit-workflow', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        WfCode: "",
        WfName: "",
        WfGroup: "",
        WfType: "",
        WfNote: ""
    };

    $scope.initData = function () {
        dataservice.getWfGroup(function (rs) {
            rs = rs.data;
            $scope.lstWfGroup = rs;
        })
        dataservice.getWfType(function (rs) {
            rs = rs.data;
            $scope.lstWfType = rs;
        })
        dataservice.getItemWf(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateWf($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }

    $scope.changeSelect = function (selectType) {
        if (selectType == "WfGroup" && $scope.model.WfGroup != "") {
            $scope.errorWfGroup = false;
        }

        if (selectType == "WfType" && $scope.model.WfType != "") {
            $scope.errorWfType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.WfGroup == "") {
            $scope.errorWfGroup = true;
            mess.Status = true;
        } else {
            $scope.errorWfGroup = false;
        }

        if (data.WfType == "") {
            $scope.errorWfType = true;
            mess.Status = true;
        } else {
            $scope.errorWfType = false;
        }

        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

//Tab of Activity
app.controller('assign-member', function ($scope, $rootScope, $confirm, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.model = {
        Branch: "",
        Object: "",
        UserId: "",
        Role: ""
    }
    $scope.initLoad = function () {
        dataservice.getGroupAct(function (rs) {
            rs = rs.data;
            $scope.lstGroup = rs;
        })
        dataservice.getTypeAct(function (rs) {
            rs = rs.data;
            $scope.lstType = rs;
        })
        dataservice.getStatusAct(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.lstBranch = rs;
        })
        dataservice.getListGroupUser(function (groupUser) {
            groupUser = groupUser.data;
            $scope.lstGroup = groupUser;
        });
        dataservice.getListRoleAssign(function (rs) {
            rs = rs.data;
            $scope.lstRole = rs;
        })
    }
    $scope.initLoad();

    $scope.changeSelect = function (SelectType, code) {
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
            $scope.listGroupUserAndDepartment = [];
            
            dataservice.getDepartmentInBranch(code, function (department) {
                department = department.data;
                var all = {
                    Code: 'All',
                    Name: 'Tất cả người dùng',
                    Type: 3,
                    Group: 'Người dùng'
                }
                $scope.listGroupUserAndDepartment = department.concat($scope.lstGroup);
                $scope.listGroupUserAndDepartment.unshift(all);
            })
        }
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }

        if (SelectType == "Role" && $scope.model.Role != "") {
            $scope.errorRole = false;
        }
    }

    $scope.departmentOrGroupSelect = function (obj) {
        
        $scope.errorObject = false;
        $scope.departmentAssignCode = "";
        $scope.groupAssignCode = "";
        if (obj.Type == 1) {
            $scope.groupAssignCode = obj.Code;
            dataservice.getMemberInGroupUser(obj.Code, $scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        else if (obj.Type == 2) {
            $scope.departmentAssignCode = obj.Code;
            dataservice.getListUserInDepartment(obj.Code, $scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else {
            dataservice.getListUserOfBranch($scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
    };

    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            $scope.model.ActivityCode = $rootScope.ActivityCode;
            $scope.model.DepartmentCode = $scope.departmentAssignCode;
            $scope.model.GroupCode = $scope.groupAssignCode;
            dataservice.assign($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            })
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Branch == "") {
            $scope.errorBranch = true;
            mess.Status = true;
        } else {
            $scope.errorBranch = false;
        }

        if (data.Object == "" || data.Object == null || data.Object == undefined) {
            $scope.errorObject = true;
            mess.Status = true;
        } else {
            $scope.errorObject = false;
        }

        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
        }

        return mess;
    };

    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CatActivity/JtableActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ActivityCode = $rootScope.ActivityCode;
            },
            complete: function () {
                heightTableManual(250, "#tblDataAssign");
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle('{{"Chi nhánh" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Department').withTitle('{{"Phòng ban" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"Nhóm" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"Nhân viên" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Role').withTitle('{{"Vai trò" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        reloadData(false);
    }
    setTimeout(function () {


    }, 200);
});

app.controller('fileManage', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, actCode) {
    var vm = $scope;
    $scope.breadcrumb = [];
    $scope.treeDataRepository = [];
    $scope.repository = {
        TypeRepos: '',
        ReposCode: '',
        Folder: '',
        ParentId: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CardJob/JtableFileWithRepository",
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
                d.ReposCode = $scope.repository.ReposCode;
                d.Folder = $scope.repository.Folder;
                d.ParentId = $scope.repository.ParentId;
                d.FileName = $scope.repository.FileName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "200px")
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    
                    if (data.IsDirectory == 'True') {
                        $scope.breadcrumb.push({ Id: data.Id, Path: data.FileName, Name: data.FileName });
                        $scope.$apply();
                        //(2:Server, 1:Google driver)
                        if ($scope.repository.TypeRepos == 'SERVER') {
                            var folder = '';
                            for (var i = 0; i < $scope.breadcrumb.length; i++) {
                                if ($scope.breadcrumb[i].Path != '') {
                                    folder += "/" + $scope.breadcrumb[i].Path;
                                }
                            }
                            $scope.repository.Folder = folder;
                        } else if ($scope.repository.TypeRepos == 'DRIVER') {
                            $scope.repository.ParentId = data.Id;
                        }
                        $scope.reload();
                    }
                    else if (data.IsDirectory == 'False') {
                        $scope.path = "/" + $scope.breadcrumb[1].Path + "/" + data.FileName;
                        dataservice.getFileEDMS($scope.path, data.FileSize, data.LastModifiedDate, actCode, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                            }
                        })
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSR_LIST_COL_FILE_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        var dataSubstr = data.length > 35 ? data.substr(0, 35) + " ..." : data;
        if (full.IsDirectory == 'True') {
            return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + dataSubstr;
        } else {
            if ($scope.repository.TypeRepos == 'SERVER') {
                var idxDot = data.lastIndexOf(".") + 1;
                var extFile = data.substr(idxDot, data.length).toLowerCase();
                var excel = ['XLSM', 'XLSX', 'XLS'];
                var document = ['TXT'];
                var word = ['DOCX', 'DOC'];
                var pdf = ['PDF'];
                var powerPoint = ['PPS', 'PPTX', 'PPT'];
                var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
                if (excel.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (word.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (document.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdf.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPoint.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (image.indexOf(extFile.toUpperCase()) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            } else {
                var txtMimetypes = ["text/plain"];
                var wordMimetypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.google-apps.document"];
                var excelMimetypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.google-apps.spreadsheet"];
                var pdfMimetypes = ["application/pdf"];
                var powerPointMimetypes = ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
                var imageMimetypes = ["image/jpeg", "image/tiff", "image/ief", "image/png", "image/svg+xml", "image/webp", "image/vnd.microsoft.icon", "image/bmp"];
                if (excelMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (wordMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (txtMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (pdfMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (powerPointMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else if (imageMimetypes.indexOf(full.MimeType) !== -1) {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                } else {
                    return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;' + dataSubstr;
                }
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileSize').withTitle($translate('EDMSR_LIST_COL_SIZE')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (data == '') {
            return '';
        } else if (data == 0) {
            return '0 Byte';
        } else {
            var i = parseInt(Math.floor(Math.log(data) / Math.log(1024)));
            return Math.round(data / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LastModifiedDate').withTitle($translate('EDMSR_LIST_COL_MODIFIED_DATE')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
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
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeRepository(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Danh sách",
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeDataRepository.push(root);
                var index = 0;
                $scope.ListParent = result.filter(function (item) {
                    return (item.ParentCode == '#');
                });
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ParentCode == '#') {
                        var stt = $scope.ListParent.length - index;
                        if (stt.toString().length == 1) {
                            stt = "0" + stt;
                        }
                        index = index + 1;
                        var data = {
                            id: result[i].Code,
                            parent: 'root',
                            text: stt + ' - ' + result[i].Title,
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    } else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            resId: result[i].Id,
                            resCode: result[i].Code,
                            resName: result[i].Title,
                            resParent: result[i].ParentCode,
                            typeRepos: result[i].TypeRepos,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeDataRepository.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeFileManage = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        listSelect.push(listNoteSelect[0].id);
        $scope.breadcrumb = [];
        $scope.breadcrumb.push({ Id: "", Path: "", Name: listNoteSelect[0].original.resName });
        $scope.repository.ReposCode = listNoteSelect[0].original.resCode;
        $scope.repository.TypeRepos = listNoteSelect[0].original.typeRepos;
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.deselectNodeRepository = function () {
        $scope.breadcrumb = [];
        $scope.repository.ReposCode = '';
        $scope.repository.TypeRepos = '';
        $scope.repository.Folder = "";
        $scope.repository.ParentId = "";
        $scope.reload();
    }
    $scope.selectBreadcrumbRepository = function (index, listBreadcrumb) {
        var folder = '';
        for (var i = 0; i < listBreadcrumb.length; i++) {
            if (i == index) {
                folder += "/" + $scope.breadcrumb[i].Path;
                $scope.repository.ParentId = listBreadcrumb[i].Id;

            } else if (i > index) {
                listBreadcrumb.splice(i, 1);
                i--;
            } else if (i < index) {
                folder += "/" + $scope.breadcrumb[i].Path;
            }
        }
        $scope.repository.Folder = folder;
        $scope.reload();
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fas fa-store',
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'search'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeFileManage,
        'deselect_node': $scope.deselectNodeRepository,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"STT" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"Giá trị cài đặt" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"Kiểu dữ liệu" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"Ngày tạo" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"Người tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataservice.getDataTypeCommon(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.CP_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataservice.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.CP_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataservice.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCommonSetting(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('attr-setup-act', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelAttr = {
        ActCode: '',
        AttrUnit: '',
        AttrDataType: ''

    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CatActivity/JTableAttr",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ActCode = $rootScope.ActivityCode;

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(170, "#tblDataAttr");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ID').withTitle('ID').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"Mã thuộc tính" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"Tên thuộc tính" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrDataType').withTitle('{{"Kiểu dữ liệu" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrUnit').withTitle('{{"Đơn vị tính" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Ghi chú" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"Thao tác" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadNoResetPage5 = function () {
        reloadData(false);
    };

    $scope.initData = function () {
        dataservice.getListATTRTYPE(function (result) {
            result = result.data;
            $scope.ListATTRTYPE = result.Object;
        });
        dataservice.getListATTRUNIT(function (result) {
            result = result.data;
            $scope.ListATTRUNIT = result.Object;
        });
    }
    $scope.initData();

    $scope.addattr = function () {
        validationSelect($scope.modelAttr);
        if ($scope.addheader.validate() && !validationSelect($scope.modelAttr).Status) {
            var temp = $rootScope.checkData($scope.modelAttr);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.modelAttr.ActCode = $rootScope.ActivityCode;
            dataservice.insertActAttrSetup($scope.modelAttr, function (result) {
                var rs = result.data;
                if (result.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }

    $rootScope.search = function (id) {
        reloadData(true);
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.deleteActAttrSetup(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reloadNoResetPage5();
        }, function () {
        });
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AttrDataType" && $scope.modelAttr.AttrDataType != "") {
            $scope.errorAttrDataType = false;
        }
        if (SelectType == "AttrUnit" && $scope.modelAttr.AttrUnit != "") {
            $scope.errorAttrUnit = false;
        }

    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AttrDataType == "") {
            $scope.errorAttrDataType = true;
            mess.Status = true;
        } else {
            $scope.errorAttrDataType = false;
        }

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        return mess;
    };

    setTimeout(function () {


    }, 200);
});

