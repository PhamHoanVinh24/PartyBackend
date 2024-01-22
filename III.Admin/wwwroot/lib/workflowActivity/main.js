var Delay = draw2d.shape.icon.Icon.extend({

    NAME: "Delay",

    init:function(attr, setter, getter)
    {
        this._super( $.extend({stroke:0,bgColor:null,width:210,height:179},attr), setter, getter);
    },

    createSet: function(){
        var set= this.canvas.paper.set();

        // BoundingBox
        var shape = this.canvas.paper.path("M1.5 16.5h46.383C55.95 16.5 62 22.93 62 31.5s-6.05 15-14.117 15H1.5z");
        set.push(shape);

        

        return set;
    },

    applyAlpha: function(){
    }
});
var start = draw2d.shape.icon.Icon.extend({

    NAME: "start",

    init:function(attr, setter, getter)
    {
        this._super( $.extend({stroke:0,bgColor:null,width:210,height:179},attr), setter, getter);
    },

    createSet: function(){
        var set= this.canvas.paper.set();

        // BoundingBox
        var shape = this.canvas.paper.path("M54.5 24.5h-45C5.345 24.5 2 27.845 2 32s3.345 7.5 7.5 7.5h45c4.155 0 7.5-3.345 7.5-7.5s-3.345-7.5-7.5-7.5z");
        set.push(shape);
        return set;
    },

    applyAlpha: function(){
    }
});
var app;
var itemmmm;
var canvas2;
var item1;
var item2;
var item3;
var item5;
var dataweb = "";
var check = 0;
var checkconn = 0;
var checkdell = [];
var checkdell2 = [];
var timer;
var time;
var arr = [];
var cu = 0;

document.addEventListener("DOMContentLoaded", function() {
    var app;
    draw2d.shape.basic.Label.inject({
        clearCache: function() {
            this.portRelayoutRequired = true;
            this.cachedMinWidth = null;
            this.cachedMinHeight = null;
            this.cachedWidth = null;
            this.cachedHeight = null;
            this.lastAppliedTextAttributes = {};
            return this;
        }
    });
    var canvas = new draw2d.Canvas("gfx_holder");
    canvas2 = canvas;

    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function(json) {
            $("#json").text(JSON.stringify(json, null, 2));
            dataweb = JSON.stringify(json, null, 2);
        });


    }


    canvas.getCommandStack().addEventListener(function(e) {
        if (e.isPostChangeEvent()) {
            displayJSON(canvas);
            // if (cu >= 1) {
            //     newdata = JSON.parse(dataweb);

            //     for (var i = 0; i < arr.length; i++) {
            //         var d = arr[i].svgPathString;
            //         console.log("d:" + d);
            //         $('.ball' + i).css('offset-path', "path('" + d + "')");
            //         $('.ball' + i).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
            //         console.log(arr[i].targetPort.parent.id);
            //         for (var j = 0; j < newdata.length; j++) {

            //             if (arr[i].sourcePort.parent.id == newdata[j].id) {
            //                 if (newdata[j].labels.length > 10) {
            //                     if (newdata[j].labels[10].id == "clock1") {
            //                         $('.ball' + i).css("animation", "red-ball1 2s linear infinite");
            //                     }
            //                     if (newdata[j].labels[10].id == "clock2") {
            //                         // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
            //                     }
            //                     if (newdata[j].labels[10].id == "clock3") {
            //                         // $('.ball' + i).css("animation", "red-ball2 2s linear infinite");
            //                     }
            //                     if (newdata[j].labels[10].id == "clock4") {
            //                         // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
            //                     }
            //                 }

            //             }
            //             if (arr[i].targetPort.parent.id == newdata[j].id) {
            //                 if (newdata[j].labels.length > 10) {
            //                     // if (newdata[j].labels[10].id == "clock1") {
            //                     //     $('.ball' + i).css("animation", "red-ball1 2s linear infinite");
            //                     // }
            //                     // if (newdata[j].labels[10].id == "clock2") {
            //                     //     $('.ball' + i).css("animation", "red-ball 2s linear ");
            //                     // }
            //                     if (newdata[j].labels[10].id == "clock3") {
            //                         $('.ball' + i).css("animation", "red-ball2 2s linear infinite");
            //                     }
            //                     // if (newdata[j].labels[10].id == "clock4") {
            //                     //     $('.ball' + i).css("animation", "red-ball 2s linear ");
            //                     // }
            //                 }

            //             }

            //             // Mx1y1 L(x2-4) ,y2 Qx2,y2 x2,y2+4 Lx3,y3-4 Qx3,y3 x3+4,y3 Lx4,y4


            //         }
            //     }
            //     /tạo path/ ///
            //     for (var t = 0; t < newdata.length; t++) {
            //         if (newdata[t].type == "draw2d.Connection") {
            //             // if (newdata[t].vertex.length > 2) {
            //             //     var path = "M" + "" + newdata[t].vertex[0].x + " " + newdata[t].vertex[0].y + "L" + "" + (newdata[t].vertex[1].x - 4) + "," + newdata[t].vertex[1].y + "Q" + "" + newdata[t].vertex[1].x + "," + newdata[t].vertex[1].y + " " + newdata[t].vertex[1].x + " ," + (newdata[t].vertex[1].y + 4) + "L" + "" + newdata[t].vertex[2].x + "," + (newdata[t].vertex[2].y - 4) + "Q" + "" + newdata[t].vertex[2].x + "," + newdata[t].vertex[2].y + " " + (newdata[t].vertex[2].x + 4) + " ," + newdata[t].vertex[2].y + "L" + "" + newdata[t].vertex[3].x + "," + newdata[t].vertex[3].y;
            //             //     console.log(path);
            //             // }
            //             // if (newdata[t].vertex.length <= 2) {
            //             //     var path = "M" + "" + newdata[t].vertex[0].x + " " + newdata[t].vertex[0].y + "L" + "" + (newdata[t].vertex[1].x) + "," + newdata[t].vertex[1].y;
            //             //     console.log(path);

            //             // }
            //             if (newdata[t].vertex.length >= 5) {
            //                 // var path = "M" + "" + newdata[t].vertex[0].x + " " + newdata[t].vertex[0].y + "L" + "" + (newdata[t].vertex[1].x - 4) + "," + newdata[t].vertex[1].y + "Q" + "" + newdata[t].vertex[1].x + "," + newdata[t].vertex[1].y + " " + newdata[t].vertex[1].x + " ," + (newdata[t].vertex[1].y - 4) + "L" + "" + newdata[t].vertex[2].x + "," + (newdata[t].vertex[2].y + 4) + "Q" + "" + newdata[t].vertex[2].x + "," + newdata[t].vertex[2].y + " " + (newdata[t].vertex[2].x + 4) + " ," + newdata[t].vertex[2].y + "L" + "" + (newdata[t].vertex[3].x - 4) + "," + newdata[t].vertex[3].y + "Q" + "" + newdata[t].vertex[3].x + "," + newdata[t].vertex[3].y + " " + newdata[t].vertex[3].x + "," + (newdata[t].vertex[3].y + 4) + "L" + "" + newdata[t].vertex[4].x + "," + (newdata[t].vertex[4].y - 4) + "Q" + "" + newdata[t].vertex[4].x + "," + newdata[t].vertex[4].y + " " + (newdata[t].vertex[4].x + 4) + "," + newdata[t].vertex[4].y + "L" + "" + newdata[t].vertex[5].x + "," + newdata[t].vertex[5].y;
            //                 // $('.ball' + js).css('offset-path', "path('" + path + "')");
            //                 // $('.ball' + js).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
            //                 // $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
            //                 // console.log(path);


            //             }
            //         }


            //     }
            // }

        }
    });

    canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.ExtendedKeyboardPolicy());
    canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: function(sourcePort, targetPort) {
            itemmmm = new LabelConnection();
            itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
            itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());

            // $(".parent_svg").append('<div id ="ball" class ="ball' + cu + '"></div>');
            canvas.add(new draw2d.shape.basic.Oval({
                cssClass: "ball" + cu,
                id: "ball",
                width: 10,
                height: 10,
                y: -5

            }));
            cu++;


            checkconn = 1;
            arr.push(itemmmm);
            console.log(arr);
            return itemmmm;

        }
    }));


    // Inject the UNDO Button and the callbacks
    //

    $('.zoomin').click($.proxy(function() {
        canvas.setZoom(canvas.getZoom() * 0.9, true);
    }, this));

    // Inject the DELETE Button
    //

    $('.zoomdefault').click($.proxy(function() {
        canvas.setZoom(1.0, true);
    }, this));

    // Inject the REDO Button and the callback
    //

    $('.zoomout').click($.proxy(function() {

        canvas.setZoom(canvas.getZoom() * 1.1, true);
    }, this));

    // undo
    $('.undo').click(function() {
        canvas.getCommandStack().undo();
        updateLast();
    });

    // redo

    $('.redo').click(function() {
        canvas.getCommandStack().redo();
    });

    var i = 1;
        //start-> show-activity
$('.item2').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new draw2d.shape.basic.Oval({});


        canvas.add(figure, 400, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.setRadius(2);
        figure.attr({
            "bgColor": "#27AE60",
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 30, y: 5, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 30, y: 30, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);



        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
});
$('.item3').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new draw2d.shape.flowchart.Document({});


        canvas.add(figure, 400, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.attr({
            "bgColor": "#27AE60",
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 50, y: 10, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 50, y: 30, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);



        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
});
$('.item4').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new start({});


        canvas.add(figure, 400, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.attr({
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 50, y: 10, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 50, y: 30, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);



        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
});
$('.item5').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new draw2d.shape.basic.Rectangle({});


        canvas.add(figure, 400, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.setRadius(16);
        figure.attr({
            "bgColor": "#27AE60",
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 30, y: 5, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 30, y: 30, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);



        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
});
$('.item6').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new Delay({});


        canvas.add(figure, 400, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.attr({
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 30, y: 5, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 30, y: 30, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);



        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
});
//end-> show-activity
    $('.create-activity,.item1').on('click', function() {
        check = 1;

        /////////add activity///////////
        var figure = new Activity_Label({});


        canvas.add(figure, 200, 150);
        // figure.setId(i);
        figure.setHeight(60);
        figure.setWidth(200);
        figure.setRadius(2);
        figure.attr({
            "bgColor": "#27AE60",
            "color": "#27AE60",
            "stroke": 0,
            "minHeight": 60,
            "minWidth": 200
        });

        figure.addCssClass("abc");

        /////////////////////////
        var txt1 = new draw2d.shape.basic.Label({ text: "Activity " + i, height: 10, x: 30, y: 0, stroke: 0 });
        txt1.setWidth(150);

        txt1.setId(i);
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 120, y: 20, stroke: 0, visible: false });
        txt2.setWidth(150);

        txt2.addCssClass("txt2");
        // canvas.add(txt2);
        txt2.setId(i);
        var txt3 = new draw2d.shape.basic.Label({ text: "Intial", height: 10, x: 30, y: 40, stroke: 0 });
        txt3.setWidth(150);

        txt3.addCssClass("txt3");
        // canvas.add(txt3);
        txt3.setId(i);
        // var txt4 =  new draw2d.shape.basic.Label({text:"",height:10,x:150,y:5,stroke:0});
        //     txt4.setWidth(150);

        //     txt4.addCssClass("txt4");
        // canvas.add(txt3);
        // txt4.setId(i);




        var txt5 = new draw2d.shape.basic.Label({ text: "", height: 10, x: 205, y: 0, stroke: 0 });
        txt5.setWidth(150);


        txt5.addCssClass("txt5");
        // canvas.add(txt3);
        txt5.setId(i);

        ////////////add text in activity///////////

        figure.add(txt1, new draw2d.layout.locator.Locator());
        figure.add(txt2, new draw2d.layout.locator.Locator());
        figure.add(txt3, new draw2d.layout.locator.Locator());
        // figure.add(txt4,new draw2d.layout.locator.Locator());
        figure.add(txt5, new draw2d.layout.locator.Locator());







        var label = new draw2d.shape.basic.Label({ height: 22, stroke: 0.2, x: 60, y: -35, color: "#F2F5F5", bgColor: "#F2F5F5", visible: false });
        figure.add(label, new draw2d.layout.locator.Locator());
        label.addCssClass("lbicon");

        var setting = new draw2d.shape.basic.Image({ path: "setting.png", height: 20, width: 20, stroke: 1, x: 60, y: -35, visible: false });
        figure.add(setting, new draw2d.layout.locator.Locator());
        setting.addCssClass("setting");
        var next = new draw2d.shape.basic.Image({ path: "next.svg", height: 20, width: 20, stroke: 1, x: 90, y: -35, visible: false });
        figure.add(next, new draw2d.layout.locator.Locator());
        next.addCssClass("next");
        var nextpage = new draw2d.shape.basic.Image({ path: "nextpage.svg", height: 20, width: 20, stroke: 1, x: 120, y: -35, visible: false });
        figure.add(nextpage, new draw2d.layout.locator.Locator());
        nextpage.addCssClass("nextpage");
        var coppy = new draw2d.shape.basic.Image({ path: "coppy.svg", height: 20, width: 20, stroke: 1, x: 150, y: -35, visible: false });
        figure.add(coppy, new draw2d.layout.locator.Locator());
        coppy.addCssClass("coppy");
        var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 20, width: 20, stroke: 1, x: 180, y: -35, visible: false });
        figure.add(del, new draw2d.layout.locator.Locator());
        del.addCssClass("delll");
        var dem = 1;
        var c1;
        var c2;

        if (dem == 1) {
            c1 = figure.createPort("output");
            c1.attr({
                visible: false
            });
            // c2 = figure.createPort("input");
            // c2.attr({
            //     visible: false
            // });
            c1.setHeight(17);
            c1.setWidth(17);
            // c2.setHeight(17);
            // c2.setWidth(17);
            dem++;
        }
        // figure db click//

        figure.on('dblclick', function() {
            item1 = txt1;
            item2 = txt2;
            item3 = txt3;
            item5 = txt5;
            $('.fade').toggleClass('show');
            $('.modal').css('display', 'block');

            if ($('.fade').hasClass('show')) {
                $('.overlay').addClass('overlay-show');
            }
        });
        ///acti click icon///
        figure.on("click", function() {


            //hiện icon
            if (setting.isVisible() == false && next.isVisible() == false && nextpage.isVisible() == false) {
                label.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
                next.attr({
                    visible: true
                });
                nextpage.attr({
                    visible: true
                });
                coppy.attr({
                    visible: true
                });
                del.attr({
                    visible: true
                });

            }
            if (setting.isVisible() == true && next.isVisible() == true && nextpage.isVisible() == true) {
                figure.on("dblclick", function() {
                    label.attr({
                        visible: false
                    });
                    setting.attr({
                        visible: false
                    });
                    next.attr({
                        visible: false
                    });
                    nextpage.attr({
                        visible: false
                    });
                    coppy.attr({
                        visible: false
                    });
                    del.attr({
                        visible: false
                    });
                });
            }
            ////////create connecttion button/////////
            next.on('click', function() {
                c1.attr({
                    visible: true
                });
                // c2.attr({
                //     visible: true
                // });

            });
            ////// setting button////////////
            setting.on('click', function(e) {
                $('.fade').toggleClass('show');
                $('.modal').css('display', 'block');
                if ($('.fade').hasClass('show')) {
                    $('.overlay').addClass('overlay-show');
                }
                item1 = txt1;
                item2 = txt2;
                item3 = txt3;
                item5 = txt5;
            });
            coppy.on('click', function(e) {
                clone = figure.clone(figure);
                x = figure.getX();
                y = figure.getY();

                canvas.add(clone, x, y + 100);
                updateLast();
            });
            nextpage.on("click", function() {
                var node = canvas.getPrimarySelection();
                node.setX(300);
                node.setY(300);



            });
            /////delete button////////
            del.on('click', function() {
                var node = canvas.getPrimarySelection();
                var command = new draw2d.command.CommandDelete(node);
                canvas.getCommandStack().execute(command);
            });

        });
        displayJSON(canvas);
        i++;
    });
});


$('.btn-save').on('click', function(e) {

    var node = canvas2.getPrimarySelection();

    var text1 = document.getElementById("activity-name").value;
    if (text1 == "") {
        item1.attr({
            text: "Activity"
        });

    } else {
        item1.attr({
            text: text1
        });
    }
    document.getElementById("activity-name").value = "";
    var text2 = document.getElementById("state-name").value;
    timer = text2;

    node.children.data[1].figure.attr({

        text: timer
    });
    if (!Date.parse(timer)) {
        node.children.data[3].figure.attr({
            text: ""
        });
    } else {
        var countDownDate = new Date(timer).getTime();
        // Update the count down every 1 second
        var x = setInterval(function() {
            // Get today's date and time
            var now = new Date().getTime();
            // Find the distance between now and the count down date
            var distance = countDownDate - now;
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            // Output the result in an element with id="demo"
            if (days >= 1) {
                time = days + "d " + hours + "h " +
                    minutes + "m " + seconds + "s ";
            } else {
                time = hours + "h " +
                    minutes + "m " + seconds + "s ";
            }
            node.children.data[3].figure.attr({
                text: time,
                stroke: 0.2,
                radius: 2,
                bgColor: "#fff"
            });

            displayJSON(canvas2);
            // If the count down is over, write some text 

        }, 1000);
        document.getElementById("state-name").value = "";
    }

    ////////////////

    var ActStatus = $("#status").val();
    if (ActStatus == 1) {

        if (node.children.data.length == 11) {
            node.children.data[10].figure.attr({
                path: "greenclock.svg",
                id: "clock1"
            });
        } else {
            var clock1 = new draw2d.shape.basic.Image({ path: "greenclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
            node.add(clock1, new draw2d.layout.locator.Locator());
            clock1.setId("clock1");
        }
    }
    if (ActStatus == 2) {


        if (node.children.data.length == 11) {
            node.children.data[10].figure.attr({
                path: "redclock.svg",
                id: "clock2"
            });
        } else {
            var clock2 = new draw2d.shape.basic.Image({ path: "redclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
            node.add(clock2, new draw2d.layout.locator.Locator());
            clock2.setId("clock2");
        }


    }
    if (ActStatus == 3) {
        if (node.children.data.length == 11) {
            node.children.data[10].figure.attr({
                path: "blackclock.svg",
                id: "clock3"
            });
        } else {
            var clock3 = new draw2d.shape.basic.Image({ path: "blackclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
            node.add(clock3, new draw2d.layout.locator.Locator());
            clock3.setId("clock3");
        }
    }
    if (ActStatus == 4) {
        if (node.children.data.length == 11) {
            node.children.data[10].figure.attr({
                path: "yellowclock.svg",
                id: "clock4"
            });
        } else {
            var clock4 = new draw2d.shape.basic.Image({ path: "yellowclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
            node.add(clock4, new draw2d.layout.locator.Locator());
            clock4.setId("clock4");
        }
    }
    // }
    // document.getElementById("state-name").value = "";



    ///////////////////////////////////////////////////////////////////

    $('.modal').css('display', 'none');
    $('.overlay').removeClass('overlay-show');
    $('.fade').removeClass('show');
    displayJSON(canvas2);
});

// hidden modal-box
$('.btn-secondary').on('click', function() {
    $('.modal').css('display', 'none');
    $('.overlay').removeClass('overlay-show');
    $('.fade').removeClass('show');
    $('.modal2').css('display', 'none');
    $('.fade2').removeClass('show');
    $('.modal3').css('display', 'none');
    $('.fade3').removeClass('show');
});

$('.remove').on('click', function() {
    $('.modal').css('display', 'none');
    $('.overlay').removeClass('overlay-show');
    $('.fade').removeClass('show');
    $('.modal2').css('display', 'none');
    $('.fade2').removeClass('show');
    $('.modal3').css('display', 'none');
    $('.fade3').removeClass('show');
});



// change combobox




// end change combobox
function displayJSON(canvas2) {
    var writer = new draw2d.io.json.Writer();
    writer.marshal(canvas2, function(json) {
        $("#json").text(JSON.stringify(json, null, 2));
        dataweb = JSON.stringify(json, null, 2);
    });


}



// fullscreen click
$('.fullscreen').on('click', () => {
    $('.main-menu').toggleClass('fullscreen_none');
    $('svg').toggleClass('fullscreensvg');
});
// fullscreen
// move click
$('.move').on('click', () => {
    
    $('.parent_svg').toggleClass('drap_drop');
    if ($('.parent_svg').hasClass('drap_drop')) {
        $('.drap_drop').draggable({
            disable: true

        });
    } else {
        $('.drap_drop').draggable({
            disable: false
        });
    }
});
//move

function updateLast() {
    $('.setting').on('click', function() {
        var node = canvas2.getPrimarySelection();
        $('.fade2').toggleClass('show');
        $('.modal2').css('display', 'block');
    });

    $('.delll').on('click', function() {
        var node = canvas2.getPrimarySelection();
        var command = new draw2d.command.CommandDelete(node);
        canvas2.getCommandStack().execute(command);
        checkdell.push(node.id);
    });
    if (screen.width < 1000) {
        $(".txt1").css("width", "150px");
        $(".txt1").css("height", "60px");

        $(".txt1 ").click(function() {
            var node = canvas2.getPrimarySelection();
            $(document).on("mousemove", function(event) {
                node.attr({
                    x: event.pageX,
                    y: event.pageY
                });
                $(document).off("mousemove");


            });
        });

    }


    $('.btn-save2').on('click', function(e) {
        var node = canvas2.getPrimarySelection();
        //node.children.data[0].figure// trỏ đến label
        var text11 = document.getElementById("activity-name2").value;
        if (text11 == "") {


        } else {
            node.children.data[0].figure.attr({
                text: text11
            });
        }
        document.getElementById("activity-name2").value = "";
        var text22 = document.getElementById("state-name2").value;
        timer = text22;
        // if (text2 == "") {
        //     item2.attr({
        //         text: ""
        //     });

        // } else {
        node.children.data[1].figure.attr({

            text: timer
        });
        if (!Date.parse(timer)) {
            node.children.data[3].figure.attr({
                text: ""
            });
        } else {
            var countDownDate = new Date(timer).getTime();
            // Update the count down every 1 second
            var x = setInterval(function() {
                // Get today's date and time
                var now = new Date().getTime();
                // Find the distance between now and the count down date
                var distance = countDownDate - now;
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                // Output the result in an element with id="demo"
                if (days >= 1) {
                    time = days + "d " + hours + "h " +
                        minutes + "m " + seconds + "s ";
                } else {
                    time = hours + "h " +
                        minutes + "m " + seconds + "s ";
                }
                node.children.data[3].figure.attr({
                    text: time,
                    stroke: 0.2,
                    radius: 2,
                    bgColor: "#fff"
                });

                displayJSON(canvas2);
                // If the count down is over, write some text 

            }, 1000);
            document.getElementById("state-name2").value = "";
        }
        var ActStatus = $("#status2").val();
        console.log(ActStatus);
        if (ActStatus == 1) {

            if (node.children.data.length == 11) {
                node.children.data[10].figure.attr({
                    path: "greenclock.svg",
                    id: "clock1"
                });
            } else {
                var clock1 = new draw2d.shape.basic.Image({ path: "greenclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                node.add(clock1, new draw2d.layout.locator.Locator());
                clock1.setId("clock1");
            }
        }
        if (ActStatus == 2) {


            if (node.children.data.length == 11) {
                node.children.data[10].figure.attr({
                    path: "redclock.svg",
                    id: "clock2"
                });
            } else {
                var clock2 = new draw2d.shape.basic.Image({ path: "redclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                node.add(clock2, new draw2d.layout.locator.Locator());
                clock2.setId("clock2");
            }


        }
        if (ActStatus == 3) {
            if (node.children.data.length == 11) {
                node.children.data[10].figure.attr({
                    path: "blackclock.svg",
                    id: "clock3"
                });
            } else {
                var clock3 = new draw2d.shape.basic.Image({ path: "blackclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                node.add(clock3, new draw2d.layout.locator.Locator());
                clock3.setId("clock3");
            }
        }
        if (ActStatus == 4) {
            if (node.children.data.length == 11) {
                node.children.data[10].figure.attr({
                    path: "yellowclock.svg",
                    id: "clock4"
                });
            } else {
                var clock4 = new draw2d.shape.basic.Image({ path: "yellowclock.svg", height: 30, width: 30, stroke: 1, x: 240, y: -31 });
                node.add(clock4, new draw2d.layout.locator.Locator());
                clock4.setId("clock4");
            }
        }

        $('.modal2').css('display', 'none');
        $('.overlay').removeClass('overlay-show');
        $('.fade2').removeClass('show');
        displayJSON(canvas2);


    });
}

$('.btn-save3').on('click', function() {

    if ($('#activity-name3').val() == "" || $('#state-name3').val() == "") {
        $(".form-message").html("Vui Lòng Nhập Trường Này");
        $(".form-message").css("color", "red");
    } else {
        load();
        LoadActivity();


        function load() {

            var WfCode = $('#activity-name3').val();
            var WfName = $('#state-name3').val();
            var WfNote = $('#exampleFormControlTextarea5').val();
            var CreatedBy = "anhphi";
            var CreatedTime = "";
            var UpdatedBy = "anhphi";
            var UpdatedTime = "";
            var DeletedBy = "anhphi";
            var DeletedTime = "";
            var IsDeleted = true;
            var settings = {
                "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json",
                },
                "data": "{\r\n\r\n\"WfCode\":\"" + WfCode + "\",\r\n\"WfName\": \"" + WfName + "\",\r\n\"WfNote\": \"" + WfNote + "\"\r\n// \"CreatedBy\": \"" + CreatedBy + "\",\r\n// \"CreatedTime\": " + CreatedTime + ",\r\n// \"UpdatedBy\": \"" + UpdatedBy + "\",\r\n// \"UpdatedTime\": " + UpdatedTime + ",\r\n// \"DeletedBy\": \"" + DeletedBy + "\",\r\n// \"DeletedTime\": " + DeletedTime + ",\r\n// \"IsDeleted\": " + IsDeleted + "\r\n}",
            };
            $.ajax(settings).done(function(response) {
                alert("thành công");
            });
            $('.chosen').append('<option value ="' + WfName + '">' + WfName + '</option>');



        }


        function LoadActivity() {
            newdata = JSON.parse(dataweb);
            for (var i = 0; i < newdata.length; i++) {

                if (newdata[i].type == "draw2d.shape.node.Hub") {
                    var ActCode = newdata[i].id;
                    var ActName = newdata[i].labels[0].text;
                    var ActParent = $('#state-name3').val();
                    var dt = JSON.stringify(newdata[i]);
                    var ActStatus;
                    var ActAttributeGraph = dt.toString();
                    if (newdata[i].labels.length > 10) {

                        if (newdata[i].labels[10].id == "clock1") {
                            ActStatus = 1;
                        }
                        if (newdata[i].labels[10].id == "clock2") {
                            ActStatus = 2;
                        }
                        if (newdata[i].labels[10].id == "clock3") {
                            ActStatus = 3;
                        }
                        if (newdata[i].labels[10].id == "clock4") {
                            ActStatus = 4;
                        }
                    } else {
                        ActStatus = "";
                    }



                    var IsDeleted = true;
                    var settings = {
                        "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({ "ActCode": "" + ActCode + "", "ActName": "" + ActName + "", "ActParent": "" + ActParent + "", "ActNoted": "", "ActAttributeGraph": "" + ActAttributeGraph + "", "ActStatus": "" + ActStatus + "" }),
                    };

                    $.ajax(settings).done(function(response) {
                        console.log(response);
                    });
                }
                if (newdata[i].type == "draw2d.Connection") {
                    var TrsCode = newdata[i].id;
                    var TrsType = newdata[i].type;
                    var TrsTitle = newdata[i].labels[0].text;
                    var TrsParent = $('#state-name3').val();
                    var dt = JSON.stringify(newdata[i]);

                    var TrsAttrGraph = dt.toString();

                    var IsDeleted = true;
                    var settings = {
                        "url": "http://117.6.131.222:6789//api/ApiTransition",
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({ "TrsCode": "" + TrsCode + "", "TrsType": "" + TrsType + "", "TrsTitle": "" + TrsTitle + "", "TrsParent": "" + TrsParent + "", "TrsAttrGraph": "" + TrsAttrGraph + "" }),
                    };

                    $.ajax(settings).done(function(response) {
                        console.log(response);
                    });
                }
            }
        }
        transition();

        function transition() {
            newdata = JSON.parse(dataweb);
            var ActInitial1 = [];
            var ActDestination1 = [];

            for (var i = 0; i < newdata.length; i++) {

                if (newdata[i].type == "draw2d.Connection") {
                    var ActInitial = newdata[i].source.node;
                    ActInitial1.push(ActInitial);
                    var ActDestination = newdata[i].target.node;
                    ActDestination1.push(ActDestination);

                }

            }
            for (var i = 0; i < newdata.length; i++) {
                if (newdata[i].type == "draw2d.shape.node.Hub") {
                    var WfCode = $('#activity-name3').val();
                    for (var j = 0; j < ActInitial1.length; j++) {
                        if (newdata[i].id == ActInitial1[j]) {

                            var Condition = newdata[i].labels[1].text;
                            var settings6 = {
                                "url": "http://117.6.131.222:6789//api/ActivityTransition",
                                "method": "POST",
                                "timeout": 0,
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "data": JSON.stringify({ "WfCode": "" + WfCode + "", "ActInitial": "" + ActInitial1[j] + "", "Condition": "" + Condition + "", "ActDestination": "" + ActDestination1[j] + "" }),
                            };

                            $.ajax(settings6).done(function(response) {
                                console.log("adsfdsaf");
                            });
                        }
                    }
                }
            }

        }
        $('.modal3').css('display', 'none');
        $('.overlay').removeClass('overlay-show');
        $('.fade3').removeClass('show');

    }
});

//save new wl

//new wl
$(".create").click(function() {
    displayJSON(canvas2);
    $('.fade3').toggleClass('show');
    $('.modal3').css('display', 'block');
    if ($('.fade3').hasClass('show')) {
        $('.overlay').addClass('overlay-show');
    }

});
// end new

// get value input form newWFL

var nameee = "";
var wfcode = "";
var ti = "";
$(".autoarange").click(function() {
    var newdata = JSON.parse(dataweb);
    nameee = $('.chosen').val();
    var settings = {
        "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
        "method": "get",
        "datatype": json
    };
    $.ajax(settings).done(function(response) {


        if ($('.chosen').val() != 0) {
            canvas2.clear();
            var sum = [];
            for (var i = 0; i < response.length; i++) {
                if (response[i].ActParent == $('.chosen').val()) {
                    var jsons = JSON.parse(response[i].ActAttributeGraph);

                    sum.push(jsons);
                }
            }
            var settings2 = {
                "url": "http://117.6.131.222:6789//api/ApiTransition",
                "method": "get",
                "datatype": json
            };
            $.ajax(settings2).done(function(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].TrsParent == $('.chosen').val()) {
                        var jsons = JSON.parse(data[i].TrsAttrGraph);
                        sum.push(jsons);
                    }
                }


                var s = 150;
                var yh = 150;
                var count = 0;

                for (var t = 0; t < newdata.length; t++) {
                    if (newdata[t].type == "draw2d.shape.node.Hub") {

                        newdata[t].x = s;
                        newdata[t].y = yh;
                        s = s + 350;
                        if (s > 850) {
                            s = 150;
                            yh = yh + 200;

                        }
                        count++;
                    }
                }
                var reader = new draw2d.io.json.Reader();

                reader.unmarshal(canvas2, newdata);

                displayJSON(canvas2);
                updateLast();

                $(".auto").on("click", function() {

                    var node = canvas2.getPrimarySelection();
                    var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 25, width: 25, stroke: 1, x: 17, y: -35, visible: true });

                    if (!node.children.data[0].figure.children.data.length) {
                        node.children.data[0].figure.add(del, new draw2d.layout.locator.Locator());
                        node.children.data[0].figure.children.data[0].figure.attr({
                            cssClass: "dell2",
                            visible: true
                        });

                        $(".dell2").on("click", function() {
                            canvas2.remove(canvas2.getPrimarySelection());
                            checkdell2.push(node.id);
                            displayJSON(canvas2);

                        });
                    }

                });
                var getWF = {
                    "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
                    "method": "get",
                    "datatype": json
                }
                $.ajax(getWF).done(function(data) {

                    for (var i = 0; i < data.Data.length; i++) {

                        if (data.Data[i].WfName === nameee) {

                            wfcode = (data.Data[i].WfCode);
                            var gettime = {
                                "url": "http://117.6.131.222:6789//api/ActivityTransition",
                                "method": "get",
                                "datatype": json
                            }
                            $.ajax(gettime).done(function(data1) {
                                timerr();
                                // Update the count down every 1 second

                                function timerr() {
                                    for (var j = 0; j < data1.length; j++) {
                                        if (data1[j].WfCode == wfcode) {
                                            var figurearr = canvas2.getFigures();
                                            for (var t = 0; t < figurearr.data.length; t++) {
                                                if (figurearr.data[t].id == data1[j].ActInitial) {
                                                    ti = figurearr.data[t].children.data[1].figure.text;
                                                    var teo = figurearr.data[t].children.data[3].figure;
                                                    if (ti != "") {
                                                        var countDownDate = new Date(ti).getTime();
                                                        // Get today's date and time
                                                        var now = new Date().getTime();
                                                        // Find the distance between now and the count down date
                                                        var distance = countDownDate - now;
                                                        // Time calculations for days, hours, minutes and seconds
                                                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                                        // Output the result in an element with id="demo"
                                                        if (days >= 1) {
                                                            time = days + "d " + hours + "h " +
                                                                minutes + "m " + seconds + "s ";
                                                        } else {
                                                            time = hours + "h " +
                                                                minutes + "m " + seconds + "s ";
                                                        }
                                                        teo.attr({
                                                            text: time
                                                        });

                                                        displayJSON(canvas2);
                                                        // If the count down is over, write some text 
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    setTimeout(timerr, 1000);
                                }


                            });

                        }

                    }

                });


            });




        }
    });
});


function readdata() {



    nameee = $('.chosen').val();
    var settings = {
        "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
        "method": "get",
        "datatype": json
    };
    $.ajax(settings).done(function(response) {

        var acti = [];
        if ($('.chosen').val() != 0) {
            canvas2.clear();
            var sum = [];
            var string;
            for (var i = 0; i < response.length; i++) {
                if (response[i].ActParent == $('.chosen').val()) {
                    var jsons = JSON.parse(response[i].ActAttributeGraph);
                    acti.push(jsons);
                    sum.push(jsons);
                    ////add data vào bảng//
                    // string += '<tr class = "acti"><th>' + response[i].Id + '</th><th>' + response[i].ActName + '</th><th>' + response[i].ActStatus + '</th><th>' + "2 Days" + '</th></tr>';

                }

            }




            var settings2 = {
                "url": "http://117.6.131.222:6789//api/ApiTransition",
                "method": "get",
                "datatype": json
            };
            $.ajax(settings2).done(function(data) {
                var jss = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].TrsParent == $('.chosen').val()) {
                        var jsons = JSON.parse(data[i].TrsAttrGraph);

                        jss.push(jsons);
                        sum.push(jsons);



                    }
                }



                var reader = new draw2d.io.json.Reader();

                reader.unmarshal(canvas2, sum);
                displayJSON(canvas2);
                updateLast();

                ////tạo node khi đọc thấy connection//
                for (var js = 0; js < jss.length; js++) {
                    canvas2.add(new draw2d.shape.basic.Oval({
                        cssClass: "ball" + js,
                        id: "ball",
                        width: 10,
                        height: 10,
                        y: -5

                    }));
                    newdata = JSON.parse(dataweb);
                    for (var dt = 0; dt < newdata.length; dt++) {

                        if (jss[js].id == newdata[dt].id && newdata[dt].vertex.length <= 4) {
                            var path = "M" + "" + newdata[dt].vertex[0].x + " " + newdata[dt].vertex[0].y + "L" + "" + (newdata[dt].vertex[1].x - 4) + "," + newdata[dt].vertex[1].y + "Q" + "" + newdata[dt].vertex[1].x + "," + newdata[dt].vertex[1].y + " " + newdata[dt].vertex[1].x + " ," + (newdata[dt].vertex[1].y - 4) + "L" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y - 4) + "Q" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y) + " " + (newdata[dt].vertex[2].x + 4) + " ," + (newdata[dt].vertex[2].y) + "L" + "" + newdata[dt].vertex[3].x + "," + (newdata[dt].vertex[3].y);
                            $('.ball' + js).css('offset-path', "path('" + path + "')");
                            $('.ball' + js).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
                            // $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                            for (var t = 0; t < newdata.length; t++) {
                                if (newdata[dt].source.node == newdata[t].id) {

                                    if (newdata[t].labels.length > 10) {
                                        if (newdata[t].labels[10].id == "clock1") {
                                            $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                        }
                                        // if (newdata[t].labels[10].id == "clock2") {
                                        //     // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock3") {
                                        //     $('.ball' + i).css("animation", "red-ball2 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock4") {
                                        //     // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
                                        // }
                                    }
                                }
                                if (newdata[dt].target.node == newdata[t].id) {

                                    if (newdata[t].labels.length > 10) {
                                        // if (newdata[t].labels[10].id == "clock1") {
                                        //     $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock2") {
                                        //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                        // }
                                        if (newdata[t].labels[10].id == "clock3") {
                                            $('.ball' + js).css("animation", "red-ball2 2s linear infinite");
                                        }
                                        // if (newdata[t].labels[10].id == "clock4") {
                                        //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                    }
                                }

                            }


                        }
                        if (jss[js].id == newdata[dt].id && newdata[dt].vertex.length >= 5) {
                            var path = "M" + "" + newdata[dt].vertex[0].x + " " + newdata[dt].vertex[0].y + "L" + "" + (newdata[dt].vertex[1].x - 4) + "," + newdata[dt].vertex[1].y + "Q" + "" + newdata[dt].vertex[1].x + "," + newdata[dt].vertex[1].y + " " + newdata[dt].vertex[1].x + " ," + (newdata[dt].vertex[1].y - 4) + "L" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y + 4) + "Q" + "" + newdata[dt].vertex[2].x + "," + newdata[dt].vertex[2].y + " " + (newdata[dt].vertex[2].x + 4) + " ," + newdata[dt].vertex[2].y + "L" + "" + (newdata[dt].vertex[3].x - 4) + "," + newdata[dt].vertex[3].y + "Q" + "" + newdata[dt].vertex[3].x + "," + newdata[dt].vertex[3].y + " " + newdata[dt].vertex[3].x + "," + (newdata[dt].vertex[3].y + 4) + "L" + "" + newdata[dt].vertex[4].x + "," + (newdata[dt].vertex[4].y - 4) + "Q" + "" + newdata[dt].vertex[4].x + "," + newdata[dt].vertex[4].y + " " + (newdata[dt].vertex[4].x + 4) + "," + newdata[dt].vertex[4].y + "L" + "" + newdata[dt].vertex[5].x + "," + newdata[dt].vertex[5].y;
                            $('.ball' + js).css('offset-path', "path('" + path + "')");
                            $('.ball' + js).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
                            // $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                            for (var t = 0; t < newdata.length; t++) {
                                if (newdata[dt].source.node == newdata[t].id) {

                                    if (newdata[t].labels.length > 10) {
                                        if (newdata[t].labels[10].id == "clock1") {
                                            $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                        }
                                        // if (newdata[t].labels[10].id == "clock2") {
                                        //     // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock3") {
                                        //     $('.ball' + i).css("animation", "red-ball2 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock4") {
                                        //     // $('.ball' + i).css("animation", "red-ball 2s linear infinite");
                                        // }
                                    }
                                }
                                if (newdata[dt].target.node == newdata[t].id) {

                                    if (newdata[t].labels.length > 10) {
                                        // if (newdata[t].labels[10].id == "clock1") {
                                        //     $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                        // }
                                        // if (newdata[t].labels[10].id == "clock2") {
                                        //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                        // }
                                        if (newdata[t].labels[10].id == "clock3") {
                                            $('.ball' + js).css("animation", "red-ball2 2s linear infinite");
                                        }
                                        // if (newdata[t].labels[10].id == "clock4") {
                                        //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                    }
                                }

                            }


                        }



                    }

                }
                /// cập nhật lại path khi có sự kiện change///
                canvas2.getCommandStack().addEventListener(function(e) {
                    if (e.isPostChangeEvent()) {
                        displayJSON(canvas2);
                        for (var js = 0; js < jss.length; js++) {

                            newdata = JSON.parse(dataweb);
                            for (var dt = 0; dt < newdata.length; dt++) {

                                if (jss[js].id == newdata[dt].id && newdata[dt].vertex.length <= 4) {
                                    var path = "M" + "" + newdata[dt].vertex[0].x + " " + newdata[dt].vertex[0].y + "L" + "" + (newdata[dt].vertex[1].x - 4) + "," + newdata[dt].vertex[1].y + "Q" + "" + newdata[dt].vertex[1].x + "," + newdata[dt].vertex[1].y + " " + newdata[dt].vertex[1].x + " ," + (newdata[dt].vertex[1].y - 4) + "L" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y - 4) + "Q" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y) + " " + (newdata[dt].vertex[2].x + 4) + " ," + (newdata[dt].vertex[2].y) + "L" + "" + newdata[dt].vertex[3].x + "," + (newdata[dt].vertex[3].y);
                                    $('.ball' + js).css('offset-path', "path('" + path + "')");
                                    $('.ball' + js).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
                                    // $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                    for (var t = 0; t < newdata.length; t++) {
                                        if (newdata[dt].source.node == newdata[t].id) {

                                            if (newdata[t].labels.length > 10) {
                                                if (newdata[t].labels[10].id == "clock1") {
                                                    $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                                }
                                                // if (newdata[t].labels[10].id == "clock2") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock3") {
                                                //     $('.ball' + i).css("animation", "red-ball2 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock4") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                                // }
                                            }

                                        }
                                        if (newdata[dt].target.node == newdata[t].id) {

                                            if (newdata[t].labels.length > 10) {
                                                // if (newdata[t].labels[10].id == "clock1") {
                                                //     $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock2") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                                // }
                                                if (newdata[t].labels[10].id == "clock3") {
                                                    $('.ball' + js).css("animation", "red-ball2 2s linear infinite");
                                                }
                                                // if (newdata[t].labels[10].id == "clock4") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                            }
                                        }

                                    }


                                }
                                if (jss[js].id == newdata[dt].id && newdata[dt].vertex.length >= 5) {
                                    var path = "M" + "" + newdata[dt].vertex[0].x + " " + newdata[dt].vertex[0].y + "L" + "" + (newdata[dt].vertex[1].x - 4) + "," + newdata[dt].vertex[1].y + "Q" + "" + newdata[dt].vertex[1].x + "," + newdata[dt].vertex[1].y + " " + newdata[dt].vertex[1].x + " ," + (newdata[dt].vertex[1].y - 4) + "L" + "" + newdata[dt].vertex[2].x + "," + (newdata[dt].vertex[2].y + 4) + "Q" + "" + newdata[dt].vertex[2].x + "," + newdata[dt].vertex[2].y + " " + (newdata[dt].vertex[2].x + 4) + " ," + newdata[dt].vertex[2].y + "L" + "" + (newdata[dt].vertex[3].x - 4) + "," + newdata[dt].vertex[3].y + "Q" + "" + newdata[dt].vertex[3].x + "," + newdata[dt].vertex[3].y + " " + newdata[dt].vertex[3].x + "," + (newdata[dt].vertex[3].y + 4) + "L" + "" + newdata[dt].vertex[4].x + "," + (newdata[dt].vertex[4].y - 4) + "Q" + "" + newdata[dt].vertex[4].x + "," + newdata[dt].vertex[4].y + " " + (newdata[dt].vertex[4].x + 4) + "," + newdata[dt].vertex[4].y + "L" + "" + newdata[dt].vertex[5].x + "," + newdata[dt].vertex[5].y;
                                    $('.ball' + js).css('offset-path', "path('" + path + "')");
                                    $('.ball' + js).css("width", "10px", "height", "10px", "background", "#f33a58", "border-radius", "50%", "offset-distance", "0%");
                                    // $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                    for (var t = 0; t < newdata.length; t++) {
                                        if (newdata[dt].source.node == newdata[t].id) {

                                            if (newdata[t].labels.length > 10) {
                                                if (newdata[t].labels[10].id == "clock1") {
                                                    $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                                }
                                                // if (newdata[t].labels[10].id == "clock2") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock3") {
                                                //     $('.ball' + js).css("animation", "red-ball2 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock4") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                            }
                                        }
                                        if (newdata[dt].target.node == newdata[t].id) {

                                            if (newdata[t].labels.length > 10) {
                                                // if (newdata[t].labels[10].id == "clock1") {
                                                //     $('.ball' + js).css("animation", "red-ball1 2s linear infinite");
                                                // }
                                                // if (newdata[t].labels[10].id == "clock2") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                                // }
                                                if (newdata[t].labels[10].id == "clock3") {
                                                    $('.ball' + js).css("animation", "red-ball2 2s linear infinite");
                                                }
                                                // if (newdata[t].labels[10].id == "clock4") {
                                                //     // $('.ball' + js).css("animation", "red-ball 2s linear infinite");
                                            }
                                        }


                                    }



                                }

                            }


                        }



                    }





                });


                $(".auto").on("click", function() {

                    var node = canvas2.getPrimarySelection();
                    var del = new draw2d.shape.basic.Image({ path: "delete.png", height: 25, width: 25, stroke: 1, x: 17, y: -35, visible: true });

                    if (!node.children.data[0].figure.children.data.length) {
                        node.children.data[0].figure.add(del, new draw2d.layout.locator.Locator());
                        node.children.data[0].figure.children.data[0].figure.attr({
                            cssClass: "dell2",
                            visible: true
                        });

                        $(".dell2").on("click", function() {
                            canvas2.remove(canvas2.getPrimarySelection());
                            checkdell2.push(node.id);
                            displayJSON(canvas2);

                        });
                    }

                });
                var getWF = {
                    "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
                    "method": "get",
                    "datatype": json
                }
                $.ajax(getWF).done(function(data) {

                    for (var i = 0; i < data.Data.length; i++) {

                        if (data.Data[i].WfName === nameee) {

                            wfcode = (data.Data[i].WfCode);
                            var gettime = {
                                "url": "http://117.6.131.222:6789//api/ActivityTransition",
                                "method": "get",
                                "datatype": json
                            }
                            $.ajax(gettime).done(function(data1) {
                                timerr();
                                // Update the count down every 1 second
                                function timerr() {
                                    for (var j = 0; j < data1.length; j++) {
                                        if (data1[j].WfCode == wfcode) {
                                            var figurearr = canvas2.getFigures();
                                            for (var t = 0; t < figurearr.data.length; t++) {
                                                if (figurearr.data[t].id == data1[j].ActInitial) {
                                                    ti = figurearr.data[t].children.data[1].figure.text;
                                                    var teo = figurearr.data[t].children.data[3].figure;
                                                    if (ti != "") {
                                                        var countDownDate = new Date(ti).getTime();
                                                        // Get today's date and time
                                                        var now = new Date().getTime();
                                                        // Find the distance between now and the count down date
                                                        var distance = countDownDate - now;
                                                        // Time calculations for days, hours, minutes and seconds
                                                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                                        // Output the result in an element with id="demo"
                                                        if (days >= 1) {
                                                            time = days + "d " + hours + "h " +
                                                                minutes + "m " + seconds + "s ";
                                                        } else {
                                                            time = hours + "h " +
                                                                minutes + "m " + seconds + "s ";
                                                        }
                                                        teo.attr({
                                                            text: time
                                                        });

                                                        displayJSON(canvas2);
                                                        // If the count down is over, write some text 
                                                    }
                                                }
                                            }


                                        }
                                    }
                                    setTimeout(timerr, 1000);
                                }


                            });

                        }

                    }

                });


            });




        }
    });
}

$(".btn-save4").click(function() {
    if (nameee != "") {
        if (check == 1 || checkconn == 1) {
            var settings = {
                "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
                "method": "get",
                "datatype": json
            };
            $.ajax(settings).done(function(response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].ActParent == nameee) {
                        id = response[i].Id;
                        var settings2 = {
                            "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow/" + id + "",
                            "method": "DELETE",
                            "timeout": 0,
                            "headers": {
                                "Content-Type": "application/json"
                            }
                        };

                        $.ajax(settings2).done(function(response) {

                        });


                    }
                }
                LoadActivity();

                function LoadActivity() {
                    newdata = JSON.parse(dataweb);
                    for (var i = 0; i < newdata.length; i++) {

                        if (newdata[i].type == "draw2d.shape.node.Hub") {
                            console.log("dsafadsf");
                            var ActCode = newdata[i].id;
                            var ActName = newdata[i].labels[0].text;
                            var ActParent = nameee;
                            var dt = JSON.stringify(newdata[i]);

                            var ActAttributrGraph = dt.toString();


                            var IsDeleted = true;
                            var settings5 = {
                                "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
                                "method": "POST",
                                "timeout": 0,
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "data": JSON.stringify({ "ActCode": "" + ActCode + "", "ActName": "" + ActName + "", "ActParent": "" + ActParent + "", "ActNoted": "", "ActAttributeGraph": "" + ActAttributrGraph + "" }),
                            };

                            $.ajax(settings5).done(function(response) {
                                console.log(response);
                            });
                        }

                    }
                }
            });
            var settings3 = {
                "url": "http://117.6.131.222:6789//api/ApiTransition",
                "method": "get",
                "datatype": json
            };
            $.ajax(settings3).done(function(response2) {
                for (var k = 0; k < response2.length; k++) {
                    if (response2[k].TrsParent == nameee) {
                        id2 = response2[k].Id;
                        var settings4 = {
                            "url": "http://117.6.131.222:6789//api/ApiTransition/" + id2 + "",
                            "method": "DELETE",
                            "timeout": 0,
                            "headers": {
                                "Content-Type": "application/json"
                            }
                        };

                        $.ajax(settings4).done(function(response) {

                        });


                    }
                }
                LoadTransiton();

                function LoadTransiton() {
                    newdata = JSON.parse(dataweb);
                    for (var i = 0; i < newdata.length; i++) {

                        if (newdata[i].type == "draw2d.Connection") {
                            var TrsCode = newdata[i].id;
                            var TrsType = newdata[i].type;
                            var TrsTitle = newdata[i].labels[0].text;
                            var TrsParent = nameee;
                            var dt = JSON.stringify(newdata[i]);

                            var TrsAttrGraph = dt.toString();

                            var IsDeleted = true;
                            var settings6 = {
                                "url": "http://117.6.131.222:6789//api/ApiTransition",
                                "method": "POST",
                                "timeout": 0,
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "data": JSON.stringify({ "TrsCode": "" + TrsCode + "", "TrsType": "" + TrsType + "", "TrsTitle": "" + TrsTitle + "", "TrsParent": "" + TrsParent + "", "TrsAttrGraph": "" + TrsAttrGraph + "" }),
                            };

                            $.ajax(settings6).done(function(response) {
                                console.log(response);
                            });
                        }
                    }
                }
            });

            var getWFL = {
                "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
                "method": "get",
                "datatype": json
            }
            $.ajax(getWFL).done(function(data) {

                for (var i = 0; i < data.Data.length; i++) {

                    if (data.Data[i].WfName == nameee) {

                        wfcode = (data.Data[i].WfCode);

                        var trs = {
                            "url": "http://117.6.131.222:6789//api/ActivityTransition",
                            "method": "get",
                            "datatype": json
                        }
                        $.ajax(trs).done(function(data1) {
                            for (var j = 0; j < data1.length; j++) {
                                if (data1[j].WfCode == wfcode) {
                                    var id = data1[j].Id;
                                    var settings2 = {
                                        "url": "http://117.6.131.222:6789//api/ActivityTransition/" + id + "",
                                        "method": "DELETE",
                                        "timeout": 0,
                                        "headers": {
                                            "Content-Type": "application/json"
                                        }
                                    };

                                    $.ajax(settings2).done(function(response) {

                                    });
                                }
                            }
                            transition();

                            function transition() {
                                newdata = JSON.parse(dataweb);
                                var ActInitial1 = [];
                                var ActDestination1 = [];

                                for (var i = 0; i < newdata.length; i++) {

                                    if (newdata[i].type == "draw2d.Connection") {
                                        var ActInitial = newdata[i].source.node;
                                        ActInitial1.push(ActInitial);
                                        var ActDestination = newdata[i].target.node;
                                        ActDestination1.push(ActDestination);

                                    }

                                }


                                for (var i = 0; i < newdata.length; i++) {
                                    if (newdata[i].type == "draw2d.shape.basic.Rectangle") {
                                        var WfCode = wfcode;
                                        for (var j = 0; j < ActInitial1.length; j++) {
                                            if (newdata[i].id == ActInitial1[j]) {

                                                var Condition = newdata[i].labels[1].text;
                                                var settings6 = {
                                                    "url": "http://117.6.131.222:6789//api/ActivityTransition",
                                                    "method": "POST",
                                                    "timeout": 0,
                                                    "headers": {
                                                        "Content-Type": "application/json"
                                                    },
                                                    "data": JSON.stringify({ "WfCode": "" + WfCode + "", "ActInitial": "" + ActInitial1[j] + "", "Condition": "" + Condition + "", "ActDestination": "" + ActDestination1[j] + "" }),
                                                };

                                                $.ajax(settings6).done(function(response) {});
                                            }
                                        }
                                    }
                                }

                            }




                        });

                    }

                }

            });






        } else {
            var settings = {
                "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
                "method": "get",
                "datatype": json
            };
            $.ajax(settings).done(function(response) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i].ActParent == nameee) {
                        LoadActivity();

                        function LoadActivity() {
                            newdata = JSON.parse(dataweb);

                            if (checkdell.length == 0 && checkdell2.length == 0) {

                                for (var j = 0; j < newdata.length; j++) {

                                    if (response[i].ActCode == newdata[j].id) {
                                        var id = response[i].Id;
                                        var ActCode = newdata[j].id;
                                        var ActName = newdata[j].labels[0].text;
                                        var ActParent = nameee;
                                        var dt = JSON.stringify(newdata[j]);

                                        var ActAttributrGraph = dt.toString();

                                        var IsDeleted = true;
                                        var settings = {
                                            "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow/" + id + "",
                                            "method": "PUT",
                                            "timeout": 0,
                                            "headers": {
                                                "Content-Type": "application/json"
                                            },
                                            "data": JSON.stringify({ "ActCode": "" + ActCode + "", "ActName": "" + ActName + "", "ActParent": "" + ActParent + "", "ActNoted": "", "ActAttributeGraph": "" + ActAttributrGraph + "" }),
                                        };

                                        $.ajax(settings).done(function(response) {});
                                    }
                                }

                            } else {
                                if (checkdell.length > 0) {
                                    for (var j = 0; j < checkdell.length; j++) {
                                        if (response[i].ActCode == checkdell[j]) {
                                            var id = response[i].Id;
                                            var settings = {
                                                "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow/" + id + "",
                                                "method": "DELETE",
                                                "timeout": 0,
                                                "headers": {
                                                    "Content-Type": "application/json"
                                                }
                                            };

                                            $.ajax(settings).done(function(response) {});
                                            var settings2 = {
                                                "url": "http://117.6.131.222:6789//api/ApiTransition",
                                                "method": "get",
                                                "datatype": json
                                            };
                                            $.ajax(settings2).done(function(response2) {

                                                for (var k = 0; k < response2.length; k++) {
                                                    if (response2[k].TrsParent == nameee) {
                                                        id2 = response2[k].Id;
                                                        var settings3 = {
                                                            "url": "http://117.6.131.222:6789//api/ApiTransition/" + id2 + "",
                                                            "method": "DELETE",
                                                            "timeout": 0,
                                                            "headers": {
                                                                "Content-Type": "application/json"
                                                            }
                                                        };

                                                        $.ajax(settings3).done(function(response) {

                                                        });


                                                    }
                                                }
                                                LoadTransiton();

                                                function LoadTransiton() {
                                                    newdata = JSON.parse(dataweb);
                                                    for (var i = 0; i < newdata.length; i++) {
                                                        if (newdata[i].type == "draw2d.Connection") {
                                                            var TrsCode = newdata[i].id;
                                                            var TrsType = newdata[i].type;
                                                            var TrsTitle = newdata[i].labels[0].text;
                                                            var TrsParent = nameee;
                                                            var dt = JSON.stringify(newdata[i]);

                                                            var TrsAttrGraph = dt.toString();

                                                            var IsDeleted = true;
                                                            var settings = {
                                                                "url": "http://117.6.131.222:6789//api/ApiTransition",
                                                                "method": "POST",
                                                                "timeout": 0,
                                                                "headers": {
                                                                    "Content-Type": "application/json"
                                                                },
                                                                "data": JSON.stringify({ "TrsCode": "" + TrsCode + "", "TrsType": "" + TrsType + "", "TrsTitle": "" + TrsTitle + "", "TrsParent": "" + TrsParent + "", "TrsAttrGraph": "" + TrsAttrGraph + "" }),
                                                            };

                                                            $.ajax(settings).done(function(response) {});
                                                        }
                                                    }
                                                }

                                            });

                                        }
                                    }
                                }

                            }
                        }
                    }
                }
                if (checkdell2.length > 0) {
                    console.log(checkdell2);
                    var settings3 = {
                        "url": "http://117.6.131.222:6789//api/ApiTransition",
                        "method": "get",
                        "datatype": json
                    };
                    $.ajax(settings3).done(function(response2) {
                        for (var k = 0; k < response2.length; k++) {
                            if (response2[k].TrsParent == nameee) {
                                id2 = response2[k].Id;
                                var settings4 = {
                                    "url": "http://117.6.131.222:6789//api/ApiTransition/" + id2 + "",
                                    "method": "DELETE",
                                    "timeout": 0,
                                    "headers": {
                                        "Content-Type": "application/json"
                                    }
                                };

                                $.ajax(settings4).done(function(response) {

                                });


                            }
                        }
                        LoadTransiton();

                        function LoadTransiton() {
                            newdata = JSON.parse(dataweb);
                            for (var i = 0; i < newdata.length; i++) {

                                if (newdata[i].type == "draw2d.Connection") {
                                    var TrsCode = newdata[i].id;
                                    var TrsType = newdata[i].type;
                                    var TrsTitle = newdata[i].labels[0].text;
                                    var TrsParent = nameee;
                                    var dt = JSON.stringify(newdata[i]);

                                    var TrsAttrGraph = dt.toString();

                                    var IsDeleted = true;
                                    var settings10 = {
                                        "url": "http://117.6.131.222:6789//api/ApiTransition",
                                        "method": "POST",
                                        "timeout": 0,
                                        "headers": {
                                            "Content-Type": "application/json"
                                        },
                                        "data": JSON.stringify({ "TrsCode": "" + TrsCode + "", "TrsType": "" + TrsType + "", "TrsTitle": "" + TrsTitle + "", "TrsParent": "" + TrsParent + "", "TrsAttrGraph": "" + TrsAttrGraph + "" }),
                                    };

                                    $.ajax(settings10).done(function(response) {
                                        console.log(response);
                                    });
                                }
                            }
                        }

                    });


                }
            });
        }
        check = 0;
        alert("Đã lưu");
    } else if (nameee == "") {
        $('.fade3').toggleClass('show');
        $('.modal3').css('display', 'block');
        if ($('.fade3').hasClass('show')) {
            $('.overlay').addClass('overlay-show');
        }
    }

});
//hiện danh sách loại activity/
$('.list-activity').on('click', function() {
    $('.act-sidebar').toggleClass('act-sidebar__show-hidd');
    $('.act-sidebar__buger').addClass('buger__last');
});
$('.act-sidebar__close').on('click', function() {
    $('.act-sidebar').removeClass('act-sidebar__show-hidd');

});
// close json
$('.json_span').on('click', function() {
    $('.json_div').toggleClass('turn_on_of')
});
//hiện thông tin wf
$('.create-line').on('click', function() {
    $('.wfl-instance').toggleClass('wfl-instance__hiden');
});
$('.close_serach').on('click', function() {
    $('.wfl-instance').toggleClass('wfl-instance__hiden');
});



function activity_instance() {
    $("#a1").toggleClass("current");
    $("#a2").removeClass("current");
    $("#a3").removeClass("current");
    var getWF = {
        "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
        "method": "get",
        "datatype": json
    }
    $.ajax(getWF).done(function(data) {
        for (var j = 0; j < data.Data.length; j++) {
            if (data.Data[j].WfName == $("#act_instance").val()) {
                var settings = {
                    "url": "http://localhost:6001/WfActivityInstance/getActivity?wfCode=" + data.Data[j].WfCode,
                    "method": "get",
                    "datatype": json
                };
                $.ajax(settings).done(function(response) {
                    if ($('#act_instance').val() != 0) {
                        canvas2.clear();
                        var string;
                        for (var i = 0; i < response.length; i++) {

                            ////add data vào bảng//
                            string += '<tr class = "acti"><th>' + response[i].Id + '</th><th>' + response[i].ActName + '</th><th>' + response[i].Status + '</th><th>' + response[i].Time + " " + response[i].UnitTime + '</th></tr>';


                        }
                        $(".activity").html(string);
                        $(".wfl-instance__name").html("Báo Cáo_" + $("#act_instance").val());


                    }
                });

            }
        }
    });


}

function Activityfunction() {
    $("#a1").toggleClass("current");
    $("#a2").removeClass("current");
    $("#a3").removeClass("current");


    var getWF = {
        "url": "http://117.6.131.222:6789//api/ApiWorkFlow",
        "method": "get",
        "datatype": json
    }
    $.ajax(getWF).done(function(data) {
        for (var j = 0; j < data.Data.length; j++) {
            if (data.Data[j].WfName == $("#act_instance").val()) {
                var settings = {
                    "url": "http://localhost:6001/WfActivityInstance/getActivity?wfCode=" + data.Data[j].WfCode,
                    "method": "get",
                    "datatype": json
                };
                $.ajax(settings).done(function(response) {
                    if ($('#act_instance').val() != 0) {
                        canvas2.clear();
                        var string;
                        for (var i = 0; i < response.length; i++) {

                            ////add data vào bảng//
                            string += '<tr class = "acti"><th><a href="#">' + response[i].Id + '</a></th><th>' + response[i].ActName + '</th><th>' + response[i].Status + '</th><th>' + response[i].Time + " " + response[i].UnitTime + '</th></tr>';


                        }
                        $(".activity").html(string);
                        $(".wfl-instance__name").html("Báo Cáo_" + $("#act_instance").val()) + "_5678";

                    }
                });

            }
        }
    });
    $(".title").html('<tr><th>ID</th><th>Tên hoạt động</th><th>T Thái</th> <th>Đếm ngược</th></tr>');

}

function Datafunction() {
    $("#a2").toggleClass("current");
    $("#a1").removeClass("current");
    $("#a3").removeClass("current");
    var settings = {
        "url": "http://117.6.131.222:6789//api/ApiActivityWorkFlow",
        "method": "get",
        "datatype": json
    };
    $.ajax(settings).done(function(response) {

        var acti = [];
        if ($('.chosen').val() != 0) {
            canvas2.clear();
            var title;
            var string;
            for (var i = 0; i < response.length; i++) {
                if (response[i].ActParent == $('.chosen').val()) {
                    var jsons = JSON.parse(response[i].ActAttributeGraph);

                    ////add data vào bảng//
                    // string += '<tr class = "acti"><th>' + response[i].Id + '</th><th>' + response[i].ActName + '</th><th>' + response[i].ActStatus + '</th><th>' + "2 Days" + '</th></tr>';
                }

            }

            // $(".wfl-instance__name").html("nameee");
        }
    });
    $(".title").html('<tr><th>Giá trị 1</th><th>Giá trị 2</th><th>Giá trị 3</th></tr>');
    $(".activity").html("string");
}

function Documentfunction() {
    $("#a3").toggleClass("current");
    $("#a2").removeClass("current");
    $("#a1").removeClass("current");



    $(".title").html('<tr><th>ID</th><th>Mã Tài Liệu</th><th>Tên Tài Liệu</th> <th></th></tr>');
    $(".activity").html("string");
}