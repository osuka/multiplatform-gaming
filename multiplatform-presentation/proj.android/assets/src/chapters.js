var game = game || {};

game.chapters = [];

game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();

        this.addTitle("Chapter 1 - Why?");

        var text = [
            " ",
            "Well, creating a game or app for all possible distributions is HARD.",
            "This can help you jumpstart your project/startup etc.",
            " ",
            "BONUS: Fun!"
        ];
        
        this.addBodyText(text);
        return true;
    },

    fire: function () {
        game.Controller.showNextChapter();
    }

}));


game.chapters.push( game.BaseLayer.extend({

    TAG_MARIO : 99999901,

    init: function () {
        this._super();

        this.addMario();

        this.addTitle("Chapter 2 - Animations");

        var text = [
            " ",
            "cocos2d provides a simple framework for animations"
        ];
        
        this.addBodyText(text);
        
        this.bodyLabel.touchedStart = function () {
            game.Controller.showNextChapter();
        };


        return true;
    },

    addMario: function () {
        // Load mario resources and create sprites
        // good reference: http://www.cocos2d-x.org/forums/19/topics/23698
        var spriteBatch = cc.SpriteBatchNode.create("res/mario-sheet_default.png");
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("res/mario-sheet_default.plist");

        var mario = cc.Sprite.createWithSpriteFrameName("minimario-walk-01.png");
        spriteBatch.addChild(mario, 0, this.TAG_MARIO);
        mario.setPosition(cc.p(0, game.worldsize.height/2));

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

        this.addChild(spriteBatch);
    },

    fire: function () {
        //game.Controller.showNextChapter();
        var height = game.worldsize.height/5;
        var mario = this.getChildByTagRecursive(this, this.TAG_MARIO);
        mario.runAction(cc.Sequence.create(
                cc.MoveBy.create( 0.2, cc.p(0, height) ),
                cc.MoveBy.create( 0.15, cc.p(0, -height) )
        ));
    }

}));


game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();

        this.addPhysics();

        this.addTitle("Chapter 3 - Physics (Chipmunk here)");

        var text = [
            " ",
            "There is just no end to what you can do with physics",
            " ",
            "Create objects through javascript but with native performance (when running in app)"
        ];
        
        this.addBodyText(text);
        
        this.bodyLabel.touchedStart = function () {
            game.Controller.showNextChapter();
        };

        return true;
    },

    addPhysics: function () {
        var pos = cc.p(game.worldsize.width / 2, game.worldsize.height / 2);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        this.joystickBase = game.PhysicsSpriteHelper.createSprite({
            file : 'res/freewill/dpad.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0.8,
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

    }

}));
