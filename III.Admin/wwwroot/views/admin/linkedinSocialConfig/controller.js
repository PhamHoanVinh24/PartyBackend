var ctxfolder = "/views/admin/linkedinSocialConfig";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "angularjs-dropdown-multiselect","ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber', 'youtube-embed']).
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
app.directive('webSocket', function ($timeout, $parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            function connect() {
                socket = new WebSocket("ws://localhost:9091");
                scope.socket = socket;
                socket.addEventListener('open', function (event) {
                    socket.send('Hello');
                });
                socket.addEventListener('close', function (event) {
                    setTimeout(function () {
                        connect();
                    }, 5000);
                });
                a = ''
                socket.addEventListener('message', function (event) {

                    console.log('Message from server ', event.data);
                    $timeout(function () {
                        if (a != event.data){
                            scope.model.Monitor += event.data + "\r\n";
                            a  = event.data
                            scope.$apply();
                        }
                       
                    })
                });
            }
            connect();
        }
    };
})
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
    return {
      
        getlistbot: function (callback) {
            $http.post('/Admin/BotSocialManagement/GetListBot').then(callback);
        },
        Updatebot: function (data, callback) {
            $http.post('/Admin/BotSocialManagement/UpdateCondition/', data).then(callback);
        },
        getconditon: function (data, callback) {
            $http.post('/Admin/FacebookSocialConfig/GetCondition?id=' + data).then(callback);
        },
        getbotsocial: function (data, callback) {
            $http.post('/Admin/FacebookSocialConfig/GetBotSocial?bottype=' + data).then(callback);
        },
        runcrawler: function (data, callback) {
            $http.post('/Admin/FacebookSocial/RunCrawler?id=' + data).then(callback);
        },
        stopcrawler: function (data, callback) {
            $http.post('/Admin/FacebookSocial/StopCrawler?id=' + data).then(callback);
        },
    };
});



app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        
    });
    $rootScope.isTranslate = false;
    $rootScope.open = true;

    // Get fullName with picture
    $scope.fullName = fullName;
    $scope.pictureUser = pictureUser;
    $rootScope.listStatus = [
        {
            Code: "AVAILABLE",
            Name: caption.LMS_SM_MSG_READY
        }, {
            Code: "UNAVAILABLE",
            Name: caption.LMS_SM_MSG_NOT_READY
        },];
    //$rootScope.listUnit = [
    //    {
    //        Code: "MINUTE",
    //        Name: caption.LMS_DASH_BOARD_TIME_MINUTE
    //    }, {
    //        Code: "HOUR",
    //        Name: caption.LMS_DASH_BOARD_TIME_HOURS
    //    },];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/FacebookSocialConfig/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolder + '/index-course.html',
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
app.controller('index', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.model = {
        Id :'',
        ConditionStatement: '',
        Image:''
    };
    $scope.clear = function () {
        $scope.model.Monitor = ''
    }
    // Post comment
    $scope.isruncommentpost = true;
    $scope.Stopcommentpost = function () {
        if (!$scope.isruncommentpost) {
            $scope.isruncommentpost = true;
        } else {
            $scope.isruncommentpost = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop post comment");
            };
        });
    }
    $scope.Runcommentpost = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isruncommentpost) {
                $scope.isruncommentpost = true;
            } else {
                $scope.isruncommentpost = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                postcomment = {
                    "Start post comment": decodeHTML(data.Post.Comment_post)
                }
                   
                ws.onopen = function () {
                    ws.send("Start Post comment");
                    ws.send(login)
                    ws.send(JSON.stringify(postcomment))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
       
    }
    // Post content
    $scope.isrunpostcontent = true;
    $scope.Stoppostcontent = function () {
        if (!$scope.isrunpostcontent) {
            $scope.isrunpostcontent = true;
        } else {
            $scope.isrunpostcontent = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop post content");
            };
        });
    }
    $scope.Runpostcontent = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isruncommentpost) {
                $scope.isrunpostcontent = true;
            } else {
                $scope.isrunpostcontent = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                postcontent = {
                    "Start post content": decodeHTML(data.Post.Main_post)
                }
                    
                ws.onopen = function () {
                    ws.send(login)
                    ws.send(JSON.stringify(postcontent))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // Get Post content
    $scope.isrungetpostcontent = true;
    $scope.Stopgetpostcontent = function () {
        if (!$scope.isrungetpostcontent) {
            $scope.isrungetpostcontent = true;
        } else {
            $scope.isrungetpostcontent = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop get post content");
            };
        });
    }
    $scope.Rungetpostcontent = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrungetpostcontent) {
                $scope.isrungetpostcontent = true;
            } else {
                $scope.isrungetpostcontent = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                get = {
                    "Start get content": decodeHTML(data.Get.Post)
                }
                ws.onopen = function () {

                    ws.send(JSON.stringify(get))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // Get Post comment
    $scope.isrungetpostcomment = true;
    $scope.Stopgetpostcomment = function () {
        if (!$scope.isrungetpostcomment) {
            $scope.isrungetpostcomment = true;
        } else {
            $scope.isrungetpostcomment = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop get post comment ");
            };
        });
    }
    $scope.Rungetpostcomment = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrungetpostcomment) {
                $scope.isrungetpostcomment = true;
            } else {
                $scope.isrungetpostcomment = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                data = JSON.parse(rs.ConditionStatement)
                get = decodeHTML(data.Get.Comment)
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(JSON.stringify(get))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // Like post
    $scope.isrunlikepost = true;
    $scope.Stoplikepost = function () {
        if (!$scope.isrunlikepost) {
            $scope.isrunlikepost = true;
        } else {
            $scope.isrunlikeposst = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop like post ");
            };
        });
    }
    $scope.Runlikepost = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrunlikepost) {
                $scope.isrunlikepost = true;
            } else {
                $scope.isrunlikepost = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                like = {
                    "Like post": decodeHTML(data.Like.Post)
                }
                    
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(like))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
       
    }
    // Unlike post
    $scope.isrununlikepost = true;
    $scope.Stopunlikepost = function () {
        if (!$scope.isrununlikepost) {
            $scope.isrununlikepost = true;
        } else {
            $scope.isrununlikepost = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            login = {
                UserName: rs.UserName,
                PassWord: rs.PassWord,
                Cookie: rs.Tocken
            }
            login = JSON.stringify(login)
            ws.onopen = function () {
                ws.send("Stop unlike post ");
            };
        });
    }
    $scope.Rununlikepost = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrununlikepost) {
                $scope.isrununlikepost = true;
            } else {
                $scope.isrununlikepost = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                unlike = {
                    Unlike: decodeHTML(data.Unlike.Post)
                }
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(unlike))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // like comment
    $scope.isrunlikecomment = true;
    $scope.Stoplikecomment = function () {
        if (!$scope.isrunlikecomment) {
            $scope.isrunlikecomment = true;
        } else {
            $scope.isrunlikecomment = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop post content");
            };
        });
    }
    $scope.Runlikecomment = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrunlikecomment) {
                $scope.isrunlikecomment = true;
            } else {
                $scope.isrunlikecomment = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                like = decodeHTML(data.Like.Comment)
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(like))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // unlike comment
    $scope.isrununlikecomment = true;
    $scope.Stopunlikecomment = function () {
        if (!$scope.isrununlikecomment) {
            $scope.isrununlikecomment = true;
        } else {
            $scope.isrununlikecomment = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop unlike comment");
            };
        });
    }
    $scope.Rununlikecomment = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrununlikecomment) {
                $scope.isrununlikecomment = true;
            } else {
                $scope.isrununlikecomment = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                unlike = {
                    Unlike_comment: decodeHTML(data.Unlike.Comment)
                }
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(unlike))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // Invite
    $scope.isruninvite = true;
    $scope.Stopinvite = function () {
        if (!$scope.isruninvite) {
            $scope.isruninvite = true;
        } else {
            $scope.isruninvite = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop Invite");
            };
        });
    }
    $scope.Runinvite = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isruninvite) {
                $scope.isruninvite = true;
            } else {
                $scope.isruninvite = false;
            }
            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                invite = {
                    "Invite": decodeHTML(data.Invite)
                }
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(invite))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
        
    }
    // Follow/Unfollow
    $scope.isrunfollow = true;
    $scope.Stopfollow = function () {
        if (!$scope.isrunfollow) {
            $scope.isrunfollow = true;
        } else {
            $scope.isrunfollow = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop follow");
            };
        });
    }
    $scope.Runfollow = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrunfollow) {
                $scope.isrunfollow = true;
            } else {
                $scope.isrunfollow = false;
            }

            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                invite = decodeHTML(data.Invite)
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(invite))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
       
    }
    // Add friend
    $scope.isrunaddfriend = true;
    $scope.Stopaddfriend = function () {
        if (!$scope.isrunaddfriend) {
            $scope.isrunaddfriend = true;
        } else {
            $scope.isrunaddfriend = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop add friend");
            };
        });
    }
    $scope.Runaddfriend = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrunaddfriend) {
                $scope.isrunaddfriend = true;
            } else {
                $scope.isrunaddfriend = false;
            }

            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                add = decodeHTML(data.Addfiend)
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(add))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }

    }
    // share post 
    $scope.isrunsharepost= true;
    $scope.Stopsharepost = function () {
        if (!$scope.isrunsharepost) {
            $scope.isrunsharepost = true;
        } else {
            $scope.isrunsharepost = false;
        }
        dataservice.stopcrawler($scope.model.Id, function (rs) {
            var ws = new WebSocket("ws://localhost:9091");
            rs = rs.data
            ws.onopen = function () {
                ws.send("Stop share post");
            };
        });
    }
    $scope.Runsharepost = function () {
        if ($scope.model.Id != "") {
            if (!$scope.isrunsharepost) {
                $scope.isrunsharepost = true;
            } else {
                $scope.isrunsharepost = false;
            }

            dataservice.runcrawler($scope.model.Id, function (rs) {
                var ws = new WebSocket("ws://localhost:9091");
                rs = rs.data
                login = {
                    UserName: rs.UserName,
                    PassWord: rs.PassWord,
                    Cookie: rs.Tocken
                }
                login = JSON.stringify(login)
                data = JSON.parse(rs.ConditionStatement)
                share = {
                    "Share post": decodeHTML(data.Sharepost)
                }
                ws.onopen = function () {
                    //ws.send("Start");
                    ws.send(login)
                    ws.send(JSON.stringify(share))

                };
            });
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }

    }
    $scope.listpage = [
        { 'label': 'Mentorglobals', 'id': 'Mentorglobals' },
        { 'label': 'Mentorglobals', 'id': 'Mentorglobals1' }

    ]
    $scope.listpost = [
        {'label':  '0'   ,'id':  '489386435547376'},
        { 'label': '1', 'id': '693412491811435' },
        { 'label': '2', 'id': '694079281744756' },
        { 'label': '3', 'id': '694116538407697' },
        { 'label': '4', 'id': '693412351811449' },
    ]
    $scope.listfriend = [
        { 'id': 'Nguyễn Huy', 'label': 'Nguyễn Huy' },
        { 'id': 'Tăng Văn Đức', 'label': 'Tăng Văn Đức' },
{ 'id': 'Mai Kiều Trang', 'label': 'Mai Kiều Trang' },
{ 'id': 'Lê Vy', 'label': 'Lê Vy' },
{ 'id': 'Nguyễn Cẩm Ly', 'label': 'Nguyễn Cẩm Ly' },
{ 'id': 'Bà Hoàng Rén War', 'label': 'Bà Hoàng Rén War' },
{ 'id': 'Nguyễn Tâm', 'label': 'Nguyễn Tâm' },
{ 'id': 'Nguyễn Nhân', 'label': 'Nguyễn Nhân' },
{ 'id': 'Aniss Aniss', 'label': 'Aniss Aniss' },
{ 'id': 'Đinh Thị Vinh', 'label': 'Đinh Thị Vinh' },
{ 'id': 'Thái Nguyễn', 'label': 'Thái Nguyễn' },
{ 'id': 'Bùi Minh Hoạt', 'label': 'Bùi Minh Hoạt' },
{ 'id': 'Uyên Trang Lâm', 'label': 'Uyên Trang Lâm' },
{ 'id': 'Thanh Thanh', 'label': 'Thanh Thanh' },
{ 'id': 'Nguyễn Ngọc Lệ', 'label': 'Nguyễn Ngọc Lệ' },
{ 'id': 'Lưu Đức', 'label': 'Lưu Đức' },
{ 'id': 'Võ Long', 'label': 'Võ Long' },
{ 'id': 'Vương Nguyễn', 'label': 'Vương Nguyễn' },
{ 'id': 'Thao Thức', 'label': 'Thao Thức' },
{ 'id': 'Khánh Linh', 'label': 'Khánh Linh' },
{ 'id': 'Tấn Khải', 'label': 'Tấn Khải' },
{ 'id': 'Ryan Pabalan', 'label': 'Ryan Pabalan' },
{ 'id': 'Nguyễn Mai', 'label': 'Nguyễn Mai' },
{ 'id': 'Hiếu Phạm Văn', 'label': 'Hiếu Phạm Văn' },
{ 'id': 'Linh Trương', 'label': 'Linh Trương' },
{ 'id': 'Nguyễn Mạnh Đức', 'label': 'Nguyễn Mạnh Đức' },
{ 'id': 'Trần Thị Lan', 'label': 'Trần Thị Lan' },
{ 'id': 'Daniel Holmes', 'label': 'Daniel Holmes' },
{ 'id': 'Hương Trà', 'label': 'Hương Trà' },
{ 'id': 'Trương Hải Hà', 'label': 'Trương Hải Hà' },
{ 'id': 'Nguyen Chuong', 'label': 'Nguyen Chuong' },
{ 'id': 'Viển Tran', 'label': 'Viển Tran' },
{ 'id': 'Nguyễn An', 'label': 'Nguyễn An' },
{ 'id': 'Hùng Phạm', 'label': 'Hùng Phạm' },
{ 'id': 'Tran Anh', 'label': 'Tran Anh' },
{ 'id': 'Vinh Nguyen', 'label': 'Vinh Nguyen' },
{ 'id': 'Long Trần', 'label': 'Long Trần' },
{ 'id': 'Nguyễn Khánh Duy', 'label': 'Nguyễn Khánh Duy' },
{ 'id': 'Nguyễn Minh Vũ', 'label': 'Nguyễn Minh Vũ' },
{ 'id': 'Đào Phượng', 'label': 'Đào Phượng' },
{ 'id': 'Long Nguyễn Văn', 'label': 'Long Nguyễn Văn' },
{ 'id': 'Bình Hoàng', 'label': 'Bình Hoàng' },
{ 'id': 'Phạm Đức Toản', 'label': 'Phạm Đức Toản' },
{ 'id': 'Pin Ten', 'label': 'Pin Ten' },
{ 'id': 'Hai Nguyen', 'label': 'Hai Nguyen' },
{ 'id': 'Trần Văn Vũ', 'label': 'Trần Văn Vũ' },
{ 'id': 'Thanh Lực', 'label': 'Thanh Lực' },
{ 'id': 'Nguyễn Tuyết', 'label': 'Nguyễn Tuyết' },
{ 'id': 'Vinh Lương', 'label': 'Vinh Lương' },
{ 'id': 'Ngọc Tài', 'label': 'Ngọc Tài' },
{ 'id': 'Văn Trong', 'label': 'Văn Trong' },
{ 'id': 'Trần Đức Việt ꪜ', 'label': 'Trần Đức Việt ꪜ' },
{ 'id': 'Tony Nguyen', 'label': 'Tony Nguyen' },
{ 'id': 'Hoa Dương', 'label': 'Hoa Dương' },
{ 'id': 'Ngocmy Tran', 'label': 'Ngocmy Tran' },
{ 'id': 'Đinh Văn Vỹ', 'label': 'Đinh Văn Vỹ' },
{ 'id': 'Trần Đại Nghĩa', 'label': 'Trần Đại Nghĩa' },
{ 'id': 'Nguyễn Hưng', 'label': 'Nguyễn Hưng' },
{ 'id': 'Lê Phan Anh', 'label': 'Lê Phan Anh' },
{ 'id': 'Jibril Muhammad', 'label': 'Jibril Muhammad' },
{ 'id': 'Long Tran', 'label': 'Long Tran' },
{ 'id': 'Trường Nguyễn', 'label': 'Trường Nguyễn' },
{ 'id': 'Trần Xuân Lộc', 'label': 'Trần Xuân Lộc' },
{ 'id': 'Linh Đàm', 'label': 'Linh Đàm' },
{ 'id': 'Andrew Dmoch', 'label': 'Andrew Dmoch' },
{ 'id': 'Trương Đình Lơi', 'label': 'Trương Đình Lơi' },
{ 'id': 'Lê Tuấn Anh', 'label': 'Lê Tuấn Anh' },
{ 'id': 'Hang Bui', 'label': 'Hang Bui' }
    ]
    $scope.selectedpage_share = []
    $scope.selectedgroup_share = []
    $scope.selectedpost_share = []
    $scope.selectedgroup_add = []
    $scope.selectedgroup = []
    $scope.selectedpost = []
    $scope.selectedgroup_comment = []
    $scope.selectedgroup_get_content = []
    $scope.selectedgroup_get_comment = []
    $scope.selectedgroup_like = []
    $scope.selectedgroup_invite = []
    $scope.selectedfriend_invite = []
    $scope.listsearch = []
    $scope.selectedpage_invite = [{'id': 'Mentorglobals' }]
    $scope.ConditionStatement = {
        
        Post:
        {
            Main_post:
            {
                content: "",
                media: ""
            },
            Comment_post:
            {
                content: "",
                media: ""

            }

        },

        Get:
        {
            Post:
            {
                post: [],
                keywords: [],
                from: "",
                to: ""
            },

            Comment:
            {
                post: [],
                keywords: [],
                from: "",
                to: ""
            }
        },

        Like:
        {
            Post:
            {
                post: ["https://www.linkedin.com/posts/trang-pham-2040a172_headhunt-igloo-activity-6922459579293323264-ix6U?utm_source=linkedin_share&utm_medium=member_desktop_web"],
                keywords: [],
                from: "",
                to: ""
            },

            Comment:
            {
                post: [],
                post: "",
                keywords: [],
                from: "",
                to: ""
            }
        },
        Unlike:
        {
            Post:
            {
                post: ["https://www.linkedin.com/posts/trang-pham-2040a172_headhunt-igloo-activity-6922459579293323264-ix6U?utm_source=linkedin_share&utm_medium=member_desktop_web"],
                keywords: [],
                from: "",
                to: ""
            },

            Comment:
            {
                post: [],
                keywords: [],
                from: "",
                to: ""
            }
        },
        Invite:
        {
            name:[]
                
        },
        Follow:
        {
            Name: $scope.listsearch
        },
        Unfollow:
        {
            friends: []
        },
        Sharepost: {
            post: [],
            group: [],
            page: [],
            friends: [],
            content:''
        },
        Addfiend:
        {
            group: []
        }
        
    }
    $scope.showcondition = function () {
        dataservice.getconditon($scope.model.Id, function (rs) { // bot code is set to 1
            rs = rs.data;
            a = rs[0].ConditionStatement
            //View data lên các tab
            a = JSON.parse(a)
            $scope.selectedgroup = a.Post.Main_post.Group
            //$scope.selectedgroup_invite = a.Invite.Group
            //$scope.selected_friend= a.Invite.friends
            $scope.ConditionStatement.Post.Main_post.Group = a.Post.Main_post.Group
            $scope.ConditionStatement.Post.Main_post.friends = a.Post.Main_post.friends
            $scope.ConditionStatement.Post.Main_post.content.content = a.Post.Main_post.content.content
            //$scope.ConditionStatement.Post.Main_post.content.image = a.Post.Main_post.content.image

            $scope.ConditionStatement.Post.Main_post.content.video = a.Post.Main_post.content.video

            $scope.ConditionStatement.Post.Comment_post.Group = a.Post.Comment_post.Group
            $scope.ConditionStatement.Post.Comment_post.post = a.Post.Comment_post.post
            $scope.ConditionStatement.Post.Comment_post.friends = a.Post.Comment_post.friends
            $scope.ConditionStatement.Post.Comment_post.content.content = a.Post.Comment_post.content.content
            $scope.ConditionStatement.Get.Post.from = a.Get.Post.from
            $scope.ConditionStatement.Get.Post.Group = a.Get.Post.Group

            $scope.ConditionStatement.Get.Post.to = a.Get.Post.to
            $scope.ConditionStatement.Get.Post.friends = a.Get.Post.friends
            $scope.ConditionStatement.Get.Post.keywords = a.Get.Post.keywords
            $scope.ConditionStatement.Get.Comment.from = a.Get.Comment.from
            $scope.ConditionStatement.Get.Comment.to = a.Get.Comment.to
            $scope.ConditionStatement.Get.Comment.friends = a.Get.Comment.friends
            $scope.ConditionStatement.Get.Comment.keywords = a.Get.Comment.keywords
            $scope.ConditionStatement.Like.Post.Group = a.Like.Post.from
            $scope.ConditionStatement.Like.Post.from = a.Like.Post.from
            $scope.ConditionStatement.Like.Post.to = a.Like.Post.to
            $scope.ConditionStatement.Like.Post.friends = a.Like.Post.friends
            $scope.ConditionStatement.Like.Post.keywords = a.Like.Post.keywords
            $scope.ConditionStatement.Like.Comment.from = a.Like.Comment.from
            $scope.ConditionStatement.Like.Comment.to = a.Like.Comment.to
            $scope.ConditionStatement.Like.Comment.friends = a.Like.Comment.friends
            $scope.ConditionStatement.Like.Comment.keywords = a.Like.Comment.keywords
            $scope.ConditionStatement.Unlike.Post.Group = a.Unlike.Post.Group
            $scope.ConditionStatement.Unlike.Post.from = a.Unlike.Post.from
            $scope.ConditionStatement.Unlike.Post.to = a.Unlike.Post.to
            $scope.ConditionStatement.Unlike.Post.friends = a.Unlike.Post.friends
            $scope.ConditionStatement.Unlike.Post.keywords = a.Unlike.Post.keywords
            $scope.ConditionStatement.Unlike.Comment.Group = a.Unlike.Comment.Group
            $scope.ConditionStatement.Unlike.Comment.post = a.Unlike.Comment.post
            $scope.ConditionStatement.Unlike.Comment.from = a.Unlike.Comment.from
            $scope.ConditionStatement.Unlike.Comment.to = a.Unlike.Comment.to
            $scope.ConditionStatement.Unlike.Comment.friends = a.Unlike.Comment.friends
            $scope.ConditionStatement.Unlike.Comment.keywords = a.Unlike.Comment.keywords
            $scope.selectedgroup_invite= a.Invite.Group
            $scope.selectedfriend_invite = a.Invite.friends
            $scope.selectedgroup_share = a.Sharepost.group
            $scope.ConditionStatement.Sharepost.friends = a.Sharepost.friends
            $scope.selectedpage_share = a.Sharepost.page
            $scope.selectedpost_share = a.Sharepost.post
            $scope.selectedgroup_add = a.Addfiend.group




        })
    }

    $scope.addkey = function () {
                var obj = {
                    Name: $scope.model.Name,
                }

                var checkExit = $scope.listsearch.find(function (element) {
                    if (element.Name == obj.Name) return true;
                });

                if (checkExit != '' && checkExit != null && checkExit != undefined) {
                    return App.toastrError('Tên đã tồn tại'); // LMS_SUBJECT_CODE_EXIST
                }                     
        $scope.listsearch.push(obj.Name);
        $scope.model.Name = ''
    };
    $scope.deletekey = function (data) {
        if ($scope.listsearch.indexOf(data) != -1) {
            App.toastrError(caption.COM_ERR_DELETE);
        } else {
            $scope.listsearch.splice($scope.listsearch.indexOf(data), 1);
        }
    };


    // Unlikecomment
    $scope.addKeyword = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Unlike.Comment.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Unlike.Comment.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords = "";

    }
    // Getmainpost
    $scope.addKeyword1 = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.KeyWord;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Get.Post.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Get.Post.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.KeyWord = "";

    }
    // Getcommentpost
    $scope.addKeyword2 = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords2;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Get.Comment.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Get.Comment.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords2 = "";
    }

    // Unlikepost
    $scope.addKeyword3 = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords3;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Unlike.Post.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Unlike.Post.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords3 = "";

    }
    // Likepost
    $scope.addKeyword4 = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords4;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Like.Post.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Like.Post.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords4 = "";
    }

    // likecomment
    $scope.addKeyword5 = function () {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords5;
        // nếu keyword chưa có 
        if ($scope.ConditionStatement.Like.Comment.keywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.ConditionStatement.Like.Comment.keywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords5 = "";

    }
    $scope.submitbot = function () {

        if ($scope.model.Id != "") {
            /*a = CKEDITOR.instances.Content.getData()
            $scope.ConditionStatement.Post.Main_post.content = decodeHTML(a);
            c = CKEDITOR.instances.sharepost_ct.getData()
            $scope.ConditionStatement.Sharepost.content = decodeHTML(c);
            b = CKEDITOR.instances.Contentcm.getData
            $scope.ConditionStatement.Post.Comment_post.content = decodeHTML(b);*/

            $scope.ConditionStatement.Invite.Group = $scope.selectedgroup_invite
            $scope.ConditionStatement.Invite.page = $scope.selectedpage_invite
            $scope.ConditionStatement.Invite.friends = $scope.selectedfriend_invite

            $scope.ConditionStatement.Like.Post.Group = $scope.selectedgroup_like
            $scope.ConditionStatement.Sharepost.post = $scope.selectedpost_share
            $scope.ConditionStatement.Sharepost.group = $scope.selectedgroup_share
            $scope.ConditionStatement.Get.Post.Group = $scope.selectedgroup_get_content
            $scope.model.ConditionStatement = JSON.stringify($scope.ConditionStatement)
            dataservice.Updatebot($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);

                } else {
                    return App.toastrSuccess(rs.Title);
                }
                                $rootScope.reloadNoResetPage();
            });
            showcondition()
        }
        else {
            return App.toastrError("Vui lòng chọn Bot Social")
        }
    };
    $scope.initData = function () {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "https://graph.facebook.com/v13.0/158547376613081/groups?access_token=EAAPnFtt7bUMBAKElqrUElc9cdVyIottJ4rBMjiOPJVZA8XkyWKr43CixsvgV2CaUyHetSha7mwo2Hvm6XuYFhncMsCZABuJZCNlpoE1ubvxWOcloqTqxs7PjAJTr2wzwrSeYMa7Olj3NsQFNZAW37ae9b5rWay6FlPa3x6qnOadNigYb9yek0PypGfZAZCiMrZA40SGw6Q4ZA0VuHYftOqWiVWC0ZBBx87JMZA6BQDbmKa8AgynOdoYBQg&pretty=0&limit=500&after=QVFIUk5LazNvZAVo0bHhXWXBIbUN3aU9uemJaQTFmM0ZAralBXVTBnekRWd3lrN3doUnR4blJOSy1WNGFLZAjFuY3ViWWtaVzVzTmVCclBuaFlLX2VQSm5BYWJn", false); // false for synchronous request
        xmlHttp.send(null);
        a = xmlHttp.responseText;
        i=0
        for (; a[i];) {
            a = decodeHTML(a);
            i++;
        }
        a= JSON.parse(a)
        $scope.listgroup = a.data

    };

    dataservice.getbotsocial(8,function (rs) {
        rs = rs.data;
        $scope.listbot = rs;
    });
    $scope.initData();

    $scope.mediaChecked = false;
    $scope.mediaIndex = "";
    $scope.listMediaType = [
        {
            Code: "VIDEO",
            Name: "Video", /*COM_MEDIA_VIDEO*/
            Icon: "video",
            Url: "",
            Check: false
        },
        {
            Code: "IMAGE",
            Name: "Image", /*COM_MEDIA_IMAGE*/
            Icon: "image",
            Url: "",
            Check: false
        },

    ];
    $scope.addMedia = function (index) {
        $scope.mediaIndex = index;
        $scope.listMediaType[$scope.mediaIndex].Check = true;
        media.Check = true;
    }
    $scope.deleteMedia = function (media) {
        media.Url = "";
        $scope.mediaChecked = false;
        media.Check = false;
    }
    $scope.addMediaAnswer = function (index) {
        $scope.mediaIndexAnswer = index;
    }
    $scope.loadFileQuiz = function (event) {
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ObjectCode = $rootScope.ObjCode;
            data.ObjectType = $rootScope.ObjectTypeFile;
            data.ModuleName = "SUBJECT";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.listMediaType[$scope.mediaIndex].Check = true;
                    $scope.listMediaType[$scope.mediaIndex].Url = result.Object;
                    $scope.mediaChecked = true;
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {

            });
        }
    };

    $scope.viewFile = function (link, type) {
        if (type == "VIDEO") {
            $scope.showVideo(link);
        }
        if (type == "VOICE") {
            $scope.playAudio(link);
        }
        if (type == "IMAGE") {
            $scope.viewImage(link);
        }
    }

   

    $scope.reload = function () {
        reloadData(true);
    };
    $rootScope.reloadSubject = function () {
        reloadData(false);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            str = str.replace('\n', '');
            str = str.replace('name', 'label');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
    
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
      


    }, 500);
});


