var game = game || {};

game.Joystick = cc.Layer.extend({
    JOYSTICK_BASE_TAG: 99999991,
    JOYSTICK_PAD_TAG: 99999992,
    JOYSTICK_BUTTON1_TAG: 99999993,
    JOYSTICK_BUTTON2_TAG: 99999994,

    ctor: function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    _walkChildren: function (callback) {
        var children = this.getChildren();
        var i;
        for(i = children.length-1; i >= 0; i--) {
            var child = children[i];
            if (callback(child) === true) {
                break;
            }
        }
    },

    // The release event - as it stands in this code,
    // it could be missed by the target 
    onTouchesEnded: function (touches) {
        var j;
        var joystickMoved = false;
        var joystickBase = this.getChildByTag(this.JOYSTICK_BASE_TAG);
        var point;
        var callback = function (child) {
            var boundingBox = child.getBoundingBox();
            if (cc.rectContainsPoint(boundingBox, point)) {
                joystickMoved = joystickMoved || (child === joystickBase);
                return child.touchedEnded && child.touchedEnded(point);
            }
        };
        for(j = 0; j < touches.length; j++) {
            point = this.convertTouchToNodeSpace(touches[j]);
            this._walkChildren(callback);
        }

        // joystick is a special case, release it if there's no touches
        if (!joystickMoved && joystickBase) {
            joystickBase.touchedEnded();
        }
    },

    onTouchesMoved: function (touches) {
        var children = this.getChildren();
        var i,j;
        for(j = 0; j < touches.length; j++) {
            var point = this.convertTouchToNodeSpace(touches[j]);
            for(i = children.length-1; i >= 0; i--) {
                var child = children[i];
                var boundingBox = child.getBoundingBox();
                if (cc.rectContainsPoint(boundingBox, point)) {
                    if (child.touchedMoved) {
                        var result = child.touchedMoved(point);
                        if (result) { // stop propagating event if true
                            return;
                        }
                    }
                }
            }
        }
    },

    onTouchesBegan: function (touches) {
        // Find child clicked - children are ordered by zorder
        // in parent
        if (!touches) return;
        var i,j;
        var children = this.getChildren();
        for(j = 0; j < touches.length; j++) {
            var point = this.convertTouchToNodeSpace(touches[j]);
            for(i = children.length-1; i >= 0; i--) {
                var child = children[i];
                var boundingBox = child.getBoundingBox();
                if (cc.rectContainsPoint(boundingBox, point)) {
                    if (child.touchedStart) {
                        var result = child.touchedStart(point);
                        if (result) { // stop propagating event if true
                            return;
                        }
                    }
                }
            }
        }
    },

    init: function () {
        this._super();

        this.setTouchEnabled(true);

        var _this = this;
        var size = cc.p(150 * game.scale/3, 150 * game.scale/3);
        var pos = cc.p(size.x/2 + size.x*0.10, size.y/2);
        var joystickBase = cc.Sprite.create('res/joystick-base.png');
        joystickBase.setPosition(pos);
        joystickBase.setScale(game.scale/3);
        joystickBase.touchedStart = joystickBase.touchedMoved = function (touchPoint) {
            var joystick = _this.getChildByTag(_this.JOYSTICK_PAD_TAG);
            if (joystick) {
                joystick.stopAllActions();
                joystick.setPosition(touchPoint);
                return true; // consume event
            }
            return false;
        };
        joystickBase.touchedEnded = function () {
            var joystickBase = _this.getChildByTag(_this.JOYSTICK_BASE_TAG);
            var joystick = _this.getChildByTag(_this.JOYSTICK_PAD_TAG);
            if (!joystickBase || !joystick) {
                return false;
            }
            joystick.stopAllActions();
            var center = joystickBase.getPosition();
            var currentPos = joystick.getPosition();
            var xd = currentPos.x - center.x;
            var yd = currentPos.y - center.y;
            var distance = Math.sqrt(xd*xd + yd*yd);
            joystick.runAction(cc.MoveTo.create( 0.10, center ));
            return true; // consume event
        };
        this.addChild(joystickBase, 100 /* zorder */, this.JOYSTICK_BASE_TAG);

        var joystick = cc.Sprite.create('res/joystick-pad.png');
        joystick.setPosition(pos);
        joystick.setScale(game.scale/3);
        this.addChild(joystick, 110 /* zorder */, this.JOYSTICK_PAD_TAG);

        var joystickButton1 = cc.Sprite.create('res/joystick-button.png');
        joystickButton1.setPosition(cc.p(game.worldsize.width - pos.x*2.6, pos.y));
        joystickButton1.setScale(game.scale/3);
        joystickButton1.touchedStart = function (touchPoint) {
            var parent = _this.getParent();
            if (typeof parent.fire1 === 'function') {
                parent.fire1(touchPoint);
            }
            return true; // consume event
        };
        this.addChild(joystickButton1, 110 /* zorder */,
            this.JOYSTICK_BUTTON1_TAG);

        var joystickButton2 = cc.Sprite.create('res/joystick-button.png');
        joystickButton2.setPosition(cc.p(game.worldsize.width - pos.x, pos.y));
        joystickButton2.setScale(game.scale/3);
        joystickButton2.touchedStart = function (touchPoint) {
            var parent = _this.getParent();
            if (typeof parent.fire2 === 'function') {
                parent.fire2(touchPoint);
            }
            return true; // consume event
        };
        this.addChild(joystickButton2, 110 /* zorder */,
            this.JOYSTICK_BUTTON1_TAG);

        return true;
    },

    getPadPosition: function () {
        var joystick = this.getChildByTag(this.JOYSTICK_PAD_TAG);
        var base = this.getChildByTag(this.JOYSTICK_BASE_TAG);
        var jp = joystick.getPosition();
        var bp = base.getPosition();
        return cc.p(jp.x - bp.x, jp.y - bp.y);
    },

});