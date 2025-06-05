// Little express server that:
// * clears browser's local storage on first page load after server restart
// * restarts on changes in app files
// * refreshes web page
// That means:
// This server works like parcel but also clears local storage after each restart
// Additional info:
// Server doesn't directly clear browser's local storage since it does not have
// acces to the `window` property, but it lets `main.ts` script do the thing.
// How? By initially (after server starts) redirecting to `/clear` sub-path.
// Then main script clears local storage and redirects back to `/` path.
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const PORT = process.env.port || 1234;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(dirname(__filename), "../");
app.use("/out/", express.static(__dirname + "/out"));
app.use("/build/", express.static(path.join(__dirname, "node_modules/three/build")));
let redirToClear = true;
app.get("/", (req, res) => {
    if (redirToClear) {
        res.redirect("/clear");
    }
    else {
        res.sendFile(path.join(__dirname, "index.html"), (e) => {
            if (e != undefined)
                console.error(e);
        });
    }
});
app.get("/clear", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"), (e) => {
        if (e != undefined)
            console.error(e);
    });
    redirToClear = false;
});
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
