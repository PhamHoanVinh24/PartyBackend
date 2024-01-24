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
});

app.controller('index', function ($scope, $rootScope, $compile, dataservice, $filter) {
    console.log("indeeeeee");
    /* $scope.upload = function () {
         var modalInstance = $uibModal.open({
             animation: true,
             templateUrl: ctxfolder + '/word.html',
             controller: 'word',
             backdrop: 'static',
             size: '70'
         });
         modalInstance.result.then(function (d) {
             reloadData(true);
         }, function () { });
         console.log("ok");
     };*/
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
    $scope.inputPerHis = {};
            
    $scope.addPersonalHistory = function () {
                $scope.PersonalHistory.push(inputPerHis);
                // Xóa dữ liệu từ input sau khi thêm
                $scope.inputPerHis = {};
            }
    function handleTextUpload(txt) {
        $scope.defaultRTE.value = txt;

        $scope.infUser = {

            LevelEducation: {
                Undergraduate: [],
                PoliticalTheory: [],
                ForeignLanguage: [],
                It: [],
                MinorityLanguage: []
            }
        }

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
                PersonHis['time'] = {
                    begin: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') - 7, 7).trim(),
                    end: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') + 1, 7).trim(),
                };
                // Sửa lỗi ở đây, sử dụng split(':') để tách thời gian và thông tin
                PersonHis['infor'] = objPage1[i].innerText.split(':')[1];
                $scope.PersonalHistory.push(PersonHis);
            }
            console.log('PersonalHistory', $scope.PersonalHistory)
            
            //Page3 Những nơi công tác và chức vụ đã qua
            $scope.itemList.push($scope.inputText);
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
            $scope.BusinessNDuty = [];
            for (let i = 0; i < pElementP2s.length; i++) {
                var begin = pElementP2s[i][0].substr(pElementP2s[i][0].indexOf('-') - 2, 7);
                var end = pElementP2s[i][0].substr(pElementP2s[i][0].lastIndexOf('-') - 2, 7);
                var BusinessNDutyObj = {
                    time: {
                        begin: begin,
                        end: end
                    },
                    business: pElementP2s[i][1],
                    duty: pElementP2s[i][2]
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
            for (let i = 0; i < pElementP4s.length; i++) {
                var obj = {
                    school: pElementP4s[i][0],
                    class: pElementP4s[i][1],
                    time: {
                        begin: pElementP4s[i][2].substring(0, pElementP4s[i][2].indexOf('đến')),
                        end: pElementP4s[i][2].substring(pElementP4s[i][2].lastIndexOf('đến') + 4).trim()
                    },
                    business: pElementP4s[i][1]
                };
                $scope.PassedTrainingClasses.push(obj);
            }
            console.log('PassedTrainingClasses', $scope.PassedTrainingClasses)

            // console.log(data)
            //
            var data = Array.from(listPage[3].querySelectorAll('td > p')).filter(function (ele) {
                return ele.innerText.trim().length > 0;
            }).map(function (element) {
                return element.innerText.trim();
            });
            function isTime(e) {
                return (e.includes('Ngày') && e.includes('tháng') && e.includes('năm')) ? true : false;
            }
            $scope.HistoricalFeatures = [];
            for (let i = 0; i < data.length; i++) {
                var obj = {
                    time: null,
                    content: null
                };
                if (isTime(data[i])) {
                    obj.time = data[i].substr(data[i].indexOf("Ngày") + 4, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("tháng") + 5, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("năm") + 4, 5),
                        obj.content = data[i + 1];
                }
                if (obj.time != null && obj.content != null) {
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
            $scope.GoAboard = [];
            for (let i = 0; i < pElementP5s.length; i++) {

                var GoAboardObj = {
                    time: {
                        begin: pElementP5s[i][0].substring(pElementP5s[i][0].indexOf("Từ") + 2, pElementP5s[i][0].indexOf("đến")).trim(),
                        end: pElementP5s[i][0].substring(pElementP5s[i][0].indexOf("đến") + 3).trim(),
                    },
                    purpose: pElementP5s[i][1],
                    country: pElementP5s[i][2]
                };
                $scope.GoAboard.push(GoAboardObj);
            }
            console.log('GoAboard', $scope.FGoAboard)
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
            $scope.Laudatory = [];
            for (let i = 0; i < pElementP6s.length; i++) {

                var obj = {
                    time: pElementP6s[i][0].trim(),
                    officialReason: pElementP6s[i][1],
                    grantDecision: pElementP6s[i][2]
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
            $scope.Disciplined = [];
            for (let i = 0; i < pElementP7s.length; i++) {
                var DisciplinedObj = {
                    time: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][0].substr(pElementP6s[i][0].indexOf('-') - 2, 7) : 'None',
                    officialReason: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][1] : "None",
                    grantDecision: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][2] : "None",
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
            $scope.Relationship = [];
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
                                        // let match = inputString.match(regex);

                                        // if (match) {
                                        // let resultObject = {
                                        //     Year: match[1],
                                        //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                                        // };
                                        // $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                                        // }
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

            $scope.infUser.ResumeNumber = resumeNumber;
            $scope.infUser.FirstName = $scope.listDetail1[0];
            $scope.infUser.Sex = $scope.listDetail1[1];
            $scope.infUser.LastName = $scope.listDetail1[2];
            $scope.infUser.DateofBird = $scope.listDetail1[3];
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
            $scope.infUser.LevelEducation.Undergraduate = $scope.listDetail6[2].split(',');
            $scope.infUser.LevelEducation.RankAcademic = $scope.listDetail6[3];
            $scope.infUser.LevelEducation.PoliticalTheory = $scope.listDetail6[4].split(',');

            $scope.infUser.LevelEducation.ForeignLanguage = $scope.listDetail6[5];
            $scope.infUser.LevelEducation.It = $scope.listDetail6[6].split(',');
            $scope.infUser.LevelEducation.MinorityLanguage = $scope.listDetail6[7].split(',');

            $scope.infUser.Phone = $scope.listDetail8;
            $scope.infUser.PhoneContact = $scope.listDetail9.trim();

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
            // console.log(JSON.stringify(JSONobj))
            setTimeout(function () {
                $scope.$apply();
            }, 100);
        }, 100);
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

app.controller('orderProductTicket', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceImpStore, $location, $uibModalInstance, para) {
    $scope.model = {
        MappingCode: '',
    }

    $scope.listProducts = [];
    $scope.listSelect = [];

    $scope.QuantityMax = '';

    $scope.cancel = function () {
        $uibModalInstance.close($rootScope.rootId);
    }

    $scope.listMapping = [];
    $scope.initLoad = function () {
        // var itemProduct = para.objPara.item;
        // $scope.model.ProductQrCode = itemProduct.ProductQrCode;
        // $scope.model.Quantity = itemProduct.ValueCoil;
        // $scope.model.sProductCoil = para.objPara.productCoil;
        // $scope.model.ProductNoImp = para.objPara.isTankStatic ? '1' : para.objPara.productNo;
        // $scope.model.ProductNo = para.objPara.isTankStatic ? '1' : '';
        // $scope.model.IsTankStatic = para.objPara.isTankStatic;
        dataserviceImpStore.getListMapping("", function (rs) {
            rs = rs.data;
            $scope.listMapping = rs;
        });
        // dataserviceImpStore.getPositionProductVatco(para.objPara.item.Id, para.objPara.item.TicketCode, function (rs) {
        //     rs = rs.data;
        //     $scope.lstProduct = rs;
        // })

        dataserviceImpStore.getProductDetailNew(para.objPara.TicketCode, function (rs) {
            rs = rs.data;
            $scope.lstProduct = rs;
            // if ($scope.listProdDetail.length > 0) {
            //     $scope.disabledReason = true;
            // }
        })
        // dataserviceImpStore.getTreeZone(function (rs) {
        //     rs = rs.data;
        //     $scope.lstTreeZone = rs;
        // })
    }

    $scope.initLoad();

    $scope.validate = function () {
        if ($scope.model.MappingCode != '' && $scope.model.MappingCode != null && $scope.model.MappingCode != undefined) {
            return false;
        } else {
            App.toastrError(caption.MIST_VALIDATE_ADD_REQUIRE_INFO_RB);
            return true;
        }
    }
    $scope.orderProductVatCo = function (item) {
        // var item = $scope.listProdDetail[index];
        if (item != null) {
            dataserviceImpStore.checkProductInStore(item.Id, function (rs) {
                rs = rs.data;
                // var getStore = $scope.listStore.find(function (element) {
                //     if (element.Code == $scope.model.StoreCode) return true;
                // });
                var objPara = {
                    item: item,
                    rootId: $rootScope.rootId,
                    productName: item.ProductName,
                    productNo: item.ProductNo,
                    productCoil: '',
                    storeName: '',
                    isTankStatic: rs === false
                };
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderImpStore + '/orderProduct.html',
                    controller: 'orderProduct',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                objPara
                            };
                        }
                    }
                });
                modalInstance.result.then(function (id) {
                    $scope.initLoad();
                }, function () {
                });
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }

    $scope.save = function () {
        if ($scope.model.MappingCode != '' && $scope.model.MappingCode != null && $scope.model.MappingCode != undefined) {
            // return false;
        } else {
            App.toastrError(caption.MIST_VALIDATE_ADD_REQUIRE_INFO_RB);
            return true;
        }
        const body = $scope.lstProduct.filter(x => x.IsSelected).map(x => ({
            ProductCode: x.ProductCode,
            ProductName: x.ProductName,
            Unit: x.Unit,
            ProductQrCode: x.ProductQRCode,
            ProductNoImp: x.ProductNoImp,
            ProductNo: x.ProductNoInput,
            IsTankStatic: x.IsTankStatic,
            MappingCode: $scope.model.MappingCode,
            IdImpProduct: x.Id,
            IsTankStatic: x.IsTankStatic,
            UnitCode: x.UnitCode,
        }));
        dataserviceImpStore.orderMultiProduct(body, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
            $scope.initLoad();
        })
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

