# Multiple-window-3d-sphere-animation

Original plan was to rewrite [this multipleWindow3dScene](https://github.com/bgstaal/multipleWindow3dScene) project in TypeScript, but then I decided to make it a little more difficult (for me) by changing animation according to my idea.

So now it's an animation of spheres composed of small, rotating tetrahedrons. Each browser window has it's own sphere that follows the center of the window.

## Tools used

* Npm
* Standard Typescript Compiler

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

### Bugs

In case there are some bugs with animations (for example: sphere without it's own browser window, animation freezed) close all windows but 1 and click the round red button in top right corner. It will clear local storage and restart the app.

Opening `index.html` file in the browser probably won't work due to browsers' CORS policy.

## Development

To compile Typescript to JavaScript in watch mode run:

```bash
npx tsc -w
```

Run *little express dev server*. It automatically clears your browser's local storage (preventing bugs) and refreshes the page(s):

```bash
npm run dev
```

*Hint: You need to run 2 commands in separate terminals at once

## Build using webpack

```bash
npm run build
```

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

## Deployment

App is deployed on GitHub Pages from `resource-demanding-bloom-effect` branch using GitHub Actions. Workflow can be found in `.github/workflows/deploy.yml`.
