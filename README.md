# Multiple-window-3d-sphere-animation

## About

Original plan was to rewrite [this multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene) project in TypeScript, but then I decided to make it a little more difficult by changing animation according to my idea.

So now it's an animation of spheres composed of small, rotating tetrahedrons. Each browser window has it's own sphere that follows the center of the window.

## Tools used

* Npm
* [Parcel](https://parceljs.org/) - zero config build tool  
* Standard Typescript Compiler

## How to use it

### Note: Currently, only the method described in [Development](#development) section works - will fix it someday I promise xd

Run this on some Live Server or something similar. Opening `index.html` file in the browser probably won't work due to browsers' CORS policy.  

Before each start of the app, clear the local storage by going to `/clear` sub-path.  

Maybe in the future I will make a small Express server that automatically goes to this path and then redirects to actual animation.

## Development

To turn on real-time updating server run:

`npx tsc -w`

`npx parcel ./index.html`

(Both commands in separate terminals at once)
