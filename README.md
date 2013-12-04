# multiplatform-gaming

## Notes on creating the base project

Currently Using the develop branch of cocos2d-x in github (3.0).

Initial base project created like this:

```
cd cocos2d-x
git checkout develop
git fetch
git merge origin/develop
git submodule init
git submodule update
./create-multi-platform-projects.py -p multiplatform-presentation -k com.gatillos.multiplatformpresentation -l javascript
```

After creating the project, I moved the resulting sample project from `cocos2d-x/projects/multiplatform-presentation` to a separate folder, see below.

Requirements for using it with cocos2d-html:

```
git clone https://github.com/cocos2d/cocos2d-html5
```

Folder structure (for me):

* cocos2d-x
* cocos2d-html5
* multiplatform-gaming
  * multiplatform-presentation

There are symbolic links in the repo that expect this structure. If you have things differently, just update the symlinks.

### iOS and Mac project creation notes

It's very important to understand the XCode structure:

- In particular the Build Settings, with the "Levels" view, from right to left:
  - There's settings for the system (default)
  - Settings for project
  - Settings for target (iOS, Mac)
  - Resolved (combined) settings

If you move the project around or its dependencies, you'll have to tweak settings taking into account each target and the shared components.

Particular to my case, because I want to have the project in a separate folder, I have all paths relative to that directory I had to update the following files in the project to point to the correct location (simply click on them in XCode and clicking on the Folder icon in the Location view in the right panel):
- `jsb_cocos2d_gui.js`
- `jsb_cocos2d_studio.js`
- `cocos2d_libs.xcodeproj`
- Repeat for all files inside the `JS Common` directory.


Also, had to update in the XCode project, in project / Build Settings / Header Search Paths all the `$(SRCROOT)/../../../XXXXX` to be `$(SRCROOT)/../../../cocos2d-x/XXXXX`. Then do the same for the individual targets (ios and mac).

Finally, on the iOS Target I had to remove and re-add `OpenGLES.framework`, `UIKit.framework` as they were pointing to different versions, and manually add `libchipmunk iOS.a`, `libcocos2dx iOS.a`, `libcocos2dx-extensions iOS.a`, `libCocosDenshion iOS.a`, `libjsbindings iOS.a`. Do the same for the Mac version (with corresponding `Mac.a` libraries).

### Android project creation notes

- Native part:
  - If desired, edit `jni/Application.mk` to add more binaries
    - armeabi armeabi-v7a
  - Edit `build_native.py` to fix path names:
    - Replace the two occurrences of `../../../XXXX` with `../../../cocos2d-  x/XXXX`
  - New sources are to be added to the `LOCAL_SRC_FILES` tag in `Android.mk`.
  - If we need to use a library, for instance `network`, add:
    - `LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static`
    - `$(call import-module,scripting/javascript/bindings/network)`
    - To know the static library name, just take a look at the `Android.mk`file of the module you want to include.

- Eclipse part
  - Go to Import / Existing Android Code into Workspace and Browse to `cocos2d-x/cocos/2d/platform` to import `libcocos2dx`
  - Go to project properties, Android, select a Build Target that is installed in our system and `Add` a refernce to `libcocos2dx`
  - Note that `android:configChanges="orientation|screenSize|smallestScreenSize` doesn't seem to be supported in android-10.

- (Optional) Defined in Preferences/C/C++/Build/Build Variables:
  - `NDK_ROOT=/Users/osuka/Documents/code/android/ndk`
  - `COCOS2DX_ROOT=/Users/osuka/Documents/code/cocos2d-x`
- In environment defined them to export them as system variables
  - `NDK_ROOT=${NDK_ROOT}`
  - `COCOS2DX_ROOT=${COCOS2DX_ROOT}` 

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

## Web version

The normal web version can be run by going to `proj.web` folder and launching.

```
python -m SimpleHTTPServer
```

## Windows version

I haven't been able to even try running it yet, but the theory is that all you might need is renaming some files under proj.win32 and updating some paths. Feel free to open a PR if you do.

# Final notes

cocos2d-x is having a major refactoring that includes lots of directory renaming and moving. I'm working on the `develop` branch which updates quite frequently. If you run into trouble just checkout to f41a7a9bee1d0a61228fd2208ed0d7ba0588e9ce for cocos2d-x and 77092e7a04564990685dfcc0105c38068cd94084 for cocos2d-html. Later versions are likely to work fine though.