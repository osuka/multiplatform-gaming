multiplatform-gaming
====================

Notes on creation
-----------------
Currently Using the develop branch of cocos2d-x in github.

cd cocos2d-x
git checkout develop
git fetch
git merge origin/develop
git submodule init
git submodule update
./create-multi-platform-projects.py -p multiplatform-presentation -k com.gatillos.multiplatformpresentation -l javascript

  Open multiplatform-presentation/proj.ios_mac/HelloJavascript.xcodeproj
Run!



1. A few bugs on the Android project I've encountered
  - Doesn't seem to copy javah builder. Edit .project and remove the external build (probably can be done via Eclipse). Can also be copied from other project. (.externalToolBuilder folder)
  - Add ${ProjDirPath}/../Classes to Properties/C/C++ General/Includes
  - If Eclipse is launched without the environment variables, define them in Preferences/C/C++/Build/Build Variables
  - NDK_ROOT=/Users/OAmat/Documents/code/android/ndk
  - May have to also add the Classes directory (I ended up adding it will full path...)
  - It's hit and miss depending what Eclipse version you have etc
  - It may be easier to just edit the .cproject file by hand than through Eclipse to remove all local references and use the variables
  - I edited the build_native.sh paths to better reflect my structure
    - COCOS2DX_ROOT="${COCOS2DX_ROOT}"
    - APP_ROOT="$DIR/.."
    - APP_ANDROID_ROOT="$DIR"
    - BINDINGS_JS_ROOT="${COCOS2DX_ROOT}/scripting/javascript/bindings/js"
    - Will have to remove everything from obj/local/armabi if those vars change
  - If desired, edit jni/Application.mk to add more binaries
    - armeabi armeabi-v7a

2. Particular to my case:
  * Moved into my github repo
  * ln -s from my repo to cocos2d-x project directory
  * In Eclipse defined COCOS2DX_ROOT=/Users/osuka/Documents/code/cocos2d-x
  * Replaced ../../../cocos2d-x references with COCOS2DX_ROOT in Paths:
    * ${COCOS2DX_ROOT}/cocos2dx
    * ${COCOS2DX_ROOT}/cocos2dx/include


Open Android Developer Tools (Eclipse version, the other one doesn't support native code yet)
* Import -> Existing Android Code into Workspace
* Browse to ~/Documents/code/cocos2d-x/projects/multiplatform-presentation
* It will find proj.android. Click finish
* You may have problems with Android versions. In theory it runs on 2.3+ (android 13).
* I'm going for API 14 (Android 4.0), just because I have a Kindle Fire HD. With no google APIs.
  * So, open Project properties and set SDK to 4.0
* 