/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var game = game || {};


// Set scale based on DPI

game.scale = 1.0; // is adjusted in scene creation

game.BaseLayer = cc.Layer.extend({

    DEBUG_OBJECT_TAG: 99999990,
    JOYSTICK_BASE_TAG: 99999991,
    JOYSTICK_PAD_TAG: 99999992,
    JOYSTICK_BUTTON_TAG: 99999993,

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

    getChildByTagRecursive: function (base, tag) {
        var obj = base.getChildByTag(tag);
        if (obj) return obj;
        var children = base.getChildren();
        var i;
        for(i = children.length-1; i >= 0; i--) {
            var child = children[i];
            var found = this.getChildByTagRecursive(child, tag);
            if (found) return found;
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
                return child.touched && child.touched(point);
            }
        };
        for(j = 0; j < touches.length; j++) {
            point = this.convertTouchToNodeSpace(touches[j]);
            this._walkChildren(callback);
        }

        // joystick is a special case, release it if there's no touches
        if (!joystickMoved && joystickBase) {
            joystickBase.touched();
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

        // create physics world
        //
        game.space = new cp.Space();
        game.space.iterations = 5;
        game.space.gravity = cp.v(0, -400);
        
        this.createBoundaries();
        
        this.addJoystick();

        this.scheduleUpdate();
//        this.toggleDebug();
        return true;
    },
    
    // Add a title label
    //
    addTitle: function (text) {
        this.titleLabel = cc.LabelBMFont.create(
            text,
            "res/headers-100.fnt",
            game.worldsize.width*0.85,
            cc.TEXT_ALIGNMENT_LEFT,
            cc.p(0, 0)
        );
        var pos_x = game.worldsize.width * 0.05;
        var pos_y = game.worldsize.height;
        this.titleLabel.setPosition(cc.p(pos_x, pos_y));
        this.titleLabel.setAnchorPoint(cc.p(0.0, 1.0));
        this.titleLabel.setScale(game.scale/6.0);
        // this.titleLabel.color = cc.ccc(180, 0, 0);
        this.addChild(this.titleLabel);
        var _this = this;
        this.titleLabel.touchedStart = function () {
            _this.toggleDebug();
        };
        return this.titleLabel;
    },
    
    // Add text under the title
    // - Text can be a string or an array of strings.
    //
    addBodyText: function (text) {
        var str;
        if (text instanceof Array) {
            str = text.join('\n');
        } else {
            str = text;
        }
        
        var pos_y = game.worldsize.height -
                    this.titleLabel.getBoundingBox().height -
                    2 * game.scale;
        var pos_x = game.worldsize.width * 0.05;
        
        this.bodyLabel = cc.LabelBMFont.create(
            str,
            "res/headers-100.fnt",
            game.worldsize.width * 0.80,
            cc.TEXT_ALIGNMENT_LEFT,
            cc.p(0, 0)
        );
        
        // below title
        this.bodyLabel.setAnchorPoint(cc.p(0.0, 1.0));
        this.bodyLabel.setPosition(cc.p(pos_x, pos_y));
        this.bodyLabel.setScale(game.scale/8);
        this.addChild(this.bodyLabel);
        return this.bodyLabel;
    },
    
    // Enable or disable debug
    //
    toggleDebug: function () {
    
        // display FPS
        var director = cc.Director.getInstance();

        // display physics objects
        var tag = this.DEBUG_OBJECT_TAG;
        var d = this.getChildByTag(tag);
        if (!d) {
            game.debugDraw = new cc.PhysicsDebugNode();
            game.debugDraw.init();
            game.debugDraw.setSpace(game.space);
            this.addChild(game.debugDraw, 0 /* zorder */, tag);
            director.setDisplayStats(true);
        } else {
            this.removeChild(d);
            game.debugDraw = undefined;
            director.setDisplayStats(false);
        }
    },

    // Create physics objects to enclose the screen
    //
    createBoundaries: function () {
        var thickness = 2;

        var floor = game.space.addShape(new cp.SegmentShape(
            game.space.staticBody,
            cp.v(0, thickness),
            cp.v(game.worldsize.width, thickness),
            thickness
        ));
        floor.setElasticity(1);
        floor.setFriction(1);

        var lwall = game.space.addStaticShape(new cp.SegmentShape(
            game.space.staticBody,
            cp.v(thickness, game.worldsize.height),
            cp.v(thickness, 0),
            thickness
        ));
        lwall.setElasticity(1);
        lwall.setFriction(1);
        
        var rwall = game.space.addStaticShape(new cp.SegmentShape(
            game.space.staticBody,
            cp.v(game.worldsize.width - thickness, game.worldsize.height),
            cp.v(game.worldsize.width - thickness, 0),
            thickness
        ));
        rwall.setElasticity(1);
        rwall.setFriction(1);

        var ceiling = game.space.addStaticShape(new cp.SegmentShape(
            game.space.staticBody,
            cp.v(0, game.worldsize.height - thickness),
            cp.v(game.worldsize.width, game.worldsize.height - thickness),
            thickness
        ));
        ceiling.setElasticity(1);
        ceiling.setFriction(1);
    },

    addJoystick: function() {

        var _this = this;
        var size = cc.p(150, 150);
        var pos = cc.p(size.x/2 + size.x*0.10, size.y/2 + size.y * 0.10);
        var joystickBase = cc.Sprite.create('res/joystick-base.png');
        joystickBase.setPosition(pos);
        joystickBase.touchedStart = joystickBase.touchedMoved = function (touchPoint) {
            var joystick = _this.getChildByTag(_this.JOYSTICK_PAD_TAG);
            if (joystick) {
                joystick.stopAllActions();
                joystick.setPosition(touchPoint);
                return true; // consume event
            }
            return false;
        };
        joystickBase.touched = function () {
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
        this.addChild(joystick, 110 /* zorder */, this.JOYSTICK_PAD_TAG);

        var joystickButton = cc.Sprite.create('res/joystick-button.png');
        var buttonPos = cc.p(game.worldsize.width - pos.x, pos.y);
        joystickButton.setPosition(buttonPos);
        joystickButton.touchedStart = function (touchPoint) {
            if (typeof _this.fire === 'function') {
                _this.fire(touchPoint);
            }
            return true; // consume event
        };
        this.addChild(joystickButton, 110 /* zorder */, this.JOYSTICK_BUTTON_TAG);

        // var centerBody = new cp.StaticBody(5,1);
        // centerBody.setPos(cc.p(300, 300));
        // // game.space.addBody(centerBody);

        // game.joystick = game.PhysicsSpriteHelper.createSprite({
        //     space : game.joystickSpace,
        //     file : 'res/freewill/pad.png',
        //     pos : pos,
        //     mass : 5,
        //     elasticity : 0,
        //     friction : 0,
        //     callback: function (sprite) {
        //         _this.addChild(sprite);
        //     }
        // });
        // game.joystick.body.setPos(pos);
        // // game.joystick.body.setVel(cp.v(25,25));
        // game.joystick.setZOrder(110);
        // // game.joystick.touched = function () {
        // //     cc.log('Joystick tocado');
        // //     return true; // consume event
        // // };

        // // join pad to a fixed point
        // var constraint = new cp.SlideJoint(game.joystick.body, centerBody, cp.v(0, 0), cp.v(0, 0), 0, 75);
        // // var constraint = new cp.DampedSpring(game.joystick.body, centerBody, cp.v(0, 0), cp.v(0, 0), 0, 1000, 150);
        // // var constraint = new cp.PinJoint(centerBody, joystick.body, cc.p(0, 0), cc.p(0,0));
        // game.joystickSpace.addConstraint(constraint);

    },
                              
    update : function (dt) {
        game.space.step(dt);
    },

});

game.InitialScene = cc.Scene.extend({
    ctor: function(mainLayerClass) {
        this._super();

        // save layer for later use
        this.mainLayerClass = mainLayerClass;
        cc.associateWithNative( this, cc.Scene );
        
        // define world size
        game.worldsize = cc.Director.getInstance().getWinSize();
        
        // update DPI
        if (typeof cc.Device !== "undefined") {
            cc.log("DPI: " + cc.Device.getDPI());
            if (cc.Device.getDPI() < 150) {
                game.scale = 2.0;
            } else if (cc.Device.getDPI() < 300) {
                game.scale = 3.0;
            } else {
                game.scale = 4.0;
            }
        }
    },

    onEnter: function () {
        this._super();
        var layer = new this.mainLayerClass();
        this.addChild(layer);
        layer.init();
    }
});

game.Controller = {

    currentChapter: 0,

    boot: function () {
        // The director controles the game
        var director = cc.Director.getInstance();
        director.setDisplayStats(false);

        // set FPS. the default value is 1.0/60 if you don't call this
        // Note: this doesn't seem to work for Mac or Android
        director.setAnimationInterval(1.0 / 30);

        // show initial chapter
        this.showChapter(0);
    },

    showChapter: function (n) {
        this.currentChapter = n;
        var newScene = new game.InitialScene(game.chapters[n]);
        var director = cc.Director.getInstance();
        if (!director.getRunningScene()) {
            director.runWithScene(newScene);
        } else {
            director.replaceScene(newScene);
        }
    },
    
    showNextChapter: function () {
        if (this.currentChapter < game.chapters.length - 1) {
            this.showChapter(this.currentChapter + 1);
        }
    }
};

