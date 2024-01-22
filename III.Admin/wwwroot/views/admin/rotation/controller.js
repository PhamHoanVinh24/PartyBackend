var ctxfolder = "/views/admin/rotation";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]);

app.factory('dataservice', function ($http) {
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
    return {

    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {


    //$translateProvider.useUrlLoader('/Admin/Language/Translation');
    //caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    setTimeout(function () {
        var oMain = new CMain({
            start_credit: 200, //Starting credits value
            start_bet: 10,     //Base starting bet. Will increment with multiplier in game
            bet_offset: 10,    //Bet Offset
            max_bet: 100,      //Max multiplier value

            bank_cash: 4000,  //Starting credits owned by the bank. When a player win, founds will be subtract from here. When a player lose or bet, founds will be added here. If 0 players always lose.
            win_occurrence: 60, //Win occurrence. Determines whether player will win more then he's current bet, according to bank_cash. If bank_cash is 0

            //wheel_settings sets the values and probability of each prize in the wheel ([prize, win occurence percentage]). Value*max_bet can't exceed 9999999.
            //PAY ATTENTION: the total sum of win occurences must be 100!
            //prize=0 or less, is considered as "lose". So Leds will play a lose animation.
            wheel_settings: [
                { prize: 10, win_occurence: 7 }, { prize: 30, win_occurence: 6 }, { prize: 60, win_occurence: 6 }, { prize: 90, win_occurence: 6 }, { prize: 0, win_occurence: 5 },
                { prize: 20, win_occurence: 6 }, { prize: 60, win_occurence: 5 }, { prize: 120, win_occurence: 4 }, { prize: 200, win_occurence: 3 }, { prize: 0, win_occurence: 5 },
                { prize: 40, win_occurence: 5 }, { prize: 30, win_occurence: 5 }, { prize: 20, win_occurence: 6 }, { prize: 10, win_occurence: 7 }, { prize: 0, win_occurence: 5 },
                { prize: 80, win_occurence: 4 }, { prize: 60, win_occurence: 4 }, { prize: 40, win_occurence: 5 }, { prize: 1000, win_occurence: 1 }, { prize: 0, win_occurence: 5 }
            ],

            anim_idle_change_frequency: 10000,  //Duration (in ms) of current led idle animation, before it change with another.
            led_anim_idle1_timespeed: 2000,     //Time speed (in ms) of led animation idle 1. Less is faster.
            led_anim_idle2_timespeed: 100,      //Time speed (in ms) of led animation idle 2. Less is faster.
            led_anim_idle3_timespeed: 150,      //Time speed (in ms) of led animation idle 3. Less is faster.

            led_anim_spin_timespeed: 50,        //Time speed (in ms) of led animation spin. Less is faster.

            led_anim_win_duration: 5000,        //Duration (in ms) of current led win animation, before it change with the idle.
            led_anim_win1_timespeed: 300,       //Time speed (in ms) of led animation win 1. Less is faster.
            led_anim_win2_timespeed: 50,        //Time speed (in ms) of led animation win 2. Less is faster.

            led_anim_lose_duration: 5000,        //Duration (in ms) of led lose animation, before it change with the idle.


            //////////////////////////////////////////////////////////////////////////////////////////
            ad_show_counter: 5     //NUMBER OF SPIN BEFORE AD SHOWN
            //
            //// THIS FUNCTIONALITY IS ACTIVATED ONLY WITH CTL ARCADE PLUGIN.///////////////////////////
            /////////////////// YOU CAN GET IT AT: /////////////////////////////////////////////////////////
            // http://codecanyon.net/item/ctl-arcade-wordpress-plugin/13856421?s_phrase=&s_rank=27 ///////////

        });


        $(oMain).on("start_session", function (evt) {
            
            if (getParamValue('ctl-arcade') === "true") {
                parent.__ctlArcadeStartSession();
            }
            //...ADD YOUR CODE HERE EVENTUALLY
        });

        $(oMain).on("end_session", function (evt) {
            if (getParamValue('ctl-arcade') === "true") {
                parent.__ctlArcadeEndSession();
            }
            //...ADD YOUR CODE HERE EVENTUALLY
        });

        $(oMain).on("save_score", function (evt, iScore) {
            if (getParamValue('ctl-arcade') === "true") {
                parent.__ctlArcadeSaveScore({ score: iScore });
            }
            //...ADD YOUR CODE HERE EVENTUALLY
        });

        $(oMain).on("show_interlevel_ad", function (evt) {
            if (getParamValue('ctl-arcade') === "true") {
                parent.__ctlArcadeShowInterlevelAD();
            }
            //...ADD YOUR CODE HERE EVENTUALLY
        });

        $(oMain).on("share_event", function (evt, iScore, szImage, szTitle, szMsg, szMsgShare) {
            if (getParamValue('ctl-arcade') === "true") {
                parent.__ctlArcadeShareEvent({
                    img: szImage,
                    title: szTitle,
                    msg: szMsg,
                    msg_share: szMsgShare
                });
            }
            //...ADD YOUR CODE HERE EVENTUALLY
        });

        if (isIphone()) {
            setTimeout(function () { sizeHandler(); }, 200);
        } else {
            sizeHandler();
        }
    }, 200);
});
