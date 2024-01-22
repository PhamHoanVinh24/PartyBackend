var ctxfolder = "/views/admin/lotProduct";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'dynamicNumber']);
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

        $http(req).success(callback);
    };
    return {

        update: function (data, callback) {
            $http.post('/Admin/lotProduct/Update', data).success(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/lotProduct/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/lotProduct/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/lotProduct/GetItem?Id=' + data).success(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/lotProduct/GetItemDetail/' + data).success(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/lotProduct/GetProductGroup/').success(callback);
        },

        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/lotProduct/UploadImage/', data, callback);
        },

        getInheritances: function (data, callback) {
            $http.post('/Admin/lotProduct/GetInheritances?productCode=' + data).success(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/lotProduct/GetProductCategoryTypes/').success(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/lotProduct/GetProductTypes/').success(callback);
        },
        insertProductAttribute: function (data, callback) {
            $http.post('/Admin/lotProduct/InsertProductAttribute', data).success(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/lotProduct/DeleteAttribute?Id=' + id).success(callback);
        },

        updateAttribute: function (data, callback) {
            $http.post('/Admin/lotProduct/UpdateAttribute', data).success(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/lotProduct/GetAttributeItem?id=' + id).success(callback);
        },
        jtreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/JtreeRepository').success(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/lotProduct/InsertFile/', data, callback);
        },


        updateFile: function (data, callback) {
            submitFormUpload('/Admin/lotProduct/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/lotProduct/GetFile?id=' + data).success(callback);
        },

        //lot Product

        gettreedataLevel: function (callback) {
            $http.post('/Admin/lotProduct/GetProductUnit/').success(callback);
        },
        getSuppliers: function (callback) {
            $http.post('/Admin/lotProduct/GetSupplier').success(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/lotProduct/Insert', data).success(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/lotProduct/GetListProduct').success(callback);
        },
        insertProduct: function (data, callback) {
            $http.post('/Admin/lotProduct/InsertProduct', data).success(callback);
        },
        deleteProduct: function (data, callback) {
            $http.post('/Admin/lotProduct/DeleteProduct?id=' + data).success(callback);
        },
        updateProduct: function (data, callback) {
            $http.post('/Admin/lotProduct/UpdateProduct', data).success(callback);
        },
        getOrigins: function (callback) {
            $http.post('/Admin/lotProduct/GetOrigin').success(callback);
        },
        getStores: function (callback) {
            $http.post('/Admin/lotProduct/GetStore').success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/EDMSWareHouseReceipt/UploadFile', data, callback);
        },

        getFiles: function (data, callback) {
            $http.post('/Admin/lotProduct/GetFiles?lotProductCode=' + data).success(callback);
        },
        getQrCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetQrCodeFromString?content=' + data).success(callback);
        },
        getBarCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetBarCodeFromString?content=' + data).success(callback);
        },
        getTaxCostMedium: function (data, callback) {
            $http.post('/Admin/lotProduct/GetTaxCostMedium?lotProductCode=' + data).success(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.LotProductCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Mã lô hàng không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
            }
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                LotProductCode: {
                    required: true,
                    maxlength: 255
                },
                LotProductName: {
                    required: true,
                    maxlength: 255
                },


            },
            messages: {
                Title: {
                    required: "Tiêu đề không được để trống!",
                    maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                LotProductCode: {
                    required: "Mã lô hàng không được để trống!",
                    maxlength: "Mã lô hàng không vượt quá 200 kí tự!"
                },
                LotProductName: {
                    required: "Tên lô hàng không được để trống!",
                    maxlength: "Tên lô hàng không vượt quá 200 kí tự!"
                },

            }
        };
        $rootScope.validationOptionsProduct = {
            rules: {
                Quantity: {
                    required: true,
                },
                Cost: {
                    required: true,
                },
            },
            messages: {
                Quantity: {
                    required: "Số lượng không được để trống!",
                },
                Cost: {
                    required: "Giá sản phẩm không được để trống!",
                },


            }
        };
        $rootScope.IsTranslate = true;
    });
    
    $rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    //$rootScope.checkData = function (data) {
    //    var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    //    var partternTelephone = /[0-9]/g;
    //    var mess = { Status: false, Title: "" }
    //    if (!partternCode.test(data.SupCode)) {
    //        mess.Status = true;
    //        mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_SUPCODE, "<br/>");
    //    }
    //    return mess;
    //}
    //$rootScope.checkData = function (data) {
    //    var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    //    var partternTelephone = /[0-9]/g;
    //    var mess = { Status: false, Title: "" }
    //    if (!partternCode.test(data)) {
    //        mess.Status = true;
    //        mess.Title = mess.Title.concat(" - ", caption.PROJECT_CURD_VALIDATE_CHARACTERS_SPACE, "<br/>");
    //    }

    //    return mess;
    //}
    $rootScope.checkDataMore = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.AttributeCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataContact = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ext_code)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkTelephone = function (data) {
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" };
        if (!partternTelephone.test(data) && data != null) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", "Số điện thoại phải là chữ số [0-9]!", "<br/>");
        }
        return mess;
    }
    $rootScope.checkProduct = function (data) {
        var mess = { Status: false, Title: "" };
        if (data != null && !$rootScope.partternFloat.test(data.Quantity)) {
            mess.Status = true;
            mess.Title = mess.Title.concat("Số lượng phải là số");
        }
        return mess;
    }
    $rootScope.BarDefault = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAR4SURBVHhetY9bimUxDAPP/jd9hwwUCFH4q1UQ9LAJ+PsN+L7v/8NDeujdzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/ELJj/bIQ87pHc7Jza3jEe7x8PV0afiF0x+tkMedkjvdk5sbhmPdo+Hq6NPxS+Y/GyHPOyQ3u2c2NwyHu0eD1dHn4pfMPnZDnnYIb3bObG5ZTzaPR6ujj4Vv2Dysx3ysEN6t3Nic8t4tHs8XB19Kn7B5Gc75GGH9G7nxOaW8Wj3eLg6+lT8gsnPdsjDDundzonNLePR7vFwdfSp+AWTn+2Qhx3Su50Tm1vGo93j4eroU/F/z+/3D/m9KBbfCWNFAAAAAElFTkSuQmCC';
    $rootScope.QrDefault = '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OamNNi7XRhtJyniDIXopk9po43JttJH0GrqDpdbRmZPaaONybbSRpIw3GKKXMqmNNi7XRhtJr6E7WGodnTmpjTYu10YbScp4gyF6KZPaaONybbSR9Bq6g6XW0ZmT2mjjcm20kaSMNxiilzKpjTYu10YbSa+hO1hqHZ05qY02LtdGG0nKeIMheimT2mjjcm20kfQauoOl1tGZk9po43JttJGkjDcYopcyqY02LtdGG0mvoTtYah2dOamNNi7XRhtJyniDIXopk9po43JttJH0GrqDpdbRmZPaaONybbSRpIw3GKKXMqmNNi7XRhtJr6E7WGodnTmpjTYu10YbScp4gyF6KZPaaONybbSR9Bq6g6XW0ZmT2mjjcm20kaSMNxiilzKpjTYu10YbSa+hO1hqHZ05qY02LtdGG0nKeIMheimT2mjjcm20kfQauoOl1tGZk9po43JttJGkjDcYopcyqY02LtdGG0lttJG0js6ctI7OnNRGG5dro40kZbzBEL2USW20cbk22khqo42kdXTmpHV05qQ22rhcG20kKeMNhuilTGqjjcu10UZSG20kraMzJ62jMye10cbl2mgjSRlvMEQvZVIbbVyujTaS2mgjaR2dOWkdnTmpjTYu10YbScp4gyF6KZPaaONybbSR1EYbSevozEnr6MxJbbRxuTbaSFLGGwzRS5nURhuXa6ONpDbaSFpHZ05aR2dOaqONy7XRRpIy3mCIXsqkNtq4XBttJLXRRtI6OnPSOjpzUhttXK6NNpKU8QZD9FImtdHG5dpoI6mNNpLW0ZmT1tGZk9po43JttJGkjDcYopcyqY02LtdGG0lttJG0js6ctI7OnNRGG5dro40kZbzBEL2USW20cbk22khqo42kdXTmpHV05qQ22rhcG20kKeMNhuilTGqjjcu10UZSG20kraMzJ62jMye10cbl2mgjSRlvMEQvZVIbbVyujTaS2mgjaR2dOWkdnTmpjTYu10YbScp4gyF6KZPaaONybbSR1EYbSevozEnr6MxJbbRxuTbaSFLGGwzRS5nURhuXa6ONpDbaSFpHZ05aR2dOaqONy7XRRpIy3mCIXsqkNtq4XBttJLXRRtI6OnPSOjpzUhttXK6NNpKU8QZD9FImtdHG5dpoI6mNNpLW0ZmT1tGZk9po43JttJGkjDcYopcyqY02LtdGG0lttJG0js6c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';

    $rootScope.Cost = 0;
    $rootScope.Tax = 0;
    $rootScope.Discount = 0;
    $rootScope.PoundAge = 0;
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    $scope.model = {
        productcode: '',
        productname: '',
        unit: '',
        describe: '',
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.suppliers = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LotProduct/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Name = $scope.model.Name;
                d.Supplier = $scope.model.Supplier;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('Mã Qr').renderWith(function (data, type) {
        return '<img class=" image-upload h-50 w50" style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sBarCode').withTitle('Mã BarCode').renderWith(function (data, type) {
        return '<img class=" image-upload " style="width:auto; height:auto" role="button" src="data:image/png;base64, ' + data + '" />';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('LotProductName').withTitle('Tên lô hàng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Store').withTitle('Kho').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupplierName').withTitle('Nhà cung cấp').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PathImg').withTitle('{{"CATEGORY_LIST_COL_PATHIMG" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }).withOption('sWidth', '50px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Packing').withTitle('Quy cách').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiryDate').withTitle('Ngày hết hạn').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày tạo').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedByName').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('material').withTitle('Chất liệu').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pattern').withTitle('Hoa văn').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('size').withTitle('Kích thước').renderWith(function (data, type) {
    //        return data;
    //    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CATEGORY_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadRoot = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
            $scope.suppliers = result;
        });

    }
    $scope.initData();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: false,
            size: '70',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model1 = rs;
                $rootScope.LotProductCode = $scope.model.LotProductCode;
                $rootScope.ProductCode = $scope.model.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: true,
                    size: '70',
                    resolve: {
                        para: function () {
                            return $scope.model1;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });

    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
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
        $("#CreatedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#FromDate').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        loadDate();
        showHideSearch();
    }, 50);

});
app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.close();
        $rootScope.reloadRoot();
    }
    $rootScope.ProductCode = '';
    $scope.listFileBox = [];
    $scope.suppliers = [];
    $scope.origins = [];
    $scope.productCategoryTypes = [];
    $scope.ImageBase = $rootScope.QrDefault;
    $scope.ImageBase1 = $rootScope.BarDefault;
    $scope.productTypes = [];
    $scope.x4as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x3as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x2as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x1as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];

    $scope.x4ass = {};
    $scope.x4ass[$scope.x4as[0].Code] = $scope.x4as[0].Name;
    $scope.x4ass[$scope.x4as[1].Code] = $scope.x4as[1].Name;
    $scope.x4ass[$scope.x4as[2].Code] = $scope.x4as[2].Name;
    $scope.x4ass[$scope.x4as[3].Code] = $scope.x4as[3].Name;


    $rootScope.LotProductCode = '';
    $scope.model = {};
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
            $scope.suppliers = result;
        });
        dataservice.getOrigins(function (result) {
            $scope.origins = result;
        });
        dataservice.getStores(function (result) {
            $scope.stores = result;
        });

    }
    $scope.initData();
    //function validationSelect(data) {
    //    var mess = { Status: false, Title: "" };

    //    if (data.Title == "" || data.Title == null || data.Title == undefined) {
    //        $scope.errorTitle = true;
    //        mess.Status = true;
    //    } else {
    //        $scope.errorTitle = false;

    //    }
    //    if (data.LotProductCode == "" || data.LotProductCode == null || data.LotProductCode == undefined) {
    //        $scope.errorLotProductCode= true;
    //        mess.Status = true;
    //    } else {
    //        $scope.errorLotProductCode = false;

    //    }


    //    if (data.LotProductName == "" || data.LotProductName == null || data.LotProductName == undefined) {
    //        $scope.errorLotProductName = true;
    //        mess.Status = true;
    //    } else {
    //        $scope.errorLotProductName = false;

    //    }
    //    return mess;
    //};
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
    }
    $scope.selectImage = function () {
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
        //$scope.model.Cost = $rootScope.Cost;
        //$scope.model.Tax = $rootScope.Tax;
        //$scope.model.Discount = $rootScope.Discount;
        //$scope.model.PoundAge = $rootScope.PoundAge;

        //validationSelect($scope.model);
        $scope.model.LotFile = $scope.listFileBox;
        
            if ($scope.addform.validate() ) {
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
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
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
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
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
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;

                                            dataservice.insert($scope.model, function (rs) {
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);

                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $scope.model = rs.Object;
                                                    $rootScope.LotProductCode = $scope.model.LotProductCode;
                                                    $rootScope.ProductCode = $scope.model.ProductCode;
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

                dataservice.insert($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.model = rs.Object;
                        $rootScope.LotProductCode = $scope.model.LotProductCode;
                        $rootScope.ProductCode = $scope.model.ProductCode;
                    }
                });
            }
        }
    }
    
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };
    function loadDate() {
        $("#ManufactureDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ManufactureDate').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#ManufactureDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#ExpiryDate').datepicker('setStartDate', null);
        });
        
        //$("#ManufactureDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    //var maxDate = new Date(selected.date.valueOf());
        //    //$('#ToDate').datepicker('setStartDate', maxDate);
        //});
        //$("#ExpiryDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    //var maxDate = new Date(selected.date.valueOf());
        //    //$('#ToDate').datepicker('setStartDate', maxDate);
        //});\

        
    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.model1 = {
        x1: 1,
        x2: '',
        x3: '',
        x4: '',
        x1a: '',
        x2a: '',
        x3a: '',
        x4a: '',
    }
    $scope.x1 = function () {
        var qc = "";
        if ($scope.x4ass[$scope.model1.x1a] != undefined) {
            $scope.model1.x1
            qc = $scope.model1.x1 + 'x' + $scope.x4ass[$scope.model1.x1a] + " ";
        }
        if ($scope.x4ass[$scope.model1.x2a] != undefined)
            qc = qc + $scope.model1.x2 + 'x' + $scope.x4ass[$scope.model1.x2a] + " ";
        if ($scope.x4ass[$scope.model1.x3a] != undefined)
            qc = qc + $scope.model1.x3 + 'x' + $scope.x4ass[$scope.model1.x3a] + " ";
        if ($scope.x4ass[$scope.model1.x4a] != undefined)
            qc = qc + $scope.model1.x4 + 'x' + $scope.x4ass[$scope.model1.x4a];
        $scope.model.Packing = qc;
    }
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.listFileBox.push(rs.Object);
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }
    }
    $scope.removeFileReq = function (index) {
        $scope.listFileBox.splice(index, 1);
    }
    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError("Chưa hỗ trợ file này !");
        }
    }

    $scope.getQrCodeFromString = function () {
        dataservice.getQrCodeFromString($scope.model.LotProductCode, function (rs) {
            if (rs == null || rs == "")
                $scope.ImageBase = $rootScope.QrDefault;
            else
                $scope.ImageBase = rs;
        });
        dataservice.getBarCodeFromString($scope.model.LotProductCode, function (rs) {
            $scope.ImageBase1 = rs;
        });
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $filter) {
    $scope.listFileBox = [];
    $scope.removeFile = [];
    $scope.model = para;

    $scope.ImageBase = $rootScope.QrDefault;
    $scope.ImageBase1 = $rootScope.BarDefault;
    //$scope.model.sExpiryDate = ($scope.model.ExpiryDate != "" ? $filter('date')(new Date($scope.model.ExpiryDate), 'dd/MM/yyyy') : null);
    //$scope.model.sManufactureDate = ($scope.model.ManufactureDate != "" ? $filter('date')(new Date($scope.model.ManufactureDate), 'dd/MM/yyyy') : null);
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $rootScope.LotProductCode = $scope.model.LotProductCode;
    $scope.x4as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x3as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x2as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];
    $scope.x1as = [{ Code: 'C1', Name: "Thùng" }, { Code: 'C2', Name: "Bao" }, { Code: 'C3', Name: "Gói" }, { Code: 'C4', Name: "Chai" }];

    $scope.x4ass = {};
    $scope.x4ass[$scope.x4as[0].Code] = $scope.x4as[0].Name;
    $scope.x4ass[$scope.x4as[1].Code] = $scope.x4as[1].Name;
    $scope.x4ass[$scope.x4as[2].Code] = $scope.x4as[2].Name;
    $scope.x4ass[$scope.x4as[3].Code] = $scope.x4as[3].Name;
    $scope.x4ass[$scope.x4as[3].Code] = $scope.x4as[3].Name;

    $scope.model1 = {
        x1: 1,
        x2: '',
        x3: '',
        x4: '',
        x1a: '',
        x2a: '',
        x3a: '',
        x4a: '',
    }
    $scope.x1 = function () {
        var qc = "";
        if ($scope.x4ass[$scope.model1.x1a] != undefined) {
            $scope.model1.x1
            qc = $scope.model1.x1 + 'x' + $scope.x4ass[$scope.model1.x1a] + " ";
        }
        if ($scope.x4ass[$scope.model1.x2a] != undefined)
            qc = qc + $scope.model1.x2 + 'x' + $scope.x4ass[$scope.model1.x2a] + " ";
        if ($scope.x4ass[$scope.model1.x3a] != undefined)
            qc = qc + $scope.model1.x3 + 'x' + $scope.x4ass[$scope.model1.x3a] + " ";
        if ($scope.x4ass[$scope.model1.x4a] != undefined)
            qc = qc + $scope.model1.x4 + 'x' + $scope.x4ass[$scope.model1.x4a];
        $scope.model.Packing = qc;
    }
    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
        dataservice.getSuppliers(function (result) {
            $scope.suppliers = result;
        });
        dataservice.getOrigins(function (result) {
            $scope.origins = result;
        });
        dataservice.getStores(function (result) {
            $scope.stores = result;
        });
        dataservice.getFiles($scope.model.LotProductCode, function (result) {
            $scope.listFileBox = result;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reloadRoot();
    }
    $scope.initData1 = function () {
        dataservice.getItem($scope.model.Id, function (rs) {
            debugger
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                
                $scope.model = rs;
                $scope.model.sExpiryDate = ($scope.model.ExpiryDate != null ? $filter('date')(new Date($scope.model.ExpiryDate), 'dd/MM/yyyy') : null);
                $scope.model.sManufactureDate = ($scope.model.ManufactureDate != null ? $filter('date')(new Date($scope.model.ManufactureDate), 'dd/MM/yyyy') : null);
                $rootScope.LotProductCode = $scope.model.LotProductCode;
                $rootScope.ProductCode = $scope.model.ProductCode;
            }
        });
    }
    $scope.initData1();
    $scope.selectImage = function () {
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Title == "" || data.Title == null || data.Title == undefined) {
            $scope.errorTitle = true;
            mess.Status = true;
        } else {
            $scope.errorTitle = false;

        }
        if (data.LotProductCode == "" || data.LotProductCode == null || data.LotProductCode == undefined) {
            $scope.errorLotProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductCode = false;

        }


        if (data.LotProductName == "" || data.LotProductName == null || data.LotProductName == undefined) {
            $scope.errorLotProductName = true;
            mess.Status = true;
        } else {
            $scope.errorLotProductName = false;

        }
        return mess;
    };
    $scope.submit = function () {
        debugger
        //$scope.model.Cost = $rootScope.Cost;


        //$scope.model.Tax = $rootScope.Tax;
        //$scope.model.Discount = $rootScope.Discount;
        //$scope.model.PoundAge = $rootScope.PoundAge;

        $scope.listFileBox1 = [];
        for (var i = 0; i < $scope.listFileBox.length; ++i) {
            $scope.listFileBox1.push($scope.listFileBox[i]);
        }
        for (var i = 0; i < $scope.removeFile.length; ++i) {
            $scope.listFileBox1.push($scope.removeFile[i]);
        }
        $scope.model.LotFile = $scope.listFileBox1;
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {

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
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXIMUM);
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
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
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
                                            $scope.model.PathImg = '/uploads/images/' + rs.Object;
                                            if ($scope.model.Cost == '')
                                                $scope.model.Cost = 0;
                                            dataservice.update($scope.model, function (rs) {
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
                if ($scope.model.Cost == '')
                    $scope.model.Cost = 0;
                $scope.model.ExpiryDate = null;
                $scope.model.ManufactureDate = null;
                if ($scope.model.PoundAge == null)
                    $scope.model.PoundAge = 0;
                if ($scope.model.Discount == null)
                    $scope.model.Discount = 0;
                if ($scope.model.TransferCost == null)
                    $scope.model.TransferCost = 0;
                if ($scope.model.Tax == null)
                    $scope.model.Tax = 0;
                if ($scope.model.CustomFee == null)
                    $scope.model.CustomFee = 0;
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
    }
    
    function loadDate() {
        $("#ManufactureDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExpiryDate').datepicker('setStartDate', maxDate);
        });
        $("#ExpiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ManufactureDate').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#ManufactureDate').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#ExpiryDate').datepicker('setStartDate', null);
        });

        //$("#ManufactureDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    //var maxDate = new Date(selected.date.valueOf());
        //    //$('#ToDate').datepicker('setStartDate', maxDate);
        //});
        //$("#ExpiryDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    //var maxDate = new Date(selected.date.valueOf());
        //    //$('#ToDate').datepicker('setStartDate', maxDate);
        //});\


    }
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.loadFileReq = function (event) {
        var files = event.target.files;
        var checkExits = $scope.listFileBox.filter(k => k.FileName === files[0].name);
        if (checkExits.length == 0) {
            var formData = new FormData();
            formData.append("file", files[0] != undefined ? files[0] : null);

            dataservice.uploadFile(formData, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    if (rs.Object != null) {
                        rs.Object.Status = "ADD";
                        $scope.listFileBox.push(rs.Object);
                    }
                }
            });
        } else {
            App.toastrError("Tệp tin đã tồn tại!");
        }
    }

    $scope.removeFileReq = function (index) {

        var data = $scope.listFileBox[index];
        data.Status = "DELETE";
        $scope.removeFile.push(data);
        $scope.listFileBox.splice(index, 1);
    }
    $scope.viewFile = function (url) {
        var view = false;
        var viewImage = false;
        var idxDot = url.lastIndexOf(".") + 1;
        var extFile = url.substr(idxDot, url.length).toLowerCase();
        var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr'];
        var document = ['txt'];
        var word = ['docx', 'doc'];
        var pdf = ['pdf'];
        var powerPoint = ['pps', 'pptx'];
        var image = ['jpg', 'png', 'PNG'];
        if (excel.indexOf(extFile) != -1) {
            view = true;
        } else if (word.indexOf(extFile) != -1) {
            view = true;
        } else if (document.indexOf(extFile) != -1) {
            view = true;
        } else if (pdf.indexOf(extFile) != -1) {
            view = true;
        } else if (powerPoint.indexOf(extFile) != -1) {
            view = true;
        } else if (image.indexOf(extFile) != -1) {
            view = true;
            viewImage = true;
        } else {
            view = false;
        }

        if (view) {
            url = url.replace(" ", "%20");
            switch (viewImage) {
                case true:
                    window.open('' + window.location.origin + '' + url + '', '_blank');
                    break;
                case false:
                    window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
                    break;
            }
        } else {
            App.toastrError("Chưa hỗ trợ file này !");
        }
    }

    $scope.getQrCodeFromString = function () {
        dataservice.getQrCodeFromString($scope.model.LotProductCode, function (rs) {
            if (rs == null || rs == "")
                $scope.ImageBase = $rootScope.QrDefault;
            else
                $scope.ImageBase = rs;
        });
        dataservice.getBarCodeFromString($scope.model.LotProductCode, function (rs) {
            $scope.ImageBase1 = rs;
        });
    }
    $scope.getQrCodeFromString();
});

app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Category/JTableExtend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //.Id,
    //                            a.AttributeCode,
    //                            a.AttributeName,
    //                            a.Value,
    //                            a.Note,
    //                            a.CreatedTime
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //}).withOption('sClass', ''));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('ID').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle("Mã thuộc tính").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle("Tên thuộc tính").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle("Giá trị").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle("Ghi chú").renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle("Ngày thêm").renderWith(function (data, type) {
        //return data;
        return $filter("date")(new Date(data), "dd/MM/yyyy");
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        if ($rootScope.LotProductCode != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/moreAdd.html',
                controller: 'moreAdd',
                backdrop: true,
                size: '40'
            });
            modalInstance.result.then(function (d) {
                $scope.reload()
            }, function () { });
        }
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/moreEdit.html',
            controller: 'moreEdit',
            backdrop: true,
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteExtend(id, function (rs) {
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
app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkDataMore($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.LotProductCode == '') {
                App.toastrError("Vui lòng thêm sản phẩm trước");
            }
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataservice.insertProductAttribute($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
    }
    init();
});
app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getAttributeItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.updateAttribute($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataservice.gettreedataLevel(function (result) {
            $scope.treedataLevel = result;
        });
    }
    init();
});
app.controller('product', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.products = [];
    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.model = {
        ProductCode: '',
        Quantity: '',
    }
    $scope.isEdit = false;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LotProduct/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $rootScope.Cost = 0;
                $rootScope.Tax = 0;
                $rootScope.Discount = 0;
                $rootScope.PoundAge = 0;
                d.LotProductCode = $rootScope.LotProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
            $rootScope.Cost = $rootScope.Cost + (parseFloat(data.Cost) * parseFloat(data.Quantity));

            $rootScope.Tax = $rootScope.Tax + (parseFloat(data.Cost) * parseFloat(data.Quantity)) * (parseFloat(data.Tax))/100;
            $rootScope.Discount = $rootScope.Discount + (parseFloat(data.Cost) * parseFloat(data.Quantity)) * (parseFloat(data.Discount))/100;
            $rootScope.PoundAge = $rootScope.PoundAge + (parseFloat(data.Cost) * parseFloat(data.Quantity)) * (parseFloat(data.Commission))/100;


            $scope.datatable[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('Mã Qr').renderWith(function (data, type) {
        return '<img class=" image-upload h-50 w50" style="width:50px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sBarCode').withTitle('Mã BarCode').renderWith(function (data, type) {
        return '<img class=" image-upload " style="width:100px; height:50px" role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Tên sản phầm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('Số lượng').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('Giá').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tax').withTitle('Thuế(%)').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Discount').withTitle('Chiết khấu(%)').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Commission').withTitle('Hoa hồng(%)').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Lưu ý').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian thêm').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        if ($rootScope.LotProductCode != '') {
            vm.dtInstance.reloadData();
        }
    }
    $scope.add = function () {
        
            if ($rootScope.LotProductCode != '') {
                $scope.model.LotProductCode = $rootScope.LotProductCode;
                if ($scope.model.ProductCode != '' /*&& $scope.model.Quantity != '' && $scope.model.Cost != ''*/) {
                    if ($scope.Productform.validate()) {
                        var msg = $rootScope.checkProduct($scope.model);
                        if (msg.Status) {
                            App.toastrError(msg.Title);
                            return;
                        }
                        dataservice.insertProduct($scope.model, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            }
                            else {
                                App.toastrSuccess(rs.Title);
                                $scope.reload();
                                dataservice.getTaxCostMedium($rootScope.LotProductCode, function (rs) {
                                    $scope.model.TaxMedium = rs.TaxMedium;
                                    $scope.model.CostMedium = rs.CostMedium;
                                    $('#TaxMedium').val(rs.TaxMedium);
                                    $('#CostMedium').val(rs.CostMedium);
                                });
                            }
                        });
                    }
                    
                }
                else {
                    App.toastrError("Vui lòng chọn sản phẩm");
                }
            }
        
    }
    $scope.edit = function (id) {
        debugger
        var data = $scope.datatable[id];
        $scope.currentItemEdit = data;
        $scope.isEdit = true;
        $scope.model.ProductCode = data.ProductCode;
        $scope.model.ProductType = data.ProductType;
        $scope.model.Quantity = parseInt(data.Quantity);
        $scope.model.Cost = parseInt(data.Cost);
        $scope.model.Tax = parseInt(data.Tax);
        $scope.model.Discount = parseInt(data.Discount);
        $scope.model.Commission = parseInt(data.Commission);
        $scope.model.Note = data.Note;
        $('#Quantity').val("" + $scope.model.Quantity);
        $('#Cost').val("" + $scope.model.Cost);
        $('#Tax').val("" + $scope.model.Tax);
    }
    $scope.close = function () {
        $scope.isEdit = false;
        $scope.currentItemEdit = null;
        $scope.clearData();
    }
    $scope.save = function () {
        if ($rootScope.LotProductCode != '') {
            $scope.model1 = $scope.currentItemEdit;
            $scope.model1.ProductCode = $scope.model.ProductCode;
            $scope.model1.Quantity = $scope.model.Quantity;
            $scope.model1.Cost = $scope.model.Cost;
            $scope.model1.Tax = $scope.model.Tax;
            $scope.model1.Discount = $scope.model.Discount;
            $scope.model1.Commission = $scope.model.Commission;
            $scope.model1.Note = $scope.model.Note;
            $scope.model1.ProductType = $scope.model.ProductType;

            if ($scope.model1.ProductCode != '' && $scope.model1.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model1);
                if (msg.Status == true) {
                    App.toastrError(msg.Title);
                    return;
                }
                dataservice.updateProduct($scope.model1, function (rs) {
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $scope.close();
                        $scope.clearData();
                        dataservice.getTaxCostMedium($rootScope.LotProductCode, function (rs) {
                            $scope.model.TaxMedium = rs.TaxMedium;
                            $scope.model.CostMedium = rs.CostMedium;
                            $('#TaxMedium').val(rs.TaxMedium);
                            $('#CostMedium').val(rs.CostMedium);
                        });
                    }
                });
            }
            else {
                App.toastrWarning("Vui lòng chọn sản phẩm và số lượng");
            }
        }
    }

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType, item) {
        if (SelectType == "ProductCode") {
            debugger
            $scope.model.ProductType = item.ProductType;
        }
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteProduct(id, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            dataservice.getTaxCostMedium($rootScope.LotProductCode, function (rs) {
                                $('#TaxMedium').val(rs.TaxMedium);
                                $('#CostMedium').val(rs.CostMedium);
                            });
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
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
        //$('.end-date').click(function () {
        //    $('#DateFrom').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
    }
    loadDate();
    setTimeout(function () {
        loadDate();
    }, 200);
    function initData() {
        dataservice.getListProduct(function (result) {
            $scope.products = result;
        });
    }
    initData();
    
    $scope.clearData = function () {
        $scope.model.ProductCode = '';
        $scope.model.Quantity = '';
        $scope.model.Cost = '';
        $scope.model.Tax = '';
        $scope.model.Discount = '';
        $scope.model.Commission = '';
        $scope.model.Note = '';
    }
    $scope.changeProduct = function (indx) {
        var data = $scope.products[indx];
        console.log(data);
    }
});

app.controller('file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.products = [];
    $scope.datatable = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.currentItemEdit = null;
    $scope.model = {
        ProductCode: '',
        Quantity: '',
    }
    $scope.isEdit = false;
    $scope.dataJtable = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LotProduct/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.LotProductCode = $rootScope.LotProductCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
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
            $scope.datatable[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('Tên sản phầm').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('Số lượng').renderWith(function (data, type) {
        var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
        var document = ['.txt'];
        var word = ['.docx', '.doc'];
        var pdf = ['.pdf'];
        var powerPoint = ['.pps', '.pptx'];
        var image = ['.jpg', '.png', '.PNG'];

        if (excel.indexOf(data) !== -1) {
            return '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>';
        } else if (word.indexOf(data) !== -1) {
            return '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>';
        } else if (document.indexOf(data) !== -1) {
            return '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>';
        } else if (pdf.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(data) !== -1) {
            return '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>';
        } else if (image.indexOf(data) !== -1) {
            return '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>';
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Thời gian thêm').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('Người tạo').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.search = function () {
        if ($rootScope.LotProductCode != '') {
            vm.dtInstance.reloadData();
        }
    }
    $scope.add = function () {

        if ($rootScope.LotProductCode != '') {
            $scope.model.LotProductCode = $rootScope.LotProductCode;
            if ($scope.model.ProductCode != '' && $scope.model.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.insertProduct($scope.model, function (rs) {
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                });
            }
            else {
                App.toastrWarning("Vui lòng chọn sản phẩm và số lượng");
            }
        }

    }

    $scope.edit = function (id) {
        var data = $scope.datatable[id];
        $scope.currentItemEdit = data;
        $scope.isEdit = true;
        $scope.model.ProductCode = data.ProductCode;
        $scope.model.Quantity = data.Quantity;
    }
    $scope.close = function () {
        $scope.isEdit = false;
        $scope.model.ProductCode = '';
        $scope.model.Quantity = '';
        $scope.currentItemEdit = null;
    }
    $scope.save = function () {

        if ($rootScope.LotProductCode != '') {
            $scope.model1 = $scope.currentItemEdit;
            $scope.model1.ProductCode = $scope.model.ProductCode;
            $scope.model1.Quantity = $scope.model.Quantity;

            if ($scope.model1.ProductCode != '' && $scope.model1.Quantity != '') {
                var msg = $rootScope.checkProduct($scope.model1);
                if (msg.Status == true) {
                    App.toastrWarning(msg.Title);
                    return;
                }
                dataservice.updateProduct($scope.model1, function (rs) {
                    if (rs.Error == true) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $scope.close();
                    }
                });

            }
            else {
                App.toastrWarning("Vui lòng chọn sản phẩm và số lượng");
            }
        }

    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.deleteProduct(id, function (rs) {
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
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
        //$('.end-date').click(function () {
        //    $('#DateFrom').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateTo').datepicker('setStartDate', null);
        //});
    }
    loadDate();
    setTimeout(function () {
        loadDate();
    }, 200);
    function initData() {
        dataservice.getListProduct(function (result) {
            $scope.products = result;
        });
    }
    initData();

});
app.controller('fileAdd', function ($scope, $rootScope, $compile, $uibModalInstance, dataservice) {
    $scope.treeData = [];
    $scope.model = {
        FileName: '',
        Desc: '',
        RepoCode: '',
        SupplierId: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: 'root',
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        reposCode: result[i].ReposCode,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }
    $scope.searchRepository = function (search) {
        if (search != '' && search != undefined) {
            $("#treeDiv").jstree("close_all");
            $('#treeDiv').jstree(true).search(search);
        }
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning('Không tìm thấy kho lưu trữ');
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError("Vui lòng chọn tệp tin");
        } else {
            if ($scope.addformfile.validate()) {
                var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
                if (listNoteSelect.length == 0) {
                    App.toastrError("Vui lòng chọn kho dữ liệu");
                } else {

                    var data = new FormData();
                    data.append("FileUpload", file);
                    data.append("FileName", $scope.model.FileName);
                    data.append("Desc", $scope.model.Desc);
                    data.append("RepoCode", listNoteSelect[0].original.reposCode);
                    data.append("ProductCode", $rootScope.ProductCode);
                    dataservice.insertFile(data, function (result) {
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            }
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('fileEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.treeData = [];
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getFile(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
            }
        });
    }
    $scope.initData();
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.jtreeRepository(function (result) {
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả kho dữ liệu",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            for (var i = 0; i < result.length; i++) {
                if (result[i].Parent == '#') {
                    var data = {
                        id: result[i].ReposID,
                        parent: 'root',
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: result[i].ReposID,
                        parent: result[i].Parent,
                        text: result[i].ReposName,
                        reposCode: result[i].ReposCode,
                        state: { selected: true ? result[i].ReposCode == $scope.model.RepoCode : false, opened: true }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainRepository");
        });
    }

    $scope.searchRepository = function () {
        $("#treeDiv").jstree("close_all");
        $('#treeDiv').jstree(true).search($scope.model.Name);
    }
    $scope.searchTreeRepository = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning('Không tìm thấy kho lưu trữ');
        };
    }
    $scope.selectNodeRepository = function (node, selected, event) {
        $scope.model.Category = selected.node.original.id;
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
    };
    $scope.treeEvents = {
        //'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'search': $scope.searchTreeRepository,
    }
    $scope.submit = function () {
        var files = $("#File").get(0);
        var file = files.files[0];
        var fileName = '';
        if ($scope.editformfile.validate()) {
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            if (listNoteSelect.length == 0) {
                App.toastrError(caption.CUS_CURD_VALIDATE_REPOSITORY);
            } else {
                var data = new FormData();
                data.append("Id", $scope.model.Id);
                data.append("FileUpload", file);
                data.append("FileName", $scope.model.FileName);
                data.append("Desc", $scope.model.Desc);
                data.append("RepoCode", listNoteSelect[0].original.reposCode);
                dataservice.updateFile(data, function (result) {
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
        //var fileName = '';

        //if (file == null) {
        //    $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //    dataservice.updateFile($scope.model, function (result) {
        //        if (result.Error) {
        //            App.toastrError(result.Title);
        //        } else {
        //            App.toastrSuccess(result.Title);
        //            $uibModalInstance.close();
        //        }
        //    });
        //}
        //else {
        //    data.append("FileUpload", file);
        //    dataservice.uploadFile(data, function (rs) {
        //        if (rs.Error) {
        //            App.toastrError(result.Title);
        //            return;
        //        }
        //        else {
        //            $scope.model.SupplierId = $rootScope.Object.SupplierId;
        //            $scope.model.FileName = rs.Object;
        //            //$scope.model.CustomerID = $rootScope.CustomerId;
        //            $scope.model.FileUrl = '/uploads/files/' + $scope.model.FileName;
        //            $scope.model.FilePath = '~/upload/files/' + $scope.model.FileName;
        //            dataservice.updateFile($scope.model, function (result) {
        //                if (result.Error) {
        //                    App.toastrError(result.Title);
        //                } else {
        //                    App.toastrSuccess(result.Title);
        //                    $uibModalInstance.close();
        //                }
        //            });
        //        }
        //    });
        //}
    }
    setTimeout(function () {
        $scope.readyCB();
        setModalDraggable('.modal-dialog');
    }, 200);
});

