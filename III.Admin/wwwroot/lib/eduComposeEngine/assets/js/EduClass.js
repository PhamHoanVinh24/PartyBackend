// fabric.EduGroup = fabric.util.createClass(fabric.Group, {

//     type: 'edu-group',
  
//     initialize: function(element, options) {
//         this.callSuper('initialize', element, options);
//         options && this.set({
            
//         });
//     },
  
//     toObject: function() {
//         return fabric.util.object.extend(this.callSuper('toObject'), { name: this.name });
//     }
// });

// fabric.NamedImage.fromObject = function(object, callback) {
//     fabric.util.loadImage(object.src, function(img) {
//         callback && callback(new fabric.NamedImage(img, object));
//     });
// };

// fabric.NamedImage.async = true;
function objectSnapCanvas(obj) {
    obj.setCoords();

    const width = obj.width * obj.scaleX;
    const height = obj.height * obj.scaleY;

    if(obj.left < snap) {
        obj.left = 0;
    }

    if(obj.top < snap) {
        obj.top = 0;
    }

    if((width + obj.left) > (canvas.width - snap)) {
        obj.left = canvas.width - width;
    }

    if((height + obj.top) > (canvas.height - snap)) {
        obj.top = canvas.height - height;
    }

    canvas.requestRenderAll();
}

var snap = 20; //Pixels to snap
let activeObject = null;

fabric.util.object.extend(fabric.Group.prototype, {
    shadowObj: new fabric.Shadow({
        color: '#aaa',
        blur: 20,
        offsetX: 0, 
        offsetY: 0
    }),
    pos: 'front',
    snap: true,
    hasShadow: false,
    readySound: false,
    sound: new Audio('assets/song/snap.mp3'),
    playSound(src) {
        if (!!src) {
            this.sound.src = src;
            this.sound.load();
        }
        if (this.readySound) {
            this.sound.play();
            this.readySound = false;
            setTimeout(() => {
                this.readySound = true;
            }, 500);
        }
    },
    start() {
        this.sound.volume = 0.6;

        // this.on('mousedown', function() {
            
        // })

        this.on('mousedblclick', function() {
            activeObject = this;

            const editForm = $('#edit-form')[0];
            
            if (editForm.style.visibility === 'hidden') {
                $('#textColor')[0].value = this.item(1).fill;
                $('#bgColor')[0].value = this.item(0).fill;
                $('#borderColor')[0].value = this.item(0).stroke;
                // $('#borderWidth')[0].value = this.item(0).strokeWidth;
                $('#curve')[0].value = this.item(0).rx ? this.item(0).rx : 0;
                $('#shadow')[0].innerText = this.hasShadow ? 'On' : 'Off';
                $('#snap')[0].innerText = this.snap ? 'On' : 'Off';
                $('#fixed')[0].innerText = this.lockMovementX ? 'On' : 'Off';

                const top = this.top + unit_y - 60;
                const left = this.left + (this.width / 2) + unit_x - 180;

                $('#edit-form').css({ 'visibility': 'visible', 'top': top + 'px', 'left':left + 'px' });
            }
            else {
                $('#edit-form').css({ 'visibility': 'hidden'});
                $('#sub-menu').css({ 'visibility': 'hidden'});
            }
        })

        
        this.on('moving', function(options) {
            if (this.snap) {
                const _this = this;
                options = options.transform;
                // Sets corner position coordinates based on current angle, width and height
                objectSnapCanvas(this);
                
            
                const o1 = {
                    x: this.top + (this.height / 2),
                    y: this.left + (this.width / 2)
                }

                // Loop through objects
                canvas.forEachObject(function (obj) {
                    if (obj === _this || (obj.name && obj.name === 'port')) return;

                    const o2 = {
                        x: obj.top + (obj.height / 2),
                        y: obj.left + (obj.width / 2)
                    }

                    if (Math.sqrt((o1.x - o2.x)**2 + (o1.y - o2.y)**2) < snap) {
                        _this.top = o2.x - (_this.height / 2);
                        _this.left = o2.y - (_this.width / 2);

                        if (_this.readySound) _this.playSound();
                    }
                });
            
                this.setCoords();

            }

            // console.log('obj moving',);
            changeCoordinateConnectLine(this);

            if ($('#edit-form')[0].style.visibility === 'visible') {
                $('#edit-form').css({ 'visibility': 'hidden' });
                $('#sub-menu').css({ 'visibility': 'hidden' });
            }
        })
    }
});