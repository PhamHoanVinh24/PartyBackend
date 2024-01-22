/**
 * @class example.connection_labeledit.LabelConnection
 * 
 * A simple Connection with a label wehich sticks in the middle of the connection..
 *
 * @author Andreas Herz
 * @extend draw2d.Connection

 */
var labelc;
var alala;

var LabelConnection = draw2d.Connection.extend({

    init: function() {
        this._super();


        // Create any Draw2D figure as decoration for the connection
        //
        var auto = new Connection_Label({

        });

        auto.attr({
            text: "Auto",
            width: 20,
            height: 20,
            bgColor: "white",
            cssClass: "auto",
            radius: 3
        });

        this.add(auto, new draw2d.layout.locator.PolylineMidpointLocator(), 1000000);
        var dell = new draw2d.shape.basic.Image({
            path: "./img/delete.png",
            color: "#27ae60",
            fontColor: "#0d0d0d",
            bgColor: "#ffffff",
            stroke: 1,
            height: 25,
            width: 25,
            y: -30,
            x: 20,
            visible: false
        });


        auto.add(dell, new draw2d.layout.locator.Locator());
        var setting = new draw2d.shape.basic.Image({ path: "./img/setting.png", height: 25, width: 25, stroke: 1, x: -10, y: -30, visible: false, cssClass: "settinglabel" });
        auto.add(setting, new draw2d.layout.locator.Locator());


        // var ab = this.dell.add (new draw2d.shape.basic.Label({
        //     text:"Auto",
        //     color: "#27ae60",
        //     fontColor: "#0d0d0d",
        //     bgColor: "#ffffff",
        //     stroke: 1,
        //     height:25,
        //     width:-35,
        //     radius:1,
        //     y:-35,
        //     x:0
        // }),new draw2d.layout.locator.Locator());
        var that = this;
        that.setCssClass("connect");
        auto.installEditor(new draw2d.ui.LabelInplaceEditor({ width: 20 }));


        // add the new decoration to the connection with a position locator.
        //
        // this.add(this.label, new draw2d.layout.locator.ManhattanMidpointLocator());
        // this.add(this.label, new draw2d.layout.locator.ManhattanMidpointLocator());
        // this.add(this.dell, new draw2d.layout.locator.PolylineMidpointLocator());

        // this.setId(100);
        // this.setParent(this.img);

        dell.on("click", function() {

            canvas2.remove(that);

        });
        auto.on("click", function() {
            var node = canvas2.getPrimarySelection();
            console.log(node);

            if (dell.isVisible() == false) {
                dell.attr({
                    visible: true
                });
                setting.attr({
                    visible: true
                });
            } else {
                dell.attr({
                    visible: false
                });
                setting.attr({
                    visible: false
                });
            }

        });


        // Length of path
        // var pathLength = Math.floor(path.getTotalLength());

        // // Move obj element along path based on percentage of total length
        // function moveObj(prcnt) {
        //     prcnt = (prcnt * pathLength) / 100;

        //     // Get x and y values at a certain point in the line
        //     pt = path.getPointAtLength(prcnt);
        //     pt.x = Math.round(pt.x);
        //     pt.y = Math.round(pt.y);

        //     obj.style.webkitTransform = 'translate3d(' + pt.x + 'px,' + pt.y + 'px, 0)';
        // }

        // // Initialize
        // moveObj(0);

        // // Slider functionality
        // var sliderEl = document.getElementById('slider');
        // var sliderValEl = document.getElementById('slider_val');
        // sliderEl.addEventListener('mousemove', function() {

        //     sliderValEl.value = this.value;
        //     moveObj(sliderValEl.value);
        // });

        // Animation functionality
        // Use request animation frame for better performance 
        // if you're doing a lot of animation
        // var toggleAnimationBtn = document.getElementById('test')
        // var animationTimer = false;

        // function animationHandler(prcnt) {
        //     moveObj(prcnt);
        //     sliderEl.value = prcnt;
        //     sliderValEl.value = prcnt;


        //     if (prcnt < 100) {
        //         animationTimer = setTimeout(function() {
        //             animationHandler(prcnt + 1);
        //         }, 50)
        //     } else {
        //         animationTimer = setTimeout(function() {
        //             animationHandler(0);
        //         }, 50);
        //     }
        // }

        // toggleAnimationBtn.addEventListener('mouseup', function() {
        //     if (animationTimer) {
        //         clearTimeout(animationTimer);
        //         animationTimer = false;
        //     } else {
        //         animationTimer = animationHandler(0);
        //     }
        // });



        // Register a label editor with a dialog
        //


        this.attr({
            cssClass: "path",
            router: new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
            outlineStroke: 1,
            outlineColor: "#303030",
            stroke: 2,
            color: "gray",
            radius: 4,
        });




    },
    getPersistentAttributes: function() {
        var memento = this._super();

        // add all decorations to the memento 
        //
        memento.labels = [];
        this.children.each(function(i, e) {
            var labelJSON = e.figure.getPersistentAttributes();
            labelJSON.locator = e.locator.NAME;
            memento.labels.push(labelJSON);
        });

        return memento;
    },

    /**
     * @method 
     * Read all attributes from the serialized properties and transfer them into the shape.
     * 
     * @param {Object} memento
     * @returns 
     */
    setPersistentAttributes: function(memento) {
        this._super(memento);

        // remove all decorations created in the constructor of this element
        //
        this.resetChildren();

        // and add all children of the JSON document.
        //
        $.each(memento.labels, $.proxy(function(i, json) {
            // create the figure stored in the JSON
            var figure = eval("new " + json.type + "()");

            // apply all attributes
            figure.attr(json);

            // instantiate the locator
            var locator = eval("new " + json.locator + "()");

            // add the new figure as child to this figure
            this.add(figure, locator);
        }, this));
    }



});
// $("#anh").on("click",function(){
//             console.log("asddfs");
//         });