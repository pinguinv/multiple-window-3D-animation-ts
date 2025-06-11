# Multiple-window-3d-sphere-animation

Original plan was to rewrite [this multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene) project in TypeScript, but then I decided to make it a little more difficult (for me) by changing animation according to my idea.

So now it's an animation of spheres composed of small, rotating tetrahedrons. Each browser window has it's own sphere that follows the center of the window.

## Tools used

* Npm
* [Parcel](https://parceljs.org/) - zero config build tool  
* Standard Typescript Compiler

## Run animation without any setup

If you clone this repo, you can simply run this animation without installing any dependencies - there's build in `build` folder. Use one of the commands listed below.  
*Note: Required node to run server tho :v*

```bash
node ./build/index.cjs
```

or

```bash
npm run app
```

## Project Setup

Like every project that uses NPM, you have to install dependencies:

```bash
npm install
```

## How to use it

Use dedicated command to run already compiled app using prod server:  
*Note: Required dependencies installation*

```bash
npm start
```

Opening `index.html` file in the browser probably won't work due to browsers' CORS policy.

## Development

To compile Typescript to JavaScript in watch mode run:

```bash
npx tsc -w
```

And now you have 2 options:

* Run parcel so it bundles all the stuff:  
    *Hint: Before each (re)start of the app, clear the local storage by going to `/clear` sub-path.*

    ```bash
    npm run dev-parcel
    ```

* Or run *little express dev server* so it automatically clears your browser's local storage (preventing bugs) and refreshes the page(s); Essentially like Parcel without animation bugs:

    ```bash
    npm run dev
    ```

*Hint: You need to run 2 commands in separate terminals at once: **1 & 2**, or **1 & 3***

## About little express server

Little express server that:

* clears browser's local storage on first page load after server restart
* restarts on changes in app files
* refreshes web page

That means:
This server works like Parcel but also clears local storage after each restart

### Why I needed it?

I needed such server because making changes in code with more than 1 tab opened and without clearing local storage caused animation bugs.

### Additional info

Server doesn't directly clear browser's local storage since it does not have acces to the `window` property. It lets **main.ts** script do the thing.
How? By initially (after server starts) redirecting to `/clear` sub-path.
Then **main** script clears local storage and redirects back to `/` path.
