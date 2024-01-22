var ctxfolderLmsTaskManager = "/views/admin/lmsTaskManagement";
var ctxfolderSupplier = "/views/admin/supplier";
var ctxfolderProject = "/views/admin/project";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_LMS_TASK_MANAGER', ['App_ESEIM_PROJECT', 'App_ESEIM_PROJECT', 'App_ESEIM_CUSTOMER', 'App_ESEIM_CONTRACT', 'App_ESEIM_PRICE', 'App_ESEIM_CONTRACT_PO', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', 'App_ESEIM_REPOSITORY', "my.popover", "ui.sortable", "ngCookies", "ngSanitize", "ngJsTree", "treeGrid", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'ui.select', "pascalprecht.translate", 'dynamicNumber', 'scrollToEnd', 'ngTagsInput', 'ui.tab.scroll']);

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

app.factory('dataserviceTaskManager', function ($http) {
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
            App.toastrError(caption.LMS_FILE_NOT_FOUND);
        });
    };
    return {
        getListDepartment: function (data, callback) {
            $http.post('/Admin/Department/gettreedata/' + data).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/CardJob/GetDepartment/').then(callback);
        },
        getCardWithDepartment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithDepartment', data, {
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
        getListUserInDepartment: function (departmentCode, data, callback) {
            $http.get('/Admin/CardJob/GetListUserInDepartment/?departmentCode=' + departmentCode + '&branch=' + data).then(callback);
        },
        advanceSearch: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearch/', data).then(callback);
        },
        advanceSearchTeam: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchTeam/', data).then(callback);
        },
        advanceSearchGroupUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchGroupUser/', data).then(callback);
        },
        advanceSearchProject: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchProject/', data).then(callback);
        },
        advanceSearchCustomer: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchCustomer/', data).then(callback);
        },
        advanceSearchContract: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchContract/', data).then(callback);
        },

        getListPageProject: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListPageProject?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        },
        getCardWithProject: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithProject/', data).then(callback);
        },
        getListProject: function (callback) {
            $http.post('/Admin/ProjectProgress/GetListProject').then(callback);
        },

        //getListPageCustomer: function (page, length, name, callback) {
        //    $http.get('/Admin/LmsTaskManagement/GetListPageCustomer?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        //},
        getListPageCustomer: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListPageCustomer?page=1' + '&length=1000000' + '&name=' + name).then(callback);
        },
        getCardWithCustomer: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithCustomer/', data).then(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/CustomerProgress/GetListCustomer').then(callback);
        },

        //getListPageContract: function (page, length, name, callback) {
        //    $http.get('/Admin/LmsTaskManagement/GetListPageContract?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        //},
        getListPageContract: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListPageContract?page=1' + '&length=1000000' + '&name=' + name).then(callback);
        },

        getCardWithContract: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithContract/', data).then(callback);
        },
        getContractSale: function (callback) {
            $http.post('/Admin/Project/GetContractSale/').then(callback);
        },

        //getListPageSupplier: function (page, length, name, callback) {
        //    $http.get('/Admin/LmsTaskManagement/GetListPageSupplier?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        //},
        getListPageSupplier: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListPageSupplier?page=1' + '&length=1000000' + '&name=' + name).then(callback);
        },
        getCardWithSupplier: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithSupplier/', data).then(callback);
        },
        advanceSearchSupplier: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AdvanceSearchSupplier/', data).then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/SupplierProgress/GetListSupplier').then(callback);
        },

        getBoardsType: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetBoardsType/').then(callback);
        },
        getBoardsWithGroupBy: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetBoardsWithGroupBy/').then(callback);
        },
        getBoardsWithWorkFlow: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetBoardsWithWorkFlow?objCode=' + data).then(callback);
        },
        getListBoard: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListBoard/').then(callback);
        },
        checkExistBoardName: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckExistBoardName', data).then(callback);
        },
        insertBoard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertBoard/', data, {
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
        getBoardDetail: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetBoardDetail/?BoardCode=' + data + '&objCode=' + data1).then(callback);
        },
        deleteBoard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteBoard/' + data).then(callback)
        },
        updateBoard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/EditBoard/', data).then(callback);
        },

        getLists: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetLists?BoardCode=' + data).then(callback);
        },
        insertList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertList/', data).then(callback);
        },
        deleteList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteList/' + data).then(callback);
        },
        updateListName: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateListName/', data).then(callback);
        },
        updateOrder: function (Orther, Entry, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateOrder/?Orther=' + Orther + '&Entry=' + Entry).then(callback);
        },
        changeListStatus: function (listID, statusCode, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeListStatus/?ListID=' + listID + '&Status=' + statusCode).then(callback);
        },
        changeListBackground: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeListBackground', data).then(callback);
        },
        changeListWeightNum: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeListWeightNum', data).then(callback);
        },
        changeListBeginTime: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeListBeginTime', data).then(callback);
        },
        changeListDeadLine: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/changeListDeadLine', data).then(callback);
        },
        checkExistListNameInBoard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckExistListNameInBoard', data).then(callback);
        },

        //getListGroupUserPage: function (page, length, name, callback) {
        //    $http.get('/Admin/LmsTaskManagement/GetListGroupUserPage?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        //},
        getListGroupUserPage: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListGroupUserPage?page=1' + '&length=1000000' + '&name=' + name).then(callback);
        },

        getCardWithGroupUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithGroupUser/', data).then(callback);
        },
        getMemberInGroupUser: function (groupUserCode, data, callback) {
            $http.post('/Admin/CardJob/GetMemberInGroupUser/?groupUserCode=' + groupUserCode + '&branch=' + data).then(callback);
        },
        getListGroupUser: function (data, callback) {
            $http.post('/Admin/CardJob/GetListGroupUser?branch=' + data).then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },

        getListsAndCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListsAndCard', data, {
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
            $http.post('/Admin/LmsTaskManagement/GetCurrency').then(callback);
        },
        getUnit: function (callback) {
            $http.get('/Admin/LmsTaskManagement/GetUnit').then(callback);
        },
        getCardsByList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardsByList/?ListCode=' + data).then(callback);
        },
        getCardDetail: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetCardDetail?CardCode=' + data).then(callback);
        },
        insertCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertCard/', data).then(callback);
        },
        deleteCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteCard?lmsTaskCode=' + data).then(callback);
        },
        getBoardListSugges: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetBoardListSugges').then(callback);
        },
        getLevels: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetLevels/').then(callback);
        },
        getCardActivityByUser: function (CardCode, callback) {
            $http.get('/Admin/LmsTaskManagement/GetCardActivityByUser?CardCode=' + CardCode).then(callback);
        },
        changeWorkType: function (cardCode, type, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeWorkType/?CardCode=' + cardCode + '&Type=' + type).then(callback);
        },
        changeCardStatus: function (cardCode, status, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeCardStatus/?CardCode=' + cardCode + '&Status=' + status).then(callback);
        },
        changeCardLevel: function (cardCode, level, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeCardLevel/?CardCode=' + cardCode + '&Level=' + level).then(callback);
        },
        changeCheckTitle: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeCheckTitle', data).then(callback);
        },
        sortListByStatus: function (boardCode, orther, callback) {
            $http.post('/Admin/LmsTaskManagement/SortListByStatus/?BoardCode=' + boardCode + '&Orther=' + orther).then(callback);
        },
        getWorkType: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetWorkType/').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetStatus/').then(callback);
        },
        getCardProgress: function (cardCode, callback) {
            $http.get('/Admin/LmsTaskManagement/GetCardProgress?CardCode=' + cardCode).then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/LmsTaskManagement/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        updateCardName: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardName/', data).then(callback);
        },
        updateCardDescription: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardDescription', data).then(callback);
        },
        updateCardLabel: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardLabel', data).then(callback);
        },
        changeListCard: function (cardCode, listCode, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeListCard/?CardCode=' + cardCode + "&ListCode=" + listCode).then(callback);
        },
        updateWeightNum: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateWeightNum', data).then(callback);
        },
        updateCost: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCost', data).then(callback);
        },
        updateCurrency: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCurrency', data).then(callback);
        },
        updateActivity: function (cardCode, value, isCheck, callback) {
            $http.get('/Admin/LmsTaskManagement/UpdateActivity/?CardCode=' + cardCode + '&Value=' + value + '&IsCheck=' + isCheck).then(callback);
        },
        updateAddress: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateAddress/', data).then(callback);
        },
        updateProgress: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateProgress', data).then(callback);
        },
        updateBeginTime: function (cardCode, beginTime, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateBeginTime/?CardCode=' + cardCode + '&BeginTime=' + beginTime).then(callback);
        },
        updateEndTime: function (cardCode, endTime, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateEndTime/?CardCode=' + cardCode + '&EndTime=' + endTime).then(callback);
        },
        updateDeadLine: function (cardCode, deadLine, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateDeadLine/?CardCode=' + cardCode + '&DeadLine=' + deadLine).then(callback);
        },
        updateQuantitative: function (cardCode, quantitative, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateQuantitative/?CardCode=' + cardCode + '&Quantitative=' + quantitative).then(callback);
        },
        updateUnit: function (cardCode, unit, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateUnit/?CardCode=' + cardCode + '&Unit=' + unit).then(callback);
        },
        scopeCardProject: function (callback) {
            $http.post('/Admin/LmsTaskManagement/ScopeCardProject').then(callback);
        },

        //getListPageUser: function (page, length, name, callback) {
        //    $http.get('/Admin/LmsTaskManagement/GetListPageUser?page=' + page + '&length=' + length + '&name=' + name).then(callback);
        //},
        getListPageUser: function (page, length, name, callback) {
            $http.get('/Admin/LmsTaskManagement/GetListPageUser?page=1' + '&length=1000000' + '&name=' + name).then(callback);
        },
        getCardWithUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardWithUser/', data).then(callback);
        },

        assignGroupOrTeam: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AssignGroupOrTeam/', data).then(callback);
        },
        getActivityAssign: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetActivityAssign?cardCode=' + data).then(callback);
        },
        getMemberAssign: function (CardCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetMemberAssign/?CardCode=' + CardCode).then(callback);
        },
        getListRoleAssign: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListRoleAssign').then(callback);
        },
        checkLeader: function (data, data1, data2, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckLeader?userId=' + data + '&branch=' + data1 + '&department=' + data2).then(callback);
        },
        getLeaderInDepartment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetLeaderInDepartment?code=' + data).then(callback);
        },
        roleInCardOfUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/RoleInCardOfUser?cardCode=' + data).then(callback);
        },

        // checklist
        getListSubject: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListSubject').then(callback);
        },
        getListLecture: function (subjectCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListLecture/?subjectCode=' + subjectCode).then(callback);
        },
        getListQuiz: function (subjectCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListQuiz/?subjectCode=' + subjectCode).then(callback);
        },
        getListPractices: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListPractices').then(callback);
        },
        updateCheckList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCheckList', data).then(callback);
        },
        getLmsUserProgressGroupByItem: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetLmsUserProgressGroupByItem?LmsTaskCode=' + data).then(callback);
        },
        deleteLmsTaskItemProgressAllUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteLmsTaskItemProgressAllUser', data).then(callback);
        },

        addComment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AddComment', data).then(callback);
        },
        getComment: function (cardCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetComments/?CardCode=' + cardCode).then(callback);
        },
        deleteComment: function (cmtId, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteComment/?id=' + cmtId).then(callback);
        },
        updateComment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateComment', data).then(callback);
        },

        addAttachment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AddAttachment/', data).then(callback);
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/LmsTaskManagement/UploadFile/', data, callback);
        },
        getAttachment: function (cardCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetAttachment/?CardCode=' + cardCode).then(callback);
        },
        deleteAttachment: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteAttachment/', data).then(callback);
        },
        getFilePath: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetFilePath?filePath=' + data + "&cardCode=" + data1).then(callback);
        },
        getListUserFile: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserFile?Id=' + data).then(callback);
        },
        updateListPermissionViewFile: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateListPermissionViewFile?Id=' + data + '&ListPermissionViewFile=' + data1).then(callback);
        },
        checkFileItem: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckFileItem?itemCode=' + data).then(callback);
        },

        //Object
        getObjDependency: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjDependency').then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjTypeJC').then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUser').then(callback);
        },
        getObjCode: function (objDepen, callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjCode/?Dependency=' + objDepen).then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjFromObjType?code=' + data).then(callback);
        },
        insertJcObjectIdRelative: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertJcObjectIdRelative', data).then(callback);
        },
        insertCardDependency: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertCardDependency/', data).then(callback);
        },
        getObjectRelative: function (CardCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjectRelative/?CardCode=' + CardCode).then(callback);
        },
        deleteJcObjectIdRelative: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteJcObjectIdRelative/?ids=' + data).then(callback);
        },
        getItemChk: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemChk/?cardCode=' + data).then(callback);
        },

        deleteCardDependency: function (dependencyId, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteCardDependency/?Id=' + dependencyId).then(callback);
        },
        getRelative: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetRelative/').then(callback);
        },

        getProduct: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetProduct/').then(callback);
        },
        getCardProduct: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardProduct?CardCode=' + data).then(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertProduct/', data).then(callback);
        },
        deleteProduct: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/DeleteProduct?id=' + data).then(callback);
        },
        getActivityProduct: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetActivityProduct').then(callback);
        },

        getService: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetService/').then(callback);
        },
        getCardService: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardService?CardCode=' + data).then(callback);
        },
        insertService: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertService/', data).then(callback);
        },
        deleteService: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/DeleteService?id=' + data).then(callback);
        },
        getActivityService: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetActivityService').then(callback);
        },

        GetLisAddressJobCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetLisAddressJobCard?CardCode=' + data).then(callback);
        },
        deleteAddress: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteAddressJobCard?Id=' + data).then(callback);
        },
        InsertAddressJobCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertAddressJobCard/', data).then(callback);
        },

        //Notification
        sendNotification: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/SendNotification', data).then(callback);
        },
        updateListUserView: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateListUserView?cardCode=' + data).then(callback);
        },
        insertListUserView: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertListUserView?cardCode=' + data).then(callback);
        },
        //share
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
        },
        //Item work
        getCardItemCheck: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardItemCheck?cardCode=' + data).then(callback);
        },
        autoGenerateWorkSession: function (callback) {
            $http.post('/Admin/LmsTaskManagement/AutoGenerateWorkSession').then(callback);
        },
        insertWorkItem: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertWorkItem', data).then(callback);
        },
        deleteWorkItemActivity: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteWorkItemActivity?id=' + data).then(callback);
        },
        getListWorkItem: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListWorkItem?CardCode=' + data).then(callback);
        },
        getItemWork: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemWork?id=' + data).then(callback);
        },
        updateItemWork: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateItemWork', data).then(callback);
        },
        getItemApprove: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemApprove?itemCode=' + data).then(callback);
        },
        approve: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/Approve', data).then(callback);
        },
        approveAll: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ApproveAll?itemCode=' + data).then(callback);
        },
        deleteItemWork: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteItemWork?id=' + data).then(callback);
        },


        getMemberInCardJob: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetMemberInCardJob?cardCode=' + data).then(callback);
        },
        insertJobCardUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertJobCardUser', data).then(callback);
        },
        getJobCardUser: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/GetJobCardUser/", data).then(callback);
        },
        deleteJobCardUser: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/DeleteJobCardUser?id=" + data).then(callback);
        },
        insertUserToSubItem: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/InsertUserToSubItem", data).then(callback);
        },
        getJobCardSubItemUser: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/GetJobCardSubItemUser", data).then(callback);
        },
        checkRoleInCard: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/CheckRoleInCard?cardCode=" + data).then(callback);
        },
        checkCardSuccess: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/CheckCardSuccess?cardCode=" + data).then(callback);
        },
        getSuggesstion: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/GetSuggesstion/", data).then(callback);
        },
        checkListAll: function (callback) {
            $http.post("/Admin/LmsTaskManagement/CheckListAll").then(callback);
        },
        getLastestProject: function (callback) {
            $http.get("/Admin/LmsTaskManagement/GetLastestProject").then(callback);
        },
        getInherit: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/GetInherit?cardCode=" + data).then(callback);
        },
        updateInherit: function (data, data1, callback) {
            $http.post("/Admin/LmsTaskManagement/UpdateInherit?cardCode=" + data + "&inherit=" + data1).then(callback);
        },
        copyCard: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/CopyCard?cardCode=" + data).then(callback);
        },
        getAllShiftOfUser: function (userName, callback) {
            $http.post("/Admin/StaffTimeKeeping/GetAllShiftOfUser?userName=" + userName).then(callback);
        },
        getLastShiftLog: function (callback) {
            $http.post("/Admin/StaffTimeKeeping/GetLastShiftLog").then(callback);
        },
        checkIn: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/CheckIn", data).then(callback);
        },
        checkOut: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/CheckOut", data).then(callback);
        },
        getLastInOut: function (callback) {
            $http.post("/Admin/StaffTimeKeeping/GetLastInOut").then(callback);
        },

        uploadImageInOut: function (data, callback) {
            submitFormUpload('/Admin/StaffTimeKeeping/UploadImage/', data, callback);
        },
        checkInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/CheckInOutManual", data).then(callback);
        },
        getCheckInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/GetCheckInOutManual?shiftCode=" + data).then(callback);
        },
        updateCheckInOutManual: function (data, callback) {
            $http.post("/Admin/StaffTimeKeeping/UpdateCheckInOutManual", data).then(callback);
        },
        getUnitAssignStaff: function (callback) {
            $http.post("/Admin/LmsTaskManagement/GetUnitAssignStaff").then(callback);
        },
        updateWorkItem: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/UpdateWorkItem", data).then(callback);
        },
        updateAutoShiftCodeWorkItem: function (data, data1, callback) {
            $http.post("/Admin/LmsTaskManagement/UpdateAutoShiftCodeWorkItem?shiftCodeNew=" + data + "&shiftCode=" + data1).then(callback);
        },
        //
        getAllCardJob: function (callback) {
            $http.post("/Admin/LmsTaskManagement/GetAllCardJob").then(callback);
        },
        getListLinkCardJob: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/GetListLinkCardJob/", data).then(callback);
        },
        deleteCardLink: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/DeleteCardLink?Id=" + data).then(callback);
        },
        insertLinkCardJob: function (data, callback) {
            $http.post("/Admin/LmsTaskManagement/InsertLinkCardJob/", data).then(callback);
        },
        userCreatedCard: function (data, callback) {
            $http.get("/Admin/LmsTaskManagement/UserCreatedCard?cardCode=" + data).then(callback);
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
            $http.post('/Admin/LmsTaskManagement/CheckWeightNumber/', data).then(callback);
        },
        searchProgress: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/SearchProgress?boardCode=' + data).then(callback);
        },
        getCardRelative: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardRelative?cardCode=' + data).then(callback);
        },

        //add service
        getServiceCategoryParent: function (callback) {
            $http.post('/Admin/ServiceCategory/GetServiceCategoryParent').then(callback);
        },
        getServiceUnit: function (callback) {
            $http.post('/Admin/ServiceCategory/GetServiceUnit').then(callback);
        },
        getServiceCategoryGroup: function (callback) {
            $http.post('/Admin/ServiceCategory/GetServiceCategoryGroup').then(callback);
        },
        getServiceCategoryType: function (callback) {
            $http.post('/Admin/ServiceCategory/GetServiceCategoryType').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/ServiceCategory/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ServiceCategory/Update', data).then(callback);
        },
        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/ServiceCategory/InsertAttributeMore', data).then(callback);
        },
        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/ServiceCategory/UpdateAttributeMore', data).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/ServiceCategory/DeleteAttributeMore/' + data).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/ServiceCategory/GetDetailAttributeMore?Id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/ServiceCategory/GetItem/' + data).then(callback);
        },

        //add Order RQ
        getAutocomplete: function (data, callback) {
            $http.get('/Admin/GalaxyKeyword/GetAutocomplete?key=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/OrderRequestRaw/UploadFile/', data, callback);
        },
        insertOrderRQ: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/Insert/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        getItemOrderRQ: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/GetItem/', data, {
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
        updateOrderRQ: function (data, callback) {
            $http.post('/Admin/OrderRequestRaw/Update/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        },
        //add Material product
        gettreedataLevel: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },
        getProductImpType: function (callback) {
            $http.post('/Admin/materialProduct/GetProductImpType/').then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/materialProduct/GetProductGroup/').then(callback);
        },
        getInheritances: function (data, callback) {
            $http.post('/Admin/materialProduct/GetInheritances?productCode=' + data).then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductTypes/').then(callback);
        },
        getInheritancesDetail: function (data, callback) {
            $http.post('/Admin/materialProduct/GetInheritancesDetail?productCode=' + data).then(callback);
        },
        uploadImageMaterial: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
        },
        insertMaterial: function (data, callback) {
            $http.post('/Admin/materialProduct/Insert', data, callback).then(callback);
        },
        updateMaterial: function (data, callback) {
            $http.post('/Admin/materialProduct/Update', data).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/materialProduct/GetProductStatus/').then(callback);
        },
        getQrCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetQrCodeFromString?content=' + data).then(callback);
        },
        getBarCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetBarCodeFromString?content=' + data).then(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/materialProduct/DeleteAttribute?Id=' + id).then(callback);
        },
        uploadCatalogue: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadCatalogue', data, callback);
        },
        insertProductAttribute: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertProductAttribute', data).then(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/materialProduct/GetAttributeItem?id=' + id).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateAttribute', data).then(callback);
        },
        insertProductFile: function (data, callback) {
            submitFormUpload('/Admin/MaterialProduct/InsertProductFile/', data, callback);
        },
        getProductFile: function (data, callback) {
            $http.post('/Admin/MaterialProduct/GetProductFile/' + data).then(callback);
        },
        deleteProductFile: function (data, callback) {
            $http.post('/Admin/MaterialProduct/DeleteProductFile/' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        updateProductFile: function (data, callback) {
            submitFormUpload('/Admin/MaterialProduct/UpdateProductFile/', data, callback);
        },
        gettreedataCoursetype: function (callback) {
            $http.post('/Admin/MaterialProductGroup/gettreedataCoursetype/').then(callback);
        },
        insertProductGroup: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Insert', data, callback).then(callback);
        },
        getItemMaterial: function (data, callback) {
            $http.post('/Admin/materialProduct/GetItem?Id=' + data).then(callback);
        },

        //Add supplier
        getSupplierArea: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierArea').then(callback);
        },
        getSupplierType: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierType').then(callback);
        },
        getSupplierRole: function (callback) {
            $http.post('/Admin/Supplier/getListSupplierRole').then(callback);
        },
        getAddress: function (lat, lon, callback) {
            $http.get('/Admin/LmsTaskManagement/GetAddress?lat=' + lat + '&lon=' + lon).then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetCurrency').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/Supplier/UploadImage/', data, callback);
        },
        getSupplierGroup: function (callback) {
            $http.post('/Admin/Supplier/GetSupplierGroup/').then(callback);
        },
        getSupplierStatus: function (callback) {
            $http.post('/Admin/Supplier/GetSupplierStatus/').then(callback);
        },
        insertSupplier: function (data, callback) {
            $http.post('/Admin/Supplier/Insert/', data).then(callback);
        },
        updateSupplier: function (data, callback) {
            $http.post('/Admin/Supplier/Update/', data).then(callback);
        },
        deleteSupplier: function (data, callback) {
            $http.post('/Admin/Supplier/Delete/' + data).then(callback);
        },
        getItemSupplier: function (data, callback) {
            $http.get('/Admin/Supplier/GetItem/' + data).then(callback);
        },
        getItemAdd: function (data, callback) {
            $http.get('/Admin/Supplier/GetItemAdd?code=' + data).then(callback);
        },
        getListSupplierArea: function (callback) {
            $http.get('/Admin/Supplier/GetListSupplierArea').then(callback);
        },
        getInfoWithTaxCode: function (data, callback) {
            $http.get('/Admin/Customer/GetInfoWithTaxCode?taxCode=' + data).then(callback);
        },
        getSupplierFile: function (data, callback) {
            $http.post('/Admin/Supplier/GetSupplierFile/' + data).then(callback);
        },
        insertSupplierFile: function (data, callback) {
            submitFormUpload('/Admin/Supplier/InsertSupplierFile/', data, callback);
        },
        updateSupplierFile: function (data, callback) {
            submitFormUpload('/Admin/Supplier/UpdateSupplierFile/', data, callback);
        },
        deleteSupplierFile: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteSupplierFile/' + data).then(callback);
        },
        getSuggestionsSupplierFile: function (data, callback) {
            $http.get('/Admin/Supplier/GetSuggestionsSupplierFile?supplierCode=' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },
        insertContact: function (data, callback) {
            $http.post('/Admin/Supplier/InsertContact/', data).then(callback);
        },
        deleteContact: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteContact/' + data).then(callback);
        },
        updateContact: function (data, callback) {
            $http.post('/Admin/Supplier/UpdateContact/', data).then(callback);
        },
        getContact: function (data, callback) {
            $http.get('/Admin/Supplier/GetContact/' + data).then(callback);
        },
        insertExtend: function (data, callback) {
            $http.post('/Admin/Supplier/InsertExtend/', data).then(callback);
        },
        deleteExtendSupplier: function (data, callback) {
            $http.post('/Admin/Supplier/DeleteExtend/' + data).then(callback);
        },
        updateExtend: function (data, callback) {
            $http.post('/Admin/Supplier/UpdateExtend/', data).then(callback);
        },
        getExtend: function (data, callback) {
            $http.get('/Admin/Supplier/GetExtend/' + data).then(callback);
        },
        getDataType: function (callback) {
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
        updateSupplier: function (data, callback) {
            $http.post('/Admin/Supplier/Update/', data).then(callback);
        },

        //Buffer card
        updateCardByBufferData: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardByBufferData', data).then(callback);
        },
        rollbackDataBuffer: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/RollbackDataBuffer', data).then(callback);
        },
        logActivityUser: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/LogActivityUser?cardCode=' + data).then(callback);
        },
        delCardNoTitle: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DelCardNoTitle?cardCode=' + data).then(callback);
        },

        //Add constraint
        getItemConstraint: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemConstraint?itemCode=' + data + "&cardCode=" + data1).then(callback);
        },
        addConstraint: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/AddConstraint?itemCode=' + data + "&constraint=" + data1).then(callback);
        },
        getAllConstraint: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetAllConstraint?itemCode=' + data).then(callback);
        },
        deleteConstraint: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteConstraint?itemCode=' + data + "&constraint=" + data1).then(callback);
        },
        checkConstraintSuccess: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckConstraintSuccess?itemCode=' + data).then(callback);
        },
        getListItemActivity: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListItemActivity?itemCode=' + data).then(callback);
        },
        checkItemSuccess: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckItemSuccess?itemCode=' + data).then(callback);
        },

        //Count card
        getCountCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCountCard/', data).then(callback);
        },

        //Hide cost, currency
        hideCost: function (callback) {
            $http.get('/Admin/LmsTaskManagement/HideCost/').then(callback);
        },

        //View detail employy
        detailOfEmploy: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DetailOfEmploy?user=' + data).then(callback);
        },

        //Workflow
        getWorkFlow: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetWorkflow').then(callback);
        },
        createFlow: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/CreateFlow?wfCode=' + data + '&cardCode=' + data1).then(callback);
        },
        createInstanceWF: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/CreateInstanceWF?wfCode=' + data + '&cardCode=' + data1).then(callback);
        },
        checkWfInstCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckWfInstCard?cardCode=' + data).then(callback);
        },
        getActInst: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetActInst?wfInstCode=' + data).then(callback);
        },
        insertDataLogger: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertDataLogger', data).then(callback);
        },
        deleteDataLogger: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteDataLogger?sessionId=' + data).then(callback);
        },
        getUnitAttr: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetUnitAttr').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetAttrDataType').then(callback);
        },
        getAttrGroup: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetAttrGroup?cardCode=' + data).then(callback);
        },
        getAttrByGroup: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetAttrByGroup?attrGroup=' + data).then(callback);
        },
        getDataLoggerCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetDataLoggerCard?cardCode=' + data).then(callback);
        },
        getActInstFromWf: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetActInstFromWf?wfCode=' + data + '&cardCode=' + data1).then(callback);
        },
        getCheckListInCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCheckListInCard?cardCode=' + data).then(callback);
        },
        changeActIns: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/ChangeActIns?actInsCode=' + data + '&cardCode=' + data1).then(callback);
        },
        changeObjEntry: function (data, data1, data2, callback) {
            $http.post('/Admin/LmsTaskManagement/changeObjEntry?actInsCode=' + data + '&cardCode=' + data1 + '&isEntry=' + data2).then(callback);
        },
        insertInstRunning: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/InsertInstRunning?wfInstCode=' + data + '&wfCode=' + data1).then(callback);
        },

        //File edms
        getTreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeRepository').then(callback);
        },
        getItemRepository: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetItemRepository?reposCode=' + data, {
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
        insertRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/InsertRepository', data).then(callback);
        },
        updateRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/UpdateRepository', data).then(callback);
        },
        deleteRepository: function (data, callback) {
            $http.post('/Admin/EDMSRepository/DeleteRepository?respos=' + data).then(callback);
        },

        getFileEDMS: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/LmsTaskManagement/GetFileEDMS?url=' + data + '&size=' + data1 + '&timeModify=' + data2 + '&cardCode=' + data3).then(callback);
        },
        getItemFile: function (data1, data2, data3, callback) {
            $http.get('/Admin/LmsTaskManagement/GetItemFile?IsEdit=' + data1 + '&mode=' + data2 + '&idAttachment=' + data3).then(callback);
        },
        //InsertCardAuto
        insertCardAuto: function (callback) {
            $http.post('/Admin/LmsTaskManagement/InsertCardAuto').then(callback);
        },
        //Role assign
        updateUserList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateUserList', data).then(callback);
        },
        insertLmsTaskUserItemProgress: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertLmsTaskUserItemProgress', data).then(callback);
        },
        deleteLmsTaskUserProgressAllItem: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteLmsTaskUserProgressAllItem', data).then(callback);
        },
        getLmsItemProgressGroupByUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetLmsItemProgressGroupByUser?LmsTaskCode=' + data).then(callback);
        },
        updateUserList: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateUserList', data).then(callback);
        },
        checkShowLabelAssign: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/CheckShowLabelAssign?cardCode=' + data).then(callback);
        },
        getDepartmentInBranch: function (data, callback) {
            $http.post('/Admin/CardJob/GetDepartmentInBranch?branch=' + data).then(callback);
        },
        getListUserOfBranch: function (data, callback) {
            $http.post('/Admin/CardJob/GetListUserOfBranch?branch=' + data).then(callback);
        },
        getListClass: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListClass').then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserOfClass?classCode=' + data).then(callback);
        },
        getGroupDepartmentAssign: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetGroupDepartmentAssign?cardCode=' + data).then(callback);
        },
        assignStatus: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/AssignStatus?id=' + data + '&value=' + data1).then(callback);
        },
        getStatusAssign: function (callback) {
            $http.get('/Admin/LmsTaskManagement/GetStatusAssign').then(callback);
        },
        roleChangeStatusAssign: function (callback) {
            $http.get('/Admin/LmsTaskManagement/RoleChangeStatusAssign').then(callback);
        },
        getMemberSendNotification: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetMemberSendNotification?cardCode=' + data).then(callback);
        },

        //Share file
        getObjFileShare: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetObjFileShare').then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertFileShare', data).then(callback);
        },
        viewFileOnline: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ViewFileOnline', data).then(callback);
        },
        isFileEdms: function (data1, data2, callback) {
            $http.get('/Admin/LmsTaskManagement/IsFileEdms?fileCode=' + data1 + '&url=' + data2).then(callback);
        },

        //Permission modify header card
        permissionHeaderCard: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/PermissionHeaderCard?cardCode=' + data).then(callback)
        },

        // Log status card
        getLogStatusCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetLogStatusCard?cardCode=' + data).then(callback)
        },
        deleteNewCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteNewCard?cardCode=' + data).then(callback)
        },

        //Lock card
        lockCard: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/LockCard?cardCode=' + data + '&value=' + data1).then(callback)
        },

        //View log WF
        viewLogWF: function (data, data1, callback) {
            $http.get('/Admin/LmsTaskManagement/ViewLogWF?cardCode=' + data + '&wf=' + data1).then(callback)
        },

        //Percent object
        getPercentObject: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetPercentObject?objCode=' + data + '&objType=' + data1).then(callback)
        },

        //Update count notify
        getCountNotify: function (callback) {
            $http.post('/Admin/NotifiManager/GetCountNotify/').then(callback);
        },

        //File card to edms
        insertCardJobFile: function (data, callback) {
            submitFormUpload('/Admin/LmsTaskManagement/InsertCardJobFile', data, callback);
        },
        getSuggestionsCardFile: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetSuggestionsCardCodeFile?cardCode=' + data).then(callback);
        },
        getCardFile: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetCardFile?id=' + data).then(callback);
        },
        deleteCardFile: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteCardFile?id=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        updateCardFile: function (data, callback) {
            submitFormUpload('/Admin/LmsTaskManagement/UpdateCardFile', data, callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        getListUserShare: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserShare?cardCode=' + data).then(callback);
        },
        getFileShare: function (data, callback) {
            $http.post('/Admin/EDMSRepository/GetFileShare?id=' + data).then(callback);
        },
        insertFileShareCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertFileShareCard', data).then(callback);
        },

        //File item request
        insertCardJobFileRequest: function (data, callback) {
            submitFormUpload('/Admin/LmsTaskManagement/insertCardJobFileRequest', data, callback);
        },
        getSuggestionsCardFileRequest: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetSuggestionsCardCodeFileItem?cardCode=' + data).then(callback);
        },
        getCardFileRequest: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/getCardFileRequest?id=' + data).then(callback);
        },

        //File item result
        insertCardJobFileResult: function (data, callback) {
            submitFormUpload('/Admin/LmsTaskManagement/insertCardJobFileResult', data, callback);
        },
        getSuggestionsCardFileResult: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetSuggestionsCardCodeFileResult?cardCode=' + data).then(callback);
        },
        getCardFileResult: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/getCardFileResult?id=' + data).then(callback);
        },

        //Lock share
        getInfoLockShare: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetInfoLockShare?cardCode=' + data).then(callback);
        },
        removeLockShare: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/RemoveLockShare?cardCode=' + data).then(callback);
        },
        updateLockShareCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateLockShareCard?cardCode=' + data).then(callback);
        },
        checkSessionCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/CheckSessionCard?cardCode=' + data).then(callback);
        },

        //Add new Card
        insertCardNew: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertCardNew', data).then(callback);
        },
        getListDefault: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListDefault?boardCode=' + data).then(callback);
        },
        insertJcRela: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertJcRela', data).then(callback);
        },
        updateCardNew: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardNew', data).then(callback);
        },

        //Share file new Design
        getUserShareFilePermission: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetUserShareFilePermission?id=' + data).then(callback);
        },
        deleteShareFile: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteShareFile?id=' + data + '&userName=' + data1).then(callback);
        },
        autoShareFilePermission: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AutoShareFilePermission', data).then(callback);
        },

        //Reject card
        rejectCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/RejectCard', data).then(callback);
        },
        getReasonRejectUser: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetReasonRejectUser?cardCode=' + data).then(callback);
        },

        //Update card realtime
        updateCardNameReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardNameReal?cardCode=' + data + '&cardName=' + data1).then(callback);
        },
        updateCardBegintimeReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardBegintimeReal?cardCode=' + data + '&beginTime=' + data1).then(callback);
        },
        updateCardDeadlineReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardDeadlineReal?cardCode=' + data + '&deadline=' + data1).then(callback);
        },
        updateCardEndtimeReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardEndtimeReal?cardCode=' + data + '&endtime=' + data1).then(callback);
        },
        updateCardStatusReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardStatusReal?cardCode=' + data + '&status=' + data1).then(callback);
        },
        updateCardLevelReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardLevelReal?cardCode=' + data + '&cardLevel=' + data1).then(callback);
        },
        updateCardWorkTypeReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardWorkTypeReal?cardCode=' + data + '&worktype=' + data1).then(callback);
        },
        updateWeightNumReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateWeightNumReal?cardCode=' + data + '&weight=' + data1).then(callback);
        },
        updateDescriptionReal: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateDescriptionReal', data).then(callback);
        },
        updateListReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateListReal?cardCode=' + data + '&listCode=' + data1).then(callback);
        },
        isUpdateNewData: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/IsUpdateNewData?cardCode=' + data + '&timeUpdate=' + data1).then(callback);
        },
        updateCardInheritReal: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/UpdateCardInheritReal?cardCode=' + data + '&inherit=' + data1).then(callback);
        },
        autoUpdateLockShareJson: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/AutoUpdateLockShareJson?cardCode=' + data).then(callback);
        },

        //Rollback card
        rollbackInfoCard: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/RollbackCard', data).then(callback);
        },

        //Upgrade report item
        getItemCheckRpt: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetItemCheckRpt?cardCode=' + data).then(callback);
        },
        inserReportSession: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InserReportSession', data).then(callback);
        },
        getReportSession: function (data, callback) {
            $http.get('/Admin/LmsTaskManagement/GetReportSession?cardCode=' + data).then(callback);
        },
        delReportSession: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/DelReportSession?id=' + data + '&createdBy=' + data1).then(callback);
        },
        getItemReportResult: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemReportResult?id=' + data).then(callback);
        },
        getItemSessionWork: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetItemSessionWork?session=' + data + '&cardCode=' + data1).then(callback);
        },
        approveSessionWork: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/ApproveSessionWork', data).then(callback);
        },
        setupDefaultRepoObject: function (data, data1, data2, callback) {
            $http.post('/Admin/LmsTaskManagement/SetupDefaultRepoObject?objectCode=' + data + '&objectType=' + data1 + '&cateRepoSettingId=' + data2).then(callback);
        },

        //New Coaching
        getListCoachingType: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListCoachingType').then(callback);
        },
        getListCoachingId: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListCoachingId?coachingType=' + data + '&coachingTypeId=' + data1).then(callback);
        },
        getListCoachingDetail: function (data, data1, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListCoachingDetail?cardCode=' + data + '&itemCode=' + data1).then(callback);
        },
        insertCoaching: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/InsertCoaching', data).then(callback);
        },
        deleteCoaching: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/DeleteCoaching?id=' + data).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM_LMS_TASK_MANAGER', function ($scope, $rootScope, $compile, $uibModal, dataserviceTaskManager, $cookies, $filter, $translate, $window) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;

        $rootScope.validationOptionsAssignStaffToItem = {
            rules: {
                EstimateTime: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                },
            },
            messages: {
                EstimateTime: {
                    required: caption.CJ_VALIDATE_TIME_OUT_NO_BLANK,
                    regx: caption.CJ_REGEX_NUMBER_NEGATIVE,
                }
            }
        }

        $rootScope.validationOptionsCheckList = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                WeightNumCheckList: {
                    required: true,
                    min: 0,
                    max: 100,
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE),//'Nhập tiêu đề!',
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CJ_CURD_TAB_ADD_CHECK_LIST_CURD_TXT_TITLE).replace("{1}", "255"),
                    regx: caption.LMS_MSG_START_ITEM_NOT_SPACE
                },
                WeightNumCheckList: {
                    required: caption.CJ_VALIDATE_ENTER_WEIGHTNUM,
                    min: caption.CJ_VALIDATE_WEIGHT_NUM_GREATER_THAN_0,
                    max: caption.CJ_VALIDATE_WEIGHT_NUM_SMALLER_THAN_100
                }
            }
        }

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

        $rootScope.validationOptionsShiftLog = {
            rules: {
                ChkinTime: {
                    required: true,
                },
                ChkoutTime: {
                    required: true,
                },
                ChkinLocationTxt: {
                    required: true,
                },
                ChkoutLocationTxt: {
                    required: true,
                }
            },
            messages: {
                ChkinTime: {
                    required: caption.LMS_CHECKIN_TIME_NOT_EMPTY
                },
                ChkoutTime: {
                    required: caption.LMS_CHECKOUT_TIME_NOT_EMPTY
                },
                ChkinLocationTxt: {
                    required: caption.LMS_CHECKIN_LOCATION_NOT_EMPTY
                },
                ChkoutLocationTxt: {
                    required: caption.LMS_CHECKOUT_LOCATION_NOT_EMPTY
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

        $rootScope.validationOptionsBoard = {
            rules: {
                BoardName: {
                    required: true,
                },
            },
            messages: {
                BoardName: {
                    required: caption.CJ_VALIDATE_BOARD_NAME,
                }
            }
        }

        $rootScope.isTranslate = true;

        $rootScope.validationOptionsService = {
            rules: {
                ServiceCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                ServiceName: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ServiceCode: {
                    required: caption.SVC_MSG_NOT_CODE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SVC_CURD_LBL_SERVICE_CODE),
                    maxlength: caption.SVC_MSG_NOT_CODE_CHARACTER_255
                },
                ServiceName: {
                    required: caption.SVC_MSG_NOT_NAME,
                    maxlength: caption.SVC_MSG_NOT_NAME_CHARACTER
                },
            }
        }

        $rootScope.validationAttributeOptionsService = {
            rules: {
                AttributeCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/
                },
                AttributeName: {
                    required: true,
                },
                Note: {
                    maxlength: 300
                },
                FieldType: {
                    required: true,
                },
                AttributeValue: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.SVC_MSG_CODE_NOT_BLANK,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SVC_CURD_TAB_ATTRIBUTE_LBL_CODE),
                },
                AttributeName: {
                    required: caption.SVC_MSG_NAME_NOT_BLANK,
                },
                Note: {
                    maxlength: caption.SVC_MSG_NOT_ACTION_CHARACTER
                },
                FieldType: {
                    required: caption.SVC_MSG_VALUE_TYPE_NOT_BLANK,
                },
                AttributeValue: {
                    required: caption.SVC_MSG_TYPE_NOT_BLANK
                }
            }
        }

        $rootScope.validationOptionsOrderRQ = {
            rules: {
                Title: {
                    required: true,
                },
                Content: {
                    required: true,
                },
                Phone: {
                    regx: /^(^0)+([0-9]){9,10}\b$/
                }

            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_TITLE),
                },
                Content: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORR_CURD_LBL_ORR_CONTENT),
                },
                Phone: {
                    regx: caption.ORR_VALIDATE_PHONE_NUMBER
                }
            }
        }

        $scope.validationOptionsmore = {
            rules: {
                AttributeCode: {
                    required: true,
                    maxlength: 255,
                },
                AttributeName: {
                    required: true,
                    maxlength: 255,
                },
                Page: {
                    required: true,
                    maxlength: 255,
                },
                Category: {
                    required: true,
                    maxlength: 255,
                },
                Width: {
                    required: true,
                    maxlength: 255,
                },
                Length: {
                    required: true,
                    maxlength: 255,
                },
                Weight: {
                    required: true,
                    maxlength: 255,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_CODE_CHARACTER_PRODUCT
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_NAME_CHARACTER_PRODUCT
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,

                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,

                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,

                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,

                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,

                },

            }
        }

        $rootScope.validationOptionsMaterial = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                },
                PricePerM: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Wide: {
                    regx: /^([0-9])+\b$/
                },
                High: {
                    regx: /^([0-9])+\b$/
                }
            },
            messages: {
                ProductCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT_CHARACTER
                },
                ProductName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT_CHARACTER
                },
                Unit: {
                    required: caption.MLP_VALIDATE_UNIT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_UNIT_IMPORT_CHARACTER1
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM_IMPORT,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2_IMPORT,
                },
                Wide: {
                    regx: caption.MLP_VALIDATE_WIDTH,
                },
                High: {
                    regx: caption.MLP_VALIDATE_HEIGHT,
                }
            }
        }

        $rootScope.validationAttributeOptions = {
            rules: {
                AttributeCode: {
                    required: true,
                    maxlength: 255
                },
                AttributeName: {
                    required: true,
                    maxlength: 255
                },
                AttributeValue: {
                    required: true
                },


            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT_CHARACTER
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                    maxlength: caption.MLP_VALIDATE_NAME_PROPẺTIES_IMPORT_CHARACTER
                },
                AttributeValue: {
                    required: caption.MLP_VALIDATE_VALUE_IMPORT,
                },

            }
        }

        $rootScope.validationOptionAddC1more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Value: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                },
                Value: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },

            }
        }

        $rootScope.validationOptionCarpetMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTH_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },

            }
        }

        $rootScope.validationOptionSimpleOrder = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
            }
        }

        $rootScope.validationOptionAddC2more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
                Weight: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,
                },
            }
        }

        $rootScope.validationOptionFloorMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Width: {
                    required: true,
                }

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },

            }
        }

        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_TAB_FILE_LIST_COL_NAME),
                },

            }
        }

        $rootScope.validationOptionsCardLogger = {
            rules: {
                DtCode: {
                    required: true,
                },
                DtTitle: {
                    required: true,
                }
            },
            messages: {
                DtCode: {
                    required: caption.CJ_VALIDATE_ATTR_CODE
                },
                DtTitle: {
                    required: caption.CJ_VALIDATE_ATTR_NAME,
                }
            }
        }

        $rootScope.validationOptionsCard = {
            rules: {
                CardName: {
                    required: true,
                },
                WeightNum: {
                    required: true,
                    regx: /^\d+(\.\d+)?$/
                },
                Deadline: {
                    required: true,
                },
                BeginTime: {
                    required: true,
                }
            },
            messages: {
                CardName: {
                    required: caption.CJ_VALIDATE_WORK_REQUIRED
                },
                WeightNum: {
                    required: caption.CJ_WEIGHT_NUM_NOT_EMPTY,
                    regx: caption.CJ_WEIGHT_NUM_NOT_NEGATIVE
                },
                Deadline: {
                    required: caption.CJ_DATE_END_NOT_EMPTY
                },
                BeginTime: {
                    required: caption.CJ_DATE_START_NOT_EMPTY
                }
            }
        }

        $rootScope.validationOptionsReason = {
            rules: {
                ChangeDetails: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                ChangeDetails: {
                    required: caption.CJ_REASON_NOT_EMPTY,
                    regx: caption.CJ_REASON_NOT_START_WITH_SPACE
                }
            }
        }
    });
    $rootScope.checkDataPrice = function (data) {
        var partternNumber = /^[0-9]\d*(\\d+)?$/;
        var mess = { Status: false, Title: "" }
        if (!partternNumber.test(data.PricePerM)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_PERM_VALUE, "<br/>");
        }
        if (!partternNumber.test(data.PricePerM2)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_PERM2_VALUE, "<br/>");
        }
        return mess;
    }
    $rootScope.isTranslate = false;
    $rootScope.open = true;
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.show = {
        length: 20,
        board: true,
        groupUser: false,
        user: false,
        team: false,
        project: false,
        customer: false,
        contract: false,
        supplier: false
    };
    $rootScope.boardCode = "";
    $rootScope.isDisabled = false;
    $rootScope.listSelectBoardCommon = [];
    $rootScope.totalSelectBoardCommon = 0;
    $rootScope.searchObj = {
        CardName: '',
        FromDate: '',
        ToDate: '',
        Status: '',
        Comment: '',
        Description: '',
        Object: '',
        BranchId: '',
        ObjTypeCode: '',
        ButtonStatus: false,
        WorkflowInstCode: ''
    };

    $rootScope.searchAdv = {
        CardName: '',
        FromDate: '',
        ToDate: '',
        Status: '',
        Comment: '',
        BranchId: '',
        Supplier: '',
        Contract: '',
        Customer: '',
        Project: '',
        Group: '',
        UserId: '',
        Department: '',
        UserName: '',
        BoardCode: '',
        ListCode: ''
    }

    $rootScope.listAndCard = {
        Length: 4,
        CurrentPage: 1,
        Total: 1
    }

    $rootScope.checkList = [];
    dataserviceTaskManager.getCurrency(function (rs) {
        rs = rs.data;
        $rootScope.currencyData = rs;
    });
    dataserviceTaskManager.getBranch(function (rs) {
        rs = rs.data;
        $scope.listBranch = rs;
    });
    dataserviceTaskManager.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    })
    $rootScope.searchObj.BranchId = "b_HN";
    $rootScope.listNotification = [];
    $rootScope.ListRelative = [];
    $rootScope.WorkTypes = [
        { Code: 'LMS_TASK', Value: 'Luyện tập', Caption: 'LMS_WORK_TYPES_TASK' },
        { Code: 'LMS_PRACTICE_TEST', Value: 'Tạo lịch thi', Caption: 'LMS_WORK_TYPES_EXAM_SCHEDULE' }, // Not used anymore
    ];

    $rootScope.listTrainingType = [
        { Code: 'VIEW_LECTURE', Name: "Xem bài giảng", Caption: 'LMS_TRAINING_TYPE_VIEW_LECTURE' },
        { Code: 'DO_EXERCISE', Name: "Làm bài tập", Caption: 'LMS_TRAINING_TYPE_DO_EXERCISE' },
        { Code: 'DO_PRACTICE', Name: "Làm đề thi thử", Caption: 'LMS_TRAINING_TYPE_DO_TEST' },
        //{ Code: 'DO_EXAM', Name: 'Làm bài thi' },
    ];
    $rootScope.isExamSchedule = false;
    $rootScope.LmsTaskType = 'LMS_TASK';
    $rootScope.Rela = {
        ListRelative: [],
        ListDelRelative: []
    }

    $rootScope.CardLink = {
        ListCardLinkDel: [],
        ListCardLink: []
    }
    $rootScope.ItemCheck = {
        Id: 0,
        CardCode: '',
        ChkListCode: '',
        CheckTitle: '',
        Completed: 0,
        WeightNum: 0,
        checkItem: false,
        TitleSubItemChk: "",
        ListUserItemChk: [],
        ListSubItem: [],
        Constraint: ''
    }
    $rootScope.ListDelItemCheck = [];
    $rootScope.ItemWork = [];
    $rootScope.CardInherit = {
        Code: '',
        Name: ''
    };

    //Search advantage
    $rootScope.SearchAdvMode = false;
    $rootScope.settingNotification = "";
    $rootScope.isTabSumary = true;
    function initLengthListCard() {
        if ($window.innerWidth > 975 && $window.innerWidth < 1295) {
            $rootScope.listAndCard.Length = 2;
        }
        else if ($window.innerWidth > 1295 && $window.innerWidth < 1595) {
            $rootScope.listAndCard.Length = 3;
        } else if ($window.innerWidth > 1595 && $window.innerWidth < 1915) {
            $rootScope.listAndCard.Length = 4;
        }
        else if ($window.innerWidth > 1915 && $window.innerWidth < 2235) {
            $rootScope.listAndCard.Length = 5;
        } else if ($window.innerWidth > 2235) {
            $rootScope.listAndCard.Length = 6;
        }
    }
    function initLengthRelative() {
        $rootScope.show.length = 20;
        //if ($window.innerHeight < 700) {
        //    $rootScope.show.length = 10;
        //} else {
        //    $rootScope.show.length = 15;
        //}
    }
    initLengthListCard();
    initLengthRelative();

    $rootScope.getLogActivity = function () {
        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.ActivityData = rs;
            if ($rootScope.ActivityData.length > 0) {
                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                        $rootScope.ActivityData[i].ChangeDetails = $rootScope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                    }
                }
            }
        });
    }
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsTaskManagement/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLmsTaskManager + '/index.html',
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

app.controller('indexCardJob', function ($scope, $http, $location, $rootScope, $routeParams, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTaskManager, $filter, $window, $cookies) {
    $("#icon-home").removeClass('pt10');
    $("#breadcrumb").addClass('hidden');
    $scope.model = {}
    $rootScope.CardCode = "";
    $scope.modelDetail = {};
    $scope.ViewMode = 1;
    //$scope.DfSetting = {};
    $scope.addlist = {};
    $scope.addcard = {};
    $scope.showAddList = false;

    //Initial board null
    $rootScope.boardCode = null;

    //Show detail job of 1 user
    $rootScope.isShowDetail = false;

    //$scope.showAddCard = '';
    $scope.searchKey = {
        BoardName: ''
    }
    $scope.modelInOut = {
        Lat: 0,
        Lon: 0,
        ShiftCode: '',
    }
    $scope.listBoardCommon = [];
    $scope.totalBoardCommon = 0;
    $scope.tabCommon = 'Bảng';
    $scope.iconCommon = '';
    $scope.treeDataDepartment = [];
    $scope.listColorIconBoard = ["#8e44ad33", "#27ae6026", "#2980b921", "#2ca94b29", "#ed78322b", "#ed1b2433"];
    $scope.isCheckIn = false;
    $scope.initData = function () {
        dataserviceTaskManager.getBoardsWithGroupBy(function (rs) {
            rs = rs.data;
            $scope.listBoardsGroup = rs;
            //loadListAndCardWithTab();
        });
        dataserviceTaskManager.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
        });
        dataserviceTaskManager.getListBoard(function (rs) {
            rs = rs.data;
            $scope.listBoards = rs;
        });
        dataserviceTaskManager.getUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs
        });
        dataserviceTaskManager.checkListAll(function (rs) {
            rs = rs.data;
            $scope.listCheck = rs;
        })
        dataserviceTaskManager.getObjTypeJC(function (rs) {
            rs = rs.data;
            $scope.objTypeJC = rs;
        })
        dataserviceTaskManager.getLastShiftLog(function (rs) {
            rs = rs.data;
            $scope.isCheckIn = rs.IsCheckIn;
            $scope.modelInOut.ShiftCode = rs.ShiftCode;
        })
    };
    $scope.initData();
    $scope.objTypeChange = function (code) {
        dataserviceTaskManager.getObjTypeCode(code, function (rs) {
            rs = rs.data;
            $scope.listObjWithType = rs;
        });
    };
    $scope.readyCBGroupUser = function () {
        $('#treeDiv').jstree(true).settings.core.multiple = true;
        dataserviceTaskManager.getListDepartment(null, function (result) {
            result = result.data;
            $rootScope.totalDepartment = result.length;
            //$scope.treeData = result;
            $scope.ListParent = result.filter(function (item) {
                return (item.ParentCode == null);
            });
            var index = 0;
            for (var i = 0; i < result.length; i++) {
                if (result[i].ParentCode == null) {
                    var stt = $scope.ListParent.length - index;
                    if (stt.toString().length == 1) {
                        stt = "0" + stt;
                    }
                    index = index + 1;
                    var data = {
                        id: result[i].Id,
                        parent: '#',
                        text: stt + ' - ' + result[i].Title,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeDataDepartment.push(data);
                } else {
                    var data = {
                        id: result[i].Id,
                        parent: result[i].ParentCode,
                        text: result[i].Title,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeDataDepartment.push(data);
                }
            }
        });
    }
    $scope.searchGroupUser = function (search) {
        $('#treeDiv').jstree(true).search(search);
    }
    $scope.searchTreeGroupUser = function (e, data) {
        if (data.res.length === 0) {

        };
    }
    $scope.selectNodeGroupUser = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            var obj = {
                code: listNoteSelect[i].id,
            }
            listSelect.push(obj);
        }
        $rootScope.listSelectBoardCommon = listSelect;
        $rootScope.totalSelectBoardCommon = listSelect.length;


        if (listSelect.length == $rootScope.totalDepartment) {
            $scope.isCheck = true;
        } else {
            $scope.isCheck = false;
        }

        loadDataTabGroupUserListAndCard();
    }
    $scope.deselectNodeGroupUser = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            var obj = {
                code: listNoteSelect[i].id,
            }
            listSelect.push(obj);
        }
        $rootScope.listSelectBoardCommon = listSelect;
        $rootScope.totalSelectBoardCommon = listSelect.length;
        loadDataTabGroupUserListAndCard();


        if (listSelect.length == $rootScope.totalDepartment) {
            $scope.isCheck = true;
        } else {
            $scope.isCheck = false;
        }
    }
    $scope.treeEventsGroupUser = {
        'ready': $scope.readyCBGroupUser,
        'select_node': $scope.selectNodeGroupUser,
        'deselect_node': $scope.deselectNodeGroupUser,
        'search': $scope.searchTreeGroupUser,
    }
    $scope.onMultipleGroupUser = function () {
        if ($scope.isCheck == true) {
            $('#treeDiv').jstree(true).settings.core.multiple = true;
        } else {
            $('#treeDiv').jstree(true).settings.core.multiple = false;
        }
    }
    $scope.isCheck = false;
    var isAuto = false;
    $scope.checkAllDepartmentAuto = function () {
        if ($scope.isCheck) {
            $scope.isCheck = false;
        }
        else {
            $scope.isCheck = true;
        }
        if ($scope.isCheck) {
            $scope.treeInstance.jstree(true).check_all();
        }
        else {
            $scope.treeInstance.jstree(true).uncheck_all();
        }
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            var obj = {
                code: listNoteSelect[i].id,
            }
            listSelect.push(obj);
        }

        $rootScope.listSelectBoardCommon = listSelect;
        $rootScope.totalSelectBoardCommon = listSelect.length;
        loadDataTabGroupUserListAndCard();
        isAuto = true;
    }
    $scope.checkAllDepartment = function () {
        if ($scope.isCheck) {
            $scope.isCheck = false;
        }
        else {
            $scope.isCheck = true;
        }
        if ($scope.isCheck) {
            $scope.treeInstance.jstree(true).check_all();
        }
        else {
            $scope.treeInstance.jstree(true).uncheck_all();
        }
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            var obj = {
                code: listNoteSelect[i].id,
            }
            listSelect.push(obj);
        }

        $rootScope.listSelectBoardCommon = listSelect;
        $rootScope.totalSelectBoardCommon = listSelect.length;
        loadDataTabGroupUserListAndCard();
    }
    $scope.boardCommom = function () {
        $scope.listBoardCommon = [];
        $rootScope.listSelectBoardCommon = [];
        isAuto = false;
        $rootScope.listAndCard.CurrentPage = 1;
        $scope.isCheck = false;
        //hide detail employee
        $rootScope.isShowDetail = false;
        $rootScope.isCalendar = false;

        //tab board
        if ($rootScope.show.board) {
            $scope.tabCommon = 'Bảng';
            dataserviceTaskManager.getBoardsWithGroupBy(function (rs) {
                rs = rs.data;
                $scope.listBoardsGroup = rs;
            });
            dataserviceTaskManager.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                rs = rs.data;
                $scope.listBoardsGroupWorkFlow = rs;
            })
            $scope.detail(null);
        }
        //tab user
        if ($rootScope.show.user) {
            loadDataTabUser();
            //loadDataTabUserListAndCard();
        }
    }
    $scope.scrollCommon = function (dir) {
        if (dir == 'bottom') {
            if ($scope.listBoardCommon.length < $scope.totalBoardCommon) {
                //tab user
                var page = ($scope.listBoardCommon.length / $rootScope.show.length) + 1;
                if ($rootScope.show.user) {
                    dataserviceTaskManager.getListPageUser(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
                        rs = rs.data;
                        for (var i = 0; i < rs.ListData.length; i++) {
                            var obj = {
                                Id: rs.ListData[i].Id,
                                Code: rs.ListData[i].Code,
                                Name: rs.ListData[i].Name,
                                CountWork: rs.ListData[i].CountWork,
                                CreatedTime: rs.ListData[i].CreatedTime
                            }
                            $scope.listBoardCommon.push(obj);
                        }
                        $scope.totalBoardCommon = rs.Total;
                    });
                }
            }
        }
    };

    //CurrentPageList
    $scope.lists = [];
    var currentPageList = 1;
    $scope.selectBoardCommon = function () {
        $rootScope.listAndCard.CurrentPage = 1;
        if ($rootScope.show.user && $rootScope.isShowDetail) {
            var lengthChecked = $scope.listBoardCommon.filter(function (obj, index) {
                return obj.IsCheck;
            });
            for (var i = 0; i < lengthChecked.length; i++) {
                for (var j = 0; j < $rootScope.listSelectBoardCommon.length; j++) {
                    if (lengthChecked[i].Code === $rootScope.listSelectBoardCommon[j].Code) {
                        lengthChecked[i].IsCheck = false;
                        lengthChecked.splice(i, 1);
                        break;
                    }
                }
            }
            $rootScope.listSelectBoardCommon = lengthChecked;
            $rootScope.reloadDetailEmployee();
        }
        else {
            var lengthChecked = $scope.listBoardCommon.filter(function (obj, index) {
                return obj.IsCheck;
            });
            $rootScope.listSelectBoardCommon = lengthChecked;
            $rootScope.totalSelectBoardCommon = lengthChecked.length;
            loadListAndCardWithTab();
            if (lengthChecked.length == $scope.listBoardCommon.length) {
                $scope.isCheck = true;
            } else {
                $scope.isCheck = false;
            }
        }
    }
    $scope.searchBoardCommom = function () {
        //tab user
        if ($rootScope.show.user) {
            loadDataTabUser();
        }
    }
    $scope.addBoard = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-board.html',
            controller: 'add-boardCardJob',
            size: '30',
            backdrop: 'static'
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getBoardsWithGroupBy(function (rs) {
                rs = rs.data;
                $scope.listBoardsGroup = rs;
                loadListAndCardWithTab();
            });
            dataserviceTaskManager.getListBoard(function (rs) {
                rs = rs.data;
                $scope.listBoards = rs;
            });
            $scope.create = {};
        }, function () { });
    };
    $scope.editBoard = function (BoardCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/edit-board.html',
            controller: 'edit-boardCardJob',
            size: '30',
            resolve: {
                para: function () {
                    return BoardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getBoardsWithGroupBy(function (rs) {
                rs = rs.data;
                //angular.forEach(rs, function (item) {
                //    angular.forEach(item.ListBoard, function (item1) {
                //        var color = $scope.listColorIconBoard[Math.floor(Math.random() * $scope.listColorIconBoard.length)]
                //        angular.forEach(item1, function (item2) {
                //            //item2.BackgroundImage = $scope.listIconBoard[Math.floor(Math.random() * $scope.listIconBoard.length)]
                //            item2.BackgroundColor = color;
                //        })
                //    });
                //});
                $scope.listBoardsGroup = rs;
                loadListAndCardWithTab();
            });
            dataserviceTaskManager.getListBoard(function (rs) {
                rs = rs.data;
                $scope.listBoards = rs;
            });
            $scope.create = {};
        }, function () { });
    };
    $scope.deleteBoard = function (BoardID) {
        dataserviceTaskManager.deleteBoard(BoardID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.boardCommom();
                dataserviceTaskManager.getListBoard(function (rs) {
                    rs = rs.data;
                    $scope.listBoards = rs;
                });
                $scope.create = {};
            }
        });
    };
    $scope.detail = function (BoardCode) {
        $rootScope.boardCode = BoardCode;
        $rootScope.listAndCard.CurrentPage = 1;
        loadListAndCardWithTab();
        if ($rootScope.isTabSumary == false) {
            dataserviceTaskManager.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                rs = rs.data;
                $scope.listBoardsGroupWorkFlow = rs;
            });
        }
    };
    $rootScope.reloadWFBoard = function (code) {
        dataserviceTaskManager.getBoardsWithWorkFlow(code, function (rs) {
            rs = rs.data;
            $scope.listBoardsGroupWorkFlow = rs;
        });
        dataserviceTaskManager.getBoardDetail($rootScope.boardCode, code, function (rs) {
            rs = rs.data;
            $scope.modelDetail = rs;
        });
    }
    //end card left
    //card detail
    $scope.acticeDrag = false;
    $scope.create = {};
    $scope.search = function () {
        if ($rootScope.searchObj.CardName != '' || $rootScope.searchObj.FromDate != ''
            || $rootScope.searchObj.ToDate != '' || $rootScope.searchObj.Status != ''
            || $rootScope.searchObj.Comment != '' || $rootScope.searchObj.Description != '' || $rootScope.searchObj.Object != '' || $rootScope.searchObj.BranchId != '') {
            $rootScope.listAndCard.CurrentPage = 1;
            loadListAndCardWithTab();
            dataserviceTaskManager.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                rs = rs.data;
                $scope.listBoardsGroupWorkFlow = rs;
            });
            $rootScope.searchObj.ButtonStatus = false;
        } else {
            App.toastrWarning(caption.CJ_MSG_ENTER_KEY_WORD);
        }
    }
    $rootScope.indexTab = '';
    $scope.searchInTab = function (index) {
        $rootScope.indexTab = index;
        if (index == 1) {
            $rootScope.searchObj.Status = "START";
        } else if (index == 2) {
            $rootScope.searchObj.Status = "CREATED";
        } else if (index == 3) {
            $rootScope.searchObj.Status = "DONE";
        } else if (index == 4) {
            $rootScope.searchObj.Status = "CANCLED";
        } else if (index == 5) {
            $rootScope.searchObj.Status = "";
        } else if (index == 6) {
            $rootScope.searchObj.Status = "TRASH";
        } else if (index == 7) {
            $rootScope.searchObj.Status = "CLOSED";
        }
        loadListAndCardWithTab();
        $rootScope.searchObj.ButtonStatus = true;
    }
    $scope.selectBoard = function (boardCode) {
        dataserviceTaskManager.getLists(boardCode, function (rs) {
            rs = rs.data;
            if (rs.length != 0) {
                $scope.listsInBoard = rs;
                $scope.create.ListCode = $scope.listsInBoard.length != 0 ? $scope.listsInBoard[0].ListCode : '';
            } else {
                $scope.listsInBoard = [];
                $scope.create.ListCode = '';
                App.toastrError(caption.CJ_MSG_NO_LIST_IN_BOARD);
            }
        });
    }
    $scope.createNewCard = function () {
        if ($rootScope.show.board) {
            $scope.create.TabBoard = 1;
        }
        if ($rootScope.show.groupUser) {
            $scope.create.TabBoard = 2;
        }
        if ($rootScope.show.user) {
            $scope.create.TabBoard = 3;
        }
        if ($rootScope.show.team) {
            $scope.create.TabBoard = 4;
        }
        if ($rootScope.show.project) {
            $scope.create.TabBoard = 5;
        }
        if ($rootScope.show.customer) {
            $scope.create.TabBoard = 6;
        }
        if ($rootScope.show.contract) {
            $scope.create.TabBoard = 7;
        }
        if ($rootScope.show.supplier) {
            $scope.create.TabBoard = 8;
        }
        $scope.create.ListCodeRelative = $rootScope.listSelectBoardCommon;
        dataserviceTaskManager.insertCard($scope.create, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
                $rootScope.loadWork(true);
                $scope.cleanInfo();
            }
        });
    };
    $scope.cleanInfo = function () {

        $scope.create.ListCode = '';
        $scope.create.CardName = '';
        $scope.create.BoardCode = '';
    }
    $scope.options = {
        title: $compile('<label>Thêm thẻ mới</label> <a class="close" style="width: 30px; height: 30px;opacity: 1;" onclick="$(\'.popover\').popover(\'hide\')" data-dismiss="alert"></a>')($scope),
        content: $compile(`
                            <div class="input-group">
                                <ui-select tagging ng-model="create.BoardCode" theme="bootstrap" on-select="selectBoard(create.BoardCode)">
                                    <ui-select-match placeholder="Bảng việc...">{{$select.selected.BoardName}}</ui-select-match>
                                    <ui-select-choices style="height: auto" repeat="x.BoardCode as x in listBoards | filter: $select.search">
                                        {{x.BoardName}}
                                    </ui-select-choices>
                                </ui-select>
                                <span class="input-group-addon" ng-click="create.BoardCode = ''">
                                     <span class="fa fa-times"></span>
                                 </span>
                            </div>
                            <div class="input-group mt5">
                                <ui-select tagging ng-model="create.ListCode" theme="bootstrap">
                                    <ui-select-match placeholder="Danh sách...">{{$select.selected.ListName}}</ui-select-match>
                                    <ui-select-choices style="height: auto" repeat="x.ListCode as x in listsInBoard | filter: $select.search">
                                        {{x.ListName}}
                                    </ui-select-choices>
                                </ui-select>
                                <span class="input-group-addon" ng-click="create.ListCode = ''">
                                    <span class="fa fa-times"></span>
                                </span>
                            </div>
                            <input class='form-control mt5' ng-model='create.CardName' placeholder='Tên thẻ...'/>
                            <button class='btn btn-red mt5' style="width: 100%" ng-click='createNewCard()'>Tạo</button>
                            <style>
                                .popover-title{cursor: pointer}
                            </style>
                            <script>
                                $('.popover').draggable();
                                $('body').on('hidden.bs.popover', function (e) {
                                    $(e.target).data("bs.popover").inState = { click: false, hover: false, focus: false }
                                });
                            </script>
                            `)($scope),
        trigger: "click",
        placement: "bottom",
        html: true
    };
    $scope.openAddList = function () {
        $scope.showAddList = !$scope.showAddList;
    }

    $scope.openAddCard = function (ListCode) {
        $scope.showAddCard = ListCode;
        var listTextAre = $('#BoardDetailMain').find('.cardArea');
        for (var i = 0; i < listTextAre.length; i++) {
            listTextAre[i].remove();
        }
        var html = '<textarea  id="textare_' + ListCode + '"class="form-control cardArea" placeholder="' + caption.LMS_INPUT_CARDJOB_TITLE + '" ng-model="addcard.CardName"></textarea>';
        $("#bottom_" + ListCode).append($compile(html)($scope));
        var $textarea = $('#textare_' + ListCode);
        $textarea.focus();
    }

    $scope.closeAddCard = function (ListCode) {
        $scope.showAddCard = '';
        $("#textare_" + ListCode).remove();
    }

    $scope.deleteList = function (ListID) {
        dataserviceTaskManager.deleteList(ListID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
                loadListAndCardWithTab();
            }
        });
    };

    $scope.cardDetail = function (CardCode) {
        $rootScope.CardCode = CardCode;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-card-buffer.html',
            controller: 'edit-cardCardJob',
            backdrop: 'static',
            keyboard: false,
            size: '80',
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            updateNotify();
        }, function () { });
    }

    $scope.addCardBuffer = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-card-buffer.html',
            controller: 'add-card-buffer',
            backdrop: 'static',
            keyboard: false,
            size: '60',
            resolve: {
                para: function () {
                    return {
                        ObjectCode: $rootScope.searchObj.Object,
                        BoardCode: $rootScope.boardCode
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (!$rootScope.isExamSchedule) {
                $rootScope.reloadGridCard();
            }
        }, function () {
            if (!$rootScope.isExamSchedule) {
                $rootScope.reloadGridCard(true);
                if ($rootScope.isTabSumary == false) {
                    dataserviceTaskManager.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                        rs = rs.data;
                        $scope.listBoardsGroupWorkFlow = rs;
                    });
                    dataserviceTaskManager.getBoardDetail($rootScope.boardCode, $rootScope.searchObj.Object, function (rs) {

                        rs = rs.data;
                        $scope.modelDetail = rs;
                    });
                }
            }
        });
    }

    //Show calendar
    $rootScope.isCalendar = false;
    $scope.showSchedule = function () {
        $rootScope.isShowDetail = false;
        if ($rootScope.isCalendar) {
            $rootScope.isCalendar = false;
        }
        else {
            $rootScope.isCalendar = true;
        }
    }

    $scope.addList = function () {
        $scope.addlist.BoardCode = $rootScope.boardCode;
        $scope.addlist.WeightNum = $scope.addlist.WeightNum == null ? 0 : $scope.addlist.WeightNum;
        dataserviceTaskManager.insertList($scope.addlist, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.addlist.ListName = "";
                var dataSearch = {
                    Length: $rootScope.listAndCard.Length,
                    Page: $rootScope.listAndCard.CurrentPage,
                    BoardCode: $rootScope.boardCode,
                    CardName: $rootScope.searchObj.CardName,
                    FromDate: $rootScope.searchObj.FromDate,
                    ToDate: $rootScope.searchObj.ToDate,
                    DeadLine: $rootScope.searchObj.DeadLine,
                    Object: $rootScope.searchObj.Object,
                    CurrentPageList: currentPageList,
                }
                dataserviceTaskManager.getListsAndCard(dataSearch, function (rs) {
                    rs = rs.data;
                    $scope.lists = rs.Data;
                    $rootScope.listAndCard.Total = (rs.Total % $rootScope.listAndCard.Length == 0) ? rs.Total + 1 : rs.Total;
                    loadDate();
                    //next page auto
                    if (rs.Total % $rootScope.listAndCard.Length == 0) {
                        $rootScope.listAndCard.CurrentPage = $rootScope.listAndCard.CurrentPage + 1;
                        dataSearch.Page = $rootScope.listAndCard.CurrentPage;
                        dataserviceTaskManager.getListsAndCard(dataSearch, function (rs) {
                            rs = rs.data;
                            $scope.lists = rs.Data;
                        });
                    }
                });
            }
        })
    }
    $scope.sortListByStatus = function (orther) {
        dataserviceTaskManager.sortListByStatus($rootScope.boardCode, orther, function (rs) {
            rs = rs.data;
            if (rs.Error) {

            }
            else {
                $scope.initData();
            }
        })
    }
    $scope.editingListTitle = function (id) {
        if ($scope.acticeDrag == false) {
            $scope.acticeDrag = true;
            document.getElementById("listName_" + id).focus();
        }
    }
    $scope.updateListName = function (ListID) {
        var element = $('#listName_' + ListID);
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        console.log('NewName: ' + newName);
        console.log("CurrentName: " + currentName);
        if (newName != currentName) {
            console.log("Change name");
            var data = {
                ListID: ListID,
                ListName: newName
            }

            dataserviceTaskManager.updateListName(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    element.attr('data-currentvalue', newName)
                }
            })
        }
        $scope.acticeDrag = false;
    }
    $scope.changeListStatus = function (listID, statusCode) {
        dataserviceTaskManager.changeListStatus(listID, statusCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
            }
            else {
                for (var i = 0; i < $scope.lists.length; i++) {
                    if ($scope.lists[i].ListID == listID) {
                        $scope.lists[i].Status = statusCode;
                        if (statusCode == 0) {
                            $scope.lists[i].HeaderColor = '#d35400';
                        };
                        if (statusCode == 1) {
                            $scope.lists[i].HeaderColor = '#f1c40f';
                        };
                        if (statusCode == 2) {
                            $scope.lists[i].HeaderColor = '#2ecc71';
                        }
                    }
                }
            }
        })
    }
    $scope.selectPageList = function () {
        loadListAndCardWithTab();
    }
    $scope.addCard = function (ListCode) {
        $scope.addcard.ListCode = ListCode;
        $scope.addcard.ListCodeRelative = $rootScope.listSelectBoardCommon;
        if ($rootScope.show.board) {
            $scope.addcard.TabBoard = 1;
        }
        if ($rootScope.show.groupUser) {
            $scope.addcard.TabBoard = 2;
        }
        if ($rootScope.show.user) {
            $scope.addcard.TabBoard = 3;
        }
        if ($rootScope.show.team) {
            $scope.addcard.TabBoard = 4;
        }
        if ($rootScope.show.project) {
            $scope.addcard.TabBoard = 5;
        }
        if ($rootScope.show.customer) {
            $scope.addcard.TabBoard = 6;
        }
        if ($rootScope.show.contract) {
            $scope.addcard.TabBoard = 7;
        }
        if ($rootScope.show.supplier) {
            $scope.addcard.TabBoard = 8;
        }
        dataserviceTaskManager.insertCard($scope.addcard, function (rs) {

            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
                $scope.closeAddCard(ListCode);
                $scope.addcard.CardName = '';
                $rootScope.loadWork(true);
                loadListAndCardWithTab();
            }
        });
    };
    $scope.cardName = function (cardID, cardNameNew) {

        if (cardNameNew == "" || cardNameNew == undefined) {
            App.toastrError(caption.CJ_MSG_PLS_ENTER_TITLE_CARD);
        }
        else {
            var obj = {
                CardID: cardID,
                CardName: cardNameNew
            }
            dataserviceTaskManager.updateCardName(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    if (rs.Title != '') {
                        App.toastrSuccess(rs.Title);
                    }
                }
            })
        }

    }
    $scope.cardChangeBeginTime = function (cardCode, beginTime) {
        dataserviceTaskManager.updateBeginTime(cardCode, beginTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.cardChangeEndTime = function (cardCode, endTime) {
        dataserviceTaskManager.updateEndTime(cardCode, endTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.cardChangeDeadLine = function (cardCode, listCode) {
        $scope.cardCodeDeadline = cardCode;
        $scope.listCodeDeadLine = listCode;
    }
    $scope.cardQuantitative = function (cardCode, quantitative) {
        if (quantitative >= 0) {
            dataserviceTaskManager.updateQuantitative(cardCode, quantitative, function (rs) {
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
    $scope.cardUnit = function (cardCode, unit) {
        dataserviceTaskManager.updateUnit(cardCode, unit, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    //ui-sortable options 
    var orther = [];
    $scope.sortableOptions = {
        handle: '.task-board',
        activate: function (e, ui) {
            $scope.acticeDrag = true;
        },
        start: function (e, ui) {
            ui.item.addClass('rotate');
            orther = $scope.lists.map(function (i) {
                return i.Order;
            })
        },
        update: function (e, ui) {
            var logEntry = $scope.lists.map(function (i) {
                return i.Order;
            });
        },
        stop: function (e, ui) {
            //console.log(ui);
            $('.ui-sortable-placeholder').css('display', 'none');
            ui.placeholder.removeClass('ui-sortable-placeholder');
            ui.placeholder.removeAttr("visibility").removeAttr("height");
            ui.item.removeClass('rotate');

            var logEntry = $scope.lists.map(function (i) {
                return i.Order;
            });
            dataserviceTaskManager.updateOrder(orther, logEntry, function (rs) {
                rs = rs.data;
                if (rs.Error) {

                }
                else {

                }
            });
            $scope.acticeDrag = false;
        }
    };
    $scope.sortableCard = {
        connectWith: ".tag-content",
        start: function (e, ui) {

        },
        stop: function (e, ui) {
            if (ui.item.sortable.droptarget) {
                var CardCode = ui.item.sortable.droptarget.context.id;
                var ListCode = ui.item.sortable.droptarget[0].id;
                dataserviceTaskManager.changeListCard(CardCode, ListCode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        //App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    };
    $scope.gridCard = function (type) {

        $scope.ViewMode = type;
        if ($rootScope.show.groupUser) {
            $scope.selectNodeGroupUser();
        } else {
            $scope.selectBoardCommon();
        }
    };

    //End card detail
    //Hide some control search
    $scope.isTabSumary = true;
    $scope.showControl = function (index) {
        if (index != 0) {
            $scope.isTabSumary = false;
            $rootScope.isTabSumary = false;
            $rootScope.searchObj.ObjTypeCode = "PROJECT";
            dataserviceTaskManager.getLastestProject(function (rs) {
                rs = rs.data;
                $rootScope.searchObj.Object = rs;
                dataserviceTaskManager.getBoardsWithWorkFlow($rootScope.searchObj.Object, function (rs) {
                    rs = rs.data;
                    $scope.listBoardsGroupWorkFlow = rs;
                })
            })
            dataserviceTaskManager.getObjTypeCode($rootScope.searchObj.ObjTypeCode, function (rs) {
                rs = rs.data;
                $scope.listObjWithType = rs;
            });
        } else {
            $scope.isTabSumary = true;
            $rootScope.isTabSumary = true;
            $rootScope.searchObj.ObjTypeCode = "";
            $rootScope.searchObj.Object = ""
        }
    }
    //end hide some search

    //Search advantage
    $rootScope.SearchAdv = function () {
        $rootScope.isShowDetail = false;
        if ($rootScope.SearchAdvMode) {
            $rootScope.SearchAdvMode = false;
        } else {

            $rootScope.show.board = true;
            $rootScope.show.groupUser = false;
            $rootScope.show.user = false;
            $rootScope.show.team = false;
            $rootScope.show.project = false;
            $rootScope.show.customer = false;
            $rootScope.show.contract = false;
            $rootScope.show.supplier = false;

            $rootScope.boardCode = null;
            $rootScope.SearchAdvMode = true;
            dataserviceTaskManager.getListUser(function (rs) {
                rs = rs.data;
                $rootScope.listUser = rs;
            })
            dataserviceTaskManager.getListProject(function (rs) {
                rs = rs.data;
                $rootScope.listProject = rs;
            })
            dataserviceTaskManager.getListCustomer(function (rs) {
                rs = rs.data;
                $rootScope.listCustomer = rs;
            })
            dataserviceTaskManager.getListSupplier(function (rs) {
                rs = rs.data;
                $rootScope.getListSupplier = rs;
            })
            dataserviceTaskManager.getContractSale(function (rs) {
                rs = rs.data;
                $rootScope.listContract = rs;
            })
            dataserviceTaskManager.getDepartment(function (rs) {
                rs = rs.data;
                $rootScope.listDepartment = rs;
            })
            dataserviceTaskManager.getListGroupUser("", function (rs) {
                rs = rs.data;
                $rootScope.listGroupUser = rs;
            })
            loadDataTabBoard()
        }
    }
    $rootScope.searchAdvantage = function () {
        loadDataTabBoard()
    }
    $rootScope.selectUser = function (item) {
        $rootScope.searchAdv.UserName = item.UserName;
    }
    $scope.boardSelect = function (boardCode) {
        $rootScope.searchAdv.ListCode = "";
        dataserviceTaskManager.getLists(boardCode, function (rs) {
            rs = rs.data;
            $scope.Lists = rs;
        });
    };
    $rootScope.listSelect = function (board) {
        if (board == "" || board == null || board == undefined) {
            App.toastrError(caption.CJ_MSG_PLS_SELECT_TABLE_WORKING);
        }
    }

    //Show detail job of 1 user
    $rootScope.viewDetailEmployee = function () {
        $rootScope.isCalendar = false;
        if ($rootScope.isShowDetail) {
            $rootScope.isShowDetail = false;
            $rootScope.searchObj.FromDate = '';
            $rootScope.searchObj.ToDate = '';
        } else {
            if ($rootScope.listSelectBoardCommon.length > 1 || $rootScope.listSelectBoardCommon.length <= 0) {
                return App.toastrError(caption.CJ_MSG_PLS_SELECT_EMPLOYEE);
            }
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            $rootScope.searchObj.FromDate = $filter('date')(firstDay, 'dd/MM/yyyy');
            $rootScope.searchObj.ToDate = $filter('date')(lastDay, 'dd/MM/yyyy');
            $rootScope.isShowDetail = true;
        }
    }

    //hide,show menu
    function openNavCard() {
        if (!$rootScope.open) {
            $rootScope.open = true;
            document.getElementById("mySidenav").style.width = "345px";
            document.getElementById("BoardDetail").style.paddingLeft = "330px";
            //document.getElementById('navbar-menu').style.paddingLeft = "325px";
        }
        else {
            closeNavCard();
        }
    }
    function closeNavCard() {
        $rootScope.open = false;
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("BoardDetail").style.paddingLeft = "15px";
        //document.getElementById('navbar-menu').style.paddingLeft = "0px";
        document.body.style.backgroundColor = "white";
        //document.getElementById('checkInOut').style.paddingLeft = "325px";
    }
    function openMenu() {
        $.app.menu.expanded = false;
        $.app.menu.expand();
    }
    function closeMenu() {
        $.app.menu.collapsed = false;
        $.app.menu.toggle();
    }

    //setting
    function setHeightBoard() {
        var $menu = $('#navbar-menu');
        var $header = $('.nav-header .btn-group');
        var $searchBoard = $('.nav-search input');
        var $footer = $('.nav-footer');

        var menu = $menu.height();
        var header = $header[0].offsetHeight;
        var searchBoard = $searchBoard[0].offsetHeight;
        var footer = $footer.height();
        var height = $window.innerHeight - (menu + header + searchBoard + footer) - 25;
        $('#list-board').css({
            "height": "85vh",
            'overflow-y': 'scroll'
        });
    }
    function setHeightBoardCommom() {
        var $menu = $('#navbar-menu');
        var $header = $('.nav-header .btn-group');
        var $searchBoard = $('.nav-search input');
        var $footer = $('.nav-footer');
        var $headerBody = $('.board-header-commom');

        var menu = $menu.height();
        var header = $header[0].offsetHeight;
        var searchBoard = $searchBoard[0].offsetHeight;
        var footer = $footer.height();
        var headerBody = $headerBody[0].offsetHeight;
        var height = $window.innerHeight - (menu + header + searchBoard + footer + headerBody) - 25;
        $('#list-board-commom').css({
            "height": "78vh",
            'overflow-y': 'scroll'
        });
    }
    function loadDate() {
        setTimeout(function () {
            $(".startDate").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('.endDate').datepicker('setStartDate', maxDate);
            });
            $(".endDate").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('.startDate').datepicker('setEndDate', maxDate);
            });
            $(".cardDetailLine").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                dateFormat: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var deadLine = $filter('date')(selected.date.valueOf(), "dd/MM/yyyy");
                dataserviceTaskManager.updateDeadLine($scope.cardCodeDeadline, deadLine, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var getList = $scope.lists.find(function (element) {
                            if (element.ListCode == $scope.listCodeDeadLine) return true;
                        });
                        if (getList) {
                            var getCard = getList.ListCard.find(function (element) {
                                if (element.CardCode == $scope.cardCodeDeadline) return true;
                            });
                            if (getCard) {
                                getCard.Deadline = deadLine;
                            }
                        }
                        App.toastrSuccess(rs.Title);
                    }
                })
            });

        }, 100);
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

        $('#FromDateAdv').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDateAdv').datepicker('setStartDate', maxDate);
        });
        $('#ToDateAdv').datepicker({
            autoclose: true,
            format: 'dd/mm/yyyy',
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDateAdv').datepicker('setEndDate', maxDate);
        });
    }
    function resetDateSearch() {
        $('#FromDate').datepicker('setEndDate', null);
        $('#ToDate').datepicker('setStartDate', null);
    }
    //loadData
    function loadListAndCardWithTab() {
        //tab group user
        if ($rootScope.show.groupUser) {
            loadDataTabGroupUserListAndCard();
        }
        //tab user
        if ($rootScope.show.user) {
            loadDataTabUserListAndCard();
        }
        //tab board
        if ($rootScope.show.board) {
            loadDataTabBoard();
        }
        //tab team
        if ($rootScope.show.team) {
            loadDataTabTeamListAndCard();
        }
        //tab project
        if ($rootScope.show.project) {
            loadDataTabProjectListAndCard();
        }
        //tab customer
        if ($rootScope.show.customer) {
            loadDataTabCustomerListAndCard();
        }
        //tab contract
        if ($rootScope.show.contract) {
            loadDataTabContractListAndCard();
        }
        //tab supplier
        if ($rootScope.show.supplier) {
            loadDataTabSupplierListAndCard();
        }
        if ($scope.ViewMode == 0) {
            var TabBoard = 0;
            if ($rootScope.show.board) {
                TabBoard = 1;
            }
            if ($rootScope.show.groupUser) {
                TabBoard = 2;
            }
            if ($rootScope.show.user) {
                TabBoard = 3;
            }
            if ($rootScope.show.team) {
                TabBoard = 4;
            }
            if ($rootScope.show.project) {
                TabBoard = 5;
            }
            if ($rootScope.show.customer) {
                TabBoard = 6;
            }
            if ($rootScope.show.contract) {
                TabBoard = 7;
            }
            if ($rootScope.show.supplier) {
                TabBoard = 8;
            }
            var data = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                BoardCode: $rootScope.boardCode,
                CardName: $rootScope.searchObj.CardName,
                Fromdate: $rootScope.searchObj.FromDate,
                Todate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                ObjType: $rootScope.searchObj.ObjTypeCode,
                TabBoard: TabBoard
            }
            dataserviceTaskManager.getCountCard(data, function (rs) {
                rs = rs.data;
                $rootScope.CountCard = rs;
            })
        }
    }

    function loadDataTabGroupUserListAndCard() {

        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }

            var data = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                BoardCode: $rootScope.boardCode,
                CardName: $rootScope.searchObj.CardName,
                Fromdate: $rootScope.searchObj.FromDate,
                Todate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                ObjType: $rootScope.searchObj.ObjTypeCode,
                TabBoard: 2
            }
            dataserviceTaskManager.getCardWithDepartment(dataSearch, function (rs) {
                rs = rs.data;

                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
            dataserviceTaskManager.getCountCard(data, function (rs) {
                rs = rs.data;
                $rootScope.CountCard = rs;
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }

    function loadDataTabBoard() {
        setHeightBoard();
        dataserviceTaskManager.getBoardDetail($rootScope.boardCode, $rootScope.searchObj.Object, function (rs) {
            rs = rs.data;
            $scope.modelDetail = rs;
        });

        if ($scope.ViewMode == 0) {
            var dataSearch = {};
            currentPageList = 1;
            if (!$rootScope.SearchAdvMode) {
                dataSearch = {
                    Length: $rootScope.listAndCard.Length,
                    Page: $rootScope.listAndCard.CurrentPage,
                    BoardCode: $rootScope.boardCode,
                    CardName: $rootScope.searchObj.CardName,
                    FromDate: $rootScope.searchObj.FromDate,
                    ToDate: $rootScope.searchObj.ToDate,
                    Status: $rootScope.searchObj.Status,
                    Object: $rootScope.searchObj.Object,
                    BranchId: $rootScope.searchObj.BranchId,
                    CurrentPageList: currentPageList,
                }
            }
            else {
                dataSearch = {
                    Length: $rootScope.listAndCard.Length,
                    Page: $rootScope.listAndCard.CurrentPage,
                    BoardCode: $rootScope.boardCode,
                    CardName: $rootScope.searchAdv.CardName,
                    FromDate: $rootScope.searchAdv.FromDate,
                    ToDate: $rootScope.searchAdv.ToDate,
                    Status: $rootScope.searchObj.Status,
                    BranchId: $rootScope.searchAdv.BranchId,
                    Supplier: $rootScope.searchAdv.Supplier,
                    Contract: $rootScope.searchAdv.Contract,
                    Customer: $rootScope.searchAdv.Customer,
                    Project: $rootScope.searchAdv.Project,
                    Group: $rootScope.searchAdv.Group,
                    UserId: $rootScope.searchAdv.UserId,
                    Department: $rootScope.searchAdv.Department,
                    UserName: $rootScope.searchAdv.UserName,
                    BoardSearch: $rootScope.searchAdv.BoardCode,
                }
            }
            dataserviceTaskManager.getListsAndCard(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = (rs.Total % $rootScope.listAndCard.Length == 0) ? rs.Total + 1 : rs.Total;
                loadDate();
            });
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
            else {
                $scope.boardCommom();
            }
        }
    }

    function loadDataTabUser() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListPageUser(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
            rs = rs.data;

            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabUserListAndCard();
        });
    }
    function loadDataTabUserListAndCard() {
        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }
            dataserviceTaskManager.getCardWithUser(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }

    function loadDataTabTeam() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListGroupUserPage(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
            debugger
            rs = rs.data;
            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabTeamListAndCard();
        });
    }
    function loadDataTabTeamListAndCard() {

        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
            }
            dataserviceTaskManager.getCardWithGroupUser(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }

    function loadDataTabProject() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListPageProject(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
            rs = rs.data;
            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabProjectListAndCard();
        });
    }
    function loadDataTabProjectListAndCard() {
        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }
            dataserviceTaskManager.getCardWithProject(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }

    function loadDataTabCustomer() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListPageCustomer(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
            rs = rs.data;
            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabCustomerListAndCard();
        });
    }
    function loadDataTabCustomerListAndCard() {
        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }
            dataserviceTaskManager.getCardWithCustomer(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }

    function loadDataTabContract() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListPageContract(page, $rootScope.show.length, $scope.searchKey.BoardName, function (rs) {
            rs = rs.data;
            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabContractListAndCard();
        });
    }
    function loadDataTabContractListAndCard() {
        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }
            dataserviceTaskManager.getCardWithContract(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }
    $scope.checkAllCommon = function () {
        if ($scope.isCheck) {
            $scope.isCheck = false;
            if ($scope.listBoardCommon.length > 0) {
                for (var i = 0; i < $scope.listBoardCommon.length; i++) {
                    $scope.listBoardCommon[i].IsCheck = false;
                }
            }
        }
        else {
            $scope.isCheck = true;
            if ($scope.listBoardCommon.length > 0) {
                for (var i = 0; i < $scope.listBoardCommon.length; i++) {
                    $scope.listBoardCommon[i].IsCheck = true;
                }
            }
        }
        var lengthChecked = $scope.listBoardCommon.filter(function (obj, index) {
            return obj.IsCheck;
        });
        $rootScope.listSelectBoardCommon = lengthChecked;
        $rootScope.totalSelectBoardCommon = lengthChecked.length;
        loadListAndCardWithTab();
    }
    $scope.checkAllCommonAuto = function () {
        if ($scope.isCheck) {
            $scope.isCheck = false;
            if ($scope.listBoardCommon.length > 0) {
                for (var i = 0; i < $scope.listBoardCommon.length; i++) {
                    $scope.listBoardCommon[i].IsCheck = false;
                }
            }
        }
        else {
            $scope.isCheck = true;
            if ($scope.listBoardCommon.length > 0) {
                for (var i = 0; i < $scope.listBoardCommon.length; i++) {
                    $scope.listBoardCommon[i].IsCheck = true;
                }
            }
        }
        var lengthChecked = $scope.listBoardCommon.filter(function (obj, index) {
            return obj.IsCheck;
        });
        $rootScope.listSelectBoardCommon = lengthChecked;
        $rootScope.totalSelectBoardCommon = lengthChecked.length;
    }

    function loadDataTabSupplier() {
        $scope.listBoardCommon = [];
        var page = ($scope.listBoardCommon.length / $scope.show.length) + 1;
        dataserviceTaskManager.getListPageSupplier(page, $scope.show.length, $scope.searchKey.BoardName, function (rs) {
            rs = rs.data;
            $scope.listBoardCommon = rs.ListData;
            $scope.totalBoardCommon = rs.Total;
            $scope.tabCommon = rs.Tab;
            $scope.iconCommon = rs.Icon;
            setHeightBoardCommom();
            $scope.checkAllCommonAuto();
            loadDataTabSupplierListAndCard();
        });
    }
    function loadDataTabSupplierListAndCard() {
        if ($scope.ViewMode == 0) {
            var dataSearch = {
                ListObjCode: $rootScope.listSelectBoardCommon,
                Length: $rootScope.listAndCard.Length,
                Page: $rootScope.listAndCard.CurrentPage,
                CardName: $rootScope.searchObj.CardName,
                FromDate: $rootScope.searchObj.FromDate,
                ToDate: $rootScope.searchObj.ToDate,
                Status: $rootScope.searchObj.Status,
                Object: $rootScope.searchObj.Object,
                BranchId: $rootScope.searchObj.BranchId,
                CurrentPageList: currentPageList,
            }
            dataserviceTaskManager.getCardWithSupplier(dataSearch, function (rs) {
                rs = rs.data;
                $scope.lists = rs.Data;
                $rootScope.listAndCard.Total = rs.Total;
                loadDate();
            })
        } else {
            if ($rootScope.reloadGridCard) {
                $rootScope.reloadGridCard();
            }
        }
    }
    setTimeout(function () {
        loadDateSearch();
    }, 3000);
    $(document).ready(function (e) {
        $('.content-wrapper').css("height", "100%");
        $('#contentMain').css("height", "100%");
        $('.container-fluid').not('.board-detail').css("height", "100%");
        $("#LmsDetail").css("padding-left", "0px");
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
    $rootScope.loadListAndCardWithTab = function () {
        loadListAndCardWithTab();
    }
    $rootScope.loadWork = function (increase) {
        for (var i = 0; i < $scope.listBoardCommon.length; i++) {
            if ($scope.listBoardCommon[i].IsCheck) {
                if (increase) {
                    $scope.listBoardCommon[i].CountWork = $scope.listBoardCommon[i].CountWork + 1;
                } else {
                    $scope.listBoardCommon[i].CountWork = $scope.listBoardCommon[i].CountWork - 1;
                }
            }
        }
    }

    $scope.showPercent = function (type, code) {
        for (var i = 0; i < $scope.listBoardCommon.length; i++) {
            if ($scope.listBoardCommon[i].Code == code) {
                $scope.listBoardCommon[i].IsShowPercent = true;
                dataserviceTaskManager.getPercentObject(code, type, function (rs) {
                    rs = rs.data;
                    $scope.listBoardCommon[i].PercentObject = rs;
                })
                break;
            }
        }
    }

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

    function updateNotify() {
        dataserviceTaskManager.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("countCardWork").innerText = "Bạn có " + rs.CountWork + " công việc mới.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
});

app.controller('grid-cardCardJob', function ($scope, $rootScope, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, dataserviceTaskManager) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    //Khai báo số lượng
    $rootScope.status_all = 0;
    $rootScope.status_pending = 0;
    $rootScope.status_new = 0;
    $rootScope.status_complete = 0;
    $rootScope.status_cancel = 0;
    $rootScope.status_trash = 0;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsTaskManagement/GetGridCard",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                if (!$rootScope.SearchAdvMode) {
                    d.ListObjCode = $rootScope.listSelectBoardCommon;
                    d.BoardCode = $rootScope.boardCode;
                    d.CardName = $rootScope.searchObj.CardName;
                    d.Fromdate = $rootScope.searchObj.FromDate;
                    d.Todate = $rootScope.searchObj.ToDate;
                    d.UserId = $rootScope.searchObj.UserId;
                    d.Status = $rootScope.searchObj.Status;
                    d.Object = $rootScope.searchObj.Object;
                    d.BranchId = $rootScope.searchObj.BranchId;
                    d.ObjType = $rootScope.searchObj.ObjTypeCode;
                    d.WorkflowInstCode = $rootScope.searchObj.WorkflowInstCode;
                } else {
                    d.BoardCode = $rootScope.boardCode;
                    d.CardName = $rootScope.searchAdv.CardName;
                    d.FromDate = $rootScope.searchAdv.FromDate;
                    d.ToDate = $rootScope.searchAdv.ToDate;
                    d.Status = $rootScope.searchAdv.Status;
                    d.BranchId = $rootScope.searchAdv.BranchId;
                    d.Supplier = $rootScope.searchAdv.Supplier;
                    d.Contract = $rootScope.searchAdv.Contract;
                    d.Customer = $rootScope.searchAdv.Customer;
                    d.Project = $rootScope.searchAdv.Project;
                    d.Group = $rootScope.searchAdv.Group;
                    d.UserId = $rootScope.searchAdv.UserId;
                    d.Department = $rootScope.searchAdv.Department;
                    d.UserName = $rootScope.searchAdv.UserName;
                    d.BoardSearch = $rootScope.searchAdv.BoardCode;
                    d.ListCode = $rootScope.searchAdv.ListCode;
                }

                if ($rootScope.show.board) {
                    d.TabBoard = 1;
                }
                if ($rootScope.show.groupUser) {
                    d.TabBoard = 2;
                }
                if ($rootScope.show.user) {
                    d.TabBoard = 3;
                }
                if ($rootScope.show.team) {
                    d.TabBoard = 4;
                }
                if ($rootScope.show.project) {
                    d.TabBoard = 5;
                }
                if ($rootScope.show.customer) {
                    d.TabBoard = 6;
                }
                if ($rootScope.show.contract) {
                    d.TabBoard = 7;
                }
                if ($rootScope.show.supplier) {
                    d.TabBoard = 8;
                }
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
                $(".table-scrollable").css('height', '78vh');
                heightTableAuto();
                var TabBoard = 0;

                if ($rootScope.show.board) {
                    TabBoard = 1;
                }
                if ($rootScope.show.groupUser) {
                    TabBoard = 2;
                }
                if ($rootScope.show.user) {
                    TabBoard = 3;
                }
                if ($rootScope.show.team) {
                    TabBoard = 4;
                }
                if ($rootScope.show.project) {
                    TabBoard = 5;
                }
                if ($rootScope.show.customer) {
                    TabBoard = 6;
                }
                if ($rootScope.show.contract) {
                    TabBoard = 7;
                }
                if ($rootScope.show.supplier) {
                    TabBoard = 8;
                }
                var data = {
                    ListObjCode: $rootScope.listSelectBoardCommon,
                    BoardCode: $rootScope.boardCode,
                    CardName: $rootScope.searchObj.CardName,
                    Fromdate: $rootScope.searchObj.FromDate,
                    Todate: $rootScope.searchObj.ToDate,
                    Status: $rootScope.searchObj.Status,
                    Object: $rootScope.searchObj.Object,
                    BranchId: $rootScope.searchObj.BranchId,
                    ObjType: $rootScope.searchObj.ObjTypeCode,
                    WorkflowInstCode: $rootScope.searchObj.WorkflowInstCode,
                    TabBoard: TabBoard
                }
                dataserviceTaskManager.getCountCard(data, function (rs) {
                    rs = rs.data;
                    $rootScope.CountCard = rs;
                })
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
        .withOption('serverSide', true)
        //.withOption('scrollY', "62vh")
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (row, data) {
            if (data.BoardType == "BOARD_REGULARLY") {
                $(row).addClass('row-board-regularly');
            }
            else if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $compile(angular.element(row))($scope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    $rootScope.CardCode = data.LmsTaskCode;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderLmsTaskManager + '/add-card-buffer.html',
                        controller: 'edit-cardCardJob',
                        size: '60',
                        keyboard: false,
                        backdrop: 'static',
                        resolve: {
                            para: function () {
                                return data.CardCode;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $rootScope.reloadGridCard();
                        updateNotify();
                    }, function () { });
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;

        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsTaskName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type, full) {
        var LmsTaskName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
        if (full.UpdateTime != null && full.UpdateTime != "" && full.UpdateTime != undefined) {

            var updateText = $filter('date')(full.UpdateTime, 'dd/MM/yyyy HH:mm:ss')
            updateTimeTxt = '<span class="fs9 black">' + caption.CJ_LBL_UPDATE_TIME + ': ' + updateText + '</span>'

            var updated = new Date(full.UpdateTime);
            var currentTime = new Date();
            var diffMsUpdate = (updated - currentTime);
            var diffDayUpdated = Math.floor((diffMsUpdate / 86400000));
            if (diffDayUpdated == -1) {
                var diffHrsUpdate = Math.floor((diffMsUpdate % 86400000) / 3600000);
                if (diffHrsUpdate < 10) {
                    LmsTaskName = '<span style = "color: #9406b7">' + LmsTaskName + '</span>'
                }
            }
        }
        if (full.LmsTaskType != "") {
            workType = '<span class="fs9 mr-1" style="color: #048004;">' + caption.CJ_LBL_WORK_TYPE + ': ' + full.LmsTaskType + '</span>'
        }
        else {
            if (full.StatusName != 'Thẻ rác' && full.StatusName != 'Đóng' && full.StatusName != 'Bị hủy' && full.StatusName != 'Hoàn thành') {
                var created = new Date(full.Deadline);
                var now = new Date();
                var diffMs = (created - now);
                var diffDay = Math.floor((diffMs / 86400000));
                if ((diffDay + 1) < 0) {
                    deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">' + caption.CJ_LBL_TIME_OUT + '</span>';
                } else if ((diffDay + 1) > 0) {
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + (diffDay + 1) + ' ' + caption.CJ_LBL_DAY + '</span>'
                } else {
                    var end = new Date(new Date().setHours(23, 59, 59, 999));
                    var diffMs1 = (end - now);
                    var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                    var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                    deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">' + caption.CJ_LBL_STILL_DATE + ' ' + diffHrs + 'h ' + diffMins + 'p</span>'
                }
            }
        }
        if (full.StatusName == 'Hoàn thành') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                LmsTaskName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_SUCCESS + '</span>' +
                '</div>';
        }
        else if (full.StatusName == 'Đang triển khai') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                '<span> ' + LmsTaskName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger" style="width:95px;">&nbsp;' + caption.CJ_LBL_PENDING + '</span>' +
                '</div>';
        }
        else if (full.StatusName == 'Bị hủy') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                LmsTaskName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning" style="width:95px;">&nbsp;' + caption.CJ_LBL_CANCLE + '</span>' +
                '</div>';
        }
        else if (full.StatusName == 'Mới tạo') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                LmsTaskName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9" style="width:95px;">&nbsp;' + caption.CJ_LBL_CREATE + '</span>' +
                '</div>';
        }
        else if (full.StatusName == 'Thẻ rác') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_TAB_STATUS_TRASH + '</span>' +
                '</div>';
        }
        else if (full.StatusName == 'Đóng') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.LmsTaskCode + ': </span>' +
                LmsTaskName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9" style="width:95px;">&nbsp;' + caption.CJ_MSG_TAB_CLOSE + '</span>' +
                '</div>';
        }
    }).withOption('sClass', 'nowrap wpercent99'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_START" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    /*vm.dtColumns.push(DTColumnBuilder.newColumn('Deadline').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_DEADLINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'text-wrap w50'));*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_END" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user mr5"></i>{{"CJ_COL_CREATE_BY" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoardName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"CJ_LIST_COL_BOARD" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"LMS_COL_CREATE_TIME" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('<div><i class="fa fa-recycle mr5"></i>{{"COM_LIST_COL_ACTION" | translate}}</div>').withOption('sClass', ' dataTable-pr0 nowrap d-flex w100 justify-content-sa').renderWith(function (data, type, full, meta) {
        return '<div class="pr5 text-center"><button title="Sửa" ng-click="edit(\'' + full.LmsTaskCode + '\')" style = "width: 25px; height: 25px; padding: 0px;background: none;border: none; font-size: 20px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit"></i></button><p class="fs8 text-underline">{{"CJ_BTN_EDIT" | translate}}</p></div>' +
            '<div class="text-center"><button title="Xoá" ng-click="delete(' + full.LmsTaskCode + ')" style="width: 25px; height: 25px; padding: 0px;background: none;border: none; font-size: 20px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt"></i></button><p class="fs8 text-underline">{{"COM_BTN_DELETE" | translate}}</p></div>';
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

    $rootScope.reloadGridCard = function () {
        reloadData(true);
    }

    $scope.delete = function (CardID) {
        dataserviceTaskManager.deleteCard(CardID, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData();
                $rootScope.loadWork(false);
            }
        });
    };

    $scope.edit = function (CardCode) {
        $rootScope.CardCode = CardCode;
        $rootScope.titleModalAssign = 3;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-card-buffer.html',
            controller: 'edit-cardCardJob',
            backdrop: 'static',
            size: '60',
            keyboard: false,
            resolve: {
                para: function () {
                    return CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(false);
            $rootScope.reloadWFBoard($rootScope.searchObj.Object);
            updateNotify();
        }, function () { });
    };

    function updateNotify() {
        dataserviceTaskManager.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("countCardWork").innerText = caption.CJ_LBL_YOU_HAVE + " " + rs.CountWork + " " + caption.CJ_LBL_NEW_WORK;
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " " + caption.CJ_LBL_NEW_NOTIFY;
        })
    }
});

app.controller('add-boardCardJob', function ($scope, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTaskManager, $timeout, $filter) {
    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        BoardType: '',
        BeginTimeView: '',
        DeadLineView: '',
        Department: '',
        Branch: ''
    }
    $scope.listColor = [
        {
            Id: 0,
            Check: true,
            BackgroundColor: '#f1f1f1',
            BackgroundImage: '',
        },
        {
            Id: 1,
            Check: false,
            BackgroundColor: '#179da7',
            BackgroundImage: '',
        }, {
            Id: 2,
            Check: false,
            BackgroundColor: '#17a742',
            BackgroundImage: '',
        }, {
            Id: 3,
            Check: false,
            BackgroundColor: 'rgb(14, 220, 222)',
            BackgroundImage: '',
        }, {
            Id: 4,
            Check: false,
            BackgroundColor: 'rgb(255, 156, 25)',
            BackgroundImage: '',
        }, {
            Id: 5,
            Check: false,
            BackgroundColor: 'rgb(26, 219, 91)',
            BackgroundImage: '',
        }, {
            Id: 6,
            Check: false,
            BackgroundColor: 'rgb(255, 92, 161)',
            BackgroundImage: '',
        }]
    $scope.initData = function () {
        dataserviceTaskManager.getBoardsType(function (rs) {
            rs = rs.data;
            $scope.boardType = rs;
            $scope.model.BoardType = rs.length != 0 ? rs[0].Code : '';
        });
        dataserviceTaskManager.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
        })
        dataserviceTaskManager.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
        })
    }
    $scope.initData();
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        if ($scope.editForm.validate()) {
            dataserviceTaskManager.insertBoard($scope.model, function (rs) {
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
        $("#boardStart").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#boardDueDate').datepicker('setStartDate', maxDate);
        });
        $("#boardDueDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#boardStart').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit-boardCardJob', function ($scope, $http, $rootScope, $compile, $uibModal, $uibModalInstance, $filter, dataserviceTaskManager, para) {
    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        Visibility: true,
        TeamCode: '',
        BoardType: ''
    }
    $scope.listColor = [
        {
            Id: 0,
            Check: false,
            BackgroundColor: '#f1f1f1',
            BackgroundImage: '',
        }, {
            Id: 1,
            Check: false,
            BackgroundColor: '#179da7',
            BackgroundImage: '',
        }, {
            Id: 2,
            Check: false,
            BackgroundColor: '#17a742',
            BackgroundImage: '',
        }, {
            Id: 3,
            Check: false,
            BackgroundColor: 'rgb(14, 220, 222)',
            BackgroundImage: '',
        }, {
            Id: 4,
            Check: false,
            BackgroundColor: 'rgb(255, 156, 25)',
            BackgroundImage: '',
        }, {
            Id: 5,
            Check: false,
            BackgroundColor: 'rgb(26, 219, 91)',
            BackgroundImage: '',
        }, {
            Id: 6,
            Check: false,
            BackgroundColor: 'rgb(255, 92, 161)',
            BackgroundImage: '',
        }]

    $scope.initData = function () {
        dataserviceTaskManager.getBoardDetail(para, "", function (rs) {
            rs = rs.data;
            $scope.model = rs;
            //select color
            var selectColor = $scope.listColor.find(function (element) {
                if (element.BackgroundColor == $scope.model.BackgroundColor) return true;
            });
            if (selectColor) {
                selectColor.Check = true;
            }
        });
        dataserviceTaskManager.getBoardsType(function (rs) {
            rs = rs.data;
            $scope.boardType = rs;
        });
        dataserviceTaskManager.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
        })
        dataserviceTaskManager.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
        })
    };
    $scope.initData();
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        if ($scope.editForm.validate()) {
            dataserviceTaskManager.updateBoard($scope.model, function (rs) {
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    function loadDate() {
        $("#boardStart").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#boardDueDate').datepicker('setStartDate', maxDate);
        });
        $("#boardDueDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#boardStart').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add-listCardJob', function ($scope, $http, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceTaskManager, para) {
    $scope.model = {
        ListName: '',
        BoardCode: para
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.submit = function () {
        if ($scope.addformlist.validate()) {
            dataserviceTaskManager.insertList($scope.model, function (rs) {
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

app.controller('add-card-buffer', function ($scope, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTaskManager, $filter, para) {
    $scope.cancel = function () {
        CKEDITOR.removeAllListeners();
        CKEDITOR.instances['description'].removeAllListeners();
        if (!$rootScope.isAddedCard) {
            clearInterval($scope.interval);
            $rootScope.checkList = [];
            $rootScope.lstAssign = [];
            $uibModalInstance.close('cancel');
        }
        else {
            if (!$rootScope.isUpdate) {
                dataserviceTaskManager.removeLockShare($rootScope.CardCode, function (rs) {
                    clearInterval($scope.interval);
                    $rootScope.checkList = [];
                    $rootScope.lstAssign = [];
                    $uibModalInstance.close('cancel');
                })
            }
            else {
                clearInterval($scope.interval);
                $rootScope.checkList = [];
                $rootScope.lstAssign = [];
                $uibModalInstance.close('cancel');
            }
        }
    }

    // color
    $scope.listColor = [
        {
            Id: 0,
            Check: true,
            BackgroundColor: '#f1f1f1',
            BackgroundImage: '',
        },
        {
            Id: 1,
            Check: false,
            BackgroundColor: '#179da7',
            BackgroundImage: '',
        }, {
            Id: 2,
            Check: false,
            BackgroundColor: '#17a742',
            BackgroundImage: '',
        }, {
            Id: 3,
            Check: false,
            BackgroundColor: 'rgb(14, 220, 222)',
            BackgroundImage: '',
        }, {
            Id: 4,
            Check: false,
            BackgroundColor: 'rgb(255, 156, 25)',
            BackgroundImage: '',
        }, {
            Id: 5,
            Check: false,
            BackgroundColor: 'rgb(26, 219, 91)',
            BackgroundImage: '',
        }, {
            Id: 6,
            Check: false,
            BackgroundColor: 'rgb(255, 92, 161)',
            BackgroundImage: '',
        },
        {
            Id: 7,
            Check: false,
            BackgroundColor: '#BDECB6',
            BackgroundImage: '',
        }, {
            Id: 8,
            Check: false,
            BackgroundColor: '#924E7D',
            BackgroundImage: '',
        }, {
            Id: 9,
            Check: false,
            BackgroundColor: '#2F4538',
            BackgroundImage: '',
        }, {
            Id: 10,
            Check: false,
            BackgroundColor: '#5E2129',
            BackgroundImage: '',
        }, {
            Id: 11,
            Check: false,
            BackgroundColor: '#898176',
            BackgroundImage: '',
        },
        {
            Id: 12,
            Check: false,
            BackgroundColor: '#287233',
            BackgroundImage: '',
        }, {
            Id: 13,
            Check: false,
            BackgroundColor: '#C6A664',
            BackgroundImage: '',
        }, {
            Id: 14,
            Check: false,
            BackgroundColor: '#025669',
            BackgroundImage: '',
        }];

    // check List Assign
    $rootScope.isUserInList = false;
    $rootScope.checkUserInList = function () {
        var result = $rootScope.lstAssign.findIndex(x => x.UserId == userId || x.UserId == "ALL");
        if (result != -1) {
            $rootScope.isUserInList = true;
        }
        else {
            $rootScope.isUserInList = false;
        }
    }

    //Declare model angular
    $scope.modelShift = {
        In: '',
        Out: '',
        DateIn: '',
        DateOut: '',
        DateInOut: ''
    };

    $scope.obj = {
        Board: '',
        List: ''
    };

    $scope.model = {
        LmsTaskName: '',
        BeginTime: moment().format('DD/MM/YYYY HH:mm'),
        Deadline: moment().format('DD/MM/YYYY HH:mm'),
        EndTime: '',
        Status: 'CREATED',
        CardLevel: '',
        WorkType: '',
        WeightNum: 0,
        Cost: 0,
        Currency: 'VND',
        ListCode: '',
        Description: ''
    };
    $rootScope.BeginTime = moment();
    //$rootScope.EndTime = moment();

    $scope.modelWF = {
        WorkflowCode: '',
        WfInstCode: '',
        ActInstCode: ''
    };
    //End declare model angualar

    //Declare variable
    $scope.isHideMap = false;

    $rootScope.isAddedCard = false;

    $rootScope.isAceptCard = true;

    $rootScope.IsLock = false;

    $rootScope.isUpdate = false;

    $scope.isSave = true;

    $rootScope.isApprove = true;

    $scope.permissionHeaderCard = true;

    $scope.CardInherit = null;

    $scope.Links = [];

    $rootScope.CardCode = "";

    $rootScope.checklists = [];

    var editor;

    $rootScope.isShowPercentItem = true;
    //End declare variable

    //Declare for rollback card
    $scope.rollBack = {
        ListChkItemRollback: [],
        Comment: [],
        ObjectRela: [],
        Products: [],
        Services: [],
        AddressCard: []
    }

    $scope.ListChkItemRollback = [];

    $scope.rollbackComment = [];

    $scope.rollbackObject = [];

    $scope.rollbackProduct = [];

    $scope.rollbackService = [];

    $scope.rollbackAddress = [];

    $scope.rollbackLinks = [];
    //End declare for rollback card

    //Card title
    $scope.editingCardetailHeaderAuto = function () {
        if ($(".modal-dialog").hasClass("ui-draggable-dragging") == false) {
            $scope.acticeDetailDrag = true;
            var title = document.getElementById("card_000000");
            if (title != null && title != undefined) {
                title.focus()
            }
        } else {
            $scope.acticeDetailDrag = false;
        }
    }
    //End card title

    //Init data
    $scope.activity = [
        {
            Name: "Đã xem",
            Value: 0,
            Date: "",
            Time: "",
            IsCheck: true
        },
        {
            Name: "Từ chối",
            Value: 1,
            Date: "",
            Time: "",
            IsCheck: false
        },
        {
            Name: "Đồng ý",
            Value: 2,
            Date: "",
            Time: "",
            IsCheck: true
        }
    ];

    $scope.initData = function () {
        $rootScope.ActivityData = [];
        $scope.acticeDetailDrag = false;
        $scope.model.LmsTaskType = $rootScope.LmsTaskType;
        dataserviceTaskManager.getListBoard(function (rs) {
            rs = rs.data;
            $scope.listBoards = rs;
        });
        dataserviceTaskManager.getLevels(function (rs) {
            rs = rs.data;
            $scope.CardLevels = rs;
        });
        //dataserviceTaskManager.getWorkType(function (rs) {
        //    rs = rs.data;
        //    $scope.WorkTypes = rs;
        //});
        dataserviceTaskManager.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
        });
        dataserviceTaskManager.getCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        })
        dataserviceTaskManager.getProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataserviceTaskManager.getService(function (rs) {
            rs = rs.data;
            $scope.listService = rs;
        })
        dataserviceTaskManager.getUnit(function (rs) { rs = rs.data; $scope.listUnit = rs });
        dataserviceTaskManager.getActivityService(function (rs) {
            rs = rs.data;
            $scope.listActivityService = rs;
        });
        dataserviceTaskManager.getActivityProduct(function (rs) {
            rs = rs.data;
            $scope.listActivityProduct = rs;
        });
        dataserviceTaskManager.hideCost(function (rs) {
            rs = rs.data;
            $scope.isNotVatco = rs;
        })
        dataserviceTaskManager.getAllShiftOfUser(userName, function (rs) {
            rs = rs.data;
            $scope.listShift = rs;
            if ($scope.listShift.length > 0) {
                $scope.modelShift.ShiftCode = $scope.listShift[0].ShiftCode;
                var inDate = $filter('date')($scope.listShift[0].ChkinTime, 'dd/MM/yyyy')
                var outDate = $filter('date')($scope.listShift[0].ChkoutTime, 'dd/MM/yyyy')
                var inTime = $filter('date')($scope.listShift[0].ChkinTime, 'HH:mm:ss')
                var outTime = $filter('date')($scope.listShift[0].ChkoutTime, 'HH:mm:ss')
                $scope.modelShift.In = inTime;
                $scope.modelShift.Out = outTime;

                $scope.timeCheckIn = $filter('date')($scope.listShift[0].ChkinTime, 'HH:mm:ss dd/MM/yyyy');
                $scope.timeCheckOut = $filter('date')($scope.listShift[0].ChkoutTime, 'HH:mm:ss dd/MM/yyyy');

                if (inDate != outDate && outDate != null) {
                    $scope.modelShift.DateIn = inDate;
                    $scope.modelShift.DateOut = outDate;
                    $scope.isSameDate = false;
                } else {
                    $scope.modelShift.DateInOut = inDate;
                    $scope.isSameDate = true;
                }
            }
        })
        dataserviceTaskManager.getListDefault($rootScope.boardCode, function (rs) {
            rs = rs.data;
            $scope.obj.Board = rs.BoardCode;
            $scope.obj.List = rs.ListCode;
            $scope.model.ListCode = rs.ListCode;

            if ($scope.obj.Board != "" && $scope.obj.Board != null && $scope.obj.Board != undefined) {
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
            }
        })
        setTimeout(function () {
            $scope.editingCardetailHeaderAuto();

        }, 400)
    }

    $scope.initData();
    //End init data

    //Rollback info card and more
    $scope.rollbackCard = function () {
        debugger
        //$scope.rollBack.CardHeader = $scope.model;
        $scope.rollBack.ListChkItemRollback = $scope.ListChkItemRollback;
        $scope.rollBack.Comment = $scope.rollbackComment;
        $scope.rollBack.ObjectRela = $scope.rollbackObject;
        $scope.rollBack.Products = $scope.rollbackProduct;
        $scope.rollBack.Services = $scope.rollbackService;
        dataserviceTaskManager.rollbackInfoCard($scope.rollBack, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                loadNewData();
            }
        })
    }
    //End rollback info card and more

    //Board, list select 
    $scope.boardSelect = function (boardCode) {
        if ($scope.obj.Board == "") {
            $scope.errorBoard = true;
        }
        else {
            $scope.errorBoard = false;
        }
        $scope.obj.List = "";
        $scope.model.ListCode = "";
        dataserviceTaskManager.getLists(boardCode, function (rs) {
            rs = rs.data;
            $scope.Lists = rs;
        });
    };

    $scope.listSelect = function (listCode) {
        if ($scope.obj.List == "") {
            $scope.errorList = true;
        }
        else {
            $scope.errorList = false;
            $scope.model.ListCode = listCode;
            if ($rootScope.isAddedCard) {
                dataserviceTaskManager.updateListReal($rootScope.CardCode, $scope.model.ListCode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        $scope.model.ListCode = "";
                        $scope.obj.List = "";
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.completeBoard = rs.Object.PercentBoard;
                        $scope.completeList = rs.Object.PercentList;
                    }
                })
            }
        }
    };
    //End select board, list

    //Insert card
    $scope.saveBuffer = function () {
        var element = $('#card_000000');
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        if (newName != currentName) {
            $scope.model.LmsTaskName = newName;
            newName = "";
        }
        $scope.acticeDetailDrag = false;

        var check = CKEDITOR.instances['description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['description'].getData();
            $scope.model.Description = data;
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.model.LmsTaskName.trim() == "") {
                return App.toastrError(caption.CJ_MSG_PLS_ENTER_TITILE);
            }
            var selectColor = $scope.listColor.find(function (element) {
                if (element.Check == true) return true;
            });
            if (selectColor) {
                $scope.model.BackgroundColor = selectColor.BackgroundColor;
                $scope.model.BackgroundImage = selectColor.BackgroundImage;
            }

            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });

            if (!$rootScope.isAddedCard) {
                dataserviceTaskManager.insertCardNew($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        App.unblockUI("#modal-body");
                    }
                    else {
                        $rootScope.isAddedCard = true;
                        $rootScope.CardCode = rs.Object;
                        $scope.cardCode = rs.Object;
                        App.toastrSuccess(rs.Title)

                        //Copy data using to rollback
                        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            if (!rs.Error) {
                                $scope.model = rs.Object.CardDetail;
                                $scope.cardCode = $scope.model.CardCode;
                                $scope.cardName = $scope.model.LmsTaskName;
                                $rootScope.Inherit = $scope.model.Inherit;
                                $scope.obj.Board = rs.Object.Board;
                                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                                $rootScope.IsLock = $scope.model.IsLock;
                                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                                    rs = rs.data;
                                    $scope.Lists = rs;
                                });
                                $scope.obj.List = rs.Object.List;
                                $scope.CompletedOld = $scope.model.Completed;
                                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                                        $scope.isAssign = false;
                                    } else {
                                        $scope.isAssign = true;
                                    }
                                }
                                $rootScope.settingNotification = rs.Object.Notification;
                                $scope.currentUser = rs.Object.CurrenUser;
                                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                                $scope.completeBoard = rs.Object.BoardCompleted;
                                $scope.completeList = rs.Object.ListCompleted;
                                //Copy data using to rollback
                                $scope.rollBack.CardHeader = angular.copy($scope.model);
                                //End copy data using to rollback

                                setTimeout(function () {
                                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                                }, 100);
                            }
                        });

                        //End copy data using to rollback

                        dataserviceTaskManager.updateActivity(rs.Object, 2, true, function (rs) {
                            rs = rs.data;
                            dataserviceTaskManager.getCardDetail($scope.cardCode, function (rs) {
                                rs = rs.data;
                                if (!rs.Error) {
                                    $scope.model = rs.Object.CardDetail;

                                    $scope.descriptionOld = angular.copy($scope.model.Description);

                                    if ($scope.model.Status == "CLOSED") {
                                        $scope.isClose = true;
                                    } else {
                                        $scope.isClose = false;
                                    }
                                    $scope.CompletedOld = $scope.model.Completed;
                                    if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {

                                        if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                                            $scope.isAssign = false;
                                        } else {
                                            $scope.isAssign = true;
                                        }
                                    }
                                    $rootScope.settingNotification = rs.Object.Notification;
                                    $scope.currentUser = rs.Object.CurrenUser;
                                    $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                                    $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                                    $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                                    $scope.completeBoard = rs.Object.BoardCompleted;
                                    $scope.completeList = rs.Object.ListCompleted;
                                    dataserviceTaskManager.roleInCardOfUser($scope.cardCode, function (rs) {
                                        rs = rs.data;
                                        $scope.RoleUser = rs.Responsibility;

                                        if ($scope.RoleUser == "ROLE_LEADER") {
                                            $scope.isNotLeader = false;
                                        }
                                        if ($scope.isNotLeader && $scope.isClose) {
                                            $scope.isDisableStatus = true;
                                            $scope.isDisableControl = true;
                                        } else if (!$scope.isNotLeader && $scope.isClose) {
                                            $scope.isDisableStatus = false;
                                            $scope.isDisableControl = true;
                                        } else {
                                            $scope.isDisableStatus = false;
                                            $scope.isDisableControl = false;
                                        }
                                    })
                                    setTimeout(function () {
                                        validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                                    }, 100);
                                }
                            });
                        });
                        dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.comments = rs;
                        });
                        //$rootScope.getLogActivity();
                        $rootScope.reloadFile();
                        $rootScope.listCardJobLink = [];
                        clearInterval($scope.interval);
                        $scope.interval = setInterval(sessionCard, 3000);
                        App.unblockUI("#modal-body");
                    }
                })
            }
        }
    }

    $scope.update = function () {
        if (!$rootScope.isUpdate) {
            return;
        }
        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs.Object.CardDetail;
                editor.setData($scope.model.Description);
                $scope.cardCode = $scope.model.CardCode;
                $scope.cardName = $scope.model.CardName;
                $scope.obj.Board = rs.Object.Board;
                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                $rootScope.IsLock = $scope.model.IsLock;
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
                $scope.obj.List = rs.Object.List;
                $scope.CompletedOld = $scope.model.Completed;
                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                    if ($scope.model.CreatedBy == userName) {
                        $scope.isAssign = false;
                    }
                    else if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                        $scope.isAssign = false;
                    } else {
                        $scope.isAssign = true;
                    }
                }
                $rootScope.settingNotification = rs.Object.Notification;
                $scope.currentUser = rs.Object.CurrenUser;
                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                $scope.completeBoard = rs.Object.BoardCompleted;
                $scope.completeList = rs.Object.ListCompleted;
                dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $scope.RoleUser = rs.Responsibility;

                    if ($scope.RoleUser == "ROLE_LEADER") {
                        $scope.isNotLeader = false;
                    }
                    if ($scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = true;
                        $scope.isDisableControl = true;
                    } else if (!$scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = true;
                    } else {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = false;
                    }
                })

                setTimeout(function () {
                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                }, 100);
            }
        });
        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.activity = rs;
            if ($scope.activity.length > 0) {
                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                    $rootScope.isAceptCard = true;
                } else {
                    $rootScope.isAceptCard = false;
                }
            }
        });
        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.ActivityData = rs;
            if ($rootScope.ActivityData.length > 0) {
                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                    }
                }
            }
        });
        dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.comments = rs;
        });
        dataserviceTaskManager.GetLisAddressJobCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listAddress = rs;
        });
        dataserviceTaskManager.getObjectRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listID = [];
            $rootScope.listObjRelative = rs;
            for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                $rootScope.listID.push($scope.listObjRelative[i].ID);
            }
        });
        dataserviceTaskManager.getCardProduct($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.listCardProduct = rs;
        });
        dataserviceTaskManager.getCardService($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.listCardService = rs;
        });
        dataserviceTaskManager.permissionHeaderCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.hasPermissionHeaderCard = rs;
        })
        $rootScope.reloadFile();
    }

    //Update directly
    $scope.changeData = function (selectType, value) {
        if (!$rootScope.isAddedCard) {
            return;
        }
        else if ($rootScope.IsLock) {
            return;
        }
        if (selectType == "BeginTime") {
            updateBeginTime();
        }
        else if (selectType == "CardName") {
            updateCardName();
        }
        else if (selectType == "Deadline") {
            updateDeadline();
        }
        else if (selectType == "EndTime") {
            updateEndTime();
        }
        else if (selectType == "Color") {

        }
        else if (selectType == "Status") {
            updateStatus();
        }
        else if (selectType == "CardLevel") {
            updateCardLevel();
        }
        else if (selectType == "WorkType") {
            updateWorkType();
        }
        else if (selectType == "WeightNum") {
            updateWeightNum();
        }
        else if (selectType == "Cost") {

        }
        else if (selectType == "Currency") {

        }
    }

    function updateCardName() {
        var element = $('#card_000000');
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        if (newName != currentName) {
            $scope.model.CardName = newName;
            if ($scope.model.CardName.trim() == "" || $scope.model.CardName == undefined || $scope.model.CardName == null) {
                return;
            }
            dataserviceTaskManager.updateCardNameReal($rootScope.CardCode, $scope.model.CardName, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title)
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.getLogActivity();
                }
            })
        }
    }

    function updateBeginTime() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        $rootScope.BeginTime = $scope.model.BeginTime;
        dataserviceTaskManager.updateCardBegintimeReal($rootScope.CardCode, $scope.model.BeginTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateDeadline() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        dataserviceTaskManager.updateCardDeadlineReal($rootScope.CardCode, $scope.model.Deadline, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateEndTime() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        $rootScope.EndTime = $scope.model.EndTime;
        dataserviceTaskManager.updateCardEndtimeReal($rootScope.CardCode, $scope.model.EndTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateStatus() {
        dataserviceTaskManager.updateCardStatusReal($rootScope.CardCode, $scope.model.Status, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateCardLevel() {
        dataserviceTaskManager.updateCardLevelReal($rootScope.CardCode, $scope.model.CardLevel, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateWorkType() {
        dataserviceTaskManager.updateCardWorkTypeReal($rootScope.CardCode, $scope.model.WorkType, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateWeightNum() {
        dataserviceTaskManager.updateWeightNumReal($rootScope.CardCode, $scope.model.WeightNum, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.completeBoard = rs.Object.PercentBoard;
                $scope.completeList = rs.Object.PercentList;
                $rootScope.getLogActivity();
            }
        })
    }

    function updateDescription() {
        debugger
        if (!$rootScope.isAddedCard) {
            return;
        }
        else if ($rootScope.IsLock) {
            return;
        }
        var check = CKEDITOR.instances['description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['description'].getData();
            if ($scope.model.Description !== data) {
                $scope.model.Description = data;

                var data = { CardCode: $rootScope.CardCode, Description: $scope.model.Description };

                dataserviceTaskManager.updateDescriptionReal(data, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.getLogActivity();
                    }
                })
            }
        }

    }

    CKEDITOR.on('instanceReady', function (evt) {
        var editor = evt.editor,
            body = CKEDITOR.document.getBody();
        editor.on('focus', function () {
        });

        editor.on('blur', function () {
            updateDescription();
        });
    });
    //End update directly

    function sessionCard() {
        //dataserviceTaskManager.isUpdateNewData($rootScope.CardCode, $rootScope.timeUpdate, function (rs) {
        //    rs = rs.data;
        //    if (rs) {
        //        loadNewData();
        //        $rootScope.timeUpdate = moment().add(1, 'minute').format("DD/MM/YYYY HH:mm");
        //    }
        //})
    }

    function loadNewData() {
        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs.Object.CardDetail;
                $scope.cardCode = $scope.model.CardCode;
                editor.setData($scope.model.Description);
                $scope.cardName = $scope.model.CardName;
                $rootScope.Inherit = $scope.model.Inherit;
                $scope.obj.Board = rs.Object.Board;
                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                $rootScope.IsLock = $scope.model.IsLock;
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
                $scope.obj.List = rs.Object.List;
                debugger
                var element = document.getElementById("card_000000");
                element.setAttribute('data-currentvalue', $scope.cardName);
                element.setAttribute('value', $scope.cardName);
                element.value = $scope.cardName;

                $scope.CompletedOld = $scope.model.Completed;
                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                        $scope.isAssign = false;
                    } else {
                        $scope.isAssign = true;
                    }
                }
                $rootScope.settingNotification = rs.Object.Notification;
                $scope.currentUser = rs.Object.CurrenUser;
                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                $scope.completeBoard = rs.Object.BoardCompleted;
                $scope.completeList = rs.Object.ListCompleted;
                dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $scope.RoleUser = rs.Responsibility;

                    if ($scope.RoleUser == "ROLE_LEADER") {
                        $scope.isNotLeader = false;
                    }
                    if ($scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = true;
                        $scope.isDisableControl = true;
                    } else if (!$scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = true;
                    } else {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = false;
                    }
                })

                $scope.disableCkEditer(editor);
                setTimeout(function () {
                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                }, 100);
            }
        });
        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.activity = rs;
            if ($scope.activity.length > 0) {
                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                    $rootScope.isAceptCard = true;
                } else {
                    $rootScope.isAceptCard = false;
                }
            }
        });
        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.ActivityData = rs;
            if ($rootScope.ActivityData.length > 0) {
                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                    }
                }
            }
        });
        dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.comments = rs;
        });
        dataserviceTaskManager.GetLisAddressJobCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listAddress = rs;
        });
        dataserviceTaskManager.getObjectRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listID = [];
            $rootScope.listObjRelative = rs;
            for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                $rootScope.listID.push($scope.listObjRelative[i].ID);
            }
        });
        dataserviceTaskManager.getCardProduct($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardProduct = rs;
        });
        dataserviceTaskManager.getCardService($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardService = rs;
        });
        dataserviceTaskManager.permissionHeaderCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.permissionHeaderCard = rs;
        })
        dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (rs.Responsibility === "ROLE_LEADER") {
                $rootScope.isApprove = true;
            }
            else {
                $rootScope.isApprove = false;
            }
        })
        dataserviceTaskManager.getCardRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;

            $scope.CardInherit = rs.Inherit;
            $scope.Links = rs.Links;
        })
        dataserviceTaskManager.insertListUserView($rootScope.CardCode, function (rs) { })
        dataserviceTaskManager.getDataLoggerCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listData = rs;
        });

        $rootScope.reloadFile();
        $rootScope.getLogActivity();
    }

    //End insert card

    //Start date
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            dateFormat: "dd/mm/yyyy hh:ii",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#deadline').datetimepicker('setStartDate', maxDate);
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            var maxDate = new Date(selected.date.valueOf());
            if ($scope.model.EndTime != "") {
                const [day, month, year] = $scope.model.EndTime.split("/")
                var endTime = new Date(year, month - 1, day)
                if (maxDate > endTime) {
                    $('#startDate').datetimepicker('setEndDate', endTime);
                }
                else {
                    $('#startDate').datetimepicker('setEndDate', maxDate);
                }
            }
            else {
                $('#startDate').datetimepicker('setEndDate', maxDate);
            }
        });
        //$("#deadline").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {

        //    var maxDate = new Date(selected.date.valueOf());
        //    if ($scope.model.EndTime != "") {
        //        const [day, month, year] = $scope.model.EndTime.split("/")
        //        var endTime = new Date(year, month - 1, day)
        //        if (maxDate > endTime) {
        //            $('#startDate').datepicker('setEndDate', endTime);
        //        }
        //        else {
        //            $('#startDate').datepicker('setEndDate', maxDate);
        //        }
        //    }
        //    else {
        //        $('#startDate').datepicker('setEndDate', maxDate);
        //    }
        //});
    }

    function validateDefaultDate(startDate, endDate, deadline) {
        //setStartDate("#endDate", startDate);
        //setStartDate("#deadline", startDate);
        ////setEndDate
        //const [dayDead, monthDead, yearDeal] = deadline.split("/")
        //var deadTime = new Date(yearDeal, monthDead - 1, dayDead)
        //if (endDate != "") {
        //    const [day, month, year] = endDate.split("/")
        //    var endTime = new Date(year, month - 1, day)
        //    if (endTime > deadTime) {
        //        setEndDate("#startDate", deadline)
        //    }
        //    else {
        //        setEndDate("#startDate", endDate)
        //    }
        //}
        //else {
        //    setEndDate("#startDate", deadline)
        //}
    }
    //End date

    //Editor

    function ckEditer() {
        editor = CKEDITOR.replace('description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['description'].config.height = 360;
        //setTimeout(function () {
        //    $scope.disableCkEditer(editor);
        //}, 1000);
    }

    $scope.disableCkEditer = function (editor) {

        if (!$rootScope.isAceptCard || $rootScope.IsLock) {
            editor.setReadOnly(true);
        } else {
            editor.setReadOnly(false);
        }
    }
    //End editor

    //View tab
    $scope.idxViewTab = 1;
    $scope.viewTab = function (index) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        $scope.idxViewTab = index;
    }
    //Edn view tab

    //Add member
    $scope.addMember = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        $rootScope.titleModalAssign = 3;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-group-or-team.html',
            controller: 'add-group-or-teamCardJob',
            size: '60',
            resolve: {
                obj: function () {
                    return {
                        CardCode: $scope.cardCode,
                        Type: 4
                    };
                }
            },
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {
            //dataserviceTaskManager.getActivityAssign($scope.cardCode, function (rs) {
            //    rs = rs.data;
            //    $rootScope.ActivityData = rs;
            //    if ($rootScope.ActivityData.length > 0) {
            //        for (var i = 0; i < $rootScope.ActivityData.length; i++) {
            //            if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
            //                $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
            //            }
            //        }
            //    }
            //});
            //dataserviceTaskManager.getGroupDepartmentAssign($scope.cardCode, function (rs) {
            //    rs = rs.data;
            //    $scope.lstGrpAssign = rs.Group
            //    $scope.lstDpmAssign = rs.Dpm
            //});
        }, function () {
        });
    };
    //End add member

    //Send notifi
    $scope.sendNotifi = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/send-notifi-card.html',
            controller: 'send-notifi-card',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End send notification

    //Log status
    $scope.viewLogStatus = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/view-status-log.html',
            controller: 'log-status',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End log status

    //Log workflow
    $scope.viewLogWF = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/log-activity-wf.html',
            controller: 'log-activity-wf',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    var obj = { WfCode: $scope.model.WorkflowCode, CardCode: $rootScope.CardCode };
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    //End

    //Show log accept, reject
    $scope.showLogActivity = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/log-user-activity.html',
            controller: 'log-user-activity',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End

    //Update activity
    $scope.updateActivity = function (value, isCheck) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        if (isCheck) {
            var activity = $scope.activity.find(function (element) {
                if (element.Value != value && element.Value != 0) return true;
            });
            if (activity) {
                activity.IsCheck = false;
            }
            if (value == 2 && isCheck) {
                $rootScope.isAceptCard = true;
                if ($scope.model.Status != "START") {
                    dataserviceTaskManager.changeCardStatus($rootScope.CardCode, "START", function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
                                rs = rs.data;
                                if (!rs.Error) {
                                    $scope.model = rs.Object.CardDetail;
                                    $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                                    $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                                    $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                                }
                            })
                        }
                    });
                }
                dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $scope.activity = rs;
                            if ($scope.activity.length > 0) {
                                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                    $rootScope.isAceptCard = true;
                                } else {
                                    $rootScope.isAceptCard = false;
                                }
                            }
                        });
                        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.ActivityData = rs;
                            if ($rootScope.ActivityData.length > 0) {
                                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            else if (value == 1 && isCheck) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsTaskManager + '/add-reason-reject.html',
                    controller: 'add-reason-reject',
                    backdrop: 'static',
                    size: '25',
                    keyboard: false,
                    windowClass: "modal-position",
                    resolve: {
                        para: function () {
                            return {
                                Value: value,
                                CardCode: $rootScope.CardCode
                            };
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.activity = rs;
                        if ($scope.activity.length > 0) {
                            if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                $rootScope.isAceptCard = true;
                            } else {
                                $rootScope.isAceptCard = false;
                            }
                        }
                    });
                    $rootScope.getLogActivity();
                }, function () { });
            }
            else {
                $rootScope.isAceptCard = false;
                dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $scope.activity = rs;
                            if ($scope.activity.length > 0) {
                                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                    $rootScope.isAceptCard = true;
                                } else {
                                    $rootScope.isAceptCard = false;
                                }
                            }
                        });
                        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.ActivityData = rs;
                            if ($rootScope.ActivityData.length > 0) {
                                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            $scope.disableCkEditer(editor);
        }
        else {
            $rootScope.isAceptCard = false;
            dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                    dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.activity = rs;
                        if ($scope.activity.length > 0) {
                            if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                $rootScope.isAceptCard = true;
                            } else {
                                $rootScope.isAceptCard = false;
                            }
                        }
                    });
                    dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.ActivityData = rs;
                        if ($rootScope.ActivityData.length > 0) {
                            for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                    $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                }
                            }
                        }
                    });
                }
            });
        }
    }
    //end

    //Start validate
    $scope.changeSelect = function (selectType, item) {
        if (selectType === "Status") {
            if ($scope.model.Status == "") {
                $scope.errorStatus = true;
            }
            else {
                $scope.errorStatus = false;
            }
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        if (data.WfType == "") {
            $scope.errorWfType = true;
            mess.Status = true;
        } else {
            $scope.errorWfType = false;
        }

        return mess;
    };
    //End validate

    //Show hide content
    $scope.showPanelRight = true;
    $scope.showInfoHeader = true;

    //End show hide content

    //Start add common
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
            //dataserviceTaskManager.getWorkType(function (rs) {
            //    rs = rs.data;
            //    $scope.WorkTypes = rs;
            //});
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
            dataserviceTaskManager.getLevels(function (rs) {
                rs = rs.data;
                $scope.CardLevels = rs;
            });
        }, function () { });
    }

    $scope.addProductActivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'JC_ACTIVITY_PRODUCT',
                        GroupNote: 'Hoạt động sản phẩm',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getActivityProduct(function (rs) {
                rs = rs.data;
                $scope.listActivityProduct = rs;
            })
        }, function () { });
    }

    $scope.addSeriveActivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'JC_ACTIVITY_SERVICE',
                        GroupNote: 'Hoạt động dịch vụ',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getActivityService(function (rs) {
                rs = rs.data;
                $scope.listActivityService = rs;
            });
        }, function () { });
    }
    //End add common

    //Lock card
    $scope.lockCard = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        var value = false;
        if (!$scope.model.IsLock) {
            value = true;
        }
        dataserviceTaskManager.lockCard($rootScope.CardCode, value, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        $scope.model = rs.Object.CardDetail;
                        $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                        $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                        $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                        //$scope.updateCardName("card_000000");
                        setTimeout(function () {
                            $scope.disableCkEditer(editor);
                            validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                        }, 500);
                    }
                });
                if (value) {
                    $rootScope.IsLock = true;
                }
                else {
                    $rootScope.IsLock = false;
                }
            }
        })
    }
    //End

    // color
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    //End

    setTimeout(function () {
        ckEditer();
        loadDate();
        //validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline);
        setModalDraggable(".modal-dialog");
    }, 400);
});

app.controller('edit-cardCardJob', function ($scope, $http, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTaskManager, $filter, para) {
    $scope.cancel = function () {
        CKEDITOR.removeAllListeners();
        CKEDITOR.instances['description'].removeAllListeners();
        if (!$rootScope.isAddedCard) {
            $rootScope.checkList = [];
            $rootScope.lstAssign = [];
            clearInterval($scope.interval);
            $uibModalInstance.close('cancel');
        }
        else {
            clearInterval($scope.interval);
            $rootScope.checkList = [];
            $rootScope.lstAssign = [];
            $uibModalInstance.close('cancel');
        }
    }

    //Declare model angular
    $scope.modelShift = {
        In: '',
        Out: '',
        DateIn: '',
        DateOut: '',
        DateInOut: ''
    };

    $scope.obj = {
        Board: '',
        List: ''
    };

    $scope.model = {
        LmsTaskName: '',
        BeginTime: '',
        Deadline: '',
        EndTime: '',
        Status: '',
        CardLevel: '',
        WorkType: '',
        WeightNum: 0,
        Cost: 0,
        Currency: 'VND',
        ListCode: '',
        Description: ''
    };

    $scope.modelWF = {
        WorkflowCode: '',
        WfInstCode: '',
        ActInstCode: ''
    };
    //End declare model angualar

    // color
    $scope.listColor = [
        {
            Id: 0,
            Check: true,
            BackgroundColor: '#f1f1f1',
            BackgroundImage: '',
        },
        {
            Id: 1,
            Check: false,
            BackgroundColor: '#179da7',
            BackgroundImage: '',
        }, {
            Id: 2,
            Check: false,
            BackgroundColor: '#17a742',
            BackgroundImage: '',
        }, {
            Id: 3,
            Check: false,
            BackgroundColor: 'rgb(14, 220, 222)',
            BackgroundImage: '',
        }, {
            Id: 4,
            Check: false,
            BackgroundColor: 'rgb(255, 156, 25)',
            BackgroundImage: '',
        }, {
            Id: 5,
            Check: false,
            BackgroundColor: 'rgb(26, 219, 91)',
            BackgroundImage: '',
        }, {
            Id: 6,
            Check: false,
            BackgroundColor: 'rgb(255, 92, 161)',
            BackgroundImage: '',
        },
        {
            Id: 7,
            Check: false,
            BackgroundColor: '#BDECB6',
            BackgroundImage: '',
        }, {
            Id: 8,
            Check: false,
            BackgroundColor: '#924E7D',
            BackgroundImage: '',
        }, {
            Id: 9,
            Check: false,
            BackgroundColor: '#2F4538',
            BackgroundImage: '',
        }, {
            Id: 10,
            Check: false,
            BackgroundColor: '#5E2129',
            BackgroundImage: '',
        }, {
            Id: 11,
            Check: false,
            BackgroundColor: '#898176',
            BackgroundImage: '',
        },
        {
            Id: 12,
            Check: false,
            BackgroundColor: '#287233',
            BackgroundImage: '',
        }, {
            Id: 13,
            Check: false,
            BackgroundColor: '#C6A664',
            BackgroundImage: '',
        }, {
            Id: 14,
            Check: false,
            BackgroundColor: '#025669',
            BackgroundImage: '',
        }];

    // check List Assign
    $rootScope.isUserInList = false;
    $rootScope.checkUserInList = function () {
        var result = $rootScope.lstAssign.findIndex(x => x.UserId == userId || x.UserId == "ALL");
        if (result != -1) {
            $rootScope.isUserInList = true;
        }
        else {
            $rootScope.isUserInList = false;
        }
    }

    //Declare variable
    $scope.isHideMap = false;

    $rootScope.isAddedCard = true;

    $rootScope.isAceptCard = true;

    $rootScope.IsLock = false;

    $rootScope.isUpdate = false;

    $scope.isSave = true;

    $rootScope.statusItem = [];

    $scope.lstGrpAssign = [];

    $scope.lstDpmAssign = [];

    $rootScope.isViewLog = false;

    var editor;

    $rootScope.isShowPercentItem = true;
    //End declare variable

    //Declare for rollback card
    $scope.rollBack = {
        ListChkItemRollback: [],
        Comment: [],
        ObjectRela: [],
        Products: [],
        Services: [],
        AddressCard: [],
        CardLinks: []
    }

    $scope.ListChkItemRollback = [];

    $scope.rollbackComment = [];

    $scope.rollbackObject = [];

    $scope.rollbackProduct = [];

    $scope.rollbackService = [];

    $scope.rollbackAddress = [];

    $scope.rollbackLinks = [];

    //End declare for rollback card

    //Show hide content
    $scope.showInfoHeader = true;

    //End show hide content

    //Card title
    $scope.editingCardetailHeaderAuto = function () {
        if ($(".modal-dialog").hasClass("ui-draggable-dragging") == false) {
            $scope.acticeDetailDrag = true;
            var title = document.getElementById("card_000000");
            if (title != null && title != undefined) {
                title.focus()
            }
        } else {
            $scope.acticeDetailDrag = false;
        }
    }
    //End card title

    $scope.initData = function () {
        $rootScope.timeUpdate = moment().format("DD/MM/YYYY HH:mm");
        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs.Object.CardDetail;
                $scope.cardCode = $scope.model.CardCode;
                $scope.cardName = $scope.model.LmsTaskName;
                $rootScope.Inherit = $scope.model.Inherit;
                $scope.obj.Board = rs.Object.Board;
                debugger
                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;

                $rootScope.IsLock = $scope.model.IsLock;
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
                $scope.obj.List = rs.Object.List;
                $scope.CompletedOld = $scope.model.Completed;
                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                        $scope.isAssign = false;
                    } else {
                        $scope.isAssign = true;
                    }
                }
                if ($scope.model.LmsItemList != null && $scope.model.LmsItemList != "" && $scope.model.LmsItemList != undefined) {
                    try {
                        $rootScope.checkList = JSON.parse($scope.model.LmsItemList);
                        console.log($rootScope.checkList.length);
                    } catch (e) {
                        $rootScope.checkList = [];
                        console.log(e);
                    }
                }
                if ($scope.model.LmsUserList != null && $scope.model.LmsUserList != "" && $scope.model.LmsUserList != undefined) {
                    try {
                        $rootScope.lstAssign = JSON.parse($scope.model.LmsUserList);
                        console.log($rootScope.lstAssign.length);
                    } catch (e) {
                        $rootScope.lstAssign = [];
                        console.log(e);
                    }
                    $rootScope.checkUserInList();
                }
                $rootScope.settingNotification = rs.Object.Notification;
                $scope.currentUser = rs.Object.CurrenUser;
                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                $rootScope.BeginTime = $scope.model.BeginTime;
                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                $rootScope.EndTime = $scope.model.EndTime;
                $scope.completeBoard = rs.Object.BoardCompleted;
                $scope.completeList = rs.Object.ListCompleted;
                dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $scope.RoleUser = rs.Responsibility;

                    if ($scope.RoleUser == "ROLE_LEADER") {
                        $scope.isNotLeader = false;
                    }
                    if ($scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = true;
                        $scope.isDisableControl = true;
                    } else if (!$scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = true;
                    } else {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = false;
                    }
                })

                //Copy data using to rollback
                $scope.rollBack.CardHeader = angular.copy($scope.model);
                //End copy data using to rollback

                setTimeout(function () {
                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                }, 100);
            }
        });
        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.activity = rs;
            if ($scope.activity.length > 0) {
                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                    $rootScope.isAceptCard = true;
                } else {
                    $rootScope.isAceptCard = false;
                }
            }
        });
        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.ActivityData = rs;
            if ($rootScope.ActivityData.length > 0) {
                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                    }
                }
            }
        });
        dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.comments = rs;
            $scope.rollbackComment = angular.copy($rootScope.comments);
        });
        dataserviceTaskManager.GetLisAddressJobCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listAddress = rs;
            $scope.rollbackAddress = angular.copy($rootScope.listAddress);
        });
        dataserviceTaskManager.getObjectRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listID = [];
            $rootScope.listObjRelative = rs;
            for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                $rootScope.listID.push($scope.listObjRelative[i].ID);
            }
            $scope.rollbackObject = angular.copy($rootScope.listID);
        });
        dataserviceTaskManager.getCardProduct($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardProduct = rs;
            $scope.rollbackProduct = angular.copy($rootScope.listCardProduct);
        });
        dataserviceTaskManager.getCardService($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardService = rs;
            $scope.rollbackService = angular.copy($rootScope.listCardService);
        });
        dataserviceTaskManager.permissionHeaderCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.permissionHeaderCard = rs;
        })
        dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (rs.Responsibility === "ROLE_LEADER") {
                $rootScope.isApprove = true;
            }
            else {
                $rootScope.isApprove = false;
            }
        })
        dataserviceTaskManager.getGroupDepartmentAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.lstGrpAssign = rs.Group
            $scope.lstDpmAssign = rs.Dpm
        });
        var data = {
            cardCode: $rootScope.CardCode,
        }

        dataserviceTaskManager.getListLinkCardJob(data, function (rs) {
            rs = rs.data;
            $rootScope.listCardJobLink = rs;
            $scope.rollbackLinks = angular.copy($rootScope.listCardJobLink);
        })

        dataserviceTaskManager.insertListUserView($rootScope.CardCode, function (rs) { })
        dataserviceTaskManager.autoUpdateLockShareJson($rootScope.CardCode, function (rs) { })

        $scope.acticeDetailDrag = false;
        dataserviceTaskManager.getListBoard(function (rs) {
            rs = rs.data;
            $scope.listBoards = rs;
        });
        dataserviceTaskManager.getLevels(function (rs) {
            rs = rs.data;
            $scope.CardLevels = rs;
        });
        //dataserviceTaskManager.getWorkType(function (rs) {
        //    rs = rs.data;
        //    $scope.WorkTypes = rs;
        //});
        dataserviceTaskManager.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
        });
        dataserviceTaskManager.getCurrency(function (rs) {
            rs = rs.data;
            $scope.listCurrency = rs;
        })
        dataserviceTaskManager.getProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataserviceTaskManager.getService(function (rs) {
            rs = rs.data;
            $scope.listService = rs;
        })
        dataserviceTaskManager.getUnit(function (rs) { rs = rs.data; $scope.listUnit = rs });
        dataserviceTaskManager.getActivityService(function (rs) {
            rs = rs.data;
            $scope.listActivityService = rs;
        });
        dataserviceTaskManager.getActivityProduct(function (rs) {
            rs = rs.data;
            $scope.listActivityProduct = rs;
        });
        dataserviceTaskManager.hideCost(function (rs) {
            rs = rs.data;
            $scope.isNotVatco = rs;
        })
        dataserviceTaskManager.getAllShiftOfUser(userName, function (rs) {
            rs = rs.data;
            $scope.listShift = rs;
            if ($scope.listShift.length > 0) {
                $scope.modelShift.ShiftCode = $scope.listShift[0].ShiftCode;
                var inDate = $filter('date')($scope.listShift[0].ChkinTime, 'dd/MM/yyyy')
                var outDate = $filter('date')($scope.listShift[0].ChkoutTime, 'dd/MM/yyyy')
                var inTime = $filter('date')($scope.listShift[0].ChkinTime, 'HH:mm:ss')
                var outTime = $filter('date')($scope.listShift[0].ChkoutTime, 'HH:mm:ss')
                $scope.modelShift.In = inTime;
                $scope.modelShift.Out = outTime;

                $scope.timeCheckIn = $filter('date')($scope.listShift[0].ChkinTime, 'HH:mm:ss dd/MM/yyyy');
                $scope.timeCheckOut = $filter('date')($scope.listShift[0].ChkoutTime, 'HH:mm:ss dd/MM/yyyy');

                if (inDate != outDate && outDate != null) {
                    $scope.modelShift.DateIn = inDate;
                    $scope.modelShift.DateOut = outDate;
                    $scope.isSameDate = false;
                } else {
                    $scope.modelShift.DateInOut = inDate;
                    $scope.isSameDate = true;
                }
            }
        })
        $scope.interval = setInterval(sessionCard, 3000);
        setTimeout(function () {
            $scope.editingCardetailHeaderAuto();
        }, 200)
    }

    $scope.initData();

    //Rollback info card and more
    $scope.rollbackCard = function () {
        debugger
        //$scope.rollBack.CardHeader = $scope.model;
        $scope.rollBack.ListChkItemRollback = $scope.ListChkItemRollback;
        $scope.rollBack.Comment = $scope.rollbackComment;
        $scope.rollBack.ObjectRela = $scope.rollbackObject;
        $scope.rollBack.Products = $scope.rollbackProduct;
        $scope.rollBack.Services = $scope.rollbackService;
        $scope.rollBack.AddressCard = $scope.rollbackAddress;
        $scope.rollBack.CardLinks = $scope.rollbackLinks;
        dataserviceTaskManager.rollbackInfoCard($scope.rollBack, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                loadNewData();
            }
        })
    }
    //End rollback info card and more

    //Board, list select 
    $scope.boardSelect = function (boardCode) {
        if ($scope.obj.Board == "") {
            $scope.errorBoard = true;
        }
        else {
            $scope.errorBoard = false;
        }
        $scope.obj.List = "";
        $scope.model.ListCode = "";
        dataserviceTaskManager.getLists(boardCode, function (rs) {
            rs = rs.data;
            $scope.Lists = rs;
        });
    };

    $scope.listSelect = function (listCode) {
        if ($scope.obj.List == "") {
            $scope.errorList = true;
        }
        else {
            $scope.errorList = false;
            $scope.model.ListCode = listCode;
            dataserviceTaskManager.updateListReal($rootScope.CardCode, $scope.model.ListCode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    $scope.model.ListCode = "";
                    $scope.obj.List = "";
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.completeBoard = rs.Object.PercentBoard;
                    $scope.completeList = rs.Object.PercentList;
                }
            })
        }
    };
    //End select board, list

    //Insert card
    $scope.saveBuffer = function () {
        var element = $('#card_000000');
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        if (newName != currentName) {
            $scope.model.LmsTaskName = newName;
        }
        $scope.acticeDetailDrag = false;

        var check = CKEDITOR.instances['description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['description'].getData();
            $scope.model.Description = data;
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.model.LmsTaskName.trim() == "" && $scope.model.ListCode == "") {
                return App.toastrError("Vui lòng nhập tên thẻ việc và chọn danh mục công việc");
            }
            else if ($scope.model.LmsTaskName.trim() == "") {
                return App.toastrError(caption.LMS_MSG_PLEASE_INPUT_CARDJOB_NAME);
            }
            else if ($scope.model.ListCode == "") {
                return App.toastrError(caption.LMS_MSG_PLEASE_CHOICE_ITEM);
            }

            if (!$scope.isSave) {
                return;
            }
            else if ($rootScope.IsLock) {
                return App.toastrError(caption.LMS_JOBCARD_LOCKED);
            }
            //else if (!$rootScope.isAceptCard) {
            //    return App.toastrError(caption.LMS_YOU_REFUSE_JOBCARD);
            //}
            $scope.model.IsApprove = $rootScope.isApprove;
            var selectColor = $scope.listColor.find(function (element) {
                if (element.Check == true) return true;
            });
            if (selectColor) {
                $scope.model.BackgroundColor = selectColor.BackgroundColor;
                $scope.model.BackgroundImage = selectColor.BackgroundImage;
            }

            dataserviceTaskManager.checkSessionCard($rootScope.CardCode, function (rs) {
                rs = rs.data;
                if (rs) {
                    var modalInstance = $uibModal.open({
                        templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
                        windowClass: "message-center",
                        controller: function ($scope, $uibModalInstance) {
                            $scope.message = caption.LMS_MSG_JOBCARD_USEDBY_MULTIPLE_DEVICE;
                            $scope.ok = function () {
                                $uibModalInstance.close(true);
                            };
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss();
                            };
                        },
                        size: '25',
                        backdrop: 'static',
                        keyboard: false
                    });
                    modalInstance.result.then(function (d) {
                        dataserviceTaskManager.updateCardNew($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            }
                            else {
                                App.toastrSuccess(rs.Title);
                                $rootScope.isUpdate = true;
                                $rootScope.getLogActivity();
                                $scope.isSave = false;
                                clearInterval($scope.interval);
                            }
                        })
                    }, function () {

                    });
                }
                else {
                    dataserviceTaskManager.updateCardNew($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.isUpdate = true;
                            $rootScope.getLogActivity();
                            $scope.isSave = false;
                            clearInterval($scope.interval);
                        }
                    })
                }
            });
        }
    }

    $scope.update = function () {
        if (!$rootScope.isUpdate) {
            return;
        }
        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs.Object.CardDetail;
                editor.setData($scope.model.Description);

                if ($scope.model.CreatedBy == userName) {
                    $scope.isAssign = false;
                }
                else if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                        $scope.isAssign = false;
                    } else {
                        $scope.isAssign = true;
                        App.toastrError(caption.LMS_YOU_DELETED_JOBCARD);
                        return $uibModalInstance.close();
                    }
                }
                if (!$scope.isAssign) {
                    $scope.cardCode = $scope.model.CardCode;
                    $scope.cardName = $scope.model.LmsTaskName;
                    $scope.obj.Board = rs.Object.Board;
                    $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                    $rootScope.IsLock = $scope.model.IsLock;
                    dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                        rs = rs.data;
                        $scope.Lists = rs;
                    });
                    $scope.obj.List = rs.Object.List;

                    $scope.CompletedOld = $scope.model.Completed;

                    $rootScope.settingNotification = rs.Object.Notification;
                    $scope.currentUser = rs.Object.CurrenUser;
                    $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                    $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                    $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                    $scope.completeBoard = rs.Object.BoardCompleted;
                    $scope.completeList = rs.Object.ListCompleted;
                    dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.RoleUser = rs.Responsibility;

                        if ($scope.RoleUser == "ROLE_LEADER") {
                            $scope.isNotLeader = false;
                        }
                        if ($scope.isNotLeader && $scope.isClose) {
                            $scope.isDisableStatus = true;
                            $scope.isDisableControl = true;
                        } else if (!$scope.isNotLeader && $scope.isClose) {
                            $scope.isDisableStatus = false;
                            $scope.isDisableControl = true;
                        } else {
                            $scope.isDisableStatus = false;
                            $scope.isDisableControl = false;
                        }
                    })

                    dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.activity = rs;
                        if ($scope.activity.length > 0) {
                            if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                $rootScope.isAceptCard = true;
                            } else {
                                $rootScope.isAceptCard = false;
                            }
                        }
                    });
                    dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.ActivityData = rs;
                        if ($rootScope.ActivityData.length > 0) {
                            for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                    $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                }
                            }
                        }
                    });
                    dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.comments = rs;
                    });
                    dataserviceTaskManager.GetLisAddressJobCard($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.listAddress = rs;
                    });
                    dataserviceTaskManager.getObjectRelative($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.listID = [];
                        $rootScope.listObjRelative = rs;
                        for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                            $rootScope.listID.push($scope.listObjRelative[i].ID);
                        }
                    });
                    dataserviceTaskManager.getCardProduct($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.listCardProduct = rs;
                    });
                    dataserviceTaskManager.getCardService($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.listCardService = rs;
                    });
                    $rootScope.reloadFile();

                    setTimeout(function () {
                        validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                    }, 100);
                }
            }
        });
    }

    function sessionCard() {
        dataserviceTaskManager.isUpdateNewData($rootScope.CardCode, $rootScope.timeUpdate, function (rs) {
            rs = rs.data;
            if (rs) {
                loadNewData();
                $rootScope.timeUpdate = moment().add(1, 'minute').format("DD/MM/YYYY HH:mm");
            }
        })
    }

    function loadNewData() {
        dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs.Object.CardDetail;
                $scope.cardCode = $scope.model.CardCode;
                $rootScope.Inherit = $scope.model.Inherit;
                editor.setData($scope.model.Description);
                $scope.cardName = $scope.model.LmsTaskName;
                $scope.obj.Board = rs.Object.Board;
                $rootScope.isShowPercentItem = rs.Object.BoardFullData.BoardType == "BOARD_REGULARLY" ? false : true;
                $rootScope.IsLock = $scope.model.IsLock;
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
                $scope.obj.List = rs.Object.List;
                var element = document.getElementById("card_000000");
                element.setAttribute('data-currentvalue', $scope.cardName);
                element.setAttribute('value', $scope.cardName);
                element.value = $scope.cardName;

                $scope.CompletedOld = $scope.model.Completed;
                if ($scope.model.LstUser != null && $scope.model.LstUser != "" && $scope.model.LstUser != undefined) {
                    if ($scope.model.LstUser.includes(userId) || rs.Object.Session) {
                        $scope.isAssign = false;
                    } else {
                        $scope.isAssign = true;
                    }
                }
                $rootScope.settingNotification = rs.Object.Notification;
                $scope.currentUser = rs.Object.CurrenUser;
                $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                $scope.completeBoard = rs.Object.BoardCompleted;
                $scope.completeList = rs.Object.ListCompleted;
                dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $scope.RoleUser = rs.Responsibility;

                    if ($scope.RoleUser == "ROLE_LEADER") {
                        $scope.isNotLeader = false;
                    }
                    if ($scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = true;
                        $scope.isDisableControl = true;
                    } else if (!$scope.isNotLeader && $scope.isClose) {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = true;
                    } else {
                        $scope.isDisableStatus = false;
                        $scope.isDisableControl = false;
                    }
                })
                
                if ($scope.model.LmsItemList != null && $scope.model.LmsItemList != "" && $scope.model.LmsItemList != undefined) {
                    try {
                        $rootScope.checkList = JSON.parse($scope.model.LmsItemList);
                        console.log($rootScope.checkList.length);
                    } catch (e) {
                        $rootScope.checkList = [];
                        console.log(e);
                    }
                }
                if ($scope.model.LmsUserList != null && $scope.model.LmsUserList != "" && $scope.model.LmsUserList != undefined) {
                    try {
                        $rootScope.lstAssign = JSON.parse($scope.model.LmsUserList);
                        console.log($rootScope.lstAssign.length);
                    } catch (e) {
                        $rootScope.lstAssign = [];
                        console.log(e);
                    }
                    $rootScope.checkUserInList();
                }
                setTimeout(function () {
                    $scope.disableCkEditer(editor);
                    validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                }, 100);
            }
        });
        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.activity = rs;
            if ($scope.activity.length > 0) {
                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                    $rootScope.isAceptCard = true;
                } else {
                    $rootScope.isAceptCard = false;
                }
            }
        });
        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.ActivityData = rs;
            if ($rootScope.ActivityData.length > 0) {
                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                    }
                }
            }
        });
        dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.comments = rs;
        });
        dataserviceTaskManager.GetLisAddressJobCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listAddress = rs;
        });
        dataserviceTaskManager.getObjectRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listID = [];
            $rootScope.listObjRelative = rs;
            for (var i = 0; i < $rootScope.listObjRelative.length; i++) {
                $rootScope.listID.push($scope.listObjRelative[i].ID);
            }
        });
        dataserviceTaskManager.getCardProduct($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardProduct = rs;
        });
        dataserviceTaskManager.getCardService($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listCardService = rs;
        });
        dataserviceTaskManager.permissionHeaderCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.permissionHeaderCard = rs;
        })
        dataserviceTaskManager.roleInCardOfUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            if (rs.Responsibility === "ROLE_LEADER") {
                $rootScope.isApprove = true;
            }
            else {
                $rootScope.isApprove = false;
            }
        })
        dataserviceTaskManager.getCardRelative($rootScope.CardCode, function (rs) {
            rs = rs.data;

            $scope.CardInherit = rs.Inherit;
            $scope.Links = rs.Links;
        })
        dataserviceTaskManager.insertListUserView($rootScope.CardCode, function (rs) { })
        dataserviceTaskManager.getDataLoggerCard($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $rootScope.listData = rs;
        });
        dataserviceTaskManager.getGroupDepartmentAssign($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.lstGrpAssign = rs.Group
            $scope.lstDpmAssign = rs.Dpm
        });

        var data = {
            cardCode: $rootScope.CardCode,
        }
        dataserviceTaskManager.getListLinkCardJob(data, function (rs) {
            rs = rs.data;
            $rootScope.listCardJobLink = rs;
            $scope.rollbackLinks = angular.copy($rootScope.listCardJobLink);
        })
        $rootScope.reloadFile();
        $rootScope.getLogActivity();
    }
    //End
    //Editor

    function ckEditer() {
        editor = CKEDITOR.replace('description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['description'].config.height = 360;
    }

    $scope.disableCkEditer = function (editor) {

        if (!$rootScope.isAceptCard || $rootScope.IsLock) {
            editor.setReadOnly(true);
        } else {
            editor.setReadOnly(false);
        }
    }
    //End editor

    //View tab
    $scope.idxViewTab = 1;
    $scope.viewTab = function (index) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        $scope.idxViewTab = index;
    }
    //Edn view tab

    //Add member
    $scope.addMember = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        $rootScope.titleModalAssign = 3;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-group-or-team.html',
            controller: 'add-group-or-teamCardJob',
            size: '60',
            resolve: {
                obj: function () {
                    return {
                        CardCode: $rootScope.CardCode,
                        Type: 4
                    };
                }
            },
            backdrop: 'static',
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                rs = rs.data;
                $rootScope.ActivityData = rs;
                if ($rootScope.ActivityData.length > 0) {
                    for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                        if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                            $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                        }
                    }
                }
            });
            dataserviceTaskManager.getGroupDepartmentAssign($rootScope.CardCode, function (rs) {
                rs = rs.data;
                $scope.lstGrpAssign = rs.Group
                $scope.lstDpmAssign = rs.Dpm
            });
        }, function () {
        });
    };
    //End add member

    //Send notifi
    $scope.sendNotifi = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/send-notifi-card.html',
            controller: 'send-notifi-card',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End send notification

    //Log status
    $scope.viewLogStatus = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/view-status-log.html',
            controller: 'log-status',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End log status

    //Log workflow
    $scope.viewLogWF = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/log-activity-wf.html',
            controller: 'log-activity-wf',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    var obj = { WfCode: $scope.model.WorkflowCode, CardCode: $rootScope.CardCode };
                    return obj;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    //End

    //Show log accept, reject
    $scope.showLogActivity = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/log-user-activity.html',
            controller: 'log-user-activity',
            size: '30',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    //End

    //Update activity
    $scope.updateActivity = function (value, isCheck) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        if (isCheck) {
            var activity = $scope.activity.find(function (element) {
                if (element.Value != value && element.Value != 0) return true;
            });
            if (activity) {
                activity.IsCheck = false;
            }
            if (value == 2 && isCheck) {
                $rootScope.isAceptCard = true;
                dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $scope.activity = rs;
                            if ($scope.activity.length > 0) {
                                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                    $rootScope.isAceptCard = true;
                                } else {
                                    $rootScope.isAceptCard = false;
                                }
                            }
                        });
                        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.ActivityData = rs;
                            if ($rootScope.ActivityData.length > 0) {
                                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            else if (value == 1 && isCheck) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsTaskManager + '/add-reason-reject.html',
                    controller: 'add-reason-reject',
                    backdrop: 'static',
                    size: '25',
                    keyboard: false,
                    windowClass: "modal-position",
                    resolve: {
                        para: function () {
                            return {
                                Value: value,
                                CardCode: $rootScope.CardCode
                            };
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.activity = rs;
                        if ($scope.activity.length > 0) {
                            if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                $rootScope.isAceptCard = true;
                            } else {
                                $rootScope.isAceptCard = false;
                            }
                        }
                    });
                    $rootScope.getLogActivity();
                }, function () { });
            }
            else {
                $rootScope.isAceptCard = false;
                dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                        dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $scope.activity = rs;
                            if ($scope.activity.length > 0) {
                                if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                    $rootScope.isAceptCard = true;
                                } else {
                                    $rootScope.isAceptCard = false;
                                }
                            }
                        });
                        dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                            rs = rs.data;
                            $rootScope.ActivityData = rs;
                            if ($rootScope.ActivityData.length > 0) {
                                for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                    if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                        $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            $scope.disableCkEditer(editor);
        }
        else {
            $rootScope.isAceptCard = false;
            dataserviceTaskManager.updateActivity($rootScope.CardCode, value, isCheck, function (rs) {
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
                    dataserviceTaskManager.getCardActivityByUser($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $scope.activity = rs;
                        if ($scope.activity.length > 0) {
                            if ($scope.activity[$scope.activity.length - 1].Name == "Đồng ý" && $scope.activity[$scope.activity.length - 1].IsCheck == true) {
                                $rootScope.isAceptCard = true;
                            } else {
                                $rootScope.isAceptCard = false;
                            }
                        }
                    });
                    dataserviceTaskManager.getActivityAssign($rootScope.CardCode, function (rs) {
                        rs = rs.data;
                        $rootScope.ActivityData = rs;
                        if ($rootScope.ActivityData.length > 0) {
                            for (var i = 0; i < $rootScope.ActivityData.length; i++) {
                                if ($rootScope.ActivityData[i].IdObject == "DESCRIPTION") {
                                    $rootScope.ActivityData[i].ChangeDetails = $scope.getSafehtml($rootScope.ActivityData[i].ChangeDetails);
                                }
                            }
                        }
                    });
                }
            });
        }
    }
    //end

    //Start validate
    $scope.changeSelect = function (selectType, item) {
        if (selectType === "Status") {
            if ($scope.model.Status == "") {
                $scope.errorStatus = true;
            }
            else {
                $scope.errorStatus = false;
            }
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        if (data.WfType == "") {
            $scope.errorWfType = true;
            mess.Status = true;
        } else {
            $scope.errorWfType = false;
        }

        return mess;
    };
    //End validate

    //Lock card
    $scope.lockCard = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng thêm thẻ việc trước");
        }
        else if (!$scope.permissionHeaderCard) {
            return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        var value = false;
        if (!$scope.model.IsLock) {
            value = true;
        }
        dataserviceTaskManager.lockCard($rootScope.CardCode, value, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getCardDetail($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    if (!rs.Error) {
                        $scope.model = rs.Object.CardDetail;
                        $scope.model.BeginTime = $scope.model.BeginTime != '' ? $filter('date')($scope.model.BeginTime, 'dd/MM/yyyy HH:mm') : '';
                        $scope.model.Deadline = $scope.model.Deadline != '' ? $filter('date')($scope.model.Deadline, 'dd/MM/yyyy') : '';
                        $scope.model.EndTime = $scope.model.EndTime != null ? $filter('date')($scope.model.EndTime, 'dd/MM/yyyy HH:mm') : "";
                        //$scope.updateLmsTaskName("card_000000");
                        setTimeout(function () {
                            $scope.disableCkEditer(editor);
                            validateDefaultDate($scope.model.BeginTime, $scope.model.EndTime, $scope.model.Deadline)
                        }, 500);
                    }
                });
                if (value) {
                    $rootScope.IsLock = true;
                }
                else {
                    $rootScope.IsLock = false;
                }
            }
        })
    }
    //End

    //add-card-inherit, card-link
    $scope.addInheritLink = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-card-link.html',
            controller: 'add-card-link',
            windowClass: "message-center",
            size: '35',
            backdrop: 'static',
            resolve: {
                cardJob: function () {
                    return {
                        cardCode: $rootScope.CardCode,
                        cardName: $scope.model.LmsTaskName,
                        Inherit: $scope.model.Inherit
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.model.Inherit = $rootScope.CardInherit.Code;
            dataserviceTaskManager.getCardRelative($rootScope.CardCode, function (rs) {
                rs = rs.data;

                $scope.CardInherit = rs.Inherit;
                $scope.Links = rs.Links;
            })
        });
    }
    //End

    //Add list/board
    $scope.addBoard = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/add-board.html',
            controller: 'add-boardCardJob',
            size: '30',
            backdrop: 'static'
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getListBoard(function (rs) {
                rs = rs.data;
                $scope.listBoards = rs;
            });
        }, function () { });
    };

    $scope.addList = function (board) {
        if (board == '') {
            App.toastrError(caption.CJ_MSG_PLS_SELECT_TABLE_WORKING);
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsTaskManager + '/add-list.html',
                controller: 'add-listCardJob',
                backdrop: 'static',
                size: '25',
                resolve: {
                    para: function () {
                        return board;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceTaskManager.getLists($scope.obj.Board, function (rs) {
                    rs = rs.data;
                    $scope.Lists = rs;
                });
            }, function () { });
        }
    }
    //End

    //Push trash
    $scope.pushTrash = function () {
        dataserviceTaskManager.changeCardStatus($rootScope.CardCode, "TRASH", function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(caption.COM_DELETE_SUCCESS);
                clearInterval($scope.interval);
                $uibModalInstance.close();
                $rootScope.reloadGridCard();
            }
        });
    }
    //End

    // color
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    //Update directly
    $scope.changeData = function (selectType, value) {
        if (!$rootScope.isAceptCard) {
            return;
        }
        else if ($rootScope.IsLock) {
            return;
        }
        if (selectType == "BeginTime") {
            updateBeginTime();
        }
        else if (selectType == "LmsTaskName") {
            updateLmsTaskName();
        }
        else if (selectType == "Deadline") {
            updateDeadline();
        }
        else if (selectType == "EndTime") {
            updateEndTime();
        }
        else if (selectType == "Status") {
            updateStatus();
        }
        else if (selectType == "CardLevel") {
            updateCardLevel();
        }
        else if (selectType == "WorkType") {
            updateWorkType();
        }
        else if (selectType == "WeightNum") {
            updateWeightNum();
        }
        else if (selectType == "Cost") {

        }
        else if (selectType == "Currency") {

        }
    }

    function updateLmsTaskName() {
        var element = $('#card_000000');
        var newName = element.val();
        var currentName = element.attr('data-currentvalue');
        if (newName != currentName) {
            $scope.model.LmsTaskName = newName;
            if ($scope.model.LmsTaskName.trim() == "" || $scope.model.LmsTaskName == undefined || $scope.model.LmsTaskName == null) {
                return;
            }
            dataserviceTaskManager.updateLmsTaskNameReal($rootScope.CardCode, $scope.model.LmsTaskName, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title)
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.getLogActivity();
                }
            })
        }
    }

    function updateBeginTime() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        $rootScope.BeginTime = $scope.model.BeginTime;
        dataserviceTaskManager.updateCardBegintimeReal($rootScope.CardCode, $scope.model.BeginTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateDeadline() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        dataserviceTaskManager.updateCardDeadlineReal($rootScope.CardCode, $scope.model.Deadline, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateEndTime() {
        if ($rootScope.IsLock) {
            return;
        }
        else if (!$rootScope.isAceptCard) {
            return;
        }
        $rootScope.EndTime = $scope.model.EndTime;
        dataserviceTaskManager.updateCardEndtimeReal($rootScope.CardCode, $scope.model.EndTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateStatus() {
        dataserviceTaskManager.updateCardStatusReal($rootScope.CardCode, $scope.model.Status, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateCardLevel() {
        dataserviceTaskManager.updateCardLevelReal($rootScope.CardCode, $scope.model.CardLevel, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateWorkType() {
        dataserviceTaskManager.updateCardWorkTypeReal($rootScope.CardCode, $scope.model.WorkType, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $rootScope.getLogActivity();
            }
        })
    }

    function updateWeightNum() {
        dataserviceTaskManager.updateWeightNumReal($rootScope.CardCode, $scope.model.WeightNum, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.completeBoard = rs.Object.PercentBoard;
                $scope.completeList = rs.Object.PercentList;
                $rootScope.getLogActivity();
            }
        })
    }

    function updateDescription() {
        debugger
        var check = CKEDITOR.instances['description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['description'].getData();
            if (!$scope.model.Description) {
                $scope.model.Description = "";
            }
            if ($scope.model.Description.localeCompare(data) != 0) {
                $scope.model.Description = data;
                var data = { CardCode: $rootScope.CardCode, Description: $scope.model.Description };

                dataserviceTaskManager.updateDescriptionReal(data, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.getLogActivity();
                    }
                })
            }
        }

    }

    CKEDITOR.on('instanceReady', function (evt) {
        var editor = evt.editor,
            body = CKEDITOR.document.getBody();
        editor.on('focus', function () {
        });

        editor.on('blur', function () {
            updateDescription();
        });
    });
    //End update directly


    //End show, hide header card
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            dateFormat: "dd/mm/yyyy hh:ii",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#deadline').datetimepicker('setStartDate', maxDate);
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            var maxDate = new Date(selected.date.valueOf());
            if ($scope.model.EndTime != "") {
                const [day, month, year] = $scope.model.EndTime.split("/")
                var endTime = new Date(year, month - 1, day)
                if (maxDate > endTime) {
                    $('#startDate').datetimepicker('setEndDate', endTime);
                }
                else {
                    $('#startDate').datetimepicker('setEndDate', maxDate);
                }
            }
            else {
                $('#startDate').datetimepicker('setEndDate', maxDate);
            }
        });
        //$("#deadline").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {

        //    var maxDate = new Date(selected.date.valueOf());
        //    if ($scope.model.EndTime != "") {
        //        const [day, month, year] = $scope.model.EndTime.split("/")
        //        var endTime = new Date(year, month - 1, day)
        //        if (maxDate > endTime) {
        //            $('#startDate').datepicker('setEndDate', endTime);
        //        }
        //        else {
        //            $('#startDate').datepicker('setEndDate', maxDate);
        //        }
        //    }
        //    else {
        //        $('#startDate').datepicker('setEndDate', maxDate);
        //    }
        //});
    }

    function validateDefaultDate(startDate, endDate, deadline) {
        //setStartDate("#endDate", startDate);
        //setStartDate("#deadline", startDate);
        ////setEndDate
        //const [dayDead, monthDead, yearDeal] = deadline.split("/")
        //var deadTime = new Date(yearDeal, monthDead - 1, dayDead)
        //if (endDate != "") {
        //    const [day, month, year] = endDate.split("/")
        //    var endTime = new Date(year, month - 1, day)
        //    if (endTime > deadTime) {
        //        setEndDate("#startDate", deadline)
        //    }
        //    else {
        //        setEndDate("#startDate", endDate)
        //    }
        //}
        //else {
        //    setEndDate("#startDate", deadline)
        //}
    }

    setTimeout(function () {
        ckEditer();
        loadDate();
        setModalDraggable(".modal-dialog");
    }, 400);

    $scope.getSafehtml = function (description) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = description;
        return tmp.textContent || tmp.innerText || "";
    }

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
            //dataserviceTaskManager.getWorkType(function (rs) {
            //    rs = rs.data;
            //    $scope.WorkTypes = rs;
            //});
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
            dataserviceTaskManager.getLevels(function (rs) {
                rs = rs.data;
                $scope.CardLevels = rs;
            });
        }, function () { });
    }

    $scope.addProductActivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'JC_ACTIVITY_PRODUCT',
                        GroupNote: 'Hoạt động sản phẩm',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getActivityProduct(function (rs) {
                rs = rs.data;
                $scope.listActivityProduct = rs;
            })
        }, function () { });
    }

    $scope.addSeriveActivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'JC_ACTIVITY_SERVICE',
                        GroupNote: 'Hoạt động dịch vụ',
                        AssetCode: 'CARDJOB'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceTaskManager.getActivityService(function (rs) {
                rs = rs.data;
                $scope.listActivityService = rs;
            });
        }, function () { });
    }

    function updateNotify() {
        dataserviceTaskManager.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("countCardWork").innerText = "Bạn có " + rs.CountWork + " công việc mới.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
});

app.controller('add-group-or-teamCardJob', function ($scope, $rootScope, $cookies, $compile, $q, $uibModal, $uibModalInstance, $filter, dataserviceTaskManager, obj) {
    $scope.model = {
        Object: {
            Type: 0,
            Name: ''
        },
        BeginTime: moment().format('DD/MM/YYYY'),
        EndTime: moment().add(moment($rootScope.EndTime, 'DD/MM/YYYY').diff(moment($rootScope.BeginTime, 'DD/MM/YYYY'), 'days'), 'days').format('DD/MM/YYYY'),
        Branch: 'b_HN',
        ClassCode: ''
    };
    var id = 0;
    $scope.departmentAssignCode = "";
    $scope.groupAssignCode = "";

    $scope.cardMember = {
        listTeamAssign: [],
        listDepartmentAssign: [],
        listMember: []
    };

    //$rootScope.lstAssign = [];

    $scope.lstDelAssign = [];

    $scope.lstGroup = [];

    $scope.isChangeAssign = false;

    $scope.RoleUser = "";

    $scope.cardCode = obj.CardCode;

    $scope.listGroupUserAndDepartment = [];

    $scope.listDeleteObj = [];

    $scope.RoleData = [];

    $scope.listDeleteMember = [];

    //Keep data
    $scope.memberAssign = [];

    $scope.groupAssign = [];

    $scope.departmentAssign = [];

    $scope.listUser = [];

    $scope.listClass = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.reloadItemProgress = function () {
        dataserviceTaskManager.getLmsItemProgressGroupByUser($rootScope.CardCode, function (rs) {
            rs = rs.data;
            $scope.listItemProgress = rs;
            for (var asg of $rootScope.lstAssign) {
                var itemGroup = $scope.listItemProgress.find(x => x.Key == asg.UserId);
                if (itemGroup != undefined) {
                    asg.listItems = itemGroup.ListItems;
                }
                else {
                    asg.listItems = [];
                }
                asg.progress = 0;
                if (asg.listItems.length > 0) {
                    var sum = 0;
                    for (var item of asg.listItems) {
                        sum += parseFloat(item.ProgressAuto);
                    }
                    asg.progress = (sum / asg.listItems.length).toFixed(1);
                }
            }
        })
    };

    $scope.initData = function () {

        dataserviceTaskManager.getListRoleAssign(function (rs) {
            rs = rs.data;
            $scope.RoleData = rs;
        });

        dataserviceTaskManager.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            $scope.branchSelect($scope.model.Branch);
        });

        dataserviceTaskManager.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });

        dataserviceTaskManager.getStatusAssign(function (rs) {
            rs = rs.data;
            $scope.lstStatusAssign = rs;
        });

        dataserviceTaskManager.roleChangeStatusAssign(function (rs) {
            rs = rs.data;
            $scope.isChangeStatus = rs;
        })

        dataserviceTaskManager.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = [];
            rs.forEach(x => {
                $scope.listUser.push({
                    UserId: x.Id,
                    GivenName: x.GivenName
                });
            });
            //$scope.listUser = rs;
            $scope.countAllUser = $scope.listUser.length;
            $scope.countUser = $scope.listUser.length;
            var all = {
                Code: 'All',
                Name: 'Tất cả người dùng',
                Type: 3,
                Group: 'Người dùng',
                CountUser: $scope.countAllUser
            }
            //$scope.listGroupUserAndDepartment.push(all);
            $scope.model.Object = all;
            $scope.countUser = $scope.listUser.length;
        })

        $scope.reloadItemProgress();
    };

    $scope.initData();

    var allMember = {
        UserId: "ALL",
        GivenName: "Tất cả",
        UserName: "All",
        RoleSys: "",
        Branch: "",
        DepartmentName: ""
    }

    $scope.departmentOrGroupSelect = function (obj) {
        $scope.listUser = [];
        $scope.departmentAssignCode = "";
        $scope.groupAssignCode = "";
        if (obj.Type == 1) {
            $scope.groupAssignCode = obj.Code;
            dataserviceTaskManager.getMemberInGroupUser(obj.Code, $scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.countUser = rs.length;
                $scope.listUser.unshift(allMember);
            });
        }
        else if (obj.Type == 2) {
            $scope.departmentAssignCode = obj.Code;
            dataserviceTaskManager.getListUserInDepartment(obj.Code, $scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.countUser = rs.length;
                $scope.listUser.unshift(allMember);
            });
        } else {
            dataserviceTaskManager.getListUserOfBranch($scope.model.Branch, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.countUser = rs.length;
                $scope.listUser.unshift(allMember);
            });
        }
        $scope.isCheckAll = false;
    };

    $scope.classSelect = function (obj) {
        $scope.listUser = [];
        $scope.departmentAssignCode = "";
        $scope.groupAssignCode = "";
        dataserviceTaskManager.getListUserOfClass($scope.model.ClassCode, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.countUser = rs.length;
            $scope.listUser.unshift(allMember);
        });
        $scope.isCheckAll = false;
    }

    $scope.departmentOrGroupSelectAll = function (isCheck, obj) {
        if ($scope.model.Object == null || $scope.model.Object == "" || $scope.model.Object == undefined) {
            App.toastrError(caption.CJ_MSG_PLS_SELECT_GROUP_DEPARTMENT);
            return "";
        }
        if (isCheck) {

            if (obj.Type == 2) {
                $scope.departmentAssignCode = obj.Code;
            }
            else if (obj.Type == 1) {
                $scope.groupAssignCode = obj.Code;
            }

        } else {
            $scope.departmentAssignCode = "";
            $scope.groupAssignCode = "";
        }
    };

    $scope.branchSelect = function (code) {
        $scope.listGroupUserAndDepartment = [];
        $scope.listUser = [];
        dataserviceTaskManager.getDepartmentInBranch(code, function (department) {
            department = department.data;
            dataserviceTaskManager.getListGroupUser(code, function (groupUser) {
                groupUser = groupUser.data;
                $scope.lstGroup = groupUser;
                dataserviceTaskManager.getListUserOfBranch($scope.model.Branch, function (rs) {
                    rs = rs.data;
                    $scope.countAllUser = rs.length;
                    var all = {
                        Code: 'All',
                        Name: 'Tất cả người dùng',
                        Type: 3,
                        Group: 'Người dùng',
                        CountUser: $scope.countAllUser
                    }
                    $scope.listGroupUserAndDepartment.push(all);
                    var listGroupUserAndDepartment = [];
                    if (obj.Type == 4) {
                        listGroupUserAndDepartment = department.concat($scope.lstGroup);
                    } else {
                        var listGroupUserAndDepartment = obj.Type == 1 ? $scope.lstGroup : department;
                    }
                    for (var i = 0; i < listGroupUserAndDepartment.length; i++) {
                        $scope.listGroupUserAndDepartment.push(listGroupUserAndDepartment[i]);
                    }
                });
            });
        })
    };

    $scope.memberSelect = function (item) {
        $scope.isChangeAssign = true;
        if (item.UserId == "ALL") {
            if ($scope.listUser.length > 0) {
                if ($rootScope.lstAssign && $rootScope.lstAssign.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var isExits = false;
                        for (var j = 0; j < $rootScope.lstAssign.length; j++) {
                            if ($scope.listUser[i].UserId == $rootScope.lstAssign[j].UserId && $scope.listUser[i].UserId != "ALL") {
                                isExits = true;
                                break;
                            }
                        }
                        if (!isExits) {
                            id = id - 1;
                            if ($scope.listUser[i].UserId != "ALL") {
                                var assign = {
                                    Id: id,
                                    UserId: $scope.listUser[i].UserId,
                                    GivenName: $scope.listUser[i].GivenName,
                                    DepartmentName: $scope.listUser[i].DepartmentName,
                                    Branch: $scope.listUser[i].Branch,
                                    CreatedBy: userName,
                                    BeginTime: $scope.model.BeginTime,
                                    EndTime: $scope.model.EndTime,
                                }
                                $rootScope.lstAssign.unshift(assign);
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        id = id - 1;
                        if ($scope.listUser[i].UserId != "ALL") {
                            var assign = {
                                Id: id,
                                UserId: $scope.listUser[i].UserId,
                                GivenName: $scope.listUser[i].GivenName,
                                DepartmentName: $scope.listUser[i].DepartmentName,
                                Branch: $scope.listUser[i].Branch,
                                CreatedBy: userName,
                                BeginTime: $scope.model.BeginTime,
                                EndTime: $scope.model.EndTime,
                            }
                            if ($rootScope.lstAssign == null) {
                                $rootScope.lstAssign = [];
                            }
                            $rootScope.lstAssign.unshift(assign);
                        }
                    }
                }
            }
        }
        else {
            var object = "";
            if ($scope.model.Object.Type == 2) {
                object = $scope.model.Object.Code;
            }
            if ($rootScope.lstAssign && $rootScope.lstAssign.length > 0) {
                var isExits = false;
                for (var i = 0; i < $rootScope.lstAssign.length; i++) {
                    if ($rootScope.lstAssign[i].UserId == item.UserId) {
                        isExits = true;
                        break;
                    }
                }
                if (!isExits) {
                    id = id - 1;
                    var assign = {
                        Id: id,
                        UserId: item.UserId,
                        DepartmentName: item.DepartmentName,
                        GivenName: item.GivenName,
                        Branch: item.Branch,
                        CreatedBy: userName,
                        BeginTime: $scope.model.BeginTime,
                        EndTime: $scope.model.EndTime,
                    }
                    $rootScope.lstAssign.unshift(assign);
                }
                else {
                    App.toastrError("Nhân viên đã được thêm vào thẻ việc");
                }
            }
            else {
                id = id - 1;
                var assign = {
                    Id: id,
                    UserId: item.UserId,
                    DepartmentName: item.DepartmentName,
                    GivenName: item.GivenName,
                    Branch: item.Branch,
                    CreatedBy: userName,
                    BeginTime: $scope.model.BeginTime,
                    EndTime: $scope.model.EndTime,
                }
                if ($rootScope.lstAssign == null) {
                    $rootScope.lstAssign = [];
                }
                $rootScope.lstAssign.unshift(assign);
            }
        }

        $rootScope.checkUserInList();
        var jsonData = JSON.stringify($rootScope.lstAssign);
        var progressList = [];
        if ($rootScope.checkList) {
            for (var check of $rootScope.checkList) {
                var progressItem = {
                    ItemCode: check.ItemCode,
                    TrainingType: check.TrainingType,
                    ItemTitle: check.ItemName,
                    LmsTaskCode: $rootScope.CardCode,
                    User: item.UserId,
                }
                progressList.push(progressItem);
            }
        }
        insertAsyncSeries(progressList).then(function () {
            var checkData = {
                Code: $rootScope.CardCode,
                JsonData: jsonData
            };

            dataserviceTaskManager.updateUserList(checkData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    //$scope.reloadQuestion();
                    App.toastrSuccess(rs.Title);
                    $scope.reloadItemProgress();
                    $rootScope.getLogActivity();
                }
            });
        });
    };
    function insertAsync(progressItem) {
        // perform some asynchronous operation, resolve or reject the promise when appropriate.
        return $q(function (resolve, reject) {
            dataserviceTaskManager.insertLmsTaskUserItemProgress(progressItem, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    reject('Failed');
                } else {
                    resolve('Ok');
                }
            }, 1000);
        });
    };
    function insertAsyncSeries(arr) {
        return arr.reduce(function (promise, item) {
            return promise.then(function (result) {
                return insertAsync(item);
            });
        }, $q.when());
    };

    $scope.removeMember = function (data) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $rootScope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    if ($rootScope.lstAssign.indexOf(data) == -1) {
                        App.toastrError('Xóa thất bại')
                    } else {
                        $rootScope.lstAssign.splice($rootScope.lstAssign.indexOf(data), 1);

                        $rootScope.checkUserInList();
                        var jsonData = JSON.stringify($rootScope.lstAssign);
                        var checkData = {
                            Code: $rootScope.CardCode,
                            JsonData: jsonData
                        }

                        dataserviceTaskManager.updateUserList(checkData, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);

                                if (data.listItems.length > 0) {
                                    dataserviceTaskManager.deleteLmsTaskUserProgressAllItem(data.listItems[0], function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        }
                                        else {
                                            $rootScope.getLogActivity();
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                                else {
                                    $uibModalInstance.close();
                                }
                            }
                        });
                    }
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadItemProgress();
        }, function () {
        });
    };

    $scope.editAssign = function (index) {
        var obj = $scope.model.Object;
        $scope.model = {
            UserId: $rootScope.lstAssign[index].UserId,
            Branch: $rootScope.lstAssign[index].Branch,
            BeginTime: $rootScope.lstAssign[index].BeginTime,
            EndTime: $rootScope.lstAssign[index].EndTime,
            Object: obj
        }
        $scope.model.Member = $scope.listUser.find(x => x.UserId == $scope.model.UserId);
    }

    function loadDate() {
        $("#startDateMember").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDateMember').datepicker('setStartDate', maxDate);
        });
        $("#endDateMember").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            var maxDate = new Date(selected.date.valueOf());
            if ($scope.model.EndTime != "") {
                const [day, month, year] = $scope.model.EndTime.split("/")
                var endTime = new Date(year, month - 1, day)
                if (maxDate > endTime) {
                    $('#startDateMember').datepicker('setEndDate', endTime);
                }
                else {
                    $('#startDateMember').datepicker('setEndDate', maxDate);
                }
            }
            else {
                $('#startDateMember').datepicker('setEndDate', maxDate);
            }
        });
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);
});

app.controller('send-notifi-card', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTaskManager, cardCode) {
    $scope.cancel = function () {
        $uibModalInstance.close(true);
    }
    $scope.initData = function () {
        dataserviceTaskManager.getMemberSendNotification(cardCode, function (rs) {
            rs = rs.data;
            $scope.listUsers = rs;
        });
    }
    $scope.initData();

    $scope.approve = function (uId, isCheck) {

        for (var i = 0; i < $scope.listUsers.length; i++) {
            if ($scope.listUsers[i].UserId == uId) {
                if (!isCheck) {
                    $scope.listUsers[i].IsCheck = true;
                }
                else {
                    $scope.listUsers[i].IsCheck = false;
                }
                break;
            }
        }
    }

    $scope.lstData = [];

    $scope.submit = function () {
        if ($scope.listUsers.length > 0) {
            for (var i = 0; i < $scope.listUsers.length; i++) {
                if ($scope.listUsers[i].IsCheck) {
                    $scope.lstData.push($scope.listUsers[i]);
                }
            }
            var data = { CardCode: cardCode, LstUser: $scope.lstData };
            dataserviceTaskManager.sendNotification(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    $uibModalInstance.close();
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});

app.controller('approve-item-work', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTaskManager, para) {
    $scope.cancel = function () {
        $uibModalInstance.close(true);
    }

    $scope.chkTitle = para.Title;

    $scope.initData = function () {
        dataserviceTaskManager.getItemApprove(para.ChkListCode, function (rs) {
            rs = rs.data;
            $scope.listProgress = rs;
        })
    }

    $scope.initData();

    $scope.approve = function (wSession, progress, isAllow) {

        if (progress == null || progress == "" || progress == undefined) {
            progress = 0;
        }

        var numPro = parseFloat(progress);
        if (numPro > 100) {
            return App.toastrWarning(caption.CJ_MSG_PLS_ENTER_PROGRESS_LESS_THAN_100);
        }
        var data = {
            WorkSession: wSession,
            ProgressFromLeader: progress,
            IsAllow: isAllow
        }
        dataserviceTaskManager.approve(data, function (rs) {
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

    $scope.approveAll = function () {
        dataserviceTaskManager.approveAll(para.ChkListCode, function (rs) {
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

    $scope.enable = function (id, allow, user) {
        if (user != "") {
            var itemActivity = $scope.listProgress.find(function (element) {
                if (element.Id == id) return true;
            });
            if (!allow) {
                itemActivity.IsAllow = true;
                App.toastrWarning(caption.CJ_MSG_WARNING_APPROVE_PROGRESS);
            }
            else {
                itemActivity.IsAllow = false;
            }
        }
    }

    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});

app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});

app.controller('shareFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceTaskManager, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };

    $scope.model1 = {
        Code: '',
        Name: '',
        DepartmentName: '',
        Id: para.Id
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;

        dataserviceTaskManager.getListUserShare(para.CardCode, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });

        dataserviceTaskManager.getUserShareFilePermission($scope.model.Id, function (rs) {
            rs = rs.data;
            $scope.lstUserSharePermission = rs;
        })
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName == '') {
            return App.toastrError("Vui lòng chọn nhân viên");
        }
        $scope.model1.Permission = $scope.permission;
        dataserviceTaskManager.insertFileShareCard($scope.model1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.updatePermission = function (item, position, value) {
        item.Id = para.Id;
        if (position == 0) {
            if (value) {
                item.Permission.Read = false;
                item.Permission.Write = false;
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Read = true;
            }
        }
        else if (position == 1) {
            if (value) {
                item.Permission.Write = false;
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Write = true;
                item.Permission.Read = true;
            }
        }
        else {
            if (value) {
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Delete = true;
                item.Permission.Read = true;
                item.Permission.Write = true;
            }
        }
        dataserviceTaskManager.insertFileShareCard(item, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.deleteShare = function (userName) {
        dataserviceTaskManager.deleteShareFile(para.Id, userName, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.changeUser = function (item) {

        $scope.model1.Name = item.Name;
        $scope.model1.Code = item.Code;
        $scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('card-comment', function ($scope, $http, $rootScope, $compile, $uibModal, dataserviceTaskManager, $filter) {
    $scope.comment = {
        Content: ""
    };

    //Comment
    $scope.addComment = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        //else if (!$rootScope.isAceptCard) {
        //    return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        //}
        if ($scope.comment.Content == "") {
            return;
        }
        var obj = {
            LmsTaskCode: $rootScope.CardCode,
            CmtContent: $scope.comment.Content
        }
        dataserviceTaskManager.addComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.comment.Content = '';
                dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $rootScope.comments = rs;
                });
                $rootScope.getLogActivity();
            }
        })
    }

    $scope.deleteComment = function (CmtId) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        //else if (!$rootScope.isAceptCard) {
        //    return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        //}
        dataserviceTaskManager.deleteComment(CmtId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $rootScope.comments = rs;
                });
                $rootScope.getLogActivity();
            }
        });
    }

    $scope.updateComment = function (e) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        //else if (!$rootScope.isAceptCard) {
        //    return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        //}
        $scope.show.editComment[e.target.getAttribute('cmtid')] = false;
        var obj = {
            Id: e.target.getAttribute('cmtid'),
            CmtContent: e.target.value
        }
        dataserviceTaskManager.updateComment(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceTaskManager.getComment($rootScope.CardCode, function (rs) {
                    rs = rs.data;
                    $rootScope.comments = rs;
                });
                $rootScope.getLogActivity();
            }
        });
    };
});

app.controller('card-item-check', function ($scope, $http, $rootScope, $compile, $uibModal, $q, dataserviceTaskManager, $filter) {

    $scope.listSubject = [];

    $scope.listLecture = [];

    $scope.listExam = [];

    if (!$rootScope.isExamSchedule) {
        $scope.modelCheckList = {
            TrainingType: 'VIEW_LECTURE',
        }
    }

    $scope.submit = function () {
        if (!$rootScope.isExamSchedule || ($rootScope.isExamSchedule && $rootScope.checkList.length == 0)) {
            if ($scope.modelCheckList.ItemCode == '' || $scope.modelCheckList.ItemCode == null || $scope.modelCheckList.ItemCode == undefined) {
                return App.toastrError('Chọn bài giảng hoặc bài kiểm tra cho đầu mục');
            }

            var obj = {
                Id: generateUUID(),
                TrainingType: $scope.modelCheckList.TrainingType,
                ItemCode: $scope.modelCheckList.ItemCode,
                ItemName: $scope.modelCheckList.ItemName,
                SubjectCode: $scope.modelCheckList.SubjectCode,
                SubjectName: $scope.modelCheckList.SubjectName
            }

            var checkExit = $rootScope.checkList.find(function (element) {
                if (element.ItemCode == obj.ItemCode && element.TrainingType == obj.TrainingType) return true;
            });

            if (checkExit != '' && checkExit != null && checkExit != undefined) {
                return App.toastrError('Đầu mục đã tồn tại');
            }

            $rootScope.checkList.push(obj);

            var jsonData = JSON.stringify($rootScope.checkList);
            // assign to every user
            var progressList = [];
            for (var assign of $rootScope.lstAssign) {
                var progressItem = {
                    ItemCode: obj.ItemCode,
                    TrainingType: obj.TrainingType,
                    ItemTitle: obj.ItemName,
                    LmsTaskCode: $rootScope.CardCode,
                    User: assign.UserId,
                }
                progressList.push(progressItem);
            }
            insertAsyncSeries(progressList).then(function () {
                var checkData = {
                    Code: $rootScope.CardCode,
                    JsonData: jsonData
                }

                dataserviceTaskManager.updateCheckList(checkData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        //$scope.reloadQuestion();
                        $rootScope.getLogActivity();
                        return App.toastrSuccess(rs.Title);
                    }
                });
            });
        }
    };
    function insertAsync(progressItem) {
        // perform some asynchronous operation, resolve or reject the promise when appropriate.
        return $q(function (resolve, reject) {
            dataserviceTaskManager.insertLmsTaskUserItemProgress(progressItem, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    reject('Failed');
                } else {
                    resolve('Ok');
                }
            }, 1000);
        });
    };
    function insertAsyncSeries(arr) {
        return arr.reduce(function (promise, item) {
            return promise.then(function (result) {
                return insertAsync(item);
            });
        }, $q.when());
    };
    $scope.deleteCheck = function (data) {
        if ($rootScope.checkList.indexOf(data) == -1) {
            App.toastrError('Xóa thất bại')
        } else {
            $rootScope.checkList.splice($rootScope.checkList.indexOf(data), 1);

            var jsonData = JSON.stringify($rootScope.checkList);
            var checkData = {
                Code: $rootScope.CardCode,
                JsonData: jsonData
            }

            dataserviceTaskManager.updateCheckList(checkData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.getLogActivity();
                    var obj = {
                        ItemCode: data.ItemCode,
                        TrainingType: data.TrainingType,
                        LmsTaskCode: $rootScope.CardCode,
                    }
                    dataserviceTaskManager.deleteLmsTaskItemProgressAllUser(obj, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            return App.toastrError(rs.Title);
                        }
                    });
                }
            });
        }
    }

    $scope.initData = function () {
        dataserviceTaskManager.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
        dataserviceTaskManager.getListPractices(function (rs) {
            rs = rs.data;
            $scope.listExam = rs;
        });
    }
    $scope.initData();

    $scope.showProgress = function (index) {
        dataserviceTaskManager.getLmsUserProgressGroupByItem($rootScope.CardCode, function (rs) {
            rs = rs.data;
            var asg = rs.find(x => x.ItemCode == $rootScope.checkList[index].ItemCode && x.TrainingType == $rootScope.checkList[index].TrainingType);
            if (asg != undefined) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsTaskManager + '/show-user-progress.html',
                    openedClass: 'vertical-container',
                    windowClass: 'vertical-center',
                    controller: function ($scope, $uibModalInstance, para) {
                        $scope.listUser = para.ListUsers;
                        for (var user of $scope.listUser) {
                            var asg = $rootScope.lstAssign.find(x => x.UserId == user.UserId);
                            if (asg != undefined) {
                                user.BeginTime = asg.BeginTime;
                                user.EndTime = asg.EndTime;
                            }
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    },
                    backdrop: 'static',
                    size: '25',
                    keyboard: false,
                    resolve: {
                        para: function () {
                            return asg;
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () { });
            }
            else {
                return App.toastrError("Chưa có học sinh được giao bài");
            }
        });
    };
    $scope.changeData = function (type, item) {
        if (type == "TrainingType") {
            $scope.modelCheckList.ItemCode = "";
            $scope.modelCheckList.ItemName = "";
            $scope.modelCheckList.SubjectCode = "";
            $scope.modelCheckList.LectCode = "";
            $scope.modelCheckList.QuizCode = "";
            $scope.modelCheckList.PracticeTestCode = "";
        }
        else if (type == "SubjectCode") {
            $scope.modelCheckList.SubjectName = item.Name;
            dataserviceTaskManager.getListLecture(item.Code, function (rs) {
                rs = rs.data;
                $scope.listLecture = rs;
            })
            dataserviceTaskManager.getListQuiz(item.Code, function (rs) {
                rs = rs.data;
                $scope.listQuiz = rs;
                $scope.listQuiz.forEach( x => {
                    if (x.Type == 'QUIZ_GAME') {
                        x.Name = caption.LMS_QUIZ_GAME_TITLE
                    }
                    else {
                        x.Name = x.Name.substring(0, 25);
                    }
                });
            })
        }
        else if (type == "LectCode" || type == "QuizCode" || type == "PracticeTestCode") {
            $scope.modelCheckList.ItemCode = item.Code;
            $scope.modelCheckList.ItemName = item.Name;
        }
    }
});

app.controller('fileManage', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTaskManager, $filter, $translate, cardCode) {
    var vm = $scope;
    $scope.selected = [];
    $scope.treeData = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsTaskManagement/GetFileByObjShare",
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
                d.ObjCode = $scope.model.ObjFileShare;
                d.LstObjCode = $scope.model.ListRepository
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "290px")
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
                        dataserviceTaskManager.getFileEDMS($scope.path, data.FileSize, data.LastModifiedDate, cardCode, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                            }
                        })
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSR_LIST_COL_FILE_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        var dataSubstr = data.length > 80 ? data.substr(0, 80) + " ..." : data;
        var excel = ['XLSM', 'XLSX', 'XLS'];
        var document = ['TXT'];
        var word = ['DOCX', 'DOC'];
        var pdf = ['PDF'];
        var powerPoint = ['PPS', 'PPTX', 'PPT'];
        var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
        var icon = "";
        var idxDot = full.FileUrl.lastIndexOf(".") + 1;
        var extFile = full.FileUrl.substr(idxDot, full.FileUrl.length).toUpperCase();

        if (excel.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o pr5" aria-hidden="true"></i>';
        } else if (word.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o pr5" aria-hidden="true"></i>';
        } else if (document.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o pr5" aria-hidden="true"></i>';
        } else if (pdf.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o pr5" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o pr5" aria-hidden="true"></i>';
        } else if (image.indexOf(extFile.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o pr5" aria-hidden="true"></i>';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify pr5" aria-hidden="true"></i>';
        }
        return icon + dataSubstr;
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
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $scope.initData = function () {
        dataserviceTaskManager.getObjFileShare(function (rs) {
            rs = rs.data;
            $scope.lstObjFileShare = rs;
        })
    }
    $scope.initData();

    //treeview
    $scope.model = {
        ListRepository: []
    }
    var nodeBefore = "";

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataserviceTaskManager.getTreeCategory(function (result) {
            result = result.data;

            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Tất cả kho dữ liệu",//"Tất cả kho dữ liệu"
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
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
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    } else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }

    $scope.selectNodeRepository = function (e, data) {

        var listSelect = [];
        $scope.model.ObjFileShare = "";
        var idCurrentNode = data.node.id;
        if (nodeBefore != idCurrentNode) {
            $("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
            }
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            $("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(idCurrentNode);
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
    }

    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
                dataserviceTaskManager.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.model.ListRepository = listSelect;
                    $scope.reload();
                })
            }
        } else {
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }


    }

    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };

    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    }

    $scope.ac = function () {
        return true;
    }

    function customMenu(node) {
        var items = {
            'item1': {
                'label': caption.COM_BTN_EDIT,
                'icon': "fa fa-edit",
                'action': function (data) {
                    dataservice.getItemCategory(node.original.catId, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolder + '/editCategory.html',
                                controller: 'editCategory',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return rs.Object;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                                $('#treeDiv').jstree(true).refresh();
                                setTimeout(function () {
                                    $scope.readyCB();
                                }, 200);
                            }, function () {
                            });
                        }
                    })
                }
            },
            'item2': {
                'label': caption.COM_BTN_DELETE,
                'icon': "fa fa-trash",
                'action': function (data) {
                    var modalInstance = $uibModal.open({
                        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                        windowClass: "message-center",
                        resolve: {
                            para: function () {
                                return node.original.catCode;
                            }
                        },
                        controller: function ($scope, $uibModalInstance, para) {
                            $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                            $scope.ok = function () {

                                dataservice.deleteCategory(para, function (rs) {
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
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            $scope.readyCB();
                            $scope.reload();
                        }, 200);
                    }, function () {
                    });
                }
            }
        }
        return items;
    }

    $scope.changeObj = function () {
        $scope.treeInstance.jstree(true).uncheck_all();
        $scope.model.ListRepository = [];
        $scope.reload();
    }

    $scope.addFile = function () {
        var data = [];
        var listdata = $('#tblDataFileShare').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id] && listdata[i].Id == id) {
                        if (listdata[i].Id == id) {
                            var obj = {
                                FileID: listdata[i].FileCode,
                                ObjectType: "LMS_TASK",
                                ObjectInstance: cardCode,
                                FileCreated: listdata[i].FileCreated,
                                FileUrl: listdata[i].FileUrl,
                                FileName: listdata[i].FileName
                            };
                            data.push(obj);
                            break;
                        }
                    }
                }
            }
        }
        dataserviceTaskManager.insertFileShare(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $rootScope.getLogActivity();
                App.toastrSuccess(rs.Title);
            }
        })
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileCardJob', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTaskManager, $filter, $translate, dataserviceFilePlugin, $window) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsTaskManagement/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#fileCardJob",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CardCode = $rootScope.CardCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#fileCardJob");
                heightTableManual(335, "#tblDataCustomerFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle("{{'CJ_LBL_TITLE' | translate}}").renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle("{{'CJ_LIST_COL_CAT' | translate}}").renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap w50 text-center').withTitle("{{'CJ_LIST_COL_VIEW_CONTENT' | translate}}").notSortable().renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

        var mode = 2;
        if (full.ListUserShare != "" && full.ListUserShare != null && full.ListUserShare != undefined) {
            var lstShare = JSON.parse(full.ListUserShare);
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (lstShare[i].Permission != null) {
                            if (!lstShare[i].Permission.Write) {
                                mode = 0;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs20"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs20"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs20"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-eye fs20"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-eye fs20"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CJ_LIST_COL_DES" | translate}}').withOption('sClass', 'w50 nowrap text-center').notSortable().renderWith(function (data, type, full) {
        return '<a title="Mô tả" ng-click="extension(' + full.FileID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fs25 fa-info-circle"></i></a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("{{'CJ_COL_CREATE_DATE' | translate}}").withOption('sClass', 'w50 nowrap text-center').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('COM_LIST_COL_ACTION')).withOption('sClass', 'w100 nowrap text-center').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="share(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" title="{{&quot; COM_BTN_SHARE &quot; | translate}} - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline blue "><i class="fas fs25 fa-share-alt pr20 pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style1="width: 25px; height: 25px; padding: 0px" title="{{&quot; COM_BTN_DOWNLOAD &quot; | translate}} - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline green"><i class="fas fs25 pr20 fa-download pt5"></i></a>' +
                '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fs25 fa-trash-alt text-danger"></i></a>';
        }
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

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/file_search.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.add = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        debugger

        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("CardCode", $rootScope.CardCode);
            data.append("IsMore", false);
            dataserviceTaskManager.insertCardJobFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                    App.unblockUI("#modal-body");
                } else {
                    App.toastrSuccess(result.Title);
                    defaultShareFile(result.Object);
                    $scope.reload();
                    App.unblockUI("#modal-body");
                    $scope.file = null;
                    $rootScope.getLogActivity();
                }
            })
        }
    }

    $scope.edit = function (fileName, id) {
        dataserviceTaskManager.getCardFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsTaskManager + '/file_edit.html',
                    controller: 'fileEditCardJob',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                data: rs.Object,
                                FileName: fileName
                            };
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }

    $scope.delete = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDelete = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Delete) {
                            isDelete = false;
                            break;
                        }
                    }
                }
                if (!isDelete) {
                    return App.toastrError("Bạn không có quyền xóa tệp tin");
                }
            }
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTaskManager.deleteCardFile(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                            $rootScope.getLogActivity();
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

    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }

    $scope.viewFile = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        //dataserviceHrEmployeeCustomer.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }

    $scope.viewImage = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }

    $scope.dowload = function (fileCode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileCode == fileCode) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDownload = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isDownload = false;
                            break;
                        }
                    }
                }
                if (!isDownload) {
                    return App.toastrError("Bạn không có quyền tải tệp tin");
                }
            }
        }

        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }

    $scope.extend = function (id) {
        //dataserviceTaskManager.getSuggestionsCardFile($rootScope.CardCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.CardCode, ObjectType: 'LMS_TASK' };
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRepository + '/addFile.html',
        //        controller: 'addFile',
        //        windowClass: 'modal-file',
        //        backdrop: 'static',
        //        size: '60',
        //        resolve: {
        //            para: function () {
        //                return data;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        reloadData();
        //        defaultShareFile(d);
        //    }, function () { });
        //})
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        dataserviceFilePlugin.getDefaultRepo($rootScope.CardCode, 'LMS_TASK', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.CardCode, ObjectType: 'LMS_TASK' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/addFile.html',
                controller: 'setupRepoDefault',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }

    $scope.getObjectFile = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTaskManager.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };

    $scope.viewExcel = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Excel#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Excel#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }

        }
    };

    $scope.viewWord = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Docman#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Docman#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.viewPDF = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/PDF#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/PDF#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.view = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceTaskManager.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceTaskManager.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }

    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }

    $scope.extension = function (item) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.share = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
            return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/shareFile.html',
            controller: 'shareFile',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.fileManage = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if ($rootScope.isUpdate) {
            return App.toastrError("Vui lòng vào phiên");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/fileManage.html',
            controller: 'fileManage',
            backdrop: 'static',
            size: '50',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    $scope.modelShare = {
        Id: '',
        LstShare: ''
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    function defaultShareFile(id) {
        dataserviceTaskManager.getListUserShare($rootScope.CardCode, function (rs) {
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
                dataserviceTaskManager.autoShareFilePermission($scope.modelShare, function (rs) { })
            }
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('fileEditCardJob', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceTaskManager, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.data.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"HR_HR_FORDER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.data.NumberDocument;
        $scope.model.Tags = (para.data.Tags != '' && para.data.Tags != null) ? para.data.Tags.split(',') : [];
        $scope.model.Desc = para.data.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.data.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("CardCode", $rootScope.CardCode);
                dataserviceTaskManager.updateCardFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceTaskManager.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
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
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.data.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.data.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
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
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});

app.controller('file-item', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTaskManager, $filter, $translate, dataserviceFilePlugin, $uibModalInstance, dataserviceTaskManager, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        CheckTitle: para.CheckTitle,
        ChkListCode: para.ChkListCode,
        Note: para.Note,
        Completed: para.Completed
    }

    $scope.modelCoaching = {
        CardCode: $rootScope.CardCode,
        ItemCode: para.ChkListCode,
        CoachType: ''
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsTaskManagement/JTableFileWorkRequest",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ItemCode = para.ChkListCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataCustomerFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle("{{'Tên tệp' | translate}}").renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle("{{'CJ_LIST_COL_CAT' | translate}}").renderWith(function (data, type, full) {
    //    return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle("{{'CJ_LIST_COL_VIEW_CONTENT' | translate}}").notSortable().renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

        var mode = 2;
        if (full.ListUserShare != "" && full.ListUserShare != null && full.ListUserShare != undefined) {
            var lstShare = JSON.parse(full.ListUserShare);
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write) {
                            mode = 0;
                            break;
                        }
                    }
                }
            }
        }

        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"CJ_LIST_COL_DES" | translate}}').notSortable().renderWith(function (data, type, full) {
    //    return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("{{'CJ_COL_CREATE_DATE' | translate}}").renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('COM_LIST_COL_ACTION')).withOption('sClass', 'nowrap w75').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="share(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="Chia sẻ - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-share-alt pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
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

    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.cancel = function () {
        $uibModalInstance.close("cancel");
    };

    $scope.initData = function () {
        dataserviceTaskManager.getListCoachingType(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.lstCoachingType = rs.Object;
            }
        });

        dataserviceTaskManager.getListCoachingDetail($rootScope.CardCode, para.ChkListCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.listCoachingDetail = rs.Object;
            }
        });
    }

    $scope.initData();

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/file_search.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.add = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("CardCode", para.ChkListCode);
            data.append("IsMore", false);
            dataserviceTaskManager.insertCardJobFileRequest(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                    App.unblockUI("#modal-body");
                } else {
                    App.toastrSuccess(result.Title);
                    defaultShareFile(result.Object);
                    $scope.reload();
                    App.unblockUI("#modal-body");
                    $scope.file = null;
                }
            })
        }
    }

    $scope.edit = function (fileName, id) {
        dataserviceTaskManager.getCardFileRequest(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsTaskManager + '/file_edit.html',
                    controller: 'fileEditCardJob',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                data: rs.Object,
                                FileName: fileName
                            };
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }

    $scope.delete = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDelete = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Delete) {
                            isDelete = false;
                            break;
                        }
                    }
                }
                if (!isDelete) {
                    return App.toastrError("Bạn không có quyền xóa tệp tin");
                }
            }
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTaskManager.deleteCardFile(id, function (result) {
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
    }

    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }

    $scope.viewFile = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        //dataserviceHrEmployeeCustomer.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }

    $scope.viewImage = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }

    $scope.dowload = function (fileCode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileCode == fileCode) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDownload = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isDownload = false;
                            break;
                        }
                    }
                }
                if (!isDownload) {
                    return App.toastrError("Bạn không có quyền tải tệp tin");
                }
            }
        }

        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }

    $scope.extend = function (id) {
        //dataserviceTaskManager.getSuggestionsCardFile($rootScope.CardCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.CardCode, ObjectType: 'CARDJOB' };
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRepository + '/addFile.html',
        //        controller: 'addFile',
        //        windowClass: 'modal-file',
        //        backdrop: 'static',
        //        size: '60',
        //        resolve: {
        //            para: function () {
        //                return data;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        reloadData();
        //        defaultShareFile(d);
        //    }, function () { });
        //})
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        dataserviceFilePlugin.getDefaultRepo(para.ChkListCode, 'ITEM_REQUEST', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: para.ChkListCode, ObjectType: 'ITEM_REQUEST' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/addFile.html',
                controller: 'setupRepoDefault',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }

    $scope.getObjectFile = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceTaskManager.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };

    $scope.viewExcel = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Excel#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Excel#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }

        }
    };

    $scope.viewWord = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.viewPDF = function (id, mode) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceTaskManager.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/PDF#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/PDF#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };

    $scope.view = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceTaskManager.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceTaskManager.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }

    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }

    $scope.extension = function (item) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.share = function (id) {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        //else if ($rootScope.isUpdate) {
        //    return App.toastrError("Vui lòng vào phiên để cập nhật");
        //}
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }

        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
            return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/shareFile.html',
            controller: 'shareFile',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.fileManage = function () {
        if (!$rootScope.isAddedCard) {
            return App.toastrError("Vui lòng tạo thẻ việc trước");
        }
        else if ($rootScope.IsLock) {
            return App.toastrError("Thẻ việc đã khóa");
        }
        else if ($rootScope.isUpdate) {
            return App.toastrError("Vui lòng vào phiên");
        }
        else if (!$rootScope.isAceptCard) {
            return App.toastrError("Vui lòng đồng ý thực hiện thẻ việc");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/fileManage.html',
            controller: 'fileManage',
            backdrop: 'static',
            size: '50',
            resolve: {
                cardCode: function () {
                    return $rootScope.CardCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.updateCheckList = function () {
        if ($scope.model.CheckTitle == null || $scope.model.CheckTitle == "" || $scope.model.CheckTitle == undefined)
            return App.toastrError('Đầu mục việc không được để trống')

        if ($scope.isAceptCard) {
            if ($scope.model.WorkflowCode == null || $scope.model.WorkflowCode == "" || $scope.model.WorkflowCode == undefined) {
                var obj = {
                    CardCode: $rootScope.CardCode,
                    CheckTitle: $scope.model.CheckTitle,
                    WeightNum: para.WeightNum,
                    ChkListCode: $scope.model.ChkListCode,
                    Note: $scope.model.Note
                }
                dataserviceTaskManager.updateCheckList(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                })
            }
            else {
                App.toastrError(caption.CJ_MSG_CARD_FLOW_NOT_UPDATE);
            }
        } else {
            App.toastrError(caption.CJ_MSG_PLS_ACCEPT);
        }
    }

    $scope.changeCoachingType = function (item) {
        $scope.errorCoachingType = false;
        dataserviceTaskManager.getListCoachingId(item.Type, item.Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.lstCoachingId = rs.Object;
            }
        });
    }

    $scope.changeCoachingId = function () {
        $scope.errorCoachingId = false;
    }

    $scope.addCoaching = function () {
        if (!validationSelect($scope.modelCoaching).Status) {
            dataserviceTaskManager.insertCoaching($scope.modelCoaching, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.initData();
                }
            });
        }
    }

    $scope.deleteCoaching = function (id) {
        dataserviceTaskManager.deleteCoaching(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.initData();
            }
        });
    }

    $scope.viewDetailCoaching = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsTaskManager + '/view-detail-coaching.html',
            controller: 'viewDetailCoaching',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return item;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    $scope.modelShare = {
        Id: '',
        LstShare: ''
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.CoachType == "" || data.CoachType == null || data.CoachType == undefined) {
            $scope.errorCoachingType = true;
            mess.Status = true;
        } else {
            $scope.errorCoachingType = false;
        }
        if (data.CoachId !== null && data.CoachId !== undefined) {
            $scope.errorCoachingId = false;
        } else {
            mess.Status = true;
            $scope.errorCoachingId = true;
        }
        return mess;
    };

    function defaultShareFile(id) {
        dataserviceTaskManager.getListUserShare($rootScope.CardCode, function (rs) {
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
                dataserviceTaskManager.autoShareFilePermission($scope.modelShare, function (rs) { })
            }
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

