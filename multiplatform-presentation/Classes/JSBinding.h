//
//  JSBinding.h
//  HelloJavascript
//
//  Created by Oscar Amat on 30/09/2013.
//
//

#ifndef __HelloJavascript__JSBinding__
#define __HelloJavascript__JSBinding__

#include <iostream>
#include "cocos2d.h"
#include "ScriptingCore.h"

// Define a namespace to manage your code and make your code clearly
namespace JSB {
    class JSBinding: public cocos2d::Object
    {
    public:
        virtual bool init();

        CREATE_FUNC(JSBinding);
        
        void functionTest();
    };
}

#endif /* defined(__HelloJavascript__JSBinding__) */
