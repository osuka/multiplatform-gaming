var game = game || {};

game.chapters = [];


// some helper functions
// #ugly code below

game.TAG_MARIO = 99999901;

game.addAutomaticMario = function (spriteBatch) {
    var cache = cc.SpriteFrameCache.getInstance();
    var mario = cc.Sprite.createWithSpriteFrameName("minimario-walk-01.png");
    spriteBatch.addChild(mario, 0, game.TAG_MARIO);
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

};

game.addPhysicalMario = function (spriteBatch) {

    var cache = cc.SpriteFrameCache.getInstance();
    var tag = game.TAG_MARIO;
    var mario = game.PhysicsSpriteHelper.createSprite({
        spriteFrame: "minimario-walk-01.png",
        spriteBatch: spriteBatch,
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

};

// Simple movement based on touch joystick
game.moveMario = function (mario, p, dt) {
    var currentVel = mario.getBody().getVel();

    // Note: setting velocity directly is a *BAD* thing
    // Better to apply impulses
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
};


game.findMario = function (layer) {
    return game.findChildByTagRecursive(layer, this.TAG_MARIO);
};

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();
        this.addTitle("Why?");
        var text = [
            " ",
            "Well, creating a game or app for all possible distributions is HARD.",
            " ",
            "Maybe you say you like C++ or Java, but want to stop living a lie.",
            " ",
            "BONUS: Fun!",
        ];
        this.addBodyText(text);
        return true;
    }

}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();
        this.addTitle("How?");
        var text = [
            " ",
            "There's many ways to skin a cat (*).",
            " ",
            "cocos2d-x: Uses SpiderMonkey, C++, Java, C#",
            " ",
            "It's in github. Look it up.",
            " ",
            "(*) Why English people skin cats, I don't know."
        ];
        this.addBodyText(text);
        return true;
    }

}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({

    init: function () {
        this._super();
        var spriteBatch = game.findChildByTagRecursive(this, this.TAG_SPRITEBATCH);
        game.addAutomaticMario(spriteBatch);
        this.addTitle("Animations");
        var text = [
            " ",
            "Similar to some UI libraries and other game engines",
            " ",
            "Define objects, apply animations, respond to callbacks",
            " ",
            "This mario has: anim for sprite change, sequence of anims",
            "to move/flip, sequence for jump"

        ];
        this.addBodyText(text);
        return true;
    },

    fire1: function () {
        var height = game.worldsize.height/5;
        var mario = game.findMario(this);
        mario.runAction(cc.Sequence.create(
                cc.MoveBy.create( 0.2, cc.p(0, height) ),
                cc.MoveBy.create( 0.15, cc.p(0, -height) )
        ));
    }

}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({
    init: function () {
        this._super();
        var spriteBatch = game.findChildByTagRecursive(this, this.TAG_SPRITEBATCH);
        game.addPhysicalMario(spriteBatch);
        this.addSomePhysics();
        this.addTitle("Physics (Chipmunk here)");
        var text = [
            " ",
            "There is just no end to what you can do with physics",
            " ",
            "Create objects through javascript but with native performance (when running in app)"
        ];
       
        this.addBodyText(text);
        
        return true;
    },


    fire1: function () {
        this.toggleDebug();
    },

    update: function (dt) {
        this._super(dt);

        var mario = game.findMario(this);
        var joystick = game.findChildByTagRecursive(this, this.TAG_JOYSTICK_LAYER);
        var p = joystick.getPadPosition();
        game.moveMario(mario, p, dt);
    },

    addSomePhysics: function () {
        var pos = cc.p(game.worldsize.width / 2, game.worldsize.height / 2);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        game.PhysicsSpriteHelper.createSprite({
            file : 'res/CloseSelected.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0.8,
            friction : 0,
            callback: addCreatedSprite
        });

        game.PhysicsSpriteHelper.createSprite({
            file : 'res/CloseNormal.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            callback: addCreatedSprite
        });

    }
}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({
    init: function () {
        this._super();
        var spriteBatch = game.findChildByTagRecursive(this, this.TAG_SPRITEBATCH);
        game.addPhysicalMario(spriteBatch);
        this.addSomePhysics();
        this.addTitle("OH BEFORE I FORGET");
        var text = [
            " ",
            "Subscribe to my comic: http://gatillos.com",
            " ",
            "Follow me on twitter: @osuka",
            " ",
            "Any resemblance to real persons, living or dead, is purely coincidental."
        ];
       
        this.addBodyText(text);
        
        return true;
    },


    fire1: function () {
        this.toggleDebug();
    },

    update: function (dt) {
        this._super(dt);

        var mario = game.findMario(this);
        var joystick = game.findChildByTagRecursive(this, this.TAG_JOYSTICK_LAYER);
        var p = joystick.getPadPosition();
        game.moveMario(mario, p, dt);
    },

    addSomePhysics: function () {
        var pos = cc.p(game.worldsize.width / 2, game.worldsize.height / 2);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        game.PhysicsSpriteHelper.createSprite({
            file : 'res/paul/chap1_66_lo_thumb.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            scale : 1, /* force scale, else takes it from game */
            callback: addCreatedSprite
        });
    }
}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({
    init: function () {
        this._super();
        var spriteBatch = game.findChildByTagRecursive(this, this.TAG_SPRITEBATCH);
        game.addPhysicalMario(spriteBatch);
        this.addSomePhysics();
        this.addTitle("Joints");
        var text = [
            " ",
            "Not the smoking kind",
            " ",
            "Best thing about chipmunk physics",
            " "
        ];
       
        this.addBodyText(text);
        
        return true;
    },


    fire1: function () {
        this.toggleDebug();
    },

    update: function (dt) {
        this._super(dt);

        var mario = game.findMario(this);
        var joystick = game.findChildByTagRecursive(this, this.TAG_JOYSTICK_LAYER);
        var p = joystick.getPadPosition();
        game.moveMario(mario, p, dt);
    },

    addSomePhysics: function () {
        var pos = cc.p(game.worldsize.width / 2, game.worldsize.height / 2);

        var _this = this;

        var addCreatedSprite = function (sprite) {
            _this.addChild(sprite);
        };

        game.PhysicsSpriteHelper.createSprite({
            file : 'res/paul/chap1_66_lo_thumb.png',
            pos : cc.p(pos.x, pos.y),
            mass : 5,
            elasticity : 0,
            friction : 0,
            scale : 1, /* force scale, else takes it from game */
            callback: addCreatedSprite
        });

        var j, sprite, sprite_first;
        for(j = 0; j < 10; j++) {
            var sprite = game.PhysicsSpriteHelper.createSprite({
                file : 'res/CloseSelected.png',
                pos : cc.p(pos.x + Math.random() * j * 10,
                           pos.y + Math.random() * j * 10),
                mass : 5,
                elasticity : 0.8,
                friction : 0,
                callback: addCreatedSprite
            });
            if (!sprite_first) {
                sprite_first = sprite;
            } else {
                // join them together
                var constraint = new cp.SlideJoint(
                    sprite_first.body,
                    sprite.body,
                    cp.v(0, 0), cp.v(0, 0),
                    Math.random() * 10, 10 + Math.random()*75);
                game.space.addConstraint(constraint);
            }
        }

    }
}));

// ---------------------------------------------------------------------

game.chapters.push( game.BaseLayer.extend({
    init: function () {
        this._super();
        var spriteBatch = game.findChildByTagRecursive(this, this.TAG_SPRITEBATCH);
        game.addPhysicalMario(spriteBatch);
        this.addTitle("Lookup for");
        var text = [
            " ",
            "Garbage collection between SpiderMonkey and your native environment",
            " ",
            "Scale! Use getDPI if available. IF not, well... fake one?",
            " ",
            "Design: Designers don't know how to deal with responsive design. They say they do, but REALLY they don't.",
            " ",
            "Take a look at my code: github.com/osuka. Ask, fork, annoy me please."
        ];
       
        this.addBodyText(text);
        
        return true;
    },


    fire1: function () {
        this.toggleDebug();
    },

    update: function (dt) {
        this._super(dt);

        var mario = game.findMario(this);
        var joystick = game.findChildByTagRecursive(this, this.TAG_JOYSTICK_LAYER);
        var p = joystick.getPadPosition();
        game.moveMario(mario, p, dt);
    },

}));
