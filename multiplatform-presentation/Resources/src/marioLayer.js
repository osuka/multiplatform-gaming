var game = game || {};

game.MarioLayer = cc.Layer.extend({
    helloLabel:null,

    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    init:function () {

        this._super();

        var size = cc.Director.getInstance().getWinSize();

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

        // Load mario resources and create sprites
        // good reference: http://www.cocos2d-x.org/forums/19/topics/23698
        var spriteBatch = cc.SpriteBatchNode.create("res/mario-sheet_default.png");
        var cache = cc.SpriteFrameCache.getInstance();
        cache.addSpriteFrames("res/mario-sheet_default.plist");

        var mario = cc.Sprite.createWithSpriteFrameName("minimario-walk-01.png");
        spriteBatch.addChild(mario);
        mario.setPosition(cc.p(0, size.height/2));
        mario.touched = function () {
            cc.log('Touche!');
        };

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
    }
}); // end of cc.Layer.extend
