// borrowed from https://github.com/Wu-Hao/Cocos2d-Simple-Ragdoll/blob/master/src/CPApp.js

var game = game || {};

// A helper function to create sprites with physics
//
// There is functionality that can be run only once we
// have loaded the image (because we need its size)
// - if running in a browser we need to wait for loading to finish
//
game.PhysicsSpriteHelper = {

    // Create a new sprite with an associated physics body
    // file: file name
    // pos: position on screen
    // mass: for the physical body
    // elasticity: for the physical body
    // friction: for the physical body
    // angle: for the physical body
    // callback: called after creation finishes (may need to asynchronously
    //           load assets before finishing creation)
    //
    createSprite: function (params) {

        var sprite = cc.PhysicsSprite.create(params.file);

        var postLoadAction = function () {
        
            var space = game.space;
            if (typeof params.space !== 'undefined') {
                space = params.space;
            }

            // Image size
            var spriteWidth = sprite.getContentSize().width;
            var spriteHeight = sprite.getContentSize().height;
            
            // Physical body
            var mass = 5;
            if (typeof params.mass !== 'undefined') {
                mass = params.mass;
            }
            var moment = cp.momentForBox(mass, spriteWidth, spriteHeight);
            var body = new cp.Body(mass, moment);
            body.setPos(params.pos);
            var angle = 0;
            if (typeof params.angle !== 'undefined') {
              angle = params.angle;
            }
            body.setAngle(angle);
            space.addBody(body);
            sprite.setBody(body);
            
            // Contact shape for the body
            var shape = new cp.BoxShape(body, spriteWidth, spriteHeight);
            space.addShape(shape);
            var elasticity = 0.2;
            if (typeof params.elasticity !== 'undefined') {
                elasticity = params.elasticity;
            }
            shape.setElasticity(elasticity);
            var friction = 0.8;
            if (typeof params.friction !== 'undefined') {
                friction = params.friction;
            }
            shape.setFriction(friction);
            
            // Link sprite with body and shape
            sprite.body = body;
            sprite.shape = shape;
            sprite.body.userData = sprite; // allows reverse-lookup
            
            // finished
            if (typeof params.callback === 'function') {
                params.callback(sprite);
            }
        };

        // Dynamic loading is required when running in a browser
        // see http://www.cocos2d-x.org/forums/19/topics/15685
        if (typeof document !== 'undefined') { // web
            var textureCache = cc.TextureCache.getInstance();
            var texture = textureCache.textureForKey(params.file);
            if (texture.isLoaded()) {
              postLoadAction();
            } else {
              texture.addLoadedEventListener(postLoadAction); // async
            }
        } else { // native applications
            postLoadAction();
        }
        
        return sprite;
    },
};

