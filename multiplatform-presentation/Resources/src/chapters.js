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
        return true;
    },

    addMario: function () {

        var cache = cc.SpriteFrameCache.getInstance();
        var spriteBatch = this.getChildByTagRecursive(this, this.TAG_SPRITEBATCH);
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

    },

    fire1: function () {
        var height = game.worldsize.height/5;
        var mario = this.getChildByTagRecursive(this, this.TAG_MARIO);
        mario.runAction(cc.Sequence.create(
                cc.MoveBy.create( 0.2, cc.p(0, height) ),
                cc.MoveBy.create( 0.15, cc.p(0, -height) )
        ));
    }

}));


game.chapters.push( game.BaseLayer.extend({
    TAG_MARIO : 99999901,

    init: function () {
        this._super();
        this.addMario();
        this.addPhysics();
        this.addTitle("Chapter 3 - Physics (Chipmunk here)");
        var text = [
            " ",
            "There is just no end to what you can do with physics",
            " ",
            "Create objects through javascript but with native performance (when running in app)"
        ];
       
        this.addBodyText(text);
        
        return true;
    },

    addMario: function () {

        var cache = cc.SpriteFrameCache.getInstance();
        var tag = this.TAG_MARIO;
        var mario = game.PhysicsSpriteHelper.createSprite({
            spriteFrame: "minimario-walk-01.png",
            spriteBatch: this.getChildByTagRecursive(this, this.TAG_SPRITEBATCH),
            tag: tag,
            pos : cc.p(game.worldsize.width * 0.20, game.worldsize.height/2),
            mass : 5,
            elasticity : 0,
            friction : 0
        });

        var animation = cc.Animation.create();
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-01.png"));
        animation.addSpriteFrame(cache.getSpriteFrame("minimario-walk-02.png"));
        animation.setDelayPerUnit(0.150);
        mario.runAction( cc.RepeatForever.create( cc.Animate.create(animation) ) );

    },

    fire1: function () {
        this.toggleDebug();
    },

    update: function (dt) {
        this._super(dt);

        // actions that affect character
        var mario = this.getChildByTagRecursive(this, this.TAG_MARIO);
        var joystick = this.getChildByTagRecursive(this, this.TAG_JOYSTICK_LAYER);
        var p = joystick.getPadPosition();
        var currentVel = mario.getBody().getVel();
        mario.getBody().setVel(cp.v(p.x * 4, currentVel.y));
        if (p.x < 0) {
            mario.setScaleX( -1 * Math.abs(mario.getScaleX()) ); // flip   
        } else {
            mario.setScaleX( 1 * Math.abs(mario.getScaleX()) );
        }

        if (p.y > 20 && !mario.jumping) {
            cc.log('jump');
            mario.jumping = true;
            var velX = mario.getBody().getVel().x;
            mario.getBody().setVel(cp.v(velX, 200));
        } else if (currentVel.y < 0.1 && currentVel.y > -0.1 && mario.jumping) {
            mario.jumping = false;
        }

    },

    addPhysics: function () {
        var pos = cc.p(game.worldsize.width / 2, game.worldsize.height / 2);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        var sprite1 = game.PhysicsSpriteHelper.createSprite({
            file : 'res/CloseSelected.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0.8,
            friction : 0,
            callback: addCreatedSprite
        });

        var sprite2 = game.PhysicsSpriteHelper.createSprite({
            file : 'res/CloseNormal.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            callback: addCreatedSprite
        });

    }
}));
