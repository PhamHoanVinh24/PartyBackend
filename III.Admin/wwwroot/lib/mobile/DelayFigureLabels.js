var Delay_Label = draw2d.shape.icon.Icon.extend({

    NAME: "draw2d.shape.node.Delay_Hub",

    DEFAULT_COLOR: new draw2d.util.Color("#4DF0FE"),
    BACKGROUND_COLOR: new draw2d.util.Color("#fff"),

    /**
     * @constructor
     * 
     * @param {Object} [attr] the configuration of the shape
     */
    init: function(attr, setter, getter) {
        this.label = null;

        this._super(
            $.extend({ color: this.DEFAULT_COLOR.darker(), bgColor: this.BACKGROUND_COLOR }, attr),
            $.extend({
                // deprecated
                label: this.setLabel,
                /** @attr {String} text the text to display in the center of the hub */
                text: this.setLabel
            }, setter),
            $.extend({
                label: this.getLabel,
                text: this.getLabel
            }, getter));

        var _port = this.port = this.createPort("hybrid", new draw2d.layout.locator.CenterLocator());

        var r = draw2d.geo.Rectangle;
        this.CONNECTION_DIR_STRATEGY = [function(peerPort) { return _port.getParent().getBoundingBox().getDirection(peerPort.getAbsolutePosition()); },
            function(peerPort) { return _port.getAbsoluteY() > peerPort.getAbsoluteY() ? r.DIRECTION_UP : r.DIRECTION_DOWN; },
            function(peerPort) { return _port.getAbsoluteX() > peerPort.getAbsoluteX() ? r.DIRECTION_LEFT : r.DIRECTION_RIGHT; }
        ];

        // redirect the glow effect and the hitTest for the port to the parent node
        //
        this.port.setGlow = $.proxy(this.setGlow, this);
        this.port._orig_hitTest = this.port.hitTest;
        this.port.hitTest = $.proxy(this.hitTest, this);


        // provide a special connection anchor for this port. We use the bounding box of the
        // parent as connection border
        //
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        this.port.setVisible(false);
        this.port.setVisible = function() {};

        this.setConnectionDirStrategy(0);
    },
    function(attr, setter, getter) {
        this._super($.extend({ stroke: 0, bgColor: null, width: 210, height: 179 }, attr), setter, getter);
    },

    createSet: function() {
        var set = this.canvas.paper.set();

        // BoundingBox
        var shape = this.canvas.paper.path("M1.5 16.5h46.383C55.95 16.5 62 22.93 62 31.5s-6.05 15-14.117 15H1.5z");
        set.push(shape);



        return set;
    },


    /**
     * @method
     * Called by the framework during drag&drop operations if the user drag a figure over this figure
     *
     * @param {draw2d.Figure} draggedFigure The figure which is currently dragging
     *
     * @return {draw2d.Figure} the figure which should receive the drop event or null if the element didn't want a drop event
     **/
    delegateTarget: function(draggedFigure) {
        // redirect the dragEnter handling to the hybrid port
        //
        return this.getHybridPort(0).delegateTarget(draggedFigure);
    },


    /**
     * @method
     * This value is relevant for the interactive resize of the figure.
     *
     * @return {Number} Returns the min. width of this object.
     */
    getMinWidth: function() {
        if (this.label !== null) {
            return Math.max(this.label.getMinWidth(), this._super());
        }
        return this._super();
    },


    /**
     * @inheritdoc
     * 
     * @private
     */
    repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }

        attributes = attributes || {};

        // set some good defaults if the parent didn't
        if (typeof attributes.fill === "undefined") {
            if (this.bgColor !== null) {
                attributes.fill = "90-" + this.bgColor.hash() + ":5-" + this.bgColor.lighter(0.3).hash() + ":95";
            } else {
                attributes.fill = "none";
            }
        }

        this._super(attributes);
    },

    /**
     * @method
     * Set the label for the Hub
     * 
     *      // Alternatively you can use the attr method:
     *      figure.attr({
     *        text: label
     *      });
     * 
     * 
     * @param {String} label
     * @since 3.0.4
     */
    setLabel: function(label) {
        // Create any Draw2D figure as decoration for the connection
        //
        if (this.label === null) {
            var _this = this;

            this.label = new draw2d.shape.basic.Label({ text: label, color: "#0d0d0d", fontColor: "#0d0d0d", stroke: 0 });
            // add the new decoration to the connection with a position locator.
            //
            this.add(this.label, new draw2d.layout.locator.CenterLocator());
            this.label.setSelectionAdapter(function() {
                return _this;
            });
            this.label.delegateTarget = function() {
                return _this.port;
            }
        } else {
            this.label.setText(label);
        }

    },

    /**
     * @method
     * Set the strategy for the connection direction calculation.<br>
     * <br>
     * 
     * <ul>
     * <li>0 - Use the best/shortest direction (UP/RIGHT/DOWN/LEFT) for the connection routing (default)</li>
     * <li>1 - Use UP/DOWN for the connection direction</li>
     * <li>2 - Use LEFT/RIGHT</li>
     * </ul>
     * @param {Number} strategy the connection routing strategy to use
     * @since 2.4.3
     */
    setConnectionDirStrategy: function(strategy) {
        switch (strategy) {
            case 0:
            case 1:
            case 2:
                this.port.getConnectionDirection = this.CONNECTION_DIR_STRATEGY[strategy];
                break;
        }
    },

    /**
     * @inheritdoc
     */
    getPersistentAttributes: function() {
        var memento = this._super();

        memento.dirStrategy = this.CONNECTION_DIR_STRATEGY.indexOf(this.port.getConnectionDirection);
        if (this.label !== null) {
            memento.label = this.label.getText();
        }
        memento.labels = [];
        this.children.each(function(i, e) {
            var labelJSON = e.figure.getPersistentAttributes();
            labelJSON.locator = e.locator.NAME;
            memento.labels.push(labelJSON);
        });

        return memento;
    },

    /**
     * @inheritdoc
     */
    setPersistentAttributes: function(memento) {
        this._super(memento);

        if (typeof memento.dirStrategy === "number") {
            this.setConnectionDirStrategy(memento.dirStrategy);
        }

        if (typeof memento.label !== "undefined") {
            this.setLabel(memento.label);
        }
        this.resetChildren();
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