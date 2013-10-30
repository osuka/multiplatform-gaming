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
        // Find child clicked
        var point = this.convertTouchToNodeSpace(touches[0]);
        var i;
        var children = this.getChildren();
        for(i = 0; i < children.length; i++) {
            var child = children[i];
            var boundingBox = child.getBoundingBox();
            if (cc.rectContainsPoint(boundingBox, point)) {
                if (child.touched) {
                    child.touched();
                }
            }
        }
    },

    onTouchesBegan: function () {
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
        
        this.addJoystick(cc.p(game.worldsize.width / 2, game.worldsize.height / 2));

        // Load mario resources and create sprites
        // good reference: http://www.cocos2d-x.org/forums/19/topics/23698
        var spriteBatch = cc.SpriteBatchNode.create("res/mario-sheet_default.png");
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("res/mario-sheet_default.plist");

        var mario = cc.Sprite.createWithSpriteFrameName("minimario-walk-01.png");
        spriteBatch.addChild(mario);
        mario.setPosition(cc.p(0, game.worldsize.height/2));
        this.addChild(spriteBatch);

        var animation = cc.Animation.create();
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-01.png"));
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-02.png"));
        animation.setDelayPerUnit(0.150);
        mario.runAction( cc.RepeatForever.create( cc.Animate.create(animation) ) );

        mario.setScale(game.scale);

        var reachedBorder = function () {
            mario.setScaleX( -1 * mario.getScaleX() ); // flips horizontally
        };
        mario.runAction( cc.RepeatForever.create(
            cc.Sequence.create(
                cc.MoveBy.create( 2, cc.p(game.worldsize.width, 0) ),
                cc.CallFunc.create(reachedBorder),
                cc.MoveBy.create( 2, cc.p(-game.worldsize.width, 0) ),
                cc.CallFunc.create(reachedBorder)
        )));

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
        this.setPosition(cc.p(game.worldsize.width * 0.10, game.worldsize.height));
        this.titleLabel.setAnchorPoint(cc.p(0.0, 1.0));
        this.titleLabel.setScale(game.scale/6.0);
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
        this.bodyLabel = cc.LabelBMFont.create(
            str,
            "res/headers-100.fnt",
            game.worldsize.width*0.85,
            cc.TEXT_ALIGNMENT_LEFT,
            cc.p(0, 0)
        );
        
        // below title
        this.bodyLabel.setAnchorPoint(cc.p(0.0, 1.0));
        this.bodyLabel.setPosition(cc.p(0, -10 * game.scale));
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

    addJoystick: function(pos) {
//        this.joystickBase = new game.PhysicsSprite('res/freewill/dpad.png',
//                                         cc.p(joy_x, joy_y),
//                                         10 /* mass */,
//                                         0.1 /* elasticity */,
//                                         10 /* friction */);
//        this.addChild(joystickBase);
//        this.joystick2 = new game.PhysicsSprite('res/freewill/dpad.png',
//                                      cc.p(joy_x, joy_y),
//                                      10 /* mass */,
//                                      0.1 /* elasticity */,
//                                      10 /* friction */);
//        this.addChild(this.joystick2);
                            
//        this.joystick = new game.PhysicsSprite(
//            'res/freewill/pad.png',
//            cc.p(pos.x, pos.y),
//            5 /* mass */,
//            0 /* elasticity */,
//            0 /* friction */);
//        this.addChild(this.joystick);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        this.joystickBase = game.PhysicsSpriteHelper.createSprite({
            file : 'res/freewill/dpad.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            callback: addCreatedSprite
        });

        this.joystick = game.PhysicsSpriteHelper.createSprite({
            file : 'res/freewill/pad.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            callback: addCreatedSprite
        });

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

