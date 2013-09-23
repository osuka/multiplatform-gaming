# multiplatform-gaming

## Notes on creating the base project

Currently Using the develop branch of cocos2d-x in github (3.0).

Initial bas created like this:

```
cd cocos2d-x
git checkout develop
git fetch
git merge origin/develop
git submodule init
git submodule update
./create-multi-platform-projects.py -p multiplatform-presentation -k com.gatillos.multiplatformpresentation -l javascript
```

### iOS and Mac project creation notes

It's very important to understand the XCode structure:

- In particular the Build Settings, with the "Levels" view, from right to left:
  - There's settings for the system (default)
  - Settings for project
  - Settings for target (Hello Javascript iOS, Hello Javascript Mac)
  - Resolved (combined) settings

If you move the project around or its dependencies, you'll have to tweak settings taking into account each target and the shared components.

Particular to my case, because I want to have the project in a separate folder. I have all paths relative to that directory so there's a lot of $(SRCDIR)/../../../cocos2d-x (#ugly).

### Android project creation notes

- Doesn't seem to copy javah builder. Edit `.project` and remove the external build (probably can be done via Eclipse). Can also be copied from other project. (`.externalToolBuilder` folder)
- If desired, edit `jni/Application.mk` to add more binaries
  - armeabi armeabi-v7a
- Defined in Preferences/C/C++/Build/Build Variables:
  - `NDK_ROOT=/Users/osuka/Documents/code/android/ndk`
  - `COCOS2DX_ROOT=/Users/osuka/Documents/code/cocos2d-x`
- In environment defined them to export them as system variables
  - `NDK_ROOT=${NDK_ROOT}`
  - `COCOS2DX_ROOT=${COCOS2DX_ROOT}` 
- Lots of trouble because I move the project outside of the `cocos2d-x/projects folder`
  - Added `${ProjDirPath}/../Classes` to Properties/C/C++ General/Includes
  - Edited the `build_native.sh` paths to better reflect my structure (see below, remember to remove `obj/local`)

```
COCOS2DX_ROOT="${COCOS2DX_ROOT}"
APP_ROOT="$DIR/.."
APP_ANDROID_ROOT="$DIR"
BINDINGS_JS_ROOT="${COCOS2DX_ROOT}/scripting/javascript/bindings/js"
```

# Compiling and running

## XCode compiling for iOS and Mac

Simply selection the target from _ios or _mac and build/run as usual.

## Command line compiling for Android

```
cd proj.android
./build_native.sh
ant -Dsdk.dir=/Users/osuka/Documents/code/android/sdk/ debug install
```

## Eclipse compiling for Android

Open Android Developer Tools (Eclipse version, the other one doesn't support native code yet)

* Import -> Existing Android Code into Workspace
* Browse to `multiplatform-presentation`
* It will find `proj.android.` Click finish
* Do the same for `cocos2d-x/cocos2dx/platform/android/java`. Create the `libcocos2dx`project.
* You may have problems with Android versions. In theory it runs on 2.3+ (android 13). I'm going for API 14 (Android 4.0), just because I have a Kindle Fire HD. With no google APIs.
  * So, open Project properties and set SDK to 4.0 or whatever you want. Make sure you set the same for `libcocos2dx` and your app.
* Define the following in Preferences / C/C++ / Build / Build Variables
  - `NDK_ROOT=/Users/osuka/Documents/code/android/ndk`
  - `COCOS2DX_ROOT=/Users/osuka/Documents/code/cocos2d-x`

* Run as "Android Application"

