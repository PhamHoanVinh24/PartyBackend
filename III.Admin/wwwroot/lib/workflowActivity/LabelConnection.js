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
            path: "/images/workflowActivity/delete.png",
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
        var setting = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/setting.png", height: 25, width: 25, stroke: 1, x: -10, y: -30, visible: false, cssClass: "settinglabel" });
        auto.add(setting, new draw2d.layout.locator.Locator());
        var that = this;
        that.setCssClass("connect");
        auto.installEditor(new draw2d.ui.LabelInplaceEditor({ width: 20 }));
        dell.on("click", function() {
            canvas2.remove(that);
        });
        auto.on("click", function() {
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
