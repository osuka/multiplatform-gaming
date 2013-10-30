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

// Define a Fake "system.getDPI"
// This attempts to define an equivalent concept of 'dpi' to the real one
// that can be used to resize assets in web browsers
// It uses real screen size instead of window size.
//
if (typeof cc.Device === "undefined" || typeof cc.Device.getDPI === "undefined") {
  cc.Device = {};
  cc.Device.getDPI = function () {
    // The concept of DPI doesn't exist on the web (sadly)
    // so we are going to do an estimate
    var width = window.screen ? window.screen.width : window.innerWidth;
    var dpi = 96; // standard monitor
    var dpiTable = [
      { limit: 1.49, widths: [{width: 1024, dpi: 96},
                              {width: 2048, dpi: 96*2}]},
      { limit: 2.00, widths: [{width: 1024, dpi: 96*2},
                              {width: 2048, dpi: 96*4}]},
      { limit: 3.00, widths: [{width: 1024, dpi: 96*3},
                              {width: 2048, dpi: 96*4}]},
      { limit: 4.00, widths: [{width: 1024, dpi: 96*4},
                              {width: 2048, dpi: 96*4}]}
    ];

    var i, j;
    for(i = 0; i < dpiTable.length; i++) {
      if (window.devicePixelRatio <= dpiTable[i].limit) {
        for(j = 0; j < dpiTable[i].widths.length; j++) {
          if (width <= dpiTable[i].widths[j].width) {
            dpi = dpiTable[i].widths[j].dpi;
            return dpi; // EXIT BUCLE AND FUNCTION
          }
        }
      }
    }

    return dpi;
  };
}

// Initialization thas is specific to cocos2d-x for HTML5
// (this code is not run in native-based projects)
//
game.Cocos2dWebApp = cc.Application.extend({

    config : document['ccConfig'],

    ctor : function (scene) {
        this._super();
        cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
        cc.initDebugSetting();
        cc.setup(this.config['tag']);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
    },

    applicationDidFinishLaunching:function () {
        if(cc.RenderDoesnotSupport()){
            //show Information to user
            alert("Browser doesn't support WebGL");
            return false;
        }
        // initialize director
        var director = cc.Director.getInstance();

        // cc.EGLView.getInstance().setDesignResolutionSize(800, 450, cc.RESOLUTION_POLICY.SHOW_ALL);
        cc.EGLView.getInstance().setDesignResolutionSize(window.innerWidth, innerHeight, cc.RESOLUTION_POLICY.SHOW_ALL);

        // turn on display FPS
        director.setDisplayStats(this.config['showFPS']);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / this.config['frameRate']);

        // preload resources for browser-hosted app, and only run after finishing
        cc.LoaderScene.preload(g_resources, function () {
            director.replaceScene(new game.InitialScene(game.chapters[0]));
        }, this);

        return true;
    }
});

var the_app = new game.Cocos2dWebApp();
