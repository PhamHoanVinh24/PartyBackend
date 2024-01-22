/*=========================================================================================
  File Name: custom-menu.js
  Description: avtive menu,expand,collapse menu
  initialization and manipulations
  ----------------------------------------------------------------------------------------
  Item Name: Robust - Responsive Admin Theme
  Version: 1.2
  Author: GeeksLabs
  Author URL: http://www.themeforest.net/user/geekslabs
==========================================================================================*/
var config = {
    init: function () {
        config.comboboxClick();
        config.comboboxLiClick();
        config.blurClick();
    },
    comboboxClick: function () {
        $("#customCombobox1").click(function () {
            //Get ul tag
            var dropDwn = $(this).next();
            //Show Dropdown
            if (dropDwn.is(":visible"))
                dropDwn.hide();
            else
                dropDwn.show();
        })
    },
    comboboxLiClick: function () {
        $("#ulcustomCombobox1 li").click(function () {
            var cmbBox = $(this).parent().prev();
            var html = $(this).html();
            cmbBox.html(html);
            $(this).parent().hide();
            $('#Culture').val($(this).attr("id"));
            location.href = '/Admin/Language/SetCulture?lang=' + $(this).attr("id");
        });
    },
    blurClick: function () {
        $(document).on('click', function (e) {
            var element, evt = e ? e : event;
            if (evt.srcElement)
                element = evt.srcElement;
            else if (evt.target)
                element = evt.target;
            //Hide if clicked outside
            if (element.className != "customCombobox") {
                $("ul.ulcustomCombobox").hide();
            }
        });
    },
    sendOTP: function () {
        var userName = $('#UserName').val();
        if (userName === undefined || userName === null || userName === '') {
            App.toastrError('Vui lòng nhập tài khoản');
            return;
        }

        $.post('/MobileLogin/SendOTP?UserName=' + userName, function (res, status, xhr) {
            if (res.Error) {
                App.toastrError(res.Title);
            } else {
                App.toastrSuccess(res.Title);
            }
        });
    }
};

$(document).ready(function () {
    //config.init();
});




