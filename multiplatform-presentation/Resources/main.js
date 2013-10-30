/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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

// boot code needed for cocos2d + JS bindings.
// Not needed by cocos2d-html5

(function () {

// this silly 'require' is not requirejs or nodejs require, it just loads a
// file and executes it
require('jsb.js');
require('src/freewill/Freewill.js');
require('src/physicsSprite.js');
require('src/resource.js');
require('src/initialScene.js');
require('src/chapters.js');

// This is an example of exporting (binding) a C++ function to Javascript
game.testJSB = new JSB.JSBinding();
game.testJSB.retain(); // don't want Spidermonkey to garbage collect this
game.testJSB.functionTest();

// Export Device's getDPI function (not available in browsers)
if (typeof cc.Device === "undefined" || typeof cc.Device.getDPI === "undefined") {
    cc.Device = {};
    cc.Device.getDPI = function () {
        return game.testJSB.getDPI();
    }
}

// Debug, dump info about the current context
cc.dumpConfig();

// The director controles the game
var director = cc.Director.getInstance();
director.setDisplayStats(false);

// set FPS. the default value is 1.0/60 if you don't call this
// Note: this doesn't seem to work for Mac or Android
director.setAnimationInterval(1.0 / 30);

// show initial chapter
game.Controller.showChapter(0);

}());