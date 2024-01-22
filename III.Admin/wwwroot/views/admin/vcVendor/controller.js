var ctxfolder = "/views/admin/vcVendor";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        //var formData = new FormData();
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).success(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/vcVendor/Insert/', data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/vcVendor/Update/', data).success(callback);
        },
        getBrands: function (callback) {
            $http.post('/Admin/vcVendor/GetBrands/').success(callback);
        },
        //getProducts: function (callback) {
        //    $http.post('/Admin/vcVendor/GetProducts/').success(callback);
        //},
        getBrandsBySeller: function (data, callback) {
            $http.post('/Admin/vcVendor/GetBrandsBySeller?SellerCode=' + data).success(callback);
        },
        //getProductsBySeller: function (data, callback) {
        //    $http.post('/Admin/vcVendor/GetProductsBySeller?SellerCode=' + data).success(callback);
        //},

        getDistributors: function (callback) {
            $http.post('/Admin/vcVendor/GetDistributors/').success(callback);
        },
        getDistributorsAgents: function (callback) {
            $http.post('/Admin/vcVendor/GetDistributorsAgents/').success(callback);
        },
        getTransportWeight: function (callback) {
            $http.post('/Admin/vcVendor/GetTransportWeight/').success(callback);
        },

        insertTrade: function (data, callback) {
            $http.post('/Admin/vcVendor/InsertTrade/', data).success(callback);
        },
        deleteTrade: function (data, callback) {
            $http.post('/Admin/vcVendor/DeleteTrade?Id=' + data).success(callback);
        },
        updateTrade: function (data, callback) {
            $http.post('/Admin/vcVendor/UpdateTrade', data).success(callback);
        },
        
        insertTransporter: function (data, callback) {
            $http.post('/Admin/vcVendor/InsertTransporter/', data).success(callback);
        },
        updateTransporter: function (data, callback) {
            $http.post('/Admin/vcVendor/UpdateTransporter/', data).success(callback);
        },

        deleteTransporter: function (data, callback) {
            $http.post('/Admin/vcVendor/DeleteTransporter?Id=' + data).success(callback);
        },
        getTransporterInfo: function (data, callback) {
            $http.post('/Admin/vcVendor/GetTransporterInfo?Id=' + data).success(callback);
        },


        delete: function (data, callback) {
            $http.post('/Admin/vcVendor/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/vcVendor/GetItem/' + data).success(callback);
        },
        getCustomerGroup: function (callback) {
            $http.post('/Admin/vcVendor/getCustomerGroup').success(callback);
        },
        getArea: function (callback) {
            $http.post('/Admin/vcVendor/GetListArea').success(callback);
        },
        getCustomerType: function (callback) {
            $http.post('/Admin/vcVendor/GetListCutomerType').success(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/vcVendor/GetListCustomer/').success(callback);
        },

        getCustomerRole: function (callback) {
            $http.post('/Admin/vcVendor/GetListCutomerRole').success(callback);
        },
        getCustomerStatus: function (callback) {
            $http.post('/Admin/vcVendor/GetCustomerStatus').success(callback);
        },

        insertFile: function (data, callback) {
            $http.post('/Admin/vcVendor/InsertFile/', data).success(callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/vcVendor/DeleteFile/' + data).success(callback);
        },
        updateFile: function (data, callback) {
            $http.post('/Admin/vcVendor/UpdateFile/', data).success(callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/vcVendor/GetFile/' + data).success(callback);
        },
        getItemAdd: function (data, callback) {
            $http.get('/Admin/vcVendor/GetItemAdd?code=' + data).success(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').success(callback);
        },

        insertContact: function (data, callback) {
            $http.post('/Admin/vcVendor/InsertContact/', data).success(callback);
        },
        deleteContact: function (data, callback) {
            $http.post('/Admin/vcVendor/DeleteContact/' + data).success(callback);
        },
        updateContact: function (data, callback) {
            $http.post('/Admin/vcVendor/UpdateContact/', data).success(callback);
        },
        getContact: function (data, callback) {
            $http.get('/Admin/vcVendor/GetContact/' + data).success(callback);
        },
        insertExtend: function (data, callback) {
            $http.post('/Admin/vcVendor/InsertExtend/', data).success(callback);
        },

        deleteExtend: function (data, callback) {
            $http.post('/Admin/vcVendor/DeleteExtend/' + data).success(callback);
        },
        updateExtend: function (data, callback) {
            $http.post('/Admin/vcVendor/UpdateExtend/', data).success(callback);
        },
        getExtend: function (data, callback) {
            $http.get('/Admin/vcVendor/GetExtend/' + data).success(callback);
        },

        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/vcVendor/UploadFile/', data, callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/vcVendor/UploadImage/', data, callback);
        },

        //CardJob
        //getBoards: function (callback) {
        //    $http.post('/Admin/CardJob/GetBoards/').success(callback);
        //},

        //addCardJob: function (data, callback) {
        //    $http.post('/Admin/vcVendor/AddCardJob/', data).success(callback);
        //},

        //getTeams: function (callback) {
        //    $http.post('/Admin/CardJob/GetTeams').success(callback);
        //},
        //getBoardByTeam: function (TeamCode, callback) {
        //    $http.post('/Admin/vcVendor/GetBoards/?TeamCode=' + TeamCode).success(callback);
        //},
        //getLists: function (BoardCode, callback) {
        //    $http.post('/Admin/vcVendor/GetLists/?BoardCode=' + BoardCode).success(callback);
        //},
        //getCards: function (ListCode, callback) {
        //    $http.post('/Admin/vcVendor/GetCards/?ListCode=' + ListCode).success(callback);
        //},
        //addCardRelative: function (data, callback) {
        //    $http.post('/Admin/vcVendor/AddCardRelative/', data).success(callback);
        //},

        //getCards: function (data, callback) {
        //    $http.post('/Admin/CardJob/GetCards/?BoardCode=' + data).success(callback);
        //},
        //getCardsByList: function (data, callback) {
        //    $http.post('/Admin/CardJob/GetCardsByList/?ListCode=' + data).success(callback);
        //},
        //getCardDetail: function (data, callback) {
        //    $http.post('/Admin/CardJob/GetCardDetail/?CardCode=' + data).success(callback);
        //},
        //insertCard: function (data, callback) {
        //    $http.post('/Admin/CardJob/InsertCard/', data).success(callback);
        //},
        //deleteCard: function (id, callback) {
        //    $http.post('/Admin/CardJob/DeleteCard/' + id).success(callback);
        //},
        //getLevels: function (callback) {
        //    $http.post('/Admin/CardJob/GetLevels/').success(callback);
        //},
        //getCardMember: function (CardCode, callback) {
        //    $http.post('/Admin/CardJob/GetCardMember/?CardCode=' + CardCode).success(callback);
        //},
        //getCardTeam: function (CardCode, callback) {
        //    $http.post('/Admin/CardJob/GetCardTeam/?CardCode=' + CardCode).success(callback);
        //},
        //changeWorkType: function (cardCode, type, callback) {
        //    $http.post('/Admin/CardJob/ChangeWorkType/?CardCode=' + cardCode + '&Type=' + type).success(callback);
        //},
        //changeCardStatus: function (cardCode, status, callback) {
        //    $http.post('/Admin/CardJob/ChangeCardStatus/?CardCode=' + cardCode + '&Status=' + status).success(callback);
        //},
        //changeCardLevel: function (cardCode, level, callback) {
        //    $http.post('/Admin/CardJob/ChangeCardLevel/?CardCode=' + cardCode + '&Level=' + level).success(callback);
        //},
        //getWorkType: function (callback) {
        //    $http.post('/Admin/CardJob/GetWorkType/').success(callback);
        //},
        //getStatus: function (callback) {
        //    $http.post('/Admin/CardJob/GetStatus/').success(callback);
        //},
        //updateCardName: function (cardId, newName, callback) {
        //    $http.post('/Admin/CardJob/UpdateCardName/?CardID=' + cardId + '&NewName=' + newName).success(callback);
        //},
        //updateCardDescription: function (data, callback) {
        //    $http.post('/Admin/CardJob/UpdateCardDescription', data).success(callback);
        //},
        //updateCardLabel: function (cardCode, label, callback) {
        //    $http.post('/Admin/CardJob/UpdateCardLabel/?CardCode=' + cardCode + "&Label=" + label).success(callback);
        //},
        //changeListCard: function (cardCode, listCode, callback) {
        //    $http.post('/Admin/CardJob/ChangeListCard/?CardCode=' + cardCode + "&ListCode=" + listCode).success(callback);
        //},
        //updateDueDate: function (cardCode, duedate, callback) {
        //    $http.post('/Admin/CardJob/UpdateDuedate/?CardCode=' + cardCode + '&Duedate=' + duedate).success(callback);
        //},


        //addMember: function (data, callback) {
        //    $http.post('/Admin/CardJob/AddMember/', data).success(callback);
        //},

        //addCheckList: function (cardCode, data, callback) {
        //    $http.post('/Admin/CardJob/AddCheckList/?CardCode=' + cardCode + '&Title=' + data).success(callback);
        //},
        //getCheckList: function (cardCode, callback) {
        //    $http.post('/Admin/CardJob/GetCheckLists/?CardCode=' + cardCode).success(callback);
        //},
        //deleteCheckList: function (CheckCode, callback) {
        //    $http.post('/Admin/CardJob/DeleteCheckList/?CheckCode=' + CheckCode).success(callback);
        //},
        //changeCheckTitle: function (checkCode, title, callback) {
        //    $http.post('/Admin/CardJob/ChangeCheckTitle/?CheckCode=' + checkCode + '&Title=' + title).success(callback);
        //},
        //sortListByStatus: function (boardCode, orther, callback) {
        //    $http.post('/Admin/CardJob/SortListByStatus/?BoardCode=' + boardCode + '&Orther=' + orther).success(callback);
        //},

        //addCheckItem: function (checkCode, data, callback) {
        //    $http.post('/Admin/CardJob/AddCheckItem/?CheckCode=' + checkCode + '&Title=' + data).success(callback);
        //},
        //getCheckItem: function (checkCode, callback) {
        //    $http.post('/Admin/CardJob/GetCheckItem/?CheckCode=' + checkCode).success(callback);
        //},
        //changeChkItemStatus: function (itemId, callback) {
        //    $http.post('/Admin/CardJob/ChangeItemStatus/?Id=' + itemId).success(callback);
        //},
        //changeChkItemTitle: function (itemId, title, callback) {
        //    $http.post('/Admin/CardJob/ChangeItemTitle/?Id=' + itemId + '&Title=' + title).success(callback);
        //},
        //deleteCheckItem: function (itemid, callback) {
        //    $http.post('/Admin/CardJob/DeleteCheckItem/?Id=' + itemid).success(callback);
        //},

        //addComment: function (cardCode, content, callback) {
        //    $http.post('/Admin/CardJob/AddComment/?CardCode=' + cardCode + '&Content=' + content).success(callback);
        //},
        //getComment: function (cardCode, callback) {
        //    $http.post('/Admin/CardJob/GetComments/?CardCode=' + cardCode).success(callback);
        //},
        //deleteComment: function (cmtId, callback) {
        //    $http.post('/Admin/CardJob/DeleteComment/?CommentId=' + cmtId).success(callback);
        //},
        //updateComment: function (cmtId, content, callback) {
        //    $http.post('/Admin/CardJob/UpdateComment/?CmtId=' + cmtId + '&Content=' + content).success(callback);
        //},

        //addAttachment: function (data, callback) {
        //    $http.post('/Admin/CardJob/AddAttachment/', data).success(callback);
        //},
        //uploadAttachment: function (data, callback) {
        //    submitFormUpload('/Admin/CardJob/UploadFile/', data, callback);
        //},
        //getAttachment: function (cardCode, callback) {
        //    $http.post('/Admin/CardJob/GetAttachment/?CardCode=' + cardCode).success(callback);
        //},
        //deleteAttachment: function (fileCode, callback) {
        //    $http.post('/Admin/CardJob/DeleteAttachment/?FileCode=' + fileCode).success(callback);
        //},

        //save: function (data, callback) {
        //    $http.post('/Admin/CardJob/SaveData/', data).success(callback);
        //},
        //getObjDependency: function (callback) {
        //    $http.post('/Admin/CardJob/GetObjDependency').success(callback);
        //},
        //setObjectRelative: function (data, callback) {
        //    $http.post('/Admin/CardJob/SetObjectRelative/', data).success(callback);
        //},
        //advanceSearch: function (data, callback) {
        //    $http.post('/Admin/CardJob/AdvanceSearch/', data).success(callback);
        //},
        //getObjCode: function (objDepen, callback) {
        //    $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).success(callback);
        //},
        //insertCardDependency: function (data, callback) {
        //    $http.post('/Admin/CardJob/InsertCardDependency/', data).success(callback);
        //},
        //getCardDependency: function (CardCode, callback) {
        //    $http.post('/Admin/CardJob/GetObjectRelative/?CardCode=' + CardCode).success(callback);
        //},
        //deleteCardDependency: function (dependencyId, callback) {
        //    $http.post('/Admin/CardJob/DeleteCardDependency/?Id=' + dependencyId).success(callback);
        //},
        //getRelative: function (callback) {
        //    $http.post('/Admin/CardJob/GetRelative/').success(callback);
        //},
        //getUser: function (callback) {
        //    $http.post('/Admin/Contract/GetUser').success(callback);
        //},
        getAgentForShop: function (callback) {
            $http.post('/Admin/vcVendor/GetAgentForShop').success(callback);
        },
        getAgentForAgent: function (callback) {
            $http.post('/Admin/vcVendor/GetAgentForAgent').success(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số không âm
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0


    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        //var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.CusCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Mã NPP/Đại lý/Cửa hàng không chứa ký tự đặc biệt hoặc khoảng trắng!", "<br/>");
        }
        return mess;
    }
    //$rootScope.checkTelephone = function (data) {
    //    var partternTelephone = /^(0)+([0-9]{9,10})\b$/;
    //    var mess = { Status: false, Title: "" };
    //    if (!partternTelephone.test(data) && data != null && data != "") {
    //        mess.Status = true;
    //        mess.Title = mess.Title.concat(" - ", "Số điện thoại phải là chữ số [0-9]!", "<br/>");
    //    }
    //    return mess;
    //}
    $rootScope.checkDataMore = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        var a = data.ext_code;

        if (!partternCode.test(data.ext_code)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Mã trường mở rộng không chứa ký tự đặc biệt hoặc khoảng trắng!", "<br/>");
        }
        return mess;
    }
    $rootScope.validationOptions = {
        rules: {
            CusCode: {
                required: true,
                maxlength: 50
            },
            CusName: {
                required: true,
                maxlength: 255
            },
            Address: {
                required: true,
                maxlength: 500
            },
            TaxCode: {
                //required: true,
                maxlength: 100
            }
        },
        messages: {
            CusCode: {
                required: 'Nhập mã NPP/Đại lý/Cửa hàng!',
                maxlength: 'Mã NPP/Đại lý/Cửa hàng không vượt quá 50 kí tự!'
            },
            CusName: {
                required: 'Nhâp tên NPP/Đại lý/Cửa hàng!',
                maxlength: 'Tên NPP/Đại lý/Cửa hàng không vượt quá 255 kí tự!'
            },
            Address: {
                required: 'Nhập địa chỉ của NPP/Đại lý/Cửa hàng!',
                maxlength: 'Địa chỉ không được quá 500 kí tự!'
            },
            TaxCode: {
                maxlength: 'Mã số thuế không được quá 100 kí tự!'
            }

        }
    }
    jQuery.extend(jQuery.validator.messages, {
        email: "Vui lòng nhập địa chỉ email hợp lệ!",
    });

    $rootScope.validationOptionsmore = {
        rules: {
            ext_code: {
                required: true,
                maxlength: 100

            },
            ext_value: {
                required: true,
                maxlength: 500
            },

        },
        messages: {
            ext_code: {
                required: 'Nhập mã trường mở rộng!',
                maxlength: "Mã trường mở rộng không vượt quá 100 kí tự!"
            },
            ext_value: {
                required: 'Nhập giá trị cho trường mở rộng!',
                maxlength: "Giá trị trường mở rộng không vượt quá 500 kí tự!"
            },


        }
    }
    $rootScope.validationOptionsContact = {
        rules: {
            ContactName: {
                required: true
            },
            Email: {
                required: true
            },
            Mobile: {
                required: true,
                maxlength: 100,
                //minlength: 10,
            },
            Title: {
                maxlength: 1000
            },
            InChargeOf: {
                maxlength: 1000
            },
            Address: {
                maxlength: 500
            },
            Telephone: {
                maxlength: 100
            },
            Fax: {
                maxlength: 100
            },
            Facebook: {
                maxlength: 100
            },
            GooglePlus: {
                maxlength: 100
            },
            Twitter: {
                maxlength: 100
            },
            Skype: {
                maxlength: 100
            },
            Note: {
                maxlength: 1000
            },
        },
        messages: {
            ContactName: {
                required: 'Nhập tên liên lạc!',
                maxlength: "Tên liên lạc không vượt quá 50 kí tự!"
            },
            Email: {
                required: 'Nhập địa chỉ Email!'
            },
            Mobile: {
                required: 'Nhập số điện thoại!',
                maxlength: "Số di động không vượt quá 100 kí tự!",
                //minlength: "Số di động phải có 10 số trở lên!"
            },
            Title: {
                maxlength: "Chức vụ không vượt quá 1000 kí tự!"
            },
            InChargeOf: {
                maxlength: "Phụ trách không vượt quá 1000 kí tự!"
            },
            Address: {
                maxlength: "Địa chỉ không vượt quá 500 kí tự!"
            },
            Telephone: {
                maxlength: "Số máy bàn không vượt quá 100 kí tự!"
            },
            Fax: {
                maxlength: "Số fax không vượt quá 100 kí tự!"
            },
            Facebook: {
                maxlength: "Facebook không vượt quá 100 kí tự!"
            },
            GooglePlus: {
                maxlength: "Google+ không vượt quá 100 kí tự!"
            },
            Twitter: {
                maxlength: "Twitter không vượt quá 100 kí tự!"
            },
            Skype: {
                maxlength: "Skype không vượt quá 100 kí tự!"
            },
            Note: {
                maxlength: "Chú thích không vượt quá 1000 kí tự!"
            },
        }
    }
    $rootScope.validationOptionsAttr = {
        rules: {
            Code: {
                required: true
            },
            Value: {
                required: true
            }
        },
        messages: {
            Code: {
                required: 'Bắt buộc'
            },
            Value: {
                required: 'Bắt buộc'
            }
        }
    }
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    dataservice.getCustomerGroup(function (rs) {
        $rootScope.CustomerGroup = rs;
    })
    dataservice.getCustomerStatus(function (rs) {
        $rootScope.StatusData = rs;
    });
    dataservice.getArea(function (rs) {
        $rootScope.CustomerAreas = rs.Object;
    });
    dataservice.getCustomerType(function (rs) {
        $rootScope.CustomerTypes = rs.Object;
    });
    dataservice.getCustomerRole(function (rs) {
        $rootScope.CustomerRoles = rs.Object;
    });
    $rootScope.CustomerId = -999;
    $rootScope.model1 = {
        Role:''
    }
    $rootScope.Role = $rootScope.model1.Role;
    $rootScope.IsDisableSeller = false;

});

app.config(function ($routeProvider, $validatorProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/contact-add', {
            templateUrl: ctxfolder + '/contact_add.html',
            controller: 'contact_add'
        })
        .when('/file-add', {
            templateUrl: ctxfolder + '/file_add.html',
            controller: 'file_add'
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
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        CustomerCode: '',
        CustomerName: '',
        CustomerPhone: '',
        CustomerEmail: '',
        CustomerGroup: '',
        CustomerActivityStatus: '',
        Address: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/vcVendor/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CustomerCode = $scope.model.CustomerCode;
                d.CustomerName = $scope.model.CustomerName;
                d.CustomerPhone = $scope.model.CustomerPhone;
                d.CustomerEmail = $scope.model.CustomerEmail;
                d.CustomerGroup = $scope.model.CustomerGroup;
                d.CustomerActivityStatus = $scope.model.CustomerActivityStatus;
                d.Address = $scope.model.Address;
                d.Area = $scope.model.Area;
                d.CustomerRole = $scope.model.CustomerRole;
                
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusCode').withTitle('Mã').withOption('sClass', 'dataTable-pr10').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusName').withTitle('Tên NPP/Đầu mối/Cửa hàng').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('cusEmail').withTitle('Thư điện tử').renderWith(function (data, type) {
    //    return data;
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('cusMobilePhone').withTitle('Số điện thoại').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('cusGroup').withTitle('Nhóm').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusRole').withTitle('Vai trò').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('cusActivity').withTitle('Trạng thái').notSortable().renderWith(function (data, type, full) {
        if (data == "ACTIVE") {
            return '<span class="text-success"> Hoạt động</span>';
        } else if (data == "DEACTIVE") {
            return '<span class="text-danger">Không hoạt động</span>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Thao tác').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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


    $scope.initLoad = function () {
        dataservice.getCustomerGroup(function (rs) {
            $scope.CustomerGroup = rs;
        })
        dataservice.getArea(function (rs) {
            $scope.Areas = rs.Object;
        });
        dataservice.getListCustomer(function (rs) {
            $scope.listCustomer = rs;
        });
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.roleType = rs.Role;
                $rootScope.model1 = rs;
                $rootScope.CustomerId = id;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '70',
                    resolve: {
                        para: function () {
                            return id;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        });

        
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
    };

    //$scope.addCardJob = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: "/views/admin/CardJob/edit-tag.html",
    //        controller: 'edit-card',
    //        backdrop: 'static',
    //        size: '60',
    //        resolve: {
    //            para: function () {
    //                return "";
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        //$scope.reload();
    //    }, function () { });
    //};
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
    }
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }
    setTimeout(function () {
        //initAutocomplete();
        showHideSearch();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $rootScope.CustomerId = -999;
    $scope.roleType = '';
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.model = {
        GoogleMap: '',
        CusGroup: '',
        ActivityStatus: '',
        Address: '',
        Role: '',
        CusType: '',
        Area: '',
        Resource: '',
        Logo: '',
        Transport: ''
    }

    $scope.initLoad = function () {
        dataservice.getCustomerGroup(function (rs) {
            $scope.CustomerGroup = rs;
        });
        //dataservice.getArea(function (rs) {
        //    $rootScope.CustomerAreas = rs.Object;
        //});
        //dataservice.getCustomerType(function (rs) {
        //    $rootScope.CustomerTypes = rs.Object;
        //});
        dataservice.getAgentForShop(function (rs) {
            $scope.InAgentForShop = rs.Object;
        });
        dataservice.getAgentForAgent(function (rs) {
            $scope.InAgentForAgent = rs.Object;
        });
    }
    $scope.initLoad();

    $scope.chkSubTab = function () {
        if ($rootScope.CustomerId < 0) {
            App.toastrError("Vui lòng tạo trước NPP/Đại lý/Cửa hàng!");
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "distributor") {
            $scope.errorArea = false;
            $scope.model.Brand = null;
            $scope.model.ProductCode = null;
        }
        if (SelectType == "Area" && $scope.model.Area != "") {
            $scope.errorArea = false;
        }
        //if (SelectType == "CusGroup" && $scope.model.CusGroup != "") {
        //    $scope.errorCusGroup = false;
        //}
        if (SelectType == "Role" && $scope.model.Role != "") {

            $scope.model.InAgent = '';
            $scope.roleType = $scope.model.Role;
            $scope.errorRole = false;
        }
        //Bên vicem không bắt buộc cột này
        //if (SelectType == "CusType" && $scope.model.CusType != "") {
        //    $scope.errorCusType = false;
        //}
        if (SelectType == "ActivityStatus" && $scope.model.ActivityStatus != "") {
            $scope.errorActivityStatus = false;
        }

        if (SelectType == "MobilePhone" && $scope.model.MobilePhone && $rootScope.partternPhone.test($scope.model.MobilePhone) || $scope.model.MobilePhone == "") {
            $scope.errorMobilePhone = false;
        } else if (SelectType == "MobilePhone") {
            $scope.errorMobilePhone = true;
        }
        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax) || $scope.model.Fax == "") {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
        //Bên vicem không bắt buộc cột này
        //if (SelectType == "TaxCode" && $scope.model.TaxCode && $rootScope.partternNumber.test($scope.model.TaxCode) || $scope.model.TaxCode=="") {
        //    $scope.errorTaxCode = false;
        //} else if (SelectType == "TaxCode") {
        //    $scope.errorTaxCode = true;
        //}
        if (SelectType == "Identification" && $scope.model.Identification && $rootScope.partternNumber.test($scope.model.Identification) || $scope.model.Identification == "") {
            $scope.errorIdentification = false;
        } else if (SelectType == "Identification") {
            $scope.errorIdentification = true;
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    if ($scope.model.GoogleMap != '') {
                        return {
                            lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                            lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                            address: $scope.model.Address,
                        };
                    } else {
                        return '';
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    $scope.submit = function () {
        //Tạm ẩn để Chinh nhập dữ liệu
        //dataservice.insert($scope.model, function (result) {
        //    if (result.Error) {
        //        App.toastrError(result.Title);
        //    } else {

        //        App.toastrSuccess(result.Title);
        //        $rootScope.CustomerId = result.Object.CusID;
        //        $rootScope.model1 = result.Object;
        //        $rootScope.reloadNoResetPage();
        //    }
        //    App.unblockUI("#contentMain");
        //});
        validationSelect($scope.model);
        if ($scope.addForm.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataservice.insert($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    //$uibModalInstance.close();
                    $rootScope.CustomerId = result.Object.CusID;
                    $rootScope.model1 = result.Object;
                    $rootScope.Role = $rootScope.model1.Role;
                    $rootScope.IsDisableSeller = false;
                    if ($rootScope.Role == "VC_DISTRIBUTOR") {
                        $rootScope.IsDisableSeller = true;
                    }

                    $rootScope.reloadNoResetPage();
                }
                App.unblockUI("#contentMain");
            });
        }
    }
    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng;
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CusCode == "") {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;

        }
        if (data.CusName == "") {
            $scope.errorCusName = true;
            mess.Status = true;
        } else {
            $scope.errorCusName = false;

        }

        

        if (data.Area == "") {
            $scope.errorArea = true;
            mess.Status = true;
        } else {
            $scope.errorArea = false;

        }
        //if (data.CusGroup == "") {
        //    $scope.errorCusGroup = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCusGroup = false;

        //}
        debugger
        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
            if (data.Role == 'VC_SHOP') {
                if (data.Address == "") {
                    $scope.errorAddress = true;
                    mess.Status = true;
                } else {
                    $scope.errorAddress = false;

                }
            }
            else {
                $scope.errorAddress = false;
            }
        }
        //Bên vicem không bắt buộc CusType
        //if (data.CusType == "") {
        //    $scope.errorCusType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCusType = false;

        //}
        if (data.ActivityStatus == "") {
            $scope.errorActivityStatus = true;
            mess.Status = true;
        } else {
            $scope.errorActivityStatus = false;

        }
        if (data.MobilePhone && !$rootScope.partternPhone.test(data.MobilePhone)) {
            $scope.errorMobilePhone = true;
            mess.Status = true;
        } else {
            $scope.errorMobilePhone = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }
        //Bên vicem không  bắt buộc cột này
        //if (data.TaxCode && !$rootScope.partternNumber.test(data.TaxCode)) {
        //    $scope.errorTaxCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorTaxCode = false;
        //}
        if (data.Identification && !$rootScope.partternNumber.test(data.Identification)) {
            $scope.errorIdentification = true;
            mess.Status = true;
        } else {
            $scope.errorIdentification = false;
        }


        return mess;
    };
    setTimeout(function () {
        //initAutocomplete();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.roleType = '';
    $rootScope.CustomerId = para;

    $scope.model = {
        LocationText: '',
        LocationGps: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.roleType = $scope.model.Role;
                $rootScope.model1 = rs;
                $rootScope.Role = $rootScope.model1.Role;
                $rootScope.IsDisableSeller = false;
                if ($rootScope.Role == "VC_DISTRIBUTOR") {
                    $rootScope.IsDisableSeller = true;
                }
            }
        });
        dataservice.getArea(function (rs) {
            $scope.CustomerAreas = rs.Object;
        });
        dataservice.getCustomerType(function (rs) {
            $scope.CustomerTypes = rs.Object;
        });
        dataservice.getAgentForShop(function (rs) {
            $scope.InAgentForShop = rs.Object;
        });
        dataservice.getAgentForAgent(function (rs) {
            $scope.InAgentForAgent = rs.Object;
        });
    }
    $scope.initData();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "distributor") {
            $scope.errorArea = false;
            $scope.model.Brand = null;
            $scope.model.ProductCode = null;
        }
        if (SelectType == "Area" && $scope.model.Area != "") {
            $scope.errorArea = false;
        }
        //if (SelectType == "CusGroup" && $scope.model.CusGroup != "") {
        //    $scope.errorCusGroup = false;
        //}
        if (SelectType == "Role" && $scope.model.Role != "") {

            $scope.model.InAgent = '';
            $scope.roleType = $scope.model.Role;
            $scope.errorRole = false;
        }
        //Bên vicem không bắt buộc cột này
        //if (SelectType == "CusType" && $scope.model.CusType != "") {
        //    $scope.errorCusType = false;
        //}
        if (SelectType == "ActivityStatus" && $scope.model.ActivityStatus != "") {
            $scope.errorActivityStatus = false;
        }

        if (SelectType == "MobilePhone" && $scope.model.MobilePhone && $rootScope.partternPhone.test($scope.model.MobilePhone) || $scope.model.MobilePhone == "") {
            $scope.errorMobilePhone = false;
        } else if (SelectType == "MobilePhone") {
            $scope.errorMobilePhone = true;
        }
        if (SelectType == "Fax" && $scope.model.Fax && $rootScope.partternPhone.test($scope.model.Fax) || $scope.model.Fax == "") {
            $scope.errorFax = false;
        } else if (SelectType == "Fax") {
            $scope.errorFax = true;
        }
        //Bên vicem không bắt buộc cột này
        //if (SelectType == "TaxCode" && $scope.model.TaxCode && $rootScope.partternNumber.test($scope.model.TaxCode) || $scope.model.TaxCode=="") {
        //    $scope.errorTaxCode = false;
        //} else if (SelectType == "TaxCode") {
        //    $scope.errorTaxCode = true;
        //}
        if (SelectType == "Identification" && $scope.model.Identification && $rootScope.partternNumber.test($scope.model.Identification) || $scope.model.Identification == "") {
            $scope.errorIdentification = false;
        } else if (SelectType == "Identification") {
            $scope.errorIdentification = true;
        }
    }
    $scope.submit = function () {
        //Tạm ẩn để Chinh nhập dữ liệu
        //dataservice.update($scope.model, function (rs) {
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $uibModalInstance.close();
        //    }
        //});
        validationSelect($scope.model);
        if ($scope.editForm.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            //var mmsg = $rootScope.checkTelephone($scope.model.MobilePhone);
            //if (mmsg.Status) {
            //    // $scope.errorTelephone = true;
            //    App.toastrError(mmsg.Title);
            //    return;
            //}
            //var mmsg1 = $rootScope.checkTelephone($scope.model.Telephone);
            //if (mmsg1.Status) {
            //    // $scope.errorTelephone = true;
            //    App.toastrError(mmsg1.Title);
            //    return;
            //}
            dataservice.update($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return {
                        lt: parseFloat($scope.model.GoogleMap.split(',')[0]),
                        lg: parseFloat($scope.model.GoogleMap.split(',')[1]),
                        address: $scope.model.Address,
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.GoogleMap = d.lat + ',' + d.lng;
                $scope.model.Address = d.address;
            }
        }, function () { });
    }
    function innitAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('textAreaAddress'), options);

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            $("#locationGPS").val(lat + ',' + lng);
            $scope.model.GoogleMap = lat + ',' + lng
            $scope.model.Address = document.getElementById('textAreaAddress').value;
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CusCode == "") {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;

        }
        if (data.CusName == "") {
            $scope.errorCusName = true;
            mess.Status = true;
        } else {
            $scope.errorCusName = false;

        }

        if (data.Area == "") {
            $scope.errorArea = true;
            mess.Status = true;
        } else {
            $scope.errorArea = false;

        }
        //if (data.CusGroup == "") {
        //    $scope.errorCusGroup = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCusGroup = false;

        //}
        if (data.Role == "") {
            $scope.errorRole = true;
            mess.Status = true;
        } else {
            $scope.errorRole = false;
            if (data.Role == "VC_SHOP")
            {
                if (data.Address == "") {
                    $scope.errorAddress = true;
                    mess.Status = true;
                } else {
                    $scope.errorAddress = false;

                }
            }
            else {
                $scope.errorAddress = false;
            }
        }
        //Bên vicem không bắt buộc CusType
        //if (data.CusType == "") {
        //    $scope.errorCusType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCusType = false;

        //}
        if (data.ActivityStatus == "") {
            $scope.errorActivityStatus = true;
            mess.Status = true;
        } else {
            $scope.errorActivityStatus = false;

        }
        if (data.MobilePhone && !$rootScope.partternPhone.test(data.MobilePhone)) {
            $scope.errorMobilePhone = true;
            mess.Status = true;
        } else {
            $scope.errorMobilePhone = false;
        }
        if (data.Fax && !$rootScope.partternPhone.test(data.Fax)) {
            $scope.errorFax = true;
            mess.Status = true;
        } else {
            $scope.errorFax = false;
        }
        //Bên vicem không  bắt buộc cột này
        //if (data.TaxCode && !$rootScope.partternNumber.test(data.TaxCode)) {
        //    $scope.errorTaxCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorTaxCode = false;
        //}
        if (data.Identification && !$rootScope.partternNumber.test(data.Identification)) {
            $scope.errorIdentification = true;
            mess.Status = true;
        } else {
            $scope.errorIdentification = false;
        }


        return mess;
    };
    setTimeout(function () {
        innitAutocomplete();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('trade_relationship', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.userModel = {}
    $scope.IsAdd = true;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/vcVendor/JTableTrade",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contact-main",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.Id = $rootScope.CustomerId;
            },
            complete: function () {
                App.unblockUI("#contact-main");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('txtBrand').withTitle('Thương hiệu').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('txtSeller').withTitle('Đầu mối/NPP').renderWith(function (data, type, full) {
        if (full.SellerRole == 'VC_AGENT')
            return '<b><span style="color:#F1C40F">ĐM - ' + data+'</span></b>';
        else if (full.SellerRole == 'VC_DISTRIBUTOR')
            return '<b><span style="color:#36c6d3">NPP - ' + data + '</span></b>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Thao tác').withOption('sClass', '').renderWith(function (data, type, full, meta) {
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


    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/addTrade.html',
    //        controller: 'addTrade',
    //        backdrop: false,
    //        size: '40'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //}
    $scope.edit = function (id) {
        $scope.IsAdd = false;
        
        var listdata = $('#tblDataIndex').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                $scope.userModel = listdata[i];
                break;
            }
        }
        $scope.model.Seller = $scope.userModel.Seller;
        $scope.model.Brand = $scope.userModel.Brand;
    }
    $scope.delete = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {

                    dataservice.deleteTrade(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }
    //$scope.Role = $rootScope.model1.Role;
    //$scope.IsDisableSeller = false;
    //if ($scope.Role == "VC_DISTRIBUTOR") {
    //    $scope.IsDisableSeller = true;
    //}
    //console.log($rootScope.model1.Role);
    $scope.model = {
        //ProductCode: '',
        Brand: '',
        Buyer: '',
        Seller: '',
    }
    $scope.initLoad = function () {
        dataservice.getBrands(function (rs) {
            $scope.Brands = rs.Object;
        })
        //dataservice.getProducts(function (rs) {
        //    $scope.Products = rs.Object;
        //})

        if ($rootScope.model1.Role == "VC_DISTRIBUTOR") {
            dataservice.getBrands(function (rs) {
                $scope.Brands = rs.Object;
            })
            //dataservice.getProducts(function (rs) {
            //    $scope.Products = rs.Object;
            //})
        }
        else if ($rootScope.model1.Role == "VC_AGENT") {
            dataservice.getDistributors(function (rs) {
                $scope.Distributors = rs.Object;
            });

        }
        else if ($rootScope.model1.Role == "VC_SHOP") {
            dataservice.getDistributorsAgents(function (rs) {
                $scope.Distributors = rs.Object;
            });

        }
    }
    $scope.initLoad();
    $scope.validator = function (data) {
        debugger
        var msg = {
            Title: '',
            Error:false
        }
        if ($rootScope.Role != "VC_DISTRIBUTOR") {
            if ($scope.model.Seller == '' || $scope.model.Brand == '') {  //|| $scope.model.ProductCode == ''
                msg.Error = true;
                msg.Title = "Vui lòng nhập đủ thông tin người bán, thương hiệu";
            }
        }
        else {
            if ($scope.model.Brand == '') {  //|| $scope.model.ProductCode == ''
                msg.Error = true;
                msg.Title = "Vui lòng nhập đủ thông tin thương hiệu";
            }
        }

        return msg;
    }
    $scope.submit = function () {
        
        var msg = $scope.validator($scope.model);
        if (msg.Error == false) {
            $scope.model.Buyer = $rootScope.model1.CusCode;
            dataservice.insertTrade($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    reloadData(false);
                }
            });
        }
        else {
            App.toastrError(msg.Title);
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.clear = function () {
        $scope.model.Brand = '';
        //$scope.model.ProductCode = '';
        $scope.Brands = [];
        //$scope.Products = [];
    };
    $scope.cancelUpdate = function () {
        $scope.model = {
            //ProductCode: '',
            Brand: '',
            Buyer: '',
            Seller: '',
        }
        $scope.IsAdd = true;
    };
    

    $scope.changleSelect = function (type) {
        debugger
        if (type == "distributor") {
            dataservice.getBrandsBySeller($scope.model.Seller, function (rs) {
                $scope.Brands = rs.Object;
                $scope.model.Brand = $scope.userModel.Brand;
            })
            //dataservice.getProductsBySeller($scope.model.Seller, function (rs) {
            //    $scope.Products = rs.Object;
            //    $scope.model.ProductCode = $scope.userModel.ProductCode;
            //})
            $scope.model.Brand = '';
            //$scope.model.ProductCode = '';
        }
    }
    $scope.update = function () {
        $scope.model.Id = $scope.userModel.Id;
        var msg = $scope.validator($scope.model);
        
        if (msg.Error == false) {
            $scope.model.Buyer = $rootScope.model1.CusCode;
            dataservice.updateTrade($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    reloadData(false);
                }
            });
        }
        else {
            App.toastrError(msg.Title);
        }
    }
});
//app.controller('addTrade', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
//    $scope.Role = $rootScope.model1.Role;
//    $scope.model = {
//        ProductCode: '',
//        Brand: '',
//        Buyer: '',
//        Seller: '',
//    }
//    $scope.initLoad = function () {
//        if ($rootScope.model1.Role == "VC_DISTRIBUTOR") {
//            dataservice.getBrands(function (rs) {
//                $scope.Brands = rs.Object;
//            })
//            dataservice.getProducts(function (rs) {
//                $scope.Products = rs.Object;
//            })
//        }
//        else if ($rootScope.model1.Role == "VC_AGENT") {
//            dataservice.getDistributors(function (rs) {
//                $scope.Distributors = rs.Object;
//            });

//        }
//        else if ($rootScope.model1.Role == "VC_SHOP") {
//            dataservice.getDistributorsAgents(function (rs) {
//                $scope.Distributors = rs.Object;
//            });

//        }
//    }
//    $scope.initLoad();
//    $scope.validator = function (data) {
//        var msg = {
//            Title: '',
//            Error:false
//        }
//        if ($scope.Role != "DISTRIBUTOR") {
//            if ($scope.model.Seller == '' || $scope.model.Brand == '' || $scope.model.ProductCode == '') {
//                msg.Error = true;
//                msg.Title = "Vui lòng nhập đủ thông tin người bán, sản phẩm, chủng loại";
//            }
//        }
//        else {
//            if ($scope.model.Brand == '' || $scope.model.ProductCode == '') {
//                msg.Error = true;
//                msg.Title = "Vui lòng nhập đủ thông tin sản phẩm, chủng loại";
//            }
//        }

//        return msg;
//    }
//    $scope.submit = function () {
//        var msg = $scope.validator($scope.model);
//        if (msg.Error == false) {
//            $scope.model.Buyer = $rootScope.model1.CusCode;
//            dataservice.insertTrade($scope.model, function (result) {
//                if (result.Error) {
//                    App.toastrError(result.Title);
//                } else {
//                    App.toastrSuccess(result.Title);
//                }
//            });
//        }
//        else {
//            App.toastrError(msg.Title);
//        }
//    }
//    $scope.cancel = function () {
//        $uibModalInstance.close();
//    };
//    $scope.clear = function () {
//        $scope.model.Brand = '';
//        $scope.model.ProductCode = '';
//    };

//    $scope.changleSelect = function (type) {
//        if (type == "distributor") {
//            dataservice.getBrandsBySeller($scope.model.Seller, function (rs) {
//                $scope.Brands = rs.Object;
//            })
//            dataservice.getProductsBySeller($scope.model.Seller, function (rs) {
//                $scope.Products = rs.Object;
//            })
//            $scope.model.Brand = '';
//            $scope.model.ProductCode = '';
//        }
//    }
//});
//app.controller('editTrade', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
//    $scope.Role = $rootScope.model1.Role;
//    $scope.model = {
//        ProductCode: '',
//        Brand: '',
//        Buyer: '',
//        Seller: '',
//    }
//    $scope.initLoad = function () {
//        if ($rootScope.model1.Role == "VC_DISTRIBUTOR") {
//            dataservice.getBrands(function (rs) {
//                $scope.Brands = rs.Object;
//            })
//            dataservice.getProducts(function (rs) {
//                $scope.Products = rs.Object;
//            })
//        }
//        else if ($rootScope.model1.Role == "VC_AGENT") {
//            dataservice.getDistributors(function (rs) {
//                $scope.Distributors = rs.Object;
//            });

//        }
//        else if ($rootScope.model1.Role == "VC_SHOP") {
//            dataservice.getDistributorsAgents(function (rs) {
//                $scope.Distributors = rs.Object;
//            });

//        }
//    }
//    $scope.initLoad();
//    $scope.submit = function () {
//        $scope.model.Buyer = $rootScope.model1.CusCode;
//        dataservice.insertTrade($scope.model, function (result) {
//            if (result.Error) {
//                App.toastrError(result.Title);
//            } else {
//                App.toastrSuccess(result.Title);
//            }
//        });
//    }
//    $scope.cancel = function () {
//        $uibModalInstance.close();
//    };

//    $scope.changleSelect = function (type) {

//        if (type == "distributor") {
//            dataservice.getBrandsBySeller($scope.model.Seller, function (rs) {
//                $scope.Brands = rs.Object;
//            })
//            dataservice.getProductsBySeller($scope.model.Seller, function (rs) {
//                $scope.Products = rs.Object;
//            })

//        }
//    }
//});

app.controller('managerTransporter', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/vcVendor/JTableTransporter",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contact-main",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $rootScope.CustomerId;
            },
            complete: function () {
                App.unblockUI("#contact-main");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns1 = [];
    vm.dtColumns1.push(DTColumnBuilder.newColumn('LicensePlate').withTitle('Biển số').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('CustomTypeTxt').withTitle('Loại xe').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('InsurranceDuration').withTitle('Thời hạn bảo hiểm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('RegistryDuration').withTitle('Thời gian đăng ký').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('Thao tác').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="editTransporter(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));

    vm.reloadData1 = reloadData1;
    vm.dtInstance1 = {};

    function reloadData1(resetPaging) {
        vm.dtInstance1.reloadData(callback, resetPaging);
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
        reloadData1(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addTransporter.html',
            controller: 'addTransporter',
            backdrop: false,
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }
    $scope.editTransporter = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/editTransporter.html',
            controller: 'editTransporter',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.delete = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {

                    dataservice.deleteTransporter(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }
});
app.controller('addTransporter', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        LicensePlate: '',
        CustomType:''
    }
    $scope.Groups = [
        {
            Code: 'G1',
            Name: 'Nhóm 1'
        },
        {
            Code: 'G2',
            Name: 'Nhóm 2'
        },
        {
            Code: 'G3',
            Name: 'Nhóm 3'
        }
    ];
    $scope.TransporterTypes = [];
    $scope.Role = $rootScope.model1.Role;
    $scope.initLoad = function () {
        dataservice.getTransportWeight(function (rs) {
            $scope.TransporterTypes = rs.Object;
        })
        if ($rootScope.model1.Role == "VC_DISTRIBUTOR") {
            dataservice.getBrands(function (rs) {
                $scope.Brands = rs.Object;
            })
            //dataservice.getProducts(function (rs) {
            //    $scope.Products = rs.Object;
            //})
        }
        else if ($rootScope.model1.Role == "VC_AGENT") {
            dataservice.getDistributors(function (rs) {
                $scope.Distributors = rs.Object;
            });

        }
        else if ($rootScope.model1.Role == "VC_SHOP") {
            dataservice.getDistributorsAgents(function (rs) {
                $scope.Distributors = rs.Object;
            });

        }
    }
    $scope.initLoad();

    $scope.cancel = function () {
        $uibModalInstance.close();
    };

    $scope.changleSelect = function (type) {

        if (type == "distributor") {
            dataservice.getBrandsBySeller($scope.model.Seller, function (rs) {
                $scope.Brands = rs.Object;
            })
            //dataservice.getProductsBySeller($scope.model.Seller, function (rs) {
            //    $scope.Products = rs.Object;
            //})

        }
    }
    $scope.uploadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);

        if (validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    //App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                    App.toastrError("Chọn sai định dạng ảnh");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        //App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                        App.toastrError("Ảnh không được > 1M");
                    } else {
                        var fileUpload = $("#file").get(0);
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
                                if (width > 5000 || height > 5000) {
                                    //App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                    App.toastrError("Kích thước ảnh phải < 500 x 500");
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {

                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            //$scope.model.RegistryDurationTxt = $scope.model.RegistryDuration;
                                            //$scope.model.InsurranceDurationTxt = $scope.model.InsurranceDuration;
                                            //$scope.model.RegistryDuration = null;
                                            //$scope.model.InsurranceDuration = null;
                                            $scope.model.OwnerCode = $rootScope.model1.CusCode;

                                            dataservice.insertTransporter($scope.model, function (rs) {
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                $scope.model.OwnerCode = $rootScope.model1.CusCode;
                dataservice.insertTransporter($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    function loadDate() {
        $("#RegistryDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#InsurranceDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    function validationSelect(data) {
        debugger
        var mess = { Status: false, Title: "" };
        if (data.CustomType == "") {
            $scope.errorCustomType = true;
            mess.Status = true;
        } else {
            $scope.errorCustomType = false;

        }
        //if (data.LicensePlate == "") {
        //    $scope.errorLicensePlate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorLicensePlate = false;

        //}
        return mess;
    };
});
app.controller('editTransporter', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $scope.Groups = [
        {
            Code: 'G1',
            Name: 'Nhóm 1'
        },
        {
            Code: 'G2',
            Name: 'Nhóm 2'
        },
        {
            Code: 'G3',
            Name: 'Nhóm 3'
        }
    ];
    $scope.model = {
        Seller: '',
        Brand: ''
    }
    $scope.IsUploadImage = false;
    $scope.initLoad = function () {
        dataservice.getTransportWeight(function (rs) {
            $scope.TransporterTypes = rs.Object;
            dataservice.getTransporterInfo(para, function (rs) {
                $scope.model = rs.Object;
            })
        })

    }
    $scope.initLoad();
    $scope.submit = function () {
        //validationSelect($scope.model);

        if (validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($scope.IsUploadImage == true) {
                var fileName = $('input[type=file]').val();
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "") {
                    if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                        //App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                        App.toastrError("Chọn sai định dạng ảnh");
                    } else {
                        var fi = document.getElementById('file');
                        var fsize = (fi.files.item(0).size) / 1024;
                        if (fsize > 1024) {
                            //App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                            App.toastrError("Ảnh không được > 1M");
                        } else {
                            var fileUpload = $("#file").get(0);
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
                                    if (width > 5000 || height > 5000) {
                                        //App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                        App.toastrError("Kích thước ảnh phải < 500 x 500");
                                    } else {
                                        var data = new FormData();
                                        file = fileUpload.files[0];
                                        data.append("FileUpload", file);
                                        dataservice.uploadImage(data, function (rs) {
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                                return;
                                            }
                                            else {

                                                $scope.model.Image = '/uploads/images/' + rs.Object;
                                                dataservice.updateTransporter($scope.model, function (rs) {
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $uibModalInstance.close();
                                                    }
                                                });
                                            }
                                        })
                                    }
                                };
                            }
                        }
                    }
                } else {
                    dataservice.updateTransporter($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
                //}
            }
            else {
                dataservice.updateTransporter($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
        
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.uploadImage = function () {

        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            $scope.IsUploadImage = true;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.changleSelect = function (type) {

        if (type == "distributor") {
            dataservice.getBrandsBySeller($scope.model.Seller, function (rs) {
                $scope.Brands = rs.Object;
            })
            //dataservice.getProductsBySeller($scope.model.Seller, function (rs) {
            //    $scope.Products = rs.Object;
            //})

        }
    }
    function loadDate() {
        $("#RegistryDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#InsurranceDuration").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" };
        if (data.CustomType == "") {
            $scope.errorCustomType = true;
            mess.Status = true;
        } else {
            $scope.errorCustomType = false;

        }
       
        return mess;
    };
});
app.controller('google-map', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }
    $scope.initMap = function () {
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initMap();
    function initData() {
        //init
        if (para) {
            lat = para.lt;
            lng = para.lg;
            address = para.address;
            document.getElementById("startPlace").value = para.address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        var centerPoint = { lat: lat, lng: lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };




        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);



        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });



        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyDHceKL6LCQusky6nFYduGFGcg4UKyTI6o';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                service.getDetails({
                    placeId: data.results[0].place_id
                }, function (result, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        var html = "<b>" + result.name + "</b> <br/>" + result.formatted_address;
                        infowindow.setContent(html);
                        infowindow.open(map, marker, html);
                        document.getElementById("startPlace").value = result.formatted_address;
                        address = result.formatted_address;
                        $scope.$apply();
                    }
                });


            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }
    setTimeout(function () {
        initData();
        setModalDraggable('.modal-dialog');
    }, 200)
});
