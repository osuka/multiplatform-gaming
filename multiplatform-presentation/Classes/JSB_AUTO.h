//
//  JSB_AUTO.h
//  HelloJavascript
//
//  Created by Oscar Amat on 30/09/2013.
//
//

#ifndef __HelloJavascript__JSB_AUTO__
#define __HelloJavascript__JSB_AUTO__

#include <iostream>
#include "jsapi.h"
#include "jsfriendapi.h"
#include "ScriptingCore.h"
#include "JSBinding.h"

void register_all_my_jsb(JSContext* cx, JSObject* obj);
#endif /* defined(__HelloJavascript__JSB_AUTO__) */
