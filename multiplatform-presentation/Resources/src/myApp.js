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

var GlopbalSpace;

// CPSprite from https://github.com/Wu-Hao/Cocos2d-Simple-Ragdoll/blob/master/src/CPApp.js

var CPSprite = cc.Sprite.extend({
    
    ctor : function (filename, pos, mass, Elasticity, friction) {
        this._super();
        // needed for JS-Binding compatibility
        cc.associateWithNative( this, cc.Sprite );

        mass = mass || 5;
        this.init(filename);
        var body = GlobalSpace.addBody(
            new cp.Body(mass,
                        cp.momentForBox(mass,
                                        this.getContentSize().width,
                                        this.getContentSize().height)));
        body.setPos(cp.v(pos.x, pos.y));
        var shape = GlobalSpace.addShape(
            new cp.BoxShape(body,
                            this.getContentSize().width,
                            this.getContentSize().height));
        shape.setElasticity(Elasticity || 0.2);
        shape.setFriction(friction || 0.8);
        this.body = body;
        this.shape = shape;
    },
});

var MyLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    onTouchesEnded: function (touches) {
        // Find child clicked
        cc.log("touches ended");
        cc.log(this.helloImg);
        var point = this.convertTouchToNodeSpace(touches[0]);
        cc.log("clicked on " + point);
        var i;
        var children = this.getChildren();
        for(i = 0; i < children.length; i++) {
            var child = children[i];
            cc.log("child " + child);
            var boundingBox = child.getBoundingBox();
            if (cc.rectContainsPoint(boundingBox, point)) {
                cc.log("found on node " + i);
                if (child.touched) {
                    child.touched();
                }
            }
        }
    },

    onTouchesBegan: function () {
        cc.log("touches began");
    },

    init: function () {

        //////////////////////////////
        // super init first
        this._super();

        this.setTouchEnabled(true);

        var size = cc.Director.getInstance().getWinSize();

        //////////////////////////////
        // create physics world
        // https://github.com/Wu-Hao/Cocos2d-Simple-Ragdoll/blob/master/src/CPApp.js
        GlobalSpace = new cp.Space();
        GlobalSpace.iterations = 5;
        GlobalSpace.gravity = cp.v(0, -400);
        var thickness = 50;
        var floor = GlobalSpace.addShape(new cp.SegmentShape(
            GlobalSpace.staticBody,
            cp.v(0, 0 - thickness),
            cp.v(size.width, 0 - thickness),
            thickness
        ));
        floor.setElasticity(1);
        floor.setFriction(1);
//        var lwall = GlobalSpace.addShape(new cp.SegmentShape(
//            GlobalSpace.staticBody,
//            cp.v(0-thickness, size.height),
//            cp.v(0-thickness,0),
//            thickness
//        ));
//        var rwall = GlobalSpace.addShape(new cp.SegmentShape(
//            GlobalSpace.staticBody,
//            cp.v(size.width + thickness, size.height),
//            cp.v(size.width + thickness, 0),
//            thickness
//        ));
//        var ceiling = GlobalSpace.addShape(new cp.SegmentShape(
//            GlobalSpace.staticBody,
//            cp.v(0, size.height + thickness),
//            cp.v(size.width, size.height + thickness),
//            thickness
//        ));
//        lwall.setElasticity(1);
//        lwall.setFriction(1);
//        rwall.setElasticity(1);
//        rwall.setFriction(1);
//        ceiling.setElasticity(1);
//        ceiling.setFriction(1);
        this.scheduleUpdate();
        this.addJoystick(cc.p(size.width / 2, size.height / 2));
                              
        /////////////////////////////
        // add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size

        // add a "close" icon to exit the progress. it's an autorelease object
        var scaleLabel = (function () {
            cc.log("close button was clicked.");
            var action1 = cc.ScaleTo.create( 0.1 /* duration */, 1.2 /* scale */ );
            var action2 = cc.ScaleTo.create( 0.05 /* duration */, 1.0 /* scale */ );
            var sequence = cc.Sequence.create(action1, action2);
            this.helloLabel.runAction(sequence);
        }).bind(this);
        var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            scaleLabel,
            this);
        closeItem.setAnchorPoint(cc.p(0.5, 0.5));

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu, 1);
        closeItem.setPosition(cc.p(size.width - 20, 20));

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        // this.helloLabel = cc.LabelTTF.create("Hello World", "Arial", 38);
        var scale = 1.0;
        if (typeof cc.Device !== "undefined") {
            cc.log("DPI: " + cc.Device.getDPI());
            if (cc.Device.getDPI() < 150) {
               scale = 2.0;
            } else if (cc.Device.getDPI() < 300) {
               scale = 4.0;
            } else {
               scale = 8.0;
            }
        }
        this.helloLabel = cc.LabelBMFont.create("Chapter 1.\nThis is a multi-line text that should be word-wrapped accordingly.", "res/headers-100.fnt", size.width * 0.85);
        // position the label on the center of the screen
        this.helloLabel.setPosition(cc.p(size.width * 0.10, size.height));
        this.helloLabel.setAnchorPoint(cc.p(0.0, 1.0));
        this.helloLabel.touched = scaleLabel;
        this.helloLabel.setScale(scale/8.0);
        // add the label as a child to this layer
        this.addChild(this.helloLabel, 5);

        // add "Helloworld" splash screen"
        // this.sprite = cc.Sprite.create("res/HelloWorld.png");
        // this.sprite.setAnchorPoint(cc.p(0.5, 0.5));
        // this.sprite.setPosition(cc.p(size.width / 2, size.height / 2));
        // this.addChild(this.sprite, 0);

        // Load mario resources and create sprites
        // good reference: http://www.cocos2d-x.org/forums/19/topics/23698
        var spriteBatch = cc.SpriteBatchNode.create("res/mario-sheet_default.png");
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("res/mario-sheet_default.plist");

        var mario = cc.Sprite.createWithSpriteFrameName("minimario-walk-01.png");
        spriteBatch.addChild(mario);
        mario.setPosition(cc.p(0, size.height/2));
        this.addChild(spriteBatch);

        var animation = cc.Animation.create();
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-01.png"));
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-02.png"));
        animation.setDelayPerUnit(0.150);
        mario.runAction( cc.RepeatForever.create( cc.Animate.create(animation) ) );

        mario.setScale(scale);

        var reachedBorder = function () {
            mario.setScaleX( -1 * mario.getScaleX() ); // flips horizontally
        };
        mario.runAction( cc.RepeatForever.create(
            cc.Sequence.create(
                cc.MoveBy.create( 2, cc.p(size.width, 0) ),
                cc.CallFunc.create(reachedBorder),
                cc.MoveBy.create( 2, cc.p(-size.width, 0) ),
                cc.CallFunc.create(reachedBorder)
        )));

        return true;
    },

    addJoystick: function(pos) {
        var joy_x = 400;
        var joy_y = 400;

//        this.joystickBase = new CPSprite('res/freewill/dpad.png',
//                                         cc.p(joy_x, joy_y),
//                                         10 /* mass */,
//                                         0.1 /* elasticity */,
//                                         10 /* friction */);
//        this.addChild(joystickBase);
        this.joystick2 = new CPSprite('res/freewill/dpad.png',
                                      cc.p(joy_x, joy_y),
                                      10 /* mass */,
                                      0.1 /* elasticity */,
                                      10 /* friction */);
        this.addChild(this.joystick2);
                            
        this.joystick = new CPSprite('res/freewill/pad.png',
                      cc.p(joy_x, joy_y),
                      10 /* mass */,
                      0.1 /* elasticity */,
                      10 /* friction */);
        this.addChild(this.joystick);
    },
                              
    update : function (dt) {
        GlobalSpace.step(dt);
        var pos = this.joystick.body.getPos();
        this.joystick.setPosition(cc.p(pos.x, pos.y));
    },

});

var MyScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Scene );
    },

    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
