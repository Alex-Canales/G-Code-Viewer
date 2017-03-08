var path = require("path");
module.exports = {
    entry: {
        viewer : "./js/viewer.js"
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "gcodeviewer.js",
        library: "gcodeviewer",
        libraryTarget: "umd"
    }
};
