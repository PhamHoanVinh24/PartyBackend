var ctxfolder = "/views/front-end/user";
var app = angular.module('App_ESEIM', ["ngRoute"])
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
        //InsertFamily
        insertFamily: function (data, callback) {
            $http.post('/UserProfile/InsertFamily/', data).then(callback); 
        },
        getFamilyByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetFamilyByProfileCode?profileCode=', data).then(callback); 
        },

        updateFamily: function (data, callback) {
            $http.post('/UserProfile/UpdateFamily/', data).then(callback); 
        },
        //PartyAdmissionProfile
        getPartyAdmissionProfileByUsername: function (data, callback) {
            $http.get('/UserProfile/GetPartyAdmissionProfileByUsername?Username=' + data).then(callback);
        },
        
        getPartyAdmissionProfileByUserCode: function (data, callback) {
            $http.get('/UserProfile/GetPartyAdmissionProfileByUserCode?Id=' + data).then(callback);
        },
        
        insert: function (data, callback) {
            $http.post('/UserProfile/InsertPartyAdmissionProfile/', data).then(callback);
            
        },
        update: function (data, callback) {
            $http.put('/UserProfile/UpdatePartyAdmissionProfile/', data).then(callback);
            
        },
        delete: function (data, callback) {
            $http.delete('/UserProfile/DeletePartyAdmissionProfile?Id=', data).then(callback);
        },
        //PersonalHistory
        getPersonalHistoryByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetPersonalHistoryByProfileCode?profileCode=', data).then(callback);  
        },
        
        getPersonalHistoryById: function (data, callback) {
            $http.post('/UserProfile/GetPersonalHistoryById?id=', data).then(callback);  
        },
        
        updatePersonalHistories: function (data, callback) {
            $http.post('/UserProfile/UpdatePersonalHistories/', data).then(callback);  
        },
        updatePersonalHistory: function (data, callback) {
            $http.post('/UserProfile/UpdatePersonalHistory/', data).then(callback);  
        },
        deletePersonalHistory: function (data, callback) {
            $http.delete('/UserProfile/DeletePersonalHistory/', data).then(callback);  
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
        getPartyAdmissionProfileByUserCode: function (data, callback) { 
            $http.post('"/UserProfile/GetPartyAdmissionProfileByUserCode?Id="', data).then(callback); 
        },

        //award 
        getAwardById: function (data, callback) {
            $http.post('/UserProfile/GetAwardById?id=', data).then(callback);  
        },
        getAwardByProfileCode: function (data, callback) {
            $http.post('/UserProfile/GetAwardByProfileCode?profileCode=', data).then(callback);  
        },
        insertAward: function (data, callback) {
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
        insertPersonalHistory: function (data, callback) {
            $http.post('/UserProfile/InsertPersonalHistory/', data).then(callback);

        },
        insertWarningDisciplined: function (data, callback) {
            $http.post('/UserProfile/InsertWarningDisciplined/', data).then(callback);

        },

        //Đi du lịch
        getGoAboardById: function (data, callback) {
            $http.post('/UserProfile/GetGoAboardById?id=', data).then(callback);  
        },
        insertGoAboard: function (data, callback) {
            $http.post('/UserProfile/InsertGoAboard/', data).then(callback);
        },
        updateGoAboard: function (data, callback) {
            $http.post('/UserProfile/UpdateGoAboard/', data).then(callback);

        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, dataservice) {

});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/err',{
            templateUrl: ctxfolder + '/index.html',
            controller: 'err'
        })
});

app.controller('index', function ($scope, $rootScope, $compile, dataservice, $filter,$http) {
    console.log("indeeeeee");
    
    $scope.fileNameChanged = function () {
        $scope.openExcel = true;
        setTimeout(function () {
            $scope.$apply();
        });
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
            $scope.JSONobjj = handleTextUpload(txt)
            console.log($scope.JSONobj);
        }
    };
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
    var today = new Date();
    
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
    $scope.SelfComment = {};
    function handleTextUpload(txt) {
        $scope.defaultRTE.value = txt;
        setTimeout(function () {
            $scope.Email = 'NguyenHuy@gmail.com';
            var today = new Date();
            var resumeNumber = today.getFullYear() + '' + (today.getMonth() + 1) + '' + today.getDate();
            console.log(resumeNumber);
            var listPage = document.querySelectorAll(".Section0 > div > table");
            console.log(listPage)
            //Page2 Lịch sử bản thân
            var listTagpinPage1 = listPage[1].querySelectorAll("tbody > tr > td > p");
            var objPage1 = Array.from(listTagpinPage1).filter(function (element) {
                // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
                var textContent = element.textContent.trim();
                return textContent.length > 0 && /\+/.test(textContent);
            });

            //đối tượng lưu thông tin lịch sử bản thân dưới bằng mảng
            
            for (let i = 0; i < objPage1.length; i++) {
                var PersonHis = {};
                // Sửa lỗi ở đây, sử dụng indexOf thay vì search và sửa lỗi về cú pháp của biểu thức chấm phẩy
                PersonHis['Begin']= objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') - 7, 7).trim(),
                PersonHis['End'] = objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') + 1, 7).trim(),
                // Sửa lỗi ở đây, sử dụng split(':') để tách thời gian và thông tin
                PersonHis['Content'] = objPage1[i].innerText.split(':')[1];
                $scope.PersonalHistory.push(PersonHis);
            }
            console.log('PersonalHistory', $scope.PersonalHistory)

            
            
            //Page3 Những nơi công tác và chức vụ đã qua
            var datapage2 = Array.from(listPage[2].querySelectorAll('tr:nth-child(2) > td > p'))
                .filter(function (element) {
                    return element.textContent.trim().length > 0;
                })
                .map(function (element) {
                    return element.innerText.trim();
                });

            var datapage2 = Array.from(listPage[2].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP2s = [];
            datapage2.forEach(function (datapage2Element) {
                var pInTr = Array.from(datapage2Element.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });;
                pElementP2s.push(pInTr);
            })
            
            for (let i = 0; i < pElementP2s.length; i++) {
                var begin = pElementP2s[i][0].substr(pElementP2s[i][0].indexOf('-') - 2, 7);
                var end = pElementP2s[i][0].substr(pElementP2s[i][0].lastIndexOf('-') - 2, 7);
                var BusinessNDutyObj = {
                    From: begin,
                    To: end,
                    Work: pElementP2s[i][1],
                    Role: pElementP2s[i][2]
                };
                $scope.BusinessNDuty.push(BusinessNDutyObj);
            }
            console.log('BusinessNDuty', $scope.BusinessNDuty)

            //pag4: những lớp đào tạo bồi dưỡng đã qa
            var datapage4 = Array.from(listPage[4].querySelectorAll('tr:nth-child(n+2)'));
            var pElementP4s = [];
            datapage4.forEach(function (e) {
                var pInTr = Array.from(e.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP4s.push(pInTr);
            });

            console.log(pElementP4s)

            $scope.PassedTrainingClasses = [];
            let check = 0;

            for (let i = 0; i < pElementP4s.length; i++) {
                var obj = {
                    SchoolName: pElementP4s[i][0],
                    Class: pElementP4s[i][1],
                    From: pElementP4s[i][2].substring(0, pElementP4s[i][2].indexOf('đến')),
                    To: pElementP4s[i][2].substring(pElementP4s[i][2].lastIndexOf('đến') + 4).trim(),
                    Certificate: pElementP4s[i][1]
                };
                $scope.PassedTrainingClasses.push(obj);
                check = 1;
            }
            if (check === 1) {
                var ttpd = document.getElementById("TTPD")
                var llgd = document.getElementById("LLGD")
                var lsbt = document.getElementById("LSBT")
                var gtvd = document.getElementById("GTVD")

                console.log(llgd)

                llgd.style.opacity = 1;
                llgd.style.pointerEvents = "auto";

                lsbt.style.opacity = 1;
                lsbt.style.pointerEvents = "auto";

                gtvd.style.opacity = 1;
                gtvd.style.pointerEvents = "auto";

                ttpd.style.display = "block";

                check = 0;
            }
            console.log('PassedTrainingClasses', $scope.PassedTrainingClasses)



            var data = Array.from(listPage[3].querySelectorAll('td > p')).filter(function (ele) {
                return ele.innerText.trim().length > 0;
            }).map(function (element) {
                return element.innerText.trim();
            });
            function isTime(e) {
                return (e.includes('Ngày') && e.includes('tháng') && e.includes('năm')) ? true : false;
            }
            
            for (let i = 0; i < data.length; i++) {
                var obj = {
                    time: null,
                    content: null
                };
                if (isTime(data[i])) {
                    obj.MonthYear = data[i].substr(data[i].indexOf("Ngày") + 4, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("tháng") + 5, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("năm") + 4, 5),
                    obj.Content = data[i + 1];
                }
                if (obj.MonthYear != null && obj.Content != null) {
                    $scope.HistoricalFeatures.push(obj);
                }
            }
            console.log("HistoricalFeatures:", $scope.HistoricalFeatures);
            //Page 5 Di nuoc nguoai
            var datapage5 = Array.from(listPage[5].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP5s = [];
            datapage5.forEach(function (datapage5Elemnt) {
                var pInTr = Array.from(datapage5Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP5s.push(pInTr);
            })
            for (let i = 0; i < pElementP5s.length; i++) {

                var GoAboardObj = {
                    From: pElementP5s[i][0].substring(pElementP5s[i][0].indexOf("Từ") + 2, pElementP5s[i][0].indexOf("đến")).trim(),
                    To: pElementP5s[i][0].substring(pElementP5s[i][0].indexOf("đến") + 3).trim(),
                    Contact: pElementP5s[i][1],
                    Country: pElementP5s[i][2]
                };
                $scope.GoAboard.push(GoAboardObj);
            }
            console.log('GoAboard', $scope.GoAboard)
            //Page6 Khen thuong
            var datapage6 = Array.from(listPage[6].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP6s = [];
            datapage6.forEach(function (datapage6Elemnt) {
                var pInTr = Array.from(datapage6Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP6s.push(pInTr);
            })
            for (let i = 0; i < pElementP6s.length; i++) {

                var obj = {
                    MonthYear: pElementP6s[i][0].trim(),
                    Reason: pElementP6s[i][1],
                    GrantOfDecision: pElementP6s[i][2]
                };
                $scope.Laudatory.push(obj);
            }
            console.log('Laudatory', $scope.Laudatory)
            //Page7 ki luat
            //phan van giua 2 truong hop: neu bi ki luat thi lay binh thuonng con neeu ko bij thi se de trong
            var datapage7 = Array.from(listPage[7].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP7s = [];
            datapage7.forEach(function (datapage7Elemnt) {
                var pInTr = Array.from(datapage7Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP7s.push(pInTr);
            })
    
            for (let i = 0; i < pElementP7s.length; i++) {
                var DisciplinedObj = {
                    MonthYear: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][0].substr(pElementP6s[i][0].indexOf('-') - 2, 7) : 'None',
                    Reason: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][1] : "None",
                    GrantOfDecision: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][2] : "None",
                };
                $scope.Disciplined.push(DisciplinedObj);
            }
            console.log('Disciplined', $scope.Disciplined)
            //Page8 Hoan canh gia dinh
            var datapage8 = Array.from(listPage[8].querySelectorAll("tr:first-child>td"));
            var pE8 = [];
            datapage8.forEach(function (datapage8Elemnt) {
                var pInTr = Array.from(datapage8Elemnt.querySelectorAll("p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pE8.push(pInTr);
            })
            
            let RelationshipIndex = 0;
            for (let y = 0; y < pE8.length; y++) {
                for (let i = 0; i < pE8[y].length; i++) {
                    if (pE8[y][i].startsWith('- Họ và tên:')) {
                        $scope.Relationship[RelationshipIndex].Name = pE8[y][i].slice(('- Họ và tên:').length).trim()
                    }
                    if (pE8[y][i].startsWith('- Năm sinh:')) {
                        let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                        let match = pE8[y][i].slice(('- Năm sinh:').length).trim().match(regex);

                        if (match) {
                            $scope.Relationship[RelationshipIndex].Year = {
                                YearBirth: match[1],
                                YearDeath: match[2],
                                Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                            };
                        }
                    }
                    if (pE8[y][i].startsWith("- Quê quán:")) {
                        $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][i].slice(('- Quê quán:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nơi cư trú:")) {
                        $scope.Relationship[RelationshipIndex].Residence = pE8[y][i].slice(('- Nơi cư trú:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nghề nghiệp:")) {
                        $scope.Relationship[RelationshipIndex].Job = pE8[y][i].slice(('- Nghề nghiệp:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Là đảng viên")) {
                        $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][i].slice(('-').length).trim()
                        $scope.Relationship[RelationshipIndex].PartyMember = true
                    }
                    if (pE8[y][i].startsWith("- Quá trình công tác:")) {
                        // let regex = /^(\d{4})-(.*)$/;

                        $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                        for (j = i + 1; !pE8[y][j].startsWith('-') && !pE8[y][j].startsWith('*'); j++) {
                            let inputString = pE8[y][j];
                            //let match = inputString.match(regex);

                            //if (match) {
                            //   let resultObject = {
                            //     Year: match[1],
                            //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                            //   };
                            //  $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                            $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                            i = j;
                            //}
                        }
                    }
                    if (pE8[y][i].startsWith("- Thái độ chính trị:")) {
                        $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                        for (j = i + 1; pE8[y][j].startsWith('+'); j++) {
                            $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                            i = j;
                        }
                    }
                    if ((pE8[y][i].startsWith('*'))) {
                        let regex = /^\*(.+?)\s:$/;
                        let match = pE8[y][i].match(regex);

                        if (match) {
                            let relationship = match[1];
                            RelationshipIndex = $scope.Relationship.length;
                            $scope.Relationship[RelationshipIndex] = {
                                Relation: relationship.trim(),
                                ClassComposition: '',
                                PartyMember: false,
                            }
                        }
                        if (pE8[y][i] == "* Anh, chị, em ruột: khai đầy đủ anh chị em"
                            || pE8[y][i] == "* Anh, chị, em ruột của vợ (chồng):"
                            || pE8[y][i] == "* Các con ruột và con nuôi có đăng ký hợp pháp : khai đầy đủ các con") {
                            for (let a = i + 1; !pE8[y][a].startsWith("*") && a < pE8[y].length - 1; a++) {
                                let regex = /^(\d+)\.\s(.+)$/;
                                let match = pE8[y][a].match(regex);

                                if (match) {
                                    let relationship = match[2];
                                    RelationshipIndex = $scope.Relationship.length;
                                    $scope.Relationship[RelationshipIndex] = {
                                        Relation: relationship.trim(),
                                        ClassComposition: '',
                                        PartyMember: false,
                                    }
                                }
                                if (pE8[y][a].startsWith('- Họ và tên:')) {
                                    $scope.Relationship[RelationshipIndex].Name = pE8[y][a].slice(('- Họ và tên:').length).trim()
                                }
                                if (pE8[y][a].startsWith('- Năm sinh:')) {
                                    let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                                    let match = pE8[y][a].slice(('- Năm sinh:').length).trim().match(regex);

                                    if (match) {
                                        $scope.Relationship[RelationshipIndex].Year = {
                                            YearBirth: match[1],
                                            YearDeath: match[2],
                                            Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                                        };
                                    }
                                }
                                if (pE8[y][a].startsWith("- Quê quán:")) {
                                    $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][a].slice(('- Quê quán:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nơi cư trú:")) {
                                    $scope.Relationship[RelationshipIndex].Residence = pE8[y][a].slice(('- Nơi cư trú:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nghề nghiệp:")) {
                                    $scope.Relationship[RelationshipIndex].Job = pE8[y][a].slice(('- Nghề nghiệp:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Là đảng viên")) {
                                    $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][a].slice(('-').length).trim()
                                    $scope.Relationship[RelationshipIndex].PartyMember = true
                                }
                                if (pE8[y][a].startsWith("- Quá trình công tác:")) {
                                    let regex = /^(\d{4})-(.*)$/;

                                    $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                                    for (j = a + 1; !pE8[y][j].startsWith('-'); j++) {
                                        let inputString = pE8[y][j];
                                        
                                        $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                                        i = j;
                                    }
                                }
                                if (pE8[y][a].startsWith("- Thái độ chính trị:")) {
                                    $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                                    for (j = a + 1; pE8[y][j].startsWith('+'); j++) {
                                        $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                                        i = j;
                                    }
                                }
                                i = a;
                            }
                        }
                    }
                }
            }
            console.log("Relationship:", $scope.Relationship);
            //Page 9 Tự nhận xét
            $scope.SelfComment = {
                context: Array.from(listPage[9].querySelectorAll("tr:first-child > td > p:first-child"))[0].innerText
            };
            //Page 9 ket don
            var datapage9 = Array.from(listPage[9].querySelectorAll("tr:last-child > td > p")).filter(function (element) {
                return element.innerText.trim().length > 0 && element.innerText.includes("ngày") && element.innerText.includes("tháng") && element.innerText.includes("năm");
            }).map(function (element) {
                return element.innerText.trim();
            });
            $scope.PlaceCreatedTime = {
                place: datapage9[0].substring(0, datapage9[0].indexOf(',')),
                createdTime: datapage9[0].substring(datapage9[0].indexOf('ngày') + 4, datapage9[0].indexOf('tháng')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('tháng') + 5, datapage9[0].indexOf('năm')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('năm') + 4).trim()
            };
            var obj = $scope.defaultRTE.getContent();
            console.log(obj);
            $scope.listPage = $(obj).find('> div > div > div').toArray();
            $scope.listInfo1 = $($scope.listPage[0]).find('table > tbody > tr > td > p').toArray()
                .map(y => $(y).find('> span').toArray().map(t => $(t).text()));
            //Lấy sdt 
            $scope.listDetail8 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(1) > td > p:nth-child(27) > span:last-child').text();

            $scope.listDetail1 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+7):nth-child(-n+15)').toArray()
                .map(t => $(t).find('> span:last-child').text());

            $scope.listDetail2 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(16) > span:nth-child(even)').toArray()
                .map(z => $(z).text());
            $scope.listDetail3 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(17) > span:last-child').text()

            $scope.listDetail4 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(27) > span:last-child').text().split(',')

            $scope.listDetail5 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(even)').toArray()
                .map(z => $(z).text());

            $scope.listDetail6 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+19):nth-child(-n+26)').toArray()
                .map(t => $(t).find('> span:last-child').text());

            $scope.listDetail7 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(5)').toArray()
                .map(z => $(z).text());

            $scope.listDetail9 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(1) > td > p:nth-child(29) > span:last-child').text();

      
            $scope.infUser.FirstName = $scope.listDetail1[0];
            $scope.infUser.Sex = $scope.listDetail1[1];
            $scope.infUser.LastName = $scope.listDetail1[2];
            $scope.infUser.Birthday = $scope.listDetail1[3];
            $scope.infUser.HomeTown = $scope.listDetail1[5];
            $scope.infUser.PlaceofBirth = $scope.listDetail1[4];
            $scope.infUser.Residence = $scope.listDetail1[7];
            $scope.infUser.TemporaryAddress = $scope.listDetail1[8];

            $scope.infUser.Nation = $scope.listDetail2[0];
            $scope.infUser.Religion = $scope.listDetail2[1];

            $scope.infUser.NowEmployee = $scope.listDetail3;

            $scope.infUser.PlaceinGroup = $scope.listDetail4[0];
            $scope.infUser.DateInGroup = $scope.listDetail4[1].match(/\d+/g).join('-');

            $scope.infUser.PlaceInParty = $scope.listDetail5[0].split(',')[0];
            $scope.infUser.DateInParty = $scope.listDetail5[0].split(',')[1].match(/\d+/g).join('-');
            $scope.infUser.PlaceRecognize = $scope.listDetail7[0].split(',')[0];
            $scope.infUser.DateRecognize = $scope.listDetail7[0].split(',')[1].match(/\d+/g).join('-');
            $scope.infUser.Presenter = $scope.listDetail5[2];

            $scope.infUser.Phone = $scope.listDetail8;
            $scope.infUser.PhoneContact = $scope.listDetail9.trim();

            $scope.infUser.LevelEducation.GeneralEducation = $scope.listDetail6[0];
            $scope.infUser.LevelEducation.VocationalTraining = $scope.listDetail6[1];
            $scope.infUser.LevelEducation.Undergraduate = $scope.listDetail6[2];//.split(',');
            $scope.infUser.LevelEducation.RankAcademic = $scope.listDetail6[3];
            $scope.infUser.LevelEducation.PoliticalTheory = $scope.listDetail6[4];//.split(',');

            $scope.infUser.LevelEducation.ForeignLanguage = $scope.listDetail6[5];
            $scope.infUser.LevelEducation.It = $scope.listDetail6[6];//.split(',');
            $scope.infUser.LevelEducation.MinorityLanguage = $scope.listDetail6[7];//.split(',');

            $scope.infUser.Phone = $scope.listDetail8;
            $scope.infUser.PhoneContact = $scope.listDetail9.trim();

            //Nguoi gioi thieu
            $scope.Introducer = {
                PersonIntroduced: $scope.infUser.Presenter,
                PlaceTimeJoinUnion: $scope.infUser.PlaceinGroup+", " + $scope.infUser.DateInGroup,
                PlaceTimeJoinParty: $scope.infUser.PlaceInParty + ", " + $scope.infUser.DateInParty,
                PlaceTimeRecognize: $scope.infUser.PlaceRecognize + ", " + $scope.infUser.DateRecognize
            };
            console.log($scope.infUser);
            var JSONobj = {
                InformationUser: $scope.infUser,
                Create: $scope.PlaceCreatedTime,
                PersonalHistory: $scope.PersonalHistory,
                BusinessNDuty: $scope.BusinessNDuty,
                PassedTrainingClasses: $scope.PassedTrainingClasses,
                GoAboard: $scope.GoAboard,
                Disciplined: $scope.Disciplined,
                SelfComment: $scope.SelfComment,
                Relationship: $scope.Relationship
            }

            console.log($scope.listDetail1[0])
            setTimeout(function () {
                $scope.$apply();
            }, 100);
        }, 100);
    }
    $scope.getPartyAdmissionProfileByUsername = function () {
        if($scope.UserName==null||$scope.UserName==undefined){
            //thông báo không lấy được username
        }
        else{
            dataservice.getPartyAdmissionProfileByUsername($scope.UserName, function(rs){
                rs = rs.data;
                console.log(rs);
                    if(rs.Error){

                    }
                    else{
                        rs=rs.Object;
                        $scope.infUser.LastName = rs.CurrentName;
                        var date = new Date(rs.Birthday);
                        var day = date.getDate();
                        var month = date.getMonth() + 1; // Tháng bắt đầu từ 0
                        var year = date.getFullYear();
                        if (day < 10) {
                            day = '0' + day;
                        }
                        if (month < 10) {
                            month = '0' + month;
                        }
                        $scope.infUser.Birthday = day + '-' + month + '-' + year;
                        $scope.infUser.FirstName = rs.BirthName;
                        
                        $scope.infUser.Sex = rs.Gender == 1?"Nam" : "Nữ";
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
                        $scope.PlaceCreatedTime={place:rs.CreatedPlace};
                        $scope.SelfComment.context = rs.SelfComment;
                        
                        $scope.infUser.ResumeNumber =  rs.ResumeNumber;
                        console.log($scope.infUser);

                        if($scope.infUser.ResumeNumber){
                            $scope.getFamilyByProfileCode();
                            $scope.getPersonalHistoryByProfileCode();
                            $scope.getGoAboardByProfileCode();
                            $scope.getAwardByProfileCode();
                            $scope.getWorkingTrackingByProfileCode();
                            $scope.getHistorySpecialistByProfileCode();
                            $scope.getTrainingCertificatedPassByProfileCode();
                            $scope.getWarningDisciplinedByProfileCode();
                            $scope.getIntroducerOfPartyByProfileCode();
                        }
                    }
                })
            }
        }

    $scope.ProfileList=[];
    
    $scope.initdata=function(){
        $scope.getPartyAdmissionProfileByUsername()
    }
    $scope.initdata()
    $scope.getPartyAdmissionProfile = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetPartyAdmissionProfile",
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                console.log(response);
                
            },
            error: function (error) {
                console.log(error);

            }
        });
        
    }
    $scope.senddata = function () {
        var data = $rootScope.ProjectCode;
        $rootScope.$emit('eventName', data);
    }

    //insertFamily
    $scope.Relation = [];

    $scope.insertFamily = function () {
        $scope.model = [];
        
        $scope.Relationship.forEach(function (e) {
            var obj = {};
            obj.Relation = e.Relation;
            obj.ClassComposition = e.ClassComposition;
            obj.PartyMember = e.PartyMember;
            obj.Name = e.Name;
            obj.BirthYear = '';//e.Year.YearBirth;
            obj.DeathYear = '';//e.Year.YearDeath;
            obj.DeathReason = '';//e.Year.Reason;
            obj.Residence = e.Residence;
            obj.PoliticalAttitude = e.PoliticalAttitude.join(',');
            obj.HomeTown = e.HomeTown;
            obj.Job = e.Job;
            obj.WorkingProgress = e.WorkingProcess.join(',');
            obj.ProfileCode = "2024124";
            $scope.model.push(obj)
        });
   
        if ($scope.isUpdate) {
            dataservice.updateFamily($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            dataservice.insertFamily($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        }  
        console.log($scope.model);
    }

    $scope.updateFamily = function (x) {
        $scope.modelPersonal = x ;
        
        dataservice.updateFamily($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedPersonHistory = {};
        console.log($scope.modelPersonal);
    }
    //
    
    // AdmissionProfile
    
    
    //Những công tác và chức vụ đã qua
    $scope.getBusinessNDutyById = function () {
        $scope.id = 2;
        dataservice.getBusinessNDutyById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }
    //ĐẶC ĐIỂM LỊCH SỬ

    $scope.setIsUpdateForPartyAdmissionProfile = function (user) {
        if (isHadProfile(user)) {
            $scope.isUpdate = true;
        }
        else $scope.isUpdate = false;
    }
    // $scope.user = { id: 13 }
    // $scope.getPartyAdmissionProfileByUserCode = function () {
    //     $.ajax({
    //         type: "POST",
    //         url: "/UserProfile/GetPartyAdmissionProfileByUserCode?userCode=" + $scope.user.id,// gán $scope.infUser.resumenumber
    //         contentType: "application/json; charset=utf-8",
    //         success: function (response) {
    //             console.log(response);
    //             $scope.ProfileList = response;
    //             return response
    //         },
    //         error: function (error) {
    //             console.log(error);
    //         }
    //     });
    //     
    // }

    //
    
    // AdmissionProfile
    $scope.isUpdate = false;

    //ĐẶC ĐIỂM LỊCH SỬ

    $scope.submitPartyAdmissionProfile = function () {
        
        //$http.post('/UserProfile/UpdatePartyAdmissionProfile/', model)
        if($scope.UserName!=null && $scope.UserName!=undefined){
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
                $scope.model.Username=$scope.UserName;

            if($scope.infUser.ResumeNumber!='' && $scope.infUser.ResumeNumber!=undefined){
                console.log($scope.model);
                dataservice.update($scope.model, function (rs) {
                    rs = rs.data;
                    console.log(rs);
                });
            }else {
                
                dataservice.insert($scope.model, function (rs) {
                    rs = rs.data;
                    console.log('rs');
                });

            }
        }
        
        console.log($scope.model);
    }
    $scope.addToPersonalHistory = function () {
        var model = {}
        model.Begin = $scope.selectedPersonHistory.Begin
        model.End = $scope.selectedPersonHistory.End
        model.Content = $scope.selectedPersonHistory.Content
        model.Id=0;
        $scope.PersonalHistory.push(model)
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

            dataservice.insertPersonalHistory($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            });

        console.log($scope.model);
    }

    $scope.submitPersonalHistory = function () {
        $scope.model = {
            Begin:$scope.selectedWorkingTracking.From,
            End:$scope.selectedWorkingTracking.To,
            Content:$scope.selectedWorkingTracking.Work,
            ProfileCode:$scope.infUser.ResumeNumber,
            Id:0
        };
        $scope.PersonalHistory.push($scope.model);
        console.log($scope.model);
    }
    $scope.submitDisciplined = function () {
        console.log($scope.Disciplined)
        $scope.model = [];

        $scope.Disciplined.forEach(function (e) {
            var obj = {};
            obj.MonthYear = e.time;
            obj.Reason = e.officialReason;
            obj.GrantOfDecision = e.grantDecision;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
        
        dataservice.insertWarningDisciplined($scope.model, function (rs) {
            rs = rs.data;
            console.log(rs);
        })
    }

    $scope.submitBusinessNDuty = function () {
        $scope.model = [];
        $scope.BusinessNDuty.forEach(function (businessNDuty) {
            var obj = {};
            obj.From = businessNDuty.time.begin.trim();
            obj.To = businessNDuty.time.end.trim();
            obj.Work = businessNDuty.business;
            obj.Role = businessNDuty.duty;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
    //    $scope.modelUpdate = [];
   
        if ($scope.isUpdate) {
            dataservice.updateBusinessNDuty($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            dataservice.insertBusinessNDuty($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        }  
        console.log($scope.model);
    }

    $scope.submitHistorySpecialist = function () {
        $scope.model = [];
        $scope.HistoricalFeatures.forEach(function (historicalFeatures) {
            var obj = {};
            obj.MonthYear = historicalFeatures.MonthYear;
            obj.Content = historicalFeatures.Content;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
    //    $scope.modelUpdate = [];
   
        if ($scope.isUpdate) {
            dataservice.updateHistorySpecialist($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            dataservice.insertHistorySpecialist($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        }  
        console.log($scope.model);
    }
    
    $scope.submitTrainingCertificatedPass = function () {
        $scope.model = [];
        $scope.PassedTrainingClasses.forEach(function (passedTrainingClasses) {
            var obj = {};
            obj.SchoolName = passedTrainingClasses.school;
            obj.Class = passedTrainingClasses.class;
            obj.From = passedTrainingClasses.time.begin;
            obj.To = passedTrainingClasses.time.end;
            obj.Certificate = passedTrainingClasses.business;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
   
        if ($scope.isUpdate) {
            dataservice.updateTrainingCertificatedPass($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            dataservice.insertTrainingCertificatedPass($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        }  
        console.log($scope.model);
    }

    $scope.submitAward = function () {
        $scope.model = [];
        $scope.Laudatory.forEach(function (laudatory) {
            var obj = {};
            obj.MonthYear = laudatory.time;
            obj.Reason = laudatory.officialReason;
            obj.GrantOfDecision = laudatory.grantDecision;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
    //    $scope.modelUpdate = [];
   
        if ($scope.isUpdate) {
            dataservice.updateAward($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            dataservice.insertAward($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
                dataservice.getAwardByProfileCode($scope.infUser.ResumeNumber, function (rs){
                    rs = rs.data
                    console.log(rs);
                })
            })
        }  
        console.log($scope.model);
    }

    $scope.submitGoAboard = function () {
        console.log($scope.Disciplined)
        $scope.model = [];
        $scope.GoAboard.forEach(function (e) {
            var obj = {};
            obj.From = e.time.begin;
            obj.To = e.time.end
            obj.Contact = e.purpose;
            obj.Country = e.country;
            obj.ProfileCode = $scope.infUser.ResumeNumber;
            $scope.model.push(obj)
        });
        dataservice.insertGoAboard($scope.model, function (rs) {
            rs = rs.data;
            console.log(rs);
        })
    }

    $scope.submitIntroducer = function () {
        console.log($scope.infUser)
        $scope.model = {};
        $scope.isUpdate = 1;

        if ($scope.isUpdate) {
            $scope.model = $scope.Introducer;
            dataservice.updateIntroducer($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        } else {
            $scope.model.PersonIntroduced = $scope.infUser.Presenter;
            $scope.model.PlaceTimeJoinUnion = $scope.infUser.PlaceinGroup + "," + $scope.infUser.DateInGroup;
            $scope.model.PlaceTimeJoinParty = $scope.infUser.PlaceInParty + "," + $scope.infUser.DateInParty;
            $scope.model.PlaceTimeRecognize = $scope.infUser.PlaceRecognize + "," + $scope.infUser.DateRecognize;
            $scope.model.ProfileCode = $scope.infUser.ResumeNumber;
            console.log($scope.model);

            dataservice.insertIntroducer($scope.model, function (rs) {
                rs = rs.data;
                console.log(rs);
            })
        }
    }
    //getById
    $scope.getBusinessNDutyById = function () {
        $scope.id = 2;
        dataservice.getBusinessNDutyById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }

    $scope.getHistorySpecialistById = function () {
        $scope.id = 2;
        dataservice.getHistorySpecialistById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }

    $scope.getAwardById = function () {
        $scope.id = 2;
        dataservice.getAwardById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }
    $scope.getWarningDisciplinedById = function () {
        $scope.id = 2;
        dataservice.getWarningDisciplinedById($scope.id, function (rs) {
                rs = rs.data;
                console.log(rs.data);
            })
        console.log($scope.id);
    }

    //Get By Profilecode
    $scope.getFamilyByProfileCode = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetFamilyByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                $scope.Relation = response;
                console.log($scope.Relation);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    // $scope.getFamilyByProfileCode = function () {
    //     dataservice.getFamilyByProfileCode($scope.infUser.ResumeNumber, function (rs) {
    //         rs = rs.data;
    //         $scope.Relation = rs;
    //         console.log($scope.infUser.ResumeNumber);
    //     })
    //     
    // }

    $scope.getPersonalHistoryByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetPersonalHistoryByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {   
                $scope.PersonalHistory = response;
                console.log($scope.PersonalHistory);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    $scope.getGoAboardByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetGoAboardByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.GoAboard = response;
                console.log($scope.GoAboard);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }
    $scope.getAwardByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetAwardByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.Laudatory = response;
                console.log($scope.Laudatory);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    $scope.getWorkingTrackingByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetWorkingTrackingByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.BusinessNDuty = response;
                console.log($scope.BusinessNDuty);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }
    $scope.getHistorySpecialistByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetHistorySpecialistByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.HistoricalFeatures = response;
                console.log($scope.HistoricalFeatures);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    $scope.getTrainingCertificatedPassByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetTrainingCertificatedPassByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.PassedTrainingClasses = response;
                console.log($scope.PassedTrainingClasses);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    $scope.getWarningDisciplinedByProfileCode = function () {
        var requestData = { id: $scope.id };
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetWarningDisciplinedByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
            success: function (response) {
                $scope.Disciplined = response;
                console.log($scope.Disciplined);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }
    $scope.Introducer = {};

    $scope.getIntroducerOfPartyByProfileCode = function () {
        $.ajax({
            type: "POST",
            url: "/UserProfile/GetIntroducerOfPartyByProfileCode?profileCode=" + $scope.infUser.ResumeNumber,
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                $scope.Introducer = response;
                console.log($scope.Introducer);
            },
            error: function (error) {
                console.log(error);
            }
        });
        
    }

    //Insert
    
    //Update
    $scope.selectedPersonHistory = {};
    $scope.selectedWarningDisciplined = {};
    $scope.selectedHistorySpecialist = {};
    $scope.selectedWorkingTracking = {};
    $scope.selectedLaudatory = {};
    $scope.selectedTrainingCertificatedPass = {};
    $scope.selectedGoAboard = {};

    $scope.selectPersonHistory = function (x) {
        $scope.selectedPersonHistory = x;
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
    $scope.selectLaudatory = function (x) {
        $scope.selectedLaudatory = x;
    };
    $scope.selectGoAboard = function (x) {
        $scope.selectedGoAboard = x;
    };
    $scope.updatePartyAdmissionProfile = function () {
        $scope.modelPartyAdmissionProfile = $scope.infUser;

        dataservice.updatePartyAdmissionProfile($scope.modelPartyAdmissionProfile, function (rs) {
            console.log($scope.modelPartyAdmissionProfile);
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedPersonHistory = {};
        console.log($scope.modelPersonal);
    }
    $scope.updateFamily = function (x) {
        $scope.modelPersonal = x ;
        
        dataservice.updateFamily($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedPersonHistory = {};
        console.log($scope.modelPersonal);
    }

    $scope.updatePersonalHistory = function () {

        dataservice.updatePersonalHistory( $scope.selectedPersonHistory, function (rs) {
            console.log( $scope.selectedPersonHistory);
            rs = rs.data;
            console.log(rs);
            $scope.selectedPersonHistory = {};
            
        })
    }

    $scope.updateWarningDisciplined = function () {
        $scope.modelPersonal = $scope.selectedWarningDisciplined;

        dataservice.updateWarningDisciplined($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedWarningDisciplined = {};
        console.log($scope.modelPersonal);
    }

    $scope.updateHistorySpecialist = function () {
        $scope.modelPersonal = $scope.selectedHistorySpecialist;

        dataservice.updateHistorySpecialist($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedHistorySpecialist = {};
        console.log($scope.modelPersonal);
    }

    $scope.updateWorkingTracking = function () {
        $scope.modelPersonal = $scope.selectedWorkingTracking;

        dataservice.updateWorkingTracking($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedWorkingTracking = {};
        console.log($scope.modelPersonal);
    }

    $scope.updateLaudatory = function () {
        $scope.modelPersonal = $scope.selectedLaudatory;

        dataservice.updateAward($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedLaudatory = {};
        console.log($scope.modelPersonal);
    }

    $scope.updateTrainingCertificatedPass = function () {
        $scope.modelTrainingCertificate = $scope.selectedTrainingCertificatedPass;

        dataservice.updateTrainingCertificatedPass($scope.modelTrainingCertificate , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedTrainingCertificatedPass = {};
        console.log($scope.modelTrainingCertificate);
    }

    $scope.updateGoAboard = function () {
        $scope.modelPersonal = $scope.selectedGoAboard;

        dataservice.updateGoAboard($scope.modelPersonal , function (rs) {
            console.log($scope.modelPersonal );
            rs = rs.data;
            console.log(rs);
        })
        $scope.selectedGoAboard = {};
        console.log($scope.modelPersonal);
    }

    //Delete
    $scope.deletePartyAdmissionProfile = function () {
        console.log(Id);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeletePartyAdmissionProfile?id=" + Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }

    $scope.deletePesonalHistory = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeletePersonalHistory?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteHistorySpecialist = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteHistorySpecialist?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
                    console.log(response.Title);
    
                    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteAward = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteAward?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
                    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteWarningDisciplined = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteTrainingCertificatedPass?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
                    ;
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteGoAboard = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteGoAboard?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
                    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteTrainingCertificatedPass = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteWorkingTracking?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
                    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    $scope.deleteWorkingTracking = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteWorkingTracking?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
               // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
                    
                    console.log(response.Title);
                   
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
                success: function (response) {
    
                    console.log(response.Title);
                    
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }

    $scope.deletePartyAdmissionProfile = function () {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeletePartyAdmissionProfile?id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
 
                    console.log(response.Title);
 
                },
                error: function (error) {
                    console.log(error.Title);
                }
            });
        }
    }
    
    $scope.deleteFamily = function (e) {
        console.log(e);
        var isDeleted = confirm("Ban co muon xoa?");
        if (isDeleted) {
            $.ajax({
                type: "DELETE",
                url: "/UserProfile/DeleteFamily?Id=" + e.Id,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                // data: JSON.stringify(requestData), // Chuyển đổi dữ liệu thành chuỗi JSON
                success: function (response) {
    
                    console.log(response.Title);
                   
                },
                error: function (error) {
                    console.log(error.Title);
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

    setTimeout(async function () {
        //  loadDate();
        // initialize Rich Text Editor component
        $scope.defaultRTE = new ej.richtexteditor.RichTextEditor({
            height: '850px'
        });
        // Render initialized Rich Text Editor.
        $scope.defaultRTE.appendTo('#defaultRTE');
        var obj = $scope.defaultRTE.getContent();
        obj.firstChild.contentEditable = 'false'

    }, 50);
});



