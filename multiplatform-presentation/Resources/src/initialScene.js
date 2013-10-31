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

    ctor: function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    onTouchesEnded: function (touches) {
        // Find child clicked - children are ordered by zorder
        // in parent
        if (!touches) return;
        var point = this.convertTouchToNodeSpace(touches[0]);
        var i;
        var children = this.getChildren();
        for(i = children.length-1; i >= 0; i--) {
            var child = children[i];
            var boundingBox = child.getBoundingBox();
            if (cc.rectContainsPoint(boundingBox, point)) {
                if (child.touched) {
                    var result = child.touched(point);
                    if (result) { // stop propagating event if true
                        return;
                    }
                }
            }
        }
    },

    onTouchesMoved: function (touches) {
        // Find child clicked - children are ordered by zorder
        // in parent
        if (!touches) return;
        var point = this.convertTouchToNodeSpace(touches[0]);
        var i;
        var children = this.getChildren();
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
    },

    onTouchesBegan: function (touches) {
        // Find child clicked - children are ordered by zorder
        // in parent
        if (!touches) return;
        var point = this.convertTouchToNodeSpace(touches[0]);
        var i;
        var children = this.getChildren();
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
        this.toggleDebug();
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
        this.titleLabel.touched = function () {
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
        if (typeof game.debugDraw === 'undefined') {
            game.debugDraw = new cc.PhysicsDebugNode();
            game.debugDraw.init();
            game.debugDraw.setSpace(game.space);
            this.addChild(game.debugDraw);
            director.setDisplayStats(true);
        } else {
            this.removeChild(game.debugDraw);
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
        var pos = cc.p(300, 300);
        var joystickBase = cc.Sprite.create('res/freewill/dpad.png');
        joystickBase.setPosition(pos);
        joystickBase.setZOrder(100);
        joystickBase.touchedStart = joystickBase.touchedMoved = function (touchPoint) {
            game.joystick.stopAllActions();
            game.joystick.setPosition(touchPoint);
            return true; // consume event
        };
        joystickBase.touched = function (touchPoint) {
            game.joystick.setPosition(touchPoint);
            game.joystick.stopAllActions();
            var center = joystickBase.getPosition();
            var xd = touchPoint.x - center.x;
            var yd = touchPoint.y - center.y;
            var distance = Math.sqrt(xd*xd + yd*yd);
            game.joystick.runAction(cc.MoveTo.create( 0.10, center ));
            return true; // consume event
        };
        this.addChild(joystickBase);

        game.joystick = cc.Sprite.create('res/freewill/pad.png');
        game.joystick.setPosition(pos);
        game.joystick.setZOrder(110);
        this.addChild(game.joystick);


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
        if (game.joystickSpace) {
            game.joystickSpace.step(dt);
        }
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

