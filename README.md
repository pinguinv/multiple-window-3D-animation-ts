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

## Development

To compile Typescript to JavaScript in watch mode run:

`npx tsc -w`

And now you have 2 options:

* Run parcel so it bundles all the stuff:

    `npm run dev-parcel`

* Or run little express server so it automatically clears your browser's local storage (preventing bugs) and refreshes the page(s); Essentially like Parcel without animation bugs:

    `npm run dev`

(You need to run 2 commands in separate terminals at once: **1 & 2**, or **1 & 3**)

### About little express server

Little express server that:

* clears browser's local storage on first page load after server restart
* restarts on changes in app files
* refreshes web page

That means:
This server works like Parcel but also clears local storage after each restart

#### Why I needed it?

I needed such server because making changes in code with more than 1 tab opened and without clearing local storage caused animation bugs.

#### Additional info

Server doesn't directly clear browser's local storage since it does not have
acces to the `window` property, but it lets **main.ts** script do the thing.
How? By initially (after server starts) redirecting to `/clear` sub-path.
Then **main** script clears local storage and redirects back to `/` path.
