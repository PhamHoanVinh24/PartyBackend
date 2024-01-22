var ctxfolderCardJob = "/views/admin/notificationCardJob";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_CARD_JOB', ["my.popover", "ui.sortable", "ngCookies", "ngSanitize", "ngJsTree", "treeGrid", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'ui.select', "pascalprecht.translate", 'dynamicNumber', 'scrollToEnd', 'ngTagsInput']);
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
app.factory('dataserviceCardJob', function ($http) {
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
        $http(req).then(callback);
    };
    return {
        getObjTypeJC: function (callback) {
            $http.post('/Admin/CardJob/GetObjTypeJC').then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/CardJob/GetStatus/').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/NotificationCardJob/GetDepartment/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/NotificationCardJob/GetGroupUser/').then(callback);
        },
        getListDepartment: function (data, callback) {
            $http.post('/Admin/Department/gettreedata/' + data).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/CardJob/GetDepartment/').then(callback);
        },
        getCardWithDepartment: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithDepartment', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...',
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getListUserInDepartment: function (departmentCode, callback) {
            $http.get('/Admin/CardJob/GetListUserInDepartment/?departmentCode=' + departmentCode).then(callback);
        },


        advanceSearch: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearch/', data).then(callback);
        },
        advanceSearchTeam: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchTeam/', data).then(callback);
        },
        advanceSearchGroupUser: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchGroupUser/', data).then(callback);
        },
        advanceSearchProject: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchProject/', data).then(callback);
        },
        advanceSearchCustomer: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchCustomer/', data).then(callback);
        },
        advanceSearchContract: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchContract/', data).then(callback);
        },
        advanceSearchSupplier: function (data, callback) {
            $http.post('/Admin/CardJob/AdvanceSearchSupplier/', data).then(callback);
        },

        getListPageProject: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListPageProject?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithProject: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithProject/', data).then(callback);
        },


        getListPageCustomer: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListPageCustomer?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithCustomer: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithCustomer/', data).then(callback);
        },


        getListPageContract: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListPageContract?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithContract: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithContract/', data).then(callback);
        },


        getListPageSupplier: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListPageSupplier?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithSupplier: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithSupplier/', data).then(callback);
        },


        getBoardsType: function (callback) {
            $http.post('/Admin/CardJob/GetBoardsType/').then(callback);
        },
        getBoardsWithGroupBy: function (callback) {
            $http.post('/Admin/CardJob/GetBoardsWithGroupBy/').then(callback);
        },
        getBoardsWithWorkFlow: function (data, callback) {
            $http.post('/Admin/CardJob/GetBoardsWithWorkFlow?objCode=' + data).then(callback);
        },
        getListBoard: function (callback) {
            $http.post('/Admin/CardJob/GetListBoard/').then(callback);
        },
        checkExistBoardName: function (data, callback) {
            $http.post('/Admin/CardJob/CheckExistBoardName', data).then(callback);
        },
        insertBoard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertBoard/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: ".modal-content",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI(".modal-content");
                }
            }).then(callback);
        },
        getBoardDetail: function (data, callback) {
            $http.post('/Admin/CardJob/GetBoardDetail/?BoardCode=' + data).then(callback);
        },
        deleteBoard: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteBoard/' + data).success(callback)
        },
        updateBoard: function (data, callback) {
            $http.post('/Admin/CardJob/EditBoard/', data).then(callback);
        },

        getLists: function (data, callback) {
            $http.get('/Admin/CardJob/GetLists?BoardCode=' + data).then(callback);
        },
        insertList: function (data, callback) {
            $http.post('/Admin/CardJob/InsertList/', data).then(callback);
        },
        deleteList: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteList/' + data).then(callback);
        },
        updateListName: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateListName/', data).then(callback);
        },
        updateOrder: function (Orther, Entry, callback) {
            $http.post('/Admin/CardJob/UpdateOrder/?Orther=' + Orther + '&Entry=' + Entry).then(callback);
        },
        changeListStatus: function (listID, statusCode, callback) {
            $http.post('/Admin/CardJob/ChangeListStatus/?ListID=' + listID + '&Status=' + statusCode).then(callback);
        },
        changeListBackground: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeListBackground', data).then(callback);
        },
        changeListWeightNum: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeListWeightNum', data).then(callback);
        },
        changeListBeginTime: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeListBeginTime', data).then(callback);
        },
        changeListDeadLine: function (data, callback) {
            $http.post('/Admin/CardJob/changeListDeadLine', data).then(callback);
        },
        checkExistListNameInBoard: function (data, callback) {
            $http.post('/Admin/CardJob/CheckExistListNameInBoard', data).then(callback);
        },

        getListGroupUserPage: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListGroupUserPage?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithGroupUser: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithGroupUser/', data).then(callback);
        },
        getMemberInGroupUser: function (groupUserCode, callback) {
            $http.post('/Admin/CardJob/GetMemberInGroupUser/?groupUserCode=' + groupUserCode).then(callback);
        },
        getListGroupUser: function (data, callback) {
            $http.post('/Admin/CardJob/GetListGroupUser?branch='+data).then(callback);
        },

        getListsAndCard: function (data, callback) {
            $http.post('/Admin/CardJob/GetListsAndCard', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...',
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/CardJob/GetCurrency').then(callback);
        },
        getUnit: function (callback) {
            $http.get('/Admin/CardJob/GetUnit').then(callback);
        },
        getCardsByList: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardsByList/?ListCode=' + data).then(callback);
        },
        getCardDetail: function (data, callback) {
            $http.get('/Admin/CardJob/GetCardDetail?CardCode=' + data).then(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCard/', data).then(callback);
        },
        deleteCard: function (id, callback) {
            $http.post('/Admin/CardJob/DeleteCard/' + id).then(callback);
        },
        getBoardListSugges: function (callback) {
            $http.post('/Admin/CardJob/GetBoardListSugges').then(callback);
        },
        getLevels: function (callback) {
            $http.post('/Admin/CardJob/GetLevels/').then(callback);
        },
        getCardActivityByUser: function (CardCode, callback) {
            $http.get('/Admin/CardJob/GetCardActivityByUser?CardCode=' + CardCode).then(callback);
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
        changeCheckTitle: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeCheckTitle', data).then(callback);
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
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/CardJob/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        updateCardName: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCardName/', data).then(callback);
        },
        updateCardDescription: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCardDescription', data).then(callback);
        },
        updateCardLabel: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCardLabel', data).then(callback);
        },
        changeListCard: function (cardCode, listCode, callback) {
            $http.post('/Admin/CardJob/ChangeListCard/?CardCode=' + cardCode + "&ListCode=" + listCode).then(callback);
        },
        updateWeightNum: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateWeightNum', data).then(callback);
        },
        updateCost: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCost', data).then(callback);
        },
        updateCurrency: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateCurrency', data).then(callback);
        },
        updateActivity: function (cardCode, value, isCheck, callback) {
            $http.get('/Admin/CardJob/UpdateActivity/?CardCode=' + cardCode + '&Value=' + value + '&IsCheck=' + isCheck).then(callback);
        },
        updateAddress: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateAddress/', data).then(callback);
        },
        updateProgress: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateProgress', data).then(callback);
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

        getListPageUser: function (page, length, name, callback) {
            $http.get('/Admin/CardJob/GetListPageUser?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithUser: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardWithUser/', data).then(callback);
        },

        assignGroupOrTeam: function (data, callback) {
            $http.post('/Admin/CardJob/AssignGroupOrTeam/', data).then(callback);
        },
        getActivityAssign: function (data, callback) {
            $http.get('/Admin/CardJob/GetActivityAssign?cardCode=' + data).then(callback);
        },
        getTeamAndGroupUserAssign: function (data, callback) {
            $http.post('/Admin/CardJob/GetTeamAndGroupUserAssign/?CardCode=' + data).then(callback);
        },
        getMemberAssign: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetMemberAssign/?CardCode=' + CardCode).then(callback);
        },
        getListRoleAssign: function (callback) {
            $http.post('/Admin/CardJob/GetListRoleAssign').then(callback);
        },
        checkLeader: function (data, callback) {
            $http.post('/Admin/CardJob/CheckLeader?userId=' + data).then(callback);
        },

        addCheckList: function (data, callback) {
            $http.post('/Admin/CardJob/AddCheckList', data).then(callback);
        },
        deleteCheckList: function (checkCode, callback) {
            $http.post('/Admin/CardJob/DeleteCheckList/?CheckCode=' + checkCode).then(callback);
        },
        getMaxWeightNumCheckList: function (data, callback) {
            $http.post('/Admin/CardJob/GetMaxWeightNumCheckList/?CardCode=' + data).then(callback);
        },
        getCheckList: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetCheckLists/?CardCode=' + cardCode).then(callback);
        },

        addCheckItem: function (data, callback) {
            $http.post('/Admin/CardJob/AddCheckItem', data).then(callback);
        },
        getCheckItem: function (checkCode, callback) {
            $http.post('/Admin/CardJob/GetCheckItem/?CheckCode=' + checkCode).then(callback);
        },
        changeChkItemStatus: function (itemId, callback) {
            $http.post('/Admin/CardJob/ChangeItemStatus/?Id=' + itemId).then(callback);
        },
        changeChkItemTitle: function (data, callback) {
            $http.post('/Admin/CardJob/ChangeItemTitle', data).then(callback);
        },
        deleteCheckItem: function (itemid, callback) {
            $http.post('/Admin/CardJob/DeleteCheckItem/?Id=' + itemid).then(callback);
        },

        addComment: function (data, callback) {
            $http.post('/Admin/CardJob/AddComment', data).then(callback);
        },
        getComment: function (cardCode, callback) {
            $http.post('/Admin/CardJob/GetComments/?CardCode=' + cardCode).then(callback);
        },
        deleteComment: function (cmtId, callback) {
            $http.post('/Admin/CardJob/DeleteComment/?id=' + cmtId).then(callback);
        },
        updateComment: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateComment', data).then(callback);
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
        getFilePath: function (data, data1, callback) {
            $http.post('/Admin/CardJob/GetFilePath?filePath=' + data + "&cardCode=" + data1).then(callback);
        },

        getObjDependency: function (callback) {
            $http.post('/Admin/CardJob/GetObjDependency').then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.post('/Admin/CardJob/GetObjTypeJC').then(callback);
        },
        setObjectRelative: function (data, callback) {
            $http.post('/Admin/CardJob/SetObjectRelative/', data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/CardJob/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback);
        },
        insertJcObjectIdRelative: function (data, callback) {
            $http.post('/Admin/CardJob/InsertJcObjectIdRelative', data).then(callback);
        },
        insertCardDependency: function (data, callback) {
            $http.post('/Admin/CardJob/InsertCardDependency/', data).then(callback);
        },
        getObjectRelative: function (CardCode, callback) {
            $http.post('/Admin/CardJob/GetObjectRelative/?CardCode=' + CardCode).then(callback);
        },
        deleteJcObjectIdRelative: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteJcObjectIdRelative/?ids=' + data).then(callback);
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
        getActivityProduct: function (callback) {
            $http.post('/Admin/CardJob/GetActivityProduct').then(callback);
        },

        getService: function (callback) {
            $http.post('/Admin/CardJob/GetService/').then(callback);
        },
        getCardService: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardService?CardCode=' + data).then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/CardJob/InsertService/', data).then(callback);
        },
        deleteService: function (data, callback) {
            $http.get('/Admin/CardJob/DeleteService?id=' + data).then(callback);
        },
        getActivityService: function (callback) {
            $http.post('/Admin/CardJob/GetActivityService').then(callback);
        },

        GetLisAddressJobCard: function (data, callback) {
            $http.post('/Admin/CardJob/GetLisAddressJobCard?CardCode=' + data).then(callback);
        },
        deleteAddress: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteAddressJobCard?Id=' + data).then(callback);
        },
        InsertAddressJobCard: function (data, callback) {
            $http.post('/Admin/CardJob/InsertAddressJobCard/', data).then(callback);
        },

        //Item work
        getCardItemCheck: function (data, callback) {
            $http.post('/Admin/CardJob/GetCardItemCheck?cardCode=' + data).then(callback);
        },
        autoGenerateWorkSession: function (callback) {
            $http.post('/Admin/CardJob/AutoGenerateWorkSession').then(callback);
        },
        insertWorkItem: function (data, callback) {
            $http.post('/Admin/CardJob/InsertWorkItem', data).then(callback);
        },
        deleteWorkItemActivity: function (data, callback) {
            $http.post('/Admin/CardJob/DeleteWorkItemActivity?id=' + data).then(callback);
        },
        getListWorkItem: function (data, callback) {
            $http.post('/Admin/CardJob/GetListWorkItem?CardCode=' + data).then(callback);
        },
        getItemWork: function (data, callback) {
            $http.post('/Admin/CardJob/GetItemWork?id=' + data).then(callback);
        },
        updateItemWork: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateItemWork', data).then(callback);
        },
        updateProgressFromLeader: function (data, callback) {
            $http.post('/Admin/CardJob/UpdateProgressFromLeader', data).then(callback);
        },
        getMemberInCardJob: function (data, callback) {
            $http.post('/Admin/CardJob/GetMemberInCardJob?cardCode=' + data).then(callback);
        },
        insertJobCardUser: function (data, callback) {
            $http.post('/Admin/CardJob/InsertJobCardUser', data).then(callback);
        },
        getJobCardUser: function (data, callback) {
            $http.post("/Admin/CardJob/GetJobCardUser/", data).then(callback);
        },
        deleteJobCardUser: function (data, callback) {
            $http.post("/Admin/CardJob/DeleteJobCardUser?id=" + data).then(callback);
        },
        insertUserToSubItem: function (data, callback) {
            $http.post("/Admin/CardJob/InsertUserToSubItem", data).then(callback);
        },
        getJobCardSubItemUser: function (data, callback) {
            $http.post("/Admin/CardJob/GetJobCardSubItemUser", data).then(callback);
        },
        checkRoleInCard: function (data, callback) {
            $http.post("/Admin/CardJob/CheckRoleInCard?cardCode=" + data).then(callback);
        },
        checkCardSuccess: function (data, callback) {
            $http.post("/Admin/CardJob/CheckCardSuccess?cardCode=" + data).then(callback);
        },
        getSuggesstion: function (data, callback) {
            $http.post("/Admin/CardJob/GetSuggesstion/", data).then(callback);
        },
        checkListAll: function (callback) {
            $http.post("/Admin/CardJob/CheckListAll").then(callback);
        },
        getLastestProject: function (callback) {
            $http.get("/Admin/CardJob/GetLastestProject").then(callback);
        },
        getInherit: function (data, callback) {
            $http.post("/Admin/CardJob/GetInherit/", data).then(callback);
        },
        updateInherit: function (data, data1, callback) {
            $http.post("/Admin/CardJob/UpdateInherit?cardCode=" + data + "&inherit=" + data1).then(callback);
        },
        copyCard: function (data, callback) {
            $http.post("/Admin/CardJob/CopyCard?cardCode=" + data).then(callback);
        },
        //
        getAllCardJob: function (callback) {
            $http.post("/Admin/CardJob/GetAllCardJob").then(callback);
        },
        getListLinkCardJob: function (data, callback) {
            $http.post("/Admin/CardJob/GetListLinkCardJob/", data).then(callback);
        },
        deleteCardLink: function (data, callback) {
            $http.post("/Admin/CardJob/DeleteCardLink?Id=" + data).then(callback);
        },
        insertLinkCardJob: function (data, callback) {
            $http.post("/Admin/CardJob/InsertLinkCardJob/", data).then(callback);
        },
        userCreatedCard: function (data, callback) {
            $http.get("/Admin/CardJob/UserCreatedCard?cardCode=" + data).then(callback);
        },
        // COMMOMT
        getDataTypeCommon: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        checkWeightNumber: function (data, callback) {
            $http.post('/Admin/CardJob/CheckWeightNumber/', data).then(callback);
        },
        searchProgress: function (data, callback) {
            $http.post('/Admin/CardJob/SearchProgress?boardCode=' + data).then(callback);
        }
    };
});
app.controller('Ctrl_ESEIM_CARDJOB', function ($scope, $rootScope, $compile, $uibModal, dataserviceCardJob, $cookies, $filter, $translate, $window) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.StatusData = [{
            Value: 1,
            Name: 'Kích Hoạt'
        }, {
            Value: 2,
            Name: 'Không kích hoạt'
        }];
        $rootScope.validationOptionsAddCardNormal = {
            rules: {
                CardName: {
                    required: true,
                },
            },
            messages: {
                CardName: {
                    required: caption.CJ_VALIDATE_WORK_REQUIRED
                }
            }
        }

        $rootScope.validationOptionsItemWork = {
            rules: {
                StartTime: {
                    required: true,
                },
                EndTime: {
                    required: true,
                },
                ProgressFromStaff: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
                ProgressFromLeader: {
                    regx: /^[+]?\d+(\.\d+)?$/,
                }
            },
            messages: {
                StartTime: {
                    required: caption.CJ_VALIDATE_START_DATE
                },
                EndTime: {
                    required: caption.CJ_VALIDATE_ENTER_END_DATE
                },
                ProgressFromStaff: {
                    required: caption.CJ_VALIDATE_ENTER_PROGRESS,
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                },
                ProgressFromLeader: {
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                }
            }
        }

        $rootScope.validationOptionsWeightNum = {
            rules: {
                WeightNum: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                WeightNum: {
                    required: caption.CJ_VALIDATE_ENTER_WEIGHTNUM,
                    regx: caption.CJ_VALIDATE_ENTER_WEIGHTNUM_PLUS,
                }
            }

        }

        $rootScope.validationOptionsProgress = {
            rules: {
                Progress: {
                    required: true,
                    //regx: /^([0-9])+\b$/,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                Progress: {
                    required: caption.CJ_VALIDATE_PROGRESS,
                    regx: caption.CJ_VALIDATE_PROGRESS_NEGATIVE
                }
            }
        }
        $rootScope.isTranslate = true;
    });
    $rootScope.isTranslate = false;
    $rootScope.searchObj = {
        CardName: '',
        FromDate: '',
        ToDate: '',
        Status: '',
        Comment: '',
        Description: '',
        Object: '',
        ButtonStatus: false,
        Department: '',
        Group: '',
        ObjTypeCode: ''
    };
    $rootScope.open = true;
    $rootScope.CheckListCode = '';
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CardJob/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderCardJob + '/index.html',
            controller: 'indexCardJob'
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
app.controller('indexCardJob', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceCardJob, $filter, $window, $cookies) {
    $scope.listObjWithType = []
    $scope.initData = function () {
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() - 30)
        $rootScope.searchObj.ToDate = $filter('date')((date), 'dd/MM/yyyy')
        $rootScope.searchObj.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
        $rootScope.searchObj.Status = "CREATED"
        dataserviceCardJob.getObjTypeJC(function (rs) {
            rs = rs.data;
            $scope.objTypeJC = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.objTypeJC.unshift(all)
        })
        dataserviceCardJob.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
        });
        dataserviceCardJob.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listDepartment.unshift(all)
        })
        dataserviceCardJob.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listGroup.unshift(all)
        });
        var all = {
            Code: '',
            Name: 'Tất cả'
        }
        $scope.listObjWithType.unshift(all)
    }
    $scope.initData();
    $scope.objTypeChange = function (code) {
        dataserviceCardJob.getObjTypeCode(code, function (rs) {
            rs = rs.data;
            $scope.listObjWithType = rs;
            
        });
    };
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/NotificationCardJob/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ListObjCode = $rootScope.listSelectBoardCommon;
                d.BoardCode = $rootScope.boardCode;
                d.CardName = $rootScope.searchObj.CardName;
                d.Fromdate = $rootScope.searchObj.FromDate;
                d.Todate = $rootScope.searchObj.ToDate;
                d.Status = $rootScope.searchObj.Status;
                d.ObjCode = $rootScope.searchObj.Object;
                d.Group = $rootScope.searchObj.Group;
                d.Department = $rootScope.searchObj.Department;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var cardCode = data.CardCode;
                    $scope.edit(cardCode);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"Tiêu đề" | translate}}').renderWith(function (data, type, full) {
        var deadLine = '';
        if (full.EndTime == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        } else {
            var created = new Date(full.EndTime);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }

        if (full.Status == 'Hoàn thành') {
            var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Hoàn thành</span>' +
                '</div';
            //'<span class="badge-customer badge-customer-success fs9 ml5"> ' + $filter('currency')(full.Completed, '', 0) + '%</span></div>';
        } else if (full.Status == 'Đang triển khai') {
            var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Đang triển khai</span>' + deadLine +
                //'<span class="badge-customer badge-customer-warning fs9 ml5"> ' + $filter('currency')(full.Completed, '', 0) + '%</span></div>' +
                '</div>';
        } else if (full.Status == 'Bị hủy') {
            var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Bị hủy</span>' +
                //'<span class="badge-customer badge-customer-warning fs9 ml5" > ' + $filter('currency')(full.Completed, '', 0) + '%</span>' +
                '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Mới tạo</span>' + deadLine +
                //'<span class="badge-customer badge-customer-danger fs9 ml5" > ' + $filter('currency')(full.Completed, '', 0) + '%</span>' +
                '</div>';
        }
    }).withOption('sClass', 'nowrap'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"Từ ngày" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"Đến ngày" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListObj').withOption('sClass', 'nowrap').withTitle('<i class="fa fa-navicon mr5"></i> {{"Đối tượng" | translate}}').renderWith(function (data, type, full) {
        var ListObj = JSON.parse(full.ListObj);
        var item = "";
        for (var i = 0; i < ListObj.length; i++) {
            item += "<span class='text-danger'>- " + ListObj[i].Name + "</span></br>";
        }
        return item;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListGroup').withOption('sClass', 'nowrap').withTitle('<i class="fa fa-navicon mr5"></i> {{"Nhóm" | translate}}').renderWith(function (data, type, full) {
        var listGroup = JSON.parse(full.ListGroup);
        var item = "";
        for (var i = 0; i < listGroup.length; i++) {
            item += "<span class='text-danger'>- " + listGroup[i].Name + "</span></br>";
        }
        return item;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListDepartment').withOption('sClass', 'nowrap').withTitle('<i class="fa fa-navicon mr5"></i> {{"Phòng ban" | translate}}').renderWith(function (data, type, full) {
        var listDepartment = JSON.parse(full.ListDepartment);
        var item = "";
        for (var i = 0; i < listDepartment.length; i++) {
            item += "<span class='text-danger'>- " + listDepartment[i].Name + "</span></br>";
        }
        return item;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'nowrap').withTitle('<i class="fa fa-navicon mr5"></i> {{"Trạng thái" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(null, resetPaging);
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
    $rootScope.reloadGridCard = function () {
        reloadData(true);
    }
    $scope.search = function () {
        reloadData();
    }
    $scope.edit = function (CardCode) {
        $rootScope.titleModalAssign = 3;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
            controller: 'edit-cardCardJob',
            backdrop: 'static',
            keyboard: false,
            size: '60',
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(false);
        }, function () { });
    }
    function loadDateSearch() {
        //search
        $.fn.datepicker.defaults.language = 'vi';
        $('#FromDate').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $('#ToDate').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        loadDateSearch();
    }, 3000);
});
app.controller('edit-cardCardJob', function ($scope, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, $filter, para) {
    $scope.address = {
        lat: '',
        lng: '',
        text: ''
    };
    $scope.cardCode = para;
    $scope.product = {
        ProductCode: '',
        Quantity: '',
        Activity: ''
    };
    $scope.service = {
        ServiceCode: '',
        Quantity: '',
        Activity: ''
    };
    $scope.obj = {
        CardCode: para
    };

    $scope.checkitem = {
        Title: ''
    };
    $scope.comment = {
        Content: ''
    };
    $scope.checkList = [];
    $scope.show = {
        SelectCard: false
    };
    $scope.listObjRelative = [];
    $scope.listID = [];
    $scope.listItemWork = []


    $scope.jobCardUser = {
        CheckListCode: '',
        CardCode: para
    }
    //Item work 
    $scope.getChkListCode = function (ChkListCode) {

        $rootScope.CheckListCode = ChkListCode;
        $scope.jobCardUser.CheckListCode = ChkListCode;
        $scope.jobCardUser.CardCode = para;
        dataserviceCardJob.getJobCardUser($scope.jobCardUser, function (rs) {
            rs = rs.data;
            $scope.listUserInItem = rs;
        })
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.initData = function () {
        $scope.showForm = true;
        dataserviceCardJob.getLevels(function (rs) {
            rs = rs.data;
            $scope.CardLevels = rs;
        });
        dataserviceCardJob.getWorkType(function (rs) {
            rs = rs.data;
            $scope.WorkTypes = rs;
        });
        dataserviceCardJob.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
        });
        dataserviceCardJob.getCardDetail(para, function (rs) {
            rs = rs.data;
            if (!rs.Error) {

                $scope.model = rs.Object.CardDetail;
                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy') : '';
                $scope.model.EndTime = $scope.model.EndTime != '' ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy') : '';
                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';

                $scope.completeBoard = rs.Object.BoardCompleted;
                $scope.completeList = rs.Object.ListCompleted;
                $scope.leader = rs.Object.Leader;
                //InitMap
                initMap();
                initDataMap();
                mapReSize();
            }
        });
        dataserviceCardJob.getAttachment(para, function (rs) {
            rs = rs.data;
            $scope.attachments = rs;
        });
        dataserviceCardJob.getCheckList(para, function (rs) {
            rs = rs.data;
            $scope.checklists = rs;
            angular.forEach(rs, function (value, key) {
                dataserviceCardJob.getCheckItem(value.ChkListCode, function (result) {
                    result = result.data;
                    $scope.checkList[value.ChkListCode] = result;
                })
            })
        });
        dataserviceCardJob.getComment(para, function (rs) {
            rs = rs.data;
            $scope.comments = rs;

        });
        //dataserviceCardJob.getObjectRelative(para, function (rs) {rs=rs.data;
        //    $scope.objectRelative = rs;
        //});
        dataserviceCardJob.getProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });

        dataserviceCardJob.getService(function (rs) {
            rs = rs.data;
            $scope.listService = rs;
        })
        dataserviceCardJob.getUnit(function (rs) { rs = rs.data; $scope.listUnit = rs });
        dataserviceCardJob.getCardActivityByUser(para, function (rs) {
            rs = rs.data;
            $scope.activity = rs;
        });
        dataserviceCardJob.getCardProduct(para, function (rs) {
            rs = rs.data;
            $scope.listCardProduct = rs;
        });
        dataserviceCardJob.getCardService(para, function (rs) {
            rs = rs.data;
            $scope.listCardService = rs;
        });
        dataserviceCardJob.GetLisAddressJobCard(para, function (rs) {
            rs = rs.data;
            $scope.listAddress = rs;
        });
        $scope.acticeDetailDrag = false;
        dataserviceCardJob.getObjectRelative($scope.cardCode, function (rs) {
            rs = rs.data;
            $scope.listID = [];
            $scope.listObjRelative = rs;
            for (var i = 0; i < $scope.listObjRelative.length; i++) {
                $scope.listID.push($scope.listObjRelative[i].ID);
            }
        });
        dataserviceCardJob.getActivityService(function (rs) {
            rs = rs.data;
            $scope.listActivityService = rs;
        });
        dataserviceCardJob.getActivityProduct(function (rs) {
            rs = rs.data;
            $scope.listActivityProduct = rs;
        });
        dataserviceCardJob.getListWorkItem(para, function (rs) {
            rs = rs.data;
            $scope.listItemWork = rs.Object;
        });
        dataserviceCardJob.getActivityAssign(para, function (rs) {
            rs = rs.data;
            $scope.ActivityData = rs;
        });

    };
    $scope.initData();
    $scope.hiddenForm = function () {
        if ($scope.showForm == true) {
            $scope.showForm = false;
        } else {
            $scope.showForm = true;
        }
    }

    var listDeletedDependency = [];
    $scope.deleteObjTypeReletive = function (id) {
        //for (var i = 0; i < $scope.listObjRelative.length; i++) {

        //    if ($scope.listObjRelative[i].ID == id) {
        //        $scope.listObjRelative.splice(i, 1);
        //        if (id > 0) {
        //            listDeletedDependency.push(id);
        //        }
        //        break;
        //    }
        //}
        dataserviceCardJob.deleteJcObjectIdRelative(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    };
    //Object relative
    $scope.initCardRelative = function (cardCode) {
        //dataserviceCardJob.getObjectRelative(cardCode, function (rs) {rs=rs.data;
        //    $scope.objectRelative = rs;
        //});
        dataserviceCardJob.getObjectRelative($scope.cardCode, function (rs) {
            rs = rs.data;
            $scope.listID = [];
            $scope.listObjRelative = rs;
            for (var i = 0; i < $scope.listObjRelative.length; i++) {
                $scope.listID.push($scope.listObjRelative[i].ID);
            }
        });
    }
    $scope.deleteObjReletive = function (id) {
        dataserviceCardJob.deleteCardDependency(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initCardRelative(para);
            }
        });
    };
    $scope.addObjectRelative = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-object-relative.html',
            controller: 'add-object-relativeCardJob',
            size: '60',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
        });
        modalInstance.result.then(function (d) {
            //dataserviceCardJob.getObjectRelative($scope.cardCode, function (rs) {rs=rs.data;
            //    $scope.listID = [];
            //    $scope.listObjRelative = rs;
            //    for (var i = 0; i < $scope.listObjRelative.length; i++) {
            //        $scope.listID.push($scope.listObjRelative[i].ID);
            //    }
            //});
            $scope.initData();
            $scope.showForm = false;
        }, function () {
        });
    };
    //Address
    $scope.saveAddress = function () {
        //var data = { cardCode: para, lat: $scope.address.lat, lng: $scope.address.lng, address: $scope.address.text };
        //dataserviceCardJob.updateAddress(data, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //    }
        //})
        var data = { CardCode: $scope.obj.CardCode, LocationGps: "" + $scope.address.lat + "," + $scope.address.lng, LocationText: $scope.address.text };
        dataserviceCardJob.InsertAddressJobCard(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.GetLisAddressJobCard(para, function (rs) {
                    rs = rs.data;
                    $scope.listAddress = rs;
                });
            }
        })
    }
    //Tab
    $scope.addProduct = function (productCode, quantity, activity) {
        if (productCode == '' && quantity == '') {
            App.toastrError(caption.CJ_MSG_SELECT_PRODUCT_QUANTITY);
        } else {
            if (productCode == '') {
                App.toastrError(caption.CJ_MSG_SELECT_PRODUCT);
            } else if (quantity == '') {
                App.toastrError(caption.CJ_MSG_SELECT_QUANTITY);
            } else {
                if (quantity >= 0) {
                    var data = { CardCode: para, ProductCode: productCode, Quantity: quantity, JcAct: activity };
                    dataserviceCardJob.insertProduct(data, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataserviceCardJob.getCardProduct(para, function (rs) {
                                rs = rs.data;
                                $scope.listCardProduct = rs;
                            });
                        }
                    })
                } else {
                    App.toastrError(caption.COM_FOMART_FAILED.replace("{0}", caption.CJ_CURD_LBL_QUANTITY))
                }
            }
        }
    }
    $scope.deletedProduct = function (id) {
        dataserviceCardJob.deleteProduct(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.getCardProduct(para, function (rs) {
                    rs = rs.data;
                    $scope.listCardProduct = rs;
                });
            }
        })
    }
    $scope.addService = function (serviceCode, quantity, activity) {
        if (serviceCode == '' && quantity == '') {
            App.toastrError(caption.CJ_MSG_SELECT_SERVICE_QUANTITY);
        } else {
            if (serviceCode == '') {
                App.toastrError(caption.CJ_MSG_SELECT_SERVICE);
            } else if (quantity == '') {
                App.toastrError(caption.CJ_MSG_SELECT_QUANTITY);
            } else {
                if (quantity >= 0) {
                    var data = { CardCode: para, ServiceCode: serviceCode, Quantity: quantity, JcAct: activity };
                    dataserviceCardJob.insertService(data, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataserviceCardJob.getCardService(para, function (rs) {
                                rs = rs.data;
                                $scope.listCardService = rs;
                            });
                        }
                    })
                } else {
                    App.toastrError(caption.COM_FOMART_FAILED.replace("{0}", caption.CJ_CURD_LBL_QUANTITY))
                }
            }
        }
    }
    $scope.deletedService = function (id) {
        dataserviceCardJob.deleteService(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.getCardService(para, function (rs) {
                    rs = rs.data;
                    $scope.listCardService = rs;
                });
            }
        })
    }
    $scope.deletedAddress = function (id) {

        dataserviceCardJob.deleteAddress(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.GetLisAddressJobCard(para, function (rs) {
                    rs = rs.data;
                    $scope.listAddress = rs;
                });
            }
        })
    }
    //left
    $scope.updateCardName = function (id) {
        //console.log(id);
        var element = $('#card_' + id);
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        //console.log('NewName: ' + newName);
        //console.log("CurrentName: " + currentName);
        if (newName != currentName) {
            //console.log("Change name");
            var obj = {
                CardID: id,
                CardName: newName
            }
            dataserviceCardJob.updateCardName(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    //App.toastrError(rs.Title);
                }
                else {
                    //App.toastrSuccess(rs.Title);
                    //$scope.initData();
                    element.attr('data-currentvalue', newName)
                }
                console.log(rs.Title);
            })
        }
        $scope.acticeDetailDrag = false;
    }
    $scope.editingCardetailHeader = function (id) {
        if ($(".modal-dialog").hasClass("ui-draggable-dragging") == false) {
            $scope.acticeDetailDrag = true;
            document.getElementById("card_" + id).focus();
        } else {
            $scope.acticeDetailDrag = false;
        }
    }
    $scope.addMember = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-group-or-team.html',
            controller: 'add-group-or-teamCardJob',
            size: '40',
            resolve: {
                obj: function () {
                    return {
                        CardCode: para,
                        Type: 4
                    };
                }
            },
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };
    $scope.changeDeadline = function (deadline) {
        dataserviceCardJob.updateDeadLine(para, deadline, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.changeWeightNum = function (weightNum) {
        if (weightNum >= 0) {
            var obj = {
                CardCode: para,
                WeightNum: weightNum
            }
            dataserviceCardJob.updateWeightNum(obj, function (rs) {
                rs = rs.data;

                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    if (rs.Title != '') {
                        App.toastrSuccess(rs.Title);
                        $scope.model.Completed = rs.Object.PercentCard;
                        $scope.completeList = rs.Object.PercentList;
                        $scope.completeBoard = rs.Object.PercentBoard;
                    }
                }
            });
        } else {
            App.toastrError(caption.COM_FOMART_FAILED.replace("{0}", caption.CJ_CURD_LBL_WEIGHT_NUM))
        }
    }
    $scope.changeWorkType = function (type) {
        dataserviceCardJob.changeWorkType(para, type, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.changeCardStatus = function (status) {
        dataserviceCardJob.changeCardStatus(para, status, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.changeCardLevel = function (level) {
        dataserviceCardJob.changeCardLevel(para, level, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.changeCost = function (cost) {
        if (cost >= 0) {
            var obj = {
                CardCode: para,
                Cost: cost
            }
            dataserviceCardJob.updateCost(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    if (rs.Title != '') {
                        App.toastrSuccess(rs.Title);
                    }
                }
            });
        } else {
            App.toastrError(caption.COM_FOMART_FAILED.replace("{0}", caption.CJ_CURD_LBL_COST))
        }
    };
    $scope.changeCardCurrency = function (currency) {
        var obj = {
            CardCode: para,
            Currency: currency
        }
        dataserviceCardJob.updateCurrency(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    $scope.updateActivity = function (value, isCheck) {
        if (isCheck) {
            var activity = $scope.activity.find(function (element) {
                if (element.Value != value && element.Value != 0) return true;
            });
            if (activity) {
                activity.IsCheck = false;
            }
        }
        dataserviceCardJob.updateActivity(para, value, isCheck, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var activity = $scope.activity.find(function (element) {
                    if (element.Value == value) return true;
                });
                if (activity) {
                    activity.Date = rs.Object.Date;
                    activity.Time = rs.Object.Time;
                }
                App.toastrSuccess(rs.Title);
            }
        });
    }
    $scope.editDescription = function () {
        if ($scope.model.Description === "" || $scope.model.Description == null || $scope.model.Description == undefined) {
            return;
        }
        var obj = {
            CardCode: para,
            Description: $scope.model.Description
        }
        dataserviceCardJob.updateCardDescription(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    };
    $scope.cardChangeBeginTime = function (beginTime) {
        dataserviceCardJob.updateBeginTime(para, beginTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.cardChangeEndTime = function (endTime) {
        dataserviceCardJob.updateEndTime(para, endTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.cardQuantitative = function (quantitative) {
        if (quantitative >= 0) {
            dataserviceCardJob.updateQuantitative(para, quantitative, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Title != '') {
                        App.toastrSuccess(rs.Title);
                    }
                }
            })
        } else {
            App.toastrError(caption.COM_FOMART_FAILED.replace("{0}", caption.CJ_CURD_LBL_QUANTITATIVE))
        }
    }
    $scope.cardUnit = function (unit) {
        dataserviceCardJob.updateUnit(para, unit, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    $scope.addLabel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/label.html',
            controller: 'labelCardJob',
            size: '35',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }
    $scope.addAttachment = function () {
        $("#fileAttachment").trigger("click");
    }
    $scope.loadAttachment = function (event) {
        var file = event.target.files[0];
        if (file != undefined) {
            var data = new FormData();
            data.append("FileUpload", file);
            dataserviceCardJob.uploadAttachment(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    var fileName = $('#fileAttachment').val();
                    var idxDot = fileName.lastIndexOf(".") + 1;
                    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                    var file = fileName.split('\\');
                    $scope.fileAttachment = {
                        FileName: file[file.length - 1],
                        FileUrl: '/uploads/files/' + rs.Object,
                        CardCode: para
                    }
                    $('#fileAttachment').replaceWith($('#fileAttachment').val('').clone(true));
                    dataserviceCardJob.addAttachment($scope.fileAttachment, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            dataserviceCardJob.getAttachment(para, function (rs) {
                                rs = rs.data;
                                $scope.attachments = rs;
                            });
                        }
                    })
                }
            });
        }
    }
    $scope.deleteAttachment = function (fileCode) {
        dataserviceCardJob.deleteAttachment(fileCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }
    $scope.viewFileOnl = function (source, isEdit) {
        
        if (isEdit == false) {
            dataserviceCardJob.getFilePath(source, $scope.cardCode, function (rs) {
                rs = rs.data;
                var extension = source.substr(source.lastIndexOf('.') + 1);
                var word = ['DOCX', 'DOC'];
                var pdf = ['PDF'];
                var excel = ['XLS', 'XLSX'];
                if (word.indexOf(extension.toUpperCase()) !== -1) {
                    window.open('/Admin/Docman/Index', '_blank')
                } else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
                    window.open('/Admin/PDF/Index', '_blank')
                } else if (excel.indexOf(extension.toUpperCase()) !== -1) {
                    window.open('/Admin/Excel', '_blank')
                } else {
                    window.open(source, '_blank')
                }
            });
        } else {
            App.toastrError("File đang được chỉnh sửa. Vui lòng đợi");
        }
    }


    $scope.addCheckList = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-checklist.html',
            controller: 'add-checklistCardJob',
            size: '25',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
            //backdrop: 'static',
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }
    $scope.deleteCheckList = function (CheckCode) {
        dataserviceCardJob.deleteCheckList(CheckCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }
    $scope.editCheckTitle = function (e) {
        var checkTitle = e.target.value;
        var checkItem = e.target.getAttribute("checkcode");
        console.log(checkTitle);
        console.log(checkItem);
        $scope.show.editCheckTitle[e.target.getAttribute('checkcode')] = false;
        var obj = {
            ChkListCode: checkItem,
            CheckTitle: checkTitle
        }
        dataserviceCardJob.changeCheckTitle(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }
    $scope.deleteCheckItem = function (id) {
        dataserviceCardJob.deleteCheckItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })
    }

    $scope.checkItemClick = function (itemId, checkListId) {
        dataserviceCardJob.changeChkItemStatus(itemId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                if (rs.Object) {
                    dataserviceCardJob.checkCardSuccess(para, function (result) {
                        result = result.data;
                        if (result == true) {
                            $scope.model.Status = "DONE";
                            dataserviceCardJob.changeCardStatus(para, $scope.model.Status, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                }
                            });
                        } else if ($scope.model.Status == "DONE") {
                            $scope.model.Status = "START";
                            dataserviceCardJob.changeCardStatus(para, $scope.model.Status, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                }
                            })
                        }
                    })


                    $scope.model.Completed = rs.Object.PercentCard;
                    $scope.completeList = rs.Object.PercentList;
                    $scope.completeBoard = rs.Object.PercentBoard;
                    var checkList = $scope.checklists.find(function (element) {
                        if (element.Id == checkListId) return true;
                    });
                    if (checkList) {
                        checkList.Completed = rs.Object.PercentCheckList;
                    }
                }
            }
        });
    }
    $scope.addCheckItem = function (checkCode) {
        
        var obj = {
            ChkListCode: checkCode,
            Title: $scope.checkitem.Title
        }
        dataserviceCardJob.addCheckItem(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.checkitem.Title = '';
                $scope.initData();
                $scope.show.addCheckItem[checkCode] = false;
            }
        })
    }
    $scope.editCheckItemTitle = function (e) {
        var itemTitle = e.target.value;
        var itemId = e.target.getAttribute("itemid");
        //console.log(itemTitle);
        //console.log(itemId);
        $scope.show.editCheckItem[e.target.getAttribute('itemid')] = false;
        var obj = {
            Id: itemId,
            Title: itemTitle
        }
        dataserviceCardJob.changeChkItemTitle(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        })

    }

    $scope.addComment = function () {
        if ($scope.comment.Content == "") {
            //App.toastrError(caption.CJ_CURD_MSG_ENTER_COMMENT);//Nhập bình luận!
            return;
        }
        var obj = {
            CardCode: para,
            CmtContent: $scope.comment.Content
        }
        dataserviceCardJob.addComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.comment.Content = '';
                $scope.initData();
            }
        })
    }
    $scope.deleteComment = function (CmtId) {

        dataserviceCardJob.deleteComment(CmtId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }
    $scope.updateComment = function (e) {
        console.log(e.target.getAttribute('cmtid'));
        $scope.show.editComment[e.target.getAttribute('cmtid')] = false;
        var obj = {
            Id: e.target.getAttribute('cmtid'),
            CmtContent: e.target.value
        }
        dataserviceCardJob.updateComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    };

    $scope.deleteCard = function (id) {
        dataserviceCardJob.deleteCard(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.cancel();
                $rootScope.loadWork(false);
            }
        })
    };
    $scope.itemWork = {
        checkItem: false
    };
    $scope.addItemWork = function () {
        $rootScope.isDisabled = false;
        dataserviceCardJob.changeCardStatus(para, "START", function (rs) {
            rs = rs.data;
            if (rs.Error) {
                //App.toastrError(rs.Title);
            }
            else {
                $scope.initData();
                //App.toastrSuccess(rs.Title);
            }
        });
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/item-work.html',
            controller: 'add-item-work',
            size: '40',
            resolve: {
                cardCode: function () {
                    return para;
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getListWorkItem(para, function (rs) {
                rs = rs.data;
                $scope.listItemWork = rs.Object;
            });
        });
    }
    $scope.updateProgressFromLeader = function (id) {
        dataserviceCardJob.checkRoleInCard(para, function (rs1) {
            rs1 = rs1.data;
            if (rs1 == true) {
                var element = $('#item_' + id);
                var newName = element.val();
                var currentName = element.attr('data-currentvalue');
                if (newName != currentName) {
                    var obj = {
                        Id: id,
                        ProgressFromLeader: newName,
                        CardCode: para
                    }
                    dataserviceCardJob.updateProgressFromLeader(obj, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            element.attr('data-currentvalue', newName)
                            App.toastrSuccess(rs.Title);
                            dataserviceCardJob.getListWorkItem(para, function (rs) {
                                rs = rs.data;
                                $scope.listItemWork = rs.Object;
                            });
                            dataserviceCardJob.checkCardSuccess(para, function (result) {
                                result = result.data;
                                if (result == true) {
                                    $scope.model.Status = "DONE";
                                    dataserviceCardJob.changeCardStatus(para, $scope.model.Status, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        }
                                        else {
                                            App.toastrSuccess(rs.Title);
                                        }
                                    })
                                } else if ($scope.model.Status == "DONE") {
                                    $scope.model.Status = "START";
                                    dataserviceCardJob.changeCardStatus(para, $scope.model.Status, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        }
                                        else {
                                            App.toastrSuccess(rs.Title);
                                        }
                                    })
                                }
                            })
                        }
                        console.log(rs.Title);
                    })
                }
                $scope.acticeDetailDrag = false;
            } else {
                App.toastrError(caption.CJ_MSG_YOU_NOT_LEADER);
            }
        })
    }
    $scope.editItemWork = function (id) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/item-work.html',
            controller: 'edit-item-work',
            size: '40',
            resolve: {
                idItemWork: function () {
                    return {
                        Id: id,
                        CardCode: para
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getListWorkItem(para, function (rs) {
                rs = rs.data;
                $scope.listItemWork = rs.Object;
            });
        });
    }
    $scope.viewItemWork = function (x) {
        if (x.checkItem) {
            x.checkItem = false;
        } else {
            x.checkItem = true;
        }
    }
    $scope.deleteItemWork = function (id) {
        dataserviceCardJob.deleteWorkItemActivity(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.getListWorkItem(para, function (rs) {
                    rs = rs.data;
                    $scope.listItemWork = rs.Object;
                });
            }
        });
    }
    $scope.assignUserToItem = function (chkListCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/assign-user-item-check.html',
            controller: 'assign-user-item-check',
            size: '40',
            resolve: {
                cardCodeAssign: function () {
                    return {
                        ChkListCode: chkListCode,
                        CardCode: para
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getCheckList(para, function (rs) {
                rs = rs.data;
                $scope.checklists = rs;
                angular.forEach(rs, function (value, key) {
                    dataserviceCardJob.getCheckItem(value.ChkListCode, function (result) {
                        result = result.data;
                        $scope.checkList[value.ChkListCode] = result;
                    })
                })
            });
        });
    }
    $scope.addLinkCardJob = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/add-card-link.html',
            controller: 'add-card-link',
            windowClass: "message-center",
            size: '35',
            resolve: {
                cardJob: function () {
                    return {
                        cardCode: para,
                        cardName: $scope.model.CardName
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getCheckList(para, function (rs) {
                rs = rs.data;
                $scope.checklists = rs;
                angular.forEach(rs, function (value, key) {
                    dataserviceCardJob.getCheckItem(value.ChkListCode, function (result) {
                        result = result.data;
                        $scope.checkList[value.ChkListCode] = result;
                    })
                })
            });
        });
    }
    $scope.assignUserToSubItem = function (checkitemId, checkListCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCardJob + '/assign-user-sub-item-check.html',
            controller: 'assign-user-sub-item-check',
            size: '40',
            resolve: {
                item: function () {
                    return {
                        CheckitemId: checkitemId,
                        CheckListCode: checkListCode,
                        CardCode: para
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getCheckList(para, function (rs) {
                rs = rs.data;
                $scope.checklists = rs;
                angular.forEach(rs, function (value, key) {
                    dataserviceCardJob.getCheckItem(value.ChkListCode, function (result) {
                        result = result.data;
                        $scope.checkList[value.ChkListCode] = result;
                    })
                })
            });
        });
    }
    function initMap() {
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
    function initDataMap() {
        if ($scope.model.LocationGps == null) {
            $scope.address.lat = $rootScope.latDefault;
            $scope.address.lng = $rootScope.lngDefault;
            $scope.address.text = $rootScope.addressDefault;
        } else {
            $scope.address.lat = parseFloat($scope.model.LocationGps.split(',')[0]);
            $scope.address.lng = parseFloat($scope.model.LocationGps.split(',')[1]);
            $scope.address.text = $scope.model.LocationText;
        }


        var centerPoint = { lat: $scope.address.lat, lng: $scope.address.lng };
        var infowindow = new google.maps.InfoWindow({
            content: $scope.address.text,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
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
        var input = document.getElementById('searchAddress');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);


        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Không tìm thấy địa chỉ này");
                return;
            }
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            $scope.address.text = place.formatted_address;
            $scope.address.lat = place.geometry.location.lat();
            $scope.address.lng = place.geometry.location.lng();
            $scope.$apply();
        });

        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            $scope.address.lat = point.lat;
            $scope.address.lng = point.lng;
            dataserviceCardJob.getAddress(point.lat, point.lng, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var html = "<b>Thông tin</b> <br/>" + rs.Object;
                    infowindow.setContent(html);
                    infowindow.open(map, marker, html);
                    $scope.address.text = rs.Object;
                }
            })
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
    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }
    function loadDate() {
        $("#startDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datepicker('setStartDate', maxDate);
        });
        $("#endDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datepicker('setEndDate', maxDate);
        });
        $("#deadline").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);
    $scope.addCommonSettingWorkType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'OBJ_WORKTYPE',
                        GroupNote: 'Kiểu công việc',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getWorkType(function (rs) {
                rs = rs.data;
                $scope.WorkTypes = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingCardLevel = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'LEVEL',
                        GroupNote: 'Độ ưu tiên',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceCardJob.getLevels(function (rs) {
                rs = rs.data;
                $scope.CardLevels = rs;
            });
        }, function () { });
    }
});
app.controller('add-object-relativeCardJob', function ($scope, $rootScope, $cookies, $cookieStore, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, cardCode) {
    var dataSet = [];
    //var listDependency = [];
    var listDeletedDependency = [];
    $scope.listRelaive = [];
    $scope.setting = {
        Id: -1,
        //ObjDependency: '',
        ObjTypeCode: '',
        ObjCode: '',
        Relative: '',
        Member: '',
        Team: '',
        setting: '',
        Weight: '',
    };

    $scope.useDefaultSetting = function () {
        var DfSetting = $cookies.getObject('DefaultCardSetting');
        if (DfSetting !== undefined) {

            dataSet = [];
            $scope.cardMember.listTeam = DfSetting.Team;
            $scope.cardMember.listMember = DfSetting.Member;
            angular.forEach(DfSetting.ListDependency, function (value, key) {
                var obj = [];
                obj.push(value.Dependency);
                obj.push(value.ObjCode);
                obj.push(value.Relative);
                dataSet.push(obj);
            });

            refrestTable();
        }
    };
    $scope.initData = function () {
        dataserviceCardJob.getObjTypeJC(function (rs) {
            rs = rs.data;
            $scope.objTypeJC = rs;
        })
        dataserviceCardJob.getObjectRelative(cardCode, function (rs) {
            rs = rs.data;
            angular.forEach(rs, function (value, key) {
                var obj = [];
                obj.push(value.ObjTypeCode);
                obj.push(value.ObjTypeName);
                obj.push(value.ObjID);
                obj.push(value.ObjName);
                obj.push(value.RelativeCode);
                obj.push(value.RelativeName);
                obj.push(value.Weight);
                obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + value.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
                obj.push(value.ID);
                dataSet.push(obj);
            });

            setTimeout(function () {
                refrestTable();
            }, 100);
        });
        dataserviceCardJob.getRelative(function (rs) {
            rs = rs.data;
            $scope.relative = rs;
        })
    };
    $scope.initData();
    $scope.objTypeChange = function (code) {
        dataserviceCardJob.getObjTypeCode(code, function (rs) {
            rs = rs.data;
            $scope.listObjWithType = rs;
        });
    };
    $scope.addDependency = function () {

        var id = $scope.setting.Id--;
        if ($scope.setting.ObjTypeCode === "" || $scope.setting.ObjCode === "" || $scope.setting.Relative === "") {
            App.toastrError(caption.CJ_CURD_MSG_CHOOSE_INFO);
            return;
        }
        var objDependency = $scope.objTypeJC.find(function (element) {
            if (element.Code == $scope.setting.ObjTypeCode) return true;
        });
        var objRelative = $scope.listObjWithType.find(function (element) {
            if (element.Code == $scope.setting.ObjCode) return true;
        });
        var relative = $scope.relative.find(function (element) {
            if (element.Code == $scope.setting.Relative) return true;
        });
        var WeightTotal = 0;
        for (var i = 0; i < dataSet.length; i++) {
            WeightTotal = WeightTotal + parseFloat(dataSet[i][6]);
            for (var j = 0; j < dataSet[i].length; j++) {
                if (dataSet[i][j] === $scope.setting.ObjCode) {
                    App.toastrError(caption.CJ_CURD_MSG_OBJ_CODE_EXITED);
                    return;
                }
            }
        }
        
        var WeightNumber = 0;
        if ($scope.setting.Weight == null) {
        }
        else if ($scope.setting.Weight == "") {
        }
        else {
            WeightNumber = parseFloat($scope.setting.Weight);
        }
        
        dataserviceCardJob.checkWeightNumber({ ObjTypeCode: objDependency.Code, ObjID: objRelative.Code, WeightNum: WeightNumber }, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var obj = [];
                obj.push(objDependency.Code);
                obj.push(objDependency.Name);
                obj.push(objRelative.Code);
                obj.push(objRelative.Name);
                obj.push(relative.Code);
                obj.push(relative.Name);
                obj.push(WeightNumber);
                obj.push('<button title="Xoá" ng-click="deleteObjReletive(' + id + ')" style="width: 25px;margin-left: 30px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i style="color:red" class="fa fa-trash"></i></button>');
                obj.push(id);
                dataSet.push(obj);
                refrestTable();
            }
        });
    };
    $scope.deleteObjReletive = function (id) {
        for (var i = 0; i < dataSet.length; i++) {

            if (dataSet[i][8] == id) {
                dataSet.splice(i, 1);
                refrestTable();
                if (id > 0) {
                    listDeletedDependency.push(id);
                }
                break;
            }
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.close('cancle');
    };
    $scope.submit = function () {
        listDependency = [];

        for (var i = 0; i < dataSet.length; i++) {
            var data = { Id: dataSet[i][8], ObjTypeCode: dataSet[i][0], ObjCode: dataSet[i][2], Relative: dataSet[i][4], Weight: dataSet[i][6] };
            listDependency.push(data);
        }
        //if (listDependency.length >= 0) {
        dataserviceCardJob.insertJcObjectIdRelative({ CardCode: cardCode, ListDependency: listDependency, ListDeletedDependency: listDeletedDependency }, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
        //}
        $scope.cancel();
    };
    function refrestTable() {
        var datatable = $('#obj-data-table').DataTable({
            columns: [
                { title: '<i class="fa fa-info-circle mr5"></i>Loại đối tượng' },
                { title: '<i class="fa fa-info-circle mr5"></i>Tên phụ thuộc' },
                { title: '<i class="fa fa-code mr5"></i>Mã đối tượng' },
                { title: '<i class="fa fa-code mr5"></i>Tên đối tượng' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Mã quan hệ' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Quan hệ' },
                { title: '<i class="fa fa-thumbtack mr5"></i>Trọng số' },
                { title: '<i class="fa fa-location-arrow mr5"></i>Thao tác' }
            ],
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "searching": false,
            "lengthChange": false,
            "stripeClasses": [],
            "ordering": false,
            "bPaginate": false,
            "info": false,
            "aoColumnDefs": [{ "bVisible": false, "aTargets": [0, 2, 4] }]
        });
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        refrestTable();
    }, 100);

});
app.controller('add-group-or-teamCardJob', function ($scope, $rootScope, $cookies, $compile, $uibModal, $uibModalInstance, $filter, dataserviceCardJob, obj) {
    $scope.model = {};
    var id = -1;
    $scope.cardMember = {
        listTeamAssign: [],
        listDepartmentAssign: [],
        listMember: []
    };
    $scope.cardCode = obj.CardCode;
    $scope.listGroupUserAndDepartment = [];
    $scope.listDeleteObj = [];
    $scope.listDeleteMember = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceCardJob.getTeamAndGroupUserAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listTeamAssign = $filter('filter')(rs, { 'Type': '1' });
            $scope.cardMember.listDepartmentAssign = $filter('filter')(rs, { 'Type': '2' });
        });
        dataserviceCardJob.getMemberAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.cardMember.listMember = rs;
        });
        dataserviceCardJob.getListGroupUser("", function (groupUser) {
            groupUser = groupUser.data;
            dataserviceCardJob.getDepartment(function (department) {
                department = department.data;
                var all = {
                    Code: 'All',
                    Name: 'Tất cả người dùng',
                    Type: 3,
                    Group: 'Người dùng'
                }
                $scope.listGroupUserAndDepartment.push(all);
                var listGroupUserAndDepartment = [];
                if (obj.Type == 4) {
                    listGroupUserAndDepartment = groupUser.concat(department);
                } else {
                    var listGroupUserAndDepartment = obj.Type == 1 ? groupUser : department;
                }
                for (var i = 0; i < listGroupUserAndDepartment.length; i++) {
                    $scope.listGroupUserAndDepartment.push(listGroupUserAndDepartment[i]);
                }
            })
        });
        dataserviceCardJob.getActivityAssign(obj.CardCode, function (rs) {
            rs = rs.data;
            $scope.ActivityData = rs;
        });
        dataserviceCardJob.getListRoleAssign(function (rs) {
            rs = rs.data;
            $scope.RoleData = rs;
        });
    };
    $scope.initData();
    $scope.departmentOrGroupSelect = function (obj) {
        if (obj.Type == 1) {
            dataserviceCardJob.getMemberInGroupUser(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else if (obj.Type == 2) {
            dataserviceCardJob.getListUserInDepartment(obj.Code, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        } else {
            dataserviceCardJob.getListUser(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        $scope.isCheckAll = false;
    };
    $scope.departmentOrGroupSelectAll = function (isCheck, obj1) {
        dataserviceCardJob.userCreatedCard($scope.cardCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                if (isCheck) {
                    if (obj1.Type == 1 || obj1.Type == 2) {
                        if (obj1.Type == 1) {
                            var checkExist = $scope.cardMember.listTeamAssign.filter(function (objObject, index) { return objObject.Code == obj1.Code; });
                            if (checkExist.length != 0) {
                                App.toastrError(caption.CJ_MSG_GROUP_ASSIGNED_WORK);
                                return;
                            }
                        } else {
                            var checkExist = $scope.cardMember.listDepartmentAssign.filter(function (objObject, index) { return objObject.Code == obj1.Code; });
                            if (checkExist.length != 0) {
                                App.toastrError(caption.CJ_MSG_DEPARTMENT_ASSIGNED_WORK);
                                return;
                            }
                        }
                        var item = {
                            Id: id--,
                            Code: obj1.Code,
                            Name: obj1.Name,
                            Type: obj1.Type,
                            CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                        }
                        if (obj1.Type == 1) {
                            $scope.cardMember.listTeamAssign.push(item);
                        } else {
                            $scope.cardMember.listDepartmentAssign.push(item);
                        }
                        if (obj1.Type == 1) {
                            App.toastrSuccess(caption.CJ_MSG_ADD_GROUP_SUCCESS);
                        } else {
                            App.toastrSuccess(caption.CJ_MSG_ADD_DEPARTMENT_SUCCESS);
                        }
                    } else {
                        for (var i = 0; i < $scope.listUser.length; i++) {
                            //add member
                            var obj = {
                                Id: id--,
                                UserId: $scope.listUser[i].UserId,
                                GivenName: $scope.listUser[i].GivenName,
                                CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                            }
                            $scope.cardMember.listMember.push(obj);
                        }
                        App.toastrSuccess(caption.CJ_MSG_ADD_MEMBER_SUCCESS);
                    }
                } else {
                }
            } else {
                App.toastrError(caption.CJ_MSG_CANNOT_UPDATE_CMT)
            }
        })
    };
    $scope.memberSelect = function (item) {
        dataserviceCardJob.userCreatedCard(obj.CardCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                dataserviceCardJob.userCreatedCard(obj.CardCode, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1 == true) {
                        //check userIsLeader
                        dataserviceCardJob.checkLeader(item.UserId, function (rs2) {
                            rs2 = rs2.data;
                            if (rs.IsLeader == true) {
                                //for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
                                //    if ($scope.cardMember.listMember[i].UserId === item.UserId) {
                                //        App.toastrError(caption.CJ_MSG_MEMBER_EXIST);//Thành viên đã tồn tại!
                                //        return;
                                //    }
                                //}
                                var obj = {
                                    Id: id--,
                                    UserId: item.UserId,
                                    GivenName: item.GivenName,
                                    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                                    RoleUser: 0
                                }
                                $scope.cardMember.listMember.push(obj);
                            } else {
                                //for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
                                //    if ($scope.cardMember.listMember[i].UserId === item.UserId) {
                                //        App.toastrError(caption.CJ_MSG_MEMBER_EXIST);//Thành viên đã tồn tại!
                                //        return;
                                //    }
                                //}
                                var obj = {
                                    Id: id--,
                                    UserId: item.UserId,
                                    GivenName: item.GivenName,
                                    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                                    RoleUser: 0
                                }
                                $scope.cardMember.listMember.push(obj);

                                /* Add Leader */
                                //for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
                                //    if ($scope.cardMember.listMember[i].UserId === rs.User.Id) {
                                //        App.toastrError(caption.CJ_MSG_MEMBER_EXIST);
                                //        return;
                                //    }
                                //}
                                var obj1 = {
                                    Id: id--,
                                    UserId: rs2.User.Id,
                                    GivenName: rs.User.GivenName,
                                    CreatedTime: $filter('date')(new Date(), 'dd/MM/yyyy hh:mm:ss'),
                                    RoleUser: 1
                                }
                                $scope.cardMember.listMember.push(obj1);
                            }
                        });
                    } else {
                        App.toastrError(caption.CJ_MSG_YOU_NOT_CREATED_CARD)
                    }
                })
            } else {
                App.toastrError(caption.CJ_MSG_CANNOT_UPDATE_CMT)
            }
        })
    };
    $scope.roleSelect = function (user) {
        var index = 0;
        for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
            if (user.UserId == $scope.cardMember.listMember[i].UserId && user.Responsibility == $scope.cardMember.listMember[i].Responsibility) {
                index = index + 1;
            }
        }
        if (index != 1) {
            App.toastrError(caption.CJ_MSG_MEMBER_ROLE_EXIST);
            for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
                if (user.Id == $scope.cardMember.listMember[i].Id) {
                    $scope.cardMember.listMember[i].Responsibility = "";
                }
            }
        }
    }
    $scope.removeMember = function (userId, id) {
        dataserviceCardJob.userCreatedCard(obj.CardCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                for (var i = 0; i < $scope.cardMember.listMember.length; i++) {
                    if ($scope.cardMember.listMember[i].UserId == userId) {
                        $scope.cardMember.listMember.splice(i, 1);
                        if (id > 0) {
                            $scope.listDeleteMember.push(id);
                        }
                        break;
                    }
                }
            } else {
                App.toastrError(caption.CJ_MSG_CANNOT_DELETE)
            }
        })
    };
    $scope.removeObj = function (type, index, id) {
        dataserviceCardJob.userCreatedCard(obj.CardCode, function (rs) {
            rs = rs.data;
            if (rs == true) {
                if (type == 2) {
                    $scope.cardMember.listDepartmentAssign.splice(index, 1)
                } else {
                    $scope.cardMember.listTeamAssign.splice(index, 1)
                }
                if (id > 0) {
                    $scope.listDeleteObj.push(id);
                }
            } else {
                App.toastrError(caption.CJ_MSG_CANNOT_DELETE)
            }
        })
    }
    $scope.submit = function () {
        dataserviceCardJob.changeCardStatus(obj.CardCode, "START", function (rs) {
            rs = rs.data;
            if (rs.Error) {
            }
            else {
                $scope.initData();
            }
        });
        var data = { cardcode: obj.CardCode, listObj: $scope.cardMember.listTeamAssign.concat($scope.cardMember.listDepartmentAssign), listDeletedObj: $scope.listDeleteObj, listmember: $scope.cardMember.listMember, listDeleteMember: $scope.listDeleteMember };
        dataserviceCardJob.userCreatedCard(obj.CardCode, function (rs) {
            rs = rs.data;

            if (rs == true) {
                dataserviceCardJob.assignGroupOrTeam(data, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {

                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.cancel();
                    }
                });
            } else {
                App.toastrError(caption.CJ_MSG_CANNOT_DELETE)
            }
        })
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit-progressCardJob', function ($scope, $rootScope, $cookies, $compile, $uibModal, $uibModalInstance, $filter, dataserviceCardJob, para) {
    $scope.model = {
        Progress: 0,
    };
    $scope.init = function () {
        dataserviceCardJob.getCardProgress(para.CardCode, function (rs) {
            rs = rs.data;
            $scope.model.Progress = rs.Object.Progress;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.submit = function () {
        var obj = {
            CardCode: para.CardCode,
            Progress: $scope.model.Progress
        }
        if ($scope.addform.validate()) {
            dataserviceCardJob.updateProgress(obj, function (rs) {
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('add-checklistCardJob', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, cardCode) {
    $scope.model = {
        WeightNum: '',
        Title: ''
    };
    $scope.maxWeightNum = 0;
    $scope.validationOptions = {
        rules: {
            Title: {
                required: true,
                maxlength: 255,
            },
            WeightNum: {
                min: 0,
                //regx: /^[+]?\d+(\.\d+)?$/,
                max: 100,
            },
            DeadLine: {
                required: true,
            }
        },
        messages: {
            Title: {
                required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE),//'Nhập tiêu đề!',
                maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE).replace("{1}", "255")//'Cho phép tối đa 255 ký tự!'
            },
            WeightNum: {
                min: caption.CJ_VALIDATE_WEIGHT_NUM_GREATER_THAN_0,
                max: caption.CJ_VALIDATE_WEIGHT_NUM_SMALLER_THAN_100
            },
            DeadLine: {
                required: caption.CJ_VALIDATE_DEADLINE_REQUIRE,
            },
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceCardJob.getMaxWeightNumCheckList(cardCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.maxWeightNum = rs.Object;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.checklist.validate()) {
            var obj = {
                CardCode: cardCode,
                CheckTitle: $scope.model.Title,
                WeightNum: $scope.model.WeightNum
            }
            dataserviceCardJob.addCheckList(obj, function (rs) {
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
    function loadDate() {
        $("#CheckListStart").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckListDeadLine').datepicker('setStartDate', maxDate);
        });
        $("#CheckListDeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckListStart').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('labelCardJob', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, cardCode) {
    $scope.model = {

    };
    $scope.validationOptions = {
        rules: {

        },
        messages: {

        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {

    }
    $scope.initData();



    $scope.submit = function () {
        var label = '';
        var element = $('.label-checkbox:checked');
        angular.forEach(element, function (value, key) {
            label += value.value + ';';
        })
        label = label.substring(0, label.length - 1);
        console.log(label);
        if (label != '') {
            var obj = {
                CardCode: cardCode,
                Labels: label
            }
            dataserviceCardJob.updateCardLabel(obj, function (rs) {
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
        else {
            App.toastrError(caption.CJ_CURD_MSG_CHOOSE_LABEL);//Chọn nhãn!
        }
    }
});
app.controller('add-item-work', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, cardCode) {
    $scope.model = {
        Tags: [],
        CardCode: cardCode
    }
    $scope.listItemWorkCheck = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataserviceCardJob.getCardItemCheck(cardCode, function (rs) {
            rs = rs.data;
            $scope.listCardItemCheck = rs;
        })
        dataserviceCardJob.autoGenerateWorkSession(function (rs) {
            rs = rs.data;
            $scope.model.WorkSession = rs;
        })
        dataserviceCardJob.checkRoleInCard(cardCode, function (rs1) {
            rs1 = rs1.data;
            $scope.roleLeader = rs1;
            if (rs1 == true) {
                $scope.checkRole = false;
            } else {
                $scope.checkRole = true;
            }
        });
    }
    $scope.initData();
    $scope.model.Tags1 = $scope.model.Tags;
    $scope.submit = function () {
        
        if ($scope.model.Tags1.length != 0) {
            if ($scope.itemWork.validate()) {
                dataserviceCardJob.insertWorkItem($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                })
            }
        } else {
            App.toastrError(caption.CJ_MSG_ADD_TAGS);
        }
    }

    $scope.changeItemWork = function (item) {
        if (item != "") {
            if ($scope.model.Tags.length == 0) {
                $scope.model.Tags.push({
                    text: item.Text,
                    Code: item.Code
                });
            } else {
                var check = false
                for (var i = 0; i < $scope.model.Tags.length; i++) {
                    if ($scope.model.Tags[i].Code == item.Code) {
                        check = true;
                        break;
                    }
                };
                if (check == false) {
                    $scope.model.Tags.push({
                        text: item.Text,
                        Code: item.Code
                    });
                }
            }
            $scope.model.Tags1 = $scope.model.Tags;
        }
    }
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datetimepicker('setEndDate', maxDate);
        });
        $("#deadline").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);
});
app.controller('edit-item-work', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, idItemWork) {
    $scope.model = {
        Tags: [],
        WorkSession: ''
    }
    $scope.listItemWorkCheck = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataserviceCardJob.getItemWork(idItemWork.Id, function (rs) {
            rs = rs.data;
            if (rs.ListTags.length == 0) {
                $rootScope.isDisabled = false;
            } else {
                $rootScope.isDisabled = true;
            }
            for (var i = 0; i < rs.ListTags.length; i++) {
                $scope.model.Tags.push({
                    text: rs.ListTags[i].Text,
                    Code: rs.ListTags[i].Code
                });
            }
            $scope.model.WorkSession = rs.ItemStaff.WorkSession;
        })
        dataserviceCardJob.getCardItemCheck(idItemWork.CardCode, function (rs) {
            rs = rs.data;
            $scope.listCardItemCheck = rs;
        })
        dataserviceCardJob.checkRoleInCard(idItemWork.CardCode, function (rs1) {
            rs1 = rs1.data;
            $scope.roleLeader = rs1;
            if (rs1 == true) {
                $scope.checkRole = false;
            } else {
                $scope.checkRole = true;
            }
        });
    }
    $scope.initData();
    $scope.model.Tags1 = $scope.model.Tags;
    $scope.submit = function () {
        if ($scope.model.Tags1.length != 0) {
            if ($scope.itemWork.validate()) {
                dataserviceCardJob.updateItemWork($scope.model, function (rs) {
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
    }
    $scope.tagRemoved = function ($tag) {

        for (var i = 0; i < $scope.model.Tags.length; i++) {
            if ($scope.model.Tags[i].text == $tag.text) {
                $scope.model.Tags.splice($scope.model.Tags[i], 1);
            }
        }
        $scope.model.Tags1 = $scope.model.Tags;
    }
    $scope.changeItemWork = function (item) {
        if (item != "") {
            if ($scope.model.Tags.length == 0) {
                $scope.model.Tags.push({
                    text: item.Text,
                    Code: item.Code
                });
            } else {
                var check = false
                for (var i = 0; i < $scope.model.Tags.length; i++) {
                    if ($scope.model.Tags[i].Code == item.Code) {
                        check = true;
                        break;
                    }
                };
                if (check == false) {
                    $scope.model.Tags.push({
                        text: item.Text,
                        Code: item.Code
                    });
                }
            }
            $scope.model.Tags1 = $scope.model.Tags;
        }
    }
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datetimepicker('setEndDate', maxDate);
        });
        $("#deadline").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);
});
app.controller('assign-user-item-check', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, cardCodeAssign) {
    $scope.model = {
        CardCode: cardCodeAssign.CardCode,
        UserId: '',
        CheckListCode: cardCodeAssign.ChkListCode,
        CheckItem: ''
    }
    $scope.listItemWorkCheck = [];
    $scope.cancel = function () {
        $uibModalInstance.close(true);
    }

    $scope.initData = function () {
        dataserviceCardJob.getMemberInCardJob(cardCodeAssign.CardCode, function (rs) {
            rs = rs.data;
            $scope.listUsers = rs;
        });
        dataserviceCardJob.getJobCardUser($scope.model, function (rs) {
            rs = rs.data;
            $scope.listUserInItem = rs;
        })
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model)
        if (!validationSelect($scope.model).Status) {
            dataserviceCardJob.insertJobCardUser($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataserviceCardJob.getJobCardUser($scope.model, function (rs) {
                        rs = rs.data;
                        $scope.listUserInItem = rs;
                    })
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceCardJob.deleteJobCardUser(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.getJobCardUser($scope.model, function (rs) {
                    rs = rs.data;
                    $scope.listUserInItem = rs;
                })
            }
        })
    }
    $scope.changeSelect = function (selecType) {
        if (selecType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datetimepicker('setEndDate', maxDate);
        });
        $("#deadline").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);
});
app.controller('assign-user-sub-item-check', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceCardJob, item) {
    $scope.model = {
        CardCode: item.CardCode,
        UserId: '',
        CheckListCode: item.CheckListCode,
        CheckItem: item.CheckitemId
    }
    $scope.cancel = function () {
        $uibModalInstance.close(true);
    }
    $scope.initData = function () {

        dataserviceCardJob.getJobCardUser($scope.model, function (rs) {
            rs = rs.data;
            $scope.listUserItem = rs;
        });
        dataserviceCardJob.getJobCardSubItemUser($scope.model, function (rs) {
            rs = rs.data;
            $scope.listUserSubItem = rs;
        })
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model)
        if (!validationSelect($scope.model).Status) {
            dataserviceCardJob.insertUserToSubItem($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    dataserviceCardJob.getJobCardSubItemUser($scope.model, function (rs) {
                        rs = rs.data;
                        $scope.listUserSubItem = rs;
                    })
                }
            })
        }
    }
    $scope.delete = function (id) {
        dataserviceCardJob.deleteJobCardUser(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceCardJob.getJobCardSubItemUser($scope.model, function (rs) {
                    rs = rs.data;
                    $scope.listUserSubItem = rs;
                })
            }
        })
    }
    $scope.changeSelect = function (selecType) {
        if (selecType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.UserId == "") {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});
app.controller('add-card-link', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceCardJob, cardJob) {
    $scope.model = {
        CardLink: ''
    }
    $scope.cardJob = cardJob;
    $scope.listCardJob = [];
    $scope.listCardJobLink = [];
    $scope.initload = function () {

        dataserviceCardJob.getAllCardJob(function (rs) {
            rs = rs.data;

            $scope.listCardJob = rs;
        });
        var data = {
            cardCode: cardJob.cardCode,
        }
        dataserviceCardJob.getListLinkCardJob(data, function (rs) {
            rs = rs.data;

            $scope.listCardJobLink = rs;
        })
    }
    $scope.initload();
    $scope.cancel = function () {
        $uibModalInstance.close("cancel");
    };
    $scope.add = function () {
        validationSelect($scope.model);
        var data = { cardCode: cardJob.cardCode, cardLink: $scope.model.CardLink }
        if (!validationSelect($scope.model).Status) {
            dataserviceCardJob.insertLinkCardJob(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.initload();
                }
            });
        }
    }
    $scope.delete = function (id) {
        dataserviceCardJob.deleteCardLink(id, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initload();
            }
        });
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "CardLink" && $scope.model.CardLink != "") {
            $scope.errorCardLink = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.CardLink == "") {
            $scope.errorCardLink = true;
            mess.Status = true;
        } else {
            $scope.errorCardLink = false;
        }
        return mess;
    };

});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceCardJob, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"CJ_LIST_COL_STT" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CJ_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"CJ_LIST_COL_TYPE_DATA" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"CJ_COL_CREATE_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"CJ_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
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
        dataserviceCardJob.getDataTypeCommon(function (rs) {
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
            dataserviceCardJob.insertCommonSetting($scope.model, function (rs) {
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
            dataserviceCardJob.updateCommonSetting($scope.model, function (rs) {
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
                    dataserviceCardJob.deleteCommonSetting(id, function (rs) {
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