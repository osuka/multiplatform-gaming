//
//  JSB_AUTO.cpp
//  HelloJavascript
//
//  Created by Oscar Amat on 30/09/2013.
//
//  Following http://www.cocos2d-x.org/wiki/How_to_bind_C++_to_Javascript#Manually-JavaScript-Binding
//
// This code creates a JSB "namespace" in Javascript, with a "JSBinding" object
// inside and its corresponding mappings.

#include "JSB_AUTO.h"
#include "cocos2d.h"
#include "cocos2d_specifics.hpp"
#include "js_manual_conversions.h"
#include "jsapi.h"

using namespace cocos2d;

// Binding specific object by defining JSClass
JSClass*        jsb_class;
JSObject*       jsb_prototype;

// This function is mapping the function “functionTest” in “JSBinding.cpp”
//
JSBool js_functionTest(JSContext* cx, uint32_t argc, jsval* vp){
    JSBool ok = JS_TRUE;
    JSObject* obj = NULL;
    JSB::JSBinding* cobj = NULL;
    obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t* proxy = jsb_get_js_proxy(obj);
    cobj = (JSB::JSBinding* )(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2(cobj, cx, JS_FALSE, "Invalid Native Object");
    
    if (argc == 0) {
        cobj->functionTest();              // Actual function call
        JS_SET_RVAL(cx, vp, JSVAL_VOID);
        return ok;
    }
    JS_ReportError(cx, "Wrong number of arguments");
    return JS_FALSE;
}

// This function is mapping the function “getDPI” in “JSBinding.cpp”
//
JSBool js_getDPI(JSContext* cx, uint32_t argc, jsval* vp){
    JSBool ok = JS_TRUE;
    JSObject* obj = NULL;
    JSB::JSBinding* cobj = NULL;
    obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t* proxy = jsb_get_js_proxy(obj);
    cobj = (JSB::JSBinding* )(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2(cobj, cx, JS_FALSE, "Invalid Native Object");
    
    if (argc == 0) {
        int dpi = Device::getDPI();             // Maps to Device -> getDPI()
        JS_SET_RVAL(cx, vp, JS_NumberValue(dpi));
        return ok;
    }
    JS_ReportError(cx, "Wrong number of arguments");
    return JS_FALSE;
}


// Constructor for JSBinding object
JSBool js_constructor(JSContext* cx, uint32_t argc, jsval* vp){
    cocos2d::log("JS Constructor...");
    if (argc == 0) {
        TypeTest<JSB::JSBinding> t;
        JSB::JSBinding* cobj = new JSB::JSBinding();
        cobj->autorelease();
        js_type_class_t *p;
        std::string typeName = t.s_name();

        auto typeMapIter = _js_global_type_map.find(typeName);

        CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
        p = typeMapIter->second;
        CCASSERT(p, "The value is null.");

        JSObject *_tmp = JS_NewObject(cx, p->jsclass, p->proto, p->parentProto);
        js_proxy_t *pp = jsb_new_proxy(cobj, _tmp);
        JS_AddObjectRoot(cx, &pp->obj);
        JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(_tmp));
        
        return JS_TRUE;
    }
    
    JS_ReportError(cx, "Wrong number of arguments: %d, was expecting: %d", argc, 0);
    
    return JS_FALSE;
}

// This function is mapping the function “create” when using JavaScript code
//
JSBool js_create(JSContext* cx, uint32_t argc, jsval* vp){
    cocos2d::log("JSB.JSBinding: creating...");
    if (argc == 0) {
        JSB::JSBinding* ret = JSB::JSBinding::create();
        jsval jsret;
        do{
            if (ret) {
                js_proxy_t* proxy = js_get_or_create_proxy<JSB::JSBinding>(cx, ret);
                jsret = OBJECT_TO_JSVAL(proxy->obj);
            }
            else{
                jsret = JSVAL_NULL;
            }
        } while(0);
        JS_SET_RVAL(cx, vp, jsret);
        
        return JS_FALSE;
    }
    JS_ReportError(cx, "Wrong number of arguments");
    
    return JS_FALSE;
}

void js_finalize(JSFreeOp* fop, JSObject* obj){
    CCLOGINFO("JSBindings: finalizing JS object %p JSB", obj);
}

// Register the JSBinding object inside the JSB object.
//
void jsBinding_register(JSContext* cx, JSObject* global){
    jsb_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_class->name = "JSBinding";
    jsb_class->addProperty = JS_PropertyStub;
    jsb_class->delProperty = JS_DeletePropertyStub;
    jsb_class->getProperty = JS_PropertyStub;
    jsb_class->setProperty = JS_StrictPropertyStub;
    jsb_class->enumerate = JS_EnumerateStub;
    jsb_class->resolve = JS_ResolveStub;
    jsb_class->convert = JS_ConvertStub;
    jsb_class->finalize = js_finalize;
    jsb_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);
    
    static JSPropertySpec properties[] = {
        {0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
    };
    
    // Binding member functions
   
    static JSFunctionSpec funcs[] = {
        JS_FN("functionTest", js_functionTest, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getDPI", js_getDPI, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };
    
    // Binding static functions
    
    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };
    
    // Binding constructor function and prototype
    jsb_prototype = JS_InitClass(
                                 cx, global,
                                 NULL,
                                 jsb_class,
                                 js_constructor, 0,
                                 properties,
                                 funcs,
                                 NULL,
                                 st_funcs);
    JSBool found;
    JS_SetPropertyAttributes(cx, global, "JSB", JSPROP_ENUMERATE | JSPROP_READONLY, &found);
    
    TypeTest<JSB::JSBinding> t;
    js_type_class_t* p;
    std::string typeName = t.s_name();

    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_class;
        p->proto = jsb_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
    
    assert(p);
}

JSBool JSB_cocos2dx_retain(JSContext* cx, uint32_t argc, jsval *vp){
    JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
    
    if (thisObj) {
        js_proxy_t* proxy = jsb_get_js_proxy(thisObj);
        
        if (proxy) {
            ((Object* )proxy->ptr)->retain();
            log("Retain succeed!");
            return JS_TRUE;
        }
    }
    
    JS_ReportError(cx, "Invaild native object");
    return JS_FALSE;
}

JSBool JSB_cocos2dx_release(JSContext* cx, uint32_t argc, jsval *vp){
    JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
    
    if (thisObj) {
        js_proxy_t* proxy = jsb_get_js_proxy(thisObj);
        
        if (proxy) {
            ((Object* )proxy->ptr)->release();
            log("Release succeed!");
            return JS_TRUE;
        }
    }
    JS_ReportError(cx, "Invaild native object");
    return JS_FALSE;
}

// Binding a "JSB" namespace (this is just a new Object called "JSB")
// Binding a "JSBinding" object inside of it
// Binding of functions inside "JSBinding"
//
void register_all_my_jsb(JSContext* cx, JSObject* obj){

    JS::RootedValue nsval(cx);
    JSObject* ns;
    
    JS_GetProperty(cx, obj, "JSB", &nsval);

    if (nsval == JSVAL_VOID) {
        // Create "JSB" object
        ns = JS_NewObject(cx, NULL, NULL, NULL);
        nsval = OBJECT_TO_JSVAL(ns);
        JS_SetProperty(cx, obj, "JSB", nsval);
    }
    else{
        // Added to existing "JSB" object (allows modular initialization)
        JS_ValueToObject(cx, nsval, &ns);
    }
    obj = ns;
    
    // Now, add JSBinding
    jsBinding_register(cx, obj);

    // Allowing usage of retain and release
    JS_DefineFunction(cx, jsb_prototype, "retain", JSB_cocos2dx_retain, 0, JSPROP_READONLY | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, jsb_prototype, "release", JSB_cocos2dx_release, 0, JSPROP_READONLY | JSPROP_PERMANENT);

}