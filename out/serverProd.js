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
