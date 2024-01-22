var ctxfolder = "/views/admin/contractPoCustomer";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCard = "/views/admin/cardJob";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', 'dynamicNumber']);
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
        //PaymentTicket
        deleteProjectPayment: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Delete/', data).then(callback);
        },
        getPayment: function (data, callback) {
            $http.get('/Admin/MaterialPaymentTicket/GetItem/' + data).then(callback);
        },
        checkContract: function (data, callback) {
            $http.get('/Admin/MaterialPaymentTicket/CheckContract?contractCode=' + data).then(callback);
        },
        updateContractPayment: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Update', data).then(callback);
        },
        //common
        getListCommon: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetListCommon').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertContract/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteContract/' + data).then(callback);
        },
        getSigner: function (callback) {
            $http.post('/Admin/contractPoCustomer/JtreeSigner').then(callback);
        },
        getItemAdd: function (data, callback) {
            $http.get('/Admin/contractPoCustomer/GetItemAdd?code=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetItem?Id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getListUserContract: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetListUser').then(callback);
        },
        getCustomers: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetCustomers/').then(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetSuppliers/').then(callback);
        },

        getTask: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetTask').then(callback);
        },
        insertTagPeople: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertTagPeople', data).then(callback);
        },
        deleteTagPeople: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteTagPeople', data).then(callback);
        },

        getContractNote: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetContractNote', data).then(callback);
        },
        insertContractNote: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertContractNote', data).then(callback);
        },
        updateContractNote: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/UpdateContractNote', data).then(callback);
        },
        deleteContractNote: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteContractNote', data).then(callback);
        },
        getUserlogin: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetUserlogin').then(callback);
        },


        deleteNotification: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteNotification', data).then(callback);
        },

        getContractDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetContractDetail/' + data).then(callback);
        },
        insertContractDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertContractDetail/', data).then(callback);
        },
        updateContractDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/UpdateContractDetail/', data).then(callback);
        },
        deleteContractDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteContractDetail/' + data).then(callback);
        },

        getContractFile: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetContractFile/' + data).then(callback);
        },
        insertContractFile: function (data, callback) {
            submitFormUpload('/Admin/contractPoCustomer/InsertContractFile/', data, callback);
        },
        updateContractFile: function (data, callback) {
            submitFormUpload('/Admin/contractPoCustomer/UpdateContractFile/', data, callback);
        },
        deleteContractFile: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteContractFile/' + data).then(callback);
        },
        getTreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeRepository').then(callback);
        },
        //jtreeRepository: function (callback) {
        //    $http.post('/Admin/EDMSRepository/JtreeRepository').then(callback);
        //},

        getContractAttr: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetContractAttr/' + data).then(callback);
        },
        insertContractAttr: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertContractAttr/', data).then(callback);
        },
        updateContractAttr: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/UpdateContractAttr/', data).then(callback);
        },
        deleteContractAttr: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteContractAttr/' + data).then(callback);
        },

        getCurrency: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetCurrency').then(callback);
        },
        getContractType: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetContractType').then(callback);
        },
        getMainService: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetMainService').then(callback);
        },
        getContractExtendGroup: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetContractExtendGroup').then(callback);
        },
        getContractStatus: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetContractStatus/').then(callback);
        },

        getContract: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetContract').then(callback);
        },
        checkContract: function (data, callback) {
            $http.get('/Admin/MaterialPaymentTicket/CheckContract?contractCode=' + data).then(callback);
        },
        getPaymentObjType: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetPaymentObjType').then(callback);
        },
        getUnitCurrency: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetUnit').then(callback);
        },
        getPaymentType: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetPaymentType').then(callback);
        },
        getObjPayment: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetObjPayment').then(callback);
        },
        insertContractPayment: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Insert', data).then(callback);
        },

        //CardJob
        addCardRelative: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/AddCardRelative/', data).then(callback);
        },


        getTeams: function (callback) {
            $http.post('/Admin/CardJob/GetTeams').then(callback);
        },
        addTeam: function (data, callback) {
            $http.post('/Admin/CardJob/InsertTeam/', data).then(callback);
        },
        getTeams: function (callback) {
            $http.post('/Admin/CardJob/GetTeams/').then(callback);
        },
        getTeam: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/GetTeam/?TeamCode=' + TeamCode).then(callback);
        },
        deleteTeam: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/DeleteTeam/?TeamCode=' + TeamCode).then(callback);
        },
        getTeamMember: function (TeamCode, callback) {
            $http.post('/Admin/CardJob/GetTeamMember/?TeamCode=' + TeamCode).then(callback);
        },
        editTeam: function (data, callback) {
            $http.post('/Admin/CardJob/EditTeam/', data).then(callback);
        },

        getBoards: function (callback) {
            $http.post('/Admin/CardJob/GetBoards/').then(callback);
        },
        getBoardsType: function (callback) {
            $http.post('/Admin/CardJob/GetBoardsType/').then(callback);
        },
        insertBoard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertBoard/', data).then(callback);
        },

        insertList: function (data, callback) {
            $http.post('/Admin/CardJob/InsertList/', data).then(callback);
        },
        getLists: function (BoardCode, callback) {
            $http.post('/Admin/CardJob/GetLists/?BoardCode=' + BoardCode).then(callback);
        },

        getCurrency: function (callback) {
            $http.post('/Admin/CardJob/GetCurrency').then(callback);
        },
        getUnit: function (callback) {
            $http.get('/Admin/CardJob/GetUnit').then(callback);
        },
        getCards: function (data, callback) {
            $http.post('/Admin/CardJob/GetCards/?BoardCode=' + data).then(callback);
        },
        getCardsByList: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardsByList/?ListCode=' + data).then(callback);
        },
        getCardDetail: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardDetail/?CardCode=' + data).then(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCard/', data).then(callback);
        },
        deleteCard: function (id, callback) {
            $http.post('/Admin/CardJob/DeleteCard/' + id).then(callback);
        },
        getLevels: function (callback) {
            $http.post('/Admin/CardJob/GetLevels/').then(callback);
        },
        getCardMember: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetCardMember/?CardCode=' + CardCode).then(callback);
        },
        getCardTeam: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetCardTeam/?CardCode=' + CardCode).then(callback);
        },
        getCardActivityByUser: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetCardActivityByUser/?CardCode=' + CardCode).then(callback);
        },
        changeWorkType: function (cardCode, type, callback) {
            $http.post('/Admin/CardJob/ChangeWorkType/?CardCode=' + cardCode + '&Type=' + type).then(callback);
        },
        changeCardStatus: function (cardCode, status, callback) {
            $http.post('/Admin/CardJob/ChangeCardStatus/?CardCode=' + cardCode + '&Status=' + status).then(callback);
        },
        changeCardLevel: function (cardCode, level, callback) {
            $http.post('/Admin/CardJob/ChangeCardLevel/?CardCode=' + cardCode + '&Level=' + level).then(callback);
        },
        changeCheckTitle: function (checkCode, title, callback) {
            $http.post('/Admin/CardJob/ChangeCheckTitle/?CheckCode=' + checkCode + '&Title=' + title).then(callback);
        },
        sortListByStatus: function (boardCode, orther, callback) {
            $http.post('/Admin/CardJob/SortListByStatus/?BoardCode=' + boardCode + '&Orther=' + orther).then(callback);
        },
        getWorkType: function (callback) {
            $http.post('/Admin/CardJob/GetWorkType/').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/CardJob/GetStatus/').then(callback);
        },
        getCardProgress: function (cardCode, callback) {
            $http.get('/Admin/CardJob/GetCardProgress?CardCode=' + cardCode).then(callback);
        },

        updateCardName: function (cardId, newName, callback) {
            $http.post('/Admin/CardJob/UpdateCardName/?CardID=' + cardId + '&NewName=' + newName).then(callback);
        },
        updateCardDescription: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCardDescription', data).then(callback);
        },
        updateCardLabel: function (cardCode, label, callback) {
            $http.post('/Admin/CardJob/UpdateCardLabel/?CardCode=' + cardCode + "&Label=" + label).then(callback);
        },
        changeListCard: function (cardCode, listCode, callback) {
            $http.post('/Admin/CardJob/ChangeListCard/?CardCode=' + cardCode + "&ListCode=" + listCode).then(callback);
        },
        updateWeightNum: function (cardCode, weightNum, callback) {
            $http.post('/Admin/CardJob/UpdateWeightNum/?CardCode=' + cardCode + '&WeightNum=' + weightNum).then(callback);
        },
        updateCost: function (cardCode, cost, callback) {
            $http.post('/Admin/CardJob/UpdateCost/?CardCode=' + cardCode + '&Cost=' + cost).then(callback);
        },
        updateCurrency: function (cardCode, currency, callback) {
            $http.post('/Admin/CardJob/UpdateCurrency/?CardCode=' + cardCode + '&Currency=' + currency).then(callback);
        },
        updateActivity: function (cardCode, value, isCheck, callback) {
            $http.get('/Admin/CardJob/UpdateActivity/?CardCode=' + cardCode + '&Value=' + value + '&IsCheck=' + isCheck).then(callback);
        },
        updateAddress: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateAddress/', data).then(callback);
        },
        updateProgress: function (cardCode, progress, callback) {
            $http.post('/Admin/CardJob/UpdateProgress/?CardCode=' + cardCode + '&Progress=' + progress).then(callback);
        },
        updateBeginTime: function (cardCode, beginTime, callback) {
            $http.post('/Admin/CardJob/UpdateBeginTime/?CardCode=' + cardCode + '&BeginTime=' + beginTime).then(callback);
        },
        updateEndTime: function (cardCode, endTime, callback) {
            $http.post('/Admin/CardJob/UpdateEndTime/?CardCode=' + cardCode + '&EndTime=' + endTime).then(callback);
        },
        updateDeadLine: function (cardCode, deadLine, callback) {
            $http.post('/Admin/CardJob/UpdateDeadLine/?CardCode=' + cardCode + '&DeadLine=' + deadLine).then(callback);
        },
        updateQuantitative: function (cardCode, quantitative, callback) {
            $http.post('/Admin/CardJob/UpdateQuantitative/?CardCode=' + cardCode + '&Quantitative=' + quantitative).then(callback);
        },
        updateUnit: function (cardCode, unit, callback) {
            $http.post('/Admin/CardJob/UpdateUnit/?CardCode=' + cardCode + '&Unit=' + unit).then(callback);
        },

        addMember: function (data, callback) {
            $http.post('/Admin/CardJob/AddMember/', data).then(callback);
        },
        getActivityCardMember: function (data, callback) {
            $http.get('/Admin/CardJob/GetActivityCardMember?cardCode=' + data).then(callback);
        },

        getMaxWeightNumCheckList: function (data, callback) {
            $http.post('/Admin/CardJob/GetMaxWeightNumCheckList/?CardCode=' + data).then(callback);
        },
        getCheckList: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetCheckLists/?CardCode=' + cardCode).then(callback);
        },
        addCheckList: function (cardCode, data, data1, callback) {
            $http.post('/Admin/CardJob/AddCheckList/?CardCode=' + cardCode + '&Title=' + data + '&WeightNum=' + data1).then(callback);
        },
        deleteCheckList: function (checkCode, callback) {
            $http.post('/Admin/CardJob/DeleteCheckList/?CheckCode=' + checkCode).then(callback);
        },

        addCheckItem: function (checkCode, data, callback) {
            $http.post('/Admin/CardJob/AddCheckItem/?CheckCode=' + checkCode + '&Title=' + data).then(callback);
        },
        getCheckItem: function (checkCode, callback) {
            $http.post('/Admin/CardJob/GetCheckItem/?CheckCode=' + checkCode).then(callback);
        },
        changeChkItemStatus: function (itemId, callback) {
            $http.post('/Admin/CardJob/ChangeItemStatus/?Id=' + itemId).then(callback);
        },
        changeChkItemTitle: function (itemId, title, callback) {
            $http.post('/Admin/CardJob/ChangeItemTitle/?Id=' + itemId + '&Title=' + title).then(callback);
        },
        deleteCheckItem: function (itemid, callback) {
            $http.post('/Admin/CardJob/DeleteCheckItem/?Id=' + itemid).then(callback);
        },

        addComment: function (cardCode, content, callback) {
            $http.post('/Admin/CardJob/AddComment/?CardCode=' + cardCode + '&Content=' + content).then(callback);
        },
        getComment: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetComments/?CardCode=' + cardCode).then(callback);
        },
        deleteComment: function (cmtId, callback) {
            $http.post('/Admin/CardJob/DeleteComment/?CommentId=' + cmtId).then(callback);
        },
        updateComment: function (cmtId, content, callback) {
            $http.post('/Admin/CardJob/UpdateComment/?CmtId=' + cmtId + '&Content=' + content).then(callback);
        },

        addAttachment: function (data, callback) {
            $http.post('/Admin/CardJob/AddAttachment/', data).then(callback);
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/CardJob/UploadFile/', data, callback);
        },
        getAttachment: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetAttachment/?CardCode=' + cardCode).then(callback);
        },
        deleteAttachment: function (fileCode, callback) {
            $http.post('/Admin/CardJob/DeleteAttachment/?FileCode=' + fileCode).then(callback);
        },


        getObjDependency: function (callback) {
            $http.post('/Admin/CardJob/GetObjDependency').then(callback);
        },
        setObjectRelative: function (data, callback) {
            $http.post('/Admin/CardJob/SetObjectRelative/', data).then(callback);
        },
        advanceSearch: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearch/', data).then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        insertCardDependency: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCardDependency/', data).then(callback);
        },
        getCardDependency: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetObjectRelative/?CardCode=' + CardCode).then(callback);
        },
        deleteCardDependency: function (dependencyId, callback) {
            $http.post('/Admin/CardJob/DeleteCardDependency/?Id=' + dependencyId).then(callback);
        },
        getRelative: function (callback) {
            $http.post('/Admin/CardJob/GetRelative/').then(callback);
        },


        getProduct: function (callback) {
            $http.post('/Admin/CardJob/GetProduct/').then(callback);
        },
        getCardProduct: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardProduct?CardCode=' + data).then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/CardJob/InsertProduct/', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.get('/Admin/CardJob/DeleteProduct?id=' + data).then(callback);
        },

        //Lấy danh sách đối tượng
        getListObjectType: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectType/').then(callback);
        },
        //Lấy danh sách mã đối tượng có chứa file
        getListObjectCode: function (objectType, objectCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectType=' + objectType + '&&objectCode=' + objectCode).then(callback);
        },
        //Lấy danh sách file theo mã đối tượng
        getListFileCode: function (objectType, objCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileCode?objectType=' + objectType + '&&objCode=' + objCode).then(callback);
        },
        //Lấy danh sách file được chia sẻ theo mã đối tượng được chia sẻ
        getListFileShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileShare?objectCodeShared=' + data).then(callback);
        },
        //Chia sẻ file
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        //Xóa chia sẻ file
        deleteFileShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteFileShare?id=' + data).then(callback);
        },

        //tab service 
        getService: function (callback) {
            $http.get('/Admin/contractPoCustomer/GetService').then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertService', data).then(callback);
        },
        updateService: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/UpdateService', data).then(callback);
        },
        deleteServiceDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteServiceDetail?Id=' + data).then(callback);
        },
        getServiceDetail: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetServiceDetail?Id=' + data).then(callback);
        },
        getServiceUnit: function (callback) {
            $http.get('/Admin/contractPoCustomer/GetServiceUnit').then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/InsertProduct', data).then(callback);
        },
        getProduct: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetProduct').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetListProduct').then(callback);
        },
        getServiceCondition: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetServiceCondition').then(callback);
        },
        getCostByServiceAndCondition: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetCostByServiceAndCondition').then(callback);
        },
        getCostTotalContract: function (callback) {
            $http.post('/Admin/contractPoCustomer/GetCostTotalContract').then(callback);
        },

        //đặt hàng
        insert: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/Insert/', data).then(callback);
        },
        getUpdateLog: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetUpdateLog?PoCusCode=' + data).then(callback);
        },
        getListConfirmText: function (data, callback) {
            $http.post('/Admin/contractPoCustomer/GetListConfirmText?poCusCode=' + data).then(callback);
        },
        updateConfirmTextById: function (poCusCode, id, confirm, callback) {
            $http.post('/Admin/contractPoCustomer/UpdateConfirmTextById?poCusCode=' + poCusCode + '&&id=' + id + '&&confirm=' + confirm).then(callback);
        },
        deleteConfirmTextById: function (poCusCode, id, callback) {
            $http.post('/Admin/contractPoCustomer/DeleteConfirmTextById?poCusCode=' + poCusCode + '&&id=' + id).then(callback);
        },
        
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $translate, dataservice, $filter) {
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
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
        $rootScope.checkDatamore = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AttrCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE), "<br/>");// "Mã thuộc tính không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }

            return mess;
        }
        $rootScope.checkDatapayment = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;

            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.PayCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_CODE), "<br/>");//"Mã phiếu thu-chi không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }

            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                ContractCode: {
                    required: true,
                    maxlength: 100,
                },
                Title: {
                    required: true,
                    maxlength: 255,
                },
            },
            messages: {
                ContractCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE),//"Nhập mã hợp đồng",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE).replace("{1}", "100"),//"Mã hợp đồng không vượt quá 100 kí tự!",
                },
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_NAME),//"Nhập tên hợp đồng",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_LBL_CONTRACT_CODE).replace("{1}", "255"),//"Tên hợp đồng không vượt quá 255 kí tự!",
                },
            }
        }

        $rootScope.validationOptionsDetail = {
            rules: {
                ItemCode: {
                    required: true,
                    maxlength: 100,
                },
                ItemName: {
                    required: true,
                    maxlength: 255,
                },
                Quatity: {
                    required: true,
                    maxlength: 18,
                },
                Cost: {
                    required: true,
                    maxlength: 18,
                }
            },
            messages: {
                ItemCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE),//"Mã chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_CODE).replace("{1}", "100")//"Không vượt quá 100 kí tự"
                },
                ItemName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME),//"Tên chi tiết yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_ITEM_NAME).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                },
                Quatity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY),//"Số lượng yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_QUATITY).replace("{1}", "255")//"Số lượng không vượt quá 255 kí tự"
                },
                Cost: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST),//"Đơn giá yêu cầu bắt buộc!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_DETAIL_CURD_LBL_COST).replace("{1}", "18")//"Đơn giák hông vượt quá 18 kí tự"
                },
            }
        }
        $rootScope.validationOptionsNote = {
            rules: {
                Title: {
                    required: true,
                },
                Tags: {
                    required: true,
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_NOTE_CURD_TXT_TITLE),//"Tiêu đề yêu cầu bắt buộc",
                },
                Tags: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_NOTE_CURD_LBL_TAG),//"Tags yêu cầu bắt buộc",
                }
            }
        }
        $rootScope.validationOptionsAttr = {
            rules: {
                AttrCode: {
                    required: true,
                    maxlength: 255,
                },
                AttrValue: {
                    required: true,
                    maxlength: 255,
                }
            },
            messages: {
                AttrCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                },
                AttrValue: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE),//"Bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE).replace("{1}", "255")//"Không vượt quá 255 kí tự"
                }
            }
        }
        $rootScope.validationOptionsPayment = {
            rules: {
                PayCode: {
                    required: true,
                    maxlength: 100
                },
                PayTitle: {
                    required: true,
                    maxlength: 255
                },
                MoneyTotal: {
                    required: true
                }
            },
            messages: {
                PayCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_CODE),//"Mã phiếu yêu cầu bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_CODE).replace("{1}", "100")//"Không vượt quá 100 kí tự"
                },
                PayTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_TITLE),//"Tên phiếu yêu cầu bắt buộc",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_LBL_PAY_TITLE).replace("{1}", "100")
                },
                MoneyTotal: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CONTRACT_CURD_TAB_PAYMENT_CURD_TXT_MONEY_TOTAL)//"Tổng tiền yêu cầu bắt buộc"
                }
            }
        }
    });
    $rootScope.Object = {
        ContractCode: '',
        CardName: ''
    }
    dataservice.getCustomers(function (rs) {rs=rs.data;
        
        $rootScope.Customers = rs;
        $rootScope.MapCustomer = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapCustomer[rs[i].Code] = rs[i];
        }

    })
    dataservice.getSuppliers(function (rs) {rs=rs.data;

        
        $rootScope.Suppliers = rs;
        $rootScope.MapSupplier = {};
        for (var i = 0; i < rs.length; ++i) {
            $rootScope.MapSupplier[rs[i].Code] = rs[i];
        }
    })
    dataservice.getListCommon(function (rs) {rs=rs.data;
        $rootScope.ListCommon = rs;
    });
    dataservice.getCurrency(function (rs) {rs=rs.data;
        $rootScope.currencyData = rs;
    });
    $rootScope.PaymentType = [{
        Value: false,
        Name: "Phiếu chi"
    }, {
        Value: true,
        Name: "Phiếu thu"
    }]
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.ObjectCodeShared = '';

    $rootScope.Budget = 0;
    $rootScope.customerType = "";

    $rootScope.status = [{
        Code: 'CUS_REQUEST',
        Name: 'Khách hàng yêu cầu',
        Icon: 'fas fa-plus text-success'
    }, {
        Code: 'FACCO_CONFIRM',
        Name: 'FACCO xác nhận',
        Icon: 'fas fa-check text-primary'
    }, {
        Code: 'FACCO_REJECTED',
        Name: 'FACCO hủy bỏ',
        Icon: 'fas fa-minus-circle text-danger'
    }, {
        Code: 'CUS_REJECTED',
        Name: 'Khách hàng hủy bỏ',
        Icon: 'fas fa-minus-circle text-danger'
    },
    //{
    //    Code: 'CANCEL',
    //    Name: 'Đang trao đổi',
    //    Icon: 'fas fa-minus-circle text-danger'
    //}, {
    //    Code: 'APPROVED',
    //    Name: 'Đang nhập hàng từ NCC',
    //    Icon: 'fa fa-file-text-o text-primary'
    //}, {
    //    Code: 'APPROVED',
    //    Name: 'Đang gửi hàng cho khách',
    //    Icon: 'fa fa-file-text-o text-primary'
    //}, {
    //    Code: 'APPROVED',
    //    Name: 'Đã gửi hàng cho khách',
    //    Icon: 'fa fa-file-text-o text-primary'
    //},
    {
        Code: 'COMPLETE',
        Name: 'Hoàn thành',
        Icon: 'fa fa-file-text-o text-primary'
    }];
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $window, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Key: '',
        FromDate: '',
        ToDate: '',
        ContractCode: '',
        Status: '',
        BudgetF: '',
        BudgetT: '',
        Signer: '',
        Currency: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/contractPoCustomer/JTable",
            beforeSend: function (jqXHR, settings) {
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.id] = false;
                    } else {
                        $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    
                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoCusCode').withTitle('Mã đơn hàng').withOption('sClass', ' dataTable-pr0 w170').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PoTitle').withTitle('Tiêu đề').withOption('sClass', ' dataTable-pr0 w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrderBy').withTitle('Người đặt hàng').withOption('sClass', 'tleft dataTable-pr0  w150').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Consigner').withTitle('Người gửi').withOption('sClass', 'tleft dataTable-pr0 w60').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BuyerCode').withTitle('Người mua').withOption('sClass', 'tleft dataTable-pr0 w100').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedDate').withTitle('Ngày tạo').withOption('sClass', 'tcenter dataTable-pr0 w30').notSortable().renderWith(function (data, type, full) {
        return $scope.model.sDateOfOrder != null ? $filter('date')(new Date($scope.model.sDateOfOrder), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('Tác vụ').withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };
    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };


    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.tag = function (id) {
        var userModel = {};
        var listdata = $('#tblDataContract').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/contractPeopleTags.html',
            controller: 'contractPeopleTags',
            backdrop: 'static',
            size: '53',
            resolve: {
                para: function () {
                    return userModel.code;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    };
    $scope.note = function (id) {
        var userModel = {};
        var listdata = $('#tblDataContract').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].id == id) {
                userModel = listdata[i];
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/contractNote.html',
            controller: 'contractNote',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return userModel.code;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (result) {result=result.data;
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.edit = function (id) {

        dataservice.getItem(id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var size = 0;
                if ($window.innerWidth < 1300 && $window.innerWidth > 768) {
                    size = 90;
                } else if ($window.innerWidth > 1300 && $window.innerWidth < 1500) {
                    size = 80;
                } else {
                    size = 70;
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        })
    };
    $scope.add = function () {
        $rootScope.Object.ContractCode = '';
        var size = 0;
        if ($window.innerWidth < 1300 && $window.innerWidth > 768) {
            size = 90;
        } else if ($window.innerWidth > 1300 && $window.innerWidth < 1500) {
            size = 80;
        } else {
            size = 70;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.addCardJob = function () {
        var userModel = {};
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var listdata = $('#tblDataContract').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].id == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                $rootScope.Object.ContractCode = userModel.code;
                $rootScope.Object.CardName = userModel.name;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderCard + "/edit-tag.html",
                    controller: 'add-card',
                    backdrop: 'static',
                    size: '60'
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            } else {
                App.toastrError("Vui lòng chọn một hợp đồng!")
            }
        } else {
            App.toastrError("Không có hợp đồng nào được chọn!")
        }
    };
    $rootScope.loadContract = function () {
        reloadData(true);
    }
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        BuyerCode: '',
        SupCode: '',
        Status:'CUS_REQUEST'
    }
    $scope.isShowHeader = true;
    $rootScope.customerType = "LE";
    $rootScope.Budget = 0;
    $rootScope.RealBudget = 0;
    $rootScope.ContractId = -1;
    $rootScope.ContractCode = "";
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.chkContract = function () {
        if ($rootScope.Object.ContractCode == '') {
            App.toastrError(caption.CONTRACT_CURD_MSG_CREATE_CONTRACR);//Vui lòng tạo trước hợp đồng!
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ContractType" && $scope.model.ContractType != "") {
            $scope.errorContractType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MainService" && $scope.model.MainService != "") {
            $scope.errorMainService = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "CusCode" && $scope.model.CusCode != "") {
            $scope.errorCusCode = false;
        }
    }

    $scope.submit = function () {
        var msg = { Error: false, Title: "" };
        if ($scope.model.BuyerCode == "") {
            msg.Error = true;
            msg.Title = "Vui lòng chọn người bán";
        }
        if ($scope.model.SupCode == "") {
            msg.Error = true;
            if (msg.Title == "")
                msg.Title = "Vui lòng chọn người mua";
            else
                msg.Title = msg.Title + "</br>Vui lòng chọn người mua";
        }
        if (msg.Error == true) {
            App.toastrWarning(msg.Title);
            return;
        }
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmAdd.html',
            resolve: {
                para: function () {
                    return $scope.model;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = "Bạn muốn thêm đơn đặt hàng không?"
                $scope.ok = function () {

                    dataservice.insert(para, function (result) {result=result.data;
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
            $rootScope.Object.ContractCode = $scope.model.ContractCode;
        }, function () {
        });

    }

    $rootScope.amountbudget = function (amount) {
        $scope.model.Budget = amount;
    }

    $scope.activity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ContractType == "") {
            $scope.errorContractType = true;
            mess.Status = true;
        } else {
            $scope.errorContractType = false;

        }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        //if (data.MainService == "") {
        //    $scope.errorMainService = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorMainService = false;

        //}
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;

        }
        if (data.CusCode == "") {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;

        }
        return mess;
    };

    setTimeout(function () {
        $("#DateOfOrder").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });

        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
    }, 200);

    $scope.changeCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
        var customer = $rootScope.MapCustomer[$scope.model.BuyerCode];
        console.log(customer);
        if (customer != undefined) {
            $scope.model.CusAddress = customer.Address;
            $scope.model.CusZipCode = customer.ZipCode;
            $scope.model.CusMobilePhone = customer.MobilePhone;
            $scope.model.CusPersonInCharge = customer.PersonInCharge;
            $scope.model.CusEmail = customer.Email;
        }
    }

    $scope.changeSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupPersonInCharge = "";
        var supplier = $rootScope.MapSupplier[$scope.model.SupCode];
        console.log(supplier);
        if (supplier != undefined) {
            $scope.model.SupAddress = supplier.Address;
            $scope.model.SupMobilePhone = supplier.MobilePhone;
            $scope.model.SupEmail = supplier.Email;
            var list = supplier.ListExtend;
            if (list != null) {
                
                for (var i in list) {
                    var item = list[i];
                    if (item.ext_code == "ZIP_CODE") {
                        $scope.model.SupZipCode = item.ext_value;
                    }
                    if (item.ext_code == "PERSON_IN_CHARGE") {
                        $scope.model.SupPersonInCharge = item.ext_value;
                    }
                }
            }
        }
    }

    $scope.resetCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
    }
    $scope.resetSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupPersonInCharge = "";
    }
    setTimeout(function () {
        
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.hideOrShowHeader = function () {
        $scope.isShowHeader = !$scope.isShowHeader;
    }
});
app.controller('edit', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.isShowHeader = true;
    $scope.changeCustomer = function () {
        $scope.model.CusAddress = "";
        $scope.model.CusZipCode = "";
        $scope.model.CusMobilePhone = "";
        $scope.model.CusPersonInCharge = "";
        $scope.model.CusEmail = "";
        var customer = $rootScope.MapCustomer[$scope.model.BuyerCode];
        console.log(customer);
        if (customer != undefined) {
            $scope.model.CusAddress = customer.Address;
            $scope.model.CusZipCode = customer.ZipCode;
            $scope.model.CusMobilePhone = customer.MobilePhone;
            $scope.model.CusPersonInCharge = customer.PersonInCharge;
            $scope.model.CusEmail = customer.Email;
        }
    }

    $scope.changeSupplier = function () {
        $scope.model.SupAddress = "";
        $scope.model.SupEmail = "";
        $scope.model.SupZipCode = "";
        $scope.model.SupMobilePhone = "";
        $scope.model.SupPersonInCharge = "";
        var supplier = $rootScope.MapSupplier[$scope.model.SupCode];
        console.log(supplier);
        if (supplier != undefined) {
            $scope.model.SupAddress = supplier.Address;
            $scope.model.SupMobilePhone = supplier.MobilePhone;
            $scope.model.SupEmail = supplier.Email;
            var list = supplier.ListExtend;
            if (list != null) {
                
                for (var i in list) {
                    var item = list[i];
                    if (item.ext_code == "ZIP_CODE") {
                        $scope.model.SupZipCode = item.ext_value;
                    }
                    if (item.ext_code == "PERSON_IN_CHARGE") {
                        $scope.model.SupPersonInCharge = item.ext_value;
                    }
                }
            }
        }
    }
    $scope.initData = function () {
        $scope.model = para;
        $scope.model.sDateOfOrder = ($scope.model.DateOfOrder != null ? $filter('date')(new Date($scope.model.DateOfOrder), 'dd/MM/yyyy') : "");
        $scope.changeCustomer();
        $scope.changeSupplier();
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var msg = { Error: false, Title: "" };
        if ($scope.model.BuyerCode == "") {
            msg.Error = true;
            msg.Title = "Vui lòng chọn người bán";
        }
        if ($scope.model.SupCode == "") {
            msg.Error = true;
            if (msg.Title == "")
                msg.Title = "Vui lòng chọn người mua";
            else
                msg.Title = msg.Title + "</br>Vui lòng chọn người mua";
        }
        if (msg.Error == true) {
            App.toastrWarning(msg.Title);
            return;
        }
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            resolve: {
                para: function () {
                    return $scope.model;
                }
            },
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_EDIT_CONFIRM.replace("{0}", "");//"Bạn có chắc chắn muốn thay đổi ?";
                $scope.ok = function () {
                    dataservice.update(para, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                            $rootScope.loadContract();
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
        }, function () {
        });

    }
    $scope.changleSelect = function (SelectType) {
        
        if (SelectType == "ContractType" && $scope.model.ContractType != "") {
            $scope.errorContractType = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "MainService" && $scope.model.MainService != "") {
            $scope.errorMainService = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
        if (SelectType == "CusCode" && $scope.model.CusCode != "") {
            $scope.errorCusCode = false;
        }
    }
    $scope.addCardJob = function () {
        $rootScope.Object.CardName = $scope.model.Title;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCard + "/edit-tag.html",
            controller: 'add-card',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            //$scope.reload();
        }, function () { });
    };
    $rootScope.amountbudget = function (amount) {
        $scope.model.Budget = amount;
    }
    function convertDate(data) {
        var date = $filter('date')(new Date(data), 'dd/MM/yyyy');
        return date;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.ContractType == "" || data.ContractType == null) {
            $scope.errorContractType = true;
            mess.Status = true;
        } else {
            $scope.errorContractType = false;

        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        //if (data.MainService == "" || data.MainService == null) {
        //    $scope.errorMainService = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorMainService = false;

        //}
        if (data.Currency == "" || data.Currency == null) {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;

        }
        if (data.CusCode == "" || data.CusCode == null) {
            $scope.errorCusCode = true;
            mess.Status = true;
        } else {
            $scope.errorCusCode = false;

        }
        return mess;
    };
    function initDateTime() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });

        $("#EffectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EffectiveDate').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        initDateTime();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.hideOrShowHeader = function () {
        $scope.isShowHeader = !$scope.isShowHeader;
    }
    $scope.activity = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/activity.html',
            controller: 'activity',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return $scope.model.PoCusCode;
                }
            },
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.openLog = function () {
        dataservice.getUpdateLog($scope.model.PoCusCode, function (rs) {rs=rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/showLog.html',
                controller: 'showLog',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () { });
        });
    }
});
app.controller('contractPeopleTags', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        ContractPeople: '',
        Note: '',
        Task: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableTagPeople",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $scope.model.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sWidth', '20px').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Assigner').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_ASSIGNER" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssignerTime').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_ASSIGNER_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ConfirmTime').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_CONFIRM_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CONTRACT_CURD_PEOPLE_TAG_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px; -webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.initLoad = function () {
        $scope.model.ContractCode = para;
        dataservice.getTask(function (rs) {rs=rs.data;
            $scope.listTask = rs;
        });
        dataservice.getListUserContract(function (rs) {rs=rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.model.ContractPeople == '' || $scope.model.ContractPeople.length == 0) {
            App.toastrError(caption.CONTRACT_CURD_PEOPLE_TAG_VALIDATE_PEOPLE);//Vui lòng chọn nhân viên được ủy quyền
        } else {
            dataservice.insertTagPeople($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CONTRACT_MSG_DELETE_CONFIRM;//"Bạn có chắc chắn xóa người ủy quyền ?";
                windowClass: "message-center",
                    $scope.ok = function () {
                        dataservice.deleteTagPeople(id, function (result) {result=result.data;
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
    }
});
app.controller('contractNote', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $uibModalInstance, para) {
    var vm = $scope;
    $scope.model = {
        Note: '',
        Tags: '',
        Title: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableContractNote",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $scope.model.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sWidth', '20px').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ContractNoteId] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractNoteId + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractCode').withTitle('{{"CONTRACT_CURD_NOTE_LIST_COL_CONTRACT_CODE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CONTRACT_CURD_NOTE_LIST_COL_NOTE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tags').withTitle('{{"CONTRACT_LIST_COL_TAGS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CONTRACT_CURD_NOTE_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CONTRACT_CURD_NOTE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ContractNoteId + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initLoad = function () {
        dataservice.getUserlogin(function (rs) {rs=rs.data;
            $scope.UserName = rs;
        });
        $scope.model.ContractCode = para;
    }
    $scope.initLoad();
    $scope.submit = function () {
        if ($scope.addformNote.validate()) {
            dataservice.insertContractNote($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM//"Bạn có chắc chắn muốn xóa ?";
                windowClass: "message-center",
                    $scope.ok = function () {
                        dataservice.deleteContractNote(id, function (result) {result=result.data;
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
    }
});
//tab service
app.controller('contractTabService', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ServiceCode: '',
        Quantity: 1,
        Unit: '',
        Currency: '',
        Tax: 0
    }
    $scope.isExtend = false;
    $scope.isAdd = true;
    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VNĐ'
        },
        {
            Code: 'USD',
            Name: 'USD'
        }

    ];
    $scope.services = [];
    $rootScope.serviceCost = [];
    $scope.serviceCost = [];
    $scope.serviceTotalCost = [];
    $scope.serviceDetails = [];
    $rootScope.serviceJtable = {};
    $rootScope.map = {};
    $rootScope.excludeCondition = {};
    $scope.editId = -1;
    $rootScope.unExcludeCondition = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableContractService",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $rootScope.Budget = 0;
                $rootScope.RealBudget = 0;
                $rootScope.serviceJtable = {};
                d.ContractCode = $rootScope.ContractCode;
                d.Service = $scope.model.Service;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                console.log($rootScope.serviceJtable);
                for (var i in $rootScope.serviceJtable) {
                    var data = $rootScope.serviceJtable[i];
                    try {
                        var cost = parseFloat(data.Cost) * parseInt(data.Quantity);
                        $rootScope.Budget = $rootScope.Budget + cost + cost * data.Tax / 100;
                    } catch (Ex) {
                        console.log("co loi");
                        console.log(data);
                    }

                }
                console.log("tong " + $rootScope.Budget);
                if ($scope.serviceTotalCost.length == 0) {
                    dataservice.getCostTotalContract(function (rs) {rs=rs.data;
                        $scope.serviceTotalCost = rs;
                        $scope.filterTotalCost();
                    });
                }
                else {
                    $scope.filterTotalCost();
                }
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $rootScope.serviceJtable[dataIndex] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('Mã dịch vụ').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('Tên dịch vụ').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('Giá').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('Số lượng').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }).withOption('sClass', 'class9'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('Tổng giá').renderWith(function (data, type, full) {
        var cost = full.Cost * full.Quantity;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
        //return cost != "" ? $filter('currency')(cost, '', 0) : null;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('Thuế(%)').renderWith(function (data, type, full) {
        return data;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('Sau thuế').renderWith(function (data, type, full) {
        var cost = full.Cost * full.Quantity;
        cost = cost + cost * full.Tax / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('Đơn vị').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListCommon.length; i++) {
            if ($rootScope.ListCommon[i].Code == data) {
                return $rootScope.ListCommon[i].Name;
                break;
            }
        }
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('Tiền tệ').renderWith(function (data, type) {
        if (data == "VND")
            return "VNĐ";
        else if (data == "USD")
            return "USD";
        else if (data == "JPY")
            return "Yên";
        else return data;
    }).withOption('sClass', 'class9'));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('Thao tác').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'class9'));
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
    $scope.filterTotalCost = function () {
        $rootScope.RealBudget = $rootScope.Budget;
        for (var i = 0; i < $scope.serviceTotalCost.length; ++i) {
            try {
                var data = $scope.serviceTotalCost[i];
                if (data.ObjFromValue != null && data.ObjToValue != null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    var toCost = parseFloat(data.ObjToValue);
                    if (fromCost <= $rootScope.Budget && $rootScope.Budget <= toCost) {
                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue == null && data.ObjToValue != null) {
                    var toCost = parseFloat(data.ObjToValue);
                    if ($rootScope.Budget <= toCost) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue != null && data.ObjToValue == null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    if (fromCost <= $rootScope.Budget) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
            }
            catch (ex) { }
        }

    }
    $scope.add = function () {
        $scope.isAdd = true;
        var msg = "";
        if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
            msg = "Vui lòng chọn dịch vụ";
        }
        if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
            if (msg == "")
                msg = "Vui lòng chọn số lượng";
            else
                msg = msg + "</br> Vui lòng chọn số lượng";
        }
        if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
            if (msg == "")
                msg = "Vui lòng nhập giá";
            else
                msg = msg + "</br> Vui lòng nhập giá";
        }
        if (msg == "") {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            
            if ($scope.isExtend != true) {
                if ($scope.serviceDetails.length == 0) {
                    App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
                }
                else {
                    dataservice.insertService($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();

                        }
                    });
                }
            } else {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000" && $scope.serviceDetails.length == 0) {
                    App.toastrWarning("Vui lòng nhập đầy đủ thông tin");
                    $scope.model.ServiceCondition = "";
                    $scope.model.Range = "";
                }
                else {
                    dataservice.insertService($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();
                        }
                    });
                }
            }
        }
        else {
            App.toastrWarning(msg);
        }
    }
    $scope.edit = function (id) {
        //$scope.changeExtend();
        
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataService').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];
                $scope.model.Id = data.Id;
                $scope.model.ServiceCode = data.ServiceCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Cost = parseFloat(data.Cost);
                $scope.model.Unit = data.Unit;
                $scope.model.Currency = data.Currency;
                $scope.model.Tax = parseFloat(data.Tax);
                $scope.serviceDetails = [];
                var note = data.Note;
                if (note.length > 0) {
                    var arr = note.split(';');
                    for (var j = 0; j < arr.length; ++j) {
                        var item = arr[j];
                        if (item.length > 0) {
                            var arr1 = item.split('|');
                            if (arr1.length == 2) {
                                if ($rootScope.customerType == "LE") {
                                    var le = $scope.unExcludeCondition[1];
                                    if (arr1[0] == le) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                                else if ($rootScope.customerType == "DAILY") {
                                    var daily = $scope.unExcludeCondition[3];
                                    if (arr1[0] == daily) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }

        if ($scope.serviceDetails.length == 1) {
            console.log($scope.serviceDetails);
            console.log($rootScope.excludeCondition);
            var item = $scope.serviceDetails[0];
            if ($rootScope.customerType == "LE") {
                if ($rootScope.excludeCondition[item.Condition] == 1) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }
            else if ($rootScope.customerType == "DAILY") {
                if ($rootScope.excludeCondition[item.Condition] == 3) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }

        }
        else {
            $scope.isExtend = true;
        }
        
        //lọc ra condition từ $rootScope.serviceCost
        $scope.serviceConditions = [];
        $scope.serviceCost = [];
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var data = $rootScope.serviceCost[i];
                if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                    $scope.serviceConditions.push(data);
                }
            }
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
            }
            console.log($scope.serviceConditions);
            var hasMap = {};
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                var item = $scope.serviceConditions[i];
                hasMap[item.Code] = item;
            }
            $scope.serviceConditions = [];
            for (var i in hasMap) {
                $scope.serviceConditions.push(hasMap[i]);
            }
            for (var i = $scope.serviceConditions.length - 1; i >= 0; --i) {
                var item = $scope.serviceConditions[i];
                if ($rootScope.excludeCondition[item.Code] != undefined) {
                    $scope.serviceConditions.splice(i, 1);
                }
            }
        }

    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
        $scope.serviceDetails = [];
        $scope.serviceConditions = [];
    }
    $scope.save = function (id) {
        var msg = "";
        if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
            msg = "Vui lòng chọn dịch vụ";
        }
        if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
            if (msg == "")
                msg = "Vui lòng chọn số lượng";
            else
                msg = msg + "</br> Vui lòng chọn số lượng";
        }
        if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
            if (msg == "")
                msg = "Vui lòng nhập giá";
            else
                msg = msg + "</br> Vui lòng nhập giá";
        }
        if (msg == "") {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            //var it = "";
            //if ($rootScope.customerType=="LE")
            //    it = $scope.unExcludeCondition[1];
            //else if ($rootScope.customerType == "DAILY")
            //    it = $scope.unExcludeCondition[3];
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == false) {
                App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
                return;
            }
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == true) {
                App.toastrWarning("Vui lòng chọn lại dịch vụ mở rộng");
                return;
            }
            $scope.isAdd = true;
            dataservice.updateService($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = {
                        ServiceCode: '',
                        Quantity: 1,
                        Cost: '',
                        Unit: '',
                        Currency: 'VND',
                        Tax: 0
                    }
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.serviceDetails = [];
                    $scope.reload();
                }
            });
        }
        else {
            App.toastrWarning(msg);
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteServiceDetail(id, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(id);
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
            
            if ($scope.editId == d) {
                $scope.close();
            }

            $scope.reload();
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.changeService = function () {
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }
        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = "";
            $scope.model.Cost = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                        
                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning("Dịch vụ chưa xác định điều kiện");
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }
    }
    $scope.changeCondition = function () {
        

        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }
    $scope.init = function () {
        dataservice.getService(function (rs) {rs=rs.data;
            $scope.services = rs;
        });
        dataservice.getServiceUnit(function (rs) {rs=rs.data;
            $scope.units = rs;
        });
        dataservice.getServiceCondition(function (rs) {rs=rs.data;
            //$rootScope.serviceConditions = rs;
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.Priority != null && (1 <= item.Priority && item.Priority <= 4)) {
                    $rootScope.excludeCondition[item.Code] = item.Priority;
                    $rootScope.unExcludeCondition[item.Priority] = item.Code;
                }
            }
        });
        dataservice.getCostByServiceAndCondition(function (rs) {rs=rs.data;
            $rootScope.serviceCost = rs;
            
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.ConditionRange.length > 0) {
                    if (item.ConditionRange == " -> ")
                        $rootScope.map[item.ServiceCode + "|" + item.Condition] = item;
                    else
                        $rootScope.map[item.ServiceCode + "|" + item.Condition + "|" + item.ConditionRange] = item;
                }
            }
            //$scope.serviceCost = $rootScope.serviceCost;
            //for (var i = 0; i < $scope.serviceCost.length; ++i) {
            //    $scope.serviceCost[i].Code = $scope.serviceCost[i].Condition;
            //    $scope.serviceCost[i].Name = $scope.serviceCost[i].ConditionRange;
            //}
            //Condition: "SERVICE_CONDITION_002"
            //ConditionName: "Khách hàng thi công"
            //ConditionRange: "12 năm -> 25 năm"
        });
        dataservice.getCostTotalContract(function (rs) {rs=rs.data;
            $scope.serviceTotalCost = rs;
        });

    }
    $scope.filterCost = function () {
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                var data = null;
                if ($scope.serviceCost != null) {
                    for (var i = 0; i < $scope.serviceCost.length; ++i) {
                        var item = $scope.serviceCost[i];
                        if (item.Id == $scope.model.Range) {
                            data = item;
                            break;
                        }
                    }
                }
                if (data != null) {
                    console.log(data);
                    //if (data.Price >= 0) {
                    //    $scope.model.Cost = data.Price;
                    //}

                    var isCheck = false;
                    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                        var item = $scope.serviceDetails[i];
                        if (item.ConditionName == data.ConditionName && item.ConditionRange == data.ConditionRange) {
                            isCheck = true;
                            break;
                        }
                    }
                    if (isCheck == false) {
                        $scope.serviceDetails.push(data);
                    }
                    else {
                        //App.toastrWarning("Bạn đã thêm ");
                    }

                    //    Condition: "SERVICE_CONDITION_002"
                    //ConditionName: "Khách hàng thi công"
                    //ConditionRange: "12 năm -> 25 năm"
                    $scope.operationCost();
                    console.log($scope.serviceDetails);
                }
                else {
                    App.toastrWarning("Không lọc được giá, vui lòng nhập tay");
                    $scope.model.Cost = '';
                }

            }
            else {

            }
        }
    }
    $scope.operationCost = function () {
        $scope.model.Cost = 0;
        // $scope.model.Cost = data.Price;
        for (var i = 0; i < $scope.serviceDetails.length; ++i) {
            try {
                var item = $scope.serviceDetails[i];
                $scope.model.Cost = $scope.model.Cost + item.Price;
            }
            catch (ex) {

            }
        }
        // giảm giá

    }
    $scope.init();
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        console.log($scope.serviceDetails);
        
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }

    $scope.changeExtend = function () {
        
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }
});

app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        ProductType: '',
        Catalogue: '',
        Quantity: 1,
        Unit: '',
        Currency: '',
        Cost: 0
    }
    $scope.isExtend = false;
    $scope.isAdd = true;
    //khách lẻ
    $scope.currencys = [
        {
            Code: 'JPY',
            Name: 'Yên'
        },
        {
            Code: 'VND',
            Name: 'VNĐ'
        },
        {
            Code: 'USD',
            Name: 'USD'
        }

    ];
    $scope.services = [];
    $rootScope.serviceCost = [];
    $scope.serviceCost = [];
    $scope.serviceTotalCost = [];
    $scope.serviceDetails = [];
    $rootScope.serviceJtable = {};
    $rootScope.map = {};
    $rootScope.excludeCondition = {};
    $scope.editId = -1;
    $rootScope.unExcludeCondition = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractPo/JTableContractService",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $rootScope.Budget = 0;
                $rootScope.RealBudget = 0;
                $rootScope.serviceJtable = {};
                d.ContractCode = $rootScope.ContractCode;
                d.Service = $scope.model.Service;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                console.log($rootScope.serviceJtable);
                for (var i in $rootScope.serviceJtable) {
                    var data = $rootScope.serviceJtable[i];
                    try {
                        var cost = parseFloat(data.Cost) * parseInt(data.Quantity);
                        $rootScope.Budget = $rootScope.Budget + cost + cost * data.Tax / 100;
                    } catch (Ex) {
                        console.log("co loi");
                        console.log(data);
                    }

                }
                console.log("tong " + $rootScope.Budget);
                if ($scope.serviceTotalCost.length == 0) {
                    dataservice.getCostTotalContract(function (rs) {rs=rs.data;
                        $scope.serviceTotalCost = rs;
                        $scope.filterTotalCost();
                    });
                }
                else {
                    $scope.filterTotalCost();
                }
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $rootScope.serviceJtable[dataIndex] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceCode').withTitle('Mã dịch vụ').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withTitle('Tên dịch vụ').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('Giá').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('Số lượng').renderWith(function (data, type) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }).withOption('sClass', 'class9'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('Tổng giá').renderWith(function (data, type, full) {
        var cost = full.Cost * full.Quantity;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
        //return cost != "" ? $filter('currency')(cost, '', 0) : null;
    }).withOption('sClass', 'class18'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('Thuế(%)').renderWith(function (data, type, full) {
        return data;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('Sau thuế').renderWith(function (data, type, full) {
        var cost = full.Cost * full.Quantity;
        cost = cost + cost * full.Tax / 100;
        var dt = cost != "" ? $filter('currency')(cost, '', 0) : null;
        dt = "<span style = 'font-weight:bold'>" + dt + "</span>";
        return dt;
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('Đơn vị').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListCommon.length; i++) {
            if ($rootScope.ListCommon[i].Code == data) {
                return $rootScope.ListCommon[i].Name;
                break;
            }
        }
    }).withOption('sClass', 'class9'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('Tiền tệ').renderWith(function (data, type) {
        if (data == "VND")
            return "VNĐ";
        else if (data == "USD")
            return "USD";
        else if (data == "JPY")
            return "Yên";
        else return data;
    }).withOption('sClass', 'class9'));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('Thao tác').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'class9'));
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
    $scope.filterTotalCost = function () {
        $rootScope.RealBudget = $rootScope.Budget;
        for (var i = 0; i < $scope.serviceTotalCost.length; ++i) {
            try {
                var data = $scope.serviceTotalCost[i];
                if (data.ObjFromValue != null && data.ObjToValue != null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    var toCost = parseFloat(data.ObjToValue);
                    if (fromCost <= $rootScope.Budget && $rootScope.Budget <= toCost) {
                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue == null && data.ObjToValue != null) {
                    var toCost = parseFloat(data.ObjToValue);
                    if ($rootScope.Budget <= toCost) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
                else if (data.ObjFromValue != null && data.ObjToValue == null) {
                    var fromCost = parseFloat(data.ObjFromValue);
                    if (fromCost <= $rootScope.Budget) {

                        $rootScope.RealBudget = $rootScope.Budget * data.Price;
                        break;

                    }
                }
            }
            catch (ex) { }
        }

    }
    $scope.add = function () {
        $scope.isAdd = true;
        var msg = "";
        if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
            msg = "Vui lòng chọn dịch vụ";
        }
        if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
            if (msg == "")
                msg = "Vui lòng chọn số lượng";
            else
                msg = msg + "</br> Vui lòng chọn số lượng";
        }
        if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
            if (msg == "")
                msg = "Vui lòng nhập giá";
            else
                msg = msg + "</br> Vui lòng nhập giá";
        }
        if (msg == "") {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            
            if ($scope.isExtend != true) {
                if ($scope.serviceDetails.length == 0) {
                    App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
                }
                else {
                    dataservice.insertService($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();

                        }
                    });
                }
            } else {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000" && $scope.serviceDetails.length == 0) {
                    App.toastrWarning("Vui lòng nhập đầy đủ thông tin");
                    $scope.model.ServiceCondition = "";
                    $scope.model.Range = "";
                }
                else {
                    dataservice.insertService($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            $scope.model = {
                                ServiceCode: '',
                                Quantity: 1,
                                Cost: '',
                                Unit: '',
                                Currency: 'VND',
                                Tax: 0
                            }
                            App.toastrSuccess(rs.Title);
                            $scope.serviceDetails = [];
                            $scope.reload();
                        }
                    });
                }
            }
        }
        else {
            App.toastrWarning(msg);
        }
    }
    $scope.edit = function (id) {
        //$scope.changeExtend();
        
        $scope.isAdd = false;
        $scope.editId = id;
        var listdata = $('#tblDataService').DataTable().data();
        for (var i = 0; i < listdata.length; ++i) {
            if (id == listdata[i].Id) {
                var count = 0;
                var data = listdata[i];
                $scope.model.Id = data.Id;
                $scope.model.ServiceCode = data.ServiceCode;
                $scope.model.Quantity = parseInt(data.Quantity);
                $scope.model.Cost = parseFloat(data.Cost);
                $scope.model.Unit = data.Unit;
                $scope.model.Currency = data.Currency;
                $scope.model.Tax = parseFloat(data.Tax);
                $scope.serviceDetails = [];
                var note = data.Note;
                if (note.length > 0) {
                    var arr = note.split(';');
                    for (var j = 0; j < arr.length; ++j) {
                        var item = arr[j];
                        if (item.length > 0) {
                            var arr1 = item.split('|');
                            if (arr1.length == 2) {
                                if ($rootScope.customerType == "LE") {
                                    var le = $scope.unExcludeCondition[1];
                                    if (arr1[0] == le) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                                else if ($rootScope.customerType == "DAILY") {
                                    var daily = $scope.unExcludeCondition[3];
                                    if (arr1[0] == daily) {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                    else {
                                        var data1 = $rootScope.map[$scope.model.ServiceCode + "|" + arr1[0] + "|" + arr1[1]];
                                        if (data1 != undefined) {
                                            data1.Id = count;
                                            $scope.serviceDetails.push(data1);
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }

        if ($scope.serviceDetails.length == 1) {
            console.log($scope.serviceDetails);
            console.log($rootScope.excludeCondition);
            var item = $scope.serviceDetails[0];
            if ($rootScope.customerType == "LE") {
                if ($rootScope.excludeCondition[item.Condition] == 1) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }
            else if ($rootScope.customerType == "DAILY") {
                if ($rootScope.excludeCondition[item.Condition] == 3) {
                    $scope.isExtend = false;
                }
                else {
                    $scope.isExtend = true;
                }
            }

        }
        else {
            $scope.isExtend = true;
        }
        
        //lọc ra condition từ $rootScope.serviceCost
        $scope.serviceConditions = [];
        $scope.serviceCost = [];
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var data = $rootScope.serviceCost[i];
                if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                    $scope.serviceConditions.push(data);
                }
            }
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
            }
            console.log($scope.serviceConditions);
            var hasMap = {};
            for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                var item = $scope.serviceConditions[i];
                hasMap[item.Code] = item;
            }
            $scope.serviceConditions = [];
            for (var i in hasMap) {
                $scope.serviceConditions.push(hasMap[i]);
            }
            for (var i = $scope.serviceConditions.length - 1; i >= 0; --i) {
                var item = $scope.serviceConditions[i];
                if ($rootScope.excludeCondition[item.Code] != undefined) {
                    $scope.serviceConditions.splice(i, 1);
                }
            }
        }

    }
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
        $scope.serviceDetails = [];
        $scope.serviceConditions = [];
    }
    $scope.save = function (id) {
        var msg = "";
        if ($scope.model.ServiceCode == null || $scope.model.ServiceCode == '' || $scope.model.ServiceCode == undefined) {
            msg = "Vui lòng chọn dịch vụ";
        }
        if ($scope.model.Quantity == null || $scope.model.Quantity == '' || $scope.model.Quantity == undefined) {
            if (msg == "")
                msg = "Vui lòng chọn số lượng";
            else
                msg = msg + "</br> Vui lòng chọn số lượng";
        }
        if ($scope.model.Cost == null || $scope.model.Cost == '' || $scope.model.Cost == undefined) {
            if (msg == "")
                msg = "Vui lòng nhập giá";
            else
                msg = msg + "</br> Vui lòng nhập giá";
        }
        if (msg == "") {
            $scope.model.ContractCode = $rootScope.ContractCode;
            $scope.model.Note = $scope.getDescription();
            //var it = "";
            //if ($rootScope.customerType=="LE")
            //    it = $scope.unExcludeCondition[1];
            //else if ($rootScope.customerType == "DAILY")
            //    it = $scope.unExcludeCondition[3];
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == false) {
                App.toastrWarning("Vui lòng chọn lại dịch vụ chuẩn");
                return;
            }
            if ($scope.serviceDetails.length == 0 && $scope.isExtend == true) {
                App.toastrWarning("Vui lòng chọn lại dịch vụ mở rộng");
                return;
            }
            $scope.isAdd = true;
            dataservice.updateService($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = {
                        ServiceCode: '',
                        Quantity: 1,
                        Cost: '',
                        Unit: '',
                        Currency: 'VND',
                        Tax: 0
                    }
                    $scope.editId = -1;
                    App.toastrSuccess(rs.Title);
                    $scope.serviceDetails = [];
                    $scope.reload();
                }
            });
        }
        else {
            App.toastrWarning(msg);
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservice.deleteServiceDetail(id, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(id);
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
            
            if ($scope.editId == d) {
                $scope.close();
            }

            $scope.reload();
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.changeService = function () {
        for (var i = 0; i < $scope.services.length; ++i) {
            if ($scope.services[i].Code == $scope.model.ServiceCode) {
                $scope.model.Unit = $scope.services[i].Unit;
                break;
            }
        }
        if ($scope.isExtend == true) {

            //lọc ra condition từ $rootScope.serviceCost
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            $scope.model.ServiceCondition = "";
            $scope.serviceCost = [];
            $scope.model.Range = "";
            $scope.model.Cost = "";
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var data = $rootScope.serviceCost[i];
                    if (data.ServiceCode == $scope.model.ServiceCode && data.Condition != null && data.Condition != '' && data.Condition != undefined) {
                        
                        var it = $rootScope.excludeCondition[data.Condition];
                        if (it == undefined) {
                            $scope.serviceConditions.push(data);

                        }
                    }
                }
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    $scope.serviceConditions[i].Code = $scope.serviceConditions[i].Condition;
                    $scope.serviceConditions[i].Name = $scope.serviceConditions[i].ConditionName;
                }
                console.log($scope.serviceConditions);
                var hasMap = {};
                for (var i = 0; i < $scope.serviceConditions.length; ++i) {
                    var item = $scope.serviceConditions[i];
                    hasMap[item.Code] = item;
                }
                $scope.serviceConditions = [];
                for (var i in hasMap) {
                    $scope.serviceConditions.push(hasMap[i]);
                }

            }
            if ($scope.serviceConditions.length == 0 && $scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                App.toastrWarning("Dịch vụ chưa xác định điều kiện");
            }
        }
        else {
            //chưa làm
            $scope.changeExtend();
        }
    }
    $scope.changeCondition = function () {
        

        if ($rootScope.customerType == "LE") {
            var le = $scope.unExcludeCondition[1];
            if ($rootScope.ServiceConditionOld == "SERVICE_CONDITION_000") {
                if ($scope.model.ServiceCondition != "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == "SERVICE_CONDITION_000") {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
        else if ($rootScope.customerType == "DAILY") {
            var daily = $scope.unExcludeCondition[3];
            if ($rootScope.ServiceConditionOld == daily) {
                if ($scope.model.ServiceCondition != daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }
            else {
                if ($scope.model.ServiceCondition == daily) {
                    $scope.serviceDetails = [];
                    $scope.model.Cost = "";
                }
            }

            $scope.serviceCost = [];
            var j = 0;
            $scope.model.Range = "";
            if ($scope.model.ServiceCondition == daily) {
                $scope.serviceDetails = [];
                $scope.model.Cost = "";
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                    var item = $rootScope.serviceCost[i];
                    if (item.ServiceCode == $scope.model.ServiceCode && item.Condition == $scope.model.ServiceCondition) {
                        $scope.model.Cost = item.Price;
                        item.ConditionRange = "";
                        $scope.serviceDetails.push(item);
                        $scope.operationCost();
                        break;
                    }
                }
            }
            else {
                $rootScope.ServiceConditionOld = $scope.model.ServiceCondition;
                if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                    if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                        for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                            var data = $rootScope.serviceCost[i];
                            if (data.ServiceCode == $scope.model.ServiceCode && data.Condition == $scope.model.ServiceCondition) {
                                if (data.ConditionRange.length > 4) {
                                    data.Id = j;
                                    $scope.serviceCost.push(data);
                                    j++;
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }
    }
    $scope.init = function () {
        dataservice.getService(function (rs) {rs=rs.data;
            $scope.services = rs;
        });
        dataservice.getServiceUnit(function (rs) {rs=rs.data;
            $scope.units = rs;
        });
        dataservice.getServiceCondition(function (rs) {rs=rs.data;
            //$rootScope.serviceConditions = rs;
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.Priority != null && (1 <= item.Priority && item.Priority <= 4)) {
                    $rootScope.excludeCondition[item.Code] = item.Priority;
                    $rootScope.unExcludeCondition[item.Priority] = item.Code;
                }
            }
        });
        dataservice.getCostByServiceAndCondition(function (rs) {rs=rs.data;
            $rootScope.serviceCost = rs;
            
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.ConditionRange.length > 0) {
                    if (item.ConditionRange == " -> ")
                        $rootScope.map[item.ServiceCode + "|" + item.Condition] = item;
                    else
                        $rootScope.map[item.ServiceCode + "|" + item.Condition + "|" + item.ConditionRange] = item;
                }
            }
            //$scope.serviceCost = $rootScope.serviceCost;
            //for (var i = 0; i < $scope.serviceCost.length; ++i) {
            //    $scope.serviceCost[i].Code = $scope.serviceCost[i].Condition;
            //    $scope.serviceCost[i].Name = $scope.serviceCost[i].ConditionRange;
            //}
            //Condition: "SERVICE_CONDITION_002"
            //ConditionName: "Khách hàng thi công"
            //ConditionRange: "12 năm -> 25 năm"
        });
        dataservice.getCostTotalContract(function (rs) {rs=rs.data;
            $scope.serviceTotalCost = rs;
        });

    }
    $scope.filterCost = function () {
        if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
            if ($scope.model.ServiceCondition != null && $scope.model.ServiceCondition != '' && $scope.model.ServiceCondition != undefined) {
                var data = null;
                if ($scope.serviceCost != null) {
                    for (var i = 0; i < $scope.serviceCost.length; ++i) {
                        var item = $scope.serviceCost[i];
                        if (item.Id == $scope.model.Range) {
                            data = item;
                            break;
                        }
                    }
                }
                if (data != null) {
                    console.log(data);
                    //if (data.Price >= 0) {
                    //    $scope.model.Cost = data.Price;
                    //}

                    var isCheck = false;
                    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                        var item = $scope.serviceDetails[i];
                        if (item.ConditionName == data.ConditionName && item.ConditionRange == data.ConditionRange) {
                            isCheck = true;
                            break;
                        }
                    }
                    if (isCheck == false) {
                        $scope.serviceDetails.push(data);
                    }
                    else {
                        //App.toastrWarning("Bạn đã thêm ");
                    }

                    //    Condition: "SERVICE_CONDITION_002"
                    //ConditionName: "Khách hàng thi công"
                    //ConditionRange: "12 năm -> 25 năm"
                    $scope.operationCost();
                    console.log($scope.serviceDetails);
                }
                else {
                    App.toastrWarning("Không lọc được giá, vui lòng nhập tay");
                    $scope.model.Cost = '';
                }

            }
            else {

            }
        }
    }
    $scope.operationCost = function () {
        $scope.model.Cost = 0;
        // $scope.model.Cost = data.Price;
        for (var i = 0; i < $scope.serviceDetails.length; ++i) {
            try {
                var item = $scope.serviceDetails[i];
                $scope.model.Cost = $scope.model.Cost + item.Price;
            }
            catch (ex) {

            }
        }
        // giảm giá

    }
    $scope.init();
    $scope.removeserviceDetails = function (indx) {
        $scope.serviceDetails.splice(indx, 1);
        $scope.operationCost();
    }
    $scope.getDescription = function () {
        console.log($scope.serviceDetails);
        
        var des = "";
        if ($scope.isExtend == false) {
            for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
                var item = $rootScope.serviceCost[i];
                if ($rootScope.customerType == "LE") {
                    var code = $rootScope.unExcludeCondition[1];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
                else if ($rootScope.customerType == "DAILY") {
                    var code = $rootScope.unExcludeCondition[3];
                    if (item.Condition == code) {
                        return item.Condition + "|";
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.serviceDetails.length; ++i) {
                des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
            }
        }
        //if ($scope.serviceDetails.length == 0) {
        //    for (var i = 0; i < $rootScope.serviceCost.length; ++i) {
        //        var item = $rootScope.serviceCost[i];
        //        if (item.Condition == "SERVICE_CONDITION_000") {
        //            return item.Condition + "|";
        //        }
        //    }

        //}
        //else {
        //    for (var i = 0; i < $scope.serviceDetails.length; ++i) {
        //        des = des + $scope.serviceDetails[i].Code + "|" + $scope.serviceDetails[i].ConditionRange + ";";
        //    }
        //}
        return des;
    }

    $scope.changeExtend = function () {
        
        if ($scope.isExtend == true) {
            $scope.changeService();
        } else {
            $scope.serviceConditions = [];
            $scope.serviceDetails = [];
            if ($scope.model.ServiceCode != null && $scope.model.ServiceCode != '' && $scope.model.ServiceCode != undefined) {
                for (var i in $rootScope.excludeCondition) {
                    var item = $rootScope.excludeCondition[i];
                    if ($rootScope.customerType == "LE") {
                        if (item == 1) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                    else if ($rootScope.customerType == "DAILY") {
                        if (item == 3) {
                            var stand = i;
                            var obj = $rootScope.map[$scope.model.ServiceCode + "|" + stand];
                            if (obj != undefined) {
                                console.log(obj);
                                $scope.model.Cost = obj.Price;
                                obj.Name = obj.ConditionName;
                                obj.ConditionRange = "";
                                $scope.serviceDetails.push(obj);
                            }
                        }
                    }
                }

            }
        }
    }
    setTimeout(function () {
        
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('activity', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.listLogConfirm = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    var item = '';

    $scope.isEdit = false;

    $scope.model = {
        Confirm: ''
    };

    $scope.initLoad = function () {
        dataservice.getListConfirmText(para, function (rs) {rs=rs.data;
            
            $scope.listLogConfirm = rs;
        });
    };

    $scope.initLoad();


    $scope.editItem = function (index) {
        $scope.isEdit = true;
        item = $scope.listLogConfirm[index];
        $scope.model.Confirm = $scope.listLogConfirm[index].Body;
    }

    $scope.removeItem = function (index) {
        item = $scope.listLogConfirm[index];
        $scope.listLogConfirm.splice(index, 1);
        dataservice.deleteConfirmTextById(para, item.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.save = function () {
        item.Body = $scope.model.Confirm;
        if ($scope.model.Confirm != '' && $scope.isEdit) {
            dataservice.updateConfirmTextById(para, item.Id, item.Body, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            App.toastrError("Vui lòng chọn 1 ý kiến để sửa")
        }
    }
});
app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, dataservice, $timeout, para) {
    $scope.logs = para;
    for (var i = 0; i < $scope.logs.length; ++i) {
        $scope.logs[i].STT = (i + 1);
        $scope.logs[i].sCreatedTime = $scope.logs[i].CreatedTime != null ? $filter('date')(new Date($scope.logs[i].CreatedTime), 'dd/MM/yyyy HH:mm:ss') : null;
        for (var j = 0; j < $rootScope.status.length; ++j) {
            if ($scope.logs[i].Status == $rootScope.status[j].Code) {
                $scope.logs[i].sStatus = $rootScope.status[j].Name;
                break;
            }
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});




