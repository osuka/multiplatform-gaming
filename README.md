# multiplatform-gaming

This is short presentation showcasing usage of cocos2d-x for development. It works on Android 2.3+, iOS, Mac and Web. It should be very easy to have it workin in Windows and Linux but I haven't tried it yet.

## Run it

You can try the HTML5 version in (http://gatillos.com/presentation)[http://gatillos.com/presentation].

* cocos2d-x is having a major refactoring that includes lots of directory renaming and moving. I'm working on the `develop` branch which updates quite frequently. I've included below checkouts to the specific commit IDs I used for this presentation. Checkout to those versions if it doesn't compile/work with a later one, but I aim to work with the latest `develop` commit.
```
git clone https://github.com/osuka/multiplatform-gaming.git
git clone https://github.com/cocos2d/cocos2d-x.git
cd cocos2d-x
git checkout f41a7a9bee1d0a61228fd2208ed0d7ba0588e9ce
git clone https://github.com/cocos2d/cocos2d-html5.git
git checkout 77092e7a04564990685dfcc0105c38068cd94084
```

* The presentation uses an on-screen joystick that can be used to enable/disable physics debug mode, jump and going forward and backwards (press button + joystick left).

## For Android (Eclipse, Android NDK and Android SDK required)


- Launch Eclipse, import projects (Import -> Existing Android Code into Workspace):
  - `multiplatform-gaming/multiplatform-presentation/proj.android`
  - `cocos2d-x/cocos/2d/platform/android/java`
- Compile native part:
  - `multiplatform-gaming/multiplatform-presentation/proj.android/build_native.py`
  - Optionally, add more architectures to `jni/Application.mk` (like `armeabi armeabi-v7a`)
- Launch the project:
  - From Eclipse (usual way)
  - From command line: `ant -Dsdk.dir=<<YOUR_PATH_TO_ANDROID_SDK>> debug install`


## For Mac and iOS (Xcode required)

Simply open project `multiplatform-gaming/multiplatform-presentation/proj.ios_mac`. Then selection the target you want to run, from `ios` or `mac` and build/run as usual.

## For Web/HTML5 version

The normal web version can be run by just publishing the contents of `proj.web` folder into a web server, or if you just want to try it, launching.

```
python -m SimpleHTTPServer
```

Then go to `http://localhost:8000` to try it locally.

## For Windows and Windows Phone

I haven't been able to even try running it yet, but the theory is that all you might need is renaming some files under proj.win32 and updating some paths. Feel free to open a PR if you do.


# Development Notes

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

## iOS and Mac project creation notes

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

## Android project creation Notes

- Native part:
  - I edited `build_native.py` to fix path names:
    - Replaced the two occurrences of `../../../XXXX` with `../../../cocos2d-  x/XXXX`
  - Added some new sources to the `LOCAL_SRC_FILES` tag in `Android.mk`.
  - If we need to use a library, for instance `network`, add:
    - `LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static`
    - `$(call import-module,scripting/javascript/bindings/network)`
    - To know the static library name, just take a look at the `Android.mk`file of the module you want to include.

- Eclipse part
  - Go to Import / Existing Android Code into Workspace and Browse to `cocos2d-x/cocos/2d/platform` to import `libcocos2dx`
  - Go to project properties, Android, select a Build Target that is installed in our system and `Add` a refernce to `libcocos2dx`
  - Note that `android:configChanges="orientation|screenSize|smallestScreenSize` doesn't seem to be supported in android-10, so I removed it.

- If using Eclipse for C++ compilation, defined in Preferences/C/C++/Build/Build Variables:
  - `NDK_ROOT=/Users/osuka/Documents/code/android/ndk`
  - `COCOS2DX_ROOT=/Users/osuka/Documents/code/cocos2d-x`
  - In environment defined them to export them as system variables
    - `NDK_ROOT=${NDK_ROOT}`
    - `COCOS2DX_ROOT=${COCOS2DX_ROOT}` 


